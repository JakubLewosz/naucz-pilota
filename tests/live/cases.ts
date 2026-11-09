import data from '../../content/missions.v1.json';
import evals from '../../content/ai-evals.v1.json';
import type {LearnerRequest,LessonNote} from '@piko/contracts';

export type LiveCase={id:string;body:LearnerRequest;rubric:string[];sequence:string};
type MissionFixture=(typeof data.missions)[number];
const commonRubric='Oddziel wypowiedź modelu od wyniku silnika. Piko pozostaje uczniem i nie zdradza rozwiązania samodzielnej planszy.';

function missionPair(mission:MissionFixture,sequence:string,explanationPL:string,transferRubric:string):LiveCase[]{
 const scene=mission.scenes.teach,witness=scene.witness;
 const missionId=mission.id as LearnerRequest['missionId'];
 const numericEvidence=scene.gates.map(gate=>({
  sceneId:scene.id,
  checkpointId:gate.id as 'G1'|'G2',
  submittedY:(witness.c2*gate.x+witness.c1)*gate.x+witness.c0
 }));
 const lessonNote:LessonNote={
  version:1,ruleId:mission.canonicalRuleId,explanationPL,
  pikoParaphrasePL:null,source:'skipped',confirmation:'saved_by_player'
 };
 const teach:LearnerRequest={
  ...(evals.cases[0].request as LearnerRequest),
  missionId,sceneRole:'teach',phase:'teach_repair',userMessage:explanationPL,
  candidateExpression:witness.expression,numericEvidence,attemptHistory:[],learnedRuleIds:[],ruleEvidence:[]
 };
 const transfer:LearnerRequest={
  ...teach,phase:'robot_propose',sceneRole:'robot_transfer',candidateExpression:null,userMessage:'',numericEvidence:[],
  learnedRuleIds:[mission.canonicalRuleId as LearnerRequest['learnedRuleIds'][number]],
  ruleEvidence:[{missionId,candidateExpression:witness.expression,numericEvidence,lessonNote}]
 };
 return [
  {id:`${sequence}-teach`,body:teach,sequence,rubric:['Czy Piko reaguje na konkretne słowa gracza?',commonRubric]},
  {id:`${sequence}-transfer`,body:transfer,sequence,rubric:[transferRubric,commonRubric]}
 ];
}

export function buildLiveCases():LiveCase[]{
 const semantic:LiveCase[]=evals.cases.filter(test=>test.kind==='semantic').map(test=>({
  id:test.id,body:test.request as LearnerRequest,rubric:test.manualRubricPL,sequence:test.id
 }));
 return [...semantic,...data.missions.flatMap(mission=>missionPair(
  mission,mission.id,mission.ruleText,'Czy Piko odnosi próbę do konkretnej zapisanej notatki i sprawdzonej zasady?'
 ))];
}

export const M04_LESSON_VARIANTS=[
 {
  id:'M04-A',
  explanationPL:'Dla x = −1 nawias x + 1 jest równy zero, więc tam leży wierzchołek. Plus w nawiasie oznacza przesunięcie w lewo.',
  rubric:'Czy Piko odnosi się do znaku i miejsca zerowania nawiasu oraz próbuje zastosować tę ideę na nowej planszy?'
 },
 {
  id:'M04-B',
  explanationPL:'Plus w nawiasie przesuwa parabolę w prawo.',
  rubric:'Czy Piko dostrzega sprzeczność ze sprawdzoną regułą i odróżnia ją od słów gracza?'
 },
 {
  id:'M04-C',
  explanationPL:'abc',
  rubric:'Czy Piko przyznaje, że tekst nie daje użytecznej wskazówki, i opiera próbę na sprawdzonej regule?'
 }
] as const;

export function buildM04LessonCases(){
 const mission=data.missions.find(m=>m.id==='M04')!;
 return M04_LESSON_VARIANTS.flatMap(variant=>missionPair(mission,variant.id,variant.explanationPL,variant.rubric));
}

export function selectLiveCases(filter?:string){
 if(!filter)return buildLiveCases();
 const variants=buildM04LessonCases();
 if(filter==='M04-LESSONS')return variants;
 return [...buildLiveCases(),...variants].filter(test=>test.id===filter||test.sequence===filter);
}
