/**
 * Film konkursowy, wersja 2. Ten sam materiał (var/film/raw.webm + markers.json), nowy montaż:
 * - dwa głosy: lektor (mc_speech) i Piko (gosia, podwyższony) czytający skróty swoich prawdziwych odpowiedzi,
 * - tempo dopasowane do narracji (przyspieszanie martwych chwil),
 * - etykiety kroków, stemple „Rozbicie” / „Udało się!”, dźwięki porażki i sukcesu.
 * Wynik: release/media/Piko_Misja_Funkcja_film_v2.mp4
 */
import {spawnSync} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync,renameSync,readdirSync} from 'node:fs';
import {chromium} from 'playwright';

const FF=process.env.FFMPEG??'var/filmtools/node_modules/ffmpeg-static/ffmpeg';
const PY='var/tts/bin/python',NARRATOR='var/film/voice/pl_PL-mc_speech-medium.onnx',PIKO='var/film/voice/pl_PL-gosia-medium.onnx';
const W=`var/film/build-v2-${Date.now()}`;mkdirSync(W,{recursive:true});mkdirSync('release/media',{recursive:true});
const OUT_W=1920,OUT_H=1080,FPS=30,XF=0.4,LEAD=0.3,GAP=0.28,MAX_SPEED=2.4;
const run=(cmd:string,args:string[],input?:string)=>{const r=spawnSync(cmd,args,{encoding:'utf8',input,maxBuffer:1<<26});if(r.status!==0)throw new Error(`${cmd} ${args.slice(0,8).join(' ')}…\n${r.stderr?.slice(-3000)}`);return r;};
const duration=(file:string)=>{const r=spawnSync(FF,['-i',file],{encoding:'utf8'});const m=/Duration: (\d+):(\d+):([\d.]+)/.exec(r.stderr);if(!m)throw new Error('No duration '+file);return Number(m[1])*3600+Number(m[2])*60+Number(m[3]);};

