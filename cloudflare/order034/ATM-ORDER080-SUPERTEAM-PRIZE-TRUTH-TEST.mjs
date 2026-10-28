import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(here, "ATM-ORDER034-ACTIVE-MAIN-READONLY.js");
const sourceText = fs.readFileSync(sourcePath, "utf8");
let code = sourceText.replace('import { DurableObject } from "cloudflare:workers";', 'class DurableObject { constructor(ctx, env) { this.ctx = ctx; this.env = env; } }');
code += "\nexport { normalize };\n";
code = code.replace('import { createReadOnlyGrant, listReadOnlyGrants, authorizeReadOnlyGrant, revokeReadOnlyGrant, sanitizeReadOnlyTasks } from "./ATM-ORDER068-READONLY-GRANTS.mjs";', "");
const tmp = path.join(os.tmpdir(), `atm-order080-${process.pid}-${Date.now()}.mjs`);
fs.writeFileSync(tmp, code, "utf8");
const mod = await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);

const pooledRewards = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [String(i + 1), 4000]));
const pooled = mod.normalize("SUPERTEAM", {
  id: "vaultline-1",
  slug: "vaultline-security-audit-grants-for-colosseum-projects-up-to-4000-usdc-each",
  title: "Vaultline Security Audit Grants: up to 4,000 USDC each",
  description: "Ten audit grants, each worth up to 4,000 USDC in audit services; not cash.",
  rewardAmount: 40000,
  token: "USDC",
  compensationType: "fixed",
  rewards: pooledRewards,
  maxBonusSpots: 0,
  agentAccess: "HUMAN_ONLY",
  status: "OPEN",
  deadline: "2099-01-01T00:00:00Z",
  _detail_hydrated: true,
});
if (pooled.payout_amount !== 4000) throw new Error(`POOL_NOT_NORMALIZED_TO_INDIVIDUAL_PRIZE:${pooled.payout_amount}`);
if (pooled.estimated_net_usd !== 4000) throw new Error(`POOL_FALSE_NET_AMOUNT:${pooled.estimated_net_usd}`);
if (pooled.raw_meta.reward_semantics !== "MAX_INDIVIDUAL_PRIZE") throw new Error(`POOL_SEMANTICS_MISSING:${pooled.raw_meta.reward_semantics}`);
if (!pooled.blockers.includes("HUMAN_ONLY_LISTING") || pooled.ai_executability !== "BLOCKED") throw new Error("HUMAN_ONLY_LISTING_NOT_BLOCKED");

const summaryOnly = mod.normalize("SUPERTEAM", {
  id: "summary-only",
  slug: "summary-only",
  title: "Unknown reward terms",
  description: "",
  rewardAmount: 40000,
  token: "USDC",
  agentAccess: "HUMAN_ONLY",
  status: "OPEN",
  _detail_hydrated: false,
});
if (summaryOnly.payout_amount !== null || summaryOnly.estimated_net_usd !== null) throw new Error("UNHYDRATED_SUMMARY_COUNTED_AS_REWARD");
if (!summaryOnly.blockers.includes("SUPERTEAM_DETAIL_UNVERIFIED")) throw new Error("DETAIL_FAILURE_NOT_BLOCKED");
if (!summaryOnly.blockers.includes("EXPECTED_NET_NOT_POSITIVE_OR_UNKNOWN")) throw new Error("UNKNOWN_NET_GATE_MISSING");

const single = mod.normalize("SUPERTEAM", {
  id: "single-1",
  slug: "single-125",
  title: "Fixed individual award",
  description: "A fixed bounty award.",
  rewardAmount: 125,
  token: "USDC",
  compensationType: "fixed",
  rewards: {},
  agentAccess: "AGENT_ALLOWED",
  status: "OPEN",
  deadline: "2099-01-01T00:00:00Z",
  _detail_hydrated: true,
});
if (single.payout_amount !== 125 || single.estimated_net_usd !== 125) throw new Error("SINGLE_FIXED_AWARD_REGRESSION");

const variable = mod.normalize("SUPERTEAM", {
  id: "variable-1",
  slug: "variable-1",
  title: "Variable compensation",
  description: "Award depends on quote.",
  rewardAmount: 1000,
  token: "USDC",
  compensationType: "variable",
  rewards: {},
  isWinnersAnnounced: false,
  agentAccess: "AGENT_ALLOWED",
  status: "OPEN",
  _detail_hydrated: true,
});
if (variable.payout_amount !== null || variable.estimated_net_usd !== null) throw new Error("VARIABLE_REWARD_MISLABELED_FIXED");
if (!variable.blockers.includes("SUPERTEAM_REWARD_NOT_FIXED")) throw new Error("VARIABLE_REWARD_NOT_BLOCKED");

if (!sourceText.includes("https://superteam.fun/api/listings/details/")) throw new Error("DETAIL_API_NOT_USED");
if (!sourceText.includes("DETAIL_ID_MISMATCH")) throw new Error("DETAIL_IDENTITY_NOT_VALIDATED");
if (!sourceText.includes("DETAIL_HYDRATION_LIMIT")) throw new Error("HYDRATION_CAP_FAIL_OPEN");
console.log("ORDER080_INDIVIDUAL_PRIZE=PASS");
console.log("ORDER080_DETAIL_FAILURE_FAIL_CLOSED=PASS");
console.log("ORDER080_FIXED_AND_VARIABLE_REWARDS=PASS");
console.log("ORDER080_HUMAN_ONLY_STILL_BLOCKED=PASS");
console.log("ORDER080_PRODUCTION_MUTATION=0");
