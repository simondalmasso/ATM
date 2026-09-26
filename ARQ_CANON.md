# ATM — ARQ CANON

**PROJECT**: ATM — Agent Teller Machine  
**PURPOSE**: zero-spend autonomous earning system; optimize externally settled USD/hour, never activity metrics.  
**REPO**: https://github.com/simondalmasso/ATM  
**LIVE**: https://atm.simondalmasso44.workers.dev/ · `/health` · `/api/status` · `/mcp`

## LAST_VERIFIED / BRANCH / HEAD
- Verified repo/PR/ruleset state: **2026-09-25T22:06-03:00**.
- `main` HEAD = `2ee7bdb53c6a8f77373deebac6a5cb1175f112f0`.
- Production exact-SHA smoke at this HEAD = **PASS**; runtime `RUNNING`, MCP tools `17`, zero-spend `true`.
- Resume branch = `feat/order055-galaxy-radar-v1`.
- Resume HEAD = `46d5eb9c6322a0ab83f14f1188b0437e3d8dc5a1`.
- PR = https://github.com/simondalmasso/ATM/pull/63
- Issue = https://github.com/simondalmasso/ATM/issues/62
- Branch is **ahead 6 / behind current main 5**; merge-base = `83a7c50e5336ccdad627b2cd498d821e74642adf`.
- Head CI run `36082984191` = **SUCCESS**; green CI does not erase review correctness findings.

## CANONICAL LINKS
- Contract: https://github.com/simondalmasso/ATM/blob/main/AGENTS.md
- Ruleset: https://github.com/simondalmasso/ATM/rules/23903496
- ORDER-054 final: https://github.com/simondalmasso/ATM/issues/58#issuecomment-5824904782
- ORDER-058 merged: https://github.com/simondalmasso/ATM/pull/68
- Pending skills order: https://github.com/simondalmasso/ATM/issues/55
- Parked research orders: https://github.com/simondalmasso/ATM/issues/65 · https://github.com/simondalmasso/ATM/issues/66

## CURRENT STATE
Single-ARQ mode is now authoritative. The only active workstream is ORDER-055.

PR #63 currently changes only:
1. `.github/workflows/ci.yml`
2. `cloudflare/order034/ATM-ORDER034-ACTIVE-MAIN-READONLY.js`
3. `cloudflare/order034/ATM-ORDER055-GALAXY-RADAR-TEST.mjs`

Implemented direction: deterministic capability taxonomy; separate `EXECUTOR_CAPABILITIES`; passive source matrix; Laya/Jev advisory patterns. Skills are context, not executor proof.

Latest authoritative money evidence remains `REAL_PAID_USD=0`, owner spend `0`, auto-eligible `0` from ORDER-054. Fresh dynamic status was unavailable during this canon refresh; re-read live before making any current economic claim.

## DONE
- ORDER-051 canonical GitHub/Cloudflare exact-SHA deployment control.
- ORDER-054 AgentBounties read-only source; Xento WATCH_ONLY.
- ORDER-058 Meta hackathon WATCHLIST persisted/deployed.
- Public MCP read-only; skill broker exists.

## ACTIVE WORK / WHERE_TO_RESUME
Resume **existing PR #63**, not a new branch/order. Preserve all six ORDER-055 commits.

Current review debt to re-check at current head:
1. missing/legacy `executor_truth` must fail closed or be reclassified before execution;
2. authoritative fresh task readbacks must reapply Galaxy capability truth before acquire/submit;
3. direct imperative trading/betting language must remain blocked;
4. explicit spend evidence must override stale `owner_spend_zero=true`;
5. `API_HTTP` is PROVEN only when actual HTTP execution class + egress admission are proven;
6. negated/non-requirement words such as “no stake/gas” or “bond market analysis” must not create false spend blockers;
7. research subjects (“article about data”, “website accessibility research”) must not be mistaken for required DATA/WEB_UI executors.

Commits after the reviewed `fc77d485...` only added passive OSS-source coverage; do not assume the seven findings are fixed.

