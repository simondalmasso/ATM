import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import {fileURLToPath,pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),src=path.join(here,'ATM-ORDER034-ACTIVE-MAIN-READONLY.js'),tmp=path.join(os.tmpdir(),`atm-order034-hansa-${process.pid}-${Date.now()}.mjs`);
let code=fs.readFileSync(src,'utf8').replace('import { DurableObject } from "cloudflare:workers";','class DurableObject { constructor(ctx,env){} }'); fs.writeFileSync(tmp,code,'utf8'); process.on('exit',()=>{try{fs.unlinkSync(tmp)}catch{}});
const {ATMBrain}=await import(pathToFileURL(tmp).href+'?v='+Date.now());
const map=new Map(),storage={get:async k=>map.get(k),put:async(k,v)=>map.set(k,v),setAlarm:async()=>{},deleteAlarm:async()=>{}};
const env={AGENTHANSA_API_KEY:'secret-test'}; const brain=new ATMBrain({storage},env); let joined=false,submitted=false,authOk=true;
globalThis.fetch=async(url,opts={})=>{const u=String(url),h=opts.headers||{}; if(u.includes('agenthansa')&&h.authorization!=='Bearer secret-test'&&!u.includes('/bounties/h1')) authOk=false;
  if(u.endsWith('/collective/bounties/h1')) return Response.json({id:'h1',title:'Write report',description:'Write a concise plain-text report.',reward_amount:150,currency:'USD',status:'open',participants:[],submissions:submitted?[{id:'sub-1',agent_id:'6b41e166-4461-4a0e-a89a-bb7efebaf552',status:'accepted'}]:[]});
  if(u.endsWith('/collective/bounties/my')) return Response.json({bounties:joined?[{id:'h1'}]:[]});
  if(u.endsWith('/collective/bounties/h1/join')&&opts.method==='POST'){joined=true;return Response.json({id:'join-1',status:'joined'});}
  if(u.endsWith('/collective/bounties/h1/submit')&&opts.method==='POST'){submitted=true;return Response.json({submission_id:'sub-1',status:'submitted'});}
  if(u.includes('/api/payouts')) return Response.json({payouts:[{id:'pay-1',bounty_id:'h1',submission_id:'sub-1',status:'paid',amount:150,currency:'USD',paid_at:'2026-09-17T03:00:00Z'}]});
  if(u.includes('api.taskmarket.dev/api/submissions/mine')) return Response.json([]); return new Response('{}',{status:404});};
const opp={opportunity_id:'AGENTHANSA:h1',raw_id:'h1',source:'AGENTHANSA',title:'Write report',description:'Write a concise plain-text report.',estimated_net_usd:150,ai_executability:'AI_EXECUTABLE',artifact_profile:{supported:true,artifact_count:1},blockers:[]};
const fresh1=await brain.freshExecutionPolicy(opp); if(!fresh1.ok||fresh1.operation!=='claim') throw new Error('HANSA_FRESH_CLAIM_FAILED:'+JSON.stringify(fresh1));
const claim=await brain.acquireExecutionSource(opp,{claim_idempotency_key:'c1'}); if(!claim.ok||!joined) throw new Error('HANSA_JOIN_FAILED:'+JSON.stringify(claim));
const fresh2=await brain.freshExecutionPolicy(opp); if(!fresh2.ok||fresh2.operation!=='submit') throw new Error('HANSA_FRESH_SUBMIT_FAILED:'+JSON.stringify(fresh2));
const runtime={source:'AGENTHANSA',task_id:'h1',submission_id:'sub-1',terms_hash:fresh2.terms_hash,submit_idempotency_key:'s1',stage:'WAITING_ACCEPTANCE'};
const sub=await brain.submitExecutionSource(opp,[{file_name:'answer.md',mime_type:'text/markdown',role:'primary',content:'A verified concise report with enough content.'}],runtime); if(!sub.ok||sub.submission_id!=='sub-1'||!submitted||!authOk) throw new Error('HANSA_SUBMIT_FAILED:'+JSON.stringify(sub));
const settlement=await brain.hansaSettlementReadback(runtime); if(!settlement.ok||!settlement.accepted||!settlement.paid||settlement.amount!==150) throw new Error('HANSA_SETTLEMENT_FAILED:'+JSON.stringify(settlement));
await storage.put('task_runtime',{'AGENTHANSA:h1':runtime}); await storage.put('opportunities',[opp]); const watch=await brain.monitorExecutionReadback('test');
const persisted=(await storage.get('task_runtime'))['AGENTHANSA:h1']; if(persisted.stage!=='PAID'||watch.paid!==1) throw new Error('GENERIC_SETTLEMENT_WATCHER_FAILED:'+JSON.stringify({persisted,watch}));
console.log('HANSA_READ_JOIN_SUBMIT=PASS'); console.log('HANSA_AUTH_HEADER=PASS'); console.log('HANSA_SETTLEMENT_READBACK=PASS'); console.log('GENERIC_SETTLEMENT_WATCHER=PASS'); console.log('PRODUCTION_MUTATION=0');