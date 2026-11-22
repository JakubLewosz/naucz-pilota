import {anthropicProvider,openAIProvider,type Provider} from './provider';
import {readAnthropicConfig,readOpenAIConfig,readProviderName,type AIProviderName} from './config';
/** Jedno miejsce wyboru dostawcy dla serwera i narzędzi testowych. */
export function selectProvider(env=process.env):{name:AIProviderName;key:string;model:string;effort:string|null;maxOutputTokens:number;timeoutMs:number;maxProviderRequests:number;create:()=>Provider}{
 const name=readProviderName(env);
 if(name==='anthropic'){
  const c=readAnthropicConfig(env),key=env.ANTHROPIC_API_KEY??'';
  return {name,key,model:c.model,effort:c.effort,maxOutputTokens:c.maxOutputTokens,timeoutMs:c.timeoutMs,maxProviderRequests:c.maxProviderRequests,create:()=>anthropicProvider(key,c.model,c.maxOutputTokens,{effort:c.effort})};
 }
 const c=readOpenAIConfig(env),key=env.OPENAI_API_KEY??'';
 return {name,key,model:c.model,effort:c.reasoningEffort??null,maxOutputTokens:c.maxOutputTokens,timeoutMs:c.timeoutMs,maxProviderRequests:c.maxProviderRequests,create:()=>openAIProvider(key,c.model,c.maxOutputTokens,{reasoningEffort:c.reasoningEffort})};
}
