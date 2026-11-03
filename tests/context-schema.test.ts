import {it,expect} from 'vitest';
import Ajv2020 from 'ajv/dist/2020.js';
import {providerSchemaForContext,buildContext,validateModel,type LearnerRequest} from '@piko/contracts';
import {buildLiveCases} from './live/cases';
import evals from '../content/ai-evals.v1.json';
it('observed SEM05 failure: schema prevents suggesting an unqualified rule or inventing facts',()=>{
 const test=buildLiveCases().find(c=>c.id==='SEM05')!,{context}=buildContext(test.body),ajv=new Ajv2020({strict:false}),schema=providerSchemaForContext(context);
 const payload={...evals.modelPayloadFixtures.teach_ack,usedFactIds:[],suggestedRuleId:'RULE_LINE_INTERCEPT'};
 expect(validateModel(payload)).toBe(true);expect(ajv.validate(schema,payload)).toBe(false);
 expect(ajv.validate(schema,{...payload,suggestedRuleId:null})).toBe(true);
 expect(ajv.validate(schema,{...payload,suggestedRuleId:null,usedFactIds:['invented']})).toBe(false);
});
it('phase-specific schema retains eligible canonical suggestions and forbids teach proposals',()=>{
 const {context}=buildContext(evals.cases[0].request as LearnerRequest),ajv=new Ajv2020({strict:false}),schema=providerSchemaForContext(context);
 expect(ajv.validate(schema,evals.modelPayloadFixtures.teach_qualified)).toBe(true);
 expect(ajv.validate(schema,{...evals.modelPayloadFixtures.teach_qualified,proposedExpression:'2'})).toBe(false);
});
