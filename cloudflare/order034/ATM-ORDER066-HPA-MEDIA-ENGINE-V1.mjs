/**
 * ORDER-066 · Hombrepsicoactivo editorial draft contract.
 * Pure helpers shared by the Worker and deterministic Node tests.
 * This module does not publish, claim assets were rendered, or treat a draft as approved.
 */
export const HPA_BRAND_ID = "hombrepsicoactivo";
export const HPA_QUEUE_KEY = "hpa_media_queue_v1";
export const HPA_MAX_QUEUE_ITEMS = 40;
export const HPA_MAX_SOURCES = 8;
export const HPA_MAX_SOURCE_CHARS = 1800;
export const HPA_MAX_TOPIC_CHARS = 300;
export const HPA_MAX_SCRIPT_CHARS = 5000;
export const HPA_MAX_CAPTION_CHARS = 2200;

const ALLOWED_FORMATS = new Set(["REEL", "CAROUSEL", "IMAGE_POST"]);
const ALLOWED_DECISIONS = new Set(["APPROVE_SCRIPT", "REJECT"]);

function plainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function boundedText(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function safeSource(source) {
  if (!plainObject(source)) return null;
  const title = boundedText(source.title, 200);
  const url = boundedText(source.url, HPA_MAX_SOURCE_CHARS);
  if (!title || !url) return null;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) return null;
  return {
    title,
    url: parsed.toString(),
    checked_at: boundedText(source.checked_at, 40) || null,
    excerpt: boundedText(source.excerpt, 1200) || null,
  };
}

export function validateHpaGenerationInput(input) {
  if (!plainObject(input)) return { ok: false, status: 400, error: "INVALID_JSON_OBJECT" };
  if (input.brand_id && input.brand_id !== HPA_BRAND_ID) {
    return { ok: false, status: 403, error: "BRAND_NOT_ALLOWED" };
  }

  const topic = boundedText(input.topic, HPA_MAX_TOPIC_CHARS);
  if (topic.length < 5) return { ok: false, status: 400, error: "TOPIC_REQUIRED" };
  if (typeof input.topic !== "string" || input.topic.trim().length > HPA_MAX_TOPIC_CHARS) {
    return { ok: false, status: 400, error: "TOPIC_LENGTH_INVALID" };
  }

  const format = boundedText(input.format || "REEL", 20).toUpperCase();
  if (!ALLOWED_FORMATS.has(format)) return { ok: false, status: 400, error: "FORMAT_NOT_SUPPORTED" };

  const seriesId = boundedText(input.series_id || "tu_cerebro_te_vende_humo", 80);
  if (!/^[a-z0-9][a-z0-9_-]{2,79}$/.test(seriesId)) {
    return { ok: false, status: 400, error: "SERIES_ID_INVALID" };
  }

  const idempotencyKey = boundedText(input.idempotency_key, 120);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{7,119}$/.test(idempotencyKey)) {
    return { ok: false, status: 400, error: "IDEMPOTENCY_KEY_REQUIRED" };
  }

  if (input.sources !== undefined && !Array.isArray(input.sources)) {
    return { ok: false, status: 400, error: "SOURCES_MUST_BE_ARRAY" };
  }
  const sourceInput = Array.isArray(input.sources) ? input.sources : [];
  if (sourceInput.length > HPA_MAX_SOURCES) {
    return { ok: false, status: 400, error: "TOO_MANY_SOURCES" };
  }
  const sources = [];
  for (const item of sourceInput) {
    const source = safeSource(item);
    if (!source) return { ok: false, status: 400, error: "SOURCE_INVALID" };
    if (sources.some((x) => x.url === source.url)) continue;
    sources.push(source);
  }

  return {
    ok: true,
    value: {
      brand_id: HPA_BRAND_ID,
      topic,
      format,
      series_id: seriesId,
      idempotency_key: idempotencyKey,
      sources,
      desired_duration_seconds: format === "REEL" ? 35 : null,
      language: "es-AR",
    },
  };
}

