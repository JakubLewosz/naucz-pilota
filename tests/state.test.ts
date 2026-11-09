import {it,expect} from 'vitest';
import {initialState,reducer,loadState,persistState,SAVE_KEY,type GameState} from '../apps/web/src/state';
import {demoTurn,type LearnerRequest} from '@piko/contracts';
function reduce(s:GameState,...actions:Parameters<typeof reducer>[1][]){return actions.reduce(reducer,s);}
export function taughtM01(){let s=initialState();s=reduce(s,{type:'EDIT',field:'expression',value:'1'},{type:'CHECK'},{type:'NEXT'},{type:'EDIT',field:'expression',value:'2'},{type:'EDIT',field:'prediction0',value:'2'},{type:'EDIT',field:'prediction1',value:'2'},{type:'EDIT',field:'explanation',value:'Stała określa wysokość całego toru.'},{type:'CHECK'},{type:'CONFIRM_RULE'});return s;}
function humanState(){const s=taughtM01();s.runs.M01.unavailable=true;return reducer(s,{type:'NEXT'});}
it('M01 requires practice, repair, evidence, explanation and conscious canonical confirmation',()=>{
 let s=initialState();expect(reducer(s,{type:'NEXT'}).runs.M01.role).toBe('practice');
 s=taughtM01();expect(s.runs.M01.role).toBe('robot_transfer');expect(s.rules[0].candidateExpression).toBe('2');
});
it('immutable first parseable independent attempt, even wrong family, across reload and correction',()=>{
 let s=humanState();s=reduce(s,{type:'EDIT',field:'expression',value:'sin(x)'},{type:'CHECK'});expect(s.runs.M01.firstHuman).toBeNull();
 s=reduce(s,{type:'EDIT',field:'expression',value:'x'},{type:'CHECK'});const first=structuredClone(s.runs.M01.firstHuman);expect(first?.result.primaryCode).toBe('FAMILY_MISMATCH');
 s=reduce(s,{type:'EDIT',field:'expression',value:'-1'},{type:'CHECK'});expect(s.runs.M01.completed).toBe(true);expect(s.runs.M01.firstHuman).toEqual(first);
 const storage=new Map<string,string>();const fake={getItem:(k:string)=>storage.get(k)??null,setItem:(k:string,v:string)=>storage.set(k,v)} as unknown as Storage;
 persistState(fake,s);s=loadState(fake);expect(s.runs.M01.firstHuman).toEqual(first);
 s=reducer(s,{type:'REPLAY',id:'M01'});expect(s.archive.M01[0].firstHuman).toEqual(first);expect(s.runs.M01.firstHuman).toBeNull();
});
it('guards human journal before first attempt and flags later review',()=>{
 let s=humanState();expect(reducer(s,{type:'OPEN',page:'journal'}).page).not.toBe('journal');
 s=reduce(s,{type:'CHECK'},{type:'OPEN',page:'journal'});expect(s.runs.M01.afterReview).toBe(true);
});
it('ignores stale AI after edit or navigation',()=>{
 let s=taughtM01();const turnId=crypto.randomUUID(),revision=s.viewRevision;
 s=reducer(s,{type:'AI_START',turnId});s=reducer(s,{type:'OPEN',page:'missions'});
 const request={schemaVersion:'1.0.0',sessionId:crypto.randomUUID(),sessionRevision:0,turnId,missionId:'M01',sceneRole:'robot_transfer',requestedMode:'demo',phase:'robot_propose',candidateExpression:null,userMessage:'',numericEvidence:[],attemptHistory:[],ruleEvidence:[],learnedRuleIds:[]} as LearnerRequest;
 s=reducer(s,{type:'AI_RESULT',turnId,revision,sceneId:'M01-robot_transfer',envelope:demoTurn(request)});expect(s.runs.M01.robot).toBeNull();
});
it('unknown save is preserved until explicit recovery',()=>{
 const original=JSON.stringify({saveVersion:99});let raw=original;const fake={getItem:()=>raw,setItem:(_k:string,v:string)=>{raw=v;}} as unknown as Storage;
 const s=loadState(fake);expect(s.recovery).toBeTruthy();persistState(fake,s);expect(raw).toBe(original);expect(SAVE_KEY).toBeTruthy();
});

