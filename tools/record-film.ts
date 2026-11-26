/**
 * Nagrywa materiał do filmu konkursowego: prawdziwa rozgrywka M04 z AI live (Claude).
 * Scenariusz: niepełna lekcja -> Piko się rozbija -> poprawa lekcji -> Piko przelatuje.
 * Wymaga `npm run dev` z AI_MODE=live. Wykonuje ok. 4 płatne tury (kilka groszy).
 * Nagranie w podwójnej gęstości (2560x1600) pozwala na ostre zbliżenia w montażu.
 * Wynik: var/film/raw.webm i var/film/markers.json.
 */
import {chromium,type Page,type Locator} from 'playwright';
import {mkdir,writeFile,rename} from 'node:fs/promises';
import data from '../content/missions.v1.json';
import type {Envelope} from '@piko/contracts';

const BASE='http://127.0.0.1:5173/';
const W=1920,H=1200,ZOOM=1.5; // układ jak na laptopie 1280x800, renderowany ostrzej
const pause=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
const browser=await chromium.launch();

async function selectMode(p:Page,mode:'demo'|'live'){
 await p.getByRole('button',{name:'Ustawienia',exact:true}).click();
 await p.getByRole('button',{name:`Wybierz ${mode}`,exact:true}).click();
 await p.getByRole('button',{name:'Wróć do gry'}).click();
}
async function quickMission(p:Page,m:typeof data.missions[number]){
 await p.getByLabel('Wzór funkcji',{exact:true}).fill(m.scenes.practice.witness.expression);
 await p.getByLabel('Wzór funkcji',{exact:true}).press('Enter');
 await p.getByRole('button',{name:'Teraz naucz Piko'}).click();
 await p.getByLabel('Twój poprawiony wzór').fill(m.scenes.teach.witness.expression);
 await p.getByLabel('Co Piko powinien zmienić i dlaczego?').fill(m.ruleText);
 await p.getByRole('button',{name:'Sprawdź naprawę'}).click();
 await p.getByRole('button',{name:'Zapisz notatkę dla Piko'}).click();
 await p.getByRole('button',{name:'Piko, spróbuj sam'}).click();
 await p.getByRole('button',{name:'Sprawdź lot Piko'}).click();
 await p.getByRole('button',{name:'Teraz mój samodzielny lot'}).click();
 await p.getByLabel('Wzór funkcji',{exact:true}).fill(m.scenes.human_check.witness.expression);
 await p.getByLabel('Wzór funkcji',{exact:true}).press('Enter');
 await p.getByRole('button',{name:'Zobacz podsumowanie'}).click();
 await p.getByRole('button',{name:'Następna misja'}).click();
}

// Przygotowanie poza kadrem: M01–M03 w trybie pokazowym, żeby odblokować M04.
const setup=await browser.newContext({reducedMotion:'reduce'});
const sp=await setup.newPage();
await sp.goto(BASE);
await sp.getByRole('button',{name:'Rozpocznij'}).click();
await selectMode(sp,'demo');
for(const m of data.missions.slice(0,3))await quickMission(sp,m);
await selectMode(sp,'live');
await sp.getByRole('button',{name:/Strona główna|strona główna/}).click();
const storage=await setup.storageState();await setup.close();

await mkdir('var/film',{recursive:true});
const ctx=await browser.newContext({storageState:storage,viewport:{width:W,height:H},
 recordVideo:{dir:'var/film',size:{width:W,height:H}}});
