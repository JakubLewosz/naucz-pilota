import responseSchema from '../../../contracts/ai-response.schema.json';
import { missionById,collisionRules,missions } from '@piko/content';
import { buildSceneFacts,deriveRuleEvidence,evaluateScene,parseExpression,verifyNumericEvidence,type Fact,type RuleEvidence } from '@piko/core';
import type { LearnerRequest } from './request.generated';
import type { ModelPayload } from './response.generated';
export type { LearnerRequest,ModelPayload };
import {validateRequest,validateModel} from './validators.generated.js';
export {validateRequest,validateModel};
export const providerSchema=Object.fromEntries(Object.entries(responseSchema).filter(([k])=>!['$schema','$id','title'].includes(k)));
export class ContractError extends Error {constructor(public code:string,public status=400){super(code);}}
export type Exchange={userPL:string;pikoPL:string;followUpPL:string|null};
export type Context=ReturnType<typeof buildContext>['context'];
export function buildContext(request:LearnerRequest,previousEvidence:RuleEvidence[]=[],recentExchanges:Exchange[]=[]) {
 if (!validateRequest(request)) throw new ContractError('INVALID_REQUEST');
 if (request.phase==='teach_explain'&&!request.userMessage.trim()) throw new ContractError('INVALID_REQUEST');
 const mission=missionById(request.missionId),s=mission.scenes[request.sceneRole];
 const inputExpressions=[...(request.candidateExpression?[request.candidateExpression]:[]),...request.attemptHistory.map(a=>a.expression)];
 for (const a of request.attemptHistory) if(a.sceneId!==s.id) throw new ContractError('INVALID_REQUEST');
 for (const expression of inputExpressions) try {parseExpression(expression);} catch {throw new ContractError('INVALID_EXPRESSION');}
 if(request.numericEvidence.some(e=>e.sceneId!==s.id)||new Set(request.numericEvidence.map(e=>e.checkpointId)).size!==request.numericEvidence.length) throw new ContractError('INVALID_REQUEST');
 const qualified=new Map<string,RuleEvidence>(),rejected:string[]=[];
 const seen=new Set<string>();
 for(const evidence of [...previousEvidence,...request.ruleEvidence]) {
  if(seen.has(evidence.missionId) && request.ruleEvidence.filter(e=>e.missionId===evidence.missionId).length>1) throw new ContractError('INVALID_REQUEST');
  seen.add(evidence.missionId);
  const m=missionById(evidence.missionId);
  if(deriveRuleEvidence(m,evidence.candidateExpression,evidence.numericEvidence)) qualified.set(m.canonicalRuleId,evidence);
  else rejected.push(m.id);
 }
 if(request.phase==='teach_repair'&&request.candidateExpression&&verifyNumericEvidence(s,request.candidateExpression,request.numericEvidence).qualified) qualified.set(mission.canonicalRuleId,{missionId:mission.id,candidateExpression:request.candidateExpression,numericEvidence:request.numericEvidence});
 const learned=request.learnedRuleIds.filter(id=>qualified.has(id));
 const facts:Fact[]=request.candidateExpression?buildSceneFacts(s,request.candidateExpression):[];
 if(request.numericEvidence.length&&request.candidateExpression) for (const check of verifyNumericEvidence(s,request.candidateExpression,request.numericEvidence).checks) facts.push({id:`F_NUMERIC_${check.checkpointId}_MATCH`,kind:'numeric',subject:request.candidateExpression,value:check.matched,textPL:`Prognoza ${check.checkpointId}: ${check.matched?'zgodna':'niezgodna'} z obliczeniem.`});
 for (const [index,a] of request.attemptHistory.entries()) for (const fact of buildSceneFacts(s,a.expression)) facts.push({...fact,id:`F_HISTORY_${index}_${fact.id}`});
 const context={contextVersion:'1.0.0',phase:request.phase,missionId:mission.id,skillId:mission.skillId,
  scene:{id:s.id,role:s.role,instruction:s.instruction,domain:s.domain,allowedFamilies:s.allowedFamilies,coefficientLocks:s.coefficientLocks,...(s.vertexLock?{vertexLock:s.vertexLock}:{}),start:s.start,goal:s.goal,gates:s.gates,obstacles:s.obstacles,initialExpression:s.initialExpression},
  collisionRules,scriptedOpeningPL:request.sceneRole==='teach'?mission.scriptedRobotUtterance:null,
  candidate:request.candidateExpression?{expression:request.candidateExpression,...parseExpression(request.candidateExpression).coefficients}:null,
  facts,learnedRules:learned.map(id=>({id,textPL:missions.find(m=>m.canonicalRuleId===id)!.ruleText})),eligibleRuleIds:qualified.has(mission.canonicalRuleId)?[mission.canonicalRuleId]:[],recentExchanges:recentExchanges.slice(-6)
 };
 while(JSON.stringify(context).length>16000&&context.recentExchanges.length) context.recentExchanges.shift();
 while(JSON.stringify(context).length>16000&&context.facts.some(f=>f.id.startsWith('F_HISTORY_'))) {const id=context.facts.find(f=>f.id.startsWith('F_HISTORY_'))!.id.split('_').slice(0,3).join('_');context.facts=context.facts.filter(f=>!f.id.startsWith(id+'_'));}
 if(JSON.stringify(context).length>16000) throw new ContractError('CONTEXT_TOO_LARGE');
 return {context,evidence:[...qualified.values()],memory:{learnedRuleIds:learned,qualifiedRuleIds:[...qualified.keys()],newlyQualifiedRuleIds:[...qualified.keys()].filter(id=>!previousEvidence.some(e=>missionById(e.missionId).canonicalRuleId===id)),rejectedEvidenceMissionIds:[...new Set(rejected)]}};
}
export function checkModel(value:unknown,context:Context):value is ModelPayload {
 if(!validateModel(value)) return false;
 const p=value;
 if(new Set(p.usedFactIds).size!==p.usedFactIds.length||p.usedFactIds.some(id=>!context.facts.some(f=>f.id===id))) return false;
 if(p.suggestedRuleId&&(!context.eligibleRuleIds.includes(p.suggestedRuleId)||context.phase==='robot_propose')) return false;
 if(context.phase==='robot_propose') {
  if(p.explanationAssessment!=='not_applicable'||p.followUpPL!==null||p.suggestedRuleId!==null) return false;
  if(p.proposedExpression===null) return p.action==='acknowledge_uncertainty';
  if(p.action!=='propose_attempt') return false;
  try {parseExpression(p.proposedExpression);} catch {return false;}
 } else if(p.proposedExpression!==null||p.action==='propose_attempt') return false;
 return true;
}
export type Envelope={schemaVersion:'1.0.0';sessionId:string;sessionRevision:number;turnId:string;sceneId:string;mode:'live'|'demo'|'unavailable';learner:ModelPayload|null;
 proposalValidation:{status:'not_proposed'|'passed'|'failed'|'invalid_expression';failureCode:string|null;normalizedExpression:string|null;facts:{id:string;textPL:string}[]};
 memory:ReturnType<typeof buildContext>['memory'];model:{provider:'openai'|null;configuredModel:string|null;actualModel:string|null;providerResponseId:string|null;requestCount:number;inputTokens:number|null;outputTokens:number|null;latencyMs:number};error:{code:string;messagePL:string;retryable:boolean}|null};
