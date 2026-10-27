# Repository map and safe change path

## Authority hierarchy

1. Current live external readback for task, submission, and settlement truth.
2. Cache-busted production endpoints for deployed runtime state.
3. GitHub main and exact-SHA CI/deployment evidence for source/build provenance.
4. Current canonical documents: `README.md`, `ARQ_CANON.md`, `AUD_CANON.md`, this map, and latest audit report.
5. Historical order reports, progress snapshots, old CI runs, and prior model summaries — useful for provenance, not proof of current state.

## Canonical source paths

| Purpose | Path |
|---|---|
| Main Worker config | `cloudflare/order034/wrangler.order034.main.jsonc` |
| UI entry / fetch routing | `cloudflare/order034/ATM-ORDER034-WIN101-UI-CANDIDATE.js` |
| Active runtime / scheduled handler | `cloudflare/order034/ATM-ORDER034-ACTIVE-MAIN-READONLY.js` |
| Private Taskmarket signer | `cloudflare/order034/ATM-ORDER034-FINAL-SIGNER-CANDIDATE.mjs` |
| Main Worker Wrangler config | `cloudflare/order034/wrangler.order034.main.jsonc` |
| Signer Wrangler config | `cloudflare/order034/wrangler.order034.signer.jsonc` |
| Required CI inventory | `.github/workflows/ci.yml` |
| Guarded Cloudflare deployment | `.github/workflows/deploy-cloudflare.yml` |
| GitLab downstream mirror | `.github/workflows/mirror-gitlab.yml` |
| Secret diagnostics | `scripts/secret_doctor.py` |
| Payout diagnostics | `scripts/payout_doctor.py` |
| Python tests | `tests/` |
| Historical checkpoints/orders | `progress.md`, `report/`, `docs/migration/`, `docs/superpowers/` |

## Production surfaces (read-only)

- `/health` — runtime/build identity and dependency health.
- `/api/status` — discovery, execution, watchdog, signer binding, and settlement watcher summaries.
- `/api/opportunities` — current opportunity list and admission evidence.
- `/api/money-loop` — paid/withdrawable truth and stage counts.
- `/api/task-events` — bounded task-event history.

A successful deployment proves build promotion and smoke checks, not eligible work or revenue. For revenue, require authoritative external settlement tied to the task.

## Safe change workflow

1. Read exact main SHA, open PRs, latest exact-head CI, deploy run, and current production readback.
2. Name one observed failure and define a falsifiable expected behavior.
3. Add a regression test first; preserve fail-closed behavior for unknown terms, networks, signatures, and payout states.
4. Change the smallest responsible module. Do not install Elephant-Goldfish or another orchestration framework into the Worker; use its spec/review discipline externally.
5. Run focused behavioral tests, the CI inventory, `git diff --check`, secret/payout diagnostics.
6. Open a PR. Merge only after exact-head CI and review are clean.
7. Confirm post-merge CI, mirror parity, guarded deploy, production SHA, and external task/settlement readback.

## Never do during a documentation/hygiene order

- Do not claim/submit tasks, retry uncertain writes, sign messages, transfer or withdraw funds.
- Do not change wallet destinations, secrets, signer authority, scheduler cadence, or payout policy.
- Do not make direct production mutations or bypass the single deployment workflow.
- Do not present stale order snapshots as current.
