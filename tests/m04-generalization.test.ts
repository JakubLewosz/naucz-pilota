import {expect,it} from 'vitest';
import Ajv2020 from 'ajv/dist/2020.js';
import {evaluateScene} from '@piko/core';
import {geometries,generalizationCases,evaluateTransfer,historicalProposal,mockProvider} from './live/m04-generalization';

for(const geometry of geometries)it(`M04 ${geometry.id} has a safe reference and a known start miss`,()=>{
 const success=evaluateScene(geometry.scene,geometry.reference);
 expect(success.primaryCode).toBe('SUCCESS');
 expect(success.checkpoints).toHaveLength(4);
 expect(success.checkpoints.every(point=>point.passed)).toBe(true);
 expect(evaluateScene(geometry.scene,geometry.knownFailure).primaryCode).toBe('START_MISS');
 expect(evaluateScene(geometry.scene,historicalProposal).ok).toBe(false);
});

const cases=generalizationCases();
for(const item of cases)it(`M04 ${item.geometry.id} ${item.condition} isolates the note and preserves the SDK reply`,async()=>{
 const control=cases.find(other=>other.geometry===item.geometry&&other.condition==='D')!;
 const {lessonNote,recentExchanges,priorLessons,...trusted}=item.context;
 expect({...trusted,recentExchanges,priorLessons,lessonNote:null}).toEqual(control.context);
 expect(priorLessons).toEqual([]);
 expect(recentExchanges).toEqual([]);
 // Piko zna tylko notatkę gracza; kanoniczna zasada nie trafia do kontekstu lotu.
 expect(item.context.learnedRules).toEqual([]);
 expect(item.context.facts).toEqual([]);
 expect(item.context.candidate).toBeNull();

 const requests:unknown[]=[];
 const result=await evaluateTransfer(item,mockProvider(item,body=>requests.push(body)),new AbortController().signal);
 expect(requests).toHaveLength(1);
 const body=requests[0] as {
  input:{role:string;content:string}[];instructions:string;text:{format:{schema:object}}
 };
 expect(body).toMatchObject({model:'gpt-6-luna',reasoning:{effort:'xhigh'},max_output_tokens:8192,store:false,
  text:{format:{type:'json_schema',strict:true}}});
 expect(JSON.parse(body.input[0].content)).toEqual(trusted);
 expect(body.input.filter(entry=>entry.content.includes('untrustedLessonNote'))).toEqual(lessonNote
  ?[{role:'user',content:JSON.stringify({untrustedLessonNote:lessonNote})}]:[]);
 expect(JSON.stringify(body)).not.toMatch(/witness|knownFailures|human_check|\bSTART_MISS\b|\bshift--?\d|\brebuilt\b/);
 expect(JSON.stringify(body)).not.toContain(item.geometry.reference);
 expect(JSON.stringify(body)).not.toContain(historicalProposal);
 expect(body.instructions).toContain('Stosuj lekcję wiernie');
 expect(result).toMatchObject({actualModel:'offline-stub',schemaValid:true,accepted:true,semanticReview:'NOT REVIEWED'});
 expect(new Ajv2020({strict:false}).validate(body.text.format.schema,JSON.parse(result.text!))).toBe(true);
 const expected=item.geometry.id==='rebuilt'?null:item.geometry===geometries[2]?'START_MISS':'SUCCESS';
 expect(result.engine?.primaryCode??null).toBe(expected);
 if(expected==='START_MISS')expect(result.proposal).toBe(item.geometry.knownFailure);
});
