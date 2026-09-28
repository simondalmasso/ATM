# ATM CURRENT CHECKPOINT — ORDER-060

Updated: 2026-09-28
Status: ORDER-060 is merged, deployed, live-verified and ready for AUD.
Purpose: present-tense handoff for a fresh GPT agent starting from zero inside this project.

## Canon and invariants
- GitHub source authority: https://github.com/simondalmasso/ATM
- GitLab is downstream mirror only; do not author there and do not use GitLab runners.
- Production: https://atm.simondalmasso44.workers.dev/
- AGENTS.md, AUD_CANON.md and ARQ_CANON.md remain authoritative.
- OWNER_SPEND_USD=0.
- Public MCP remains READ_ONLY.
- Never install or run Julia/Laya/Lev/Jev, DCP, SkillOpt or OpenScience on the owner's PC.
- Never treat candidate/provider presence as executor proof.
- Never count DCC, prizes, submissions, balances or promises as USD PAID without exact authoritative settlement readback.

## ORDER-060 completed state
- Issue: #81 — CLOSED/completed.
- PR: #82 — MERGED.
- Feature branch: order060-runtime-capability-intake-v1.
- Feature head: 2b8d29148363331e130a0e3068d6699f5b4227e5.
- Runtime merge SHA: c257b5a42f7a4384e8da0b96b52a30359eb30620.
- PR-head ATM CI: 36389099930 = SUCCESS.
- Post-merge ATM CI: 36389150176 = SUCCESS.
- GitLab downstream mirror: 36389150060 = SUCCESS.
- Cloudflare deploy: 36389175783 = SUCCESS.
- Cloudflare candidate version: f15d4773-12e0-41e5-b272-cb1c3d77ab8b.
- Rollback/main previous version: 0686269d-3b69-4ad5-9c02-812145ce9c9d.
- Candidate exact-SHA smoke: PASS.
- Production exact-SHA smoke: PASS.
- Rollback step: SKIPPED.
- Signer deployment steps: SKIPPED because signer bytes did not change.
- GitHub main runtime SHA and GitLab main are both c257b5a42f7a4384e8da0b96b52a30359eb30620.

## Live production truth
- /health git_sha = c257b5a42f7a4384e8da0b96b52a30359eb30620.
- runtime = RUNNING.
- execution_enabled = true.
- durable_object = true.
- galaxy_radar.version = ATM-ORDER-060-V1.
- system_one_providers = JULIA_1, LAYA, LEV, JEV.
- external_capability_candidates = DCP, SKILLOPT, OPENSCIENCE.
- Every new candidate/provider remains proven=false and runtime_mounted=false.
- Every new candidate/provider has owner_pc_allowed=false.
- JULIA_1/LAYA/LEV cloudflare_worker_fit = NO_DIRECT_RUNTIME.
- JEV cloudflare_worker_fit = REMOTE_CALL_ONLY and zero-cost endpoint is not proven.
- DCP/SKILLOPT/OPENSCIENCE cloudflare_worker_fit = NO_DIRECT_RUNTIME.
- zero_spend.out_of_pocket_spend_usd = 0.
- money_path.owner_spend_usd = 0.
- money_path.PAID_EXTERNAL = 0.
- money_path.WORKERS_PROVEN = [].
- money_path.next_binding_constraint = PENDING_WORK.
- Workers AI live ATM quota readback: calls_used=0, reserved_neurons=0, safe_neuron_budget=9500, free_allocation_neurons=10000.
- Production UI contains both META GLOBAL AI DEVELOPER HACKATHON and SUPERTEAM ARGENTINA · ROAD TO COLOSSEUM.
- Superteam state shown live: REGISTRATION SUBMITTED · PENDING APPROVAL.
- No user email/sender PII is persisted.

## Implemented contracts
- SYSTEM_ONE_PROVIDER_REGISTRY_V1 includes Julia-1, Laya, Lev and Jev as fail-closed advisory/provider candidates.
- Laya direct policy role remains KILLED from prior replay evidence.
- EXTERNAL_CAPABILITY_CANDIDATES_V1 includes DCP, SkillOpt and OpenScience.
- DCP is a compute-worker candidate only; DCC is not USD and count_as_paid_usd=false.
- SkillOpt is an offline skill optimizer only; it cannot promote executors or change money/policy gates.
- OpenScience is an external scientific executor candidate only; Ace, paid provider API, paid remote compute and paid BYOK routes are blocked.
- DCP and OpenScience appear in WORKER_PROVEN_REGISTRY_V1 with proven=false.
- ATM Worker-side inference remains native Workers AI @cf/zai-org/glm-4.7-flash.

