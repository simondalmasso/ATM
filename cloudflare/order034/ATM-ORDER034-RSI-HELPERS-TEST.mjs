import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, 'ATM-ORDER034-ACTIVE-MAIN-READONLY.js');
const tmp = path.join(os.tmpdir(), `atm-rsi-helpers-${process.pid}-${Date.now()}.mjs`);
let code = fs.readFileSync(src, 'utf8').replace(
  'import { DurableObject } from "cloudflare:workers";',
  'class DurableObject { constructor(ctx, env) {} }'
);
code += `
export const RSI_TEST_API = {
  baselineOpportunityOrderV1: typeof baselineOpportunityOrderV1 === "function" ? baselineOpportunityOrderV1 : null,
  validateRsiRankingV1: typeof validateRsiRankingV1 === "function" ? validateRsiRankingV1 : null,
  rsiDecisionStatusV1: typeof rsiDecisionStatusV1 === "function" ? rsiDecisionStatusV1 : null,
  appendRsiDecisionHistoryV1: typeof appendRsiDecisionHistoryV1 === "function" ? appendRsiDecisionHistoryV1 : null,
  applyVerifiedRsiOutcomeV1: typeof applyVerifiedRsiOutcomeV1 === "function" ? applyVerifiedRsiOutcomeV1 : null,
  rsiOutcomeFeedbackV1: typeof rsiOutcomeFeedbackV1 === "function" ? rsiOutcomeFeedbackV1 : null
};
`;
fs.writeFileSync(tmp, code, 'utf8');
process.on('exit', () => { try { fs.unlinkSync(tmp); } catch {} });
const mod = await import(pathToFileURL(tmp).href + '?v=' + Date.now());
const api = mod.RSI_TEST_API;
const missing = Object.entries(api).filter(([, fn]) => typeof fn !== 'function').map(([name]) => name);
if (missing.length) throw new Error(`RSI_HELPER_MISSING:${missing.join(',')}`);

const checks = [];
const check = (name, ok, detail = '') => {
  checks.push([name, !!ok]);
  if (!ok) throw new Error(`${name}${detail ? ':' + detail : ''}`);
};

const input = [
  { opportunity_id: 'opp-a', raw_id: 'task-a', capability_class: 'PURE_LLM', estimated_net_usd: 100 },
  { opportunity_id: 'opp-b', raw_id: 'task-b', capability_class: 'HTTP_TOOL', estimated_net_usd: 900 },
  { opportunity_id: 'opp-c', raw_id: 'task-c', capability_class: 'PURE_LLM', estimated_net_usd: 150 },
  { opportunity_id: 'opp-d', raw_id: 'task-d', capability_class: 'BROWSER_ALLOWED', estimated_net_usd: 2000 },
  { opportunity_id: 'opp-e', raw_id: 'task-e', capability_class: 'HTTP_TOOL', estimated_net_usd: 900 }
];
const before = JSON.stringify(input);
const baseline = api.baselineOpportunityOrderV1(input);
check('BASELINE_CAPABILITY_NET_TASK_ORDER', baseline.map(x => x.opportunity_id).join(',') === 'opp-c,opp-a,opp-b,opp-e,opp-d');
check('BASELINE_DOES_NOT_MUTATE_INPUT', JSON.stringify(input) === before);
check('BASELINE_RETURNS_NEW_ARRAY', baseline !== input);

const valid = api.validateRsiRankingV1(['opp-a', 'opp-b'], JSON.stringify({
  version: 'RSI_DECISION_V1',
  ordered_candidate_ids: ['opp-b', 'opp-a'],
  rationale: 'Verified historical outcomes favor the second candidate.'
}));
check('VALID_EXACT_PERMUTATION_ACCEPTED', valid.ok === true && valid.ordered_candidate_ids.join(',') === 'opp-b,opp-a');

