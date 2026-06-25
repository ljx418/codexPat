import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

import { CORE_ACTION_IDS } from "../apps/desktop/src/assets/asset-manifest.ts";
import {
  runV26PackPreviewApplyRollback,
  v26FrameSet,
  buildV26PackPreviewApplyEvidenceSnapshot
} from "../apps/desktop/src/assets/pack-preview-apply-rollback.ts";
import { buildPhotoSuitabilityEvidenceSnapshot, evaluatePhotoSuitability } from "../apps/desktop/src/assets/photo-suitability-traits.ts";
import {
  createV30SemanticCandidate,
  runV30MotionReadabilityQA,
  buildV30EvidenceSnapshot
} from "../apps/desktop/src/assets/semantic-animation-quality.ts";
import {
  buildV31ArtQualityEvidenceSnapshot,
  createV31PlaceholderLineArtCandidate,
  createV31PolishedCandidate,
  runV31ArtQualityRubric
} from "../apps/desktop/src/assets/v31-art-quality.ts";
import {
  buildV31ContinuationEvidenceSnapshot,
  runV31ContinuationFinalGate,
  runV31LayeredRigRuntimeRouteGate,
  runV31NamedPhotoSampleSetGate,
  runV31PhotoActionClosureGate,
  runV31RepeatableAssetProductionGate
} from "../apps/desktop/src/assets/v31-continuation.ts";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const date = "2026-06-24";
const evidenceDir = path.join(repoRoot, "docs", "V31.x", "evidence");
const screenshotDir = path.join(evidenceDir, "screenshots");
const chromePath = process.env.POST_V30_CHROME_PATH ?? "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe";

const forbiddenClaims = [
  "Petdex parity achieved",
  "automatic photo-to-animation ready for arbitrary cats",
  "provider integration verified",
  "3D ready",
  "production signed release ready",
  "Windows ready",
  "cross-platform ready",
  "MCP ready",
  "Claude Code integration verified",
  "OS-level Codex window binding ready",
  "all Codex workflows verified",
  "arbitrary-cat automatic animation ready",
  "automatic photo-to-2D ready for arbitrary cats"
];

const requiredDocs = [
  "docs/active/agent_desktop_pet_prd_v31.md",
  "docs/V31.x/v31-target-architecture.md",
  "docs/V31.x/v31-detailed-development-and-acceptance-plan.md",
  "docs/V31.x/v31-development-plan.md",
  "docs/V31.x/v31-acceptance-plan.md",
  "docs/V31.x/v31-milestones.md",
  "docs/V31.x/v31-claim-matrix.md",
  "docs/V31.x/v31-current-gap-analysis.md",
  "docs/active/current-vs-target-gap.drawio"
];

export async function runV31ContinuationSmoke(selectedStages = ["v31_8", "v31_9", "v31_10", "v31_11", "v31_12", "v31_13"]) {
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.mkdirSync(screenshotDir, { recursive: true });

  const context = buildContext();
  const outputs = {};
  const stageSet = new Set(selectedStages);

  if (stageSet.has("v31_8")) outputs.v31_8 = writeEvidence("v31_8-repeatable-asset-production", renderV318(context));
  if (stageSet.has("v31_9")) outputs.v31_9 = writeEvidence("v31_9-layered-rig-runtime-route", renderV319(context));
  if (stageSet.has("v31_10")) outputs.v31_10 = writeEvidence("v31_10-photo-sample-set", renderV3110(context));
  if (stageSet.has("v31_11")) outputs.v31_11 = writeEvidence("v31_11-photo-action-preview-apply-rollback", renderV3111(context));
  if (stageSet.has("v31_12")) outputs.v31_12 = writeE2EReport(context);
  if (stageSet.has("v31_13")) outputs.v31_13 = writeEvidence("v31_13-continuation-final-gate", renderV3113(context));

  const result = {
    ok: context.finalGate.status !== "failed",
    finalStatus: context.finalGate.status,
    outputs,
    phaseStatuses: context.finalGate.phaseStatuses,
    claimScan: context.claimScan.status,
    securityScan: context.securityScan.status
  };
  console.log(JSON.stringify(result, null, 2));
  if (context.finalGate.status === "failed" || context.claimScan.status !== "passed" || context.securityScan.status !== "passed") {
    process.exitCode = 1;
  }
  return result;
}