## Cloudflare Free feasibility
- Workers Free isolate memory limit: 128 MB.
- Workers Free normal-request CPU limit: 10 ms.
- Workers AI free allocation: 10,000 neurons/day.
- ATM internal safe budget: 9,500 neurons/day; hard model call cap: 240.
- ORDER-060 deployed bundle: 422.34 KiB upload / 107.35 KiB gzip.
- Direct Julia/Laya/Lev/DCP/SkillOpt/OpenScience runtimes do not fit the Cloudflare Worker execution model safely; they are not mounted.
- Only Cloudflare-native Worker/Workers AI execution is considered active in this order.

## Verification passed
- Every Node command declared in .github/workflows/ci.yml: PASS.
- Python compileall: PASS.
- Python unittest: 3/3 PASS.
- secret_doctor.py: PASS.
- payout_doctor.py: PASS.
- all research/current/*.json parse: PASS.
- git diff --check: PASS.
- No new public mutation MCP tool.
- No new external POST route.
- No signer/wallet/transfer/withdrawal/x402 authority expansion.
- No runtime installed on owner PC.
- No owner spend.

## Files delivered by ORDER-060
- .github/workflows/ci.yml
- cloudflare/order034/ATM-ORDER034-ACTIVE-MAIN-READONLY.js
- cloudflare/order034/ATM-ORDER034-WIN101-UI-CANDIDATE.js
- cloudflare/order034/ATM-ORDER034-WIN101-UI-TEST.mjs
- cloudflare/order034/ATM-ORDER060-CAPABILITY-INTAKE-TEST.mjs
- research/current/candidate-ledger.jsonl
- research/current/external-worker-candidates.json
- research/current/capability-optimizer-candidates.json
- research/current/superteam-colosseum-salta-watch.json
- research/current/system-one-provider-candidates.json
- docs/superpowers/plans/2026-09-28-order060-capability-intake-v1.md
- progress.md

## Exact continuation for a fresh GPT agent
1. Read AGENTS.md, AUD_CANON.md, ARQ_CANON.md and this progress.md first.
2. Fetch issue #81 and PR #82 and confirm the evidence above rather than relying on chat memory.
3. Read current GitHub main and production /health. A docs-only checkpoint merge may make GitHub main newer than c257b5a; production runtime must remain c257b5a until another runtime-changing order deploys.
4. Verify GitLab main equals current GitHub main before declaring mirror parity.
5. Read production /api/status and keep these truths separate:
   - provider/candidate registry membership is not executor proof,
   - runtime_mounted=false means not running,
   - PROVEN=false means do not route task execution to it,
   - PAID_EXTERNAL is the only realized external-money count.
6. Treat ORDER-060 as complete. Do not reopen it merely to mount heavy runtimes.
7. Reconcile AUD_CANON/ARQ_CANON with the closed ORDER-060 state. If canon names a new active order, execute only that order.
8. If canon has no new active order yet, use the live next_binding_constraint=PENDING_WORK as evidence for AUD selection; do not invent a parallel ARQ.
9. For any new work, create/assign one GitHub issue before edits, branch from fresh main, use TDD, exact-head CI, protected merge, canonical exact-SHA deployment only when runtime bytes change, production readback, mirror parity, and a new present-tense checkpoint here.
10. Before the chat/session ends or after every material state transition (commit, PR, merge, deploy, blocker), update progress.md with:
   - current order,
   - branch/head/main/prod SHAs,
   - CI/deploy IDs,
   - live money/executor truth,
   - exact next commands/actions for a zero-context GPT.

## Hard prohibitions carried forward
- Do not install these candidate runtimes on owner PC.
- Do not claim Julia/Laya/Lev/Jev/DCP/SkillOpt/OpenScience are working executors.
- Do not change PROVEN=false without a separate bounded E2E contract and independent receipt.
- Do not spend owner money or use paid API/compute fallback.
- Do not bypass human gates.
- Do not widen signer or wallet authority.
- Do not bypass canonical GitHub exact-SHA deploy workflow.
