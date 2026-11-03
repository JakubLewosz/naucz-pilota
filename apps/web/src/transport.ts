import {demoTurn,type Envelope,type LearnerRequest} from '@piko/contracts';
export type Session={sessionId:string;sessionRevision:number};
declare global {interface Window {piko?:{getAiStatus:()=>Promise<{mode:string;available:boolean}>;startAiSession:()=>Promise<Session>;sendLearnerTurn:(request:LearnerRequest)=>Promise<Envelope>}}}
export async function getStatus(){try{if(window.piko)return await window.piko.getAiStatus();const r=await fetch('/api/health',{signal:AbortSignal.timeout(2500)});return await r.json() as {mode:string;available:boolean};}catch{return {mode:'unavailable',available:false};}}
export async function startSession(mode:'demo'|'live'):Promise<Session>{
 if(mode==='demo')return {sessionId:crypto.randomUUID(),sessionRevision:0};
 if(window.piko)return window.piko.startAiSession();
 const r=await fetch('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(5000)});
 if(!r.ok)throw new Error('Nie udało się utworzyć sesji. Spróbuj ponownie.');
 return r.json() as Promise<Session>;
}
export async function sendTurn(request:LearnerRequest,signal:AbortSignal):Promise<Envelope>{
 if(request.requestedMode==='demo')return demoTurn(request);
 if(window.piko)return window.piko.sendLearnerTurn(request);
 const r=await fetch('/api/learner-turn',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request),signal});
 const body=await r.json();
 if(body.schemaVersion==='1.0.0')return body as Envelope;
 if(!r.ok)throw new Error(body.error?.messagePL??'Nie udało się otrzymać odpowiedzi. Wzór i wyjaśnienie są zachowane.');
 throw new Error('Niepoprawna odpowiedź serwera.');
}
