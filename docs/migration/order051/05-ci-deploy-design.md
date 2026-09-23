# CI and deploy design

PR and main CI run only on standard public GitHub-hosted runners and execute canonical Worker/MCP/signer tests, Python policy tests, secret/payout doctors and repository-integrity checks.

Production deployment is a `workflow_run` consumer of successful `ATM CI` on `main`.

Safety sequence:
1. verify tested SHA is still GitHub main;
2. detect production-relevant paths;
3. inject exact SHA only on the ephemeral runner;
4. Wrangler dry-run;
5. capture previous Cloudflare version(s);
6. upload without traffic;
7. stage main candidate at 0%;
8. smoke exact candidate with Cloudflare version override;
9. promote to 100%;
10. smoke production exact SHA;
11. rollback previous version on failure.

Signer source/config is detected independently and is deployed only when signer bytes/config change. Documentation-only changes do not touch Cloudflare.
