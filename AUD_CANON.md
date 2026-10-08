# ATM — AUD CANON

**PROJECT**: ATM — Agent Teller Machine  
**PURPOSE**: zero-spend agentic earning system. Canonical loop: `DISCOVER -> ECONOMIC GATE -> ACQUIRE -> WORK -> CHECK -> SUBMIT -> SETTLEMENT READBACK -> LEARN`. Success = externally settled money, not activity.  
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
- Operating contract: https://github.com/simondalmasso/ATM/blob/main/AGENTS.md
- Main protection ruleset: https://github.com/simondalmasso/ATM/rules/23903496
- ORDER-055 final issue: https://github.com/simondalmasso/ATM/issues/62
- ORDER-055 merged PR: https://github.com/simondalmasso/ATM/pull/63
- Post-055 source-truth hardening PR: https://github.com/simondalmasso/ATM/pull/76
- GitHub -> GitLab mirror PR: https://github.com/simondalmasso/ATM/pull/74
- GitLab downstream mirror: https://gitlab.com/simondalmasso/ATM
- External worker candidate registry: https://github.com/simondalmasso/ATM/blob/main/research/current/external-worker-candidates.json
- External LLM architecture handoff: https://github.com/simondalmasso/ATM/blob/main/docs/handoff/ATM-AUTONOMOUS-WORK-HANDOFF-V1.md
- Completed ORDER-059: https://github.com/simondalmasso/ATM/issues/78
- Completed ORDER-060: https://github.com/simondalmasso/ATM/issues/81
- Completed ORDER-061: https://github.com/simondalmasso/ATM/issues/87 · https://github.com/simondalmasso/ATM/pull/88
- Completed ORDER-063 docs-only: https://github.com/simondalmasso/ATM/issues/90 · https://github.com/simondalmasso/ATM/pull/91
- Pending ORDER-053: https://github.com/simondalmasso/ATM/issues/55
- Parked research: https://github.com/simondalmasso/ATM/issues/65 · https://github.com/simondalmasso/ATM/issues/66

## CURRENT STATE
- **GitHub is the sole CANON/source of truth and the only place where work is authored.**
- GitLab is an automatic downstream mirror only; it does not consume runner minutes or deploy production.
- Protected GitHub `main`: PR required, required check `verify`, non-fast-forward/deletion blocked, no bypass actors.
- Production adapters: DAYDREAMS + AGENTHANSA behind deterministic admission; signer remains private/bounded.
- Public MCP remains read-only; install-free skill broker exists.
- ORDER-055 Galaxy Radar is deployed: deterministic capability taxonomy, executor-truth separation, zero-spend fail-closed admission, passive market/source matrix, Laya/Jev advisory-only.
- Post-055 hardening now enforces `UNKNOWN != YES` for source/payout truth before execution. DAYDREAMS keeps a source-specific proof path; malformed/expired deadlines fail closed.
- AgentBounties remains public READ_ONLY discovery; Xento remains WATCH_ONLY.
- **SeneX and boqa are external READ_ONLY worker candidates only. Their repositories were audited but not modified.**
- SeneX live was observed HTTP 200 and self-declared read-only/PAPER-only. ATM may consider future bounded research/observability use only; never trading/live orders/capital.
- boqa `/health` was observed HTTP 200, `worker=boqa`, `mode=production`, backend configured. ATM may consider future authorized QA/verification work only after a separate bounded E2E contract proves executor truth.
- m0kill is a READ_ONLY upstream opportunity-research/killtest/negative-memory candidate. GitLab Moneykiller is historical/archive evidence, not funded demand or settlement authority.
- Latest authoritative money truth remains **PAID=0** unless a newer external settlement receipt proves otherwise.

