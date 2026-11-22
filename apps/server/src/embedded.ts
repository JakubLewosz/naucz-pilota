/**
 * Serwer AI wbudowany w aplikację okienkową. Działa w procesie głównym Electron,
 * nasłuchuje wyłącznie na 127.0.0.1 i używa tego samego kontraktu, limitów i walidacji
 * co serwer internetowy. Okno gry nigdy nie widzi klucza API.
 */
import type {AddressInfo} from 'node:net';
import {createApp} from './app';
import {Store} from './store';
import {anthropicProvider,type AnthropicEffort} from './provider';

export type EmbeddedOptions={key:string;dbPath:string;model?:string;effort?:AnthropicEffort;dailyBudget?:number};

export function startEmbedded({key,dbPath,model='claude-sonnet-5-5',effort='medium',dailyBudget=150}:EmbeddedOptions):Promise<{port:number;close:()=>void}>{
 const store=new Store(dbPath);
 const app=createApp({store,provider:anthropicProvider(key,model,8192,{effort}),config:{
  mode:'live',provider:'anthropic',model,production:false,publicOrigin:'app://piko',
  dailyBudget,timeoutMs:90000,sessionLimit:6,maxProviderRequests:2,bodyBytes:16384,
  accessCode:'',requireAccessCode:false
 }});
 return new Promise((resolve,reject)=>{
  const server=app.listen(0,'127.0.0.1',()=>{
   const {port}=server.address() as AddressInfo;
   resolve({port,close:()=>{server.close();store.close();}});
  });
  server.on('error',reject);
 });
}
