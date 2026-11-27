/**
 * Film konkursowy, wersja animowana (kierunek B).
 * Animacja w HTML (tools/film-b/page.js) renderowana klatka po klatce przez Playwright: brak drgań, pełna powtarzalność.
 * Prawdziwa gra pojawia się we wstawkach z var/film/raw.webm (tools/record-film.ts).
 * Głosy: Piper (lektor mc_speech, Piko gosia). Muzyka: tools/film-music.py.
 * Wynik: release/media/Piko_Misja_Funkcja_film_v3.mp4. Opcja --frames=12,40 renderuje tylko podgląd klatek z podanych sekund.
 */
import {spawnSync} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import missions from '../content/missions.v1.json';

const FF=process.env.FFMPEG??'var/filmtools/node_modules/ffmpeg-static/ffmpeg';
const PY='var/tts/bin/python',NARRATOR='var/film/voice/pl_PL-mc_speech-medium.onnx',PIKO='var/film/voice/pl_PL-gosia-medium.onnx';
const W='var/film/b';for(const d of ['audio','frames','clips','preview'])mkdirSync(`${W}/${d}`,{recursive:true});mkdirSync('release/media',{recursive:true});
const FPS=30,LEAD=0.6,GAP=0.3;
const run=(cmd:string,args:string[],input?:string)=>{const r=spawnSync(cmd,args,{encoding:'utf8',input,maxBuffer:1<<26});if(r.status!==0)throw new Error(`${cmd} ${args.slice(0,8).join(' ')}…\n${r.stderr?.slice(-3000)}`);return r;};
const duration=(file:string)=>{const r=spawnSync(FF,['-i',file],{encoding:'utf8'});const m=/Duration: (\d+):(\d+):([\d.]+)/.exec(r.stderr);if(!m)throw new Error('No duration '+file);return Number(m[1])*3600+Number(m[2])*60+Number(m[3]);};
const previewArg=process.argv.find(a=>a.startsWith('--frames='));

type Line={who:'n'|'p';text:string;tts?:string;gap?:number};
type Scene={id:string;lines:Line[];tail?:number;min?:number;clips?:string[]};
const n=(text:string,tts?:string,gap?:number):Line=>({who:'n',text,tts,gap}),p=(text:string,tts:string):Line=>({who:'p',text,tts});
const scenes:Scene[]=[
 {id:'hook',lines:[n('Zwykle to sztuczna inteligencja tłumaczy uczniowi.'),n('A gdyby odwrócić role?',undefined,0.5)],tail:1.3},
 {id:'title',lines:[n('Poznajcie Piko: robota, który uczy się tylko od was.')],tail:1},
 {id:'rules',lines:[n('W grze wzór funkcji wyznacza tor lotu. Trzeba trafić w bramki i ominąć przeszkodę.')],tail:1.6,min:8},
 {id:'game1',clips:['practice-fix'],lines:[n('Tak wygląda to w prawdziwej grze. Sześć misji, od prostej po parabolę.')],tail:.9},
 {id:'steps',lines:[n('Każda misja ma cztery kroki: lecisz sam, uczysz Piko, oglądasz jego lot i na koniec sprawdzasz siebie.')],tail:2},
 {id:'lesson1',lines:[n('Lekcja pierwsza. Uczeń tłumaczy krótko.'),
  p('Myślę, że zamiana minusa na plus przesuwa parabolę, ale nie wiem jeszcze, w którą stronę ani o ile.','Myślę, że zamiana minusa na plus przesuwa parabolę. Ale nie wiem jeszcze, w którą stronę, ani o ile.')],tail:1.7},
 {id:'flight1',lines:[n('Nowa trasa. Piko nie dostaje gotowej zasady. Zna tylko tę lekcję.'),
  p('To zgadywanie, bo lekcja nie mówi, jak dobrać liczbę w nawiasie.','To zgadywanie, bo lekcja nie mówi, jak dobrać liczbę w nawiasie.'),
  n('Pudło. Tor nie trafia nawet w start.',undefined,1.5)],tail:1.6},
 {id:'game2',clips:['transfer1-crash'],lines:[n('W grze widać to czarno na białym. Piko poleciał dokładnie tak, jak go nauczono.')],tail:.9},
 {id:'insight',lines:[n('Żeby Piko poleciał dobrze, uczeń musi najpierw sam znaleźć lukę w swoim rozumowaniu.')],tail:1},
 {id:'lesson2',lines:[n('Lekcja druga. Tym razem pełna: nawias zeruje się w wierzchołku.'),
  p('Myślę, że liczba w nawiasie ma przeciwny znak niż x wierzchołka, bo nawias zeruje się w wierzchołku.','Myślę, że liczba w nawiasie ma przeciwny znak, niż iks wierzchołka, bo nawias zeruje się w wierzchołku.')],tail:1.7},
 {id:'flight2',lines:[n('Ta sama trasa, druga próba.'),
  p('Bramki są w x=1 i x=3, więc dołek toru chcę mieć pośrodku, w x=2. Spróbuję wzoru 0,25(x-2)^2, bo nawias zeruje się wtedy dla x=2.','Bramki są w iks równym jeden, i iks równym trzy, więc dołek toru chcę mieć pośrodku, w iks równym dwa. Spróbuję wzoru zero przecinek dwadzieścia pięć, razy nawias iks minus dwa, do kwadratu, bo nawias zeruje się wtedy dla iks równego dwa.'),
  n('Udało się!',undefined,4.6)],tail:2.2},
 {id:'game3',clips:['transfer2-success'],lines:[n('Piko się nauczył, bo uczeń naprawdę to zrozumiał.')],tail:.9,min:5},
 {id:'game4',clips:['human','journal'],lines:[n('Na koniec uczeń leci sam, bez pomocy. A dziennik pokazuje, co zapamiętał Piko.')],tail:.9},
 {id:'tech',lines:[n('Claude odgrywa ucznia w ściśle określonym formacie, a tekst gracza to dla niego tylko dane.','Klod odgrywa ucznia w ściśle określonym formacie, a tekst gracza to dla niego tylko dane.'),
  n('Wynik każdego lotu liczy silnik matematyczny gry, a nie sztuczna inteligencja.',undefined,.5),
  n('Gra działa w przeglądarce i jako aplikacja Windows, także bez internetu.','Gra działa w przeglądarce i jako aplikacja na Windows, także bez internetu.',.5)],tail:1.6},
 {id:'outro',lines:[n('Piko: Misja Funkcja. Naucz Piko. Sprawdź siebie.','Piko, Misja Funkcja. Naucz Piko. Sprawdź siebie.')],tail:2.4}
];

