import {createServer} from 'node:http';
import {it,expect} from 'vitest';
import {openAIProvider} from '../apps/server/src/provider';
import {buildContext,type LearnerRequest} from '@piko/contracts';
import evals from '../content/ai-evals.v1.json';
const req=evals.cases[0].request as LearnerRequest;
for(const scenario of ['completed','incomplete','refusal','429'] as const)it(`official SDK HTTP stub: ${scenario}, no hidden retries, strict response format`,async()=>{
 let calls=0;let sent:Record<string,unknown>|null=null;
 const server=createServer(async(request,response)=>{
  calls++;let data='';for await(const chunk of request)data+=chunk;
  sent=JSON.parse(data);response.setHeader('Content-Type','application/json');
  if(scenario==='429'){response.statusCode=429;response.end(JSON.stringify({error:{message:'rate limit',type:'rate_limit'}}));return;}
  response.end(JSON.stringify({id:'resp_mock',object:'response',model:'stub',status:scenario==='incomplete'?'incomplete':'completed',output:[{id:'msg_mock',type:'message',role:'assistant',status:'completed',content:scenario==='refusal'?[{type:'refusal',refusal:'No'}]:[{type:'output_text',text:JSON.stringify(evals.modelPayloadFixtures.teach_ack),annotations:[]}]}],usage:{input_tokens:1,output_tokens:2,total_tokens:3}}));
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const address=server.address();if(!address||typeof address==='string')throw new Error('No address');
 try{
  const provider=openAIProvider('test-key','stub',1200,`http://127.0.0.1:${address.port}/v1`),{context}=buildContext(req);
  if(scenario==='completed')expect((await provider(context,req.userMessage,new AbortController().signal)).actualModel).toBe('stub');
  else await expect(provider(context,req.userMessage,new AbortController().signal)).rejects.toMatchObject({code:{incomplete:'AI_INCOMPLETE',refusal:'AI_REFUSED','429':'AI_PROVIDER_UNAVAILABLE'}[scenario]});
  expect(calls).toBe(1);expect(sent).toMatchObject({store:false,text:{format:{type:'json_schema',name:'piko_turn_v1',strict:true}}});expect(sent).not.toHaveProperty('tools');expect(sent).not.toHaveProperty('previous_response_id');
  const input=(sent as unknown as {input:{role:string;content:string}[]}).input;expect(input[0].role).toBe('developer');expect(input.at(-1)?.role).toBe('user');expect(input[0].content).not.toContain(req.userMessage);
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
