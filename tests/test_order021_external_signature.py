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
import {buildExternalSignatureReview,externalSignatureFixture,personalSignDigest,recoverPersonalSignAddress,validateSubmissionShape} from "./worker/src/order021-external-signature.js";
const now=1900000000000, g=externalSignatureFixture(now), env={ATM_GIT_SHA:"11".repeat(20)};
const r=await buildExternalSignatureReview(g,env,now);
if(r.schema!=="ATM_EXTERNAL_SIGNATURE_REVIEW_V1"||r.method!=="personal_sign"||r.domain!=="https://atm.simondalmasso44.workers.dev"||r.chain_id!==8453)throw Error("review_contract");
for(const marker of ["REQUESTING PLATFORM: fixture","PURPOSE:","DOMAIN: https://atm.simondalmasso44.workers.dev","REQUEST ID: "+g.request_id,"FINANCIAL EFFECT: NONE","NO_ETH_SIGN","LOCAL_SECP256K1_RECOVERY"])if(!r.payload.includes(marker)&&!(r.full_disclosure||[]).includes(marker))throw Error("review_missing:"+marker);
if(!/^0x[0-9a-f]{64}$/i.test(r.signature_payload_digest))throw Error("digest_missing");
const knownAddress="0x7e5f4552091a69125d5dfcb7b8c2659029395bdf";
const knownSignature="0x267a56ca2b9be8661b2af869e26ccdbbd99ff28b116ceef30dfca57335eb5d540466f02c82b8af04cdf49079b1b3caa84e80ecc483c598ea9ffc1a38fb00dee11c";
if(r.nonce!=="0x2fe0dbca32d4c691a6f7a1916cefc5ad7a41eda82418ba0002c4ba7ffa9c83c5"||r.expires_at!==1900000120)throw Error("known_review_drift");
if(recoverPersonalSignAddress(r.payload,knownSignature).toLowerCase()!==knownAddress)throw Error("known_key_review_recovery_failed");
let tamperedOk=false;try{tamperedOk=recoverPersonalSignAddress(r.payload+"!",knownSignature).toLowerCase()!==knownAddress}catch{tamperedOk=true}if(!tamperedOk)throw Error("tampered_message_not_killed");
let sigTamper=knownSignature.slice(0,4)+(knownSignature[4]==="0"?"1":"0")+knownSignature.slice(5),sigTamperedOk=false;try{sigTamperedOk=recoverPersonalSignAddress(r.payload,sigTamper).toLowerCase()!==knownAddress}catch{sigTamperedOk=true}if(!sigTamperedOk)throw Error("tampered_signature_not_killed");
validateSubmissionShape({expires_at:r.expires_at,nonce:r.nonce,signature:knownSignature});
for(const bad of [
 {expires_at:r.expires_at,nonce:r.nonce,signature:knownSignature,payload:"tampered"},
 {expires_at:r.expires_at,nonce:r.nonce,signature:knownSignature,method:"eth_sign"},
 {expires_at:r.expires_at,nonce:r.nonce,signature:knownSignature,transaction:{to:"0x0"}},
]){let killed=false;try{validateSubmissionShape(bad)}catch(e){killed=String(e.message).includes("browser_supplied_payload_rejected")}if(!killed)throw Error("opaque_or_payload_not_killed")}
if(personalSignDigest("order021-valid-recovery-vector")!=="0xbe79660a081042aa787b99a21161d849ee456ef2e0ca2a26799ea062843d0ce6")throw Error("personal_sign_digest_vector");
const genericSig="0xb119a8d65450201ad7d5297c9029874c2f8cdba9ba94eab69e0ae8f1ada3a5dc07e4cf8e7121aa7df5f92c12090cc7e6079a0fb717e823f48c40322d74ab33981b";
if(recoverPersonalSignAddress("order021-valid-recovery-vector",genericSig).toLowerCase()!==knownAddress)throw Error("known_personal_sign_vector_failed");
console.log(JSON.stringify({review:true,knownKey:true,tamper:true,opaque:true,digest:true,localRecovery:true}));
'''
        out = self.run_node(script)
        self.assertTrue(all(out.values()))

    def test_runtime_wrong_wallet_is_real_crypto_and_resume_is_exactly_once(self):
        script = r'''
