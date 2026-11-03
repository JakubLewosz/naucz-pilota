import {_electron as electron,type ElectronApplication,type Page} from 'playwright';
import {mkdtemp,rm,writeFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
const executableIndex=process.argv.indexOf('--executable');
const executable=executableIndex>=0?process.argv[executableIndex+1]:undefined;
if(executableIndex>=0&&!executable)throw new Error('--executable requires a packaged Electron executable path');
const packaged=Boolean(executable),dir=await mkdtemp(path.join(tmpdir(),'piko-smoke-'));
const env:Record<string,string>=Object.fromEntries(Object.entries(process.env).filter((entry):entry is [string,string]=>entry[1]!==undefined));
delete env.ELECTRON_RUN_AS_NODE;delete env.DESKTOP_API_BASE_URL;
let app:ElectronApplication|undefined;
const reportPath=process.env.DESKTOP_SMOKE_REPORT??'checks/desktop-smoke.json';
const screenshotPath=`checks/desktop-${process.platform}${packaged?'-packaged':''}.png`;
const report:{date:string;platform:string;packaged:boolean;executable:string;status:string;scope:string;windowsStatus:string;error?:string}={date:new Date().toISOString(),platform:process.platform,packaged,executable:executable?path.basename(executable):'local Electron',status:'RUNNING',scope:'app://, sandbox, isolation, offline M01, immutable first attempt and restart persistence',windowsStatus:process.platform==='win32'&&packaged?'RUNNING':'NOT RUN'};
await mkdir(path.dirname(reportPath),{recursive:true});
async function launch(){return electron.launch({...executable?{executablePath:path.resolve(executable)}:{},args:[...packaged?[]:['apps/desktop/main.cjs'],`--user-data-dir=${dir}`],env});}
async function assertIsolation(app:ElectronApplication,page:Page){
 const isolation=await page.evaluate(()=>({require:typeof (globalThis as Record<string,unknown>).require,process:typeof (globalThis as Record<string,unknown>).process}));
 if(isolation.require!=='undefined'||isolation.process!=='undefined')throw new Error('Renderer has Node access');
 const prefs=await app.evaluate(({BrowserWindow})=>(BrowserWindow.getAllWindows()[0].webContents as unknown as {getLastWebPreferences:()=>{sandbox:boolean;contextIsolation:boolean;nodeIntegration:boolean}}).getLastWebPreferences());
 if(!prefs.sandbox||!prefs.contextIsolation||prefs.nodeIntegration)throw new Error('Insecure renderer preferences');
 if(!page.url().startsWith('app://piko/'))throw new Error('Application did not load local app:// resources');
}
try{
 app=await launch();const page=await app.firstWindow();await page.getByRole('button',{name:'Zacznij'}).click();await assertIsolation(app,page);
 await page.getByLabel('Wzór funkcji',{exact:true}).fill('1');await page.getByLabel('Wzór funkcji',{exact:true}).press('Enter');await page.getByRole('button',{name:'Teraz naucz Piko'}).click();
 await page.getByLabel('Twój poprawiony wzór').fill('2');await page.locator('#prediction0').fill('2');await page.locator('#prediction1').fill('2');await page.getByLabel('Co Piko powinien zmienić i dlaczego?').fill('Stała określa wysokość toru.');
 await page.getByRole('button',{name:'Sprawdź naprawę'}).click();await page.getByRole('button',{name:'Powiedz Piko'}).click();await page.getByRole('button',{name:'Zapisz tę zasadę dla Piko'}).click();
 await page.getByRole('button',{name:'Piko, spróbuj sam'}).click();await page.getByLabel('Przeleci',{exact:true}).check();await page.getByRole('button',{name:'Sprawdź lot Piko'}).click();await page.getByRole('button',{name:'Teraz mój samodzielny lot'}).click();
 if(await page.getByTestId('trajectory').count()||await page.getByRole('button',{name:'Dziennik zasad'}).count())throw new Error('Independent assistance leaked');
 await page.getByLabel('Wzór funkcji',{exact:true}).fill('0');await page.getByLabel('Wzór funkcji',{exact:true}).press('Enter');
 await page.getByLabel('Wzór funkcji',{exact:true}).fill('-1');await page.getByLabel('Wzór funkcji',{exact:true}).press('Enter');await page.getByRole('button',{name:'Zobacz podsumowanie'}).click();
 const first=await page.evaluate(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!).runs.M01.firstHuman);
 if(first.expression!=='0'||first.result.ok)throw new Error('First attempt was overwritten by correction');
 await app.close();app=undefined;
 app=await launch();const resumed=await app.firstWindow();await resumed.getByRole('heading',{name:'Misja ukończona',exact:true}).waitFor();
 await assertIsolation(app,resumed);
 const after=await resumed.evaluate(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!).runs.M01.firstHuman);
 if(JSON.stringify(after)!==JSON.stringify(first))throw new Error('Restart changed independent first attempt');
 await resumed.screenshot({path:screenshotPath,fullPage:true});
 report.status='PASS';if(process.platform==='win32'&&packaged)report.windowsStatus='PASS';
 console.log(`PASS: ${packaged?'packaged':'local'} Electron ${process.platform}, M01, isolation and restart persistence.`);
}catch(error){report.status='FAIL';if(process.platform==='win32'&&packaged)report.windowsStatus='FAIL';report.error=error instanceof Error?error.message:'Unknown smoke error';process.exitCode=1;console.error(report.error);}
finally{if(app)await app.close();await rm(dir,{recursive:true,force:true});await writeFile(reportPath,JSON.stringify(report,null,2)+'\n');}
