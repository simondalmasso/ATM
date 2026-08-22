from __future__ import annotations

import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Order021ExternalSignatureTests(unittest.TestCase):
    def run_node(self, source: str) -> dict:
        completed = subprocess.run(
            ["node", "--input-type=module", "-e", source],
            cwd=ROOT,
            check=True,
            text=True,
            capture_output=True,
        )
        return json.loads(completed.stdout)

    def test_server_bound_review_and_security_kills(self):
        script = r'''
import {buildExternalSignatureReview,externalSignatureFixture,personalSignDigest,validateSubmissionShape} from "./worker/src/order021-external-signature.js";
const now=1900000000000, g=externalSignatureFixture(now), env={ATM_GIT_SHA:"11".repeat(20)};
const r=await buildExternalSignatureReview(g,env,now);
if(r.schema!=="ATM_EXTERNAL_SIGNATURE_REVIEW_V1"||r.method!=="personal_sign"||r.domain!=="https://atm.simondalmasso44.workers.dev"||r.chain_id!==8453)throw Error("review_contract");
for(const marker of ["REQUESTING PLATFORM: fixture","PURPOSE:","DOMAIN: https://atm.simondalmasso44.workers.dev","REQUEST ID: "+g.request_id,"FINANCIAL EFFECT: NONE","NO_ETH_SIGN"])if(!r.payload.includes(marker)&&!(r.full_disclosure||[]).includes(marker))throw Error("review_missing:"+marker);
if(!/^0x[0-9a-f]{64}$/i.test(r.signature_payload_digest))throw Error("digest_missing");
validateSubmissionShape({expires_at:r.expires_at,nonce:r.nonce,signature:"0x"+"22".repeat(64)+"1b"});
for(const bad of [
 {expires_at:r.expires_at,nonce:r.nonce,signature:"0x"+"22".repeat(64)+"1b",payload:"tampered"},
 {expires_at:r.expires_at,nonce:r.nonce,signature:"0x"+"22".repeat(64)+"1b",method:"eth_sign"},
 {expires_at:r.expires_at,nonce:r.nonce,signature:"0x"+"22".repeat(64)+"1b",transaction:{to:"0x0"}},
]){let killed=false;try{validateSubmissionShape(bad)}catch(e){killed=String(e.message).includes("browser_supplied_payload_rejected")}if(!killed)throw Error("opaque_or_payload_not_killed")}
if(personalSignDigest("order021-valid-recovery-vector")!=="0xbe79660a081042aa787b99a21161d849ee456ef2e0ca2a26799ea062843d0ce6")throw Error("personal_sign_digest_vector");
console.log(JSON.stringify({review:true,tamper:true,opaque:true,digest:true}));
'''
        out = self.run_node(script)
        self.assertTrue(out["review"] and out["tamper"] and out["opaque"] and out["digest"])

    def test_runtime_signature_to_readback_to_resume_with_same_code(self):
        script = r'''
import {createHmac} from "node:crypto";
import {CANONICAL_OWNER} from "./worker/src/human-gate-crypto.js";
import {externalSignatureFixture,handleExternalSignature} from "./worker/src/order021-external-signature.js";
const secret="fixture-session-secret", now=Date.now(), gate=externalSignatureFixture(now);
let rows=[{id:1,user:{login:"github-actions[bot]"},author_association:"NONE",body:"ATM HUMAN GATE REQUEST\n```json\n"+JSON.stringify(gate)+"\n```"}], recovered=CANONICAL_OWNER;
const b64url=x=>Buffer.from(JSON.stringify(x)).toString("base64url"); const body=b64url({wallet:CANONICAL_OWNER.toLowerCase(),exp:Math.floor(now/1000)+300}); const sig=createHmac("sha256",secret).update(body).digest("hex"); const token=body+"."+sig;
globalThis.fetch=async(url,opts={})=>{url=String(url);if(url==="https://mainnet.base.org"){const addr=recovered.toLowerCase().replace(/^0x/,"").padStart(64,"0");return new Response(JSON.stringify({jsonrpc:"2.0",id:22,result:"0x"+addr}),{status:200,headers:{"content-type":"application/json"}})}if(url.endsWith("/issues/49"))return new Response(JSON.stringify({comments:rows.length}),{status:200,headers:{"content-type":"application/json"}});if(url.includes("/issues/49/comments?")&&(!opts.method||opts.method==="GET"))return new Response(JSON.stringify(rows),{status:200,headers:{"content-type":"application/json"}});if(url.endsWith("/issues/49/comments")&&opts.method==="POST"){const req=JSON.parse(opts.body),row={id:rows.length+1,user:{login:"github-actions[bot]"},author_association:"NONE",body:req.body};rows.push(row);return new Response(JSON.stringify({html_url:"https://github.com/example/comment/"+row.id}),{status:201,headers:{"content-type":"application/json"}})}throw Error("unexpected_fetch:"+url)};
const env={ATM_GITHUB_DISPATCH_TOKEN:secret,ATM_GIT_SHA:"11".repeat(20)}; const headers={authorization:"Bearer "+token};
let rr=await handleExternalSignature(new Request("https://atm.simondalmasso44.workers.dev/api/human-gates/"+gate.request_id+"/signature-review",{headers}),env); if(rr.status!==200)throw Error("review_http"); const review=await rr.json();
const fakeSignature="0x"+"22".repeat(64)+"1b";
let bad=await handleExternalSignature(new Request("https://atm.simondalmasso44.workers.dev/api/human-gates/"+gate.request_id+"/external-signature",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({nonce:review.nonce,expires_at:review.expires_at,signature:fakeSignature,payload:"tamper"})}),env); if(bad.status!==400)throw Error("tampered_payload_not_killed");
recovered="0x1111111111111111111111111111111111111111"; let wrong=await handleExternalSignature(new Request("https://atm.simondalmasso44.workers.dev/api/human-gates/"+gate.request_id+"/external-signature",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({nonce:review.nonce,expires_at:review.expires_at,signature:fakeSignature})}),env); if(wrong.status!==403)throw Error("wrong_wallet_not_killed");
recovered=CANONICAL_OWNER; let ok=await handleExternalSignature(new Request("https://atm.simondalmasso44.workers.dev/api/human-gates/"+gate.request_id+"/external-signature",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({nonce:review.nonce,expires_at:review.expires_at,signature:fakeSignature})}),env); if(ok.status!==200)throw Error("valid_signature_path_failed:"+ok.status); const accepted=await ok.json(); if(accepted.cryptographic_verification!=="PASS")throw Error("crypto_flag");
let replay=await handleExternalSignature(new Request("https://atm.simondalmasso44.workers.dev/api/human-gates/"+gate.request_id+"/external-signature",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({nonce:review.nonce,expires_at:review.expires_at,signature:fakeSignature})}),env); if(replay.status!==409)throw Error("replay_not_killed");
let recheck=await handleExternalSignature(new Request("https://atm.simondalmasso44.workers.dev/api/human-gates/"+gate.request_id+"/recheck",{method:"POST",headers}),env); const q=await recheck.json(); if(q.state!=="VERIFIED_COMPLETE"||q.resume_event?.schema!=="ATM_HUMAN_GATE_RESUME_V1"||q.resume_event?.outgoing_spend_usd!=="0")throw Error("readback_resume_failed");
let expired=await handleExternalSignature(new Request("https://atm.simondalmasso44.workers.dev/api/human-gates/"+gate.request_id+"/external-signature",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({nonce:"0x"+"44".repeat(32),expires_at:Math.floor(Date.now()/1000)-1,signature:fakeSignature})}),env); if(expired.status!==400)throw Error("expired_not_killed");
console.log(JSON.stringify({wrongWallet:true,replay:true,expired:true,readback:q.state,resume:q.resume_event.schema,events:rows.length}));
'''
        out = self.run_node(script)
        self.assertTrue(out["wrongWallet"] and out["replay"] and out["expired"])
        self.assertEqual(out["readback"], "VERIFIED_COMPLETE")
        self.assertEqual(out["resume"], "ATM_HUMAN_GATE_RESUME_V1")

    def test_ui_requires_review_before_personal_sign_and_never_broadcasts(self):
        source = (ROOT / "worker/src/order021-owner-inbox.js").read_text(encoding="utf-8")
        self.assertIn("REVIEW & SIGN", source)
        self.assertIn("FULL PAYLOAD", source)
        self.assertIn("FULL DISCLOSURE", source)
        self.assertIn("SIGN EXACT PAYLOAD IN METAMASK", source)
        self.assertIn("method:'personal_sign'", source)
        self.assertNotIn("eth_sendTransaction", source)
        self.assertNotIn("wallet_sendCalls", source)
        self.assertNotIn("Permit2", source)


if __name__ == "__main__":
    unittest.main()
