/**
 * ORDER-066 local HPA renderer.
 *
 * This is deliberately NOT imported by the Cloudflare Worker: Workers have no
 * child-process/filesystem/browser-capture runtime. It renders an already
 * script-approved REEL draft on the owner's Windows workstation using the
 * installed Windows speech voice and the existing Chrome CDP endpoint.
 * No external service, API key, install, upload, publish, or deploy is used.
 */
import { createHash, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { open, readFile, writeFile, rename, mkdir, rm, stat, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SCHEMA_VERSION = "hpa-render-receipt-v1";
const REQUESTED_VOICE_LOCALE = "es-AR";
const FRAME_WIDTH = 540;
const FRAME_HEIGHT = 960;
const FRAME_RATE = 24;
const MAX_RENDER_SECONDS = 180;
const EBML_MAGIC = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);

function plainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function validateHpaRenderDraft(draft) {
  if (!plainObject(draft)) return { ok: false, error: "DRAFT_OBJECT_REQUIRED" };
  if (draft.brand_id !== "hombrepsicoactivo") return { ok: false, error: "BRAND_NOT_ALLOWED" };
  if (draft.review_status !== "SCRIPT_APPROVED_ASSET_PENDING") {
    return { ok: false, error: "SCRIPT_APPROVAL_REQUIRED" };
  }
  if (!["NOT_RENDERED", "RENDER_FAILED"].includes(draft.asset_status)) {
    return { ok: false, error: "ASSET_STATE_NOT_RENDERABLE" };
  }
  if (draft.format !== "REEL") return { ok: false, error: "RENDER_FORMAT_NOT_SUPPORTED" };
  if (typeof draft.content_id !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$/.test(draft.content_id)) {
    return { ok: false, error: "CONTENT_ID_INVALID" };
  }
  if (typeof draft.idempotency_key !== "string" || draft.idempotency_key.length < 8 || draft.idempotency_key.length > 120) {
    return { ok: false, error: "IDEMPOTENCY_KEY_INVALID" };
  }
  if (typeof draft.topic !== "string" || !draft.topic.trim() || draft.topic.length > 300) {
    return { ok: false, error: "TOPIC_INVALID" };
  }
  if (typeof draft.hook !== "string" || !draft.hook.trim() || draft.hook.length > 180) {
    return { ok: false, error: "HOOK_INVALID" };
  }
  if (typeof draft.script !== "string" || !draft.script.trim() || draft.script.length > 5000) {
    return { ok: false, error: "SCRIPT_INVALID" };
  }
  if (typeof draft.cta !== "string" || !draft.cta.trim() || draft.cta.length > 300) {
    return { ok: false, error: "CTA_INVALID" };
  }
  if (!Array.isArray(draft.scenes) || draft.scenes.length < 3 || draft.scenes.length > 8) {
    return { ok: false, error: "SCENE_COUNT_INVALID" };
  }
  for (const scene of draft.scenes) {
    if (!plainObject(scene) || !["visual_direction", "on_screen_text", "narration"].every((key) => typeof scene[key] === "string" && scene[key].trim())) {
      return { ok: false, error: "SCENE_FIELDS_INVALID" };
    }
    if (scene.on_screen_text.length > 220 || scene.narration.length > 800 || scene.visual_direction.length > 500) {
      return { ok: false, error: "SCENE_FIELDS_TOO_LONG" };
    }
  }
  return { ok: true, value: draft };
}

export function buildHpaNarration(draft) {
  return [draft.hook, ...draft.scenes.map((scene) => scene.narration), draft.cta]
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function hpaRenderFingerprint(draft) {
  return sha256(JSON.stringify({
    content_id: draft.content_id,
    idempotency_key: draft.idempotency_key,
    brand_id: draft.brand_id,
    format: draft.format,
    topic: draft.topic,
    language: draft.language || REQUESTED_VOICE_LOCALE,
    hook: draft.hook,
    script: draft.script,
    caption: draft.caption || "",
    cta: draft.cta,
    scenes: draft.scenes,
  }));
}

export function isValidWebmContainer(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length <= 4096 || !bytes.subarray(0, 4).equals(EBML_MAGIC)) return false;
  const hasOpus = bytes.includes(Buffer.from("A_OPUS"));
  const hasVideo = bytes.includes(Buffer.from("V_VP8")) || bytes.includes(Buffer.from("V_VP9"));
  return hasOpus && hasVideo;
}

async function exists(filePath) {
  try { await stat(filePath); return true; } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function atomicWriteJson(filePath, value) {
  const tempPath = `${filePath}.${randomUUID()}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  await rename(tempPath, filePath);
}

function runPowerShell(scriptPath, inputPath, wavPath) {
  return new Promise((resolve, reject) => {
    const child = spawn("powershell.exe", [
      "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass",
      "-File", scriptPath, inputPath, wavPath,
    ], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
    const timer = setTimeout(() => child.kill(), 180_000);
    child.once("error", (error) => { clearTimeout(timer); reject(error); });
    child.once("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(`WINDOWS_SPEECH_FAILED:${String(stderr || stdout).slice(-500)}`));
      try {
        const voice = JSON.parse(stdout.trim().split(/\r?\n/).filter(Boolean).at(-1));
        resolve(voice);
      } catch {
        reject(new Error(`WINDOWS_SPEECH_RECEIPT_INVALID:${stdout.slice(-300)}`));
      }
    });
  });
}

const WINDOWS_SPEECH_SCRIPT = String.raw`
param([string]$InputPath, [string]$OutputPath)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.Speech
$request = [System.IO.File]::ReadAllText($InputPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $voices = @($synth.GetInstalledVoices() | Where-Object { $_.Enabled })
  $voice = $voices | Where-Object { $_.VoiceInfo.Culture.Name -eq 'es-AR' } | Select-Object -First 1
  $fallback = $false
  if (-not $voice) {
    $voice = $voices | Where-Object { $_.VoiceInfo.Culture.Name -eq 'es-ES' } | Select-Object -First 1
    $fallback = $true
  }
  if (-not $voice) { throw 'NO_ZERO_COST_SPANISH_VOICE_INSTALLED' }
  $synth.SelectVoice($voice.VoiceInfo.Name)
  $synth.Rate = 0
  $synth.Volume = 100
  $synth.SetOutputToWaveFile($OutputPath)
  $synth.Speak([string]$request.narration)
  $synth.SetOutputToNull()
  [PSCustomObject]@{
    voice_name = $voice.VoiceInfo.Name
    voice_locale = $voice.VoiceInfo.Culture.Name
    requested_locale = 'es-AR'
    accent_fallback = $fallback
    synthesis = 'WINDOWS_SYSTEM_SPEECH'
  } | ConvertTo-Json -Compress
} finally {
  $synth.Dispose()
}
`;

function rendererHtml() {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ATM HPA local renderer</title><style>html,body{margin:0;background:#111;color:#fff;font:16px system-ui}body{display:grid;place-items:center;min-height:100vh}main{padding:20px;text-align:center}canvas{width:270px;height:480px;border:1px solid #444;border-radius:8px}button{display:block;margin:16px auto;padding:12px 24px}</style></head><body><main><canvas id="frame" width="${FRAME_WIDTH}" height="${FRAME_HEIGHT}"></canvas><button id="start">Render local</button><p id="status">Esperando render local</p></main><script>
window.__renderResult=null;window.__renderError=null;
const canvas=document.getElementById('frame'),ctx=canvas.getContext('2d');
function wrapped(text,x,y,maxWidth,lineHeight,maxLines=4){const words=String(text||'').split(/\\s+/);let line='',count=0;for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){ctx.fillText(line,x,y);line=word;y+=lineHeight;count++;if(count>=maxLines-1)break;}else line=test;}if(line){ctx.fillText(line,x,y);}}
function drawFrame(input,t,total){const scenes=input.scenes;const segment=total/scenes.length;const i=Math.min(scenes.length-1,Math.floor(t/segment));const scene=scenes[i];ctx.fillStyle='#101017';ctx.fillRect(0,0,${FRAME_WIDTH},${FRAME_HEIGHT});ctx.fillStyle='#f4c542';ctx.fillRect(44,58,66,8);ctx.fillStyle='#ffffff';ctx.font='bold 22px Arial';ctx.fillText('HOMBREPSICOACTIVO',44,108);ctx.fillStyle='#9999a8';ctx.font='16px Arial';ctx.fillText('BORRADOR EDITORIAL · NO PUBLICADO',44,140);ctx.strokeStyle='#4c4c5b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(420,180,68,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(420,180,42,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#f4c542';ctx.fillRect(44,222,70,6);if(t<Math.min(2,segment)){ctx.fillStyle='#ffffff';ctx.font='bold 43px Arial';wrapped(input.hook,44,310,440,54,5);}else{ctx.fillStyle='#f4c542';ctx.font='bold 18px Arial';ctx.fillText('ESCENA '+String(i+1).padStart(2,'0'),44,290);ctx.fillStyle='#ffffff';ctx.font='bold 39px Arial';wrapped(scene.on_screen_text,44,360,440,49,5);ctx.fillStyle='#b9b9c8';ctx.font='18px Arial';wrapped(scene.visual_direction,44,625,430,26,4);}ctx.fillStyle='#666675';ctx.fillRect(44,850,452,4);ctx.fillStyle='#f4c542';ctx.fillRect(44,850,452*Math.min(1,t/total),4);ctx.fillStyle='#a7a7b4';ctx.font='16px Arial';ctx.fillText('IDEA · CONDUCTA · CULTURA DIGITAL',44,892);ctx.fillStyle='#fff';ctx.font='15px Arial';ctx.fillText('REVISIÓN HUMANA REQUERIDA',44,920);}
async function renderHpaMedia(){const status=document.getElementById('status');status.textContent='Preparando audio y vídeo…';const input=await(await fetch('/input')).json();const wav=await(await fetch('/audio.wav')).arrayBuffer();const audioContext=new AudioContext();await audioContext.resume();const buffer=await audioContext.decodeAudioData(wav);if(buffer.duration>${MAX_RENDER_SECONDS})throw new Error('NARRATION_TOO_LONG');const canvasStream=canvas.captureStream(${FRAME_RATE});const destination=audioContext.createMediaStreamDestination();const source=audioContext.createBufferSource();source.buffer=buffer;source.connect(destination);canvasStream.addTrack(destination.stream.getAudioTracks()[0]);const candidates=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];const mimeType=candidates.find(x=>MediaRecorder.isTypeSupported(x));if(!mimeType)throw new Error('MEDIARECORDER_WEBM_UNAVAILABLE');const recorder=new MediaRecorder(canvasStream,{mimeType,videoBitsPerSecond:1400000,audioBitsPerSecond:96000});const chunks=[];recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};const stopped=new Promise((resolve,reject)=>{recorder.onstop=resolve;recorder.onerror=e=>reject(new Error('MEDIARECORDER_FAILED:'+String(e.error||'')))});const total=Math.max(5,buffer.duration+0.8);const started=performance.now();let raf=0;const tick=()=>{const elapsed=(performance.now()-started)/1000;drawFrame(input,Math.min(elapsed,total),total);if(elapsed<total)raf=requestAnimationFrame(tick)};drawFrame(input,0,total);recorder.start(250);source.start();tick();await new Promise(resolve=>setTimeout(resolve,total*1000));cancelAnimationFrame(raf);recorder.stop();await stopped;source.stop();const blob=new Blob(chunks,{type:recorder.mimeType});if(blob.size<4096)throw new Error('RENDERED_WEBM_TOO_SMALL');const bytes=new Uint8Array(await blob.arrayBuffer());let binary='';for(let offset=0;offset<bytes.length;offset+=32768)binary+=String.fromCharCode(...bytes.subarray(offset,offset+32768));const result={base64:btoa(binary),mime_type:blob.type,bytes:blob.size,duration_seconds:total,width:canvas.width,height:canvas.height,audio_tracks:canvasStream.getAudioTracks().length,video_tracks:canvasStream.getVideoTracks().length,validation:'MEDIARECORDER_BLOB_WITH_VIDEO_AND_AUDIO_TRACKS'};await audioContext.close();canvasStream.getTracks().forEach(track=>track.stop());return result;}
document.getElementById('start').addEventListener('click',()=>{renderHpaMedia().then(result=>{window.__renderResult=result;document.getElementById('status').textContent='Render terminado'}).catch(error=>{window.__renderError=String(error&&error.message||error);document.getElementById('status').textContent='Render fallido'})});
</script></body></html>`;
}

function connectCdp(url) {
  const ws = new WebSocket(url);
  const pending = new Map();
  let nextId = 1;
  const ready = new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  ws.addEventListener("message", (event) => {
    let message;
    try { message = JSON.parse(event.data); } catch { return; }
    if (!message.id || !pending.has(message.id)) return;
    const waiter = pending.get(message.id);
    pending.delete(message.id);
    clearTimeout(waiter.timer);
    if (message.error) waiter.reject(new Error(`CDP_${waiter.method}:${message.error.message || "FAILED"}`));
    else waiter.resolve(message.result || {});
  });
  return {
    ws,
    async ready() { await ready; },
    command(method, params = {}, timeoutMs = 15000) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP_TIMEOUT:${method}`)); }, timeoutMs);
        pending.set(id, { resolve, reject, timer, method });
        ws.send(JSON.stringify({ id, method, params }));
      });
    },
    close() { try { ws.close(); } catch {} },
  };
}

async function evaluate(cdp, expression, { timeoutMs = 15000 } = {}) {
  const result = await cdp.command("Runtime.evaluate", {
    expression, returnByValue: true, userGesture: true,
  }, timeoutMs);
  if (result.exceptionDetails) throw new Error(`BROWSER_EVALUATION_FAILED:${result.exceptionDetails.text || "UNKNOWN"}`);
  return result.result?.value;
}

async function renderInExistingChrome({ cdpUrl, input, wavBytes }) {
  if (typeof WebSocket !== "function") throw new Error("NODE_WEBSOCKET_UNAVAILABLE_USE_NODE_22_OR_NEWER");
  const server = createServer((req, res) => {
    const pathname = new URL(req.url || "/", "http://127.0.0.1").pathname;
    if (pathname === "/render") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" });
      res.end(rendererHtml());
    } else if (pathname === "/input") {
      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      res.end(JSON.stringify({ hook: input.hook, scenes: input.scenes }));
    } else if (pathname === "/audio.wav") {
      res.writeHead(200, { "content-type": "audio/wav", "cache-control": "no-store", "x-content-type-options": "nosniff" });
      res.end(wavBytes);
    } else {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("not found");
    }
  });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const address = server.address();
  const browserInfo = await fetch(`${cdpUrl}/json/version`, { signal: AbortSignal.timeout(3000) }).then((r) => {
    if (!r.ok) throw new Error(`CHROME_CDP_UNAVAILABLE_HTTP_${r.status}`);
    return r.json();
  });
  const browser = connectCdp(browserInfo.webSocketDebuggerUrl);
  let page;
  let targetId;
  try {
    await browser.ready();
    const target = await browser.command("Target.createTarget", { url: "about:blank" });
    targetId = target.targetId;
    const targets = await fetch(`${cdpUrl}/json/list`, { signal: AbortSignal.timeout(3000) }).then((r) => r.json());
    const pageTarget = targets.find((item) => item.id === targetId);
    if (!pageTarget?.webSocketDebuggerUrl) throw new Error("CHROME_RENDER_TARGET_NOT_FOUND");
    page = connectCdp(pageTarget.webSocketDebuggerUrl);
    await page.ready();
    await page.command("Page.enable");
    await page.command("Runtime.enable");
    await page.command("Page.navigate", { url: `http://127.0.0.1:${address.port}/render` });
    let readyState = "";
    const pageDeadline = Date.now() + 15000;
    while (Date.now() < pageDeadline) {
      try { readyState = await evaluate(page, "document.readyState"); } catch {}
      if (readyState === "complete") break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (readyState !== "complete") throw new Error("CHROME_RENDER_PAGE_LOAD_TIMEOUT");
    await page.command("Page.bringToFront");
    const rect = await evaluate(page, "(()=>{const r=document.querySelector('#start').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
    if (!rect || !Number.isFinite(rect.x) || !Number.isFinite(rect.y)) throw new Error("CHROME_RENDER_BUTTON_NOT_FOUND");
    await page.command("Input.dispatchMouseEvent", { type: "mouseMoved", x: rect.x, y: rect.y });
    await page.command("Input.dispatchMouseEvent", { type: "mousePressed", x: rect.x, y: rect.y, button: "left", clickCount: 1 });
    await page.command("Input.dispatchMouseEvent", { type: "mouseReleased", x: rect.x, y: rect.y, button: "left", clickCount: 1 });
    const renderDeadline = Date.now() + (MAX_RENDER_SECONDS + 45) * 1000;
    let state = "WAIT";
    while (Date.now() < renderDeadline) {
      state = await evaluate(page, "window.__renderError ? 'ERROR:' + window.__renderError : window.__renderResult ? 'DONE' : 'WAIT'");
      if (state === "DONE") break;
      if (typeof state === "string" && state.startsWith("ERROR:")) throw new Error(`BROWSER_RENDER_FAILED:${state.slice(6)}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    if (state !== "DONE") throw new Error("BROWSER_RENDER_TIMEOUT");
    const resultJson = await evaluate(page, "JSON.stringify(window.__renderResult)", { timeoutMs: 120000 });
    const result = JSON.parse(resultJson);
    const bytes = Buffer.from(result.base64, "base64");
    if (!isValidWebmContainer(bytes)) throw new Error("WEBM_CONTAINER_VALIDATION_FAILED");
    if (result.width !== FRAME_WIDTH || result.height !== FRAME_HEIGHT || result.audio_tracks !== 1 || result.video_tracks !== 1 || result.validation !== "MEDIARECORDER_BLOB_WITH_VIDEO_AND_AUDIO_TRACKS") {
      throw new Error("WEBM_MEDIA_TRACK_VALIDATION_FAILED");
    }
    return { bytes, metadata: { mime_type: result.mime_type, duration_seconds: result.duration_seconds, width: result.width, height: result.height, audio_tracks: result.audio_tracks, video_tracks: result.video_tracks, browser_validation: result.validation } };
  } finally {
    page?.close();
    if (targetId) {
      try { await browser.command("Target.closeTarget", { targetId }, 5000); } catch {}
    }
    browser.close();
    await new Promise((resolve) => server.close(() => resolve()));
  }
}

async function synthesizeNarration(narration, tempDir) {
  const inputPath = path.join(tempDir, "narration.json");
  const scriptPath = path.join(tempDir, "synthesize.ps1");
  const wavPath = path.join(tempDir, "narration.wav");
  await writeFile(inputPath, JSON.stringify({ narration }), { flag: "wx" });
  await writeFile(scriptPath, WINDOWS_SPEECH_SCRIPT, { flag: "wx" });
  const voice = await runPowerShell(scriptPath, inputPath, wavPath);
  const wavBytes = await readFile(wavPath);
  if (wavBytes.length < 44 || wavBytes.toString("ascii", 0, 4) !== "RIFF" || wavBytes.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error("WINDOWS_SPEECH_WAV_VALIDATION_FAILED");
  }
  return { wavBytes, voice };
}

function validateVideoWithOpenCv(filePath) {
  const python = [
    "import cv2,json,sys",
    "cap=cv2.VideoCapture(sys.argv[1])",
    "if not cap.isOpened(): raise SystemExit('VIDEO_OPEN_FAILED')",
    "ok1,frame1=cap.read()",
    "ok2,frame2=cap.read()",
    "if not ok1 or frame1 is None or not ok2 or frame2 is None: raise SystemExit('VIDEO_TWO_FRAME_DECODE_FAILED')",
    "count=int(cap.get(cv2.CAP_PROP_FRAME_COUNT)); result={'first_frame_decoded':True,'two_frames_decoded':True,'width':int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),'height':int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),'reported_frame_count':count if count>=0 else None,'fps':float(cap.get(cv2.CAP_PROP_FPS)),'fourcc':int(cap.get(cv2.CAP_PROP_FOURCC))}",
    "cap.release()",
    "print(json.dumps(result))",
  ].join("\n");
  return new Promise((resolve, reject) => {
    const child = spawn("python.exe", ["-c", python, filePath], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
    child.once("error", (error) => reject(new Error(`OPENCV_VALIDATOR_UNAVAILABLE:${error.message}`)));
    child.once("close", (code) => {
      if (code !== 0) return reject(new Error(`OPENCV_VIDEO_DECODE_FAILED:${String(stderr || stdout).slice(-300)}`));
      try {
        const metadata = JSON.parse(stdout.trim().split(/\r?\n/).filter(Boolean).at(-1));
        if (!metadata.first_frame_decoded || !metadata.two_frames_decoded || metadata.width !== FRAME_WIDTH || metadata.height !== FRAME_HEIGHT || !(metadata.fps > 0)) {
          return reject(new Error(`OPENCV_VIDEO_METADATA_INVALID:${JSON.stringify(metadata)}`));
        }
        resolve(metadata);
      } catch (error) {
        reject(new Error(`OPENCV_VALIDATION_RECEIPT_INVALID:${error.message}`));
      }
    });
  });
}

export async function renderHpaDraft(draft, { outputDir = path.resolve("artifacts/hpa-render"), cdpUrl = "http://127.0.0.1:9222", now = () => new Date().toISOString() } = {}) {
  const validation = validateHpaRenderDraft(draft);
  if (!validation.ok) return validation;
  const fingerprint = hpaRenderFingerprint(draft);
  const safeId = draft.content_id.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 80);
  const stem = `${safeId}-${fingerprint.slice(0, 16)}`;
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.resolve(outputDir, `${stem}.webm`);
  const manifestPath = path.resolve(outputDir, `${stem}.manifest.json`);
  const lockPath = path.resolve(outputDir, `${stem}.lock`);

  if (await exists(manifestPath)) {
    const prior = JSON.parse(await readFile(manifestPath, "utf8"));
    if (prior.state === "RENDERED") {
      const existing = await readFile(outputPath).catch(() => null);
      if (!existing || !isValidWebmContainer(existing) || existing.length !== prior.artifact?.bytes || sha256(existing) !== prior.artifact?.sha256) {
        return { ok: false, error: "RENDER_RECEIPT_INTEGRITY_FAILED", manifest_path: manifestPath };
      }
      return { ok: true, idempotent_replay: true, output_path: outputPath, manifest_path: manifestPath, artifact: prior.artifact, voice: prior.voice, validation: prior.validation };
    }
  }
  if (await exists(outputPath)) return { ok: false, error: "ORPHAN_ARTIFACT_PRESENT_REFUSING_OVERWRITE", output_path: outputPath };

  let lock;
  try { lock = await open(lockPath, "wx"); }
  catch (error) {
    if (error?.code === "EEXIST") return { ok: false, error: "RENDER_IN_PROGRESS", output_path: outputPath };
    throw error;
  }
  const createdAt = now();
  let manifest = {
    schema_version: SCHEMA_VERSION,
    state: "RENDERING",
    content_id: draft.content_id,
    idempotency_key: draft.idempotency_key,
    request_fingerprint: fingerprint,
    format: draft.format,
    requested_voice_locale: REQUESTED_VOICE_LOCALE,
    created_at: createdAt,
    updated_at: createdAt,
    publication_status: "NOT_PUBLISHED",
    cloudflare_queue_updated: false,
  };
  try {
    await atomicWriteJson(manifestPath, manifest);
    const tempDir = await mkdtemp(path.join(tmpdir(), "atm-hpa-render-"));
    try {
      const narration = buildHpaNarration(draft);
      const { wavBytes, voice } = await synthesizeNarration(narration, tempDir);
      const rendered = await renderInExistingChrome({ cdpUrl, input: draft, wavBytes });
      const artifactHash = sha256(rendered.bytes);
      const tempOutputPath = `${outputPath}.${randomUUID()}.tmp`;
      let videoValidation;
      try {
        await writeFile(tempOutputPath, rendered.bytes, { flag: "wx" });
        if (!isValidWebmContainer(rendered.bytes)) throw new Error("WEBM_CONTAINER_VALIDATION_FAILED");
        videoValidation = await validateVideoWithOpenCv(tempOutputPath);
        await rename(tempOutputPath, outputPath);
      } catch (error) {
        await rm(tempOutputPath, { force: true }).catch(() => {});
        throw error;
      }
      const readback = await readFile(outputPath);
      if (!isValidWebmContainer(readback) || readback.length !== rendered.bytes.length || sha256(readback) !== artifactHash) {
        throw new Error("ARTIFACT_READBACK_INTEGRITY_FAILED");
      }
      manifest = {
        ...manifest,
        state: "RENDERED",
        updated_at: now(),
        artifact: {
          path: outputPath,
          mime_type: rendered.metadata.mime_type,
          bytes: readback.length,
          sha256: artifactHash,
          container: "WEBM",
          media_kind: "KINETIC_TYPOGRAPHY_VIDEO_WITH_VOICEOVER",
        },
        voice: {
          ...voice,
          requested_locale: REQUESTED_VOICE_LOCALE,
          accent_fallback: voice.voice_locale !== REQUESTED_VOICE_LOCALE,
          zero_cost_local: true,
        },
        validation: {
          ...rendered.metadata,
          opencv_video_decode: videoValidation,
          ebml_header_valid: true,
          wav_input_valid: true,
          artifact_sha256_verified: true,
          artifact_readback_verified: true,
        },
        publication_status: "NOT_PUBLISHED",
        cloudflare_queue_updated: false,
      };
      await atomicWriteJson(manifestPath, manifest);
      return { ok: true, idempotent_replay: false, output_path: outputPath, manifest_path: manifestPath, artifact: manifest.artifact, voice: manifest.voice, validation: manifest.validation };
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  } catch (error) {
    manifest = { ...manifest, state: "RENDER_FAILED", updated_at: now(), failure_code: String(error?.message || "RENDER_FAILED").slice(0, 180), publication_status: "NOT_PUBLISHED", cloudflare_queue_updated: false };
    await atomicWriteJson(manifestPath, manifest).catch(() => {});
    return { ok: false, error: manifest.failure_code, manifest_path: manifestPath };
  } finally {
    await lock?.close().catch(() => {});
    await rm(lockPath, { force: true }).catch(() => {});
  }
}

async function main() {
  const [draftPath, outputDir] = process.argv.slice(2);
  if (!draftPath || draftPath === "--help") {
    console.log("Usage: node scripts/hpa-render-adapter.mjs <approved-draft.json> [output-directory]");
    console.log("Requires an already-running Chrome CDP endpoint at 127.0.0.1:9222 and a free installed Windows Spanish voice.");
    console.log("Renders only SCRIPT_APPROVED_ASSET_PENDING REEL drafts; does not update Cloudflare or publish content.");
    return;
  }
  const draft = JSON.parse(await readFile(path.resolve(draftPath), "utf8"));
  const result = await renderHpaDraft(draft, { outputDir: outputDir ? path.resolve(outputDir) : path.resolve("artifacts/hpa-render") });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(String(error?.message || error)); process.exitCode = 1; });
}
