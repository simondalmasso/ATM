# ORDER-068 — Read-only temporary access grants

**Status:** Approved implementation scope, 2026-10-18  
**Owner constraints:** zero spend; no delegated wallets; no CashClaw; no local always-on process.

## Goal

Provide a web control inside ATM for issuing and revoking time-limited bearer capabilities that expose only a dedicated, read-only task-discovery API.

## Architecture

- Reuse the existing Cloudflare Worker UI, owner-session cookie, and ATM_BRAIN Durable Object storage.
- Store grant records in Durable Object storage. Generate a 256-bit random bearer token, return it only at creation, and persist only its SHA-256 hash plus an index from the hash to the grant record.
- Each grant has the immutable scope tasks:read, a label, creation/expiry timestamps, revocation timestamp, last-use timestamp, and use count.
- Owner-only web endpoints: GET /api/access-grants, POST /api/access-grants, and POST /api/access-grants/:id/revoke. Every owner endpoint verifies the existing owner session; mutations also require the exact production origin.
- Agent endpoint: GET /api/agent/tasks, requiring Authorization: Bearer <token>. It returns a maximum of 100 task records using an explicit field allowlist and Cache-Control: no-store.
- Reuse ATM's current opportunity records as the source. Do not claim, bid, submit, publish, sign, pay, withdraw, or modify external platforms.

## Grant policy

- Allowed scope: tasks:read only.
- TTL: integer from 5 minutes to 24 hours; the UI offers 15 minutes, 1 hour, 4 hours, 12 hours, or 24 hours.
- Maximum: 50 unexpired, unrevoked grants.
- Request limits: owner listing 60/minute, creation 10/minute, revocation 20/minute; agent task reads 120/minute per IP and 120/minute per grant.
- Token shape: 64 lowercase hexadecimal characters; token must never be written to logs, persistent browser storage, or a grant-list response.
- Revocation is checked on every API request and takes effect immediately.
- Public task response fields: id, source, title, description, estimated net USD, currency, status, HTTP(S) URL, executability label, and bounded blocker strings. Never return the source record wholesale.

## Explicit limitation

The existing public ATM dashboard already exposes a public opportunities endpoint. This grant gates the dedicated /api/agent/tasks contract and enables per-grant rate limiting/revocation; it does not make the dashboard's public opportunity data private. Do not present it as a credential vault or a private account-session broker.

## Security and failure behavior

- Missing/malformed token: HTTP 401.
- Invalid, revoked, expired, or wrong-scope grant: deny access; never fall back to public agent access.
- Missing owner session: HTTP 403 for management routes.
- Wrong mutation origin: HTTP 403.
- Invalid TTL or grant capacity reached: reject creation.
- Unknown grant id: HTTP 404.
- API responses are not cached. The browser does not persist bearer tokens; it shows a new token only after creation.
- No wallet key, seed phrase, third-party credential, payment authority, or external mutation capability is introduced.

## Acceptance tests

1. A grant can be created; only its hash is persisted.
2. Listing does not disclose token or token hash.
3. Valid token authorizes tasks:read; wrong token, expired token, and revoked token fail.
4. TTL outside 5–1440 minutes is rejected.
5. Sanitization drops records without id/source, removes non-HTTP(S) URLs, and never passes through unapproved source fields.
6. Owner-gated routes and bearer-only GET route are present; UI contains no marketplace mutation calls or browser storage for tokens.
7. Existing UI syntax/behavior tests and CI pass.
8. Production is promoted only by the canonical exact-SHA Cloudflare workflow; no direct deploy.
