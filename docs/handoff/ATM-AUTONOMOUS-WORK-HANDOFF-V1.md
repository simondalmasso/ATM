# ATM external LLM architecture handoff — V1

## Goal

Design the smallest credible evolution of ATM that can find its own legitimate work at USD0 owner spend, judge whether it can actually execute it, acquire/apply only when authorized, track pending state, execute, independently verify, submit, and recognize payment only from authoritative settlement.

Do not optimize for activity. Optimize for EXPECTED_REALIZED_USD_PER_HOUR.

## Current verified ATM facts

- GitHub `simondalmasso/ATM` is sole source/deploy authority; protected main + required `verify`.
- Cloudflare Worker is canonical runtime; public MCP is read-only.
- Hard economics: MIN_REWARD_USD>=100; OUT_OF_PLAN_SPEND_USD=0; no paid APIs/credits/deposits/stakes/gas/trading/gambling/mining.
- Canonical loop: DISCOVER -> ECONOMIC GATE -> ACQUIRE -> WORK -> CHECK -> SUBMIT -> SETTLEMENT READBACK -> LEARN.
- Existing execution adapters: DAYDREAMS/TaskMarket and AGENTHANSA; every write must re-read fresh task state and pass deterministic gates.
- Galaxy Radar separates required capabilities from executor truth. A skill/library/source is never an executor by itself.
- Laya/Jev are advisory/pattern inputs only; deterministic code owns hard gates.
- AgentBounties is read-only discovery. Xento remains WATCH_ONLY.
- SeneX and boqa are now READ_ONLY worker candidates only. Their repos MUST NOT be modified by ATM.
- SeneX: PAPER-only/read-only market observability; never use it for trading/live orders/capital.
- boqa: potential authorized browser-QA/security-verification worker; CUORE/HumanGate remain authority; no unauthorized scanning or auto-submit.
- m0kill may be consumed read-only as upstream opportunity research/negative memory; Moneykiller GitLab is historical archive, not funded demand.
- Owner payout rails already exist outside this handoff. Treat them as receive-only configured state; do not print, replace, sign, withdraw, or move money.

## Architecture question

Propose how ATM should evolve from a monolithic Worker into a lean control plane plus bounded workers, without creating a framework zoo.

Required end-to-end state machine:

DISCOVER -> SOURCE_TRUTH -> ECONOMIC_TRUTH -> CAPABILITY_ROUTE -> EXECUTOR_TRUTH -> [HUMAN_GATE if needed] -> ACQUIRE/APPLY -> TRACK_PENDING -> EXECUTE -> CHECK -> SUBMIT -> SETTLEMENT_READBACK -> LEARN

For every transition define:
- authoritative input/readback;
- exact deterministic gate;
- allowed side effect;
- idempotency/retry behavior;
- timeout/failure state;
- evidence persisted;
- whether human authorization is mandatory.

## Candidate worker roles to evaluate

1. ATM Core/Cloudflare: policy, radar, routing, durable state, receipts, scheduler.
2. GLM Workers AI: bounded planning/text reasoning only.
3. Existing TaskMarket + AgentHansa adapters: economic write rails only after fresh deterministic admission.
4. SeneX READ_ONLY: market/research/observability advisory worker only.
5. boqa READ_ONLY initially: authorized browser-QA/security verification candidate; prove a job contract before execution authority.
6. m0kill READ_ONLY: external opportunity research + killtest/negative-memory feed.
7. Oracle capacity: treat as OPTIONAL compute. Re-inventory before use; do not assume the whole Oracle account is empty merely because atm-vcn is residual.
8. Skills/Laya/Jev/OpenJev/Julia-style components: context, classifiers, local algorithms or patterns only when they map to a measured capability gap. They never override hard gates.

## Required output

Return exactly:
A. CURRENT_GAPS — what still prevents real autonomous paid work today.
B. TARGET_ARCHITECTURE — components and trust boundaries; KEEP/ADAPT/REJECT for every candidate above.
C. WORKER_CONTRACT — one generic JSON-style request/result/receipt contract for bounded workers, including capability, cost ceiling=0, timeout, idempotency, evidence hash, and authority flags.
D. STATE_MACHINE — transitions and failure/human-gate behavior.
E. SOURCE/WORKER ROUTING — how arbitrary jobs map to required_capabilities, skills, and a proven executor without confusing availability with executability.
F. PENDING_WORK_ENGINE — exact design for applications/claims waiting on replies, deadlines, follow-ups and stale readback.
G. SETTLEMENT_TRUTH — how ATM distinguishes POTENTIAL/SUBMITTED/ACCEPTED/PAID and routes receive-only payout without financial mutation.
H. 3 PHASE PLAN — smallest shippable steps, each with tests and stop conditions. Phase 1 must deliver measurable additional earning capability without paid infra.
I. KILL LIST — overengineering/frameworks/integrations to reject now.
J. FIRST_NEXT_ORDER — one single implementation order, not parallel work, with exact acceptance tests.

Constraints:
- $0 owner spend.
- No direct main push; PR + required CI.
- No mutation of SeneX/boqa repos.
- No wallet/private-key widening.
- No autonomous legal acceptance/KYC/MFA/CAPTCHA.
- No trading/gambling/mining.
- No claim that a worker/executor exists until an E2E bounded contract is independently proven.
- UNKNOWN != YES.
- Prefer existing funded demand over speculative products.
- If the evidence does not justify a redesign, explicitly choose incremental adaptation instead.
