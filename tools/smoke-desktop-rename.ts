import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {_electron as electron,type ElectronApplication} from 'playwright';

const argument=(name:string)=>process.argv[process.argv.indexOf(name)+1];
if(!process.argv.includes('--legacy-executable')||!process.argv.includes('--executable')){
 throw new Error('Provide --legacy-executable and --executable. This test uses one isolated profile.');
}
const legacy=path.resolve(argument('--legacy-executable')),current=path.resolve(argument('--executable'));
const profile=await mkdtemp(path.join(tmpdir(),'piko-rename-'));
const env=Object.fromEntries(Object.entries(process.env).filter((entry):entry is [string,string]=>entry[1]!==undefined));
delete env.ELECTRON_RUN_AS_NODE;delete env.OPENAI_API_KEY;delete env.DESKTOP_API_BASE_URL;
const report={date:new Date().toISOString(),status:'FAIL',platform:process.platform,paidProviderCalls:0,
 legacyName:'',currentName:'',sameProfile:false,firstAttemptPreserved:false,notebookPreserved:false,
 error:undefined as string|undefined};
let app:ElectronApplication|undefined;
const launch=(executablePath:string)=>electron.launch({executablePath,args:['--user-data-dir='+profile],env});
try{
 app=await launch(legacy);
 const oldIdentity=await app.evaluate(({app})=>({name:app.getName(),profile:app.getPath('userData')}));
 report.legacyName=oldIdentity.name;
 const page=await app.firstWindow();
 await page.getByRole('button',{name:'Zacznij'}).click();
 await page.getByLabel('Wzór funkcji',{exact:true}).fill('1');
 await page.getByRole('button',{name:'Leć'}).click();
 await page.getByRole('button',{name:'Teraz naucz Piko'}).click();
 await page.getByLabel('Twój poprawiony wzór').fill('2');
 await page.locator('#prediction0').fill('2');await page.locator('#prediction1').fill('2');
 await page.getByLabel('Co Piko powinien zmienić i dlaczego?').fill('Stała wyznacza wysokość toru.');
 await page.getByRole('button',{name:'Sprawdź naprawę'}).click();
 await page.getByRole('button',{name:'Zapisz notatkę dla Piko'}).click();
 await page.getByRole('button',{name:'Pomiń lot Piko'}).click();
 await page.getByLabel('Wzór funkcji',{exact:true}).fill('0');
 await page.getByRole('button',{name:'Sprawdź mój lot'}).click();
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!));
 await app.close();app=undefined;
 app=await launch(current);
 const newIdentity=await app.evaluate(({app})=>({name:app.getName(),profile:app.getPath('userData')}));
 report.currentName=newIdentity.name;
 assert.equal(newIdentity.name,oldIdentity.name);
 assert.equal(newIdentity.name,'naucz-pilota');
 assert.equal(newIdentity.profile,oldIdentity.profile);
 report.sameProfile=true;
 const renamed=await app.firstWindow();
 await renamed.getByRole('heading',{name:'Wysokość lotu',exact:true}).waitFor();
 assert.match(await renamed.title(),/Piko: Misja Funkcja/);
 const after=await renamed.evaluate(()=>JSON.parse(localStorage.getItem('naucz-pilota.v1')!));
 assert.deepEqual(after.runs.M01.firstHuman,before.runs.M01.firstHuman);
 assert.deepEqual(after.rules,before.rules);
 assert.deepEqual(after.runs.M01.rule,before.runs.M01.rule);
 assert.deepEqual(after.archive,before.archive);
 report.firstAttemptPreserved=true;report.notebookPreserved=true;report.status='PASS';
}catch(error){report.error=error instanceof Error?error.message:'Rename smoke failed';process.exitCode=1;}
finally{
 if(app)await app.close();
 await rm(profile,{recursive:true,force:true});
 await writeFile(process.env.PIKO_RENAME_REPORT??'checks/desktop-rename.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
}
