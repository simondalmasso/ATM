# Parity and cutover

Migration PR: https://github.com/simondalmasso/ATM-Agent-Teller-Machine/pull/50
Durable Object smoke hotfix PR: https://github.com/simondalmasso/ATM-Agent-Teller-Machine/pull/51

First deploy attempt safely stopped before promotion because Durable Object Workers do not provide a usable Version URL for this smoke path. No production traffic changed.

Successful deploy run: `35917243437`.
- previous main Worker version: `934f86ff-1c64-41ed-ba2a-1b37ee1f0c79`;
- candidate/final Worker version: `c89fb6d5-c4f6-4015-9113-bfdf59a7c3d4`;
- candidate staged at 0%: PASS;
- version-override exact-SHA smoke: PASS;
- promotion to 100%: PASS;
- production exact-SHA smoke: PASS.

Post-cutover LIVE:
- `/health.git_sha = 7d2d28f4c5f75709f10769e3a856b7cb463ca79b`;
- AI, Durable Object, signer and execution bindings remain active;
- MCP server/discover, tools/list and atm_status return HTTP 200;
- 17 public read-only tools present;
- owner out-of-pocket spend USD 0.
