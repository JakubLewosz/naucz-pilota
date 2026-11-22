import {test,expect} from '@playwright/test';
import {evaluateScene} from '@piko/core';
import {missionById} from '@piko/content';

test('jury code authorizes the browser connection and is cleared by a page reload',async({page})=>{
 const code='offline-jury-access-code-for-tests-only';
 const observed:string[]=[];
 await page.route('**/api/health',route=>{
  const value=route.request().headers()['x-piko-access-code']??'';
  observed.push(value);
  return route.fulfill(value===code
   ?{json:{mode:'live',available:true}}
   :{status:403,json:{error:{code:'JURY_ACCESS_REQUIRED'}}});
 });
 await page.goto('/');
 await page.getByRole('button',{name:'Ustawienia',exact:true}).click();
 await page.getByText('Masz kod dostępu do live?',{exact:true}).click();
 await page.getByLabel('Kod dostępu do live',{exact:true}).fill(code);
 await page.getByRole('button',{name:'Połącz z kodem'}).click();
 await expect(page.getByRole('status')).toContainText('Serwer potwierdził dostęp.');
 await expect(page.getByLabel('Kod dostępu do live',{exact:true})).toHaveValue('');
 expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain(code);
 expect(observed).toContain(code);
 await page.reload();
 await expect.poll(()=>observed.at(-1)).toBe('');
 await expect(page.getByText('Prawdziwe AI nie jest teraz dostępne.',{exact:false})).toBeVisible();
});

test('flight markers follow engine events, skipping is cosmetic and reduced motion ends immediately',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/');
 await page.getByRole('button',{name:'Rozpocznij'}).click();
 let requests=0;
 page.on('request',request=>{if(request.url().includes('learner-turn'))requests++;});
 const scene=missionById('M01').scenes.practice;
 const input=page.getByLabel('Wzór funkcji',{exact:true});
 // This quadratic hits the obstacle before G2. It also violates the mission's family
 // constraint, so animation must use the physical event, not the primary code.
 const expression='0.9*x*(x-2)+1',result=evaluateScene(scene,expression);
 expect(result.firstPhysicalEvent?.code).toBe('OBSTACLE_COLLISION');
 expect(result.primaryCode).toBe('FAMILY_MISMATCH');
 await input.fill(expression);
 await page.getByRole('button',{name:'Leć'}).click();
 await expect(page.getByRole('button',{name:'Pokaż wynik',exact:true})).toBeVisible();
 await expect(page.locator('[data-checkpoint="G2"]')).toHaveAttribute('data-passed','false');
 await page.getByRole('button',{name:'Pokaż wynik',exact:true}).click();
 await expect(page.getByTestId('collision')).toHaveAttribute('x',String(result.firstPhysicalEvent!.x));
 await expect(page.getByTestId('collision')).toHaveAttribute('y',String(-result.firstPhysicalEvent!.y));
 await expect(page.getByTestId('robot')).toHaveAttribute('transform',`translate(${result.firstPhysicalEvent!.x} ${-result.firstPhysicalEvent!.y})`);
 await expect(page.locator('[data-checkpoint="G2"]')).toHaveAttribute('data-passed','false');
 const attempts=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!).runs.M01.attempts.practice);
 expect(await attempts()).toHaveLength(1);
 expect((await attempts())[0].result).toEqual(result);

 await page.emulateMedia({reducedMotion:'reduce'});
 await input.fill('1');
 await page.getByRole('button',{name:'Leć'}).click();
 await expect(page.getByRole('button',{name:'Pokaż wynik',exact:true})).toHaveCount(0);
 await expect(page.locator('[data-checkpoint="goal"]')).toHaveAttribute('data-passed','true');
 await expect(page.getByTestId('collision')).toHaveCount(0);
 expect(await attempts()).toHaveLength(2);
 expect((await attempts())[1].result).toEqual(evaluateScene(scene,'1'));
 expect(requests).toBe(0);
});
