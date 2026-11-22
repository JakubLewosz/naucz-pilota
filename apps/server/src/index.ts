import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import {createApp} from './app';
import {Store} from './store';
import {anthropicProvider,openAIProvider,type Provider} from './provider';
import {integer,readAnthropicConfig,readOpenAIConfig,readProviderName} from './config';
const mode=process.env.AI_MODE==='live'?'live':'demo',providerName=readProviderName();
let key:string,model:string,maxOutputTokens:number,timeoutMs:number,maxProviderRequests:number,makeProvider:()=>Provider;
if(providerName==='anthropic'){
 const c=readAnthropicConfig();key=process.env.ANTHROPIC_API_KEY??'';({model,maxOutputTokens,timeoutMs,maxProviderRequests}=c);
 makeProvider=()=>anthropicProvider(key,model,maxOutputTokens,{effort:c.effort});
}else{
 const c=readOpenAIConfig();key=process.env.OPENAI_API_KEY??'';({model,maxOutputTokens,timeoutMs,maxProviderRequests}=c);
 makeProvider=()=>openAIProvider(key,model,maxOutputTokens,{reasoningEffort:c.reasoningEffort});
}
const store=new Store(process.env.STATE_DB_PATH??'var/piko.sqlite');
const app=createApp({store,provider:mode==='live'&&key&&model?makeProvider():undefined,config:{mode,provider:providerName,model,production:process.env.NODE_ENV==='production',publicOrigin:process.env.PUBLIC_ORIGIN??'http://127.0.0.1:5173',dailyBudget:integer('AI_DAILY_REQUEST_BUDGET',200,0),timeoutMs,sessionLimit:integer('AI_SESSION_TURNS_PER_MINUTE',6),maxProviderRequests,bodyBytes:integer('AI_REQUEST_BODY_BYTES',16384,1024,16384),accessCode:process.env.JURY_ACCESS_CODE??'',requireAccessCode:process.env.JURY_ACCESS_REQUIRED==='1'}});
app.use(express.static(path.resolve('apps/web/dist')));
const server=app.listen(integer('SERVER_PORT',3001),()=>console.log(`Piko API on port ${process.env.SERVER_PORT??3001}; mode=${mode}; provider=${providerName}; configured=${mode==='live'&&Boolean(key&&model)}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{store.close();process.exit(0);}));
