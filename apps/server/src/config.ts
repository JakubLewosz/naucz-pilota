import type {ReasoningEffort} from 'openai/resources/shared';

export const DEFAULT_AI_TIMEOUT_MS=90000;
const MAX_AI_TIMEOUT_MS=120000;
export const AI_RESPONSE_WAIT_MS=MAX_AI_TIMEOUT_MS+10000;

export function integer(name:string,fallback:number,min=1,max=1000000,env=process.env){
 const value=Number(env[name]??fallback);
 if(!Number.isInteger(value)||value<min||value>max)throw new Error(`Invalid configuration: ${name}`);
 return value;
}

const reasoningEfforts=['none','minimal','low','medium','high','xhigh','max'] as const satisfies readonly ReasoningEffort[];

export function readOpenAIConfig(env=process.env){
 const model=env.AI_MODEL?.trim()??'';
 const effort=env.AI_REASONING_EFFORT?.trim()||(model==='gpt-6-luna'?'xhigh':undefined);
 const reasoningEffort=reasoningEfforts.find(value=>value===effort);
 if(effort&&!reasoningEffort)throw new Error('Invalid configuration: AI_REASONING_EFFORT');
 return {
  model,reasoningEffort,
  maxOutputTokens:integer('AI_MAX_OUTPUT_TOKENS',8192,256,16384,env),
  timeoutMs:integer('AI_TURN_TIMEOUT_MS',DEFAULT_AI_TIMEOUT_MS,1,MAX_AI_TIMEOUT_MS,env),
  maxProviderRequests:integer('AI_MAX_PROVIDER_REQUESTS_PER_TURN',2,1,2,env)
 };
}
