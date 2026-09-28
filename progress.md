# ATM CURRENT CHECKPOINT — ORDER-053

Updated: 2026-09-28
Status: ORDER-053 is the single active implementation order.
Purpose: zero-context handoff for a fresh GPT agent.

## Canon
- GitHub source authority: https://github.com/simondalmasso/ATM
- GitLab is downstream mirror only.
- Production runtime before ORDER-053: c257b5a42f7a4384e8da0b96b52a30359eb30620.
- Branch start/main: b64139d8c86d37953ec17fcaa1becfec11e77ead.
- Active issue: #55 ATM-ORDER-053.
- Active branch: feat/order053-zero-cost-skills-v1.
- OWNER_SPEND_USD=0.
- Public MCP remains READ_ONLY.
- No scheduled ChatGPT task exists.
- Do not install skill runtimes on the owner's PC.

## Present state
- ATM already exposes install-free skill_list, skill_route and skill_get.
- Installed count before edits: 17.
- ORDER-053 focused test exists at cloudflare/order034/ATM-ORDER053-SKILL-BROKER-TEST.mjs.
- Focused test is RED for intended reason: current manifests still use mutable ref=main.
- Verified MIT sources: obra/superpowers, emilkowalski/skills, mattpocock/skills, addyosmani/agent-skills, cathrynlavery/diagram-design, K-Dense-AI/scientific-agent-skills, DietrichGebert/ponytail.
- figures4papers repository license is CC BY-NC 4.0; keep REFERENCE_ONLY for a money-making system.
- last30days SKILL.md is about 257k chars and references external tooling; it exceeds skill_get's 50k context contract. Remove from installed skills, keep reference/source-only.
- Ponytail ToolCheck = Trusted 98/100; ponytail and ponytail-review are MIT/public/instruction-only/$0 and qualify.
- Caveman ToolCheck = Caution 71/100; keep reference-only in this order.
- reverse-skill requires local scripts/router/bootstrap; keep security source/reference-only, not installed.

## Immutable refs resolved
- obra/superpowers = 8ca22dba9a94f28898bbce59f2537ff4d87c747d
- emilkowalski/skills = d16ebe60d09a5ba2afcb7054ede9d0a10c9f6128
- mattpocock/skills = c55ee46073ed923f86ce59a5eb3b6d895095d1b7
- addyosmani/agent-skills = 2686b620fc1fed2e8f60c704839c766b8594c6b6
- cathrynlavery/diagram-design = cea465e7f5ea1043d8dab21a99f2dd3f7f661beb
- K-Dense-AI/scientific-agent-skills = 49c6e97775eaa18ba791bebe23162a70ae601c18
- DietrichGebert/ponytail = e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156

## Exact continuation for a fresh GPT
1. Read AGENTS.md, AUD_CANON.md, ARQ_CANON.md, issue #55 and this file.
2. Verify branch/main drift before commit.
3. Edit ATM_SKILLS in cloudflare/order034/ATM-ORDER034-ACTIVE-MAIN-READONLY.js:
   - pin all installed manifests to immutable 40-char commit refs;
   - add defaults cost=ZERO, account_required=false, install_required=false, secret_required=false;
   - use explicit license=MIT;
   - remove last30days and figures4papers;
   - add ponytail.minimal and ponytail.review;
   - keep installed count at 17.
4. Run node cloudflare/order034/ATM-ORDER053-SKILL-BROKER-TEST.mjs until GREEN without weakening assertions.
5. Create docs/skills/order053-intake.md covering every issue #55 candidate and reference with source/path/license/cost/runtime/secret/unique value/decision/reason.
6. Update source catalog notes so SOURCE_ONLY/REFERENCE_ONLY is not confused with installed ATM_SKILL.
7. Add ORDER-053 test to .github/workflows/ci.yml.
8. Run all Node CI commands, Python compileall/unittest, secret_doctor, payout_doctor, JSON parse and git diff --check.
9. Audit staged diff: no new mutation/payment tool, no upstream code execution, no local-PC runtime, no spend.
10. Commit/push, open PR closing #55, require exact-head CI.
11. Merge protected PR only after green CI.
12. Runtime bytes change requires canonical exact-SHA candidate smoke, promotion, production smoke and rollback skipped.
13. Live verify /health exact SHA, MCP tools/list, skill_list count=17, representative skill_route, at least 3 pinned skill_get calls, SKILL_NOT_FOUND and OWNER_SPEND=0.
14. Verify GitLab mirror parity with zero GitLab runner use.
15. Update this checkpoint after every material transition.

## Hard prohibitions
- No scheduled ChatGPT tasks.
- No local PC installs.
- No paid APIs or owner-funded compute.
- No arbitrary upstream code execution.
- No payment/signing authority expansion.
- No GitLab runner.
- No direct push to main.
