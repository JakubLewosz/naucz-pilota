import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {_electron as electron,type ElectronApplication} from 'playwright';
import {createApp} from '../apps/server/src/app';
import {Store} from '../apps/server/src/store';
import type {Exchange} from '@piko/contracts';
const directory=await mkdtemp(path.join(tmpdir(),'piko-chat-audit-'));
const seen:Exchange[][]=[],store=new Store(':memory:');
const stubReply=(turn:number)=>`Próba ${turn}. Stała ustawia wysokość.`;
const report={
 date:new Date().toISOString(),status:'FAIL',platform:process.platform,stubCalls:0,paidProviderCalls:0,
 transport:'Electron IPC to local HTTP relay',oldContextCleared:false,error:undefined as string|undefined
};
const server=createApp({store,config:{mode:'live',model:'local-stub'},provider:async context=>{
 seen.push(context.recentExchanges);
 return {text:JSON.stringify({
  utterancePL:stubReply(seen.length),followUpPL:null,
  explanationAssessment:'partial',proposedExpression:null,suggestedRuleId:null,usedFactIds:[],action:'explain_back'
 }),actualModel:'local-stub',responseId:'local-stub',inputTokens:null,outputTokens:null};
}}).listen(0,'127.0.0.1');
await new Promise<void>(resolve=>server.once('listening',resolve));
let app:ElectronApplication|undefined;
try{
 const address=server.address();
 assert.ok(address&&typeof address==='object');
 const env=Object.fromEntries(Object.entries(process.env).filter((entry):entry is [string,string]=>entry[1]!==undefined));
 env.DESKTOP_API_BASE_URL='http://127.0.0.1:'+address.port;
 delete env.ELECTRON_RUN_AS_NODE;
 delete env.OPENAI_API_KEY;
 app=await electron.launch({args:['apps/desktop/main.cjs','--user-data-dir='+directory],env});
 const page=await app.firstWindow();
 await page.getByRole('button',{name:'Zacznij'}).click();
 await page.getByLabel('Wzór funkcji',{exact:true}).fill('1');
 await page.getByLabel('Wzór funkcji',{exact:true}).press('Enter');
 await page.getByRole('button',{name:'Teraz naucz Piko'}).click();
 await page.getByRole('button',{name:'Ustawienia',exact:true}).click();
 await page.getByRole('button',{name:'Wybierz live',exact:true}).click();
 await page.getByRole('button',{name:'Wróć do gry'}).click();
 const input=page.getByLabel('Co Piko powinien zmienić i dlaczego?');
 const send=async(text:string,turn:number)=>{
  await input.fill(text);
  await page.getByRole('button',{name:'Powiedz Piko'}).click();
  await page.getByText(stubReply(turn),{exact:true}).waitFor();
  assert.match(await page.getByTestId('ai-mode').innerText(),/Live/,(await page.getByRole('alert').allTextContents()).join(' '));
 };
 await send('Pierwsze wyjaśnienie.',1);
 await send('Drugie wyjaśnienie.',2);
 assert.equal(seen[1][0].userPL,'Pierwsze wyjaśnienie.');
 await page.getByRole('button',{name:'Wyczyść rozmowę'}).click();
 await page.getByRole('button',{name:'Wyczyść rozmowę'}).waitFor({state:'hidden'});
 await send('Nowa rozmowa po czyszczeniu.',3);
 assert.deepEqual(seen[2],[]);
 report.status='PASS';
 report.oldContextCleared=true;
}catch(error){
 report.error=error instanceof Error?error.message:'Unexpected Electron relay failure';
 process.exitCode=1;
}finally{
 report.stubCalls=seen.length;
 await writeFile('checks/desktop-relay-smoke.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
 if(app)await app.close();
 await new Promise<void>(resolve=>server.close(()=>resolve()));
 store.close();
 await rm(directory,{recursive:true,force:true});
}
