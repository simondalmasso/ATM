# ATM RSI Decision Engine and Repository Hygiene Implementation Plan

> **For agentic workers:** Use the host's available task-by-task implementation workflow. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add a bounded RSI-inspired ranking layer to ATM, verify its fail-closed behavior, and improve repository documentation without changing production authority.

**Architecture:** Keep deterministic admission and fresh source-policy readback as the only execution gates. Use the existing GLM Workers AI path for one bounded ranking proposal over at most five admitted candidates, validate the exact candidate permutation locally, and fall back to the current deterministic order on every failure. Persist only compact decisions and outcomes proven by existing external readbacks.

**Tech Stack:** Cloudflare Worker JavaScript, Durable Object storage, existing GLM Workers AI binding, Node.js 22 test scripts, GitHub Actions.

## Global Constraints

- `MIN_REWARD_USD >= 100`; `OUT_OF_PLAN_SPEND_USD = 0`.
- No paid APIs, new dependencies, model downloads, owner-funded credits, deposits, stakes, gambling, trading, or mining.
- `UNKNOWN != YES`; deterministic source, payout, executor, and owner-spend gates remain authoritative.
- RSI has `RANKING_ONLY` authority. It cannot admit candidates, remove blockers, set `AI_EXECUTABLE`, change the reward floor, select a new executor, or authorize claim, submit, signing, wallet, or settlement actions.
- Preserve `freshExecutionPolicy()` immediately before the existing action path.
- Maximum five candidate IDs, one existing GLM call per ranking decision, fixed output-token cap, no retries, deterministic fallback on errors.
- Feedback may use only accepted/rejected/paid outcomes grounded in authoritative external readbacks. Model output, estimated reward, stale state, and chat text are not outcome labels.
- Public MCP stays read-only. No boQA integration, GitLab authoring, production deploy, or direct `main` write.
- Preserve unrelated and historical evidence; no deletion without an exact verified target.

---

### Task 1: Add failing tests for pure RSI contracts

**Files:**
- Create: `cloudflare/order034/ATM-ORDER034-RSI-HELPERS-TEST.mjs`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- The test imports the real Worker source after replacing only the Cloudflare Durable Object import with a minimal test shim.
- The Worker will expose pure helpers `baselineOpportunityOrderV1`, `validateRsiRankingV1`, `rsiDecisionStatusV1`, `appendRsiDecisionHistoryV1`, `applyVerifiedRsiOutcomeV1`, and `rsiOutcomeFeedbackV1` to the test harness only by appended exports.

- [x] **Step 1: Add the focused failing test**

Assert deterministic capability/net-reward/task-ID order without input mutation; valid exact permutations; rejection of malformed JSON, duplicate/missing/extra IDs, oversized rationale and IDs; fixed ranking-only authority metadata; 50-record history bound; and feedback acceptance only for exact matched decisions with authoritative-readback markers and 64-character evidence hashes.

- [x] **Step 2: Verify the relevant failure**

Run: `node cloudflare/order034/ATM-ORDER034-RSI-HELPERS-TEST.mjs`

Expected before implementation: non-zero exit with `RSI_HELPER_MISSING` naming the absent pure helper(s), not a syntax/import/setup failure.

- [x] **Step 3: Implement the minimum pure helpers**

Add the six pure helpers near existing Worker policy helpers. Require strict schema version `RSI_DECISION_V1`, exact candidate permutation, at most five unique IDs, maximum 160 characters per ID, maximum 400 characters of rationale, and outcome evidence bound to source/task/opportunity identity. Keep history at 50 records and feedback at five verified outcomes.

- [x] **Step 4: Verify the focused pass**

Run: `node cloudflare/order034/ATM-ORDER034-RSI-HELPERS-TEST.mjs`

Expected: all helper assertions pass and report zero production mutation.

- [x] **Step 5: Run the affected integration check**

Run the full `verify` job via the feature-branch pull request after the test is added to CI.

Expected: the new helper test passes; unrelated existing CI tests remain unchanged.

- [x] **Step 6: Commit the passing deliverable**

Commit only the plan, helper test, CI test hook, and later helper implementation in their appropriate TDD commits.

### Task 2: Integrate bounded RSI ranking and read-only observability

**Files:**
- Modify: `cloudflare/order034/ATM-ORDER034-ACTIVE-MAIN-READONLY.js`
- Create: `cloudflare/order034/ATM-ORDER034-RSI-DECISION-TEST.mjs`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- `ATMBrain.chooseTaskmarketCandidate(opps)` keeps its return shape and existing admission/readback gates.
- `ATMBrain.status()` exposes `decision_engine`.
- `ATMBrain.tool("rank_opportunities", ...)` stays deterministic and never calls the model.
- The integration test stubs only the existing AI boundary and fresh external policy readback.

- [x] **Step 1: Add the focused failing integration test**

Assert blocked candidates are absent from model input; at most one call is made for multiple candidates; a single candidate skips inference; malformed output and quota/model failure retain the baseline; RSI cannot bypass fresh policy readback; and `rank_opportunities` remains read-only and deterministic.

