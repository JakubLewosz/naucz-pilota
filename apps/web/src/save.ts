import {missionById,missions} from '@piko/content';
import {validateModel,validateRuleEvidence} from '@piko/contracts';
import {deriveRuleEvidence} from '@piko/core';
import {initialState,roles,type GameState,type Run} from './state';

// Keep the storage key stable so version 1 saves can be migrated in place.
export const SAVE_KEY='naucz-pilota.v1';
type SaveStorage=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
type Check=(value:unknown)=>boolean;

const object=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
const fields=(v:unknown,checks:Record<string,Check>)=>object(v)&&Object.entries(checks).every(([key,check])=>check(v[key]));
const oneOf=(options:readonly string[]):Check=>v=>typeof v==='string'&&options.includes(v);
const nullable=(check:Check):Check=>v=>v===null||check(v);
const list=(check:Check,max=Infinity):Check=>v=>Array.isArray(v)&&v.length<=max&&v.every(check);
const string=(v:unknown):v is string=>typeof v==='string';
const text=(max:number):Check=>v=>string(v)&&v.length<=max;
const flag=(v:unknown)=>typeof v==='boolean';
const finite=(v:unknown)=>typeof v==='number'&&Number.isFinite(v);
const count=(min=0,max=Number.MAX_SAFE_INTEGER-1):Check=>v=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=min&&v<=max;
const uid=(v:unknown)=>string(v)&&/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(v);
const isMission=(v:unknown):v is string=>missions.some(m=>m.id===v);
const mode=oneOf(['demo','live','unavailable']);
const source=oneOf(['demo','live']);
const reply=(v:unknown)=>fields(v,{text:text(450),source});
const message=(v:unknown)=>fields(v,{text:text(651),source,speaker:oneOf(['piko','player'])});
const result=(v:unknown)=>fields(v,{
 ok:flag,parseable:flag,primaryCode:string,messagePL:string,diagnostics:list(string),
 checkpoints:list(c=>fields(c,{id:string,x:finite,y:finite,passed:flag}),4),
 firstPhysicalEvent:nullable(e=>fields(e,{x:finite,y:finite,code:string,subject:string})),
 canonicalPolynomial:nullable(p=>fields(p,{c2:finite,c1:finite,c0:finite}))
});
function attempt(v:unknown,sceneId:string){
 return object(v)&&v.sceneId===sceneId&&fields(v,{
  id:uid,expression:text(120),result,index:count(1),hintCount:count(0,3),
  timestamp:string,source:oneOf(['human','live','demo']),afterReview:flag
 });
}
function evidence(v:unknown){
 if(!validateRuleEvidence(v))return false;
 const mission=missionById(v.missionId);
 return (!v.lessonNote||v.lessonNote.ruleId===mission.canonicalRuleId)
  &&Boolean(deriveRuleEvidence(mission,v.candidateExpression,v.numericEvidence));
}
function envelope(v:unknown,missionId:string){
 return object(v)&&v.schemaVersion==='1.0.0'&&v.sceneId===missionId+'-robot_transfer'&&fields(v,{
  sessionId:uid,sessionRevision:count(),turnId:uid,mode,learner:nullable(validateModel),
  proposalValidation:p=>fields(p,{
   status:oneOf(['not_proposed','passed','failed','invalid_expression']),failureCode:nullable(string),
   normalizedExpression:nullable(string),facts:list(f=>fields(f,{id:string,textPL:string}))
  }),
  memory:m=>fields(m,{
   learnedRuleIds:list(string),qualifiedRuleIds:list(string),newlyQualifiedRuleIds:list(string),rejectedEvidenceMissionIds:list(isMission)
  }),
  model:m=>fields(m,{
   provider:nullable(oneOf(['openai'])),configuredModel:nullable(string),actualModel:nullable(string),
   providerResponseId:nullable(string),requestCount:count(),inputTokens:nullable(count()),
   outputTokens:nullable(count()),latencyMs:finite
  }),
  error:nullable(e=>fields(e,{code:string,messagePL:string,retryable:flag}))
 });
}
function run(v:unknown,missionId:string):v is Run{
 if(!fields(v,{
  id:uid,role:oneOf(roles),drafts:d=>object(d)&&roles.every(role=>text(120)(d[role])),
  explanation:text(600),predictions:p=>Array.isArray(p)&&p.length===2&&p.every(string),
  attempts:a=>object(a)&&Object.entries(a).every(([role,items])=>oneOf(roles)(role)&&list(v=>attempt(v,missionId+'-'+role),20)(items)),
  counts:c=>object(c)&&Object.entries(c).every(([role,n])=>oneOf(roles)(role)&&count()(n)),
  firstHuman:nullable(a=>attempt(a,missionId+'-human_check')),
  rule:nullable(r=>object(r)&&r.missionId===missionId&&evidence(r)),hintCount:count(0,3),
  robot:nullable(r=>envelope(r,missionId)),robotTurns:count(0,2),robotFailures:count(0,2),
  robotChecked:flag,prediction:oneOf(['','Przeleci','Nie przeleci','Jeszcze nie wiem']),
  unavailable:flag,messages:list(message,12),liveChat:flag,lessonReply:nullable(reply),
  completed:flag,afterReview:flag,repairChecked:flag,numericFeedback:string
 }))return false;
 const r=v as Run;
 return (!r.completed||Boolean(r.firstHuman))
  &&(!r.firstHuman||r.firstHuman.index===1)
  &&(!r.robotChecked||Boolean(r.attempts.robot_transfer?.length))
  &&roles.every(role=>(r.counts[role]??0)>=(r.attempts[role]?.length??0));
}
function missionMap(v:unknown,check:(value:unknown,id:string)=>boolean){
 return object(v)&&Object.entries(v).every(([id,value])=>isMission(id)&&check(value,id));
}
function validState(v:unknown):v is GameState{
 if(!object(v)||v.saveVersion!==2||v.contentVersion!=='1.0.0'||!isMission(v.missionId))return false;
 if(!object(v.runs)||!Object.hasOwn(v.runs,v.missionId))return false;
 if(!fields(v,{
  page:oneOf(['home','missions','game','journal','settings','about','summary']),
  runs:r=>missionMap(r,run),
  archive:a=>missionMap(a,(entries,id)=>list(r=>run(r,id))(entries)),
  rules:list(evidence,6),viewRevision:count(),mode,liveAvailable:flag,activeTurnId:nullable(uid),
  busy:flag,error:string,recovery:nullable(string),
  settings:s=>fields(s,{reducedMotion:flag,hitbox:flag,fontScale:n=>[1,1.25,1.5,2].some(size=>size===n)})
 }))return false;
 const rules=(v as GameState).rules;
 return new Set(rules.map(rule=>rule.missionId)).size===rules.length;
}
function migrateRun(v:unknown,missionId:string){
 if(!object(v)||!Array.isArray(v.messages)||!count(0,2)(v.robotTurns)
  ||!(v.robot===null||envelope(v.robot,missionId)))throw new Error('Uszkodzony zapis');
 const robot=v.robot as Run['robot'];
 const recorded=object(v.attempts)&&Array.isArray(v.attempts.robot_transfer)?v.attempts.robot_transfer.length:0;
 const usable=Boolean(robot?.learner?.proposedExpression);
 const robotTurns=Math.min(2,Math.max(recorded,usable?1:0));
 return {...v,robot:usable?robot:null,robotTurns,robotFailures:Math.max(0,(v.robotTurns as number)-robotTurns),
  messages:v.messages.map((m:unknown)=>object(m)?{...m,speaker:'piko'}:m),
  liveChat:v.messages.some((m:unknown)=>object(m)&&m.source==='live')||v.unavailable===true,
  lessonReply:null};
}
function migrateV1(v:Record<string,unknown>){
 if(!object(v.runs)||!object(v.archive))throw new Error('Uszkodzony zapis');
 return {...v,saveVersion:2,
  runs:Object.fromEntries(Object.entries(v.runs).map(([id,r])=>[id,migrateRun(r,id)])),
  archive:Object.fromEntries(Object.entries(v.archive).map(([id,entries])=>{
   if(!Array.isArray(entries))throw new Error('Uszkodzony zapis');
   return [id,entries.map(r=>migrateRun(r,id))];
  }))
 };
}
export function loadState(storage?:SaveStorage):GameState{
 let raw:string|null;
 try{raw=(storage??window.localStorage).getItem(SAVE_KEY);}
 catch{return {...initialState(),recovery:'Nie udało się odczytać pamięci urządzenia'};}
 if(raw===null)return initialState();
 try{
  let data:unknown=JSON.parse(raw);
  if(!object(data))throw new Error('Uszkodzony zapis');
  if((data.saveVersion!==1&&data.saveVersion!==2)||data.contentVersion!=='1.0.0')throw new Error('Nieznana wersja zapisu');
  if(data.saveVersion===1)data=migrateV1(data);
  if(!validState(data))throw new Error('Uszkodzony zapis');
  return {...data,busy:false,activeTurnId:null,liveAvailable:false,viewRevision:data.viewRevision+1,recovery:null};
 }catch(error){
  return {...initialState(),recovery:error instanceof Error&&error.message==='Nieznana wersja zapisu'?'Nieznana wersja zapisu':'Uszkodzony zapis'};
 }
}
export function persistState(storage:SaveStorage|undefined,state:GameState):string|null{
 if(state.recovery)return null;
 try{
  (storage??window.localStorage).setItem(SAVE_KEY,JSON.stringify({...state,busy:false,activeTurnId:null}));
  return null;
 }catch{return 'Zapis jest niedostępny. Pozostaw tę kartę otwartą, aby zachować postęp w pamięci.';}
}
export function backupSave(storage?:SaveStorage):string|null{
 try{
  const device=storage??window.localStorage;
  const raw=device.getItem(SAVE_KEY);
  if(raw!==null)device.setItem(`${SAVE_KEY}.backup.${Date.now()}`,raw);
  return null;
 }catch{return 'Nie udało się zachować kopii zapisu. Sprawdź dostęp do pamięci urządzenia i spróbuj ponownie.';}
}
export function removeSave(storage?:SaveStorage):string|null{
 try{(storage??window.localStorage).removeItem(SAVE_KEY);return null;}
 catch{return 'Nie udało się usunąć lokalnego zapisu.';}
}
