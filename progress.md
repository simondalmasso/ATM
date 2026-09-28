# ATM CURRENT CHECKPOINT — ORDER-061 ACTIVE

Updated: 2026-09-28
Status: implementation complete on feature bytes; final checkpoint CI / review / merge / deploy still pending.
Active issue: #87 — ATM-ORDER-061 — idempotent uncertain-write recovery + settlement commit consistency.
PR: #88 — draft until final checkpoint head passes CI.
Branch: order061-recovery-consistency-v1.
Base GitHub main when work started: b64139d8c86d37953ec17fcaa1becfec11e77ead.
Production runtime before ORDER-061: c257b5a42f7a4384e8da0b96b52a30359eb30620.
Latest functional green head before this checkpoint update: 8b53ea270945dda293f5412972770d8a41d570d2.
Functional-head CI: 36412181289 = SUCCESS.

## Invariants in force
- OWNER_SPEND_USD=0.
- UNKNOWN != YES.
- Public MCP READ_ONLY.
- No signer/wallet/transfer/withdrawal/x402 authority expansion.
- No new executor promotion.
- No runtime installed on owner PC.
- GitHub is source/deploy authority; GitLab mirror only.
- PAID only from exact authoritative external settlement tied to ATM work.

## ORDER-061 fixes now implemented
1. Restart recovery:
   - persisted pending_external_intent, ACQUIRING, SUBMITTING or write_uncertain recovers as WRITE_UNCERTAIN;
   - recovered uncertain work is allow_mutation=false / READBACK_ONLY;
   - write operation + intent + intent hash survive pending reconstruction.
2. Mutation guards:
   - claim path performs freshExecutionPolicy + pendingWriteGuardV1 before journal/write;
   - submit path performs freshExecutionPolicy + pendingWriteGuardV1 before journal/write;
   - changed terms, expired deadline, stale/uncertain state fail closed.
3. Settlement replay:
   - same external settlement ref for same opportunity/source/task/submission/payee/amount/currency is idempotent and returns replayed=true;
   - same ref tied to a different identity fails as DUPLICATE_EXTERNAL_REF_CONFLICT;
   - Daydreams/Hansa receipt validation no longer pre-rejects an exact replay before registerSettlementRef can reconcile it;
   - appendLedgerEvent remains exactly-once per opportunity/stage, so replay converges without duplicate PAID ledger rows.
4. Alarm ownership:
   - monitorExecutionReadback checks pending_work_v1 for WRITE_UNCERTAIN before deleting an alarm;
   - unresolved uncertain writes keep/re-arm SETTLEMENT_ALARM_MS polling even without submission_id.
5. Money units:
   - earnings_paid_external_usd includes USD and USDC only;
   - non-USD settlements are exposed separately in earnings_paid_external_non_usd;
   - no FX guessing; policy string is USD_AND_USDC_1_TO_1_ONLY_NO_FX.
6. Readback freshness:
   - historical *_WITH_READBACK counters are preserved;
   - *_WITH_FRESH_READBACK counters use an explicit 30-minute window;
   - READBACK_FRESHNESS metadata documents both semantics.
7. Research hygiene:
   - capability-optimizer-candidates.json, superteam-colosseum-salta-watch.json and system-one-provider-candidates.json are plain UTF-8 without BOM.

## Recorded TDD chain
- CI 36411401252 RED: RESTART_DID_NOT_FREEZE_UNCERTAIN_WRITE.
- c5ae4d54830d2563364dc42704f5afc486435783 fixed restart freeze.
- CI 36411604229 RED: CLAIM_PATH_MISSING_PENDING_WRITE_GUARD.
- 47058ae2b9b0e2ea9eff321f6031cc2cb1615d28 + f8309edcd22c8d32a7affd4910b990c3d7eea254 wired/verified claim+submit guards.
- CI 36411758633 RED: EXACT_SETTLEMENT_REPLAY_NOT_IDEMPOTENT.
- da3b1e537d3190840ce28ca8b522560cc9dd8a42 fixed settlement replay ownership.
- CI 36411875321 RED: WRITE_UNCERTAIN_ALARM_WAS_LOST.
- bf572de2aff66998019b3e331b1a2cea9532b10f fixed alarm ownership.
- CI 36412017058 RED: NON_USD_MISLABELED_AS_USD.
- 9b2bf19e927d96fbfccf40e11a9f1cd4652e786c fixed currency aggregation.
- CI 36412110916 RED: FRESH_READBACK_COUNT_INCORRECT.
- ba4f358666a0de13325ae99ea251eba509b4ca26 added fresh readback metrics.
- CI 36412110916 then reached UTF8_BOM_PRESENT.
- 90c8001d94e955668de9c501a6edb8d98958166c / 26be32c15c3687c4d8305c80af67ee5f0dcc6619 / 8b53ea270945dda293f5412972770d8a41d570d2 removed the three BOMs.
- CI 36412181289 GREEN: Worker behavior PASS, Python policy PASS, Repository integrity PASS.

## Exact continuation for a zero-context GPT
1. Read AGENTS.md, AUD_CANON.md, ARQ_CANON.md, this file, issue #87 and PR #88.
2. Resolve current GitHub main and PR #88 head. If main advanced beyond b64139d, inspect drift before merge; do not blindly rebase over runtime changes.
3. Require the CI run attached to the current PR head (including this checkpoint commit) to finish SUCCESS.
4. Inspect PR changed files and unresolved review threads. Confirm no new external POST route, no public MCP mutation, no signer/wallet authority change and no unrelated executor promotion.
5. Mark PR #88 ready for review only after current-head CI is green.
6. Merge only through protected GitHub PR with expected exact head SHA.
7. Because runtime bytes changed, require post-merge ATM CI SUCCESS on the merge SHA.
8. Require canonical ATM Cloudflare Deploy to:
   - detect main runtime change,
   - upload candidate without traffic,
   - stage 0%,
   - pass candidate exact-SHA smoke,
   - promote exact version,
   - pass production exact-SHA smoke,
   - skip rollback.
9. Production readback must show runtime RUNNING on the merge SHA and:
   - OWNER_SPEND_USD=0,
   - PAID_EXTERNAL not invented,
   - WRITE_UNCERTAIN semantics visible if present,
   - earnings_paid_external_usd excludes non-USD currencies,
   - fresh readback counters exist.
10. Verify GitLab main SHA equals GitHub main SHA; never use GitLab runner.
11. Add final evidence comment to issue #87: PR, exact head, merge SHA, all CI/deploy IDs, production SHA, rollback version, mirror parity, OWNER_SPEND_USD=0, PAID_EXTERNAL truth.
12. Update progress.md again on a docs-only checkpoint if needed; docs-only merge must not redeploy runtime.
13. Mark ORDER_061_STATUS=READY_FOR_AUD only after all evidence is complete.

## Stop conditions
- Owner money, paid dependency, private-key exposure, human financial signature, protection bypass or scope expansion => stop/human gate.
