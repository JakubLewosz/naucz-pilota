import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {createServer,type Server as HttpsServer} from 'node:https';
import type {Server as HttpServer} from 'node:http';
import {setTimeout as delay} from 'node:timers/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {_electron as electron,type ElectronApplication} from 'playwright';
import {createApp} from '../apps/server/src/app';
import {Store} from '../apps/server/src/store';
import type {Exchange} from '@piko/contracts';
const executableIndex=process.argv.indexOf('--executable');
const executable=executableIndex>=0?process.argv[executableIndex+1]:undefined;
if(executableIndex>=0&&!executable)throw new Error('--executable requires a packaged Electron executable path');
const tls=Boolean(executable)||process.argv.includes('--https');
const tlsPort=3443;
const testAccessCode='offline-desktop-access-code-for-tests';
const directory=await mkdtemp(path.join(tmpdir(),'piko-chat-audit-'));
const seen:Exchange[][]=[],store=new Store(':memory:');
const slowReplyMs=17000; // Exercise the previous 16 s Electron cutoff.
const stubReply=(turn:number)=>`Próba ${turn}. Stała ustawia wysokość.`;
const report={
 date:new Date().toISOString(),status:'FAIL',platform:process.platform,stubCalls:0,paidProviderCalls:0,
 transport:`Electron IPC to local ${tls?'HTTPS':'HTTP'} relay`,packaged:Boolean(executable),
 slowReplyMs,oldContextCleared:false,untrustedCertificateRejected:false,transferChecked:false,
 disconnectedStateVerified:false,accessCodeVerified:false,error:undefined as string|undefined
};
const backend=createApp({store,config:{mode:'live',model:'local-stub',production:tls,
 accessCode:tls?testAccessCode:'',requireAccessCode:tls},provider:async context=>{
 seen.push(context.recentExchanges);
 if(seen.length===3)await delay(slowReplyMs);
 const transfer=context.phase==='robot_propose';
 return {text:JSON.stringify({
  utterancePL:transfer?'Proponuję stałą 3.':stubReply(seen.length),followUpPL:null,
  explanationAssessment:transfer?'not_applicable':'partial',proposedExpression:transfer?'3':null,
  suggestedRuleId:null,usedFactIds:[],action:transfer?'propose_attempt':'explain_back'
 }),actualModel:'local-stub',responseId:'local-stub',inputTokens:null,outputTokens:null};
}});
let server:HttpServer|HttpsServer|undefined;
let app:ElectronApplication|undefined;
try{
 const cert=path.join(directory,'loopback.crt'),key=path.join(directory,'loopback.key');
 if(tls){
  execFileSync(process.env.PIKO_OPENSSL??'openssl',['req','-x509','-newkey','rsa:2048','-nodes','-days','1',
   '-subj','/CN=Piko Loopback Smoke','-addext','subjectAltName=IP:127.0.0.1','-keyout',key,'-out',cert],{stdio:'pipe'});
  server=createServer({key:await readFile(key),cert:await readFile(cert)},backend).listen(tlsPort,'127.0.0.1');
 }else server=backend.listen(0,'127.0.0.1');
 await once(server,'listening');
 const address=server.address();
 assert.ok(address&&typeof address==='object');
 const env=Object.fromEntries(Object.entries(process.env).filter((entry):entry is [string,string]=>entry[1]!==undefined));
 env.DESKTOP_API_BASE_URL=`${tls?'https':'http'}://127.0.0.1:${address.port}`;
 delete env.ELECTRON_RUN_AS_NODE;
 delete env.OPENAI_API_KEY;
 delete env.NODE_TLS_REJECT_UNAUTHORIZED;
 delete env.NODE_EXTRA_CA_CERTS;
 const launch=()=>electron.launch({
  ...(executable?{executablePath:path.resolve(executable)}:{}),
  args:[...(executable?[]:['apps/desktop/main.cjs']),'--user-data-dir='+path.join(directory,'profile')],env
 });
 if(tls){
  app=await launch();
  const untrusted=await app.firstWindow();
  await untrusted.getByRole('button',{name:'Rozpocznij'}).waitFor();
  await untrusted.evaluate(code=>window.piko!.setAccessCode!(code),testAccessCode);
  assert.equal((await untrusted.evaluate(()=>window.piko!.getAiStatus())).available,false);
  report.untrustedCertificateRejected=true;
  await app.close();app=undefined;
  env.NODE_EXTRA_CA_CERTS=cert;
 }
 app=await launch();
 const page=await app.firstWindow();
 await page.getByRole('button',{name:'Rozpocznij'}).waitFor();
 if(tls){
  assert.equal((await page.evaluate(()=>window.piko!.getAiStatus())).available,false);
  await page.getByRole('button',{name:'Ustawienia',exact:true}).click();
  await page.getByText('Masz kod dostępu do live?',{exact:true}).click();
  await page.getByLabel('Kod dostępu do live',{exact:true}).fill(testAccessCode);
  await page.getByRole('button',{name:'Połącz z kodem'}).click();
  await page.getByText('Serwer potwierdził dostęp.',{exact:false}).waitFor();
  assert.ok(!(await page.evaluate(()=>JSON.stringify(localStorage))).includes(testAccessCode));
  report.accessCodeVerified=true;
  await page.getByRole('button',{name:'Piko: Misja Funkcja — strona główna'}).click();
 }
 assert.equal((await page.evaluate(()=>window.piko!.getAiStatus())).available,true);
 await page.getByRole('button',{name:'Rozpocznij'}).click();
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
  if(turn===3)await page.getByRole('status').filter({hasText:'Oczekiwanie na odpowiedź Piko'}).waitFor();
  await page.getByText(stubReply(turn),{exact:true}).waitFor({timeout:25000});
  assert.match(await page.getByTestId('ai-mode').innerText(),/Live/,(await page.getByRole('alert').allTextContents()).join(' '));
 };
 await send('Pierwsze wyjaśnienie.',1);
 await send('Drugie wyjaśnienie.',2);
 assert.equal(seen[1][0].userPL,'Pierwsze wyjaśnienie.');
 await page.getByRole('button',{name:'Wyczyść rozmowę'}).click();
 await page.getByRole('button',{name:'Wyczyść rozmowę'}).waitFor({state:'hidden'});
 await send('Nowa rozmowa po czyszczeniu.',3);
 assert.deepEqual(seen[2],[]);
 if(tls){
  await page.getByLabel('Twój poprawiony wzór').fill('2');
  await page.locator('#prediction0').fill('2');
  await page.locator('#prediction1').fill('2');
  await page.getByRole('button',{name:'Sprawdź naprawę'}).click();
  await page.getByRole('button',{name:'Zapisz notatkę dla Piko'}).click();
  await page.getByRole('button',{name:'Piko, spróbuj sam'}).click();
  await page.getByText('Proponuję stałą 3.',{exact:true}).waitFor();
  await page.getByLabel('Jeszcze nie wiem',{exact:true}).check();
  await page.getByRole('button',{name:'Sprawdź lot Piko'}).click();
  assert.match(await page.getByRole('region',{name:'Sprawdzone obliczenia'}).innerText(),/Bezpieczny lot/);
  report.transferChecked=true;
  const listener=server;
  await new Promise<void>(resolve=>listener.close(()=>resolve()));
  await page.getByRole('button',{name:'Jedna poprawka Piko'}).click();
  await page.getByText('Brak połączenia z serwerem live.',{exact:false}).waitFor();
  assert.match(await page.getByTestId('ai-mode').innerText(),/AI niedostępne/);
  assert.match(await page.getByRole('region',{name:'Sprawdzone obliczenia'}).innerText(),/Bezpieczny lot/);
  report.disconnectedStateVerified=true;
 }
 report.status='PASS';
 report.oldContextCleared=true;
}catch(error){
 report.error=error instanceof Error?error.message:'Unexpected Electron relay failure';
 process.exitCode=1;
}finally{
 report.stubCalls=seen.length;
 await writeFile(process.env.PIKO_DESKTOP_RELAY_REPORT??'checks/desktop-relay-smoke.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
 if(app)await app.close();
 if(server?.listening)await new Promise<void>(resolve=>server?.close(()=>resolve()));
 store.close();
 await rm(directory,{recursive:true,force:true});
}
