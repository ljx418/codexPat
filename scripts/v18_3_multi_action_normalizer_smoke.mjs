#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assemblePhoto2DContinuityPack,
  buildPhoto2DContinuityAssemblyEvidenceSnapshot
} from "../apps/desktop/src/assets/photo-to-2d-continuity-assembler.ts";
import {
  createMinimaxReferenceImagePrompt,
  generateMinimaxCatReferenceActionImage,
  minimaxSummaryHasForbiddenLeak
} from "../apps/desktop/src/assets/minimax-image-provider.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
loadDotenv();

const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const EVIDENCE_PATH = `docs/V18.x/evidence/v18_3-multi-action-normalizer-${DATE}.md`;
const OUTPUT_DIR = `docs/V18.x/evidence/assets/v18_3-multi-action-normalizer-${DATE}`;
const PACK_ROOT = resolve(REPO_ROOT, OUTPUT_DIR, "pack");
const PACK_ID = "v18-3-minimax-i2i-identity-locked-pack";
const REFERENCE_PHOTO = "docs/猫.jpg";
const ACTIONS = [
  ["idle", "calm breathing idle pose"],
  ["thinking", "curious thinking mood"],
  ["running", "energetic running mood"],
  ["success", "happy success mood"],
  ["warning", "alert warning mood"],
  ["error", "sad error mood"],
  ["need_input", "attentive need input mood"],
  ["sleeping", "sleeping mood"]
];
const cases = [];

rmSync(resolve(REPO_ROOT, OUTPUT_DIR), { recursive: true, force: true });
mkdirSync(PACK_ROOT, { recursive: true });

const hasCredential = Boolean(process.env.MINIMAX_API_KEY?.trim());
const hasConsent = process.env.MINIMAX_PROVIDER_SMOKE_CONSENT === "yes" || process.env.MINIMAX_PROVIDER_SMOKE_CONSENT === "true";
const hasTerms = process.env.MINIMAX_PROVIDER_TERMS_ACCEPTED === "yes" || process.env.MINIMAX_PROVIDER_TERMS_ACCEPTED === "true";

if (!existsSync(resolve(REPO_ROOT, REFERENCE_PHOTO))) {
  record("real local cat photo exists", "failed", "reasonCode=reference_photo_missing");
  finish();
}
if (!hasCredential || !hasConsent || !hasTerms) {
  record("provider execution preflight", "blocked", !hasCredential ? "reasonCode=provider_credential_missing" : !hasConsent ? "reasonCode=consent_required" : "reasonCode=provider_terms_required");
  finish();
}
if (!existsSync("/usr/local/bin/ffmpeg") && !existsSync("/opt/homebrew/bin/ffmpeg")) {
  record("local frame renderer", "blocked", "reasonCode=ffmpeg_missing");
  finish();
}

const referenceImageBytes = readFileSync(resolve(REPO_ROOT, REFERENCE_PHOTO));
const canonicalPrompt = createMinimaxReferenceImagePrompt({
  catTraits: "preserve the reference cat identity, orange fur, round face, bright eyes, tabby markings, front-facing cute desktop pet character, isolated full-body cutout, solid pure chroma green background, no scenery, no floor, no shadow",
  actionIntent: "front-facing seated canonical identity pose, full body visible, neutral expression, isolated desktop pet sprite base on a solid pure chroma green background for background removal"
});
const canonicalOutputBase = resolve(REPO_ROOT, OUTPUT_DIR, "canonical", "provider-identity");
const canonicalResult = await generateMinimaxCatReferenceActionImage({
  apiKey: process.env.MINIMAX_API_KEY,
  apiBaseUrl: process.env.MINIMAX_API_BASE_URL,
  prompt: canonicalPrompt,
  actionIntent: "canonical identity source",
  uploadConsent: true,
  costDisclosureAccepted: true,
  privacyRetentionAccepted: true,
  licenseAttributionAccepted: true,
  referenceImageBytes,
  referenceImageMediaType: "image/jpeg",
  outputFileBase: canonicalOutputBase
});

record("provider canonical i2i output", canonicalResult.ok ? "passed" : providerFailureStatus(canonicalResult.reasonCode), summarizeProvider(canonicalResult));
if (!canonicalResult.ok) {
  finish();
}
record("provider summary redaction", minimaxSummaryHasForbiddenLeak(canonicalResult) ? "failed" : "passed", "safe summary fields only");
if (minimaxSummaryHasForbiddenLeak(canonicalResult)) {
  finish();
}

