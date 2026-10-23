#!/usr/bin/env node
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { promises as fs } from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const USAGE = 'node lib/a11y-audit.mjs <绝对路径.html|http://localhost:port/path> <cwd 内的输出子目录> [--headless]';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.txt': 'text/plain; charset=utf-8',
};

export function isWithin(root, candidate) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

export function isLoopbackUrl(value) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return false;
    const hostname = url.hostname.toLowerCase();
    return hostname === 'localhost' || hostname === '[::1]' || /^127\.(?:\d{1,3}\.){2}\d{1,3}$/.test(hostname);
  } catch { return false; }
}

export function parseTarget(value) {
  if (typeof value !== 'string' || !value) throw new Error('必须指定本地 HTML 或环回 HTTP/HTTPS 地址。');
  if (path.isAbsolute(value)) {
    if (!/\.html?$/i.test(value)) throw new Error('文件输入只接受 .html 或 .htm。');
    return { kind: 'file', path: path.resolve(value) };
  }
  if (!isLoopbackUrl(value)) throw new Error('只允许本地 HTML 绝对路径和无认证信息的环回 HTTP/HTTPS 地址。');
  return { kind: 'url', url: new URL(value).href };
}

export function requestAllowed(url, method = 'GET') {
  return ['GET', 'HEAD'].includes(method.toUpperCase()) && isLoopbackUrl(url);
}

