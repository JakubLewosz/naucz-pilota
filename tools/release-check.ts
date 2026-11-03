import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import source from '../content/missions.v1.json';
import {PROMPT_VERSION} from '../apps/server/src/system';
const require=createRequire(import.meta.url);
const asar=require('@electron/asar') as {listPackage:(file:string)=>string[];extractFile:(file:string,name:string)=>Buffer};
async function walk(dir:string):Promise<string[]>{const entries=await readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?walk(path.join(dir,e.name)):Promise.resolve([path.join(dir,e.name)])))).flat();}
const files=await walk('apps/web/dist');
const checks:{name:string;status:string;detail:string}[]=[];
const assert=(name:string,ok:boolean,detail:string)=>{checks.push({name,status:ok?'PASS':'FAIL',detail});if(!ok)process.exitCode=1;};
const pub=JSON.parse(await readFile('packages/content/generated/public-missions.json','utf8'));
assert('public data author-only fields absent',!JSON.stringify(pub).match(/"(?:witness|knownFailures)"/),'Recursive removal of author-only fields.');
const sourceKeys=new Set(source.missions.flatMap(m=>Object.values(m.scenes).flatMap(s=>Object.keys(s))));
assert('public scene keys limited',pub.missions.every((m:{scenes:Record<string,object>})=>Object.values(m.scenes).every(s=>Object.keys(s).every(k=>sourceKeys.has(k)&&!['witness','knownFailures'].includes(k)))),'No alternate embedded author corpus.');
for(const file of files){
 const text=await readFile(file,'utf8');
 assert(`renderer ${path.basename(file)}`,!(/"witness"|"knownFailures"|sk-(?:proj-)?[a-zA-Z0-9_-]{24,}|OPENAI_API_KEY|new Function\s*\(|\beval\s*\(/.test(text))&&!file.endsWith('.map'),'No answer corpus, provider keys, runtime code compilation or source maps.');
}
const archive='release/bin/win-unpacked/resources/app.asar';
if(existsSync(archive)){
 const entries=asar.listPackage(archive);
 assert('desktop package allowlist',entries.every(p=>!/(?:^|\/)node_modules(?:\/|$)|\.env(?:$|\.)|authoring-missions|\.map$|missions\.v1\.json/.test(p)),'Local frontend, main, preload, distribution and bundled DTO validator only.');
 const main=asar.extractFile(archive,'main.cjs').toString();
 assert('desktop sandbox',main.includes('nodeIntegration:false')&&main.includes('contextIsolation:true')&&main.includes('sandbox:true'),'Static configuration plus separate macOS runtime smoke.');
 const config=JSON.parse(asar.extractFile(archive,'distribution.json').toString());
 checks.push({name:'jury live endpoint',status:config.apiBaseUrl?'CONFIGURED, NOT VERIFIED':'NOT READY',detail:config.apiBaseUrl||'No HTTPS endpoint supplied; offline demo only.'});
 const exe=await readFile('release/bin/win-unpacked/Naucz Pilota.exe');assert('Windows PE executable',exe.subarray(0,2).toString()==='MZ','Cross-built PE; not a Windows runtime test.');
}else assert('Windows artifact exists',false,'Run npm run desktop:dist first.');
const artifacts=[];
for(const file of (await readdir('release/bin')).filter(f=>f.endsWith('.zip'))){const bytes=await readFile(`release/bin/${file}`);artifacts.push({file,size:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
async function optional<T>(file:string):Promise<T|null>{return existsSync(file)?JSON.parse(await readFile(file,'utf8')) as T:null;}
const live=await optional<{status:string;promptVersion:string;results:{status:string}[]}>('checks/ai-live-results.json');
const semantic=await optional<{humanSignoff:string;limitations:string[]}>('checks/ai-semantic-review.json');
const browser=await optional<{status:string;promptVersion:string}>('checks/browser-live.json');
const desktop=await optional<{platform:string;packaged:boolean;status:string}>('checks/desktop-smoke.json');
const liveCurrent=live?.promptVersion===PROMPT_VERSION&&live.status.startsWith('PASSED STRUCTURAL')&&live.results.length===22&&live.results.every(r=>r.status==='PASS');
const report={date:new Date().toISOString(),status:process.exitCode?'FAIL':'PASS LOCAL CHECKS',checks,artifacts,
 live:liveCurrent?'PASS STRUCTURAL (22 cases); semantic warnings recorded':live?.promptVersion===PROMPT_VERSION?live.status:'NOT RUN FOR CURRENT PROMPT',
 liveDetails:{promptVersion:live?.promptVersion??null,currentPromptVersion:PROMPT_VERSION,humanSignoff:semantic?.humanSignoff??'PENDING',limitations:semantic?.limitations??[],browser:browser?.promptVersion===PROMPT_VERSION?browser.status:'NOT RUN FOR CURRENT PROMPT'},
 windowsRuntime:desktop?.platform==='win32'&&desktop.packaged&&desktop.status==='PASS'?'PASS':'NOT RUN'};
await writeFile('checks/release-check.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
