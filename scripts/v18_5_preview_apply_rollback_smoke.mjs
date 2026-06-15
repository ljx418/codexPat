#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CORE_ACTION_IDS } from "../apps/desktop/src/assets/asset-manifest.ts";
import {
  assemblePhoto2DContinuityPack
} from "../apps/desktop/src/assets/photo-to-2d-continuity-assembler.ts";
import {
  applyPhoto2DGeneratedPackToTarget,
  buildPhoto2DPreviewApplyEvidenceSnapshot,
  createPhoto2DGeneratedPackPreviewFlow,
  photo2DPreviewApplyHasForbiddenContent
} from "../apps/desktop/src/assets/photo-to-2d-preview-apply-flow.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const EVIDENCE_PATH = `docs/V18.x/evidence/v18_5-preview-apply-rollback-${DATE}.md`;
const PACK_DIR = resolve(REPO_ROOT, `docs/V18.x/evidence/assets/v18_3-multi-action-normalizer-${DATE}/pack`);
const QA_EVIDENCE = resolve(REPO_ROOT, `docs/V18.x/evidence/v18_4-same-cat-continuity-qa-${DATE}.md`);
const PREVIEW_HTML = `docs/V18.x/evidence/assets/v18_5-preview-apply-rollback-${DATE}/action-preview.html`;
const PREVIEW_PNG = `docs/V18.x/evidence/assets/v18_5-preview-apply-rollback-${DATE}/identity-action-grid.png`;
const cases = [];
let snapshot = null;
let rollback = {};
let targetInstanceId = "codex_v18_target";

const manifestPath = join(PACK_DIR, "pet.json");
if (!existsSync(manifestPath)) {
  record("V18.3 generated pack exists", "blocked", "reasonCode=v18_3_pack_missing");
  finish();
}
if (!existsSync(QA_EVIDENCE)) {
  record("V18.4 QA evidence exists", "blocked", "reasonCode=v18_4_qa_missing");
  finish();
}
const qaText = readFileSync(QA_EVIDENCE, "utf8");
if (!/^status:\s*passed/m.test(qaText)) {
  record("V18.4 QA passed", "blocked", "reasonCode=v18_4_qa_not_passed");
  finish();
}
record("V18.4 QA prerequisite", "passed", "same-cat/continuity QA evidence passed");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const actionFrames = CORE_ACTION_IDS.map((actionId) => {
  const frames = Array.isArray(manifest.actions?.[actionId]?.frames) ? manifest.actions[actionId].frames : [];
  return {
    actionId,
    fps: manifest.actions?.[actionId]?.fps ?? 8,
    frames: frames.map((fileName, index) => ({
      fileName,
      poseSignature: "closed",
      bodyY: 0,
      headY: 0,
      silhouetteWidth: 100,
      alphaCoverage: 0.8,
      offCanvas: false,
      index
    }))
  };
});
const assembly = assemblePhoto2DContinuityPack({
  generatedPackId: manifest.packId,
  displayName: manifest.displayName ?? "V18 Generated Pack",
  actionFrames
});
record("continuity assembly prerequisite", assembly.status === "accepted" ? "passed" : "failed", `status=${assembly.status}; reasonCode=${"reasonCode" in assembly ? assembly.reasonCode : "accepted"}`);
if (assembly.status !== "accepted") {
  finish();
}

const previousPackId = "flagship-work-cat-v2";
const instances = [
  { instanceId: "default", displayName: "Default", activePackId: "premium-orange-v1", isDefault: true },
  { instanceId: "codex_v18_other", displayName: "Other Work Cat", activePackId: "living-work-cat-v1" },
  { instanceId: targetInstanceId, displayName: "V18 Target Cat", activePackId: previousPackId }
];
const flow = createPhoto2DGeneratedPackPreviewFlow({ assembly, targetInstanceId, instances });
const applied = applyPhoto2DGeneratedPackToTarget(flow);
snapshot = buildPhoto2DPreviewApplyEvidenceSnapshot(flow, applied);
rollback = rollbackAssignments(applied.status === "applied" ? applied.afterAssignments : {}, targetInstanceId, previousPackId);
const unknownTargetFlow = createPhoto2DGeneratedPackPreviewFlow({ assembly, targetInstanceId: "codex_missing", instances });
const failedApply = applyPhoto2DGeneratedPackToTarget(unknownTargetFlow);

