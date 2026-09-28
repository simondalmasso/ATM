import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {pathToFileURL,fileURLToPath} from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const sourcePath=path.join(here,"ATM-ORDER034-ACTIVE-MAIN-READONLY.js");
const sourceText=fs.readFileSync(sourcePath,"utf8");

for(const symbol of ["SYSTEM_ONE_PROVIDER_REGISTRY_V1","EXTERNAL_CAPABILITY_CANDIDATES_V1","WORKER_PROVEN_REGISTRY_V1"]){
  if(!sourceText.includes(symbol)) throw new Error("ORDER060_SYMBOL_MISSING_"+symbol);
}

let code=sourceText.replace('import { DurableObject } from "cloudflare:workers";','class DurableObject { constructor(ctx,env){ this.ctx=ctx; this.env=env; } }');
code+='\nexport { SYSTEM_ONE_PROVIDER_REGISTRY_V1, EXTERNAL_CAPABILITY_CANDIDATES_V1, WORKER_PROVEN_REGISTRY_V1 };\n';
const tmp=path.join(os.tmpdir(),`atm-order060-${process.pid}-${Date.now()}.mjs`);
fs.writeFileSync(tmp,code,"utf8");
const mod=await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);

const providers=mod.SYSTEM_ONE_PROVIDER_REGISTRY_V1;
for(const id of ["JULIA_1","LAYA","LEV","JEV"]){
  const x=providers[id];
  if(!x) throw new Error("SYSTEM_ONE_PROVIDER_MISSING_"+id);
  if(x.proven!==false||x.runtime_mounted!==false||x.hard_gate_authority!==false) throw new Error("SYSTEM_ONE_FALSE_PROMOTION_"+id);
  if(x.max_owner_cost_usd!==0) throw new Error("SYSTEM_ONE_OWNER_COST_NOT_ZERO_"+id);
  if(x.owner_pc_allowed!==false) throw new Error("OWNER_PC_RUNTIME_NOT_BLOCKED_"+id);
  if(!["NO_DIRECT_RUNTIME","REMOTE_CALL_ONLY"].includes(x.cloudflare_worker_fit)) throw new Error("CLOUDFLARE_FIT_MISSING_"+id);
  if(x.authority!=="ADVISORY_ONLY") throw new Error("SYSTEM_ONE_AUTHORITY_WIDENED_"+id);
}
if(providers.JULIA_1.host_requirement!=="EXTERNAL_NON_OWNER_CPU_OR_BROWSER_ONNX") throw new Error("JULIA_HOST_BOUNDARY_MISSING");
if(providers.JULIA_1.protocol!=="TYPED_DECISION_OPTIONS") throw new Error("JULIA_PROTOCOL_MISSING");
if(!String(providers.JULIA_1.model||"").includes("Julia-1")) throw new Error("JULIA_MODEL_ID_MISSING");
if(providers.LAYA.direct_policy_role!=="KILLED") throw new Error("LAYA_PRIOR_KILL_NOT_PRESERVED");
if(providers.LEV.protocol!=="/v1/systemone"||providers.LEV.local_requirements?.cuda_realtime!==true) throw new Error("LEV_BOUNDARY_MISSING");
if(providers.JEV.provider_kind!=="REMOTE_COMPATIBLE_PROTOCOL"||providers.JEV.zero_cost_proven!==false||providers.JEV.cloudflare_worker_fit!=="REMOTE_CALL_ONLY") throw new Error("JEV_COST_FAIL_CLOSED_MISSING");