const invalidResponses = [
  ['DUPLICATE_ID_REJECTED', { version: 'RSI_DECISION_V1', ordered_candidate_ids: ['opp-a', 'opp-a'], rationale: 'duplicate' }],
  ['MISSING_ID_REJECTED', { version: 'RSI_DECISION_V1', ordered_candidate_ids: ['opp-a'], rationale: 'missing' }],
  ['EXTRA_ID_REJECTED', { version: 'RSI_DECISION_V1', ordered_candidate_ids: ['opp-a', 'opp-b', 'opp-c'], rationale: 'extra' }],
  ['UNKNOWN_ID_REJECTED', { version: 'RSI_DECISION_V1', ordered_candidate_ids: ['opp-a', 'unknown'], rationale: 'unknown' }],
  ['OVERSIZED_RATIONALE_REJECTED', { version: 'RSI_DECISION_V1', ordered_candidate_ids: ['opp-a', 'opp-b'], rationale: 'x'.repeat(401) }],
  ['EXTRA_SCHEMA_FIELD_REJECTED', { version: 'RSI_DECISION_V1', ordered_candidate_ids: ['opp-a', 'opp-b'], rationale: 'bounded', can_execute: true }]
];
for (const [name, response] of invalidResponses) check(name, api.validateRsiRankingV1(['opp-a', 'opp-b'], JSON.stringify(response)).ok === false);
check('MALFORMED_JSON_REJECTED', api.validateRsiRankingV1(['opp-a', 'opp-b'], '{"version":').ok === false);
check('OVERSIZED_CANDIDATE_ID_REJECTED', api.validateRsiRankingV1(['x'.repeat(161), 'opp-b'], JSON.stringify({
  version: 'RSI_DECISION_V1', ordered_candidate_ids: ['x'.repeat(161), 'opp-b'], rationale: 'bounded'
})).ok === false);
check('MORE_THAN_FIVE_CANDIDATES_REJECTED', api.validateRsiRankingV1(['a', 'b', 'c', 'd', 'e', 'f'], JSON.stringify({
  version: 'RSI_DECISION_V1', ordered_candidate_ids: ['a', 'b', 'c', 'd', 'e', 'f'], rationale: 'bounded'
})).ok === false);

const status = api.rsiDecisionStatusV1();
check('RANKING_ONLY_AUTHORITY', status.authority === 'RANKING_ONLY' && status.hard_gate_authority === false && status.spend_authority === false && status.settlement_authority === false);
check('BOUNDED_RSI_LIMITS', status.max_candidates === 5 && status.max_model_calls_per_decision === 1 && status.fallback_policy === 'DETERMINISTIC_BASELINE');

const decision = {
  decision_id: 'decision-1', at: '2026-10-13T00:00:00.000Z', strategy_version: 'ATM-RSI-DECISION-V1',
  source: 'DAYDREAMS', task_id: 'task-a', selected_opportunity_id: 'opp-a', capability_class: 'PURE_LLM',
  baseline_order: ['opp-a', 'opp-b'], proposed_order: ['opp-b', 'opp-a'], validation: { ok: true }, outcome: null
};
const history = api.appendRsiDecisionHistoryV1([], decision);
check('DECISION_HISTORY_RECORDS_SELECTION', history.length === 1 && history[0].selected_opportunity_id === 'opp-a');
check('DECISION_HISTORY_BOUND_50', api.appendRsiDecisionHistoryV1(Array.from({ length: 50 }, (_, i) => ({ decision_id: String(i) })), decision).length === 50);

