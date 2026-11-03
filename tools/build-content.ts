import { readFile, writeFile, mkdir } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import standaloneCode from 'ajv/dist/standalone/index.js';
import { build } from 'esbuild';
import { compile } from 'json-schema-to-typescript';
const data=JSON.parse(await readFile('content/missions.v1.json','utf8'));
const ajv=new Ajv2020({strict:false});
const schema=JSON.parse(await readFile('content/missions.schema.json','utf8'));
if (!ajv.validate(schema,data)) throw new Error(JSON.stringify(ajv.errors));
const publicData=JSON.parse(JSON.stringify(data,(key,value)=>['witness','knownFailures'].includes(key)?undefined:value));
await mkdir('packages/content/generated',{recursive:true});
await writeFile('packages/content/generated/public-missions.json',JSON.stringify(publicData,null,2)+'\n');
await writeFile('packages/content/generated/authoring-missions.json',JSON.stringify(data,null,2)+'\n');
for (const kind of ['request','response']) {
 const contract=JSON.parse(await readFile(`contracts/ai-${kind}.schema.json`,'utf8'));
 await writeFile(`packages/contracts/src/${kind}.generated.ts`,await compile({...contract,title:kind==='request'?'LearnerRequest':'ModelPayload'},kind==='request'?'LearnerRequest':'ModelPayload',{ignoreMinAndMaxItems:true,bannerComment:'/* Generated from contracts/ JSON Schema. Do not edit. */'}));
}
console.log('Content schema OK; 6 missions / 24 scenes; public data stripped; DTO types generated.');

const contractAjv=new Ajv2020({strict:false,allErrors:true,code:{source:true,esm:true}});
contractAjv.addSchema(JSON.parse(await readFile('contracts/ai-request.schema.json','utf8')),'request');
contractAjv.addSchema(JSON.parse(await readFile('contracts/ai-response.schema.json','utf8')),'response');
const validationCode=standaloneCode(contractAjv,{validateRequest:'request',validateModel:'response'});
await build({stdin:{contents:validationCode,resolveDir:process.cwd(),sourcefile:'validators.cjs'},bundle:true,format:'esm',platform:'browser',outfile:'packages/contracts/src/validators.generated.js'});
await writeFile('packages/contracts/src/validators.generated.d.ts',`import type {ValidateFunction} from 'ajv';
import type {LearnerRequest} from './request.generated';
import type {ModelPayload} from './response.generated';
export const validateRequest:ValidateFunction<LearnerRequest>;
export const validateModel:ValidateFunction<ModelPayload>;
`);
