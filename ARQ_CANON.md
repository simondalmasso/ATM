# ATM — ARQ CANON

**PROJECT**: ATM — Agent Teller Machine  
**PURPOSE**: zero-spend autonomous earning system; optimize externally settled USD/hour, never activity metrics.  
**REPO**: https://github.com/simondalmasso/ATM  
**LIVE**: https://atm.simondalmasso44.workers.dev/ · `/health` · `/api/status` · `/mcp`

## LAST_VERIFIED / BRANCH / HEAD
- Verified: **2026-09-27T23:13-03:00**.
- GitHub `main` runtime/deployed HEAD: `fd29053bbf3933ca24d29f69cd5990e94efc6348`.
- Main required `verify`: **PASS** (run `36369417166`).
- Cloudflare exact-SHA deployment: **PASS** (run `36369435116`).
- GitLab downstream mirror: **PASS** (run `36369417164`).
- Fresh live readback: runtime `RUNNING`, exact SHA `fd29053...`, `PAID=0`, owner spend `0`, auto-eligible `0`.

## CANONICAL LINKS
- Contract: https://github.com/simondalmasso/ATM/blob/main/AGENTS.md
- Ruleset: https://github.com/simondalmasso/ATM/rules/23903496
- Completed ORDER-055: https://github.com/simondalmasso/ATM/issues/62
- Post-055 hardening: https://github.com/simondalmasso/ATM/pull/76
- Worker candidate registry: https://github.com/simondalmasso/ATM/blob/main/research/current/external-worker-candidates.json
- Architecture handoff: https://github.com/simondalmasso/ATM/blob/main/docs/handoff/ATM-AUTONOMOUS-WORK-HANDOFF-V1.md
- GitLab mirror: https://gitlab.com/simondalmasso/ATM

## CURRENT STATE
- **Work only in GitHub. GitLab is downstream mirror-only.**
- ORDER-055 + post-055 source-truth hardening are complete and deployed.
- Galaxy hard rules: capability taxonomy; skill != executor; `UNKNOWN != YES`; owner-spend/source/payout/executor truth all fail closed.
- DAYDREAMS uses source-specific TaskMarket evidence; AGENTHANSA uses fresh explicit fields/readbacks.
- Laya/System2/GLM and upstream repos remain advisory/source evidence unless a future order proves a bounded executor.
- Public MCP stays read-only.
- SeneX and boqa are READ_ONLY worker candidates only; **do not modify their repos**.
- m0kill may be consumed only as READ_ONLY research/killtest/negative-memory input; Moneykiller GitLab is archive.
- Latest authoritative money truth remains `PAID=0`.

## DONE
- GitHub canonical migration + Cloudflare exact-SHA deployment control.
- Automatic GitHub -> GitLab downstream mirror with SHA-parity readback.
- ORDER-054 AgentBounties read-only source; Xento WATCH_ONLY.
- ORDER-055 Galaxy Radar capability/executor hardening.
- Post-055 source/payout-truth hardening.
- Existing install-free skill broker.
- External worker candidates inventoried without mutating upstream repos.

## ACTIVE WORK / WHERE_TO_RESUME
**No active implementation order after this canon refresh. Single-ARQ mode is mandatory.**

## WHAT TO DO NOW
When AUD gives the next order:
1. Resolve live GitHub `main` first.
2. Read `AGENTS.md`, this file, the selected order, and worker registry if relevant.
3. Use exactly one bounded branch.
4. Verify evidence before editing.
5. Treat SeneX/boqa/m0kill as READ_ONLY unless the order explicitly promotes one through a bounded contract.
6. Add deterministic tests before behavior change.
7. Required `verify` must pass on exact PR head.
8. Merge only through protected GitHub PR.
9. If runtime bytes changed, require exact-SHA Cloudflare candidate/production smoke.
10. Verify GitLab mirror success and stop.

## PENDING
- External LLM architecture proposals from the canonical handoff; AUD must choose one next order.
- #55 ORDER-053 remains pending.
- #65/#66 remain parked.
- SeneX/boqa integration remains unimplemented by design until an explicit order proves a safe worker contract.

## BLOCKERS / RISKS
- No proven cash machine; no unsupported revenue projections.
- Fresh dynamic status required before economic claims.
- Worker availability != executor truth.
- boqa requires authorized scope; SeneX is PAPER-only.
- Oracle capacity must be freshly inventoried before any compute plan.

## WHAT_NOT_TO REPEAT
- Do not redo ORDER-054/055 or PR #76.
- Do not create work in GitLab.
- Do not modify SeneX/boqa to make ATM integration easier.
- Do not install framework/runtime candidates merely because they were researched.
- Do not give model/advisory output authority over economic/safety gates.
- Do not run pending orders concurrently.

## DO_NOT_TOUCH
Private signer/raw keys, payout destination, wallet/card/withdrawal actions, SeneX/boqa repos, GitLab runners/deploys, direct GitHub `main`, force-push, unrelated files.

## AUTHORITIES / GATES
`AGENTS.md` + current GitHub `main` are source authority. Required GitHub `verify` and protected-main rules are mandatory.  
Hard economics: `MIN_REWARD_USD>=100`, owner spend `0`, `UNKNOWN != YES`, fresh task readback before mutation, independent CHECK, authoritative settlement only for PAID.

## ACCEPTANCE / STOP CONDITIONS
**COMPLETE** only with exact-head CI green, protected merge, deploy/smoke when runtime changed, mirror success, and no unsupported money claim.

**STOP / HUMAN_GATE** for owner money, KYC/MFA/CAPTCHA/legal acceptance, card/wallet/financial signature, secret disclosure, paid dependency, protection bypass, unauthorized target/scope, or scope expansion.

## NEXT EXACT ACTION
Wait for AUD to compare the external model proposals and issue one exact implementation order. Do not self-promote SeneX/boqa or redesign ATM without that order.
