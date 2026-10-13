import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, 'ATM-ORDER034-ACTIVE-MAIN-READONLY.js');
const tmp = path.join(os.tmpdir(), `atm-rsi-decision-${process.pid}-${Date.now()}.mjs`);
let code = fs.readFileSync(src, 'utf8').replace(
  'import { DurableObject } from "cloudflare:workers";',
  'class DurableObject { constructor(ctx, env) {} }'
);
code += `
export { MCP_PUBLIC_TOOLS };
export const RSI_TEST_API = {
  appendRsiDecisionHistoryV1: typeof appendRsiDecisionHistoryV1 === "function" ? appendRsiDecisionHistoryV1 : null,
  taskmarketWorkerAddress: typeof TASKMARKET_WORKER_ADDRESS === "string" ? TASKMARKET_WORKER_ADDRESS : null
};
`;
fs.writeFileSync(tmp, code, 'utf8');
process.on('exit', () => { try { fs.unlinkSync(tmp); } catch {} });
const mod = await import(pathToFileURL(tmp).href + '?v=' + Date.now());
const checks = [];
const check = (name, ok, detail = '') => {
  checks.push([name, !!ok]);
  if (!ok) throw new Error(`${name}${detail ? ':' + detail : ''}`);
};

function makeBrain() {
  const store = new Map();
  let transactionTail = Promise.resolve();
  const ctx = { storage: {
    get: async key => store.get(key),
    put: async (key, value) => { store.set(key, value); },
    transaction: async callback => {
      const run = transactionTail.then(async () => callback({
        get: async key => store.get(key),
        put: async (key, value) => { store.set(key, value); }
      }));
      transactionTail = run.catch(() => {});
      return await run;
    },
    setAlarm: async () => {},
    deleteAlarm: async () => {}
  } };
  const env = { TASKMARKET_SIGNER: {}, AI: { run: async () => ({}) }, EXECUTION_ENABLED: 'false' };
  const brain = new mod.ATMBrain(ctx, env);
  brain.taskRuntime = async () => ({});
  brain.economicWatchdogState = async () => ({});
  brain.freshExecutionPolicy = async opp => ({
    ok: true, operation: 'submit',
    normalized: { ai_executability: 'AI_EXECUTABLE', estimated_net_usd: opp.estimated_net_usd, artifact_profile: { supported: true } },
    terms_hash: 'terms-hash', pending_action_snapshot_hash: 'pending-hash', read_at: '2026-10-13T00:00:00.000Z'
  });
  return { brain, store };
}

function candidate(id, capability, net, extra = {}) {
  return {
    opportunity_id: id, raw_id: `task-${id}`, source: 'DAYDREAMS',
    capability_class: capability, estimated_net_usd: net,
    executor_truth: 'PROVEN', owner_spend: { known: true, zero: true },
    eligibility: { source_truth_proven: true, payout_truth_proven: true },
    ai_executability: 'AI_EXECUTABLE', artifact_profile: { supported: true },
    blockers: [], title: `Title for ${id}`, description: `PRIVATE_TASK_BODY_${id}`,
    ...extra
  };
}

const a = candidate('opp-a', 'PURE_LLM', 150);
const b = candidate('opp-b', 'HTTP_TOOL', 250);
const blocked = candidate('opp-blocked', 'PURE_LLM', 500, {
  ai_executability: 'BLOCKED', blockers: ['KYC_OR_IDENTITY_REQUIRED'], description: 'BLOCKED_PRIVATE_TASK_BODY'
});

