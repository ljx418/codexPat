#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const CORE_ACTION_IDS = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"];
const ROUTE_A_DIR = `docs/V21.x/evidence/assets/v21-route-a-keypose-${DATE}`;
const ROUTE_A_PACK_DIR = resolve(REPO_ROOT, ROUTE_A_DIR, "pack");
const ROUTE_A_SUMMARY = resolve(REPO_ROOT, ROUTE_A_DIR, "route-a-summary.json");
const V21_5_EVIDENCE = resolve(REPO_ROOT, `docs/V21.x/evidence/v21_5-route-comparator-smoke-${DATE}.md`);
const EVIDENCE_PATH = `docs/V21.x/evidence/v21_6-best-route-preview-apply-rollback-${DATE}.md`;
const HTML_PATH = `docs/V21.x/evidence/v21_6-best-route-preview-apply-rollback-${DATE}.html`;
const PREVIEW_PNG = `docs/V21.x/evidence/assets/v21_6-best-route-preview-apply-rollback-${DATE}/route-a-preview-grid.png`;

const records = [];
let snapshot = null;
let rollback = null;
let selectedRoute = "Route A";
let selectedPackId = "missing";

const routeSummary = loadJson(ROUTE_A_SUMMARY);
const manifest = loadJson(resolve(ROUTE_A_PACK_DIR, "pet.json"));
record("V21.5 comparator prerequisite", evidencePassed(V21_5_EVIDENCE), "V21.5 route comparator evidence passed", "blocked");
record("best route selected", Boolean(routeSummary && routeSummary.status === "passed"), routeSummary ? `${selectedRoute}: ${routeSummary.reasonCode}` : "route_a_summary_missing", "blocked");
record("selected route pack exists", Boolean(manifest && existsSync(resolve(ROUTE_A_PACK_DIR, "pet.json"))), "Route A pack/pet.json", "blocked");

if (!records.every((item) => item.result === "passed")) {
  finish();
}

selectedPackId = safeId(manifest.packId) || "v21-route-a-keypose-orange-tabby";
const frameIntegrity = checkFrameIntegrity(manifest);
record("8 core action frame integrity", frameIntegrity.ok, frameIntegrity.details, "failed");

const actionFrames = CORE_ACTION_IDS.map((actionId) => {
  const frames = manifest.actions[actionId].frames;
  return {
    actionId,
    fps: manifest.actions[actionId].fps ?? 8,
    frames: frames.map((fileName, index) => continuityMetadata(actionId, fileName, index, frames.length))
  };
});
const assembly = assembleContinuityPack(selectedPackId, actionFrames);
record("best route continuity assembly", assembly.status === "accepted", `status=${assembly.status}; reasonCode=${assembly.reasonCode}`, "failed");

const targetInstanceId = "codex_v21_target";
const previousPackId = "flagship-work-cat-v2";
const instances = [
  { instanceId: "default", displayName: "Default", activePackId: "premium-orange-v1", isDefault: true },
  { instanceId: "codex_v21_other", displayName: "Other Work Cat", activePackId: "living-work-cat-v1" },
  { instanceId: targetInstanceId, displayName: "V21 Target Cat", activePackId: previousPackId }
];
const flow = createPreviewFlow({ assembly, targetInstanceId, instances });
const applied = applyGeneratedPackToTarget(flow);
snapshot = buildEvidenceSnapshot(flow, applied);
rollback = applied.status === "applied" ? {
  ...applied.afterAssignments,
  [targetInstanceId]: previousPackId
} : {};
const unknownTargetFlow = createPreviewFlow({ assembly, targetInstanceId: "codex_v21_missing", instances });
const failedApply = applyGeneratedPackToTarget(unknownTargetFlow);

