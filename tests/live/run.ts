import 'dotenv/config';
import {mkdir,writeFile} from 'node:fs/promises';
import request from 'supertest';
import data from '../../content/missions.v1.json';
import evals from '../../content/ai-evals.v1.json';
import {createApp} from '../../apps/server/src/app';
import {Store} from '../../apps/server/src/store';
import {openAIProvider} from '../../apps/server/src/provider';
import {PROMPT_VERSION} from '../../apps/server/src/system';
import type {LearnerRequest} from '@piko/contracts';
await mkdir('checks',{recursive:true});
const report:{date:string;provider:string;model:string|null;promptVersion:string;status:string;reason?:string;results:unknown[]}={date:new Date().toISOString(),provider:'openai',model:process.env.AI_MODEL||null,promptVersion:PROMPT_VERSION,status:'NOT RUN',results:[]};
if(!process.env.OPENAI_API_KEY||!process.env.AI_MODEL){
 report.reason='Brak OPENAI_API_KEY i/lub AI_MODEL w lokalnym środowisku. Nie wykonano żadnego wywołania dostawcy.';
 await writeFile('checks/ai-live-results.json',JSON.stringify(report,null,2)+'\n');console.log('NOT RUN:',report.reason);process.exitCode=2;
}else{
 const store=new Store(process.env.STATE_DB_PATH??'var/piko.sqlite');
 const app=createApp({store,provider:openAIProvider(process.env.OPENAI_API_KEY,process.env.AI_MODEL,Number(process.env.AI_MAX_OUTPUT_TOKENS??1200)),config:{mode:'live',model:process.env.AI_MODEL,dailyBudget:Number(process.env.AI_DAILY_REQUEST_BUDGET??200)}});
 try{
  const cases: {id:string;body:LearnerRequest;rubric:string[]}[]=evals.cases.filter(c=>c.kind==='semantic').map(c=>({id:c.id,body:c.request as LearnerRequest,rubric:c.manualRubricPL}));
  for(const m of data.missions){const s=m.scenes.teach,w=s.witness;const evidence=s.gates.map(g=>({sceneId:s.id,checkpointId:g.id as 'G1'|'G2',submittedY:(w.c2*g.x+w.c1)*g.x+w.c0}));
   const base={...(evals.cases[0].request as LearnerRequest),missionId:m.id as LearnerRequest['missionId'],userMessage:m.ruleText,candidateExpression:w.expression,numericEvidence:evidence};
   cases.push({id:`${m.id}-teach`,body:base,rubric:['Czy Piko reaguje na konkretne wyjaśnienie i pozostaje uczniem?']});
   cases.push({id:`${m.id}-transfer`,body:{...base,phase:'robot_propose',sceneRole:'robot_transfer',candidateExpression:null,userMessage:'',numericEvidence:[],learnedRuleIds:[m.canonicalRuleId] as LearnerRequest['learnedRuleIds'],ruleEvidence:[{missionId:m.id as LearnerRequest['missionId'],candidateExpression:w.expression,numericEvidence:evidence}]},rubric:['Propozycja została niezależnie sprawdzona. Wynik nie jest dowodem wiedzy gracza.']});
  }
  for(const c of cases){const session=await request(app).post('/api/session').send({});const res=await request(app).post('/api/learner-turn').set('Cookie',session.headers['set-cookie']).send({...c.body,sessionId:session.body.sessionId,sessionRevision:0,turnId:crypto.randomUUID()});report.results.push({id:c.id,httpStatus:res.status,envelope:res.body,semanticReview:'NOT REVIEWED',rubric:c.rubric});}
  report.status='EXECUTED; HUMAN SEMANTIC REVIEW REQUIRED';
 }finally{store.close();await writeFile('checks/ai-live-results.json',JSON.stringify(report,null,2)+'\n');}
 console.log(report.status);
}
