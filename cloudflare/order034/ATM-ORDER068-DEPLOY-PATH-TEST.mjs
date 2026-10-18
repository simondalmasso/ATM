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
