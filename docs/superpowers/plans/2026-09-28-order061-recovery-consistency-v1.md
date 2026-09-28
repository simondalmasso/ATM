# ORDER-061 Recovery Consistency V1 Implementation Plan

**Goal:** make uncertain external writes and settlement replay crash-safe, keep alarms alive until uncertainty resolves, correct monetary units/readback freshness, and clean JSON encoding.

**Architecture:** keep the existing Durable Object and adapter model. Add fail-closed recovery semantics and idempotency around existing state stores; do not add a scheduler/control plane.

### Task 1 — Uncertain write restart recovery
- Red: persisted intent / ACQUIRING / SUBMITTING restarts as WRITE_UNCERTAIN and blocks mutation.
- Green: recoverPendingWorkV1 prefers uncertainty evidence over derived actionable stage.
- Wire pendingWriteGuardV1 before claim/submit.

### Task 2 — Settlement convergence
- Red: partial crash after settlement ref registration causes replay inconsistency/double accounting.
- Green: exact same receipt is idempotent for same identity; ledger PAID uses stable settlement idempotency; mismatched identity stays blocked.

### Task 3 — Alarm + money metrics
- Red: unresolved WRITE_UNCERTAIN loses alarm; DCC contributes to USD; stale readback counts fresh.
- Green: alarm considers uncertain pending state; USD aggregation filters currency; fresh metrics use bounded age.

### Task 4 — JSON hygiene + release
- Remove BOM and assert plain UTF-8 parse.
- Full verification, PR, protected merge, exact-SHA deployment, production readback, mirror parity.

Externally observable unresolved decisions: none; issue #87 defines fail-closed semantics and no FX guessing.
