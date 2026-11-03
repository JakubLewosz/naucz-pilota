import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const image=process.env.PIKO_DOCKER_IMAGE??'naucz-pilota:codex-readiness',name=`piko-smoke-${process.pid}`,volume=`${name}-state`;
const run=(args:string[])=>execFileSync('docker',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
let started=false,volumeCreated=false;
const report:{date:string;status:string;image:string;checks:string[];providerCalls:number;publicHTTPS:string;error?:string}={date:new Date().toISOString(),status:'RUNNING',image,checks:[],providerCalls:0,publicHTTPS:'NOT DEPLOYED'};
try{
 run(['volume','create',volume]);volumeCreated=true;
 run(['run','-d','--name',name,'--publish','127.0.0.1::3001','--mount',`type=volume,source=${volume},target=/app/var`,'--env','AI_MODE=demo','--env','PUBLIC_ORIGIN=http://127.0.0.1',image]);started=true;
 const address=()=>`http://127.0.0.1:${Number(run(['port',name,'3001/tcp']).split(':').at(-1))}`;let origin=address();
 const ready=async()=>{for(let i=0;i<50;i++){try{if((await fetch(origin+'/api/health')).ok)return;}catch{/* container startup */}await new Promise(r=>setTimeout(r,200));}throw new Error('Container health timeout');};
 await ready();assert.equal((await(await fetch(origin+'/api/health')).json()).mode,'demo');report.checks.push('HTTP health and explicit demo');
 const headers={'Content-Type':'application/json',Origin:'app://piko','X-Piko-Desktop':'1'};
 const session=await(await fetch(origin+'/api/session',{method:'POST',headers,body:'{}'})).json() as {sessionId:string;token:string};assert.ok(session.token);
 const evidence=run(['exec',name,'node','-e',"const fs=require('fs'); console.log(!fs.existsSync('/app/.env')&&!fs.existsSync('/app/content/missions.v1.json')&&process.getuid()!==0)"]);
 assert.equal(evidence,'true');report.checks.push('No .env or author corpus; runtime is not root');
 run(['restart',name]);origin=address();await ready();
 const resumed=await(await fetch(origin+'/api/session',{method:'POST',headers:{...headers,Authorization:'Bearer '+session.token},body:'{}'})).json() as {sessionId:string};assert.equal(resumed.sessionId,session.sessionId);report.checks.push('Session and SQLite survive process restart on mounted volume');
 report.status='PASS';
}catch(error){report.status='FAIL';report.error=error instanceof Error?error.message:'Docker smoke failed';process.exitCode=1;}
finally{
 if(started){run(['stop',name]);run(['rm',name]);}if(volumeCreated)run(['volume','rm',volume]);
 await mkdir('checks',{recursive:true});await writeFile('checks/docker-smoke.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}