// 1. Głosy i oś czasu
type Cue={t:number;d:number;who:'n'|'p';text:string;file:string};
const timing:Record<string,{start:number;end:number;cues:Cue[]}>={};
let clock=0;
for(const sc of scenes){
 const cues:Cue[]=[];let t=clock+LEAD;
 for(const [k,line] of sc.lines.entries()){
  const raw=`${W}/audio/${sc.id}-${k}.raw.wav`,wav=`${W}/audio/${sc.id}-${k}.wav`;
  const stamp=`${W}/audio/${sc.id}-${k}.txt`,want=`${line.who}|${line.tts??line.text}`;
  if(existsSync(wav)&&existsSync(stamp)&&readFileSync(stamp,'utf8')===want){/* głos z poprzedniego przebiegu */}
  else if(line.who==='n'){
   run(PY,['-m','piper','-m',NARRATOR,'-f',raw,'--length-scale','1.0','--sentence-silence','0.25','--noise-scale','0.6','--noise-w-scale','0.8'],line.tts??line.text);
   run(FF,['-y','-loglevel','error','-i',raw,'-af','highpass=f=70,lowpass=f=11000,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-16:TP=-1.5:LRA=7,aresample=48000','-ac','2',wav]);
  }else{
   run(PY,['-m','piper','-m',PIKO,'-f',raw,'--length-scale','0.98','--sentence-silence','0.22','--noise-scale','0.55','--noise-w-scale','0.7'],line.tts??line.text);
   run(FF,['-y','-loglevel','error','-i',raw,'-af','asetrate=22050*1.16,aresample=48000,atempo=0.93,highpass=f=140,aecho=0.8:0.5:14:0.22,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-16:TP=-1.5:LRA=7','-ac','2',wav]);
  }
  writeFileSync(stamp,want);
  t+=line.gap??(k?GAP:0);const d=duration(wav);cues.push({t,d,who:line.who,text:line.text,file:wav});t+=d;
 }
 const end=Math.max(t+(sc.tail??.8),clock+(sc.min??0));
 timing[sc.id]={start:clock,end,cues};clock=end;
}
const total=clock+0.5,totalFrames=Math.round(total*FPS);
console.log('timeline',Object.entries(timing).map(([id,s])=>`${id}:${s.start.toFixed(1)}`).join(' '),'total',total.toFixed(1));