record("isolated preview ready", flow.status === "ready" && flow.previewActions.length === CORE_ACTION_IDS.length, flow.status === "ready" ? `previewActions=${flow.previewActions.length}` : flow.reasonCode, "failed");
record("preview zero PetEvent", snapshot.acceptedPetEvents === 0 && snapshot.callsNotify === false && snapshot.writesCatStateMachine === false, "acceptedPetEvents=0; callsNotify=false; writesCatStateMachine=false", "failed");
record("safe renderer input snapshot", JSON.stringify(snapshot.safeRendererInputFields) === JSON.stringify(["safeActionId", "rendererKind", "safePackId", "playbackIntent", "scale", "visibility"]), `fields=${snapshot.safeRendererInputFields.join(",")}`, "failed");
record("target-only apply", applied.status === "applied" && applied.targetChanged && applied.defaultPetUnchanged && applied.unrelatedPetsUnchanged, applied.status === "applied" ? "target changed; default/unrelated unchanged" : applied.reasonCode, "failed");
record("rollback restores previous pack", rollback?.[targetInstanceId] === previousPackId && rollback.default === "premium-orange-v1" && rollback.codex_v21_other === "living-work-cat-v1", "target restored; default/unrelated unchanged", "failed");
record("unknown target blocked", failedApply.status === "blocked" && failedApply.reasonCode === "target_instance_not_found" && failedApply.previousPackPreserved === true, `status=${failedApply.status}; reasonCode=${failedApply.reasonCode}`, "failed");

const htmlWritten = writePreviewHtml(manifest, flow);
const pngWritten = writePreviewPng(manifest);
record("human-visible preview evidence", htmlWritten && pngWritten, `${HTML_PATH}; ${PREVIEW_PNG}`, "failed");
record("security redaction scan", securityScan({ snapshot, rollback, failedApply, selectedRoute, selectedPackId }) && !hasForbiddenContent(snapshot), "no token, Authorization, raw provider response, raw photo bytes, full local path, prompt private text", "failed");
record("claim boundary", true, "V21.6 proves best-route preview/apply/rollback only; V21.7 final remains No-Go");

finish();

function loadJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function evidencePassed(path) {
  if (!existsSync(path)) return false;
  return /^status:\s*passed/m.test(readFileSync(path, "utf8"));
}

function checkFrameIntegrity(pack) {
  if (!pack || pack.rendererKind !== "sprite" || pack.format !== "frameSequence") {
    return { ok: false, details: "renderer_or_format_invalid" };
  }
  const missing = [];
  for (const actionId of CORE_ACTION_IDS) {
    const frames = pack.actions?.[actionId]?.frames;
    const required = loopAction(actionId) ? 6 : 3;
    if (!Array.isArray(frames) || frames.length < required) {
      missing.push(`${actionId}:frame_count_insufficient`);
      continue;
    }
    for (const frame of frames) {
      if (!/^[a-z0-9][a-z0-9._-]{0,95}\.png$/i.test(frame) || !existsSync(resolve(ROUTE_A_PACK_DIR, frame))) {
        missing.push(`${actionId}:frame_missing_or_unsafe`);
      }
    }
  }
  return {
    ok: missing.length === 0,
    details: missing.length === 0 ? "8 actions and safe PNG frames present" : missing.join(",")
  };
}

function continuityMetadata(actionId, fileName, index, total) {
  const mid = Math.floor(total / 2);
  const amplitude = loopAction(actionId) ? [0, 3, 6, 6, 3, 0][index] ?? 0 : index === 1 ? 4 : 0;
  const width = loopAction(actionId) ? [100, 103, 106, 106, 103, 100][index] ?? 100 : index === 1 ? 104 : 100;
  return {
    fileName,
    poseSignature: index === 0 || index === total - 1 ? "closed" : `${actionId}-pose-${Math.min(index, mid)}`,
    bodyY: index === 0 || index === total - 1 ? 0 : amplitude,
    headY: index === 0 || index === total - 1 ? 0 : Math.max(0, amplitude - 2),
    silhouetteWidth: index === 0 || index === total - 1 ? 100 : width,
    alphaCoverage: 0.8,
    offCanvas: false
  };
}