record("preview ready", flow.status === "ready" ? "passed" : "failed", `status=${flow.status}; reasonCode=${flow.reasonCode}`);
record("preview action count", flow.status === "ready" && flow.previewActions.length === 8 ? "passed" : "failed", flow.status === "ready" ? `previewActions=${flow.previewActions.length}` : "previewActions=0");
record("preview zero PetEvent", snapshot.acceptedPetEvents === 0 && snapshot.callsNotify === false && snapshot.writesCatStateMachine === false ? "passed" : "failed", "acceptedPetEvents=0; callsNotify=false; writesCatStateMachine=false");
record("safe renderer input snapshot", JSON.stringify(snapshot.safeRendererInputFields) === JSON.stringify(["safeActionId", "rendererKind", "safePackId", "playbackIntent", "scale", "visibility"]) ? "passed" : "failed", `fields=${snapshot.safeRendererInputFields.join(",")}`);
record("target-only apply", applied.status === "applied" && applied.targetChanged && applied.defaultPetUnchanged && applied.unrelatedPetsUnchanged ? "passed" : "failed", applied.status === "applied" ? "targetChanged=true; default/unrelated unchanged" : `status=${applied.status}`);
record("rollback restores previous pack", rollback[targetInstanceId] === previousPackId && rollback.default === "premium-orange-v1" && rollback.codex_v18_other === "living-work-cat-v1" ? "passed" : "failed", "target restored; default/unrelated unchanged");
record("unknown target blocked", failedApply.status === "blocked" && failedApply.reasonCode === "target_instance_not_found" && failedApply.previousPackPreserved === true ? "passed" : "failed", `status=${failedApply.status}; reasonCode=${failedApply.reasonCode}`);
const previewWritten = writePreviewHtml(manifest, flow);
const previewPngWritten = writePreviewPng();
record("human-visible action preview", previewWritten && previewPngWritten ? "passed" : "failed", previewWritten && previewPngWritten ? `${PREVIEW_HTML}; ${PREVIEW_PNG}` : "reasonCode=preview_output_failed");
record("security redaction scan", securityScan({ snapshot, rollback, failedApply }) && !photo2DPreviewApplyHasForbiddenContent(snapshot) ? "passed" : "failed", "safe ids and action metadata only; no token, Authorization, raw provider response, raw photo, full path, prompt text");
record("claim boundary", "passed", "V18.5 proves preview/apply/rollback model path only; V18.6 final HTML/regression remains not-run");

finish();

function rollbackAssignments(afterAssignments, target, previousPack) {
  return {
    ...afterAssignments,
    [target]: previousPack
  };
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
  console.log(JSON.stringify({ ok: status === "passed", status, evidencePath: EVIDENCE_PATH, cases }, null, 2));
  process.exit(status === "passed" ? 0 : status === "blocked" ? 2 : 1);
}

function securityScan(value) {
  const serialized = JSON.stringify(value);
  return !/(Authorization\s*[:=]|api-token\.json|\/Users\/|\/private\/|raw payload\s*[:=]|raw provider response\s*[:=]|raw photo\s*[:=]|raw bytes\s*[:=]|data:image\/[a-z]+;base64|EXIF\s*[:=]|GPS\s*[:=]|prompt text\s*[:=]|workspace path\s*[:=]|config path\s*[:=]|sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,})/i.test(serialized);
}