type Line={who:'n'|'p';text:string;tts?:string};
type Seg={id:string;lines:Line[];slide?:'intro'|'tech'|'outro';badge?:string;stamp?:'crash'|'success';sfx?:'fail'|'success'};
const n=(text:string,tts?:string):Line=>({who:'n',text,tts}),p=(text:string,tts:string):Line=>({who:'p',text,tts});
const segments:Seg[]=[
 {id:'intro',slide:'intro',lines:[n('Co by się stało, gdyby to uczeń uczył sztuczną inteligencję?'),n('Poznajcie Piko.')]},
 {id:'home',lines:[n('To gra o funkcjach dla szkół średnich. Zwykle to AI tłumaczy uczniowi. Tutaj jest odwrotnie: uczeń uczy robota, a robota gra model językowy Claude.',
  'To gra o funkcjach dla szkół średnich. Zwykle to sztuczna inteligencja tłumaczy uczniowi. Tutaj jest odwrotnie: uczeń uczy robota, a robota gra model językowy Klod.')]},
 {id:'missions',lines:[n('Sześć misji, od prostej poziomej po parabolę. Zobaczmy misję czwartą: przesunięcie paraboli w bok.')]},
 {id:'practice',badge:'Krok 1: Twój lot',lines:[n('Wzór funkcji wyznacza tor lotu. Ten prowadzi prosto w przeszkodę.')]},
 {id:'practice-fix',badge:'Krok 1: Twój lot',lines:[n('Zmiana znaku w nawiasie i robot przelatuje przez wszystkie bramki.')]},
 {id:'teach-idea',badge:'Krok 2: Naucz Piko',lines:[n('Czas na lekcję. Piko ma błędny pomysł i od razu widać, jak kończy się jego lot.')]},
 {id:'teach-fix',badge:'Krok 2: Naucz Piko',lines:[n('Uczeń poprawia wzór Piko.')]},
 {id:'teach-weak',badge:'Krok 2: Naucz Piko',lines:[n('Teraz najważniejsze: wyjaśnić, dlaczego. Uczeń pisze krótko: plus w nawiasie przesuwa parabolę.')]},
 {id:'teach-weak-belief',badge:'Krok 2: Naucz Piko',lines:[n('Piko zapisuje w pamięci dokładnie to, co zrozumiał.'),
  p('Myślę, że zamiana minusa na plus przesuwa parabolę, ale nie wiem jeszcze, w którą stronę ani o ile.','Myślę, że zamiana minusa na plus przesuwa parabolę. Ale nie wiem jeszcze, w którą stronę, ani o ile.')]},
 {id:'transfer1',badge:'Krok 3: Lot Piko',lines:[n('Nowa trasa. Piko nie dostaje gotowej zasady z gry. Zna tylko lekcję.')]},
 {id:'transfer1-reason',badge:'Krok 3: Lot Piko',lines:[p('Z lekcji mam tylko, że plus w nawiasie przesuwa parabolę. To zgadywanie, bo lekcja nie mówi, jak dobrać liczbę w nawiasie.',
  'Z lekcji mam tylko, że plus w nawiasie przesuwa parabolę. To zgadywanie, bo lekcja nie mówi, jak dobrać liczbę w nawiasie.')]},
 {id:'transfer1-crash',badge:'Krok 3: Lot Piko',stamp:'crash',sfx:'fail',lines:[n('Rozbicie. Piko poleciał dokładnie tak, jak go nauczono.')]},
 {id:'transfer1-hint',badge:'Krok 3: Lot Piko',lines:[n('Teraz uczeń musi znaleźć lukę we własnym rozumowaniu.')]},
 {id:'teach-good',badge:'Lekcja 2',lines:[n('Druga lekcja jest pełna: nawias zeruje się w wierzchołku.')]},
 {id:'teach-good-belief',badge:'Lekcja 2',lines:[p('Myślę, że liczba w nawiasie ma przeciwny znak niż x wierzchołka, bo nawias zeruje się w wierzchołku.',
  'Myślę, że liczba w nawiasie ma przeciwny znak, niż iks wierzchołka, bo nawias zeruje się w wierzchołku.')]},
 {id:'transfer2',badge:'Lot Piko: drugie podejście',lines:[n('Ta sama trasa. Druga próba.')]},
 {id:'transfer2-reason',badge:'Lot Piko: drugie podejście',lines:[p('Bramki są w x = 1 i x = 3, więc dołek toru chcę mieć pośrodku, w x = 2. Spróbuję nawiasu (x − 2).',
  'Bramki są w iks równym jeden, i iks równym trzy, więc dołek toru chcę mieć pośrodku, w iks równym dwa. Spróbuję nawiasu, iks minus dwa.')]},
 {id:'transfer2-success',badge:'Lot Piko: drugie podejście',stamp:'success',sfx:'success',lines:[n('Udało się! Piko się nauczył, bo uczeń naprawdę to zrozumiał.')]},
 {id:'human',badge:'Krok 4: Sprawdź siebie',lines:[n('Na koniec uczeń sprawdza siebie: nowa trasa, bez podglądu i bez pomocy.')]},
 {id:'summary',lines:[n('Podsumowanie pokazuje osobno lot Piko i samodzielną próbę ucznia.')]},
 {id:'journal',lines:[n('A w dzienniku widać, co zapamiętał Piko, obok zasady sprawdzonej przez grę.')]},
 {id:'tech',slide:'tech',lines:[n('Claude odgrywa ucznia w ściśle określonym formacie, a tekst gracza trafia do modelu wyłącznie jako dane.','Klod odgrywa ucznia w ściśle określonym formacie, a tekst gracza trafia do modelu wyłącznie jako dane.'),
  n('Wynik każdego lotu liczy własny silnik matematyczny, nie AI.','Wynik każdego lotu liczy własny silnik matematyczny, a nie sztuczna inteligencja.'),
  n('Gra działa w przeglądarce i jako aplikacja Windows z wbudowanym AI.','Gra działa w przeglądarce i jako aplikacja na Windows, z wbudowaną sztuczną inteligencją.')]},
 {id:'outro',slide:'outro',lines:[n('Piko: Misja Funkcja. Naucz Piko. Sprawdź siebie.','Piko, Misja Funkcja. Naucz Piko. Sprawdź siebie.')]}
];

