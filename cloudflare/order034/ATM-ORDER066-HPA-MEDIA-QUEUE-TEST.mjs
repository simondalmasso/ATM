import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(here, "ATM-ORDER034-ACTIVE-MAIN-READONLY.js");
const tmp = path.join(os.tmpdir(), "atm-order066-queue-" + process.pid + "-" + Date.now() + ".mjs");
let code = fs.readFileSync(sourcePath, "utf8")
  .replace('import { DurableObject } from "cloudflare:workers";', 'class DurableObject { constructor(ctx, env) { this.ctx = ctx; this.env = env; } }')
  .replaceAll('"./ATM-ORDER066-HPA-MEDIA-ENGINE-V1.mjs"', JSON.stringify(pathToFileURL(path.join(here, "ATM-ORDER066-HPA-MEDIA-ENGINE-V1.mjs")).href));
fs.writeFileSync(tmp, code, "utf8");
process.on("exit", () => { try { fs.unlinkSync(tmp); } catch {} });
const { ATMBrain, default: worker } = await import(pathToFileURL(tmp).href + "?v=" + Date.now());

function makeStorage() {
  const values = new Map();
  let tail = Promise.resolve();
  const get = async (key) => values.get(key);
  const put = async (key, value) => { values.set(key, structuredClone(value)); };
  const storage = {
    get, put,
    transaction: async (callback) => {
      let release;
      const previous = tail;
      tail = new Promise((resolve) => { release = resolve; });
      await previous;
      try { return await callback({ get, put }); }
      finally { release(); }
    },
  };
  return { storage, values };
}

const input = {
  brand_id: "hombrepsicoactivo",
  topic: "El sesgo de confirmación en la vida cotidiana",
  format: "REEL",
  series_id: "tu_cerebro_te_vende_humo",
  idempotency_key: "hpa-idempotency-test-0001",
  sources: [],
};
const modelDraft = {
  hook: "Tu cerebro también hace campaña por vos.",
  script: "A veces defendemos una idea antes de comprobarla.",
  caption: "¿Qué evidencia te haría cambiar de opinión?",
  cta: "Contá qué te ayuda a revisar tus ideas.",
  scenes: [
    { visual_direction: "Primer plano.", on_screen_text: "¿Y SI NO?", narration: "No toda convicción es evidencia." },
    { visual_direction: "Dos titulares opuestos.", on_screen_text: "BUSCÁ LA OBJECIÓN", narration: "Probá buscar el mejor argumento contrario." },
    { visual_direction: "Abrir una fuente alternativa.", on_screen_text: "REVISÁ", narration: "Una buena pregunta también puede cambiar tu conclusión." },
  ],
  claims: [{ text: "Una afirmación pendiente de investigación.", source_urls: [], verification: "NEEDS_RESEARCH" }],
  quality_notes: [],
};
const { storage, values } = makeStorage();
const brain = new ATMBrain({ storage }, {});
let modelCalls = 0;
let releaseModel;
const modelGate = new Promise((resolve) => { releaseModel = resolve; });
brain.runExecutionModel = async () => {
  modelCalls += 1;
  await modelGate;
  return JSON.stringify(modelDraft);
};

const firstPromise = brain.generateHpaMediaDraft(input);
for (let i = 0; i < 100 && modelCalls === 0; i++) {
  await new Promise((resolve) => setTimeout(resolve, 0));
}
assert.equal(modelCalls, 1, "first request reserves key before starting model inference");
const concurrentReplay = await brain.generateHpaMediaDraft(input);
assert.equal(concurrentReplay.ok, false);
assert.equal(concurrentReplay.status, 409);
assert.equal(concurrentReplay.error, "IDEMPOTENCY_IN_PROGRESS");
assert.equal(modelCalls, 1, "same-key concurrent request must not invoke the model twice");

