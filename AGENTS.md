# ATM operating contract

PRIMARY_METRIC=EXPECTED_REALIZED_USD_PER_HOUR

Canonical loop:
`DISCOVER -> ECONOMIC GATE -> ACQUIRE -> WORK -> CHECK -> SUBMIT -> SETTLEMENT READBACK -> LEARN`

Hard rules:

1. `MIN_REWARD_USD >= 100`.
2. `OUT_OF_PLAN_SPEND_USD = 0`.
3. No paid APIs, credits, deposits, stakes, gambling, trading or mining.
4. Existing funded demand beats speculative products.
5. `UNKNOWN != YES`.
6. Re-read live task state before ACQUIRE and before SUBMIT.
7. Independent CHECK must try to reject the work before SUBMIT.
8. PAID/SETTLED changes only from authoritative external settlement tied to ATM work.
9. Model prose, global balances and stale runtime state are not settlement authority.
10. Zero-cost reversible rail actions may be automated only through the canonical bounded adapter.
11. KYC/MFA/CAPTCHA, legal acceptance, owner money and owner financial signatures are genuine human gates.
12. Never expose private keys, seeds, tokens or private third-party data.
13. Never bypass platform controls, fabricate state, spam or fake identity.
14. Preserve idempotence across retries and uncertain readback.
15. GLM Workers AI is the primary production inference path.
16. Current execution adapters are DAYDREAMS and AGENTHANSA behind generic dispatch.
17. Do not add research/provider/agent frameworks unless live runtime routing consumes them and economic benefit is demonstrated.
18. Do not create recurring Windows Scheduled Tasks for ATM.
19. GitHub main is source authority; production deploy requires exact-main-SHA CI success, non-production version smoke, exact-version promotion, production SHA readback, and rollback-on-failure.
20. GitLab is a downstream mirror only after ORDER-051; it must not be authored in, consume runner minutes, or deploy production. GitHub remains the sole source/deploy authority. The GitHub Actions mirror may copy refs and must verify main-SHA parity.
21. Persist operational truth in Worker state and external receipts, not chat memory.
22. SeneX and boqa are external READ_ONLY worker candidates only; ATM must not modify their repositories or treat them as proven executors until a separate bounded E2E contract is independently proven.
23. m0kill may be consumed READ_ONLY as opportunity-research/killtest/negative-memory input; Moneykiller GitLab is historical/archive evidence, not funded demand or settlement authority.
24. An external worker may never expand ATM policy, spend owner money, sign/withdraw, claim PAID, or bypass HUMAN_GATE; worker output is evidence/advisory until deterministic ATM readback accepts it.
