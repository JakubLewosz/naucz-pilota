import {useLayoutEffect,useId,useRef,useState} from 'react';
import {evaluatePolynomial,parseExpression,type EngineResult,type Scene} from '@piko/core';
import {PikoGlyph} from './Piko';

export function Board({scene,expression,showPath,result,reduced,hitbox,flightId}:{
 scene:Scene;expression:string;showPath:boolean;result:EngineResult|null;
 reduced:boolean;hitbox:boolean;flightId?:string;
}){
 const id=useId().replace(/:/g,''),d=scene.domain,pad=0.8;
 const width=d.xMax-d.xMin+pad*2,height=d.yMax-d.yMin+pad*2;
 const [progress,setProgress]=useState(1),skip=useRef(false);
 const animated=Boolean(flightId&&result?.parseable&&showPath&&!reduced);
 useLayoutEffect(()=>{
  if(!animated){setProgress(1);return;}
  let frame=0;
  skip.current=false;
  const start=performance.now();
  setProgress(0);
  const tick=(now:number)=>{
   if(skip.current)return;
   const time=Math.min(1,(now-start)/2600);
   setProgress(time*time*(3-2*time));
   if(time<1)frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return()=>cancelAnimationFrame(frame);
 },[flightId,expression,animated]);
 let poly=null;
 try{if(showPath)poly=parseExpression(expression).coefficients;}
 catch{/* A formula that cannot be parsed has no trajectory. */}
 // Sampling draws the curve. Only the engine's result controls flight outcomes.
 const points=poly?Array.from({length:241},(_,i)=>{
  const x=d.xMin+(d.xMax-d.xMin)*i/240;
  return `${x},${-evaluatePolynomial(poly!,x)}`;
 }).join(' '):'';
 const event=result?.firstPhysicalEvent;
 const stop=result?(event?.x??d.xMax):d.xMin;
 const robotX=d.xMin+(stop-d.xMin)*progress;
 const robotY=poly?evaluatePolynomial(poly,robotX):0;
 const ticksX=Array.from({length:Math.ceil(d.xMax)-Math.floor(d.xMin)+1},(_,i)=>Math.floor(d.xMin)+i);
 const ticksY=Array.from({length:Math.ceil(d.yMax)-Math.floor(d.yMin)+1},(_,i)=>Math.floor(d.yMin)+i);
 const portals=[{id:'start',label:'START',...scene.start},
  ...scene.gates.map(g=>({...g,label:g.id})),{id:'goal',label:'META',...scene.goal}];
 return <div className="board-wrap">
  <svg data-testid="board" viewBox={`${d.xMin-pad} ${-d.yMax-pad} ${width} ${height}`}
   role="img" aria-label={`Plansza ${scene.id}. Oś x w prawo, oś y w górę. Współrzędne w Danych planszy.`}>
   <defs>
    <pattern id={`hatch${id}`} width="0.16" height="0.16" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
     <rect width="0.16" height="0.16" fill="#412e2e"/>
     <line x1="0" y1="0" x2="0" y2="0.16" stroke="#cd8e74" strokeWidth="0.035"/>
    </pattern>
    <clipPath id={`clip${id}`}><rect x={d.xMin} y={-d.yMax} width={d.xMax-d.xMin} height={d.yMax-d.yMin}/></clipPath>
   </defs>
   <rect x={d.xMin} y={-d.yMax} width={d.xMax-d.xMin} height={d.yMax-d.yMin} rx="0.04" fill="#10212a" stroke="#708a97" strokeWidth="0.025"/>
   {ticksX.map(x=><g key={x}>
    <line x1={x} y1={-d.yMin} x2={x} y2={-d.yMax} stroke="#29404b" strokeWidth="0.014"/>
    <text x={x} y={-d.yMin+0.32} textAnchor="middle" fontSize="0.2" fill="#b7cbd4">{x}</text>
   </g>)}
   {ticksY.map(y=><g key={y}>
    <line x1={d.xMin} y1={-y} x2={d.xMax} y2={-y} stroke="#29404b" strokeWidth="0.014"/>
    <text x={d.xMin-0.2} y={-y+0.06} textAnchor="end" fontSize="0.2" fill="#b7cbd4">{y}</text>
   </g>)}
   {d.yMin<=0&&d.yMax>=0&&<line x1={d.xMin} y1="0" x2={d.xMax} y2="0" stroke="#708a97" strokeWidth="0.025"/>}
   {d.xMin<=0&&d.xMax>=0&&<line x1="0" y1={-d.yMin} x2="0" y2={-d.yMax} stroke="#708a97" strokeWidth="0.025"/>}
   <text x={d.xMax+0.25} y={-d.yMin+0.1} fontSize="0.23" fill="#e8f0f2">x</text>
   <text x={d.xMin-0.06} y={-d.yMax-0.3} fontSize="0.23" fill="#e8f0f2">y</text>
   {scene.obstacles.map(o=><g key={o.id}>
    <rect x={o.xMin} y={-o.yMax} width={o.xMax-o.xMin} height={o.yMax-o.yMin} fill={`url(#hatch${id})`} stroke="#e1a78f" strokeWidth="0.025"/>
    <text x={(o.xMin+o.xMax)/2} y={-(o.yMin+o.yMax)/2+0.07} textAnchor="middle" fontSize="0.2" fill="#ffe0ce">{o.id}</text>
   </g>)}
   {portals.map(g=>{
    const checkpoint=result?.checkpoints.find(point=>point.id===g.id);
    const passed=Boolean(poly&&checkpoint?.passed&&g.x<=robotX&&g.x<=stop);
    return <g key={g.id} className={passed?'checkpoint passed':'checkpoint'} data-checkpoint={g.id} data-passed={passed}>
     <line x1={g.x} x2={g.x} y1={-g.yMin} y2={-g.yMax} stroke={passed?'#a1dfbe':'#81aeb6'} strokeWidth={passed?'0.055':'0.035'} strokeDasharray="0.06 0.07"/>
     {[g.yMin,g.yMax].map(y=><line key={y} x1={g.x-0.14} x2={g.x+0.14} y1={-y} y2={-y} stroke={passed?'#a1dfbe':'#81aeb6'} strokeWidth="0.055"/>)}
     <text x={g.x} y={-g.yMax-0.2} textAnchor="middle" fontSize="0.19" fontWeight="700" fill={passed?'#b5efd2':'#b4d8db'}>{passed?'✓ ':''}{g.label}</text>
    </g>;
   })}
   {poly&&<g>
    <polyline clipPath={`url(#clip${id})`} data-testid="trajectory" points={points} fill="none" stroke="#79e7d9" strokeWidth="0.04" strokeDasharray={result?undefined:'0.10 0.08'}/>
    <g transform={`translate(${robotX} ${-robotY})`} data-testid="robot">
     <g transform="translate(-0.12 -0.12) scale(0.0024)"><PikoGlyph/></g>
     {hitbox&&<rect x="-0.12" y="-0.12" width="0.24" height="0.24" fill="none" stroke="#f5b84e" strokeWidth="0.02"/>}
    </g>
   </g>}
   {poly&&event&&progress===1&&<text data-testid="collision" x={event.x} y={-event.y} textAnchor="middle" dominantBaseline="central" fontSize="0.32" fill="#ffb5b5">×</text>}
  </svg>
  {animated&&progress<1&&<button className="skip-animation" onClick={()=>{skip.current=true;setProgress(1);}}>Pokaż wynik</button>}
  <div className="legend"><span>↦ Start i meta</span><span>▯ Bramki G1 / G2</span><span>▧ Przeszkoda</span></div>
 </div>;
}
