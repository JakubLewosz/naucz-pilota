import type {GameState} from './state';

export function hasIndependentAttempt(state:GameState,missionId:string){
 return state.runs[missionId]?.firstHuman?.result.parseable===true;
}

export function canOpenPage(state:GameState,page:GameState['page']){
 const current=state.runs[state.missionId];
 if(page==='journal')return current.role!=='human_check'||hasIndependentAttempt(state,state.missionId);
 if(page==='summary')return current.completed&&hasIndependentAttempt(state,state.missionId);
 return true;
}

// A replay has a fresh independent attempt, even when an archived run was completed.
export function visibleJournalRules(state:GameState){
 return state.rules.filter(rule=>hasIndependentAttempt(state,rule.missionId));
}

export function rulesForAiTurn(state:GameState,role:'teach'|'robot_transfer'){
 const prior=visibleJournalRules(state).map(({missionId,candidateExpression,numericEvidence})=>(
  {missionId,candidateExpression,numericEvidence}
 ));
 const current=state.runs[state.missionId].rule;
 if(role==='robot_transfer'&&current){
  return [...prior.filter(rule=>rule.missionId!==state.missionId),current];
 }
 return prior;
}

export function markJournalReview(state:GameState){
 for(const rule of visibleJournalRules(state))state.runs[rule.missionId].afterReview=true;
}
