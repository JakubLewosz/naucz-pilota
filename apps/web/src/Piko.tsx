export function PikoGlyph(){
 return <>
  <path d="M50 18V8" stroke="#1b2a4a" strokeWidth="5" strokeLinecap="round"/>
  <circle cx="50" cy="7" r="5.5" fill="#ff9f1c" stroke="#1b2a4a" strokeWidth="3"/>
  <path d="M9 41H3v24h6m82-24h6v24h-6" fill="#1b2a4a"/>
  <rect x="9" y="19" width="82" height="73" rx="23" fill="#ff9f1c" stroke="#1b2a4a" strokeWidth="4"/>
  <path d="M27 26h18" stroke="#ffd08a" strokeWidth="4" strokeLinecap="round"/>
  <rect x="19" y="34" width="62" height="40" rx="13" fill="#1b2a4a"/>
  <rect x="30" y="45" width="10" height="13" rx="4" fill="#7fe0f0"/>
  <rect x="60" y="45" width="10" height="13" rx="4" fill="#7fe0f0"/>
  <path d="M43 65q7 5 14 0" stroke="#7fe0f0" strokeWidth="3" fill="none" strokeLinecap="round"/>
  <path d="M42 83h16" stroke="#b86500" strokeWidth="3" strokeLinecap="round"/>
 </>;
}

export function Piko({large=false,busy=false}:{large?:boolean;busy?:boolean}){
 return <svg className={`piko${large?' large':''}${busy?' thinking':''}`} viewBox="0 0 100 100" aria-hidden="true">
  <PikoGlyph/>
 </svg>;
}
