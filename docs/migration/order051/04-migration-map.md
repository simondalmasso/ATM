# Migration map

| Legacy GitHub | Disposition | Canonical GitHub |
| --- | --- | --- |
| `worker/src/index.js` | replace | `cloudflare/order034/ATM-ORDER034-*.js` |
| root `wrangler.toml` | replace | `cloudflare/order034/wrangler.order034.main.jsonc` |
| Python `src/**` runtime | history only | Cloudflare Worker + Durable Object |
| Windows controller/tasks | delete active tree | none |
| OCI runtime/workflows | delete active tree | none |
| Issue command bus | delete active tree | none |
| old cloud-cycle schedules | delete active tree | Cloudflare cron only |
| old GitHub CI | replace | `.github/workflows/ci.yml` |
| old deploy workflow | adapt | `.github/workflows/deploy-cloudflare.yml` |
| GitLab manual deploy | retire | GitHub Actions authority |

Thirty common non-adapted files were hash-checked and all 30 were byte-identical to the audited GitLab migration source. No unexpected parity difference remained.
