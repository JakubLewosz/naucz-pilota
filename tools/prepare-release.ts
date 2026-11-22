import {mkdir,cp,readFile,readdir,writeFile,stat} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {writeSourceZip} from './zip';
import path from 'node:path';
import {PROMPT_VERSION} from '../apps/server/src/system';
const root=process.env.PIKO_RELEASE_DIR??'release/Piko_Misja_Funkcja_zgloszenie';
for(const dir of ['01_formularze','02_aplikacja','03_kod','04_instrukcja','05_prezentacja','06_weryfikacja'])await mkdir(`${root}/${dir}`,{recursive:true});
await writeFile(`${root}/01_formularze/DO_UZUPELNIENIA.txt`,'Tu wstaw skany: Karta Zgłoszenia (Załącznik nr 1) i Klauzula Informacyjna (Załącznik nr 2), wypełnione i podpisane (za osoby niepełnoletnie podpisuje także rodzic lub opiekun). Formularze do pobrania ze strony konkursu.\n');
for(const [source,target] of [
 [process.env.PIKO_WINDOWS_ZIP??'release/bin/Piko_Misja_Funkcja_1.0.0_Windows_x64.zip','02_aplikacja/Piko_Misja_Funkcja_Windows.zip'],
 ['output/pdf/instrukcja_uruchomienia.pdf','02_aplikacja/instrukcja_uruchomienia.pdf'],
 ['output/pdf/instrukcja_kompilacji.pdf','03_kod/instrukcja_kompilacji.pdf'],
 ['output/pdf/instrukcja_uzytkownika.pdf','04_instrukcja/instrukcja_uzytkownika.pdf'],
 ['output/pdf/opis_funkcjonalnosci.pdf','05_prezentacja/opis_funkcjonalnosci.pdf'],
 ['output/pdf/raport_weryfikacji.pdf','06_weryfikacja/raport_weryfikacji.pdf'],
 ['release/media/Piko_Misja_Funkcja_film.mp4','05_prezentacja/Piko_Misja_Funkcja_film.mp4']]){
 if(!existsSync(source))throw new Error(`Required release artifact missing: ${source}`);await cp(source,`${root}/${target}`);
}
// Historical live clips are described in the report, separate from this candidate's film.
for(const file of await readdir('docs/konkurs'))await cp(`docs/konkurs/${file}`,`${root}/01_formularze/${file}`);
await cp('release/CHECKLISTA.md',`${root}/CHECKLISTA.md`);
for(const name of (await readdir('checks')).filter(f=>f.endsWith('.json')&&!f.includes('e2e-results')&&!f.includes('unit-results')))await cp(`checks/${name}`,`${root}/06_weryfikacja/${name}`);
const lock=JSON.parse(await readFile('package-lock.json','utf8')) as {packages:Record<string,{version?:string;license?:string}>};
let notices='PIKO: MISJA FUNKCJA 1.0.0 — THIRD-PARTY NOTICES\n\nRuntime and author tools resolved by package-lock.json. Electron distribution includes LICENSE and LICENSES.chromium.html. Source code author identity and licensing are to be confirmed by its owner.\n';
for(const [entry,meta]of Object.entries(lock.packages)){
 if(!entry.startsWith('node_modules/')||!meta.version)continue;
 notices+=`\n${entry} @ ${meta.version}\nLicense identifier: ${meta.license??'See upstream package'}\n`;
 if(existsSync(entry))for(const name of await readdir(entry))if(/^licen[sc]e(?:\..*)?$/i.test(name)&&!(await stat(path.join(entry,name))).isDirectory()){notices+='\n'+await readFile(path.join(entry,name),'utf8')+'\n';break;}
}
await writeFile('release/THIRD_PARTY_NOTICES.txt',notices);await writeFile(`${root}/03_kod/THIRD_PARTY_NOTICES.txt`,notices);
// Explicit top-level source allowlist; no .env, var, release binaries, saves or node_modules.
const top=['.github','apps','packages','content','contracts','docs','tools','tests','checks','output/pdf','release/media','release/CHECKLISTA.md','release/THIRD_PARTY_NOTICES.txt','AGENTS.md','README.md','START_CODEX.md','SCHEMAT_PROJEKTU.md','IMPLEMENTATION_STATUS.md','package.json','package-lock.json','tsconfig.json','vitest.config.ts','playwright.config.ts','eslint.config.js','Dockerfile','deploy/jury/compose.yaml','deploy/jury/Caddyfile','deploy/jury/compose-code.yaml','.dockerignore','.env.example','.gitignore','.nvmrc'];
const sourceFiles:string[]=[];
async function collect(file:string){
 const info=await stat(file);
 if(info.isDirectory()){
  if(['node_modules','dist','staging','__pycache__'].includes(path.basename(file)))return;
  for(const f of await readdir(file))await collect(path.join(file,f));
 }else if(!/\.pyc$|\.DS_Store$/.test(file)&&!/^checks\/(?:debug|unit-results|e2e-results|package-audit)/.test(file))sourceFiles.push(file);
}
for(const file of top)await collect(file);
const zipPath=path.resolve(`${root}/03_kod/Piko_Misja_Funkcja_kod.zip`);
await writeSourceZip(zipPath,sourceFiles);
const live=existsSync('checks/ai-live-results.json')?JSON.parse(await readFile('checks/ai-live-results.json','utf8')) as {status:string;promptVersion:string;results:{status:string}[]}:null;
const verifiedLive=live?.promptVersion===PROMPT_VERSION&&live.status.startsWith('PASSED STRUCTURAL')&&live.results.length===22&&live.results.every(result=>result.status==='PASS');
const summary={date:new Date().toISOString(),sourceFiles:sourceFiles.length,
 scope:'Piko: Misja Funkcja 1.0.0, Windows x64 build; live AI: Claude Sonnet 5.5 (embedded local server when built with desktop:dist:ai, otherwise showcase mode).',
 live:{fullSuiteCurrent:verifiedLive,promptVersion:PROMPT_VERSION},
 missing:['Signed author forms (scans)','Current Windows EXE run on GitHub Actions or a Windows PC','Cloud sharing and e-mail to the organizer']};
await writeFile(`${root}/STAN_PACZKI.json`,JSON.stringify(summary,null,2)+'\n');
console.log('Prepared',root,'with',sourceFiles.length,'source files. External blockers remain explicit.');
