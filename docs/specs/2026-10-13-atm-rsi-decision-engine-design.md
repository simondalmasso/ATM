# ATM-RSI-001 — RSI Decision Engine V1 Design

**Date:** 2026-10-13
**Canonical base:** `9b1cd4bc766e8b0e619e30de35b9ca5a958cf6a0`
**Branch:** `feat/atm-rsi-decision-engine-v1`
**Scope:** ATM decision engine only. boQA is explicitly excluded.

## Goal

Integrate a bounded, RSI-inspired decision layer into ATM so it can improve ordering among already-admitted opportunities using the existing GLM Workers AI inference path and verified historical outcomes. The layer must be fail-closed, auditable, zero-owner-spend, and unable to change eligibility or financial authority.

This is inference-time recursive decision refinement, not model-weight training and not a direct installation of RSI-Anything or a new model.

## Repository findings

- `chooseTaskmarketCandidate()` currently filters candidates with `executionCandidateAdmitted()`, then sorts by capability tier, estimated net reward, and task ID before doing a fresh source-policy readback.
- `rank_opportunities` currently sorts only by estimated net USD.
- The existing source/payout/executor gates and the rule `UNKNOWN != YES` must remain authoritative.
- The prior LAYA replay in `research/current/laya-calibration-summary.json` reported 70–75% false-positive promotion rates and explicitly killed direct policy authority. RSI must not repeat that design.

## Design

### 1. Decision boundary

The RSI engine may only reorder a bounded set of candidates that have already passed the existing deterministic admission filter. It cannot add candidates, remove blockers, set `AI_EXECUTABLE`, change the USD 100 minimum, alter permissions, choose a new executor, or authorize claim/submit/financial actions.

The existing `freshExecutionPolicy()` check remains mandatory immediately before any action. The engine's authority is `RANKING_ONLY`; its hard-gate, spend, signer, submission, and settlement authority are always false.

### 2. Bounded RSI cycle

For more than one admitted candidate, and only when the existing free inference quota allows it:

1. **Baseline:** compute the current deterministic order (capability tier, net reward, task ID) and preserve it.
2. **Propose / self-review:** use at most one existing GLM call to produce a final ordered list of the exact candidate IDs. Prompt the model to compare the baseline with alternatives, critique its first choice against the supplied facts and recent verified outcomes, and return only the final typed JSON decision.
3. **Validate:** require a complete permutation of the supplied IDs, no duplicates, no unknown IDs, bounded rationale, and a valid schema. Never accept model-supplied eligibility, reward, source, or payment facts.
4. **Select:** use the RSI order only when the response passes validation; otherwise use the baseline order. Every candidate still receives the existing fresh source-policy readback before selection.
5. **Learn:** retain a bounded decision record and associate outcomes only from existing authoritative execution readbacks (accepted, rejected, or paid). Subsequent prompts may receive a small sample of those verified outcomes. Model claims, estimated rewards, stale state, and chat text are not outcome labels.

This loop is bounded to at most five candidates, one model call per decision, and a fixed output-token limit. A single candidate skips inference. Quota exhaustion, model errors, invalid JSON, missing IDs, or timeouts fall back to the baseline without retrying.

### 3. Audit and observability

Expose a `decision_engine` object through status with version, mode, authority, maximum candidates, maximum model calls, and fallback policy. Record the baseline order, proposed order, validation result, selected ID, strategy version, and verified outcome in a bounded Durable Object history. Do not store secrets or entire untrusted task bodies in decision records.

The read-only `rank_opportunities` tool should return deterministic RSI-engine ranking metadata without triggering a model call. The execution selector may use the bounded GLM ranking, but only after deterministic admission and before its existing fresh readback.

### 4. No automatic strategy or policy promotion

The RSI engine does not edit its own code, policy constants, worker registry, prompts outside the bounded decision request, or deployment configuration. It does not train model weights. Any future strategy change must be evaluated on fixed replay cases and held-out cases, with no increase in false eligibility, no safety regressions, and evidence of improved realized outcomes before separate review.

## Interfaces

- Proposed pure helpers in the canonical Worker file:
  - `baselineOpportunityOrderV1(opportunities)`
  - `validateRsiRankingV1(candidateIds, response)`
  - `rsiDecisionStatusV1()`
- `ATMBrain.chooseTaskmarketCandidate(opps)` consumes the admitted candidates and may request a validated RSI order; it continues to return the same result shape and to call `freshExecutionPolicy()`.
- `ATMBrain.status()` exposes read-only engine metadata.
- `ATMBrain.tool("rank_opportunities", ...)` uses deterministic ranking metadata only; public MCP remains read-only.

## Tests and acceptance criteria

1. Baseline ordering is stable and does not mutate input.
2. Valid RSI output is accepted only if it is an exact permutation of supplied candidate IDs.
3. Duplicate, missing, extra, malformed, or oversized IDs cause deterministic fallback.
4. A candidate that fails deterministic admission never reaches RSI ranking.
5. Invalid/failed/over-quota model output falls back without retry.
6. A fresh policy re-read remains required after RSI selection; the model cannot promote a blocked task.
7. Feedback is ingested only from authoritative external readbacks and is bounded in count and size.
8. Public MCP remains read-only; no new claim, submit, wallet, signer, or settlement tool is added.
9. Existing CI and all existing worker policy tests pass.
10. No new dependencies, paid APIs, local model downloads, boQA integration, Windows scheduled tasks, or production deployment are introduced.

## Rollout

Implement on the feature branch only. Require the protected GitHub CI check and inspect the final diff. Do not merge to `main`, trigger Cloudflare deployment, change GitLab, or modify production without a separate explicit release decision and the canonical exact-SHA release gates.