// 1. Głosy: każda kwestia osobno, potem sklejenie segmentu
type Audio={file:string;dur:number;cues:{start:number;dur:number;line:Line}[]};
const audio:Record<string,Audio>={};
for(const seg of segments){
 const files:string[]=[],cues:Audio['cues']=[];let t=0;
 for(const [k,line] of seg.lines.entries()){
  const raw=`${W}/${seg.id}-${k}.raw.wav`,wav=`${W}/${seg.id}-${k}.wav`;
  if(line.who==='n'){
   run(PY,['-m','piper','-m',NARRATOR,'-f',raw,'--length-scale','1.0','--sentence-silence','0.25','--noise-scale','0.6','--noise-w-scale','0.8'],line.tts??line.text);
   run(FF,['-y','-loglevel','error','-i',raw,'-af','highpass=f=70,lowpass=f=11000,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-16:TP=-1.5:LRA=7,aresample=48000','-ac','2',wav]);
  }else{
   // Piko: jaśniejszy, lekko podwyższony głos z delikatnym „robotycznym” pogłosem.
   run(PY,['-m','piper','-m',PIKO,'-f',raw,'--length-scale','0.98','--sentence-silence','0.22','--noise-scale','0.55','--noise-w-scale','0.7'],line.tts??line.text);
   run(FF,['-y','-loglevel','error','-i',raw,'-af','asetrate=22050*1.16,aresample=48000,atempo=0.93,highpass=f=140,aecho=0.8:0.5:14:0.22,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-16:TP=-1.5:LRA=7','-ac','2',wav]);
  }
  const d=duration(wav);cues.push({start:t,dur:d,line});t+=d+GAP;files.push(wav);
 }
 const out=`${W}/${seg.id}.wav`;
 if(files.length===1)run(FF,['-y','-loglevel','error','-i',files[0],out]);
 else{
  const delays=files.map((_,k)=>`[${k}:a]adelay=${Math.round(cues[k].start*1000)}|${Math.round(cues[k].start*1000)}[a${k}]`).join(';');
  run(FF,['-y','-loglevel','error',...files.flatMap(f=>['-i',f]),'-filter_complex',`${delays};${files.map((_,k)=>`[a${k}]`).join('')}amix=inputs=${files.length}:normalize=0[o]`,'-map','[o]',out]);
 }
 audio[seg.id]={file:out,dur:t-GAP,cues};
}