await ctx.addInitScript(z=>{document.documentElement.style.zoom=String(z);},ZOOM);
// Widoczny kursor i efekt kliknięcia (nagranie Playwright nie pokazuje systemowego kursora).
await ctx.addInitScript(()=>{
 addEventListener('DOMContentLoaded',()=>{
  const c=document.createElement('div');c.id='film-cursor';
  c.innerHTML='<svg width="28" height="28" viewBox="0 0 28 28"><path d="M4 2l18 10-8 2-3 8z" fill="#1b2a4a" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>';
  Object.assign(c.style,{position:'fixed',left:'900px',top:'700px',zIndex:'99999',pointerEvents:'none',transition:'left .55s cubic-bezier(.3,.7,.3,1), top .55s cubic-bezier(.3,.7,.3,1)',filter:'drop-shadow(0 2px 3px rgba(0,0,0,.3))'});
  document.body.append(c);
  const w=window as unknown as {__cursor:(x:number,y:number)=>void;__click:()=>void};
  const z=parseFloat(document.documentElement.style.zoom||'1');
  w.__cursor=(x,y)=>{c.style.left=`${x/z-4}px`;c.style.top=`${y/z-2}px`;};
  w.__click=()=>{const r=document.createElement('div');const x=parseFloat(c.style.left)+4,y=parseFloat(c.style.top)+2;
   Object.assign(r.style,{position:'fixed',left:`${x-18}px`,top:`${y-18}px`,width:'36px',height:'36px',borderRadius:'50%',border:'3px solid #ff9f1c',zIndex:'99998',pointerEvents:'none',transition:'transform .45s ease-out, opacity .45s ease-out'});
   document.body.append(r);requestAnimationFrame(()=>{r.style.transform='scale(1.8)';r.style.opacity='0';});setTimeout(()=>r.remove(),500);};
 });
});
const p=await ctx.newPage();
const t0=Date.now();
type Rect={x:number;y:number;w:number;h:number};
const markers:{id:string;t:number;focus:Rect|null}[]=[];
const replies:Envelope[]=[];
const errors:string[]=[];p.on('pageerror',e=>errors.push(e.message));

const rectOf=async(sel:string|null):Promise<Rect|null>=>{
 if(!sel)return null;const box=await p.locator(sel).first().boundingBox().catch(()=>null);
 return box?{x:box.x,y:box.y,w:box.width,h:box.height}:null;
};
const mark=async(id:string,focus:string|null=null)=>{markers.push({id,t:(Date.now()-t0)/1000,focus:await rectOf(focus)});console.log('mark',id);};
const scrollTo=async(l:Locator,block:ScrollLogicalPosition='center')=>{await l.evaluate((el,b)=>el.scrollIntoView({block:b,behavior:'smooth'}),block);await pause(800);};
const pointAt=async(l:Locator)=>{const b=await l.boundingBox();if(!b)return;await p.evaluate(([x,y])=>(window as unknown as {__cursor:(x:number,y:number)=>void}).__cursor(x,y),[b.x+b.width/2,b.y+b.height/2]);await pause(650);};
const click=async(l:Locator)=>{await pointAt(l);await p.evaluate(()=>(window as unknown as {__click:()=>void}).__click());await pause(120);await l.click();};
const typeInto=async(l:Locator,text:string,delay=38)=>{await scrollTo(l);await click(l);await l.fill('');await l.pressSequentially(text,{delay});};
const ask=async(button:string)=>{
 const next=p.waitForResponse(r=>r.url().endsWith('/api/learner-turn')&&r.request().method()==='POST',{timeout:130000});
 await click(p.getByRole('button',{name:button,exact:true}));
 const env=await (await next).json() as Envelope;
 if(env.mode!=='live'||!env.learner)throw new Error('Brak odpowiedzi live: '+(env.error?.code??'?'));
 replies.push(env);await pause(700);return env;
};

const m=data.missions[3];
await p.goto(BASE);
await p.getByRole('heading',{level:1}).waitFor();await pause(1000);
await mark('home','.hero');await pause(5500);

await click(p.getByRole('button',{name:/^Misje/}));await pause(700);
await mark('missions','.mission-grid');await pause(4500);
await click(p.getByRole('button',{name:/Otwórz misję/}).last());await pause(900);

// 1. Twój lot
const expr=p.getByLabel('Wzór funkcji',{exact:true});
await mark('practice','.flight');
await typeInto(expr,m.scenes.practice.initialExpression);await pause(300);await expr.press('Enter');await pause(3600);
await mark('practice-fix','.flight');
await typeInto(expr,m.scenes.practice.witness.expression);await pause(300);await expr.press('Enter');await pause(3600);
await click(p.getByRole('button',{name:'Teraz naucz Piko'}));await pause(400);

