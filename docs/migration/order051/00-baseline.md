# ORDER-051 baseline

Date: 2026-09-23.

- GitHub legacy main: `e1f8c0ca586b413af04cfbd3d9e25dd60823bb84`.
- GitLab main at start: `264e831e53dae9623dc8f895d98ae1197237ce59`.
- GitLab deployed source: `ui/atm-mcp-heartbeat-brand-v1@06a7e237096ff4db99f1a02249f67b037c8706b3`.
- Live Worker: `atm`, order `ATM-ORDER-034`.
- Live bindings: `ATM_BRAIN`, `AI`, private `TASKMARKET_SIGNER`.
- Live scheduler: Cloudflare cron `*/15 * * * *`.
- Baseline MCP: server/discover 200, tools/list 200, atm_status 200.
- Modern MCP protocol: `2026-07-28`.
- Owner spend: USD 0.
- GitHub rollback: `rollback/order051-pre-migration-e1f8c0ca`.
- GitLab rollback: `rollback/order051-pre-cutover-06a7e237`.
- Production was not mutated during baseline capture.