// 2. Grafiki: plansze animowane, etykiety kroków, stemple
const fontCss=['@fontsource-variable/shantell-sans','@fontsource-variable/atkinson-hyperlegible-next'].map(pkg=>{
 const dir=`node_modules/${pkg}`,file=readdirSync(`${dir}/files`).find(f=>f.includes('latin-ext-wght-normal'))!,
  family=pkg.includes('shantell')?'Shantell Sans Variable':'Atkinson Hyperlegible Next Variable';
 return `@font-face{font-family:"${family}";font-weight:300 800;src:url(data:font/woff2;base64,${readFileSync(`${dir}/files/${file}`).toString('base64')}) format("woff2")}`;
}).join('\n');
const css=`*{box-sizing:border-box;margin:0}html,body{width:1920px;height:1080px;overflow:hidden}
body.page{background:#f5f8fa;background-image:linear-gradient(#e1e9f0 1px,transparent 1px),linear-gradient(90deg,#e1e9f0 1px,transparent 1px);background-size:36px 36px}
body{font-family:"Shantell Sans Variable","Avenir Next",sans-serif;color:#1b2a4a}
.margin{position:absolute;top:0;bottom:0;left:120px;width:3px;background:#e8a0a8}
.fade{opacity:0;animation:fade .8s ease forwards}.up{opacity:0;transform:translateY(26px);animation:up .8s cubic-bezier(.2,.8,.2,1) forwards}
.pop{opacity:0;transform:scale(.6) rotate(-8deg);animation:pop .5s cubic-bezier(.2,1.5,.4,1) forwards}
@keyframes fade{to{opacity:1}}@keyframes up{to{opacity:1;transform:none}}@keyframes pop{to{opacity:1;transform:scale(1) rotate(-4deg)}}
h1{font-size:150px;font-weight:800;line-height:.95;letter-spacing:-2px}h2{font-size:64px;font-weight:700}
.tag{color:#c66a00;font-size:58px;font-weight:700;margin-top:28px}.small{font-family:"Atkinson Hyperlegible Next Variable",Arial,sans-serif;color:#4a5872;font-size:30px;margin-top:40px}
.q{font-size:92px;font-weight:700;line-height:1.08;max-width:1300px}
.path{fill:none;stroke:#2747b8;stroke-width:9;stroke-linecap:round;stroke-dasharray:2600;stroke-dashoffset:2600;animation:draw 2.8s .4s ease-in-out forwards}
@keyframes draw{to{stroke-dashoffset:0}}
.piko{position:absolute;width:150px;height:150px;offset-path:path('M 960 760 C 1180 760 1250 300 1450 300 S 1720 640 1840 560');offset-rotate:0deg;offset-distance:0%;animation:fly 2.8s .4s ease-in-out forwards}
@keyframes fly{to{offset-distance:100%}}
.roles{display:flex;gap:60px;margin-top:70px;align-items:center}
.role{font-family:"Atkinson Hyperlegible Next Variable",Arial,sans-serif;width:520px;padding:34px;border-radius:22px;background:#fff;border:4px solid #1b2a4a;box-shadow:0 8px 0 #1b2a4a;font-size:30px;color:#4a5872}
.role b{display:block;font-family:"Shantell Sans Variable",sans-serif;font-size:50px;color:#1b2a4a;margin-bottom:10px}
.role.ai{border-color:#c66a00;box-shadow:0 8px 0 #c66a00}.role.ai b{color:#8a4b00}.role.eng{border-color:#2747b8;box-shadow:0 8px 0 #2747b8}.role.eng b{color:#1d3a9e}
.chips{display:flex;gap:24px;margin-top:70px}.chip{white-space:nowrap;font-family:"Atkinson Hyperlegible Next Variable",Arial,sans-serif;font-weight:700;font-size:32px;padding:18px 30px;border-radius:50px;background:#e7f6ee;color:#1a7a50;border:3px solid #1a7a50}
.badge{position:absolute;left:44px;top:40px;display:flex;align-items:center;gap:16px;padding:14px 30px 14px 16px;border-radius:60px;background:#1b2a4a;color:#fff;font-size:38px;font-weight:700;box-shadow:0 10px 24px -10px rgba(27,42,74,.7)}
.badge svg{width:58px;height:58px}
.stamp{position:absolute;right:120px;top:110px;padding:16px 44px;border:9px solid;border-radius:20px;font-size:104px;font-weight:800;transform:rotate(-4deg);background:rgba(255,255,255,.93)}
.stamp.crash{color:#c81e33;border-color:#c81e33}.stamp.success{color:#1a7a50;border-color:#1a7a50}`;
const pikoSvg=readFileSync('apps/web/src/Piko.tsx','utf8').match(/<>([\s\S]*?)<\/>/)![1].replace(/strokeWidth/g,'stroke-width').replace(/strokeLinecap/g,'stroke-linecap');
const piko=`<svg viewBox="0 0 100 100">${pikoSvg}</svg>`;
const slides:Record<string,string>={
 intro:`<div class="margin"></div><div style="position:absolute;left:220px;top:250px"><p class="q up" style="animation-delay:.2s">Co by się stało, gdyby to uczeń uczył sztuczną inteligencję?</p>
  <p class="tag up" style="animation-delay:4s">Poznajcie Piko.</p></div>
  <svg style="position:absolute;inset:0" width="1920" height="1080"><path class="path" d="M 960 840 C 1180 840 1250 380 1450 380 S 1720 720 1840 640"/></svg>
  <div class="piko" style="top:80px;left:-75px">${piko}</div>`,
 tech:`<div class="margin"></div><div style="position:absolute;left:220px;top:150px;right:160px">
  <h2 class="up">AI gra ucznia. Gra liczy wynik.</h2>
  <div class="roles">
   <div class="role ai up" style="animation-delay:.5s"><b>Claude jako Piko</b>Odpowiada w wymuszonym formacie. Tekst gracza to dla niego tylko dane.</div>
   <div class="role eng up" style="animation-delay:6.5s"><b>Silnik gry</b>Sam liczy tor, bramki i kolizje. AI nigdy nie decyduje o wyniku.</div>
  </div>
  <div class="chips"><span class="chip up" style="animation-delay:11s">Przeglądarka</span><span class="chip up" style="animation-delay:11.5s">Windows z wbudowanym AI</span><span class="chip up" style="animation-delay:12s">Tryb pokazowy offline</span><span class="chip up" style="animation-delay:12.5s">223 testy automatyczne</span></div></div>`,
 outro:`<div class="margin"></div><div style="position:absolute;left:220px;top:300px"><h1 class="up">Piko:<br/><span style="color:#2747b8">Misja Funkcja</span></h1>
  <p class="tag up" style="animation-delay:.8s">Naucz Piko. Sprawdź siebie.</p><p class="small fade" style="animation-delay:1.6s">Gra edukacyjna o funkcjach, AI: Claude Sonnet 5.5</p></div>
  <div style="position:absolute;right:260px;top:330px;width:330px;height:330px" class="up">${piko}</div>`
};
const browser=await chromium.launch();
const html=(body:string,cls='')=>`<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}\n${css}</style></head><body class="${cls}">${body}</body></html>`;
async function recordSlide(name:string,seconds:number){
 const ctx=await browser.newContext({viewport:{width:OUT_W,height:OUT_H},recordVideo:{dir:`${W}/slides`,size:{width:OUT_W,height:OUT_H}}});
 const page=await ctx.newPage();await page.setContent(html(slides[name],'page'));
 await page.waitForTimeout(seconds*1000+900);
 const v=page.video()!;await ctx.close();const out=`${W}/slide-${name}.webm`;renameSync(await v.path(),out);return out;
}
const still=await browser.newPage({viewport:{width:OUT_W,height:OUT_H}});
const overlays:Record<string,string>={};
async function overlay(key:string,body:string){
 if(overlays[key])return overlays[key];
 await still.setContent(html(body));await still.waitForTimeout(150);
 const file=`${W}/ov-${Object.keys(overlays).length}.png`;await still.screenshot({path:file,omitBackground:true});
 return overlays[key]=file;
}