const first = makeBrain();
let modelCalls = 0, modelPrompt = '';
first.brain.runExecutionModelResult = async messages => {
  modelCalls++;
  modelPrompt = messages.map(x => String(x.content || '')).join('\n');
  return { text: JSON.stringify({
    version: 'RSI_DECISION_V1',
    ordered_candidate_ids: ['opp-b', 'opp-a'],
    rationale: 'The verified outcome sample supports testing the second admitted candidate first.'
  }), finish_reason: 'stop' };
};
const firstFresh = [];
first.brain.freshExecutionPolicy = async opp => {
  firstFresh.push(opp.opportunity_id);
  return {
    ok: true, operation: 'submit',
    normalized: { ai_executability: 'AI_EXECUTABLE', estimated_net_usd: opp.estimated_net_usd, artifact_profile: { supported: true } },
    terms_hash: 'terms-hash', pending_action_snapshot_hash: 'pending-hash', read_at: '2026-10-13T00:00:00.000Z'
  };
};
const chosen = await first.brain.chooseTaskmarketCandidate([a, b, blocked]);
check('RSI_ORDER_USED_ONLY_AFTER_ADMISSION', chosen.ok === true && chosen.opp.opportunity_id === 'opp-b');
check('ONE_GLM_CALL_FOR_MULTIPLE_CANDIDATES', modelCalls === 1);
check('BLOCKED_CANDIDATE_AND_BODY_NEVER_REACH_RSI', !modelPrompt.includes('opp-blocked') && !modelPrompt.includes('BLOCKED_PRIVATE_TASK_BODY'));
check('TASK_BODIES_NOT_SENT_TO_RSI', !modelPrompt.includes('PRIVATE_TASK_BODY_opp-a') && !modelPrompt.includes('PRIVATE_TASK_BODY_opp-b'));
check('FRESH_POLICY_READBACK_AFTER_RSI_ORDER', firstFresh.length === 1 && firstFresh[0] === 'opp-b');
check('DECISION_PERSISTED_WITH_SELECTED_ID', first.store.get('rsi_decision_history_v1')?.[0]?.selected_opportunity_id === 'opp-b');


const concurrent = makeBrain();
const decisionA = {
  decision_id: 'concurrent-a', at: '2026-10-13T00:00:00.000Z', source: 'DAYDREAMS',
  task_id: 'concurrent-task-a', selected_opportunity_id: 'concurrent-opp-a',
  capability_class: 'PURE_LLM', baseline_order: ['concurrent-opp-a'], proposed_order: [],
  validation: { ok: false, error: 'MODEL_ERROR' }
};
const decisionB = {
  decision_id: 'concurrent-b', at: '2026-10-13T00:00:00.001Z', source: 'DAYDREAMS',
  task_id: 'concurrent-task-b', selected_opportunity_id: 'concurrent-opp-b',
  capability_class: 'HTTP_TOOL', baseline_order: ['concurrent-opp-b'], proposed_order: [],
  validation: { ok: false, error: 'SINGLE_CANDIDATE_SKIPPED' }
};
await Promise.all([
  concurrent.brain.persistRsiDecisionV1(decisionA),
  concurrent.brain.persistRsiDecisionV1(decisionB)
]);
const concurrentHistory = concurrent.store.get('rsi_decision_history_v1') || [];
check('CONCURRENT_DECISION_WRITES_ARE_NOT_LOST', concurrentHistory.length === 2 && concurrentHistory.some(x => x.decision_id === 'concurrent-a') && concurrentHistory.some(x => x.decision_id === 'concurrent-b'));


const many = makeBrain();
const manyCandidates = Array.from({ length: 7 }, (_, index) => candidate('opp-' + (index + 1), 'PURE_LLM', 101 + index));
let manyPrompt = '', manyCalls = 0;
many.brain.runExecutionModelResult = async messages => {
  manyCalls++;
  manyPrompt = String(messages[1].content || '');
  return {
    text: JSON.stringify({
      version: 'RSI_DECISION_V1',
      ordered_candidate_ids: ['opp-3', 'opp-4', 'opp-5', 'opp-6', 'opp-7'],
      rationale: 'Reverse only the bounded five-candidate prefix for fresh verification.'
    }),
    finish_reason: 'stop'
  };
};
const manyFresh = [];
many.brain.freshExecutionPolicy = async opp => {
  manyFresh.push(opp.opportunity_id);
  if (opp.opportunity_id !== 'opp-2') return { ok: false, error: 'FRESH_POLICY_BLOCKED', blockers: ['FRESH_POLICY_BLOCKED'] };
  return {
    ok: true, operation: 'submit',
    normalized: { ai_executability: 'AI_EXECUTABLE', estimated_net_usd: opp.estimated_net_usd, artifact_profile: { supported: true } },
    terms_hash: 'terms-hash', pending_action_snapshot_hash: 'pending-hash', read_at: '2026-10-13T00:00:00.000Z'
  };
};
const manyResult = await many.brain.chooseTaskmarketCandidate(manyCandidates);
const manyPayload = JSON.parse(manyPrompt);
check('RSI_MODEL_INPUT_IS_BOUNDED_TO_FIVE', manyCalls === 1 && manyPayload.candidates.length === 5 && !manyPrompt.includes('opp-1') && !manyPrompt.includes('opp-2'));
check('BASELINE_TAIL_REMAINS_IN_ORIGINAL_ORDER', manyResult.ok === true && manyResult.opp.opportunity_id === 'opp-2' && manyFresh.join(',') === 'opp-3,opp-4,opp-5,opp-6,opp-7,opp-2');

