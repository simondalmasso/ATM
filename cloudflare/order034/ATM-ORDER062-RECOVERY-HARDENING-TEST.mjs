import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {pathToFileURL,fileURLToPath} from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const sourcePath=path.join(here,"ATM-ORDER034-ACTIVE-MAIN-READONLY.js");
const sourceText=fs.readFileSync(sourcePath,"utf8");

let code=sourceText.replace('import { DurableObject } from "cloudflare:workers";','class DurableObject { constructor(ctx,env){ this.ctx=ctx; this.env=env; } }');
code+='\nexport { recoverPendingWorkV1, pendingWriteGuardV1, settlementReceiptMatchV1, settlementRefEquivalentV1, externalPaidUsdV1 };\n';
const tmp=path.join(os.tmpdir(),`atm-order062-${process.pid}-${Date.now()}.mjs`);
fs.writeFileSync(tmp,code,"utf8");
const mod=await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);

const opp={opportunity_id:"OPP-1",raw_id:"TASK-1",source:"DAYDREAMS",terms_hash:"terms-v1"};
const runtime={opportunity_id:"OPP-1",task_id:"TASK-1",source:"DAYDREAMS",stage:"SUBMITTING",terms_hash:"terms-v1",submit_idempotency_key:"idem-submit-1",pending_external_intent:{operation:"submit",idempotency_key:"idem-submit-1",terms_hash:"terms-v1",at:"2026-09-28T07:00:00.000Z"},pending_external_intent_hash:"intent-hash"};
const recovered=mod.recoverPendingWorkV1({"OPP-1":{version:"PENDING_WORK_ENGINE_V1",opportunity_id:"OPP-1",source:"DAYDREAMS",task_id:"TASK-1",state:"ACTION_READY",write_intent:runtime.pending_external_intent,write_intent_hash:"intent-hash",allow_mutation:true}},{"OPP-1":runtime},{"OPP-1":opp});
if(recovered["OPP-1"]?.state!=="WRITE_UNCERTAIN") throw new Error("RESTART_DID_NOT_FREEZE_WRITE");
if(recovered["OPP-1"]?.allow_mutation!==false||recovered["OPP-1"]?.required_action!=="READBACK_ONLY") throw new Error("RESTART_WRITE_GUARD_NOT_FAIL_CLOSED");
if(recovered["OPP-1"]?.write_operation!=="submit") throw new Error("RESTART_WRITE_OPERATION_LOST");

const receipt={source:"DAYDREAMS",task_id:"TASK-1",submission_id:"SUB-1",payee:"0xabc",amount:12.5,currency:"USDC",status:"PAID",external_ref:"tx-1",authoritative_readback:"TASKMARKET_AWARD_SETTLEMENT",observed_at:"2026-09-28T07:00:00.000Z",evidence_hash:"hash-1"};
const existing={opportunity_id:"OPP-1",source:"DAYDREAMS",task_id:"TASK-1",submission_id:"SUB-1",payee:"0xabc",amount:12.5,currency:"USDC",observed_at:"2026-09-28T07:00:00.000Z",evidence_hash:"hash-1"};
if(mod.settlementRefEquivalentV1(existing,receipt,"OPP-1")!==true) throw new Error("EXACT_SETTLEMENT_REPLAY_NOT_IDEMPOTENT");
if(mod.settlementRefEquivalentV1({...existing,amount:13},receipt,"OPP-1")!==false) throw new Error("CONFLICTING_SETTLEMENT_REF_NOT_BLOCKED");

const memory=new Map();
const ctx={storage:{get:async(k)=>memory.get(k),put:async(k,v)=>{memory.set(k,structuredClone(v));}}};
const brain=new mod.ATMBrain(ctx,{});
const registered1=await brain.registerSettlementRef(receipt,"OPP-1");
if(!registered1.ok||registered1.idempotent!==false) throw new Error("FIRST_SETTLEMENT_REGISTER_FAILED");
const registered2=await brain.registerSettlementRef({...receipt,observed_at:"2026-09-28T07:05:00.000Z",evidence_hash:"hash-2"},"OPP-1");
if(!registered2.ok||registered2.idempotent!==true) throw new Error("EXACT_SETTLEMENT_REPLAY_DID_NOT_CONVERGE");
const registeredConflict=await brain.registerSettlementRef({...receipt,amount:99},"OPP-1");
if(registeredConflict.ok||registeredConflict.error!=="DUPLICATE_EXTERNAL_REF_CONFLICT") throw new Error("CONFLICTING_SETTLEMENT_REGISTER_NOT_BLOCKED");

const refs={refs:{
  "usd-1":{amount:10,currency:"USD"},
  "usdc-1":{amount:2.5,currency:"USDC"},
  "dcc-1":{amount:150,currency:"DCC"},
  "eur-1":{amount:7,currency:"EUR"}
}};
if(mod.externalPaidUsdV1(refs)!==12.5) throw new Error("NON_USD_COUNTED_AS_USD");

if(!sourceText.includes("pendingWriteGuardV1(pendingRecord")) throw new Error("PENDING_WRITE_GUARD_NOT_WIRED");
if(!sourceText.includes('state==="WRITE_UNCERTAIN"')||!sourceText.includes("uncertainRemaining")) throw new Error("UNCERTAIN_ALARM_PRESERVATION_NOT_WIRED");
if(!sourceText.includes('readback_metric_semantics:"HISTORICAL_EVIDENCE_PRESENT_NOT_FRESHNESS_GUARANTEE"')) throw new Error("READBACK_SEMANTICS_NOT_EXPLICIT");

for(const rel of [
  "../../research/current/capability-optimizer-candidates.json",
  "../../research/current/superteam-colosseum-salta-watch.json",
  "../../research/current/system-one-provider-candidates.json"
]){
  const raw=fs.readFileSync(path.join(here,rel),"utf8");
  if(raw.charCodeAt(0)===0xFEFF) throw new Error("RESEARCH_JSON_BOM_PRESENT_"+rel);
  JSON.parse(raw);
}

console.log("ORDER062_RESTART_FREEZE=PASS");
console.log("ORDER062_SETTLEMENT_REPLAY_IDEMPOTENT=PASS");
console.log("ORDER062_CONFLICTING_REF_BLOCKED=PASS");
console.log("ORDER062_CURRENCY_SAFE_USD=PASS");
console.log("ORDER062_UNCERTAIN_ALARM=PASS");
console.log("ORDER062_READBACK_SEMANTICS=PASS");
console.log("PRODUCTION_MUTATION_IN_TEST=0");
