import assert from "node:assert/strict";
import fs from "node:fs";

const workflow = fs.readFileSync(".github/workflows/deploy-cloudflare.yml", "utf8");
const line = workflow.split("\n").find((value) => value.includes("if grep -Eq") && value.includes("changed.txt"));
assert.ok(line, "canonical deploy path gate must exist");

const match = line.match(/grep -Eq '([^']+)' "\$RUNNER_TEMP\/changed\.txt"/);
assert.ok(match, "cannot extract canonical deploy path-gate expression");
const productionPaths = new RegExp(match[1]);

for (const path of [
  "cloudflare/order034/ATM-ORDER034-ACTIVE-MAIN-READONLY.js",
  "cloudflare/order034/ATM-ORDER034-WIN101-UI-CANDIDATE.js",
  "cloudflare/order034/wrangler.order034.main.jsonc",
  "cloudflare/order034/ATM-ORDER068-READONLY-GRANTS.mjs"
]) {
  assert.ok(productionPaths.test(path), `production-relevant path is not deploy-triggering: ${path}`);
}

for (const path of [
  "docs/specs/2026-10-18-order068-readonly-grants-design.md",
  "cloudflare/order034/ATM-ORDER068-READONLY-GRANTS-TEST.mjs"
]) {
  assert.equal(productionPaths.test(path), false, `non-runtime path should not trigger deployment: ${path}`);
}

console.log("ORDER-068 deploy path gate: PASS");

function stepBlock(name) {
  const marker = `- name: ${name}`;
  const start = workflow.indexOf(marker);
  assert.ok(start >= 0, `missing workflow step: ${name}`);
  const next = workflow.indexOf("\n      - name:", start + marker.length);
  return workflow.slice(start, next < 0 ? workflow.length : next);
}

const signerUpload = stepBlock("Upload signer candidate");
const mainUpload = stepBlock("Upload main candidate without production traffic");
for (const [name, block, logName] of [
  ["signer", signerUpload, "signer-upload.log"],
  ["main", mainUpload, "main-upload.log"]
]) {
  assert.ok(block.includes("versions upload"), `${name} must upload a version`);
  assert.ok(block.includes(logName), `${name} upload output must be captured`);
  assert.ok(block.includes("Worker Version ID:"), `${name} must extract Wrangler's direct version ID`);
  assert.ok(block.includes("console.log('version_id=' + match[1])"), `${name} must expose the uploaded version ID to following steps`);
  assert.equal(block.includes("versions list --json"), false, `${name} must not rely on eventual consistency of versions list`);
}
assert.equal(workflow.includes("candidate exact-SHA version not found"), false, "brittle list-based exact-SHA parser must be removed");

console.log("ORDER-051 upload version ID parsing: PASS");
const stage = stepBlock("Stage main candidate at zero percent");
assert.ok(stage.includes("max_attempts=5"), "staging must retry Cloudflare's eventual-consistency window with a bound");
assert.ok(stage.includes("sleep \"$delay\""), "staging retries must back off between attempts");
assert.ok(stage.includes("exit 1"), "staging must fail closed after bounded retries");
assert.ok(stage.includes("$PREVIOUS@100%") && stage.includes("$NEW@0%"), "staging retries must preserve previous 100% / candidate 0%");
console.log("ORDER-051 bounded zero-percent staging retry: PASS");

