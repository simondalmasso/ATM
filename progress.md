# ATM CURRENT CHECKPOINT — ORDER-061 ACTIVE

Updated: 2026-09-28
Status: implementation in progress.
Active issue: #87 — ATM-ORDER-061 — idempotent uncertain-write recovery + settlement commit consistency.
Branch: order061-recovery-consistency-v1.
Base GitHub main: b64139d8c86d37953ec17fcaa1becfec11e77ead.
Production runtime before ORDER-061: c257b5a42f7a4384e8da0b96b52a30359eb30620.

## Invariants in force
- OWNER_SPEND_USD=0.
- UNKNOWN != YES.
- Public MCP READ_ONLY.
- No signer/wallet/transfer/withdrawal/x402 authority expansion.
- No new executor promotion.
- No runtime installed on owner PC.
- GitHub is source/deploy authority; GitLab mirror only.
- PAID only from exact authoritative external settlement tied to ATM work.

## Current defects being fixed
1. Pre-write intent can recover as actionable instead of WRITE_UNCERTAIN after restart.
2. Exact settlement replay can leave settlement_refs paid while runtime/ledger remain uncommitted.
3. monitorExecutionReadback may delete an alarm while WRITE_UNCERTAIN work remains.
4. earnings_paid_external_usd can mislabel non-USD currency such as DCC.
5. *_WITH_READBACK currently reflects historical existence, not freshness.
6. Three ORDER-060 JSON files contain UTF-8 BOM.

## Exact continuation for a zero-context GPT
1. Read AGENTS.md, AUD_CANON.md, ARQ_CANON.md, this file and issue #87.
2. Confirm branch order061-recovery-consistency-v1 still starts from main b64139d8c86d37953ec17fcaa1becfec11e77ead or reconcile newer main before editing.
3. Use TDD. Add one focused ORDER-061 test and observe the expected behavioral failure before each production change.
4. Fix restart recovery first: ACQUIRING/SUBMITTING or persisted pending_external_intent without authoritative confirmation => WRITE_UNCERTAIN, readback-only, no duplicate claim/submit.
5. Wire pendingWriteGuardV1 into claim and submit mutation paths.
6. Make exact same settlement receipt replay idempotent for the same source/task/submission/payee and make PAID ledger accounting exactly once. Different identity with same external ref remains blocked.
7. Preserve/re-arm DO alarm while WRITE_UNCERTAIN exists.
8. Sum earnings_paid_external_usd only from USD/USDC receipts. Expose non-USD paid amounts separately without FX guessing.
9. Split historical readback counters from fresh readback counters; stale readback must not imply current truth.
10. Remove BOM from capability-optimizer-candidates.json, superteam-colosseum-salta-watch.json and system-one-provider-candidates.json; add plain UTF-8 parse test.
11. Run focused tests, full CI commands, Python policy tests, doctors, JSON parse and git diff --check.
12. Push branch, open PR closing #87, require exact-head CI green, protected merge, canonical exact-SHA deploy, production readback and GitLab parity.
13. Update this checkpoint after test-green, PR, merge and deploy with exact SHAs/run IDs and the next exact actions.

## Stop conditions
- Owner money, paid dependency, private-key exposure, human financial signature, protection bypass or scope expansion => stop/human gate.