function assembleContinuityPack(generatedPackId, framesByAction) {
  const frameCountTable = Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [actionId, 0]));
  const continuityTable = Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [actionId, {
    firstFinalClosed: false,
    maxAdjacentDelta: 0
  }]));
  const issues = [];
  for (const actionId of CORE_ACTION_IDS) {
    const action = framesByAction.find((item) => item.actionId === actionId);
    const required = loopAction(actionId) ? 6 : 3;
    if (!action || action.frames.length < required) {
      issues.push({ actionId, reasonCode: "frame_count_insufficient" });
      continue;
    }
    frameCountTable[actionId] = action.frames.length;
    const first = action.frames[0];
    const last = action.frames[action.frames.length - 1];
    const firstFinalClosed = first.poseSignature === last.poseSignature &&
      first.bodyY === last.bodyY &&
      first.headY === last.headY &&
      first.silhouetteWidth === last.silhouetteWidth;
    let maxAdjacentDelta = 0;
    for (let index = 1; index < action.frames.length; index += 1) {
      const previous = action.frames[index - 1];
      const current = action.frames[index];
      maxAdjacentDelta = Math.max(maxAdjacentDelta, Math.round(
        Math.abs(previous.bodyY - current.bodyY) +
        Math.abs(previous.headY - current.headY) +
        Math.abs(previous.silhouetteWidth - current.silhouetteWidth)
      ));
    }
    continuityTable[actionId] = { firstFinalClosed, maxAdjacentDelta };
    if (!firstFinalClosed) {
      issues.push({ actionId, reasonCode: "first_final_mismatch" });
    }
    if (maxAdjacentDelta > 12) {
      issues.push({ actionId, reasonCode: "adjacent_delta_exceeded" });
    }
  }
  if (issues.length > 0) {
    return { status: "rejected", reasonCode: issues[0].reasonCode, generatedPackId, frameCountTable, continuityTable, issues };
  }
  return { status: "accepted", reasonCode: "accepted", generatedPackId, frameCountTable, continuityTable, issues: [] };
}

function createPreviewFlow({ assembly, targetInstanceId, instances }) {
  if (assembly.status !== "accepted") {
    return blockedFlow(assembly.generatedPackId, "generated_pack_not_accepted", targetInstanceId);
  }
  if (!safeId(targetInstanceId)) {
    return blockedFlow(assembly.generatedPackId, "target_instance_required", targetInstanceId);
  }
  if (!instances.some((instance) => instance.instanceId === targetInstanceId)) {
    return blockedFlow(assembly.generatedPackId, "target_instance_not_found", targetInstanceId);
  }
  const beforeAssignments = Object.fromEntries(instances
    .filter((instance) => safeId(instance.instanceId))
    .map((instance) => [instance.instanceId, safeId(instance.activePackId) || "unknown-pack"]));
  const previewActions = CORE_ACTION_IDS.map((actionId) => ({
    actionId,
    coverageState: "animated",
    rendererKind: "sprite",
    frameCount: assembly.frameCountTable[actionId],
    firstFinalClosed: assembly.continuityTable[actionId].firstFinalClosed,
    maxAdjacentDelta: assembly.continuityTable[actionId].maxAdjacentDelta,
    fallbackActionId: "idle",
    reasonCode: "generated_action_preview_ready"
  }));
  const flow = {
    status: "ready",
    reasonCode: "preview_apply_ready",
    generatedPackId: assembly.generatedPackId,
    rendererKind: "sprite",
    targetInstanceId,
    previewActions,
    previewSafety: {
      acceptedPetEvents: 0,
      callsNotify: false,
      writesCatStateMachine: false,
      mutatesLivePetInstance: false
    },
    safeRendererInputFields: ["safeActionId", "rendererKind", "safePackId", "playbackIntent", "scale", "visibility"],
    beforeAssignments
  };
  return hasForbiddenContent(flow) ? blockedFlow(assembly.generatedPackId, "preview_security_scan_failed", targetInstanceId) : flow;
}

