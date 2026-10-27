# ORDER-079 — GitHub public issue discovery, read-only

Date: 2026-10-27  
Base: `5485df9f69a7848b4692f388014a98fe5423fecf`  
Branch: `feat/order079-github-readonly-discovery`

## Scope

Add GitHub public issue search as an eighth discovery source. Search is bounded to 30 recently updated open issues matching `bounty`. Requests use unauthenticated HTTPS GET to `api.github.com/search/issues`; issue links are accepted only when they resolve to `https://github.com/{owner}/{repo}/issues/{number}`.

This source is **discovery-only**. The presence of the word “bounty”, a `bounty` label, or a reward claim in issue text is not proof of a funded reward, eligibility, acceptance, or payout. ATM deliberately normalizes GitHub candidates with payout 0 / currency unknown and adds `GITHUB_REWARD_UNVERIFIED` and `DISCOVERY_ONLY_NO_EXECUTION_ADAPTER`. Candidates therefore cannot become auto-executable and do not count as earnings.

## Paperclip patterns adopted

- Goal/task/deliverable boundary: discovery candidates remain separate from execution and settlement.
- Least privilege and budget control: no GitHub token, no writes, no spend, no new runtime service.
- Auditability: source query, result count, incomplete-result flag, and blockers are attached to source state.
- Independent verification: no issue is accepted as paid without a separate verifiable payment/acceptance rail.

The Paperclip application itself is not installed. It would add another control plane and would not establish funded demand or a supported submission path.

## Explicit non-goals

- No issue comments, assignment, claim, pull request, code submission, or external mutation.
- No automatic execution of arbitrary GitHub issues.
- No promotion of textual reward amounts to USD.
- No production deployment or PR merge in this order.
- No changes to signer, wallet, payout, secrets, or spend authority.

## Verification

CI includes `cloudflare/order034/ATM-ORDER079-GITHUB-READONLY-TEST.mjs`, which mocks the external GET and asserts: no auth header, bounded GitHub host/path, issue normalization, text-only rewards stay unvalued, and every candidate remains blocked.

The test is committed but has not been run locally in this tool session; the repository connector does not provide a checked-out runtime. Treat the exact-head GitHub Actions result as the authoritative execution evidence. No TDD red run is claimed.

## Follow-up gate

Before any future GitHub candidate can be submitted, add a separate source-specific proof of funded reward, geographic eligibility, acceptance criteria, supported zero-cost execution/submission path, and authoritative settlement readback. Until then, this source can increase discovery visibility only, not income or automatic submissions.
