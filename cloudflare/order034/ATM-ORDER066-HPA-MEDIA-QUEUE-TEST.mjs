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
const { ATMBrain } = await import(pathToFileURL(tmp).href + "?v=" + Date.now());

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

console.log("PASS ORDER-066 queue integration: transactional idempotency, concurrent replay, key/payload mismatch, atomic review, and no lost queue updates.");
