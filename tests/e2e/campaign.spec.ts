import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {demoTurn,makeEnvelope,buildContext,type LearnerRequest} from '@piko/contracts';
import data from '../../content/missions.v1.json' with {type:'json'};
async function practice(page:Page,mission:typeof data.missions[number]){
 await page.getByLabel('Wzór funkcji',{exact:true}).fill(mission.scenes.practice.witness.expression);
 await page.getByLabel('Wzór funkcji',{exact:true}).press('Enter');
 await expect(page.getByTestId('engine-result')).toContainText('Bezpieczny lot');
 await page.getByRole('button',{name:'Teraz naucz Piko'}).click();
}
async function teach(page:Page,mission:typeof data.missions[number]){
 const scene=mission.scenes.teach,w=scene.witness;
 await page.getByLabel('Twój poprawiony wzór').fill(w.expression);
 for(const [i,g] of scene.gates.entries())await page.locator(`#prediction${i}`).fill(String((w.c2*g.x+w.c1)*g.x+w.c0));
 await page.getByLabel('Co Piko powinien zmienić i dlaczego?').fill(mission.ruleText);
 await page.getByRole('button',{name:'Sprawdź naprawę'}).click();
 await expect(page.getByText('Tor i prognozy sprawdzone przez silnik',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Powiedz Piko'}).click();
 await expect(page.getByLabel('Komentarz Piko')).toContainText('DEMONSTRACJA');
 await page.getByRole('button',{name:'Zapisz notatkę dla Piko'}).click();
}
async function transfer(page:Page,checkStartMiss=false){
 await page.getByRole('button',{name:'Piko, spróbuj sam'}).click();
 await expect(page.getByRole('heading',{name:'Propozycja Piko'})).toBeVisible();
 await expect(page.getByTestId('trajectory')).toHaveCount(0);
 await page.getByLabel('Jeszcze nie wiem',{exact:true}).check();
 await page.getByRole('button',{name:'Sprawdź lot Piko'}).click();
 if(checkStartMiss){
  await expect(page.locator('.proposal code')).toHaveText('f(x) = 0.25(x+2)^2');
  await expect(page.getByTestId('engine-result')).toContainText('Przy x = -1 tor osiągnął y = 0.25. Otwór startowy sięga od y = 1.87 do y = 2.63.');
 }
 await page.getByRole('button',{name:'Teraz mój samodzielny lot'}).click();
}
async function blind(page:Page){
 await expect(page.getByTestId('trajectory')).toHaveCount(0);
 await expect(page.getByTestId('robot')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Dziennik zasad'})).toHaveCount(0);
 await expect(page.getByLabel('Komentarz Piko')).toHaveCount(0);
 await expect(page.getByRole('button',{name:/Wskazówka/})).toHaveCount(0);
 await expect(page.getByText(/Twój wzór daje y/)).toHaveCount(0);
}
test('M01 complete, first attempt survives correction and reload, replay preserves archive',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Zacznij'}).click();await practice(page,data.missions[0]);await teach(page,data.missions[0]);await transfer(page);await blind(page);
 await page.getByLabel('Wzór funkcji',{exact:true}).fill('sin(x)');await page.getByRole('button',{name:'Sprawdź mój lot'}).click();await blind(page);
 await page.getByLabel('Wzór funkcji',{exact:true}).fill('0');await page.getByRole('button',{name:'Sprawdź mój lot'}).click();
 await page.reload();await page.getByLabel('Wzór funkcji',{exact:true}).fill('-1');await page.getByRole('button',{name:'Sprawdź mój lot'}).click();await page.getByRole('button',{name:'Zobacz podsumowanie'}).click();
 await expect(page.getByText('do poprawy',{exact:true})).toBeVisible();await expect(page.getByText('Liczba prób: 2')).toBeVisible();
 await page.getByRole('button',{name:'Powtórz misję'}).click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!));expect(saved.archive.M01[0].firstHuman.expression).toBe('0');expect(saved.runs.M01.firstHuman).toBeNull();
});
test('E4 all six missions, 24 distinct scenes, M04 robot failure does not block campaign',async({page})=>{
 let apiCalls=0;page.on('request',r=>{if(r.url().includes('learner-turn'))apiCalls++;});
 await page.goto('/');await page.getByRole('button',{name:'Zacznij'}).click();
 for(const m of data.missions){await practice(page,m);await teach(page,m);await transfer(page,m.id==='M04');await blind(page);await page.getByLabel('Wzór funkcji',{exact:true}).fill(m.scenes.human_check.witness.expression);await page.getByLabel('Wzór funkcji',{exact:true}).press('Enter');await page.getByRole('button',{name:'Zobacz podsumowanie'}).click();if(m.order<6)await page.getByRole('button',{name:'Następna misja'}).click();}
 await expect(page.getByRole('heading',{name:'Dobra robota — ukończyłeś sześć misji'})).toBeVisible();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!));expect(Object.values(saved.runs).every((r:unknown)=>(r as {completed:boolean}).completed)).toBe(true);expect(saved.runs.M04.attempts.robot_transfer[0].result.ok).toBe(false);expect(apiCalls).toBe(0);
 await openMission(page,data.missions[1].title);
 await page.getByRole('button',{name:'Zobacz podsumowanie'}).click();
 await page.getByRole('button',{name:'Powtórz misję'}).click();
 await openMission(page,data.missions[5].title);
 await page.getByRole('button',{name:'Zobacz podsumowanie'}).click();
 await expect(page.getByText(data.missions[1].ruleText,{exact:true})).toHaveCount(0);
});
for(const size of [{width:1366,height:768},{width:1440,height:900},{width:390,height:844}])test(`E5 layout and accessibility ${size.width}x${size.height}`,async({page})=>{
 await page.setViewportSize(size);await page.goto('/');
 const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();expect(a11y.violations).toEqual([]);
 await page.screenshot({path:`checks/home-${size.width}.png`,fullPage:true});
 await page.getByRole('button',{name:'Zacznij'}).click();await expect(page.getByLabel('Wzór funkcji',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const game=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();expect(game.violations).toEqual([]);
 await page.screenshot({path:`checks/practice-${size.width}.png`,fullPage:true});
});
test('live connection error preserves input and requires explicit demo selection',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Zacznij'}).click();await practice(page,data.missions[0]);
 await page.getByRole('button',{name:'Ustawienia',exact:true}).click();await page.getByRole('button',{name:'Wybierz live'}).click();await page.getByRole('button',{name:'Wróć do gry'}).click();
 await page.route('**/api/session',r=>r.abort('failed'));
 await page.getByLabel('Co Piko powinien zmienić i dlaczego?').fill('Podnoszę cały wykres.');await page.getByRole('button',{name:'Powiedz Piko'}).click();
 await expect(page.getByTestId('ai-mode')).toContainText('AI niedostępne');await expect(page.getByLabel('Co Piko powinien zmienić i dlaczego?')).toHaveValue('Podnoszę cały wykres.');
 await page.getByRole('button',{name:'Wybierz tryb demonstracyjny'}).click();await expect(page.getByTestId('ai-mode')).toContainText('Demo');
});
test('keyboard path, offline demo and 200% text keep primary actions available',async({page,context})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.getByRole('button',{name:'Ustawienia',exact:true}).focus();await page.keyboard.press('Enter');
 await page.getByLabel('Wielkość tekstu').selectOption('2');await page.getByRole('button',{name:'Wróć do gry'}).focus();await page.keyboard.press('Enter');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await context.setOffline(true);
 await page.getByLabel('Wzór funkcji',{exact:true}).focus();await page.keyboard.press('ControlOrMeta+A');await page.keyboard.type('1');await page.keyboard.press('Enter');
 await page.getByRole('button',{name:'Teraz naucz Piko'}).focus();await page.keyboard.press('Enter');
 await page.getByLabel('Twój poprawiony wzór').fill('2');await page.locator('#prediction0').fill('2');await page.locator('#prediction1').fill('2');
 await page.getByLabel('Co Piko powinien zmienić i dlaczego?').fill('Stała daje wysokość każdego punktu.');await page.keyboard.press('Enter');
 await expect(page.getByTestId('engine-result')).toHaveCount(0);
 for(const name of ['Sprawdź naprawę','Powiedz Piko','Zapisz notatkę dla Piko','Piko, spróbuj sam']){await page.getByRole('button',{name}).focus();await page.keyboard.press('Enter');}
 await page.getByLabel('Przeleci',{exact:true}).focus();await page.keyboard.press('Space');
 for(const name of ['Sprawdź lot Piko','Teraz mój samodzielny lot']){await page.getByRole('button',{name}).focus();await page.keyboard.press('Enter');}
 await blind(page);await page.getByLabel('Wzór funkcji',{exact:true}).fill('-1');await page.keyboard.press('Enter');
 await expect(page.getByText(/Misja ukończona/)).toBeVisible();
});

