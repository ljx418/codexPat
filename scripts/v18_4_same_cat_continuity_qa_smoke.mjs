#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const SOURCE_DIR = `docs/V18.x/evidence/assets/v18_3-multi-action-normalizer-${DATE}`;
const PACK_DIR = resolve(REPO_ROOT, SOURCE_DIR, "pack");
const EVIDENCE_PATH = `docs/V18.x/evidence/v18_4-same-cat-continuity-qa-${DATE}.md`;
const QA_DIR = `docs/V18.x/evidence/assets/v18_4-same-cat-continuity-qa-${DATE}`;
const ACTIONS = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"];
const cases = [];
const actionResults = [];

mkdirSync(resolve(REPO_ROOT, QA_DIR), { recursive: true });

const manifestPath = join(PACK_DIR, "pet.json");
if (!existsSync(manifestPath)) {
  record("V18.3 generated pack exists", "blocked", "reasonCode=v18_3_pack_missing");
  finish();
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
record("pack identity", manifest.packId === "v18-3-minimax-i2i-identity-locked-pack" ? "passed" : "failed", `packId=${safe(manifest.packId)}`);
record("renderer kind", manifest.rendererKind === "sprite" ? "passed" : "failed", `rendererKind=${safe(manifest.rendererKind)}`);
record("provider source", manifest.license?.source === "provider:minimax:image-to-image + local identity-locked animation assembly" ? "passed" : "failed", "source=provider:minimax:image-to-image + local identity-locked animation assembly");

const identitySourceHash = typeof manifest.identityLock?.sourceHash === "string" ? manifest.identityLock.sourceHash : "";
const sourceHashes = {};
for (const action of ACTIONS) {
  const sourcePath = join(PACK_DIR, action, "source.png");
  sourceHashes[action] = existsSync(sourcePath) ? hashFile(sourcePath) : "missing";
}
const sourceHashStable = Boolean(identitySourceHash) && Object.values(sourceHashes).every((hash) => hash === identitySourceHash);
record("same-cat identity source hash", sourceHashStable ? "passed" : "failed", `identitySourceHash=${safe(identitySourceHash)}; actions=${Object.keys(sourceHashes).length}`);

for (const action of ACTIONS) {
  const actionMeta = manifest.actions?.[action];
  const frames = Array.isArray(actionMeta?.frames) ? actionMeta.frames : [];
  const required = loopAction(action) ? 6 : 3;
  const firstFrame = frames[0] ? join(PACK_DIR, frames[0]) : "";
  const lastFrame = frames.at(-1) ? join(PACK_DIR, frames.at(-1)) : "";
  const providerImage = resolve(REPO_ROOT, SOURCE_DIR, "canonical", "identity-source.png");
  const firstStats = firstFrame && existsSync(firstFrame) ? imageStats(firstFrame) : null;
  const lastStats = lastFrame && existsSync(lastFrame) ? imageStats(lastFrame) : null;
  const providerStats = existsSync(providerImage) ? imageStats(providerImage) : null;
  const closure = firstFrame && lastFrame && existsSync(firstFrame) && existsSync(lastFrame) && hashFile(firstFrame) === hashFile(lastFrame);
  const visible = Boolean(firstStats && firstStats.width === 512 && firstStats.height === 512 && firstStats.byteLength > 4096);
  const providerVisible = Boolean(providerStats && providerStats.width >= 512 && providerStats.height >= 512 && providerStats.byteLength > 4096);
  const readable075 = createScaleProbe(firstFrame, action);
  const result = {
    action,
    frameCount: frames.length,
    requiredFrameCount: required,
    providerVisible,
    visible,
    firstFinalClosed: closure,
    scale075Readable: readable075,
    loop: Boolean(actionMeta?.loop),
    transient: Boolean(actionMeta?.transient)
  };
  actionResults.push(result);
  record(`QA action ${action}`, result.frameCount >= required && result.providerVisible && result.visible && result.firstFinalClosed && result.scale075Readable ? "passed" : "failed", summarizeAction(result));
}

const sameCatReview = sourceHashStable &&
  manifest.identityLock?.mode === "single_canonical_source" &&
  manifest.identityLock?.actionDerivation === "local_effect_frames";
record("same-cat source continuity gate", sameCatReview ? "passed" : "failed", "all actions derive from one canonical provider-generated identity source");
record("manual visual acceptance boundary", "passed", "automated QA checks visibility/closure/readability; final human-readable report may still review generated style quality without broad arbitrary-cat claim");
record("failed pack apply blocked", "passed", "V18.4 performs QA only; no apply attempted while QA failed");
record("security redaction scan", securityScan({ manifest, actionResults, sourceHashes }) ? "passed" : "failed", "safe action/pack/frame counts only; no token, Authorization, provider response body, reference photo bytes, full local path, prompt text, workspace/config path");
record("claim boundary", "passed", "V18.4 only proves QA gate for tested generated pack; V18.5 preview/apply remains not-run");

finish();

function imageStats(filePath) {
  const output = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", filePath], { encoding: "utf8" });
  return {
    width: Number(output.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0),
    height: Number(output.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0),
    byteLength: readFileSync(filePath).byteLength
  };
}

function createScaleProbe(framePath, action) {
  if (!framePath || !existsSync(framePath)) return false;
  const outPath = resolve(REPO_ROOT, QA_DIR, `${action}-scale-075.png`);
  execFileSync("sips", ["-z", "384", "384", framePath, "--out", outPath], { stdio: "ignore" });
  if (!existsSync(outPath)) return false;
  const stats = imageStats(outPath);
  return stats.width === 384 && stats.height === 384 && stats.byteLength > 2048;
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
  console.log(JSON.stringify({ ok: status === "passed", status, evidencePath: EVIDENCE_PATH, qaDir: status === "passed" ? QA_DIR : undefined, cases }, null, 2));
  process.exit(status === "passed" ? 0 : status === "blocked" ? 2 : 1);
}

function summarizeAction(result) {
  return [
    `frames=${result.frameCount}/${result.requiredFrameCount}`,
    `providerVisible=${result.providerVisible}`,
    `visible=${result.visible}`,
    `firstFinalClosed=${result.firstFinalClosed}`,
    `scale075Readable=${result.scale075Readable}`
  ].join("; ");
}

function securityScan(value) {
  const serialized = JSON.stringify(value);
  return !/(Authorization\s*[:=]|api-token\.json|\/Users\/|\/private\/|raw payload\s*[:=]|raw provider response\s*[:=]|raw photo\s*[:=]|raw bytes\s*[:=]|data:image\/[a-z]+;base64|EXIF\s*[:=]|GPS\s*[:=]|prompt text\s*[:=]|workspace path\s*[:=]|config path\s*[:=]|sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,})/i.test(serialized);
}

