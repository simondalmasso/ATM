# Read-only Temporary Access Grants Implementation Plan

> **For agentic workers:** Use the host's available task-by-task implementation workflow. Steps use checkbox syntax for tracking.

**Goal:** Add an owner-gated web control to issue, inspect, and revoke temporary tasks:read bearer grants for ATM's dedicated task API.

**Architecture:** Reuse the existing Cloudflare Worker UI, owner-session guard, and Durable Object storage. Store only token hashes and expose a read-only allowlisted task response; all external marketplace mutations and wallet access remain out of scope.

**Tech Stack:** Cloudflare Workers, Durable Objects, JavaScript modules, Node.js regression tests, GitHub Actions.

## Global Constraints

- OUT_OF_PLAN_SPEND_USD = 0.
- No CashClaw integration, wallet delegation, private keys, third-party credentials, paid APIs, claims, submissions, signatures, transfers, or withdrawals.
- No always-on process on the user's PC.
- Tokens are bearer capabilities; share only with the intended agent.
- Existing public dashboard opportunities remain public; the grant gates the dedicated agent API, not all public dashboard data.
- Production deployment only through the canonical exact-SHA Cloudflare workflow.

---

### Task 1: Grant storage and token lifecycle

**Files:**
- Create: cloudflare/order034/ATM-ORDER068-READONLY-GRANTS.mjs
- Test: cloudflare/order034/ATM-ORDER068-READONLY-GRANTS-TEST.mjs

**Interfaces:**
- createReadOnlyGrant({ storage, label, ttlMinutes, now })
- listReadOnlyGrants({ storage, now })
- revokeReadOnlyGrant({ storage, id, now })
- authorizeReadOnlyGrant({ storage, token, now })
- sanitizeReadOnlyTasks(input)

- [x] Add behavioral test for create/hash/list/revoke/expiry and sanitizer.
- [x] Observe initial failure while the module was absent.
- [x] Implement token generation, hash-only persistence, fixed scope, TTL bounds, expiry, and revocation.
- [x] Run focused tests: create/hash/list/auth/revoke/expiry/allowlist all pass.

### Task 2: Worker API and UI

**Files:**
- Modify: cloudflare/order034/ATM-ORDER034-ACTIVE-MAIN-READONLY.js
- Modify: cloudflare/order034/ATM-ORDER034-WIN101-UI-CANDIDATE.js
- Modify: cloudflare/order034/ATM-ORDER034-WIN101-UI-TEST.mjs
- Create: cloudflare/order034/ATM-ORDER068-READONLY-API-TEST.mjs

**Interfaces:**
- Owner: GET/POST /api/access-grants, POST /api/access-grants/:id/revoke
- Agent: GET /api/agent/tasks with Authorization: Bearer <token>

- [x] Add route-boundary checks for owner session, same-origin mutation, bearer token, and fixed scope.
- [x] Add UI controls for labels, TTL, one-time token display, listing, and immediate revocation.
- [x] Add an allowlist sanitizer and reject unsafe URLs.
- [x] Run focused grant, route, and UI tests; all passed locally on the connected host.

### Task 3: CI, documentation, and production verification

**Files:**
- Modify: .github/workflows/ci.yml
- Create: docs/specs/2026-10-18-order068-readonly-grants-design.md
- Create: docs/plans/2026-10-18-readonly-temporary-grants.md
- Modify: README.md

- [ ] Run exact-head CI and review its full result.
- [ ] Verify the branch diff contains no wallet, signer, payout, or spending-authority changes.
- [ ] Merge only after required checks succeed.
- [ ] Confirm canonical deployment SHA and production endpoint behavior.
- [ ] Confirm no process was left running on the user's PC.

## Error contract

- No owner session: HTTP 403 for owner management.
- Missing or malformed bearer token: HTTP 401.
- Invalid, revoked, or expired token: deny access.
- TTL outside 5–1440 minutes: reject.
- The owner UI defaults to the 30-minute temporary grant preset for separate GLM and Arena tokens.
- More than 50 active grants: reject.
- Revoke unknown ID: HTTP 404.
- Read responses are uncached and return only the task allowlist.

## Unresolved decision

This v0 intentionally does not expose private account data or delegate login sessions. A future private-account broker would require a separate design and explicit authorization.
