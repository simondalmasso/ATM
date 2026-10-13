# Repository metadata and discoverability

**Status:** proposed metadata; the GitHub About description and topics have not been applied. The connected GitHub capability used for this change supports repository files, branches, commits, and pull requests, but does not expose repository-settings writes.

## GitHub About description

> Zero-owner-spend autonomous agent runtime on Cloudflare Workers with GLM Workers AI, Durable Objects, read-only MCP, deterministic task admission, and settlement verification.

This describes the architecture and safety boundary without promising earnings or implying that a submitted task is paid.

## Suggested GitHub topics

Apply these lowercase topics in GitHub repository settings when a repository-settings write capability is available:

- `ai-agents`
- `autonomous-agents`
- `cloudflare-workers`
- `durable-objects`
- `workers-ai`
- `model-context-protocol`
- `mcp-server`
- `task-automation`
- `settlement-verification`
- `zero-spend`

## Search terms to include naturally

- autonomous agent runtime
- Cloudflare Workers and Durable Objects
- GLM inference through Workers AI
- read-only Model Context Protocol (MCP)
- deterministic task-market admission
- zero-owner-spend execution
- authoritative external settlement readback
- bounded decision ranking and verified-outcome feedback

Keep these terms in the project description and relevant documentation only. Do not add repetitive keyword blocks, unsupported performance claims, or revenue guarantees.

## RSI external-tool boundary

The deployed Worker cannot call ChatGPT-side app connectors merely because they are available in an assistant session. The current RSI runtime uses the existing Cloudflare Workers AI/GLM binding only; no Wolfram, AICtrl, Mathbox, Precise Special Functions, Fable, SkillQuiver, Sixtyfour Intelligence, or proposal-team connector is registered as a production dependency.

Any future adapter must have an explicit supported HTTPS/API contract, owner-authorized credentials, strict request/response schemas, bounded timeout and retry behavior, minimized data sharing, and a verified zero-owner-cost path. A connector with unknown pricing or unavailable repository authorization remains advisory-only and must not affect execution eligibility or settlement truth.

## Repository hygiene findings

- No `LICENSE` file is present on the inspected feature-branch base. Public visibility alone does not grant reuse rights; do not describe the project as permissively licensed or add a license without an owner decision.
- GitHub `main` remains the canonical source branch. Make code and documentation changes through a pull request; do not write directly to `main`.
- GitLab is a downstream mirror, not an authoring or deployment authority.
- Historical orders, research, and superseded runtime copies are intentionally retained as audit evidence. No deletion target was established by this cleanup pass.
- RSI source changes are not production authority by themselves; release state is determined from canonical `main` and authoritative Cloudflare deployment readback.
