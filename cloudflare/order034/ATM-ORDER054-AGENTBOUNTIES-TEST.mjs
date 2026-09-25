import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const src=path.join(here,'ATM-ORDER034-ACTIVE-MAIN-READONLY.js');
const tmp=path.join(os.tmpdir(),`atm-order054-agentbounties-${process.pid}-${Date.now()}.mjs`);
const sourceText=fs.readFileSync(src,'utf8');
if(!sourceText.includes('AGENTBOUNTIES')) throw new Error('AGENTBOUNTIES_SOURCE_NOT_REGISTERED');
let code=sourceText.replace('import { DurableObject } from "cloudflare:workers";','class DurableObject { constructor(ctx,env){} }');
code+='\nexport { agentBountiesEconomics, agentBountiesCanonicalPaid, normalize, discoverSource };\n';
fs.writeFileSync(tmp,code,'utf8');
process.on('exit',()=>{try{fs.unlinkSync(tmp)}catch{}});
const mod=await import(pathToFileURL(tmp).href+'?v='+Date.now());

const usdc=(amount)=>({amount:String(Math.round(Number(amount)*1e6)),currency:'USDC',decimals:6});
const base=(id='ab-1')=>({
  bounty_id:id,
  bounty_contract:'0x'+id.padEnd(40,'1').slice(0,40),
  title:'Produce a deterministic source-backed artifact',
  description:'Return one JSON artifact matching the committed acceptance criteria.',
  status:'claimable',
  work_state:'open',
  claimable:true,
  funded:true,
  funding_complete:true,
  terms_valid:true,
  verification_ready:true,
  automation_allowed:true,
  newcomer_access:true,
  global_eligibility:true,
  deliverable:'One UTF-8 JSON artifact',
  acceptance_criteria:['Schema valid','Evidence reproducible'],
  reward:usdc(125),
  bond:usdc(0),
  cash_economics:{
    solver_reward:usdc(125),
    required_external_spend:usdc(0),
    gas_network_fee:usdc(0),
    protocol_fee:usdc(0),
    paid_api_compute:usdc(0),
    subscription:usdc(0),
    card_hold:usdc(0)
  },
  deadline:'2099-01-01T00:00:00Z'
});

const positiveBond=base('ab-bond');
positiveBond.bond=usdc(0.1);
const bondOpp=mod.normalize('AGENTBOUNTIES',positiveBond);
if(!bondOpp.blockers.includes('CAPITAL_REQUIRED')||!bondOpp.blockers.includes('BLOCKED_OWNER_SPEND')) throw new Error('POSITIVE_BOND_NOT_BLOCKED');
if(bondOpp.ai_executability!=='BLOCKED') throw new Error('POSITIVE_BOND_AUTO_ELIGIBLE');

const unknown=base('ab-unknown');
delete unknown.bond;
delete unknown.cash_economics.gas_network_fee;
const unknownOpp=mod.normalize('AGENTBOUNTIES',unknown);
if(unknownOpp.economics.owner_spend_known!==false) throw new Error('UNKNOWN_OWNER_SPEND_NOT_FAIL_CLOSED');
if(!unknownOpp.blockers.includes('BLOCKED_OWNER_SPEND')) throw new Error('UNKNOWN_OWNER_SPEND_NOT_BLOCKED');

const zero=base('ab-zero');
const zeroOpp=mod.normalize('AGENTBOUNTIES',zero);
if(zeroOpp.economics.owner_spend_usd!==0||zeroOpp.economics.owner_spend_zero!==true) throw new Error('ZERO_SPEND_NOT_PROVEN');
if(zeroOpp.blockers.some(x=>['CAPITAL_REQUIRED','BLOCKED_OWNER_SPEND','TASK_EXECUTION_SPEND_REQUIRED'].includes(x))) throw new Error('ZERO_SPEND_FALSE_ECONOMIC_BLOCK');
if(!zeroOpp.blockers.includes('DISCOVERY_ONLY_NO_EXECUTION_ADAPTER')||zeroOpp.ai_executability!=='BLOCKED') throw new Error('DISCOVERY_ONLY_BOUNDARY_BROKEN');

