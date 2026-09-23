# ATM-ORDER-047 canonical state

Captured: 2026-09-22T08:25:47-03:00

## Scope reset

- Repo/history reset: **NO**
- Scope reset: **YES**
- Worktree: `C:\Users\Simon\ATM-ORDER047`
- Branch: `feat/order047-cash-first-consolidation-v1`
- Base: `81a55ed63617a41859b619bb1421bfc66762610e`
- Base tracked files: **26**
- GitLab remote branches before ORDER047 cleanup: **15**
- Remote branch deletion in this order: **NO**
- Main mutation: **NO**

## Canonical source baseline

- Source branch: `ui/order041-windows101-truth-dashboard`
- SHA: `81a55ed63617a41859b619bb1421bfc66762610e`
- Latest canonical pipeline: **#87 PASS**
- Pipeline SHA: `81a55ed63617a41859b619bb1421bfc66762610e`
- Baseline file count: **26**

The 26 tracked files are the existing clean ATM runtime/config/test/security plane. ORDER047 starts from this tree; it does not start from `main`.

## Production truth readback

Read-only production check on 2026-09-22:

- `/health`: HTTP success, `ok=true`
- Runtime: `ATM-ORDER-034`
- State: `RUNNING`
- Model: `@cf/zai-org/glm-4.7-flash`
- AI binding: present
- Durable Object: present
- TaskMarket signer binding: present
- Execution enabled: true
- Cron: `*/15 * * * *`
- Discovered/raw found: **28**
- Auto eligible now: **0**
- PAID: **USD 0**
- Withdrawable: **USD 0**
- Withdrawn: **USD 0**
- Legacy submitted: **USD 1.20** (not earned / non-actionable)

Production remains untouched by ORDER047.

## Decision architecture

Laya direct-policy authority is killed by measured ATM replay:

- typed-decisions: hard-rule agreement 0.5286; direct decision agreement 0.10; false PROMOTE 0.70
- English: hard-rule agreement 0.5857; direct decision agreement 0.05; false PROMOTE 0.75
- Laya critical-path authority: **NO**
- Jev runtime: **DISABLED**
- Canonical policy owner: **deterministic code**
- Existing zero-spend System2 is allowed only for unresolved semantics.

Canonical path:

`SOURCE_READBACK -> DETERMINISTIC_PARSE/FEATURES -> HARD_GATES_IN_CODE -> SYSTEM2_ONLY_IF_NEEDED -> CODE_DECISION -> CODE_SIDE_EFFECT -> EXTERNAL_READBACK -> CODE_OWNS_PAID`

## Final ORDER047 state

1. branch-manifest: **DONE**
2. canonical-state/file-count truth: **DONE**
3. Xgodo/current-demand read-only forensic: **DONE — BLOCKED by auth for authoritative current catalog; no safe current job proven**
4. SemIf replay: **SKIPPED — no live safe money candidate**
5. Stagehand harmless fixture: **SKIPPED — no measured execution blocker**
6. WaterCrawl/Obscura/ego-lite/nodeterm/Qwen-Image: **NOT INSTALLED**
7. Safe automation gate: **DONE — Google-account farming example rejected deterministically**
8. CI: **#88 PASS on forensic head before this documentation-only correction**

ORDER047 verdict: **BOUNDED_FORENSIC_COMPLETE_NO_LIVE_PROBE**.

## Invariants

- OWNER_OUT_OF_POCKET_USD=0
- NO_CARD=YES
- NO_PAID_API=YES
- NO_DEPLOY=YES
- NO_MERGE=YES
- NO_WALLET_MUTATION=YES
- NO_PROD_MUTATION=YES
- UNRELATED_WORK=NO