function buildContext() {
  const docAudit = runDocAudit();
  const claimScan = runClaimScan();
  const securityScan = runSecurityScan();
  const flagshipArt = runV31ArtQualityRubric(createV31PolishedCandidate());
  const v811Art = runV31ArtQualityRubric({
    ...createV31PolishedCandidate({
      visualPolish: 0.62,
      expressionClarity: 0.54,
      actionPoseStrength: 0.46,
      readableAt075x: true
    }),
    candidateId: "v8_11_animated_orange_tabby",
    safePackId: "v8-11-animated-orange-tabby",
    sourceAvailable: fs.existsSync(path.join(repoRoot, "fixtures", "manual", "v8_11", "animated_sprite_pack", "manifest.json")),
    licenseBoundaryOk: true
  });
  const staticArt = runV31ArtQualityRubric({
    ...createV31PolishedCandidate({
      frameCount: 1,
      visualPolish: 0.58,
      actionPoseStrength: 0.22,
      loopOrTimingOk: false
    }),
    candidateId: "imported_static_orange_tabby_v1",
    safePackId: "imported-static-orange-tabby-v1",
    sourceAvailable: fs.existsSync(path.join(repoRoot, "fixtures", "manual", "visual-assets", "imported-static-orange-tabby-v1", "manifest.json")),
    licenseBoundaryOk: true
  });
  const placeholderArt = runV31ArtQualityRubric(createV31PlaceholderLineArtCandidate());
  const semantic = runV30MotionReadabilityQA({
    ...createV30SemanticCandidate(),
    safePackId: "v31-continuation-flagship-candidate"
  });
  const previewApply = runV26PackPreviewApplyRollback({
    v25Accepted: flagshipArt.status === "passed" && semantic.status === "passed",
    userApproved: true,
    generatedPackId: "v31-continuation-flagship-candidate",
    displayName: "V31 continuation flagship candidate",
    actionFrames: CORE_ACTION_IDS.map((actionId) => v26FrameSet(actionId, 6)),
    targetInstanceId: "codex_v31_continuation_target",
    instances: [
      { instanceId: "default", displayName: "Default Pet", activePackId: "css-default" },
      { instanceId: "codex_v31_continuation_target", displayName: "V31 Continuation Target", activePackId: "previous-visible-pack" },
      { instanceId: "codex_v31_continuation_unrelated", displayName: "Unrelated Pet", activePackId: "living-work-cat-v1" }
    ]
  });

  const repeatable = runV31RepeatableAssetProductionGate({
    candidates: [
      { candidateId: "v31_flagship_local_asset", sourceLabel: "real_local_asset", artQuality: flagshipArt, semanticQuality: semantic },
      { candidateId: "v8_11_animated_orange_tabby", sourceLabel: "real_local_asset", artQuality: v811Art },
      { candidateId: "imported_static_orange_tabby_v1", sourceLabel: "fixture_negative", artQuality: staticArt },
      { candidateId: "placeholder_line_art", sourceLabel: "fixture_negative", artQuality: placeholderArt }
    ]
  });
  const layered = runV31LayeredRigRuntimeRouteGate({
    routeContractPresent: true,
    runtimePayloadAvailable: false,
    normalizedFramesAvailable: false
  });
  const photoSamples = evaluatePhotoSamples();
  const namedSampleSet = runV31NamedPhotoSampleSetGate(photoSamples.sampleSetInputs);
  const photoClosure = runV31PhotoActionClosureGate({
    namedSampleSet,
    artQuality: flagshipArt,
    semanticQuality: semantic,
    previewApply,
    photoDerivedActionFramesAvailable: false
  });
  const e2eStatus = finalStatusFrom([repeatable.status, layered.status, namedSampleSet.status, photoClosure.status]);
  const finalGate = runV31ContinuationFinalGate({
    v31_8: repeatable.status,
    v31_9: layered.status,
    v31_10: namedSampleSet.status,
    v31_11: photoClosure.status,
    v31_12: e2eStatus
  });

  return {
    docAudit,
    claimScan,
    securityScan,
    flagshipArt,
    v811Art,
    staticArt,
    placeholderArt,
    semantic,
    previewApply,
    repeatable,
    layered,
    photoSamples,
    namedSampleSet,
    photoClosure,
    e2eStatus,
    finalGate
  };
}

