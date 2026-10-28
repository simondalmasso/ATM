import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const src=path.join(here,'ATM-ORDER034-ACTIVE-MAIN-READONLY.js');
const tmp=path.join(os.tmpdir(),`atm-order075-no-award-${process.pid}-${Date.now()}.mjs`);
let code=fs.readFileSync(src,'utf8').replace(
  'import { DurableObject } from "cloudflare:workers";',
  'class DurableObject { constructor(ctx,env){ this.ctx=ctx; this.env=env; } }'
);
code = code.replace('import { createReadOnlyGrant, listReadOnlyGrants, authorizeReadOnlyGrant, revokeReadOnlyGrant, sanitizeReadOnlyTasks } from "./ATM-ORDER068-READONLY-GRANTS.mjs";', "");
fs.writeFileSync(tmp,code,'utf8');
process.on('exit',()=>{try{fs.unlinkSync(tmp)}catch{}});
const {ATMBrain}=await import(pathToFileURL(tmp).href+'?v='+Date.now());

class Storage {
  constructor(seed={}) { this.m=new Map(Object.entries(seed)); this.alarm=null; }
  async get(k) { return this.m.has(k)?structuredClone(this.m.get(k)):undefined; }
  async put(k,v) { this.m.set(k,structuredClone(v)); }
  async setAlarm(v) { this.alarm=v; }
  async deleteAlarm() { this.alarm=null; }
}
const at=new Date().toISOString();
const opp={opportunity_id:'DAYDREAMS:TSK-E58AN8KV',raw_id:'0x70d18368bd673fdf22d0de61813ab8ac6919af49676a4929fc4cf8980565b32f',source:'DAYDREAMS',title:'Resolved task with no award',terms_hash:'terms-c2fd'};
const runtime={opportunity_id:opp.opportunity_id,task_id:opp.raw_id,source:'DAYDREAMS',stage:'EXPIRED',terminal:true,expired_at:'2026-10-27T00:00:00.000Z',expiry_evidence:{source:'TASKMARKET_PUBLIC_READBACK',task_id:opp.raw_id,worker_task_submission_present:false,observed_at:'2026-10-27T00:00:00.000Z'},submission_id:'c2fd23a7-ff61-4cdd-b45d-2f2af5d6259a',external_submission_readback:'EXPIRED_NO_SUBMISSION',terms_hash:opp.terms_hash,attempts:1};
const task={id:opp.raw_id,status:'completed',phase:'resolved',submissionWindowOpen:false,awardCount:3,awards:[
 {workerAddress:'0x45a1000000000000000000000000000000000000',workerPayment:'400000',settlementTxHash:'0xaward1'},
 {workerAddress:'0x4f75000000000000000000000000000000000000',workerPayment:'400000',settlementTxHash:'0xaward2'},
 {workerAddress:'0x03b7000000000000000000000000000000000000',workerPayment:'400000',settlementTxHash:'0xaward3'}
]};
const submission={taskId:runtime.task_id,taskStatus:'completed',submittedAt:at,deliverableHash:'0xdeliverablehash',submitTxHash:'0xsubmittransaction'};
if ('id' in submission || 'workerAddress' in submission) throw new Error('FIXTURE_MUST_MATCH_WORKER_SCOPED_TASKMARKET_FEED_SCHEMA');
const storage=new Storage({task_runtime:{[opp.opportunity_id]:runtime},opportunities:[opp],execution_readbacks:[],pending_work_v1:{version:'PENDING_WORK_ENGINE_V1',items:{},updated_at:at}});
const brain=new ATMBrain({storage},{});
brain.taskmarketSubmissionReadback=async()=>({ok:true,results:[submission],read_at:at});
brain.daydreamsReadTask=async(taskId)=>({ok:true,task,read_at:at});
const first=await brain.monitorExecutionReadback('order075-test');
const afterRuntime=(await storage.get('task_runtime'))[opp.opportunity_id];
const pending=(await storage.get('pending_work_v1')).items[opp.opportunity_id];
if(first.pending!==0) throw new Error('RESOLVED_NO_AWARD_STILL_COUNTS_PENDING:'+JSON.stringify(first));
if(afterRuntime.stage!=='NO_AWARD'||afterRuntime.terminal!==true) throw new Error('NO_AWARD_NOT_TERMINAL:'+JSON.stringify(afterRuntime));
if(afterRuntime.external_submission_readback!=='NO_AWARD') throw new Error('NO_AWARD_EXTERNAL_READBACK_STATE_NOT_PERSISTED');
const watchdog=await storage.get('economic_watchdog');
if(watchdog?.last_external_readback!=='NO_AWARD'||watchdog?.classification!=='HEALTHY'||watchdog?.recommended_action!=='NONE') throw new Error('NO_AWARD_WATCHDOG_NOT_CLEARED:'+JSON.stringify(watchdog));
if(afterRuntime.paid_amount_usdc||afterRuntime.payment_receipt) throw new Error('NO_AWARD_FABRICATED_PAYOUT');
if(!afterRuntime.last_readback_at||!afterRuntime.last_readback_hash) throw new Error('NO_AWARD_READBACK_NOT_PERSISTED');
if(pending?.state!=='NO_AWARD'||pending.allow_mutation!==false||pending.required_action!=='NONE'||!pending.last_readback_hash) throw new Error('NO_AWARD_PENDING_LEDGER_NOT_RECONCILED:'+JSON.stringify(pending));
const rows=await storage.get('execution_readbacks');
if(!rows.some(x=>x.submission_id===runtime.submission_id&&x.task_status==='completed'&&x.task_phase==='resolved'&&x.award===null)) throw new Error('AUTHORITATIVE_NO_AWARD_EVIDENCE_NOT_STORED');
const second=await brain.monitorExecutionReadback('order075-repeat');
if(second.checked!==0||second.pending!==0) throw new Error('NO_AWARD_REPLAY_NOT_TERMINAL:'+JSON.stringify(second));
async function assertIncompleteAwardsStayPending(taskVariant, label) {
  const runtimeVariant={...runtime,stage:'EXPIRED',terminal:true,external_submission_readback:'EXPIRED_NO_SUBMISSION'};
  delete runtimeVariant.expiry_revalidated_at;
  const storageVariant=new Storage({task_runtime:{[opp.opportunity_id]:runtimeVariant},opportunities:[opp],execution_readbacks:[],pending_work_v1:{version:'PENDING_WORK_ENGINE_V1',items:{},updated_at:at}});
  const brainVariant=new ATMBrain({storage:storageVariant},{});
  brainVariant.taskmarketSubmissionReadback=async()=>({ok:true,results:[submission],read_at:at});
  brainVariant.daydreamsReadTask=async()=>({ok:true,task:taskVariant,read_at:at});
  const resultVariant=await brainVariant.monitorExecutionReadback(label);
  const checkedRuntime=(await storageVariant.get('task_runtime'))[opp.opportunity_id];
  if(checkedRuntime.stage==='NO_AWARD'||resultVariant.pending!==1) throw new Error('INCOMPLETE_AWARD_LIST_MUST_REMAIN_PENDING:'+label+':'+JSON.stringify({resultVariant,checkedRuntime}));
}
await assertIncompleteAwardsStayPending({...task,awardCount:4},'order075-mismatched-award-count');
const taskWithoutCount={...task}; delete taskWithoutCount.awardCount;
await assertIncompleteAwardsStayPending(taskWithoutCount,'order075-missing-award-count');

console.log('ORDER075_TASKID_SCOPED_FEED_CORRELATION=PASS');
console.log('ORDER075_RESOLVED_NO_AWARD_TERMINAL=PASS');
console.log('ORDER075_READBACK_AND_LEDGER_PERSISTED=PASS');
console.log('ORDER075_NO_PAYOUT_FABRICATED=PASS');
console.log('ORDER075_REPEAT_IDEMPOTENT=PASS');
console.log('ORDER075_INCOMPLETE_AWARD_COUNT_FAILS_CLOSED=PASS');
console.log('ORDER075_MISSING_AWARD_COUNT_FAILS_CLOSED=PASS');
console.log('REAL_EXTERNAL_WRITES=0');
