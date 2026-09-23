import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import cryptoNode from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const SOURCE=path.join(here,'ATM-ORDER034-FINAL-SIGNER-CANDIDATE.mjs');
const FIXTURE=path.join(os.tmpdir(),`atm-signer-${process.pid}-${Date.now()}.mjs`);
const sourceBytes=fs.readFileSync(SOURCE);
const sourceText=sourceBytes.toString('utf8')+'\nexport { privateKeyToAccount as __testAccountFromScalar };\n';
fs.writeFileSync(FIXTURE,sourceText,'utf8');
process.on('exit',()=>{try{fs.unlinkSync(FIXTURE)}catch{}});
const mod=await import(pathToFileURL(FIXTURE).href+'?v='+Date.now());
const {TaskmarketSignerGuard,termsHash,decision,sha,__testAccountFromScalar}=mod;
if(typeof TaskmarketSignerGuard!=='function') throw new Error('GUARD_EXPORT_MISSING');
let scalar=null, account=null;
for(let i=0;i<100&&!account;i++){
  const b=cryptoNode.randomBytes(32); b[0]&=0x7f;
  const h='0x'+b.toString('hex');
  try{const a=__testAccountFromScalar(h); if(a?.address){scalar=h;account=a;}}catch{}
}
if(!account) throw new Error('DUMMY_ACCOUNT_GENERATION_FAILED');
const keyBytes=cryptoNode.randomBytes(32), iv=cryptoNode.randomBytes(12);
const aes=await crypto.subtle.importKey('raw',keyBytes,{name:'AES-GCM'},false,['encrypt']);
const enc=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,tagLength:128},aes,new TextEncoder().encode(scalar)));
const ct=enc.slice(0,-16), tag=enc.slice(-16);
const hex=x=>Buffer.from(x).toString('hex');
const env={
  TASKMARKET_DEVICE_ID:'fixture-device',
  TASKMARKET_DEVICE_API_TOKEN:'fixture-token-not-real',
  TASKMARKET_ENCRYPTED_KEY:hex(Buffer.concat([iv,tag,ct])),
  TASKMARKET_WORKER_ADDRESS:account.address,
  TASKMARKET_AGENT_ID:'73264'
};
scalar=null;
const TASK='0x'+cryptoNode.randomBytes(32).toString('hex');
const IDEM=cryptoNode.randomUUID();
const task={id:TASK,referenceCode:'fixture',description:'fixture',mode:'claim',reward:1000000,netReward:1000000};
task.expiryTime=new Date(Date.now()+3600000).toISOString();
task.taskVisibility='public'; task.stakeRequired=false; task.stakeBps=0;
task.requesterActorType='fixture'; task.hooks=[]; task.status='open'; task.phase='open'; task.submissionWindowOpen=false;
task.pendingActions=[{role:'worker',action:'claim',requiresPayment:false,paymentAmount:0,availableAfter:null,availableUntil:null,eligibleAddress:account.address,targetWorker:null}];
const th=await termsHash(task);
const d=decision(task,account.address,'claim');
const ph=await sha(mod.stable(d.pending_action_snapshot));
const base={operation:'claim',task_id:TASK,idempotency_key:IDEM,terms_hash:th};
base.policy_proof={source:'DAYDREAMS',execution_actor:'ATM_RUNTIME_AGENT',arq_execution:false,policy:'DETERMINISTIC_CONTROL_PLANE',policy_decision:'AUTO_ELIGIBLE',action_cost_usdc:0,operation:'claim',task_id:TASK,terms_hash:th,pending_action_snapshot_hash:ph};
class Storage{constructor(){this.m=new Map()} async get(k){return this.m.get(k)} async put(k,v){this.m.set(k,structuredClone(v))}}
const storage=new Storage();
const guard=new TaskmarketSignerGuard({storage},env);
let marketplaceMutationCount=0;
const realFetch=globalThis.fetch;
globalThis.fetch=async (input,init={})=>{
  const u=new URL(typeof input==='string'?input:input.url);
  const method=String(init.method||input?.method||'GET').toUpperCase();
  if(u.pathname.includes('/api/devices/')&&u.pathname.endsWith('/key')&&method==='POST') return Response.json({deviceEncryptionKey:hex(keyBytes)});
  if(u.pathname===`/api/tasks/${TASK}`&&method==='GET') return Response.json({task});
  if(u.pathname===`/api/tasks/${TASK}/claim`&&method==='POST'){
    marketplaceMutationCount++;
    return Response.json({claimId:'mock-claim-001'});
  }
  throw new Error(`UNEXPECTED_MOCK_FETCH:${method}:${u.pathname}`);
};
const call=async body=>{
  const req=new Request('https://guard.local/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  const res=await guard.fetch(req);
  const text=await res.text(); let json=null; try{json=JSON.parse(text)}catch{}
  return {status:res.status,json,text};
};
const first=await call(base);
const firstCount=marketplaceMutationCount;
const replay=await call(structuredClone(base));
const replayCount=marketplaceMutationCount;
const stableFirst={...first.json}; delete stableFirst.replayed;
const stableReplay={...replay.json}; delete stableReplay.replayed;
const replayStable=JSON.stringify(stableFirst)===JSON.stringify(stableReplay)&&replay.json?.replayed===true;
const conflict=structuredClone(base);
conflict.payload_hash='f'.repeat(64);
const beforeConflict=marketplaceMutationCount;
const conflicting=await call(conflict);
const additional=marketplaceMutationCount-beforeConflict;
const s16=first.status===200&&first.json?.ok===true&&firstCount===1&&replay.status===200&&replayCount===1&&replayStable;
const s17=conflicting.status===409&&conflicting.json?.error==='IDEMPOTENCY_CONFLICT'&&additional===0;
if(!s16) throw new Error('S16_BEHAVIORAL_FAIL');
if(!s17) throw new Error('S17_BEHAVIORAL_FAIL');
globalThis.fetch=realFetch;
