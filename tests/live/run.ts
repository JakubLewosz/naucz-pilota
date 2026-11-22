import 'dotenv/config';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {writeFileSync} from 'node:fs';
import {buildContext} from '@piko/contracts';
import {createApp} from '../../apps/server/src/app';
import {Store} from '../../apps/server/src/store';
import {integer} from '../../apps/server/src/config';
import {selectProvider} from '../../apps/server/src/select-provider';
import {PROMPT_VERSION} from '../../apps/server/src/system';
import {selectLiveCases} from './cases';
import {executeLiveCases,observeProvider,type LiveResult} from './runner';
import {parseLiveOptions} from './options';

const args=process.argv.slice(2);
if(args.length===1&&args[0]==='--help'){
 console.log([
  'npm run test:ai:live -- --dry-run [--case M04-LESSONS|M04-A|M01|SEM01] [--max-calls 2..44]',
  'npm run test:ai:live -- --allow-paid --max-calls 2..44 [--case M04-LESSONS|M04-A|M01|SEM01]',
  'Without --allow-paid and an explicit budget, the provider is never called.'
 ].join('\n'));
 process.exit(0);
}
const {filter,maxProviderCalls,allowPaid,dryRun}=parseLiveOptions(args);
const selected=selectLiveCases(filter);
if(!selected.length)throw new Error('No matching live cases.');
const ai=selectProvider();
const {model,maxOutputTokens,timeoutMs,maxProviderRequests,key}=ai,reasoningEffort=ai.effort;

const date=new Date().toISOString();
const report={
 date,provider:ai.name,model:model||null,reasoningEffort:reasoningEffort??null,maxOutputTokens,timeoutMs,maxProviderRequests,promptVersion:PROMPT_VERSION,
 commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 dirty:execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).length>0,
 selection:filter??'standard',platform:process.platform,node:process.version,
 status:'NOT RUN',reason:undefined as string|undefined,providerCalls:0,maxProviderCalls,
 results:selected.map((test):LiveResult=>({
  id:test.id,status:'NOT RUN',httpStatus:null,checks:[],request:test.body,providerObservations:[],
  envelope:null,semanticReview:'NOT REVIEWED',rubric:test.rubric
 })),
 preflight:[] as {id:string;lessonNotePresent:boolean}[]
};
await mkdir('var/ai-live',{recursive:true});
const reportPath=`var/ai-live/${date.replace(/[:.]/g,'-')}-${crypto.randomUUID().slice(0,8)}.json`;
const serialized=()=>JSON.stringify(report,null,2)+'\n';
const save=()=>writeFile(reportPath,serialized());

if(dryRun){
 report.preflight=selected.map(test=>({
  id:test.id,lessonNotePresent:buildContext(test.body).context.lessonNote!==null
 }));
 report.reason='Próba przygotowawcza. Sprawdzono wejścia bez uruchamiania dostawcy.';
}else if(!allowPaid){
 report.reason='Brak jawnego --allow-paid i zatwierdzonego budżetu.';
 process.exitCode=2;
}else if(!key||!model){
 report.reason='Brak klucza API lub AI_MODEL dla wybranego dostawcy. Dostawcy nie wywołano.';
 process.exitCode=2;
}else{
 let store:Store|undefined;
 try{
  store=new Store(process.env.STATE_DB_PATH??'var/piko.sqlite');
  const observed=observeProvider(ai.create());
  const app=createApp({
   store,provider:observed.provider,
   config:{mode:'live',provider:ai.name,model,timeoutMs,maxProviderRequests,dailyBudget:integer('AI_DAILY_REQUEST_BUDGET',200,0)}
  });
  report.status='RUNNING';
  await save();
  const interrupted=()=>{
   report.status='INTERRUPTED';
   report.reason='Operator przerwał próbę. Dostawca mógł otrzymać ostatnie żądanie w toku.';
   writeFileSync(reportPath,serialized());
   process.exit(130);
  };
  process.once('SIGINT',interrupted);
  process.once('SIGTERM',interrupted);
  try{
   const result=await executeLiveCases(app,selected,maxProviderCalls,async progress=>{
    report.providerCalls=progress.providerCalls;
    report.results=[...progress.results,...report.results.slice(progress.results.length)];
    await save();
    const current=progress.results.at(-1);
    console.log(`${current?.id}: ${current?.status}. Żądania dostawcy: ${progress.providerCalls}.`);
   },observed.take);
   Object.assign(report,result);
  }finally{
   process.removeListener('SIGINT',interrupted);
   process.removeListener('SIGTERM',interrupted);
  }
  process.exitCode=report.status==='FAILED'?1:report.status==='PARTIAL'?2:0;
 }catch(error){
  report.status='FAILED';
  report.reason=error instanceof Error?error.message:'Błąd wykonania zestawu live.';
  process.exitCode=1;
 }finally{
  store?.close();
 }
 if(!filter)await writeFile('checks/ai-live-results.json',serialized());
}
await save();
console.log(report.status,report.reason??'',`Żądania dostawcy: ${report.providerCalls}. Raport: ${reportPath}`);
