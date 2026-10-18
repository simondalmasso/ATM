# ATM CURRENT CHECKPOINT — ORDER-063 COMPLETE

Updated: 2026-10-08
Status: ORDER-063 (#90 / PRs #91/#92) COMPLETE, post-merge CI + GitLab mirror parity VERIFIED; docs-only Cloudflare upload/promotion SKIPPED. Single next read-only forensic issue ORDER-064 (#93) OPEN/BLOCKED on authenticated Cloudflare Cron Trigger readback. Production remains 47c029199d904f12ea7ce929b33478db1b3a7546.

## Canon / invariants
- GitHub is source and deploy authority: https://github.com/simondalmasso/ATM
- GitLab is downstream mirror only; no GitLab runners.
- Production: https://atm.simondalmasso44.workers.dev/
- OWNER_SPEND_USD=0.
- UNKNOWN != YES.
- Public MCP is READ_ONLY.
- PAID only from exact authoritative settlement tied to ATM work.
- No signer/wallet/transfer/withdrawal/x402 authority expansion.
- No runtime installed on owner PC.
- No recurring/scheduled ChatGPT task exists for ATM; the mistakenly created hourly task was disabled.

## ORDER-061 final evidence
- Issue #87: CLOSED.
- PR #88: MERGED.
- Exact feature head: edfc8c38aee05a5b01bbe11c608319ad2eccdef4.
- Runtime merge SHA: 47c029199d904f12ea7ce929b33478db1b3a7546.
- PR-head CI: 36412293727 = SUCCESS.
- Post-merge CI: 36412458835 = SUCCESS.
- GitLab mirror: 36412458851 = SUCCESS.
- Cloudflare deploy: 36412493716 = SUCCESS.
- Candidate version: f566a50a-5f86-47da-8f3a-3f20f8e5cc56.
- Rollback/previous version: a629a888-0d69-4387-8457-058e1ccf76db.
- Candidate exact-SHA smoke: PASS.
- Production exact-SHA smoke: PASS.
- Rollback executed: NO.
- Signer changed: NO.
- GitHub runtime main and GitLab main were both 47c029199d904f12ea7ce929b33478db1b3a7546 before this docs-only checkpoint.

## What ORDER-061 fixes
1. Restart recovery
   - pending_external_intent, ACQUIRING, SUBMITTING or write_uncertain recover as WRITE_UNCERTAIN.
   - uncertain work is allow_mutation=false and READBACK_ONLY.
   - write operation/intent/hash survive reconstruction.
2. Mutation idempotency guard
   - claim and submit paths perform freshExecutionPolicy + pendingWriteGuardV1 before journal/write.
   - changed terms, expired deadline, stale readback or uncertainty fail closed.
3. Settlement replay convergence
   - same external ref + same ATM identity is idempotent.
   - same ref + different identity is DUPLICATE_EXTERNAL_REF_CONFLICT.
   - replay can continue local convergence after a partial crash.
   - PAID ledger remains exactly once per opportunity/stage.
4. Alarm ownership
   - WRITE_UNCERTAIN keeps/re-arms polling even without submission_id.
5. Money units
   - earnings_paid_external_usd sums USD/USDC only.
   - non-USD receipts are reported under earnings_paid_external_non_usd.
   - no FX guessing; policy=USD_AND_USDC_1_TO_1_ONLY_NO_FX.
6. Readback freshness
   - historical *_WITH_READBACK remains for compatibility.
   - *_WITH_FRESH_READBACK uses a 30-minute window.
7. JSON hygiene
   - ORDER-060 research JSON files are plain UTF-8 without BOM.

## TDD evidence
- 36411401252 RED: restart did not freeze uncertain write.
- 36411604229 RED: mutation path missing pending guard.
- 36411758633 RED: exact settlement replay not idempotent.
- 36411875321 RED: WRITE_UNCERTAIN alarm lost.
- 36412017058 RED: non-USD mislabeled as USD.
- 36412110916 RED: fresh-readback metric absent; then BOM detected.
- 36412181289 GREEN: functional implementation.
- 36412293727 GREEN: final PR head.

## Live production truth after ORDER-061
- /health runtime=RUNNING.
- /health git_sha=47c029199d904f12ea7ce929b33478db1b3a7546.
- execution_enabled=true; durable_object=true.
- agentic status=IDLE_NO_AUTO_ELIGIBLE_TASK.
- claimed=3; submitted=1; accepted=0; paid=0.
- settlement watcher: pending=1; write_uncertain_pending=0; paid=0.
- money_path:
  - PAID_EXTERNAL=0
  - owner_spend_usd=0
  - SUBMITTED_WITH_READBACK=1
  - SUBMITTED_WITH_FRESH_READBACK=1
  - READBACK_FRESHNESS.fresh_window_ms=1800000
  - earnings_paid_external_usd=0
  - earnings_paid_external_non_usd={}
  - next_binding_constraint=PENDING_WORK
- Workers AI: calls_used=0; reserved_neurons=0; safe budget=9500; free allocation=10000.
- No actual payout was fabricated or used to prove recovery; settlement crash/replay coverage is deterministic/synthetic.

## ARQ/AUD live evidence — 2026-10-08
- Audit main base GitHub 9c17b4ba03f022f3c754073ec6ac5a2535ce0faf; GitLab main exactly the same SHA, mirror parity PASS. Ruleset 23903496 active, PR + `verify` mandatory, bypass never.
- Runtime SHA 47c029199d904f12ea7ce929b33478db1b3a7546 is intentionally behind docs-only main #89. CI run 36413015246 SUCCESS, mirror run 36413015325 SUCCESS, docs-only Cloudflare workflow 36413051154 SUCCESS (no runtime promotion).
- Live /health RUNNING, GLM @cf/zai-org/glm-4.7-flash; /api/status discovery DEGRADED, last_run=2026-10-01T10:30:48.803Z, 7 attempted/5 OK/2 failed, 49 raw/0 admitted.
- Settlement watcher DO alarm last observed 2026-10-08T19:11:36.092Z: checked=1, pending=1, write_uncertain_pending=0, accepted=0, paid=0. Agentic claimed=3, submitted=1, accepted=0, paid=0, auto_eligible_now=0.
- MONEY_PATH_V1: source_bundles=49, SUBMITTED_WITH_READBACK=1, SUBMITTED_WITH_FRESH_READBACK=1, PAID_EXTERNAL=0, WAITING_HUMAN=4, SOURCE_PROOF_REQUIRED=44, EXECUTOR_PROOF_REQUIRED=1, next_binding_constraint=PENDING_WORK, EXPECTED_REALIZED_USD_PER_HOUR=UNKNOWN, owner_spend_usd=0. One pending external submission; no authoritative money earned.
- `money_path.WAITING_HUMAN=4` uses max(pending WAITING_HUMAN, opportunity WAITING_HUMAN constraints); `money_loop.queue_states.waiting_human=0` uses current runtime queue state; `human_gate.pending=0` counts active owner-resumable gates. Difference is semantic, not proven bug.
- Source code: scheduled() invokes /__cron; /__cron invokes refreshRadar; refreshRadar persists radar.last_run; DO alarm runs settlement monitoring but not discovery. Versioned main Wrangler config lacks triggers.crons. The actual Cloudflare deployed schedule and logs have NOT been read, so root cause remains UNKNOWN; no cron repair authorized on this docs-only order.
- PR #86 closed unmerged, #85 closed as duplicate: superseded by merged/deployed PR #88 ORDER-061. Historical PR #86 is divergent and has BOM/mojibake risk.
- ORDER-063 #90 completed via PR #91 head 5827dc7c50663b4cd680a5f8f169be6457a2f460, exact-head CI 37831279789 SUCCESS, protected merge 6e4f179a233dc84361e8e097ce243d6bed586812, main CI 37831490045 SUCCESS, mirror 37831489947 SUCCESS, Cloudflare workflow 37831525088 SUCCESS / runtime upload+promotion SKIPPED. GitLab SHA parity PASS. No code/config/payment/signer change; no scheduled ChatGPT task.

## ORDER-063 final checkpoint and ORDER-064 external boundary — 2026-10-08
- GitHub `main=a6aef9f60db7ecbe7f5ebc848ce245715937efc3` after protected PR #92 merge; GitLab `main` parity PASS (same SHA), mirror run 37833077579 SUCCESS.
- PR #92 head 53c9fe73e00282ff1f4e3b540b46cccc16b42c76, exact-head CI run 37833007167 SUCCESS; post-merge CI run 37833077403 SUCCESS.
- Cloudflare docs-only workflow run 37833267398 SUCCESS, Wrangler candidate upload/promotion and production smoke SKIPPED. Production runtime SHA still 47c029199d904f12ea7ce929b33478db1b3a7546 by pre-checkpoint /health plus deploy path gate; no claim of fresh post-merge runtime readback when rate-limited.
- ORDER-064 issue #93 opened as next **single read-only** evidence task, currently BLOCKED_EXTERNAL_CLOUDFLARE_READBACK. No implementation PR, runtime mutation, new secret authority or scheduled task.
- `.github/workflows/ci.yml` enforces exactly one Cloudflare-secret/deploy authority workflow `deploy-cloudflare.yml`. A new Cloudflare-secret-using workflow would violate this gate; changing deploy-cloudflare.yml would be a production-relevant change, so avoid that for read-only evidence.
- Existing GitHub Cloudflare deployment log run 36412493716/job 108895747829 says trigger changes require `wrangler triggers deploy`. This is historical policy output, NOT remote cron existence readback.
- Actual schedule can only be confirmed by authorized **GET-only** Cloudflare Workers script schedules API (`/accounts/{account_id}/workers/scripts/atm/schedules`) or Cloudflare Dashboard, and scheduled invocation/error logs as needed. No Cloudflare Workers Schedules tool access in this session. Do not solicit or expose a token; owner may provide sanitized response evidence.
- Source discovery remains last_run=2026-10-01T10:30:48.803Z; last observed settlement DO alarm 2026-10-08T19:11:36.092Z. Missing cron / worker cron failure / state persistence failure are hypotheses, not established causes.
- Last confirmed `MONEY_PATH_V1.PAID_EXTERNAL=0`, `owner_spend_usd=0`, `next_binding_constraint=PENDING_WORK`; no new external receipt. Hard gates unchanged.
- Branch `audit/order064-cron-readback` contains this documentation-only blocker checkpoint; exact PR-head CI and protected merge required before considering its document final.

## Exact continuation for a zero-context GPT
1. Re-read fresh GitHub main + AGENTS.md + this progress.md. Use live /health and /api/status with cache-busting query keys; reject stale search-provider cached snapshots.
2. ORDER-063 (#90) is complete; do not repeat. Keep GitHub main and GitLab mirror parity and document runtime/main SHA separation.
3. ORDER-064 (#93) is the single OPEN/BLOCKED read-only Cloudflare trigger/log readback. Actual external Workers Scripts Read authorization is unavailable in chat; leave root cause UNKNOWN, do not add secret-enabled workflows, do not change cron or Worker. Continue only after sanitized authorized schedule evidence.
4. PAID only from exact authoritative external receipt; keep pending submission settlement readback, minimum reward USD 100, owner out-of-plan spend zero, no executor/wallet authority expansion.

## Immediate next action
GitHub `main` and GitLab mirror are aligned at `a6aef9f60db7ecbe7f5ebc848ce245715937efc3`; ORDER-063 and checkpoint complete. ORDER-064 (#93) is **OPEN/BLOCKED** pending external read-only Cloudflare Worker `atm` Cron Trigger schedule evidence (`GET /accounts/{account_id}/workers/scripts/atm/schedules`), then scheduled invocation logs only if necessary. No API token/keys in chat, no new token or authority, no paid service, no workflow with additional CLOUDFLARE_API_TOKEN, no `wrangler triggers deploy` or Cloudflare mutations. One pending submission remains under receive-only settlement readback, PAID_EXTERNAL=0 at last verified status. Preserve exact-ShA production runtime, zero spend, no automatic acquisition or executor promotion.

## ORDER-065 production diagnosis and bounded repair — 2026-10-13

- **Diagnostic baseline** was GitHub main `9b1cd4bc766e8b0e619e30de35b9ca5a958cf6a0`; after the protected ORDER-065 merge, canonical GitHub main and deployed production are now at `50f7bec94b8c9ddff5d49f7970223e687816898c`. No local dirty checkout was used for a production change.
- The owner explicitly requested Cloudflare operations and changes, overriding the earlier read-only-only boundary for this bounded trigger correction. Authenticated Dashboard session readback showed the actual deployed trigger had been `0 */12 * * *`, despite checked-in application metadata claiming `*/15 * * * *`. The schedule was corrected through the same-origin Cloudflare Dashboard session to `*/15 * * * *` and read back successfully at `2026-10-13T20:36:51.662062Z`. No Worker source, bindings, secrets, signer, payment or billing configuration was changed during the schedule correction.
- Cloudflare Worker `atm` showed 922 invocations, 75 errors, CPU about 651 µs in the last-24h view. The Cron Events history showed errors at roughly 0.6–1.4 ms. Cloudflare Issues detail captured the actual stack: `POST /__cron → ATMBrain.fetch → refreshRadar → observeTaskEvents → appendTaskEvent → ATMBrain.put`, `string or blob too big: SQLITE_TOOBIG`; trace `9dfb292662aa568f37a6ae1047c8160b`, request `1569c9280bdba0f89f1d979d8ce3f4ca`, version `f566a50a-5f86-47da-8f3a-3f20f8e5cc56`. Two Cloudflare issues reported this exception. This is a durable-object single-value size failure, not proof of a source-provider/network fault.
- Root cause in source: `appendTaskEvent` rewrote up to 2,000 event rows as one `task_events` value, with no serialized byte budget and raw nested `blocker_details.evidence`. SQLite-backed Durable Object key/value items are limited to 2 MB (key plus value); the test now holds the history to a 750,000-byte budget, removes raw evidence objects from this secondary event history while preserving bounded evidence excerpts, task/terms IDs and settlement reference/status, and compacts oversized event keys to deterministic SHA-256 keys so retries remain idempotent.
- Protected repair PR: [#97 — bound task event persistence below Durable Object item limit](https://github.com/simondalmasso/ATM/pull/97), branch `fix/order065-sqlite-task-event-bound-20261013`. Regression test `cloudflare/order034/ATM-ORDER065-TASK-EVENTS-BOUNDED-TEST.mjs` is wired into `.github/workflows/ci.yml`. PowerShell/Node test cycle: RED reproduced `SQLITE_TOOBIG` before the fix; GREEN after the fix stored `749043` bytes under the `750000` budget, preserved the newest event and settlement reference/status, removed raw event evidence, and verified long-key replay idempotence. CI run `38465660300` for code head `9d8cb519fbd5edf08f3acf1e3b6085f59c9672cb` completed SUCCESS before this documentation checkpoint; updated HEAD must pass its own exact-head CI.
- **Deployed 2026-10-13 20:55:43 UTC** by the existing authorized workflow [38466599985](https://github.com/simondalmasso/ATM/actions/runs/38466599985), after the exact-main-SHA CI passed. Production version `9f8df0e7-3467-463d-9b8b-28939feed635` (version 351) is at 100% traffic, annotated `GitHub main 50f7bec94b8c9ddff5d49f7970223e687816898c`. Zero-percent smoke and post-promotion exact-SHA smoke both passed (`runtime=RUNNING`, exact `git_sha`, `version_override_id=null`, `zero_spend=true`); workflow summary says signer unchanged and owner out-of-pocket USD 0. No manual dashboard code upload was used.
- Mirror workflow [38466555956](https://github.com/simondalmasso/ATM/actions/runs/38466555956) succeeded: GitHub main and GitLab main both equal `50f7bec94b8c9ddff5d49f7970223e687816898c`; branch parity verified. The divergent legacy branch `feat/atm-rsi-decision-engine-v1` was skipped without force push or deletion.
- Cloudflare schedule remains HTTP 200 / success true / exactly one native Cron entry `*/15 * * * *` after deployment. Keep `PAID_EXTERNAL=0`, owner spend $0, settlement readback receive-only, signer unchanged, no new secrets/tokens/paid services, no Zero Trust/card. **Issue #96 remains OPEN** until the next scheduled Cron invocation after deployment is observed to complete without `SQLITE_TOOBIG`. Do not manually POST `/__cron`; it can start automated discovery/acquisition. Direct unauthenticated `/health` and `/api/status` reads returned HTTP 403, so no alternate access path was attempted.



## ORDER-066 HPA media render checkpoint — 2026-10-18

### Live production readback
- At 2026-10-18T01:58:29Z, GET https://atm.simondalmasso44.workers.dev/health returned HTTP 200, runtime=RUNNING, git_sha=50f7bec94b8c9ddff5d49f7970223e687816898c; /api/status returned HTTP 200.
- At the same check, GET /media-studio returned HTTP 404. Current production does not expose the HPA studio found in the ORDER-066 feature branch.
- git ls-remote origin: main=7623cfff2cced6a5d3c0c0bfb8795178bac73ec4; feat/order066-hpa-editorial-queue-v1=0aa1acad25edea80f9bfdeb0adaa59aa40d5d4fd.
- GitHub PR #100 documents the editorial-draft queue only and explicitly says no MP4 renderer was added. Remote head CI run 38703274203 succeeded for the exact feature head before these local-only edits.

### Local subtitle proof, explicitly unpublished
- scripts/hpa-cinematic-render.py now applies FontSize=14, BorderStyle=1, MarginV=88, Alignment=2, WrapStyle=2; one occurrence changed from 24pt box-style captions. A .pre-subtitle-fix.bak is preserved.
- Rebuilt artifacts/hpa-render/hombrepsicoactivo-area51-piloto-subtitulos-v2.mp4 from clean scene intermediates (no previously burned-in caption layer) and applied subtitles once.
- Duration 69.456s; 720x1280, 30fps; size 25021833 bytes; SHA-256 4e21e24176cf84580303f676cba3b72e401f59dc9a80b9076de4673120de2609. Full FFmpeg decode check PASS; a 12-second frame was visually checked and shows a single small lower-third caption.
- Receipt: artifacts/hpa-render/hombrepsicoactivo-area51-piloto-subtitulos-v2.receipt.json, SHA-256 b556cfb0b5fa4dcce5614a685cfbe2d74ecea95cec741aa04b1cf1ddbdd2fe27. It marks RENDERED_LOCAL_UNPUBLISHED, NOT_PUBLISHED, and NOT_DEPLOYED; external TTS free availability/terms are not guaranteed.
- This is a local host artifact, not a downloadable asset hosted by ATM and not proof that the Worker has a render pipeline.

### Regression and build evidence
- 24 Node tests passed on the working copy; also python -m compileall -q scripts tests, python -m unittest discover -s tests -p test_*.py, python scripts/secret_doctor.py, python scripts/payout_doctor.py, and git diff --check exited 0.
- npx --yes wrangler@4.151.1 deploy --dry-run --config cloudflare/order034/wrangler.order034.main.jsonc succeeded: 472.19 KiB upload size (119.38 KiB gzip); dry-run only, no deployment. Candidate bindings listed were ATM_BRAIN, TASKMARKET_SIGNER, and AI; no r2_buckets binding or rendering service exists in this config.
- The added node scripts/hpa-render-adapter.test.mjs line in .github/workflows/ci.yml is local-only. The adapter files, cinematic renderer, assets, backups, video, and receipts are untracked in this working copy. Current snapshot: branch feat/order066-hpa-editorial-queue-v1, HEAD 0aa1acad25ed, zero staged, one tracked unstaged file and 26 untracked paths. No commit, push, merge, or production deploy was performed.

### Runtime implementation boundary
- Deployed/runtime media handling remains editorial drafts and review transitions (NOT_RENDERED, NOT_PUBLISHED). The local browser/CDP adapter is not imported by the Worker. A local Python/FFmpeg script is not a production integration.
- Candidate project review: OpenChatCut (https://github.com/0xsline/OpenChatCut) is local-first React/Remotion/Electron; AutoClip (https://github.com/zhouxiaoka/autoclip) is desktop/local rendering and states cloud models are metered; Herk Edit Kit (https://github.com/nateherkai/herk-edit-kit) is a HyperFrames/GSAP editing kit for coding agents; StoryToolkitAI (https://github.com/octimot/StoryToolkitAI) is local editing/transcription; FireRed-OpenStoryline (https://github.com/FireRedTeam/FireRed-OpenStoryline), FunClip (https://github.com/modelscope/FunClip), and NarratoAI (https://github.com/linyqh/NarratoAI) are app/model pipelines, not drop-in Worker renderers; BackgroundRemover (https://github.com/nadermx/backgroundremover) requires Python, PyTorch and FFmpeg; LatentSync (https://github.com/bytedance/LatentSync) is hardware-heavy lip-sync inference. tmoroney/AutoSubs returned GitHub 404 for that exact repo name, and the earlier link was truncated, so its identity remains unresolved.
- Current HPA Worker config has no R2 bucket binding, media object store, or render executor. The core create, persist and retrieve cinematic video from inside ATM objective is still incomplete. Do not mark drafts RENDERED based on a local artifact. Any follow-on must implement a real in-product rendering/output storage path, retain the $0/no-paid-API gate, then pass exact-SHA CI and the canonical authorized deployment/promotion/readback workflow before claiming production success. Do not bypass GitHub main or directly deploy from this dirty working copy.



### R2 account activation gate — 2026-10-18
- Authenticated Wrangler CLI read-only command `npx --yes wrangler@4.151.1 r2 bucket list` failed with Cloudflare API error 10042: “Please enable R2 through the Cloudflare Dashboard.” This confirms R2 is disabled for the connected account; no bucket was listed and no bucket creation was attempted.
- Cloudflare documentation lists a monthly R2 Standard free tier of 10 GB-month storage, 1 million Class A requests, 10 million Class B requests and free egress; usage beyond included quantities is billable (https://developers.cloudflare.com/r2/pricing/). The initial activation flow is documented as a Dashboard checkout/subscription step (https://developers.cloudflare.com/r2/get-started/).
- Because ATM hard-gates owner spend at $0 and requires a human for financial/legal acceptance, do not enable R2, run checkout, add a payment method, create a bucket or change production bindings autonomously. The owner must activate the R2 free tier in the Dashboard and keep billing bounded at $0 before the HPA asset-store integration can proceed.



### ORDER-066 browser-local cinematic renderer — 2026-10-18

- Implemented a zero-external-service browser renderer inside GET /media-studio in the current ORDER-066 branch. It creates vertical 720x1280 24-fps WebM using Canvas + MediaRecorder, animated abstract scene graphics, scene narration rendered as lower-third two-line captions, title/CTA cards and a minimal synthetic ambient tone.
- Browser output is stored in IndexedDB in that same browser/profile, allows preview/download/delete, and keeps at most 10 local video records. It is NOT uploaded, is not stored in ATM Durable Object / R2, and does not change server asset_status; source state remains NOT_RENDERED until an actual production asset pipeline is separately implemented. The panel is explicit that free mode does not include voice narration.
- Render action appears only for owner-session-visible drafts whose script state is SCRIPT_APPROVED_ASSET_PENDING and format REEL; existing origin/session/rate-limit and script-review gates are unchanged. Gallery is populated only after the owner-gated queue GET succeeds. CSP allows blob: only for media playback, with connect-src self unchanged.
- Regression checks cover HTML presence, renderer-button visibility marker, honest no-upload/zero-cost narration labeling, CSP media policy, and JavaScript syntax parsing.
- Verification on current dirty feature branch: all 24 Node CI tests PASS; Python compileall PASS; unit tests 3/3 PASS; secret_doctor.py PASS; payout_doctor.py PASS; git diff --check PASS; Wrangler 4.119.0 dry-run build PASS (492.30 KiB; 123.69 KiB gzip). Dry-run bindings remain ATM_BRAIN, TASKMARKET_SIGNER, AI; no R2 or external renderer binding.
- No OAuth issue. No billing, R2 activation, asset upload, publish, or production change performed. Deployment remains through the existing protected GitHub-main exact-SHA workflow after PR #100 passes updated-head CI and is merged.
- Product boundary: browser-generated output is a motion-graphics WebM with generated non-voice audio, not a photoreal stock-footage/camera-video renderer, does not synthesize speech, and only persists in the current browser. Do not describe it as a hosted MP4 or automatic voice-over.


## ORDER-068 / fresh discovery / ORDER-068B checkpoint — 2026-10-18

- Canonical GitHub main before ORDER-068B: `9f6f883a2d28cd6ea265bdc29a4faad5661307b2`. PR #102 ORDER-068 merged at `2d8798b0c1c92fb46e93b9233b0e2eadc366d7c0`; PR #103 ORDER-068A merged main-only field mapping at `9f6f883a2d28cd6ea265bdc29a4faad5661307b2`.
- Fresh GET `/health?fresh=...` returned production runtime SHA `2d8798b0c1c92fb46e93b9233b0e2eadc366d7c0`, runtime RUNNING, Durable Object and AI binding present, `execution_enabled=true`. This is NOT main SHA and is older than ORDER-068A. A separate cacheless response without the query parameter was stale/inconsistent; use the cache-busted response and canonical deployment logs as the current evidence.
- Latest fresh `/api/status?fresh=...` observation: discovery at `2026-10-18T10:00:59.185Z`, 7 sources attempted / 5 OK / 2 failed, 28 raw / 0 admitted / 28 rejected. Agentic state `IDLE_NO_AUTO_ELIGIBLE_TASK`; claimed=3, submitted=1, accepted=0, paid=0; settlement watcher pending=1, paid=0. `/api/agent/tasks` returns 401 without a bearer grant, as designed; this is not an authenticated grant-flow test.
- Fresh money-loop rows include `DAYDREAMS:... Analyse Knots and Publish Your Findings`, potential reward USD 5.55, blockers `SOCIAL_OR_PUBLICATION_REQUIRED` and `FIRST_E2E_CAPABILITY_NOT_ALLOWED`. It is human-assistable, not auto-eligible. No task was claimed or submitted by this discovery read.
- AGENTBOUNTIES record has raw `payout_amount=20300000` USDC and currently also exposes `estimated_net_usd=20300000`. Six-decimal conversion would be USD 20.30, but the normalized USD field is inconsistent with atomic units and must not be used as an economic fact until fixed. Record remains blocked on owner spend/capital truth, missing terms/metadata, eligibility/deadline, and lack of an execution adapter. No payout earned.
- ORDER-068 implemented a web-managed, owner-gated, revocable `tasks:read` grant (TTL 5–1440 minutes, raw token shown once, only hash persisted, 100-task allowlist, no wallet/claim/submit authority). Existing public dashboard opportunities remain public; grants protect only the dedicated agent endpoint.
- ORDER-068B found a deploy-path defect: the canonical Cloudflare workflow's production-change matcher omitted `ATM-ORDER068-READONLY-GRANTS.mjs`, an imported runtime module. The #103 follow-up therefore skipped production promotion despite changing runtime behavior. PR #104 added a regression test; exact-head CI first failed on the expected missing-path assertion, then passed after the matcher included the module. PR #104 merged at `1bc138060eedc280d3a50345320d2ca72104ee3f`; post-merge CI run `39118703167` PASS; canonical Cloudflare workflow `39118718803` PASS (prior production SHA `2d8798b0c1c92fb46e93b9233b0e2eadc366d7c0`, exact-main candidate smoke PASS, promoted exact SHA, production exact-SHA smoke PASS); GitLab mirror run `39118703324` PASS with main parity verified. Fresh `/health` readback returned `git_sha=1bc138060eedc280d3a50345320d2ca72104ee3f`. `GET /api/agent/tasks` without a bearer grant returns 401 as expected. The authenticated owner create/list/revoke flow has not been exercised in a real owner session, and no grant token was created or exposed; do that from the owner-gated dashboard, then test authorized task reads, expiry and revocation.
- Hard invariants unchanged: MIN_REWARD_USD >= 1; prioritize $1–$50 without excluding larger tasks; owner spend USD 0; PAID only from authoritative settlement; no wallet delegation, CashClaw, local persistent process, automated claim/submit, or production mutation outside the canonical deployment workflow.

## ORDER-069 — AgentBounties feed normalization checkpoint — 2026-10-18

- Independent cache-busted production read: /health.git_sha=1bc138060eedc280d3a50345320d2ca72104ee3f; /api/status discovery at 2026-10-18T10:30:59.191Z: 7 sources attempted, 4 OK, 3 failed, 27 raw, 0 admitted, 27 rejected; paid=0.
- Independent public API read at https://api.agentbounties.app/v1/base/autonomous-bounties/feed?network=base-mainnet&claimable_only=true returned a live record with scalar atomic USDC fields: solver_reward="2000000", claim_bond="10000", required_external_spend="1000000", gross_cash_margin="1000000". Six-decimal normalization means $2.00 gross reward, $0.01 claim bond, $1.00 external spend, and $1.00 stated gross margin before other costs. Positive external spend correctly blocks this candidate under owner-spend-$0 policy.
- ORDER-069 adds a regression test against that real feed shape; CI observed RED at ATOMIC_SOLVER_REWARD_NOT_NORMALIZED: 2000000, then implementation converts scalar AgentBounties USDC atomics and USDC/USDG object values lacking explicit decimals using six decimals. CI run 39120349994 passed the Worker behavior suite on the initial implementation.
- Additional regression test observed RED for the stale default opportunity URL https://agentbounties.app/earn.html (NONCANONICAL_AGENTBOUNTIES_PAGE_URL). Default listing link changed to canonical https://agentbounties.app/earn. This fixes the displayed task URL redirect only; it does NOT establish the cause of the failed discovery source because runtime fetches the distinct API endpoint and standard Worker fetch follows redirects. Root cause of the recent source failure remains UNKNOWN pending fresh source-state error readback.
- No execution adapter added for AgentBounties; source remains DISCOVER_ONLY_READ_ONLY. No claims/submissions/wallet actions or settlement-state changes. No production deploy until PR review, exact-main-SHA CI, nonproduction smoke, canonical promotion, and production SHA readback.

## ORDER-069 post-deploy verification — 2026-10-18

- PR #106 merged at `f47e320e6eb28208a2bf4bc49b0b27cf9cef14b3`; post-merge main CI run `39120506356` SUCCESS. Canonical Cloudflare deploy run `39120526888` SUCCESS: production-relevant change detected, exact-main guard passed, Wrangler dry-run passed, candidate uploaded/staged, candidate exact-SHA smoke PASS, exact main version promoted, production exact-SHA smoke PASS, deployment proof PASS.
- Cache-busted live `/health` now returns `git_sha=f47e320e6eb28208a2bf4bc49b0b27cf9cef14b3`, matching GitHub main exactly.
- Latest discovery visible in `/api/status`: `2026-10-18T10:45:59.344Z`, 7 attempted, 5 OK / 2 failed, 28 raw, 0 admitted, 28 rejected. This suggests the earlier AgentBounties source outage recovered, but the root cause is still UNKNOWN.
- `/api/opportunities` still returns an AGENTBOUNTIES row with `freshness_at=2026-10-18T10:45:50.089Z`, old `earn.html` link, and unnormalized `20300000` values. That row predates the deployment and is persisted Durable Object state; it is not evidence the new parser failed. Await the next scheduled discovery at approximately `2026-10-18T11:00:59Z` and inspect a newly timestamped AGENTBOUNTIES row before claiming production normalization is verified.
- Public API currently returns a different feed record with `solver_reward=2000000`, `required_external_spend=1000000`, `claim_bond=10000`: normalized values should be $2.00, $1.00 external spend, and $0.01 claim bond. This opportunity remains blocked by positive owner spend and no execution adapter.
- GitLab downstream mirror run `39120506231` remained PENDING at the latest check; GitLab main still showed `4e9f4c057b65d332e00e1185e263c1e3a8a31981`. Mirror parity for the new `f47e320...` head is NOT YET VERIFIED; an older mirror run `39120452711` remains IN_PROGRESS and may be holding the concurrency slot.
- Do not paste bearer grants into chat. Authenticated grant lifecycle must be exercised through a secure owner-controlled session without disclosing the token. No grant was created by this audit, and no task was claimed or submitted.
