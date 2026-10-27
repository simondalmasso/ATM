# ORDER-076 — Main repository audit and hygiene

Date: 2026-10-27  
Base: `4be5f1bb56c47d3ae2435f525eadeee6f402fde0`  
Scope: source/documentation hygiene and operational truth. No production mutations, signer changes, claims, submissions, payments, or withdrawals.

## Verified provenance

- [Exact-head CI run 40157484893](https://github.com/simondalmasso/ATM/actions/runs/40157484893): SUCCESS.
- [GitLab mirror run 40157484920](https://github.com/simondalmasso/ATM/actions/runs/40157484920): SUCCESS.
- [Cloudflare deployment run 40157502856](https://github.com/simondalmasso/ATM/actions/runs/40157502856): SUCCESS. The job staged and smoke-tested the candidate, promoted the exact main version, and passed production smoke.
- Cache-busted production `/health` returned `git_sha=4be5f1bb56c47d3ae2435f525eadeee6f402fde0`, matching GitHub main. A prior cached/old response showed a different SHA; the cache-busted read supersedes it.

## Live economic readback

Observed from the cache-busted `/api/status` on 2026-10-27:
- Discovery DEGRADED; 7 sources attempted, 4 healthy, 3 failed.
- 30 raw opportunities, 0 admitted, 30 rejected.
- Execution `IDLE_NO_AUTO_ELIGIBLE_TASK`; claimed=3, submitted=1, accepted=0, paid=0.
- Settlement watcher: pending=1, `write_uncertain_pending=1`, submission feed OK.
- Money loop: paid=0, withdrawable=0.
- Watchdog: `RECOVERY_REQUIRED`, `RETRY_WAIT`, recommended action `FRESH_SOURCE_READBACK_AND_TERMINAL_FAILURE_REVIEW`.
- Stored error: `TASKMARKET_HTTP_400` stating the old `taskmarket:<action>:` signature format is no longer accepted. That watchdog record was last updated 2026-10-25.
- Current signer source already uses `taskmarket:market:claim:<taskId>` and `taskmarket:market:submit:<taskId>`. The live status therefore does not prove that the legacy-format defect remains in current code.
- No externally settled funds observed; no task was retried or mutated during this audit.

## Findings / priority

1. **P1 — Uncertain external write:** read back the exact Taskmarket task and submission before any retry. Reconcile remote state with local idempotency/watchdog records.
2. **P1 — Zero admitted work:** gather per-source current errors and opportunity rejection reasons. Do not loosen the economic/safety gate just to increase counts.
3. **P2 — Stale canonical documentation:** ARQ/AUD were still leading with an October 8 baseline. They are updated in this branch with the current SHA, live figures, authority hierarchy, and explicit next safe action.
4. **P2 — Repository navigation:** add a map linking the runtime, signer, workflows, tests, read-only endpoints, and safe change process.

## Patch contents

- Refresh `README.md` with current operational truth and links.
- Replace stale top-level ARQ/AUD canon with dated, evidence-backed summaries.
- Add `docs/REPOSITORY_MAP.md`.
- Add this audit report.
- Update the top of `progress.md` while retaining the previous checkpoint below as clearly labeled historical material.

## Explicitly out of scope

No code/runtime changes; no Taskmarket claims/submissions; no replay of the uncertain write; no signer, wallet, secret, payout, scheduler, or spend-policy changes; no agent-framework dependency in production.

## Completion gate

This branch is not canonical main until its PR-head CI succeeds, changes are reviewed, and it is merged. Documentation cannot resolve the uncertain external write; that remains the next operational task.
