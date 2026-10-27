import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, "ATM-ORDER034-ACTIVE-MAIN-READONLY.js");
const tmp = path.join(os.tmpdir(), "atm-order077-expired-" + process.pid + "-" + Date.now() + ".mjs");
let code = fs.readFileSync(src, "utf8").replace('import { DurableObject } from "cloudflare:workers";', "class DurableObject { constructor(ctx, env) { this.ctx = ctx; this.env = env; } }");
code = code.replace('import { createReadOnlyGrant, listReadOnlyGrants, authorizeReadOnlyGrant, revokeReadOnlyGrant, sanitizeReadOnlyTasks } from "./ATM-ORDER068-READONLY-GRANTS.mjs";', "");
fs.writeFileSync(tmp, code, "utf8");
process.on("exit", () => { try { fs.unlinkSync(tmp); } catch {} });
const { ATMBrain } = await import(pathToFileURL(tmp).href + "?v=" + Date.now());
class Storage {
  constructor(seed = {}) { this.m = new Map(Object.entries(seed)); this.alarm = null; }
  async get(k) { return this.m.has(k) ? structuredClone(this.m.get(k)) : undefined; }
  async put(k, v) { this.m.set(k, structuredClone(v)); }
  async setAlarm(v) { this.alarm = v; }
  async deleteAlarm() { this.alarm = null; }
}
const at = new Date().toISOString();
const taskId = "0xcadd940f93b871ae2e65d4fac238164f277ab7d343f238c1e5f71c91c08b8f00";
const oppId = "DAYDREAMS:" + taskId;
const localSubmissionId = "c2fd23a7-ff61-4cdd-b45d-2f2af5d6259a";
const opp = { opportunity_id: oppId, raw_id: taskId, source: "DAYDREAMS", title: "Expired Taskmarket task with no external submission", terms_hash: "terms-expired-077", estimated_net_usd: 3, blockers: [] };
const runtime = { opportunity_id: oppId, task_id: taskId, source: "DAYDREAMS", stage: "WAITING_ACCEPTANCE", submission_id: localSubmissionId, external_submission_readback: "PENDING", terms_hash: opp.terms_hash, attempts: 1, artifact_count: 1 };
const task = { id: taskId, status: "open", phase: "awaiting_settlement", expiryTime: "2026-10-25T19:01:41.002Z", submissionWindowOpen: false, claimedBy: null, awards: [] };
const pendingSeed = { version: "PENDING_WORK_ENGINE_V1", items: { [oppId]: { state: "WRITE_UNCERTAIN", allow_mutation: false, required_action: "SETTLEMENT_READBACK" } }, updated_at: at };
const watchdogSeed = { task_id: taskId, opportunity_id: oppId, last_stage: "RETRY_WAIT", last_progress_at: "2026-10-22T19:31:23.679Z", last_submission_id: null, last_external_readback: null, last_error_code: "TASKMARKET_HTTP_400", classification: "RECOVERY_REQUIRED", recommended_action: "FRESH_SOURCE_READBACK_AND_TERMINAL_FAILURE_REVIEW", anomaly: "TERMINAL_FAILURE_WITHOUT_ACTIVE_RUNTIME", anomaly_count: 1 };
const storage = new Storage({ task_runtime: { [oppId]: runtime }, opportunities: [opp], execution_readbacks: [], pending_work_v1: pendingSeed, economic_watchdog: watchdogSeed });
const brain = new ATMBrain({ storage }, {});
brain.taskmarketSubmissionReadback = async () => ({ ok: true, results: [], read_at: at });
brain.daydreamsReadTask = async () => ({ ok: true, task, read_at: at });
const first = await brain.monitorExecutionReadback("order077-test");
const afterRuntime = (await storage.get("task_runtime"))[oppId];
const pending = (await storage.get("pending_work_v1")).items[oppId];
const watchdog = await storage.get("economic_watchdog");
const rows = await storage.get("execution_readbacks");
if (first.checked !== 1 || first.pending !== 0) throw new Error("EXPIRED_NO_SUBMISSION_STILL_PENDING:" + JSON.stringify(first));
if (afterRuntime.stage !== "EXPIRED" || afterRuntime.terminal !== true) throw new Error("EXPIRED_STATE_NOT_TERMINAL:" + JSON.stringify(afterRuntime));
if (afterRuntime.external_submission_readback !== "EXPIRED_NO_SUBMISSION") throw new Error("EXTERNAL_ABSENCE_NOT_RECORDED");
if (!afterRuntime.expiry_evidence || afterRuntime.expiry_evidence.worker_task_submission_present !== false) throw new Error("EXPIRY_EVIDENCE_MISSING");
if (afterRuntime.paid_amount_usdc || afterRuntime.payment_receipt) throw new Error("NO_SUBMISSION_FABRICATED_PAYOUT");
if (pending?.state !== "EXPIRED" || pending.allow_mutation !== false || pending.required_action !== "NONE" || !pending.last_readback_hash) throw new Error("PENDING_LEDGER_NOT_CLOSED:" + JSON.stringify(pending));
if (watchdog?.last_external_readback !== "EXPIRED_NO_SUBMISSION" || watchdog?.classification !== "HEALTHY" || watchdog?.recommended_action !== "NONE" || watchdog?.last_error_code !== null) throw new Error("STALE_WATCHDOG_NOT_RECONCILED:" + JSON.stringify(watchdog));
if (!rows.some(x => x.submission_id === localSubmissionId && x.no_submission_proven === true && x.submission_readback === "EXPIRED_NO_SUBMISSION")) throw new Error("AUTHORITATIVE_READBACK_NOT_STORED");
const second = await brain.monitorExecutionReadback("order077-repeat");
if (second.checked !== 0 || second.pending !== 0) throw new Error("EXPIRED_TERMINAL_REPLAY_NOT_IDEMPOTENT:" + JSON.stringify(second));
console.log("ORDER077_EXACT_TASK_CORRELATION=PASS");
console.log("ORDER077_EXPIRED_NO_EXTERNAL_SUBMISSION=PASS");
console.log("ORDER077_PENDING_LEDGER_CLEARED=PASS");
console.log("ORDER077_STALE_WATCHDOG_RECONCILED=PASS");
console.log("ORDER077_NO_PAYOUT_FABRICATED=PASS");
console.log("ORDER077_REPEAT_IDEMPOTENT=PASS");
console.log("REAL_EXTERNAL_WRITES=0");
