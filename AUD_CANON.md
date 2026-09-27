# ATM — AUD CANON

**PROJECT**: ATM — Agent Teller Machine  
**PURPOSE**: zero-spend agentic earning system. Canonical loop: `DISCOVER -> ECONOMIC GATE -> ACQUIRE -> WORK -> CHECK -> SUBMIT -> SETTLEMENT READBACK -> LEARN`. Success = externally settled money, not activity.  
**REPO**: https://github.com/simondalmasso/ATM  
**LIVE**: https://atm.simondalmasso44.workers.dev/ · `/health` · `/api/status` · `/mcp`

## LAST_VERIFIED / BRANCH / HEAD
- Verified: **2026-09-27T20:39-03:00**.
- Canonical branch: `main`.
- Runtime/deployed HEAD: `147fb81fb659c7a888154dbee97cda27dc53e907`.
- Main CI run `36359359467`: **PASS**.
- Cloudflare deploy run `36359377106`: **PASS**.
- Candidate exact-SHA smoke: **PASS**.
- Production exact-SHA smoke: **PASS**; smoke returned the same git SHA and `zero_spend=true`.

## CANONICAL LINKS
- Operating contract: https://github.com/simondalmasso/ATM/blob/main/AGENTS.md
- Main protection ruleset: https://github.com/simondalmasso/ATM/rules/23903496
- ORDER-055 final issue: https://github.com/simondalmasso/ATM/issues/62
- ORDER-055 merged PR: https://github.com/simondalmasso/ATM/pull/63
- GitHub->GitLab mirror PR: https://github.com/simondalmasso/ATM/pull/74
- GitLab downstream mirror: https://gitlab.com/simondalmasso/ATM
- ORDER-054 final evidence: https://github.com/simondalmasso/ATM/issues/58#issuecomment-5824904782
- Pending ORDER-053: https://github.com/simondalmasso/ATM/issues/55
- Parked research: https://github.com/simondalmasso/ATM/issues/65 · https://github.com/simondalmasso/ATM/issues/66

## CURRENT STATE
- **GitHub is the sole CANON/source of truth and the only place where work is authored.**
- GitLab is an automatic downstream mirror only. Workflow: `.github/workflows/mirror-gitlab.yml`.
- Mirror auth uses GitHub Actions secret `GITLAB_MIRROR_SSH_KEY` backed by a repo-scoped GitLab write Deploy Key.
- Mirror copies GitHub branches/tags, does not prune GitLab-only legacy refs, and verifies GitHub `main` SHA == GitLab `main` SHA.
- Mirror run `36359359489`: **PASS**; GitLab main readback matched GitHub main at `147fb81...`.
- GitLab runners/deploys are not used. Local PC / Remote Desktop / SentinelX are not runtime mirror dependencies.
- Protected GitHub `main`: PR required, required check `verify`, non-fast-forward/deletion blocked, no bypass actors.
- Production adapters: DAYDREAMS + AGENTHANSA behind deterministic admission; signer remains private/bounded.
- Public MCP remains read-only; skill broker exists.
- ORDER-055 Galaxy Radar is merged: deterministic capability taxonomy, executor-truth separation, zero-spend fail-closed admission, passive market/source matrix, Laya/Jev advisory-only.
- AgentBounties remains public READ_ONLY discovery; Xento remains WATCH_ONLY.
- Meta Global AI Developer Hackathon remains WATCH_ONLY; notification != application != acceptance != earnings.
- Latest authoritative money truth remains **PAID=0** unless a newer external settlement receipt proves otherwise.

## DONE
- ORDER-051: GitHub canonical authority + exact-SHA CI/deploy/smoke/rollback.
- GitHub -> GitLab automatic downstream mirror, SHA parity verified.
- ORDER-054: AgentBounties read-only radar + Xento watch gate.
- ORDER-055: Galaxy Radar/capability router + bounded Laya/Jev adaptation.
- ORDER-058: Meta hackathon watch persistence.
- Base install-free skill broker: `skill_list`, `skill_route`, `skill_get`.

## ACTIVE WORK
**NONE. Single-ARQ mode remains authoritative.** Start only one next order after AUD chooses it from current evidence.

## PENDING
- ORDER-053 (#55): skill intake/manifest expansion; not yet executed.
- ORDER-056 (#65) and ORDER-057 (#66): parked research; do not run in parallel.
- MQL5 K2 remains a separate future host experiment only with explicit authorization and an eligible physical Windows host.

## BLOCKERS / RISKS
- No proven cash machine yet; settled owner money is still unproven beyond `PAID=0` evidence.
- Dynamic opportunity/money counters must be freshly read before any new economic verdict.
- Legacy open PRs/issues are historical unless AUD explicitly reactivates them.
- Never infer executor support from a skill/source/library alone.

## DO_NOT_TOUCH
- No direct GitHub `main`, force-push or ruleset bypass.
- No development in GitLab; never make GitLab execution/deploy authority.
- No GitLab runners.
- No signer/private-key widening; no wallet/card/payment/withdrawal mutation.
- No paid APIs, owner-funded credits/deposits/stakes/gas, gambling, trading or mining.
- No recurring local-PC sync; mirror must remain GitHub Actions -> GitLab.
- Do not run multiple ARQs in parallel.
- `PAID != SUBMITTED != ACCEPTED != POTENTIAL`; `UNKNOWN != YES`.

## AUTHORITIES / GATES
Priority: current GitHub `main` + `AGENTS.md` + active ruleset + exact external receipts/live readback > issue/chat/history.  
Hard economics: `MIN_REWARD_USD>=100`; owner out-of-plan spend `0`; fresh source readback before ACQUIRE/SUBMIT; independent CHECK; PAID only from authoritative external settlement tied to ATM work.

## NEXT EXACT ACTION
AUD must perform one fresh evidence pass, select exactly **one** next order, and hand it to the single ARQ. Do not start ORDER-053/056/057 simultaneously.
