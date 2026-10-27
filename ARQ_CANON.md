# ATM — ARQ CANON

Updated: 2026-10-27. Treat this file as the current operational authority summary; re-read live endpoints before any external mutation.

## Source and deployment authority

- Canonical repository: https://github.com/simondalmasso/ATM
- Current main SHA: `4be5f1bb56c47d3ae2435f525eadeee6f402fde0`
- Exact-head CI: [40157484893](https://github.com/simondalmasso/ATM/actions/runs/40157484893) — SUCCESS.
- GitLab downstream mirror: [40157484920](https://github.com/simondalmasso/ATM/actions/runs/40157484920) — SUCCESS.
- Cloudflare exact-SHA deployment and production smoke: [40157502856](https://github.com/simondalmasso/ATM/actions/runs/40157502856) — SUCCESS.
- Cache-busted production `/health` reports the same SHA as main and a RUNNING runtime.

## Current economic/runtime state (live read 2026-10-27)

- Discovery: DEGRADED; 7 sources attempted, 4 healthy, 3 failed; 30 raw opportunities, 0 admitted, 30 rejected.
- Execution: `IDLE_NO_AUTO_ELIGIBLE_TASK`; claimed=3, submitted=1, accepted=0, paid=0.
- Settlement watcher: pending=1 and `write_uncertain_pending=1`; money-loop paid=0, withdrawable=0.
- Watchdog: `RECOVERY_REQUIRED` at `RETRY_WAIT`; recommended action `FRESH_SOURCE_READBACK_AND_TERMINAL_FAILURE_REVIEW`.
- Persisted error says Taskmarket rejected the legacy signature namespace. Current signer source already uses `taskmarket:market:claim:<taskId>` and `taskmarket:market:submit:<taskId>`. The watchdog record is older than the latest runtime reads, so this is not proof the current code still fails. Read back the exact task and submission before changing code or retrying.
- No externally settled funds were observed in this read. Owner spend remains USD 0.

## Operating contract

Canonical loop: `DISCOVER -> ECONOMIC GATE -> ACQUIRE -> WORK -> CHECK -> SUBMIT -> SETTLEMENT READBACK -> LEARN`.

Maintain `UNKNOWN != YES`; source, terms, payout path, and executor capability must be proven. No paid API/credits, deposits, stakes, trading, gambling, mining, account farming, or unsupported reward claims. No private key/seed exposure. No outgoing spend, autonomous wallet transfers, or withdrawals. Use bounded idempotent retries, fresh source reads before acquire and submit, independent CHECK before SUBMIT, and authoritative settlement evidence.

GitHub main is the only authoring/deploy source. GitLab is a non-authoritative downstream mirror. Do not create a second scheduler/controller or install agent orchestration into the production Worker without measured benefit and a separately reviewed order.

## Canonical paths

- Main config: `cloudflare/order034/wrangler.order034.main.jsonc`
- UI entry: `cloudflare/order034/ATM-ORDER034-WIN101-UI-CANDIDATE.js`
- Active runtime: `cloudflare/order034/ATM-ORDER034-ACTIVE-MAIN-READONLY.js`
- Private signer: `cloudflare/order034/ATM-ORDER034-FINAL-SIGNER-CANDIDATE.mjs`
- Signer config: `cloudflare/order034/wrangler.order034.signer.jsonc`
- Repository map: [docs/REPOSITORY_MAP.md](docs/REPOSITORY_MAP.md)
- Latest audit: [report/order076-main-audit.md](report/order076-main-audit.md)

## Next action — read-only first

Read back the exact Taskmarket task/submission linked to the uncertain pending item. Determine whether the old HTTP 400 is a stale terminal attempt, unsupported task state, or a still-reproducible signature incompatibility. Do not resubmit or mutate to test a hypothesis. Only then write a narrowly scoped implementation order if evidence supports it.

## Change acceptance gates

1. State the exact observed failure and a falsifiable hypothesis.
2. Add a regression test before changing behavior.
3. Keep the patch minimal; do not widen signer, payment, wallet, or network authority.
4. Run the relevant behavioral tests and full CI on the exact PR head.
5. Verify post-merge mirror and exact-SHA deployment/readback before declaring completion.
