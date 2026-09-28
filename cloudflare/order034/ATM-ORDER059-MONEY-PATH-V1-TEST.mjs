import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {pathToFileURL,fileURLToPath} from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const sourcePath=path.join(here,"ATM-ORDER034-ACTIVE-MAIN-READONLY.js");
const sourceText=fs.readFileSync(sourcePath,"utf8");
let code=sourceText.replace('import { DurableObject } from "cloudflare:workers";','class DurableObject { constructor(ctx,env){ this.ctx=ctx; this.env=env; } }');
code+='\nexport { SOURCE_TRUTH_V1, WORKER_CONTRACT_SCHEMA_V1, WORKER_PROVEN_REGISTRY_V1, sourceEvidenceBundleV1, sourceTruthVerdictV1, economicTruthV1, moneyPathConstraintV1, pendingWorkRecordV1, pendingWriteGuardV1, pendingAfterWriteFailureV1, recoverPendingWorkV1, settlementReceiptMatchV1, newWorkerRegistryEntryV1, applyGalaxyCapabilityTruth, executionCandidateAdmitted };\n';
const tmp=path.join(os.tmpdir(),`atm-order059-${process.pid}-${Date.now()}.mjs`);
fs.writeFileSync(tmp,code,"utf8");
const mod=await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);

const future=()=>new Date(Date.now()+7*864e5).toISOString();
const base=(over={})=>({
  opportunity_id:"DAYDREAMS:t1",raw_id:"t1",source:"DAYDREAMS",title:"Research task",description:"Write a concise research report",
  source_url:"https://api.taskmarket.dev/api/tasks/t1",source_status:"open",freshness_at:new Date().toISOString(),
  payout_amount:150,payout_currency:"USDC",estimated_net_usd:150,deadline:future(),mode:"bounty",
  capability_class:"PURE_LLM",artifact_profile:{supported:true,artifact_count:1},blockers:[],ai_executability:"AI_EXECUTABLE",
  open_now:true,newcomer_can_enter:true,geo_argentina_or_global:true,ai_automation_allowed:true,exact_deliverable:true,acceptance:true,
  competition:true,payout_rail:"BASE_USDC_TASKMARKET",payout_readback:"TASKMARKET_EXTERNAL_SETTLEMENT_WATCHER",
  owner_spend:{known:true,zero:true,amount_usd:0},required_capabilities:["TEXT_RESEARCH"],executor_truth:"PROVEN",
  eligibility:{source_truth_proven:true,payout_truth_proven:true,owner_spend_zero:true,terms_allow_automation:true,payout_path_known:true},
  economics:{explicit_zero_cost:true,worker_action:"submit",action_cost_usdc:0,task_execution_spend_required:false},
  terms_hash:"terms-1",...over
});

const complete=mod.sourceEvidenceBundleV1(base(),{fetched:true,published:true});
if(mod.sourceTruthVerdictV1(complete)!==mod.SOURCE_TRUTH_V1.YES) throw new Error("COMPLETE_SOURCE_NOT_YES");

const notFetched=mod.sourceEvidenceBundleV1(base(),{fetched:false,published:false});
if(mod.sourceTruthVerdictV1(notFetched)!==mod.SOURCE_TRUTH_V1.UNKNOWN_NOT_FETCHED) throw new Error("NOT_FETCHED_CLASS_LOST");
const notPublished=mod.sourceEvidenceBundleV1(base({newcomer_can_enter:null}),{fetched:true,published:false});
if(mod.sourceTruthVerdictV1(notPublished)!==mod.SOURCE_TRUTH_V1.UNKNOWN_NOT_PUBLISHED) throw new Error("NOT_PUBLISHED_CLASS_LOST");
if([notFetched,notPublished].some(x=>mod.sourceTruthVerdictV1(x)===mod.SOURCE_TRUTH_V1.YES)) throw new Error("UNKNOWN_PROMOTED_TO_YES");

for(const owner of [{known:false,zero:null,amount_usd:null},{known:true,zero:false,amount_usd:1}]){
  const b=mod.sourceEvidenceBundleV1(base({owner_spend:owner}),{fetched:true,published:true});
  if(mod.economicTruthV1(b).verdict===mod.SOURCE_TRUTH_V1.YES) throw new Error("OWNER_COST_NOT_BLOCKED");
}
const noPayoutReadback=mod.sourceEvidenceBundleV1(base({payout_readback:null}),{fetched:true,published:true});
if(mod.economicTruthV1(noPayoutReadback).verdict===mod.SOURCE_TRUTH_V1.YES) throw new Error("PAYOUT_READBACK_UNKNOWN_NOT_BLOCKED");

