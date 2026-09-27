# ATM — ARQ CANON

**PROJECT**: ATM — Agent Teller Machine  
**PURPOSE**: zero-spend autonomous earning system; optimize externally settled USD/hour, never activity metrics.  
**REPO**: https://github.com/simondalmasso/ATM  
**LIVE**: https://atm.simondalmasso44.workers.dev/ · `/health` · `/api/status` · `/mcp`

## LAST_VERIFIED / BRANCH / HEAD
- Verified: **2026-09-27T20:39-03:00**.
- GitHub `main` runtime/deployed HEAD: `147fb81fb659c7a888154dbee97cda27dc53e907`.
- Main required `verify`: **PASS** (run `36359359467`).
- Cloudflare exact-SHA deployment: **PASS** (run `36359377106`).
- GitLab downstream mirror: **PASS** (run `36359359489`), main SHA parity verified.

## CANONICAL LINKS
- Contract: https://github.com/simondalmasso/ATM/blob/main/AGENTS.md
- Ruleset: https://github.com/simondalmasso/ATM/rules/23903496
- Completed ORDER-055: https://github.com/simondalmasso/ATM/issues/62
- Merged ORDER-055 PR: https://github.com/simondalmasso/ATM/pull/63
- Mirror implementation: https://github.com/simondalmasso/ATM/pull/74
- GitLab mirror: https://gitlab.com/simondalmasso/ATM
- Pending skills order: https://github.com/simondalmasso/ATM/issues/55
- Parked research: https://github.com/simondalmasso/ATM/issues/65 · https://github.com/simondalmasso/ATM/issues/66

## CURRENT STATE
- **Work only in GitHub. GitLab is mirror-only.**
- `.github/workflows/mirror-gitlab.yml` automatically syncs GitHub branches/tags to GitLab using repo-scoped SSH credentials stored only in GitHub Actions.
- No ongoing PC, Remote Desktop, SentinelX or GitLab-runner dependency exists for mirroring.
- ORDER-055 is complete and deployed.
- Galaxy hard rules: deterministic capability taxonomy; skill != executor; missing/unknown executor or owner-spend truth fails closed; trading/gambling and owner-funded spend remain blocked; fresh source readbacks reapply capability/spend truth.
- Laya/System2/GLM and upstream repos are advisory/source evidence only unless a future order proves a bounded executor.
- Public MCP stays read-only.
- Latest authoritative money truth remains `PAID=0` unless a newer external receipt proves settlement.

## DONE
- GitHub canonical migration + Cloudflare exact-SHA deployment control.
- Automatic GitHub -> GitLab downstream mirror with SHA-parity readback.
- ORDER-054 AgentBounties read-only source; Xento WATCH_ONLY.
- ORDER-055 Galaxy Radar capability/executor hardening.
- ORDER-058 Meta hackathon WATCHLIST.
- Existing install-free skill broker.

## ACTIVE WORK / WHERE_TO_RESUME
**No active ARQ order.** Single-ARQ mode is mandatory. Wait for one explicit AUD order; do not choose multiple backlog items yourself.

## WHAT_TO_DO_NOW
When AUD gives the next order:
1. Resolve live GitHub `main` first.
2. Read `AGENTS.md`, this file, and the order Issue.
3. Create/use exactly one bounded branch for that order.
4. Verify existing evidence before editing.
5. Fix only in-scope root causes; add deterministic tests.
6. Required `verify` must pass on exact PR head.
7. Merge only through protected GitHub PR.
8. If runtime bytes changed, require exact-SHA Cloudflare candidate/production smoke.
9. Verify GitLab mirror run succeeds and GitLab `main` equals GitHub `main`.
10. Return final evidence to AUD and stop.

## PENDING
- #55 ORDER-053: not started.
- #65 ORDER-056 and #66 ORDER-057: parked; never parallelize them.
- MQL5 K2: separate explicit human-authorized host experiment only.

## BLOCKERS / RISKS
- No proven cash machine; no unsupported revenue projections.
- Fresh dynamic status is required before economic claims.
- A library/skill/repo does not prove execution capability.
- Legacy open PRs are not authority.

## WHAT_NOT_TO_REPEAT
- Do not redo ORDER-054/055/058.
- Do not create work in GitLab or manually duplicate GitHub changes there.
- Do not create a second mirror mechanism.
- Do not execute #55/#65/#66 concurrently.
- Do not install JEV/Laya/Browser Use/desktop runtimes merely because they were researched.
- Do not give model/advisory output authority over hard economic/safety gates.
- Do not revive x402/Bazaar as a demand engine absent materially new evidence.

## DO_NOT_TOUCH
Private signer/raw keys, payout destination, wallet/card/withdrawal actions, GitLab runners/deploys, direct GitHub `main`, force-push, unrelated files, stale legacy PRs without AUD authorization.

## AUTHORITIES / GATES
`AGENTS.md` + current GitHub `main` are source authority. GitLab is downstream mirror only. Required GitHub `verify` gate and protected-main rules remain mandatory.  
Hard economics: `MIN_REWARD_USD>=100`, owner spend `0`, `UNKNOWN != YES`, fresh task readback before mutation, independent CHECK, authoritative settlement only for PAID.

## ACCEPTANCE / STOP CONDITIONS
**COMPLETE** only with exact-head CI green, protected merge, deploy/smoke when runtime changed, GitLab mirror success + main SHA parity, and no unsupported money claim.

**STOP / HUMAN_GATE** for owner money, KYC/MFA/CAPTCHA/legal acceptance, card/wallet/financial signature, secret disclosure, paid dependency, protection bypass, or scope expansion.

## NEXT EXACT ACTION
Wait for the next single AUD order. Do not start parked backlog on your own.
