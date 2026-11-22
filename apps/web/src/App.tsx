import {useEffect,useReducer,useRef,useState} from 'react';
import {hints,missionById,missions} from '@piko/content';
import {deriveRuleEvidence,parseExpression,type EngineResult,type Event} from '@piko/core';
import type {LearnerRequest} from '@piko/contracts';
import {Board} from './Board';
import {Piko} from './Piko';
import {HeroSheet,MissionSketch} from './Sketches';
import {nextStep,prettyFormula,teachChecklist} from './guidance';
import {canOpenPage,hasIndependentAttempt,rulesForAiTurn,visibleJournalRules} from './review';
import {clearConversation,getStatus,sendTurn,setAccessCode,startSession} from './transport';
import {backupSave,canAskRobot,hasCompleted,loadState,numericEvidence,persistState,reducer,removeSave,roles,roleLabels,type Attempt,type GameState,type LessonReply,type Run} from './state';
const formulaKeys:[string,string][]=[['x','x'],['x²','x^2'],['(','('],[')',')'],['+','+'],['−','-'],['·','*'],['/','/'],[',',',']];
const modeText={demo:'Tryb pokazowy — gotowe odpowiedzi',live:'Prawdziwe AI — Claude',unavailable:'AI niedostępne — brak odpowiedzi'};
const familyName={constant:'funkcja stała',linear:'funkcja liniowa',quadratic:'funkcja kwadratowa'};
const coefficientName={c2:'a',c1:'b',c0:'c'};
const pointName=(id:string)=>id==='start'?'Start':id==='goal'?'Meta':id;
function eventLabel(event:Event){
 if(event.code==='OUT_OF_BOUNDS')return 'wyjście poza granice planszy';
 if(event.code==='OBSTACLE_COLLISION')return `zderzenie z przeszkodą ${event.subject}`;
 if(event.subject==='start')return 'minięcie otworu startowego';
 if(event.subject==='goal')return 'minięcie mety';
 return `minięcie bramki ${event.subject}`;
}
function FlightResult({attempt,robotStart}:{attempt:Attempt;robotStart?:{yMin:number;yMax:number}}){
 const {expression,result}=attempt;
 const missedStart=result.primaryCode==='START_MISS'?result.checkpoints.find(point=>point.id==='start'):undefined;
 return <section className={result.ok?'success':'error'} data-testid="engine-result" aria-label="Wynik lotu">
  <h3>Wynik lotu</h3>
  <p>Wzór <code>f(x) = {expression}</code></p>
  <strong>{result.ok?'✓':'×'} {result.messagePL}</strong>
  {result.firstPhysicalEvent&&<p>Co poszło nie tak: {eventLabel(result.firstPhysicalEvent)}, x ≈ {result.firstPhysicalEvent.x.toFixed(3)}.</p>}
  {robotStart&&missedStart&&<p>Przy x = {missedStart.x} tor osiągnął y = {Number(missedStart.y.toFixed(6))}. Otwór startowy sięga od y = {robotStart.yMin} do y = {robotStart.yMax}.</p>}
  <details>
   <summary>Dlaczego? Wysokość toru w każdym punkcie</summary>
   <ul>{result.checkpoints.map(c=><li key={c.id}>{c.passed?'✓':'×'} {pointName(c.id)}: x={c.x}, y={Number(c.y.toFixed(6))}</li>)}</ul>
   <p className="muted">Kod techniczny: {result.primaryCode}{result.firstPhysicalEvent&&`, ${result.firstPhysicalEvent.subject}`}</p>
  </details>
 </section>;
}
function LessonText({explanation,paraphrase,source}:{explanation:string;paraphrase:string|null;source?:string}){
 return <dl className="lesson-text">
  <dt>Twoje wyjaśnienie</dt><dd>{explanation}</dd>
  <dt>{source==='demo'?'Przygotowany komentarz Piko (tryb pokazowy)':source==='live'?'Jak zrozumiał to Piko':'Odpowiedź Piko'}</dt>
  <dd>{paraphrase??'Bez odpowiedzi Piko — zapisujemy Twoje słowa.'}</dd>
 </dl>;
}
const assessmentText={
 sound:'Wyjaśnienie opisuje sprawdzoną zasadę.',
 partial:'Wyjaśnienie zawiera część potrzebnej wskazówki.',
 incorrect:'W wyjaśnieniu jest błąd. Możesz poprawić swoje słowa.',
 unclear:'Wyjaśnienie wymaga doprecyzowania.',
 not_applicable:'W tekście brakuje użytecznej wskazówki.'
};
function LessonAssessment({reply}:{reply:LessonReply|null}){
 if(reply?.source==='live'&&reply.assessment){
  return <p><strong>Ocena Twojego wyjaśnienia (AI)</strong><br/><span>{assessmentText[reply.assessment]}</span></p>;
 }
 return <p className="muted">{reply?.source==='demo'?'W trybie pokazowym Piko ma gotowy komentarz.':'Notatka bez oceny wyjaśnienia.'}</p>;
}
function robotOutcome(r?:Run){
 const attempt=r?.attempts.robot_transfer?.at(-1);
 if(attempt)return `${attempt.result.ok?'Bezpieczny lot':'Lot nieudany'} (${attempt.source==='live'?'prawdziwe AI':'tryb pokazowy'})`;
 return r?.robotDisposition==='skipped'?'Pominięto lot Piko.':'Brak sprawdzonego lotu Piko.';
}
function Summary({r}:{r:Run}){
 const first=r.firstHuman;
 return <div className="summary-grid">
  <div><h3>Zasada z lekcji</h3>
   <p>{r.rule?missionById(r.rule.missionId).ruleText:'Jeszcze bez zapisanej zasady.'}</p>
   {r.rule?.lessonNote&&<LessonAssessment reply={r.lessonReply}/>}
  </div>
  <div><h3>Lot Piko</h3><p>{robotOutcome(r)}</p>
   {r.robotDisposition==='skipped'&&r.attempts.robot_transfer?.length?<p>Pominięto dalszy lot Piko.</p>:null}
  </div>
  <div className="yours"><h3>Twój samodzielny lot</h3>
   <p>Pierwsza próba: <strong>{first?.result.ok?'poprawna':first?'do poprawy':'jeszcze przed Tobą'}</strong></p>
   <p>Liczba prób: {r.counts.human_check??0}{r.afterReview?', z przeglądem zasad':''}</p>
  </div>
 </div>;
}
export function App(){
 const [s,dispatch]=useReducer(reducer,undefined,()=>loadState());
 const [saveError,setSaveError]=useState<string|null>(null),[systemReduced,setSystemReduced]=useState(false),[confirmReset,setConfirmReset]=useState(false);
 const [accessInput,setAccessInput]=useState(''),[accessFeedback,setAccessFeedback]=useState(''),[checkingAccess,setCheckingAccess]=useState(false);
 const heading=useRef<HTMLHeadingElement>(null),abort=useRef<AbortController|null>(null),exprRef=useRef<HTMLInputElement>(null);
 const m=missionById(s.missionId),r=s.runs[s.missionId],role=r.role,scene=m.scenes[role];
 const last=r.attempts[role]?.at(-1),blind=role==='human_check'&&!hasIndependentAttempt(s,m.id);
 const currentResult:EngineResult|null=last?.expression===r.drafts[role]?last.result:null;
 const reduced=s.settings.reducedMotion||systemReduced;
 useEffect(()=>{setSaveError(persistState(undefined,s));},[s]);
 useEffect(()=>{void getStatus().then(status=>dispatch({type:'STATUS',live:status.mode==='live'&&status.available}));const media=matchMedia('(prefers-reduced-motion: reduce)');setSystemReduced(media.matches);const fn=()=>setSystemReduced(media.matches);media.addEventListener('change',fn);return()=>{media.removeEventListener('change',fn);abort.current?.abort();};},[]);
 useEffect(()=>{heading.current?.focus();},[s.page,s.missionId,r.role]);
 useEffect(()=>{if(!s.busy)abort.current?.abort();},[s.viewRevision,s.busy]);
 useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(e.key==='Escape'&&['journal','settings','about'].includes(s.page))dispatch({type:'OPEN',page:'game'});};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[s.page]);
 function insertIntoFormula(text:string){
  const el=exprRef.current,value=r.drafts[role],start=el?.selectionStart??value.length,end=el?.selectionEnd??value.length;
  dispatch({type:'EDIT',field:'expression',value:value.slice(0,start)+text+value.slice(end)});
  requestAnimationFrame(()=>{el?.focus();el?.setSelectionRange(start+text.length,start+text.length);});
 }
 async function askPiko(){
  if(s.busy||(abort.current&&!abort.current.signal.aborted)||(role==='teach'&&!r.explanation.trim())||(role==='robot_transfer'&&!canAskRobot(s,r)))return;
  if(role!=='teach'&&role!=='robot_transfer')return;
  const revision=s.viewRevision,turnId=crypto.randomUUID(),sceneId=scene.id,mode=s.mode==='demo'?'demo':'live';
  const controller=new AbortController();abort.current=controller;dispatch({type:'AI_START',turnId});
  try{
   const session=await startSession(mode);
   if(controller.signal.aborted)return;
   const numeric=numericEvidence(s),qualified=role==='teach'&&deriveRuleEvidence(m,r.drafts.teach,numeric);
   let candidateExpression:string|null=null;
   if(role==='teach')try{parseExpression(r.drafts.teach);candidateExpression=r.drafts.teach;}catch{/* The explanation can be sent before a parseable repair. */}
   const evidence=rulesForAiTurn(s,role);
   const request:LearnerRequest={schemaVersion:'1.0.0',...session,turnId,missionId:m.id as LearnerRequest['missionId'],sceneRole:role,requestedMode:mode,phase:role==='robot_transfer'?'robot_propose':qualified?'teach_repair':'teach_explain',userMessage:role==='teach'?r.explanation:'',candidateExpression,attemptHistory:(r.attempts[role]??[]).slice(-6).map(a=>({attemptId:a.id,sceneId:a.sceneId,expression:a.expression})),learnedRuleIds:evidence.map(e=>missionById(e.missionId).canonicalRuleId) as LearnerRequest['learnedRuleIds'],numericEvidence:qualified?numeric:[],ruleEvidence:evidence as LearnerRequest['ruleEvidence']};
   const envelope=await sendTurn(request,controller.signal);
   if(!controller.signal.aborted)dispatch({type:'AI_RESULT',turnId,revision,sceneId,envelope});
  }catch(e){if(!controller.signal.aborted)dispatch({type:'AI_ERROR',turnId,revision,message:e instanceof Error?e.message:'Brak odpowiedzi. Wzór i wyjaśnienie są zachowane.'});}
  finally{if(abort.current===controller)abort.current=null;}
 }
 async function resetChat(){
  if(s.busy||role!=='teach')return;
  const turnId=crypto.randomUUID(),revision=s.viewRevision;
  dispatch({type:'CLEAR_CHAT_START',turnId});
  try{
   if(r.liveChat)await clearConversation(scene.id);
   dispatch({type:'CLEAR_CHAT',turnId,revision});
  }catch(error){
   dispatch({type:'CLEAR_CHAT',turnId,revision,error:error instanceof Error?error.message:'Nie udało się wyczyścić rozmowy.'});
  }
 }
 async function connectWithCode(){
  if(checkingAccess)return;
  setCheckingAccess(true);setAccessFeedback('Sprawdzanie dostępu do live…');
  try{
   const status=await setAccessCode(accessInput);
   setAccessInput('');
   dispatch({type:'STATUS',live:status.mode==='live'&&status.available});
   if(status.mode==='live'&&status.available){
    dispatch({type:'MODE',mode:'live'});
    setAccessFeedback('Serwer potwierdził dostęp. Możesz wrócić do gry.');
   }else setAccessFeedback('Serwer nie potwierdził dostępu. Sprawdź kod i połączenie.');
  }catch(error){setAccessFeedback(error instanceof Error?error.message:'Nie udało się sprawdzić dostępu.');}
  finally{setCheckingAccess(false);}
 }
 const canRule=role==='teach'&&r.repairChecked&&r.explanation.trim()&&deriveRuleEvidence(m,r.drafts.teach,numericEvidence(s));
 const journalAvailable=canOpenPage(s,'journal');
 const journalRules=visibleJournalRules(s);
 const go=(page:GameState['page'])=>dispatch({type:'OPEN',page});
 const conversation=<section aria-label="Komentarz Piko">
  <div className="conversation">
   <div role="status">{role==='teach'&&s.busy&&<div className="notice ai-wait"><Piko busy/><p>Piko myśli nad Twoim wyjaśnieniem…</p></div>}</div>
   {r.messages.map((msg,i)=><div className={`message ${msg.speaker==='player'?'from-player':'from-piko'}`} key={i}>
    {msg.speaker!=='player'&&<Piko/>}<div><small>{msg.speaker==='player'?'Ty':`Piko (${msg.source==='live'?'prawdziwe AI':'tryb pokazowy'})`}</small><p>{msg.text}</p></div>
   </div>)}
  </div>
  {role==='teach'&&r.messages.length>0&&<button className="quiet" disabled={s.busy} onClick={()=>void resetChat()}>Wyczyść rozmowę</button>}
 </section>;

 if(s.recovery)return <main className="recovery sheet">
  <h1>Odzyskaj zapis</h1><p>{s.recovery}. Oryginalne dane pozostają zachowane.</p>
  {saveError&&<p role="alert">{saveError}</p>}
  <button onClick={()=>{const error=backupSave();setSaveError(error);if(!error)dispatch({type:'RECOVER'});}}>Zachowaj kopię i rozpocznij nowy zapis</button>
 </main>;
 return <div className={`app page-${s.page}${reduced?' reduced-motion':''}`} style={{fontSize:`${s.settings.fontScale}rem`}}>
 <header className="header"><button className="brand" onClick={()=>go('home')} aria-label="Piko: Misja Funkcja — strona główna"><Piko/><span>Piko<small>Misja Funkcja</small></span></button><nav aria-label="Główna nawigacja"><button className="quiet" onClick={()=>go('missions')}>Misje <span className="count">{missions.filter(m=>hasCompleted(s,m.id)).length}/6</span></button>{journalAvailable&&<button className="quiet" onClick={()=>go('journal')}>Dziennik zasad</button>}<button className="quiet" onClick={()=>go('settings')}>Ustawienia</button></nav><span className={`mode ${s.mode}`} data-testid="ai-mode"><i aria-hidden="true"/>{modeText[s.mode]}</span></header>
 <main>
 {saveError&&<p role="alert" className="notice">{saveError}</p>}
 {s.page==='home'&&<>
  <section className="hero">
   <div className="hero-copy">
    <h1 ref={heading} tabIndex={-1}>Naucz Piko.<br/>Sprawdź siebie.</h1>
    <p className="lead">Ułóż wzór funkcji, który przeprowadzi robota przez bramki. Wyjaśnij mu zasadę własnymi słowami, a potem spróbuj sam na trasie, której jeszcze nie znasz.</p>
    <div className="actions">
     <button onClick={()=>go('game')}>{Object.values(r.counts).length?'Kontynuuj':'Rozpocznij'} misję {m.order}</button>
     <button className="secondary" onClick={()=>go('about')}>Jak działa Piko?</button>
    </div>
    <p className="muted">Bez konta i rankingów. Postęp zostaje na tym urządzeniu.</p>
   </div>
   <HeroSheet/>
  </section>
  <section className="steps-overview" aria-label="Jak przebiega misja">
   {roles.map((step,i)=><div key={step}><b aria-hidden="true">{i+1}</b><strong>{roleLabels[step]}</strong><p>{['Przetestuj własny wzór.','Wyjaśnij, dlaczego działa.','Przewidź i sprawdź jego pomysł.','Nowa plansza. Twój samodzielny lot.'][i]}</p></div>)}
  </section>
  <p className="availability">{s.liveAvailable?'Piko odpowiada przez prawdziwe AI (Claude). Tryb możesz zmienić w ustawieniach.':'Grasz w trybie pokazowym: odpowiedzi Piko są przygotowane wcześniej. Cała gra działa też bez internetu.'}</p>
 </>}
 {s.page==='missions'&&<>
  <h1 ref={heading} tabIndex={-1}>Misje</h1>
  <p className="lead">Sześć misji, od prostej poziomej po parabolę, którą trzeba ustawić w trzech krokach. Kolejna otwiera się po ukończeniu poprzedniej.</p>
  <div className="mission-grid">{missions.map(mission=>{
   const run=s.runs[mission.id],unlocked=mission.order===1||hasCompleted(s,`M0${mission.order-1}`);
   const status=run?.completed?'complete':unlocked?'available':'locked';
   return <article className={`mission-card ${status}`} key={mission.id}>
    <MissionSketch id={mission.id}/>
    <p className="mission-number">Misja {mission.order}</p>
    <h2>{mission.title}</h2><p>{mission.learningGoal}</p>
    <p className="mission-status">{run?.completed?'✓ Ukończona':unlocked?(run?.counts.practice?'W toku':'Dostępna'):`Odblokujesz po misji ${mission.order-1}`}</p>
    {run?.firstHuman&&<p>Pierwszy samodzielny lot: {run.firstHuman.result.ok?'poprawny':'do poprawy'}</p>}
    {unlocked&&<button className="secondary" onClick={()=>dispatch({type:'MISSION',id:mission.id})}>{run?.completed?'Zobacz misję':'Otwórz misję'}</button>}
   </article>;
  })}</div>
 </>}
 {s.page==='game'&&<><div className="mission-heading"><div><p className="mission-number">Misja {m.order} z 6</p><h1 ref={heading} tabIndex={-1}>{m.title}</h1></div><button className="secondary" onClick={()=>go('missions')}>Wróć do misji</button></div><ol className="phase-list">{roles.map((step,i)=><li key={step} aria-current={role===step?'step':undefined} className={role===step?'active':roles.indexOf(role)>i?'done':''}><span>{roles.indexOf(role)>i?'✓':i+1}</span>{roleLabels[step]}</li>)}</ol>
 <div className="game-grid"><section className="flight sheet" aria-label={roleLabels[role]}>
 {role!=='robot_transfer'&&<form className="expression-form" onSubmit={e=>{e.preventDefault();dispatch({type:'CHECK'});}}>{role==='teach'&&<h3>1. Popraw wzór Piko i przewidź wysokość</h3>}<label htmlFor="expression">{role==='teach'?'Twój poprawiony wzór':'Wzór funkcji'}</label><div className="expression-row"><span>f(x) =</span><input ref={exprRef} id="expression" data-testid="expression" value={r.drafts[role]} maxLength={120} autoComplete="off" spellCheck={false} onChange={e=>dispatch({type:'EDIT',field:'expression',value:e.target.value})}/><button disabled={s.busy}>{role==='human_check'?'Sprawdź mój lot':role==='teach'?'Sprawdź naprawę':'Leć'}</button></div><div className="formula-keys" role="group" aria-label="Wstaw do wzoru">{formulaKeys.map(([label,text])=><button type="button" key={label} className="key" aria-label={`Wstaw ${label}`} onClick={()=>insertIntoFormula(text)}>{label}</button>)}</div>
 {r.drafts[role].trim()&&<p className="formula-preview">Gra czyta: <span>f(x) = {prettyFormula(r.drafts[role])}</span></p>}
 {role==='teach'&&<div className="predictions">{scene.gates.map((g,i)=><label key={g.id} htmlFor={`prediction${i}`}>{g.id} (x = {g.x}): przewiduję y =<input id={`prediction${i}`} inputMode="decimal" value={r.predictions[i]} onChange={e=>dispatch({type:'EDIT',field:i===0?'prediction0':'prediction1',value:e.target.value})}/></label>)}</div>}
 {role==='teach'&&r.repairChecked&&<p className={canRule||deriveRuleEvidence(m,r.drafts.teach,numericEvidence(s))?'notice ok':'notice'}>{r.numericFeedback}</p>}
 </form>}
 <Board scene={scene} expression={role==='robot_transfer'?(r.robotChecked?r.robot?.learner?.proposedExpression??'':''):r.drafts[role]} showPath={!blind&&(role!=='robot_transfer'||r.robotChecked)} result={role==='robot_transfer'?r.robotChecked?r.attempts.robot_transfer?.at(-1)?.result??null:null:currentResult} flightId={last?.id} reduced={reduced} hitbox={s.settings.hitbox}/>
 <div className="constraints">
  <strong>Dozwolone funkcje:</strong> {scene.allowedFamilies.map(f=>familyName[f]).join(', ')}.
  {Object.keys(scene.coefficientLocks).length>0&&<p>
   W postaci <strong>y = ax² + bx + c</strong> litery oznaczają liczbę przy x², liczbę przy x i wyraz stały.
   Zachowaj {Object.entries(scene.coefficientLocks).map(([key,value])=>`${coefficientName[key as keyof typeof coefficientName]} = ${value}`).join(', ')}.
  </p>}
  {scene.vertexLock&&<p>Współrzędne wierzchołka: {Object.entries(scene.vertexLock).map(([k,v])=>`${k} = ${v}`).join(', ')}.</p>}
 </div>
 <div aria-live="polite" className="feedback">{s.error&&<p className="error" role="alert">! {s.error}</p>}{last&&!blind&&(role!=='robot_transfer'||r.robotChecked)&&<FlightResult attempt={last} robotStart={role==='robot_transfer'?scene.start:undefined}/>}{blind&&<p className="notice">Nowa plansza, teraz bez podpowiedzi. Tor zobaczysz po zatwierdzeniu wzoru. Błąd składni nie zużywa pierwszej próby.</p>}</div>
 <details className="board-data"><summary>Dane planszy</summary><p>Granice: x od {scene.domain.xMin} do {scene.domain.xMax}; y od {scene.domain.yMin} do {scene.domain.yMax}. Bok Piko: 0,24. Cały robot musi mieścić się w przejściu.</p><ul>{[{id:'Start',...scene.start},...scene.gates,{id:'Cel',...scene.goal}].map(g=><li key={g.id}>{g.id}: x={g.x}, dozwolone y od {g.yMin} do {g.yMax}</li>)}{scene.obstacles.map(o=><li key={o.id}>Przeszkoda {o.id}: x od {o.xMin} do {o.xMax}; y od {o.yMin} do {o.yMax}</li>)}</ul></details>
 </section><aside className="side sheet"><h2>{scene.title}</h2>
 <p className="next-step" aria-live="polite"><strong>Co teraz? </strong>{nextStep(s,r)}</p>
 {role==='teach'&&<ol className="checklist" aria-label="Zadania w tym kroku">{teachChecklist(s,r).map(item=><li key={item.label} className={item.done?'done':''}><span aria-hidden="true">{item.done?'✓':''}</span>{item.label}{item.done&&<span className="sr-only"> (zrobione)</span>}</li>)}</ol>}
 {role==='practice'&&m.order===1&&!(r.attempts.practice??[]).some(a=>a.result.ok)&&<div className="legend-intro"><h3>Jak czytać planszę</h3><ul>
  <li><b className="lg-portal" aria-hidden="true"/>START i META to wlot i wylot. Tor musi przez nie przejść.</li>
  <li><b className="lg-gate" aria-hidden="true"/>G1 i G2 to bramki: przejście między kreskami.</li>
  <li><b className="lg-obstacle" aria-hidden="true"/>Zakreskowany prostokąt to przeszkoda. Nie wolno jej dotknąć.</li>
  <li><b className="lg-piko" aria-hidden="true"/>Piko ma swój rozmiar, więc cały musi zmieścić się w przejściu.</li>
 </ul></div>}
 {role==='practice'&&<><div className="hint-box"><h3>Potrzebujesz wskazówki?</h3><p>Odkrywaj po jednej. Gra zapamięta ich użycie.</p>{hints.missions.find(h=>h.missionId===m.id)?.hints.slice(0,r.hintCount).map(h=><div key={h.level}><strong>{h.level}. {h.titlePL}</strong><p>{h.textPL}</p></div>)}{r.hintCount<3&&<button className="secondary" onClick={()=>dispatch({type:'HINT'})}>Wskazówka {r.hintCount+1} / 3</button>}</div>{last?.result.ok&&<button onClick={()=>dispatch({type:'NEXT'})}>Teraz naucz Piko</button>}</>}
 {role==='teach'&&<><div className="piko-says"><Piko/><div className="bubble"><small>Pomysł Piko (przygotowany)</small><p>{m.scriptedRobotUtterance}</p><code>f(x) = {scene.initialExpression}</code><button className="secondary" onClick={()=>dispatch({type:'CHECK_SCRIPT'})}>Sprawdź pomysł Piko</button></div></div><h3>2. Wyjaśnij Piko zasadę</h3><label htmlFor="explanation">Co Piko powinien zmienić i dlaczego?</label><textarea id="explanation" value={r.explanation} maxLength={600} rows={3} onChange={e=>dispatch({type:'EDIT',field:'explanation',value:e.target.value})}/><p className="muted">Wystarczy jedno lub dwa zdania. {r.explanation.length}/600</p>{s.mode==='live'&&<p className="privacy">Twoje wyjaśnienie trafi do AI. Nie wpisuj danych osobowych.</p>}<button className="secondary" disabled={s.busy||!r.explanation.trim()} onClick={()=>void askPiko()}>Powiedz Piko</button>{conversation}{!s.busy&&r.lessonReply?.assessment&&r.lessonReply.assessment!=='sound'&&<p className="notice">Uzupełnij wyjaśnienie w polu powyżej, odpowiadając na pytanie Piko, i kliknij „Powiedz Piko” jeszcze raz.</p>}{!r.explanation.trim()&&<p className="muted">Najpierw wpisz własną próbę wyjaśnienia.</p>}{canRule&&<div className="rule-card note-card">
  <h3>3. Zapisz notatkę dla Piko</h3>
  <strong>Zasada sprawdzona przez grę</strong><p>{m.ruleText}</p>
  <LessonText explanation={r.explanation} paraphrase={r.lessonReply?.text??null} source={r.lessonReply?.source}/>
  <LessonAssessment reply={r.lessonReply}/>
  {r.lessonReply?.source==='live'
   ? <p className="muted">Jeśli Piko źle Cię zrozumiał, popraw wyjaśnienie i kliknij ponownie „Powiedz Piko”.</p>
   : <p className="muted">{r.lessonReply?.source==='demo'
     ? 'Piko zabierze tę notatkę na nową trasę.'
     : 'Możesz najpierw zapytać Piko albo od razu zapisać notatkę.'}</p>}
  <button disabled={s.busy} onClick={()=>dispatch({type:'CONFIRM_RULE'})}>Zapisz notatkę dla Piko</button>
 </div>}{!canRule&&<p className="muted">Sprawdź bezpieczny tor, obie prognozy i wpisz własne wyjaśnienie, aby przygotować notatkę.</p>}</>}
 {role==='robot_transfer'&&<> <div role="status" id="transfer-wait">{s.busy&&<div className="notice ai-wait">
  <Piko busy/>
  <div>
  <strong>{s.mode==='demo'?'Wczytuję przygotowany lot Piko':'Piko analizuje nową trasę…'}</strong>
  <p>Za chwilę zobaczysz jego wzór i przewidzisz, czy przeleci. Możesz też pominąć jego lot — Twoja notatka zostaje zapisana.</p>
  </div>
 </div>}</div>
 {s.busy&&<button className="secondary" aria-describedby="transfer-wait" onClick={()=>dispatch({type:'SKIP_ROBOT'})}>Pomiń lot Piko i przejdź do własnej próby</button>}
{r.rule?.lessonNote&&<details className="rule-card note-card">
  <summary>Notatka z lekcji Piko</summary>
  <LessonText explanation={r.rule.lessonNote.explanationPL} paraphrase={r.rule.lessonNote.pikoParaphrasePL} source={r.rule.lessonNote.source}/>
  <p><strong>Sprawdzona zasada</strong><br/>{m.ruleText}</p>
 </details>}{r.rule?.lessonNote&&<LessonAssessment reply={r.lessonReply}/>}
 {!r.robot&&<div className="piko-says"><Piko/><div className="bubble"><p>Mam Twoją notatkę. Spróbuję sam dobrać wzór na tej trasie. Ciekawe, czy Twoja lekcja wystarczy?</p></div></div>}
 {r.robot?.learner?.proposedExpression&&<div className="proposal">
  <h3>Propozycja Piko</h3>
  <code>f(x) = {r.robot.learner.proposedExpression}</code>
  {r.robot.learner.utterancePL&&<blockquote className="piko-reason"><small>{r.robot.mode==='live'?'Uzasadnienie Piko (prawdziwe AI)':'Uzasadnienie Piko (tryb pokazowy)'}</small><p>{r.robot.learner.utterancePL}</p></blockquote>}
  <fieldset><legend>Jak przewidujesz?</legend>{['Przeleci','Nie przeleci','Jeszcze nie wiem'].map(p=><label key={p}><input type="radio" name="prediction" checked={r.prediction===p} onChange={()=>dispatch({type:'ROBOT_PREDICTION',value:p})}/>{p}</label>)}</fieldset>
  {!r.robotChecked&&<button disabled={s.busy||!r.prediction} onClick={()=>dispatch({type:'ROBOT_CHECK'})}>Sprawdź lot Piko</button>}
  {!r.prediction&&<p className="muted">Wybierz przewidywanie, by zobaczyć wynik.</p>}
 </div>}
 {s.mode!=='unavailable'&&canAskRobot(s,r)&&<button disabled={s.busy} onClick={()=>void askPiko()}>{r.robotTurns===0?'Piko, spróbuj sam':'Jedna poprawka Piko'}</button>}
 {!s.busy&&(r.robotChecked
  ? <button onClick={()=>dispatch({type:'NEXT'})}>Teraz mój samodzielny lot</button>
  : <button className="secondary" onClick={()=>dispatch({type:'SKIP_ROBOT'})}>Pomiń lot Piko i przejdź do własnej próby</button>)}</>}
 {role==='robot_transfer'&&!r.robot?.learner?.proposedExpression&&r.messages.length>0&&conversation}
 {role==='human_check'&&<><p className="notice">Liczy się pierwsza próba — zapiszemy ją, nawet jeśli potem poprawisz wzór.</p>{r.firstHuman&&<p>Pierwsza próba: <strong>{r.firstHuman.result.ok?'poprawna':'do poprawy'}</strong>. Liczba prób: {r.counts.human_check}.</p>}{r.completed&&<><p className="success">✓ Misja ukończona{(r.counts.human_check??0)>1?` w ${r.counts.human_check}. próbie. Pierwsza próba pozostaje w podsumowaniu.`:'.'}</p><button onClick={()=>dispatch({type:'NEXT'})}>Zobacz podsumowanie</button></>}</>}
 {s.mode==='unavailable'&&['teach','robot_transfer'].includes(role)&&<div className="notice">
  <p>Brak odpowiedzi AI. Twoje wpisy są zachowane.</p>
  {(role==='teach'||canAskRobot(s,r))&&<button className="secondary" disabled={s.busy||role==='teach'&&!r.explanation.trim()} onClick={()=>void askPiko()}>Spróbuj ponownie</button>}
  <button disabled={s.busy} onClick={()=>dispatch({type:'MODE',mode:'demo'})}>Wybierz tryb demonstracyjny</button>
 </div>}
 {s.mode==='live'&&role==='robot_transfer'&&r.robotFailures>=2&&!s.busy&&<div className="notice">
  <p>AI dwa razy nie odpowiedziało. Możesz przejść na tryb pokazowy albo pominąć lot Piko.</p>
  <button onClick={()=>dispatch({type:'MODE',mode:'demo'})}>Wybierz tryb demonstracyjny</button>
 </div>}
 </aside></div></>}
 {s.page==='journal'&&journalAvailable&&<><h1 ref={heading} tabIndex={-1}>Dziennik zasad</h1><p>Zasady, które przekazujesz Piko w lekcjach. Piko pamięta je dzięki notatkom zapisanym w grze.</p>{journalRules.length===0&&<p className="sheet">Zasada pojawi się po pierwszej samodzielnej próbie w danej misji.</p>}{journalRules.map(e=>{const mission=missionById(e.missionId),run=s.runs[e.missionId];return <article className="journal-entry note-card" key={e.missionId}><p className="mission-number">Misja {mission.order}</p><h2>{mission.title}</h2><p>{mission.ruleText}</p><p className="muted">Piko: {robotOutcome(run)}. Twoja pierwsza próba: {run?.firstHuman?(run.firstHuman.result.ok?'poprawna':'do poprawy'):'przed Tobą'}</p></article>;})}<button onClick={()=>go('game')}>Wróć do lotu</button></>}
 {s.page==='summary'&&canOpenPage(s,'summary')&&<><div className="summary-mark" aria-hidden="true"><Piko/><span>✓</span></div><p className="mission-number">Misja {m.order} z 6</p><h1 ref={heading} tabIndex={-1}>{m.order===6?'Dobra robota — wszystkie sześć misji ukończone':'Misja ukończona'}</h1><Summary r={r}/>{s.archive[m.id]?.length>0&&<details><summary>Poprzednie podejścia ({s.archive[m.id].length})</summary>{s.archive[m.id].map(old=><Summary key={old.id} r={old}/>)}</details>}<div className="actions">{m.order<6?<button onClick={()=>dispatch({type:'MISSION',id:`M0${m.order+1}`})}>Następna misja</button>:<button onClick={()=>go('missions')}>Zobacz wszystkie misje</button>}<button className="secondary" onClick={()=>dispatch({type:'REPLAY',id:m.id})}>Powtórz misję</button></div><p className="muted">Powtórka zachowuje pełny zapis poprzedniego podejścia. Wynik opisuje to zadanie; nie jest diagnozą trwałej wiedzy.</p>{m.order===6&&missions.filter(mission=>hasIndependentAttempt(s,mission.id)).map(mission=><section key={mission.id}><h2>{mission.title}</h2>{s.runs[mission.id]&&<Summary r={s.runs[mission.id]}/>}</section>)}</>}
 {s.page==='about'&&<section className="sheet prose"><h1 ref={heading} tabIndex={-1}>Jak działa Piko?</h1><Piko/><p><strong>Piko to robot-uczeń.</strong> Uczy się od Ciebie: gdy wyjaśnisz mu zasadę, sam spróbuje ją zastosować na nowej trasie. Najlepiej uczymy się, tłumacząc coś komuś innemu — i właśnie to robisz w grze.</p><p><strong>Kto tu myśli?</strong> Rozmowę z Piko prowadzi model językowy Claude. Piko może się pomylić, tak jak prawdziwy uczeń. Dlatego każdy lot — Twój i jego — dokładnie przelicza sama gra. To ona decyduje, czy tor przeszedł przez bramki, a nie AI.</p><p><strong>Tryb pokazowy.</strong> Bez połączenia z AI gra działa dalej, a Piko odpowiada gotowymi, wcześniej przygotowanymi tekstami. Zawsze widzisz, który tryb jest włączony.</p><p><strong>Twoje dane.</strong> Postęp zostaje na tym urządzeniu. Nie ma kont ani rankingów. W trybie z AI do serwera trafia tylko treść zadania i Twoje wyjaśnienie; rozmowa wygasa po 24 godzinach, a „Wyczyść rozmowę” usuwa ją od razu.</p><button onClick={()=>go('game')}>Przejdź do lotu</button></section>}
 {s.page==='settings'&&<section className="sheet prose"><h1 ref={heading} tabIndex={-1}>Ustawienia</h1><h2>Połączenie</h2><p>{modeText[s.mode]}</p><div className="actions"><button className="secondary" onClick={()=>dispatch({type:'MODE',mode:'demo'})}>Wybierz demo</button><button className="secondary" onClick={()=>dispatch({type:'MODE',mode:'live'})}>Wybierz live</button></div><p className="muted">„Demo” to tryb pokazowy z gotowymi odpowiedziami — działa bez internetu. „Live” to prawdziwe AI. {s.liveAvailable?'Prawdziwe AI jest teraz dostępne.':'Prawdziwe AI nie jest teraz dostępne.'}</p><details className="access-panel"><summary>Masz kod dostępu do live?</summary>
 <form onSubmit={event=>{event.preventDefault();void connectWithCode();}}>
  <p className="muted">Jeśli prowadzący udostępnił Ci kod, wpisz go tutaj. Dostęp będzie pamiętany do zamknięcia aplikacji lub odświeżenia strony.</p>
  <label htmlFor="access-code">Kod dostępu do live</label>
  <input id="access-code" type="password" autoComplete="off" maxLength={256} value={accessInput} onChange={event=>setAccessInput(event.target.value)}/>
  <button disabled={checkingAccess||!accessInput} type="submit">Połącz z kodem</button>
  <p role="status">{accessFeedback}</p>
 </form>
 </details><h2>Czytelność</h2><label className="check-label"><input type="checkbox" checked={s.settings.reducedMotion} onChange={e=>dispatch({type:'SETTINGS',settings:{reducedMotion:e.target.checked}})}/>Ogranicz animacje</label><p className="muted">Preferencja systemowa ograniczonego ruchu jest zawsze respektowana.</p><label className="check-label"><input type="checkbox" checked={s.settings.hitbox} onChange={e=>dispatch({type:'SETTINGS',settings:{hitbox:e.target.checked}})}/>Pokaż obrys robota</label><label>Wielkość tekstu<select value={s.settings.fontScale} onChange={e=>dispatch({type:'SETTINGS',settings:{fontScale:Number(e.target.value)}})}><option value="1">100%</option><option value="1.25">125%</option><option value="1.5">150%</option><option value="2">200%</option></select></label><h2>Lokalny postęp</h2><p>Usunięcie obejmuje wszystkie misje, pierwsze próby i dziennik na tym urządzeniu.</p>{confirmReset?<div className="notice"><p>Usunąć cały lokalny postęp? Tej operacji nie można cofnąć.</p><button onClick={()=>{const error=removeSave();setSaveError(error);if(!error){dispatch({type:'RESET'});setConfirmReset(false);}}}>Tak, usuń cały postęp</button><button className="secondary" onClick={()=>setConfirmReset(false)}>Anuluj</button></div>:<button className="secondary" onClick={()=>setConfirmReset(true)}>Usuń lokalny postęp</button>}<p><button className="quiet" onClick={()=>go('game')}>Wróć do gry</button></p></section>}
 </main><footer><span>Piko: Misja Funkcja. Gra o funkcjach dla szkół średnich.</span><button className="quiet" onClick={()=>go('about')}>O projekcie i danych</button></footer></div>;
}