releaseModel();
const first = await firstPromise;
assert.equal(first.ok, true);
assert.equal(first.idempotent_replay, false);
const replay = await brain.generateHpaMediaDraft(input);
assert.equal(replay.ok, true);
assert.equal(replay.idempotent_replay, true);
assert.equal(replay.draft.content_id, first.draft.content_id);
assert.equal(modelCalls, 1, "completed replay returns the original draft without a second model call");

const reviewRace = await Promise.all([
  brain.reviewHpaMediaDraft({ content_id: first.draft.content_id, decision: "APPROVE_SCRIPT" }),
  brain.reviewHpaMediaDraft({ content_id: first.draft.content_id, decision: "REJECT" }),
]);
assert.equal(reviewRace.filter((x) => x.ok).length, 1, "exactly one concurrent owner decision can commit");
assert.equal(reviewRace.filter((x) => x.error === "DRAFT_ALREADY_REVIEWED").length, 1, "the losing review sees the committed terminal review state");

const changedPayload = { ...input, topic: "Otro tema con la misma clave" };
const keyConflict = await brain.generateHpaMediaDraft(changedPayload);
assert.equal(keyConflict.ok, false);
assert.equal(keyConflict.status, 409);
assert.equal(keyConflict.error, "IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST");
assert.equal((await brain.hpaMediaDrafts()).length, 1);
assert.equal(values.get("hpa_media_idempotency_v1:" + input.idempotency_key).status, "COMPLETED");

const { storage: parallelStorage } = makeStorage();
const parallelBrain = new ATMBrain({ storage: parallelStorage }, {});
parallelBrain.runExecutionModel = async () => {
  await new Promise((resolve) => setTimeout(resolve, 5));
  return JSON.stringify(modelDraft);
};
const [a, b] = await Promise.all([
  parallelBrain.generateHpaMediaDraft({ ...input, idempotency_key: "hpa-parallel-key-0001" }),
  parallelBrain.generateHpaMediaDraft({ ...input, idempotency_key: "hpa-parallel-key-0002" }),
]);
assert.equal(a.ok, true);
assert.equal(b.ok, true);
assert.equal((await parallelBrain.hpaMediaDrafts()).length, 2, "different concurrent keys must not overwrite each other's queue item");

const { storage: fullStorage } = makeStorage();
await fullStorage.put("hpa_media_queue_v1", Array.from({ length: 40 }, (_, i) => ({
  content_id: "hpa-full-" + i,
  idempotency_key: "hpa-full-key-" + i,
  brand_id: "hombrepsicoactivo",
  review_status: "DRAFT_NEEDS_REVIEW",
})));
const fullBrain = new ATMBrain({ storage: fullStorage }, {});
let fullQueueModelCalls = 0;
fullBrain.runExecutionModel = async () => { fullQueueModelCalls += 1; return JSON.stringify(modelDraft); };
const fullResult = await fullBrain.generateHpaMediaDraft({ ...input, idempotency_key: "hpa-full-new-key-0001" });
assert.equal(fullResult.ok, false);
assert.equal(fullResult.status, 429);
assert.equal(fullResult.error, "MEDIA_QUEUE_FULL");
assert.equal(fullQueueModelCalls, 0, "a full queue must fail before inference is invoked");