const codeGap=base({title:"Implement CUDA code improvement",description:"Implement a bounded code improvement artifact",required_capabilities:["CODE"],executor_truth:"BLOCKED",ai_executability:"BLOCKED",blockers:["EXECUTOR_CAPABILITY_UNAVAILABLE_CODE"]});
const codeBundle=mod.sourceEvidenceBundleV1(codeGap,{fetched:true,published:true});
if(!String(mod.moneyPathConstraintV1(codeGap,codeBundle,mod.economicTruthV1(codeBundle))).startsWith("EXECUTOR_PROOF:")) throw new Error("DAYDREAMS_EXECUTOR_GAP_NOT_CLASSIFIED");
if(mod.executionCandidateAdmitted(codeGap,{TASKMARKET_SIGNER:{}})) throw new Error("EXECUTOR_GAP_AUTO_ELIGIBLE");

const superteam=base({source:"SUPERTEAM",opportunity_id:"SUPERTEAM:s1",raw_id:"s1",payout_amount:10000,payout_currency:"USDG",estimated_net_usd:10000,source_url:"https://superteam.fun/earn/listing/x",newcomer_can_enter:null,geo_argentina_or_global:null,ai_automation_allowed:false,exact_deliverable:null,acceptance:null,competition:null,payout_rail:null,payout_readback:null,owner_spend:{known:false,zero:null,amount_usd:null},executor_truth:"PROVEN",required_capabilities:["TEXT_RESEARCH"],blockers:["AGENT_ACCESS_NOT_ALLOWED","PAYOUT_RAIL_UNKNOWN"],eligibility:{source_truth_proven:false,payout_truth_proven:false,owner_spend_zero:null}});
const superBundle=mod.sourceEvidenceBundleV1(superteam,{fetched:true,published:false});
if(mod.moneyPathConstraintV1(superteam,superBundle,mod.economicTruthV1(superBundle))!=="SOURCE_PROOF_REQUIRED") throw new Error("SUPERTEAM_SOURCE_GAP_NOT_CLASSIFIED");

const p0=mod.pendingWorkRecordV1(base(),{source:"DAYDREAMS",task_id:"t1",job_id:"j1",stage:"ACQUIRING",terms_hash:"terms-1",claim_idempotency_key:"idem-c",attempts:1});
const uncertain=mod.pendingAfterWriteFailureV1(p0,{operation:"claim",error:"timeout"});
if(uncertain.state!=="WRITE_UNCERTAIN"||uncertain.allow_mutation!==false||uncertain.required_action!=="READBACK_ONLY") throw new Error("AMBIGUOUS_WRITE_NOT_FAIL_CLOSED");
const again=mod.pendingWriteGuardV1(uncertain,{terms_hash:"terms-1",deadline:future(),last_readback_at:new Date().toISOString()});
if(again.allow_mutation!==false) throw new Error("WRITE_UNCERTAIN_DUPLICATE_MUTATION_ALLOWED");

const runtimes={one:{source:"DAYDREAMS",task_id:"t1",opportunity_id:"DAYDREAMS:t1",job_id:"j1",stage:"WAITING_ACCEPTANCE",submission_id:"sub-1",terms_hash:"terms-1",submit_idempotency_key:"idem-s",attempts:1}};
const recovered1=mod.recoverPendingWorkV1({},runtimes,{"DAYDREAMS:t1":base()});
const recovered2=mod.recoverPendingWorkV1(recovered1,runtimes,{"DAYDREAMS:t1":base()});
if(Object.keys(recovered1).length!==1||Object.keys(recovered2).length!==1||recovered2["DAYDREAMS:t1"].state!=="SUBMITTED") throw new Error("PENDING_RESTART_NOT_IDEMPOTENT");

for(const current of [
 {terms_hash:"terms-2",deadline:future(),last_readback_at:new Date().toISOString()},
 {terms_hash:"terms-1",deadline:new Date(Date.now()-1000).toISOString(),last_readback_at:new Date().toISOString()},
 {terms_hash:"terms-1",deadline:future(),last_readback_at:new Date(Date.now()-2*3600e3).toISOString()}
]){
 const g=mod.pendingWriteGuardV1({...p0,state:"ACTION_READY",allow_mutation:true},{...current,max_readback_age_ms:30*60e3});
 if(g.allow_mutation!==false) throw new Error("STALE_OR_CHANGED_WRITE_NOT_BLOCKED");
}

const expected={source:"DAYDREAMS",task_id:"t1",submission_id:"sub-1",payee:"0xabc",amount:12.5,currency:"USDC"};
const goodReceipt={...expected,status:"PAID",external_ref:"0xtx",authoritative_readback:"TASKMARKET_AWARD_SETTLEMENT",observed_at:new Date().toISOString(),evidence_hash:"hash1"};
if(mod.settlementReceiptMatchV1({...goodReceipt,status:"ACCEPTED"},expected,[]).paid) throw new Error("ACCEPTED_WITHOUT_PAID_RECEIPT_COUNTED");
for(const bad of [
 {...goodReceipt,task_id:"wrong"},
 {...goodReceipt,submission_id:"wrong"},
 {...goodReceipt,payee:"0xdef"},
 {...goodReceipt,amount:0},
 {...goodReceipt,external_ref:""}
]) if(mod.settlementReceiptMatchV1(bad,expected,[]).paid) throw new Error("BAD_SETTLEMENT_MATCHED:"+JSON.stringify(bad));
if(!mod.settlementReceiptMatchV1(goodReceipt,expected,[]).paid) throw new Error("VALID_SETTLEMENT_NOT_MATCHED");
if(mod.settlementReceiptMatchV1(goodReceipt,expected,["0xtx"]).paid) throw new Error("DUPLICATE_PAYOUT_REF_COUNTED");

