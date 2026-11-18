import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const prototype=process.argv.includes('--prototype');
const output=`var/visual-2026-11-18/${prototype?'prototype':'screens'}`;
await mkdir(output,{recursive:true});
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
const page=await context.newPage();
const errors:string[]=[];
page.on('pageerror',error=>errors.push(error.message));
await page.route('**/*',route=>{
 if(new URL(route.request().url()).hostname!=='127.0.0.1')return route.abort();
 return route.continue();
});
const report={date:new Date().toISOString(),scope:'Offline UI capture; waiting uses a labelled local transport stub',
 paidProviderCalls:0,screens:[] as string[],checks:[] as string[]};
async function capture(name:string){
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' overflows');
 const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();
 assert.deepEqual(accessibility.violations,[],name+' accessibility');
 await page.screenshot({path:`${output}/${name}.png`,fullPage:true});
 report.screens.push(name);
}
try{
 await page.goto('http://127.0.0.1:5173');
 if(!prototype)await capture('home');
 await page.getByRole('button',{name:/^(Zacznij|Rozpocznij)/}).click();
 await capture('flight');
 await page.getByLabel('Wzór funkcji',{exact:true}).fill('1');
 await page.getByRole('button',{name:'Leć'}).click();
 await page.getByTestId('engine-result').waitFor();
 assert.match(await page.getByTestId('engine-result').innerText(),/Bezpieczny lot/);
 await capture('result');
 await page.getByRole('button',{name:'Teraz naucz Piko'}).click();
 await page.getByLabel('Twój poprawiony wzór').fill('2');
 await page.locator('#prediction0').fill('2');
 await page.locator('#prediction1').fill('2');
 await page.getByLabel('Co Piko powinien zmienić i dlaczego?').fill('Stała określa wysokość całego toru.');
 await page.getByRole('button',{name:'Sprawdź naprawę'}).click();
 await page.getByRole('button',{name:'Powiedz Piko'}).click();
 await page.getByRole('button',{name:'Zapisz notatkę dla Piko'}).waitFor();
 if(!prototype)await capture('lesson');
 await page.getByRole('button',{name:'Zapisz notatkę dla Piko'}).click();
 await page.getByRole('button',{name:'Ustawienia',exact:true}).click();
 await page.getByRole('button',{name:'Wybierz live',exact:true}).click();
 await page.getByRole('button',{name:'Wróć do gry'}).click();
 await page.route('**/api/session',route=>route.fulfill({json:{sessionId:crypto.randomUUID(),sessionRevision:0}}));
 // A deliberately pending local route captures the UI without contacting a provider.
 await page.route('**/api/learner-turn',()=>new Promise<void>(()=>{}));
 await page.getByRole('button',{name:'Piko, spróbuj sam'}).click();
 await page.getByRole('status').filter({hasText:'Piko analizuje nową trasę'}).waitFor();
 await page.evaluate(()=>{
  const label=document.createElement('p');
  label.textContent='PRÓBA INTERFEJSU · LOKALNA ATRAPA · 0 WYWOŁAŃ API';
  label.id='capture-label';
  Object.assign(label.style,{background:'#f5b84e',color:'#122d35',padding:'10px 16px',margin:'0',font:'600 14px system-ui',textAlign:'center'});
  document.body.prepend(label);
 });
 await capture('waiting');
 await page.getByRole('button',{name:'Pomiń lot Piko'}).click();
 await page.locator('#capture-label').evaluate(element=>element.remove());
 assert.equal(await page.getByTestId('trajectory').count(),0);
 assert.equal(await page.getByLabel('Komentarz Piko').count(),0);
 assert.equal(await page.getByRole('button',{name:'Dziennik zasad'}).count(),0);
 if(!prototype){
  await page.getByRole('button',{name:'Ustawienia',exact:true}).click();
  await page.getByRole('button',{name:'Wybierz demo',exact:true}).click();
  await page.getByRole('button',{name:'Wróć do gry'}).click();
  await capture('independent');
  await page.getByLabel('Wzór funkcji',{exact:true}).fill('0');
  await page.getByRole('button',{name:'Sprawdź mój lot'}).click();
  const first=await page.evaluate(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!).runs.M01.firstHuman);
  await page.getByLabel('Wzór funkcji',{exact:true}).fill('-1');
  await page.getByRole('button',{name:'Sprawdź mój lot'}).click();
  await page.getByRole('button',{name:'Zobacz podsumowanie'}).click();
  await page.reload();
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!).runs.M01.firstHuman);
  assert.deepEqual(after,first);
  await capture('summary');
  await page.getByRole('button',{name:'Misje',exact:false}).first().click();
  await capture('missions');
  await page.getByRole('button',{name:'Ustawienia',exact:true}).click();
  await capture('settings');
 }
 report.checks.push('Keyboard-labelled actions, no horizontal overflow, axe A/AA, engine success and protected independent attempt');
 assert.deepEqual(errors,[]);
 await writeFile(`${output}/report.json`,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
