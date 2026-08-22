from __future__ import annotations

import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Order021LocalCryptoTests(unittest.TestCase):
    def run_node(self, source: str) -> dict:
        done = subprocess.run(
            ["node", "--input-type=module", "-e", source],
            cwd=ROOT,
            check=True,
            text=True,
            capture_output=True,
        )
        return json.loads(done.stdout)

    def test_real_known_key_eip712_and_personal_sign_vectors(self):
        script = r'''
import {eip712Digest,recoverAddressFromDigest,recoverOwnerAddress} from "./worker/src/human-gate-crypto.js";
import {personalSignDigest,recoverPersonalSignAddress} from "./worker/src/order021-external-signature.js";
const expected="0x7e5f4552091a69125d5dfcb7b8c2659029395bdf";
const ownerArgs={requestId:"GLOBAL",action:"OPEN_HUMAN_GATE_INBOX",nonce:"0x"+"11".repeat(32),expiresAt:1800000000};
const ownerDigest="0xf9c9337a8c8139a053e63479bf7d55bba9294c3c899174ce5e0fd12893962f8a";
const ownerSig="0x676ce7f0b470b4fbd33af46b4a6a54981612fa5e6f08d77269c8b97e2738f76d1d901782aefb7aa1678b6d799856557834a87f1e0bc030c3ad0a875562a76f301b";
if(eip712Digest(ownerArgs)!==ownerDigest)throw Error("eip712_digest_vector_drift");
if((await recoverOwnerAddress(ownerArgs,ownerSig)).toLowerCase()!==expected)throw Error("eip712_known_key_recovery_failed");
if(recoverAddressFromDigest(ownerDigest,ownerSig).toLowerCase()!==expected)throw Error("digest_recovery_failed");
let typedTamper=false;try{typedTamper=(await recoverOwnerAddress({...ownerArgs,action:"OWNER_ACTION_RETURNED"},ownerSig)).toLowerCase()!==expected}catch{typedTamper=true}if(!typedTamper)throw Error("typed_data_tamper_not_killed");
const message="order021-valid-recovery-vector";
const personalDigest="0xbe79660a081042aa787b99a21161d849ee456ef2e0ca2a26799ea062843d0ce6";
const personalSig="0xb119a8d65450201ad7d5297c9029874c2f8cdba9ba94eab69e0ae8f1ada3a5dc07e4cf8e7121aa7df5f92c12090cc7e6079a0fb717e823f48c40322d74ab33981b";
if(personalSignDigest(message)!==personalDigest)throw Error("personal_digest_vector_drift");
if(recoverPersonalSignAddress(message,personalSig).toLowerCase()!==expected)throw Error("personal_known_key_recovery_failed");
let msgTamper=false;try{msgTamper=recoverPersonalSignAddress(message+"!",personalSig).toLowerCase()!==expected}catch{msgTamper=true}if(!msgTamper)throw Error("message_tamper_not_killed");
let sigTamper=false;const changed=personalSig.slice(0,10)+(personalSig[10]==="0"?"1":"0")+personalSig.slice(11);try{sigTamper=recoverPersonalSignAddress(message,changed).toLowerCase()!==expected}catch{sigTamper=true}if(!sigTamper)throw Error("signature_tamper_not_killed");
console.log(JSON.stringify({eip712:true,personalSign:true,knownKey:true,typedTamper:true,messageTamper:true,signatureTamper:true,noRpc:true}));
'''
        out = self.run_node(script)
        self.assertTrue(all(out.values()))

    def test_external_signature_nonce_replay_is_fail_closed(self):
        script = r'''
import {createHash,createHmac} from "node:crypto";
import {CANONICAL_OWNER} from "./worker/src/human-gate-crypto.js";
import {buildExternalSignatureReview,externalSignatureFixture,handleExternalSignature} from "./worker/src/order021-external-signature.js";
import {sealMachineEvent} from "./worker/src/order021-human-gate.js";
const fixed=1900000000000;Date.now=()=>fixed;const secret="replay-fixture-secret",gate=externalSignatureFixture(fixed),env={ATM_GITHUB_DISPATCH_TOKEN:secret,ATM_GIT_SHA:"11".repeat(20)};
const review=await buildExternalSignatureReview(gate,env,fixed);const sealed=await sealMachineEvent(env,{schema:"ATM_HUMAN_GATE_EVENT_V1",request_id:gate.request_id,current_external_object_hash:gate.current_external_object_hash,state:"OWNER_ACTION_RETURNED",action:"EXTERNAL_WALLET_SIGNATURE",nonce:review.nonce,signature_payload_digest:review.signature_payload_digest,signature_digest:"0x"+"55".repeat(32),recovered_wallet:CANONICAL_OWNER.toLowerCase(),observed_at:new Date(fixed).toISOString(),outgoing_spend_usd:"0"});
let rows=[{id:1,user:{login:"github-actions[bot]"},author_association:"NONE",body:"ATM HUMAN GATE REQUEST\n```json\n"+JSON.stringify(gate)+"\n```"},{id:2,user:{login:"github-actions[bot]"},author_association:"NONE",body:"ATM HUMAN GATE EVENT\n```json\n"+JSON.stringify(sealed)+"\n```"}];
const b64url=x=>Buffer.from(JSON.stringify(x)).toString("base64url"),body=b64url({wallet:CANONICAL_OWNER.toLowerCase(),exp:Math.floor(fixed/1000)+300}),mac=createHmac("sha256",secret).update(body).digest(),token=body+"."+createHash("sha256").update(mac).digest("hex");
globalThis.fetch=async(raw,opts={})=>{const u=new URL(String(raw));if(u.pathname.endsWith('/issues/49'))return new Response(JSON.stringify({comments:rows.length}),{status:200});if(u.pathname.endsWith('/issues/49/comments')&&(!opts.method||opts.method==='GET'))return new Response(JSON.stringify(rows),{status:200});throw Error('unexpected:'+u)};
const knownSignature="0x267a56ca2b9be8661b2af869e26ccdbbd99ff28b116ceef30dfca57335eb5d540466f02c82b8af04cdf49079b1b3caa84e80ecc483c598ea9ffc1a38fb00dee11c";
const r=await handleExternalSignature(new Request("https://atm.simondalmasso44.workers.dev/api/human-gates/"+gate.request_id+"/external-signature",{method:"POST",headers:{authorization:"Bearer "+token,"content-type":"application/json"},body:JSON.stringify({nonce:review.nonce,expires_at:review.expires_at,signature:knownSignature})}),env),j=await r.json();if(r.status!==409||j.error!=="external_signature_replay")throw Error("replay_not_killed");console.log(JSON.stringify({replay:true}));
'''
        out = self.run_node(script)
        self.assertTrue(out["replay"])


if __name__ == "__main__":
    unittest.main()
