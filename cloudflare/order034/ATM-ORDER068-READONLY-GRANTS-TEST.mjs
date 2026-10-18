import assert from "node:assert/strict";
import { createReadOnlyGrant, listReadOnlyGrants, authorizeReadOnlyGrant, revokeReadOnlyGrant } from "./ATM-ORDER068-READONLY-GRANTS.mjs";

class MemoryStorage {
  data = new Map();
  async get(k) { return this.data.get(k); }
  async put(k, v) { this.data.set(k, structuredClone(v)); }
  async delete(k) { return this.data.delete(k); }
  async list({ prefix = "" } = {}) { return new Map([...this.data].filter(([k]) => k.startsWith(prefix))); }
}
const storage = new MemoryStorage();
const now = 1_800_000_000_000;
const grant = await createReadOnlyGrant({ storage, label: "agent audit", ttlMinutes: 60, now: () => now });
assert.equal(grant.ok, true);
assert.match(grant.token, /^[a-f0-9]{64}$/);
assert.equal(grant.grant.scope, "tasks:read");
assert.equal(Date.parse(grant.grant.expires_at) - now, 60 * 60 * 1000);
const storedRecord = storage.data.get("readonly_grant_record:" + grant.grant.id);
assert.ok(storedRecord);
assert.equal(JSON.stringify(storedRecord).includes(grant.token), false, "raw token must never be stored");
assert.equal(storedRecord.token_hash.length, 64, "only a SHA-256 token hash is stored");

const listed = await listReadOnlyGrants({ storage, now: () => now });
assert.equal(listed.length, 1);
assert.equal(JSON.stringify(listed).includes("token_hash"), false, "list must not disclose token hashes");
assert.equal(JSON.stringify(listed).includes(grant.token), false, "list must not disclose bearer token");

const authorized = await authorizeReadOnlyGrant({ storage, token: grant.token, now: () => now });
assert.equal(authorized.ok, true);
assert.equal(authorized.grant.scope, "tasks:read");
assert.equal((await authorizeReadOnlyGrant({ storage, token: "wrong-token", now: () => now })).ok, false);

const revoked = await revokeReadOnlyGrant({ storage, id: grant.grant.id, now: () => now });
assert.equal(revoked.ok, true);
assert.equal((await authorizeReadOnlyGrant({ storage, token: grant.token, now: () => now })).error, "GRANT_REVOKED");

const expiring = await createReadOnlyGrant({ storage, label: "short grant", ttlMinutes: 5, now: () => now });
assert.equal(expiring.ok, true);
assert.equal((await authorizeReadOnlyGrant({ storage, token: expiring.token, now: () => now + 5 * 60 * 1000 + 1 })).error, "GRANT_EXPIRED");
assert.equal((await createReadOnlyGrant({ storage, label: "bad ttl", ttlMinutes: 1, now: () => now })).ok, false);
assert.equal((await createReadOnlyGrant({ storage, label: "too long", ttlMinutes: 1441, now: () => now })).ok, false);

console.log("READONLY_GRANT_CREATE_HASHED_TOKEN=PASS");
console.log("READONLY_GRANT_LIST_REDACTS_SECRETS=PASS");
console.log("READONLY_GRANT_AUTH_AND_SCOPE=PASS");
console.log("READONLY_GRANT_REVOKE_IMMEDIATE=PASS");
console.log("READONLY_GRANT_EXPIRY_AND_TTL_BOUNDS=PASS");
