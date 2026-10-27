# ORDER-077 — Expired Taskmarket write with no external submission

Date: 2026-10-27  
Base: `5bb21775d80969fe38201aef42455671515591d7`  
Scope: reconcile a local uncertain Taskmarket submission only when authoritative read-only evidence proves the task window has closed and the acting worker has no external submission. No claim, submission, signature, payment, or withdrawal.

## Live evidence

Taskmarket public GET for task `0xcadd940f93b871ae2e65d4fac238164f277ab7d343f238c1e5f71c91c08b8f00` (`TSK-FRGMGTXW`) returned:
- `expiryTime=2026-10-25T19:01:41.002Z` (past at audit time).
- `submissionWindowOpen=false`, `claimedBy=null`, `awardCount=0`, `awards=[]`.
- `status=open`, `phase=awaiting_settlement`; this is not a paid or awarded task.
- Public submissions list contains 162 submissions. None matches ATM's current signer wallet `0x7dCBee019FFD17A77413C1fDb47aeFe771222837` or current agent ID `73264`. The worker-address work endpoint returns an empty list.
- ATM status showed local submission ID `c2fd23a7-ff61-4cdd-b45d-2f2af5d6259a`; this UUID is not present as an external submission ID. The stored watchdog error is from the legacy signature format.

Sources: [TaskMarket task read](https://api.taskmarket.dev/api/tasks/0xcadd940f93b871ae2e65d4fac238164f277ab7d343f238c1e5f71c91c08b8f00), [public submissions read](https://api.taskmarket.dev/api/tasks/0xcadd940f93b871ae2e65d4fac238164f277ab7d343f238c1e5f71c91c08b8f00/submissions), [TaskMarket canonical message docs](https://docs.taskmarket.dev/reference/raw-api).

## Change

- Prove `EXPIRED_NO_SUBMISSION` only when task read and worker submission feed both succeed, task identity matches, submission window is explicitly closed, expiry time is past, no submission exists for this worker/task, and the awards array is present with no award for the worker.
- Mark the local runtime terminal `EXPIRED`, persist the evidence/readback hash, close pending-work state with no mutation permitted, and clear the stale watchdog error.
- Make terminal expiry idempotent on later watcher ticks.
- Never fabricate a payout receipt, acceptance, award, or submission.

## Guardrails

- If the source feed is unavailable, task identity mismatches, expiry/window evidence is incomplete, or a submission exists under a different ID, remain pending; fail closed.
- This does not implement the separate resolved-submission/no-award behavior in draft PR #119.
- The task is expired and highly competitive; no retry or external mutation is permitted.
