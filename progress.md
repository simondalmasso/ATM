# ATM CURRENT CHECKPOINT — ORDER-062

Updated: 2026-09-28
Status: ORDER-062 is the single active hotfix order.
Purpose: zero-context handoff for a fresh GPT agent.

## Canon
- GitHub source authority: https://github.com/simondalmasso/ATM
- GitLab is downstream mirror only.
- Production runtime before ORDER-062: c257b5a42f7a4384e8da0b96b52a30359eb30620.
- Current GitHub main/base: b64139d8c86d37953ec17fcaa1becfec11e77ead.
- Active issue: #85 ATM-ORDER-062.
- Active branch: fix/order062-money-path-recovery.
- OWNER_SPEND_USD=0.
- Public MCP remains READ_ONLY.
- No scheduled ChatGPT task exists.
- No local-PC runtime install.

## Why ORDER-062 preempts ORDER-053
Independent audit reproduced two production P1 recovery risks and two P2 accounting/alarm semantics issues. ORDER-053 remains safely checkpointed on feat/order053-zero-cost-skills-v1 at WIP head 9c122b4bd5e20e37e6bf26949c00650cc367e690 and must resume only after this hotfix is merged/deployed.

## Confirmed findings against main
1. Restart after persisted claim/submit intent can reconstruct a retryable state instead of WRITE_UNCERTAIN.
2. Settlement ref persistence can succeed before runtime/ledger persistence; replay then rejects the same exact receipt as duplicate instead of converging.
3. reconcileUncertainWrites may set an alarm that monitorExecutionReadback deletes when no submitted runtime is pending.
4. earnings_paid_external_usd sums all settlement currencies as though USD.
5. WITH_READBACK counters currently mean historical evidence present, not fresh current readback.

## Intended fix
- recoverPendingWorkV1: any persisted write intent paired with ACQUIRING/SUBMITTING and no confirmed result becomes WRITE_UNCERTAIN / READBACK_ONLY.
- chooseTaskmarketCandidate: call pendingWriteGuardV1 and refuse mutation for pending records that disallow writes.
- Add exact-settlement-ref equivalence helper. Same exact persisted receipt is idempotently replayable; conflicting reuse remains blocked.
- Keep ledger append idempotent and make realized USD currency-aware.
- moneyPathStatus sums only USD/USDC settlement amounts into earnings_paid_external_usd.
- monitorExecutionReadback must preserve/schedule an alarm while WRITE_UNCERTAIN items remain.
- Expose explicit metric semantics/freshness metadata so *_WITH_READBACK is not interpreted as current external freshness.
- Add deterministic regression tests before implementation.

## Exact continuation for a fresh GPT
1. Read AGENTS.md, AUD_CANON.md, ARQ_CANON.md, issue #85 and this file.
2. Verify fix/order062-money-path-recovery still derives from current main or reconcile drift before commit.
3. Create cloudflare/order034/ATM-ORDER062-RECOVERY-HARDENING-TEST.mjs reproducing all five findings. Require RED on current main.
4. Implement only the minimal fixes above in ATM-ORDER034-ACTIVE-MAIN-READONLY.js.
5. Re-run ORDER-062 test until GREEN; do not weaken assertions.
6. Add ORDER-062 test to .github/workflows/ci.yml.
7. Run every Node command declared in CI, Python compileall/unittest, secret_doctor, payout_doctor and git diff --check.
8. Audit staged diff for no new external POST/mutation tool, no signer/wallet authority expansion, no spend, no local-PC runtime.
9. Commit, push and open PR closing #85. Require exact-head CI PASS.
10. Merge protected PR only after green CI.
11. Runtime bytes change requires canonical exact-SHA candidate smoke, promotion, production smoke and rollback skipped.
12. Live verify /health exact production SHA and /api/status semantics: no invented PAID, USD aggregate currency-safe, pending recovery not retryable, owner spend zero.
13. Verify GitLab mirror parity with zero GitLab runner usage.
14. Update this checkpoint after commit/PR/merge/deploy and leave exact next action.
15. Resume ORDER-053 from WIP head 9c122b4bd5e20e37e6bf26949c00650cc367e690 only after ORDER-062 is READY_FOR_AUD.

## Hard prohibitions
- No direct main push.
- No GitLab runners.
- No owner spend.
- No wallet/signer authority expansion.
- No new public mutation MCP tools.
- No scheduled ChatGPT tasks.
- No local-PC runtime installs.

## CHECKPOINT UPDATE - pre-commit
- ORDER-062 implementation is present on fix/order062-money-path-recovery.
- Regression test ATM-ORDER062-RECOVERY-HARDENING-TEST.mjs is GREEN for restart freeze, settlement replay idempotency, conflicting-ref rejection, currency-safe USD, uncertain-alarm preservation, readback semantics, and no-BOM JSON.
- Full local CI command set is GREEN; Python tests 3/3, secret doctor PASS, payout doctor PASS, strict research JSON parse PASS, git diff --check PASS.
- Authority audit shows no new external POST and no signer/wallet/transfer/withdrawal/x402 authority additions.
- Exact next action: stage diff, commit, push, open PR closing #85, require exact-head CI; then protected merge, canonical runtime deploy exact-SHA, live readback, GitLab parity, update this checkpoint, and only then resume ORDER-053 from 9c122b4bd5e20e37e6bf26949c00650cc367e690.