// 2. Wstawki z prawdziwej gry -> sekwencje JPG
const {markers,viewport}=JSON.parse(readFileSync('var/film/markers.json','utf8')) as {viewport:{w:number;h:number};markers:{id:string;t:number;focus:{x:number;y:number;w:number;h:number}|null}[]};
function cropFor(id:string){
 const m=markers.find(x=>x.id===id),SW=viewport.w,SH=viewport.h,def={x:0,y:Math.round((SH-SW*9/16)/2),w:SW,h:Math.round(SW*9/16)};
 if(!m?.focus)return def;
 const pad=60,f=m.focus,x0=f.x-pad,y0=f.y-pad,x1=f.x+f.w+pad,y1=f.y+f.h+pad;
 let w=Math.max(x1-x0,(y1-y0)*16/9,SW/1.4);if(w>=SW)return def;
 const hh=w*9/16,x=Math.min(Math.max(0,(x0+x1)/2-w/2),SW-w),y=Math.min(Math.max(0,(y0+y1)/2-hh/2),SH-hh);
 w=Math.round(w/2)*2;return {x:Math.round(x),y:Math.round(y),w,h:Math.round(w*9/16/2)*2};
}
const clips:Record<string,{dir:string;count:number}>={};
for(const sc of scenes.filter(s=>s.clips)){
 const s=timing[sc.id],count=Math.round((s.end-s.start-.1)*FPS),dir=`${W}/clips/${sc.id}`;mkdirSync(dir,{recursive:true});
 const segs=sc.clips!.map(id=>{const i=markers.findIndex(m=>m.id===id);return {id,a:markers[i].t,len:markers[i+1].t-markers[i].t};}),sum=segs.reduce((a,x)=>a+x.len,0);
 let done=0;
 for(const [k,seg] of segs.entries()){
  const frames=k===segs.length-1?count-done:Math.round(count*seg.len/sum),speed=seg.len/(frames/FPS),c=cropFor(seg.id);
  run(FF,['-y','-loglevel','error','-ss',seg.a.toFixed(3),'-t',seg.len.toFixed(3),'-i','var/film/raw.webm','-vf',
   `setpts=(PTS-STARTPTS)/${speed.toFixed(4)},fps=${FPS},crop=${c.w}:${c.h}:${c.x}:${c.y},scale=1360:765:flags=lanczos,tpad=stop_mode=clone:stop_duration=2`,
   '-frames:v',String(frames),'-start_number',String(done+1),'-q:v','3',`${dir}/%05d.jpg`]);
  done+=frames;
 }
 clips[sc.id]={dir:`clips/${sc.id}`,count};
}

// 3. Strona z animacją
// Czcionki z pakietów: podzbiory latin i latin-ext z ich zakresami znaków, osadzone w stronie.
const fontCss=['@fontsource-variable/shantell-sans','@fontsource-variable/atkinson-hyperlegible-next'].map(pkg=>{
 const dir=`node_modules/${pkg}`;
 return readFileSync(`${dir}/index.css`,'utf8').split('@font-face').slice(1).map(b=>'@font-face'+b)
  .filter(b=>/latin(-ext)?-wght-normal/.test(b)&&!/italic/.test(b))
  .map(b=>b.replace(/src:[^;]+;/,(m)=>{const file=/files\/([^)]+\.woff2)/.exec(m)![1];return `src:url(data:font/woff2;base64,${readFileSync(`${dir}/files/${file}`).toString('base64')}) format("woff2");`;})).join('\n');
}).join('\n');
const glyph=readFileSync('apps/web/src/Piko.tsx','utf8').match(/<>([\s\S]*?)<\/>/)![1].replace(/strokeWidth/g,'stroke-width').replace(/strokeLinecap/g,'stroke-linecap');
const m4=missions.missions[3],pick=(s:typeof m4.scenes.practice)=>({domain:s.domain,start:s.start,goal:s.goal,gates:s.gates,obstacles:s.obstacles});
const data={scenes:Object.fromEntries(Object.entries(timing).map(([id,s])=>[id,{start:s.start,end:s.end,cues:s.cues.map(({t,d,who,text})=>({t,d,who,text}))}])),clips,glyph,practice:pick(m4.scenes.practice),transfer:pick(m4.scenes.robot_transfer)};
writeFileSync(`${W}/film.html`,`<!doctype html><html lang="pl"><head><meta charset="utf-8"><style>${fontCss}\n${readFileSync('tools/film-b/page.css','utf8')}</style></head>
<body><div id="margin"></div><div id="stage"></div><div id="caption"><span></span></div>
<script>window.DATA=${JSON.stringify(data)};</script><script>${readFileSync('tools/film-b/page.js','utf8')}</script></body></html>`);
const url='file://'+path.resolve(`${W}/film.html`);

