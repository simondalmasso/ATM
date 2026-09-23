# ORDER-051 — GitHub audit and canonical migration

Source authority used for the migration:

- GitLab branch: ui/atm-mcp-heartbeat-brand-v1
- GitLab audited source SHA before migration-only readback patch: 06a7e237096ff4db99f1a02249f67b037c8706b3
- GitLab migration/readback SHA: d13b4bd757670a2cff1606ae632add00733b9cd8
- GitHub legacy main SHA: e1f8c0ca586b413af04cfbd3d9e25dd60823bb84
- GitHub rollback branch: rollback/order051-pre-migration-e1f8c0ca
- GitLab rollback branch: rollback/order051-pre-cutover-06a7e237

## GitHub legacy classification

### KEEP

Nothing from the legacy GitHub tree is kept byte-for-byte in the active canonical tree. The complete legacy state is retained in Git history and the rollback branch.

Properties kept because they remain valid:
- zero-spend fail-closed policy;
- authoritative external settlement as the only paid-money truth;
- exact-source-SHA deployment verification;
- no model/private-key custody;
- no paid fallback.
### REPLACE

- README.md, AGENTS.md, .gitignore -> GitLab canonical versions.
- legacy worker/src/index.js + root wrangler.toml -> cloudflare/order034 current Worker runtime and config.
- legacy .github/workflows/ci.yml -> current ORDER-034/051 Node behavior + Python policy gates.
- legacy .github/workflows/deploy-cloudflare.yml -> CI-gated version upload, 0%-traffic version-override exact-SHA smoke, exact-version promotion, production smoke, automatic rollback.
- legacy secret/payout assumptions -> current public payout config + presence-only secret doctor.

### DELETE FROM ACTIVE TREE

Proven superseded runtime/control-plane material is removed:
- legacy src/** Python ATM runtime;
- worker/**, workers/**, deploy/**, prompts/**;
- pyproject.toml and config/control.json;
- Windows Scheduled Task/controller/bootstrap paths;
- OCI authority/provision/bootstrap/scheduler paths;
- GitHub Issue command-bus runtime;
- old swarm/worker-fabric/evidence fixtures tied to those runtimes;
- legacy scheduled GitHub Actions atm-cloud-* and oci-remote-*;
- .gitlab-ci.yml from the GitHub canonical tree.

Deletion is only from the active tree. All legacy material remains recoverable from the rollback branch and Git history.
## Evidence for removal

Legacy GitHub baseline contained 132 tracked files / 14,434 text LOC. Its local test run produced 182 passing effective tests, 7 skips, and 3 current-market failures: WorkProtocol now returns HTTP 402 and the old TaskMarket live expectation no longer holds.

The GitLab authority tree before ORDER-051 contained 35 files / 10,782 text LOC and passed every current Worker, signer, MCP, status-truth, watchdog, Python payout/secret, and git diff --check gate.

No additional GitLab source was deleted during ORDER-051 because no further dead/overengineering candidate was proven safe to remove. The only source change before migration exposes non-secret ATM_GIT_SHA on /health so exact-version smoke testing is possible.

## Production safety

- Production runtime remains Cloudflare Worker atm (ATM-ORDER-034).
- Durable Object binding remains ATM_BRAIN -> ATMBrain.
- AI binding remains AI.
- signer binding remains TASKMARKET_SIGNER -> atm-taskmarket-signer@production.
- signer service is not deployed by the GitHub production workflow.
- existing Durable Object state is not reset or migrated.
- GitLab has no deploy authority after cutover.
- GitHub has no recurring economic runtime scheduler; Cloudflare's existing 15-minute trigger remains the runtime scheduler.
- owner out-of-pocket spend is fixed at USD 0.

Rollback exists at two layers: the GitHub pre-migration branch for source recovery, and the captured previous Cloudflare Worker version for automatic production restoration after a failed post-deploy smoke.
