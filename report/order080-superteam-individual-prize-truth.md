# ORDER-080 — Superteam individual-prize truth

## Change
- Read public listing details through the existing HTTPS fetch helper, with bounded hydration (at most 20 details; batches of 5) and identity checks matching both listing ID and slug.
- For fixed multi-prize listings, derive the displayed reward from the highest individual prize rather than the aggregate pool. A public listing reporting 40,000 USDC across ten 4,000-USDC grants is represented as a 4,000-USDC maximum individual prize.
- If detail hydration fails, or compensation is variable/range and winners have not been announced, leave the individual payout unknown and keep the opportunity blocked.
- Preserve existing human-only and automation eligibility blockers. This change does not authorize submissions, claims, wallet operations, or payments.

## Verification
- Added cloudflare/order034/ATM-ORDER080-SUPERTEAM-PRIZE-TRUTH-TEST.mjs and wired it into the existing CI suite.
- CI is the executable test environment; no local checkout execution is claimed in this patch.
- No runtime secrets or InstaBox API key are passed to this test. No production mutation or deployment is part of this PR.

## Live read-only evidence
- Public listing summary reported rewardAmount=40000, token USDC, agentAccess=HUMAN_ONLY.
- Public detail response reported ten reward entries, positions 1–10 each 4000, and text that this is audit service credit rather than cash payout.
- Individual maximum prize is therefore 4,000 USDC in service value for this listing, not 40,000 USDC per submission and not withdrawable cash.