- [x] **Step 2: Verify the relevant failure**

Run: `node cloudflare/order034/ATM-ORDER034-RSI-DECISION-TEST.mjs`

Expected before selector integration: non-zero assertion showing the current selector does not use the bounded RSI ranking or expose its metadata.

- [x] **Step 3: Implement the minimum integration**

After deterministic admission, preserve the full baseline order, ask the existing GLM path to reorder only the first five admitted opportunity IDs, validate the strict JSON response, and append the untouched baseline tail. Never include task bodies or accept model-provided eligibility/reward facts. Fall back without retry on quota exhaustion, model failure, truncation, invalid schema, or timeout.

- [x] **Step 4: Verify the focused pass**

Run: `node cloudflare/order034/ATM-ORDER034-RSI-DECISION-TEST.mjs`

Expected: bounded-call, blocked-candidate, fallback, and fresh-readback assertions pass.

- [x] **Step 5: Run the affected integration check**

Run the full `verify` job on the draft pull request.

Expected: new RSI tests and all existing Worker, Python, secret, payout, and repository-integrity tests pass.

- [x] **Step 6: Commit the passing deliverable**

Commit the selector and integration-test changes without merging or deploying.

### Task 3: Connect only verified settlement outcomes to bounded RSI history

**Files:**
- Modify: `cloudflare/order034/ATM-ORDER034-ACTIVE-MAIN-READONLY.js`
- Modify: `cloudflare/order034/ATM-ORDER034-RSI-DECISION-TEST.mjs`

**Interfaces:**
- Existing `monitorExecutionReadback()` remains the only source of accepted/rejected/paid feedback.
- The history stores compact IDs, ordering, validation state, and hashed readback evidence; it stores no secrets or full task bodies.

- [x] **Step 1: Add failing feedback assertions**

Verify accepted/rejected/paid records require the matching selected opportunity, source, task ID, authoritative readback type, timestamp, and evidence hash; a model-originated or unmatched outcome is ignored; accepted may advance to paid but paid is never downgraded; history and prompt feedback remain bounded.

- [x] **Step 2: Verify the relevant failure**

Run: `node cloudflare/order034/ATM-ORDER034-RSI-DECISION-TEST.mjs`

Expected before feedback integration: the relevant history assertion fails because execution readbacks are not yet attached to RSI decisions.

- [x] **Step 3: Implement feedback wiring**

Record a compact decision after fresh policy selection. In the existing Hansa and TaskMarket readback branches, attach outcomes only after the existing external evidence checks succeed. Store the hash of the readback row, update the matching decision only, and include at most five verified outcome summaries in a later RSI prompt.

- [x] **Step 4: Verify the focused pass**

Run: `node cloudflare/order034/ATM-ORDER034-RSI-DECISION-TEST.mjs`

Expected: authoritative outcomes update matching decisions; untrusted, stale, malformed, or mismatched outcomes do not.

- [x] **Step 5: Run the affected integration check**

Run the full pull-request `verify` job.

Expected: all RSI and existing tests pass; public MCP tool inventory remains unchanged.

- [x] **Step 6: Commit the passing deliverable**

Commit feedback wiring and tests on `feat/atm-rsi-decision-engine-v1`.

### Task 4: Improve README clarity, discoverability, and repository hygiene

**Files:**
- Modify: `README.md`
- Create: `docs/maintenance/repository-metadata.md`

**Interfaces:**
- README is the public landing page and canonical overview.
- The metadata note records a concise GitHub About description and a small, relevant topic set for manual application if repository-settings write access is unavailable.

- [x] **Step 1: Add documentation checks**

Check the proposed README and metadata note for canonical links, current architecture, safety boundaries, exact test commands, no unsupported earnings claims, and no conflicting deployment statements.

- [x] **Step 2: Verify current documentation scope**

Run: `git diff --check` and inspect the documentation diff on the pull request.

Expected before documentation changes: no source change is involved; any failing documentation assertion identifies a specific missing or contradictory section.

- [x] **Step 3: Update documentation without deleting evidence**

Make the opening description searchable and precise; add canonical links, current safety/authority boundaries, a concise verification section, and relevant topic recommendations. Preserve historical orders, research, and existing production facts.

- [x] **Step 4: Verify documentation**

Run: `git diff --check` and the full pull-request `verify` job.

Expected: clean whitespace, intact canonical links, and no repository-integrity regressions.

- [x] **Step 5: Inspect final diff and CI**

Review changed paths and exact head SHA. Confirm the deployment workflow cannot run for a feature-branch pull request.

- [x] **Step 6: Commit the passing documentation change**

Keep the change on the feature branch. Do not merge to `main`, deploy Cloudflare, or update GitLab.

## Unresolved external constraints

- The connected GitHub tool exposes file/branch/PR operations but no repository-settings write action. The actual GitHub About description and repository topics therefore remain unapplied unless a settings-write capability becomes available; the proposed values will be documented exactly.
- No file is designated for deletion: current repository evidence says historical orders and experiments should remain recoverable.
