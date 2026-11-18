import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {randomInt,randomUUID} from 'node:crypto';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';

// The same backend and Caddyfile run on an isolated Docker network. The
// temporary override replaces Linux host networking for Docker Desktop.
const directory=await mkdtemp(path.join(tmpdir(),'piko-jury-'));
const project=`piko-jury-smoke-${randomUUID().slice(0,8)}`;
const hostname='jury.localhost',origin=`https://${hostname}`;
const subnet=`10.251.${randomInt(1,255)}`,allowed=`${subnet}.10`;
const environment=path.join(directory,'backend.env'),override=path.join(directory,'compose.yaml');
const rootCA=path.join(directory,'root.crt');
const testKey='local-smoke-placeholder';
await writeFile(environment,`OPENAI_API_KEY=${testKey}\n`,{mode:0o600});
await writeFile(override,`services:
  backend:
    ports: !reset []
  proxy:
    network_mode: !reset null
    environment:
      PIKO_JURY_UPSTREAM: backend:3001
    networks:
      default:
        aliases: [${hostname}]
networks:
  default:
    internal: true
    ipam:
      config:
        - subnet: ${subnet}.0/24
`);
const env={...process.env,PIKO_SECRET_ENV_FILE:environment,PIKO_JURY_HOST:hostname,
 PIKO_JURY_ALLOWED_IPS:allowed,PIKO_JURY_DAILY_BUDGET:'0'};
const run=(args:string[])=>execFileSync('docker',args,{encoding:'utf8',env,stdio:['ignore','pipe','pipe']}).trim();
const stack=['compose','--env-file',environment,'-p',project,'-f','deploy/jury/compose.yaml'];
let codeAccess=false;
const compose=(...args:string[])=>run([...stack,...(codeAccess?['-f','deploy/jury/compose-code.yaml']:[]),'-f',override,...args]);
const client=(script:string,options:{allow?:boolean;trust?:boolean;args?:string[]}={})=>run([
 'run','--rm','--network',`${project}_default`,...(options.allow?['--ip',allowed]:[]),
 ...(options.trust?['-v',`${rootCA}:/jury-root.crt:ro`,'-e','NODE_EXTRA_CA_CERTS=/jury-root.crt']:[]),
 '--entrypoint','node','naucz-pilota:jury','--input-type=module','-e',script,origin,allowed,...(options.args??[])
]);
const report={date:new Date().toISOString(),status:'FAIL',checks:[] as string[],paidProviderCalls:0,
 publicHTTPS:'NOT RUN',error:undefined as string|undefined};