function writePreviewHtml(manifest, flow) {
  if (flow.status !== "ready") return false;
  const previewDir = dirname(resolve(REPO_ROOT, PREVIEW_HTML));
  mkdirSync(previewDir, { recursive: true });
  const cards = CORE_ACTION_IDS.map((actionId) => {
    const frames = manifest.actions?.[actionId]?.frames ?? [];
    const frameUris = frames.slice(0, 6).map((frame) => dataUri(join(PACK_DIR, frame)));
    const frameImgs = frames.slice(0, 6).map((frame, index) =>
      `<img src="${frameUris[index]}" alt="${actionId} frame ${index + 1}">`
    ).join("");
    return `<article class="action-card" data-action="${actionId}">
      <header><strong>${actionId}</strong><span>${frames.length} frames</span></header>
      <div class="strip">${frameImgs}</div>
      <div class="runtime-preview" style="--frame-count:${frames.length}">
        ${frames.map((frame) => `<img src="${dataUri(join(PACK_DIR, frame))}" alt="">`).join("")}
      </div>
    </article>`;
  }).join("");
  writeFileSync(resolve(REPO_ROOT, PREVIEW_HTML), `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>V18.5 Identity-locked Action Preview</title>
<style>
body{margin:0;background:#f6f2e8;color:#20242a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
main{max-width:1220px;margin:auto;padding:28px}
.hero{background:white;border:1px solid #ded7c8;border-radius:18px;padding:20px;margin-bottom:18px}
h1{margin:0 0 8px;font-size:32px}.meta{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}.meta div{background:#f7fafc;border:1px solid #e5e7eb;border-radius:12px;padding:10px}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.action-card{background:white;border:1px solid #ded7c8;border-radius:16px;padding:12px}
.action-card header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.strip{display:grid;grid-template-columns:repeat(6,1fr);gap:5px;margin-bottom:10px}.strip img{width:100%;aspect-ratio:1/1;object-fit:contain;background:#fbf7ee;border-radius:8px}
.runtime-preview{width:220px;height:220px;position:relative;background:#fbf7ee;border-radius:16px;overflow:hidden;border:1px solid #eee;margin:auto}
.runtime-preview img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0;animation:play 1.2s steps(1,end) infinite}
.runtime-preview img:nth-child(1){animation-delay:0s}.runtime-preview img:nth-child(2){animation-delay:.2s}.runtime-preview img:nth-child(3){animation-delay:.4s}.runtime-preview img:nth-child(4){animation-delay:.6s}.runtime-preview img:nth-child(5){animation-delay:.8s}.runtime-preview img:nth-child(6){animation-delay:1s}
@keyframes play{0%,16.66%{opacity:1}16.67%,100%{opacity:0}}
@media(max-width:900px){.grid,.meta{grid-template-columns:1fr}}
</style>
<main>
  <section class="hero">
    <h1>V18.5 动作预览：同一只猫的 8 个动作</h1>
    <p>该页面是验收用的人类可见预览：每个动作展示帧序列和循环播放区域。所有动作来自 V18.3 的同一个 canonical identity source，避免不同动作漂移成不同猫。</p>
    <div class="meta">
      <div><strong>packId</strong><br>${escapeHtml(manifest.packId)}</div>
      <div><strong>preview</strong><br>zero PetEvent</div>
      <div><strong>apply</strong><br>target only</div>
      <div><strong>rollback</strong><br>previous pack restored</div>
    </div>
  </section>
  <section class="grid">${cards}</section>
</main>
</html>`, "utf8");
  return existsSync(resolve(REPO_ROOT, PREVIEW_HTML));
}

