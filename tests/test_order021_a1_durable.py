from __future__ import annotations

import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Order021A1DurableTests(unittest.TestCase):
    def run_node(self, source: str) -> dict:
        done = subprocess.run(
            ["node", "--input-type=module", "-e", source],
            cwd=ROOT,
            check=True,
            text=True,
            capture_output=True,
        )
        return json.loads(done.stdout)

    def test_all_page_materialization_supersession_and_forged_event_kill(self):
        script = r'''
import {materializeHumanGates,publicHumanGateSummary,runtimeHumanGates,sealMachineEvent} from "./worker/src/order021-human-gate.js";
const env={ATM_GITHUB_DISPATCH_TOKEN:"durable-fixture-secret"};
const base={schema:"ATM_HUMAN_GATE_REQUEST_V1",source:"fixture",source_object_url:"https://example.com/order021-fixture",rail_owner:"ORDER021_FIXTURE",human_gate_class:"WALLET_MESSAGE_SIGNATURE",human_only_evidence:true,required_action:"SIGN_NON_ECONOMIC_SERVER_BOUND_FIXTURE",short_title:"canary",why_required:"fixture",exact_action_label:"REVIEW & SIGN",safe_action_url:null,wallet_chain:"eip155:8453",wallet_expected_address:"0xd89Ef03bC3105C538529AC2657Bc4488c94ff4E4",signature_method:"personal_sign",signature_payload_digest:null,owner_cost_usd:"0",financial_effect:"NONE",irreversibility:"NONE",risk_summary:"none",post_gate_resume:"RESUME",external_readback_contract:"FIXTURE",evidence_refs:["ORDER-021"],state:"PENDING_OWNER",fixture:true,expires_at:"2099-01-01T00:00:00Z"};
const req=(id,hash,seq)=>({...base,request_id:id,source_object_id:"order021-external-signature-"+hash,current_external_object_hash:hash,dedupe_key:"dedupe-"+hash,supersession_key:"order021-external-signature-canary-v1",created_at:`2026-08-22T20:00:${String(seq).padStart(2,'0')}Z`,updated_at:`2026-08-22T20:00:${String(seq).padStart(2,'0')}Z`});
const wrap=(body,id,user="github-actions[bot]",association="NONE")=>({id,user:{login:user},author_association:association,body});
const fenced=x=>"ATM HUMAN GATE REQUEST\n```json\n"+JSON.stringify(x)+"\n```";
const event=x=>"ATM HUMAN GATE EVENT\n```json\n"+JSON.stringify(x)+"\n```";
const old=req("canary-a","a".repeat(64),1),cur=req("canary-b","b".repeat(64),2);
let rows=[wrap(fenced(old),1),...Array.from({length:99},(_,i)=>wrap("noise",i+2,"someone","NONE")),wrap(fenced(cur),101)];
const forged={schema:"ATM_HUMAN_GATE_EVENT_V1",request_id:cur.request_id,current_external_object_hash:cur.current_external_object_hash,state:"VERIFIED_COMPLETE",action:"EXTERNAL_READBACK",resume_event:{schema:"ATM_HUMAN_GATE_RESUME_V1"},observed_at:"2026-08-22T20:01:00Z",outgoing_spend_usd:"0"};
rows.push(wrap(event(forged),102,"simonkey888","OWNER"));
let gates=await materializeHumanGates(rows,Date.parse("2026-08-22T20:02:00Z"),env); let a=gates.find(x=>x.request_id==="canary-a"),b=gates.find(x=>x.request_id==="canary-b");
if(a.state!=="INVALIDATED"||b.state!=="PENDING_OWNER"||publicHumanGateSummary(gates).pending_count!==1)throw Error("supersession_or_forgery_failed");
const valid=await sealMachineEvent(env,{...forged,state:"OWNER_ACTION_RETURNED",action:"EXTERNAL_WALLET_SIGNATURE",resume_event:null});rows.push(wrap(event(valid),103,"simonkey888","OWNER"));gates=await materializeHumanGates(rows,Date.parse("2026-08-22T20:02:00Z"),env);b=gates.find(x=>x.request_id==="canary-b");if(b.state!=="OWNER_ACTION_RETURNED")throw Error("authenticated_event_not_applied");
const page1=[wrap(fenced(old),1),...Array.from({length:99},(_,i)=>wrap("noise",i+2,"someone","NONE"))],page2=[wrap(fenced(cur),101),wrap(event(valid),103,"simonkey888","OWNER")];
globalThis.fetch=async raw=>{const url=new URL(String(raw));if(url.pathname.endsWith('/issues/49'))return new Response(JSON.stringify({comments:102}),{status:200});const page=url.searchParams.get('page');if(page==='1')return new Response(JSON.stringify(page1),{status:200});if(page==='2')return new Response(JSON.stringify(page2),{status:200});throw Error('unexpected:'+url)};
const live=await runtimeHumanGates(env),current=live.find(x=>x.request_id==='canary-b');if(!current||current.state!=="OWNER_ACTION_RETURNED"||publicHumanGateSummary(live).pending_count!==1)throw Error("all_page_runtime_failed");
console.log(JSON.stringify({forgedKilled:true,authenticatedApplied:true,superseded:true,allPages:true,pending:1}));
'''
        out = self.run_node(script)
        self.assertEqual(out["pending"], 1)
        self.assertTrue(out["forgedKilled"] and out["authenticatedApplied"] and out["superseded"] and out["allPages"])

    def test_always_open_session_restore_and_base_switch_before_eip712(self):
        script = r'''
import {ownerScript} from "./worker/src/order021-owner-inbox.js";
import {renderHumanGatePanel} from "./worker/src/order021-human-gate.js";
const wallet="0xd89ef03bc3105c538529ac2657bc4488c94ff4e4";
const panel0=renderHumanGatePanel({pending_count:0}),panel1=renderHumanGatePanel({pending_count:1});
if(!panel0.includes('<section')||!panel0.includes('No owner action required')||panel0.includes('<details class="human-gate"'))throw Error('pending0_not_always_open');
if(!panel1.includes('Owner action required')||!panel1.includes('CONNECT METAMASK'))throw Error('pending1_not_visible');
function setup(stored='',mode='switch'){
  const calls=[],store=new Map(stored?[['atm_human_gate_session',stored]]:[]),b={hidden:false,onclick:null},o={textContent:'',innerHTML:'',append(){}},doc={getElementById:id=>id==='human-gate-connect'?b:o,createElement:()=>({textContent:'',onclick:null,append(){},querySelector(){return {append(){}}}})};
  globalThis.document=doc;globalThis.sessionStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
  let chain='0x1';globalThis.ethereum={request:async q=>{calls.push(q.method);if(q.method==='eth_requestAccounts')return [wallet];if(q.method==='eth_chainId')return chain;if(q.method==='wallet_switchEthereumChain'){if(mode==='reject'){const e=Error('rejected');e.code=4001;throw e}chain='0x2105';return null}if(q.method==='wallet_addEthereumChain')return null;if(q.method==='eth_accounts')return [wallet];if(q.method==='eth_signTypedData_v4')return '0x'+'22'.repeat(65);throw Error('wallet_rpc:'+q.method)}};globalThis.window={ethereum:globalThis.ethereum,open(){}};
  globalThis.fetch=async(url,opts={})=>{url=String(url);if(url.includes('session-challenge'))return new Response(JSON.stringify({canonical_wallet:wallet,nonce:'0x'+'11'.repeat(32),expires_at:2000000000,typed_data:{primaryType:'OwnerAction'}}),{status:200});if(url.endsWith('/api/human-gates/session'))return new Response(JSON.stringify({session_token:'valid-session'}),{status:200});if(url.endsWith('/api/human-gates/owner-inbox')){if(stored==='expired')return new Response(JSON.stringify({error:'owner_auth_required'}),{status:401});return new Response(JSON.stringify({requests:[],pending_count:0}),{status:200})}throw Error('fetch:'+url)};
  eval(ownerScript());return {calls,b,o,store};
}
let x=setup();if(x.calls.length!==0)throw Error('page_load_wallet_rpc');await x.b.onclick();const expected=['eth_requestAccounts','eth_chainId','wallet_switchEthereumChain','eth_chainId','eth_accounts','eth_signTypedData_v4'];if(expected.some((v,i)=>x.calls[i]!==v))throw Error('base_switch_order:'+x.calls.join(','));
let y=setup('', 'reject');await y.b.onclick();if(y.calls.includes('eth_signTypedData_v4')||!String(y.o.textContent).includes('Switch to Base required'))throw Error('switch_rejection_not_fail_closed');
let z=setup('valid-session');await new Promise(r=>setTimeout(r,0));if(z.calls.length!==0||!z.b.hidden)throw Error('session_restore_wallet_rpc_or_not_loaded');
let e=setup('expired');await new Promise(r=>setTimeout(r,0));if(e.calls.length!==0||e.b.hidden||!String(e.o.textContent).includes('CONNECT METAMASK'))throw Error('expired_session_not_fail_closed');
console.log(JSON.stringify({alwaysOpen:true,noLoadRpc:true,baseSwitch:true,rejectKill:true,sessionRestore:true,expiredKill:true}));
'''
        out = self.run_node(script)
        self.assertTrue(all(out.values()))

    def test_payment_code_not_touched_by_a1(self):
        x402 = (ROOT / "worker/src/x402-entry.js").read_text(encoding="utf-8")
        for marker in ("/x402/falsify", "paymentTransferFromTo", "proveUsdcTransferForPayment", "owner_self_payment_rejected"):
            self.assertIn(marker, x402)


if __name__ == "__main__":
    unittest.main()