## WHAT_TO_DO_NOW
1. Fetch current `main@2ee7bdb...`; sync it into `feat/order055-galaxy-radar-v1` without reset or lost commits.
2. Reproduce each review finding against the actual current branch before editing.
3. Fix only confirmed root causes; add deterministic regression tests for every confirmed case.
4. Preserve hard rule: capability/skill/model advice can only reduce/route work; it cannot override deterministic owner-spend, policy, payout or executor gates.
5. Run the complete existing CI/test matrix; required `verify` must pass on exact final head.
6. Request/re-run a fresh PR review and clear correctness debt before merge.
7. Merge PR #63 through protected `main` only.
8. Because ACTIVE-MAIN changes, require canonical auto-deploy: exact-main SHA guard -> 0% candidate smoke -> 100% promote -> production exact-SHA smoke -> rollback on failure.
9. Post final evidence to Issue #62: final SHA, tests, CI, deploy, production SHA, `/health`, MCP tool/read-only state, source/capability matrix, `REAL_PAID_USD`, owner spend.
10. Stop. Return to AUD for the next single order.

## PENDING
- ORDER-053 (#55): not started; do not start while #63 is active.
- ORDER-056 (#65) and ORDER-057 (#66): parked; no result comments; do not run them in parallel.
- MQL5 K2: separate future host experiment; no install/PC mutation under ORDER-055.
- Meta hackathon: WATCH_ONLY until applications/rules open and are reverified.

## BLOCKERS / RISKS
- PR #63 is behind main by 5 commits.
- Codex P1/P2 findings may permit false execution or false blocking if ignored.
- PR #64 is stale/duplicate and conflicts conceptually with already-completed ORDER-054.
- Legacy open PRs/issues are not current authority.
- Dynamic live money/opportunity counters require fresh readback.

## WHAT_NOT_TO_REPEAT
- Do not create another ORDER-055 branch or rewrite the six existing commits.
- Do not redo AgentBounties ORDER-054; do not merge PR #64.
- Do not redo Meta ORDER-058.
- Do not execute #65/#66 concurrently.
- Do not expand skill manifests via ORDER-053 until #63 is complete.
- Do not install JEV/Laya/Agent-Desktop/json-render merely because they were researched.
- Do not give Laya/System2/GLM authority over hard gates.
- Do not revive x402/Bazaar as a demand engine absent materially new evidence.
- Do not touch local PC, MetaTester, wallet, card, KYC/MFA/CAPTCHA or owner financial signatures without a separate explicit human gate/order.

## DO_NOT_TOUCH
Private signer/raw keys, payout destination, wallet/card/withdrawal actions, GitLab runners, direct `main`, force-push, unrelated runtime/UI/research files, stale legacy PRs.

## AUTHORITIES / GATES
`AGENTS.md` is the operating contract. GitHub main is source authority. Ruleset `ATM canonical main` is active: PR required, `verify` required, no deletion/non-fast-forward, no bypass.  
Hard economics: `MIN_REWARD_USD>=100`, owner out-of-plan spend `0`, `UNKNOWN != YES`, live re-read before acquire/submit, independent rejection-oriented CHECK, PAID only from authoritative external settlement.

## ACCEPTANCE / STOP CONDITIONS
**COMPLETE** only when: synced current main; all confirmed review defects regression-tested/fixed; exact-head CI green; fresh review clean enough to merge; protected merge succeeds; production exact-SHA smoke passes; runtime/MCP safety preserved; no new owner spend; no unsupported money claim.

**STOP / HUMAN_GATE** if any action requires owner money, KYC/MFA/CAPTCHA/legal acceptance, card/wallet/financial signature, secret disclosure, bypassing platform controls, paid dependency, GitHub protection bypass, or changing files outside ORDER-055 scope without AUD authorization.

## NEXT EXACT ACTION
**Open PR #63, sync current main into its existing branch, then start by reproducing the seven review findings above one by one before changing code.**
