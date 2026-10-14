import assert from "node:assert/strict";
import {
  HPA_BRAND_ID,
  buildHpaPrompt,
  generateHpaDraft,
  normalizeHpaGeneratedDraft,
  reviewHpaDraft,
  validateHpaGenerationInput,
} from "./ATM-ORDER066-HPA-MEDIA-ENGINE-V1.mjs";

const input = {
  brand_id: HPA_BRAND_ID,
  topic: "Tu cerebro no busca la verdad: busca tener razón",
  format: "REEL",
  series_id: "tu_cerebro_te_vende_humo",
  idempotency_key: "hpa-test-00000001",
  sources: [{
    title: "APA Dictionary — Confirmation bias",
    url: "https://dictionary.apa.org/confirmation-bias",
    checked_at: "2026-10-14",
    excerpt: "Tendencia a buscar e interpretar evidencia favorable a creencias previas.",
  }],
};
const modelDraft = {
  hook: "Tu cerebro también hace campaña por vos.",
  script: "A veces no buscamos saber si algo es cierto: buscamos argumentos para defender lo que ya creemos.",
  caption: "Cuando una idea te gusta, ¿la ponés a prueba o le armás un equipo de prensa?",
  cta: "¿Qué idea te costaría más revisar?",
  scenes: [
    { visual_direction: "Primer plano, mirada directa.", on_screen_text: "¿BUSCÁS LA VERDAD?", narration: "A veces creemos que estamos investigando." },
    { visual_direction: "Dos columnas de titulares opuestos.", on_screen_text: "O BUSCÁS TENER RAZÓN", narration: "Pero solo guardamos las pruebas que nos convienen." },
    { visual_direction: "La persona cambia de pestaña y abre una fuente contraria.", on_screen_text: "BUSCÁ QUÉ PODRÍA REFUTARTE", narration: "Probá buscar la mejor objeción a tu propia idea." },
  ],
  claims: [{
    text: "El sesgo de confirmación consiste en buscar o interpretar evidencia de forma favorable a creencias previas.",
    source_urls: ["https://dictionary.apa.org/confirmation-bias"],
    verification: "SUPPORTED",
  }],
  quality_notes: ["No convertir el ejemplo cotidiano en diagnóstico clínico."],
};
const fixedId = () => "hpa-content-test-0001";
const fixedNow = () => "2026-10-14T00:00:00.000Z";

assert.equal(validateHpaGenerationInput(input).ok, true, "valid HPA request is accepted");
assert.equal(validateHpaGenerationInput({ ...input, brand_id: "fantasticas_mentiras" }).error, "BRAND_NOT_ALLOWED");
assert.equal(validateHpaGenerationInput({ ...input, topic: "abc" }).error, "TOPIC_REQUIRED");
assert.equal(validateHpaGenerationInput({ ...input, idempotency_key: "" }).error, "IDEMPOTENCY_KEY_REQUIRED");
assert.equal(validateHpaGenerationInput({ ...input, sources: [{ title: "Unsafe", url: "http://example.com/a" }] }).error, "SOURCE_INVALID");
assert.equal(validateHpaGenerationInput({ ...input, format: "AUTOPUBLISH" }).error, "FORMAT_NOT_SUPPORTED");

const prompt = buildHpaPrompt(input);
assert.match(prompt[0].content, /No inventes estudios/);
assert.match(prompt[1].content, /dictionary\.apa\.org/);

const normalized = normalizeHpaGeneratedDraft(JSON.stringify(modelDraft), validateHpaGenerationInput(input).value, {
  contentId: fixedId(),
  createdAt: fixedNow(),
});
assert.equal(normalized.ok, true);
assert.equal(normalized.draft.brand_id, HPA_BRAND_ID);
assert.equal(normalized.draft.review_status, "DRAFT_NEEDS_REVIEW");
assert.equal(normalized.draft.asset_status, "NOT_RENDERED");
assert.equal(normalized.draft.publication_status, "NOT_PUBLISHED");
assert.equal(normalized.draft.claims[0].verification, "NEEDS_REVIEW", "model output never self-approves factual claims");
assert.equal(normalized.draft.claims[0].source_urls[0], input.sources[0].url);

const noSourceInput = validateHpaGenerationInput({ ...input, sources: [] }).value;
const noSource = normalizeHpaGeneratedDraft({
  ...modelDraft,
  claims: [{ text: "Unverified claim", source_urls: [], verification: "SUPPORTED" }],
}, noSourceInput, { contentId: fixedId(), createdAt: fixedNow() });
assert.equal(noSource.ok, true);
assert.equal(noSource.draft.research_status, "NEEDS_SOURCES");
assert.equal(noSource.draft.claims[0].verification, "NEEDS_RESEARCH");

const inventedSource = normalizeHpaGeneratedDraft({
  ...modelDraft,
  claims: [{ text: "Claim", source_urls: ["https://example.org/fabricated"], verification: "SUPPORTED" }],
}, validateHpaGenerationInput(input).value, { contentId: fixedId(), createdAt: fixedNow() });
assert.equal(inventedSource.ok, false);
assert.equal(inventedSource.error, "MODEL_RETURNED_UNVERIFIED_SOURCE");

let modelCalls = 0;
const generated = await generateHpaDraft({
  input,
  runModel: async (messages, maxTokens) => {
    modelCalls++;
    assert.equal(messages.length, 2);
    assert.equal(maxTokens, 2400);
    return JSON.stringify(modelDraft);
  },
  now: fixedNow,
  createId: fixedId,
});
assert.equal(generated.ok, true);
assert.equal(modelCalls, 1);

const modelFailure = await generateHpaDraft({
  input,
  runModel: async () => { throw new Error("private provider response must not leak"); },
  now: fixedNow,
  createId: fixedId,
});
assert.equal(modelFailure.ok, false);
assert.equal(modelFailure.error, "MODEL_GENERATION_FAILED");
assert.equal(JSON.stringify(modelFailure).includes("private provider response"), false);

const queue = [generated.draft];
const reviewed = reviewHpaDraft(queue, { content_id: fixedId(), decision: "APPROVE_SCRIPT", notes: "Script ok; wait for actual asset." }, fixedNow);
assert.equal(reviewed.ok, true);
assert.equal(reviewed.draft.review_status, "SCRIPT_APPROVED_ASSET_PENDING");
assert.equal(reviewed.draft.asset_status, "NOT_RENDERED");
assert.equal(reviewHpaDraft(reviewed.queue, { content_id: fixedId(), decision: "APPROVE_SCRIPT" }, fixedNow).error, "DRAFT_ALREADY_REVIEWED");
assert.equal(reviewHpaDraft(queue, { content_id: "not-here", decision: "REJECT" }, fixedNow).error, "DRAFT_NOT_FOUND");

console.log("PASS ORDER-066 HPA media draft contract: input gate, source integrity, no self-approval, idempotent-ready request, safe failure, review transitions.");