// 4. Render klatka po klatce (równolegle)
const browser=await chromium.launch();
async function worker(frames:number[],dir:string,name:(i:number)=>string){
 const page=await browser.newPage({viewport:{width:1920,height:1080}});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);await page.evaluate(()=>(window as unknown as {ready:Promise<unknown>}).ready);
 if(errors.length)throw new Error('Page error: '+errors.join('; '));
 for(const i of frames){await page.evaluate(t=>(window as unknown as {seek:(t:number)=>Promise<void>}).seek(t),i/FPS);await page.screenshot({path:`${dir}/${name(i)}`,type:'jpeg',quality:93});}
 await page.close();
}
if(previewArg){
 const secs=previewArg.slice(9).split(',').map(Number);
 await worker(secs.map(s=>Math.round(s*FPS)),`${W}/preview`,i=>`t${String(Math.round(i/FPS*10)/10).padStart(5,'0')}.jpg`);
 await browser.close();console.log('preview',secs.join(','));process.exit(0);
}
const WORKERS=5,all=Array.from({length:totalFrames},(_,i)=>i);
await Promise.all(Array.from({length:WORKERS},(_,w)=>worker(all.filter(i=>i%WORKERS===w),`${W}/frames`,i=>`${String(i+1).padStart(6,'0')}.jpg`)));
await browser.close();

// 5. Dźwięk
run(PY,['-c',`
import numpy as np, wave
SR=48000
def save(name,x):
    x=np.stack([x,x],1); x=x/(np.max(np.abs(x))+1e-9)*0.7
    w=wave.open(name,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype('<i2').tobytes()); w.close()
def tone(f,d,decay=5):
    t=np.arange(int(SR*d))/SR; return (np.sin(2*np.pi*f*t)+0.3*np.sin(4*np.pi*f*t))*np.exp(-t*decay)
def seq(notes,step,d,decay):
    out=np.zeros(int(SR*(step*len(notes)+d)))
    for i,f in enumerate(notes):
        a=int(SR*step*i); s=tone(f,d,decay); out[a:a+len(s)]+=s
    return out
save('${W}/audio/sfx-success.wav',seq([523.25,659.25,783.99,1046.5,1318.5],0.1,1.0,3.5))
t=np.arange(int(SR*0.9))/SR
fall=np.sin(2*np.pi*np.cumsum(330*np.exp(-t*2.2))/SR)*np.exp(-t*3)
thud=np.sin(2*np.pi*70*t)*np.exp(-t*9)
save('${W}/audio/sfx-fail.wav',fall*0.7+np.concatenate([np.zeros(int(SR*0.32)),thud])[:len(t)])
save('${W}/audio/sfx-pop.wav',tone(880,0.18,22))
`]);
const tracks=Object.values(timing).flatMap(s=>s.cues.map(c=>({file:c.file,at:c.t,vol:1})));
const f1=timing.flight1.cues,f2=timing.flight2.cues;
tracks.push({file:`${W}/audio/sfx-fail.wav`,at:f1[2].t-.15,vol:.4},{file:`${W}/audio/sfx-success.wav`,at:f2[1].t+f2[1].d+4.4,vol:.4});
const mix=tracks.map((tr,k)=>`[${k}:a]volume=${tr.vol},adelay=${Math.round(tr.at*1000)}|${Math.round(tr.at*1000)}[a${k}]`).join(';');
run(FF,['-y','-loglevel','error',...tracks.flatMap(tr=>['-i',tr.file]),'-filter_complex',`${mix};${tracks.map((_,k)=>`[a${k}]`).join('')}amix=inputs=${tracks.length}:normalize=0,apad=whole_dur=${total.toFixed(3)}[v]`,'-map','[v]','-t',total.toFixed(3),'-ar','48000',`${W}/audio/voice.wav`]);
run(PY,['tools/film-music.py',total.toFixed(2),`${W}/audio/music.wav`]);
run(FF,['-y','-loglevel','error','-i',`${W}/audio/voice.wav`,'-i',`${W}/audio/music.wav`,'-filter_complex',
 '[1:a]aresample=48000,volume=0.17[m];[0:a]asplit=2[vo][sc];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=450[md];[vo][md]amix=inputs=2:normalize=0,alimiter=limit=0.95[out]',
 '-map','[out]','-c:a','aac','-b:a','192k',`${W}/audio/audio.m4a`]);

// 6. Film
const final='release/media/Piko_Misja_Funkcja_film_v3.mp4';
run(FF,['-y','-loglevel','error','-framerate',String(FPS),'-i',`${W}/frames/%06d.jpg`,'-i',`${W}/audio/audio.m4a`,'-frames:v',String(totalFrames),'-map','0:v','-map','1:a',
 '-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart','-shortest',final]);
console.log('FILM',final,duration(final).toFixed(1),'s');
