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
