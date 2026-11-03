import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {build} from 'esbuild';
await mkdir('apps/desktop/staging',{recursive:true});
for(const name of ['main.cjs','preload.cjs','distribution.json'])await cp(`apps/desktop/${name}`,`apps/desktop/staging/${name}`);
const config=JSON.parse(await readFile('apps/desktop/distribution.json','utf8'));
if(config.apiBaseUrl){const url=new URL(config.apiBaseUrl);if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error('Release backend must be an HTTPS origin.');}
await cp('apps/web/dist','apps/desktop/staging/web',{recursive:true});
await build({entryPoints:['packages/contracts/src/validators.generated.js'],bundle:true,platform:'node',format:'cjs',outfile:'dist/desktop/relay-validator.cjs'});
await cp('dist/desktop/relay-validator.cjs','apps/desktop/staging/relay-validator.cjs');
await writeFile('apps/desktop/staging/package.json',JSON.stringify({name:'naucz-pilota',version:'1.0.0',main:'main.cjs',description:'Gra edukacyjna o funkcjach',author:'Naucz Pilota',license:'UNLICENSED'}));
console.log('Desktop staging ready. Live endpoint:',config.apiBaseUrl?'configured':'NOT CONFIGURED; explicit offline demo available.');
