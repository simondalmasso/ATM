import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {pathToFileURL,fileURLToPath} from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const sourcePath=path.join(here,"ATM-ORDER034-ACTIVE-MAIN-READONLY.js");
const sourceText=fs.readFileSync(sourcePath,"utf8");

for (const symbol of [
  "GALAXY_CAPABILITY_TAXONOMY",
  "EXECUTOR_CAPABILITIES",
  "GALAXY_PASSIVE_SOURCES",
  "GALAXY_ADVISORY_TECH",
  "classifyRequiredCapabilities",
  "executorCapabilityTruth",
  "applyGalaxyCapabilityTruth"
]) {
  if (!sourceText.includes(symbol)) throw new Error("GALAXY_CAPABILITY_TAXONOMY_NOT_IMPLEMENTED");
}

let code=sourceText.replace('import { DurableObject } from "cloudflare:workers";','class DurableObject { constructor(ctx,env){ this.ctx=ctx; this.env=env; } }');
code+='\nexport { GALAXY_CAPABILITY_TAXONOMY, EXECUTOR_CAPABILITIES, GALAXY_PASSIVE_SOURCES, GALAXY_ADVISORY_TECH, classifyRequiredCapabilities, executorCapabilityTruth, applyGalaxyCapabilityTruth, galaxyPolicyBlockers, executionCandidateAdmitted };\n';
const tmp=path.join(os.tmpdir(),`atm-order055-${process.pid}-${Date.now()}.mjs`);
fs.writeFileSync(tmp,code,"utf8");
const mod=await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);

const required=[
  "TEXT_RESEARCH","CODE","OSS_FIX","DATA","UI_DESIGN","WEB_UI","ANIMATION","VIDEO","PDF","EMAIL",
  "DIAGRAM","SCIENTIFIC","BROWSER","DESKTOP","API_HTTP","GITHUB","COMPUTE_CPU"
];
for(const x of required) if(!mod.GALAXY_CAPABILITY_TAXONOMY.includes(x)) throw new Error("CAPABILITY_MISSING_"+x);

const classify=(title,description="",capability_class="PURE_LLM")=>mod.classifyRequiredCapabilities({title,description,capability_class,blockers:[],artifact_profile:{supported:true}});
const has=(arr,...xs)=>xs.every(x=>arr.includes(x));

if(!has(classify("Research and summarize scientific literature"),"TEXT_RESEARCH","SCIENTIFIC")) throw new Error("TEXT_SCIENTIFIC_CLASSIFICATION_FAILED");
if(!has(classify("Fix GitHub OSS issue and open pull request"),"CODE","OSS_FIX","GITHUB")) throw new Error("OSS_GITHUB_CLASSIFICATION_FAILED");
if(!has(classify("Analyze CSV data with SQL"),"DATA")) throw new Error("DATA_CLASSIFICATION_FAILED");
if(!has(classify("Design an animated React dashboard UI"),"UI_DESIGN","WEB_UI","ANIMATION")) throw new Error("UI_CLASSIFICATION_FAILED");
if(!has(classify("Produce a Remotion video"),"VIDEO")) throw new Error("VIDEO_CLASSIFICATION_FAILED");
if(!has(classify("Create PDF report and email it"),"PDF","EMAIL")) throw new Error("PDF_EMAIL_CLASSIFICATION_FAILED");
if(!has(classify("Draw an architecture flowchart diagram"),"DIAGRAM")) throw new Error("DIAGRAM_CLASSIFICATION_FAILED");
if(!has(classify("Navigate browser and fill a web form"),"BROWSER")) throw new Error("BROWSER_CLASSIFICATION_FAILED");
if(!has(classify("Automate a Windows desktop app"),"DESKTOP")) throw new Error("DESKTOP_CLASSIFICATION_FAILED");
if(!has(classify("Call REST API endpoint","", "HTTP_TOOL"),"API_HTTP")) throw new Error("API_CLASSIFICATION_FAILED");
if(!has(classify("Run CPU compute simulation"),"COMPUTE_CPU")) throw new Error("COMPUTE_CLASSIFICATION_FAILED");

const base=(over={})=>({
  opportunity_id:"TEST:1",raw_id:"1",source:"DAYDREAMS",title:"Research task",description:"Write a short research report",
  source_status:"open",estimated_net_usd:150,capability_class:"PURE_LLM",artifact_profile:{supported:true},
  eligibility:{terms_allow_automation:true,payout_path_known:true,required_fields_available:true,open_now:true,owner_spend_zero:true,newcomer_access_proven:true,argentina_or_global_eligibility_proven:true,exact_deliverable_and_acceptance_proven:true,competition_known:true,deadline_known:true},
  economics:{estimated_task_cost_usd:0,task_execution_spend_required:false},blockers:[],ai_executability:"AI_EXECUTABLE",
  automatic_action_level:"RUNTIME_PLAN_VERIFY_SUBMIT_ZERO_COST",...over
});

