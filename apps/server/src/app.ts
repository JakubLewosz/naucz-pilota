import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import {buildContext,checkModel,ContractError,demoTurn,makeEnvelope,validateRequest,type Envelope,type LearnerRequest} from '@piko/contracts';
import {Store} from './store';
import {ProviderError,type Provider} from './provider';
export type ServerConfig={mode:'demo'|'live';model:string;publicOrigin:string;production:boolean;timeoutMs:number;dailyBudget:number;sessionLimit:number;bodyBytes:number;maxProviderRequests:number};
const defaultConfig:ServerConfig={mode:'demo',model:'',publicOrigin:'http://127.0.0.1:5173',production:false,timeoutMs:15000,dailyBudget:200,sessionLimit:6,bodyBytes:16384,maxProviderRequests:2};
const errorText:Record<string,string>={AI_NOT_CONFIGURED:'Model live nie jest skonfigurowany.',AI_TIMEOUT:'Nie udało się otrzymać odpowiedzi w limicie czasu. Twoje wpisy są zachowane.',AI_PROVIDER_UNAVAILABLE:'Usługa AI jest chwilowo niedostępna.',AI_REFUSED:'Piko nie otrzymał odpowiedzi od usługi AI.',AI_INCOMPLETE:'Odpowiedź modelu była niekompletna.',AI_INVALID_OUTPUT:'Model nie zwrócił poprawnej odpowiedzi.',DAILY_BUDGET_EXHAUSTED:'Dzienny limit wywołań AI został wyczerpany.',TURN_INTERRUPTED:'Poprzednia tura została przerwana. Możesz wysłać nową.'};
export function createApp(options:{store:Store;provider?:Provider;config?:Partial<ServerConfig>}){
 const app=express(),config={...defaultConfig,...options.config},store=options.store;
 const pending=new Map<string,Promise<{status:number;envelope:Envelope}>>(),ipWindow=new Map<string,{count:number;start:number}>();
 app.disable('x-powered-by');app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],connectSrc:["'self'"],objectSrc:["'none'"],upgradeInsecureRequests:config.production?[]:null}}}));
 const minimal=(code:string)=>({error:{code,messagePL:errorText[code]??'Żądanie odrzucone. Sprawdź sesję i dane, a następnie spróbuj ponownie.',retryable:['AI_TIMEOUT','AI_PROVIDER_UNAVAILABLE','SESSION_REQUIRED','STALE_SESSION_REVISION'].includes(code)}});
 app.use('/api',(req,res,next)=>{
  const origin=req.get('origin');
  if(origin&&origin!==config.publicOrigin&&!(origin==='app://piko'&&req.get('x-piko-desktop')==='1')){res.status(403).json(minimal('ORIGIN_NOT_ALLOWED'));return;}
  if(req.method==='POST'&&!req.is('application/json')){res.status(400).json(minimal('INVALID_REQUEST'));return;}
  const now=Date.now(),ip=req.ip??'local';let window=ipWindow.get(ip);
  if(!window||now-window.start>60000){window={count:0,start:now};ipWindow.set(ip,window);}
  if(++window.count>60){res.status(429).json(minimal('IP_RATE_LIMIT'));return;}
  if(ipWindow.size>10000)for(const [key,w] of ipWindow)if(now-w.start>60000)ipWindow.delete(key);
  next();
 });
 app.use(express.json({limit:config.bodyBytes,strict:true}));app.use(cookieParser());
 const transportToken=(req:express.Request)=>req.get('authorization')?.replace(/^Bearer /,'')??req.cookies.piko_session;
 app.get('/api/health',(_req,res)=>res.json({ok:true,mode:config.mode,available:config.mode==='live'&&Boolean(options.provider&&config.model),provider:config.mode==='live'?'openai':null,model:config.mode==='live'?config.model:null}));
 app.post('/api/session',(req,res)=>{
  store.clean();const existing=store.authenticate(transportToken(req));
  if(existing){res.json({sessionId:existing.id,sessionRevision:existing.revision});return;}
  const {session,token}=store.createSession();
  if(req.get('x-piko-desktop')==='1'&&req.get('origin')==='app://piko')res.json({sessionId:session.id,sessionRevision:session.revision,token});
  else{res.cookie('piko_session',token,{httpOnly:true,sameSite:'strict',secure:config.production,maxAge:86400000,path:'/api'});res.json({sessionId:session.id,sessionRevision:session.revision});}
 });
 app.post('/api/learner-turn',async(req,res)=>{
  const session=store.authenticate(transportToken(req));
  if(!session){res.status(401).json(minimal('SESSION_REQUIRED'));return;}
  if(req.body?.sceneRole==='human_check'||req.body?.sceneRole==='practice'){res.status(400).json(minimal('SCENE_NOT_AI_ENABLED'));return;}
  if(!validateRequest(req.body)||req.body.sessionId!==session.id){res.status(400).json(minimal('INVALID_REQUEST'));return;}
  const request=req.body as LearnerRequest,key=`${session.id}/${request.turnId}`,body=JSON.stringify(request),cached=store.getTurn(session.id,request.turnId);
  if(cached){
   if(cached.body_hash!==store.bodyHash(body)){res.status(409).json(minimal('TURN_ID_CONFLICT'));return;}
   if(cached.response){const saved=JSON.parse(cached.response as string) as {status:number;envelope:Envelope};res.status(saved.status).json(saved.envelope);return;}
   const promise=pending.get(key);if(promise){const result=await promise;res.status(result.status).json(result.envelope);return;}
   const {memory}=buildContext(request,session.evidence);const envelope=makeEnvelope(request,memory,null,'unavailable');envelope.error={...minimal('TURN_INTERRUPTED').error};res.status(503).json(envelope);return;
  }
  if([...pending.keys()].some(k=>k.startsWith(session.id+'/'))){res.status(409).json(minimal('TURN_IN_PROGRESS'));return;}
  if(request.sessionRevision!==session.revision){res.status(409).json(minimal('STALE_SESSION_REVISION'));return;}
  if(store.recentCount(session.id)>=config.sessionLimit){res.status(429).json(minimal('SESSION_RATE_LIMIT'));return;}
  let built:ReturnType<typeof buildContext>;
  try{built=buildContext(request,session.evidence,session.sceneId===`${request.missionId}-${request.sceneRole}`?session.exchanges:[]);}catch(e){res.status(e instanceof ContractError?e.status:400).json(minimal(e instanceof ContractError?e.code:'INVALID_REQUEST'));return;}
  if(!store.beginTurn(session.id,request.turnId,request.sessionRevision,body)){res.status(409).json(minimal('STALE_SESSION_REVISION'));return;}
  session.revision++;session.evidence=built.evidence;
  if(session.sceneId!==built.context.scene.id)session.exchanges=[];
  session.sceneId=built.context.scene.id;store.updateSession(session);
  const work=async()=>{
   const started=performance.now();let count=0,inputTokens=0,outputTokens=0,envelope=makeEnvelope(request,built.memory,null,'unavailable'),status=200;
   if(request.requestedMode==='live'){envelope.model.provider='openai';envelope.model.configuredModel=config.model||null;}
   const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),config.timeoutMs);
   try{
    if(request.requestedMode==='demo')envelope=demoTurn(request);
    else{
     if(config.mode!=='live'||!options.provider||!config.model)throw new ProviderError('AI_NOT_CONFIGURED',503);
     let repair:Parameters<Provider>[3];let accepted=false;
     for(let attempt=0;attempt<Math.min(2,config.maxProviderRequests);attempt++){
      if(controller.signal.aborted)throw new ProviderError('AI_TIMEOUT',504);
      if(!store.reserve(config.dailyBudget))throw new ProviderError('DAILY_BUDGET_EXHAUSTED',429);
      count++;
      const timeout=new Promise<never>((_,reject)=>{if(controller.signal.aborted)reject(new ProviderError('AI_TIMEOUT',504));else controller.signal.addEventListener('abort',()=>reject(new ProviderError('AI_TIMEOUT',504)),{once:true});});
      const response=await Promise.race([options.provider(built.context,request.userMessage,controller.signal,repair),timeout]);
      inputTokens+=response.inputTokens??0;outputTokens+=response.outputTokens??0;
      envelope.model={provider:'openai',configuredModel:config.model,actualModel:response.actualModel,providerResponseId:response.responseId,requestCount:count,inputTokens,outputTokens,latencyMs:performance.now()-started};
      let payload:unknown;try{payload=JSON.parse(response.text);}catch{payload=null;}
      if(checkModel(payload,built.context)){
       const metadata=envelope.model;envelope=makeEnvelope(request,built.memory,payload,'live');envelope.model=metadata;accepted=true;break;
      }
      repair={output:response.text,issues:'Niepoprawny JSON, schemat, faza, identyfikatory albo składnia wzoru. Zwróć poprawny obiekt zgodny z kontraktem.'};
     }
     if(!accepted)throw new ProviderError('AI_INVALID_OUTPUT',502);
    }
    if(envelope.learner){session.exchanges.push({userPL:request.userMessage,pikoPL:envelope.learner.utterancePL,followUpPL:envelope.learner.followUpPL});session.exchanges=session.exchanges.slice(-6);store.updateSession(session);}
   }catch(e){
    const err=e instanceof ProviderError?e:new ProviderError('AI_PROVIDER_UNAVAILABLE',503);status=err.status;envelope.mode='unavailable';envelope.learner=null;envelope.error=minimal(err.code).error;
   }finally{clearTimeout(timer);}
   envelope.model.requestCount=count;envelope.model.latencyMs=Math.round(performance.now()-started);
   // Store status with envelope for exact idempotent replay, including errors.
   store.db.prepare('UPDATE turns SET status=\'done\',response=? WHERE session_id=? AND turn_id=?').run(JSON.stringify({status,envelope}),session.id,request.turnId);
   if(config.production)console.log(JSON.stringify({turnId:request.turnId,missionId:request.missionId,mode:envelope.mode,model:envelope.model.actualModel,requestCount:count,latencyMs:envelope.model.latencyMs,error:envelope.error?.code??null}));
   return {status,envelope};
  };
  const promise=work();pending.set(key,promise);
  try{const result=await promise;res.status(result.status).json(result.envelope);}finally{pending.delete(key);}
 });
 app.use((error:Error&{type?:string},_req:express.Request,res:express.Response,_next:express.NextFunction)=>res.status(error.type==='entity.too.large'?413:400).json(minimal(error.type==='entity.too.large'?'REQUEST_TOO_LARGE':'INVALID_REQUEST')));
 return app;
}