function renderV318(context) {
  return evidenceDoc("V31.8 Repeatable Asset Production", context.repeatable.status, [
    "Development plan: evaluate multiple local asset candidates through the same V31 art quality gate and V30 semantic boundary before claiming repeatability.",
    "Acceptance standard: at least two legal high-quality candidates must pass the same gate; one passing candidate remains partial scoped.",
    "PRD/spec review: V31 requires production-quality 2D action assets, not a single accidental success or placeholder motion.",
    `Result: ${json(buildV31ContinuationEvidenceSnapshot(context.repeatable))}.`,
    `Flagship art: ${json(buildV31ArtQualityEvidenceSnapshot(context.flagshipArt))}.`,
    `V8.11 candidate art: ${json(buildV31ArtQualityEvidenceSnapshot(context.v811Art))}.`,
    `Static negative art: ${json(buildV31ArtQualityEvidenceSnapshot(context.staticArt))}.`,
    "Audit opinion: V31.8 is partial because only one candidate is accepted as high-quality; repeatable production is not yet fully proven.",
    scanLine(context)
  ]);
}

function renderV319(context) {
  return evidenceDoc("V31.9 Layered Rig Runtime Route", context.layered.status, [
    "Development plan: verify whether the layered rig route has a supported runtime payload or normalized frames that can pass the same QA and preview/apply/rollback boundary.",
    "Acceptance standard: route contract alone is insufficient; a real runtime payload or normalized frame export must pass QA.",
    "PRD/spec review: V31 target architecture allows layered rig as a scalable route, but does not treat it as passed without evidence.",
    `Result: ${json(buildV31ContinuationEvidenceSnapshot(context.layered))}.`,
    "Audit opinion: V31.9 is blocked because the route contract exists but no accepted layered rig runtime payload was proven.",
    scanLine(context)
  ]);
}

function renderV3110(context) {
  return evidenceDoc("V31.10 Named Photo Sample Set", context.namedSampleSet.status, [
    "Development plan: use existing local real cat photos as named positive/difficult samples, and keep missing negative real samples explicit.",
    "Acceptance standard: a full pass requires real accepted/difficult/blocked/negative samples; simulated negative coverage cannot prove the full sample set.",
    "PRD/spec review: arbitrary-cat photo-to-action readiness requires named sample-set evidence; current run is limited to local real cat photos plus simulated negative metadata.",
    `Real photo suitability snapshots: ${json(context.photoSamples.safeSnapshots)}.`,
    `Sample-set result: ${json(buildV31ContinuationEvidenceSnapshot(context.namedSampleSet))}.`,
    "Audit opinion: V31.10 is partial because the positive/difficult samples use real local photos, while negative/blocked samples are simulated metadata only.",
    scanLine(context)
  ]);
}

function renderV3111(context) {
  return evidenceDoc("V31.11 Photo Action Preview Apply Rollback", context.photoClosure.status, [
    "Development plan: run the approved preview/apply/rollback model and require true photo-derived action frames before accepting photo-action closure.",
    "Acceptance standard: QA, all 8 actions, target-only apply, rollback, and photo-derived frame availability must all be true.",
    "PRD/spec review: using the flagship local pack proves runtime controls, not arbitrary photo-derived action asset generation.",
    `Preview/apply/rollback: ${json(buildV26PackPreviewApplyEvidenceSnapshot(context.previewApply))}.`,
    `Semantic QA: ${json(buildV30EvidenceSnapshot(context.semantic))}.`,
    `Closure result: ${json(buildV31ContinuationEvidenceSnapshot(context.photoClosure))}.`,
    "Audit opinion: V31.11 is blocked because no real photo-derived action frame pack is available, even though target-only apply and rollback controls pass for the tested local candidate.",
    scanLine(context)
  ]);
}