// 3. Kadry z nagrania: kadrowanie, tempo dopasowane do narracji, nakładki
const {markers,viewport}=JSON.parse(readFileSync('var/film/markers.json','utf8')) as {viewport:{w:number;h:number};markers:{id:string;t:number;focus:{x:number;y:number;w:number;h:number}|null}[]};
const SRC_W=viewport.w,SRC_H=viewport.h;
function cropFor(id:string){
 const m=markers.find(x=>x.id===id),def={x:0,y:Math.round((SRC_H-SRC_W*9/16)/2),w:SRC_W,h:Math.round(SRC_W*9/16)};
 if(!m?.focus)return def;
 const pad=70,f=m.focus,x0=f.x-pad,y0=f.y-pad,x1=f.x+f.w+pad,y1=f.y+f.h+pad*1.6;
 let w=Math.max(x1-x0,(y1-y0)*16/9,SRC_W/1.45);if(w>=SRC_W)return def;
 const h=w*9/16,cx=(x0+x1)/2,cy=(y0+y1)/2;
 const x=Math.min(Math.max(0,cx-w/2),SRC_W-w),y=Math.min(Math.max(0,cy-h/2),SRC_H-h);
 w=Math.round(w/2)*2;return {x:Math.round(x),y:Math.round(y),w,h:Math.round(w*9/16/2)*2};
}
const parts:{file:string;dur:number;seg:Seg}[]=[];
for(const [i,seg] of segments.entries()){
 const need=audio[seg.id].dur+LEAD+0.55,out=`${W}/${String(i).padStart(2,'0')}-${seg.id}.mp4`;
 let D:number;
 if(seg.slide){
  D=need+(seg.slide==='outro'?2:0.6);
  const src=await recordSlide(seg.slide,D);
  run(FF,['-y','-loglevel','error','-ss','0.55','-t',D.toFixed(3),'-i',src,'-vf',`fps=${FPS},scale=${OUT_W}:${OUT_H},format=yuv420p`,'-an','-c:v','libx264','-preset','medium','-crf','16',out]);
 }else{
  const idx=markers.findIndex(x=>x.id===seg.id),start=markers[idx].t,len=markers[idx+1].t-start;
  const speed=Math.min(MAX_SPEED,Math.max(1,len/need));D=Math.max(need,len/speed);const c=cropFor(seg.id);
  const inputs=['-ss',start.toFixed(3),'-t',len.toFixed(3),'-i','var/film/raw.webm'];
  let chain=`[0:v]fps=${FPS},setpts=(PTS-STARTPTS)/${speed.toFixed(4)},crop=${c.w}:${c.h}:${c.x}:${c.y},scale=2880:1620:flags=lanczos,tpad=stop_mode=clone:stop_duration=${Math.max(0,D-len/speed+0.2).toFixed(3)},zoompan=z='min(1+0.04*on/${Math.round(FPS*D)},1.04)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${OUT_W}x${OUT_H}:fps=${FPS}[base]`;
  let last='[base]',k=1;
  if(seg.badge){
   const png=await overlay('b:'+seg.badge,`<div class="badge">${piko}<span>${seg.badge}</span></div>`);
   inputs.push('-loop','1','-t',D.toFixed(3),'-i',png);chain+=`;${last}[${k}:v]overlay=0:0[o${k}]`;last=`[o${k}]`;k++;
  }
  if(seg.stamp){
   const png=await overlay('s:'+seg.stamp,`<div class="stamp ${seg.stamp}">${seg.stamp==='crash'?'Rozbicie':'Udało się!'}</div>`);
   inputs.push('-loop','1','-t',D.toFixed(3),'-i',png);
   chain+=`;[${k}:v]format=rgba,fade=t=in:st=0.35:d=0.25:alpha=1,fade=t=out:st=${(D-0.6).toFixed(2)}:d=0.3:alpha=1[st];${last}[st]overlay=0:0[o${k}]`;last=`[o${k}]`;
  }
  run(FF,['-y','-loglevel','error',...inputs,'-filter_complex',`${chain};${last}format=yuv420p[v]`,'-map','[v]','-an','-t',D.toFixed(3),'-c:v','libx264','-preset','medium','-crf','16',out]);
 }
 parts.push({file:out,dur:duration(out),seg});console.log(seg.id,'audio',audio[seg.id].dur.toFixed(1),'seg',D.toFixed(1));
}
await browser.close();

