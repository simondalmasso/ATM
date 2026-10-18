const RECORD_PREFIX = "readonly_grant_record:";
const TOKEN_PREFIX = "readonly_grant_token:";
const MAX_ACTIVE_GRANTS = 50;
const MIN_TTL_MINUTES = 5;
const MAX_TTL_MINUTES = 1440;

function hex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function randomHex(bytes = 32) {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return hex(value);
}
async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value)));
  return hex(new Uint8Array(digest));
}
function publicGrant(record, now) {
  const expired = Date.parse(record.expires_at) <= now;
  return {
    id: record.id,
    label: record.label,
    scope: record.scope,
    created_at: record.created_at,
    expires_at: record.expires_at,
    revoked_at: record.revoked_at || null,
    last_used_at: record.last_used_at || null,
    use_count: Number(record.use_count || 0),
    status: record.revoked_at ? "REVOKED" : expired ? "EXPIRED" : "ACTIVE"
  };
}
function validStorage(storage) {
  return !!storage && typeof storage.get === "function" && typeof storage.put === "function" && typeof storage.list === "function";
}

export async function createReadOnlyGrant({ storage, label = "ATM read-only agent", ttlMinutes = 60, now = () => Date.now() } = {}) {
  if (!validStorage(storage)) return { ok: false, error: "GRANT_STORAGE_UNAVAILABLE" };
  const ttl = Number(ttlMinutes);
  if (!Number.isInteger(ttl) || ttl < MIN_TTL_MINUTES || ttl > MAX_TTL_MINUTES) return { ok: false, error: "GRANT_TTL_OUT_OF_RANGE" };
  const time = now();
  const current = await storage.list({ prefix: RECORD_PREFIX, limit: 100 });
  const activeCount = [...current.values()].filter((record) => !record.revoked_at && Date.parse(record.expires_at) > time).length;
  if (activeCount >= MAX_ACTIVE_GRANTS) return { ok: false, error: "GRANT_LIMIT_REACHED" };
  const token = randomHex(32);
  const tokenHash = await sha256Hex(token);
  const id = randomHex(12);
  const safeLabel = String(label || "ATM read-only agent").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 80) || "ATM read-only agent";
  const record = {
    id,
    label: safeLabel,
    token_hash: tokenHash,
    scope: "tasks:read",
    created_at: new Date(time).toISOString(),
    expires_at: new Date(time + ttl * 60_000).toISOString(),
    revoked_at: null,
    last_used_at: null,
    use_count: 0
  };
  await storage.put(RECORD_PREFIX + id, record);
  await storage.put(TOKEN_PREFIX + tokenHash, { grant_id: id, expires_at: record.expires_at });
  return { ok: true, token, grant: publicGrant(record, time) };
}

export async function listReadOnlyGrants({ storage, now = () => Date.now() } = {}) {
  if (!validStorage(storage)) return [];
  const records = await storage.list({ prefix: RECORD_PREFIX, limit: 100 });
  return [...records.values()]
    .map((record) => publicGrant(record, now()))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function revokeReadOnlyGrant({ storage, id, now = () => Date.now() } = {}) {
  if (!validStorage(storage)) return { ok: false, error: "GRANT_STORAGE_UNAVAILABLE" };
  if (!/^[a-f0-9]{24}$/.test(String(id || ""))) return { ok: false, error: "GRANT_ID_INVALID" };
  const key = RECORD_PREFIX + id;
  const record = await storage.get(key);
  if (!record) return { ok: false, error: "GRANT_NOT_FOUND" };
  if (!record.revoked_at) {
    record.revoked_at = new Date(now()).toISOString();
    await storage.put(key, record);
  }
  return { ok: true, grant: publicGrant(record, now()) };
}

export async function authorizeReadOnlyGrant({ storage, token, now = () => Date.now() } = {}) {
  if (!validStorage(storage)) return { ok: false, error: "GRANT_STORAGE_UNAVAILABLE" };
  const bearer = String(token || "");
  if (!/^[a-f0-9]{64}$/.test(bearer)) return { ok: false, error: "GRANT_INVALID" };
  const tokenHash = await sha256Hex(bearer);
  const tokenRecord = await storage.get(TOKEN_PREFIX + tokenHash);
  if (!tokenRecord?.grant_id) return { ok: false, error: "GRANT_INVALID" };
  const key = RECORD_PREFIX + tokenRecord.grant_id;
  const record = await storage.get(key);
  if (!record || record.token_hash !== tokenHash) return { ok: false, error: "GRANT_INVALID" };
  if (record.revoked_at) return { ok: false, error: "GRANT_REVOKED" };
  if (Date.parse(record.expires_at) <= now()) return { ok: false, error: "GRANT_EXPIRED" };
  if (record.scope !== "tasks:read") return { ok: false, error: "GRANT_SCOPE_DENIED" };
  record.last_used_at = new Date(now()).toISOString();
  record.use_count = Number(record.use_count || 0) + 1;
  await storage.put(key, record);
  return { ok: true, grant: publicGrant(record, now()) };
}


export function sanitizeReadOnlyTasks(input) {
  return (Array.isArray(input) ? input : []).slice(0, 100).map((x) => {
    let url = null;
    try {
      const parsed = new URL(String(x.url || x.apply_url || ""));
      if (parsed.protocol === "https:" || parsed.protocol === "http:") url = parsed.href;
    } catch {}
    const amount = Number(x.estimated_net_usd ?? x.net_reward_usd ?? x.reward_usd);
    return {
      id: String(x.id || x.task_id || x.opportunity_id || "").slice(0, 120),
      source: String(x.source || "").slice(0, 80),
      title: String(x.title || x.name || "").slice(0, 240),
      description: String(x.description || "").slice(0, 2000),
      estimated_net_usd: Number.isFinite(amount) ? amount : null,
      currency: String(x.currency || "USD").slice(0, 12),
      status: String(x.status || "UNKNOWN").slice(0, 40),
      url,
      ai_executability: String(x.ai_executability || "UNKNOWN").slice(0, 40),
      blockers: Array.isArray(x.blockers) ? x.blockers.slice(0, 20).map((b) => String(b).slice(0, 120)) : []
    };
  }).filter((x) => x.id && x.source);
}

export const READONLY_GRANT_POLICY = Object.freeze({
  scope: "tasks:read",
  min_ttl_minutes: MIN_TTL_MINUTES,
  max_ttl_minutes: MAX_TTL_MINUTES,
  max_active_grants: MAX_ACTIVE_GRANTS,
  raw_token_persisted: false,
  permits_mutations: false
});
