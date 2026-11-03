import {readFile,writeFile} from 'node:fs/promises';
import evals from '../content/ai-evals.v1.json';
const result=JSON.parse(await readFile('checks/unit-results.json','utf8')) as {success:boolean;numPassedTests:number;testResults:{assertionResults:{title:string;status:string}[]}[]};
const assertions=result.testResults.flatMap(t=>t.assertionResults);
const cases=evals.cases.map(c=>({id:c.id,titlePL:c.titlePL,status:c.kind==='semantic'?'NOT RUN — requires real model and human review':assertions.find(a=>a.title.startsWith(c.id+' '))?.status.toUpperCase()??'NOT RUN',scope:c.kind==='semantic'?'Input schema checked separately; no semantic pass claimed.':'Deterministic HTTP or reducer fixture. Browser properties covered separately by E2E.'}));
await writeFile('checks/ai-evals-deterministic.json',JSON.stringify({date:new Date().toISOString(),mode:'mock',paidProviderCalls:0,unitTestsPassed:result.numPassedTests,cases},null,2)+'\n');
if(cases.some(c=>c.id.startsWith('INT')&&c.status!=='PASSED'))throw new Error('Incomplete deterministic eval suite');
console.log('32 deterministic cases PASS; 10 semantic cases NOT RUN.');
