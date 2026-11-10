#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, readFileSync, writeFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const taste=path.join(root,'vendor/taste-skill/design-taste-frontend');
const impeccable=path.join(root,'vendor/impeccable/skills/impeccable');
const platform=`${process.platform==='win32'?'windows':process.platform}-${process.arch}`;
const engine=path.join(impeccable,'scripts/bin',platform,`impeccable${process.platform==='win32'?'.exe':''}`);
const python=process.env.APDR_PYTHON || 'python3';
const [command='status',...args]=process.argv.slice(2);

function fail(message){throw new Error(message);}
function run(executable,argv,env={}){
  const child=spawnSync(executable,argv,{cwd:process.cwd(),env:{...process.env,...env},encoding:'utf8',maxBuffer:16*1024*1024});
  if(child.stdout)process.stdout.write(child.stdout);
  if(child.stderr)process.stderr.write(child.stderr);
  if(child.error)throw child.error;
  if(child.signal)fail(`Tool terminated by ${child.signal}`);
  return child.status ?? 1;
}
function checkEngine(){
  if(!existsSync(engine))fail(`No installed Impeccable engine for ${platform}. Use local review rules or install the matching verified upstream release.`);
  const manifest=readFileSync(path.join(impeccable,'scripts/engine-checksums.txt'),'utf8');
  const name=`impeccable-${platform}${process.platform==='win32'?'.exe':''}`;
  const version=readFileSync(path.join(impeccable,'scripts/VERSION'),'utf8').trim();
  const expected=manifest.split(/\r?\n/).map(line=>line.trim().split(/\s+/)).find(row=>row[0]===version&&row[1]===name)?.[2];
  if(!expected||createHash('sha256').update(readFileSync(engine)).digest('hex')!==expected)fail('Impeccable engine checksum does not match the pinned manifest.');
  return version;
}
function requireOutput(){
  const i=args.indexOf('--out');
  if(i<0||!args[i+1]||args[i+1].startsWith('--'))fail('Pass --out with a directory inside the current authorized project.');
  return path.resolve(args[i+1]);
}
try{
  let exitCode=0;
  if(command==='status'){
    const entries={
      'ui-ux-pro-max':'vendor/ui-ux-pro-max/SKILL.md',
      'mobile-uiux-pro-max':'vendor/mobile-uiux-pro-max/SKILL.md',
      'frontend-design':'vendor/anthropic-skills/frontend-design/SKILL.md',
      'design-taste-frontend':'vendor/taste-skill/design-taste-frontend/SKILL.md',
      'impeccable':'vendor/impeccable/skills/impeccable/SKILL.md',
    };
    let engineStatus={installed:false,platform};
    if(existsSync(engine))engineStatus={installed:true,platform,version:checkEngine(),checksumVerified:true};
    const browsers=[process.env.CHROME_PATH,process.env.PUPPETEER_EXECUTABLE_PATH,
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean);
    console.log(JSON.stringify({skills:Object.entries(entries).map(([id,entry])=>({id,entry,installed:existsSync(path.join(root,entry))})),
      node:process.version,tasteBrowserRuntime:Number(process.versions.node.split('.')[0])>=22&&browsers.some(existsSync),detector:engineStatus},null,2));
  }else if(command==='search'){
    if(!args.length)fail('Provide a focused design query and optional --domain/--stack/--design-system flags.');
    exitCode=run(python,[path.join(root,'vendor/ui-ux-pro-max/scripts/search.py'),...args]);
  }else if(command==='mobile-check'){
    if(!args.some(a=>!a.startsWith('--')))fail('Provide the application source path; do not scan the APDR installation.');
    const child=spawnSync(python,[path.join(root,'vendor/mobile-uiux-pro-max/quality-checks/validators/run_all.py'),...args],{encoding:'utf8',maxBuffer:16*1024*1024});
    if(child.stdout)process.stdout.write(child.stdout);
    if(child.stderr)process.stderr.write(child.stderr);
    if(child.error)throw child.error;
    exitCode=child.signal||/\berrored\b/.test(child.stderr||'')?1:(child.status??1);
  }else if(command==='detect'){
    if(!args.length)fail('Provide a source file/directory or a permitted rendered page URL.');
    checkEngine();
    exitCode=run(engine,['detect',...args],{IMPECCABLE_SKILL_DIR:impeccable});
  }else if(command==='taste-draw'){
    const out=requireOutput();
    exitCode=run(process.execPath,[path.join(taste,'scripts/draw.mjs'),...args],{TASTE_SKILL_HISTORY:path.join(out,'history.json')});
  }else if(command==='taste-lint'){
    if(!args.some(a=>!a.startsWith('--')))fail('Provide a source path.');
    exitCode=run(process.execPath,[path.join(taste,'scripts/lint.mjs'),...args]);
  }else if(command==='taste-inspect'){
    const explicit=args.indexOf('--automated');
    if(explicit<0)fail('Taste inspector uses an isolated headless browser. Pass --automated for an explicit automated check, or use APDR preview for the default visible review.');
    args.splice(explicit,1);
    const out=requireOutput();
    const startedAt=Date.now();
    const child=spawnSync(process.execPath,[path.join(taste,'scripts/inspect.mjs'),...args],{encoding:'utf8',maxBuffer:16*1024*1024});
    if(child.error)throw child.error;
    if(child.stderr)process.stderr.write(child.stderr);
    if(child.signal)fail(`Browser check terminated by ${child.signal}`);
    const reportPath=path.join(out,'report.json');
    if(!existsSync(reportPath)||statSync(reportPath).mtimeMs<startedAt-1){
      if(child.stdout)process.stdout.write(child.stdout);
      fail('Browser inspection produced no fresh report; no visual pass can be claimed.');
    }
    const report=JSON.parse(readFileSync(reportPath,'utf8'));
    const wi=args.indexOf('--widths');
    const expected=(wi>=0?args[wi+1]:'1440,768,390').split(',').map(Number).filter(Boolean);
    const missing=expected.filter(w=>!report.viewports?.some(v=>v.width===w));
    const expanded=(report.viewports||[]).filter(v=>Math.abs((v.metrics?.viewport?.w??0)-v.width)>2)
      .map(v=>({requestedWidth:v.width,layoutWidth:v.metrics?.viewport?.w}));
    report.apdrValidation={missingViewports:missing,expandedLayoutViewports:expanded};
    // Mobile browsers can expand the layout viewport around fixed-width content. The upstream
    // probe then compares overflow against that expanded width and can report a false clean pass.
    for(const v of expanded)report.findings.push({level:'FAIL',id:'apdr-expanded-viewport',width:v.requestedWidth,
      message:`Layout viewport is ${v.layoutWidth}px for a requested ${v.requestedWidth}px viewport; check fixed-width content/zoom and verify in APDR preview before claiming mobile layout passes.`});
    if(missing.length)report.findings.push({level:'FAIL',id:'apdr-missing-viewport',message:`Missing requested viewport checks: ${missing.join(', ')}`});
    writeFileSync(path.join(out,'apdr-report.json'),JSON.stringify(report,null,2)+'\n');
    if(args.includes('--json'))console.log(JSON.stringify(report,null,2));
    else{
      if(child.stdout)process.stdout.write(child.stdout);
      if(expanded.length||missing.length)process.stderr.write('APDR viewport validation found incomplete or expanded layout coverage; see apdr-report.json.\n');
    }
    exitCode=expanded.length||missing.length?1:(child.status??1);
  }else{
    fail('Commands: status, search, mobile-check, detect, taste-draw, taste-lint, taste-inspect. Design critique/audit/distill/polish follow the skill playbooks.');
  }
  process.exitCode=exitCode;
}catch(error){
  process.stderr.write(`APDR design tools: ${error.message}\n`);
  process.exitCode=1;
}
