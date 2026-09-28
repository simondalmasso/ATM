# ATM-ORDER-059 MONEY_PATH_V1 implementation plan

Baseline: GitHub main `6217ae94b7ab6ce81aeac17eb1f2589a485f7eec`.
Issue: #78. Branch: `order059-money-path-v1`.
Invariant: owner spend remains USD0; public MCP remains read-only; signer authority does not widen.

## Task 1 — Red tests
- Add `ATM-ORDER059-MONEY-PATH-V1-TEST.mjs`.
- Cover all 18 issue fixtures, including source unknown classes, executor/source binding constraints, ambiguous writes, restart recovery, exact settlement matching, worker PROVEN=false, signer/MCP/owner-spend invariants.
- Add the test to GitHub CI.
- Run it before production changes and record the expected failure.

## Task 2 — Source and economic truth
- Add versioned source-evidence helpers to the existing runtime.
- Preserve YES / UNKNOWN_NOT_FETCHED / UNKNOWN_NOT_PUBLISHED / NO.
- Attach source/economic evidence to current opportunities; do not add a new adapter.
- Keep UNKNOWN fail-closed and surface SOURCE_PROOF_REQUIRED vs EXECUTOR_PROOF_REQUIRED.

## Task 3 — Pending work durability
- Reuse Durable Object storage; no new service.
- Add a canonical pending-work record derived from task runtime.
- Journal mutation intent before claim/submit.
- Ambiguous external writes become WRITE_UNCERTAIN and permit readback-only reconciliation, never a repeated write.
- Recover nonterminal records idempotently after restart, including historical submitted work.
## Task 4 — Settlement truth
- Add exact receive-only settlement receipt validation for source, task, submission/claim, payee, positive amount/currency, unique external reference, authoritative readback, timestamp and evidence hash.
- Reject broad AgentHansa payout matching and duplicate payout references.
- Keep ACCEPTED distinct from PAID.

## Task 5 — Worker contract and metrics
- Add WORKER_CONTRACT_SCHEMA_V1 and a registry where all external/new workers default to PROVEN=false.
- Skill/model/library availability never promotes executor truth.
- Surface APPLIED_WITH_READBACK, CLAIMED_WITH_READBACK, SUBMITTED_WITH_READBACK, ACCEPTED_WITH_READBACK, PAID_EXTERNAL, WAITING_HUMAN, EXECUTOR_PROOF_REQUIRED, SOURCE_PROOF_REQUIRED, EMPTY_ADMISSIBLE_DEMAND and NEXT_BINDING_CONSTRAINT.

## Task 6 — Verification and delivery
- Run focused ORDER-059 test, existing order034/054/055 tests, then the exact local CI commands.
- Inspect diff for authority widening, public write tools, secrets, unrelated edits and runtime path changes.
- Commit only scoped files and push the branch.
- Open a PR closing #78 and wait for exact-head required CI.
- Do not merge/deploy unless explicitly authorized beyond source-writing/PR work.