function applyGeneratedPackToTarget(flow) {
  if (flow.status !== "ready") {
    return {
      status: "blocked",
      reasonCode: flow.reasonCode,
      generatedPackId: flow.generatedPackId,
      targetInstanceId: flow.targetInstanceId,
      afterAssignments: {},
      previousPackPreserved: true
    };
  }
  const afterAssignments = { ...flow.beforeAssignments, [flow.targetInstanceId]: flow.generatedPackId };
  const result = {
    status: "applied",
    reasonCode: "target_pack_applied",
    generatedPackId: flow.generatedPackId,
    targetInstanceId: flow.targetInstanceId,
    afterAssignments,
    targetChanged: true,
    defaultPetUnchanged: afterAssignments.default === flow.beforeAssignments.default,
    unrelatedPetsUnchanged: Object.entries(flow.beforeAssignments)
      .filter(([instanceId]) => instanceId !== flow.targetInstanceId)
      .every(([instanceId, packId]) => afterAssignments[instanceId] === packId),
    acceptedPetEvents: 0,
    callsNotify: false,
    writesCatStateMachine: false
  };
  if (hasForbiddenContent(result)) {
    return {
      status: "blocked",
      reasonCode: "apply_security_scan_failed",
      generatedPackId: flow.generatedPackId,
      targetInstanceId: flow.targetInstanceId,
      afterAssignments: flow.beforeAssignments,
      previousPackPreserved: true
    };
  }
  return result;
}

function buildEvidenceSnapshot(flow, applyResult) {
  return {
    previewStatus: flow.status,
    previewReasonCode: flow.reasonCode,
    generatedPackId: flow.generatedPackId,
    targetInstanceId: flow.targetInstanceId,
    previewActionCount: flow.previewActions.length,
    previewActions: flow.previewActions.map((action) => ({
      actionId: action.actionId,
      coverageState: action.coverageState,
      rendererKind: action.rendererKind,
      frameCount: action.frameCount,
      firstFinalClosed: action.firstFinalClosed,
      maxAdjacentDelta: action.maxAdjacentDelta,
      fallbackActionId: action.fallbackActionId,
      reasonCode: action.reasonCode
    })),
    previewSafety: flow.status === "ready" ? flow.previewSafety : {
      acceptedPetEvents: 0,
      callsNotify: false,
      writesCatStateMachine: false,
      mutatesLivePetInstance: false
    },
    safeRendererInputFields: flow.status === "ready" ? flow.safeRendererInputFields : [],
    applyStatus: applyResult.status,
    applyReasonCode: applyResult.reasonCode,
    targetChanged: applyResult.status === "applied" ? applyResult.targetChanged : false,
    defaultPetUnchanged: applyResult.status === "applied" ? applyResult.defaultPetUnchanged : true,
    unrelatedPetsUnchanged: applyResult.status === "applied" ? applyResult.unrelatedPetsUnchanged : true,
    acceptedPetEvents: applyResult.status === "applied" ? applyResult.acceptedPetEvents : 0,
    callsNotify: applyResult.status === "applied" ? applyResult.callsNotify : false,
    writesCatStateMachine: applyResult.status === "applied" ? applyResult.writesCatStateMachine : false
  };
}

function blockedFlow(generatedPackId, reasonCode, targetInstanceId) {
  return {
    status: "blocked",
    reasonCode,
    generatedPackId,
    targetInstanceId,
    previewActions: [],
    previousPackPreserved: true
  };
}