const textOpp=mod.applyGalaxyCapabilityTruth(base());
if(textOpp.executor_truth!=="PROVEN") throw new Error("TEXT_EXECUTOR_NOT_PROVEN");
if(textOpp.ai_executability!=="AI_EXECUTABLE") throw new Error("GALAXY_REGRESSED_PROVEN_TEXT_EXECUTION");

const unknownSourceTruth=mod.applyGalaxyCapabilityTruth(base({
  source:"AGENTHANSA",
  deadline:null,
  eligibility:{terms_allow_automation:true,payout_path_known:true,required_fields_available:true,open_now:true,owner_spend_zero:true}
}));
if(unknownSourceTruth.eligibility?.source_truth_proven!==false) throw new Error("UNKNOWN_SOURCE_TRUTH_TREATED_AS_YES");
if(unknownSourceTruth.galaxy_status==="ACTIVE") throw new Error("UNKNOWN_SOURCE_FIELDS_PROMOTED_ACTIVE");
if(unknownSourceTruth.ai_executability==="AI_EXECUTABLE") throw new Error("UNKNOWN_SOURCE_FIELDS_LEFT_EXECUTABLE");
if(mod.executionCandidateAdmitted(unknownSourceTruth,{AGENTHANSA_API_KEY:"test"})) throw new Error("UNKNOWN_SOURCE_FIELDS_ADMITTED");

for(const [cap,title] of [
  ["VIDEO","Produce a Remotion video"],
  ["UI_DESIGN","Design a polished UI"],
  ["BROWSER","Navigate a browser checkout form"],
  ["DESKTOP","Automate Windows desktop settings"]
]){
  const opp=mod.applyGalaxyCapabilityTruth(base({title,description:title}));
  if(!opp.required_capabilities.includes(cap)) throw new Error(cap+"_NOT_TAGGED");
  if(opp.ai_executability!=="BLOCKED") throw new Error(cap+"_WITHOUT_EXECUTOR_AUTO_ELIGIBLE");
  if(opp.executor_truth==="PROVEN") throw new Error(cap+"_FALSE_EXECUTOR_PROOF");
}

const ui=mod.applyGalaxyCapabilityTruth(base({title:"Design an animated React UI",description:"Build and animate a responsive React interface"}));
if(!(ui.skill_recommendations||[]).length) throw new Error("SKILL_ROUTER_NOT_RECOMMENDING");
if(ui.executor_truth==="PROVEN"||ui.ai_executability!=="BLOCKED") throw new Error("SKILL_AVAILABILITY_CONFUSED_WITH_EXECUTOR");

const economicallyBlocked=base({title:"Research",blockers:["BLOCKED_OWNER_SPEND"],ai_executability:"BLOCKED"});
const advised=mod.applyGalaxyCapabilityTruth(economicallyBlocked,{provider:"LAYA",decision:"PROMOTE",required_capabilities:["TEXT_RESEARCH"],confidence:0.99});
if(advised.ai_executability!=="BLOCKED") throw new Error("LAYA_PROMOTED_BLOCKED_OPPORTUNITY");
if(!advised.blockers.includes("BLOCKED_OWNER_SPEND")) throw new Error("LAYA_REMOVED_HARD_BLOCKER");
if(advised.advisory?.authority!=="ADVISORY_ONLY") throw new Error("LAYA_AUTHORITY_NOT_BOUNDED");

const advisoryAdds=mod.applyGalaxyCapabilityTruth(base({title:"Create artifact",description:"Create artifact"}),{provider:"SYSTEM2",required_capabilities:["VIDEO"],confidence:0.8});
if(!advisoryAdds.required_capabilities.includes("VIDEO")) throw new Error("ADVISORY_CAPABILITY_HINT_NOT_ADDITIVE");
if(advisoryAdds.ai_executability!=="BLOCKED") throw new Error("ADVISORY_HINT_BYPASSED_EXECUTOR_TRUTH");

for(const text of [
  "Trade crypto for profit",
  "Sports betting strategy and wager execution",
  "Stake 20 USDC to claim the task",
  "Pay gas fee before submission",
  "Requires premium paid API subscription"
]){
  const blockers=mod.galaxyPolicyBlockers(text,"");
  if(!blockers.length) throw new Error("PROHIBITED_OR_SPEND_WORK_NOT_BLOCKED:"+text);
  const opp=mod.applyGalaxyCapabilityTruth(base({title:text,description:text,blockers,ai_executability:"BLOCKED"}));
  if(opp.ai_executability!=="BLOCKED") throw new Error("POLICY_BLOCK_BYPASSED:"+text);
}

