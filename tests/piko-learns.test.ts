import {describe,it,expect} from 'vitest';
import {buildContext,checkModel,type LearnerRequest,type ModelPayload} from '@piko/contracts';
import data from '../content/missions.v1.json';
import {initialState,reducer,type GameState} from '../apps/web/src/state';

const run=(s:GameState)=>s.runs[s.missionId];
const evidenceFor=(index:number,explanationPL:string,pikoBeliefPL:string|null)=>{
 const m=data.missions[index],t=m.scenes.teach,w=t.witness;
 return {missionId:m.id,candidateExpression:w.expression,
  numericEvidence:t.gates.map(g=>({sceneId:`${m.id}-teach`,checkpointId:g.id as 'G1'|'G2',submittedY:(w.c2*g.x+w.c1)*g.x+w.c0})),
  lessonNote:{version:1 as const,ruleId:m.canonicalRuleId,explanationPL,pikoParaphrasePL:null,pikoBeliefPL,source:'skipped' as const,confirmation:'saved_by_player' as const}};
};
const transfer=(missionId:string,learnedRuleIds:string[],ruleEvidence:ReturnType<typeof evidenceFor>[]):LearnerRequest=>({
 schemaVersion:'1.0.0',sessionId:crypto.randomUUID(),sessionRevision:0,turnId:crypto.randomUUID(),missionId:missionId as LearnerRequest['missionId'],
 sceneRole:'robot_transfer',requestedMode:'live',phase:'robot_propose',userMessage:'',candidateExpression:null,attemptHistory:[],
 learnedRuleIds:learnedRuleIds as LearnerRequest['learnedRuleIds'],numericEvidence:[],ruleEvidence:ruleEvidence as LearnerRequest['ruleEvidence']});

describe('Piko w locie zna tylko lekcje gracza',()=>{
 it('ukrywa kanoniczną zasadę i przekazuje wcześniejsze lekcje jako dane',()=>{
  const m4=evidenceFor(3,'Plus w nawiasie przesuwa w prawo.','Myślę, że plus przesuwa parabolę w prawo.');
  const m3=evidenceFor(2,'Liczba na końcu podnosi parabolę.','Myślę, że liczba na końcu podnosi parabolę.');
  const {context}=buildContext(transfer('M04',['RULE_QUAD_VERTICAL','RULE_QUAD_HORIZONTAL'],[m3,m4]));
  expect(context.learnedRules).toEqual([]);
  expect(context.lessonNote?.pikoBeliefPL).toBe('Myślę, że plus przesuwa parabolę w prawo.');
  expect(context.priorLessons).toEqual([{missionId:'M03',explanationPL:'Liczba na końcu podnosi parabolę.',pikoBeliefPL:'Myślę, że liczba na końcu podnosi parabolę.'}]);
  expect(JSON.stringify(context)).not.toContain(data.missions[3].ruleText);
 });
 it('wymaga przekonania w lekcji i zabrania go w locie',()=>{
  const {context:robot}=buildContext(transfer('M04',['RULE_QUAD_HORIZONTAL'],[evidenceFor(3,'x','Myślę, że x.')]));
  const base:ModelPayload={utterancePL:'Spróbuję.',followUpPL:null,pikoBeliefPL:null,explanationAssessment:'not_applicable',proposedExpression:'0.25(x-2)^2',suggestedRuleId:null,usedFactIds:[],action:'propose_attempt'};
  expect(checkModel(base,robot)).toBe(true);
  expect(checkModel({...base,pikoBeliefPL:'Myślę, że coś.'},robot)).toBe(false);
 });
});

describe('pętla: popraw lekcję po porażce Piko',()=>{
 it('zapisuje przekonanie w notatce, wraca do lekcji i zaczyna lot od nowa',()=>{
  const m=data.missions[0],w=m.scenes.teach.witness,[g1,g2]=m.scenes.teach.gates;
  let s=reducer(initialState(),{type:'OPEN',page:'game'});
  s=reducer(s,{type:'EDIT',field:'expression',value:m.scenes.practice.witness.expression});s=reducer(s,{type:'CHECK'});s=reducer(s,{type:'NEXT'});
  s=reducer(s,{type:'EDIT',field:'expression',value:w.expression});
  s=reducer(s,{type:'EDIT',field:'prediction0',value:String(w.c0+w.c1*g1.x)});
  s=reducer(s,{type:'EDIT',field:'prediction1',value:String(w.c0+w.c1*g2.x)});
  s=reducer(s,{type:'CHECK'});
  s=reducer(s,{type:'EDIT',field:'explanation',value:'Stała zmienia nachylenie.'});
  run(s).lessonReply={text:'Rozumiem.',source:'live',assessment:'incorrect',belief:'Myślę, że stała zmienia nachylenie.'};
  s=reducer(s,{type:'CONFIRM_RULE'});
  expect(run(s).role).toBe('robot_transfer');
  expect(run(s).rule?.lessonNote?.pikoBeliefPL).toBe('Myślę, że stała zmienia nachylenie.');
  expect(run(s).lessonAttempts).toBe(1);
  // Piko poleciał i się rozbił; gracz wraca poprawić lekcję.
  Object.assign(run(s),{robotTurns:1,robotChecked:true,prediction:'Przeleci'});
  s=reducer(s,{type:'RETEACH'});
  expect(run(s).role).toBe('teach');
  s=reducer(s,{type:'EDIT',field:'explanation',value:'Liczba bez x ustawia wysokość całej linii.'});
  s=reducer(s,{type:'CONFIRM_RULE'});
  expect(run(s)).toMatchObject({role:'robot_transfer',lessonAttempts:2,robot:null,robotTurns:0,robotChecked:false,prediction:''});
  expect(run(s).rule?.lessonNote?.explanationPL).toBe('Liczba bez x ustawia wysokość całej linii.');
  expect(run(s).rule?.lessonNote?.pikoBeliefPL).toBeNull();
 });
});
