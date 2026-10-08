# ATM CURRENT CHECKPOINT — ORDER-063 COMPLETE

Updated: 2026-10-08
Status: ORDER-063 (#90 / PRs #91/#92) COMPLETE, post-merge CI + GitLab mirror parity VERIFIED; docs-only Cloudflare upload/promotion SKIPPED. Single next read-only forensic issue ORDER-064 (#93) OPEN/BLOCKED on authenticated Cloudflare Cron Trigger readback. Production remains 47c029199d904f12ea7ce929b33478db1b3a7546.

## Canon / invariants
- GitHub is source and deploy authority: https://github.com/simondalmasso/ATM
- GitLab is downstream mirror only; no GitLab runners.
- Production: https://atm.simondalmasso44.workers.dev/
- OWNER_SPEND_USD=0.
- UNKNOWN != YES.
- Public MCP is READ_ONLY.
- PAID only from exact authoritative settlement tied to ATM work.
- No signer/wallet/transfer/withdrawal/x402 authority expansion.
- No runtime installed on owner PC.
- No recurring/scheduled ChatGPT task exists for ATM; the mistakenly created hourly task was disabled.

## ORDER-061 final evidence
- Issue #87: CLOSED.
- PR #88: MERGED.
- Exact feature head: edfc8c38aee05a5b01bbe11c608319ad2eccdef4.
- Runtime merge SHA: 47c029199d904f12ea7ce929b33478db1b3a7546.
- PR-head CI: 36412293727 = SUCCESS.
- Post-merge CI: 36412458835 = SUCCESS.
- GitLab mirror: 36412458851 = SUCCESS.
- Cloudflare deploy: 36412493716 = SUCCESS.
- Candidate version: f566a50a-5f86-47da-8f3a-3f20f8e5cc56.
- Rollback/previous version: a629a888-0d69-4387-8457-058e1ccf76db.
- Candidate exact-SHA smoke: PASS.
- Production exact-SHA smoke: PASS.
- Rollback executed: NO.
- Signer changed: NO.
- GitHub runtime main and GitLab main were both 47c029199d904f12ea7ce929b33478db1b3a7546 before this docs-only checkpoint.

## What ORDER-061 fixes
1. Restart recovery
   - pending_external_intent, ACQUIRING, SUBMITTING or write_uncertain recover as WRITE_UNCERTAIN.
   - uncertain work is allow_mutation=false and READBACK_ONLY.
   - write operation/intent/hash survive reconstruction.
2. Mutation idempotency guard
   - claim and submit paths perform freshExecutionPolicy + pendingWriteGuardV1 before journal/write.
   - changed terms, expired deadline, stale readback or uncertainty fail closed.
3. Settlement replay convergence
   - same external ref + same ATM identity is idempotent.
   - same ref + different identity is DUPLICATE_EXTERNAL_REF_CONFLICT.
   - replay can continue local convergence after a partial crash.
   - PAID ledger remains exactly once per opportunity/stage.
4. Alarm ownership
   - WRITE_UNCERTAIN keeps/re-arms polling even without submission_id.
5. Money units
   - earnings_paid_external_usd sums USD/USDC only.
   - non-USD receipts are reported under earnings_paid_external_non_usd.
   - no FX guessing; policy=USD_AND_USDC_1_TO_1_ONLY_NO_FX.
6. Readback freshness
   - historical *_WITH_READBACK remains for compatibility.
   - *_WITH_FRESH_READBACK uses a 30-minute window.
7. JSON hygiene
   - ORDER-060 research JSON files are plain UTF-8 without BOM.

## TDD evidence
- 36411401252 RED: restart did not freeze uncertain write.
- 36411604229 RED: mutation path missing pending guard.
- 36411758633 RED: exact settlement replay not idempotent.
- 36411875321 RED: WRITE_UNCERTAIN alarm lost.
- 36412017058 RED: non-USD mislabeled as USD.
- 36412110916 RED: fresh-readback metric absent; then BOM detected.
- 36412181289 GREEN: functional implementation.
- 36412293727 GREEN: final PR head.

## Live production truth after ORDER-061
- /health runtime=RUNNING.
- /health git_sha=47c029199d904f12ea7ce929b33478db1b3a7546.
- execution_enabled=true; durable_object=true.
- agentic status=IDLE_NO_AUTO_ELIGIBLE_TASK.
- claimed=3; submitted=1; accepted=0; paid=0.
- settlement watcher: pending=1; write_uncertain_pending=0; paid=0.
- money_path:
  - PAID_EXTERNAL=0
  - owner_spend_usd=0
  - SUBMITTED_WITH_READBACK=1
  - SUBMITTED_WITH_FRESH_READBACK=1
  - READBACK_FRESHNESS.fresh_window_ms=1800000
  - earnings_paid_external_usd=0
  - earnings_paid_external_non_usd={}
  - next_binding_constraint=PENDING_WORK
- Workers AI: calls_used=0; reserved_neurons=0; safe budget=9500; free allocation=10000.
- No actual payout was fabricated or used to prove recovery; settlement crash/replay coverage is deterministic/synthetic.

## ARQ/AUD live evidence — 2026-10-08
- Audit main base GitHub 9c17b4ba03f022f3c754073ec6ac5a2535ce0faf; GitLab main exactly the same SHA, mirror parity PASS. Ruleset 23903496 active, PR + `verify` mandatory, bypass never.
- Runtime SHA 47c029199d904f12ea7ce929b33478db1b3a7546 is intentionally behind docs-only main #89. CI run 36413015246 SUCCESS, mirror run 36413015325 SUCCESS, docs-only Cloudflare workflow 36413051154 SUCCESS (no runtime promotion).
- Live /health RUNNING, GLM @cf/zai-org/glm-4.7-flash; /api/status discovery DEGRADED, last_run=2026-10-01T10:30:48.803Z, 7 attempted/5 OK/2 failed, 49 raw/0 admitted.
- Settlement watcher DO alarm last observed 2026-10-08T19:11:36.092Z: checked=1, pending=1, write_uncertain_pending=0, accepted=0, paid=0. Agentic claimed=3, submitted=1, accepted=0, paid=0, auto_eligible_now=0.
- MONEY_PATH_V1: source_bundles=49, SUBMITTED_WITH_READBACK=1, SUBMITTED_WITH_FRESH_READBACK=1, PAID_EXTERNAL=0, WAITING_HUMAN=4, SOURCE_PROOF_REQUIRED=44, EXECUTOR_PROOF_REQUIRED=1, next_binding_constraint=PENDING_WORK, EXPECTED_REALIZED_USD_PER_HOUR=UNKNOWN, owner_spend_usd=0. One pending external submission; no authoritative money earned.
- `money_path.WAITING_HUMAN=4` uses max(pending WAITING_HUMAN, opportunity WAITING_HUMAN constraints); `money_loop.queue_states.waiting_human=0` uses current runtime queue state; `human_gate.pending=0` counts active owner-resumable gates. Difference is semantic, not proven bug.
- Source code: scheduled() invokes /__cron; /__cron invokes refreshRadar; refreshRadar persists radar.last_run; DO alarm runs settlement monitoring but not discovery. Versioned main Wrangler config lacks triggers.crons. The actual Cloudflare deployed schedule and logs have NOT been read, so root cause remains UNKNOWN; no cron repair authorized on this docs-only order.
- PR #86 closed unmerged, #85 closed as duplicate: superseded by merged/deployed PR #88 ORDER-061. Historical PR #86 is divergent and has BOM/mojibake risk.
- ORDER-063 #90 completed via PR #91 head 5827dc7c50663b4cd680a5f8f169be6457a2f460, exact-head CI 37831279789 SUCCESS, protected merge 6e4f179a233dc84361e8e097ce243d6bed586812, main CI 37831490045 SUCCESS, mirror 37831489947 SUCCESS, Cloudflare workflow 37831525088 SUCCESS / runtime upload+promotion SKIPPED. GitLab SHA parity PASS. No code/config/payment/signer change; no scheduled ChatGPT task.

## ORDER-063 final checkpoint and ORDER-064 external boundary — 2026-10-08
- GitHub `main=a6aef9f60db7ecbe7f5ebc848ce245715937efc3` after protected PR #92 merge; GitLab `main` parity PASS (same SHA), mirror run 37833077579 SUCCESS.
- PR #92 head 53c9fe73e00282ff1f4e3b540b46cccc16b42c76, exact-head CI run 37833007167 SUCCESS; post-merge CI run 37833077403 SUCCESS.
- Cloudflare docs-only workflow run 37833267398 SUCCESS, Wrangler candidate upload/promotion and production smoke SKIPPED. Production runtime SHA still 47c029199d904f12ea7ce929b33478db1b3a7546 by pre-checkpoint /health plus deploy path gate; no claim of fresh post-merge runtime readback when rate-limited.
- ORDER-064 issue #93 opened as next **single read-only** evidence task, currently BLOCKED_EXTERNAL_CLOUDFLARE_READBACK. No implementation PR, runtime mutation, new secret authority or scheduled task.
- `.github/workflows/ci.yml` enforces exactly one Cloudflare-secret/deploy authority workflow `deploy-cloudflare.yml`. A new Cloudflare-secret-using workflow would violate this gate; changing deploy-cloudflare.yml would be a production-relevant change, so avoid that for read-only evidence.
- Existing GitHub Cloudflare deployment log run 36412493716/job 108895747829 says trigger changes require `wrangler triggers deploy`. This is historical policy output, NOT remote cron existence readback.
- Actual schedule can only be confirmed by authorized **GET-only** Cloudflare Workers script schedules API (`/accounts/{account_id}/workers/scripts/atm/schedules`) or Cloudflare Dashboard, and scheduled invocation/error logs as needed. No Cloudflare Workers Schedules tool access in this session. Do not solicit or expose a token; owner may provide sanitized response evidence.
- Source discovery remains last_run=2026-10-01T10:30:48.803Z; last observed settlement DO alarm 2026-10-08T19:11:36.092Z. Missing cron / worker cron failure / state persistence failure are hypotheses, not established causes.
- Last confirmed `MONEY_PATH_V1.PAID_EXTERNAL=0`, `owner_spend_usd=0`, `next_binding_constraint=PENDING_WORK`; no new external receipt. Hard gates unchanged.
- Branch `audit/order064-cron-readback` contains this documentation-only blocker checkpoint; exact PR-head CI and protected merge required before considering its document final.

## Exact continuation for a zero-context GPT
1. Re-read fresh GitHub main + AGENTS.md + this progress.md. Use live /health and /api/status with cache-busting query keys; reject stale search-provider cached snapshots.
2. ORDER-063 (#90) is complete; do not repeat. Keep GitHub main and GitLab mirror parity and document runtime/main SHA separation.
3. ORDER-064 (#93) is the single OPEN/BLOCKED read-only Cloudflare trigger/log readback. Actual external Workers Scripts Read authorization is unavailable in chat; leave root cause UNKNOWN, do not add secret-enabled workflows, do not change cron or Worker. Continue only after sanitized authorized schedule evidence.
4. PAID only from exact authoritative external receipt; keep pending submission settlement readback, minimum reward USD 100, owner out-of-plan spend zero, no executor/wallet authority expansion.

## Immediate next action
GitHub `main` and GitLab mirror are aligned at `a6aef9f60db7ecbe7f5ebc848ce245715937efc3`; ORDER-063 and checkpoint complete. ORDER-064 (#93) is **OPEN/BLOCKED** pending external read-only Cloudflare Worker `atm` Cron Trigger schedule evidence (`GET /accounts/{account_id}/workers/scripts/atm/schedules`), then scheduled invocation logs only if necessary. No API token/keys in chat, no new token or authority, no paid service, no workflow with additional CLOUDFLARE_API_TOKEN, no `wrangler triggers deploy` or Cloudflare mutations. One pending submission remains under receive-only settlement readback, PAID_EXTERNAL=0 at last verified status. Preserve exact-ShA production runtime, zero spend, no automatic acquisition or executor promotion.
