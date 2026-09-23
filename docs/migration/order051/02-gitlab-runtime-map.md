# GitLab current runtime map

Authority order used: LIVE -> `ui/atm-mcp-heartbeat-brand-v1` -> reachable tests/config -> GitLab main only as history.

Runtime:
- Wrangler: `cloudflare/order034/wrangler.order034.main.jsonc`.
- UI entry: `ATM-ORDER034-WIN101-UI-CANDIDATE.js`.
- Active Worker/DO: `ATM-ORDER034-ACTIVE-MAIN-READONLY.js`.
- Durable Object: `ATM_BRAIN -> ATMBrain`.
- Workers AI: `AI`, model `@cf/zai-org/glm-4.7-flash`.
- Private signer service: `TASKMARKET_SIGNER -> atm-taskmarket-signer@production`.
- Signer source/config: `ATM-ORDER034-FINAL-SIGNER-CANDIDATE.mjs` and `wrangler.order034.signer.jsonc`.
- Execution kill switch: `EXECUTION_ENABLED=true`.
- Public MCP, research/finance/design catalogs and hosted skill broker are part of current runtime.

The GitLab authority tree passed all current Worker, MCP, signer, status, watchdog and Python policy gates before migration.
