# ATM — Agent Teller Machine

[![ATM CI](https://github.com/simondalmasso/ATM/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/simondalmasso/ATM/actions/workflows/ci.yml)

ATM is a **zero-owner-spend autonomous task-execution runtime** built on Cloudflare Workers, Durable Objects, Workers AI (GLM), and a read-only Model Context Protocol (MCP) interface. It evaluates task-market opportunities under deterministic economic and safety gates. Revenue counts only after an authoritative external settlement readback ties the payment to the exact task.

**Primary metric:** `EXPECTED_REALIZED_USD_PER_HOUR`, based on verified realized outcomes rather than activity, estimates, submissions, or acceptance alone.

## Canonical operating loop

`DISCOVER → ECONOMIC GATE → ACQUIRE → WORK → CHECK → SUBMIT → SETTLEMENT READBACK → LEARN`

## Economic and safety invariants

- Minimum primary reward: `MIN_PRIMARY_REWARD_USD = 100` (canonical floor: `MIN_REWARD_USD >= 100`).
- Owner out-of-plan spend remains `0 USD`; no paid APIs, credit purchases, deposits, stakes, gambling, trading, or mining.
- `UNKNOWN != YES`: missing, stale, or ambiguous source evidence never grants eligibility.
- Source, payout, executor, owner-spend, and current task-state checks remain deterministic.
- An independent CHECK attempts to reject work before SUBMIT.
- `PAID/SETTLED` is recorded only from authoritative external settlement evidence matched to the ATM task.
- KYC, MFA, CAPTCHA, legal acceptance, owner money, and owner financial signatures remain human gates. ATM does not bypass platform controls or fabricate state.
- Retries are bounded and idempotent. Model output cannot override hard gates or financial authority.

## Architecture and canonical entrypoints

Main Worker configuration and runtime:

- `cloudflare/order034/wrangler.order034.main.jsonc`
- `cloudflare/order034/ATM-ORDER034-WIN101-UI-CANDIDATE.js`
- `cloudflare/order034/ATM-ORDER034-ACTIVE-MAIN-READONLY.js`

The Wrangler entrypoint overrides only `GET /` for the dashboard and delegates other requests and scheduled execution to the active runtime.

TaskMarket signer boundary:

- `cloudflare/order034/wrangler.order034.signer.jsonc`
- `cloudflare/order034/ATM-ORDER034-FINAL-SIGNER-CANDIDATE.mjs`

The main Worker does not hold a raw wallet key. Claim/submit signing stays behind the private `TASKMARKET_SIGNER` service binding and its bounded contract.

Active Cloudflare bindings:

- Durable Object: `ATM_BRAIN → ATMBrain`
- Workers AI: `AI` (existing GLM inference path)
- Service binding: `TASKMARKET_SIGNER → atm-taskmarket-signer@production`
- Runtime variable: `EXECUTION_ENABLED`

The current execution adapters are DAYDREAMS and AGENTHANSA behind generic dispatch. A provider, model, skill, or external worker is not treated as a proven executor merely because it is discoverable.

## Runtime and read-only MCP surfaces

- `/` — dashboard
- `/health` — runtime and binding health
- `/api/status` — current runtime truth and safety metadata
- `/api/opportunities` — discovered opportunities
- `/api/money-loop` — economic and settlement state
- `/api/task-events` — execution event history
- `/mcp` — public read-only MCP tools

The dashboard and public MCP surface are read-only. `SUBMITTED`, `ACCEPTED`, and `POTENTIAL` are not realized earnings.

## RSI decision engine

The bounded RSI-inspired ranking layer and its design/review record are tracked in [PR #95](https://github.com/simondalmasso/ATM/pull/95).

- It may reorder only candidates that already pass deterministic admission.
- It uses the existing GLM Workers AI path for at most five candidates and one call per ranking decision.
- A strict local validator requires an exact permutation of supplied candidate IDs. Invalid output, quota exhaustion, model errors, or truncation fall back to the deterministic baseline without retry.
- `freshExecutionPolicy()` remains mandatory before the existing action path.
- Decision history is bounded. Accepted/rejected/paid feedback is associated only with verified external readbacks and compact evidence hashes.
- The read-only `rank_opportunities` tool uses deterministic ordering and does not invoke the model.
- RSI has ranking-only authority: no eligibility, spend, signer, submission, or settlement authority.

ChatGPT-side connectors are not automatically callable from the deployed Worker. The production RSI path uses only the existing GLM binding; any future external adapter requires a supported API contract, explicit permission/cost review, strict bounds, and tests.

Release status is determined from canonical `main` and authoritative Cloudflare deployment readback, not from a feature-branch commit or pull-request CI alone.

## Production and deployment authority

GitHub `main` is the canonical source authority. A branch push or successful pull-request CI run is not production authority.

The Cloudflare deployment workflow consumes a successful `ATM CI` workflow run for `main`, verifies that the tested SHA is still the main head, dry-runs Wrangler, records the current version, stages and smoke-tests the exact candidate, promotes it only after the version smoke passes, verifies production, and restores the previous version on failure.

The signer service is not redeployed by the main Worker workflow. GitLab is a downstream mirror only; do not author changes there or use it as deployment authority. No recurring Windows Scheduled Task or OCI scheduler is part of the canonical runtime.

## Payout and settlement truth

Receive-only payout routing is defined in `config/atm-v2.payouts.json`.

The rail-native settlement identity and owner receive destination are separate concepts. A marketplace may settle to its bound worker wallet first. Owner-controlled withdrawal or wallet-to-wallet transfer is never an autonomous ATM action.

## Verification

The protected `ATM CI` workflow uses Node.js 22.16.0 and Python 3.12. It runs Worker behavior tests, RSI contract tests, Python policy tests, secret/payout doctors, and repository-integrity checks.

To reproduce the test commands from the repository root:

```bash
node cloudflare/order034/ATM-ORDER034-WIN101-UI-TEST.mjs
node cloudflare/order034/ATM-MCP-HEARTBEAT-TEST.mjs
node cloudflare/order034/ATM-MCP-PUBLIC-TEST.mjs
node cloudflare/order034/ATM-ORDER034-PLANNER-JSON-TEST.mjs
node cloudflare/order034/ATM-ORDER034-VERIFIER-JSON-TEST.mjs
node cloudflare/order034/ATM-ORDER034-ONCHAIN-BLOCKER-TEST.mjs
node cloudflare/order034/ATM-ORDER034-ECONOMIC-FLOOR-TEST.mjs
node cloudflare/order034/ATM-ORDER034-GENERIC-ADAPTER-TEST.mjs
node cloudflare/order034/ATM-ORDER034-HANSA-ADAPTER-TEST.mjs
node cloudflare/order034/ATM-ORDER034-STATUS-TRUTH-TEST.mjs
node cloudflare/order034/ATM-ORDER034-RSI-HELPERS-TEST.mjs
node cloudflare/order034/ATM-ORDER034-RSI-DECISION-TEST.mjs
node cloudflare/order034/ATM-ORDER034-WATCHDOG-V1-TEST.mjs
node cloudflare/order034/ATM-ORDER034-SIGNER-BEHAVIORAL-P0-FINAL.mjs
node cloudflare/order034/ATM-ORDER051-DEPLOY-READBACK-TEST.mjs
node cloudflare/order034/ATM-ORDER054-AGENTBOUNTIES-TEST.mjs
node cloudflare/order034/ATM-ORDER055-GALAXY-RADAR-TEST.mjs
node cloudflare/order034/ATM-ORDER059-MONEY-PATH-V1-TEST.mjs
node cloudflare/order034/ATM-ORDER060-CAPABILITY-INTAKE-TEST.mjs
node cloudflare/order034/ATM-ORDER061-RECOVERY-CONSISTENCY-TEST.mjs
node scripts/order051-smoke-retry-test.mjs
node scripts/order054-pathgate-unknown-sha-test.mjs
python -m compileall -q scripts tests
python -m unittest discover -s tests -p 'test_*.py' -v
python scripts/secret_doctor.py
python scripts/payout_doctor.py
git diff --check
```

Historical orders, research, and superseded Worker copies remain available as audit evidence; they are not active runtime authority.

## Canonical references

- [Operating contract](AGENTS.md)
- [AUD canonical state](AUD_CANON.md)
- [ARQ canonical state](ARQ_CANON.md)
- [RSI design specification](docs/specs/2026-10-13-atm-rsi-decision-engine-design.md)
- [RSI and repository hygiene implementation plan](docs/plans/2026-10-13-atm-rsi-and-repo-hygiene.md)
- [Repository metadata and SEO recommendations](docs/maintenance/repository-metadata.md)

## License status

No `LICENSE` file is present in the inspected repository tree. Public visibility alone does not grant reuse rights; do not assume the project is permissively licensed.
