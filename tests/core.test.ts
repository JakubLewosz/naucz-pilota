import {it,expect} from 'vitest';
import good from './good-parser.json';
import bad from './bad-parser.json';
import {evaluateScene,parseExpression,polynomialRange,roots,verifyNumericEvidence,type Scene} from '@piko/core';
import {missions} from '@piko/content';
for (const [exp,[c2,c1,c0]] of Object.entries(good)) it(`parser accepts ${exp}`,()=>expect(parseExpression(exp).coefficients).toEqual({c2,c1,c0}));
for (const exp of bad) it(`parser rejects ${exp}`,()=>expect(()=>parseExpression(exp)).toThrow());
const base:Scene={id:'test',title:'test',instruction:'test',role:'practice',domain:{xMin:0,xMax:4,yMin:-2,yMax:3},allowedFamilies:['constant','linear','quadratic'],coefficientLocks:{},start:{x:0,yMin:-0.5,yMax:0.5},goal:{x:4,yMin:-0.5,yMax:0.5},gates:[],obstacles:[],initialExpression:'0'};
it('includes internal vertex',()=>expect(polynomialRange({c2:1,c1:-2,c0:0},0,2)).toMatchObject({min:-1,max:0}));
it('detects contact on a thin obstacle analytically',()=>{
 const scene=structuredClone(base); scene.obstacles=[{id:'thin',xMin:1.500001,xMax:1.500002,yMin:0.12,yMax:1}];
 const r=evaluateScene(scene,'0'); expect(r.primaryCode).toBe('OBSTACLE_COLLISION');expect(r.firstPhysicalEvent?.x).toBeCloseTo(1.380001);
 scene.obstacles[0].yMin=0.120001;expect(evaluateScene(scene,'0').ok).toBe(true);
});
it('exact portal fit is allowed',()=>expect(evaluateScene({...base,start:{x:0,yMin:-0.12,yMax:0.12}},'0').ok).toBe(true));
it('detects out of bounds between valid endpoints',()=>expect(evaluateScene({...base,domain:{...base.domain,yMin:-0.8}},'0.25x^2-x').primaryCode).toBe('OUT_OF_BOUNDS'));
it('keeps primary priority separate from first physical event',()=>{
 const s={...base,obstacles:[{id:'early',xMin:0.5,xMax:0.6,yMin:-0.3,yMax:0.3}]};
 const r=evaluateScene(s,'0.4x^2');expect(r.primaryCode).toBe('OUT_OF_BOUNDS');expect(r.firstPhysicalEvent?.code).toBe('OBSTACLE_COLLISION');
});
it('stable quadratic roots',()=>expect(roots({c2:1,c1:-3,c0:2},0)).toEqual([1,2]));
it('normalizes exact cancellations and respects exponent precedence',()=>{
 expect(parseExpression('0.1x+0.2x-0.3x').family).toBe('constant');
 expect(()=>parseExpression('x*x*x-x*x*x')).toThrow();expect(()=>parseExpression('10001-10001+x')).toThrow();
});
it('requires two distinct scene-bound numeric predictions',()=>{
 const s=missions[0].scenes.teach, e=[{sceneId:s.id,checkpointId:'G1',submittedY:2},{sceneId:s.id,checkpointId:'G2',submittedY:2}];
 expect(verifyNumericEvidence(s,'2',e).qualified).toBe(true);
 expect(verifyNumericEvidence(s,'2',[e[0],e[0]]).qualified).toBe(false);
 expect(verifyNumericEvidence(s,'2',e.map(v=>({...v,sceneId:'M02-teach'}))).qualified).toBe(false);
});
