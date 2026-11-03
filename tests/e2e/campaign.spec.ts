import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
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
 await expect(page.getByText('Tor i prognozy sprawdzone',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Powiedz Piko'}).click();
 await expect(page.getByLabel('Komentarz Piko')).toContainText('DEMONSTRACJA');
 await page.getByRole('button',{name:'Zapisz tę zasadę dla Piko'}).click();
}
async function transfer(page:Page){
 await page.getByRole('button',{name:'Piko, spróbuj sam'}).click();
 await expect(page.getByRole('heading',{name:'Propozycja Piko'})).toBeVisible();
 await expect(page.getByTestId('trajectory')).toHaveCount(0);
 await page.getByLabel('Jeszcze nie wiem',{exact:true}).check();
 await page.getByRole('button',{name:'Sprawdź lot Piko'}).click();
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
 for(const m of data.missions){await practice(page,m);await teach(page,m);await transfer(page);await blind(page);await page.getByLabel('Wzór funkcji',{exact:true}).fill(m.scenes.human_check.witness.expression);await page.getByLabel('Wzór funkcji',{exact:true}).press('Enter');await page.getByRole('button',{name:'Zobacz podsumowanie'}).click();if(m.order<6)await page.getByRole('button',{name:'Następna misja'}).click();}
 await expect(page.getByRole('heading',{name:'Dobra robota — ukończyłeś sześć misji'})).toBeVisible();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!));expect(Object.values(saved.runs).every((r:unknown)=>(r as {completed:boolean}).completed)).toBe(true);expect(saved.runs.M04.attempts.robot_transfer[0].result.ok).toBe(false);expect(apiCalls).toBe(0);
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
 for(const name of ['Sprawdź naprawę','Powiedz Piko','Zapisz tę zasadę dla Piko','Piko, spróbuj sam']){await page.getByRole('button',{name}).focus();await page.keyboard.press('Enter');}
 await page.getByLabel('Przeleci',{exact:true}).focus();await page.keyboard.press('Space');
 for(const name of ['Sprawdź lot Piko','Teraz mój samodzielny lot']){await page.getByRole('button',{name}).focus();await page.keyboard.press('Enter');}
 await blind(page);await page.getByLabel('Wzór funkcji',{exact:true}).fill('-1');await page.keyboard.press('Enter');
 await expect(page.getByText(/Misja ukończona/)).toBeVisible();
});