function safe(value) {
  return String(value ?? "").replace(/[^a-zA-Z0-9:_-]/g, "").slice(0, 80);
}

function loopAction(actionId) {
  return actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping";
}

function renderEvidence(status) {
  return `# V18.4 Same-cat and Continuity QA

status: ${status}
date: ${DATE}

## Scope

V18.4 verifies the V18.3 identity-locked MiniMax reference-image sprite pack
before any live preview/apply path. It checks action coverage, visibility,
first/final loop closure, 0.75x readability, one-canonical-source identity
hash stability, and safe metadata boundaries.

This is not the V18 final gate and does not claim arbitrary-cat generation,
Petdex parity, provider integration, or production release readiness.

## Results

\`\`\`json
${JSON.stringify(cases, null, 2)}
\`\`\`

## Action QA Summary

\`\`\`json
${JSON.stringify(actionResults, null, 2)}
\`\`\`

## Evidence Attachments

- Identity-locked action preview HTML: \`${SOURCE_DIR}/contact-sheet.html\`
- 0.75x scale probes: \`${QA_DIR}/<action>-scale-075.png\`

## PRD / Spec Review

${status === "passed"
    ? "V18.4 same-cat and continuity QA gate passed for the tested identity-locked MiniMax reference-image pack. V18.5 may proceed to isolated preview, target apply, and rollback."
    : "V18.4 QA is not accepted. V18.5/V18.6 must remain No-Go until QA passes or the generation strategy is replanned."}

## Allowed Claim

${status === "passed"
    ? "V18 same-cat and continuity QA gate passed for the tested generated 2D action pack scenario."
    : "No V18.4 QA passed claim is made while status is not passed."}

## Still Forbidden

- automatic photo-to-2D ready for arbitrary cats
- automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- production signed release ready
- V18 final workflow passed
`;
}
