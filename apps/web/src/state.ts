import {missionById} from '@piko/content';
import {deriveRuleEvidence,evaluateScene,type EngineResult,type NumericEvidence,type Role} from '@piko/core';
import type {Envelope,LearnedEvidence} from '@piko/contracts';
export {SAVE_KEY,loadState,persistState,backupSave,removeSave} from './save';
export const roles:Role[]=['practice','teach','robot_transfer','human_check'];
export const roleLabels:Record<Role,string>={practice:'Sprawdź tor',teach:'Naucz Piko',robot_transfer:'Lot Piko',human_check:'Twój samodzielny lot'};
export type Attempt={id:string;expression:string;sceneId:string;result:EngineResult;index:number;hintCount:number;timestamp:string;source:'human'|'demo'|'live';afterReview:boolean};
export type Message={text:string;source:'live'|'demo';speaker:'player'|'piko'};
export type Run={
 id:string;role:Role;drafts:Record<Role,string>;explanation:string;predictions:string[];
 attempts:Partial<Record<Role,Attempt[]>>;counts:Partial<Record<Role,number>>;firstHuman:Attempt|null;
 rule:LearnedEvidence|null;hintCount:number;robot:Envelope|null;robotTurns:number;robotFailures:number;
 robotChecked:boolean;prediction:string;unavailable:boolean;messages:Message[];liveChat:boolean;
 lessonReply:Pick<Message,'text'|'source'>|null;
 completed:boolean;afterReview:boolean;repairChecked:boolean;numericFeedback:string
};
export type GameState={saveVersion:2;contentVersion:'1.0.0';page:'home'|'missions'|'game'|'journal'|'settings'|'about'|'summary';missionId:string;runs:Record<string,Run>;archive:Record<string,Run[]>;rules:LearnedEvidence[];viewRevision:number;mode:'demo'|'live'|'unavailable';liveAvailable:boolean;activeTurnId:string|null;busy:boolean;error:string;settings:{reducedMotion:boolean;hitbox:boolean;fontScale:number};recovery:string|null};
export function newRun(id:string):Run {
 const m=missionById(id);
 return {id:crypto.randomUUID(),role:'practice',drafts:Object.fromEntries(roles.map(r=>[r,m.scenes[r].initialExpression])) as Record<Role,string>,explanation:'',predictions:['',''],attempts:{},counts:{},firstHuman:null,rule:null,hintCount:0,robot:null,robotTurns:0,robotFailures:0,robotChecked:false,prediction:'',unavailable:false,messages:[],liveChat:false,lessonReply:null,completed:false,afterReview:false,repairChecked:false,numericFeedback:''};
}
export function initialState():GameState {return {saveVersion:2,contentVersion:'1.0.0',page:'home',missionId:'M01',runs:{M01:newRun('M01')},archive:{},rules:[],viewRevision:0,mode:'demo',liveAvailable:false,activeTurnId:null,busy:false,error:'',settings:{reducedMotion:false,hitbox:false,fontScale:1},recovery:null};}
export const numericValue=(s:string)=>/^[-+]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(s.trim())?Number(s.replace(',','.')):NaN;
export function numericEvidence(s:GameState):(NumericEvidence & {checkpointId:'G1'|'G2'})[]{const r=s.runs[s.missionId];return (['G1','G2'] as const).map((checkpointId,i)=>({sceneId:`${s.missionId}-teach`,checkpointId,submittedY:numericValue(r.predictions[i])}));}
export type Action={type:'OPEN';page:GameState['page']}|{type:'MISSION';id:string}|{type:'EDIT';field:'expression'|'explanation'|'prediction0'|'prediction1';value:string}|{type:'CHECK'}|{type:'CHECK_SCRIPT'}|{type:'NEXT'}|{type:'CONFIRM_RULE'}|{type:'HINT'}|{type:'ROBOT_PREDICTION';value:string}|{type:'ROBOT_CHECK'}|{type:'AI_START';turnId:string}|{type:'AI_RESULT';turnId:string;revision:number;sceneId:string;envelope:Envelope}|{type:'AI_ERROR';turnId:string;revision:number;message:string}|{type:'MODE';mode:'demo'|'live'}|{type:'STATUS';live:boolean}|{type:'SETTINGS';settings:Partial<GameState['settings']>}|{type:'CLEAR_CHAT_START';turnId:string}|{type:'CLEAR_CHAT';turnId:string;revision:number;error?:string}|{type:'REPLAY';id:string}|{type:'RECOVER'}|{type:'RESET'};
export const hasCompleted=(s:GameState,id:string)=>Boolean(s.runs[id]?.completed||s.archive[id]?.some(r=>r.completed));
export const canAskRobot=(s:GameState,r:Run)=>r.robotTurns<2
 &&(s.mode==='demo'||r.robotFailures<2)
 &&(!r.robot||r.robotChecked||r.unavailable);
