import assert from "node:assert/strict";
import {
  buildHpaNarration,
  hpaRenderFingerprint,
  isValidWebmContainer,
  validateHpaRenderDraft,
} from "./hpa-render-adapter.mjs";

const draft = {
  content_id: "hpa-render-test-0001",
  idempotency_key: "hpa-render-idem-0001",
  brand_id: "hombrepsicoactivo",
  format: "REEL",
  language: "es-AR",
  topic: "Tu cerebro no busca la verdad: busca tener razón",
  hook: "Tu cerebro también hace campaña por vos.",
  script: "A veces buscamos argumentos para defender lo que ya creemos.",
  caption: "¿Ponés tus ideas a prueba o les armás un equipo de prensa?",
  cta: "¿Qué idea te costaría más revisar?",
  review_status: "SCRIPT_APPROVED_ASSET_PENDING",
  asset_status: "NOT_RENDERED",
  scenes: [
    { visual_direction: "Primer plano, mirada directa.", on_screen_text: "¿BUSCÁS LA VERDAD?", narration: "A veces creemos que estamos investigando." },
    { visual_direction: "Dos columnas de titulares opuestos.", on_screen_text: "O BUSCÁS TENER RAZÓN", narration: "Pero guardamos las pruebas que nos convienen." },
    { visual_direction: "Abrir una fuente contraria.", on_screen_text: "BUSCÁ QUÉ PODRÍA REFUTARTE", narration: "Probá buscar la mejor objeción a tu propia idea." },
  ],
};

assert.equal(validateHpaRenderDraft(draft).ok, true);
assert.equal(validateHpaRenderDraft({ ...draft, review_status: "DRAFT_NEEDS_REVIEW" }).error, "SCRIPT_APPROVAL_REQUIRED");
assert.equal(validateHpaRenderDraft({ ...draft, asset_status: "RENDERED" }).error, "ASSET_STATE_NOT_RENDERABLE");
assert.equal(validateHpaRenderDraft({ ...draft, brand_id: "fantasticas_mentiras" }).error, "BRAND_NOT_ALLOWED");
assert.equal(validateHpaRenderDraft({ ...draft, format: "CAROUSEL" }).error, "RENDER_FORMAT_NOT_SUPPORTED");
assert.equal(validateHpaRenderDraft({ ...draft, scenes: draft.scenes.slice(0, 2) }).error, "SCENE_COUNT_INVALID");
assert.match(buildHpaNarration(draft), /Tu cerebro también hace campaña/);
assert.match(buildHpaNarration(draft), /mejor objeción/);
assert.notEqual(hpaRenderFingerprint(draft), hpaRenderFingerprint({ ...draft, hook: "Otro hook" }));
assert.equal(hpaRenderFingerprint(draft), hpaRenderFingerprint({ ...draft }));
assert.equal(isValidWebmContainer(Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.from('V_VP8 A_OPUS'), Buffer.alloc(5000)])), true);
assert.equal(isValidWebmContainer(Buffer.alloc(5000)), false);
assert.equal(isValidWebmContainer(Buffer.alloc(10)), false);

console.log("PASS HPA local render adapter contract: script approval gate, supported format, scene bounds, deterministic fingerprint, narration and WebM container guard.");
