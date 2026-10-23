import test, {before, after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, rm, symlink, readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {agentForStage, AGENT_REGISTRY, buildNextAction, DEFAULT_OPERATOR_PREFERENCE, DESIGN_PIPELINE_WORKFLOW} from '../packages/core/dist/index.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const action=(stage,prefs={})=>buildNextAction({projectId:'fixture',currentStage:stage,stepIndex:1,totalSteps:13,artifacts:[],staleDownstream:[],blockers:[],canAdvance:false,operatorPreference:{...DEFAULT_OPERATOR_PREFERENCE,...prefs}});
let temp, project, preview, research, httpServer, url;
const clients=[];
const html='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>APDR本地自测</title></head><body><main><h1>中文商品简称</h1><label for="alias">简称</label><input id="alias"><button id="save" onclick="document.querySelector(\'#result\').textContent=\'已验证：\'+document.querySelector(\'#alias\').value">验证</button><p id="result"></p><button id="bad"></button></main></body></html>';
async function connect(name){
  const transport=new StdioClientTransport({command:process.execPath,args:[path.join(root,`packages/mcp-servers/${name}/dist/index.js`)],env:{PATH:process.env.PATH,HOME:process.env.HOME,APDR_PROJECTS_ROOT:temp},stderr:'pipe'});
  const client=new Client({name:'apdr-local-tools-test',version:'1.0.0'});
  clients.push({client,transport}); await client.connect(transport); return client;
}
async function call(client,name,args){const result=await client.callTool({name,arguments:args},undefined,{timeout:180000}); return {error:result.isError===true,data:JSON.parse(result.content[0].text)};}
before(async()=>{
  temp=await mkdtemp(path.join(tmpdir(),'apdr-local-tools-test-'));
  project=path.join(temp,'fixture');await mkdir(path.join(project,'attachments'),{recursive:true});
  await writeFile(path.join(project,'attachments/source.html'),html);
  httpServer=createServer((_req,res)=>{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);});
  await new Promise(resolve=>httpServer.listen(0,'127.0.0.1',resolve));url=`http://127.0.0.1:${httpServer.address().port}/`;
  preview=await connect('preview');research=await connect('research');
});
after(async()=>{
  for(const {client,transport} of clients){await client.close().catch(()=>{});await transport.close().catch(()=>{});}
  if(httpServer){httpServer.closeAllConnections();await new Promise(resolve=>httpServer.close(resolve));}
  if(temp) await rm(temp,{recursive:true,force:true});
});
test('intake selects the specialist; registry skills are unique',()=>{
  assert.equal(agentForStage('intake').id,'intake_specialist');
  assert.equal(action('intake').skillPath,'skills/intake/SKILL.md');
  for(const agent of AGENT_REGISTRY){const paths=(agent.externalSkills??[]).map(s=>s.vendorPath);assert.equal(new Set(paths).size,paths.length);}
});
test('stage tool guidance is conditional and never changes required human gates',()=>{
  assert.ok(action('intake').toolGuidance.some(t=>t.tool==='convert_document'));
  assert.ok(action('design_review').toolGuidance.some(t=>t.tool==='audit_accessibility'));
  assert.deepEqual(action('quality_eval',{deliveryTarget:'feishu-doc'}).toolGuidance,[]);
  assert.deepEqual(action('frontend_codegen',{taskMode:'copy_only'}).toolGuidance,[]);
  for(const stage of ['requirements_analysis','prd','ui_design','design_review']) assert.equal(DESIGN_PIPELINE_WORKFLOW.steps.find(s=>s.stage===stage).humanGate,'required');
});
test('next-action does not mutate shared playbooks or recommend executing while blocked',()=>{
  const a=action('design_review'),b=action('design_review');assert.deepEqual(a.playbook.externalSkills,b.playbook.externalSkills);
  const blocked=buildNextAction({projectId:'fixture',currentStage:'design_review',stepIndex:8,totalSteps:13,artifacts:[],staleDownstream:[],blockers:['UIDesignSpec not approved'],canAdvance:false});
  assert.equal(blocked.phase,'blocked');assert.deepEqual(blocked.toolGuidance,[]);
});
test('native MCP catalogs contain new tools and retain old entries',async()=>{
  const p=(await preview.listTools()).tools.map(t=>t.name),r=(await research.listTools()).tools.map(t=>t.name);
  for(const name of ['serve_frontend','local_tools_status','list_browser_tools','run_browser_checks','audit_accessibility'])assert.ok(p.includes(name));
  for(const name of ['research_note','convert_document','search_web','fetch_url'])assert.ok(r.includes(name));
  const state=await call(preview,'local_tools_status',{});assert.equal(state.error,false);assert.equal(state.data.installed,true);
});
test('native get_next_action returns specialist and conversion guidance without approving',async()=>{
  const artifacts=await connect('design-artifacts');
  const created=await artifacts.callTool({name:'start_project',arguments:{project_id:'routing-fixture',title:'Isolated routing test',requirements:'Test only. No real business data.',include_backend:false}});
  assert.notEqual(created.isError,true);
  const result=await call(artifacts,'get_next_action',{project_id:'routing-fixture',format:'json'});
  assert.equal(result.error,false);assert.equal(result.data.agentId,'intake_specialist');
  // start_project seeds a draft: the next action may correctly require review.
  if(result.data.phase==='execute')assert.ok(result.data.toolGuidance.some(t=>t.tool==='convert_document'));
  else assert.deepEqual(result.data.toolGuidance,[]);
  assert.notEqual(result.data.phase,'complete');
});
test('unimplemented research reports unavailable and writes no fake evidence',async()=>{
  const search=await call(research,'search_web',{query:'isolated fixture'});assert.equal(search.error,true);assert.deepEqual(search.data.results,[]);
  const fetch=await call(research,'fetch_url',{project_id:'fixture',url:'https://example.com'});assert.equal(fetch.error,true);assert.equal(fetch.data.status,'unavailable');
  assert.ok(!(await readdir(project)).includes('research'));
});
test('document conversion preserves Chinese content and SHA provenance',async()=>{
  const result=await call(research,'convert_document',{project_id:'fixture',source_path:'attachments/source.html'});
  assert.equal(result.error,false);assert.match(result.data.sourceSha256,/^[0-9a-f]{64}$/);
  assert.ok(!path.isAbsolute(result.data.output));assert.match(await readFile(path.join(project,result.data.output),'utf8'),/中文商品简称/);
});
test('MCP rejects project traversal, cross-project and symlink input',async()=>{
  await writeFile(path.join(temp,'outside.html'),html);await symlink(path.join(temp,'outside.html'),path.join(project,'escape.html'));
  for(const args of [{project_id:'../fixture',source_path:'attachments/source.html'},{project_id:'fixture',source_path:'../outside.html'},{project_id:'fixture',source_path:'escape.html'}]){
    assert.equal((await call(research,'convert_document',args)).error,true);
  }
});
test('native browser MCP performs real local interaction with evidence',async()=>{
  const catalog=await call(preview,'list_browser_tools',{project_id:'fixture'});assert.equal(catalog.error,false);
  assert.ok(catalog.data.tools.some(t=>t.name==='browser_snapshot'));assert.ok(!catalog.data.tools.some(t=>t.name==='browser_evaluate'));
  const result=await call(preview,'run_browser_checks',{project_id:'fixture',headless:true,calls:[
    {name:'browser_navigate',arguments:{url}},
    {name:'browser_type',arguments:{target:'#alias',text:'APDR自测'}},
    {name:'browser_click',arguments:{target:'#save'}},
    {name:'browser_snapshot',arguments:{}},
    {name:'browser_take_screenshot',arguments:{filename:'shot.png',scale:'css',type:'png'}}
  ]});
  assert.equal(result.error,false,JSON.stringify(result.data));assert.equal(result.data.status,'completed');
  assert.match(JSON.stringify(result.data.results[3]),/已验证：APDR自测/);
  const report=JSON.parse(await readFile(path.join(project,result.data.evidence),'utf8'));assert.equal(report.status,'completed');
});
test('native browser MCP rejects remote navigation and arbitrary code',async()=>{
  for(const calls of [[{name:'browser_navigate',arguments:{url:'https://example.com'}}],[{name:'browser_evaluate',arguments:{function:'()=>document.cookie'}}]]){
    const result=await call(preview,'run_browser_checks',{project_id:'fixture',headless:true,calls});assert.equal(result.error,true);
  }
});
test('native axe MCP finds deliberate defect and saves JSON and screenshot',async()=>{
  const result=await call(preview,'audit_accessibility',{project_id:'fixture',target:'attachments/source.html',headless:true});
  assert.equal(result.error,false,JSON.stringify(result.data));assert.ok(result.data.violations>0);
  const report=JSON.parse(await readFile(path.join(project,result.data.evidence),'utf8'));assert.ok(report.violations.some(v=>v.id==='button-name'));
  assert.equal((await readFile(path.join(project,result.data.screenshot)))[0],137);
});
