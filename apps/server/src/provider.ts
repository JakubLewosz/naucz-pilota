import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import {transformJSONSchema,type JSONSchema} from '@anthropic-ai/sdk/lib/transform-json-schema';
import type {ResponseInputItem} from 'openai/resources/responses/responses';
import type {ReasoningEffort} from 'openai/resources/shared';
import {providerSchemaForContext,type Context} from '@piko/contracts';
import {SYSTEM_PROMPT,FOLLOW_UP_POLICY,TEACH_ROLE_POLICY,LESSON_POLICY} from './system';
export class ProviderError extends Error {constructor(public code:string,public status:number){super(code);}}
export type ProviderResult={text:string;actualModel:string;responseId:string;inputTokens:number|null;outputTokens:number|null};
export type Provider=(context:Context,userMessage:string,signal:AbortSignal,repair?:{output:string;issues:string})=>Promise<ProviderResult>;
export function openAIProvider(key:string,model:string,maxTokens:number,options:{baseURL?:string;fetch?:typeof fetch;reasoningEffort?:ReasoningEffort}={}):Provider {
 const {reasoningEffort,...transport}=options;
 const client=new OpenAI({apiKey:key,maxRetries:0,...transport});
 return async(context,userMessage,signal,repair)=>{
  const {recentExchanges,lessonNote,priorLessons,...trusted}=context;
  const input:ResponseInputItem[]=[{role:'developer',content:JSON.stringify(trusted)}];
  for(const e of recentExchanges)input.push({role:'user',content:e.userPL},{role:'assistant',content:e.pikoPL+(e.followUpPL?' '+e.followUpPL:'')});
  if(priorLessons.length)input.push({role:'user',content:JSON.stringify({untrustedPriorLessons:priorLessons})});
  if(lessonNote)input.push({role:'user',content:JSON.stringify({untrustedLessonNote:lessonNote})});
  input.push({role:'user',content:userMessage||(context.phase==='robot_propose'?'Zaproponuj własną próbę dla bieżącej planszy.':'Odnieś się do naprawy i sprawdzonych prognoz; pozostań uczniem.')});
  if(repair)input.push({role:'user',content:JSON.stringify({technicalRepair:true,untrustedPreviousOutput:repair.output.slice(0,3500),violations:repair.issues})});
  try{
   const response=await client.responses.create({model,instructions:[SYSTEM_PROMPT,FOLLOW_UP_POLICY,TEACH_ROLE_POLICY,LESSON_POLICY].join('\n\n'),input,text:{format:{type:'json_schema',name:'piko_turn_v1',strict:true,schema:providerSchemaForContext(context)}},max_output_tokens:maxTokens,...(reasoningEffort?{reasoning:{effort:reasoningEffort}}:{}),store:false},{signal});
   if(response.output.some(o=>o.type==='message'&&o.content.some(c=>c.type==='refusal')))throw new ProviderError('AI_REFUSED',422);
   if(response.status!=='completed'||!response.output_text)throw new ProviderError('AI_INCOMPLETE',502);
   return {text:response.output_text,actualModel:response.model,responseId:response.id,inputTokens:response.usage?.input_tokens??null,outputTokens:response.usage?.output_tokens??null};
  }catch(e){
   if(e instanceof ProviderError)throw e;
   if(signal.aborted)throw new ProviderError('AI_TIMEOUT',504);
   if(e instanceof OpenAI.APIError&&[400,401,403,404].includes(e.status??0))throw new ProviderError('AI_NOT_CONFIGURED',503);
   throw new ProviderError('AI_PROVIDER_UNAVAILABLE',503);
  }
 };
}

export type AnthropicEffort='low'|'medium'|'high'|'xhigh'|'max';
/** Claude (Messages API) z tym samym kontraktem co wariant OpenAI: zaufany kontekst w system, cytaty gracza wyłącznie jako dane użytkownika. */
export function anthropicProvider(key:string,model:string,maxTokens:number,options:{baseURL?:string;fetch?:typeof fetch;effort?:AnthropicEffort;fallbacks?:boolean}={}):Provider {
 const {effort,fallbacks=true,...transport}=options;
 const client=new Anthropic({apiKey:key,maxRetries:0,...transport});
 return async(context,userMessage,signal,repair)=>{
  const {recentExchanges,lessonNote,priorLessons,...trusted}=context;
  const messages:Anthropic.Beta.BetaMessageParam[]=[];
  for(const e of recentExchanges)messages.push({role:'user',content:e.userPL},{role:'assistant',content:e.pikoPL+(e.followUpPL?' '+e.followUpPL:'')});
  if(priorLessons.length)messages.push({role:'user',content:JSON.stringify({untrustedPriorLessons:priorLessons})});
  if(lessonNote)messages.push({role:'user',content:JSON.stringify({untrustedLessonNote:lessonNote})});
  messages.push({role:'user',content:userMessage||(context.phase==='robot_propose'?'Zaproponuj własną próbę dla bieżącej planszy.':'Odnieś się do naprawy i sprawdzonych prognoz; pozostań uczniem.')});
  if(repair)messages.push({role:'user',content:JSON.stringify({technicalRepair:true,untrustedPreviousOutput:repair.output.slice(0,3500),violations:repair.issues})});
  try{
   const response=await client.beta.messages.create({
    model,max_tokens:maxTokens,
    system:[{type:'text',text:[SYSTEM_PROMPT,FOLLOW_UP_POLICY,TEACH_ROLE_POLICY,LESSON_POLICY].join('\n\n')},{type:'text',text:JSON.stringify(trusted)}],
    messages,
    output_config:{format:{type:'json_schema',schema:transformJSONSchema(providerSchemaForContext(context) as JSONSchema) as Record<string,unknown>},...(effort?{effort}:{})},
    ...(fallbacks?{betas:['server-side-fallback-2026-07-01'],fallbacks:'default' as const}:{})
   },{signal});
   if(response.stop_reason==='refusal')throw new ProviderError('AI_REFUSED',422);
   const text=response.content.flatMap(b=>b.type==='text'?[b.text]:[]).join('');
   if(response.stop_reason!=='end_turn'||!text)throw new ProviderError('AI_INCOMPLETE',502);
   return {text,actualModel:response.model,responseId:response.id,inputTokens:response.usage.input_tokens??null,outputTokens:response.usage.output_tokens??null};
  }catch(e){
   if(e instanceof ProviderError)throw e;
   if(signal.aborted)throw new ProviderError('AI_TIMEOUT',504);
   if(e instanceof Anthropic.APIError&&[400,401,403,404].includes(e.status??0))throw new ProviderError('AI_NOT_CONFIGURED',503);
   throw new ProviderError('AI_PROVIDER_UNAVAILABLE',503);
  }
 };
}