try{
 const config=JSON.parse(run([...stack,'config','--format','json','--no-env-resolution']));
 assert.equal(config.services.proxy.network_mode,'host');
 assert.deepEqual(config.services.backend.ports.map((port:{host_ip:string})=>port.host_ip),['127.0.0.1']);
 assert.ok(!config.services.proxy.env_file&&!JSON.stringify(config.services.proxy).includes('OPENAI_API_KEY'));
 report.checks.push('Production proxy has Linux host networking; only backend loopback port and backend-only secret file');

 compose('up','-d','--build');
 for(let i=0;i<30;i++){
  try{compose('cp','proxy:/data/caddy/pki/authorities/local/root.crt',rootCA);break;}
  catch(error){if(i===29)throw error;await delay(250);}
 }
 client(`import assert from 'node:assert/strict';
  await assert.rejects(fetch(process.argv[1]+'/api/health'),error=>
   ['UNABLE_TO_VERIFY_LEAF_SIGNATURE','UNABLE_TO_GET_ISSUER_CERT_LOCALLY'].includes(error.cause?.code));`,{allow:true});
 report.checks.push('TLS without trust in the issuing CA is rejected');

 client(`import assert from 'node:assert/strict';
  const [origin,allowed]=process.argv.slice(1);
  for(const route of ['/','/api/health','/api/session','/api/learner-turn']){
   const response=await fetch(origin+route,{headers:{'X-Forwarded-For':allowed,'X-Real-IP':allowed}});
   assert.equal(response.status,403,route);
  }`,{trust:true});
 report.checks.push('Source-IP restriction blocks the site and API, including spoofed forwarding headers');

 const session=JSON.parse(client(`import assert from 'node:assert/strict';
  import {randomUUID} from 'node:crypto';
  const origin=process.argv[1];
  const post=(route,body,headers={})=>fetch(origin+route,{method:'POST',headers:{
   'Content-Type':'application/json',Origin:origin,...headers},body:JSON.stringify(body)});
  const home=await fetch(origin);assert.equal(home.status,200);assert.match(await home.text(),/Piko: Misja Funkcja/);
  assert.deepEqual(await(await fetch(origin+'/api/health')).json(),{ok:true,mode:'live',available:true,provider:'openai',model:'gpt-6-luna'});
  const badOrigin=await post('/api/session',{},{Origin:'https://foreign.invalid'});
  assert.equal(badOrigin.status,403);assert.equal((await badOrigin.json()).error.code,'ORIGIN_NOT_ALLOWED');
  const tooLarge=await post('/api/session',{text:'x'.repeat(20000)});assert.equal(tooLarge.status,413);
  const response=await post('/api/session',{});assert.equal(response.status,200);
  const cookie=response.headers.get('set-cookie');
  for(const pattern of [/^piko_session=/,/HttpOnly/i,/Secure/i,/SameSite=Strict/i])assert.match(cookie,pattern);
  const session=await response.json();assert.equal(session.token,undefined);
  const reply=await post('/api/learner-turn',{schemaVersion:'1.0.0',...session,turnId:randomUUID(),
   missionId:'M01',sceneRole:'teach',requestedMode:'live',phase:'teach_explain',userMessage:'Stała ustawia wysokość.',
   candidateExpression:null,attemptHistory:[],learnedRuleIds:[],numericEvidence:[],ruleEvidence:[]},
   {Cookie:cookie.split(';')[0]});
  assert.equal(reply.status,429);
  const envelope=await reply.json();assert.equal(envelope.error.code,'DAILY_BUDGET_EXHAUSTED');
  assert.equal(envelope.mode,'unavailable');assert.equal(envelope.model.requestCount,0);
  console.log(JSON.stringify({id:session.sessionId,cookie:cookie.split(';')[0]}));`,{allow:true,trust:true}));
 report.checks.push('Trusted TLS serves the page and Luna health; secure cookie, foreign origin rejection, 16 KiB body limit and budget 0');

 compose('restart','backend');
 client(`import assert from 'node:assert/strict';
  import {setTimeout as delay} from 'node:timers/promises';
  const [origin,,id,cookie]=process.argv.slice(1);
  for(let i=0;i<30;i++){
   const response=await fetch(origin+'/api/session',{method:'POST',headers:{'Content-Type':'application/json',
    Origin:origin,Cookie:cookie},body:'{}'});
   if(response.ok){assert.equal((await response.json()).sessionId,id);process.exit(0);}
   await delay(200);
  }
  throw new Error('Backend session not reachable after restart.');`,{allow:true,trust:true,args:[session.id,session.cookie]});
 report.checks.push('Authenticated session survives backend restart on SQLite volume');
 const accessCode='offline-https-access-code-for-tests';
 await writeFile(environment,`OPENAI_API_KEY=${testKey}\nJURY_ACCESS_CODE=${accessCode}\n`,{mode:0o600});
 codeAccess=true;
 compose('up','-d','backend','proxy');
 const codeConfig=JSON.parse(compose('config','--format','json','--no-env-resolution'));
 assert.equal(codeConfig.services.backend.environment.JURY_ACCESS_REQUIRED,'1');
 assert.equal(codeConfig.services.proxy.environment.PIKO_JURY_ALLOWED_IPS,'0.0.0.0/0 ::/0');
 assert.ok(!JSON.stringify(codeConfig.services.proxy).includes(accessCode));
 client(`import assert from 'node:assert/strict';
  import {setTimeout as delay} from 'node:timers/promises';
  const origin=process.argv[1],code=process.argv[3];
  for(let i=0;i<30;i++){
   const reply=await fetch(origin+'/api/health');
   if(reply.status===403)break;
   if(i===29)throw new Error('Access-code backend did not become ready');
   await delay(200);
  }
  const missing=await fetch(origin+'/api/health');
  assert.equal((await missing.json()).error.code,'JURY_ACCESS_REQUIRED');
  const wrong=await fetch(origin+'/api/health',{headers:{'X-Piko-Access-Code':'incorrect'}});
  assert.equal(wrong.status,403);
  const valid=await fetch(origin+'/api/health',{headers:{'X-Piko-Access-Code':code}});
  assert.equal(valid.status,200);assert.equal((await valid.json()).model,'gpt-6-luna');
  assert.equal((await fetch(origin)).status,200);`,{trust:true,args:[accessCode]});
 report.checks.push('Optional access-code stack admits an unknown source IP only with the correct code; static demo stays accessible');
 report.status='PASS';
}catch(error){
 const message=error instanceof Error?error.message:'HTTPS smoke failed';
 // CLI errors may echo the full synthetic command or cookie. Keep one line.
 report.error=message.split('\n').find(line=>/Error:|failed|denied|not found/i.test(line)&&!line.startsWith('Command failed:'))??message.split('\n')[0];
 process.exitCode=1;
}finally{
 try{compose('down','-v','--remove-orphans');}finally{await rm(directory,{recursive:true,force:true});}
 await writeFile('checks/jury-https-smoke.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
}