let publicInternalCalls = 0;
let forceMediaRateLimit = false;
let lastInternalOwnerMarker = null;
const publicStub = {
  fetch: async (request) => {
    publicInternalCalls += 1;
    const pathname = new URL(request.url).pathname;
    if (pathname === "/owner/session/verify") {
      const body = await request.clone().json().catch(() => ({}));
      const ok = body.token === "valid";
      return new Response(JSON.stringify({ ok, error: ok ? null : "OWNER_SESSION_EXPIRED" }), {
        status: ok ? 200 : 403, headers: { "content-type": "application/json" },
      });
    }
    if (pathname === "/rate-limit") {
      const body = await request.clone().json().catch(() => ({}));
      const ok = !(forceMediaRateLimit && body.bucket === "hpa_media_queue");
      return new Response(JSON.stringify({ ok, reset_at: "2099-01-01T00:00:00.000Z" }), {
        status: 200, headers: { "content-type": "application/json" },
      });
    }
    if (pathname === "/media/drafts") {
      lastInternalOwnerMarker = request.headers.get("x-atm-owner-session");
      return new Response(JSON.stringify({ ok: true, drafts: [] }), {
        status: 200, headers: { "content-type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: false, error: "UNEXPECTED_INTERNAL_ROUTE" }), {
      status: 404, headers: { "content-type": "application/json" },
    });
  },
};
const publicEnv = {
  ATM_BRAIN: { idFromName: () => "global", get: () => publicStub },
  ATM_GIT_SHA: "test",
  EXECUTION_ENABLED: "false",
};
const noSession = await worker.fetch(
  new Request("https://atm.simondalmasso44.workers.dev/api/media/drafts"),
  publicEnv,
);
assert.equal(noSession.status, 403, "public draft queue requires an owner session");
assert.equal(publicInternalCalls, 0, "missing cookie fails closed without internal work");

const expiredSession = await worker.fetch(
  new Request("https://atm.simondalmasso44.workers.dev/api/media/drafts", {
    headers: { cookie: "atm_owner_session=expired" },
  }),
  publicEnv,
);
assert.equal(expiredSession.status, 403, "expired owner session cannot read the queue");

const validSession = await worker.fetch(
  new Request("https://atm.simondalmasso44.workers.dev/api/media/drafts", {
    headers: { cookie: "atm_owner_session=valid" },
  }),
  publicEnv,
);
assert.equal(validSession.status, 200, "valid owner session can read the private queue");
assert.equal(lastInternalOwnerMarker, "verified", "Worker marks its internal DO request only after session verification");

forceMediaRateLimit = true;
const rateLimited = await worker.fetch(
  new Request("https://atm.simondalmasso44.workers.dev/api/media/drafts", {
    headers: { cookie: "atm_owner_session=valid" },
  }),
  publicEnv,
);
assert.equal(rateLimited.status, 429, "owner queue rate limit fails closed");
forceMediaRateLimit = false;

const badOrigin = await worker.fetch(
  new Request("https://atm.simondalmasso44.workers.dev/api/media/draft/generate", {
    method: "POST",
    headers: { origin: "https://attacker.invalid", "content-type": "application/json" },
    body: JSON.stringify({ topic: input.topic, idempotency_key: "hpa-http-test-key-0001" }),
  }),
  publicEnv,
);
assert.equal(badOrigin.status, 403, "mutating endpoint rejects untrusted Origin before owner checks");
assert.equal(await badOrigin.text().then((body) => JSON.parse(body).error), "ORIGIN_DENIED");

const internalDenied = await brain.fetch(new Request("https://do/media/drafts"));
assert.equal(internalDenied.status, 403, "Durable Object media routes reject missing internal owner marker");


const studioResponse = await worker.fetch(
  new Request("https://atm.simondalmasso44.workers.dev/media-studio"),
  publicEnv,
);
assert.equal(studioResponse.status, 200, "media studio route returns its UI");
assert.ok(String(studioResponse.headers.get("content-security-policy")).includes("media-src 'self' blob:"), "CSP permits the local media blob without widening connect-src");
const studioHtml = await studioResponse.text();
assert.ok(studioHtml.includes("Videos generados en este navegador"), "UI declares browser-local video storage honestly");
assert.ok(studioHtml.includes("No se subió") || studioHtml.includes("no sube el video al servidor"), "UI never claims local renders are hosted assets");
assert.ok(studioHtml.includes("Generar video cinematográfico"), "approved REEL drafts expose the render action");
assert.ok(studioHtml.includes("NOT_INCLUDED_ZERO_COST_MODE"), "renderer records the no-paid-voiceover limitation");
const browserScript = studioHtml.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(browserScript, "media studio contains the client renderer script");
new Function(browserScript);

console.log("PASS ORDER-066 queue integration: transactional idempotency, concurrent replay, key/payload mismatch, atomic review, capacity gate, HTTP owner/origin/rate-limit gates, and no lost queue updates.");
