# ATM — ARQ CANON

**PROJECT**: ATM — Agent Teller Machine  
**PURPOSE**: zero-spend autonomous earning system; optimize externally settled USD/hour, never activity metrics.  
**REPO**: https://github.com/simondalmasso/ATM  
**LIVE**: https://atm.simondalmasso44.workers.dev/ · `/health` · `/api/status` · `/mcp`

## LAST_VERIFIED / BRANCH / HEAD
- Verified: **2026-09-28**, after AUD architecture selection.
- GitHub `main`: `e1065e2761ba13d36ccbaacfc66eb16d40cf0f26`; production runtime remains `fd29053bbf3933ca24d29f69cd5990e94efc6348` because the latest main delta is docs/research-only.
- Main required `verify`: **PASS** (run `36369417166`).
- Cloudflare exact-SHA deployment: **PASS** (run `36369435116`).
- GitLab downstream mirror: **PASS** (run `36369417164`).
- Fresh live readback: runtime `RUNNING`, `raw_found=43`, `admitted=0`, `human_assistable=38`, `auto_eligible=0`, `claimed=3`, `submitted=1`, `accepted=0`, `PAID=0`, settlement watcher `pending=1`, owner spend `0`.

## CANONICAL LINKS
- Contract: https://github.com/simondalmasso/ATM/blob/main/AGENTS.md
- Ruleset: https://github.com/simondalmasso/ATM/rules/23903496
- Completed ORDER-055: https://github.com/simondalmasso/ATM/issues/62
- Post-055 hardening: https://github.com/simondalmasso/ATM/pull/76
- Worker candidate registry: https://github.com/simondalmasso/ATM/blob/main/research/current/external-worker-candidates.json
- Architecture handoff: https://github.com/simondalmasso/ATM/blob/main/docs/handoff/ATM-AUTONOMOUS-WORK-HANDOFF-V1.md
- GitLab mirror: https://gitlab.com/simondalmasso/ATM
- Active implementation order: https://github.com/simondalmasso/ATM/issues/78

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
**ATM-ORDER-059 (#78) is the only active implementation order.** Start from current GitHub `main`; no parallel ORDER-053/056/057 work.

## WHAT TO DO NOW
For ORDER-059:
1. Resolve live GitHub `main` first.
2. Read `AGENTS.md`, this file, `AUD_CANON.md`, and Issue #78 before editing.
3. Use exactly one bounded branch.
4. Verify evidence before editing.
5. Treat SeneX/boqa/m0kill as READ_ONLY unless the order explicitly promotes one through a bounded contract.
6. Add deterministic tests before behavior change.
7. Required `verify` must pass on exact PR head.
8. Merge only through protected GitHub PR.
9. If runtime bytes changed, require exact-SHA Cloudflare candidate/production smoke.
10. Verify GitLab mirror success and stop.

## PENDING
- Execute ORDER-059 and return its exact final evidence contract for independent AUD.
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
Execute **ATM-ORDER-059 (#78)** only: targeted `MONEY_PATH_V1` adaptation (source truth + durable pending + receive-only settlement + worker-contract schema/registry). No redesign, no new executor promotion, no SeneX/boqa mutation, no GitLab development.
