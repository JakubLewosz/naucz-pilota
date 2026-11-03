import 'dotenv/config';
import {mkdir,writeFile} from 'node:fs/promises';
import {writeFileSync} from 'node:fs';
import {createApp} from '../../apps/server/src/app';
import {Store} from '../../apps/server/src/store';
import {openAIProvider} from '../../apps/server/src/provider';
import {PROMPT_VERSION} from '../../apps/server/src/system';
import {buildLiveCases} from './cases';
import {executeLiveCases} from './runner';
import {parseLiveOptions} from './options';
const args=process.argv.slice(2);
if(args.length===1&&args[0]==='--help'){console.log('npm run test:ai:live -- [--case M01|SEM01|M01-teach] [--max-calls 2..44]\nExplicit paid API test. Stops after the first structural/provider failure.');process.exit(0);}
const {filter,maxProviderCalls}=parseLiveOptions(args);
const allCases=buildLiveCases(),selected=filter?allCases.filter(c=>c.id===filter||c.sequence===filter):allCases;
if(!selected.length)throw new Error('No matching live cases.');
await mkdir('checks',{recursive:true});
const report:{date:string;provider:string;model:string|null;promptVersion:string;status:string;reason?:string;providerCalls:number;maxProviderCalls:number;results:unknown[]}={date:new Date().toISOString(),provider:'openai',model:process.env.AI_MODEL||null,promptVersion:PROMPT_VERSION,status:'NOT RUN',providerCalls:0,maxProviderCalls,results:[]};
if(!process.env.OPENAI_API_KEY||!process.env.AI_MODEL){
 report.reason='Brak OPENAI_API_KEY i/lub AI_MODEL w lokalnym środowisku. Nie wykonano żadnego wywołania dostawcy.';console.log('NOT RUN:',report.reason);process.exitCode=2;
}else{
 const store=new Store(process.env.STATE_DB_PATH??'var/piko.sqlite');
 try{
  const app=createApp({store,provider:openAIProvider(process.env.OPENAI_API_KEY,process.env.AI_MODEL,Number(process.env.AI_MAX_OUTPUT_TOKENS??1200)),config:{mode:'live',model:process.env.AI_MODEL,dailyBudget:Number(process.env.AI_DAILY_REQUEST_BUDGET??200)}});
  report.status='RUNNING';
  const save=()=>writeFile('checks/ai-live-results.json',JSON.stringify(report,null,2)+'\n');
  await save();
  const interrupted=()=>{report.status='INTERRUPTED';report.reason='Operator stopped the run. The last in-flight provider request may have been processed; completed cases are preserved.';writeFileSync('checks/ai-live-results.json',JSON.stringify(report,null,2)+'\n');process.exit(130);};
  process.once('SIGINT',interrupted);process.once('SIGTERM',interrupted);
  try{Object.assign(report,await executeLiveCases(app,selected,maxProviderCalls,async progress=>{Object.assign(report,progress);await save();console.log(`${progress.results.at(-1)?.id}: ${progress.results.at(-1)?.status}; provider requests so far: ${progress.providerCalls}`);}));}
  finally{process.removeListener('SIGINT',interrupted);process.removeListener('SIGTERM',interrupted);}
  process.exitCode=report.status==='FAILED'?1:report.status==='PARTIAL'?2:0;
 }catch(error){report.status='FAILED';report.reason=error instanceof Error?error.message:'Live runner failed.';process.exitCode=1;}
 finally{store.close();}
 console.log(report.status,`provider requests: ${report.providerCalls}`);
}
// Report outputs contain responses to authored fixtures, never the provider API key.
await writeFile('checks/ai-live-results.json',JSON.stringify(report,null,2)+'\n');
