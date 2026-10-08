# ATM — ARQ CANON

**PROJECT**: ATM — Agent Teller Machine  
**PURPOSE**: zero-spend autonomous earning system; optimize externally settled USD/hour, never activity metrics.  
**REPO**: https://github.com/simondalmasso/ATM  
**LIVE**: https://atm.simondalmasso44.workers.dev/ · `/health` · `/api/status` · `/mcp`

## LAST_VERIFIED / AUTHORITY (2026-10-08)
- Audit baseline GitHub `main` = `9c17b4ba03f022f3c754073ec6ac5a2535ce0faf`; GitLab `main` parity PASS. Resolve fresh main before changes.
- Live production `/health.git_sha=47c029199d904f12ea7ce929b33478db1b3a7546`; intentional docs-only main/runtime SHA separation after PR #89.
- Ruleset 23903496 enforcement active; main protected by PR + `verify` and no bypass. Main CI run 36413015246 SUCCESS; GitLab mirror 36413015325 SUCCESS; Cloudflare docs-only workflow 36413051154 SUCCESS (no runtime promotion).
- ORDER-059 (#78), ORDER-060 (#81), ORDER-061 (#87, merged PR #88) COMPLETED. PR #86 closed unmerged and #85 closed duplicate after diff/functional comparison against ORDER-061.
- 2026-10-08 runtime: `claimed=3`, `submitted=1`, `accepted=0`, `paid=0`, `auto_eligible_now=0`, `owner_spend_usd=0`, `EXPECTED_REALIZED_USD_PER_HOUR=UNKNOWN`, `next_binding_constraint=PENDING_WORK`.
- MONEY_PATH_V1: `PAID_EXTERNAL=0`, `SUBMITTED_WITH_FRESH_READBACK=1`, `WAITING_HUMAN=4`, `SOURCE_PROOF_REQUIRED=44`. `money_loop.queue_states.waiting_human=0` and `human_gate.pending=0` count different populations, not a proven bug.
- Settlement watcher last seen at `2026-10-08T19:11:36.092Z` (`do_alarm`, pending=1, paid=0); discovery last run `2026-10-01T10:30:48.803Z` (DEGRADED, 7 attempted/5 OK/2 failed, 49 raw/0 admitted). Freshness symptom confirmed, root cause UNKNOWN.
- Code route `scheduled -> /__cron -> refreshRadar -> radar.last_run`; DO alarm independently monitors settlement. Versioned main Wrangler config has no `triggers.crons`; actual deployed Cloudflare trigger state/logs not yet read back. Do not declare missing cron or change production without external verification.

## CANONICAL LINKS
- Contract: https://github.com/simondalmasso/ATM/blob/main/AGENTS.md
- Ruleset: https://github.com/simondalmasso/ATM/rules/23903496
- Completed ORDER-055: https://github.com/simondalmasso/ATM/issues/62
- Post-055 hardening: https://github.com/simondalmasso/ATM/pull/76
- Worker candidate registry: https://github.com/simondalmasso/ATM/blob/main/research/current/external-worker-candidates.json
- Architecture handoff: https://github.com/simondalmasso/ATM/blob/main/docs/handoff/ATM-AUTONOMOUS-WORK-HANDOFF-V1.md
- GitLab mirror: https://gitlab.com/simondalmasso/ATM
- Completed ORDER-059: https://github.com/simondalmasso/ATM/issues/78
- Completed ORDER-060: https://github.com/simondalmasso/ATM/issues/81
- Completed ORDER-061: https://github.com/simondalmasso/ATM/issues/87 · https://github.com/simondalmasso/ATM/pull/88
- Active docs-only ORDER-063: https://github.com/simondalmasso/ATM/issues/90

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
- ORDER-059/060/061 completed; MONEY_PATH recovery and settlement tests merged as PR #88, deployed at 47c0291. PR #86 closed unmerged; #85 duplicate closed.

## ACTIVE WORK / WHERE_TO_RESUME
**Single current order: ATM-ORDER-063 (#90), docs-only CANON/progress reconciliation.** Branch `docs/order063-canon-reconciliation`, base GitHub main snapshot `9c17b4ba...`. No separate runtime order while this one is open.

## WHAT TO DO NOW
1. Re-read current GitHub main, AGENTS.md and issue #90; change only AUD_CANON.md, ARQ_CANON.md and progress.md.
2. Preserve production SHA distinct from docs-only main; source and money truth remain fail-closed: PAID_EXTERNAL=0, owner spend=0, executor proof not promoted.
3. Preserve discovery freshness finding as UNKNOWN-root-cause: last_run `2026-10-01T10:30:48.803Z`; settlement DO alarm readback on 2026-10-08. Scheduled handler calls refreshRadar, but deployed Cloudflare trigger/log state has not been read.
4. Required exact-head `verify` PASS, protected GitHub PR merge, docs-only deploy SKIP, post-merge GitLab parity check.
5. Once #90 completes, select exactly one bounded **read-only Cloudflare cron configuration/log** audit before any runtime repair.

## PENDING
- `MONEY_PATH_V1.next_binding_constraint=PENDING_WORK`: one submitted task awaiting authoritative settlement; `PAID_EXTERNAL=0`.
- Discovery freshness investigation: Cloudflare live cron trigger + scheduled logs must be verified read-only before any fix.
- ORDER-053 (#55) pending, #65/#66 parked; no parallel code implementation.
- SeneX/boqa candidates remain READ_ONLY and unproven; m0kill is negative-memory research only.

## BLOCKERS / RISKS
- No proven cash machine; no unsupported revenue projections.
- Discovery last_run has not advanced since 2026-10-01 despite 2026-10-08 DO alarm activity; never infer absent cron trigger without Cloudflare readback.
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
Complete **ORDER-063 (#90)** through docs-only protected GitHub PR, exact-head `verify` and GitLab SHA mirror readback; no Cloudflare runtime change, no signer change, no new executor promotion. Investigate deployed Cloudflare cron/logs only after reconciling this CANON.
