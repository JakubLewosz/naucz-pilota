import {chromium,type Page} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import data from '../content/missions.v1.json';
const browser=await chromium.launch();
const setup=await browser.newContext({reducedMotion:'reduce'}),page=await setup.newPage();
const pause=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
async function play(p:Page,m:typeof data.missions[number],slow=false){
 const caption=async(text:string)=>{if(!slow)return;await p.evaluate(text=>{let el=document.getElementById('recording-caption');if(!el){el=document.createElement('div');el.id='recording-caption';Object.assign(el.style,{position:'fixed',bottom:'10px',left:'20px',right:'20px',padding:'12px',background:'#172033',color:'#fff',zIndex:'10000',borderRadius:'8px',font:'16px system-ui',textAlign:'center'});document.body.append(el);}el.textContent='NAGRANIE DEMO · '+text;},text);await pause(3500);};
 await caption('Misja 4. Wzór wyznacza tor robota; każdą próbę liczy silnik matematyczny.');
 await p.getByLabel('Wzór funkcji',{exact:true}).fill(m.scenes.practice.witness.expression);if(slow)await pause(1500);await p.getByLabel('Wzór funkcji',{exact:true}).press('Enter');
 await caption('Bezpieczny lot. Wskazówki są dostępne wyłącznie w ćwiczeniu.');
 await p.getByRole('button',{name:'Teraz naucz Piko'}).click();await p.getByRole('button',{name:'Sprawdź pomysł Piko'}).click();
 await caption('Piko myli znak w nawiasie. To przygotowane nieporozumienie, wyraźnie opisane jako scenariusz.');
 const scene=m.scenes.teach,w=scene.witness;await p.getByLabel('Twój poprawiony wzór').fill(w.expression);
 for(const [i,g] of scene.gates.entries())await p.locator(`#prediction${i}`).fill(String((w.c2*g.x+w.c1)*g.x+w.c0));
 await p.getByLabel('Co Piko powinien zmienić i dlaczego?').fill('Nawias x+1 zeruje się dla x=-1. Wierzchołek przesuwa się w lewo.');
 await caption('Gracz poprawia wzór, przewiduje wartości w G1 i G2 oraz wyjaśnia zmianę.');
 await p.getByRole('button',{name:'Sprawdź naprawę'}).click();await p.getByRole('button',{name:'Powiedz Piko'}).click();
 await caption('DEMO: odpowiedź jest scenariuszowa. Prawdziwy model live wymaga klucza i osobnego sprawdzenia.');
 await p.getByRole('button',{name:'Zapisz tę zasadę dla Piko'}).click();await p.getByRole('button',{name:'Piko, spróbuj sam'}).click();
 await caption('Nowa plansza. Zanim odsłonimy tor i wynik, gracz przewiduje skuteczność pomysłu Piko.');
 await p.getByLabel('Nie przeleci',{exact:true}).check();await p.getByRole('button',{name:'Sprawdź lot Piko'}).click();
 await caption('Pomysł Piko nie działa. Gra zachowuje prawdziwą porażkę i pozwala przejść do zadania gracza.');
 await p.getByRole('button',{name:'Teraz mój samodzielny lot'}).click();
 await caption('Czwarta, osobna plansza. Bez podglądu trasy, AI, dziennika i podpowiedzi przed pierwszą próbą.');
 await p.getByLabel('Wzór funkcji',{exact:true}).fill(m.scenes.human_check.witness.expression);if(slow)await pause(1500);await p.getByLabel('Wzór funkcji',{exact:true}).press('Enter');
 await p.getByRole('button',{name:'Zobacz podsumowanie'}).click();
 await caption('Podsumowanie rozdziela wynik robota i pierwszą samodzielną próbę. To zapis wykonania zadania, nie diagnoza wiedzy.');
}
try{
 await page.goto('http://127.0.0.1:5173/');await page.getByRole('button',{name:'Zacznij'}).click();
 for(const m of data.missions.slice(0,3)){await play(page,m);await page.getByRole('button',{name:'Następna misja'}).click();}
 const storage=await setup.storageState();await setup.close();
 await mkdir('var/video',{recursive:true});await mkdir('release/media',{recursive:true});
 const recording=await browser.newContext({storageState:storage,viewport:{width:1440,height:900},recordVideo:{dir:'var/video',size:{width:1440,height:900}},reducedMotion:'reduce'});
 const p=await recording.newPage();await p.goto('http://127.0.0.1:5173/');await play(p,data.missions[3],true);await pause(2000);const video=p.video()!;await recording.close();const file=await video.path();
 await writeFile('checks/demo-recording.json',JSON.stringify({date:new Date().toISOString(),mode:'demo',source:path.relative(process.cwd(),file),mission:'M04',automated:true,note:'Actual UI recording. Scripted demo; no live AI claim.'},null,2)+'\n');console.log(file);
}finally{await browser.close();}
