import request from 'supertest';
import type {Express} from 'express';
import {evaluateScene} from '@piko/core';
import {missionById} from '@piko/content';
import {validateModel,type Envelope,type LearnerRequest} from '@piko/contracts';
import type {LiveCase} from './cases';
export type LiveResult={id:string;status:'PASS'|'FAIL'|'NOT RUN';httpStatus:number|null;checks:{name:string;passed:boolean}[];envelope:Envelope|null;semanticReview:'NOT REVIEWED';rubric:string[];reason?:string};
export function assessLiveResponse(test:LiveCase,status:number,envelope:Envelope){
 const checks=[{name:'HTTP 200',passed:status===200},{name:'Response from configured live adapter',passed:envelope.mode==='live'&&envelope.model?.provider==='openai'&&Boolean(envelope.model.actualModel)&&envelope.model.requestCount>0},{name:'Model schema valid',passed:validateModel(envelope.learner)}];
 const learner=envelope.learner,scene=missionById(test.body.missionId).scenes[test.body.sceneRole];
 checks.push({name:'Scene identity preserved',passed:envelope.sceneId===scene.id});
 if(test.body.sceneRole==='teach')checks.push({name:'No robot solution in teach',passed:learner?.proposedExpression===null});
 else if(learner?.proposedExpression){const math=evaluateScene(scene,learner.proposedExpression);checks.push({name:'Independent engine agrees with proposal result',passed:math.parseable&&envelope.proposalValidation.status===(math.ok?'passed':'failed')&&envelope.proposalValidation.failureCode===(math.ok?null:math.primaryCode)});}
 else checks.push({name:'Uncertainty kept explicit',passed:learner?.action==='acknowledge_uncertainty'&&envelope.proposalValidation?.status==='not_proposed'});
 if(test.id.endsWith('-transfer'))checks.push({name:'Confirmed memory passed to transfer',passed:envelope.memory?.learnedRuleIds.some(id=>id===missionById(test.body.missionId).canonicalRuleId)});
 return checks;
}
export async function executeLiveCases(app:Express,cases:LiveCase[],maxProviderCalls=44,onProgress?:(progress:{providerCalls:number;maxProviderCalls:number;results:LiveResult[]})=>Promise<void>){
 if(!Number.isInteger(maxProviderCalls)||maxProviderCalls<2||maxProviderCalls>44)throw new Error('Live run budget must be an integer from 2 to 44.');
 const results:LiveResult[]=[],sessions=new Map<string,{cookie:string[];id:string;revision:number}>();let providerCalls=0,stopReason:string|undefined;
 for(const test of cases){
  if(stopReason||providerCalls+2>maxProviderCalls){results.push({id:test.id,status:'NOT RUN',httpStatus:null,checks:[],envelope:null,semanticReview:'NOT REVIEWED',rubric:test.rubric,reason:stopReason??'Run budget cannot reserve two provider calls for the next turn.'});await onProgress?.({providerCalls,maxProviderCalls,results});continue;}
  let session=sessions.get(test.sequence);
  if(!session){const response=await request(app).post('/api/session').send({});if(response.status!==200)throw new Error('Could not establish live test session');const rawCookie=response.headers['set-cookie'] as unknown as string|string[];const created={cookie:Array.isArray(rawCookie)?rawCookie:[rawCookie],id:String(response.body.sessionId),revision:Number(response.body.sessionRevision)};sessions.set(test.sequence,created);session=created;}
  const body:LearnerRequest={...test.body,sessionId:session.id,sessionRevision:session.revision,turnId:crypto.randomUUID()};
  const response=await request(app).post('/api/learner-turn').set('Cookie',session.cookie).send(body),envelope=response.body as Envelope;
  providerCalls+=envelope.model?.requestCount??0;session.revision=envelope.sessionRevision??session.revision;
  const checks=assessLiveResponse(test,response.status,envelope),passed=checks.every(c=>c.passed);
  results.push({id:test.id,status:passed?'PASS':'FAIL',httpStatus:response.status,checks,envelope,semanticReview:'NOT REVIEWED',rubric:test.rubric});
  await onProgress?.({providerCalls,maxProviderCalls,results});
  // A setup failure or unavailable provider is a reason to stop and inspect, not to spend the rest of the test budget.
  if(!passed)stopReason=`Stopped after ${test.id}: ${envelope.error?.code??'structural validation failed'}.`;
 }
 return {status:results.some(r=>r.status==='FAIL')?'FAILED':results.some(r=>r.status==='NOT RUN')?'PARTIAL':'PASSED STRUCTURAL; HUMAN SEMANTIC REVIEW REQUIRED',providerCalls,maxProviderCalls,results};
}