export function buildHpaPrompt(request) {
  const sourceSummary = request.sources.map((source, index) => ({
    n: index + 1,
    title: source.title,
    url: source.url,
    checked_at: source.checked_at,
    excerpt: source.excerpt,
  }));
  const system = [
    "Sos el editor de Hombrepsicoactivo, una página argentina de psicología cotidiana y conducta digital.",
    "Tono: incisivo, curioso, autocrítico y claro; humor seco, no memes genéricos.",
    "No diagnostiques a la audiencia, no hagas consejo clínico, no presentes una hipótesis como hecho científico.",
    "No inventes estudios, citas, nombres de autores, estadísticas ni URLs.",
    "Usá únicamente las fuentes suministradas. Si no alcanzan para respaldar una afirmación, declarala en claims con verification='NEEDS_RESEARCH'; no la conviertas en un hecho.",
    "Devolvé SOLO JSON válido, sin Markdown ni fences, con esta forma:",
    '{"hook":"...","script":"...","caption":"...","cta":"...","scenes":[{"visual_direction":"...","on_screen_text":"...","narration":"..."}],"claims":[{"text":"...","source_urls":["https://..."],"verification":"SUPPORTED|NEEDS_RESEARCH"}],"quality_notes":["..."]}',
    "3 a 8 escenas. Hook corto y específico. El guion debe sonar natural en español rioplatense.",
    "Un guion es texto; no digas que el vídeo, voz, imágenes o subtítulos ya fueron generados.",
  ].join("\n");
  const user = {
    task: "Crear un borrador editorial, no publicarlo.",
    brand_id: HPA_BRAND_ID,
    topic: request.topic,
    format: request.format,
    series_id: request.series_id,
    language: request.language,
    desired_duration_seconds: request.desired_duration_seconds,
    sources: sourceSummary,
    final_rules: [
      "Cada source_url de claims debe coincidir exactamente con una URL suministrada.",
      "No inventes fuentes nuevas.",
      "Si no se proporcionaron fuentes, las afirmaciones factuales deben quedar NEEDS_RESEARCH.",
      "Incluí una CTA conversacional sin engagement bait artificial.",
    ],
  };
  return [
    { role: "system", content: system },
    { role: "user", content: JSON.stringify(user) },
  ];
}

