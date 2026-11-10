import 'dotenv/config';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {once} from 'node:events';
import {appendFileSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import express from 'express';
import {chromium,type Page} from 'playwright';
import type {Envelope,LearnerRequest,LessonNote,ModelPayload} from '@piko/contracts';
import {evaluateScene} from '@piko/core';
import {missionById} from '@piko/content';
import authoring from '../../content/missions.v1.json';
import {createApp} from '../../apps/server/src/app';
import {openAIProvider} from '../../apps/server/src/provider';
import {AI_RESPONSE_WAIT_MS,readOpenAIConfig} from '../../apps/server/src/config';
import {Store} from '../../apps/server/src/store';
import {PROMPT_VERSION} from '../../apps/server/src/system';
import {M04_LESSON_VARIANTS} from './cases';

const paid=process.argv[2]==='--allow-paid';
const runId=process.argv[3];
if(!['--mock','--allow-paid'].includes(process.argv[2])||process.argv.length!==4||!/^[a-zA-Z0-9-]{1,60}$/.test(runId)){
 throw new Error('Use npx tsx tests/live/m04-browser.ts --mock|--allow-paid unique-run-id. Paid cap: at most 9 HTTP requests.');
}
const key=paid?process.env.OPENAI_API_KEY:'offline-stub-key';
const {model,reasoningEffort,maxOutputTokens,timeoutMs,maxProviderRequests}=readOpenAIConfig(paid?process.env:{AI_MODEL:'gpt-6-luna'});
const maxCalls=M04_LESSON_VARIANTS.length*(maxProviderRequests+1);
if(!key||!model)throw new Error('NOT RUN: configure the backend key and model first.');
const branch=execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim();
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
assert.equal(branch,'codex/jury-readiness');
const date=new Date().toISOString();
const directory=`var/ai-live/m04-browser-${paid?'live':'mock'}-${runId}`;
await mkdir('var/ai-live',{recursive:true});
await mkdir(directory); // A duplicate run ID must stop before it can spend anything.
const ledger=directory+'/requests.jsonl';
const reportPath=directory+'/report.json';

type Usage={input_tokens:number;output_tokens:number;total_tokens:number;input_tokens_details?:{cached_tokens:number};output_tokens_details?:{reasoning_tokens:number}};
type ProviderReply={id?:string;model?:string;status?:string;service_tier?:string;usage?:Usage;output?:unknown[];error?:{code?:string;type?:string}};
type Attempt={
 number:number;variant:string;sceneId:string;phase:string;time:string;
 httpStatus?:number;providerRequestId?:string|null;response?:ProviderReply;transportError?:string
};
type Turn={httpStatus:number;request:LearnerRequest;envelope:Envelope};
type VariantResult={
 id:string;explanationPL:string;rubric:string;status:'NOT RUN'|'PASS'|'FAIL';
 baselineSha256?:string;teach?:Turn;note?:LessonNote;transfer?:Turn;
 engine?:{status:string;code:string|null;messagePL:string;uiMessagePL:string};
 error?:string
};
const attempts:Attempt[]=[];
const variants:VariantResult[]=M04_LESSON_VARIANTS.map(variant=>({...variant,status:'NOT RUN'}));
const report={
 date,mode:paid?'live':'mock',promptVersion:PROMPT_VERSION,model,reasoningEffort:reasoningEffort??null,maxOutputTokens,timeoutMs,branch,commit,maxCalls,
 platform:process.platform,node:process.version,maxAttemptsPerTurn:maxProviderRequests,attempts,variants,
 baselineSha256:undefined as string|undefined,baseline:undefined as unknown,
 phase:'RUNNING',error:undefined as string|undefined,providerCalls:0,
 semanticReview:'NOT REVIEWED'
};
const save=()=>writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
const journal=(entry:object)=>appendFileSync(ledger,JSON.stringify(entry)+'\n',{mode:0o600});
let activeVariant='setup';

function stubReply(phase:string,number:number){
 const transfer=phase==='robot_propose';
 const payload:ModelPayload={
  utterancePL:transfer?'Test techniczny transferu.':'Test techniczny zapisu notatki.',
  followUpPL:null,explanationAssessment:transfer?'not_applicable':'unclear',
  proposedExpression:transfer?'0.25(x-2)^2':null,
  suggestedRuleId:null,usedFactIds:[],action:transfer?'propose_attempt':'explain_back'
 };
 // The first mock response exercises the same metered technical retry as live.
 const message=number===1?'invalid JSON':JSON.stringify(payload);
 return new Response(JSON.stringify({
  id:`resp_stub_${number}`,object:'response',model:'offline-stub',status:'completed',
  output:[{id:'msg_stub',type:'message',role:'assistant',status:'completed',
   content:[{type:'output_text',text:message,annotations:[]}]}]
 }),{headers:{'Content-Type':'application/json'}});
}

const meteredFetch:typeof fetch=async(input,init)=>{
 const url=new URL(input instanceof Request?input.url:input);
 assert.equal(url.href,'https://api.openai.com/v1/responses');
 assert.equal(init?.method,'POST');
 assert.notEqual(activeVariant,'setup','Demo setup cannot invoke the provider.');
 if(attempts.length>=maxCalls)throw new Error('Hard OpenAI HTTP budget exhausted.');
 const request=JSON.parse(String(init?.body)) as {input:{role:string;content:string}[];model:string;store:boolean;reasoning?:{effort:string};max_output_tokens:number};
 assert.equal(request.model,model);
 assert.equal(request.store,false);
 assert.deepEqual(request.reasoning,reasoningEffort?{effort:reasoningEffort}:undefined);
 assert.equal(request.max_output_tokens,maxOutputTokens);
 const context=JSON.parse(request.input[0].content);
 assert.equal(request.input[0].role,'developer');
 assert.ok(['M04-teach','M04-robot_transfer'].includes(context.scene.id));
 assert.doesNotMatch(JSON.stringify(request.input),/human_check|witness|knownFailures/);
 if(context.phase==='robot_propose'){
  const note=variants.find(result=>result.id===activeVariant)?.note;
  assert.ok(note);
  assert.equal(Object.hasOwn(context,'lessonNote'),false);
  const quotes=request.input.filter(item=>item.content.includes('"untrustedLessonNote"'));
  assert.deepEqual(quotes,[{role:'user',content:JSON.stringify({untrustedLessonNote:note})}]);
 }
 const attempt:Attempt={
  number:attempts.length+1,variant:activeVariant,sceneId:context.scene.id,phase:context.phase,time:new Date().toISOString()
 };
 // Reserve before sending. The append-only record survives a transport failure or interruption.
 journal({event:'reserved',...attempt});
 attempts.push(attempt);
 report.providerCalls=paid?attempts.length:0;
 console.log(`${paid?'LIVE':'MOCK'} ${activeVariant} ${context.phase} request ${attempt.number}/${maxCalls}`);
 try{
  const response=paid?await fetch(input,{...init,redirect:'error'}):stubReply(context.phase,attempt.number);
  attempt.httpStatus=response.status;
  attempt.providerRequestId=response.headers.get('x-request-id');
  const reply=await response.clone().json() as ProviderReply;
  attempt.response={
   id:reply.id,model:reply.model,status:reply.status,service_tier:reply.service_tier,
   usage:reply.usage,output:reply.output,error:reply.error?{code:reply.error.code,type:reply.error.type}:undefined
  };
  journal({event:'response',...attempt});
  return response;
 }catch(error){
  attempt.transportError=error instanceof Error?error.name:'TransportError';
  journal({event:'transport-error',...attempt});
  throw error;
 }
};

const server=createServer();
server.listen(0,'127.0.0.1');
await once(server,'listening');
const bound=server.address();
assert.ok(bound&&typeof bound!=='string');
const origin=`http://127.0.0.1:${bound.port}`;
const store=new Store(':memory:');
const provider=openAIProvider(key,model,maxOutputTokens,{baseURL:'https://api.openai.com/v1',fetch:meteredFetch,reasoningEffort});
const app=createApp({store,provider,config:{mode:'live',model,publicOrigin:origin,dailyBudget:maxCalls,maxProviderRequests,timeoutMs}});
app.use(express.static('apps/web/dist'));
server.on('request',app);
const browser=await chromium.launch();

type MissionFixture=(typeof authoring.missions)[number];
const button=(page:Page,name:string)=>page.getByRole('button',{name});
const readRun=(page:Page)=>page.evaluate(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!).runs.M04);
const readState=(page:Page)=>page.evaluate(()=>localStorage.getItem('naucz-pilota.v1')!);
async function practice(page:Page,mission:MissionFixture){
 const field=page.getByLabel('Wzór funkcji',{exact:true});
 await field.fill(mission.scenes.practice.witness.expression);
 await field.press('Enter');
 await button(page,'Teraz naucz Piko').click();
}
async function repair(page:Page,mission:MissionFixture){
 const {gates,witness}=mission.scenes.teach;
 await page.getByLabel('Twój poprawiony wzór').fill(witness.expression);
 for(const [index,gate] of gates.entries()){
  await page.locator(`#prediction${index}`).fill(String((witness.c2*gate.x+witness.c1)*gate.x+witness.c0));
 }
 await button(page,'Sprawdź naprawę').click();
 await page.getByText('Tor i obie prognozy są poprawne.',{exact:true}).waitFor();
}
async function advanceDemo(page:Page,mission:MissionFixture){
 await practice(page,mission);
 await page.getByLabel('Co Piko powinien zmienić i dlaczego?').fill(mission.ruleText);
 await repair(page,mission);
 await button(page,'Zapisz tę zasadę dla Piko').click();
 await button(page,'Piko, spróbuj sam').click();
 await page.getByLabel('Jeszcze nie wiem',{exact:true}).check();
 await button(page,'Sprawdź lot Piko').click();
 await button(page,'Teraz mój samodzielny lot').click();
 const field=page.getByLabel('Wzór funkcji',{exact:true});
 await field.fill(mission.scenes.human_check.witness.expression);
 await field.press('Enter');
 await button(page,'Zobacz podsumowanie').click();
 await button(page,'Następna misja').click();
}
async function ask(page:Page,name:string):Promise<Turn>{
 assert.ok(attempts.length<maxCalls,'Hard OpenAI HTTP budget exhausted before the next turn.');
 const [response]=await Promise.all([
  page.waitForResponse(r=>r.url()===origin+'/api/learner-turn'&&r.request().method()==='POST',{timeout:AI_RESPONSE_WAIT_MS}),
  button(page,name).click()
 ]);
 return {httpStatus:response.status(),request:response.request().postDataJSON() as LearnerRequest,
  envelope:await response.json() as Envelope};
}
function requireReply(turn:Turn){
 const result=turn.envelope;
 assert.equal(turn.httpStatus,200,result.error?.code??'Unexpected learner response.');
 assert.equal(result.mode,'live');
 assert.equal(result.model.provider,'openai');
 assert.ok(result.learner);
 assert.ok(result.model.actualModel);
 return result.learner;
}

