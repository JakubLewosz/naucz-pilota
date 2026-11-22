import assert from 'node:assert/strict';
import {buildContext,checkModel,validateModel,type Context,type ModelPayload} from '@piko/contracts';
import {missionById} from '@piko/content';
import {evaluateScene,type Scene} from '@piko/core';
import {openAIProvider,ProviderError,type Provider} from '../../apps/server/src/provider';
import {buildM04LessonCases} from './cases';

export const seed=20261110;
const original=missionById('M04').scenes.robot_transfer;
const shiftedExpression=(vertex:number)=>`0.25(x-(${vertex}))^2`;
const rulePL='W y=a(x-p)^2+q współrzędna x wierzchołka to p. W nawiasie (x+b) punkt zerowania to x=-b, więc znak stałej dodanej do x wyznacza kierunek przesunięcia.';
export const historicalProposal='0.25*(x-2)^2';

function translated(delta:number){
 const shift=<T extends {x:number}>(point:T)=>({...point,x:point.x+delta});
 const initialExpression=shiftedExpression(-2+delta);
 const scene:Scene={
  ...original,initialExpression,start:shift(original.start),goal:shift(original.goal),gates:original.gates.map(shift),
  domain:{...original.domain,xMin:original.domain.xMin+delta,xMax:original.domain.xMax+delta},
  obstacles:original.obstacles.map(o=>({...o,xMin:o.xMin+delta,xMax:o.xMax+delta}))
 };
 return {id:`shift-${delta}`,scene,reference:shiftedExpression(2+delta),knownFailure:initialExpression};
}

function rebuilt(){
 const window=(x:number,center:number)=>({x,yMin:center-0.38,yMax:center+0.38});
 const initialExpression='0.5(x-1)^2+1';
 const scene:Scene={
  ...original,initialExpression,domain:{xMin:0,xMax:7,yMin:0,yMax:12},
  coefficientLocks:{c2:0.5},vertexLock:{y:1},
  start:window(0,9),goal:window(7,5.5),
  gates:[{id:'G1',...window(2,3)},{id:'G2',...window(5,1.5)}],
  obstacles:[{id:'O1',xMin:3.2,xMax:4.8,yMin:2,yMax:3}]
 };
 return {id:'rebuilt',scene,reference:'0.5(x-4)^2+1',knownFailure:initialExpression};
}

const offsets=[-7,-6,4,6,7];
const seededIndex=((Math.imul(seed,1664525)+1013904223)>>>0)%offsets.length;
export const geometries=[translated(-4),translated(3),translated(offsets[seededIndex]),rebuilt()];
const notes={
 A:'W (x+1) nawias zeruje się dla x=-1, więc wierzchołek jest po lewej; w (x-p) wierzchołek jest przy p.',
 B:'Plus w nawiasie zawsze przesuwa parabolę w prawo.',
 C:'abc',
 D:null
} as const;
const rubrics={
 A:'Wskaż poprawną metodę z notatki.',
 B:'Odrzuć błędny kierunek bez przypisywania poprawki graczowi.',
 C:'Wskaż brak użytecznej wskazówki.',
 D:'Skorzystaj z reguły bez przypisywania komukolwiek nieistniejącej notatki.'
} as const;
export type Condition=keyof typeof notes;

export function generalizationCases(){
 const transfer=buildM04LessonCases().find(item=>item.id==='M04-A-transfer')!.body;
 const {lessonNote,...proof}=transfer.ruleEvidence[0];
 assert.ok(lessonNote);
 return geometries.flatMap(geometry=>(Object.keys(notes) as Condition[]).map(condition=>{
  const explanation=notes[condition];
  const ruleEvidence=explanation===null?proof:{...proof,lessonNote:{...lessonNote,explanationPL:explanation}};
  const built=buildContext({...transfer,ruleEvidence:[ruleEvidence]});
  assert.deepEqual(built.context.lessonNote,explanation===null?null:{...lessonNote,explanationPL:explanation});
  assert.deepEqual(built.memory.learnedRuleIds,[lessonNote.ruleId]);
  const {scene}=geometry;
  // The tested geometry and symbolic statement are visible only in this harness.
  // Use the verified production rule ID and proof, without its numeric example.
  const context:Context={
   // Od promptu 2.0.0 Piko w locie nie dostaje kanonicznej zasady, tylko notatkę gracza.
   ...built.context,
   scene:{...built.context.scene,domain:scene.domain,start:scene.start,goal:scene.goal,
    gates:scene.gates,obstacles:scene.obstacles,coefficientLocks:scene.coefficientLocks,
    vertexLock:scene.vertexLock,initialExpression:scene.initialExpression}
  };
  return {geometry,condition,context,rubric:rubrics[condition]};
 }));
}

export type GeneralizationCase=ReturnType<typeof generalizationCases>[number];
export const model='gpt-6-luna';
export const reasoningEffort='xhigh';
export const maxOutputTokens=8192;
export const timeoutMs=90000;

export function mockProvider(test:GeneralizationCase,capture:(body:unknown)=>void=()=>{}){
 // Canned replies depend on the scene only, so A/B/C/D have no scripted effect.
 const {geometry}=test;
 const proposal=geometry.id==='rebuilt'?null:geometry===geometries[2]?geometry.knownFailure:geometry.reference;
 const payload:ModelPayload={
  utterancePL:'Przygotowana odpowiedź atrapy.',followUpPL:null,pikoBeliefPL:null,explanationAssessment:'not_applicable',
  proposedExpression:proposal,suggestedRuleId:null,usedFactIds:[],action:proposal?'propose_attempt':'acknowledge_uncertainty'
 };
 return openAIProvider('offline-only',model,maxOutputTokens,{reasoningEffort,baseURL:'http://127.0.0.1:1/v1',fetch:async(_input,init)=>{
  capture(JSON.parse(String(init?.body)));
  return new Response(JSON.stringify({
   id:'resp_mock',object:'response',model:'offline-stub',status:'completed',
   output:[{type:'message',role:'assistant',content:[{type:'output_text',text:JSON.stringify(payload),annotations:[]}]}]
  }),{headers:{'content-type':'application/json'}});
 }});
}

export async function evaluateTransfer(test:GeneralizationCase,provider:Provider,signal:AbortSignal){
 const base={geometry:test.geometry.id,condition:test.condition,lessonNote:test.context.lessonNote,
  rubric:test.rubric,semanticReview:'NOT REVIEWED'};
 try{
  const response=await provider(test.context,'',signal);
  let payload:unknown;
  try{payload=JSON.parse(response.text);}catch{payload=null;}
  const checked=checkModel(payload,test.context)?payload:null;
  const proposal=checked?.proposedExpression??null;
  const engine=proposal?evaluateScene(test.geometry.scene,proposal):null;
  return {...base,status:'completed',...response,schemaValid:validateModel(payload),accepted:checked!==null,proposal,engine};
 }catch(error){
  return {...base,status:error instanceof ProviderError?error.code:'HARNESS_ERROR',
   actualModel:null,text:null,schemaValid:false,accepted:false,proposal:null,engine:null};
 }
}
