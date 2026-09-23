import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, 'ATM-ORDER034-ACTIVE-MAIN-READONLY.js'), 'utf8');
const checks = [];
const check = (name, ok) => { checks.push([name, !!ok]); if (!ok) throw new Error(name); };

check('STATUS_EXPOSES_MCP_ACTIVITY', src.includes('mcp_activity: await this.mcpHeartbeatState()'));
check('ACTIVE_WINDOW_15S', src.includes('const activeWindowMs = 15 * 1e3'));
check('HEARTBEAT_REQUIRES_REAL_RECENT_PULSE', src.includes('Date.now() - last <= activeWindowMs'));
check('PUBLIC_POST_AUTHENTICATED', src.includes('x-atm-mcp-heartbeat-token') && src.includes('MCP_HEARTBEAT_TOKEN'));
check('INTERNAL_POST_VERIFIED', src.includes('x-atm-mcp-heartbeat") !== "verified"'));
check('NO_SECRET_HARDCODED', !/MCP_HEARTBEAT_TOKEN\s*=\s*["'][^"']+/.test(src));
check('GET_IS_READ_ONLY', src.includes('p === "/api/mcp-heartbeat" && req.method === "GET"'));
check('PULSE_LOGGED', src.includes('MCP_HEARTBEAT') && src.includes('MCP activity observed'));
check('CLIENT_INFO_CAPTURED', src.includes('rpc?.params?.clientInfo') && src.includes('client_name: clientName') && src.includes('client_version: clientVersion'));
check('UA_FALLBACK_CLASSIFICATION', src.includes('/chatgpt|openai/i') && src.includes('/claude|anthropic/i') && src.includes('/cursor/i') && src.includes('/codex/i'));
check('CLIENT_FINGERPRINT_HASHED', src.includes('clientFingerprint = (await sha256Hex') && src.includes('.slice(0, 20)'));
check('CLIENT_IDENTITY_PERSISTS_AFTER_INITIALIZE', src.includes('const existing = priorConsumers.find') && src.includes('genericName && existing?.name') && src.includes('[ip, ua].join("|")'));
check('NO_RAW_IP_EXPOSED_IN_STATE', src.includes('const { consumers: _privateConsumers, ...rest } = h') && src.includes('publicConsumers'));
check('ACTIVE_CONSUMERS_EXPOSED', src.includes('active_consumers: publicConsumers.filter((x) => x.active)') && src.includes('last_client_name'));

console.log(JSON.stringify({ ok: true, checks: Object.fromEntries(checks) }, null, 2));