try{
 const setup=await browser.newContext({reducedMotion:'reduce'});
 const prep=await setup.newPage();
 await prep.goto(origin);
 await button(prep,'Zacznij').click();
 for(const mission of authoring.missions.slice(0,3))await advanceDemo(prep,mission);
 const m04=authoring.missions.find(mission=>mission.id==='M04')!;
 await practice(prep,m04);
 await repair(prep,m04);
 await button(prep,'Ustawienia').click();
 await button(prep,'Wybierz live').click();
 await button(prep,'Wróć do gry').click();
 await prep.getByLabel('Co Piko powinien zmienić i dlaczego?').waitFor();
 await prep.waitForFunction(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!).mode==='live');
 const baseline=await setup.storageState();
 assert.equal(baseline.cookies.length,0);
 assert.equal(attempts.length,0);
 const baselineText=await readState(prep);
 report.baselineSha256=createHash('sha256').update(baselineText).digest('hex');
 const baseRun=await readRun(prep);
 assert.equal(baseRun.explanation,'');
 assert.equal(baseRun.rule,null);
 report.baseline={missionId:'M04',role:baseRun.role,expression:baseRun.drafts.teach,predictions:baseRun.predictions,cookies:0};
 await setup.close();
 await save();
 const sessions=new Set<string>();
 for(const variant of variants){
  if(attempts.length>=maxCalls)break;
  activeVariant=variant.id;
  const context=await browser.newContext({storageState:baseline,reducedMotion:'reduce'});
  try{
   assert.deepEqual(await context.storageState(),baseline);
   variant.baselineSha256=report.baselineSha256;
   const page=await context.newPage();
   await page.goto(origin);
   await page.getByLabel('Co Piko powinien zmienić i dlaczego?').fill(variant.explanationPL);
   variant.teach=await ask(page,'Powiedz Piko');
   const teach=requireReply(variant.teach);
   assert.equal(variant.teach.request.userMessage,variant.explanationPL);
   assert.equal(variant.teach.request.sessionRevision,0);
   assert.equal(sessions.has(variant.teach.request.sessionId),false);
   sessions.add(variant.teach.request.sessionId);
   await page.getByText('Tak zrozumiałem — Piko (live)',{exact:true}).waitFor();
   await button(page,'Zapisz tę zasadę dla Piko').click();
   await page.getByText('Notatka z lekcji Piko',{exact:true}).waitFor();
   variant.note=(await readRun(page)).rule.lessonNote;
   assert.deepEqual(variant.note,{
    version:1,ruleId:m04.canonicalRuleId,explanationPL:variant.explanationPL,
    pikoParaphrasePL:teach.utterancePL,source:'live',confirmation:'saved_by_player'
   });
   await save();
   await page.reload();
   variant.transfer=await ask(page,'Piko, spróbuj sam');
   const proposed=requireReply(variant.transfer).proposedExpression;
   assert.equal(variant.transfer.request.sessionId,variant.teach.request.sessionId);
   assert.equal(variant.transfer.request.sessionRevision,1);
   assert.deepEqual(variant.transfer.request.ruleEvidence.find(rule=>rule.missionId==='M04')?.lessonNote,variant.note);
   if(proposed){
    const math=evaluateScene(missionById('M04').scenes.robot_transfer,proposed);
    assert.equal(math.parseable,true);
    assert.equal(variant.transfer.envelope.proposalValidation.status,math.ok?'passed':'failed');
    assert.equal(variant.transfer.envelope.proposalValidation.failureCode,math.ok?null:math.primaryCode);
    await page.getByLabel('Jeszcze nie wiem',{exact:true}).check();
    await button(page,'Sprawdź lot Piko').click();
    const uiMessagePL=await page.getByTestId('engine-result').innerText();
    const attempt=(await readRun(page)).attempts.robot_transfer.at(-1);
    assert.equal(attempt.source,'live');
    assert.equal(attempt.expression,proposed);
    assert.deepEqual(attempt.result,math);
    variant.engine={status:math.ok?'passed':'failed',code:math.ok?null:math.primaryCode,messagePL:math.messagePL,uiMessagePL};
   }else{
    assert.equal(variant.transfer.envelope.proposalValidation.status,'not_proposed');
    variant.engine={status:'not_proposed',code:null,messagePL:'Piko nie podał wzoru.',uiMessagePL:''};
   }
   variant.status='PASS';
  }catch(error){
   variant.status='FAIL';
   variant.error=error instanceof Error?error.message:'Błąd wariantu.';
  }finally{
   await context.close();
   await save();
  }
  if(variant.status==='FAIL'){
   const code=variant.transfer?.envelope.error?.code??variant.teach?.envelope.error?.code;
   if(['AI_NOT_CONFIGURED','AI_PROVIDER_UNAVAILABLE','DAILY_BUDGET_EXHAUSTED'].includes(code??''))break;
  }
 }
 report.phase=variants.every(result=>result.status==='PASS')?'COMPLETE':'PARTIAL';
 if(report.phase!=='COMPLETE')process.exitCode=1;
}catch(error){
 report.phase='FAIL';
 report.error=error instanceof Error?error.message:'Błąd uruchomienia.';
 process.exitCode=1;
}finally{
 await save();
 await browser.close();
 await new Promise<void>(resolve=>server.close(()=>resolve()));
 store.close();
 console.log(`${report.phase}, OpenAI HTTP requests: ${report.providerCalls}. Report: ${reportPath}`);
}
