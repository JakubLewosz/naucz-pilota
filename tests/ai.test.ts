import {it,expect,afterEach} from 'vitest';
import request from 'supertest';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import evals from '../content/ai-evals.v1.json';
import {createApp} from '../apps/server/src/app';
import {Store} from '../apps/server/src/store';
import {ProviderError,type Provider,type ProviderResult} from '../apps/server/src/provider';
import {buildContext,validateModel,checkModel,type Context,type Envelope,type LearnerRequest} from '@piko/contracts';
import {initialState,newRun,reducer,type GameState} from '../apps/web/src/state';
const stores:Store[]=[];afterEach(()=>{for(const s of stores.splice(0))s.close();});
const fixtures:Record<string,unknown>={...evals.modelPayloadFixtures,...evals.intentionallyInvalidModelPayloadFixtures};
const result=(payload:unknown):ProviderResult=>({text:JSON.stringify(payload),actualModel:'mock-model',responseId:'mock-response',inputTokens:10,outputTokens:20});
const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
const semantic=evals.cases.filter(c=>c.kind==='semantic');
it('10 semantic evals are valid inputs, NOT evidence of live quality',()=>{
 for(const c of semantic){const r=c.request as LearnerRequest;expect(()=>buildContext(r)).not.toThrow();}
});
for(const c of evals.cases.filter(c=>c.id.startsWith('INT')&&c.id!=='INT14'))it(`${c.id} ${c.titlePL}`,async()=>{
 const scenario=c.providerScenario as {type:string;fixtureIds?:string[];fixtureId?:string;transportTransform?:string;items?:{fixtureId:string;delayMs:number}[]};
 let calls=0;const contexts:Context[]=[];
 const provider:Provider=async(context,_message,_signal)=>{
  contexts.push(structuredClone(context));const i=calls++;
  if(scenario.type==='must_not_call'||scenario.type==='no_api_key'||scenario.type==='session_quota_already_used'||scenario.type==='daily_budget_exhausted_after_restart')throw new Error('Unexpected provider call');
  if(scenario.type==='timeout')return new Promise(()=>{});
  if(scenario.type==='provider_incomplete')throw new ProviderError('AI_INCOMPLETE',502);
  if(scenario.type==='provider_refusal')throw new ProviderError('AI_REFUSED',422);
  if(scenario.type==='delayed_mock_payload')await sleep(25);
  if(scenario.type==='timed_output_sequence'){await sleep(i===0?60:60);return result(fixtures[scenario.items![i].fixtureId]);}
  return result(fixtures[scenario.fixtureIds?.[i]??scenario.fixtureId??'teach_ack']);
 };
 const store=new Store(':memory:');stores.push(store);
 const app=createApp({store,provider:scenario.type==='no_api_key'?undefined:provider,config:{mode:'live',model:'mock-model',timeoutMs:scenario.type==='timed_output_sequence'?90:scenario.type==='timeout'?25:500,dailyBudget:scenario.type==='daily_budget_exhausted_after_restart'?0:200}});
 const session=await request(app).post('/api/session').send({});const cookie=session.headers['set-cookie'];
 const req={...c.request,sessionId:session.body.sessionId,sessionRevision:0,turnId:crypto.randomUUID()};
 if(scenario.type==='session_quota_already_used')for(let i=0;i<6;i++)store.db.prepare('INSERT INTO turns VALUES(?,?,?,\'done\',NULL,?)').run(req.sessionId,crypto.randomUUID(),'hash',Date.now());
 const post=(body:object=req)=>request(app).post('/api/learner-turn').set('Cookie',cookie).send(body);
 let response,second;
 if(c.id==='INT11'){
  const first=post().then(r=>r);await sleep(10);second=await post({...req,turnId:crypto.randomUUID()});response=await first;
 }else if(scenario.transportTransform){const str=JSON.stringify(req);response=await request(app).post('/api/learner-turn').set('Cookie',cookie).set('Content-Type','application/json').send(str+' '.repeat(16385-Buffer.byteLength(str)));}
 else response=await post();
 if(c.id==='INT12')second=await post();
 if(c.id==='INT13')second=await post({...req,userMessage:'Inne body'});
 const body=response.body as Envelope,ctx=contexts.at(-1);
 const model=body.learner;
 const memory=body.memory;
 const noMutation=()=>{expect(model).not.toHaveProperty('success');expect(model).not.toHaveProperty('score');expect(model).not.toHaveProperty('unlock');};
 for(const a of c.assertions){const expected='expected'in a?a.expected:undefined;
  switch(a.id){
   case 'http_status':expect(response.status).toBe(expected);break;
   case 'provider_calls':case 'total_provider_calls':expect(calls).toBe(expected);break;
   case 'error_code':expect(body.error?.code).toBe(expected);break;
   case 'mode':expect(body.mode).toBe(expected);break;
   case 'proposal_expression_exact':expect(model?.proposedExpression).toBe(expected);break;
   case 'proposal_validation':expect(body.proposalValidation?.status).toBe(expected);break;
   case 'proposal_failure_code':expect(body.proposalValidation.failureCode).toBe(expected);break;
   case 'learner_is_null':expect(model).toBeNull();break;
   case 'proposal_is_null':expect(model?.proposedExpression).toBeNull();break;
   case 'qualified_contains':expect(memory.qualifiedRuleIds).toContain(expected);break;
   case 'qualified_does_not_contain':expect(memory.qualifiedRuleIds).not.toContain(expected);break;
   case 'learned_does_not_contain':expect(memory.learnedRuleIds).not.toContain(expected);break;
   case 'no_new_qualified_rule':expect(memory?.newlyQualifiedRuleIds??[]).toEqual([]);break;
   case 'context_learned_rules_exact':expect(ctx?.learnedRules.map(r=>r.id)).toEqual(expected);break;
   case 'rejected_evidence_missions':expect(memory.rejectedEvidenceMissionIds).toEqual(expected);break;
   case 'engine_numeric_facts_are':expect(ctx?.facts.filter(f=>['F_CANDIDATE_G1_VALUE','F_CANDIDATE_G2_VALUE'].includes(f.id)).map(f=>(f.value as {y:number}).y)).toEqual(expected);break;
   case 'context_scene_id':expect(ctx?.scene.id).toBe(expected);break;
   case 'context_forbidden_keys_absent':for(const key of expected as string[])expect(JSON.stringify(ctx)).not.toContain(`"${key}"`);break;
   case 'context_no_future_geometry':expect(ctx?.scene.id).toBe(`${req.missionId}-${req.sceneRole}`);expect(ctx).not.toHaveProperty('missions');break;
   case 'no_cross_scene_chat_history':expect(ctx?.recentExchanges).toEqual([]);break;
   case 'used_fact_ids_exist':expect(model?.usedFactIds.every(id=>ctx?.facts.some(f=>f.id===id))).toBe(true);break;
   case 'model_schema_valid':expect(validateModel(model)).toBe(true);break;
   case 'forbidden_model_keys_absent':for(const key of expected as string[])expect(model).not.toHaveProperty(key);break;
   case 'no_llm_game_mutation':noMutation();break;
   case 'no_automatic_math_retry':case 'no_refusal_bypass_retry':case 'no_second_provider_call':expect(calls).toBe(1);break;
   case 'no_third_provider_call':expect(calls).toBeLessThanOrEqual(2);break;
   case 'no_automatic_demo':expect(body.mode).toBe('unavailable');expect(model).toBeNull();break;
   case 'no_witness_substitution':expect(JSON.stringify(ctx)).not.toMatch(/witness|knownFailures/);if(c.id==='INT02')expect(model?.proposedExpression).toBe('1');break;
   case 'second_http_status':expect(second?.status).toBe(expected);break;
   case 'response_envelopes_equal':expect(second?.body).toEqual(body);break;
   case 'revision_increments_once':expect((await request(app).post('/api/session').set('Cookie',cookie).send({})).body.sessionRevision).toBe(1);break;
   case 'no_duplicate_daily_charge':expect(store.db.prepare('SELECT count FROM budget').get()?.count).toBe(1);break;
   case 'daily_reservation_retained':expect(store.db.prepare('SELECT count FROM budget').get()?.count).toBe(1);break;
   case 'provider_metadata_null':expect(body.model).toMatchObject({provider:null,configuredModel:null,actualModel:null,providerResponseId:null,inputTokens:null,outputTokens:null});break;
   case 'not_counted_as_live_eval':case 'demo_label_visible':expect(body.mode).toBe('demo');expect(body.model.requestCount).toBe(0);break;
   case 'no_partial_json_rendered':expect(body.learner).toBeNull();break;
   case 'total_duration_ms_at_most':expect(body.model.latencyMs).toBeLessThanOrEqual(150);break;
   case 'context_contains_recomputed_attempt':expect(ctx?.facts.some(f=>f.subject===expected&&f.id.startsWith('F_HISTORY_'))).toBe(true);break;
   case 'can_continue_to_human_check':{
    let state=initialState();state.runs.M01.role='robot_transfer';state={...state,activeTurnId:req.turnId,viewRevision:0};
    state=reducer(state,{type:'AI_RESULT',turnId:req.turnId,revision:0,sceneId:'M01-robot_transfer',envelope:body});state=reducer(state,{type:'NEXT'});expect(state.runs.M01.role).toBe('human_check');break;
   }
   case 'human_first_attempt_not_changed':expect(initialState().runs.M01.firstHuman).toBeNull();break;
   case 'no_code_execution':expect((globalThis as Record<string,unknown>).pwned).toBeUndefined();break;
   case 'model_comment_label_visible':expect(body.learner?.utterancePL).toBeTruthy();expect(ctx?.facts).toBeTruthy();break;
   case 'first_robot_result_preserved':expect(ctx?.facts.some(f=>f.subject==='1'&&f.kind==='validation'&&f.value==='START_MISS')).toBe(true);break;
   default:throw new Error(`Unimplemented assertion ${a.id}`);
  }
 }
});
it('INT14 late reply cannot overwrite human scene or first independent result',()=>{
 const s:GameState=initialState();s.runs.M01=newRun('M01');s.runs.M01.role='human_check';s.viewRevision=5;
 const envelope={} as Envelope;expect(reducer(s,{type:'AI_RESULT',turnId:'old',revision:4,sceneId:'M01-robot_transfer',envelope})).toEqual(s);
});
it('durable atomic budget survives restart and cannot be overspent',async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'piko-budget-'));try{
  let s=new Store(path.join(dir,'state.sqlite'));expect(s.reserve(2)).toBe(true);s.close();s=new Store(path.join(dir,'state.sqlite'));
  const results=await Promise.all(Array.from({length:8},async()=>s.reserve(2)));expect(results.filter(Boolean)).toHaveLength(1);s.close();
 }finally{rmSync(dir,{recursive:true,force:true});}
});
it('rejects unauthorized session and wrong origin before provider',async()=>{
 const store=new Store(':memory:');stores.push(store);const app=createApp({store});
 expect((await request(app).post('/api/learner-turn').send({})).status).toBe(401);
 expect((await request(app).post('/api/session').set('Origin','https://untrusted.example').send({})).status).toBe(403);
});
it('response schema, fact membership and phase are enforced independently',()=>{
 const req=evals.cases[0].request as LearnerRequest;const {context}=buildContext(req);
 expect(checkModel({...fixtures.teach_ack as object,usedFactIds:['invented']},context)).toBe(false);
 expect(checkModel({...fixtures.teach_ack as object,score:100},context)).toBe(false);
});

