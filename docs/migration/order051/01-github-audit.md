# GitHub legacy audit

Legacy GitHub had 132 tracked files and 14,434 text LOC.

KEEP as policy/history:
- zero-spend fail-closed policy;
- authoritative external settlement as money truth;
- exact-SHA deployment verification;
- Git history and rollback branch.

REPLACE:
- README/AGENTS and old Worker/Wrangler paths;
- old CI/deploy workflow;
- legacy payout/secret assumptions.

DELETE FROM ACTIVE TREE:
- Python ATM runtime under `src/`;
- Windows Scheduled Task/controller material;
- OCI runtime/provision/schedule workflows;
- GitHub Issue command bus;
- `worker/`, `workers/`, `deploy/`, `prompts/`;
- superseded tests/evidence tied only to those runtimes.

Evidence: legacy tests had 3 current-market failures: WorkProtocol HTTP 402 and obsolete TaskMarket availability assumptions. Removed material remains recoverable from Git history and the rollback branch.
