import type {ValidateFunction} from 'ajv';
import type {LearnerRequest} from './request.generated';
import type {ModelPayload} from './response.generated';
export const validateRequest:ValidateFunction<LearnerRequest>;
export const validateModel:ValidateFunction<ModelPayload>;
export const validateRuleEvidence:ValidateFunction<LearnerRequest['ruleEvidence'][number]>;
