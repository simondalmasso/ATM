import path from "node:path";
import {pathToFileURL,fileURLToPath} from "node:url";

const expected="480d1965c4ae528af1be1680df7e1dc3fbedec21";
const oldSha="807c4dc618019014dab576210ea6ec5c616ba7fd";
const overrideId="16151a9c-908e-405d-8519-4bfc3e1302fb";
process.env.BASE_URL="https://atm-smoke.test";
process.env.EXPECTED_SHA=expected;
process.env.VERSION_OVERRIDE_ID=overrideId;

const originalFetch=globalThis.fetch;
const originalSetTimeout=globalThis.setTimeout;
let healthCalls=0;
let overrideHeaders=0;
globalThis.setTimeout=(fn,_ms,...args)=>originalSetTimeout(fn,0,...args);

function json(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json"}});
}
globalThis.fetch=async (input,options={})=>{
  const url=String(input);
  const h=options?.headers?.["Cloudflare-Workers-Version-Overrides"];
  if(h===`atm="${overrideId}"`) overrideHeaders++;
  if(url.includes("/health")){
    healthCalls++;
    const git_sha=healthCalls===1?oldSha:expected;
    return json({ok:true,git_sha,order:"ATM-ORDER-034",runtime:"RUNNING",ai_binding:true,durable_object:true,taskmarket_signer_binding:true,execution_enabled:true});
  }
  if(url.includes("/api/status")){
    return json({ok:true,order:"ATM-ORDER-034",zero_spend:{out_of_pocket_spend_usd:0},payment_capabilities:{policy:{owner_funded_spend_usd:0}}});
  }
  if(url.endsWith("/mcp")){
    const body=JSON.parse(options.body||"{}");
    if(body.method==="server/discover") return json({jsonrpc:"2.0",id:body.id,result:{supportedVersions:["2026-07-28"]}});
    if(body.method==="tools/list") return json({jsonrpc:"2.0",id:body.id,result:{tools:[
      "atm_status","list_opportunities","mcp_status","research_zero_cost_catalog","finance_zero_cost_catalog",
      "design_zero_cost_catalog","skill_list","skill_route","skill_get"
    ].map(name=>({name}))}});
  }
  throw new Error("UNEXPECTED_URL:"+url);
};

try{
  const here=path.dirname(fileURLToPath(import.meta.url));
  await import(pathToFileURL(path.join(here,"order051-smoke.mjs")).href+"?retrytest="+Date.now());
  if(healthCalls<2) throw new Error("WRONG_SHA_WAS_NOT_RETRIED");
  if(overrideHeaders<healthCalls) throw new Error("VERSION_OVERRIDE_HEADER_NOT_PRESERVED_ON_RETRY");
  console.log("ORDER054_OVERRIDE_PROPAGATION_RETRY=PASS");
  console.log("ORDER054_OVERRIDE_HEADER_PRESERVED=PASS");
} finally {
  globalThis.fetch=originalFetch;
  globalThis.setTimeout=originalSetTimeout;
}