const passive=Object.fromEntries(mod.GALAXY_PASSIVE_SOURCES.map(x=>[x.id,x]));
if(passive.OPENTASK?.state!=="WATCH_READ_ONLY_VERIFY"||passive.OPENTASK?.runtime_source!==false) throw new Error("OPENTASK_NOT_PASSIVE");
if(passive.OKX_AI?.state!=="WATCH_ONLY"||passive.OKX_AI?.runtime_source!==false) throw new Error("OKX_NOT_PASSIVE");
if(passive.CLAW_EARN?.state!=="REJECT_OWNER_SPEND"||passive.CLAW_EARN?.auto_eligible!==false) throw new Error("CLAW_EARN_NOT_REJECTED");
if(passive.XENTO?.state!=="WATCH_ONLY"||passive.XENTO?.runtime_source!==false) throw new Error("XENTO_PROMOTED");
if(passive.OPIRE?.state!=="WATCH_READ_ONLY_VERIFY"||passive.OPIRE?.runtime_source!==false) throw new Error("OPIRE_NOT_PASSIVE");
if(passive.ALGORA?.state!=="WATCH_READ_ONLY_VERIFY"||passive.ALGORA?.runtime_source!==false) throw new Error("ALGORA_NOT_PASSIVE");

if(passive.MQL5_K2?.state!=="PRIMARY_EXTERNAL_EXPERIMENT"||passive.MQL5_K2?.current_order_mutation!==false) throw new Error("MQL5_K2_NOT_PRESERVED");

const tech=Object.fromEntries(mod.GALAXY_ADVISORY_TECH.map(x=>[x.id,x]));
if(tech.LAYA?.authority!=="ADVISORY_ONLY"||tech.LAYA?.hard_gate_authority!==false) throw new Error("LAYA_HARD_AUTHORITY_ENABLED");
if(tech.JEV_ULTRAFAST?.runtime_mounted!==false) throw new Error("JEV_RUNTIME_MOUNTED");
if(tech.AGENT_DESKTOP?.executor_status!=="WATCH_EXECUTOR") throw new Error("AGENT_DESKTOP_FALSE_EXECUTOR");
if(tech.JSON_RENDER?.runtime_mounted!==false) throw new Error("JSON_RENDER_MOUNTED_IN_WORKER");

if(mod.executionCandidateAdmitted({...textOpp,source:"SUPERTEAM"},{})) throw new Error("DISCOVER_ONLY_SOURCE_EXECUTION_REGRESSION");

const legacyMissingExecutor={...textOpp,source:"AGENTHANSA"};
delete legacyMissingExecutor.executor_truth;
if(mod.executionCandidateAdmitted(legacyMissingExecutor,{AGENTHANSA_API_KEY:"test"})) throw new Error("MISSING_EXECUTOR_TRUTH_DID_NOT_FAIL_CLOSED");

for(const text of ["Trade stocks for profit","Buy and sell equities","Place a bet on a football match"]){
  const blockers=mod.galaxyPolicyBlockers(text,"");
  if(!blockers.includes("TRADING_OR_GAMBLING_PROHIBITED")) throw new Error("DIRECT_TRADE_BET_NOT_BLOCKED:"+text);
}

for(const text of ["No stake or gas fee is required","Write a bond market analysis"]){
  const blockers=mod.galaxyPolicyBlockers(text,"");
  if(blockers.some(x=>["CAPITAL_REQUIRED","BLOCKED_OWNER_SPEND","GAS_OR_NETWORK_FEE_REQUIRED"].includes(x))) throw new Error("NEGATED_OR_SUBJECT_SPEND_FALSE_POSITIVE:"+text);
}

const staleZero=mod.applyGalaxyCapabilityTruth(base({
  title:"Stake 20 USDC to claim the task",
  description:"Stake 20 USDC to claim the task",
  blockers:["BLOCKED_OWNER_SPEND","CAPITAL_REQUIRED"],
  eligibility:{terms_allow_automation:true,payout_path_known:true,required_fields_available:true,open_now:true,owner_spend_zero:true}
}));
if(staleZero.owner_spend?.zero!==false || staleZero.eligibility?.owner_spend_zero!==false) throw new Error("EXPLICIT_SPEND_DID_NOT_OVERRIDE_STALE_ZERO_COST");

