import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const src=path.join(here,'ATM-ORDER034-ACTIVE-MAIN-READONLY.js');
const tmp=path.join(os.tmpdir(),`atm-order061-${process.pid}-${Date.now()}.mjs`);
let code=fs.readFileSync(src,'utf8').replace(
  'import { DurableObject } from "cloudflare:workers";',
  'class DurableObject { constructor(ctx,env){ this.ctx=ctx; this.env=env; } }'
);
code+='\nexport { recoverPendingWorkV1, pendingWriteGuardV1 };\n';
fs.writeFileSync(tmp,code,'utf8');
process.on('exit',()=>{try{fs.unlinkSync(tmp)}catch{}});
const mod=await import(pathToFileURL(tmp).href+'?v='+Date.now());
const {ATMBrain,recoverPendingWorkV1}=mod;

class Storage {
  constructor(seed={}){this.m=new Map(Object.entries(seed));this.alarm=777;this.deleteCalls=0;this.setCalls=0;}
  async get(k){return this.m.has(k)?structuredClone(this.m.get(k)):undefined;}
  async put(k,v){this.m.set(k,structuredClone(v));}
  async setAlarm(v){this.alarm=v;this.setCalls++;}
  async deleteAlarm(){this.alarm=null;this.deleteCalls++;}
}
const opp={opportunity_id:'DAYDREAMS:T1',raw_id:'T1',source:'DAYDREAMS',title:'T1',terms_hash:'terms-1',deadline:new Date(Date.now()+3600000).toISOString()};
const uncertainRuntime={
  opportunity_id:opp.opportunity_id,task_id:'T1',source:'DAYDREAMS',stage:'SUBMITTING',terms_hash:'terms-1',
  submit_idempotency_key:'submit-idem-1',
  pending_external_intent:{operation:'submit',idempotency_key:'submit-idem-1',terms_hash:'terms-1',at:new Date().toISOString()},
  pending_external_intent_hash:'intent-hash',write_uncertain:false,attempts:1
};

// Restart after an external write may have landed: must freeze into WRITE_UNCERTAIN.
{
  const recovered=recoverPendingWorkV1(
    {[opp.opportunity_id]:{version:'PENDING_WORK_ENGINE_V1',opportunity_id:opp.opportunity_id,state:'ACTION_READY',allow_mutation:true,write_intent:uncertainRuntime.pending_external_intent,write_intent_hash:'intent-hash'}},
    {[opp.opportunity_id]:uncertainRuntime},
    {[opp.opportunity_id]:opp}
  );
  const row=recovered[opp.opportunity_id];
  if(row?.state!=='WRITE_UNCERTAIN'||row?.allow_mutation!==false||row?.required_action!=='READBACK_ONLY') {
    throw new Error('RESTART_DID_NOT_FREEZE_UNCERTAIN_WRITE:'+JSON.stringify(row));
  }
  console.log('ORDER061_RESTART_WRITE_UNCERTAIN=PASS');
}

// Actual claim/submit mutation paths must call the guard, not merely define it.
{
  const source=fs.readFileSync(src,'utf8');
  const claim=source.slice(source.indexOf('if (fresh.operation === "claim")'),source.indexOf('if (fresh.operation !== "submit")'));
  const submit=source.slice(source.indexOf('runtime.stage = "SUBMITTING"'),source.indexOf('const submit = await this.submitExecutionSource')+80);
  if(!claim.includes('pendingWriteGuardV1(')) throw new Error('CLAIM_PATH_MISSING_PENDING_WRITE_GUARD');
  if(!submit.includes('pendingWriteGuardV1(')) throw new Error('SUBMIT_PATH_MISSING_PENDING_WRITE_GUARD');
  console.log('ORDER061_MUTATION_GUARDS_WIRED=PASS');
}

// Exact same settlement receipt replay is idempotent; same ref for another identity is blocked.
{
  const storage=new Storage();
  const brain=new ATMBrain({storage},{});
  const receipt={source:'DAYDREAMS',task_id:'T1',submission_id:'S1',payee:'0xabc',amount:10,currency:'USDC',status:'PAID',external_ref:'0xtx1',authoritative_readback:'TEST',observed_at:new Date().toISOString(),evidence_hash:'hash-1'};
  const first=await brain.registerSettlementRef(receipt,opp.opportunity_id);
  const replay=await brain.registerSettlementRef(receipt,opp.opportunity_id);
  const conflict=await brain.registerSettlementRef({...receipt,task_id:'T2',submission_id:'S2',evidence_hash:'hash-2'},'DAYDREAMS:T2');
  if(!first.ok||!replay.ok||replay.replayed!==true) throw new Error('EXACT_SETTLEMENT_REPLAY_NOT_IDEMPOTENT:'+JSON.stringify({first,replay}));
  if(conflict.ok||conflict.error!=='DUPLICATE_EXTERNAL_REF_CONFLICT') throw new Error('SETTLEMENT_REF_CONFLICT_NOT_BLOCKED:'+JSON.stringify(conflict));
  await brain.appendLedgerEvent({...opp,estimated_net_usd:10},'PAID',{receipt_present:true,external_readback:true,reference:'0xtx1'});
  await brain.appendLedgerEvent({...opp,estimated_net_usd:10},'PAID',{receipt_present:true,external_readback:true,reference:'0xtx1'});
  const ledger=await storage.get('money_ledger');
  if((ledger||[]).filter(x=>x.stage==='PAID').length!==1) throw new Error('PAID_LEDGER_NOT_EXACTLY_ONCE');
  console.log('ORDER061_SETTLEMENT_REPLAY_IDEMPOTENT=PASS');
  console.log('ORDER061_PAID_LEDGER_EXACTLY_ONCE=PASS');
}