const repairRequest=semantic.find(c=>c.id==='SEM01')!.request as LearnerRequest;
function confirmedEvidence(explanationPL:string):LearnerRequest['ruleEvidence'][number]{
 return {
  missionId:'M01',candidateExpression:'2',numericEvidence:[
   {sceneId:'M01-teach',checkpointId:'G1',submittedY:2},
   {sceneId:'M01-teach',checkpointId:'G2',submittedY:2}
  ],
  lessonNote:{version:1,ruleId:'RULE_LINE_INTERCEPT',explanationPL,pikoParaphrasePL:'Spróbuję użyć wyjaśnienia.',source:'live',confirmation:'saved_by_player'}
 };
}
function transferRequest(evidence:LearnerRequest['ruleEvidence'][number]):LearnerRequest{
 return {...repairRequest,sceneRole:'robot_transfer',phase:'robot_propose',userMessage:'',candidateExpression:null,
  attemptHistory:[],numericEvidence:[],learnedRuleIds:['RULE_LINE_INTERCEPT'],ruleEvidence:[evidence]};
}
it.each(['Stała przesuwa cały poziomy tor.','Zmieniam stałą.','Stała zmienia nachylenie.'])('lesson preserves wording independently of verified math: %s',explanation=>{
 const evidence=confirmedEvidence(explanation);
 const {lessonNote,...proof}=evidence;
 const without=buildContext(transferRequest(proof)).context;
 const withNote=buildContext(transferRequest(evidence)).context;
 expect(without.lessonNote).toBeNull();
 expect(withNote.lessonNote).toEqual(lessonNote);
 expect(withNote.learnedRules).toEqual(without.learnedRules);
 expect(withNote.learnedRules[0].textPL).not.toBe('Stała zmienia nachylenie.');
 expect(withNote.facts).toEqual(without.facts);
 expect(withNote.scene.id).toBe('M01-robot_transfer');
 expect(JSON.stringify(withNote)).not.toMatch(/human_check|witness|knownFailures/);
 const invalid={...evidence,candidateExpression:'99'};
 expect(buildContext(transferRequest(invalid)).context).toMatchObject({lessonNote:null,learnedRules:[]});
});
it('clearing a live teach conversation removes exchanges and cached output, but keeps evidence and the request count',async()=>{
 const store=new Store(':memory:');stores.push(store);
 const seen:Context[]=[];
 const provider:Provider=async context=>{seen.push(context);return result(fixtures.teach_ack);};
 const app=createApp({store,provider,config:{mode:'live',model:'stub'}});
 const desktop=request.agent(app);
 const session=(await desktop.post('/api/session').set('Origin','app://piko').set('X-Piko-Desktop','1').send({})).body;
 const sessionHeaders={Authorization:`Bearer ${session.token}`,Origin:'app://piko','X-Piko-Desktop':'1'};
 const evidence=confirmedEvidence('Moje potwierdzone słowa.');
 const first={...repairRequest,sessionId:session.sessionId,sessionRevision:0,turnId:crypto.randomUUID(),userMessage:'Tekst do wyczyszczenia',ruleEvidence:[evidence]};
 const send=(body:LearnerRequest)=>desktop.post('/api/learner-turn').set(sessionHeaders).send(body);
 expect((await send(first)).status).toBe(200);
 const second={...first,sessionRevision:1,turnId:crypto.randomUUID(),userMessage:'Jeszcze jedna wiadomość'};
 expect((await send(second)).status).toBe(200);
 expect(seen[1].recentExchanges[0].userPL).toBe(first.userMessage);
 const other=request.agent(app);
 const otherSession=(await other.post('/api/session').send({})).body;
 expect((await other.post('/api/learner-turn').send({...first,sessionId:otherSession.sessionId,ruleEvidence:[]})).status).toBe(200);
 expect(seen[2].recentExchanges).toEqual([]);
 const reset=await desktop.post('/api/conversation/reset').set(sessionHeaders).send({sceneId:'M01-teach'});
 expect(reset.body).toEqual({ok:true});
 expect(store.recentCount(session.sessionId)).toBe(2);
 expect(store.authenticate(session.token)?.evidence[0]).toMatchObject({missionId:'M01',candidateExpression:'2'});
 expect(store.getTurn(session.sessionId,first.turnId)?.response).toBeNull();
 expect((await send(first)).body.error.code).toBe('CONVERSATION_CLEARED');
 expect((await send({...second,turnId:crypto.randomUUID(),sessionRevision:2})).body.error.code).toBe('STALE_SESSION_REVISION');
 expect((await send({...second,turnId:crypto.randomUUID(),sessionRevision:3,ruleEvidence:[]})).status).toBe(200);
 expect(seen.at(-1)?.recentExchanges).toEqual([]);
});