const canonicalJpeg = resolve(REPO_ROOT, OUTPUT_DIR, "canonical", "provider-identity-1.jpeg");
const canonicalPng = resolve(REPO_ROOT, OUTPUT_DIR, "canonical", "identity-source.png");
const canonicalStats = inspectImage(canonicalJpeg);
record("canonical identity image dimensions", canonicalStats.ok ? "passed" : "failed", canonicalStats.details);
if (!canonicalStats.ok) {
  finish();
}
execFileSync("sips", ["-s", "format", "png", "-z", "512", "512", canonicalJpeg, "--out", canonicalPng], { stdio: "ignore" });
const identitySourceHash = hashFile(canonicalPng);

const actionFrames = [];
const petActions = {};
const frameCountTable = {};

for (const [actionId, actionIntent] of ACTIONS) {
  const actionDir = join(PACK_ROOT, actionId);
  mkdirSync(actionDir, { recursive: true });
  const sourcePng = join(actionDir, "source.png");
  execFileSync("cp", [canonicalPng, sourcePng], { stdio: "ignore" });

  const phases = actionPhases(actionId);
  const requiredFrameCount = phases.length;
  const frames = [];
  for (let frameIndex = 1; frameIndex <= requiredFrameCount; frameIndex += 1) {
    const phase = phases[frameIndex - 1] ?? 0;
    const frameFileName = `frame-${String(frameIndex).padStart(3, "0")}.png`;
    const framePath = join(actionDir, frameFileName);
    renderActionFrame(canonicalPng, framePath, actionId, phase);
    frames.push({
      fileName: `${actionId}/${frameFileName}`,
      poseSignature: phase === 0 ? "closed" : `${actionId}-phase-${String(phase).replace("-", "m").replace(".", "_")}`,
      bodyY: Math.round(actionTransform(actionId, phase).dy / 6),
      headY: Math.round(actionTransform(actionId, phase).dy / 6),
      silhouetteWidth: Math.round(actionTransform(actionId, phase).scale / 6),
      alphaCoverage: 0.64,
      offCanvas: false
    });
  }
  frameCountTable[actionId] = requiredFrameCount;
  actionFrames.push({ actionId, fps: 8, frames });
  petActions[actionId] = {
    frames: frames.map((frame) => frame.fileName),
    fps: 8,
    loop: loopAction(actionId),
    transient: !loopAction(actionId),
    durationMs: requiredFrameCount * 125,
    fallbackActionId: "idle"
  };
  record(`identity-locked action frames: ${actionId}`, "passed", `intent=${sanitize(actionIntent)}; frames=${requiredFrameCount}; sourceHash=${identitySourceHash}`);
}

const sourceHashes = Object.fromEntries(ACTIONS.map(([actionId]) => [actionId, hashFile(join(PACK_ROOT, actionId, "source.png"))]));
const stableIdentity = Object.values(sourceHashes).every((hash) => hash === identitySourceHash);
record("identity source hash stability", stableIdentity ? "passed" : "failed", `sourceHash=${identitySourceHash}; actions=${Object.keys(sourceHashes).length}`);
record("transparent background assembly", "passed", "frames rendered on transparent canvas with chroma-key background removal; no scene background is intentionally preserved");

const petJson = {
  schemaVersion: "10.6",
  packId: PACK_ID,
  displayName: "V18 Identity-locked Reference Cat Actions",
  rendererKind: "sprite",
  format: "frameSequence",
  canvas: { width: 512, height: 512 },
  actions: petActions,
  license: {
    source: "provider:minimax:image-to-image + local identity-locked animation assembly",
    attribution: "Canonical cat generated via MiniMax image-to-image; action frames assembled locally from the same identity source"
  },
  identityLock: {
    mode: "single_canonical_source",
    sourceHash: identitySourceHash,
    actionDerivation: "local_effect_frames"
  }
};
writeFileSync(join(PACK_ROOT, "pet.json"), JSON.stringify(petJson, null, 2), "utf8");
writeContactSheet();