function transferRequest(turnId:string,mode:'demo'|'live'='live'):LearnerRequest{
 return {schemaVersion:'1.0.0',sessionId:crypto.randomUUID(),sessionRevision:0,turnId,
  missionId:'M01',sceneRole:'robot_transfer',requestedMode:mode,phase:'robot_propose',
  candidateExpression:null,userMessage:'',numericEvidence:[],attemptHistory:[],ruleEvidence:[],learnedRuleIds:[]};
}
function startTurn(s:GameState){
 const turnId=crypto.randomUUID(),revision=s.viewRevision;
 return {started:reducer(s,{type:'AI_START',turnId}),turnId,revision};
}
function failTransfer(s:GameState,kind:'transport'|'envelope'){
 const {started,turnId,revision}=startTurn(s);
 if(kind==='transport')return reducer(started,{type:'AI_ERROR',turnId,revision,message:'Błąd sieci'});
 const envelope={...demoTurn(transferRequest(turnId)),mode:'unavailable' as const,learner:null};
 return reducer(started,{type:'AI_RESULT',turnId,revision,sceneId:'M01-robot_transfer',envelope});
}
function roundTrip(s:GameState){
 let saved='';
 const storage={getItem:()=>saved,setItem:(_key:string,value:string)=>{saved=value;},removeItem:()=>{}};
 expect(persistState(storage,s)).toBeNull();
 const restored=loadState(storage);
 expect(restored.recovery).toBeNull();
 return restored;
}