export function makeEnvelope(request:LearnerRequest,memory:Envelope['memory'],learner:ModelPayload|null,mode:Envelope['mode']):Envelope {
 const s=missionById(request.missionId).scenes[request.sceneRole],proposal=learner?.proposedExpression??null,r=proposal?evaluateScene(s,proposal):null;
 return {schemaVersion:'1.0.0',sessionId:request.sessionId,sessionRevision:request.sessionRevision+1,turnId:request.turnId,sceneId:s.id,mode,learner,
 proposalValidation:{status:r?(r.parseable?(r.ok?'passed':'failed'):'invalid_expression'):'not_proposed',failureCode:r&&!r.ok?r.primaryCode:null,normalizedExpression:r?.canonicalPolynomial?JSON.stringify(r.canonicalPolynomial):null,facts:proposal?buildSceneFacts(s,proposal).map(({id,textPL})=>({id,textPL})):[]},
 memory,model:{provider:null,configuredModel:null,actualModel:null,providerResponseId:null,requestCount:0,inputTokens:null,outputTokens:null,latencyMs:0},error:null};
}
// Explicitly authored DEMO proposals. These are never a fallback for live.
const demoProposals:Record<string,string>={M01:'3',M02:'0.25x+1',M03:'0.25x^2+2',M04:'0.25(x+2)^2',M05:'x^2',M06:'0.25(x+2)^2+1'};
export function demoTurn(request:LearnerRequest):Envelope {
 const {context,memory}=buildContext(request);
 const robot=request.phase==='robot_propose';
 const learner:ModelPayload={utterancePL:robot?'Spróbuję zastosować zapisaną zasadę. Sprawdź mój pomysł na nowej trasie.':'W demonstracji mogę powtórzyć zasadę, ale nie oceniam swobodnego wyjaśnienia. Porównaj swoje prognozy z obliczeniem silnika.',followUpPL:null,explanationAssessment:'not_applicable',proposedExpression:robot?demoProposals[request.missionId]:null,suggestedRuleId:null,usedFactIds:[],action:robot?'propose_attempt':'explain_back'};
 if(!checkModel(learner,context)) throw new Error('Invalid demo fixture');
 return makeEnvelope(request,memory,learner,'demo');
}