async function selectMode(page:Page,mode:'live'|'demo'){
 await page.getByRole('button',{name:'Ustawienia',exact:true}).click();
 await page.getByRole('button',{name:`Wybierz ${mode}`,exact:true}).click();
 await page.getByRole('button',{name:'Wróć do gry'}).click();
}
test('MOCK: skip during a 21 s desktop reply preserves the independent attempt and archive',async({page})=>{
 const requests:LearnerRequest[]=[];
 await page.exposeFunction('mockPikoTurn',async(request:LearnerRequest)=>{
  requests.push(request);
  await new Promise(resolve=>setTimeout(resolve,21000));
  return {...demoTurn(request),mode:'live'};
 });
 await page.addInitScript(()=>{
  const {mockPikoTurn}=window as unknown as {mockPikoTurn:NonNullable<Window['piko']>['sendLearnerTurn']};
  window.piko={
   getAiStatus:async()=>({mode:'live',available:true}),
   startAiSession:async()=>({sessionId:crypto.randomUUID(),sessionRevision:0}),
   clearConversation:async()=>({ok:true}),
   sendLearnerTurn:async request=>{
    const reply=await mockPikoTurn(request);
    document.documentElement.dataset.stubReply='delivered';
    return reply;
   }
  };
 });
 await page.setViewportSize({width:1366,height:768});
 await page.goto('/');
 await page.getByRole('button',{name:'Zacznij'}).click();
 await practice(page,data.missions[0]);
 await teach(page,data.missions[0]);
 await page.getByRole('button',{name:'Ustawienia',exact:true}).click();
 await page.getByLabel('Wielkość tekstu').selectOption('2');
 await page.getByRole('button',{name:'Wybierz live',exact:true}).click();
 await page.getByRole('button',{name:'Wróć do gry'}).click();

 const ask=page.getByRole('button',{name:'Piko, spróbuj sam'});
 await ask.evaluate((button:HTMLButtonElement)=>{button.click();button.click();});
 await expect(page.getByRole('status').filter({hasText:'Piko analizuje nową trasę'})).toBeVisible();
 await expect(ask).toBeDisabled();
 await expect.poll(()=>requests.length).toBe(1);
 const skip=page.getByRole('button',{name:'Pomiń lot Piko i przejdź do własnej próby'});
 await expect(skip).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.setViewportSize({width:390,height:844});
 await expect(skip).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await skip.focus();
 await page.keyboard.press('Enter');
 await blind(page);

 const readRun=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!).runs.M01);
 await page.getByLabel('Wzór funkcji',{exact:true}).fill('0');
 await page.getByRole('button',{name:'Sprawdź mój lot'}).click();
 const first=(await readRun()).firstHuman;
 expect(first.expression).toBe('0');
 await expect(page.locator('html')).toHaveAttribute('data-stub-reply','delivered',{timeout:27000});
 expect(await readRun()).toMatchObject({role:'human_check',robotDisposition:'skipped',firstHuman:first,robot:null,robotTurns:0,robotFailures:0});
 expect(await readRun()).not.toHaveProperty('attempts.robot_transfer');
 expect(requests).toHaveLength(1);
 await expect(page.getByLabel('Komentarz Piko')).toHaveCount(0);
 await page.reload();
 await page.getByLabel('Wzór funkcji',{exact:true}).fill('-1');
 await page.getByRole('button',{name:'Sprawdź mój lot'}).click();
 await page.getByRole('button',{name:'Zobacz podsumowanie'}).click();
 await expect(page.getByText('Pominięto lot Piko.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Powtórz misję'}).click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!));
 expect(saved.archive.M01[0]).toMatchObject({firstHuman:first,robotDisposition:'skipped'});
 expect(saved.runs.M01.firstHuman).toBeNull();
 expect(saved.runs.M01.robotDisposition).toBeUndefined();
});
async function stubSession(page:Page){
 await page.route('**/api/session',route=>route.fulfill({json:{sessionId:crypto.randomUUID(),sessionRevision:0}}));
}
function unavailable(request:LearnerRequest){
 return {...makeEnvelope(request,buildContext(request).memory,null,'unavailable'),
  error:{code:'AI_TIMEOUT',messagePL:'Przekroczono czas odpowiedzi.',retryable:true}};
}
for(const path of ['demo','skip'] as const)test(`two failed live turns, reload, then ${path}`,async({page})=>{
 const mission=data.missions[0];
 await page.goto('/');
 await page.getByRole('button',{name:'Zacznij'}).click();
 await practice(page,mission);
 await teach(page,mission);
 await selectMode(page,'live');
 await stubSession(page);
 const requests:LearnerRequest[]=[];
 await page.route('**/api/learner-turn',route=>{
  const body=route.request().postDataJSON() as LearnerRequest;
  requests.push(body);
  return path==='demo'?route.abort('failed'):route.fulfill({status:504,json:unavailable(body)});
 });
 await page.getByRole('button',{name:'Piko, spróbuj sam'}).click();
 await expect(page.getByTestId('ai-mode')).toContainText('AI niedostępne');
 await page.getByRole('button',{name:'Spróbuj ponownie'}).click();
 await expect(page.getByRole('button',{name:'Spróbuj ponownie'})).toHaveCount(0);
 await page.reload();
 await page.getByText('Notatka z lekcji Piko',{exact:true}).click();
 await expect(page.getByText('Twoje wyjaśnienie',{exact:true})).toBeVisible();
 expect(requests).toHaveLength(2);
 expect(requests[1].ruleEvidence[0].lessonNote).toMatchObject({explanationPL:mission.ruleText,source:'demo'});
 if(path==='demo'){
  await page.getByRole('button',{name:'Wybierz tryb demonstracyjny'}).click();
  await expect(page.getByTestId('ai-mode')).toContainText('Demo');
  await transfer(page);
 }else await page.getByRole('button',{name:'Pomiń lot Piko'}).click();
 await blind(page);
 await expect(page.getByRole('button',{name:'Sprawdź mój lot'})).toBeEnabled();
 expect(requests).toHaveLength(2);
});
test('live retry restores the badge and a later demo chat reset reaches the live session',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Zacznij'}).click();
 await practice(page,data.missions[0]);
 await page.getByLabel('Co Piko powinien zmienić i dlaczego?').fill('Stała ustawia wysokość toru.');
 await page.getByRole('button',{name:'Powiedz Piko'}).click();
 const chat=page.getByLabel('Komentarz Piko');
 await expect(chat).toContainText('DEMONSTRACJA');
 await expect(chat).toContainText('Stała ustawia wysokość toru.');
 await selectMode(page,'live');
 await stubSession(page);
 let calls=0;
 await page.route('**/api/learner-turn',route=>{
  const body=route.request().postDataJSON() as LearnerRequest;
  if(++calls===1)return route.fulfill({status:504,json:unavailable(body)});
  return route.fulfill({json:{...demoTurn(body),mode:'live'}});
 });
 await page.getByRole('button',{name:'Powiedz Piko'}).click();
 await expect(page.getByTestId('ai-mode')).toContainText('AI niedostępne');
 await page.getByRole('button',{name:'Spróbuj ponownie'}).click();
 await expect(page.getByTestId('ai-mode')).toContainText('Live');
 await expect(page.getByText('Brak odpowiedzi modelu. Twoje wpisy są zachowane.')).toHaveCount(0);
 await expect(chat).toContainText('DEMONSTRACJA');
 await expect(chat).toContainText('MODEL LIVE');
 await selectMode(page,'demo');
 let resets=0;
 await page.route('**/api/conversation/reset',route=>{
  expect(route.request().postDataJSON()).toEqual({sceneId:'M01-teach'});
  if(++resets===1)return route.fulfill({status:409,json:{error:{messagePL:'Piko kończy poprzednią turę.'}}});
  return route.fulfill({json:{ok:true}});
 });
 await page.getByRole('button',{name:'Wyczyść rozmowę'}).click();
 await expect(page.getByText('Piko kończy poprzednią turę.')).toBeVisible();
 await expect(chat).toContainText('MODEL LIVE');
 await page.getByRole('button',{name:'Wyczyść rozmowę'}).click();
 await expect(chat).not.toContainText('MODEL LIVE');
 await expect(page.getByLabel('Co Piko powinien zmienić i dlaczego?')).toHaveValue('Stała ustawia wysokość toru.');
 expect(resets).toBe(2);
});

