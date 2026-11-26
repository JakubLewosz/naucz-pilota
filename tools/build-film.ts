/**
 * Montaż filmu konkursowego z var/film/raw.webm + var/film/markers.json (tools/record-film.ts).
 * Lektor: Piper TTS, polski głos neuronowy „mc_speech” (offline, darmowy).
 * Muzyka: tools/film-music.py (syntetyzowana od zera). Animowane plansze: HTML + Playwright.
 * Wymaga: var/tts (Python 3.12 + piper-tts) z głosem w var/film/voice, ffmpeg (FFMPEG albo var/filmtools).
 * Wynik: release/media/Piko_Misja_Funkcja_film.mp4 (1920x1080, 30 kl./s).
 */
import {spawnSync} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync,renameSync,readdirSync,rmSync} from 'node:fs';
import {chromium} from 'playwright';

const FF=process.env.FFMPEG??'var/filmtools/node_modules/ffmpeg-static/ffmpeg';
const PY='var/tts/bin/python',VOICE=process.env.PIKO_VOICE??'var/film/voice/pl_PL-mc_speech-medium.onnx';
const W='var/film/build2';rmSync(W,{recursive:true,force:true});mkdirSync(W,{recursive:true});mkdirSync('release/media',{recursive:true});
const OUT_W=1920,OUT_H=1080,FPS=30,XF=0.45,LEAD=0.35;
const run=(cmd:string,args:string[],input?:string)=>{const r=spawnSync(cmd,args,{encoding:'utf8',input,maxBuffer:1<<26});if(r.status!==0)throw new Error(`${cmd} ${args.slice(0,6).join(' ')}…\n${r.stderr?.slice(-3000)}`);return r;};
const duration=(file:string)=>{const r=spawnSync(FF,['-i',file],{encoding:'utf8'});const m=/Duration: (\d+):(\d+):([\d.]+)/.exec(r.stderr);if(!m)throw new Error('No duration '+file);return Number(m[1])*3600+Number(m[2])*60+Number(m[3]);};

