import {it,expect} from 'vitest';
import {createApp} from '../apps/server/src/app';
import {Store} from '../apps/server/src/store';
import {ProviderError,type Provider} from '../apps/server/src/provider';
import {buildLiveCases} from './live/cases';
import {executeLiveCases} from './live/runner';
import evals from '../content/ai-evals.v1.json';
it('live evaluator groups 22 cases and keeps teach/transfer in the same session',async()=>{
 const cases=buildLiveCases();expect(cases).toHaveLength(22);const selected=cases.filter(c=>c.sequence==='M01'),contexts:unknown[]=[];
 const provider:Provider=async context=>{contexts.push(context);return {text:JSON.stringify(context.phase==='robot_propose'?evals.modelPayloadFixtures.robot_fails:evals.modelPayloadFixtures.teach_qualified),actualModel:'stub',responseId:'stub',inputTokens:1,outputTokens:1};};
 const store=new Store(':memory:');try{
  const app=createApp({store,provider,config:{mode:'live',model:'stub'}}),result=await executeLiveCases(app,selected,4);
  expect(result.status).toBe('PASSED STRUCTURAL; HUMAN SEMANTIC REVIEW REQUIRED');expect(result.providerCalls).toBe(2);
  expect(result.results[0].envelope?.sessionId).toBe(result.results[1].envelope?.sessionId);expect(result.results[1].envelope?.sessionRevision).toBe(2);
  expect(result.results[1].envelope?.proposalValidation.status).toBe('failed');expect(contexts[1]).toMatchObject({learnedRules:[{id:'RULE_LINE_INTERCEPT'}],recentExchanges:[]});
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
 expect(parseLiveOptions(['--case','M01','--max-calls','4'])).toEqual({filter:'M01',maxProviderCalls:4});
 for(const args of [['--unknown'],['--case'],['--case','M01','--case','M02'],['--max-calls','1'],['--max-calls','999'],['--max-calls','--case','M01']])expect(()=>parseLiveOptions(args)).toThrow();
});