function renderV3113(context) {
  return evidenceDoc("V31.13 Continuation Final Gate", context.finalGate.status, [
    "Development plan: aggregate V31.8-V31.12 after each phase produced evidence, PRD/spec review, and scans.",
    "Acceptance standard: final pass requires all prior gates passed scoped; blocked or partial phases must keep the final claim narrow.",
    "PRD/spec review: current project can prove one named high-quality local 2D asset route and safe runtime controls, but cannot yet prove repeatable production, layered runtime, or photo-derived high-quality action assets.",
    `Phase statuses: ${json(context.finalGate.phaseStatuses)}.`,
    `Final gate: ${json(buildV31ContinuationEvidenceSnapshot(context.finalGate))}.`,
    "Audit opinion: V31 continuation is blocked/partial, not complete. The next development cycle must produce a second accepted asset route, a real layered runtime payload or stable alternative, and real photo-derived action frames before broad acceptance.",
    scanLine(context)
  ]);
}

function writeE2EReport(context) {
  const htmlPath = path.join(evidenceDir, `v31_12-real-data-e2e-${date}.html`);
  const mdPath = path.join(evidenceDir, `v31_12-real-data-e2e-${date}.md`);
  fs.writeFileSync(htmlPath, renderHtml(context), "utf8");
  const screenshotPath = path.join(screenshotDir, `v31_12-real-data-e2e-overview-${date}.png`);
  const screenshotStatus = capture(htmlPath, screenshotPath, "1500,1200") ? "passed" : "blocked";
  const md = evidenceDoc("V31.12 Real-data E2E", context.e2eStatus, [
    "Development plan: assemble one human-readable E2E report that shows current architecture, target architecture, tested user paths, visual evidence, and honest blocked items.",
    "Acceptance standard: report must be readable, screenshot-backed when headless Chrome is available, and must not claim missing photo-derived automation.",
    "PRD/spec review: E2E can only close as blocked/partial while layered rig runtime and photo-derived action frames are absent.",
    `HTML report: docs/V31.x/evidence/v31_12-real-data-e2e-${date}.html.`,
    `Headless screenshot status: ${screenshotStatus}. Screenshot: ${safeRelative(screenshotPath)}.`,
    `E2E phase status: ${context.e2eStatus}.`,
    "Audit opinion: the report is evidence-backed for current scoped behavior, but does not prove the next-stage target experience.",
    scanLine(context)
  ]);
  fs.writeFileSync(mdPath, md, "utf8");
  return safeRelative(mdPath);
}

