import {_electron as electron} from 'playwright';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
const dir=await mkdtemp(path.join(tmpdir(),'piko-smoke-'));
const env:Record<string,string>=Object.fromEntries(Object.entries(process.env).filter((entry):entry is [string,string]=>entry[1]!==undefined));delete env.ELECTRON_RUN_AS_NODE;delete env.DESKTOP_API_BASE_URL;
const app=await electron.launch({args:['apps/desktop/main.cjs',`--user-data-dir=${dir}`],env});
try{
 const page=await app.firstWindow();await page.getByRole('button',{name:'Zacznij'}).click();
 const isolation=await page.evaluate(()=>({require:typeof (globalThis as Record<string,unknown>).require,process:typeof (globalThis as Record<string,unknown>).process}));
 if(isolation.require!=='undefined'||isolation.process!=='undefined')throw new Error('Renderer has Node access');
 const prefs=await app.evaluate(({BrowserWindow})=>(BrowserWindow.getAllWindows()[0].webContents as unknown as {getLastWebPreferences:()=>{sandbox:boolean;contextIsolation:boolean;nodeIntegration:boolean}}).getLastWebPreferences());
 if(!prefs.sandbox||!prefs.contextIsolation||prefs.nodeIntegration)throw new Error('Insecure renderer preferences');
 await page.getByLabel('Wzór funkcji',{exact:true}).fill('1');await page.getByLabel('Wzór funkcji',{exact:true}).press('Enter');await page.getByRole('button',{name:'Teraz naucz Piko'}).click();
 await page.getByLabel('Twój poprawiony wzór').fill('2');await page.locator('#prediction0').fill('2');await page.locator('#prediction1').fill('2');await page.getByLabel('Co Piko powinien zmienić i dlaczego?').fill('Stała określa wysokość toru.');
 await page.getByRole('button',{name:'Sprawdź naprawę'}).click();await page.getByRole('button',{name:'Powiedz Piko'}).click();await page.getByRole('button',{name:'Zapisz tę zasadę dla Piko'}).click();
 await page.getByRole('button',{name:'Piko, spróbuj sam'}).click();await page.getByLabel('Przeleci',{exact:true}).check();await page.getByRole('button',{name:'Sprawdź lot Piko'}).click();await page.getByRole('button',{name:'Teraz mój samodzielny lot'}).click();
 if(await page.getByTestId('trajectory').count())throw new Error('Independent preview leaked');
 await page.getByLabel('Wzór funkcji',{exact:true}).fill('-1');await page.getByLabel('Wzór funkcji',{exact:true}).press('Enter');await page.getByRole('button',{name:'Zobacz podsumowanie'}).click();
 await page.screenshot({path:'checks/desktop-macos.png',fullPage:true});
 await writeFile('checks/desktop-smoke.json',JSON.stringify({date:new Date().toISOString(),platform:process.platform,status:'PASS',scope:'Electron local app:// assets, sandbox, isolation, no Node in renderer, offline M01 four stages',windowsStatus:'NOT RUN'},null,2)+'\n');
 console.log('PASS: Electron macOS offline M01; isolation and sandbox. Windows NOT RUN.');
}finally{await app.close();await rm(dir,{recursive:true,force:true});}
