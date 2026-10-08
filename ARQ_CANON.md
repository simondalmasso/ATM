# ATM — ARQ CANON

**PROJECT**: ATM — Agent Teller Machine  
**PURPOSE**: zero-spend autonomous earning system; optimize externally settled USD/hour, never activity metrics.  
**REPO**: https://github.com/simondalmasso/ATM  
**LIVE**: https://atm.simondalmasso44.workers.dev/ · `/health` · `/api/status` · `/mcp`

## LAST_VERIFIED / AUTHORITY (2026-10-08)
- Audit baseline GitHub `main` = `9c17b4ba03f022f3c754073ec6ac5a2535ce0faf`; GitLab `main` parity PASS. Resolve fresh main before changes.
- Live production `/health.git_sha=47c029199d904f12ea7ce929b33478db1b3a7546`; intentional docs-only main/runtime SHA separation after PR #89.
- Ruleset 23903496 enforcement active; main protected by PR + `verify` and no bypass. Main CI run 36413015246 SUCCESS; GitLab mirror 36413015325 SUCCESS; Cloudflare docs-only workflow 36413051154 SUCCESS (no runtime promotion).
- ORDER-059 (#78), ORDER-060 (#81), ORDER-061 (#87, merged PR #88), ORDER-063 (#90, merged PR #91) COMPLETED. PR #86 closed unmerged and #85 closed duplicate after diff/functional comparison against ORDER-061.
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
- Completed docs-only ORDER-063: https://github.com/simondalmasso/ATM/issues/90 · https://github.com/simondalmasso/ATM/pull/91

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
- ORDER-063 (#90 / PR #91) completed as a docs-only protected merge; post-merge GitLab mirror parity verified; Cloudflare upload and promotion skipped.

## ACTIVE WORK / WHERE_TO_RESUME
**ORDER-063 (#90 / PR #91) COMPLETE.** GitHub main after protected merge `6e4f179a233dc84361e8e097ce243d6bed586812`, post-merge CI `37831490045` SUCCESS, mirror `37831489947` SUCCESS, Cloudflare workflow `37831525088` SUCCESS with runtime promotion SKIPPED; production still at `47c029199d904f12ea7ce929b33478db1b3a7546`.
No runtime implementation order active. Next order must be selected by AUD from new evidence; first investigate the deployed Cloudflare cron in READ_ONLY mode.

## WHAT TO DO NOW
1. Re-read GitHub main / AGENTS.md / progress.md and fresh `/health` + `/api/status`, rejecting search-cache responses without current timestamps.
2. Keep `PAID_EXTERNAL=0`, `PENDING_WORK`, `UNKNOWN != YES`, owner spend 0; continue receive-only settlement readback.
3. Diagnose discovery freshness with read-only **deployed Cloudflare cron trigger list, schedule settings and scheduled invocation logs**. Source code's scheduled->/__cron->refreshRadar path is confirmed; reason for the 2026-10-01 last-run stall is not.
4. If genuine trigger/handler failure is proven, create exactly one bounded repair order with tests and external smoke; until then DO NOT change trigger settings or runtime.
5. Maintain GitHub-only protected development; mirror downstream GitLab and never use runner minutes there.

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
ORDER-063 docs-only reconciliation is complete. AUD selects one Cloudflare deployed Cron Triggers and scheduled-log **READ_ONLY** forensic check before proposing a runtime order. No automatic claim/submit, paid service, signer/withdrawal widening or speculative executor work.
