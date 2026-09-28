# ORDER-060 Capability Intake V1 Implementation Plan

> **For agentic workers:** Use the host''s available task-by-task implementation workflow. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist the Superteam hackathon watch and expose fail-closed, zero-owner-spend integration contracts for System-One providers, DCP compute, SkillOpt, and OpenScience.

**Architecture:** Keep Cloudflare ATM as the deterministic policy and money authority. New systems are represented as versioned candidate/provider contracts in the existing runtime status; none becomes a proven executor, payment authority, or policy gate without a separate E2E receipt. Research JSON records preserve source/host/cost constraints. The web UI gains one read-only watch card.

**Tech Stack:** Cloudflare Worker JavaScript, Node deterministic tests, JSON research records, GitHub Actions.

## Global Constraints

- OWNER_SPEND_USD = 0.
- UNKNOWN != YES.
- Public MCP remains read-only.
- No new signer, wallet, transfer, withdrawal, x402 buy-side, or financial authority.
- No recurring Windows Scheduled Task.
- Julia/Laya/Lev/Jev are advisory only and PROVEN=false.
- DCP DCC is not USD earnings or PAID without authoritative external settlement tied to ATM work.
- SkillOpt only proposes candidate skill revisions and requires held-out validation before adoption.
- OpenScience may only use local-model/local-compute paths under this order; paid/BYOK/remote compute is blocked.
- No new heavy runtime dependency is mounted inside the Cloudflare Worker.

---

### Task 1: Superteam watch persistence

**Files:**
- Modify: `cloudflare/order034/ATM-ORDER034-WIN101-UI-CANDIDATE.js`
- Modify: `cloudflare/order034/ATM-ORDER034-WIN101-UI-TEST.mjs`
- Create: `research/current/superteam-colosseum-salta-watch.json`
- Modify: `research/current/candidate-ledger.jsonl`

**Interfaces:**
- Consumes: official Luma event URL plus user-provided registration approval state.
- Produces: read-only WATCH card and PII-free research record.

- [ ] Add the focused failing UI assertions.
- [ ] Verify failure because card is missing.
- [ ] Add minimal card and research records.
- [ ] Verify focused UI test passes.

### Task 2: System-One provider registry

**Files:**
- Modify: `cloudflare/order034/ATM-ORDER034-ACTIVE-MAIN-READONLY.js`
- Create: `cloudflare/order034/ATM-ORDER060-CAPABILITY-INTAKE-TEST.mjs`
- Create: `research/current/system-one-provider-candidates.json`

**Interfaces:**
- Consumes: Julia-1, Laya, Lev, Jev evidence.
- Produces: `SYSTEM_ONE_PROVIDER_REGISTRY_V1` surfaced under `galaxy_radar.system_one_providers`.

- [ ] Add failing assertions for all four providers and zero-spend/authority boundaries.
- [ ] Verify failure because registry is absent.
- [ ] Add immutable provider contracts with `proven=false`, `runtime_mounted=false`, `hard_gate_authority=false`.
- [ ] Verify focused test passes.

### Task 3: DCP, SkillOpt, and OpenScience candidate contracts

**Files:**
- Modify: `cloudflare/order034/ATM-ORDER034-ACTIVE-MAIN-READONLY.js`
- Modify: `cloudflare/order034/ATM-ORDER060-CAPABILITY-INTAKE-TEST.mjs`
- Modify: `research/current/external-worker-candidates.json`
- Create: `research/current/capability-optimizer-candidates.json`

**Interfaces:**
- Consumes: DCP worker/evaluator contract, SkillOpt local/CLI backend contract, OpenScience local execution contract.
- Produces: `EXTERNAL_CAPABILITY_CANDIDATES_V1`; DCP/OpenScience entries in worker registry remain `proven=false`.

- [ ] Add failing assertions for DCP DCC-not-USD, SkillOpt no executor promotion, OpenScience paid-route block, and worker registry defaults.
- [ ] Implement minimum immutable contracts and status exposure.
- [ ] Verify no public mutation tool or authority expansion.

### Task 4: CI, release, deploy, readback

**Files:**
- Modify: `.github/workflows/ci.yml`
- Create: `progress.md`

**Interfaces:**
- Consumes: exact feature head.
- Produces: PR, exact-SHA CI, canonical deployment, production readback, GitLab parity.

- [ ] Add ORDER-060 test to CI.
- [ ] Run all Node CI commands, Python policy tests, doctors, and `git diff --check`.
- [ ] Commit/push and open PR closing #81.
- [ ] Merge only after exact-head CI success.
- [ ] Verify post-merge CI, candidate smoke, exact-version promotion, production SHA, live registry/card state, and mirror parity.

## Unresolved externally observable decisions

None. New candidates remain fail-closed until separate E2E proof; this order does not install or start external local services.
