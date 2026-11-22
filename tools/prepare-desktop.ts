import 'dotenv/config';
import {cp,mkdir,rm,writeFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {build} from 'esbuild';
import {readDesktopDistribution} from './desktop-distribution';
const config=await readDesktopDistribution();
await mkdir('apps/desktop/staging',{recursive:true});
for(const name of ['main.cjs','preload.cjs'])await cp(`apps/desktop/${name}`,`apps/desktop/staging/${name}`);
await writeFile('apps/desktop/staging/distribution.json',JSON.stringify(config)+'\n');
await rm('apps/desktop/staging/web',{recursive:true,force:true});
await cp('apps/web/dist','apps/desktop/staging/web',{recursive:true});
await build({entryPoints:['packages/contracts/src/validators.generated.js'],bundle:true,platform:'node',format:'cjs',outfile:'dist/desktop/relay-validator.cjs'});
await cp('dist/desktop/relay-validator.cjs','apps/desktop/staging/relay-validator.cjs');
// Wbudowane AI: tylko na wyraźne żądanie (PIKO_EMBED_AI=1). Klucz trafia wyłącznie do paczki, nigdy do repozytorium.
await rm('apps/desktop/staging/ai.json',{force:true});await rm('apps/desktop/staging/embedded-server.cjs',{force:true});
let embedded=false;
if(process.env.PIKO_EMBED_AI==='1'){
 const key=process.env.PIKO_EMBED_ANTHROPIC_KEY??process.env.ANTHROPIC_API_KEY??'';
 if(!key.startsWith('sk-ant-'))throw new Error('PIKO_EMBED_AI=1 wymaga klucza Claude (PIKO_EMBED_ANTHROPIC_KEY lub ANTHROPIC_API_KEY).');
 await build({entryPoints:['apps/server/src/embedded.ts'],bundle:true,platform:'node',format:'cjs',target:'node24',outfile:'apps/desktop/staging/embedded-server.cjs',logLevel:'warning'});
 // Zaciemnienie (nie szyfrowanie): klucz nie leży w paczce jako zwykły tekst.
 const salt=randomBytes(32),raw=Buffer.from(key,'utf8'),mixed=Buffer.from(raw.map((b,i)=>b^salt[i%salt.length]));
 await writeFile('apps/desktop/staging/ai.json',JSON.stringify({model:process.env.AI_MODEL||'claude-sonnet-5-5',effort:process.env.AI_REASONING_EFFORT||'medium',dailyBudget:Number(process.env.PIKO_EMBED_DAILY_BUDGET||150),s:salt.toString('base64'),k:mixed.toString('base64')})+'\n');
 embedded=true;
}
await writeFile('apps/desktop/staging/package.json',JSON.stringify({name:'naucz-pilota',version:'1.0.0',main:'main.cjs',description:'Gra edukacyjna o funkcjach',author:'Naucz Pilota',license:'UNLICENSED'}));
console.log('Desktop staging ready. Live endpoint:',embedded?'EMBEDDED Claude (key packaged)':config.apiBaseUrl?'configured':'NOT CONFIGURED; explicit offline demo available.');
