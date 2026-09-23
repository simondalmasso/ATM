# ATM — Agent Teller Machine

ATM is a zero-spend Cloudflare Worker whose objective is **externally settled USD**, not activity.

Canonical economic loop:

`DISCOVER -> ECONOMIC GATE -> ACQUIRE -> WORK -> CHECK -> SUBMIT -> SETTLEMENT READBACK -> LEARN`

Hard invariants:

- `MIN_REWARD_USD >= 100`
- `OUT_OF_PLAN_SPEND_USD = 0`
- no paid APIs, bid credits, deposits, stakes, gambling or trading
- `UNKNOWN != YES`
- `PAID/SETTLED` only from authoritative external evidence
- CHECK is independent from SUBMIT
- retries are bounded and idempotent

## Canonical production runtime

Main Worker:

- `cloudflare/order034/wrangler.order034.main.jsonc`
- `cloudflare/order034/ATM-ORDER034-WIN101-UI-CANDIDATE.js`
- `cloudflare/order034/ATM-ORDER034-ACTIVE-MAIN-READONLY.js`

The Wrangler entrypoint is the UI candidate. It overrides only `GET /` and delegates every other fetch plus scheduled execution to the active runtime.
TaskMarket signer boundary:

- `cloudflare/order034/wrangler.order034.signer.jsonc`
- `cloudflare/order034/ATM-ORDER034-FINAL-SIGNER-CANDIDATE.mjs`

The main Worker has no raw wallet key. It reaches the signer only through the private service binding and only for bounded claim/submit operations.

Active Cloudflare bindings:

- Durable Object: `ATM_BRAIN -> ATMBrain`
- Workers AI: `AI`
- Service binding: `TASKMARKET_SIGNER -> atm-taskmarket-signer@production`
- runtime var: `EXECUTION_ENABLED`

The production Worker keeps GLM on the Workers AI path, generic adapter dispatch, DAYDREAMS and AGENTHANSA execution adapters, settlement reconciliation, watchdog semantics and stale-runtime truth handling.

## Runtime truth

Public read surfaces include:

- `/`
- `/api/status`
- `/api/opportunities`
- `/api/money-loop`
- `/api/task-events`

The dashboard is read-only. `SUBMITTED`, `ACCEPTED` and `POTENTIAL` are never rendered as realized earnings.
## Deployment

GitHub main is the canonical source authority after ORDER-051. A push to main is not production authority until ATM CI passes for that exact SHA.

ATM Cloudflare Deploy is triggered only by a successful ATM CI workflow_run for main. It verifies the tested SHA is still main, injects that exact SHA into ATM_GIT_SHA on the ephemeral runner, dry-runs Wrangler, records the currently deployed version, uploads without production traffic, smoke-tests the Version URL, promotes that exact version, smoke-tests production, and automatically restores the previous version on failure.

The signer service is not redeployed. The existing private TASKMARKET_SIGNER -> atm-taskmarket-signer@production binding remains the only claim/submit signing boundary.

There is no supported recurring Windows Scheduled Task, OCI scheduler, GitHub command bus, or GitLab deployment runtime in the canonical tree.

## Payout

Public receive-only routing lives in `config/atm-v2.payouts.json`.

Rail-native settlement identity and the owner receive destination are different concepts. A marketplace may settle first to its bound worker wallet. Owner-controlled withdrawal or wallet-to-wallet transfer is never an autonomous ATM action.

## Verification

Fresh repository gates:

```powershell
node cloudflare/order034/ATM-ORDER034-WIN101-UI-TEST.mjs
node cloudflare/order034/ATM-ORDER034-PLANNER-JSON-TEST.mjs
node cloudflare/order034/ATM-ORDER034-VERIFIER-JSON-TEST.mjs
node cloudflare/order034/ATM-ORDER034-ONCHAIN-BLOCKER-TEST.mjs
node cloudflare/order034/ATM-ORDER034-ECONOMIC-FLOOR-TEST.mjs
node cloudflare/order034/ATM-ORDER034-GENERIC-ADAPTER-TEST.mjs
node cloudflare/order034/ATM-ORDER034-HANSA-ADAPTER-TEST.mjs
node cloudflare/order034/ATM-ORDER034-STATUS-TRUTH-TEST.mjs
node cloudflare/order034/ATM-ORDER034-WATCHDOG-V1-TEST.mjs
node cloudflare/order034/ATM-ORDER034-SIGNER-BEHAVIORAL-P0-FINAL.mjs
python -m unittest discover -s tests -p "test_*.py"
python scripts/secret_doctor.py
python scripts/payout_doctor.py
git diff --check
```

Historical orders, experiments and superseded Worker copies remain recoverable from Git history; they are not active runtime authority.
