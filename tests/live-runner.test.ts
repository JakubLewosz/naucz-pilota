import {it,expect} from 'vitest';
import {createApp} from '../apps/server/src/app';
import {Store} from '../apps/server/src/store';
import {ProviderError,type Provider} from '../apps/server/src/provider';
import {buildLiveCases,buildM04LessonCases,M04_LESSON_VARIANTS,selectLiveCases} from './live/cases';
import {executeLiveCases,observeProvider} from './live/runner';
import {buildContext,demoTurn} from '@piko/contracts';
import evals from '../content/ai-evals.v1.json';
it('live evaluator groups 22 cases and keeps teach/transfer in the same session',async()=>{
 const updates:number[][]=[];const cases=buildLiveCases();expect(cases).toHaveLength(22);const selected=cases.filter(c=>c.sequence==='M01'),contexts:unknown[]=[];
 const provider:Provider=async context=>{contexts.push(context);return {text:JSON.stringify(context.phase==='robot_propose'?evals.modelPayloadFixtures.robot_fails:evals.modelPayloadFixtures.teach_qualified),actualModel:'stub',responseId:'stub',inputTokens:1,outputTokens:1};};
 const store=new Store(':memory:');try{
  const observed=observeProvider(provider);
  const app=createApp({store,provider:observed.provider,config:{mode:'live',model:'stub'}});
  const result=await executeLiveCases(app,selected,4,async p=>{updates.push([p.providerCalls,p.results.length]);},observed.take);
  expect(result.status).toBe('PASSED STRUCTURAL; HUMAN SEMANTIC REVIEW REQUIRED');expect(result.providerCalls).toBe(2);expect(updates).toEqual([[1,1],[2,2]]);
  expect(result.results[0].envelope?.sessionId).toBe(result.results[1].envelope?.sessionId);expect(result.results[1].envelope?.sessionRevision).toBe(2);
  expect(result.results[1].envelope?.proposalValidation.status).toBe('failed');expect(contexts[1]).toMatchObject({learnedRules:[],priorLessons:[],recentExchanges:[]});
  expect(result.results[1].providerObservations[0].lessonNote).toEqual(selected[1].body.ruleEvidence[0].lessonNote);
  expect(result.results[1].semanticReview).toBe('NOT REVIEWED');
 }finally{store.close();}
});
it('live evaluator stops after a provider failure and reports FAILED',async()=>{
 let calls=0;const provider:Provider=async()=>{calls++;throw new ProviderError('AI_NOT_CONFIGURED',503);};const store=new Store(':memory:');try{
  const result=await executeLiveCases(createApp({store,provider,config:{mode:'live',model:'stub'}}),buildLiveCases(),44);
  expect(result.status).toBe('FAILED');expect(calls).toBe(1);expect(result.results[0].status).toBe('FAIL');expect(result.results.slice(1).every(c=>c.status==='NOT RUN')).toBe(true);
 }finally{store.close();}
});
it('live evaluator enforces the explicit run budget before accepting another turn',async()=>{
 let calls=0;const provider:Provider=async()=>{calls++;return {text:JSON.stringify(evals.modelPayloadFixtures.teach_qualified),actualModel:'stub',responseId:'stub',inputTokens:1,outputTokens:1};};const store=new Store(':memory:');try{
  const result=await executeLiveCases(createApp({store,provider,config:{mode:'live',model:'stub'}}),buildLiveCases().filter(c=>c.sequence==='M01'),2);
  expect(result.status).toBe('PARTIAL');expect(calls).toBe(1);expect(result.results[1].status).toBe('NOT RUN');
 }finally{store.close();}
});
import {parseLiveOptions} from './live/options';
it('paid test options reject unknown, repeated and missing parameters',()=>{
 expect(parseLiveOptions(['--case','M01','--max-calls','4'])).toEqual({filter:'M01',maxProviderCalls:4,allowPaid:false,dryRun:false});
 expect(parseLiveOptions(['--allow-paid','--max-calls','12']).allowPaid).toBe(true);
 expect(parseLiveOptions(['--dry-run','--case','M04-LESSONS']).dryRun).toBe(true);
 for(const args of [
  ['--unknown'],['--case'],['--case','M01','--case','M02'],['--max-calls','1'],['--max-calls','999'],
  ['--max-calls','--case','M01'],['--allow-paid'],['--allow-paid','--dry-run','--max-calls','12']
 ])expect(()=>parseLiveOptions(args)).toThrow();
});

