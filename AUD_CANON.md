# ATM — AUD CANON

**PROJECT**: ATM — Agent Teller Machine  
**PURPOSE**: zero-spend agentic earning system. Canonical loop: `DISCOVER -> ECONOMIC GATE -> ACQUIRE -> WORK -> CHECK -> SUBMIT -> SETTLEMENT READBACK -> LEARN`. Success = externally settled money, not activity.  
**REPO**: https://github.com/simondalmasso/ATM  
**LIVE**: https://atm.simondalmasso44.workers.dev/ · `/health` · `/api/status` · `/mcp`

## LAST_VERIFIED / BRANCH / HEAD
- Verified: **2026-09-28**, with fresh live readback before ORDER-059 issuance.
- Canonical branch: `main` @ `e1065e2761ba13d36ccbaacfc66eb16d40cf0f26`.
- Runtime/deployed HEAD remains `fd29053bbf3933ca24d29f69cd5990e94efc6348` (latest main change is docs/research-only).
- Main CI run `36369417166`: **PASS**.
- Cloudflare deploy run `36369435116`: **PASS**.
- Candidate exact-SHA smoke: **PASS**.
- Production exact-SHA smoke: **PASS**.
- GitHub -> GitLab mirror run `36369417164`: **PASS**.
- Fresh live readback: runtime `RUNNING`, `raw_found=43`, `admitted=0`, `human_assistable=38`, `auto_eligible=0`, `claimed=3`, `submitted=1`, `accepted=0`, `PAID=0`, settlement watcher `pending=1`, owner spend `0`.

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
- Active ORDER-059: https://github.com/simondalmasso/ATM/issues/78
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
- Base install-free skill broker: `skill_list`, `skill_route`, `skill_get`.
- SeneX + boqa registered in ATM only as READ_ONLY worker candidates; m0kill/Moneykiller classified without creating a second authority.

## ACTIVE WORK
**ATM-ORDER-059 (#78) is the single active implementation order.** AUD selected targeted incremental adaptation after comparing external proposals against fresh LIVE evidence. No redesign, no new executor promotion, and no parallel ARQ.

## PENDING
- ORDER-059 implementation/audit cycle: source-intake truth, durable pending work, receive-only settlement readback, worker-contract schema/registry with every new worker defaulting `PROVEN=false`.
- ORDER-053 (#55): skill intake/manifest expansion remains pending; do not automatically execute it in parallel.
- ORDER-056 (#65) and ORDER-057 (#66): parked research.
- SeneX/boqa worker promotion requires separate evidence-bound order; READ_ONLY until then.
- MQL5 K2 remains a separate future host experiment only with explicit authorization and eligible host.

## BLOCKERS / RISKS
- No proven cash machine yet; authoritative paid money remains 0.
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
ARQ executes **only ATM-ORDER-059 (#78)** from current GitHub `main`, on one bounded branch and PR. Required `verify` must pass; runtime-byte changes require exact-SHA candidate/production smoke + rollback; docs-only changes must skip deploy. Do not run #55/#65/#66 in parallel and do not promote SeneX/boqa or any executor without the order's bounded proof.