const nw=mod.newWorkerRegistryEntryV1("TEST_WORKER",["CODE"]);
if(nw.proven!==false) throw new Error("NEW_WORKER_DEFAULT_PROVEN");
if(Object.values(mod.WORKER_PROVEN_REGISTRY_V1).some(x=>x.proven===true)) throw new Error("REGISTRY_INVENTED_PROVEN_WORKER");
if(mod.WORKER_CONTRACT_SCHEMA_V1.max_owner_cost_usd!==0) throw new Error("WORKER_CONTRACT_OWNER_COST_WIDENED");

const ui=mod.applyGalaxyCapabilityTruth(base({title:"Design React UI",description:"Design and build a React UI",required_capabilities:undefined}));
if((ui.skill_recommendations||[]).length && ui.executor_truth==="PROVEN") throw new Error("SKILL_PROMOTED_EXECUTOR");

if(!sourceText.includes('allowed_operations')||!sourceText.includes('"claim"')||!sourceText.includes('"submit"')||!sourceText.includes('value_transfer')||!sourceText.includes('x402_buy_side')) throw new Error("SIGNER_BOUNDARY_MISSING");
if(/name:\s*"(?:claim|sign|pay|withdraw|buy|sell|wallet)/i.test(sourceText)) throw new Error("PUBLIC_WRITE_MCP_ADDED");
if(!sourceText.includes("owner_funded_spend_usd: 0")||!sourceText.includes("out_of_pocket_spend_usd: 0")) throw new Error("OWNER_SPEND_ZERO_INVARIANT_MISSING");

const claimJournal=sourceText.indexOf('await this.journalPendingIntent(opp,runtime,"claim")');
const claimWrite=sourceText.indexOf('await this.acquireExecutionSource(opp, runtime)',claimJournal);
if(claimJournal<0||claimWrite<0||claimJournal>claimWrite) throw new Error("CLAIM_INTENT_NOT_JOURNALED_BEFORE_WRITE");
const submitJournal=sourceText.indexOf('await this.journalPendingIntent(opp,runtime,"submit")');
const submitWrite=sourceText.indexOf('await this.submitExecutionSource(opp, artifacts, runtime)',submitJournal);
if(submitJournal<0||submitWrite<0||submitJournal>submitWrite) throw new Error("SUBMIT_INTENT_NOT_JOURNALED_BEFORE_WRITE");
if(!sourceText.includes('pendingExisting?.state==="WRITE_UNCERTAIN"')||!sourceText.includes('WRITE_UNCERTAIN_READBACK_ONLY')) throw new Error("WRITE_UNCERTAIN_NOT_BLOCKING_RETRY");
if((sourceText.match(/reconcileUncertainWrites\(\)/g)||[]).length<3) throw new Error("UNCERTAIN_READBACK_NOT_WIRED_TO_RECOVERY");
if(!sourceText.includes("money_path: moneyPath")) throw new Error("MONEY_PATH_NOT_EXPOSED_IN_STATUS");
if(!sourceText.includes('submissionId===String(runtime.submission_id) && taskId===String(runtime.task_id)')) throw new Error("HANSA_SETTLEMENT_NOT_EXACT_TASK_AND_SUBMISSION");
if(!sourceText.includes('registerSettlementRef(settlementReceipt,oppId)')) throw new Error("SETTLEMENT_REF_NOT_DEDUPED");
if(!sourceText.includes('syncHumanGatePendingV1(dedup)')||!sourceText.includes('state:"WAITING_HUMAN"')) throw new Error("HUMAN_GATE_NOT_DURABLE");

const pool=mod.sourceEvidenceBundleV1(base({title:"Quantum-Safe Bitcoin: share 199 USDC for verified Yukon improvements",description:"Share 199 USDC among verified improvements",estimated_net_usd:184.075,payout_amount:199}),{fetched:true,published:true});
if(mod.economicTruthV1(pool).expected_realized_usd!==null) throw new Error("SHARED_POOL_FALSE_INDIVIDUAL_EXPECTATION");

console.log("ORDER059_SOURCE_TRUTH=PASS");
console.log("ORDER059_PENDING_WORK=PASS");
console.log("ORDER059_SETTLEMENT_TRUTH=PASS");
console.log("ORDER059_WORKER_CONTRACT=PASS");
console.log("ORDER059_BOUNDARIES=PASS");
console.log("ORDER059_SHARED_POOL_TRUTH=PASS");
console.log("PRODUCTION_MUTATION_IN_TEST=0");
