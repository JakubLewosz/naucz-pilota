import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import {createApp} from './app';
import {Store} from './store';
import {integer} from './config';
import {selectProvider} from './select-provider';
const mode=process.env.AI_MODE==='live'?'live':'demo';
const {name:providerName,key,model,timeoutMs,maxProviderRequests,create:makeProvider}=selectProvider();
const store=new Store(process.env.STATE_DB_PATH??'var/piko.sqlite');
const app=createApp({store,provider:mode==='live'&&key&&model?makeProvider():undefined,config:{mode,provider:providerName,model,production:process.env.NODE_ENV==='production',publicOrigin:process.env.PUBLIC_ORIGIN??'http://127.0.0.1:5173',dailyBudget:integer('AI_DAILY_REQUEST_BUDGET',200,0),timeoutMs,sessionLimit:integer('AI_SESSION_TURNS_PER_MINUTE',6),maxProviderRequests,bodyBytes:integer('AI_REQUEST_BODY_BYTES',16384,1024,16384),accessCode:process.env.JURY_ACCESS_CODE??'',requireAccessCode:process.env.JURY_ACCESS_REQUIRED==='1'}});
// Za reverse proxy (np. Caddy) ustaw TRUST_PROXY, żeby limit zapytań liczył się per użytkownik, a nie dla całego proxy.
// Przykłady: TRUST_PROXY=loopback (proxy na tym samym hoście), TRUST_PROXY=1 (jeden przeskok). Domyślnie wyłączone.
const trustProxy=process.env.TRUST_PROXY?.trim();
if(trustProxy)app.set('trust proxy',/^\d+$/.test(trustProxy)?Number(trustProxy):trustProxy);
app.use(express.static(path.resolve('apps/web/dist')));
const server=app.listen(integer('SERVER_PORT',3001),()=>console.log(`Piko API on port ${process.env.SERVER_PORT??3001}; mode=${mode}; provider=${providerName}; configured=${mode==='live'&&Boolean(key&&model)}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{store.close();process.exit(0);}));
