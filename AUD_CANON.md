# ATM — AUD CANON

Updated: 2026-10-27. This file is the current independent-audit summary. Historical claims and metrics from earlier orders are not current unless reverified.

## Evidence checked

- GitHub `main`: `4be5f1bb56c47d3ae2435f525eadeee6f402fde0`.
- Exact-head CI: [40157484893](https://github.com/simondalmasso/ATM/actions/runs/40157484893) — SUCCESS.
- GitLab mirror/parity: [40157484920](https://github.com/simondalmasso/ATM/actions/runs/40157484920) — SUCCESS.
- Cloudflare deploy and production smoke: [40157502856](https://github.com/simondalmasso/ATM/actions/runs/40157502856) — SUCCESS.
- Cache-busted production `/health` reports the same SHA as GitHub main.
- Live `/api/status` and `/api/money-loop` were read on 2026-10-27. See [detailed audit](report/order076-main-audit.md).

## Findings

### P1 — No admitted work and no realized earnings

Discovery is DEGRADED (4/7 sources healthy), 30 raw opportunities were seen, 0 admitted, and 30 rejected. Execution is `IDLE_NO_AUTO_ELIGIBLE_TASK`. This is an economic/admission bottleneck, not a deployment-health failure.

### P1 — One external write has uncertain status

Status reports claimed=3, submitted=1, accepted=0, paid=0, with one pending settlement item marked `write_uncertain_pending=1`. Money loop reports paid=0 and withdrawable=0. Do not blindly retry, count a submission as income, or widen signer/payment authority. Read back authoritative external state first.

### P1 — Persisted Taskmarket signature error needs reconciliation

The watchdog retains `RECOVERY_REQUIRED` and an HTTP 400 message about the legacy `taskmarket:<action>:` format. The current signer source uses `taskmarket:market:claim:<taskId>` and `taskmarket:market:submit:<taskId>`; the latest observed status does not establish that the same error is still occurring. The safe next step is read-only task/submission reconciliation, not another speculative code patch.

### P2 — Discovery health is degraded

Three of seven attempted sources failed during the latest discovery read. The current read reports source counts, not enough evidence to infer which failures are transient or whether a source fix would yield an eligible payable task. Capture per-source current errors and freshness before prioritizing adapters.

## Security and financial boundaries

- `OUT_OF_PLAN_SPEND_USD=0`; no paid fallbacks, deposits, stakes, or trading.
- No private key or seed in main Worker; signer remains private and bounded to claim/submit.
- Public MCP and temporary task grants remain read-only.
- No arbitrary signing, transfers, withdrawals, or owner approval bypass.
- Never infer paid/settled from a task listing, claim, submission, or acceptance status alone.

## Acceptance criteria for the next runtime fix

1. Identify the exact pending task/submission ID and read it from the external source without mutation.
2. Reconcile the latest external response with local idempotency/watchdog records.
3. If a signature defect remains reproducible, write a regression test that asserts the exact canonical payload/message and error classification.
4. Run relevant behavioral tests and exact-head CI.
5. Promote only through the existing guarded workflow; verify the production SHA and the external state after deployment.
