#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
if(args.length && (args.length!==2 || args[0]!=='--deny-file')) throw new Error('Usage: check-release-privacy.mjs [--deny-file <external JSON array>]');
const deny=args.length?JSON.parse(readFileSync(args[1],'utf8')):[];
if(!Array.isArray(deny)||deny.some(x=>typeof x!=='string'||!x)) throw new Error('Deny list must contain nonempty strings.');
const git=(...a)=>execFileSync('git',a,{cwd:root,maxBuffer:64*1024*1024});
const files=git('ls-files','-z').toString().split('\0').filter(Boolean);
const findings=[];
for(const file of files){
  if((!file.endsWith('/.env.example') && file!=='.env.example') && (/^(?:draft_[^/]+_folder|\.lark-cli|\.codex|node_modules)\//.test(file) || /(?:^|\/)(?:\.env(?:\..+)?|credentials\.json|token\.json|operator-preference\.json)$/.test(file) || /^(?:\.cursor\/mcp\.json|\.mcp\.json)$/.test(file) ||
     (file.startsWith('projects/')&&!['projects/.gitkeep','projects/demo/meta.json','projects/conv-test/meta.json'].includes(file)))) findings.push({file,rule:'private-workspace'});
  let bytes;try{bytes=git('show',`:${file}`);}catch{continue;}
  if(bytes.includes(0))continue;
  const value=file+'\n'+bytes.toString('utf8');
  deny.forEach((word,i)=>{if(value.toLowerCase().includes(word.toLowerCase()))findings.push({file,rule:`private-deny-${i+1}`});});
  if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(value)||/\b(?:ghp_|github_pat_|sk_live_)[a-zA-Z0-9_]{20,}/.test(value))findings.push({file,rule:'credential'});
}
console.log(JSON.stringify({scope:'Git index only',files:files.length,findings,passed:findings.length===0},null,2));
process.exitCode=findings.length?1:0;
