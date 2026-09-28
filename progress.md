# ATM CURRENT CHECKPOINT — ORDER-060

Updated: 2026-09-28
Mode: present-tense operational handoff for a fresh GPT agent.

## Canon
- GitHub source authority: https://github.com/simondalmasso/ATM
- GitLab is downstream mirror only.
- Production: https://atm.simondalmasso44.workers.dev/
- AGENTS.md rules remain authoritative.
- OWNER_SPEND_USD=0.
- Public MCP remains READ_ONLY.
- Never install or run Julia/Laya/Lev/Jev, DCP, SkillOpt or OpenScience on the owner's PC.
- Never treat candidate/provider presence as executor proof.
- Never count DCC, prizes, submissions, balances or promises as USD PAID without exact authoritative settlement readback.

## Current order
- Issue: #81 — ATM-ORDER-060
- PR: #82 — merged
- Feature branch: order060-runtime-capability-intake-v1
- Feature head: 2b8d29148363331e130a0e3068d6699f5b4227e5
- Merge/main SHA: c257b5a42f7a4384e8da0b96b52a30359eb30620
- Exact-head CI: ATM CI run 36389099930 = SUCCESS
- Issue #81 state: CLOSED/completed

## Implemented now
- Superteam Argentina / Road to Colosseum is persisted beside Meta hackathon as WATCH.
- User registration state is PENDING APPROVAL; no email/sender PII is persisted.
- SYSTEM_ONE_PROVIDER_REGISTRY_V1 includes JULIA_1, LAYA, LEV, JEV.
- EXTERNAL_CAPABILITY_CANDIDATES_V1 includes DCP, SKILLOPT, OPENSCIENCE.
- DCP and OpenScience exist in WORKER_PROVEN_REGISTRY_V1 with proven=false.
- All new candidates have max_owner_cost_usd=0, runtime_mounted=false and owner_pc_allowed=false.
- Cloudflare fit is explicit:
  - JULIA_1/LAYA/LEV: NO_DIRECT_RUNTIME.
  - JEV: REMOTE_CALL_ONLY and zero-cost endpoint not proven.
  - DCP: NO_DIRECT_RUNTIME because native DCP evaluator is required.
  - SkillOpt: NO_DIRECT_RUNTIME because Python optimization loop is required.
  - OpenScience: NO_DIRECT_RUNTIME because shell/Python/R/filesystem runtime is required.
- ATM Worker continues using native Workers AI @cf/zai-org/glm-4.7-flash.
- Superteam UI tests and ORDER-060 contract tests pass.

## Cloudflare free feasibility already established
- Workers Free isolate memory limit: 128 MB.
- Workers Free CPU limit for normal requests: 10 ms.
- Workers AI free allocation: 10,000 neurons/day.
- ATM internal safe budget: 9,500 neurons/day and hard model call cap 240.
- Live ATM readback during ORDER-060: calls_used=0, reserved_neurons=0.
- Previous deployed ATM bundle: 416.29 KiB upload / 105.80 KiB gzip; startup 2 ms.
- Direct Julia/Laya/Lev/DCP/SkillOpt/OpenScience runtimes must NOT be mounted inside the free Worker.

## Verification already passed on feature bytes
- Every Node command listed in .github/workflows/ci.yml: PASS.
- Python compileall: PASS.
- Python unittest: 3/3 PASS.
- secret_doctor.py: PASS.
- payout_doctor.py: PASS.
- all research/current/*.json parse: PASS.
- git diff --check: PASS.
- No new public mutation MCP tools.
- No new external POST route.
- No signer/wallet/transfer/withdrawal/x402 authority expansion.

## Exact continuation for a fresh GPT agent
1. Read AGENTS.md, AUD_CANON.md, ARQ_CANON.md, this file, issue #81 and PR #82.
2. Verify GitHub main is c257b5a42f7a4384e8da0b96b52a30359eb30620 or identify newer canonical drift before taking action.
3. Verify PR-head CI run 36389099930 remains SUCCESS for feature SHA 2b8d29148363331e130a0e3068d6699f5b4227e5.
4. Find the post-merge ATM CI run for main SHA c257b5a42f7a4384e8da0b96b52a30359eb30620. Require SUCCESS.
5. Find the canonical Cloudflare Deploy workflow triggered by that post-merge CI. Require runtime-change gate, candidate exact-SHA smoke, exact promotion, production exact-SHA smoke, and rollback skipped.
6. Read production /health and require git_sha=c257b5a42f7a4384e8da0b96b52a30359eb30620 and runtime=RUNNING.
7. Read production /api/status and require galaxy_radar.version=ATM-ORDER-060-V1, all provider/candidate registries present, all new candidates fail-closed, owner spend zero, and no invented PAID.
8. Fetch production home page and require both Meta hackathon and SUPERTEAM ARGENTINA · ROAD TO COLOSSEUM with REGISTRATION SUBMITTED · PENDING APPROVAL.
9. Verify GitLab main SHA equals GitHub main SHA; do not run a GitLab runner.
10. Add final evidence to issue #81.
11. Mark ORDER_060_STATUS=READY_FOR_AUD only after all above are evidenced.
12. Before any subsequent work, update this checkpoint in present tense with the new active order and exact next steps.

## What must NOT happen next
- Do not install runtimes on owner PC.
- Do not claim Julia/Laya/Lev/Jev/DCP/SkillOpt/OpenScience are working executors.
- Do not change PROVEN=false without a separate bounded E2E contract and independent receipt.
- Do not spend owner money or use paid API/compute fallback.
- Do not bypass canonical GitHub exact-SHA deploy workflow.
