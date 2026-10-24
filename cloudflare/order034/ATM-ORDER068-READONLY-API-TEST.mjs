import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const runtime = fs.readFileSync(path.join(here, "ATM-ORDER034-ACTIVE-MAIN-READONLY.js"), "utf8");
const ui = fs.readFileSync(path.join(here, "ATM-ORDER034-WIN101-UI-CANDIDATE.js"), "utf8");
function has(text, label) { assert.ok(text, label); }

has(runtime.includes('p === "/api/access-grants" && req.method === "GET"'), "grant listing route exists");
has(runtime.includes('p === "/api/access-grants" && req.method === "POST"'), "grant creation route exists");
has(runtime.includes('p === "/api/owner/bootstrap-link" && req.method === "POST"'), "web owner bootstrap route exists");
has(runtime.includes("env.ATM_OWNER_BOOTSTRAP_TOKEN"), "web owner bootstrap uses a dedicated environment secret");
has(runtime.includes('constantSecretMatch(req.headers.get("x-atm-owner-bootstrap-token"), expected)'), "web owner bootstrap validates the dedicated secret");
has(runtime.includes('publicRate(stub, "owner_bootstrap_link", ip, 3, 60 * 60 * 1e3)'), "web owner bootstrap is rate limited");
has(runtime.includes('strictMutationOrigin(req)'), "grant mutations require strict same-origin check");
has(runtime.includes('ownerSessionFor(stub, req)'), "grant management requires owner session");
has(runtime.includes('p.match(/^\\/api\\/access-grants'), "grant revoke route is narrowly matched");
has(runtime.includes('p === "/api/agent/tasks" && req.method === "GET"'), "agent task API is GET-only");
has(runtime.includes('authorization.match(/^Bearer ([a-f0-9]{64})$/)'), "agent API requires a bounded bearer token");
has(runtime.includes('auth.grant?.scope !== "tasks:read"'), "agent API checks fixed read-only scope");
has(runtime.includes("sanitizeReadOnlyTasks(opportunityData.results)"), "task API uses an allowlist sanitizer");
has(runtime.includes('return j({ ok: true, scope: "tasks:read"'), "task API returns the read-only scope");
has(ui.includes("GET /api/agent/tasks"), "UI documents the read-only API endpoint");
has(ui.includes('id="ownerBootstrapControls"') && ui.includes('id="ownerBootstrapToken"'), "owner bootstrap form exists in the UI");
has(ui.includes("fetch('/api/owner/bootstrap-link'"), "UI uses the dedicated owner bootstrap endpoint");
assert.equal(/fetch\(['"]\/api\/internal\/owner-link/i.test(ui), false, "UI never exposes the internal owner-link route");

has(ui.includes("method:'POST'") && ui.includes("api/access-grants"), "UI writes only local grant-management requests");
assert.equal(/fetch\(['"]\/api\/(?:dispatch|human-gate\/approve|taskmarket|claim|submit)/i.test(ui), false, "UI must not call marketplace mutation endpoints");
assert.equal(/localStorage|sessionStorage/.test(ui), false, "grant token must not be persisted in browser storage");

console.log("GRANT_ROUTES_OWNER_GATED=PASS");
console.log("AGENT_TASK_API_BEARER_AND_SCOPE=PASS");
console.log("TASK_RESPONSE_ALLOWLIST=PASS");
console.log("UI_HAS_NO_MARKETPLACE_MUTATIONS=PASS");
console.log("BROWSER_DOES_NOT_PERSIST_GRANT_TOKEN=PASS");