async function openMission(page:Page,title:string){
 await page.getByRole('button',{name:/^Misje/}).click();
 const card=page.locator('article').filter({has:page.getByRole('heading',{name:title,exact:true})});
 await card.getByRole('button',{name:/Otwórz misję|Zobacz misję/}).click();
}
const savedRun=(page:Page,missionId:string)=>page.evaluate(
 id=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!).runs[id],missionId
);

test('global journal protects another mission before its first attempt, including reload, migration and replay',async({page})=>{
 const [m1,m2]=data.missions;
 const openJournal=()=>page.getByRole('button',{name:'Dziennik zasad'}).click();
 const rule1=page.getByText(m1.ruleText,{exact:true}),rule2=page.getByText(m2.ruleText,{exact:true});
 const checkHuman=async(expression:string)=>{
  await page.getByLabel('Wzór funkcji',{exact:true}).fill(expression);
  await page.getByRole('button',{name:'Sprawdź mój lot'}).click();
 };
 await page.goto('/');
 await page.getByRole('button',{name:'Zacznij'}).click();
 await practice(page,m1);await teach(page,m1);await transfer(page);
 await checkHuman(m1.scenes.human_check.witness.expression);
 await page.getByRole('button',{name:'Zobacz podsumowanie'}).click();
 await page.getByRole('button',{name:'Następna misja'}).click();
 await practice(page,m2);await teach(page,m2);await transfer(page);await blind(page);

 await openMission(page,m1.title);
 await openJournal();
 await expect(rule1).toBeVisible();
 await expect(rule2).toHaveCount(0);
 await page.reload();
 await expect(rule1).toBeVisible();
 await expect(rule2).toHaveCount(0);
 expect((await savedRun(page,'M02')).afterReview).toBe(false);

 // Legacy saves can contain a journal or summary route while this mission is still blind.
 for(const target of ['journal','summary']){
  await openMission(page,m2.title);
  await page.evaluate(route=>{
   const key='naucz-pilota.v1',save=JSON.parse(localStorage.getItem(key)!);
   save.saveVersion=1;
   save.page=route;
   const removed=['lessonNote','robotFailures','liveChat','lessonReply','speaker'];
   localStorage.setItem(key,JSON.stringify(save,(field,value)=>removed.includes(field)?undefined:value));
  },target);
  await page.reload();
  await expect(page.getByRole('button',{name:'Sprawdź mój lot'})).toBeEnabled();
  await blind(page);
  await expect(rule2).toHaveCount(0);
 }
 await checkHuman('sin(x)');
 await expect(page.getByText(/Ta próba nie została zapisana/)).toBeVisible();
 await blind(page);
 await checkHuman('0');
 await expect(page.getByTestId('engine-result')).toBeVisible();
 const first=(await savedRun(page,'M02')).firstHuman;
 expect(first).toMatchObject({expression:'0',index:1,afterReview:false});

 await openMission(page,m1.title);
 await openJournal();
 await expect(rule1).toBeVisible();
 await expect(rule2).toBeVisible();
 expect((await savedRun(page,'M02')).afterReview).toBe(true);
 await openMission(page,m2.title);
 await checkHuman(m2.scenes.human_check.witness.expression);
 await page.getByRole('button',{name:'Zobacz podsumowanie'}).click();
 await page.reload();
 expect((await savedRun(page,'M02')).firstHuman).toEqual(first);
 await page.getByRole('button',{name:'Powtórz misję'}).click();
 await openMission(page,m1.title);
 await openJournal();
 await expect(rule1).toBeVisible();
 await expect(rule2).toHaveCount(0);
 const replay=await page.evaluate(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!));
 expect(replay.archive.M02[0].firstHuman).toEqual(first);
 expect(replay.runs.M02.firstHuman).toBeNull();
});
