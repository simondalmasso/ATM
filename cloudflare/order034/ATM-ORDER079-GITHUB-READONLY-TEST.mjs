import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, 'ATM-ORDER034-ACTIVE-MAIN-READONLY.js');
const tmp = path.join(os.tmpdir(), `atm-order079-github-${process.pid}-${Date.now()}.mjs`);
let sourceText = fs.readFileSync(src, 'utf8');
if (!sourceText.includes('GITHUB_ISSUES')) throw new Error('GITHUB_ISSUES_SOURCE_NOT_REGISTERED');
sourceText = sourceText.replace('import { DurableObject } from "cloudflare:workers";', 'class DurableObject { constructor(ctx, env) {} }');
sourceText = sourceText.replace('import { createReadOnlyGrant, listReadOnlyGrants, authorizeReadOnlyGrant, revokeReadOnlyGrant, sanitizeReadOnlyTasks } from "./ATM-ORDER068-READONLY-GRANTS.mjs";', '');
sourceText += '\nexport { normalize, discoverSource, sourceBase };\n';
fs.writeFileSync(tmp, sourceText, 'utf8');
process.on('exit', () => { try { fs.unlinkSync(tmp); } catch {} });
const mod = await import(pathToFileURL(tmp).href + '?v=' + Date.now());

const originalFetch = globalThis.fetch;
const calls = [];
globalThis.fetch = async (url, options = {}) => {
  calls.push({ url: String(url), method: options.method || 'GET', headers: options.headers || {} });
  if (!String(url).startsWith('https://api.github.com/search/issues?')) throw new Error('UNEXPECTED_HOST_OR_PATH');
  return new Response(JSON.stringify({
    total_count: 2,
    incomplete_results: false,
    items: [
      { id: 991, number: 17, title: 'Fix parser crash', body: 'Reproduce and fix parser crash. Reward: $250.', html_url: 'https://github.com/example/project/issues/17', state: 'open', created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-26T00:00:00Z', labels: [{ name: 'bounty' }] },
      { id: 992, number: 18, title: 'Document setup', body: 'Please improve setup documentation.', html_url: 'https://github.com/example/project/issues/18', state: 'open', created_at: '2026-10-02T00:00:00Z', updated_at: '2026-10-25T00:00:00Z', labels: [] }
    ]
  }), { status: 200, headers: { 'content-type': 'application/json' } });
};

try {
  const result = await mod.discoverSource('GITHUB');
  if (calls.length !== 1) throw new Error(`EXPECTED_ONE_READ_ONLY_CALL_GOT_${calls.length}`);
  if (calls[0].method !== 'GET') throw new Error('GITHUB_DISCOVERY_NOT_READ_ONLY');
  if (Object.keys(calls[0].headers).some(k => /authorization|token/i.test(k))) throw new Error('GITHUB_DISCOVERY_MUST_NOT_REQUIRE_CREDENTIALS');
  if (result.opportunities.length !== 2) throw new Error(`EXPECTED_TWO_ISSUES_GOT_${result.opportunities.length}`);
  const paidLooking = result.opportunities.find(x => x.raw_id === '991');
  if (!paidLooking) throw new Error('ISSUE_ID_NOT_NORMALIZED');
  if (paidLooking.payout_amount !== 0 || paidLooking.estimated_net_usd !== null) throw new Error('UNVERIFIED_TEXT_REWARD_PROMOTED_TO_MONEY');
  for (const opp of result.opportunities) {
    for (const blocker of ['GITHUB_REWARD_UNVERIFIED', 'DISCOVERY_ONLY_NO_EXECUTION_ADAPTER']) {
      if (!opp.blockers.includes(blocker)) throw new Error(`MISSING_FAIL_CLOSED_BLOCKER_${blocker}`);
    }
    if (opp.ai_executability !== 'BLOCKED') throw new Error('GITHUB_ISSUE_BECAME_AUTO_EXECUTABLE');
  }
  if (result.state.automatic_action_level !== 'DISCOVER_ONLY_READ_ONLY') throw new Error('GITHUB_ACTION_LEVEL_NOT_READ_ONLY');
  console.log('ORDER-079 PASS: read-only discovery normalizes candidates and keeps unverified rewards blocked.');
} finally {
  globalThis.fetch = originalFetch;
}
