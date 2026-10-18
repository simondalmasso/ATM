import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(here, "ATM-ORDER034-ACTIVE-MAIN-READONLY.js");
const tmp = path.join(os.tmpdir(), `atm-order065-task-events-${process.pid}-${Date.now()}.mjs`);
let code = fs.readFileSync(sourcePath, "utf8")
  .replace('import { DurableObject } from "cloudflare:workers";', 'class DurableObject { constructor(ctx, env) { this.ctx = ctx; this.env = env; } }')
  .replaceAll('"./ATM-ORDER066-HPA-MEDIA-ENGINE-V1.mjs"', JSON.stringify(pathToFileURL(path.join(here, "ATM-ORDER066-HPA-MEDIA-ENGINE-V1.mjs")).href));
fs.writeFileSync(tmp, code, "utf8");
process.on("exit", () => { try { fs.unlinkSync(tmp); } catch {} });
const { ATMBrain } = await import(pathToFileURL(tmp).href + "?v=" + Date.now());

const STORE_LIMIT_BYTES = 1_000_000;
const oversizedDetail = {
  code: "SOURCE_TERMS",
  type: "SOURCE_REQUIREMENT",
  evidence_kind: "SOURCE_TERMS",
  evidence_path_or_predicate: "source_terms.description_excerpt",
  safe_evidence_excerpt_or_hash: "excerpt-".repeat(120),
  observed_at: "2026-10-13T00:00:00.000Z",
  source_task_id: "historical-task",
  terms_hash: "historical-terms",
  evidence: { description: "raw-evidence-".repeat(120) }
};
const history = Array.from({ length: 2_000 }, (_, i) => ({
  event_key: `historical:${i}`,
  task_id: `historical-task-${i}`,
  source: "DAYDREAMS",
  source_task_id: `external-${i}`,
  observed_at: "2026-10-12T00:00:00.000Z",
  terms_hash: `terms-${i}`,
  reward: 150,
  currency: "USDC",
  mode: "bounty",
  capability_class: "TEXT_RESEARCH",
  policy_decision: "BLOCKED",
  blockers: ["SOURCE_TERMS".repeat(12)],
  blocker_details: [structuredClone(oversizedDetail)],
  transition: "DISCOVERED",
  acquisition_attempt: null,
  acquisition_id: null,
  execution_job_id: null,
  artifact_hash: null,
  submission_id: null,
  external_status: "open",
  payment_receipt: null,
  timestamp: "2026-10-12T00:00:00.000Z"
}));
const store = new Map([["task_events", history]]);
const writes = [];
const storage = {
  async get(key) {
    return store.has(key) ? structuredClone(store.get(key)) : undefined;
  },
  async put(key, value) {
    const bytes = Buffer.byteLength(JSON.stringify(value), "utf8");
    if (bytes > STORE_LIMIT_BYTES) throw new Error("string or blob too big: SQLITE_TOOBIG");
    writes.push({ key, bytes });
    store.set(key, structuredClone(value));
  }
};
const brain = new ATMBrain({ storage }, {});
const opp = {
  opportunity_id: "DAYDREAMS:new-task",
  source: "DAYDREAMS",
  raw_id: "new-task",
  terms_hash: "new-terms",
  payout_amount: 150,
  payout_currency: "USDC",
  mode: "bounty",
  capability_class: "TEXT_RESEARCH",
  blockers: [],
  blocker_details: [structuredClone(oversizedDetail)]
};

const receipt = {
  external_ref: "verified-settlement-reference",
  status: "SETTLED",
  amount: 150,
  currency: "USDC",
  evidence: "oversized-receipt-evidence-".repeat(120)
};
const returned = await brain.appendTaskEvent(opp, "PAID", {
  external_status: "SETTLED",
  payment_receipt: receipt
});
const saved = store.get("task_events");
const bytes = Buffer.byteLength(JSON.stringify(saved), "utf8");
if (writes.length !== 1 || writes[0].key !== "task_events") throw new Error("TASK_EVENTS_WRITE_MISSING");
if (bytes > 750_000) throw new Error(`TASK_EVENTS_HISTORY_EXCEEDS_750KB:${bytes}`);
if (!Array.isArray(saved) || saved.length > 2_000 || saved.length === 0) throw new Error("TASK_EVENTS_RETENTION_INVALID");
if (saved.at(-1)?.event_key !== returned.event_key) throw new Error("NEWEST_TASK_EVENT_NOT_PRESERVED");
if (saved.some(event => (event.blocker_details || []).some(detail => Object.hasOwn(detail, "evidence")))) {
  throw new Error("UNBOUNDED_RAW_BLOCKER_EVIDENCE_PERSISTED");
}
const persistedNewest = saved.at(-1);
if (persistedNewest.payment_receipt?.external_ref !== receipt.external_ref) throw new Error("SETTLEMENT_REFERENCE_LOST");
if (persistedNewest.payment_receipt?.status !== "SETTLED") throw new Error("SETTLEMENT_STATUS_LOST");
if ((persistedNewest.blocker_details?.[0]?.safe_evidence_excerpt_or_hash || "").length > 240) {
  throw new Error("SAFE_EVIDENCE_EXCERPT_NOT_BOUNDED");
}
const longIdentity = {
  ...opp,
  opportunity_id: "DAYDREAMS:" + "x".repeat(2_000),
  raw_id: "long-task",
  terms_hash: "long-terms",
  blocker_details: []
};
await brain.appendTaskEvent(longIdentity, "DISCOVERED", {});
const writesAfterLongIdentity = writes.length;
const persistedLongEvent = store.get("task_events").at(-1);
if (!persistedLongEvent?.event_key?.startsWith("sha256:")) throw new Error("LONG_EVENT_KEY_NOT_HASHED");
const replayedLong = await brain.appendTaskEvent(longIdentity, "DISCOVERED", {});
if (writes.length !== writesAfterLongIdentity) throw new Error("LONG_EVENT_REPLAY_NOT_IDEMPOTENT");
if (replayedLong.event_key !== persistedLongEvent.event_key) throw new Error("LONG_EVENT_REPLAY_KEY_CHANGED");

console.log(JSON.stringify({
  ok: true,
  test: "ORDER-065_TASK_EVENTS_BOUNDED_TO_STORAGE_BUDGET",
  preservedNewestEvent: true,
  preservedSettlementReference: true,
  rawEvidenceRemovedFromEventHistory: true,
  storedBytes: bytes,
  maxStoredBytes: 750_000,
  retainedRows: saved.length,
  maxRows: 2_000,
  longEventReplayIdempotent: true
}, null, 2));