// 4. Obraz z przejściami
let filter='',prev='[0:v]',offset=0;const starts:number[]=[0];
for(let k=1;k<parts.length;k++){
 offset+=parts[k-1].dur-XF;starts.push(offset);
 const label=k===parts.length-1?'[vout]':`[v${k}]`;
 filter+=`${prev}[${k}:v]xfade=transition=${parts[k].seg.slide||parts[k-1].seg.slide?'fade':'smoothleft'}:duration=${XF}:offset=${offset.toFixed(3)}${label};`;prev=label;
}
const total=offset+parts.at(-1)!.dur;
run(FF,['-y','-loglevel','error',...parts.flatMap(x=>['-i',x.file]),'-filter_complex',filter.slice(0,-1),'-map','[vout]','-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p',`${W}/video.mp4`]);

// 5. Dźwięk: głosy + efekty + muzyka ściszana pod głosem
run(PY,['-c',`
import numpy as np, wave
SR=48000
def save(name,x):
    x=np.stack([x,x],1); x=x/ (np.max(np.abs(x))+1e-9)*0.7
    w=wave.open(name,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype('<i2').tobytes()); w.close()
def tone(f,d,decay=5):
    t=np.arange(int(SR*d))/SR; return (np.sin(2*np.pi*f*t)+0.3*np.sin(4*np.pi*f*t))*np.exp(-t*decay)
def seq(notes,step,d,decay):
    out=np.zeros(int(SR*(step*len(notes)+d)))
    for i,f in enumerate(notes):
        a=int(SR*step*i); s=tone(f,d,decay); out[a:a+len(s)]+=s
    return out
save('${W}/sfx-success.wav',seq([523.25,659.25,783.99,1046.5],0.11,0.9,4))
t=np.arange(int(SR*0.9))/SR
fall=np.sin(2*np.pi*np.cumsum(330*np.exp(-t*2.2))/SR)*np.exp(-t*3)
thud=np.sin(2*np.pi*70*t)*np.exp(-t*9)
save('${W}/sfx-fail.wav',fall*0.7+np.concatenate([np.zeros(int(SR*0.32)),thud])[:len(t)]*1.0)
`]);
const tracks=parts.map((x,k)=>({file:audio[x.seg.id].file,at:starts[k]+LEAD,vol:1}));
parts.forEach((x,k)=>{if(x.seg.sfx)tracks.push({file:`${W}/sfx-${x.seg.sfx}.wav`,at:starts[k]+0.25,vol:0.45});});
const mix=tracks.map((tr,k)=>`[${k}:a]volume=${tr.vol},adelay=${Math.round(tr.at*1000)}|${Math.round(tr.at*1000)}[a${k}]`).join(';');
run(FF,['-y','-loglevel','error',...tracks.flatMap(tr=>['-i',tr.file]),'-filter_complex',`${mix};${tracks.map((_,k)=>`[a${k}]`).join('')}amix=inputs=${tracks.length}:normalize=0,apad=whole_dur=${total.toFixed(3)}[v]`,'-map','[v]','-t',total.toFixed(3),'-ar','48000',`${W}/voice.wav`]);
run(PY,['tools/film-music.py',total.toFixed(2),`${W}/music.wav`]);
run(FF,['-y','-loglevel','error','-i',`${W}/voice.wav`,'-i',`${W}/music.wav`,'-filter_complex',
 '[1:a]aresample=48000,volume=0.17[m];[0:a]asplit=2[vo][sc];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=450[md];[vo][md]amix=inputs=2:normalize=0,alimiter=limit=0.95[out]',
 '-map','[out]','-c:a','aac','-b:a','192k',`${W}/audio.m4a`]);