import {createHash,createHmac} from "node:crypto";
import {CANONICAL_OWNER} from "./worker/src/human-gate-crypto.js";
import {externalSignatureFixture,handleExternalSignature,recoverPersonalSignAddress} from "./worker/src/order021-external-signature.js";
import {sealMachineEvent} from "./worker/src/order021-human-gate.js";
const fixed=1900000000000; Date.now=()=>fixed;
const secret="fixture-session-secret", gate=externalSignatureFixture(fixed);
let rows=[{id:1,user:{login:"github-actions[bot]"},author_association:"NONE",body:"ATM HUMAN GATE REQUEST\n```json\n"+JSON.stringify(gate)+"\n```"}];
const b64url=x=>Buffer.from(JSON.stringify(x)).toString("base64url"); const body=b64url({wallet:CANONICAL_OWNER.toLowerCase(),exp:Math.floor(fixed/1000)+300}); const mac=createHmac("sha256",secret).update(body).digest(); const sig=createHash("sha256").update(mac).digest("hex"); const token=body+"."+sig;
globalThis.fetch=async(raw,opts={})=>{const url=new URL(String(raw));if(url.pathname.endsWith("/issues/49"))return new Response(JSON.stringify({comments:rows.length}),{status:200,headers:{"content-type":"application/json"}});if(url.pathname.endsWith("/issues/49/comments")&&(!opts.method||opts.method==="GET"))return new Response(JSON.stringify(rows),{status:200,headers:{"content-type":"application/json"}});if(url.pathname.endsWith("/issues/49/comments")&&opts.method==="POST"){const req=JSON.parse(opts.body),row={id:rows.length+1,user:{login:"github-actions[bot]"},author_association:"NONE",body:req.body};rows.push(row);return new Response(JSON.stringify({html_url:"https://github.com/example/comment/"+row.id}),{status:201,headers:{"content-type":"application/json"}})}throw Error("unexpected_fetch:"+url)};
const env={ATM_GITHUB_DISPATCH_TOKEN:secret,ATM_GIT_SHA:"11".repeat(20)}; const headers={authorization:"Bearer "+token};
let rr=await handleExternalSignature(new Request("https://atm.simondalmasso44.workers.dev/api/human-gates/"+gate.request_id+"/signature-review",{headers}),env); if(rr.status!==200)throw Error("review_http"); const review=await rr.json();
const knownAddress="0x7e5f4552091a69125d5dfcb7b8c2659029395bdf",knownSignature="0x267a56ca2b9be8661b2af869e26ccdbbd99ff28b116ceef30dfca57335eb5d540466f02c82b8af04cdf49079b1b3caa84e80ecc483c598ea9ffc1a38fb00dee11c";
if(recoverPersonalSignAddress(review.payload,knownSignature).toLowerCase()!==knownAddress)throw Error("real_crypto_fixture_vector_drift");
let bad=await handleExternalSignature(new Request("https://atm.simondalmasso44.workers.dev/api/human-gates/"+gate.request_id+"/external-signature",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({nonce:review.nonce,expires_at:review.expires_at,signature:knownSignature,payload:"tamper"})}),env); if(bad.status!==400)throw Error("tampered_payload_not_killed");
let wrong=await handleExternalSignature(new Request("https://atm.simondalmasso44.workers.dev/api/human-gates/"+gate.request_id+"/external-signature",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({nonce:review.nonce,expires_at:review.expires_at,signature:knownSignature})}),env); if(wrong.status!==403||String((await wrong.json()).error)!=="external_signature_wrong_wallet")throw Error("real_crypto_wrong_wallet_not_killed");
let expired=await handleExternalSignature(new Request("https://atm.simondalmasso44.workers.dev/api/human-gates/"+gate.request_id+"/external-signature",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({nonce:"0x"+"44".repeat(32),expires_at:Math.floor(fixed/1000)-1,signature:knownSignature})}),env); if(expired.status!==400)throw Error("expired_not_killed");
const signatureEvent=await sealMachineEvent(env,{schema:"ATM_HUMAN_GATE_EVENT_V1",request_id:gate.request_id,current_external_object_hash:gate.current_external_object_hash,state:"OWNER_ACTION_RETURNED",action:"EXTERNAL_WALLET_SIGNATURE",nonce:review.nonce,signature_payload_digest:review.signature_payload_digest,signature_digest:"0x"+"55".repeat(32),recovered_wallet:CANONICAL_OWNER.toLowerCase(),observed_at:new Date(fixed).toISOString(),outgoing_spend_usd:"0"});
rows.push({id:rows.length+1,user:{login:"github-actions[bot]"},author_association:"NONE",body:"ATM HUMAN GATE EVENT\n```json\n"+JSON.stringify(signatureEvent)+"\n```"});
let recheck1=await handleExternalSignature(new Request("https://atm.simondalmasso44.workers.dev/api/human-gates/"+gate.request_id+"/recheck",{method:"POST",headers}),env),q1=await recheck1.json();if(q1.state!=="VERIFIED_COMPLETE"||q1.resume_event?.schema!=="ATM_HUMAN_GATE_RESUME_V1"||q1.resume_event_emitted!==true)throw Error("first_readback_resume_failed");
let recheck2=await handleExternalSignature(new Request("https://atm.simondalmasso44.workers.dev/api/human-gates/"+gate.request_id+"/recheck",{method:"POST",headers}),env),q2=await recheck2.json();if(q2.state!=="VERIFIED_COMPLETE"||q2.resume_event_emitted!==false)throw Error("duplicate_resume_not_suppressed");
const completions=rows.filter(x=>String(x.body).includes('"action":"EXTERNAL_READBACK"')&&String(x.body).includes('"state":"VERIFIED_COMPLETE"')).length;if(completions!==1)throw Error("resume_event_count:"+completions);
console.log(JSON.stringify({realCryptoWrongWallet:true,expired:true,readback:q1.state,resume:q1.resume_event.schema,exactlyOneResume:completions===1,noRpcMock:true}));
'''
        out = self.run_node(script)
        self.assertTrue(out["realCryptoWrongWallet"] and out["expired"] and out["exactlyOneResume"] and out["noRpcMock"])
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

    def test_crypto_boundary_has_no_rpc_recovery_dependency(self):
        crypto = (ROOT / "worker/src/human-gate-crypto.js").read_text(encoding="utf-8")
        ext = (ROOT / "worker/src/order021-external-signature.js").read_text(encoding="utf-8")
        self.assertNotIn("mainnet.base.org", crypto)
        self.assertNotIn("eth_call", crypto)
        self.assertNotIn("mainnet.base.org", ext)
        self.assertNotIn("eth_call", ext)
        self.assertIn("recoverAddressFromDigest", crypto)
        self.assertIn("PASS_LOCAL_SECP256K1", ext)


if __name__ == "__main__":
    unittest.main()
