import { lstat, realpath } from 'node:fs/promises';
import { isAbsolute, relative, resolve, dirname } from 'node:path';

export function isLoopbackURL(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password &&
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  } catch { return false; }
}

export async function newTaskOutput(value, cwd = process.cwd()) {
  const base = await realpath(cwd);
  const target = resolve(base, value);
  const rel = relative(base, target);
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) throw new Error('输出必须位于当前任务目录内');
  let parent = dirname(target);
  while (true) {
    try {
      const actual = await realpath(parent);
      const parentRel = relative(base, actual);
      if (parentRel.startsWith('..') || isAbsolute(parentRel)) throw new Error('输出目录的符号链接越界');
      break;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      parent = dirname(parent);
    }
  }
  try { await lstat(target); } catch (error) {
    if (error.code === 'ENOENT') return target;
    throw error;
  }
  throw new Error(`拒绝覆盖已有文件：${target}`);
}
