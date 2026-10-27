# ORDER-078 — Terminal Taskmarket submission without award

Date: 2026-10-27  
Base: `5485df9f69a7848b4692f388014a98fe5423fecf`  
Scope: stop a verified, externally submitted task from remaining pending after the task is terminal and its complete award list proves the current worker did not win.

## Evidence and behavior

Draft PR #119 contained an implementation and regression test for a real settlement-watcher leak. This branch reapplies that behavior on the current deployed main, preserving ORDER-077's expired/no-submission path.

The watcher may record `NO_AWARD` only when all are true:
- the exact external submission ID, task ID, and worker wallet match;
- the task read succeeds and the task is `completed` / `resolved`;
- the submission window is closed;
- the awards field is present as an array and contains no award for the worker.

Then it persists the readback evidence, marks runtime/pending state terminal `NO_AWARD`, clears the stale watchdog, and does not create an acceptance or payment receipt. If any evidence is absent or inconsistent, the item stays pending.

## Verification

Reuses the existing ORDER-075 regression test from draft PR #119 and registers it in required CI. Exact-head CI and guarded production deployment are required before this behavior is considered complete. No external write or payout is performed by this change.
