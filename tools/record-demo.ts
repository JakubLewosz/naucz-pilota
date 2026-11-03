import {chromium,type Page} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import data from '../content/missions.v1.json';
import type {Envelope} from '@piko/contracts';
import {PROMPT_VERSION} from '../apps/server/src/system';
const args=process.argv.slice(2);
if(args.some(a=>a!=='--live')||args.length>1)throw new Error('Use no arguments for demo, or explicit --live for paid real-model recording.');
const live=args.includes('--live'),mode=live?'live':'demo';
const browser=await chromium.launch(),setup=await browser.newContext({reducedMotion:'reduce'}),page=await setup.newPage();
const pause=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms)),responses:Envelope[]=[],pageErrors:string[]=[];
async function play(p:Page,m:typeof data.missions[number],slow=false){
 const caption=async(text:string)=>{if(!slow)return;await p.evaluate(({text,label})=>{let el=document.getElementById('recording-caption');if(!el){el=document.createElement('div');el.id='recording-caption';Object.assign(el.style,{position:'fixed',bottom:'10px',left:'20px',right:'20px',padding:'12px',background:'#172033',color:'#fff',zIndex:'10000',borderRadius:'8px',font:'16px system-ui',textAlign:'center'});document.body.append(el);}el.textContent=label+' · '+text;},{text,label:live?'AUTOMATYCZNY POKAZ LIVE':'NAGRANIE DEMO'});await pause(3500);};
 const ask=async(name:string)=>{
  if(!slow||!live){await p.getByRole('button',{name,exact:true}).click();return;}
  const next=p.waitForResponse(r=>r.url().endsWith('/api/learner-turn')&&r.request().method()==='POST',{timeout:20000});
  await p.getByRole('button',{name,exact:true}).click();const response=await next,envelope=await response.json() as Envelope;
  assert.equal(response.status(),200,envelope.error?.code??'Live response failed');assert.equal(envelope.mode,'live');assert.ok(envelope.learner);assert.equal(envelope.model.provider,'openai');responses.push(envelope);
  await p.getByLabel('Komentarz Piko').getByText('MODEL LIVE',{exact:false}).first().waitFor();
 };
 await caption('Misja 4. Wzór wyznacza tor robota; każdą próbę liczy silnik matematyczny.');
 await p.getByLabel('Wzór funkcji',{exact:true}).fill(m.scenes.practice.witness.expression);if(slow)await pause(1500);await p.getByLabel('Wzór funkcji',{exact:true}).press('Enter');
 await caption('Bezpieczny lot. Wskazówki są dostępne wyłącznie w ćwiczeniu.');
 await p.getByRole('button',{name:'Teraz naucz Piko'}).click();await p.getByRole('button',{name:'Sprawdź pomysł Piko'}).click();
 await caption('Piko myli znak w nawiasie. To przygotowane nieporozumienie, wyraźnie opisane jako scenariusz.');
 const scene=m.scenes.teach,w=scene.witness;await p.getByLabel('Twój poprawiony wzór').fill(w.expression);
 for(const [i,g] of scene.gates.entries())await p.locator(`#prediction${i}`).fill(String((w.c2*g.x+w.c1)*g.x+w.c0));
 await p.getByLabel('Co Piko powinien zmienić i dlaczego?').fill(m.id==='M04'?'Nawias x+1 zeruje się dla x=-1. Wierzchołek przesuwa się w lewo.':m.ruleText);
 await caption('Gracz poprawia wzór, przewiduje wartości w G1 i G2 oraz wyjaśnia zmianę.');
 await p.getByRole('button',{name:'Sprawdź naprawę'}).click();await ask('Powiedz Piko');
 await caption(live?'LIVE: to rzeczywista odpowiedź modelu na widoczne wyjaśnienie gracza.':'DEMO: odpowiedź jest scenariuszowa. Prawdziwy model live wymaga klucza i osobnego sprawdzenia.');
 await p.getByRole('button',{name:'Zapisz tę zasadę dla Piko'}).click();await ask('Piko, spróbuj sam');
 if(slow)assert.equal(await p.getByTestId('trajectory').count(),0,'Robot trajectory shown before prediction');
 await caption('Nowa plansza. Zanim odsłonimy tor i wynik, gracz przewiduje skuteczność pomysłu Piko.');
 await p.getByLabel(live&&slow?'Jeszcze nie wiem':'Nie przeleci',{exact:true}).check();await p.getByRole('button',{name:'Sprawdź lot Piko'}).click();
 const success=(await p.getByTestId('engine-result').innerText()).startsWith('✓');
 if(slow&&live)assert.equal(success,responses.at(-1)?.proposalValidation.status==='passed');
 await caption(success?'Silnik potwierdził bezpieczny lot Piko. Wynik robota pozostaje oddzielony od wyniku gracza.':'Pomysł Piko nie działa. Gra zachowuje prawdziwą porażkę i pozwala przejść do zadania gracza.');
 await p.getByRole('button',{name:'Teraz mój samodzielny lot'}).click();
 if(slow){assert.equal(await p.getByTestId('trajectory').count(),0);assert.equal(await p.getByTestId('robot').count(),0);assert.equal(await p.getByRole('button',{name:'Dziennik zasad'}).count(),0);assert.equal(await p.getByLabel('Komentarz Piko').count(),0);}
 await caption('Czwarta, osobna plansza. Bez podglądu trasy, AI, dziennika i podpowiedzi przed pierwszą próbą.');
 let first:unknown;
 if(slow&&live){await p.getByLabel('Wzór funkcji',{exact:true}).fill(m.scenes.human_check.initialExpression);await p.getByLabel('Wzór funkcji',{exact:true}).press('Enter');first=await p.evaluate(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!).runs.M04.firstHuman);await caption('Pokazujemy nieudaną pierwszą próbę. Późniejsza poprawka jej nie nadpisze.');}
 await p.getByLabel('Wzór funkcji',{exact:true}).fill(m.scenes.human_check.witness.expression);if(slow)await pause(1500);await p.getByLabel('Wzór funkcji',{exact:true}).press('Enter');
 await p.getByRole('button',{name:'Zobacz podsumowanie'}).click();
 if(slow&&live){await p.reload();await p.getByRole('heading',{name:'Misja ukończona',exact:true}).waitFor();const after=await p.evaluate(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!).runs.M04);assert.deepEqual(after.firstHuman,first);assert.equal(after.counts.human_check,2);assert.equal(after.firstHuman.result.ok,false);}
 await caption('Podsumowanie rozdziela wynik robota i pierwszą samodzielną próbę. To zapis wykonania zadania, nie diagnoza wiedzy.');
}
try{
 await page.goto('http://127.0.0.1:5173/');await page.getByRole('button',{name:'Zacznij'}).click();
 for(const m of data.missions.slice(0,3)){await play(page,m);await page.getByRole('button',{name:'Następna misja'}).click();}
 const storage=await setup.storageState();await setup.close();
 await mkdir('var/video',{recursive:true});await mkdir('release/media',{recursive:true});
 const recording=await browser.newContext({storageState:storage,viewport:{width:1440,height:900},recordVideo:{dir:'var/video',size:{width:1440,height:900}},reducedMotion:'reduce'});
 const p=await recording.newPage();p.on('pageerror',e=>pageErrors.push(e.message));await p.goto('http://127.0.0.1:5173/');
 if(live){await p.getByRole('button',{name:'Ustawienia',exact:true}).click();await p.getByRole('button',{name:'Wybierz live',exact:true}).click();await p.getByRole('button',{name:'Wróć do gry',exact:true}).click();}
 await play(p,data.missions[3],true);assert.deepEqual(pageErrors,[]);await pause(2000);
 await p.screenshot({path:`checks/browser-${mode}.png`,fullPage:true});const video=p.video()!;await recording.close();const file=await video.path();
 const report={date:new Date().toISOString(),status:'PASS',mode,promptVersion:PROMPT_VERSION,source:path.relative(process.cwd(),file),mission:'M04',automated:true,providerCalls:responses.reduce((n,r)=>n+r.model.requestCount,0),responses,pageErrors,firstIndependentAttemptPreserved:live,note:live?'Actual live model replies, real UI, no substitutions. Author-prepared automated demonstration.':'Actual UI recording. Scripted demo; no live AI claim.'};
 await writeFile(`checks/${live?'browser-live':'demo-recording'}.json`,JSON.stringify(report,null,2)+'\n');console.log(`${mode} recording PASS: ${file}`);
}catch(error){if(live)await writeFile('checks/browser-live.json',JSON.stringify({date:new Date().toISOString(),status:'FAIL',mode,providerCalls:responses.reduce((n,r)=>n+r.model.requestCount,0),error:error instanceof Error?error.message:'Recording failed',responses},null,2)+'\n');throw error;}
finally{await browser.close();}