const candidates=mod.EXTERNAL_CAPABILITY_CANDIDATES_V1;
for(const id of ["DCP","SKILLOPT","OPENSCIENCE"]){
  const x=candidates[id];
  if(!x) throw new Error("EXTERNAL_CANDIDATE_MISSING_"+id);
  if(x.proven!==false||x.runtime_mounted!==false||x.max_owner_cost_usd!==0) throw new Error("EXTERNAL_CANDIDATE_FALSE_PROMOTION_"+id);
  if(x.owner_pc_allowed!==false||x.cloudflare_worker_fit!=="NO_DIRECT_RUNTIME") throw new Error("EXTERNAL_CANDIDATE_OWNER_PC_OR_CF_FIT_"+id);
  if(x.authority?.spend!==false||x.authority?.financial_mutation!==false||x.authority?.settlement!==false||x.authority?.policy_override!==false) throw new Error("EXTERNAL_CANDIDATE_AUTHORITY_WIDENED_"+id);
}
if(candidates.DCP.value_unit!=="DCC"||candidates.DCP.count_as_paid_usd!==false) throw new Error("DCP_DCC_FALSE_USD_EARNINGS");
if(candidates.DCP.host_requirement!=="EXTERNAL_NON_OWNER_NODE_PLUS_DCP_EVALUATOR") throw new Error("DCP_HOST_REQUIREMENT_MISSING");
if(!candidates.DCP.blockers.includes("DCC_TO_USD_SETTLEMENT_NOT_PROVEN")) throw new Error("DCP_SETTLEMENT_FAIL_CLOSED_MISSING");
if(candidates.SKILLOPT.role!=="OFFLINE_SKILL_OPTIMIZER"||candidates.SKILLOPT.can_promote_executor!==false||candidates.SKILLOPT.held_out_validation_required!==true) throw new Error("SKILLOPT_AUTHORITY_MISSING");
if(candidates.OPENSCIENCE.role!=="EXTERNAL_SCIENTIFIC_EXECUTOR_CANDIDATE"||candidates.OPENSCIENCE.allowed_cost_mode!=="EXTERNAL_ZERO_COST_HOST_WITH_LOCAL_MODEL_COMPUTE_ONLY") throw new Error("OPENSCIENCE_ZERO_COST_BOUNDARY_MISSING");
if(!candidates.OPENSCIENCE.blocked_routes.includes("ACE_WALLET")||!candidates.OPENSCIENCE.blocked_routes.includes("PAID_PROVIDER_API")||!candidates.OPENSCIENCE.blocked_routes.includes("PAID_REMOTE_COMPUTE")) throw new Error("OPENSCIENCE_PAID_ROUTES_NOT_BLOCKED");

for(const id of ["DCP","OPENSCIENCE"]){
  const w=mod.WORKER_PROVEN_REGISTRY_V1[id];
  if(!w||w.proven!==false||w.max_owner_cost_usd!==0) throw new Error("WORKER_REGISTRY_DEFAULT_NOT_FAIL_CLOSED_"+id);
}
if(mod.WORKER_PROVEN_REGISTRY_V1.SKILLOPT) throw new Error("SKILLOPT_FALSELY_REGISTERED_AS_EXECUTOR");

if(!sourceText.includes("system_one_providers:SYSTEM_ONE_PROVIDER_REGISTRY_V1")) throw new Error("SYSTEM_ONE_NOT_SURFACED_IN_STATUS");
if(!sourceText.includes("external_capability_candidates:EXTERNAL_CAPABILITY_CANDIDATES_V1")) throw new Error("EXTERNAL_CANDIDATES_NOT_SURFACED_IN_STATUS");
if(/name:\s*"(?:dcp_run|dcp_submit|skillopt_run|openscience_run)"/i.test(sourceText)) throw new Error("PUBLIC_MUTATION_TOOL_ADDED");
if(!sourceText.includes("max_owner_cost_usd:0")) throw new Error("OWNER_SPEND_ZERO_CONTRACT_MISSING");

console.log("ORDER060_SYSTEM_ONE_REGISTRY=PASS");
console.log("ORDER060_DCP_CONTRACT=PASS");
console.log("ORDER060_SKILLOPT_CONTRACT=PASS");
console.log("ORDER060_OPENSCIENCE_CONTRACT=PASS");
console.log("ORDER060_WORKER_DEFAULTS_FAIL_CLOSED=PASS");
console.log("ORDER060_PUBLIC_READ_ONLY_BOUNDARY=PASS");
console.log("PRODUCTION_MUTATION_IN_TEST=0");
