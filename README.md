# ATM — Agent Teller Machine

ATM is a zero-spend Cloudflare Worker intended to convert eligible digital work into externally settled, withdrawable value. Activity, model output, discovered rewards, claims, and submissions are not earnings.

Canonical loop: `DISCOVER -> ECONOMIC GATE -> ACQUIRE -> WORK -> CHECK -> SUBMIT -> SETTLEMENT READBACK -> LEARN`.

## Non-negotiable policy

- `OUT_OF_PLAN_SPEND_USD=0`: no paid APIs/credits, deposits, stakes, trading, gambling, or mining.
- `UNKNOWN != YES`; missing or stale evidence fails closed.
- `PAID/SETTLED` requires authoritative external settlement tied to ATM work.
- CHECK is independent from SUBMIT; retries are bounded and idempotent.
- Public MCP and temporary ORDER-068 grants are read-only. No signing, claim, submit, payment, or withdrawal authority is granted through them.
- The private signer is isolated behind its private service binding and limited to bounded Taskmarket claim/submit operations. No private key or seed belongs in the main Worker.
- GitHub `main` is the sole authoring/deployment source. GitLab is a downstream mirror.

## Current verified state (2026-10-27)

GitHub `main` is `4be5f1bb56c47d3ae2435f525eadeee6f402fde0`. Exact-head CI, GitLab mirror, and Cloudflare exact-SHA deploy/smoke runs succeeded. A cache-busted production health read reports the same SHA and RUNNING runtime. That is deployment health, not earning health.

Latest live read: discovery DEGRADED (4/7 sources healthy), 30 raw opportunities, 0 admitted; claimed=3, submitted=1, accepted=0, paid=0; one settlement item is pending with a write-uncertain flag; withdrawable=0. The economic watchdog remains RECOVERY_REQUIRED. See [report/order076-main-audit.md](report/order076-main-audit.md) for evidence and safe next action.

## Repository map

See [docs/REPOSITORY_MAP.md](docs/REPOSITORY_MAP.md) for canonical paths, evidence hierarchy, and the safe change workflow. Historical orders and old checkpoints are retained as history, not live state.

## Canonical runtime

- Main Worker config: `cloudflare/order034/wrangler.order034.main.jsonc`
- UI entry: `cloudflare/order034/ATM-ORDER034-WIN101-UI-CANDIDATE.js`
- Active runtime: `cloudflare/order034/ATM-ORDER034-ACTIVE-MAIN-READONLY.js`
- Private signer config: `cloudflare/order034/wrangler.order034.signer.jsonc`
- Private signer source: `cloudflare/order034/ATM-ORDER034-FINAL-SIGNER-CANDIDATE.mjs`

The deployed status endpoint, not source files alone, establishes runtime state.

## Read-only production surfaces

- [Dashboard](https://atm.simondalmasso44.workers.dev/)
- [Health](https://atm.simondalmasso44.workers.dev/health)
- [Status](https://atm.simondalmasso44.workers.dev/api/status)
- [Opportunities](https://atm.simondalmasso44.workers.dev/api/opportunities)
- [Money loop](https://atm.simondalmasso44.workers.dev/api/money-loop)
- [Task events](https://atm.simondalmasso44.workers.dev/api/task-events)

Never count a claim, submission, acceptance estimate, or pending transfer as realized earnings. Only an authoritative external paid receipt counts.

## Deployment authority and rollback

The Cloudflare workflow follows successful ATM CI for pushes to `main`, checks the tested SHA, injects that SHA, runs Wrangler dry-runs, stages a candidate at zero traffic, smoke-tests the exact candidate, promotes the tested version, and verifies production with rollback on failure. Do not bypass this workflow or mutate production directly.

## Verification

The authoritative required command list is [.github/workflows/ci.yml](.github/workflows/ci.yml). It includes behavioral Node tests, Python unit tests, secret/payout diagnostics, repository hygiene checks, and deployment-path invariants. Use the workflow itself as the complete test inventory; a hand-picked local subset is not equivalent to exact-head CI.