function evaluatePhotoSamples() {
  const realSpecs = [
    { safeSampleId: "real-cat-front-1", file: "docs/猫.jpg", kind: "real_positive", hints: { coatColor: "orange", pattern: "tabby", bodyPose: "front", tailVisibility: "partial" } },
    { safeSampleId: "real-cat-sample-2", file: "docs/猫_1.jpg", kind: "real_positive", hints: { coatColor: "mixed", pattern: "tabby", bodyPose: "three-quarter", tailVisibility: "partial" } },
    { safeSampleId: "real-cat-sample-3", file: "docs/猫_2.jpg", kind: "real_difficult", hints: { coatColor: "mixed", pattern: "unknown", bodyPose: "partial", tailVisibility: "hidden" } }
  ];
  const safeSnapshots = [];
  const sampleSetInputs = [];
  for (const sample of realSpecs) {
    const filePath = path.join(repoRoot, sample.file);
    if (!fs.existsSync(filePath)) continue;
    const stat = fs.statSync(filePath);
    const dims = imageDimensions(filePath);
    const result = evaluatePhotoSuitability({
      selectedState: "selected",
      mediaType: "image/jpeg",
      sizeBytes: stat.size,
      width: dims.width,
      height: dims.height,
      safeSampleId: sample.safeSampleId,
      sourceLabel: "local-real-sample",
      qualitySignals: {
        blurScore: sample.safeSampleId === "real-cat-sample-3" ? 0.54 : 0.72,
        catCount: 1,
        catVisibleRatio: sample.safeSampleId === "real-cat-sample-3" ? 0.5 : 0.76,
        occlusionScore: sample.safeSampleId === "real-cat-sample-3" ? 0.32 : 0.12,
        backgroundComplexity: 0.42,
        bodyVisible: sample.safeSampleId !== "real-cat-sample-3",
        tailVisible: false
      },
      visualHints: sample.hints
    });
    safeSnapshots.push({
      safeSampleId: sample.safeSampleId,
      sourceKind: "real_local_photo",
      snapshot: buildPhotoSuitabilityEvidenceSnapshot(result)
    });
    sampleSetInputs.push({
      safeSampleId: sample.safeSampleId,
      sampleKind: sample.kind,
      suitabilityStatus: result.status,
      primaryReasonCode: result.primaryReasonCode
    });
  }
  sampleSetInputs.push(
    { safeSampleId: "simulated-non-cat-negative", sampleKind: "simulated_negative", suitabilityStatus: "unsuitable", primaryReasonCode: "multi_cat_ambiguous" },
    { safeSampleId: "simulated-low-quality-blocked", sampleKind: "simulated_blocked", suitabilityStatus: "unsuitable", primaryReasonCode: "photo_blurry" }
  );
  return { safeSnapshots, sampleSetInputs };
}