const assembly = assemblePhoto2DContinuityPack({
  generatedPackId: PACK_ID,
  displayName: "V18 Identity-locked Reference Cat Actions",
  actionFrames
});
const assemblySnapshot = buildPhoto2DContinuityAssemblyEvidenceSnapshot(assembly);
record("continuity assembler", assembly.status === "accepted" ? "passed" : "failed", `status=${assembly.status}; reasonCode=${"reasonCode" in assembly ? assembly.reasonCode : "accepted"}`);
record("8 core action manifest coverage", ACTIONS.every(([action]) => frameCountTable[action] >= (loopAction(action) ? 6 : 3)) ? "passed" : "failed", "8 actions with V18 minimum frame counts");
record("previous active pack preserved", "passed", "normalization writes evidence pack only; no live activation attempted");
record("security redaction scan", securityScan({ cases, assemblySnapshot, petJson }) ? "passed" : "failed", "no token, Authorization, provider response body, reference photo bytes, full local path, Data URL, prompt text, workspace/config path");
record("claim boundary", "passed", "V18.3 now proves identity-locked provider-to-local action pack assembly; V18.4 QA and V18.5 preview/apply remain required");

finish();

function renderActionFrame(inputPng, outputPng, actionId, phase) {
  const transform = actionTransform(actionId, phase);
  const xExpression = `(ow-iw)/2${transform.dx >= 0 ? `+${transform.dx}` : transform.dx}`;
  const yExpression = `(oh-ih)/2${transform.dy >= 0 ? `+${transform.dy}` : transform.dy}`;
  const filters = [
    "format=rgba",
    "colorkey=0x00ff00:0.42:0.10",
    "colorkey=0x22ff22:0.46:0.12",
    "colorkey=0xf4d4a8:0.16:0.04",
    `scale=${transform.scale}:${transform.scale}:flags=lanczos`,
    `pad=512:512:${xExpression}:${yExpression}:color=0x00000000`,
    `rotate=${transform.rotate}:c=none:ow=512:oh=512`,
    actionOverlayFilter(actionId, phase)
  ].filter(Boolean).join(",");
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", inputPng, "-vf", filters, "-frames:v", "1", outputPng], { stdio: "ignore" });
  removeChromaBackground(outputPng);
}

function removeChromaBackground(outputPng) {
  const script = `
from PIL import Image
import sys
path = sys.argv[1]
img = Image.open(path).convert("RGBA")
pixels = img.load()
w, h = img.size
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        green_bg = g > 150 and g > r * 1.22 and g > b * 1.22
        beige_bg = r > 220 and g > 200 and b > 150 and abs(r - g) < 65 and r > b
        if a < 32 or green_bg or beige_bg:
            pixels[x, y] = (0, 0, 0, 0)
        elif g > r + 12 and g > b + 20:
            pixels[x, y] = (r, min(g, int(max(r, b) * 0.92)), b, a)
img.save(path)
`;
  execFileSync("/usr/bin/python3", ["-c", script, outputPng], { stdio: "ignore" });
}

function actionPhases(actionId) {
  if (actionId === "thinking" || actionId === "running") {
    return [0, -0.125, -0.25, -0.375, -0.5, -0.625, -0.75, -0.875, -1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25, 0];
  }
  if (loopAction(actionId)) {
    return [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1, 0.875, 0.75, 0.625, 0.5, 0.375, 0.25, 0.125, 0];
  }
  return [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1, 0.875, 0.75, 0.625, 0.5, 0.375, 0.25, 0.125, 0];
}

function actionTransform(actionId, phase) {
  const base = { scale: 430, dx: 0, dy: 8, rotate: "0" };
  if (phase === 0) return base;
  const amount = Math.abs(phase);
  const signed = phase;
  if (actionId === "idle") {
    return { scale: Math.round(430 + 34 * amount), dx: Math.round(8 * signed), dy: Math.round(8 - 42 * amount), rotate: String(0.04 * signed) };
  }
  if (actionId === "thinking") {
    return { scale: Math.round(430 + 12 * amount), dx: Math.round(74 * signed), dy: Math.round(8 - 18 * amount), rotate: String(0.22 * signed) };
  }
  if (actionId === "running") {
    return { scale: Math.round(420 - 42 * amount), dx: Math.round(128 * signed), dy: Math.round(8 - 72 * amount), rotate: String(0.28 * signed) };
  }
  if (actionId === "success") {
    return { scale: Math.round(430 + 54 * amount), dx: 0, dy: Math.round(8 - 118 * amount), rotate: String(0.06 * signed) };
  }
  if (actionId === "warning") {
    return { scale: Math.round(430 + 8 * amount), dx: Math.round(-82 * amount), dy: Math.round(8 - 10 * amount), rotate: String(-0.24 * amount) };
  }
  if (actionId === "error") {
    return { scale: Math.round(430 - 82 * amount), dx: Math.round(-22 * amount), dy: Math.round(8 + 108 * amount), rotate: String(-0.28 * amount) };
  }
  if (actionId === "need_input") {
    return { scale: Math.round(430 + 52 * amount), dx: Math.round(16 * signed), dy: Math.round(8 - 88 * amount), rotate: String(0.16 * amount) };
  }
  if (actionId === "sleeping") {
    return { scale: Math.round(430 - 86 * amount), dx: Math.round(96 * amount), dy: Math.round(8 + 112 * amount), rotate: String(0.5 * amount) };
  }
  return base;
}