const single = makeBrain();
let singleCalls = 0;
single.brain.runExecutionModelResult = async () => { singleCalls++; throw new Error('SHOULD_NOT_CALL'); };
const singleResult = await single.brain.chooseTaskmarketCandidate([a]);
check('SINGLE_CANDIDATE_SKIPS_INFERENCE', singleResult.ok === true && singleCalls === 0);

const failed = makeBrain();
let failedCalls = 0;
failed.brain.runExecutionModelResult = async () => { failedCalls++; throw new Error('FREE_AI_CALL_CAP_REACHED'); };
const failedResult = await failed.brain.chooseTaskmarketCandidate([a, b]);
check('MODEL_FAILURE_FALLS_BACK_TO_BASELINE', failedResult.ok === true && failedResult.opp.opportunity_id === 'opp-a');
check('MODEL_FAILURE_DOES_NOT_RETRY', failedCalls === 1);
check('QUOTA_FAILURE_CODE_RECORDED', failed.store.get('rsi_decision_history_v1')?.[0]?.validation?.error === 'FREE_AI_CALL_CAP_REACHED');
check('FALLBACK_REASON_RECORDED', failed.store.get('rsi_decision_history_v1')?.[0]?.validation?.ok === false);

const invalid = makeBrain();
let invalidCalls = 0;
invalid.brain.runExecutionModelResult = async () => {
  invalidCalls++;
  return { text: JSON.stringify({ version: 'RSI_DECISION_V1', ordered_candidate_ids: ['opp-b', 'opp-b'], rationale: 'duplicate IDs' }), finish_reason: 'stop' };
};
const invalidResult = await invalid.brain.chooseTaskmarketCandidate([a, b]);
check('INVALID_ORDER_FALLS_BACK_TO_BASELINE', invalidResult.ok === true && invalidResult.opp.opportunity_id === 'opp-a');
check('INVALID_ORDER_DOES_NOT_RETRY', invalidCalls === 1);

const freshBlocked = makeBrain();
let freshCalls = 0;
freshBlocked.brain.runExecutionModelResult = async () => ({
  text: JSON.stringify({ version: 'RSI_DECISION_V1', ordered_candidate_ids: ['opp-b', 'opp-a'], rationale: 'bounded ranking proposal' }),
  finish_reason: 'stop'
});
freshBlocked.brain.freshExecutionPolicy = async opp => {
  freshCalls++;
  if (opp.opportunity_id === 'opp-b') return { ok: false, error: 'FRESH_POLICY_BLOCKED', blockers: ['FRESH_POLICY_BLOCKED'] };
  return {
    ok: true, operation: 'submit',
    normalized: { ai_executability: 'AI_EXECUTABLE', estimated_net_usd: opp.estimated_net_usd, artifact_profile: { supported: true } },
    terms_hash: 'terms-hash', pending_action_snapshot_hash: 'pending-hash', read_at: '2026-10-13T00:00:00.000Z'
  };
};
const freshResult = await freshBlocked.brain.chooseTaskmarketCandidate([a, b]);
check('RSI_CANNOT_BYPASS_FRESH_POLICY', freshResult.ok === true && freshResult.opp.opportunity_id === 'opp-a' && freshCalls === 2);

const rankedBrain = makeBrain();
let rankModelCalls = 0;
rankedBrain.brain.opportunities = async () => [a, b];
rankedBrain.brain.runExecutionModelResult = async () => { rankModelCalls++; throw new Error('READ_ONLY_RANK_MUST_NOT_CALL_MODEL'); };
const ranked = await rankedBrain.brain.tool('rank_opportunities', {}, null);
check('RANK_TOOL_DOES_NOT_INVOKE_MODEL', rankModelCalls === 0);
check('RANK_TOOL_RETURNS_DETERMINISTIC_ENGINE_METADATA', ranked.decision_engine?.ranking_mode === 'DETERMINISTIC_READ_ONLY' && ranked.decision_engine?.inference_invoked === false);
check('RANK_TOOL_PRESERVES_RESULTS_SHAPE', Array.isArray(ranked.results));