type Seg={id:string;text:string;tts?:string;slide?:'intro'|'tech'|'outro';full?:boolean};
const segments:Seg[]=[
 {id:'intro',slide:'intro',text:'Co by się stało, gdyby to uczeń uczył sztuczną inteligencję? Poznajcie Piko.'},
 {id:'home',text:'Piko: Misja Funkcja to gra o funkcjach dla szkół średnich. Zwykle to AI tłumaczy uczniowi. Tutaj jest odwrotnie: uczeń uczy robota Piko, a robota gra model językowy Claude.',
  tts:'Piko, Misja Funkcja, to gra o funkcjach dla szkół średnich. Zwykle to sztuczna inteligencja tłumaczy uczniowi. Tutaj jest odwrotnie: uczeń uczy robota Piko, a robota gra model językowy Klod.'},
 {id:'missions',text:'Sześć misji prowadzi od prostej poziomej do paraboli ustawianej w trzech krokach. Zobaczmy misję czwartą: przesunięcie paraboli w bok.'},
 {id:'practice',text:'Wzór funkcji wyznacza tor lotu. Ten wzór prowadzi prosto w przeszkodę.'},
 {id:'practice-fix',text:'Po zmianie znaku w nawiasie robot przelatuje przez wszystkie bramki.'},
 {id:'teach-idea',text:'Czas na lekcję. Piko ma ten sam błędny pomysł i od razu widać, jak kończy się jego lot.'},
 {id:'teach-fix',text:'Uczeń poprawia wzór Piko, a gra sprawdza go dokładnie.'},
 {id:'teach-weak',text:'Teraz najważniejsze: trzeba wyjaśnić Piko, dlaczego tak jest. Uczeń pisze krótko: plus w nawiasie przesuwa parabolę.'},
 {id:'teach-weak-belief',text:'Piko zapisuje w pamięci dokładnie to, co zrozumiał. I sam zauważa, że nie wie, w którą stronę ani o ile.'},
 {id:'transfer1',text:'Lot na nowej trasie. Piko nie dostaje gotowej zasady z gry. Zna tylko lekcję.'},
 {id:'transfer1-reason',text:'Stosuje to jedno zdanie i otwarcie mówi, czego w lekcji zabrakło.'},
 {id:'transfer1-crash',text:'Efekt? Rozbicie. Piko poleciał dokładnie tak, jak go nauczono.'},
 {id:'transfer1-hint',text:'Uczeń musi znaleźć brakujący element we własnym rozumowaniu i poprawić lekcję.'},
 {id:'teach-good',text:'Druga lekcja jest pełna: nawias zeruje się w wierzchołku, więc liczba w nawiasie ma znak przeciwny do jego położenia.'},
 {id:'teach-good-belief',text:'Piko zapamiętuje regułę, którą da się zastosować na każdej trasie.'},
 {id:'transfer2',text:'Ta sama nowa trasa. Druga próba.'},
 {id:'transfer2-reason',text:'Wierzchołek ma być w x równym dwa, więc Piko wybiera nawias x minus dwa.'},
 {id:'transfer2-success',text:'Tym razem się udaje. Piko się nauczył, bo uczeń naprawdę to zrozumiał.'},
 {id:'human',text:'Na koniec uczeń sprawdza siebie: nowa trasa, bez podglądu toru i bez pomocy Piko.'},
 {id:'summary',text:'Podsumowanie pokazuje osobno lot Piko i pierwszą samodzielną próbę ucznia.'},
 {id:'journal',text:'W dzienniku widać, co zapamiętał Piko, obok zasady sprawdzonej przez grę.'},
 {id:'tech',slide:'tech',text:'Claude odgrywa ucznia w ściśle określonym formacie, a tekst gracza trafia do modelu wyłącznie jako dane. Wynik każdego lotu liczy własny silnik matematyczny, nie AI. Gra działa w przeglądarce i jako aplikacja Windows z wbudowanym AI, a bez internetu przechodzi w tryb pokazowy.',
  tts:'Klod odgrywa ucznia w ściśle określonym formacie, a tekst gracza trafia do modelu wyłącznie jako dane. Wynik każdego lotu liczy własny silnik matematyczny, a nie sztuczna inteligencja. Gra działa w przeglądarce i jako aplikacja na Windows z wbudowaną sztuczną inteligencją, a bez internetu przechodzi w tryb pokazowy.'},
 {id:'outro',slide:'outro',text:'Piko: Misja Funkcja. Naucz Piko. Sprawdź siebie.',tts:'Piko, Misja Funkcja. Naucz Piko. Sprawdź siebie.'}
];

// 1. Lektor
const narration:Record<string,{file:string;dur:number}>={};
for(const seg of segments){
 const raw=`${W}/${seg.id}.raw.wav`,wav=`${W}/${seg.id}.wav`;
 run(PY,['-m','piper','-m',VOICE,'-f',raw,'--length-scale','1.04','--sentence-silence','0.28','--noise-scale','0.6','--noise-w-scale','0.8'],seg.tts??seg.text);
 run(FF,['-y','-loglevel','error','-i',raw,'-af','highpass=f=70,lowpass=f=11000,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-16:TP=-1.5:LRA=7,aresample=48000','-ac','2',wav]);
 narration[seg.id]={file:wav,dur:duration(wav)};
}

