import {useEffect,useId,useState,useRef} from 'react';
import {evaluatePolynomial,parseExpression,type EngineResult,type Scene} from '@piko/core';
export function Board({scene,expression,showPath,result,reduced,hitbox,flightId}:{scene:Scene;expression:string;showPath:boolean;result:EngineResult|null;reduced:boolean;hitbox:boolean;flightId?:string}){
 const id=useId().replace(/:/g,''),d=scene.domain,pad=0.8;
 const width=d.xMax-d.xMin+pad*2,height=d.yMax-d.yMin+pad*2;
 const [progress,setProgress]=useState(1),skip=useRef(false);
 useEffect(()=>{
  if(!flightId||reduced){setProgress(1);return;}
  let raf=0;skip.current=false;const start=performance.now();setProgress(0);
  const tick=(now:number)=>{if(skip.current)return;const p=Math.min(1,(now-start)/2400);setProgress(p);if(p<1)raf=requestAnimationFrame(tick);};
  raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);
 },[flightId,reduced]);
 let poly=null;try{if(showPath)poly=parseExpression(expression).coefficients;}catch{ /* Invalid syntax has no trajectory. */ }
 const points=poly?Array.from({length:241},(_,i)=>{const x=d.xMin+(d.xMax-d.xMin)*i/240;return `${x},${-evaluatePolynomial(poly!,x)}`;}).join(' '):'';
 const stop=result?(result.firstPhysicalEvent?.x??d.xMax):d.xMin,robotX=d.xMin+(stop-d.xMin)*progress,robotY=poly?evaluatePolynomial(poly,robotX):0;
 const ticksX=Array.from({length:Math.ceil(d.xMax)-Math.floor(d.xMin)+1},(_,i)=>Math.floor(d.xMin)+i);
 const ticksY=Array.from({length:Math.ceil(d.yMax)-Math.floor(d.yMin)+1},(_,i)=>Math.floor(d.yMin)+i);
 return <div className="board-wrap"><svg data-testid="board" viewBox={`${d.xMin-pad} ${-d.yMax-pad} ${width} ${height}`} role="img" aria-label={`Plansza ${scene.id}. Oś x w prawo, oś y w górę. Współrzędne w Danych planszy.`}>
 <defs><pattern id={`hatch${id}`} width="0.16" height="0.16" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="0.16" height="0.16" fill="#fbe6de"/><line x1="0" y1="0" x2="0" y2="0.16" stroke="#b56242" strokeWidth="0.045"/></pattern><clipPath id={`clip${id}`}><rect x={d.xMin} y={-d.yMax} width={d.xMax-d.xMin} height={d.yMax-d.yMin}/></clipPath></defs>
 <rect x={d.xMin} y={-d.yMax} width={d.xMax-d.xMin} height={d.yMax-d.yMin} rx="0.05" fill="#fff" stroke="#8b9db6" strokeWidth="0.025"/>
 {ticksX.map(x=><g key={x}><line x1={x} y1={-d.yMin} x2={x} y2={-d.yMax} stroke="#dfe6f1" strokeWidth="0.014"/><text x={x} y={-d.yMin+0.32} textAnchor="middle" fontSize="0.19" fill="#49576d">{x}</text></g>)}
 {ticksY.map(y=><g key={y}><line x1={d.xMin} y1={-y} x2={d.xMax} y2={-y} stroke="#dfe6f1" strokeWidth="0.014"/><text x={d.xMin-0.19} y={-y+0.06} textAnchor="end" fontSize="0.19" fill="#49576d">{y}</text></g>)}
 {d.yMin<=0&&d.yMax>=0&&<line x1={d.xMin} y1="0" x2={d.xMax} y2="0" stroke="#8b9db6" strokeWidth="0.025"/>}
 {d.xMin<=0&&d.xMax>=0&&<line x1="0" y1={-d.yMin} x2="0" y2={-d.yMax} stroke="#8b9db6" strokeWidth="0.025"/>}
 <text x={d.xMax+0.25} y={-d.yMin+0.1} fontSize="0.22" fill="#172033">x</text><text x={d.xMin-0.06} y={-d.yMax-0.3} fontSize="0.22" fill="#172033">y</text>
 {scene.obstacles.map(o=><g key={o.id}><rect x={o.xMin} y={-o.yMax} width={o.xMax-o.xMin} height={o.yMax-o.yMin} fill={`url(#hatch${id})`} stroke="#a14b2f" strokeWidth="0.025"/><text x={(o.xMin+o.xMax)/2} y={-(o.yMin+o.yMax)/2+0.07} textAnchor="middle" fontSize="0.2" fill="#6c311f">{o.id}</text></g>)}
 {[{id:'S',...scene.start},...scene.gates,{id:'CEL',...scene.goal}].map(g=><g key={g.id}><line x1={g.x} x2={g.x} y1={-g.yMin} y2={-g.yMax} stroke="#267663" strokeWidth="0.035" strokeDasharray="0.06 0.07"/>{[g.yMin,g.yMax].map(y=><line key={y} x1={g.x-0.14} x2={g.x+0.14} y1={-y} y2={-y} stroke="#176845" strokeWidth="0.055"/>)}<text x={g.x} y={-g.yMax-0.18} textAnchor="middle" fontSize="0.19" fontWeight="700" fill="#176845">{g.id}</text></g>)}
 {poly&&<g><polyline clipPath={`url(#clip${id})`} data-testid="trajectory" points={points} fill="none" stroke="#2457d6" strokeWidth="0.035" strokeDasharray={result?undefined:'0.10 0.08'}/><g transform={`translate(${robotX} ${-robotY})`} data-testid="robot"><rect x="-0.12" y="-0.12" width="0.24" height="0.24" rx="0.04" fill="#2457d6"/><circle cx="-0.045" cy="-0.025" r="0.025" fill="white"/><circle cx="0.045" cy="-0.025" r="0.025" fill="white"/>{hitbox&&<rect x="-0.12" y="-0.12" width="0.24" height="0.24" fill="none" stroke="#172033" strokeWidth="0.02"/>}</g></g>}
 {poly&&result?.firstPhysicalEvent&&progress===1&&<text x={result.firstPhysicalEvent.x} y={-result.firstPhysicalEvent.y} textAnchor="middle" fontSize="0.35" fill="#a62b36">×</text>}
 </svg>{progress<1&&<button className="skip-animation" onClick={()=>{skip.current=true;setProgress(1);}}>Pokaż wynik</button>}
 <div className="legend"><span>↦ Start i cel</span><span>▯ Bramki G1 / G2</span><span>▧ Przeszkoda</span></div></div>;
}
