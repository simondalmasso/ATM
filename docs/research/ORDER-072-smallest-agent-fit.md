# ORDER-072 — `obra/smallest-agent` fit assessment

Date: 2026-10-18  
Decision: **DO NOT INTEGRATE into ATM runtime. Reuse the lesson, not the implementation.**

## Evidence reviewed

- Repository: https://github.com/obra/smallest-agent
- Readable source: https://github.com/obra/smallest-agent/blob/main/src/smallest-agent.commented.js
- Package manifest: https://github.com/obra/smallest-agent/blob/main/package.json
- Its source imports `@anthropic-ai/sdk` and Node's `child_process`, calls the Anthropic Messages API with model `claude-opus-4-6`, and executes model-selected shell input through `execSync`.
- Its own README explicitly warns that the agent has unrestricted Bash access and can execute destructive commands.

## ATM fit against canonical constraints

| Requirement | Finding |
| --- | --- |
| Cloudflare Workers / Durable Object runtime | Incompatible as-is: depends on Node child processes and unrestricted shell execution. |
| Zero owner spend and existing inference path | Poor fit: introduces an Anthropic API dependency and credentials instead of the existing GLM Workers AI path. |
| Bounded least authority | Fails: model output becomes arbitrary shell commands with no tool allowlist or sandbox. |
| Economic execution | No task discovery, reward verification, admission, submit, or authoritative settlement integration. |
| Operational benefit | Smaller source code is not a measured improvement to ATM's current blocker: zero admitted tasks and zero external payments. |

## Decision

Do not vendor, execute, or deploy this project in ATM. Do not add its SDK, API credentials, shell tool, or a local agent process. A byte-minimal coding agent is not a revenue adapter and would widen authority while leaving the economic bottleneck unchanged.

The reusable lesson is to keep the agent loop small and inspectable. Any future ATM tool loop must expose only explicitly allowlisted, schema-validated, bounded tools; use the existing Workers AI binding; preserve deterministic policy gates; and never allow model text to become shell input.

## Next highest-value work

Continue the existing ORDER-066 content-factory path rather than adding another agent framework. The HPA draft-generation/review queue already has deterministic tests, but the end-to-end pipeline is **not complete**: the production `/media-studio` route was previously observed as 404, the render adapter is local-only, and no Meta publishing credential/permission has been verified. Keep publication closed until a server-side Meta adapter can prove its target Page, permissions, idempotent publish/readback, and authorized post-level metrics. Do not claim content revenue from drafts, renders, reach, or views.

## Economic truth at assessment

Fresh production reads on 2026-10-18 showed runtime SHA `b17e6325d2137f4a84ffd6d4da398fe6b2391921`, 28 raw opportunities, 0 admitted, 28 rejected, 5/7 sources healthy, claimed=3, submitted=1, accepted=0, paid=0, and watchdog classification `RECOVERY_REQUIRED`. Owner spend remains $0. No task was acquired, submitted, or marked paid during this assessment.

## Exit criteria

- No source/runtime dependency on `smallest-agent`.
- Preserve the canonical GitHub-main → exact-SHA CI → authorized Cloudflare deploy → production SHA readback → GitLab mirror parity path.
- Do not close ORDER-066 as end-to-end complete until an owner-authorized test post is published and later read back with real metrics.
- Keep `PAID_EXTERNAL=0` until authoritative external settlement tied to ATM work is observed.
