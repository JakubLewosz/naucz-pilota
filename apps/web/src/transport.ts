import {demoTurn,type Envelope,type LearnerRequest} from '@piko/contracts';
export type Session={sessionId:string;sessionRevision:number};
declare global {interface Window {piko?:{getAiStatus:()=>Promise<{mode:string;available:boolean}>;setAccessCode?:(code:string)=>Promise<{ok:boolean}>;startAiSession:()=>Promise<Session>;sendLearnerTurn:(request:LearnerRequest)=>Promise<Envelope>;clearConversation:(sceneId:string)=>Promise<{ok:boolean}>}}}
let accessCode='';
const headers=()=>({'Content-Type':'application/json',...(accessCode?{'X-Piko-Access-Code':accessCode}:{})});
export async function setAccessCode(code:string){
 if(window.piko){
  if(!window.piko.setAccessCode)throw new Error('Ta paczka wymaga aktualizacji połączenia live.');
  await window.piko.setAccessCode(code);
 }else accessCode=code;
 return getStatus();
}
export async function getStatus(){try{if(window.piko)return await window.piko.getAiStatus();const r=await fetch('/api/health',{headers:headers(),signal:AbortSignal.timeout(2500)});if(!r.ok)return {mode:'unavailable',available:false};return await r.json() as {mode:string;available:boolean};}catch{return {mode:'unavailable',available:false};}}
export async function startSession(mode:'demo'|'live'):Promise<Session>{
 if(mode==='demo')return {sessionId:crypto.randomUUID(),sessionRevision:0};
 if(window.piko)return window.piko.startAiSession();
 const r=await fetch('/api/session',{method:'POST',headers:headers(),body:'{}',signal:AbortSignal.timeout(5000)});
 if(!r.ok)throw new Error(r.status===403?'Sprawdź dostęp do live i kod w Ustawieniach.':'Nie udało się utworzyć sesji. Spróbuj ponownie.');
 return r.json() as Promise<Session>;
}
export async function sendTurn(request:LearnerRequest,signal:AbortSignal):Promise<Envelope>{
 if(request.requestedMode==='demo')return demoTurn(request);
 if(window.piko)return window.piko.sendLearnerTurn(request);
 const r=await fetch('/api/learner-turn',{method:'POST',headers:headers(),body:JSON.stringify(request),signal});
 const body=await r.json();
 if(body.schemaVersion==='1.0.0')return body as Envelope;
 if(!r.ok)throw new Error(body.error?.messagePL??'Nie udało się otrzymać odpowiedzi. Wzór i wyjaśnienie są zachowane.');
 throw new Error('Niepoprawna odpowiedź serwera.');
}
export async function clearConversation(sceneId:string){
 if(window.piko){
  if((await window.piko.clearConversation(sceneId)).ok)return;
 }else{
  const response=await fetch('/api/conversation/reset',{method:'POST',headers:headers(),body:JSON.stringify({sceneId}),signal:AbortSignal.timeout(5000)});
  const result=await response.json();
  if(response.ok&&result.ok===true)return;
  if(typeof result.error?.messagePL==='string')throw new Error(result.error.messagePL);
 }
 throw new Error('Nie udało się wyczyścić rozmowy na serwerze.');
}
