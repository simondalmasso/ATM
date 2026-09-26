# ATM — AUD CANON

**PROJECT**: ATM — Agent Teller Machine  
**PURPOSE**: zero-spend agentic money system. Canonical loop: `DISCOVER -> ECONOMIC GATE -> ACQUIRE -> WORK -> CHECK -> SUBMIT -> SETTLEMENT READBACK -> LEARN`. Success means externally settled money, not activity.  
**REPO**: https://github.com/simondalmasso/ATM  
**LIVE**: https://atm.simondalmasso44.workers.dev/ · health: `/health` · status: `/api/status` · MCP: `/mcp`

## LAST_VERIFIED / BRANCH / HEAD
- Repo/PR/ruleset state verified: **2026-09-25T22:06-03:00**.
- Canonical branch: `main`; **resolve its live Git HEAD before any mutation** because canon-only documentation commits may sit above the last runtime commit.
- Verified deployed/runtime HEAD: `2ee7bdb53c6a8f77373deebac6a5cb1175f112f0`.
- Latest production exact-SHA smoke: **PASS** at 2026-09-25T05:41:53Z; runtime `RUNNING`, MCP tool count `17`, zero-spend `true`, production SHA = deployed/runtime HEAD.
- Canon refresh commits after that runtime SHA change only `AUD_CANON.md` / `ARQ_CANON.md`; deploy path correctly returns `No production deploy required`.
- Active work branch: `feat/order055-galaxy-radar-v1` @ `46d5eb9c6322a0ab83f14f1188b0437e3d8dc5a1`; PR #63 is open and CI PASS. It diverges from current `main`; merge-base = `83a7c50e5336ccdad627b2cd498d821e74642adf`. Recompute ahead/behind live before resuming.
- Fresh dynamic `/api/status` could not be re-read in this refresh (Firecrawl credits exhausted; connected desktop offline). Do not invent current opportunity/earnings counters.

## CANONICAL LINKS
- Operating contract: https://github.com/simondalmasso/ATM/blob/main/AGENTS.md
- Main protection ruleset: https://github.com/simondalmasso/ATM/rules/23903496
- Active ORDER-055: https://github.com/simondalmasso/ATM/issues/62
- Active PR-055: https://github.com/simondalmasso/ATM/pull/63
- ORDER-054 final evidence: https://github.com/simondalmasso/ATM/issues/58#issuecomment-5824904782
- ORDER-058 / Meta watch persistence: https://github.com/simondalmasso/ATM/pull/68
- Pending ORDER-053: https://github.com/simondalmasso/ATM/issues/55
- Parked single-ARQ backlog: https://github.com/simondalmasso/ATM/issues/65 · https://github.com/simondalmasso/ATM/issues/66

## CURRENT STATE
- GitHub `main` is source authority; GitLab is archival/read-only and must consume **0 runner minutes**.
- Protected `main`: PR required, required check `verify`, non-fast-forward/deletion blocked, no bypass actors.
- Production inference path: Cloudflare Workers AI / GLM; current execution adapters: DAYDREAMS + AGENTHANSA behind generic dispatch; signer remains private/bounded.
- Public MCP is read-only; latest smoke counted **17 tools**.
- Latest authoritative live money evidence (ORDER-054): `REAL_PAID_USD=0`, `OWNER_OUT_OF_POCKET_USD=0`, `AUTO_ELIGIBLE=0`. No later merged change touched ACTIVE-MAIN economics; dynamic counters still require fresh readback before any new claim.
- AgentBounties is live as **public read-only discovery**; empty feed is healthy zero-result. Xento remains WATCH_ONLY.
- Meta Global AI Developer Hackathon notification state is persisted on repo/web as WATCH_ONLY; notification != application != acceptance != earnings.
- Laya/Jev patterns are research/advisory only; deterministic code owns economic/policy gates.

## DONE
- ORDER-051: GitHub canonical authority + exact-SHA CI/deploy/smoke/rollback path.
- ORDER-054: AgentBounties zero-spend read-only radar + Xento watch gate; final PASS.
- ORDER-058: Meta hackathon watch persisted to repo + read-only web; merged/deployed at current main.
- Base install-free skill broker exists: `skill_list`, `skill_route`, `skill_get`.

## ACTIVE WORK
**ONLY ONE ARQ FROM NOW ON.**  
Current single workstream = **ORDER-055 / PR #63**: Galaxy Radar capability taxonomy, executor-truth separation, passive market sources, bounded Laya/Jev adaptation.

PR #63 has green CI but must NOT be merged yet: it is behind current main and Codex review raised unresolved P1/P2 correctness concerns around fail-closed executor truth, fresh-readback reclassification, trading/betting phrasing, contradictory spend truth, HTTP executor proof, negated spend language, and subject-vs-required-capability classification.

## PENDING
- Finish ORDER-055 safely.
- ORDER-053 skill expansion is not started (Issue #55 has no execution evidence).
- ORDER-056 Apify/MeLi and ORDER-057 outcome-router research are **parked** under single-ARQ mode; both have no result comments.
- MQL5 K2 remains a separate future experiment only if an explicitly authorized eligible physical Windows host exists; Oracle VM is not the MQL5 worker path.

## BLOCKERS / RISKS
- No proven cash machine yet; settled money remains zero by last authoritative evidence.
- PR #63 review debt + branch divergence from main.
- Many legacy issues/PRs remain open but stale; open state alone is not authority.
- PR #64 is a stale duplicate AgentBounties implementation after ORDER-054 already completed through PRs #59–#61; do not merge it.
- Dynamic live counters require fresh `/api/status` before monetary/economic conclusions.

## DO_NOT_TOUCH
- No direct push to `main`; no force-push/bypass.
- No signer/private-key widening; no wallet/card/payment/withdrawal mutation.
- No paid APIs, credits, deposits, stakes, gas, gambling, trading or mining.
- No GitLab runners/deploys.
- No recurring Windows tasks.
- Do not run ORDER-056/057 in parallel; single ARQ means one active implementation/research order at a time.
- Do not revive stale PRs #24/#34/#36/#37/#64 without a new explicit audit.
- Do not promote Laya/System2/model prose into hard economic authority.
- `PAID != SUBMITTED != ACCEPTED != POTENTIAL`; `UNKNOWN != YES`.

## AUTHORITIES / GATES
Priority: current GitHub `main` + `AGENTS.md` + active ruleset + exact external receipts/live readback > issue claims > chat/history.  
Hard gates: `MIN_REWARD_USD >= 100`; `OUT_OF_PLAN_SPEND_USD=0`; re-read live task state before ACQUIRE/SUBMIT; independent CHECK before SUBMIT; PAID only from authoritative external settlement tied to ATM work.

## NEXT EXACT ACTION
Resume **PR #63 / ORDER-055 only**. Bring `feat/order055-galaxy-radar-v1` onto the **live current `main`** (runtime baseline `2ee7bdb...` plus canon-only docs descendants) without losing work, re-audit/address every still-valid Codex P1/P2 finding, rerun full CI on exact head, obtain a fresh clean review, then merge through protected PR and verify exact production SHA + health + MCP read-only/tool-count + money truth. Do nothing else until ORDER-055 reaches final evidence or a real blocker.