// 2. Lekcja 1: niepełna
await p.evaluate(()=>window.scrollTo({top:0,behavior:'smooth'}));
await mark('teach-idea','.game-grid');await pause(4200);
await mark('teach-fix','.flight');
await typeInto(p.getByLabel('Twój poprawiony wzór'),m.scenes.teach.witness.expression);
await click(p.getByRole('button',{name:'Sprawdź naprawę'}));await pause(3400);
const explanation=p.getByLabel('Co Piko powinien zmienić i dlaczego?');
await scrollTo(explanation);
await mark('teach-weak','.side');
await typeInto(explanation,'Trzeba zamienić minus na plus. Plus w nawiasie przesuwa parabolę.');
await ask('Powiedz Piko');
await scrollTo(p.locator('.note-card'),'center');
await mark('teach-weak-belief','.note-card');await pause(3500);
await click(p.getByRole('button',{name:'Zapisz notatkę dla Piko'}));await pause(900);

// 3. Lot Piko 1: rozbicie
await p.evaluate(()=>window.scrollTo({top:0,behavior:'smooth'}));await pause(600);
await mark('transfer1','.game-grid');
const first=await ask('Piko, spróbuj sam');
await scrollTo(p.locator('.proposal'),'center');
await mark('transfer1-reason','.proposal');await pause(3500);
await click(p.getByRole('button',{name:'Sprawdź lot Piko'}));
await p.evaluate(()=>window.scrollTo({top:0,behavior:'smooth'}));await pause(3400);
await mark('transfer1-crash','.flight');await pause(2500);
const crash=p.getByRole('button',{name:'Popraw lekcję dla Piko'});
await scrollTo(crash);
await mark('transfer1-hint','.side');await pause(2500);
await click(crash);await pause(900);

// 4. Lekcja 2: pełna
await scrollTo(explanation);
await mark('teach-good','.side');
await typeInto(explanation,'Nawias (x+1) zeruje się dla x = −1, więc tam jest wierzchołek, o 1 w lewo. Liczba w nawiasie z przeciwnym znakiem to x wierzchołka.',30);
await ask('Powiedz Piko');
await scrollTo(p.locator('.note-card'),'center');
await mark('teach-good-belief','.note-card');await pause(3800);
await click(p.getByRole('button',{name:'Zapisz notatkę dla Piko'}));await pause(900);

// 5. Lot Piko 2: sukces
await p.evaluate(()=>window.scrollTo({top:0,behavior:'smooth'}));await pause(600);
await mark('transfer2','.game-grid');
const second=await ask('Piko, spróbuj sam');
await scrollTo(p.locator('.proposal'),'center');
await mark('transfer2-reason','.proposal');await pause(3200);
await click(p.getByRole('button',{name:'Sprawdź lot Piko'}));
await p.evaluate(()=>window.scrollTo({top:0,behavior:'smooth'}));await pause(3400);
await mark('transfer2-success','.flight');await pause(2600);
await click(p.getByRole('button',{name:'Teraz mój samodzielny lot'}));await pause(900);

// 6. Sprawdź siebie
await p.evaluate(()=>window.scrollTo({top:0,behavior:'smooth'}));
await mark('human','.game-grid');
await typeInto(expr,m.scenes.human_check.witness.expression);await pause(300);await expr.press('Enter');await pause(3600);
await click(p.getByRole('button',{name:'Zobacz podsumowanie'}));await pause(900);
await mark('summary','main');await pause(4000);

// 7. Dziennik: co zapamiętał Piko vs. zasada gry
await click(p.getByRole('button',{name:'Dziennik zasad'}));await pause(900);
const entry=p.locator('.journal-entry').last();await scrollTo(entry);
await mark('journal','.journal-entry >> nth=-1');await pause(4500);
await mark('end');await pause(400);

const video=p.video()!;await ctx.close();
await rename(await video.path(),'var/film/raw.webm');
const ok={crash:first.proposalValidation.status==='failed',success:second.proposalValidation.status==='passed'};
await writeFile('var/film/markers.json',JSON.stringify({viewport:{w:W,h:H,scale:1},markers,errors,ok,replies:replies.map(r=>({scene:r.sceneId,utterance:r.learner?.utterancePL,followUp:r.learner?.followUpPL,belief:r.learner?.pikoBeliefPL,assessment:r.learner?.explanationAssessment,expression:r.learner?.proposedExpression,validation:r.proposalValidation.status}))},null,2));
await browser.close();
console.log('DONE',JSON.stringify({errors,ok}));