const statusBrain = makeBrain();
statusBrain.brain.radarState = async () => ({ status: 'NOT_RUNNING', last_run: null });
statusBrain.brain.sources = async () => ({});
statusBrain.brain.executionState = async () => ({ status: 'IDLE_NO_AUTO_ELIGIBLE_TASK' });
statusBrain.brain.quota = async () => ({ calls: 0, reserved_neurons: 0 });
statusBrain.brain.opportunities = async () => [];
statusBrain.brain.moneyLoopStatus = async () => ({
  earnings: {}, execution_queue: { states: {} },
  human_gate: { status: 'NO_CURRENT_OWNER_ACTION_REQUIRED', pending: 0, approved: 0 },
  payment_rails: {}, payment_capabilities: {}
});
statusBrain.brain.taskMarketStatus = async () => ({
  status: 'RUNNING', task_market: { open_tasks: 0 },
  daydreams: { signer: { ready: false, authenticated: false } }, p1_candidates: []
});
statusBrain.brain.moneyPathStatus = async () => ({});
statusBrain.brain.taskRuntime = async () => ({});
statusBrain.brain.economicWatchdogState = async () => ({});
statusBrain.brain.mcpHeartbeatState = async () => ({});
statusBrain.store.set('rsi_decision_history_v1', [{
  decision_id: 'forged-status-outcome', at: '2026-10-13T00:00:00.000Z',
  source: 'DAYDREAMS', task_id: 'task-a', selected_opportunity_id: 'opp-a',
  capability_class: 'PURE_LLM', outcome: 'paid',
  outcome_source: 'AUTHORITATIVE_EXTERNAL_READBACK', readback_hash: 'c'.repeat(64),
  paid_amount_usd: 125
}]);
const status = await statusBrain.brain.status();
check('STATUS_EXPOSES_RANKING_ONLY_ENGINE', status.decision_engine?.authority === 'RANKING_ONLY' && status.decision_engine?.hard_gate_authority === false);
check('STATUS_DOES_NOT_COUNT_UNVERIFIED_OUTCOMES', status.decision_engine?.verified_outcomes === 0);

const feedback = makeBrain();
const decision = mod.RSI_TEST_API.appendRsiDecisionHistoryV1([], {
  decision_id: 'hansa-decision', at: '2026-10-13T00:00:00.000Z', source: 'AGENTHANSA',
  task_id: 'hansa-task', selected_opportunity_id: 'hansa-opp', capability_class: 'PURE_LLM',
  baseline_order: ['hansa-opp'], proposed_order: ['hansa-opp'], validation: { ok: false, error: 'SINGLE_CANDIDATE_SKIPPED' }
});
feedback.store.set('rsi_decision_history_v1', decision);
const hansaRuntime = {
  source: 'AGENTHANSA', task_id: 'hansa-task', opportunity_id: 'hansa-opp',
  submission_id: 'hansa-submission', stage: 'WAITING_ACCEPTANCE', terminal: false
};
const hansaOpp = candidate('hansa-opp', 'PURE_LLM', 125, {
  source: 'AGENTHANSA', raw_id: 'hansa-task', title: 'Hansa task', description: 'Not persisted in RSI feedback'
});
feedback.brain.taskRuntime = async () => ({ 'hansa-opp': hansaRuntime });
feedback.brain.opportunities = async () => [hansaOpp];
feedback.brain.taskmarketSubmissionReadback = async () => ({ ok: true, results: [] });
feedback.brain.hansaSettlementReadback = async () => ({
  ok: true, accepted: true, paid: true, amount: 125, payout_id: 'payout-1', payout_status: 'paid',
  paid_at: '2026-10-13T00:01:00.000Z', settlement_match: { paid: true },
  settlement_receipt: { external_ref: 'hansa-payout-1', currency: 'USD', amount: 125 }
});
feedback.brain.registerSettlementRef = async () => ({ ok: true });
feedback.brain.appendTaskEvent = async () => {};
feedback.brain.appendLedgerEvent = async () => {};
feedback.brain.recordPendingRuntime = async () => {};
feedback.brain.pendingWorkState = async () => ({ items: {} });
const readbackResult = await feedback.brain.monitorExecutionReadback('rsi-test');
const recorded = feedback.store.get('rsi_decision_history_v1')?.[0];
check('AUTHORITATIVE_SETTLEMENT_UPDATES_MATCHED_DECISION', readbackResult.paid === 1 && recorded?.outcome === 'paid' && recorded?.outcome_source === 'AUTHORITATIVE_EXTERNAL_READBACK');
check('SETTLEMENT_FEEDBACK_STORES_HASH_NOT_RAW_BODY', /^[a-f0-9]{64}$/i.test(recorded?.readback_hash || '') && !('description' in recorded) && !('title' in recorded));


