export function PikoGlyph(){
 return <>
  <path d="M50 18V8" stroke="#f5b84e" strokeWidth="6"/>
  <circle cx="50" cy="7" r="5" fill="#79e7d9"/>
  <path d="M9 41H3v24h6m82-24h6v24h-6" fill="#bc7b22"/>
  <rect x="9" y="19" width="82" height="73" rx="23" fill="#f5b84e"/>
  <path d="M26 24h20" stroke="#ffe2a6" strokeWidth="4" strokeLinecap="round"/>
  <rect x="19" y="34" width="62" height="40" rx="13" fill="#122d35"/>
  <rect x="30" y="46" width="10" height="12" rx="4" fill="#79e7d9"/>
  <rect x="60" y="46" width="10" height="12" rx="4" fill="#79e7d9"/>
  <path d="M43 65h14" stroke="#79e7d9" strokeWidth="3" strokeLinecap="round"/>
  <path d="M42 83h16" stroke="#84551c" strokeWidth="3" strokeLinecap="round"/>
 </>;
}

export function Piko({large=false,busy=false}:{large?:boolean;busy?:boolean}){
 return <svg className={`piko${large?' large':''}${busy?' thinking':''}`} viewBox="0 0 100 100" aria-hidden="true">
  <PikoGlyph/>
 </svg>;
}
