import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const registryPath = path.resolve(here, "../../research/current/external-worker-candidates.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

assert.equal(registry.schema_version, "atm/external-worker-candidates-v1");
assert.equal(registry.policy.repos_read_only, true);
assert.equal(registry.policy.repo_mutation_allowed, false);
assert.equal(registry.policy.runtime_executor_authority, false);
assert.equal(registry.policy.owner_spend_usd, 0);

for (const id of ["API_ANYTHING", "REVERSE_API_ENGINEER"]) {
  const candidate = registry.candidates.find((item) => item.id === id);
  assert.ok(candidate, `missing candidate: ${id}`);
  assert.equal(candidate.state, "READ_ONLY_RESEARCH_TOOL_CANDIDATE");
  assert.equal(candidate.runtime_mounted, false);
  assert.equal(candidate.proven, false);
  assert.equal(candidate.owner_pc_allowed, false);
  assert.equal(candidate.economic_source, false);
  assert.equal(candidate.license, "MIT");
  assert.match(candidate.repository, /^https:\/\/github\.com\//);
  assert.ok(candidate.blockers.length > 0, `${id} must retain explicit blockers`);
  assert.ok(candidate.constraints.some((item) => /public endpoint/i.test(item)));
  assert.ok(candidate.constraints.some((item) => /owner pc/i.test(item)));
  assert.ok(candidate.constraints.some((item) => /captcha|access-control/i.test(item)));
  for (const forbidden of [
    "TASK_ACQUISITION_EXECUTOR",
    "TASK_SUBMISSION_EXECUTOR",
    "AUTHENTICATED_WRITE_REPLAYER",
    "WALLET_OR_PAYMENT_ACTOR",
    "ATM_SETTLEMENT_AUTHORITY"
  ]) {
    assert.ok(candidate.forbidden_roles.includes(forbidden), `${id} missing forbidden role ${forbidden}`);
  }
}

console.log("ORDER-070 external API research candidates: PASS (read-only, unmounted, non-executor)");