function setupTaskmarketFeedback(submissionFeedOk) {
  const state = makeBrain();
  const address = mod.RSI_TEST_API.taskmarketWorkerAddress;
  const taskId = 'taskmarket-task';
  const opportunityId = 'taskmarket-opp';
  const runtime = {
    source: 'DAYDREAMS', task_id: taskId, opportunity_id: opportunityId,
    submission_id: 'taskmarket-submission', stage: 'WAITING_ACCEPTANCE', terminal: false
  };
  const opp = candidate(opportunityId, 'PURE_LLM', 125, {
    source: 'DAYDREAMS', raw_id: taskId, title: 'TaskMarket task', description: 'Never include this body in RSI feedback'
  });
  state.store.set('rsi_decision_history_v1', mod.RSI_TEST_API.appendRsiDecisionHistoryV1([], {
    decision_id: 'taskmarket-decision', at: '2026-10-13T00:00:00.000Z',
    source: 'DAYDREAMS', task_id: taskId, selected_opportunity_id: opportunityId,
    capability_class: 'PURE_LLM', baseline_order: [opportunityId], proposed_order: [opportunityId],
    validation: { ok: false, error: 'SINGLE_CANDIDATE_SKIPPED' }
  }));
  state.brain.taskRuntime = async () => ({ [opportunityId]: runtime });
  state.brain.opportunities = async () => [opp];
  state.brain.taskmarketSubmissionReadback = async () => ({
    ok: submissionFeedOk,
    results: [{
      id: 'taskmarket-submission', taskId: taskId, workerAddress: address,
      rejectedAt: null
    }]
  });
  state.brain.daydreamsReadTask = async () => ({
    ok: true,
    task: {
      id: taskId, status: 'AWARDED',
      awards: [{
        workerAddress: address, rank: 1, isPrimary: true, workerPayment: '125000000',
        platformFee: '0', settlementTxHash: '0x' + '1'.repeat(64),
        settledAt: '2026-10-13T00:01:00.000Z'
      }]
    }
  });
  state.brain.registerSettlementRef = async () => ({ ok: true });
  state.brain.appendTaskEvent = async () => {};
  state.brain.appendLedgerEvent = async () => {};
  state.brain.recordPendingRuntime = async () => {};
  state.brain.pendingWorkState = async () => ({ items: {} });
  return state;
}
const taskmarketValid = setupTaskmarketFeedback(true);
const taskmarketValidResult = await taskmarketValid.brain.monitorExecutionReadback('rsi-taskmarket-valid');
const taskmarketValidRecord = taskmarketValid.store.get('rsi_decision_history_v1')?.[0];
check('TASKMARKET_VERIFIED_AWARD_FEEDS_RSI', taskmarketValidResult.paid === 1 && taskmarketValidRecord?.outcome === 'paid');

const taskmarketUnverified = setupTaskmarketFeedback(false);
await taskmarketUnverified.brain.monitorExecutionReadback('rsi-taskmarket-feed-error');
const taskmarketUnverifiedRecord = taskmarketUnverified.store.get('rsi_decision_history_v1')?.[0];
check('FAILED_SUBMISSION_FEED_CANNOT_LABEL_RSI_PAID', taskmarketUnverifiedRecord?.outcome !== 'paid');


const auditFailure = makeBrain();
auditFailure.brain.ctx.storage.transaction = async () => { throw new Error('DURABLE_STORAGE_UNAVAILABLE'); };
const auditFailureResult = await auditFailure.brain.chooseTaskmarketCandidate([candidate('audit-opp', 'PURE_LLM', 125)]);
check('DECISION_AUDIT_FAILURE_FAILS_CLOSED', auditFailureResult.ok === false && auditFailureResult.error === 'RSI_DECISION_AUDIT_PERSIST_FAILED');

check('NO_PUBLIC_RSI_MUTATION_TOOL_ADDED', !mod.MCP_PUBLIC_TOOLS.some(tool => /rsi/i.test(String(tool.name || ''))));
console.log(JSON.stringify({ ok: true, checks: Object.fromEntries(checks) }, null, 2));