// 6. Napisy (ASS): lektor biały, Piko pomarańczowy z podpisem
const ts=(s:number)=>{const cs=Math.max(0,Math.round(s*100));return `${Math.floor(cs/360000)}:${String(Math.floor(cs/6000)%60).padStart(2,'0')}:${String(Math.floor(cs/100)%60).padStart(2,'0')}.${String(cs%100).padStart(2,'0')}`;};
const events:string[]=[];
const wrap=(s:string)=>{if(s.length<=62)return s;const mid=s.length/2;let best=-1;for(let i=0;i<s.length;i++)if(s[i]===' '&&(best<0||Math.abs(i-mid)<Math.abs(best-mid)))best=i;return s.slice(0,best)+'\\N'+s.slice(best+1);};
parts.forEach((x,k)=>{
 for(const cue of audio[x.seg.id].cues){
  const base=starts[k]+LEAD+cue.start;
  if(cue.line.who==='p'){events.push(`Dialogue: 0,${ts(base)},${ts(base+cue.dur+0.1)},Piko,,0,0,0,,${wrap('Piko: „'+cue.line.text+'”')}`);continue;}
  const sentences=cue.line.text.match(/[^.!?]+[.!?]+/g)??[cue.line.text],sum=sentences.reduce((a,s)=>a+s.trim().length,0);let t=base;
  for(const s of sentences){const d=cue.dur*s.trim().length/sum;events.push(`Dialogue: 0,${ts(t)},${ts(t+d-0.04)},Lektor,,0,0,0,,${wrap(s.trim())}`);t+=d;}
 }
});
writeFileSync(`${W}/subs.ass`,`[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Lektor,Arial,44,&H00FFFFFF,&H00FFFFFF,&H204A2A1B,&H204A2A1B,1,0,0,0,100,100,0,0,3,14,0,2,80,80,44,1
Style: Piko,Arial,44,&H001B2A4A,&H001B2A4A,&H101C9FFF,&H101C9FFF,1,0,0,0,100,100,0,0,3,14,0,2,80,80,44,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events.join('\n')}
`);
const final='release/media/Piko_Misja_Funkcja_film_v2.mp4';
run(FF,['-y','-loglevel','error','-i',`${W}/video.mp4`,'-i',`${W}/audio.m4a`,'-vf',`ass=${W}/subs.ass`,'-map','0:v','-map','1:a','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart','-shortest',final]);
console.log('FILM',final,duration(final).toFixed(1),'s','workdir',W);