export function requestFilePath(root, requestPath) {
  let pathname;
  try { pathname = decodeURIComponent(requestPath.split(/[?#]/, 1)[0]); }
  catch { throw new Error('路径编码无效。'); }
  if (!pathname.startsWith('/') || pathname.includes('\0') || pathname.includes('\\')) throw new Error('路径无效。');
  if (pathname.split('/').some(part => part === '..' || part === '.')) throw new Error('禁止目录穿越。');
  const resolved = path.resolve(root, `.${pathname}`);
  if (!isWithin(root, resolved)) throw new Error('禁止访问静态服务根目录外的文件。');
  return resolved;
}

export async function prepareOutputDirectory(output, cwd = process.cwd()) {
  const root = await fs.realpath(cwd);
  const requested = path.resolve(cwd, output);
  if (requested === path.resolve(cwd) || !isWithin(cwd, requested)) throw new Error('输出必须为当前工作目录内的子目录。');
  let ancestor = requested;
  for (;;) {
    try {
      const realAncestor = await fs.realpath(ancestor);
      if (!isWithin(root, realAncestor)) throw new Error('输出目录通过符号链接逃逸当前工作目录。');
      break;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const parent = path.dirname(ancestor);
      if (parent === ancestor) throw error;
      ancestor = parent;
    }
  }
  await fs.mkdir(requested, { recursive: true });
  const actual = await fs.realpath(requested);
  if (!isWithin(root, actual)) throw new Error('输出目录超出当前工作目录。');
  for (const name of ['accessibility.json', 'screenshot.png']) {
    try {
      await fs.lstat(path.join(actual, name));
      throw new Error(`输出文件已存在，换一个输出目录以保留原报告：${name}`);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return actual;
}

export async function startStaticServer(htmlPath) {
  const file = await fs.realpath(htmlPath);
  if (!(await fs.stat(file)).isFile()) throw new Error('输入不是普通 HTML 文件。');
  const root = path.dirname(file);
  const server = createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
    }
    let candidate;
    try {
      candidate = await fs.realpath(requestFilePath(root, req.url || '/'));
      if (!isWithin(root, candidate)) throw new Error('符号链接指向根目录外。');
      const stat = await fs.stat(candidate);
      if (!stat.isFile()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(candidate).toLowerCase()] || 'application/octet-stream',
        'Content-Length': stat.size,
      });
      if (req.method === 'HEAD') { res.end(); return; }
      const stream = createReadStream(candidate);
      stream.on('error', () => res.destroy());
      res.on('close', () => stream.destroy());
      stream.pipe(res);
    } catch (error) {
      res.writeHead(error.code === 'ENOENT' ? 404 : 403); res.end();
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return {
    root,
    url: `http://127.0.0.1:${server.address().port}/${encodeURIComponent(path.basename(file))}`,
    close: () => new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
      server.closeAllConnections();
    }),
  };
}

async function withTimeout(promise, milliseconds, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label}超时（${milliseconds}ms）。`)), milliseconds); }),
    ]);
  } finally { clearTimeout(timer); }
}

function summarizeFinding(finding) {
  return {
    id: finding.id, impact: finding.impact, description: finding.description,
    recommendation: finding.help, reference: finding.helpUrl, tags: finding.tags,
    evidence: finding.nodes.map(node => ({
      selector: node.target, html: node.html, explanation: node.failureSummary,
      checks: [...node.any, ...node.all, ...node.none].map(check => ({ id: check.id, message: check.message, data: check.data })),
    })),
  };
}

export async function audit(input, output, { headless = false, cwd = process.cwd() } = {}) {
  const target = parseTarget(input);
  const destination = await prepareOutputDirectory(output, cwd);
  let staticServer;
  let browser;
  const blockedRequests = [];
  const warnings = [];
  try {
    if (target.kind === 'file') staticServer = await startStaticServer(target.path);
    const targetUrl = staticServer?.url || target.url;
    browser = await chromium.launch({ channel: 'chrome', headless });
    const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 1000 }, acceptDownloads: false });
    await context.route('**/*', async route => {
      const request = route.request();
      if (!requestAllowed(request.url(), request.method())) {
        blockedRequests.push({ url: request.url(), method: request.method(), reason: 'Only loopback GET/HEAD requests are allowed.' });
        return route.abort('blockedbyclient');
      }
      try {
        // route.continue() would let an HTTP redirect leave the validated origin.
        // Fetch exactly one response and reject every redirect before the browser sees it.
        const response = await route.fetch({ maxRedirects: 0, timeout: 15000 });
        if (response.status() >= 300 && response.status() < 400) {
          blockedRequests.push({ url: request.url(), method: request.method(), status: response.status(), reason: 'HTTP redirects are disabled to prevent escaping the loopback request guard.' });
          return route.abort('blockedbyclient');
        }
        await route.fulfill({ response });
      } catch {
        blockedRequests.push({ url: request.url(), method: request.method(), reason: 'The guarded request failed or timed out.' });
        await route.abort('failed').catch(() => {});
      }
    });
    await context.routeWebSocket('**/*', socket => {
      blockedRequests.push({ url: socket.url(), method: 'WEBSOCKET', reason: 'WebSocket traffic is disabled for this read-only audit.' });
      socket.close();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const response = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    if (response && response.status() >= 400) throw new Error(`页面访问失败：HTTP ${response.status()}`);
    await page.locator('body').waitFor({ state: 'attached', timeout: 5000 });
    await page.waitForFunction(() => ['interactive', 'complete'].includes(document.readyState), undefined, { timeout: 5000 });
    try { await page.waitForLoadState('load', { timeout: 10000 }); }
    catch { warnings.push('页面 load 事件在 10 秒内未完成；报告基于当前已渲染状态。'); }
    try {
      await withTimeout(page.evaluate(() => document.fonts?.ready.then(() => true) ?? true), 5000, '字体加载');
    } catch { warnings.push('字体就绪等待未完成；颜色与布局相关结果需要人工复核。'); }
    const result = await withTimeout(new AxeBuilder({ page }).analyze(), 30000, 'axe 检查');
    const screenshot = await page.screenshot({ fullPage: true, timeout: 10000 });
    const report = {
      schemaVersion: 1,
      input, inputKind: target.kind, auditedUrl: page.url(), capturedAt: new Date().toISOString(),
      axeVersion: result.testEngine.version, testEnvironment: result.testEnvironment,
      counts: { violations: result.violations.length, incomplete: result.incomplete.length, passes: result.passes.length, inapplicable: result.inapplicable.length },
      summary: '自动可访问性检查仅覆盖当前页面状态；不等同于业务验收，也不能替代键盘、读屏与人工可访问性检查。',
      scope: { browser: 'chrome', isolatedContext: true, headless, interactions: 'No clicks or form submissions', allowedNetwork: 'Loopback HTTP/HTTPS GET/HEAD only', redirects: 'blocked', serviceWorkers: 'blocked', websockets: 'blocked', limitation: '这是 Playwright 应用层请求过滤，不是操作系统或网络级安全沙箱；仅检查可信本地页面。' },
      warnings, blockedRequests,
      violations: result.violations.map(summarizeFinding), incomplete: result.incomplete.map(summarizeFinding),
      passes: result.passes.map(finding => ({ id: finding.id, description: finding.description, nodes: finding.nodes.length })),
      screenshot: 'screenshot.png',
    };
    await fs.writeFile(path.join(destination, 'screenshot.png'), screenshot, { flag: 'wx' });
    await fs.writeFile(path.join(destination, 'accessibility.json'), `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
    return { outputDirectory: destination, ...report.counts };
  } finally {
    try { await browser?.close(); }
    finally { await staticServer?.close(); }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [input, output, ...flags] = process.argv.slice(2);
  if (input === '--help' && !output) {
    console.log(USAGE);
  } else if (!input || !output || flags.some(flag => flag !== '--headless') || flags.length > 1) {
    console.error(USAGE); process.exitCode = 1;
  } else {
    audit(input, output, { headless: flags.includes('--headless') })
      .then(result => console.log(JSON.stringify(result, null, 2)))
      .catch(error => { console.error(`可访问性检查失败：${error.message}`); process.exitCode = 1; });
  }
}
