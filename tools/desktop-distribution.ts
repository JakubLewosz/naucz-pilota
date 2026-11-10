import {readFile} from 'node:fs/promises';

export async function readDesktopDistribution(){
 const defaults=JSON.parse(await readFile('apps/desktop/distribution.json','utf8')) as {apiBaseUrl:string};
 const value=process.env.PIKO_DESKTOP_HTTPS_ORIGIN??defaults.apiBaseUrl;
 if(value==='')return {apiBaseUrl:''};
 const url=new URL(value);
 if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash){
  throw new Error('Desktop backend must be a bare HTTPS origin.');
 }
 return {apiBaseUrl:url.origin};
}
