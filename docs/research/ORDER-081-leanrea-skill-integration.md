# ORDER-081 — Integrate leanrea as a repository-local engineering skill

Date: 2026-10-28  
Scope: documentation/developer workflow only. No Worker code, dependencies, secrets, scheduler, signer, payout policy, or deployment configuration changes.

## Source and license

- Upstream: https://github.com/aicodeking/leanrea
- Upstream `main` snapshot inspected: `09ba4aa0217f82cd880f855a60b877f59f39b22b` (2026-10-17).
- Source file: `leanrea/SKILL.md`; upstream size 8,374 bytes.
- License: MIT; the copyright and license text are retained at [`.agents/skills/leanrea/LICENSE`](../../.agents/skills/leanrea/LICENSE).
- ATM copy: [`.agents/skills/leanrea/SKILL.md`](../../.agents/skills/leanrea/SKILL.md). The command router has been compacted for ATM repository use; upstream remains canonical for future syncs.

## Why this belongs in ATM

leanrea gives agents a small command-first workflow for inspecting shipped software, bundles, binaries, package metadata, websites, and runtime traces without loading an MCP server or adding a production dependency. It can support bounty triage, authorized compatibility analysis, bug reproduction, and evidence collection. It is a developer skill, not an ATM opportunity source or execution adapter.

## Usage

Read the skill when a task requires reverse-engineering an artifact or tracing behavior through a shipped bundle. Start with file type/magic bytes, use the cheapest inventory first, batch independent probes, and cite evidence locations. Label observations as seen, inferred, or unknown. Work on a copy and keep extraction outputs under a temporary directory. Do not install optional tools unless the owner explicitly permits the install and its cost/privilege impact is understood.

## ATM-specific safety overlay

1. Analyze only software, binaries, websites, devices, and traffic that the owner controls or is explicitly authorized to inspect.
2. Do not use this skill to bypass access controls, DRM, authentication, licensing, rate limits, anti-abuse controls, or payment/claim gates.
3. Do not extract, print, persist, or transmit secrets, private keys, session cookies, tokens, personal data, or third-party confidential data. Redact sensitive values from evidence.
4. Network inspection is read-only by default. No login attempts, form submissions, claims, signatures, transfers, purchases, or other external mutations as part of reverse engineering.
5. Static evidence is not runtime proof. Report exact command, artifact/version, offsets/paths, observed output, and uncertainty.
6. No external spend, package install, or privileged operation without explicit owner approval. Prefer tools already available.
7. The skill does not grant authority to change ATM production, payout configuration, signer behavior, task state, or deployment.
8. Keep GitHub `main` as the source authority. Changes motivated by analysis still require a narrow order, regression coverage, CI, review, and the guarded deployment path.

## Verification contract

- `tests/test_leanrea_skill.py` checks the skill metadata, license attribution, policy overlay, and absence of runtime wiring.
- `.github/workflows/ci.yml` explicitly checks that the skill and its provenance/license files exist.
- The skill is not imported by the Cloudflare Worker, installed as a package, or executed in production. Its presence must not trigger a deployment.
- Merge only after exact-head CI succeeds and the PR diff confirms documentation/test-only scope.