export const canLeaveRobot=(r:Run)=>r.robotChecked||r.unavailable||r.robotFailures>0;
export function reducer(state:GameState,action:Action):GameState {
 if(action.type==='RESET'||action.type==='RECOVER') return initialState();
 const s=structuredClone(state),r=s.runs[s.missionId],m=missionById(s.missionId),scene=m.scenes[r.role];
 const invalidate=()=>{s.viewRevision++;s.activeTurnId=null;s.busy=false;s.error='';};
 const addMessage=(message:Message)=>{r.messages=[...r.messages,message].slice(-12);};
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
   if(r.role==='teach')r.lessonReply=null;
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
   else if(r.role==='robot_transfer'&&!s.busy&&canLeaveRobot(r)){invalidate();r.role='human_check';}
   else if(r.role==='human_check'&&r.completed){invalidate();s.page='summary';}
   break;
  }
  case 'CONFIRM_RULE':{
   if(r.role!=='teach'||s.busy||!r.repairChecked||!r.explanation.trim())return state;
   const evidence=deriveRuleEvidence(m,r.drafts.teach,numericEvidence(s));if(!evidence)return state;
   r.rule={missionId:m.id,candidateExpression:r.drafts.teach,numericEvidence:numericEvidence(s),lessonNote:{
    version:1,ruleId:evidence.ruleId,explanationPL:r.explanation,pikoParaphrasePL:r.lessonReply?.text??null,
    source:r.lessonReply?.source??'skipped',confirmation:'saved_by_player'
   }};
   s.rules=[...s.rules.filter(e=>e.missionId!==m.id),r.rule];invalidate();r.role='robot_transfer';break;
  }
  case 'HINT':if(r.role==='practice')r.hintCount=Math.min(3,r.hintCount+1);break;
  case 'ROBOT_PREDICTION':r.prediction=action.value;break;
  case 'ROBOT_CHECK':
   if(r.role!=='robot_transfer'||s.busy||r.robotChecked||!r.prediction||!r.robot?.learner?.proposedExpression)return state;
   invalidate();addAttempt('robot_transfer',r.robot.learner.proposedExpression,r.robot.mode==='live'?'live':'demo');r.robotChecked=true;break;
  case 'AI_START':{
   if(s.busy||!['teach','robot_transfer'].includes(r.role)||(r.role==='robot_transfer'&&!canAskRobot(s,r)))return state;
   const source=s.mode==='demo'?'demo':'live';
   s.busy=true;s.activeTurnId=action.turnId;s.error='';
   if(r.role==='robot_transfer'&&source==='live')r.robotFailures++;
   if(r.role==='teach'){
    if(source==='live')r.liveChat=true;
    addMessage({text:r.explanation,source,speaker:'player'});
   }
   break;
  }
  case 'AI_RESULT':{
   if(s.activeTurnId!==action.turnId||s.viewRevision!==action.revision||scene.id!==action.sceneId)return state;
   s.busy=false;s.activeTurnId=null;
   const {mode,learner,error}=action.envelope;
   if(mode==='unavailable'||!learner){
    s.mode='unavailable';s.error=error?.messagePL??'Brak odpowiedzi AI.';r.unavailable=true;
    break;
   }
   s.mode=mode;s.error='';r.unavailable=false;
   addMessage({text:learner.utterancePL+(learner.followUpPL?' '+learner.followUpPL:''),source:mode,speaker:'piko'});
   if(r.role==='teach')r.lessonReply={text:learner.utterancePL,source:mode};
   if(r.role==='robot_transfer'){
    if(learner.proposedExpression){
     r.robot=action.envelope;r.robotTurns++;r.robotChecked=false;r.prediction='';
     if(mode==='live')r.robotFailures=Math.max(0,r.robotFailures-1);
    }else r.unavailable=true;
   }
   break;
  }
  case 'AI_ERROR':
   if(s.activeTurnId!==action.turnId||s.viewRevision!==action.revision)return state;
   s.busy=false;s.activeTurnId=null;s.mode='unavailable';s.error=action.message;r.unavailable=true;break;
  case 'MODE':invalidate();s.mode=action.mode;break;
  case 'STATUS':s.liveAvailable=action.live;break;
  case 'SETTINGS':s.settings={...s.settings,...action.settings};break;
  case 'CLEAR_CHAT_START':
   if(s.busy||r.role!=='teach')return state;
   s.busy=true;s.activeTurnId=action.turnId;s.error='';break;
  case 'CLEAR_CHAT':
   if(s.activeTurnId!==action.turnId||s.viewRevision!==action.revision)return state;
   invalidate();
   if(action.error){s.error=action.error;break;}
   r.messages=[];r.lessonReply=null;r.liveChat=false;break;
  case 'REPLAY':
   if(!s.runs[action.id]?.completed)return state;
   invalidate();s.archive[action.id]=[...(s.archive[action.id]??[]),s.runs[action.id]];s.runs[action.id]=newRun(action.id);s.missionId=action.id;s.page='game';break;
 }
 return s;
}