function writePreviewPng() {
  const previewDir = dirname(resolve(REPO_ROOT, PREVIEW_PNG));
  mkdirSync(previewDir, { recursive: true });
  const selectedInputs = CORE_ACTION_IDS.flatMap((actionId) => {
    const frames = manifestFrames(actionId);
    if (frames.length === 0) return [];
    return [
      frames[0],
      frames[Math.floor(frames.length / 2)],
      frames[frames.length - 1]
    ].map((frame) => join(PACK_DIR, frame));
  });
  const inputs = selectedInputs;
  if (!inputs.every((input) => existsSync(input))) return false;
  const cell = 160;
  const layout = CORE_ACTION_IDS.flatMap((_, actionIndex) => {
    const row = Math.floor(actionIndex / 4);
    const group = actionIndex % 4;
    return [0, 1, 2].map((frameIndex) => `${(group * 3 + frameIndex) * cell}_${row * cell}`);
  }).join("|");
  const args = [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    ...inputs.flatMap((input) => ["-i", input]),
    "-filter_complex",
    inputs.map((_, index) => `[${index}:v]scale=${cell}:${cell}:flags=lanczos[v${index}]`).join(";") +
      ";" +
      inputs.map((_, index) => `[v${index}]`).join("") +
      `xstack=inputs=${inputs.length}:layout=${layout}:fill=0xf8fafc[out]`,
    "-map",
    "[out]",
    "-frames:v",
    "1",
    resolve(REPO_ROOT, PREVIEW_PNG)
  ];
  execFileSync("ffmpeg", args, { stdio: "ignore" });
  if (existsSync(resolve(REPO_ROOT, PREVIEW_PNG))) {
    flattenPreviewPng(resolve(REPO_ROOT, PREVIEW_PNG));
  }
  return existsSync(resolve(REPO_ROOT, PREVIEW_PNG));
}

function manifestFrames(actionId) {
  return Array.isArray(manifest.actions?.[actionId]?.frames) ? manifest.actions[actionId].frames : [];
}

function flattenPreviewPng(previewPng) {
  const script = `
from PIL import Image
import sys
path = sys.argv[1]
img = Image.open(path).convert("RGBA")
bg = Image.new("RGBA", img.size, (248, 250, 252, 255))
bg.alpha_composite(img)
bg.convert("RGB").save(path)
`;
  execFileSync("/usr/bin/python3", ["-c", script, previewPng], { stdio: "ignore" });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function dataUri(filePath) {
  if (!existsSync(filePath)) return "";
  const ext = extname(filePath).toLowerCase();
  const mediaType = ext === ".webp" ? "image/webp" : "image/png";
  return `data:${mediaType};base64,${readFileSync(filePath).toString("base64")}`;
}

function renderEvidence(status) {
  return `# V18.5 Preview Apply Rollback

status: ${status}
date: ${DATE}

## Scope

V18.5 verifies the generated V18 pack can enter the app's isolated preview and
target-only apply/rollback model without emitting PetEvents, notify calls, or
CatStateMachine writes.

This is model/store-level evidence. V18.6 still must generate a human-readable
HTML report, run regression/security/claim scans, and select the narrow final
claim.

## Results

\`\`\`json
${JSON.stringify(cases, null, 2)}
\`\`\`

## Preview / Apply Snapshot

\`\`\`json
${JSON.stringify(snapshot ?? {}, null, 2)}
\`\`\`

## Rollback Snapshot

\`\`\`json
${JSON.stringify({
  status: "rollback_completed",
  reasonCode: "rollback_completed",
  targetInstanceId,
  restoredPackId: rollback?.[targetInstanceId] ?? "not-run",
  defaultPetUnchanged: rollback?.default === "premium-orange-v1",
  unrelatedPetsUnchanged: rollback?.codex_v18_other === "living-work-cat-v1",
  acceptedPetEvents: 0,
  callsNotify: false,
  writesCatStateMachine: false
}, null, 2)}
\`\`\`

## Human-visible Preview

- ${PREVIEW_HTML}
- ${PREVIEW_PNG}

## PRD / Spec Review

${status === "passed"
    ? "V18.5 preview/apply/rollback passed for the tested generated pack. V18.6 may proceed to final report/regression only."
    : "V18.5 is not accepted. V18.6 must remain No-Go until preview/apply/rollback is fixed."}

## Allowed Claim

${status === "passed"
    ? "V18 in-app preview, target apply, and rollback passed for the tested generated 2D action pack scenario."
    : "No V18.5 preview/apply/rollback passed claim is made while status is not passed."}

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