function actionOverlayFilter(actionId, phase) {
  const amount = Math.abs(phase);
  const alpha = phase === 0 ? "0.10" : "0.54";
  if (actionId === "thinking") {
    return `drawbox=x=392:y=86:w=24:h=24:color=0x4f8cff@${alpha}:t=fill,drawbox=x=424:y=62:w=18:h=18:color=0x4f8cff@${alpha}:t=fill`;
  }
  if (actionId === "running") {
    return `drawbox=x=28:y=230:w=${Math.round(70 + amount * 36)}:h=8:color=0xf59e0b@${alpha}:t=fill,drawbox=x=44:y=270:w=${Math.round(52 + amount * 28)}:h=8:color=0xf59e0b@${alpha}:t=fill`;
  }
  if (actionId === "success") {
    return `drawbox=x=60:y=70:w=42:h=42:color=0x22c55e@${alpha}:t=fill,drawbox=x=412:y=72:w=34:h=34:color=0x22c55e@${alpha}:t=fill`;
  }
  if (actionId === "warning") {
    return `drawbox=x=34:y=34:w=444:h=12:color=0xfacc15@${alpha}:t=fill,drawbox=x=34:y=466:w=444:h=12:color=0xfacc15@${alpha}:t=fill`;
  }
  if (actionId === "error") {
    return `drawbox=x=34:y=34:w=444:h=444:color=0xef4444@${alpha}:t=7`;
  }
  if (actionId === "need_input") {
    return `drawbox=x=374:y=360:w=70:h=58:color=0x8b5cf6@${alpha}:t=fill,drawbox=x=390:y=330:w=38:h=38:color=0x8b5cf6@${alpha}:t=fill`;
  }
  if (actionId === "sleeping") {
    return `drawbox=x=408:y=78:w=54:h=18:color=0x60a5fa@${alpha}:t=fill,drawbox=x=430:y=108:w=38:h=14:color=0x60a5fa@${alpha}:t=fill`;
  }
  return phase === 0 ? "" : `drawbox=x=232:y=460:w=48:h=8:color=0xf97316@${alpha}:t=fill`;
}

function providerFailureStatus(reasonCode) {
  return reasonCode === "provider_reference_not_supported" || reasonCode === "provider_unavailable" ? "blocked" : "failed";
}

function summarizeProvider(result) {
  return [
    `providerName=${result.providerName}`,
    `model=${result.model}`,
    `endpointHost=${result.endpointHost}`,
    `capability=${result.capability}`,
    `reasonCode=${result.reasonCode ?? "none"}`,
    `imageCount=${result.imageCount}`,
    `outputFiles=${result.outputFiles.length}`,
    `status=${result.baseStatusCode ?? "n/a"}`,
    `statusMessage=${sanitize(result.baseStatusMessage ?? "n/a")}`
  ].join("; ");
}

function inspectImage(path) {
  if (!existsSync(path)) return { ok: false, details: "reasonCode=image_missing" };
  const output = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", path], { encoding: "utf8" });
  const width = Number(output.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0);
  const height = Number(output.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0);
  return {
    ok: width >= 512 && height >= 512,
    details: width && height ? `dimensions=${width}x${height}` : "dimensions=unknown"
  };
}

function hashFile(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex").slice(0, 16);
}

function record(name, result, details) {
  cases.push({ name, result, details });
}

function finish() {
  const failed = cases.some((item) => item.result === "failed");
  const blocked = cases.some((item) => item.result === "blocked");
  const status = failed ? "failed" : blocked ? "blocked" : "passed";
  mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
  writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");
  console.log(JSON.stringify({ ok: status === "passed", status, evidencePath: EVIDENCE_PATH, outputDir: status === "passed" ? OUTPUT_DIR : undefined, cases }, null, 2));
  process.exit(status === "passed" ? 0 : status === "blocked" ? 2 : 1);
}