const notClaimable=base('ab-funded');
notClaimable.status='funded'; notClaimable.claimable=false;
const fundedOpp=mod.normalize('AGENTBOUNTIES',notClaimable);
if(!fundedOpp.blockers.includes('TASK_STATE_NOT_WRITABLE')) throw new Error('FUNDED_NOT_CLAIMABLE_ADMITTED');

const stale=base('ab-stale');
stale.deadline='2020-01-01T00:00:00Z';
if(!mod.normalize('AGENTBOUNTIES',stale).blockers.includes('TASK_EXPIRED')) throw new Error('STALE_DEADLINE_NOT_BLOCKED');

const canonical=mod.agentBountiesCanonicalPaid({canonical_events:[{event_name:'BountySettled',canonical:true,confirmed:true,transaction_hash:'0xabc'}]});
if(canonical.paid!==true||canonical.event_name!=='BountySettled') throw new Error('CANONICAL_SETTLEMENT_NOT_RECOGNIZED');
const competition=mod.agentBountiesCanonicalPaid({events:[{type:'CompetitionSettledV2',canonical:true,confirmed:true,tx_hash:'0xdef'}]});
if(competition.paid!==true) throw new Error('CANONICAL_COMPETITION_SETTLEMENT_NOT_RECOGNIZED');
const fake=mod.agentBountiesCanonicalPaid({status:'paid',transaction_hash:'0xfake',displayed_balance:'999'});
if(fake.paid!==false) throw new Error('NONCANONICAL_FAKE_PAID_ACCEPTED');

const originalFetch=globalThis.fetch;
const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
try{
  globalThis.fetch=async()=>response([]);
  const empty=await mod.discoverSource('AGENTBOUNTIES');
  if(!empty.state.running||empty.state.eligibility!=='DISCOVERY_OK_ZERO_RESULTS'||empty.state.result_count!==0) throw new Error('EMPTY_FEED_NOT_HEALTHY');

  globalThis.fetch=async()=>response([base('dup'),base('dup'),base('uniq')]);
  const dedup=await mod.discoverSource('AGENTBOUNTIES');
  if(!dedup.state.running||dedup.opportunities.length!==2||dedup.state.result_count!==2) throw new Error('DUPLICATE_IDS_NOT_DEDUPED');

  globalThis.fetch=async()=>response({},200);
  const malformed=await mod.discoverSource('AGENTBOUNTIES');
  if(malformed.state.running||malformed.state.eligibility!=='DISCOVERY_FAILED') throw new Error('MALFORMED_PAYLOAD_NOT_FAILED');

  globalThis.fetch=async()=>response({error:'upstream'},503);
  const unavailable=await mod.discoverSource('AGENTBOUNTIES');
  if(unavailable.state.running||unavailable.state.eligibility!=='DISCOVERY_FAILED') throw new Error('HTTP_5XX_NOT_FAILED');

  globalThis.fetch=async()=>{throw new DOMException('timeout','AbortError')};
  const timeout=await mod.discoverSource('AGENTBOUNTIES');
  if(timeout.state.running||timeout.state.eligibility!=='DISCOVERY_FAILED') throw new Error('TIMEOUT_NOT_FAILED');
} finally {
  globalThis.fetch=originalFetch;
}

if(/name:\s*"(?:agentbounties_claim|agentbounties_sign|agentbounties_pay|agentbounties_withdraw)"/i.test(sourceText)) throw new Error('PUBLIC_MUTATION_TOOL_ADDED');
console.log('AGENTBOUNTIES_EMPTY_FEED=PASS');
console.log('AGENTBOUNTIES_OWNER_SPEND_FAIL_CLOSED=PASS');
console.log('AGENTBOUNTIES_SETTLEMENT_TRUTH=PASS');
console.log('AGENTBOUNTIES_FAILURE_MODES=PASS');
console.log('AGENTBOUNTIES_DISCOVERY_ONLY=PASS');
console.log('PRODUCTION_MUTATION_IN_TEST=0');