const dataSubject=classify("Write an article about data privacy");
if(dataSubject.includes("DATA")) throw new Error("DATA_RESEARCH_SUBJECT_FALSE_EXECUTOR");
const webSubject=classify("Research website accessibility standards");
if(webSubject.includes("WEB_UI")) throw new Error("WEB_RESEARCH_SUBJECT_FALSE_EXECUTOR");

const fakeHttp=mod.applyGalaxyCapabilityTruth(base({
  title:"Call REST API endpoint and report status",
  description:"Call REST API endpoint and report status",
  capability_class:"PURE_LLM"
}));
if(!fakeHttp.required_capabilities.includes("API_HTTP")) throw new Error("API_HTTP_REQUIREMENT_NOT_DETECTED");
if(fakeHttp.executor_truth==="PROVEN" || fakeHttp.ai_executability!=="BLOCKED") throw new Error("API_HTTP_PROVEN_WITHOUT_HTTP_EXECUTION_PATH");

if((sourceText.match(/galaxyNormalized\s*=\s*applyGalaxyCapabilityTruth/g)||[]).length<2) throw new Error("FRESH_READBACK_GALAXY_RECLASSIFICATION_MISSING");

for(const id of ["GENOFFICE","BROWSER_USE","AGENT_REACH","WEKNORA","GRAPHITI","COGNEE","OPEN_WEBUI","PAGEINDEX","QWEN_AUDIO_AGENT","OPENMAIC"]){
  if(!tech[id]) throw new Error("NEW_UPSTREAM_CLASSIFICATION_MISSING_"+id);
  if(tech[id].runtime_mounted!==false) throw new Error("NEW_UPSTREAM_FALSELY_MOUNTED_"+id);
}
if(tech.BROWSER_USE?.executor_status!=="WATCH_EXECUTOR") throw new Error("BROWSER_USE_FALSE_EXECUTOR_STATUS");

for(const text of ["Buy Bitcoin and hold it","Sell stocks for profit","Invest in cryptocurrency"]){
  const blockers=mod.galaxyPolicyBlockers(text,"");
  if(!blockers.includes("TRADING_OR_GAMBLING_PROHIBITED")) throw new Error("SINGULAR_TRADE_COMMAND_NOT_BLOCKED:"+text);
}

for(const text of ["You must stake 20 USDC","Pay a 5 USDC fee to complete this work","Deposit 20 USDC to get started","Purchase 10 API credits"]){
  const blockers=mod.galaxyPolicyBlockers(text,"");
  if(!blockers.includes("BLOCKED_OWNER_SPEND")) throw new Error("DIRECT_SPEND_MANDATE_NOT_BLOCKED:"+text);
}

for(const text of ["Write an article about Java history","Write documentation comparing Python and Rust"]){
  const caps=classify(text);
  if(caps.includes("CODE")) throw new Error("PROGRAMMING_LANGUAGE_SUBJECT_FALSE_CODE:"+text);
}

const unknownSpend=mod.applyGalaxyCapabilityTruth({
  ...textOpp,
  source:"AGENTHANSA",
  owner_spend:undefined,
  eligibility:{...textOpp.eligibility,owner_spend_zero:undefined},
  economics:{},
  blockers:[]
});
if(unknownSpend.owner_spend?.known!==false) throw new Error("UNKNOWN_SPEND_FIXTURE_NOT_UNKNOWN");
if(mod.executionCandidateAdmitted(unknownSpend,{AGENTHANSA_API_KEY:"test"})) throw new Error("UNKNOWN_OWNER_SPEND_ADMITTED");
if(!/galaxyNormalized\.owner_spend\?\.known === true && galaxyNormalized\.owner_spend\?\.zero === true/.test(sourceText)) throw new Error("FRESH_HANSA_ZERO_SPEND_GATE_MISSING");
if(/name:\s*"(?:claim|sign|pay|withdraw|buy|sell|wallet)/i.test(sourceText)) throw new Error("PUBLIC_MUTATION_TOOL_ADDED");

console.log("ORDER055_CAPABILITY_TAXONOMY=PASS");
console.log("ORDER055_SKILL_NE_EXECUTOR=PASS");
console.log("ORDER055_ADVISORY_CANNOT_PROMOTE=PASS");
console.log("ORDER055_PROHIBITED_ZERO_SPEND_GATES=PASS");
console.log("ORDER055_PASSIVE_SOURCE_MATRIX=PASS");
console.log("ORDER055_PUBLIC_READ_ONLY_BOUNDARY=PASS");
console.log("PRODUCTION_MUTATION_IN_TEST=0");