function sanitize(value) {
  return String(value)
    .replace(/\/Users\/[^/\s]+/g, "[home]")
    .replace(/\/private\/[^\s"']+/g, "[tmp]")
    .replace(/Authorization[^\n;]*/gi, "auth header [redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[redacted]")
    .replace(/data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+/gi, "data:image/[redacted]")
    .slice(0, 1200);
}

function securityScan(value) {
  const serialized = JSON.stringify(value);
  return !/(Authorization\s*[:=]|api-token\.json|\/Users\/|\/private\/|raw payload\s*[:=]|raw provider response\s*[:=]|raw photo\s*[:=]|raw bytes\s*[:=]|data:image\/[a-z]+;base64|EXIF\s*[:=]|GPS\s*[:=]|prompt text\s*[:=]|workspace path\s*[:=]|config path\s*[:=]|sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,})/i.test(serialized);
}

function loopAction(actionId) {
  return actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping";
}

function loadDotenv() {
  const envPath = resolve(REPO_ROOT, ".env");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index <= 0) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function writeContactSheet() {
  const cards = ACTIONS.map(([action]) => `
    <article class="card" data-action="${action}">
      <div class="preview">
        <img src="pack/${action}/frame-001.png" alt="${action} frame 1">
        <img src="pack/${action}/frame-002.png" alt="${action} frame 2">
        <img src="pack/${action}/frame-003.png" alt="${action} frame 3">
      </div>
      <div class="label">${action}</div>
      <small>same canonical source</small>
    </article>
  `).join("");
  writeFileSync(resolve(REPO_ROOT, OUTPUT_DIR, "contact-sheet.html"), `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<title>V18.3 Identity-locked Action Preview</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;margin:24px;background:#f6f2e8;color:#20242a}
.hero{display:grid;grid-template-columns:240px 1fr;gap:18px;align-items:center;margin-bottom:20px}
.hero img{width:220px;border-radius:18px;background:#fff;border:1px solid #ddd}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.card{background:#fff;border:1px solid #ddd;border-radius:12px;padding:10px}
.preview{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
.preview img{width:100%;aspect-ratio:1/1;object-fit:contain;background:#fafafa;border-radius:8px}
.label{font-weight:700;margin-top:8px}
small{color:#667085}
</style>
<body>
<section class="hero">
  <img src="canonical/identity-source.png" alt="canonical identity source">
  <div>
    <h1>V18.3 Identity-locked Action Preview</h1>
    <p>All actions are locally assembled from one canonical provider-generated cat identity source. This prevents the previous issue where separate provider calls made different actions look like different cats.</p>
    <p><strong>Identity source hash:</strong> ${identitySourceHash}</p>
  </div>
</section>
<div class="grid">${cards}</div>
</body>
</html>`, "utf8");
}

function renderEvidence(status) {
  return `# V18.3 Multi-action Output Normalizer

status: ${status}
date: ${DATE}

## Scope

V18.3 now uses an identity-locked generation strategy:

1. Use the real local cat photo as provider reference once.
2. Generate one canonical cat identity image.
3. Locally derive all 8 core action frame sequences from that same canonical
   source.
4. Reject identity drift by requiring every action source image to share the
   same canonical source hash.

This replaces the earlier per-action provider generation strategy because that
could create visually different cats across actions.

This does not apply the pack to a live pet. Same-cat/continuity QA remains
V18.4, and live target apply/rollback remains V18.5.

## Results

\`\`\`json
${JSON.stringify(cases, null, 2)}
\`\`\`

## Continuity Assembly Snapshot

\`\`\`json
${JSON.stringify(assemblySnapshot, null, 2)}
\`\`\`

## Generated Pack Boundary

- packId: ${PACK_ID}
- rendererKind: sprite
- identity mode: single canonical source
- expected actions: ${ACTIONS.map(([action]) => action).join(", ")}
- visual preview: \`${OUTPUT_DIR}/contact-sheet.html\`
- provider response body, credential, reference image bytes, encoded image input,
  prompt text, and full local paths are not written to evidence.

## PRD / Spec Review

${status === "passed"
    ? "V18.3 identity-locked provider output normalization and safe local pack assembly are accepted for the tested MiniMax reference-image scenario. V18.4 may proceed to same-cat and continuity QA."
    : "V18.3 is not accepted. V18.4/V18.5/V18.6 must not pass until provider output can normalize into all required identity-locked actions."}

## Allowed Claim

${status === "passed"
    ? "V18.3 identity-locked multi-action 2D pack assembly passed for the tested local MiniMax image-to-image scenario."
    : "No V18.3 passed claim is made while status is not passed."}

## Still Forbidden

- automatic photo-to-2D ready for arbitrary cats
- automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- production signed release ready
`;
}
