import {missionById} from '@piko/content';
import {deriveRuleEvidence,evaluateScene,type EngineResult,type NumericEvidence,type Role,type RuleEvidence} from '@piko/core';
import type {Envelope} from '@piko/contracts';
export const SAVE_KEY='naucz-pilota.v1';
export const roles:Role[]=['practice','teach','robot_transfer','human_check'];
export const roleLabels:Record<Role,string>={practice:'Sprawdź tor',teach:'Naucz Piko',robot_transfer:'Lot Piko',human_check:'Twój samodzielny lot'};
export type Attempt={id:string;expression:string;sceneId:string;result:EngineResult;index:number;hintCount:number;timestamp:string;source:'human'|'demo'|'live';afterReview:boolean};
export type Run={id:string;role:Role;drafts:Record<Role,string>;explanation:string;predictions:string[];attempts:Partial<Record<Role,Attempt[]>>;counts:Partial<Record<Role,number>>;firstHuman:Attempt|null;rule:RuleEvidence|null;hintCount:number;robot:Envelope|null;robotTurns:number;robotChecked:boolean;prediction:string;unavailable:boolean;messages:{text:string;source:string}[];completed:boolean;afterReview:boolean;repairChecked:boolean;numericFeedback:string};
export type GameState={saveVersion:1;contentVersion:'1.0.0';page:'home'|'missions'|'game'|'journal'|'settings'|'about'|'summary';missionId:string;runs:Record<string,Run>;archive:Record<string,Run[]>;rules:RuleEvidence[];viewRevision:number;mode:'demo'|'live'|'unavailable';liveAvailable:boolean;activeTurnId:string|null;busy:boolean;error:string;settings:{reducedMotion:boolean;hitbox:boolean;fontScale:number};recovery:string|null};
export function newRun(id:string):Run {const m=missionById(id);return {id:crypto.randomUUID(),role:'practice',drafts:Object.fromEntries(roles.map(r=>[r,m.scenes[r].initialExpression])) as Record<Role,string>,explanation:'',predictions:['',''],attempts:{},counts:{},firstHuman:null,rule:null,hintCount:0,robot:null,robotTurns:0,robotChecked:false,prediction:'',unavailable:false,messages:[],completed:false,afterReview:false,repairChecked:false,numericFeedback:''};}
export function initialState():GameState {return {saveVersion:1,contentVersion:'1.0.0',page:'home',missionId:'M01',runs:{M01:newRun('M01')},archive:{},rules:[],viewRevision:0,mode:'demo',liveAvailable:false,activeTurnId:null,busy:false,error:'',settings:{reducedMotion:false,hitbox:false,fontScale:1},recovery:null};}
export function loadState(storage:Storage):GameState {
 const raw=storage.getItem(SAVE_KEY);if(!raw)return initialState();
 try {
  const s=JSON.parse(raw) as GameState;
  if(s.saveVersion!==1||s.contentVersion!=='1.0.0') throw new Error('Nieznana wersja zapisu');
  if(!s.runs||!s.runs[s.missionId]||!Array.isArray(s.rules)||!s.archive||!s.settings)throw new Error('Uszkodzony zapis');
  for(const [id,r] of Object.entries(s.runs)) {
   missionById(id);
   if(!roles.includes(r.role)||!r.drafts||!r.attempts||!r.counts||!Array.isArray(r.predictions)||!Array.isArray(r.messages))throw new Error('Uszkodzony zapis');
   for(const role of roles)if(typeof r.drafts[role]!=='string')throw new Error('Uszkodzony zapis');
  }
  return {...s,mode:s.mode==='live'?'live':s.mode==='unavailable'?'unavailable':'demo',busy:false,activeTurnId:null,liveAvailable:false,viewRevision:s.viewRevision+1,recovery:null};
 }catch(e){return {...initialState(),recovery:e instanceof Error?e.message:'Uszkodzony zapis'};}
}
export function persistState(storage:Storage,s:GameState):string|null {
 if(s.recovery)return null;
 try{storage.setItem(SAVE_KEY,JSON.stringify({...s,busy:false,activeTurnId:null}));return null;}catch{return 'Brak miejsca na zapis. Pozostaw tę kartę otwartą; postęp jest teraz tylko w pamięci.';}
}
export const numericValue=(s:string)=>/^[-+]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(s.trim())?Number(s.replace(',','.')):NaN;
export function numericEvidence(s:GameState):(NumericEvidence & {checkpointId:'G1'|'G2'})[]{const r=s.runs[s.missionId];return (['G1','G2'] as const).map((checkpointId,i)=>({sceneId:`${s.missionId}-teach`,checkpointId,submittedY:numericValue(r.predictions[i])}));}
export type Action={type:'OPEN';page:GameState['page']}|{type:'MISSION';id:string}|{type:'EDIT';field:'expression'|'explanation'|'prediction0'|'prediction1';value:string}|{type:'CHECK'}|{type:'CHECK_SCRIPT'}|{type:'NEXT'}|{type:'CONFIRM_RULE'}|{type:'HINT'}|{type:'ROBOT_PREDICTION';value:string}|{type:'ROBOT_CHECK'}|{type:'AI_START';turnId:string}|{type:'AI_RESULT';turnId:string;revision:number;sceneId:string;envelope:Envelope}|{type:'AI_ERROR';turnId:string;revision:number;message:string}|{type:'MODE';mode:'demo'|'live'}|{type:'STATUS';live:boolean}|{type:'SETTINGS';settings:Partial<GameState['settings']>}|{type:'CLEAR_CHAT'}|{type:'REPLAY';id:string}|{type:'RECOVER'}|{type:'RESET'};
export const hasCompleted=(s:GameState,id:string)=>Boolean(s.runs[id]?.completed||s.archive[id]?.some(r=>r.completed));
export function reducer(state:GameState,action:Action):GameState {
 if(action.type==='RESET'||action.type==='RECOVER') return initialState();
 const s=structuredClone(state),r=s.runs[s.missionId],m=missionById(s.missionId),scene=m.scenes[r.role];
 const invalidate=()=>{s.viewRevision++;s.activeTurnId=null;s.busy=false;s.error='';};
 const addAttempt=(role:Role,expression:string,source:Attempt['source'])=>{
  const result=evaluateScene(m.scenes[role],expression);
  if(!result.parseable){s.error=result.messagePL+' Ta próba nie została zapisana.';return;}
  const index=(r.counts[role]??0)+1;
  const a:Attempt={id:crypto.randomUUID(),expression,sceneId:m.scenes[role].id,result,index,hintCount:r.hintCount,timestamp:new Date().toISOString(),source,afterReview:r.afterReview};
  r.attempts[role]=[...(r.attempts[role]??[]),a].slice(-20);r.counts[role]=index;
  if(role==='human_check'&&!r.firstHuman)r.firstHuman=a;
  if(role==='human_check'&&result.ok)r.completed=true;
  return a;
 };
 switch(action.type){
  case 'OPEN':
   if(action.page==='journal'&&r.role==='human_check'&&!r.firstHuman)return state;
   if(action.page==='journal'&&r.role==='human_check')r.afterReview=true;
   invalidate();s.page=action.page;break;
  case 'MISSION':{
   const target=missionById(action.id);
   if(target.order>1&&!hasCompleted(s,`M0${target.order-1}`))return state;
   invalidate();s.missionId=action.id;s.runs[action.id]??=newRun(action.id);s.page='game';break;
  }
  case 'EDIT':
   invalidate();
   if(action.field==='expression'){r.drafts[r.role]=action.value;r.repairChecked=false;}
   else if(action.field==='explanation')r.explanation=action.value;
   else{r.predictions[action.field==='prediction0'?0:1]=action.value;r.repairChecked=false;}
   break;
  case 'CHECK':{
   if(r.role==='robot_transfer'||s.busy)return state;
   invalidate();const a=addAttempt(r.role,r.drafts[r.role],'human');
   if(r.role==='teach'&&a){r.repairChecked=true;const e=deriveRuleEvidence(m,r.drafts.teach,numericEvidence(s));r.numericFeedback=e?'Tor i obie prognozy są poprawne.':numericEvidence(s).map(v=>{const p=a.result.checkpoints.find(p=>p.id===v.checkpointId);return p?`${v.checkpointId}: Twój wzór daje y=${p.y}.`:'';}).join(' ');}
   break;
  }
  case 'CHECK_SCRIPT':invalidate();addAttempt('teach',m.scenes.teach.initialExpression,'demo');break;
  case 'NEXT':{
   const last=r.attempts[r.role]?.at(-1);
   if(r.role==='practice'&&last?.result.ok){invalidate();r.role='teach';}
   else if(r.role==='robot_transfer'&&(r.robotChecked||r.unavailable)){invalidate();r.role='human_check';}
   else if(r.role==='human_check'&&r.completed){invalidate();s.page='summary';}
   break;
  }
  case 'CONFIRM_RULE':{
   if(r.role!=='teach'||!r.repairChecked||!r.explanation.trim())return state;
   const evidence=deriveRuleEvidence(m,r.drafts.teach,numericEvidence(s));if(!evidence)return state;
   r.rule={missionId:m.id,candidateExpression:r.drafts.teach,numericEvidence:numericEvidence(s)};
   s.rules=[...s.rules.filter(e=>e.missionId!==m.id),r.rule];invalidate();r.role='robot_transfer';break;
  }
  case 'HINT':if(r.role==='practice')r.hintCount=Math.min(3,r.hintCount+1);break;
  case 'ROBOT_PREDICTION':r.prediction=action.value;break;
  case 'ROBOT_CHECK':
   if(r.role!=='robot_transfer'||!r.prediction||!r.robot?.learner?.proposedExpression)return state;
   invalidate();addAttempt('robot_transfer',r.robot.learner.proposedExpression,r.robot.mode==='live'?'live':'demo');r.robotChecked=true;break;
  case 'AI_START':if(s.busy||!['teach','robot_transfer'].includes(r.role)||(r.role==='robot_transfer'&&r.robotTurns>=2))return state;s.busy=true;s.activeTurnId=action.turnId;s.error='';break;
  case 'AI_RESULT':
   if(s.activeTurnId!==action.turnId||s.viewRevision!==action.revision||scene.id!==action.sceneId)return state;
   s.busy=false;s.activeTurnId=null;
   if(r.role==='robot_transfer'){r.robot=action.envelope;r.robotTurns++;r.robotChecked=false;r.prediction='';if(action.envelope.learner?.proposedExpression===null)r.unavailable=true;}
   if(action.envelope.mode==='unavailable'){s.mode='unavailable';s.error=action.envelope.error?.messagePL??'Brak odpowiedzi AI.';r.unavailable=true;}
   else{r.unavailable=action.envelope.learner?.proposedExpression===null&&r.role==='robot_transfer';if(action.envelope.learner)r.messages.push({text:action.envelope.learner.utterancePL+(action.envelope.learner.followUpPL?' '+action.envelope.learner.followUpPL:''),source:action.envelope.mode});r.messages=r.messages.slice(-6);}
   break;
  case 'AI_ERROR':
   if(s.activeTurnId!==action.turnId||s.viewRevision!==action.revision)return state;
   s.busy=false;s.activeTurnId=null;s.mode='unavailable';s.error=action.message;r.unavailable=true;if(r.role==='robot_transfer')r.robotTurns++;break;
  case 'MODE':invalidate();s.mode=action.mode;r.unavailable=false;break;
  case 'STATUS':s.liveAvailable=action.live;break;
  case 'SETTINGS':s.settings={...s.settings,...action.settings};break;
  case 'CLEAR_CHAT':invalidate();r.messages=[];break;
  case 'REPLAY':
   if(!s.runs[action.id]?.completed)return state;
   invalidate();s.archive[action.id]=[...(s.archive[action.id]??[]),s.runs[action.id]];s.runs[action.id]=newRun(action.id);s.missionId=action.id;s.page='game';break;
 }
 return s;
}
