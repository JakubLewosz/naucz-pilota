const {app,BrowserWindow,protocol,net,ipcMain}=require('electron');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const fs=require('node:fs');
protocol.registerSchemesAsPrivileged([{scheme:'app',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
let windowRef,token=null;
const root=app.isPackaged?path.join(__dirname,'web'):path.join(__dirname,'../web/dist');
const configPath=path.join(__dirname,'distribution.json');
const distribution=fs.existsSync(configPath)?JSON.parse(fs.readFileSync(configPath,'utf8')):{apiBaseUrl:''};
const base=app.isPackaged?distribution.apiBaseUrl:(process.env.DESKTOP_API_BASE_URL||distribution.apiBaseUrl);
function endpoint(route){
 if(!base)throw new Error('Brak skonfigurowanego serwera live. Wybierz demo.');
 const url=new URL(base);
 if(url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('Nieprawidłowy adres backendu.');
 if(url.protocol!=='https:'&&!(url.protocol==='http:'&&url.hostname==='127.0.0.1'&&!app.isPackaged))throw new Error('Backend wymaga HTTPS.');
 return new URL(route,url).href;
}
async function relay(route,body){
 const response=await net.fetch(endpoint(route),{method:body?'POST':'GET',redirect:'error',headers:{'Origin':'app://piko','X-Piko-Desktop':'1',...(body?{'Content-Type':'application/json'}:{}),...(token?{'Authorization':`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(16000)});
 const result=await response.json();
 if(result.token){token=result.token;delete result.token;}
 if(!response.ok&&!result.schemaVersion)throw new Error(result.error?.messagePL||'Serwer live jest niedostępny.');
 return result;
}
function assertSender(event){if(!windowRef||event.sender!==windowRef.webContents||!event.senderFrame||!/^app:\/\/piko\//.test(event.senderFrame.url))throw new Error('Niedozwolony nadawca IPC.');}
app.whenReady().then(()=>{
 protocol.handle('app',request=>{
  const url=new URL(request.url);
  if(url.host!=='piko'||!['GET','HEAD'].includes(request.method))return new Response('Forbidden',{status:403});
  let rel;try{rel=decodeURIComponent(url.pathname);}catch{return new Response('Bad path',{status:400});}
  const filename=path.resolve(root,'.'+(rel==='/'?'/index.html':rel));
  if(!filename.startsWith(root+path.sep))return new Response('Forbidden',{status:403});
  return net.fetch(pathToFileURL(filename).href);
 });
 const validateRequest=app.isPackaged?require('./relay-validator.cjs').validateRequest:require('../../dist/desktop/relay-validator.cjs').validateRequest;
 ipcMain.handle('piko:status',event=>{assertSender(event);return base?relay('/api/health').catch(()=>({mode:'unavailable',available:false})):{mode:'demo',available:false};});
 ipcMain.handle('piko:session',event=>{assertSender(event);return relay('/api/session',{});});
 ipcMain.handle('piko:turn',(event,request)=>{assertSender(event);if(!validateRequest(request)||request.requestedMode!=='live')throw new Error('Nieprawidłowe żądanie.');return relay('/api/learner-turn',request);});
 windowRef=new BrowserWindow({width:1440,height:900,minWidth:390,minHeight:600,title:'Naucz Pilota',backgroundColor:'#f4f6fb',webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
 windowRef.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 windowRef.webContents.on('will-navigate',(event,url)=>{if(url!=='app://piko/index.html')event.preventDefault();});
 windowRef.webContents.session.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
 windowRef.loadURL('app://piko/index.html');
});
app.on('window-all-closed',()=>app.quit());