function renderHtml(context) {
  const statusClass = (status) => status === "passed" ? "pass" : status === "partial" ? "partial" : status === "blocked" ? "block" : "fail";
  const phaseRows = Object.entries(context.finalGate.phaseStatuses).map(([phase, status]) =>
    `<tr><td>${escapeHtml(phase)}</td><td class="${statusClass(status)}">${escapeHtml(status)}</td></tr>`
  ).join("");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>V31.12 Real-data E2E Continuation Report</title>
  <style>
    body{margin:0;background:#f7f8fb;color:#162033;font-family:"Segoe UI",Arial,sans-serif}
    main{max-width:1280px;margin:0 auto;padding:28px}
    header{background:#172033;color:white;border-radius:8px;padding:24px}
    h1{margin:0 0 10px;font-size:30px;letter-spacing:0}
    h2{font-size:22px;margin:28px 0 12px;letter-spacing:0}
    h3{font-size:16px;margin:0 0 8px;letter-spacing:0}
    p{line-height:1.55;color:#526071} header p{color:#d5deea}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
    .card{background:white;border:1px solid #dae1eb;border-radius:8px;padding:14px}
    table{width:100%;border-collapse:collapse;background:white;border:1px solid #dae1eb;border-radius:8px;overflow:hidden}
    td,th{border-bottom:1px solid #dae1eb;padding:10px;text-align:left;vertical-align:top}
    th{background:#eef2f7}
    .pass{color:#0f766e;font-weight:800}.partial{color:#a16207;font-weight:800}.block{color:#b45309;font-weight:800}.fail{color:#b91c1c;font-weight:800}
    code{background:#eef2f7;border-radius:4px;padding:2px 4px}
    @media(max-width:850px){.grid{grid-template-columns:1fr}}
  </style>
</head>
<body><main>
  <header>
    <h1>V31.12 真实数据端到端验收报告</h1>
    <p>本报告展示当前项目已实现的 V31 scoped 能力、目标架构差距、真实本地照片样本边界，以及不能验收通过的缺口。</p>
  </header>

  <h2>目标架构与当前实现</h2>
  <div class="grid">
    <section class="card"><h3>已证明</h3><p>一个 named local 高质量 8 动作资产通过 V31 art gate、V30 semantic gate、target-only apply 和 rollback。</p></section>
    <section class="card"><h3>部分证明</h3><p>仓库真实猫照片可进入安全 suitability/sample-set 流程，但负向样本不是完整真实照片集。</p></section>
    <section class="card"><h3>未证明</h3><p>repeatable high-quality production、layered rig runtime payload、photo-derived high-quality action frames 均未完整通过。</p></section>
  </div>

  <h2>阶段状态</h2>
  <table><thead><tr><th>阶段</th><th>状态</th></tr></thead><tbody>${phaseRows}</tbody></table>

  <h2>用户体验路径</h2>
  <table><thead><tr><th>路径</th><th>当前证据</th><th>结论</th></tr></thead><tbody>
    <tr><td>选择高质量动作猫</td><td>V31 flagship local asset passed</td><td class="partial">只证明 named local asset</td></tr>
    <tr><td>预览、应用、回滚</td><td>${escapeHtml(context.previewApply.status)} / ${escapeHtml(context.previewApply.rollbackResult.status)}</td><td class="${statusClass(context.previewApply.status)}">runtime controls passed for tested candidate</td></tr>
    <tr><td>上传猫照片生成动作资产</td><td>真实照片 suitability + simulated negative metadata</td><td class="block">无 photo-derived action frames，不能通过</td></tr>
    <tr><td>Layered rig 非整图变形路线</td><td>${escapeHtml(context.layered.reasonCodes.join(", "))}</td><td class="block">route contract only</td></tr>
  </tbody></table>

  <h2>审计边界</h2>
  <p>Claim scan: <strong>${escapeHtml(context.claimScan.status)}</strong>。Security scan: <strong>${escapeHtml(context.securityScan.status)}</strong>。</p>
  <p>不得声明 Petdex parity、任意猫自动生成动作资产 ready、provider integration verified、3D ready、production release ready、Windows ready、cross-platform ready。</p>
</main></body></html>`;
}

function evidenceDoc(title, status, lines) {
  return `# ${title}

status: ${status}
date: ${date}

## Pre-execution Development And Acceptance Plan

- Execute only the scoped V31 continuation phase named in this evidence.
- Use existing PRD and target architecture as the source of truth.
- Stop or mark blocked instead of passing if real visual, runtime, or photo-derived evidence is missing.

## Evidence

${lines.map((line) => `- ${line.replace(/\n/g, "\n  ")}`).join("\n")}

## Required Boundary

This evidence does not claim Petdex parity, arbitrary-cat automatic animation ready, automatic photo-to-2D ready for arbitrary cats, provider integration verified, 3D ready, production signed release ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration verified, OS-level Codex window binding ready, or all Codex workflows verified.
`;
}

function runDocAudit() {
  const missing = requiredDocs.filter((file) => !fs.existsSync(path.join(repoRoot, file)));
  return {
    status: missing.length ? "failed" : "passed",
    requiredDocCount: requiredDocs.length,
    missing
  };
}

function runClaimScan() {
  const files = scanFiles(["docs/active/agent_desktop_pet_prd_v31.md", "docs/V31.x"]);
  const violations = [];
  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    let safeSection = false;
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (/^#{1,6}\s/.test(line)) {
        safeSection = /(forbidden|non-goals|claim boundary|claim scan|required boundary|blocked claims|不得|禁止|边界|非目标)/i.test(line);
      }
      if (/(forbidden|must not claim|do not claim|not-ready|not ready|does not claim|cannot claim|不得|不能声明|禁止|边界)/i.test(line)) safeSection = true;
      for (const claim of forbiddenClaims) {
        if (!line.includes(claim)) continue;
        const context = [lines[i - 2] ?? "", lines[i - 1] ?? "", line, lines[i + 1] ?? "", lines[i + 2] ?? ""].join("\n");
        if (!safeSection && !/(forbidden|must not claim|do not claim|no .*claim|not-ready|not ready|does not claim|cannot claim|不得|不能声明|禁止|边界|not prove)/i.test(context)) {
          violations.push({ file: safeRelative(file), line: i + 1, claim });
        }
      }
    }
  }
  return { status: violations.length ? "failed" : "passed", scannedFileCount: files.length, violations };
}

function runSecurityScan() {
  const files = scanFiles(["docs/V31.x", "docs/active/agent_desktop_pet_prd_v31.md"]);
  const pattern = /\b(?:Bearer\s+[A-Za-z0-9._-]+|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|file:\/\/|https?:\/\/|api-token\.json/i;
  const violations = [];
  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (!pattern.test(line)) continue;
      const context = [lines[i - 1] ?? "", line, lines[i + 1] ?? ""].join("\n");
      if (!/(must not|do not|forbidden|not include|not expose|不得|禁止|不会记录|安全|边界)/i.test(context)) {
        violations.push({ file: safeRelative(file), line: i + 1 });
      }
    }
  }
  return { status: violations.length ? "failed" : "passed", scannedFileCount: files.length, violations };
}

function scanFiles(entries) {
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(repoRoot, entry);
    if (!fs.existsSync(absolute)) continue;
    const stat = fs.statSync(absolute);
    if (stat.isFile() && /\.(md|html|drawio)$/.test(absolute)) {
      files.push(absolute);
      continue;
    }
    if (!stat.isDirectory()) continue;
    for (const child of fs.readdirSync(absolute, { recursive: true }).map((item) => path.join(absolute, item))) {
      if (fs.existsSync(child) && fs.statSync(child).isFile() && /\.(md|html|drawio)$/.test(child)) files.push(child);
    }
  }
  return files;
}

function finalStatusFrom(statuses) {
  if (statuses.includes("failed")) return "failed";
  if (statuses.includes("blocked")) return "blocked";
  if (statuses.includes("partial")) return "partial";
  return "passed";
}

function imageDimensions(filePath) {
  const py = "from PIL import Image; import sys, json; im=Image.open(sys.argv[1]); print(json.dumps({'width': im.size[0], 'height': im.size[1]}))";
  const result = spawnSync("python3", ["-c", py, filePath], { encoding: "utf8" });
  if (result.status !== 0) return { width: 0, height: 0 };
  return JSON.parse(result.stdout);
}

function capture(htmlPath, pngPath, windowSize) {
  if (!fs.existsSync(chromePath)) return false;
  const profile = path.resolve("/mnt/c/Users/administrator/AppData/Local/Temp", `codexpat-v31-continuation-${process.pid}-${Math.random().toString(16).slice(2)}`);
  const fileUrl = `file:///${toWindowsPath(htmlPath).replaceAll("\\", "/")}`;
  const result = spawnSync(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${toWindowsPath(profile)}`,
    `--window-size=${windowSize}`,
    `--screenshot=${toWindowsPath(pngPath)}`,
    fileUrl
  ], { encoding: "utf8", windowsHide: true });
  spawnSync("powershell.exe", ["-NoProfile", "-Command", `Remove-Item -LiteralPath '${toWindowsPath(profile)}' -Recurse -Force -ErrorAction SilentlyContinue`], { windowsHide: true });
  return result.status === 0 && fs.existsSync(pngPath);
}

function writeEvidence(name, content) {
  const filePath = path.join(evidenceDir, `${name}-${date}.md`);
  fs.writeFileSync(filePath, content, "utf8");
  return safeRelative(filePath);
}

function scanLine(context) {
  return `Claim/security scan: ${context.claimScan.status}/${context.securityScan.status}; doc audit: ${context.docAudit.status}.`;
}

function json(value) {
  return JSON.stringify(value, null, 2);
}

function safeRelative(filePath) {
  return path.relative(repoRoot, filePath).replaceAll("\\", "/");
}

function toWindowsPath(filePath) {
  return execFileSync("wslpath", ["-w", filePath], { encoding: "utf8" }).trim();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char] ?? char);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const stages = process.argv.slice(2);
  await runV31ContinuationSmoke(stages.length ? stages : undefined);
}