const readback = {
  authority: 'AUTHORITATIVE_EXTERNAL_READBACK', source: 'DAYDREAMS', task_id: 'task-a', opportunity_id: 'opp-a',
  outcome: 'paid', observed_at: '2026-10-13T00:01:00.000Z', readback_hash: 'a'.repeat(64),
  readback_type: 'TASKMARKET_AWARD_SETTLEMENT', paid_amount_usd: 125
};
const applied = api.applyVerifiedRsiOutcomeV1(history, readback);
check('MATCHED_AUTHORITATIVE_OUTCOME_RECORDED', applied.updated === true && applied.history[0].outcome === 'paid');
check('MODEL_OUTCOME_REJECTED', api.applyVerifiedRsiOutcomeV1(history, { ...readback, authority: 'MODEL_OUTPUT' }).updated === false);
check('UNMATCHED_OUTCOME_REJECTED', api.applyVerifiedRsiOutcomeV1(history, { ...readback, opportunity_id: 'other' }).updated === false);
check('MISSING_EVIDENCE_HASH_REJECTED', api.applyVerifiedRsiOutcomeV1(history, { ...readback, readback_hash: '' }).updated === false);
check('PAID_READBACK_TYPE_MUST_MATCH_OUTCOME', api.applyVerifiedRsiOutcomeV1(history, { ...readback, readback_type: 'TASKMARKET_SUBMISSION_READBACK' }).updated === false);
const acceptedReadback = { ...readback, outcome: 'accepted', readback_type: 'TASKMARKET_SUBMISSION_READBACK', paid_amount_usd: null };
const rejectedReadback = { ...readback, outcome: 'rejected', readback_type: 'TASKMARKET_SUBMISSION_READBACK', paid_amount_usd: null };
check('MATCHED_ACCEPTANCE_READBACK_ACCEPTED', api.applyVerifiedRsiOutcomeV1(history, acceptedReadback).updated === true);
check('MATCHED_REJECTION_READBACK_ACCEPTED', api.applyVerifiedRsiOutcomeV1(history, rejectedReadback).updated === true);
check('SOURCE_AND_READBACK_TYPE_MUST_MATCH', api.applyVerifiedRsiOutcomeV1(history, { ...readback, source: 'AGENTHANSA' }).updated === false);
check('PAID_OUTCOME_REQUIRES_POSITIVE_AMOUNT', api.applyVerifiedRsiOutcomeV1(history, { ...readback, paid_amount_usd: 0 }).updated === false);
check('PAID_OUTCOME_NOT_DOWNGRADED', api.applyVerifiedRsiOutcomeV1(applied.history, { ...readback, outcome: 'accepted' }).history[0].outcome === 'paid');

const verifiedHistory = Array.from({ length: 8 }, (_, i) => ({
  ...decision, decision_id: `verified-${i}`, source: 'DAYDREAMS', capability_class: 'PURE_LLM',
  outcome: i % 2 ? 'accepted' : 'paid', outcome_source: 'AUTHORITATIVE_EXTERNAL_READBACK',
  readback_hash: String(i).padStart(64, 'a'), outcome_observed_at: '2026-10-13T00:01:00.000Z',
  readback_type: i % 2 ? 'TASKMARKET_SUBMISSION_READBACK' : 'TASKMARKET_AWARD_SETTLEMENT',
  paid_amount_usd: i % 2 ? null : 125
}));
const feedback = api.rsiOutcomeFeedbackV1(verifiedHistory, 5);
check('FEEDBACK_MAX_FIVE_VERIFIED_OUTCOMES', feedback.length === 5);
const forgedFeedback = api.rsiOutcomeFeedbackV1([{
  ...decision, decision_id: 'forged', outcome: 'paid',
  outcome_source: 'AUTHORITATIVE_EXTERNAL_READBACK', readback_hash: 'b'.repeat(64),
  outcome_observed_at: '', readback_type: '', paid_amount_usd: 125
}], 5);
check('FEEDBACK_REQUIRES_TIMESTAMP_AND_READBACK_TYPE', forgedFeedback.length === 0);
check('FEEDBACK_OMITS_TASK_IDS_AND_BODY', feedback.every(x => !('task_id' in x) && !('opportunity_id' in x) && !('title' in x) && !('description' in x)));

console.log(JSON.stringify({ ok: true, checks: Object.fromEntries(checks) }, null, 2));
