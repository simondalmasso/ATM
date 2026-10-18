# ORDER-067 — Economic floor $1–$50 discovery band and $400/month target

**Owner decision:** 2026-10-18. **Spend ceiling:** USD 0. **Mode:** protected PR; no production mutation in this order.

## Policy
- Runtime hard floor: `MIN_PRIMARY_REWARD_USD = 1` USD.
- Discovery priority: rewards from USD 1 to USD 50. This is a preferred search band, **not a maximum**; higher-value work remains eligible.
- Aspirational target: USD 400 net settled per month. This is a planning target, not a guarantee or a claim of current earnings.
- Preserve all other economic and safety gates: no paid APIs/credits, deposits, staking, token purchases, gas, trading, gambling, mining, private-key exposure, or owner-spend authority. `OWNER_SPEND_USD=0` remains hard.

## Implementation
- Update the production runtime's deterministic reward floor from USD 100 to USD 1.
- Update the economic-floor regression test to assert sub-dollar rewards are blocked, USD 1 is admitted by the floor, USD 50 is admitted, and higher rewards are not rejected by this floor.
- Reconcile AGENTS, README, ARQ/AUD canons, and handoff documentation.

## Acceptance
1. Exact PR-head GitHub `verify` succeeds.
2. Economic-floor test passes at the exact head.
3. Diff contains no signer, wallet, payout, transfer, withdrawal, credential, or spending-authority changes.
4. No claim/submit, task acceptance, transaction signing, payment, or production deploy is performed by this order.
5. Revenue is recorded only after authoritative external settlement; target remains aspirational until measured.

## Rollback
Revert this PR by exact commit SHA. No production deployment is authorized by this order alone; runtime promotion requires the existing canonical exact-SHA pipeline and smoke/readback gates.
