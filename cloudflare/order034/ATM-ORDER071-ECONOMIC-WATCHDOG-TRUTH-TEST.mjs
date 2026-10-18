import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, "ATM-ORDER034-ACTIVE-MAIN-READONLY.js");
const tmp = path.join(os.tmpdir(), `atm-order071-watchdog-${process.pid}-${Date.now()}.mjs`);
let code = fs.readFileSync(src, "utf8")
  .replace('import { DurableObject } from "cloudflare:workers";', "class DurableObject { constructor(ctx, env) {} }")
  .replace('import { createReadOnlyGrant, listReadOnlyGrants, authorizeReadOnlyGrant, revokeReadOnlyGrant, sanitizeReadOnlyTasks } from "./ATM-ORDER068-READONLY-GRANTS.mjs";', "");
code += "\nexport { reconcileWatchdogRuntimeTruth };\n";
fs.writeFileSync(tmp, code, "utf8");
process.on("exit", () => { try { fs.unlinkSync(tmp); } catch {} });
const mod = await import(pathToFileURL(tmp).href + "?v=" + Date.now());

const abandoned = mod.reconcileWatchdogRuntimeTruth(
  { selected_task_id: "task-old" },
  {},
  {
    last_stage: "ABORTED",
    last_error_code: "VERIFIER_FAIL",
    classification: "HEALTHY",
    recommended_action: "NONE",
    last_paid_amount: 0
  }
);
assert.equal(abandoned.classification, "RECOVERY_REQUIRED");
assert.equal(abandoned.recommended_action, "FRESH_SOURCE_READBACK_AND_TERMINAL_FAILURE_REVIEW");
assert.equal(abandoned.anomaly, "TERMINAL_FAILURE_WITHOUT_ACTIVE_RUNTIME");
assert.equal(abandoned.active_runtime, false);

const errorWithoutStage = mod.reconcileWatchdogRuntimeTruth(
  {},
  {},
  { last_stage: null, last_error_code: "SUBMISSION_READBACK_FAILED", classification: "HEALTHY" }
);
assert.equal(errorWithoutStage.classification, "RECOVERY_REQUIRED");

const genuinelyIdle = mod.reconcileWatchdogRuntimeTruth(
  {},
  {},
  { last_stage: null, last_error_code: null, classification: "HEALTHY" }
);
assert.equal(genuinelyIdle.classification, "HEALTHY");
assert.equal(genuinelyIdle.recommended_action, "NONE");

const active = mod.reconcileWatchdogRuntimeTruth(
  { selected_task_id: "task-live" },
  { task: { task_id: "task-live", stage: "EXECUTING" } },
  { last_stage: "EXECUTING", classification: "HEALTHY" }
);
assert.equal(active.active_runtime, true);

console.log("ORDER-071 economic watchdog terminal-failure truth: PASS");