function parseJsonOnly(raw) {
  if (typeof raw !== "string") return null;
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  try {
    const parsed = JSON.parse(text);
    return plainObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function normalizeHpaGeneratedDraft(raw, request, { contentId, createdAt } = {}) {
  const modelDraft = typeof raw === "string" ? parseJsonOnly(raw) : raw;
  if (!plainObject(modelDraft)) return { ok: false, status: 502, error: "MODEL_OUTPUT_NOT_JSON_OBJECT" };

  const hook = boundedText(modelDraft.hook, 180);
  const script = boundedText(modelDraft.script, HPA_MAX_SCRIPT_CHARS);
  const caption = boundedText(modelDraft.caption, HPA_MAX_CAPTION_CHARS);
  const cta = boundedText(modelDraft.cta, 300);
  if (!hook || !script || !caption || !cta) {
    return { ok: false, status: 502, error: "MODEL_OUTPUT_MISSING_REQUIRED_FIELDS" };
  }
  if (!Array.isArray(modelDraft.scenes) || modelDraft.scenes.length < 3 || modelDraft.scenes.length > 8) {
    return { ok: false, status: 502, error: "MODEL_SCENES_COUNT_INVALID" };
  }

  const scenes = [];
  for (const scene of modelDraft.scenes) {
    if (!plainObject(scene)) return { ok: false, status: 502, error: "MODEL_SCENE_INVALID" };
    const visualDirection = boundedText(scene.visual_direction, 500);
    const onScreenText = boundedText(scene.on_screen_text, 220);
    const narration = boundedText(scene.narration, 800);
    if (!visualDirection || !onScreenText || !narration) {
      return { ok: false, status: 502, error: "MODEL_SCENE_FIELD_MISSING" };
    }
    scenes.push({ visual_direction: visualDirection, on_screen_text: onScreenText, narration });
  }

  const allowedUrls = new Set(request.sources.map((source) => source.url));
  const claimsInput = Array.isArray(modelDraft.claims) ? modelDraft.claims.slice(0, 20) : [];
  const claims = [];
  for (const claim of claimsInput) {
    if (!plainObject(claim)) return { ok: false, status: 502, error: "MODEL_CLAIM_INVALID" };
    const text = boundedText(claim.text, 600);
    const sourceUrls = Array.isArray(claim.source_urls) ? claim.source_urls.filter((url) => typeof url === "string") : [];
    if (!text || sourceUrls.some((url) => !allowedUrls.has(url))) {
      return { ok: false, status: 502, error: "MODEL_RETURNED_UNVERIFIED_SOURCE" };
    }
    const requested = claim.verification === "SUPPORTED" && sourceUrls.length > 0;
    claims.push({
      text,
      source_urls: [...new Set(sourceUrls)],
      verification: requested ? "NEEDS_REVIEW" : "NEEDS_RESEARCH",
    });
  }

  const hasResearchSources = request.sources.length > 0;
  return {
    ok: true,
    draft: {
      content_id: contentId,
      idempotency_key: request.idempotency_key,
      brand_id: HPA_BRAND_ID,
      series_id: request.series_id,
      format: request.format,
      topic: request.topic,
      language: "es-AR",
      hook,
      script,
      caption,
      cta,
      scenes,
      claims,
      sources: request.sources,
      quality_notes: Array.isArray(modelDraft.quality_notes)
        ? modelDraft.quality_notes.filter((x) => typeof x === "string").slice(0, 10).map((x) => x.slice(0, 300))
        : [],
      research_status: hasResearchSources ? "SOURCES_ATTACHED_NEEDS_FACT_CHECK" : "NEEDS_SOURCES",
      review_status: "DRAFT_NEEDS_REVIEW",
      asset_status: "NOT_RENDERED",
      publication_status: "NOT_PUBLISHED",
      metrics_status: "NOT_AVAILABLE",
      created_at: createdAt,
      updated_at: createdAt,
    },
  };
}

export async function generateHpaDraft({ input, runModel, now = () => new Date().toISOString(), createId = () => crypto.randomUUID() }) {
  const validated = validateHpaGenerationInput(input);
  if (!validated.ok) return validated;
  if (typeof runModel !== "function") return { ok: false, status: 503, error: "MODEL_RUNNER_UNAVAILABLE" };

  const request = validated.value;
  let modelOutput;
  try {
    modelOutput = await runModel(buildHpaPrompt(request), 2400);
  } catch {
    return { ok: false, status: 502, error: "MODEL_GENERATION_FAILED" };
  }
  const normalized = normalizeHpaGeneratedDraft(modelOutput, request, {
    contentId: createId(),
    createdAt: now(),
  });
  if (!normalized.ok) return normalized;
  return { ok: true, draft: normalized.draft };
}

export function reviewHpaDraft(queue, input, now = () => new Date().toISOString()) {
  if (!Array.isArray(queue) || !plainObject(input)) return { ok: false, status: 400, error: "INVALID_REVIEW_REQUEST" };
  const contentId = boundedText(input.content_id, 120);
  const decision = boundedText(input.decision, 40).toUpperCase();
  if (!contentId || !ALLOWED_DECISIONS.has(decision)) {
    return { ok: false, status: 400, error: "REVIEW_DECISION_INVALID" };
  }
  const index = queue.findIndex((item) => item?.content_id === contentId);
  if (index < 0) return { ok: false, status: 404, error: "DRAFT_NOT_FOUND" };

  const current = queue[index];
  if (current.brand_id !== HPA_BRAND_ID) return { ok: false, status: 403, error: "BRAND_NOT_ALLOWED" };
  if (current.review_status !== "DRAFT_NEEDS_REVIEW") {
    return { ok: false, status: 409, error: "DRAFT_ALREADY_REVIEWED" };
  }

  const updated = {
    ...current,
    review_status: decision === "APPROVE_SCRIPT" ? "SCRIPT_APPROVED_ASSET_PENDING" : "REJECTED",
    review_note: boundedText(input.notes, 500) || null,
    updated_at: now(),
  };
  const next = queue.slice();
  next[index] = updated;
  return { ok: true, queue: next, draft: updated };
}
