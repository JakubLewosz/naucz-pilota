import assert from 'node:assert/strict';
import {appendFileSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {openAIProvider} from '../../apps/server/src/provider';
import {PROMPT_VERSION} from '../../apps/server/src/system';
import {evaluateTransfer,generalizationCases,geometries,maxOutputTokens,mockProvider,model,reasoningEffort,seed,timeoutMs} from './m04-generalization';

const args=process.argv.slice(2);
const live=args[0]==='--live';
const runId=args[3];
const maxCalls=8;
if(!(args.length===1&&args[0]==='--mock')
 &&!(live&&args.length===4&&args[1]==='--max-calls'&&args[2]===String(maxCalls)&&/^[a-zA-Z0-9-]{1,60}$/.test(runId))){
 throw new Error('Use --mock or, with operator approval, --live --max-calls 8 unique-run-id.');
}
const cases=generalizationCases().filter(test=>!live||['shift--4','rebuilt'].includes(test.geometry.id));
assert.equal(cases.length,live?maxCalls:16);
await mkdir('var/ai-live',{recursive:true});
const directory=live?`var/ai-live/m04-generalization-live-${runId}`:'var/ai-live';
if(live)await mkdir(directory);
const reportPath=directory+(live?'/report.json':'/m04-generalization-mock.json');
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const dirty=execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).length>0;
const report={
 mode:live?'live':'mock',source:live?'openai':'sdk-stub',promptVersion:PROMPT_VERSION,configuredModel:model,
 reasoningEffort,maxOutputTokens,timeoutMs,seed,commit,dirty,maxCalls:live?maxCalls:0,providerCalls:0,
 cases:cases.map(test=>({geometry:test.geometry.id,condition:test.condition})),
 geometryControls:geometries.map(({id,reference,knownFailure})=>({id,reference,knownFailure})),
 results:[] as (Awaited<ReturnType<typeof evaluateTransfer>>&{latencyMs:number|null;api:object|null})[],status:'RUNNING'
};
const save=()=>writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
let current=cases[0];
let api:object|null=null;
let provider;
if(live){
 await import('dotenv/config');
 const key=process.env.OPENAI_API_KEY;
 if(!key){
  report.status='NOT RUN';
  await save();
  throw new Error('OPENAI_API_KEY is required for the explicitly authorized live run.');
 }
 const journal=(entry:object)=>appendFileSync(directory+'/requests.jsonl',JSON.stringify(entry)+'\n',{mode:0o600});
 provider=openAIProvider(key,model,maxOutputTokens,{reasoningEffort,baseURL:'https://api.openai.com/v1',fetch:async(input,init)=>{
  assert.equal(new URL(input instanceof Request?input.url:input).href,'https://api.openai.com/v1/responses');
  assert.equal(init?.method,'POST');
  const body=JSON.parse(String(init?.body));
  assert.equal(body.model,model);
  assert.deepEqual(body.reasoning,{effort:reasoningEffort});
  assert.equal(body.store,false);
  assert.equal(body.max_output_tokens,maxOutputTokens);
  assert.ok(report.providerCalls<maxCalls,'M04 live HTTP budget exhausted.');
  const request={number:++report.providerCalls,geometry:current.geometry.id,condition:current.condition};
  journal({event:'reserved',...request});
  const response=await fetch(input,{...init,redirect:'error'});
  const reply=await response.clone().json();
  api={httpStatus:response.status,providerRequestId:response.headers.get('x-request-id'),model:reply.model,
   status:reply.status,serviceTier:reply.service_tier,usage:reply.usage,incompleteDetails:reply.incomplete_details,
   errorCode:reply.error?.code};
  journal({event:'response',...request,api});
  return response;
 }});
}
for(const test of cases){
 current=test;
 api=null;
 const started=performance.now();
 const result=await evaluateTransfer(test,provider??mockProvider(test),AbortSignal.timeout(timeoutMs));
 report.results.push({...result,latencyMs:live?Math.round(performance.now()-started):null,api});
 await save();
 if(result.status==='AI_NOT_CONFIGURED'||result.status==='AI_PROVIDER_UNAVAILABLE')break;
}
report.status=!live&&report.results.some(result=>!result.accepted)
 ?'FAIL':report.results.length===cases.length?'COMPLETE':'PARTIAL';
await save();
console.log(`${report.status} ${report.mode}. ${report.providerCalls} OpenAI HTTP requests. ${reportPath}`);
if(report.status!=='COMPLETE')process.exitCode=1;