// 2. Animowane plansze (HTML nagrane przez Playwright)
const css=`*{box-sizing:border-box;margin:0}html,body{width:1920px;height:1080px;overflow:hidden}
body{background:#f5f8fa;background-image:linear-gradient(#e1e9f0 1px,transparent 1px),linear-gradient(90deg,#e1e9f0 1px,transparent 1px);background-size:36px 36px;font-family:"Shantell Sans Variable","Avenir Next",sans-serif;color:#1b2a4a}
.margin{position:absolute;top:0;bottom:0;left:120px;width:3px;background:#e8a0a8}
.fade{opacity:0;animation:fade .9s ease forwards}.up{opacity:0;transform:translateY(26px);animation:up .9s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes fade{to{opacity:1}}@keyframes up{to{opacity:1;transform:none}}
h1{font-size:150px;font-weight:800;line-height:.95;letter-spacing:-2px}h2{font-size:64px;font-weight:700}
.tag{color:#c66a00;font-size:58px;font-weight:700;margin-top:28px}.small{font-family:"Atkinson Hyperlegible Next Variable",Arial,sans-serif;color:#4a5872;font-size:30px;margin-top:40px}
.q{font-size:92px;font-weight:700;line-height:1.08;max-width:1300px}
.path{fill:none;stroke:#2747b8;stroke-width:9;stroke-linecap:round;stroke-dasharray:2600;stroke-dashoffset:2600;animation:draw 3.2s .6s ease-in-out forwards}
@keyframes draw{to{stroke-dashoffset:0}}
.piko{position:absolute;width:150px;height:150px;offset-path:path('M 960 760 C 1180 760 1250 300 1450 300 S 1720 640 1840 560');offset-rotate:0deg;offset-distance:0%;animation:fly 3.2s .6s ease-in-out forwards}
@keyframes fly{to{offset-distance:100%}}
.box{font-family:"Atkinson Hyperlegible Next Variable",Arial,sans-serif;padding:30px 36px;border:4px solid #1b2a4a;border-radius:22px;background:#fff;font-size:34px;font-weight:700;box-shadow:0 8px 0 #1b2a4a}
.ai{border-color:#c66a00;box-shadow:0 8px 0 #c66a00;color:#8a4b00}.eng{border-color:#2747b8;box-shadow:0 8px 0 #2747b8;color:#1d3a9e}
.box small{display:block;font-size:24px;font-weight:600;color:#4a5872;margin-top:6px}
.arrow{font-size:60px;color:#9aaabf}
.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:28px;margin-top:70px}
.fact{font-family:"Atkinson Hyperlegible Next Variable",Arial,sans-serif;background:#fff;border-radius:16px;padding:26px;box-shadow:0 2px 0 #d6e0e8,0 18px 30px -24px rgba(27,42,74,.5)}
.fact b{display:block;font-family:"Shantell Sans Variable",sans-serif;font-size:58px;color:#1a7a50}.fact span{font-size:25px;color:#4a5872}`;
const fontCss=['@fontsource-variable/shantell-sans','@fontsource-variable/atkinson-hyperlegible-next'].map(pkg=>{
 const dir=`node_modules/${pkg}`,file=readdirSync(`${dir}/files`).find(f=>f.includes('latin-ext-wght-normal'))!,
  family=pkg.includes('shantell')?'Shantell Sans Variable':'Atkinson Hyperlegible Next Variable';
 return `@font-face{font-family:"${family}";font-weight:300 800;src:url(data:font/woff2;base64,${readFileSync(`${dir}/files/${file}`).toString('base64')}) format("woff2")}`;
}).join('\n');
const pikoSvg=readFileSync('apps/web/src/Piko.tsx','utf8').match(/<>([\s\S]*?)<\/>/)![1]
 .replace(/strokeWidth/g,'stroke-width').replace(/strokeLinecap/g,'stroke-linecap');