// WRITE_UNCERTAIN without submission_id must keep/re-arm the DO alarm.
{
  const storage=new Storage({
    task_runtime:{[opp.opportunity_id]:{...uncertainRuntime,stage:'WRITE_UNCERTAIN',write_uncertain:true}},
    opportunities:[opp],
    pending_work_v1:{version:'PENDING_WORK_ENGINE_V1',items:{[opp.opportunity_id]:{version:'PENDING_WORK_ENGINE_V1',opportunity_id:opp.opportunity_id,state:'WRITE_UNCERTAIN',allow_mutation:false,required_action:'READBACK_ONLY',write_operation:'submit'}},updated_at:new Date().toISOString()},
    execution_readbacks:[]
  });
  const brain=new ATMBrain({storage},{});
  brain.taskmarketSubmissionReadback=async()=>({ok:true,results:[],read_at:new Date().toISOString()});
  const out=await brain.monitorExecutionReadback('order061_alarm_test');
  if(storage.deleteCalls!==0||storage.alarm===null||storage.setCalls<1) throw new Error('WRITE_UNCERTAIN_ALARM_WAS_LOST:'+JSON.stringify({out,deleteCalls:storage.deleteCalls,setCalls:storage.setCalls,alarm:storage.alarm}));
  console.log('ORDER061_UNCERTAIN_ALARM_PRESERVED=PASS');
}

// USD metric must not silently add DCC; stale readback must be distinguishable from fresh.
{
  const freshAt=new Date().toISOString(), staleAt=new Date(Date.now()-2*3600000).toISOString();
  const storage=new Storage({
    opportunities:[],source_states:{},task_runtime:{},
    pending_work_v1:{version:'PENDING_WORK_ENGINE_V1',items:{
      fresh:{state:'SUBMITTED',submission_ref:'S-fresh',last_readback_at:freshAt,last_readback_hash:'hf'},
      stale:{state:'SUBMITTED',submission_ref:'S-stale',last_readback_at:staleAt,last_readback_hash:'hs'}
    }},
    settlement_refs_v1:{version:'SETTLEMENT_READBACK_V1',refs:{
      usd:{amount:10,currency:'USDC',external_ref:'u'},
      dcc:{amount:150,currency:'DCC',external_ref:'d'}
    }},
    money_path_epoch_v1:{started_at:freshAt}
  });
  const brain=new ATMBrain({storage},{});
  const status=await brain.moneyPathStatus();
  if(status.earnings_paid_external_usd!==10) throw new Error('NON_USD_MISLABELED_AS_USD:'+JSON.stringify(status));
  if(status.earnings_paid_external_non_usd?.DCC!==150) throw new Error('NON_USD_BREAKDOWN_MISSING:'+JSON.stringify(status.earnings_paid_external_non_usd));
  if(status.SUBMITTED_WITH_READBACK!==2) throw new Error('HISTORICAL_READBACK_COUNT_CHANGED');
  if(status.SUBMITTED_WITH_FRESH_READBACK!==1) throw new Error('FRESH_READBACK_COUNT_INCORRECT:'+JSON.stringify(status));
  console.log('ORDER061_CURRENCY_UNITS=PASS');
  console.log('ORDER061_READBACK_FRESHNESS=PASS');
}

// ORDER-060 research JSON must be plain UTF-8 without BOM.
for(const name of ['capability-optimizer-candidates.json','superteam-colosseum-salta-watch.json','system-one-provider-candidates.json']){
  const p=path.join(here,'..','..','research','current',name);
  const buf=fs.readFileSync(p);
  if(buf[0]===0xef&&buf[1]===0xbb&&buf[2]===0xbf) throw new Error('UTF8_BOM_PRESENT:'+name);
  JSON.parse(buf.toString('utf8'));
}
console.log('ORDER061_RESEARCH_JSON_UTF8=PASS');
console.log('PRODUCTION_MUTATION_IN_TEST=0');
