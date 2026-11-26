/* Film „Piko: Misja Funkcja” jako deterministyczna animacja: window.seek(t) ustawia dowolną klatkę. */
(()=>{
const D=window.DATA,S=D.scenes,stage=document.getElementById('stage'),NS='http://www.w3.org/2000/svg';
const anims=[],updaters=[];let pending=[],uid=0;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const h=html=>{const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstElementChild;};
const SOFT='cubic-bezier(.22,.9,.3,1)',BOUNCE='cubic-bezier(.2,1.7,.4,1)';
/** Jedna animacja na element: lista [czas, właściwości, easing]. */
function key(el,frames){
 for(let i=1;i<frames.length;i++)if(frames[i][0]<frames[i-1][0]+.01)frames[i][0]=frames[i-1][0]+.01;
 const t0=frames[0][0],t1=frames.at(-1)[0],dur=Math.max(0.001,t1-t0);
 const a=el.animate(frames.map(([t,p,e])=>({...p,offset:clamp((t-t0)/dur),easing:e||SOFT})),{delay:t0*1000,duration:dur*1000,fill:'both'});
 a.pause();anims.push(a);return el;
}
const pop=(el,t,d=.45)=>key(el,[[t,{opacity:0,transform:'scale(.4)'},BOUNCE],[t+d,{opacity:1,transform:'scale(1)'}]]);
const up=(el,t,d=.55)=>key(el,[[t,{opacity:0,transform:'translateY(34px)'}],[t+d,{opacity:1,transform:'translateY(0)'}]]);
const fade=(el,t,d=.4)=>key(el,[[t,{opacity:0},'linear'],[t+d,{opacity:1}]]);
function type(el,text,t,d){el.textContent='';updaters.push(time=>{const n=Math.round(clamp((time-t)/d)*text.length);if(el._n!==n){el._n=n;el.textContent=text.slice(0,n);}});}
function scene(id,title){
 const s=S[id],el=h('<div class="scene"></div>');stage.append(el);
 key(el,[[Math.max(0,s.start-.001),{opacity:0},'linear'],[s.start+.4,{opacity:1},'linear'],[s.end,{opacity:1},'linear'],[s.end+.4,{opacity:0}]]);
 updaters.unshift(t=>{el.style.display=t<s.start-.1||t>s.end+.5?'none':'';});
 if(title)el.append(h(`<div class="title">${title}</div>`));
 return {el,s,c:i=>s.cues[i],add(html,x,y){const e=h(html);if(x!==undefined){e.classList.add('abs');e.style.left=x+'px';e.style.top=y+'px';}el.append(e);return e;}};
}
/* Piko z mimiką */
function pikoBig(size,x,y){
 const el=h(`<div class="abs" style="left:${x}px;top:${y}px;width:${size}px;height:${size}px"><div class="bob" style="width:100%;height:100%"><svg viewBox="-6 -6 112 112" width="100%" height="100%">
 <path d="M50 18V8" stroke="#1b2a4a" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="7" r="5.5" fill="#ff9f1c" stroke="#1b2a4a" stroke-width="3"/>
 <path d="M9 41H3v24h6m82-24h6v24h-6" fill="#1b2a4a"/><rect x="9" y="19" width="82" height="73" rx="23" fill="#ff9f1c" stroke="#1b2a4a" stroke-width="4"/>
 <path d="M27 26h18" stroke="#ffd08a" stroke-width="4" stroke-linecap="round"/><rect x="19" y="34" width="62" height="40" rx="13" fill="#1b2a4a"/>
 <g data-e="normal"><rect x="30" y="45" width="10" height="13" rx="4" fill="#7fe0f0"/><rect x="60" y="45" width="10" height="13" rx="4" fill="#7fe0f0"/><path d="M43 65q7 5 14 0" stroke="#7fe0f0" stroke-width="3" fill="none" stroke-linecap="round"/></g>
 <g data-e="happy"><path d="M29 55q6 -10 12 0M59 55q6 -10 12 0" stroke="#7fe0f0" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M41 61q9 10 18 0z" fill="#7fe0f0"/></g>
 <g data-e="dizzy"><path d="M30 46l10 10m0-10l-10 10M60 46l10 10m0-10l-10 10" stroke="#7fe0f0" stroke-width="4" stroke-linecap="round"/><path d="M41 67q4.5 -5 9 0t9 0" stroke="#7fe0f0" stroke-width="3" fill="none" stroke-linecap="round"/></g>
 <g data-e="think"><rect x="30" y="48" width="10" height="9" rx="4" fill="#7fe0f0"/><rect x="60" y="43" width="10" height="14" rx="4" fill="#7fe0f0"/><path d="M45 66h11" stroke="#7fe0f0" stroke-width="3" stroke-linecap="round"/></g>
 <path d="M42 83h16" stroke="#b86500" stroke-width="3" stroke-linecap="round"/></svg></div></div>`);
 const sched=[[0,'normal']],groups=[...el.querySelectorAll('[data-e]')],bob=el.querySelector('.bob'),ph=(++uid)*1.7;
 updaters.push(t=>{let cur='normal';for(const [at,n] of sched)if(t>=at)cur=n;for(const g of groups)g.style.display=g.dataset.e===cur?'':'none';
  bob.style.transform=`translateY(${(Math.sin(t*2.1+ph)*8).toFixed(2)}px) rotate(${(Math.sin(t*1.3+ph)*2.5).toFixed(2)}deg)`;});
 el.expr=(t,n)=>{sched.push([t,n]);sched.sort((a,b)=>a[0]-b[0]);return el;};return el;
}
const student=(size,x,y)=>h(`<svg class="abs" style="left:${x}px;top:${y}px" width="${size}" height="${size}" viewBox="0 0 100 100">
 <path d="M18 96c0-22 14-34 32-34s32 12 32 34z" fill="#2747b8" stroke="#1b2a4a" stroke-width="4" stroke-linejoin="round"/>
 <circle cx="50" cy="36" r="22" fill="#ffd9b0" stroke="#1b2a4a" stroke-width="4"/><path d="M28 32c2-16 14-22 24-21s20 8 20 21c-8-2-12-6-15-12-6 8-17 12-29 12z" fill="#1b2a4a"/>
 <circle cx="42" cy="40" r="2.6" fill="#1b2a4a"/><circle cx="58" cy="40" r="2.6" fill="#1b2a4a"/><path d="M43 48q7 6 14 0" stroke="#1b2a4a" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`);
/* Plansza z prawdziwą geometrią misji */
function board(sc,U,x0,y0){
 const d=sc.domain,ML=58,MT=48,MB=52,MR=34,w=(d.xMax-d.xMin)*U,hh=(d.yMax-d.yMin)*U,id='b'+(++uid);
 const X=x=>ML+(x-d.xMin)*U,Y=y=>MT+(d.yMax-y)*U;
 let g=`<defs><pattern id="${id}h" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="13" height="13" fill="#fde7e5"/><line x1="0" y1="0" x2="0" y2="13" stroke="#e2828e" stroke-width="3.5"/></pattern>
  <clipPath id="${id}c"><rect x="${ML}" y="${MT}" width="${w}" height="${hh}"/></clipPath></defs>
  <rect x="${ML}" y="${MT}" width="${w}" height="${hh}" fill="#fff" stroke="#9fb6c8" stroke-width="3" rx="5"/>`;
 for(let x=Math.ceil(d.xMin);x<=d.xMax;x++)g+=`<line x1="${X(x)}" y1="${MT}" x2="${X(x)}" y2="${MT+hh}" stroke="#d3e1ec" stroke-width="2"/><text x="${X(x)}" y="${MT+hh+34}" text-anchor="middle" font-size="24" fill="#4a5872">${x}</text>`;
 for(let y=Math.ceil(d.yMin);y<=d.yMax;y++)g+=`<line x1="${ML}" y1="${Y(y)}" x2="${ML+w}" y2="${Y(y)}" stroke="#d3e1ec" stroke-width="2"/><text x="${ML-14}" y="${Y(y)+8}" text-anchor="end" font-size="24" fill="#4a5872">${y}</text>`;
 if(d.yMin<=0&&d.yMax>=0)g+=`<line x1="${ML}" y1="${Y(0)}" x2="${ML+w}" y2="${Y(0)}" stroke="#1b2a4a" stroke-width="3.5"/>`;
 if(d.xMin<=0&&d.xMax>=0)g+=`<line x1="${X(0)}" y1="${MT}" x2="${X(0)}" y2="${MT+hh}" stroke="#1b2a4a" stroke-width="3.5"/>`;
 for(const o of sc.obstacles)g+=`<rect x="${X(o.xMin)}" y="${Y(o.yMax)}" width="${(o.xMax-o.xMin)*U}" height="${(o.yMax-o.yMin)*U}" fill="url(#${id}h)" stroke="#c81e33" stroke-width="4" rx="4"/>`;
 const portals=[{id:'START',...sc.start},...sc.gates,{id:'META',...sc.goal}];
 for(const p of portals)g+=`<g data-p="${p.id}"><line x1="${X(p.x)}" x2="${X(p.x)}" y1="${Y(p.yMin)}" y2="${Y(p.yMax)}" stroke="#5b6b8a" stroke-width="4" stroke-dasharray="7 8"/>
  <line x1="${X(p.x)-17}" x2="${X(p.x)+17}" y1="${Y(p.yMin)}" y2="${Y(p.yMin)}" stroke="#1b2a4a" stroke-width="6" stroke-linecap="round"/><line x1="${X(p.x)-17}" x2="${X(p.x)+17}" y1="${Y(p.yMax)}" y2="${Y(p.yMax)}" stroke="#1b2a4a" stroke-width="6" stroke-linecap="round"/>
  <text x="${X(p.x)}" y="${Y(p.yMax)-20}" text-anchor="middle" font-size="23" font-weight="700" fill="#1b2a4a">${p.id}</text>
  <g class="chk" opacity="0"><circle cx="${X(p.x)}" cy="${Y((p.yMin+p.yMax)/2)}" r="19" fill="#1a7a50"/><path d="M${X(p.x)-9} ${Y((p.yMin+p.yMax)/2)}l6 7 12-14" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
 const svg=h(`<svg class="abs" style="left:${x0}px;top:${y0}px;font-family:'Atkinson Hyperlegible Next Variable',Arial" width="${ML+w+MR}" height="${MT+hh+MB}">${g}<g class="paths" clip-path="url(#${id}c)"></g><g class="top"></g></svg>`);
 const api={svg,X,Y,U,d,portals,
  curve(f,color){const pts=[];for(let i=0;i<=240;i++){const x=d.xMin+(d.xMax-d.xMin)*i/240;pts.push(`${X(x).toFixed(1)},${Y(f(x)).toFixed(1)}`);}
   const p=document.createElementNS(NS,'polyline');for(const [k,v] of Object.entries({points:pts.join(' '),fill:'none',stroke:color,'stroke-width':7,'stroke-linecap':'round','stroke-linejoin':'round',pathLength:1,'stroke-dasharray':1,'stroke-dashoffset':1}))p.setAttribute(k,v);
   svg.querySelector('.paths').append(p);return p;},
  draw(p,t,d2){key(p,[[t,{strokeDashoffset:1},'cubic-bezier(.4,0,.5,1)'],[t+d2,{strokeDashoffset:0}]]);},
  flyer(){const f=document.createElementNS(NS,'g');f.innerHTML=`<g transform="translate(-33,-33) scale(.66)">${D.glyph}</g>`;svg.querySelector('.top').append(f);return f;},
  mark(html){const m=document.createElementNS(NS,'g');m.innerHTML=html;svg.querySelector('.top').append(m);return m;},
  check(pid,t){key(svg.querySelector(`[data-p="${pid}"] .chk`),[[t,{opacity:0},BOUNCE],[t+.25,{opacity:1}]]);}
 };return api;
}
function fly(b,flyer,f,t,dur,xa,xb){
 updaters.push(time=>{const p=clamp((time-t)/dur),x=xa+(xb-xa)*p,dx=.01,slope=(f(x+dx)-f(x-dx))/(2*dx);
  flyer.setAttribute('transform',`translate(${b.X(x).toFixed(2)},${b.Y(f(x)).toFixed(2)}) rotate(${clamp(-Math.atan(slope)*180/Math.PI*.4,-22,22).toFixed(2)})`);});
 for(const p of b.portals)if(p.x>=xa&&p.x<=xb)b.check(p.id,t+dur*(p.x-xa)/(xb-xa)+.05);
}
function confetti(sc,x,y,t){
 let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647,colors=['#ff9f1c','#2747b8','#1a7a50','#c81e33','#7fe0f0','#fff2a6'];
 for(let i=0;i<70;i++){const el=sc.add(`<div class="confetti" style="background:${colors[i%6]}"></div>`,x,y),a=rnd()*Math.PI*2,r=260+rnd()*520,dx=Math.cos(a)*r,dy=Math.sin(a)*r-260,rot=rnd()*900-450;
  key(el,[[t,{opacity:0,transform:'translate(0,0) rotate(0deg)'},'cubic-bezier(.1,.7,.3,1)'],[t+.08,{opacity:1,transform:`translate(${dx*.1}px,${dy*.1}px) rotate(${rot*.1}deg)`},'cubic-bezier(.1,.7,.3,1)'],
   [t+1.1,{opacity:1,transform:`translate(${dx}px,${dy}px) rotate(${rot}deg)`},'cubic-bezier(.5,0,.9,.6)'],[t+2.4,{opacity:0,transform:`translate(${dx*1.15}px,${dy+520}px) rotate(${rot*1.8}deg)`}]]);}
}
const f1=x=>.25*(x-1)**2,fBad=x=>.25*(x+2)**2,fGood=x=>.25*(x-2)**2;

/* 1. Haczyk */
{const sc=scene('hook'),c0=sc.c(0),c1=sc.c(1);
 const ai=pikoBig(320,380,250);sc.el.append(ai);pop(ai,c0.t-.2);ai.expr(c1.t+.5,'happy');
 const st=student(320,1220,250);sc.el.append(st);pop(st,c0.t+.1);
 up(sc.add('<div class="label" style="width:320px">AI</div>',380,590),c0.t);up(sc.add('<div class="label" style="width:320px">Uczeń</div>',1220,590),c0.t+.3);
 const arrow=sc.add(`<svg width="380" height="120" viewBox="0 0 380 120"><path d="M20 60H340M290 20l52 40-52 40" fill="none" stroke="#c66a00" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/></svg>`,770,350);
 key(arrow,[[c0.t+.5,{opacity:0,transform:'rotate(0deg) scale(.6)'},BOUNCE],[c0.t+.95,{opacity:1,transform:'rotate(0deg) scale(1)'},'linear'],[c1.t+.1,{opacity:1,transform:'rotate(0deg) scale(1)'},'cubic-bezier(.5,-.3,.3,1.4)'],[c1.t+.9,{opacity:1,transform:'rotate(180deg) scale(1)'}]]);
 const l1=sc.add('<div class="label" style="width:380px;color:#c66a00">tłumaczy</div>',770,280),l2=sc.add('<div class="label" style="width:380px;color:#c66a00">uczy</div>',770,280);
 key(l1,[[c0.t+.6,{opacity:0}],[c0.t+1,{opacity:1},'linear'],[c1.t,{opacity:1}],[c1.t+.3,{opacity:0}]]);fade(l2,c1.t+.7);
 pop(sc.add('<div class="hand" style="font-size:96px;font-weight:800;width:1920px;text-align:center">A gdyby odwrócić role?</div>',0,730),c1.t+.25);
}
/* 2. Tytuł */
function titleScene(id,extra){const sc=scene(id),c0=sc.c(0);
 const bg=sc.add(`<svg width="1920" height="1080"><path d="M 900 900 C 1150 900 1230 330 1470 330 S 1760 760 1920 640" fill="none" stroke="#2747b8" stroke-width="10" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`,0,0);
 key(bg.firstElementChild,[[sc.s.start+.2,{strokeDashoffset:1},'cubic-bezier(.4,0,.4,1)'],[sc.s.start+2.2,{strokeDashoffset:0}]]);
 up(sc.add('<h1 class="big">Piko:<br/><span>Misja Funkcja</span></h1>',170,260),sc.s.start+.3);
 up(sc.add('<div class="sub">Naucz Piko. Sprawdź siebie.</div>',176,620),sc.s.start+.9);
 if(extra)fade(sc.add(`<div style="font-size:32px;color:#4a5872">${extra}</div>`,180,730),sc.s.start+1.6);
 const p=pikoBig(360,1300,170).expr(0,'happy');sc.el.append(p);pop(p,sc.s.start+.5,.6);return {sc,c0};
}
titleScene('title');
/* 3. Zasady gry */
{const sc=scene('rules','Wzór funkcji wyznacza tor lotu'),c0=sc.c(0),b=board(D.practice,116,130,150);sc.el.append(b.svg);
 const fm=sc.add('<div class="formula"></div>',1010,210);pop(fm,c0.t);type(fm,'f(x) = 0,25(x − 1)²',c0.t+.2,1.1);
 const curve=b.curve(f1,'#2747b8');b.draw(curve,c0.t+1.4,1.3);
 const fl=b.flyer();fly(b,fl,f1,c0.t+2.9,3.2,-2,4);
 const rows=[['#2747b8','f','Wzór rysuje tor'],['#1a7a50','✓','Trzeba trafić w obie bramki'],['#c81e33','!','Nie wolno dotknąć przeszkody']];
 rows.forEach((r,i)=>up(sc.add(`<div class="row"><i style="background:${r[0]}">${r[1]}</i>${r[2]}</div>`,1010,400+i*96),c0.t+1.6+i*1.5));
}
/* Wstawki z prawdziwej gry */
function clipScene(id){const sc=scene(id),clip=D.clips[id],win=sc.add(`<div class="window" style="width:1370px"><div class="bar"><i></i><i></i><i></i>Nagranie z prawdziwej gry</div><img width="1360" height="765"/></div>`,275,84),img=win.querySelector('img');
 key(win,[[sc.s.start,{transform:'scale(.94)'}],[sc.s.start+.7,{transform:'scale(1)'}]]);
 updaters.push(t=>{if(t<sc.s.start-.1||t>sc.s.end+.5)return;const i=clamp(Math.floor((t-sc.s.start-.3)*30),0,clip.count-1)+1;if(img._i!==i){img._i=i;img.src=`${clip.dir}/${String(i).padStart(5,'0')}.jpg`;pending.push(img.decode().catch(()=>{}));}});
 return sc;}
clipScene('game1');
/* 4. Cztery kroki */
{const sc=scene('steps','Cztery kroki każdej misji'),c0=sc.c(0);
 const steps=[['Twój lot','Dobierasz wzór i lecisz sam.',''],['Naucz Piko','Tłumaczysz Piko zasadę własnymi słowami.','ai'],['Lot Piko','Piko leci według Twojej lekcji.','ai'],['Sprawdź siebie','Nowa trasa, bez żadnej pomocy.','']];
 steps.forEach((s,i)=>pop(sc.add(`<div class="step ${s[2]}"><b>${i+1}</b><h3>${s[0]}</h3><p>${s[1]}</p></div>`,140+i*420,270),c0.t+c0.d*[.18,.36,.56,.8][i]));
 const br=sc.add(`<div style="width:800px;text-align:center"><svg width="800" height="50"><path d="M10 6v18q0 14 14 14h352l24 10 24-10h352q14 0 14-14V6" fill="none" stroke="#c66a00" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg><div class="hand" style="font-size:44px;font-weight:700;color:#8a4b00;margin-top:8px">tu rolę Piko gra AI: Claude</div></div>`,560,610);
 up(br,c0.t+c0.d*.9);
}
/* 5. Lekcje */
function lesson(id,title,noteText,belief,opts){const sc=scene(id,title),c0=sc.c(0),c1=sc.c(1),end=c1.t+c1.d;
 const sh=sc.add('<div class="sheet" style="width:800px"><div class="who">Lekcja ucznia</div><div class="txt"></div></div>',130,220);up(sh,sc.s.start+.2);
 type(sh.querySelector('.txt'),noteText,c0.t+.3,Math.max(2,c0.d+.4));
 const st=student(170,150,690);sc.el.append(st);pop(st,sc.s.start+.4);
 const p=pikoBig(270,1030,170).expr(c1.t-.2,'think');sc.el.append(p);pop(p,sc.s.start+.3);
 const bb=sc.add(`<div class="bubble" style="width:790px"><span class="tag">Prawdziwa odpowiedź AI (Claude)</span><div class="t"></div></div>`,1030,480);
 key(bb,[[c1.t-.3,{opacity:0,transform:'scale(.6)',backgroundColor:'#fff'},BOUNCE],[c1.t+.1,{opacity:1,transform:'scale(1)',backgroundColor:'#fff'},'linear'],[end+.2,{opacity:1,transform:'scale(1)',backgroundColor:'#fff'}],[end+.7,{opacity:1,transform:'scale(1)',backgroundColor:'#fff2a6'}]]);
 bb.style.transformOrigin='60px 0';type(bb.querySelector('.t'),belief,c1.t,c1.d*.94);
 pop(sc.add('<div class="chip saved">✓ zapisane w pamięci Piko</div>',1330,380),end+.45);
 opts?.(sc,c0,c1,p,sh);return sc;}
lesson('lesson1','Lekcja 1: uczeń tłumaczy krótko','Trzeba zamienić minus na plus. Plus w nawiasie przesuwa parabolę.','Myślę, że zamiana minusa na plus przesuwa parabolę, ale nie wiem jeszcze, w którą stronę ani o ile.',(sc,c0,c1)=>{
 pop(sc.add('<div class="chip q">w którą stronę?</div>',1350,180),c1.t+c1.d*.62);pop(sc.add('<div class="chip q">o ile?</div>',1490,265),c1.t+c1.d*.86);});
/* 6. Loty Piko na nowej trasie */
function flight(id,title,belief,speech,formula,f,good){const sc=scene(id,title),c1=sc.c(1),c2=sc.c(2),end1=c1.t+c1.d,b=board(D.transfer,112,120,150);sc.el.append(b.svg);
 up(sc.add(`<div class="note" style="width:580px"><b>Pamięć Piko (z lekcji ucznia)</b>${belief}</div>`,960,150),sc.s.start+.4);
 const p=pikoBig(210,1600,120).expr(c1.t-.2,'think');sc.el.append(p);pop(p,sc.s.start+.3);
 const bb=sc.add(`<div class="bubble" style="width:820px"><span class="tag">Prawdziwa odpowiedź AI (Claude)</span><div class="t"></div></div>`,960,420);bb.style.transformOrigin='720px 0';pop(bb,c1.t-.3);type(bb.querySelector('.t'),speech,c1.t,c1.d*.94);
 pop(sc.add(`<div class="formula">${formula}</div>`,960,770),c1.t+c1.d*.8);
 const fl=b.flyer(),sx=b.d.xMin,sy=(D.transfer.start.yMin+D.transfer.start.yMax)/2;
 if(good){
  const curve=b.curve(f,'#2747b8');b.draw(curve,end1+.3,1.1);fly(b,fl,f,end1+1.6,2.7,sx,b.d.xMax);
  const done=end1+4.4;p.expr(done,'happy');confetti(sc,b.X(b.d.xMax)+120,b.Y(sy)+150,done);
  pop(sc.add('<div class="stamp good">Udało się!</div>',300,300),done+.1);
 }else{
  const curve=b.curve(f,'#c81e33');b.draw(curve,c2.t-1.2,.9);const hit=c2.t-.15;
  const x=b.X(sx),y=b.Y(f(sx)),gy=b.Y(D.transfer.start.yMin);
  const m=b.mark(`<path d="M${x-20} ${y-20}l40 40m0-40l-40 40" stroke="#c81e33" stroke-width="10" stroke-linecap="round"/><path d="M${x+34} ${y-26}V${gy+14}m-10 14l10-16 10 16M${x+24} ${y-40}l10 16 10-16" stroke="#c81e33" stroke-width="4" fill="none" stroke-dasharray="9 8" stroke-linecap="round"/>
   <text x="${x+54}" y="${gy+52}" font-size="30" font-weight="700" fill="#c81e33" stroke="#fff" stroke-width="7" paint-order="stroke" style="font-family:'Shantell Sans Variable'">tor mija start</text>`);
  key(m,[[hit,{opacity:0},'linear'],[hit+.25,{opacity:1}]]);
  updaters.push(t=>{const dt=t-hit;let ox=0,oy=0,rot=0,op=1;if(dt>-.5&&dt<=.35)ox=Math.sin(t*46)*7;else if(dt>.35){const q=dt-.35;ox=q*70;oy=q*q*900;rot=q*420;op=clamp(1-(q-.5)*2);}
   fl.setAttribute('transform',`translate(${(x+ox).toFixed(1)},${(b.Y(sy)+oy).toFixed(1)}) rotate(${rot.toFixed(1)})`);fl.style.opacity=op;});
  p.expr(hit,'dizzy');pop(sc.add('<div class="stamp bad">Rozbicie</div>',380,300),c2.t+.15);
 }
 if(good)updaters.push(()=>{});
 return sc;}
flight('flight1','Lot Piko: nowa trasa','Myślę, że zamiana minusa na plus przesuwa parabolę, ale nie wiem jeszcze, w którą stronę ani o ile.','To zgadywanie, bo lekcja nie mówi, jak dobrać liczbę w nawiasie.','f(x) = 0,25(x + 2)²',fBad,false);
clipScene('game2');
/* 7. Wniosek */
{const sc=scene('insight'),c0=sc.c(0);const st=student(300,250,300);sc.el.append(st);pop(st,sc.s.start+.2);
 const bb=sc.add('<div class="bubble" style="width:900px;font-size:64px;border-radius:34px 34px 34px 8px"><div class="t"></div></div>',600,250);pop(bb,c0.t);type(bb.querySelector('.t'),'Czego zabrakło w mojej lekcji?',c0.t+.2,1.6);
 const p=pikoBig(230,1570,230).expr(0,'dizzy');sc.el.append(p);pop(p,sc.s.start+.4);
 up(sc.add('<div class="card hand" style="padding:26px 36px;font-size:40px;font-weight:700">Błąd Piko pokazuje lukę w wyjaśnieniu ucznia.</div>',600,640),c0.t+c0.d*.55);
}
lesson('lesson2','Lekcja 2: tym razem pełna','Nawias (x + 1) zeruje się dla x = −1, więc tam jest wierzchołek.','Myślę, że liczba w nawiasie ma przeciwny znak niż x wierzchołka, bo nawias zeruje się w wierzchołku.',(sc,c0,c1,p)=>{
 p.expr(c1.t+c1.d+.3,'happy');
 const d=sc.add(`<svg width="560" height="250" viewBox="0 0 560 250"><line x1="20" y1="200" x2="540" y2="200" stroke="#1b2a4a" stroke-width="4"/><line x1="380" y1="20" x2="380" y2="230" stroke="#1b2a4a" stroke-width="4"/>
  <path class="pp" d="M110 30Q260 370 410 30" fill="none" stroke="#2747b8" stroke-width="7" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
  <g class="vv"><line x1="260" y1="200" x2="260" y2="232" stroke="#c66a00" stroke-width="4" stroke-dasharray="6 6"/><circle cx="260" cy="200" r="11" fill="#ff9f1c" stroke="#1b2a4a" stroke-width="4"/><text x="260" y="170" text-anchor="middle" font-size="34" font-weight="700" fill="#8a4b00" style="font-family:'Shantell Sans Variable'">x = −1</text></g>
  <text x="392" y="232" font-size="26" fill="#4a5872">0</text></svg>`,360,620);
 key(d.querySelector('.pp'),[[c0.t+2.2,{strokeDashoffset:1}],[c0.t+3.3,{strokeDashoffset:0}]]);key(d.querySelector('.vv'),[[c0.t+3.2,{opacity:0}],[c0.t+3.6,{opacity:1}]]);});
flight('flight2','Lot Piko: druga próba','Myślę, że liczba w nawiasie ma przeciwny znak niż x wierzchołka, bo nawias zeruje się w wierzchołku.','Bramki są w x = 1 i x = 3, więc dołek toru chcę mieć pośrodku, w x = 2. Spróbuję nawiasu (x − 2).','f(x) = 0,25(x − 2)²',fGood,true);
clipScene('game3');clipScene('game4');
/* 8. Jak to działa */
{const sc=scene('tech','Jak to działa'),c0=sc.c(0),c1=sc.c(1),c2=sc.c(2);
 const boxes=[['','Lekcja ucznia','Własne słowa gracza.'],['ai','Claude jako Piko','Odpowiada tylko w ustalonym formacie.'],['','Wzór Piko','Lot wyłącznie według lekcji.'],['eng','Silnik gry','Sam liczy tor, bramki i kolizje.']];
 const els=boxes.map((b,i)=>sc.add(`<div class="box ${b[0]}"><h3>${b[1]}</h3><p>${b[2]}</p></div>`,150+i*420,230));
 els.forEach((e,i)=>{const t=sc.s.start+.3+i*.25,hl=i===1?c0.t+.2:i===3?c1.t+.2:null;
  key(e,hl?[[t,{opacity:0,transform:'scale(.5)'},BOUNCE],[t+.45,{opacity:1,transform:'scale(1)'},'linear'],[hl,{opacity:1,transform:'scale(1)'},BOUNCE],[hl+.4,{opacity:1,transform:'scale(1.09)'},'linear'],[hl+2.2,{opacity:1,transform:'scale(1.09)'}],[hl+2.7,{opacity:1,transform:'scale(1)'}]]:[[t,{opacity:0,transform:'scale(.5)'},BOUNCE],[t+.45,{opacity:1,transform:'scale(1)'}]]);});
 for(let i=0;i<3;i++)fade(sc.add('<svg width="60" height="60" viewBox="0 0 60 60"><path d="M6 30h44M34 12l18 18-18 18" fill="none" stroke="#9aaabf" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>',510+i*420,305),sc.s.start+.9+i*.25);
 const shield='<svg width="54" height="54" viewBox="0 0 54 54"><path d="M27 4l20 8v14c0 12-8 20-20 24C15 46 7 38 7 26V12z" fill="#fff4e3" stroke="#c66a00" stroke-width="4" stroke-linejoin="round"/><path d="M18 27l7 7 12-14" stroke="#c66a00" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 const calc='<svg width="54" height="54" viewBox="0 0 54 54"><rect x="9" y="5" width="36" height="44" rx="7" fill="#e9eeff" stroke="#2747b8" stroke-width="4"/><rect x="16" y="12" width="22" height="9" rx="2" fill="#2747b8"/><circle cx="19" cy="30" r="3" fill="#2747b8"/><circle cx="27" cy="30" r="3" fill="#2747b8"/><circle cx="35" cy="30" r="3" fill="#2747b8"/><circle cx="19" cy="40" r="3" fill="#2747b8"/><circle cx="27" cy="40" r="3" fill="#2747b8"/><circle cx="35" cy="40" r="3" fill="#2747b8"/></svg>';
 up(sc.add(`<div class="fact">${shield}Tekst gracza to dla AI tylko dane: ukryte polecenia nie działają.</div>`,150,520),c0.t+c0.d*.5);
 up(sc.add(`<div class="fact">${calc}O wyniku lotu nigdy nie decyduje AI.</div>`,150,640),c1.t+c1.d*.45);
 const chips=['Przeglądarka','Aplikacja Windows z wbudowanym AI','Tryb pokazowy offline','223 testy automatyczne'];let x=150;
 chips.forEach((c,i)=>{const e=sc.add(`<div class="chip ok">${c}</div>`,x,790);pop(e,c2.t+.2+i*.45);x+=c.length*17.5+90;});
}
titleScene('outro','Gra edukacyjna o funkcjach, AI: Claude Sonnet 5.5');

/* Napisy lektora (kwestie Piko są w dymkach) */
{const cap=document.getElementById('caption'),span=cap.firstElementChild,list=[];
 for(const s of Object.values(S))for(const c of s.cues)if(c.who==='n'){const parts=c.text.match(/[^.!?:]+[.!?:]+/g)??[c.text],sum=parts.reduce((a,p)=>a+p.trim().length,0);let t=c.t;for(const p of parts){const d=c.d*p.trim().length/sum;list.push([t,t+d,p.trim()]);t+=d;}}
 updaters.push(t=>{const cur=list.find(l=>t>=l[0]-.05&&t<l[1]+.12);cap.style.display=cur?'':'none';if(cur&&span.textContent!==cur[2])span.textContent=cur[2];});
}
window.seek=async t=>{pending=[];for(const a of anims)a.currentTime=t*1000;for(const u of updaters)u(t);if(pending.length)await Promise.all(pending);};
window.ready=document.fonts.ready;
})();
