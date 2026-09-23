import process from "node:process";

const base = String(process.env.BASE_URL || "").replace(/\/$/, "");
const expected = String(process.env.EXPECTED_SHA || "");
if (!/^https:\/\//.test(base)) throw new Error("BASE_URL must be https");
if (!/^[0-9a-f]{40}$/.test(expected)) throw new Error("EXPECTED_SHA must be 40 hex");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(path, options = {}) {
  let last;
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const response = await fetch(base + path, {
        ...options,
        headers: {
          "cache-control": "no-cache",
          "user-agent": "ATM-ORDER051-Exact-SHA/1.0",
          ...(options.headers || {}),
        },
      });
      const text = await response.text();
      last = { status: response.status, text };
      if (response.ok) return JSON.parse(text);
    } catch (error) {
      last = { error: String(error) };
    }
    await sleep(1500);
  }
  throw new Error("request failed " + path + ": " + JSON.stringify(last));
}

const health = await fetchJson("/health?sha=" + expected);
if (health.ok !== true) throw new Error("health.ok != true");
if (health.git_sha !== expected) throw new Error("health git_sha mismatch: " + health.git_sha);
if (health.order !== "ATM-ORDER-034") throw new Error("unexpected order " + health.order);
if (health.runtime !== "RUNNING") throw new Error("unexpected runtime " + health.runtime);
if (health.ai_binding !== true || health.durable_object !== true || health.taskmarket_signer_binding !== true) {
  throw new Error("required Cloudflare bindings are not live");
}
if (health.execution_enabled !== true) throw new Error("execution kill switch unexpectedly disabled");

const status = await fetchJson("/api/status?sha=" + expected);
if (status.ok !== true || status.order !== "ATM-ORDER-034") throw new Error("status parity failed");
if (status.zero_spend?.out_of_pocket_spend_usd !== 0) throw new Error("zero-spend invariant failed");
if (status.payment_capabilities?.policy?.owner_funded_spend_usd !== 0) throw new Error("owner spend policy failed");

const discover = await fetchJson("/mcp", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "server/discover", params: {} }),
});
if (!discover.result?.supportedVersions?.includes("2026-07-28")) throw new Error("modern MCP discovery missing");

const tools = await fetchJson("/mcp", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
});
const names = new Set((tools.result?.tools || []).map((tool) => tool.name));
for (const name of [
  "atm_status", "list_opportunities", "mcp_status",
  "research_zero_cost_catalog", "finance_zero_cost_catalog",
  "design_zero_cost_catalog", "skill_list", "skill_route", "skill_get",
]) {
  if (!names.has(name)) throw new Error("MCP tool missing: " + name);
}

console.log(JSON.stringify({
  ok: true,
  base,
  git_sha: health.git_sha,
  order: health.order,
  runtime: health.runtime,
  tool_count: names.size,
  zero_spend: true,
}, null, 2));