const piko=(cls='')=>`<svg class="${cls}" viewBox="0 0 100 100">${pikoSvg}</svg>`;
const slides:Record<string,string>={
 intro:`<div class="margin"></div><div style="position:absolute;left:220px;top:250px"><p class="q up" style="animation-delay:.3s">Co by się stało, gdyby to uczeń uczył sztuczną inteligencję?</p>
  <p class="tag up" style="animation-delay:2.6s">Poznajcie Piko.</p></div>
  <svg style="position:absolute;inset:0" width="1920" height="1080"><path class="path" d="M 960 840 C 1180 840 1250 380 1450 380 S 1720 720 1840 640"/></svg>
  <div class="piko" style="top:80px;left:-75px">${piko()}</div>`,
 tech:`<div class="margin"></div><div style="position:absolute;left:220px;top:130px;right:180px">
  <h2 class="up">AI gra ucznia. Gra liczy wynik.</h2>
  <div style="display:flex;align-items:center;gap:30px;margin-top:60px">
   <div class="box up" style="animation-delay:.6s">Lekcja ucznia<small>jego własne słowa</small></div><div class="arrow fade" style="animation-delay:1.1s">→</div>
   <div class="box ai up" style="animation-delay:1.4s">Claude jako Piko<small>zapamiętuje, co zrozumiał</small></div><div class="arrow fade" style="animation-delay:1.9s">→</div>
   <div class="box up" style="animation-delay:2.2s">Lot na nowej trasie<small>tylko według lekcji</small></div><div class="arrow fade" style="animation-delay:2.7s">→</div>
   <div class="box eng up" style="animation-delay:3s">Silnik matematyczny<small>tor, bramki, kolizje</small></div></div>
  <div class="facts">
   <div class="fact up" style="animation-delay:5s"><b>22/22</b><span>poprawnych odpowiedzi w teście na prawdziwym modelu</span></div>
   <div class="fact up" style="animation-delay:6.4s"><b>JSON</b><span>wymuszony format; tekst gracza tylko jako dane</span></div>
   <div class="fact up" style="animation-delay:7.8s"><b>Windows</b><span>aplikacja z wbudowanym AI, bez konfiguracji</span></div>
   <div class="fact up" style="animation-delay:9.2s"><b>Offline</b><span>tryb pokazowy, gdy nie ma internetu</span></div></div></div>`,
 outro:`<div class="margin"></div><div style="position:absolute;left:220px;top:300px"><h1 class="up">Piko:<br/><span style="color:#2747b8">Misja Funkcja</span></h1>
  <p class="tag up" style="animation-delay:.8s">Naucz Piko. Sprawdź siebie.</p><p class="small fade" style="animation-delay:1.6s">Gra edukacyjna o funkcjach · AI: Claude Sonnet 5.5</p></div>
  <div style="position:absolute;right:260px;top:330px;width:330px;height:330px" class="up">${piko()}</div>`
};
const browser=await chromium.launch();
async function recordSlide(name:string,seconds:number){
 const ctx=await browser.newContext({viewport:{width:OUT_W,height:OUT_H},recordVideo:{dir:`${W}/slides`,size:{width:OUT_W,height:OUT_H}}});
 const page=await ctx.newPage();
 await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}\n${css}</style></head><body style="animation-play-state:paused">${slides[name]}</body></html>`);
 await page.waitForTimeout(seconds*1000+900);
 const v=page.video()!;await ctx.close();const out=`${W}/slide-${name}.webm`;renameSync(await v.path(),out);return out;
}

// 3. Kadry z nagrania
const {markers,viewport}=JSON.parse(readFileSync('var/film/markers.json','utf8')) as {viewport:{w:number;h:number};markers:{id:string;t:number;focus:{x:number;y:number;w:number;h:number}|null}[]};
const SRC_W=viewport.w,SRC_H=viewport.h;
function cropFor(id:string){
 const m=markers.find(x=>x.id===id),def={x:0,y:Math.round((SRC_H-SRC_W*9/16)/2),w:SRC_W,h:Math.round(SRC_W*9/16)};
 if(!m?.focus||segments.find(s=>s.id===id)?.full)return def;
 const pad=70,f=m.focus;let x0=f.x-pad,y0=f.y-pad,x1=f.x+f.w+pad,y1=f.y+f.h+pad*1.6;
 let w=Math.max(x1-x0,(y1-y0)*16/9,SRC_W/1.45);if(w>=SRC_W)return def;
 const h=w*9/16,cx=(x0+x1)/2,cy=(y0+y1)/2;
 let x=Math.min(Math.max(0,cx-w/2),SRC_W-w),y=Math.min(Math.max(0,cy-h/2),SRC_H-h);
 w=Math.round(w/2)*2;return {x:Math.round(x),y:Math.round(y),w,h:Math.round(w*9/16/2)*2};
}
const parts:{file:string;dur:number;seg:Seg}[]=[];
for(const [i,seg] of segments.entries()){
 const n=narration[seg.id].dur,out=`${W}/${String(i).padStart(2,'0')}-${seg.id}.mp4`;
 const zoom=`zoompan=z='min(1+0.035*on/(${FPS}*D),1.035)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${OUT_W}x${OUT_H}:fps=${FPS}`;
 let D:number;
 if(seg.slide){
  D=n+LEAD+(seg.slide==='outro'?2.2:1.2);
  const src=await recordSlide(seg.slide,D);
  run(FF,['-y','-loglevel','error','-ss','0.55','-t',D.toFixed(3),'-i',src,'-vf',`fps=${FPS},scale=${OUT_W}:${OUT_H},format=yuv420p`,'-an','-c:v','libx264','-preset','medium','-crf','16',out]);
 }else{
  const idx=markers.findIndex(x=>x.id===seg.id),start=markers[idx].t,len=markers[idx+1].t-start;
  D=Math.max(len,n+LEAD+0.6);const c=cropFor(seg.id);
  run(FF,['-y','-loglevel','error','-ss',start.toFixed(3),'-t',len.toFixed(3),'-i','var/film/raw.webm','-vf',
   `fps=${FPS},setpts=PTS-STARTPTS,crop=${c.w}:${c.h}:${c.x}:${c.y},scale=${OUT_W}:${OUT_H}:flags=lanczos,tpad=stop_mode=clone:stop_duration=${Math.max(0,D-len).toFixed(3)},${zoom.replace('D',D.toFixed(3))},format=yuv420p`,
   '-an','-t',D.toFixed(3),'-c:v','libx264','-preset','medium','-crf','16',out]);
 }
 parts.push({file:out,dur:duration(out),seg});console.log(seg.id,'narr',n.toFixed(1),'seg',D.toFixed(1));
}
await browser.close();

