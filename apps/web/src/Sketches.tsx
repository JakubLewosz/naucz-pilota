import {PikoGlyph} from './Piko';

/** Szkic na kartce w kratkę: tor Piko przez dwie bramki obok przeszkody. */
export function HeroSheet(){
 // Parabola y = 0.25(x-3)^2 + 1 na planszy x 0..8, y 0..6 (1 kratka = 40 px).
 const X=(x:number)=>40+x*40,Y=(y:number)=>280-y*40;
 const f=(x:number)=>0.25*(x-3)**2+1;
 const path=Array.from({length:61},(_,i)=>{const x=i*(7/60);return `${i?'L':'M'}${X(x).toFixed(1)} ${Y(f(x)).toFixed(1)}`;}).join(' ');
 const px=6.2,py=f(px);
 return <div className="hero-sheet" aria-hidden="true">
  <svg viewBox="0 0 380 320">
   <line className="sk-axis" x1={X(0)} y1={Y(0)} x2={X(8)} y2={Y(0)}/>
   <line className="sk-axis" x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(6.2)}/>
   <text className="sk-label" x={X(8)-4} y={Y(0)+18}>x</text>
   <text className="sk-label" x={X(0)-16} y={Y(6.2)+8}>y</text>
   <rect className="sk-obstacle" x={X(2.4)} y={Y(4.6)} width="48" height="56" rx="3"/>
   {[[1,1.6,2.6],[5,1.6,2.6]].map(([x,a,b])=><g key={x} className="sk-gate">
    <line x1={X(x)} x2={X(x)} y1={Y(a)} y2={Y(b)}/>
    <line x1={X(x)-7} x2={X(x)+7} y1={Y(a)} y2={Y(a)}/>
    <line x1={X(x)-7} x2={X(x)+7} y1={Y(b)} y2={Y(b)}/>
   </g>)}
   <path className="sk-path" d={path}/>
   <g transform={`translate(${X(px)-22} ${Y(py)-22}) scale(0.44)`}><PikoGlyph/></g>
  </svg>
  <p className="hero-bubble">Masz pomysł na mój lot?</p>
  <p className="hero-formula">f(x) = 0,25(x − 3)² + 1</p>
 </div>;
}

const sketches:Record<string,React.ReactNode>={
 // y = b: przesunięcie w pionie
 M01:<><line className="sk-ghost" x1="8" y1="54" x2="112" y2="54"/><line className="sk-path" x1="8" y1="26" x2="112" y2="26"/><path className="sk-hint" d="M60 50V32m-5 5 5-5 5 5"/></>,
 // y = ax + b: nachylenie
 M02:<><line className="sk-ghost" x1="8" y1="62" x2="112" y2="18"/><line className="sk-path" x1="8" y1="20" x2="112" y2="58"/><circle className="sk-dot" cx="60" cy="39" r="3"/></>,
 // parabola w górę
 M03:<><path className="sk-ghost" d="M22 10Q60 106 98 10"/><path className="sk-path" d="M22 0Q60 82 98 0"/><path className="sk-hint" d="M60 54V44m-5 5 5-5 5 5"/></>,
 // parabola w bok
 M04:<><path className="sk-ghost" d="M14 8Q46 104 78 8"/><path className="sk-path" d="M42 8Q74 104 106 8"/><path className="sk-hint" d="M50 64h14m-5-5 5 5-5 5"/></>,
 // szerokość
 M05:<><path className="sk-ghost" d="M4 6Q60 110 116 6"/><path className="sk-path" d="M38 6Q60 110 82 6"/></>,
 // wierzchołek (p, q)
 M06:<><path className="sk-path" d="M30 6Q66 90 102 6"/><circle className="sk-dot" cx="66" cy="48" r="3.5"/><line className="sk-ghost" x1="66" y1="48" x2="66" y2="70"/><line className="sk-ghost" x1="8" y1="48" x2="66" y2="48"/></>
};
export function MissionSketch({id}:{id:string}){
 return <svg className="mission-sketch" viewBox="0 0 120 72" aria-hidden="true">
  <line className="sk-axis" x1="4" y1="68" x2="116" y2="68"/>
  {sketches[id]}
 </svg>;
}