it('M04 lesson variants use identical math and separate sessions, with transcripts for manual review',async()=>{
 const cases=buildM04LessonCases();
 expect(selectLiveCases('M04-LESSONS')).toEqual(cases);
 expect(selectLiveCases('M04-B')).toEqual(cases.slice(2,4));
 const transfers=cases.filter(test=>test.body.sceneRole==='robot_transfer');
 const proofs=transfers.map(test=>{
  const {lessonNote,...proof}=test.body.ruleEvidence[0];
  expect(buildContext(test.body).context.lessonNote).toEqual(lessonNote);
  expect(lessonNote).toMatchObject({source:'skipped',pikoParaphrasePL:null,confirmation:'saved_by_player'});
  return proof;
 });
 expect(proofs.every(proof=>JSON.stringify(proof)===JSON.stringify(proofs[0]))).toBe(true);
 const observed=observeProvider(async context=>({
  text:JSON.stringify(context.phase==='robot_propose'?evals.modelPayloadFixtures.robot_fails:evals.modelPayloadFixtures.teach_ack),
  actualModel:'stub',responseId:'stub',inputTokens:1,outputTokens:1
 }));
 const store=new Store(':memory:');
 try{
  const app=createApp({store,provider:observed.provider,config:{mode:'live',model:'stub'}});
  const result=await executeLiveCases(app,cases,12,undefined,observed.take);
  expect(result.status).toBe('PASSED STRUCTURAL; HUMAN SEMANTIC REVIEW REQUIRED');
  expect(result.providerCalls).toBe(6);
  expect(new Set(result.results.map(turn=>turn.request.sessionId)).size).toBe(3);
  for(const [i,variant] of M04_LESSON_VARIANTS.entries()){
   const teach=result.results[i*2],transfer=result.results[i*2+1];
   expect(teach.request.userMessage).toBe(variant.explanationPL);
   expect(transfer.request.sessionId).toBe(teach.request.sessionId);
   expect(transfer.providerObservations[0].lessonNote?.explanationPL).toBe(variant.explanationPL);
   expect(transfer.providerObservations[0].response?.text).toBe(JSON.stringify(evals.modelPayloadFixtures.robot_fails));
   expect(transfer.semanticReview).toBe('NOT REVIEWED');
  }
 }finally{store.close();}
});

it('a valid envelope cannot pass structurally if the provider did not receive the note',async()=>{
 const observed=observeProvider(async context=>({
  text:JSON.stringify(context.phase==='robot_propose'?evals.modelPayloadFixtures.robot_fails:evals.modelPayloadFixtures.teach_ack),
  actualModel:'stub',responseId:'stub',inputTokens:1,outputTokens:1
 }));
 const store=new Store(':memory:');
 try{
  const provider:Provider=(context,...args)=>observed.provider({...context,lessonNote:null},...args);
  const app=createApp({store,provider,config:{mode:'live',model:'stub'}});
  const result=await executeLiveCases(app,selectLiveCases('M04-C'),4,undefined,observed.take);
  expect(result.status).toBe('FAILED');
  expect(result.results[1].checks).toContainEqual({name:'Provider received the exact confirmed lesson note',passed:false});
  expect(result.results[1].semanticReview).toBe('NOT REVIEWED');
 }finally{store.close();}
});

it('M04 demo labels scripted comments and keeps the same mechanical result for all three notes',()=>{
 const cases=buildM04LessonCases();
 const demos=cases.map(test=>demoTurn({...test.body,requestedMode:'demo'}));
 const teach=demos.filter((_,index)=>index%2===0);
 const transfer=demos.filter((_,index)=>index%2===1);
 for(const turn of demos){
  expect(turn.mode).toBe('demo');
  expect(turn.model.requestCount).toBe(0);
  expect(turn.learner?.explanationAssessment).toBe('not_applicable');
 }
 for(const turn of teach){
  expect(turn.learner).toEqual(teach[0].learner);
  expect(turn.learner?.utterancePL).toContain('przygotowany komentarz demonstracyjny');
 }
 for(const turn of transfer){
  expect(turn.learner).toEqual(transfer[0].learner);
  expect(turn.learner?.utterancePL).toContain('przygotowany lot demonstracyjny');
  expect(turn.proposalValidation).toEqual(transfer[0].proposalValidation);
 }
});
