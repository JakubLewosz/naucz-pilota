import {describe,it,expect} from 'vitest';
import data from '../content/missions.v1.json';
import {initialState,reducer,type GameState} from '../apps/web/src/state';
import {nextStep,prettyFormula,teachChecklist} from '../apps/web/src/guidance';

const run=(s:GameState)=>s.runs[s.missionId];
const edit=(s:GameState,field:'expression'|'explanation'|'prediction0'|'prediction1',value:string)=>reducer(s,{type:'EDIT',field,value});

describe('nextStep prowadzi gracza przez misję 1',()=>{
 it('od pierwszego lotu do zapisu notatki',()=>{
  const m=data.missions[0];
  let s=reducer(initialState(),{type:'OPEN',page:'game'});
  expect(nextStep(s,run(s))).toMatch(/kliknij „Leć”/);
  s=edit(s,'expression','5');s=reducer(s,{type:'CHECK'});
  expect(nextStep(s,run(s))).toMatch(/nie udał/);
  s=edit(s,'expression',m.scenes.practice.witness.expression);s=reducer(s,{type:'CHECK'});
  expect(nextStep(s,run(s))).toMatch(/Teraz naucz Piko/);
  s=reducer(s,{type:'NEXT'});
  // Błędny lot Piko pokazuje się od razu po wejściu w lekcję.
  expect(run(s).attempts.teach?.[0]?.source).toBe('demo');
  expect(nextStep(s,run(s))).toMatch(/Sprawdź naprawę/);
  s=edit(s,'expression','2*x');s=reducer(s,{type:'CHECK'});
  expect(nextStep(s,run(s))).toMatch(/jeszcze nie prowadzi|nie pokazuje zasady/);
  s=edit(s,'expression',m.scenes.teach.witness.expression);s=reducer(s,{type:'CHECK'});
  // Prognozy w bramkach liczy gra.
  expect(run(s).predictions.every(p=>p!=='')).toBe(true);
  expect(nextStep(s,run(s))).toMatch(/Wyjaśnij Piko/);
  expect(teachChecklist(s,run(s)).map(i=>i.done)).toEqual([true,false,false]);
 });
 it('samodzielna próba i ukończenie',()=>{
  const s=initialState();const r=run(s);r.role='human_check';
  expect(nextStep(s,r)).toMatch(/Liczy się pierwsza próba/);
  r.completed=true;
  expect(nextStep(s,r)).toMatch(/Zobacz podsumowanie/);
 });
});

describe('prettyFormula',()=>{
 it('zapisuje wzór jak w zeszycie',()=>{
  expect(prettyFormula('0.25(x+1)^2')).toBe('0,25(x + 1)²');
  expect(prettyFormula('y=2*x-3')).toBe('2·x − 3');
  expect(prettyFormula('-x^2+1')).toBe('-x² + 1');
 });
});
