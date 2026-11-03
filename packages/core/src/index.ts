export * from './types';
export * from './parser';
import { ExpressionError, parseExpression } from './parser';
import type { EngineResult, Event, Fact, Mission, NumericEvidence, Polynomial, Scene } from './types';
export const EPS = 1e-9, RADIUS = 0.12;
export const evaluatePolynomial = (p: Polynomial, x: number) => (p.c2*x+p.c1)*x+p.c0;
export function polynomialRange(p: Polynomial, a: number, b: number) {
  const points = [a,b];
  const vertex = p.c2 !== 0 ? -p.c1/(2*p.c2) : NaN;
  if (a <= vertex && vertex <= b) points.push(vertex);
  const ys = points.map(x => evaluatePolynomial(p,x));
  return { min: Math.min(...ys), max: Math.max(...ys), points };
}
export function roots(p: Polynomial, y: number): number[] {
  const {c2:a,c1:b} = p, c = p.c0-y;
  if (a === 0) return b === 0 ? [] : [-c/b];
  const disc = b*b-4*a*c;
  if (disc < 0) return [];
  if (disc === 0) return [-b/(2*a)];
  const q = -0.5*(b+(b >= 0 ? 1 : -1)*Math.sqrt(disc));
  return [q/a,c/q].sort((x,z) => x-z);
}
export const resultMessages: Record<string,string> = {
 SUCCESS:'Bezpieczny lot. Wszystkie bramki zaliczone.', FAMILY_MISMATCH:'W tej misji użyj dozwolonej rodziny funkcji.',
 CONSTRAINT_VIOLATION:'Zachowaj podane blokady współczynników i wierzchołka.', START_MISS:'Tor omija otwór startowy. Sprawdź wysokość przy starcie.',
 OUT_OF_BOUNDS:'Fragment toru wychodzi poza planszę. Cały robot musi zmieścić się w jej granicach.', OBSTACLE_COLLISION:'Piko dotyka przeszkody. Zostaw miejsce na jego szerokość.',
 GATE_MISS:'Piko nie mieści się w bramce lub mecie. Sprawdź wskazany punkt.'
};
export function evaluateScene(scene: Scene, expression: string): EngineResult {
  let parsed: ReturnType<typeof parseExpression>;
  try { parsed = parseExpression(expression); } catch (e) {
    if (!(e instanceof ExpressionError)) throw e;
    return {ok:false,parseable:false,primaryCode:e.code,messagePL:e.message,diagnostics:[e.code],checkpoints:[],firstPhysicalEvent:null,canonicalPolynomial:null};
  }
  const p=parsed.coefficients, d=scene.domain, diagnostics: string[]=[], events: Event[]=[];
  const addEvent = (x:number,code:string,subject:string) => events.push({x,y:evaluatePolynomial(p,x),code,subject});
  if (!scene.allowedFamilies.includes(parsed.family)) diagnostics.push('FAMILY_MISMATCH');
  const lockBad = Object.entries(scene.coefficientLocks).some(([key,v])=>Math.abs(p[key as keyof Polynomial]-v!)>EPS);
  const vx=p.c2 !== 0 ? -p.c1/(2*p.c2) : NaN;
  const vertexBad = scene.vertexLock && (p.c2 === 0 || (scene.vertexLock.x !== undefined && Math.abs(vx-scene.vertexLock.x)>EPS) || (scene.vertexLock.y !== undefined && Math.abs(evaluatePolynomial(p,vx)-scene.vertexLock.y)>EPS));
  if (lockBad || vertexBad) diagnostics.push('CONSTRAINT_VIOLATION');
  const checkpoints = [{id:'start',...scene.start},...scene.gates,{id:'goal',...scene.goal}].map(g=>{
    const y=evaluatePolynomial(p,g.x),passed=y>=g.yMin+RADIUS-EPS&&y<=g.yMax-RADIUS+EPS;
    if (!passed) addEvent(g.x,g.id==='start'?'START_MISS':'GATE_MISS',g.id);
    return {id:g.id,x:g.x,y,passed};
  });
  if (!checkpoints[0].passed) diagnostics.push('START_MISS');
  const range=polynomialRange(p,d.xMin,d.xMax),lo=d.yMin+RADIUS-EPS,hi=d.yMax-RADIUS+EPS;
  if (range.min<lo || range.max>hi) {
    diagnostics.push('OUT_OF_BOUNDS');
    const points=[d.xMin,d.xMax,...roots(p,lo),...roots(p,hi)].filter(x=>x>=d.xMin&&x<=d.xMax).sort((a,b)=>a-b);
    for (let i=0;i<points.length;i++) {
      const x=points[i],y=evaluatePolynomial(p,x),mid=i+1<points.length?evaluatePolynomial(p,(x+points[i+1])/2):y;
      if (y<lo||y>hi||mid<lo||mid>hi) { addEvent(x,'OUT_OF_BOUNDS','domain'); break; }
    }
  }
  for (const o of scene.obstacles) {
    const a=Math.max(d.xMin,o.xMin-RADIUS),b=Math.min(d.xMax,o.xMax+RADIUS);
    if (a>b) continue;
    const lower=o.yMin-RADIUS-EPS,upper=o.yMax+RADIUS+EPS, r=polynomialRange(p,a,b);
    if (r.max<lower || r.min>upper) continue;
    if (!diagnostics.includes('OBSTACLE_COLLISION')) diagnostics.push('OBSTACLE_COLLISION');
    const points=[a,b,...roots(p,lower),...roots(p,upper)].filter(x=>x>=a&&x<=b).sort((x,y)=>x-y);
    const x=points.find(x=>{const y=evaluatePolynomial(p,x);return y>=lower-EPS&&y<=upper+EPS;});
    if (x !== undefined) addEvent(x,'OBSTACLE_COLLISION',o.id);
  }
  if (checkpoints.slice(1).some(c=>!c.passed)) diagnostics.push('GATE_MISS');
  const code=diagnostics[0]??'SUCCESS';
  events.sort((a,b)=>a.x-b.x);
  return {ok:code==='SUCCESS',parseable:true,primaryCode:code,messagePL:resultMessages[code],diagnostics,checkpoints,firstPhysicalEvent:events[0]??null,canonicalPolynomial:p};
}
export function verifyNumericEvidence(scene: Scene, expression: string, evidence: NumericEvidence[]) {
  const result=evaluateScene(scene,expression);
  const checks=['G1','G2'].map(id=>{
    const matches=evidence.filter(e=>e.checkpointId===id&&e.sceneId===scene.id);
    const actual=result.checkpoints.find(c=>c.id===id)?.y;
    return {checkpointId:id,actualY:actual??null,matched:matches.length===1&&actual!==undefined&&Number.isFinite(matches[0].submittedY)&&Math.abs(matches[0].submittedY-actual)<=1e-6};
  });
  return {qualified:result.ok&&evidence.length===2&&checks.every(c=>c.matched),checks};
}
export function deriveRuleEvidence(mission: Mission, expression: string, evidence: NumericEvidence[]) {
  return verifyNumericEvidence(mission.scenes.teach,expression,evidence).qualified ? {ruleId:mission.canonicalRuleId,ruleText:mission.ruleText,contentVersion:'1.0.0',missionId:mission.id,candidateExpression:expression,numericEvidence:evidence} : null;
}
export function buildSceneFacts(scene: Scene, expression: string): Fact[] {
  const r=evaluateScene(scene,expression);
  return [{id:'F_CANDIDATE_VALIDATION',kind:'validation',subject:expression,value:r.primaryCode,textPL:r.messagePL},...r.checkpoints.map(c=>({id:`F_CANDIDATE_${c.id}_VALUE`,kind:'checkpoint',subject:expression,value:{x:c.x,y:c.y,passed:c.passed},textPL:`${c.id}: dla x=${c.x} wzór daje y=${c.y}; ${c.passed?'prześwit zachowany':'brak prześwitu'}.`}))];
}