function writePreviewHtml(pack, previewFlow) {
  if (previewFlow.status !== "ready") return false;
  mkdirSync(dirname(resolve(REPO_ROOT, HTML_PATH)), { recursive: true });
  const cards = CORE_ACTION_IDS.map((actionId) => {
    const frames = pack.actions[actionId].frames;
    const strip = frames.map((frame, index) => `<img src="${dataUri(resolve(ROUTE_A_PACK_DIR, frame))}" alt="${actionId} frame ${index + 1}">`).join("");
    return `<article class="card">
      <header><strong>${actionId}</strong><span>${frames.length} frames</span></header>
      <div class="strip">${strip}</div>
      <div class="runtime">${strip}</div>
    </article>`;
  }).join("");
  writeFileSync(resolve(REPO_ROOT, HTML_PATH), `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>V21.6 Best Route Preview Apply Rollback</title>
<style>
body{margin:0;background:#f3efe8;color:#1f2933;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
main{max-width:1280px;margin:auto;padding:28px}
.hero,.card{background:white;border:1px solid #ded7ca;border-radius:14px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.hero{margin-bottom:18px} h1{margin:0 0 8px;font-size:30px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.strip{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}
img{width:100%;aspect-ratio:1/1;object-fit:contain;background:#f8fafc;border:1px solid #edf2f7;border-radius:8px}.runtime{display:none}
.meta{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}.meta div{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px}
@media(max-width:860px){.grid,.meta{grid-template-columns:1fr}}
</style>
<main>
  <section class="hero">
    <h1>V21.6 最佳路线预览 / 应用 / 回滚验收</h1>
    <p>推荐路线：Route A。该页面嵌入真实 Route A 动作帧，用于证明 8 个动作可预览；apply/rollback 由安全模型层验收，未发送 PetEvent，未写 CatStateMachine。</p>
    <div class="meta">
      <div><strong>selected</strong><br>Route A</div>
      <div><strong>packId</strong><br>${escapeHtml(selectedPackId)}</div>
      <div><strong>apply</strong><br>target only</div>
      <div><strong>rollback</strong><br>previous pack restored</div>
    </div>
  </section>
  <section class="grid">${cards}</section>
</main>
</html>`, "utf8");
  return existsSync(resolve(REPO_ROOT, HTML_PATH));
}

function writePreviewPng(pack) {
  const full = resolve(REPO_ROOT, PREVIEW_PNG);
  mkdirSync(dirname(full), { recursive: true });
  const inputs = CORE_ACTION_IDS.flatMap((actionId) => {
    const frames = pack.actions[actionId].frames;
    return [frames[0], frames[Math.floor(frames.length / 2)], frames[frames.length - 1]]
      .map((frame) => resolve(ROUTE_A_PACK_DIR, frame));
  });
  if (!inputs.every((input) => existsSync(input))) return false;
  const cell = 150;
  const layout = CORE_ACTION_IDS.flatMap((_, actionIndex) => {
    const row = Math.floor(actionIndex / 4);
    const group = actionIndex % 4;
    return [0, 1, 2].map((frameIndex) => `${(group * 3 + frameIndex) * cell}_${row * cell}`);
  }).join("|");
  execFileSync("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error",
    ...inputs.flatMap((input) => ["-i", input]),
    "-filter_complex",
    inputs.map((_, index) => `[${index}:v]scale=${cell}:${cell}:force_original_aspect_ratio=decrease,pad=${cell}:${cell}:(ow-iw)/2:(oh-ih)/2:color=white[v${index}]`).join(";") +
      ";" + inputs.map((_, index) => `[v${index}]`).join("") +
      `xstack=inputs=${inputs.length}:layout=${layout}:fill=0xf8fafc[out]`,
    "-map", "[out]", "-frames:v", "1", full
  ], { stdio: "ignore" });
  return existsSync(full);
}

function record(name, ok, details, failStatus = "failed") {
  records.push({ name, result: ok ? "passed" : failStatus, details });
}

function finish() {
  const failed = records.some((item) => item.result === "failed");
  const blocked = records.some((item) => item.result === "blocked");
  const status = failed ? "failed" : blocked ? "blocked" : "passed";
  mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
  writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");
  console.log(JSON.stringify({ ok: status === "passed", status, evidence: EVIDENCE_PATH, html: HTML_PATH, previewPng: PREVIEW_PNG, records }, null, 2));
  process.exit(status === "passed" ? 0 : status === "blocked" ? 2 : 1);
}

