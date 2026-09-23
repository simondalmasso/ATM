# Parity and cutover

Migration PR: https://github.com/simondalmasso/ATM-Agent-Teller-Machine/pull/50
Durable Object smoke hotfix PR: https://github.com/simondalmasso/ATM-Agent-Teller-Machine/pull/51
Final ORDER-051 evidence/deploy-path PR: https://github.com/simondalmasso/ATM-Agent-Teller-Machine/pull/52

PR #51 was the successful production cutover milestone. Its merged SHA was `7d2d28f4c5f75709f10769e3a856b7cb463ca79b`, and deploy run `35917243437` proved the Durable Object-safe 0%-candidate path:
- previous main Worker version: `934f86ff-1c64-41ed-ba2a-1b37ee1f0c79`;
- candidate/final Worker version for that cutover: `c89fb6d5-c4f6-4015-9113-bfdf59a7c3d4`;
- candidate staged at 0%: PASS;
- version-override exact-SHA smoke: PASS;
- promotion to 100%: PASS;
- production exact-SHA smoke: PASS.

PR #52 then added the required final evidence and production-path gates. Its merged SHA, and the final canonical ORDER-051 GitHub main SHA, is `807c4dc618019014dab576210ea6ec5c616ba7fd`.

Final ORDER-051 verification:
- ATM CI run `35918444429`: SUCCESS;
- ATM Cloudflare Deploy run `35918479721`: SUCCESS;
- final production `/health.git_sha = 807c4dc618019014dab576210ea6ec5c616ba7fd`;
- AI, Durable Object, signer and execution bindings remained active;
- MCP server/discover, tools/list and atm_status returned HTTP 200;
- 17 public read-only MCP tools were present;
- signer redeploy was skipped because signer bytes/config did not change;
- owner out-of-pocket spend remained USD 0.

The PR #51 SHA is retained above as the historical cutover point; PR #52 is the final canonical ORDER-051 state.