// 4. Złożenie obrazu z przejściami
let filter='',prev='[0:v]',offset=0;const starts:number[]=[0];
for(let k=1;k<parts.length;k++){
 offset+=parts[k-1].dur-XF;starts.push(offset);
 const label=k===parts.length-1?'[vout]':`[v${k}]`;
 filter+=`${prev}[${k}:v]xfade=transition=fade:duration=${XF}:offset=${offset.toFixed(3)}${label};`;prev=label;
}
const total=offset+parts.at(-1)!.dur;
run(FF,['-y','-loglevel','error',...parts.flatMap(p=>['-i',p.file]),'-filter_complex',filter.slice(0,-1),'-map','[vout]','-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p',`${W}/video.mp4`]);

// 5. Ścieżka dźwiękowa: lektor + muzyka ściszana pod głosem
const voiceInputs=parts.flatMap(p=>['-i',narration[p.seg.id].file]);
const delays=parts.map((p,k)=>{const ms=Math.round((starts[k]+LEAD)*1000);return `[${k}:a]adelay=${ms}|${ms}[a${k}]`;}).join(';');
run(FF,['-y','-loglevel','error',...voiceInputs,'-filter_complex',`${delays};${parts.map((_,k)=>`[a${k}]`).join('')}amix=inputs=${parts.length}:normalize=0,apad=whole_dur=${total.toFixed(3)}[v]`,'-map','[v]','-t',total.toFixed(3),`${W}/voice.wav`]);
run(PY,['tools/film-music.py',total.toFixed(2),`${W}/music.wav`]);
run(FF,['-y','-loglevel','error','-i',`${W}/voice.wav`,'-i',`${W}/music.wav`,'-filter_complex',
 '[1:a]volume=0.16[m];[0:a]asplit=2[vo][sc];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=450[md];[vo][md]amix=inputs=2:normalize=0,alimiter=limit=0.95[out]',
 '-map','[out]','-c:a','aac','-b:a','192k',`${W}/audio.m4a`]);

// 6. Napisy
const ts=(s:number)=>{const ms=Math.max(0,Math.round(s*1000));return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
const srt:string[]=[];let n=1;
parts.forEach((p,k)=>{
 const text=p.seg.text,sentences=text.match(/[^.!?]+[.!?]+/g)??[text],total=sentences.reduce((a,s)=>a+s.trim().length,0);
 let t=starts[k]+LEAD;const dur=narration[p.seg.id].dur;
 for(const s of sentences){const d=dur*s.trim().length/total;srt.push(`${n++}\n${ts(t)} --> ${ts(t+d-0.05)}\n${s.trim()}\n`);t+=d;}
});
writeFileSync(`${W}/subs.srt`,srt.join('\n'));
const style='FontName=Arial,Bold=1,FontSize=10,PrimaryColour=&H00FFFFFF,BackColour=&H284A2A1B,OutlineColour=&H284A2A1B,BorderStyle=3,Outline=7,Shadow=0,MarginV=18,MarginL=50,MarginR=50';
const final='release/media/Piko_Misja_Funkcja_film.mp4';
run(FF,['-y','-loglevel','error','-i',`${W}/video.mp4`,'-i',`${W}/audio.m4a`,'-vf',`subtitles=${W}/subs.srt:force_style='${style}'`,'-map','0:v','-map','1:a','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart','-shortest',final]);
console.log('FILM',final,duration(final).toFixed(1),'s');
