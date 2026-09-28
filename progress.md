# ATM CURRENT CHECKPOINT — ORDER-061 COMPLETE

Updated: 2026-09-28
Status: ORDER-061 is merged, deployed, live-verified, mirrored and READY_FOR_AUD.

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

## Exact continuation for a zero-context GPT
1. Read AGENTS.md, AUD_CANON.md, ARQ_CANON.md and this progress.md first.
2. Fetch issue #87 and PR #88; treat ORDER-061 as complete.
3. Resolve current GitHub main. This docs-only checkpoint merge will make GitHub main newer than runtime SHA 47c0291; production must remain 47c0291 until a later runtime-changing order deploys.
4. Verify GitLab main equals current GitHub main before declaring mirror parity.
5. Read production /health and /api/status. Keep runtime SHA separate from docs-only main SHA.
6. Do not reopen ORDER-061 unless new evidence falsifies one of its tested contracts.
7. Current economic binding is PENDING_WORK: one submitted item has fresh readback and is still pending settlement; PAID_EXTERNAL=0.
8. AUD_CANON.md and ARQ_CANON.md are historically stale around ORDER-059/060. Reconcile them before selecting a new implementation order; current GitHub main + AGENTS.md + this checkpoint + live receipts outrank stale prose.
9. Select exactly one next order. Do not run ORDER-053/056/057 or worker promotion in parallel unless AUD explicitly selects it.
10. For every new order: create/assign issue first, branch from fresh main, TDD red→green, exact-head CI, protected PR merge, exact-SHA Cloudflare deploy only if runtime bytes changed, production readback, GitLab mirror parity.
11. Before every material transition or chat end, update progress.md in present tense with current issue/branch/head/main/prod SHAs, CI/deploy IDs, money truth, blocker, and exact continuation steps.
12. Never install Julia/Laya/Lev/Jev, DCP, SkillOpt or OpenScience on owner PC; candidates remain PROVEN=false until separate bounded E2E proof.
13. Never create a scheduled ChatGPT/automation task unless the user explicitly requests one again.

## Immediate next action
AUD should reconcile stale canon against completed ORDER-059/060/061 and live PENDING_WORK evidence, then issue one next bounded order. Do not invent a new executor or payment claim.
