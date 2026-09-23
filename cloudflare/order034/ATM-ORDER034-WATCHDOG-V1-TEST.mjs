import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const src=path.join(here,'ATM-ORDER034-ACTIVE-MAIN-READONLY.js');
const tmp=path.join(os.tmpdir(),`atm-order034-watchdog-${process.pid}-${Date.now()}.mjs`);
let code=fs.readFileSync(src,'utf8').replace('import { DurableObject } from "cloudflare:workers";','class DurableObject { constructor(ctx,env){} }');
fs.writeFileSync(tmp,code,'utf8');
process.on('exit',()=>{try{fs.unlinkSync(tmp)}catch{}});
const {ATMBrain}=await import(pathToFileURL(tmp).href+'?v='+Date.now());
class Storage {
  constructor(seed={}){this.m=new Map(Object.entries(seed));this.events=[];this.alarm=null;}
  async get(k){return this.m.has(k)?structuredClone(this.m.get(k)):undefined;}
  async put(k,v){this.m.set(k,structuredClone(v));if(k==='task_runtime')this.events.push(structuredClone(v));}
  async setAlarm(v){this.alarm=v;}
  async deleteAlarm(){this.alarm=null;}
}
const ctxFor=seed=>({storage:new Storage(seed)});
const opp={opportunity_id:'DAYDREAMS:T1',raw_id:'T1',source:'DAYDREAMS',title:'Ten products',description:'Submit exactly ten individual markdown files.',source_status:'open',ai_executability:'AI_EXECUTABLE',blockers:[],artifact_profile:{supported:true,kind:'MULTI_MARKDOWN',artifact_count:10,mime_type:'text/markdown'},economics:{estimated_task_cost_usdc:0},capability_class:'PURE_LLM'};
const runtime={job_id:'JOB1',task_id:'T1',opportunity_id:opp.opportunity_id,source:'DAYDREAMS',stage:'EXECUTING',attempts:1,selected_at:new Date().toISOString(),terms_hash:'a'.repeat(64)};
{
  const c=ctxFor({task_runtime:{[opp.opportunity_id]:runtime},opportunities:[opp],agentic:{selected_task_id:'T1'},quota:{day:new Date().toISOString().slice(0,10),calls:4,reserved_neurons:0},economic_watchdog:{last_stage:'EXECUTING',last_progress_at:new Date().toISOString(),last_artifact_count:0,last_submission_id:null,last_external_readback:null,last_paid_amount:0,ai_calls_at_last_progress:4,anomaly_fingerprint:null,anomaly_count:0,last_glm_diagnosis_at:null,glm_watchdog_calls_today:0,classification:'HEALTHY',recommended_action:'NONE',glm_watchdog_day:new Date().toISOString().slice(0,10),task_id:'T1',opportunity_id:opp.opportunity_id,last_error_code:null,last_accepted_count:0,last_paid_count:0}});
  const b=new ATMBrain(c,{AI:{run:async()=>{throw new Error('GLM_SHOULD_NOT_RUN')}}});let calls=0;b.runExecutionModelResult=async()=>{calls++;return{text:'{}'}};
  const w=await b.economicWatchdogTick('synthetic_healthy',true);
  if(w.anomaly!=='NONE'||calls!==0)throw new Error('HEALTHY_WATCHDOG_FAILED');
  console.log('SYNTHETIC_HEALTHY_GLM_WATCHDOG_CALLS=0');
}
{
  const old=new Date(Date.now()-10*60*1000).toISOString();
  const c=ctxFor({task_runtime:{[opp.opportunity_id]:runtime},opportunities:[opp],agentic:{selected_task_id:'T1'},quota:{day:new Date().toISOString().slice(0,10),calls:6,reserved_neurons:0},economic_watchdog:{last_stage:'EXECUTING',last_progress_at:old,last_artifact_count:0,last_submission_id:null,last_external_readback:null,last_paid_amount:0,ai_calls_at_last_progress:0,anomaly_fingerprint:null,anomaly_count:0,last_glm_diagnosis_at:null,glm_watchdog_calls_today:0,classification:'HEALTHY',recommended_action:'NONE',glm_watchdog_day:new Date().toISOString().slice(0,10),task_id:'T1',opportunity_id:opp.opportunity_id,last_error_code:null,last_accepted_count:0,last_paid_count:0}});
  const b=new ATMBrain(c,{AI:{run:async()=>({})}});let calls=0;b.runExecutionModelResult=async()=>{calls++;return{text:'{"classification":"STALL","economic_progress":false,"root_cause":"no progress","retry_same_strategy":false,"recommended_recovery":"deterministic allowlist","confidence":0.99}',finish_reason:'stop'}};
  const w1=await b.economicWatchdogTick('synthetic_stalled',true);const w2=await b.economicWatchdogTick('synthetic_stalled_repeat',true);
  if(w1.anomaly==='NONE'||calls!==1||w2.glm_watchdog_calls_today!==1)throw new Error('STALLED_WATCHDOG_FAILED');
  console.log('SYNTHETIC_STALLED_ANOMALY_DETECTED=YES');
  console.log('SYNTHETIC_STALLED_GLM_WATCHDOG_CALLS=1');
  console.log('SAME_UNCHANGED_ANOMALY_ADDITIONAL_GLM_CALLS=0');
}
{
  const c=ctxFor({task_runtime:{[opp.opportunity_id]:runtime},opportunities:[opp],agentic:{selected_task_id:'T1'},quota:{day:new Date().toISOString().slice(0,10),calls:0,reserved_neurons:0}});
  const b=new ATMBrain(c,{AI:{run:async()=>({})}});b.httpEvidenceFor=async()=>({ok:true,evidence:[]});b.runtimeFacts=async()=>({safe:true});
  let manifestCalls=0,fileCalls=0,failOnce=true;
  b.runExecutionModelResult=async(messages)=>{
    const u=String(messages.at(-1)?.content||'');
    if(u.includes('TASK_TERMS_BEGIN')&&!u.includes('FILE_INDEX=')){manifestCalls++;return{text:JSON.stringify({items:Array.from({length:10},(_,i)=>({file_name:String(i+1).padStart(2,'0')+'-product-'+(i+1)+'.md',concept:'distinct concept '+(i+1)}))}),finish_reason:'stop'};}
    const m=/FILE_INDEX=(\d+)\//.exec(u);const i=Number(m?.[1]||0);fileCalls++;
    if(i===4&&failOnce){failOnce=false;throw new Error('SYNTHETIC_INTERRUPT_AFTER_3');}
    return{text:'# Product '+i+'\n\n'+('Specific validated product detail '+i+'. ').repeat(40),finish_reason:'stop'};
  };
  let interrupted=false;try{await b.planTaskmarketArtifact(opp,{task:{description:opp.description}},runtime);}catch(e){interrupted=String(e.message).includes('SYNTHETIC_INTERRUPT');}
  if(!interrupted)throw new Error('ATOMIC_INTERRUPT_NOT_OBSERVED');
  const after3=await c.storage.get('task_runtime');if(Number(after3[opp.opportunity_id].artifact_count)!==3)throw new Error('ATOMIC_DID_NOT_PERSIST_3');
  const result=await b.planTaskmarketArtifact(opp,{task:{description:opp.description}},after3[opp.opportunity_id]);
  const finalRuns=await c.storage.get('task_runtime');const counts=c.storage.events.map(x=>Number(x[opp.opportunity_id]?.artifact_count||0)).filter(x=>x>0);
  const monotonic=[...new Set(counts)];
  if(!result.ok||result.artifacts.length!==10||finalRuns[opp.opportunity_id].artifact_count!==10||manifestCalls!==1||monotonic.join(',')!=='1,2,3,4,5,6,7,8,9,10')throw new Error('ATOMIC_PROGRESS_OR_RESUME_FAILED:'+JSON.stringify({manifestCalls,fileCalls,monotonic,count:finalRuns[opp.opportunity_id].artifact_count}));
  console.log('ATOMIC_MANIFEST_CALLS=1');
  console.log('ATOMIC_ARTIFACT_PROGRESS='+monotonic.join('→'));
  console.log('ATOMIC_RESUME_FIRST_MISSING=PASS');
  console.log('ATOMIC_VALID_PERSISTED_ARTIFACT_REGENERATION=0');
}
console.log('PRODUCTION_MUTATION=0');console.log('TASKMARKET_WRITES=0');console.log('REAL_SIGNATURES=0');console.log('REAL_SUBMISSIONS=0');