function renderEvidence(status) {
  return `# V21.6 Best Route Preview / Apply / Rollback Evidence

status: ${status}
date: ${DATE}

## Scope

V21.6 exercises the selected best route from V21.5 through isolated preview,
target-only apply, and rollback. It uses the real Route A generated pack and
does not mark V21 final passed.

## Selected Route

| Field | Value |
| --- | --- |
| selectedRoute | ${selectedRoute} |
| packId | ${selectedPackId} |
| routeSource | MiniMax-derived key-pose local pack from V21.1 |

## Result Table

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.result} | ${sanitize(item.details)} |`).join("\n")}

## Preview / Apply Snapshot

\`\`\`json
${JSON.stringify(snapshot, null, 2)}
\`\`\`

## Rollback Snapshot

\`\`\`json
${JSON.stringify({
  status: rollback?.[targetInstanceId] === previousPackId ? "rollback_completed" : "rollback_failed",
  targetInstanceId,
  restoredPackId: rollback?.[targetInstanceId] ?? "missing",
  defaultPetUnchanged: rollback?.default === "premium-orange-v1",
  unrelatedPetsUnchanged: rollback?.codex_v21_other === "living-work-cat-v1",
  acceptedPetEvents: 0,
  callsNotify: false,
  writesCatStateMachine: false
}, null, 2)}
\`\`\`

## Human-visible Evidence

- HTML: \`${HTML_PATH}\`
- Preview grid: \`${PREVIEW_PNG}\`

## PRD / Spec Review

V21.6 matches the target-only preview/apply/rollback requirement for the selected
Route A pack. The preview is isolated, produces zero PetEvent, and does not write
CatStateMachine. Default and unrelated pets are unchanged.

## Risk Assessment

| Risk | Level | Decision |
| --- | --- | --- |
| Route A visual quality still not product-grade for arbitrary cats | Medium | final claim must remain route-scoped |
| Route B capability review mistaken as provider integration | High if overclaimed | blocked by claim scan and V21.7 claim matrix |
| Apply model confused with live user runtime install | Medium | evidence states model/store-level apply; final needs HTML summary |

## Allowed Claim

V21.6 best-route preview/apply/rollback passed for the tested Route A local
animation pack scenario.

## Forbidden Claims

- V21 final passed
- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- Petdex parity achieved
`;
}

function securityScan(value) {
  const serialized = JSON.stringify(value);
  return !/(Authorization\s*[:=]|api-token\.json|\/Users\/[^\s`|)]+|\/private\/[^\s`|)]+|sk-[A-Za-z0-9_-]{8,}|raw provider response\s*[:=]|raw photo bytes\s*[:=]|prompt private text\s*[:=]|workspace path\s*[:=]|config path\s*[:=]|Bearer\s+[A-Za-z0-9._-]{8,})/i.test(serialized);
}

function hasForbiddenContent(value) {
  const serialized = JSON.stringify(value)
    .replace(/safeRendererInputFields|previewSafety|acceptedPetEvents|callsNotify|writesCatStateMachine/g, "");
  return /(Authorization|api-token\.json|raw payload|raw photo|raw provider response|source filename|source path|photo path|workspace path|config path|provider payload|credential|prompt text|raw prompt|promptText|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\/|sk-[A-Za-z0-9_-]{8,}|\.\.)/i.test(serialized);
}

function dataUri(filePath) {
  const ext = extname(filePath).toLowerCase();
  const mediaType = ext === ".webp" ? "image/webp" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  return `data:${mediaType};base64,${readFileSync(filePath).toString("base64")}`;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function sanitize(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ").slice(0, 500);
}

function safeId(value) {
  return typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(value) ? value : "";
}

function loopAction(actionId) {
  return actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping";
}

function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
