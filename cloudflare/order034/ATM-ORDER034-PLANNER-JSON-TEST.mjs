import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const src=path.join(here,'ATM-ORDER034-ACTIVE-MAIN-READONLY.js');
const tmp=path.join(os.tmpdir(),`atm-order034-planner-json-${process.pid}-${Date.now()}.mjs`);
let code=fs.readFileSync(src,'utf8').replace('import { DurableObject } from "cloudflare:workers";','class DurableObject { constructor(ctx,env){} }');
fs.writeFileSync(tmp,code,'utf8');
process.on('exit',()=>{try{fs.unlinkSync(tmp)}catch{}});
const {ATMBrain}=await import(pathToFileURL(tmp).href+'?v='+Date.now());

class Storage {
  constructor(){this.m=new Map();}
  async get(k){return this.m.get(k);}
  async put(k,v){this.m.set(k,structuredClone(v));}
  async setAlarm(){}
  async deleteAlarm(){}
}

const brain=new ATMBrain({storage:new Storage()},{EXECUTION_ENABLED:'true'});
brain.httpEvidenceFor=async()=>({ok:true,evidence:[]});
brain.runtimeFacts=async()=>({safe:true});
const fenced='```json\n{"can_execute":true,"reason":"","artifact":{"file_name":"result.md","mime_type":"text/markdown","role":"final","content":"valid planner artifact"},"grounding":[]}\n```';
brain.runExecutionModel=async()=>fenced;

const opp={
  raw_id:'T1',opportunity_id:'DAYDREAMS:T1',source:'DAYDREAMS',title:'Text task',description:'Return one markdown artifact.',
  capability_class:'PURE_LLM',artifact_profile:{supported:true,kind:'SINGLE',artifact_count:1,file_name:'result.md',mime_type:'text/markdown'}
};
const fresh={task:{description:opp.description}};
const runtime={job_id:'JOB1',terms_hash:'a'.repeat(64)};
const result=await brain.planTaskmarketArtifact(opp,fresh,runtime);
if(!result.ok) throw new Error('FENCED_VALID_JSON_REJECTED:'+String(result.error||'UNKNOWN'));
console.log('FENCED_VALID_JSON=PASS');
if(result.artifacts?.length!==1||result.artifacts[0].content!=='valid planner artifact'||result.artifacts[0].mime_type!=='text/markdown') throw new Error('PLANNER_ARTIFACT_INVALID');
console.log('PLANNER_ARTIFACT=PASS');
console.log('PRODUCTION_MUTATION=0');
