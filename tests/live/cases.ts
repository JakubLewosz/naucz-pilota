import data from '../../content/missions.v1.json';
import evals from '../../content/ai-evals.v1.json';
import type {LearnerRequest} from '@piko/contracts';
export type LiveCase={id:string;body:LearnerRequest;rubric:string[];sequence:string};
export function buildLiveCases():LiveCase[]{
 const cases:LiveCase[]=evals.cases.filter(c=>c.kind==='semantic').map(c=>({id:c.id,body:c.request as LearnerRequest,rubric:c.manualRubricPL,sequence:c.id}));
 for(const m of data.missions){
  const s=m.scenes.teach,w=s.witness;
  const evidence=s.gates.map(g=>({sceneId:s.id,checkpointId:g.id as 'G1'|'G2',submittedY:(w.c2*g.x+w.c1)*g.x+w.c0}));
  const base:LearnerRequest={...(evals.cases[0].request as LearnerRequest),missionId:m.id as LearnerRequest['missionId'],userMessage:m.ruleText,candidateExpression:w.expression,numericEvidence:evidence};
  cases.push({id:`${m.id}-teach`,body:base,sequence:m.id,rubric:['Czy Piko reaguje na konkretne wyjaśnienie i pozostaje uczniem?']});
  cases.push({id:`${m.id}-transfer`,body:{...base,phase:'robot_propose',sceneRole:'robot_transfer',candidateExpression:null,userMessage:'',numericEvidence:[],learnedRuleIds:[m.canonicalRuleId] as LearnerRequest['learnedRuleIds'],ruleEvidence:[{missionId:m.id as LearnerRequest['missionId'],candidateExpression:w.expression,numericEvidence:evidence}]},sequence:m.id,rubric:['Czy propozycja wykorzystuje zapisaną zasadę? Wynik lotu jest oddzielnym obliczeniem silnika.']});
 }
 return cases;
}
