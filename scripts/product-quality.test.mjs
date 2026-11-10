import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,mkdir,copyFile,writeFile} from 'node:fs/promises';
import {spawnSync,execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {AGENT_REGISTRY,STAGE_PLAYBOOKS,buildNextAction,DEFAULT_OPERATOR_PREFERENCE,reviewApprovalBlockers,ArtifactStore} from '../packages/core/dist/index.js';
const valid=()=>({passed:true,verification:{sourceSha256:'a'.repeat(64),testedSha256:'a'.repeat(64),scope:'anonymous local fixture',checks:[{id:'save',required:true,status:'passed',evidence:['evidence/save.json']}],issues:[]}});
test('legacy pass is explicit and failure cannot be approved',()=>{
 for(const type of ['QualityReport','DesignReviewReport']){
  assert.deepEqual(reviewApprovalBlockers(type,{passed:true}),[]);
  for(const passed of [false,undefined,'true'])assert.ok(reviewApprovalBlockers(type,{passed}).length);
 }
 assert.deepEqual(reviewApprovalBlockers('PRD',{}),[]);
});
test('current evidence passes, stale or malformed evidence blocks',()=>{
 assert.deepEqual(reviewApprovalBlockers('QualityReport',valid()),[]);
 for(const mutate of [v=>v.testedSha256='b'.repeat(64),v=>v.scope='',v=>v.checks=[],v=>v.issues=null,v=>v.checks.push({...v.checks[0]})]){
  const c=valid();mutate(c.verification);assert.ok(reviewApprovalBlockers('QualityReport',c).length);
 }
 for(const evidence of [[],['/private/evidence.json'],['../outside.json'],['evidence/../outside.json'],['https://example.com'],['C:\\private.json']]){
  const c=valid();c.verification.checks[0].evidence=evidence;assert.ok(reviewApprovalBlockers('QualityReport',c).length);
 }
});
test('required failures, blocked and unexecuted checks never count as pass',()=>{
 for(const status of ['failed','blocked','not_executed','not_applicable']){
  const c=valid();c.verification.checks[0].status=status;assert.ok(reviewApprovalBlockers('QualityReport',c).length);
 }
 const c=valid();c.verification.checks.push({id:'native',required:false,status:'not_applicable',reason:'web only'});
 assert.deepEqual(reviewApprovalBlockers('QualityReport',c),[]);
 delete c.verification.checks[1].reason;assert.ok(reviewApprovalBlockers('QualityReport',c).length);
});
test('serious fixes require verified retesting, regardless of score',()=>{
 for(const severity of ['critical','major'])for(const status of ['open','fixed']){
  const c=valid();c.overallScore=100;c.verification.issues=[{id:'issue',severity,status}];assert.ok(reviewApprovalBlockers('QualityReport',c).length);
  c.verification.issues[0].status='verified';assert.deepEqual(reviewApprovalBlockers('QualityReport',c),[]);
 }
});
test('artifact store rejects failed approvals and direct approved writes without changing saved draft',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'apdr-quality-'));const store=new ArtifactStore(root);
 try{
  await store.ensureProject({id:'fixture',title:'Anonymous fixture',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),currentStage:'intake'});
  const a={id:'fixture:QualityReport:v1',type:'QualityReport',projectId:'fixture',version:1,status:'draft',upstream:[],content:{passed:false},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  await store.writeArtifact(a);
  await assert.rejects(store.approveArtifact('fixture',a.id),/Cannot approve/);
  await assert.rejects(store.writeArtifact({...a,status:'approved'}),/Cannot approve/);
  assert.equal((await store.readArtifact('fixture',a.id)).status,'draft');
  await store.writeArtifact({...a,content:valid()});
  assert.equal((await store.approveArtifact('fixture',a.id)).status,'approved');
 }finally{await rm(root,{recursive:true,force:true});}
});
test('quality skill is discoverable in stage and agent routing; document-only runs require no browser',()=>{
 for(const stage of ['requirements_analysis','prd','user_flows','information_architecture','ui_design','design_review','frontend_codegen','handoff','quality_eval']){
  assert.ok(STAGE_PLAYBOOKS[stage].externalSkills.some(x=>x.id==='product-quality'));
  for(const agent of AGENT_REGISTRY.filter(x=>x.stage===stage))assert.ok(agent.externalSkills.some(x=>x.id==='product-quality'));
  const a=buildNextAction({projectId:'fixture',currentStage:stage,stepIndex:1,totalSteps:13,artifacts:[],staleDownstream:[],blockers:[],canAdvance:false,operatorPreference:{...DEFAULT_OPERATOR_PREFERENCE,deliveryTarget:'feishu-doc'}});
  assert.ok(a.playbook.externalSkills.some(x=>x.id==='product-quality'));
  assert.ok(!a.toolGuidance.some(x=>x.server==='preview'));
 }
});

test('privacy check accepts templates and rejects staged private records',async()=>{
 const temp=await mkdtemp(path.join(tmpdir(),'apdr-privacy-fixture-'));
 try{
  await mkdir(path.join(temp,'scripts'));
  await copyFile(fileURLToPath(new URL('./check-release-privacy.mjs',import.meta.url)),path.join(temp,'scripts/check-release-privacy.mjs'));
  execFileSync('git',['init','-q',temp]);
  await writeFile(path.join(temp,'.env.example'),'API_KEY=<local value>');
  execFileSync('git',['-C',temp,'add','.env.example']);
  const run=(args=[])=>spawnSync(process.execPath,[path.join(temp,'scripts/check-release-privacy.mjs'),...args],{encoding:'utf8'});
  assert.equal(run().status,0);
  await writeFile(path.join(temp,'private.json'),'anonymous-private-marker');
  await writeFile(path.join(temp,'deny.json'),JSON.stringify(['anonymous-private-marker']));
  execFileSync('git',['-C',temp,'add','private.json']);
  assert.equal(run(['--deny-file',path.join(temp,'deny.json')]).status,1);
  execFileSync('git',['-C',temp,'rm','--cached','private.json']);
  await writeFile(path.join(temp,'.env'),'API_KEY=placeholder');
  execFileSync('git',['-C',temp,'add','.env']);
  assert.equal(run().status,1);
 }finally{await rm(temp,{recursive:true,force:true});}
});
