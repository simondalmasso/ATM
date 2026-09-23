import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const src=path.join(here,'ATM-ORDER034-ACTIVE-MAIN-READONLY.js');
const tmp=path.join(os.tmpdir(),`atm-order034-verifier-json-${process.pid}-${Date.now()}.mjs`);
let code=fs.readFileSync(src,'utf8').replace('import { DurableObject } from "cloudflare:workers";','class DurableObject { constructor(ctx,env){} }');
fs.writeFileSync(tmp,code,'utf8');
process.on('exit',()=>{try{fs.unlinkSync(tmp)}catch{}});
const {ATMBrain}=await import(pathToFileURL(tmp).href+'?v='+Date.now());

const brain=new ATMBrain({storage:{}},{});
brain.runExecutionModel=async()=> '```json\n{"pass":true,"reasons":[],"requirements_checked":["content"]}\n```';
const publicTaskId='0x'+'93'.repeat(32);
const opp={raw_id:publicTaskId,title:'Text task',description:'Return one markdown artifact.',artifact_profile:{supported:true,kind:'SINGLE',artifact_count:1,file_name:'result.md',mime_type:'text/markdown'}};
const fresh={task:{id:publicTaskId,description:opp.description}};
const runtime={job_id:'JOB1',terms_hash:'a'.repeat(64)};
const artifact=(content)=>[{file_name:'result.md',mime_type:'text/markdown',role:'final',content}];
const fenced=await brain.verifyTaskmarketArtifacts(opp,fresh,artifact('Valid artifact for public task '+publicTaskId+'.'),runtime);
if(!fenced.ok) throw new Error('PUBLIC_TASK_ID_FALSE_SECRET:'+String(fenced.reasons?.[0]||'UNKNOWN'));
console.log('PUBLIC_TASK_ID_SECRET_SCAN=PASS');
const foreign='0x'+'ab'.repeat(32);
const blocked=await brain.verifyTaskmarketArtifacts(opp,fresh,artifact('Do not leak '+foreign),runtime);
if(blocked.ok||!blocked.reasons?.includes('ARTIFACT_1_SECRET_SCAN_PRIVATE_KEY_LIKE_HEX')) throw new Error('FOREIGN_HEX_NOT_BLOCKED');
console.log('FOREIGN_PRIVATE_KEY_LIKE_HEX=BLOCKED');
console.log('FENCED_VERIFIER_JSON=PASS');
console.log('PRODUCTION_MUTATION=0');
