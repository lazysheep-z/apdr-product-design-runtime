import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { isLoopbackURL, newTaskOutput } from './tool-paths.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export async function validateCalls(calls, allowed, cwd = process.cwd()) {
  if (!Array.isArray(calls) || !calls.length || calls.length > 40) throw new Error('每批需 1–40 个调用');
  let navigated = false;
  const outputs = new Set();
  for (const call of calls) {
    if (!call || !allowed.includes(call.name)) throw new Error(`未开放的工具：${call?.name}`);
    const args = call.arguments ?? {};
    if (!args || typeof args !== 'object' || Array.isArray(args)) throw new Error('arguments 必须是对象');
    if (call.name === 'browser_navigate') {
      if (!isLoopbackURL(args.url)) throw new Error('浏览器入口仅允许 localhost / 127.0.0.1 / ::1');
      navigated = true;
    } else if (!navigated && call.name !== 'browser_close') throw new Error('先导航至本地页面，再操作或取证');
    if (call.name === 'browser_wait_for' && args.time > 30) throw new Error('单次等待最多 30 秒');
    if (args.filename !== undefined) {
      if (typeof args.filename !== 'string') throw new Error('filename 必须是字符串');
      const output = await newTaskOutput(args.filename, cwd);
      if (outputs.has(output)) throw new Error('同一批次不可重复输出路径');
      outputs.add(output);
      args.filename = relative(cwd, output);
    }
    if (call.name === 'browser_close') navigated = false;
  }
  return calls;
}

export async function runMcp(mode, calls, { headless = false, output } = {}) {
  const config = JSON.parse(await readFile(resolve(root, 'data/mcp-servers.json'), 'utf8')).playwright;
  if (mode === 'batch') await validateCalls(calls, config.allowedTools);
  const reportPath = output ? await newTaskOutput(output) : undefined;
  const evidenceDir = await newTaskOutput(`mcp-evidence-${Date.now()}-${process.pid}`);
  await mkdir(evidenceDir, { recursive: true });
  const client = new Client({ name: 'apdr-local-tools', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve(root, config.entrypoint), ...config.args, '--init-page', resolve(root, 'lib/playwright-local-init.ts'),
      '--output-dir', evidenceDir, ...(headless ? ['--headless'] : [])],
    cwd: process.cwd(), stderr: 'pipe',
  });
  let stderr = '';
  transport.stderr?.on('data', data => { stderr = (stderr + data.toString()).slice(-2000); });
  try {
    await client.connect(transport, { timeout: 20000 });
    const catalog = await client.listTools({}, { timeout: 20000 });
    const available = catalog.tools.filter(tool => config.allowedTools.includes(tool.name));
    if (mode === 'list') return { server: 'playwright', version: config.version, mode: 'project-local-stdio-bridge', tools: available };
    for (const call of calls) if (!available.some(tool => tool.name === call.name)) throw new Error(`MCP 未提供所需工具：${call.name}`);
    const results = [];
    for (const call of calls) {
      if (call.arguments?.filename) await mkdir(dirname(resolve(call.arguments.filename)), { recursive: true });
      const result = await client.callTool({ name: call.name, arguments: call.arguments ?? {} }, undefined, { timeout: 60000 });
      const content = (result.content ?? []).map(item => item.type === 'image' ? { type: 'image', mimeType: item.mimeType, note: '图片请查看 evidence 文件；不把 base64 写入汇报' } : item);
      results.push({ tool: call.name, arguments: call.arguments ?? {}, isError: Boolean(result.isError), content });
      if (result.isError) break;
    }
    const report = { server: 'playwright', version: config.version, at: new Date().toISOString(), evidenceDir,
      policy: '仅本地任务、隔离浏览器、GET/HEAD、拒绝重定向和 WebSocket；不是系统级沙箱',
      status: results.some(item => item.isError) ? 'failed' : 'completed', results };
    if (reportPath) { await mkdir(dirname(reportPath), { recursive: true }); await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' }); }
    return report;
  } catch (error) {
    // SDK errors can include subprocess details. Never dump environment variables.
    throw new Error(`本地 Playwright MCP 未完成：${error.message}${stderr ? '\n' + stderr : ''}`);
  } finally { await client.close().catch(() => {}); await transport.close().catch(() => {}); }
}

async function main() {
  const argv = process.argv.slice(2);
  if (!argv.length || argv.includes('--help')) {
    console.log('APDR 本地 Playwright MCP 适配器\n  node lib/mcp-tools.mjs list playwright\n  node lib/mcp-tools.mjs batch playwright requests.json [report.json] [--headless]\nrequests.json: [{"name":"browser_navigate","arguments":{"url":"http://127.0.0.1:8000"}},{"name":"browser_snapshot","arguments":{}}]\n同一批共享会话；默认可见 Chrome；--headless 仅用于隔离测试。只接受本地项目页面。');
    return;
  }
  const [mode, server, input, output] = argv.filter(x => x !== '--headless');
  if (server !== 'playwright' || !['list', 'batch'].includes(mode) || (mode === 'batch' && !input)) throw new Error('参数错误，请运行 --help');
  const calls = mode === 'batch' ? JSON.parse(await readFile(input, 'utf8')) : undefined;
  const result = await runMcp(mode, calls, { headless: argv.includes('--headless'), output });
  console.log(JSON.stringify(result, null, 2));
  if (result.status === 'failed') process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
