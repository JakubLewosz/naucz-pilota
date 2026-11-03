import { describe,it,expect } from 'vitest';
import data from '../content/missions.v1.json';
import publicData from '../packages/content/generated/public-missions.json';
import schema from '../content/missions.schema.json';
import Ajv2020 from 'ajv/dist/2020.js';
import { evaluateScene,parseExpression,type Scene } from '@piko/core';
describe('authoring corpus in production TypeScript engine',()=>{
 it('validates schema and keeps reference answers out of public data',()=>{
  const ajv=new Ajv2020({strict:false}); expect(ajv.validate(schema,data),JSON.stringify(ajv.errors)).toBe(true);
  expect(JSON.stringify(publicData)).not.toMatch(/witness|knownFailures/);
  expect(data.missions).toHaveLength(6);
 });
 for (const m of data.missions) for (const s of Object.values(m.scenes)) {
  it(`${s.id} witness and declared polynomial`,()=>{
   const {expression,...p}=s.witness;
   expect(parseExpression(expression).coefficients).toEqual(p);
   expect(evaluateScene(s as Scene,expression).primaryCode).toBe('SUCCESS');
  });
  for (const f of s.knownFailures) it(`${s.id}: ${f.expression} => ${f.expectedCode}`,()=>{
   expect(evaluateScene(s as Scene,f.expression).primaryCode).toBe(f.expectedCode);
  });
 }
});