for(const kind of ['transport','envelope'] as const)it(`two ${kind} failures preserve proposals and allow demo or skip after reload`,()=>{
 let s=reducer(taughtM01(),{type:'MODE',mode:'live'});
 s=roundTrip(failTransfer(failTransfer(s,kind),kind));
 expect(s.runs.M01).toMatchObject({robotTurns:0,robotFailures:2,robot:null});
 expect(reducer(s,{type:'AI_START',turnId:crypto.randomUUID()})).toEqual(s);
 expect(reducer(s,{type:'NEXT'}).runs.M01.role).toBe('human_check');
 s=reducer(s,{type:'MODE',mode:'demo'});
 const {started,turnId,revision}=startTurn(s);
 s=reducer(started,{type:'AI_RESULT',turnId,revision,sceneId:'M01-robot_transfer',envelope:demoTurn(transferRequest(turnId,'demo'))});
 expect(s.mode).toBe('demo');
 expect(s.runs.M01).toMatchObject({robotTurns:1,robotFailures:2,robot:{mode:'demo'}});
});
it('successful live retry restores live status and keeps the failed request separate from proposals',()=>{
 const failed=failTransfer(reducer(taughtM01(),{type:'MODE',mode:'live'}),'transport');
 const {started,turnId,revision}=startTurn(failed);
 const envelope={...demoTurn(transferRequest(turnId)),mode:'live' as const};
 const s=reducer(started,{type:'AI_RESULT',turnId,revision,sceneId:'M01-robot_transfer',envelope});
 expect(s).toMatchObject({mode:'live',error:''});
 expect(s.runs.M01).toMatchObject({robotTurns:1,robotFailures:1,unavailable:false});
 expect(s.runs.M01.messages.at(-1)?.source).toBe('live');
});
it('confirmed lesson survives reload; skipping paraphrase records the wording without assessing it',()=>{
 const s=roundTrip(taughtM01());
 expect(s.rules[0].lessonNote).toMatchObject({
  version:1,ruleId:'RULE_LINE_INTERCEPT',explanationPL:'Stała określa wysokość całego toru.',
  pikoParaphrasePL:null,source:'skipped',confirmation:'saved_by_player'
 });
 expect(s.runs.M01.rule).toEqual(s.rules[0]);
});
it('an edit after Piko replies removes the stale paraphrase from the new lesson',()=>{
 let s=reduce(initialState(),{type:'EDIT',field:'expression',value:'1'},{type:'CHECK'},{type:'NEXT'},
  {type:'EDIT',field:'expression',value:'2'},{type:'EDIT',field:'prediction0',value:'2'},
  {type:'EDIT',field:'prediction1',value:'2'},{type:'EDIT',field:'explanation',value:'Poprzednie słowa.'},{type:'CHECK'});
 const {started,turnId,revision}=startTurn(s);
 const request:LearnerRequest={...transferRequest(turnId,'demo'),sceneRole:'teach',phase:'teach_explain',userMessage:'Poprzednie słowa.'};
 s=reducer(started,{type:'AI_RESULT',turnId,revision,sceneId:'M01-teach',envelope:demoTurn(request)});
 expect(s.runs.M01.lessonReply?.source).toBe('demo');
 s=reduce(s,{type:'EDIT',field:'explanation',value:'abc'},{type:'CONFIRM_RULE'});
 expect(s.rules[0].lessonNote).toMatchObject({explanationPL:'abc',pikoParaphrasePL:null,source:'skipped'});
 expect(s.runs.M01.role).toBe('robot_transfer');
});
for(const damage of ['rules','archive','messages','counts'] as const)it(`rejects damaged nested ${damage} and preserves the original`,()=>{
 const s=taughtM01();
 const broken=structuredClone(s) as unknown as Record<string,unknown>;
 if(damage==='rules')broken.rules=[null];
 if(damage==='archive')broken.archive={M01:[null]};
 if(damage==='messages')(broken.runs as {M01:Record<string,unknown>}).M01.messages=[null];
 if(damage==='counts')(broken.runs as {M01:Record<string,unknown>}).M01.counts={practice:'1'};
 const raw=JSON.stringify(broken);
 let written=false;
 const storage={getItem:()=>raw,setItem:()=>{written=true;},removeItem:()=>{}};
 const recovered=loadState(storage);
 expect(recovered.recovery).toBe('Uszkodzony zapis');
 persistState(storage,recovered);
 expect(written).toBe(false);
});
it('storage read errors enter recovery without trying to persist over the save',()=>{
 let written=false;
 const storage={getItem:()=>{throw new Error('blocked');},setItem:()=>{written=true;},removeItem:()=>{}};
 const s=loadState(storage);
 expect(s.recovery).toMatch(/odczytać/);
 persistState(storage,s);
 expect(written).toBe(false);
});
it('migrates v1 including first human attempt and a transfer blocked by old failure counting',()=>{
 const current=reduce(humanState(),{type:'EDIT',field:'expression',value:'0'},{type:'CHECK'});
 const makeV1=(s:GameState)=>JSON.stringify({...s,saveVersion:1},(key,v)=>
  ['robotFailures','lessonReply','liveChat','lessonNote'].includes(key)?undefined:v);
 const storage={getItem:()=>makeV1(current),setItem:()=>{},removeItem:()=>{}};
 const s=loadState(storage);
 expect(s.saveVersion).toBe(2);
 expect(s.recovery).toBeNull();
 expect(s.runs.M01.firstHuman).toEqual(current.runs.M01.firstHuman);
 expect(s.rules[0].lessonNote).toBeUndefined();
 const blocked=taughtM01();
 blocked.runs.M01.robotTurns=2;
 const migrated=loadState({...storage,getItem:()=>makeV1(blocked)});
 expect(migrated.runs.M01).toMatchObject({robotTurns:0,robotFailures:2});
 expect(startTurn(migrated).started.busy).toBe(true);
});