## DONE
- ORDER-051: GitHub canonical authority + exact-SHA CI/deploy/smoke/rollback.
- GitHub -> GitLab automatic downstream mirror, SHA parity verified.
- ORDER-054: AgentBounties read-only radar + Xento watch gate.
- ORDER-055: Galaxy Radar/capability router + bounded Laya/Jev adaptation.
- Post-055 source/payout truth hardening: PR #76, exact-SHA production PASS.
- ORDER-058: Meta hackathon watch persistence.
- ORDER-059/060/061: money-path source truth, pending/settlement, capability intake and deterministic recovery/idempotence contracts (see progress.md).
- ORDER-063 (#90 / PR #91): AUD/ARQ/progress documentation reconciled with 2026-10-08 production evidence. Protected merge and mirror parity verified; no runtime promotion.
- Base install-free skill broker: `skill_list`, `skill_route`, `skill_get`.
- SeneX + boqa registered in ATM only as READ_ONLY worker candidates; m0kill/Moneykiller classified without creating a second authority.

## CURRENT WORK / ORDER SELECTION
**ORDER-063 (#90 / PR #91) COMPLETE.** GitHub protected merge at `6e4f179a233dc84361e8e097ce243d6bed586812`, post-merge CI `37831490045` SUCCESS, mirror `37831489947` SUCCESS, Cloudflare workflow `37831525088` SUCCESS with upload/promotion SKIPPED. GitLab main parity PASS; production remains `47c029199d904f12ea7ce929b33478db1b3a7546`.
No runtime order is active. AUD next selects **one** read-only Cloudflare deployed cron-trigger and invocation-log evidence task, before any runtime-changing repair; no speculative executor promotion.

## PENDING
- Current binding `PENDING_WORK`: one submitted item under receive-only settlement watch; `PAID_EXTERNAL=0`.
- Investigate discovery freshness only after ORDER-063: read actual Cloudflare cron trigger and invocation logs, then distinguish missing schedule, failing scheduled handler, or failed refreshRadar persistence. No unverified root-cause claim.
- ORDER-053 (#55) remains pending; ORDER-056 (#65) and ORDER-057 (#66) remain parked.
- SeneX/boqa worker promotion requires independent E2E proof; READ_ONLY until then. m0kill negative-memory input READ_ONLY.
- MQL5 K2 remains separate and owner-authorized only.

## BLOCKERS / RISKS
- No proven cash machine yet; authoritative paid money remains 0.
- Discovery timestamp has not advanced since 2026-10-01 although the settlement DO alarm advanced 2026-10-08. Versioned Wrangler cron declaration is absent; live Cloudflare trigger state UNKNOWN.
- Dynamic opportunity/money counters require fresh readback before any economic verdict.
- A library/skill/source/worker candidate does not prove execution capability.
- SeneX is PAPER-only and cannot be used as a trading executor.
- boqa requires explicit authorized target/scope and separate E2E proof before ATM may route work to it.
- Oracle `atm-vcn` appears residual to ATM, but a separate SeneX Oracle instance was observed active during the last infrastructure audit; do not describe the entire Oracle account as empty without a fresh inventory.

## DO_NOT_TOUCH
- No direct GitHub `main`, force-push or ruleset bypass.
- No development in GitLab; never make GitLab execution/deploy authority.
- No GitLab runners.
- No mutation of SeneX or boqa repositories from ATM work.
- No signer/private-key widening; no wallet/card/payment/withdrawal mutation.
- No paid APIs, owner-funded credits/deposits/stakes/gas, gambling, trading or mining.
- No recurring local-PC sync; mirror remains GitHub Actions -> GitLab.
- Do not run multiple ARQs in parallel.
- `PAID != SUBMITTED != ACCEPTED != POTENTIAL`; `UNKNOWN != YES`.

## AUTHORITIES / GATES
Priority: current GitHub `main` + `AGENTS.md` + active ruleset + exact external receipts/live readback > issue/chat/history.  
Hard economics: `MIN_REWARD_USD>=100`; owner out-of-plan spend `0`; fresh source readback before ACQUIRE/SUBMIT; independent CHECK; PAID only from authoritative external settlement tied to ATM work.

## NEXT EXACT ACTION
Do not repeat completed ORDER-059/060/061/063. AUD's next bounded decision is to read **actual Cloudflare deployed Cron Triggers configuration and scheduled invocation/error logs** without mutation, to explain discovery `last_run=2026-10-01T10:30:48.803Z` despite 2026-10-08 DO settlement alarms. If readback cannot be authorized, report UNKNOWN and stop; no cron edits, deployment or paid APIs. Create only one subsequent scoped issue when selected, then proceed by protected PR if evidence justifies a change.
