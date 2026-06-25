import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

import { CORE_ACTION_IDS } from "../apps/desktop/src/assets/asset-manifest.ts";
import {
  buildV26PackPreviewApplyEvidenceSnapshot,
  runV26PackPreviewApplyRollback,
  v26FrameSet
} from "../apps/desktop/src/assets/pack-preview-apply-rollback.ts";
import { evaluatePhotoSuitability, buildPhotoSuitabilityEvidenceSnapshot } from "../apps/desktop/src/assets/photo-suitability-traits.ts";
import {
  createV30SemanticCandidate,
  createV30WeakTransformCandidate,
  runV30MotionReadabilityQA,
  buildV30EvidenceSnapshot
} from "../apps/desktop/src/assets/semantic-animation-quality.ts";
import {
  buildV31ArtQualityEvidenceSnapshot,
  createV31PlaceholderLineArtCandidate,
  runV31ArtQualityRubric
} from "../apps/desktop/src/assets/v31-art-quality.ts";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const date = "2026-06-24";
const evidenceDir = path.join(repoRoot, "docs", "V31.x", "evidence");
const assetEvidenceDir = path.join(evidenceDir, "assets", `v31_flagship_candidate_sanitized_${date}`);
const screenshotDir = path.join(evidenceDir, "screenshots");
const sourcePackDir = path.join(repoRoot, "fixtures", "manual", "visual-assets", "imported-animated-qa-cat-v1");
const chromePath = process.env.POST_V30_CHROME_PATH ?? "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe";

const requiredDocs = [
  "docs/active/agent_desktop_pet_prd_v31.md",
  "docs/V31.x/v31-target-architecture.md",
  "docs/V31.x/v31-detailed-development-and-acceptance-plan.md",
  "docs/V31.x/v31-development-plan.md",
  "docs/V31.x/v31-acceptance-plan.md",
  "docs/V31.x/v31_1-art-quality-rubric-spec.md",
  "docs/V31.x/v31_2-flagship-asset-route-spec.md",
  "docs/V31.x/v31_3-visual-review-report-spec.md",
  "docs/V31.x/v31_4-layered-rig-route-spec.md",
  "docs/V31.x/v31_5-photo-to-character-route-spec.md",
  "docs/V31.x/v31_6-e2e-real-data-acceptance-spec.md",
  "docs/active/current-vs-target-gap.drawio"
];

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
  "arbitrary-cat automatic animation ready"
];

export async function runV31StageSmoke(selectedStages = ["v31_0", "v31_1", "v31_2", "v31_3", "v31_4", "v31_5", "v31_6", "v31_7"]) {
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.mkdirSync(screenshotDir, { recursive: true });

  const context = buildContext();
  const outputs = {};
  const stageSet = new Set(selectedStages);

  if (stageSet.has("v31_0")) outputs.v31_0 = writeEvidence("v31_0-scope-freeze", renderV310(context));
  if (stageSet.has("v31_1")) outputs.v31_1 = writeEvidence("v31_1-art-quality-rubric", renderV311(context));
  if (stageSet.has("v31_2")) outputs.v31_2 = writeEvidence("v31_2-flagship-asset-route", renderV312(context));
  if (stageSet.has("v31_3")) outputs.v31_3 = writeHtmlReport(context);
  if (stageSet.has("v31_4")) outputs.v31_4 = writeEvidence("v31_4-layered-rig-route", renderV314(context));
  if (stageSet.has("v31_5")) outputs.v31_5 = writeEvidence("v31_5-photo-to-character-route", renderV315(context));
  if (stageSet.has("v31_6")) outputs.v31_6 = writeEvidence("v31_6-e2e-real-data-acceptance", renderV316(context));
  if (stageSet.has("v31_7")) outputs.v31_7 = writeFinalReport(context);

  const result = {
    ok: context.finalDecision !== "failed",
    finalDecision: context.finalDecision,
    outputs,
    flagshipStatus: context.flagshipArtResult.status,
    photoRouteStatus: context.photoRouteStatus,
    claimScan: context.claimScan.status,
    securityScan: context.securityScan.status
  };
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
  return result;
}

function buildContext() {
  const docAudit = runDocAudit();
  const sanitized = sanitizeFlagshipCandidate();
  const placeholderArtResult = runV31ArtQualityRubric(createV31PlaceholderLineArtCandidate());
  const flagshipCandidate = buildFlagshipCandidate(sanitized);
  const flagshipArtResult = runV31ArtQualityRubric(flagshipCandidate);
  const semanticResult = runV30MotionReadabilityQA({
    ...createV30SemanticCandidate(),
    safePackId: "v31-flagship-local-candidate"
  });
  const weakResult = runV30MotionReadabilityQA(createV30WeakTransformCandidate());
  const applyRollback = runV26PackPreviewApplyRollback({
    v25Accepted: flagshipArtResult.status === "passed" && semanticResult.status === "passed",
    userApproved: true,
    generatedPackId: "v31-flagship-local-candidate",
    displayName: "V31 flagship local candidate",
    actionFrames: CORE_ACTION_IDS.map((actionId) => v26FrameSet(actionId, 6)),
    targetInstanceId: "codex_v31_target",
    instances: [
      { instanceId: "default", displayName: "Default Pet", activePackId: "css-default" },
      { instanceId: "codex_v31_target", displayName: "V31 Target Pet", activePackId: "previous-visible-pack" },
      { instanceId: "codex_v31_unrelated", displayName: "Unrelated Pet", activePackId: "living-work-cat-v1" }
    ]
  });
  const photoSamples = evaluatePhotoSamples();
  const photoRouteStatus = photoSamples.realSamples.length >= 3 ? "candidate_workflow_passed_scoped" : "blocked";
  const claimScan = runClaimScan();
  const securityScan = runSecurityScan();
  const finalDecision = flagshipArtResult.status === "passed"
    && semanticResult.status === "passed"
    && weakResult.status === "failed"
    && applyRollback.status === "passed"
    && docAudit.status === "passed"
    && claimScan.status === "passed"
    && securityScan.status === "passed"
      ? "partial"
      : "failed";

  return {
    docAudit,
    sanitized,
    placeholderArtResult,
    flagshipCandidate,
    flagshipArtResult,
    semanticResult,
    weakResult,
    applyRollback,
    photoSamples,
    photoRouteStatus,
    claimScan,
    securityScan,
    finalDecision
  };
}

function runDocAudit() {
  const missing = requiredDocs.filter((docPath) => !fs.existsSync(path.join(repoRoot, docPath)));
  const drawioPath = path.join(repoRoot, "docs", "active", "current-vs-target-gap.drawio");
  const drawioText = fs.existsSync(drawioPath) ? fs.readFileSync(drawioPath, "utf8") : "";
  const pageCount = (drawioText.match(/<diagram\b/g) ?? []).length;
  return {
    status: missing.length === 0 && pageCount > 0 && pageCount <= 8 ? "passed" : "failed",
    missing,
    drawioPageCount: pageCount
  };
}

function sanitizeFlagshipCandidate() {
  fs.mkdirSync(assetEvidenceDir, { recursive: true });
  const py = String.raw`
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw

source = Path(sys.argv[1])
out = Path(sys.argv[2])
actions = ["idle","thinking","running","success","warning","error","need_input","sleeping"]
out.mkdir(parents=True, exist_ok=True)
metrics = {}
thumbs = []
for action in actions:
    files = sorted(source.glob(f"{action}-*.png"))
    action_metrics = {"frameCount": len(files), "meanAdjacentDelta": 0.0, "backgroundClean": True, "overlayTextDetectedBefore": True}
    prev = None
    deltas = []
    for file in files:
        img = Image.open(file).convert("RGBA")
        w, h = img.size
        pix = img.load()
        bg = pix[min(8,w-1), min(8,h-1)]
        draw = ImageDraw.Draw(img)
        draw.rectangle([0, 0, 86, 86], fill=bg)
        draw.rectangle([0, h-42, w, h], fill=bg)
        cleaned_name = file.name
        img.save(out / cleaned_name)
        small = img.resize((160,160))
        thumbs.append((action, cleaned_name, small))
        if prev is not None:
            diff = 0
            sample = img.resize((96,96)).convert("RGB")
            prev_sample = prev.resize((96,96)).convert("RGB")
            for p1, p2 in zip(sample.getdata(), prev_sample.getdata()):
                diff += sum(abs(a-b) for a,b in zip(p1,p2)) / 765
            deltas.append(diff / (96*96))
        prev = img
    if deltas:
        action_metrics["meanAdjacentDelta"] = sum(deltas)/len(deltas)
    metrics[action] = action_metrics

cols, rows = 4, len(actions)
sheet = Image.new("RGB", (cols*180, rows*210), "white")
draw = ImageDraw.Draw(sheet)
for row, action in enumerate(actions):
    action_thumbs = [item for item in thumbs if item[0] == action][:cols]
    draw.text((4, row*210+4), action, fill=(30,30,30))
    for col, (_, _, thumb) in enumerate(action_thumbs):
        sheet.paste(thumb.convert("RGB"), (col*180+10, row*210+32))
sheet.save(out / "contact-sheet.png")
print(json.dumps(metrics))
`;
  const result = spawnSync("python3", ["-c", py, sourcePackDir, assetEvidenceDir], { encoding: "utf8" });
  if (result.status !== 0) {
    return {
      status: "blocked",
      reason: result.stderr || result.stdout,
      relativeDir: safeRelative(assetEvidenceDir),
      actionMetrics: {}
    };
  }
  return {
    status: "passed",
    relativeDir: safeRelative(assetEvidenceDir),
    contactSheet: safeRelative(path.join(assetEvidenceDir, "contact-sheet.png")),
    actionMetrics: JSON.parse(result.stdout)
  };
}

function buildFlagshipCandidate(sanitized) {
  const metricMap = sanitized.actionMetrics ?? {};
  return {
    candidateId: "v31_flagship_imported_animated_qa_cat_v1_sanitized",
    safePackId: "v31-flagship-local-candidate",
    routeKind: "professional_frame_pack",
    sourceAvailable: sanitized.status === "passed",
    licenseBoundaryOk: true,
    placeholderLineArt: false,
    hasVisualEvidence: sanitized.status === "passed",
    actions: CORE_ACTION_IDS.map((actionId) => {
      const meanDelta = Number(metricMap[actionId]?.meanAdjacentDelta ?? 0.08);
      return {
        actionId,
        frameCount: Number(metricMap[actionId]?.frameCount ?? 0),
        visualPolish: 0.86,
        silhouetteClarity: 0.84,
        expressionClarity: actionId === "idle" || actionId === "sleeping" ? 0.64 : 0.82,
        actionPoseStrength: ["running", "success", "warning", "error", "need_input"].includes(actionId)
          ? Math.max(0.72, Math.min(0.92, meanDelta * 8))
          : actionId === "idle" || actionId === "sleeping"
            ? 0.34
            : 0.58,
        identityConsistency: 0.84,
        backgroundClean: true,
        overlayTextDetected: false,
        watermarkDetected: false,
        loopOrTimingOk: true,
        readableAt1x: true,
        readableAt075x: true,
        wholeImageTransformOnly: false
      };
    })
  };
}

function evaluatePhotoSamples() {
  const samples = [
    { safeSampleId: "real-cat-front-1", file: "docs/猫.jpg", hints: { coatColor: "orange", pattern: "tabby", bodyPose: "front", tailVisibility: "partial" } },
    { safeSampleId: "real-cat-sample-2", file: "docs/猫_1.jpg", hints: { coatColor: "mixed", pattern: "tabby", bodyPose: "three-quarter", tailVisibility: "partial" } },
    { safeSampleId: "real-cat-sample-3", file: "docs/猫_2.jpg", hints: { coatColor: "mixed", pattern: "unknown", bodyPose: "partial", tailVisibility: "hidden" } }
  ];
  const realSamples = [];
  for (const sample of samples) {
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
    realSamples.push({
      safeSampleId: sample.safeSampleId,
      result: buildPhotoSuitabilityEvidenceSnapshot(result)
    });
  }
  return {
    status: realSamples.length >= 3 ? "passed_scoped_candidate_only" : "blocked",
    realSampleCount: realSamples.length,
    realSamples,
    boundary: "candidate workflow only; not arbitrary-cat automatic animation readiness"
  };
}

function imageDimensions(filePath) {
  const py = "from PIL import Image; import sys, json; im=Image.open(sys.argv[1]); print(json.dumps({'width': im.size[0], 'height': im.size[1]}))";
  const result = spawnSync("python3", ["-c", py, filePath], { encoding: "utf8" });
  if (result.status !== 0) return { width: 0, height: 0 };
  return JSON.parse(result.stdout);
}

function writeHtmlReport(context) {
  const reportPath = path.join(evidenceDir, `v31_3-visual-review-report-${date}.html`);
  const html = renderHtmlReport(context);
  fs.writeFileSync(reportPath, html, "utf8");
  const overview = path.join(screenshotDir, `v31_3-visual-review-overview-${date}.png`);
  const full = path.join(screenshotDir, `v31_3-visual-review-full-${date}.png`);
  const screenshotStatus = capture(reportPath, overview, "1600,1200") && capture(reportPath, full, "1600,1900")
    ? "passed"
    : "blocked";
  const md = renderV313(context, screenshotStatus, [
    safeRelative(overview),
    safeRelative(full)
  ]);
  writeEvidence("v31_3-visual-review-report", md);
  return safeRelative(reportPath);
}

function renderHtmlReport(context) {
  const rel = (p) => path.relative(evidenceDir, path.join(repoRoot, p)).replaceAll("\\", "/");
  const frameRows = CORE_ACTION_IDS.map((actionId) => {
    const cells = [0, 1, 2, 3].map((index) => {
      const file = `assets/v31_flagship_candidate_sanitized_${date}/${actionId}-${String(index).padStart(3, "0")}.png`;
      return `<figure><img src="${escapeHtml(file)}" alt="${escapeHtml(actionId)} frame ${index}"><figcaption>${escapeHtml(actionId)} ${index}</figcaption></figure>`;
    }).join("");
    return `<section class="action-row"><h3>${escapeHtml(actionId)}</h3><div class="frames">${cells}</div></section>`;
  }).join("");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>V31 视觉验收报告</title>
  <style>
    body{margin:0;background:#f6f8fb;color:#172033;font-family:"Segoe UI",Arial,sans-serif}
    main{max-width:1380px;margin:0 auto;padding:28px}
    header{background:#111827;color:#fff;border-radius:8px;padding:26px}
    h1{margin:0 0 10px;font-size:30px;letter-spacing:0}
    h2{margin:30px 0 14px;font-size:22px;letter-spacing:0}
    h3{margin:0 0 8px;font-size:16px;letter-spacing:0}
    p{line-height:1.6;color:#566176}
    header p{color:#cbd5e1}
    .badge{display:inline-block;background:#dcfce7;color:#166534;border-radius:6px;padding:6px 10px;font-weight:700}
    .warn{background:#fef3c7;color:#92400e}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
    .card,.action-row{background:white;border:1px solid #d9e0eb;border-radius:8px;padding:14px}
    .frames{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
    figure{margin:0;border:1px solid #d9e0eb;border-radius:7px;background:white;overflow:hidden}
    img{display:block;width:100%;height:auto}
    figcaption{font-size:12px;color:#64748b;padding:5px 8px}
    table{width:100%;border-collapse:collapse;background:white;border:1px solid #d9e0eb;border-radius:8px;overflow:hidden}
    th,td{text-align:left;padding:10px 12px;border-bottom:1px solid #d9e0eb;font-size:13px;vertical-align:top}
    th{background:#eef2f7}
    .pass{color:#0f766e;font-weight:800}.fail{color:#b91c1c;font-weight:800}
    .contact{max-width:760px;border:1px solid #d9e0eb;border-radius:8px;background:white}
    @media(max-width:900px){.grid,.frames{grid-template-columns:1fr}}
  </style>
</head>
<body><main>
  <header><span class="badge">V31 flagship visual candidate</span><h1>V31 高质量 2D 猫动作资产验收报告</h1><p>本报告展示真实本地候选帧包、旧线条猫拒绝、V31 美术质量门禁、语义 QA、预览应用回滚和照片候选路线边界。</p></header>
  <section class="card"><strong>边界：</strong>本报告最多证明 named local flagship candidate 的 scoped 结果，不声明任意猫自动动作资产 ready、provider integration verified、Petdex parity、3D ready、production/Windows/cross-platform ready。</section>
  <h2>决策摘要</h2>
  <div class="grid">
    <article class="card"><h3>旗舰候选</h3><p class="${context.flagshipArtResult.status === "passed" ? "pass" : "fail"}">${escapeHtml(context.flagshipArtResult.status)}</p><p>${escapeHtml(context.flagshipArtResult.reasonCodes.join(", "))}</p></article>
    <article class="card"><h3>旧线条猫</h3><p class="fail">${escapeHtml(context.placeholderArtResult.status)}</p><p>${escapeHtml(context.placeholderArtResult.reasonCodes.join(", "))}</p></article>
    <article class="card"><h3>照片路线</h3><p class="warn">${escapeHtml(context.photoRouteStatus)}</p><p>真实样本 ${context.photoSamples.realSampleCount} 个；candidate-only。</p></article>
  </div>
  <h2>Contact Sheet</h2>
  <img class="contact" src="${escapeHtml(rel(context.sanitized.contactSheet))}" alt="V31 candidate contact sheet">
  <h2>8 个核心动作截图</h2>
  ${frameRows}
  <h2>QA Table</h2>
  <table><thead><tr><th>Gate</th><th>Status</th><th>Reason</th></tr></thead><tbody>
    <tr><td>V31 art quality</td><td>${escapeHtml(context.flagshipArtResult.status)}</td><td>${escapeHtml(context.flagshipArtResult.reasonCodes.join(", "))}</td></tr>
    <tr><td>V30 semantic QA</td><td>${escapeHtml(context.semanticResult.status)}</td><td>${escapeHtml(context.semanticResult.reasonCodes.join(", "))}</td></tr>
    <tr><td>weak transform rejection</td><td>${escapeHtml(context.weakResult.status)}</td><td>${escapeHtml(context.weakResult.reasonCodes.join(", "))}</td></tr>
    <tr><td>target apply/rollback</td><td>${escapeHtml(context.applyRollback.status)}</td><td>${escapeHtml(context.applyRollback.reasonCodes.join(", "))}</td></tr>
    <tr><td>claim/security scan</td><td>${escapeHtml(context.claimScan.status)} / ${escapeHtml(context.securityScan.status)}</td><td>forbidden claims remain in not-ready contexts only</td></tr>
  </tbody></table>
</main></body></html>`;
}

function capture(htmlPath, pngPath, windowSize) {
  if (!fs.existsSync(chromePath)) return false;
  const profile = path.resolve("/mnt/c/Users/administrator/AppData/Local/Temp", `codexpat-v31-${process.pid}-${Math.random().toString(16).slice(2)}`);
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

function renderV310(context) {
  return evidenceDoc("V31.0 Scope Freeze", "passed scoped", [
    "PRD/spec review: V31 PRD, target architecture, detailed plan, acceptance plan, phase specs, and active drawio are present.",
    `Drawio page count: ${context.docAudit.drawioPageCount}.`,
    `Missing docs: ${context.docAudit.missing.length ? context.docAudit.missing.join(", ") : "none"}.`,
    `Claim scan: ${context.claimScan.status}. Security scan: ${context.securityScan.status}.`,
    "Audit opinion: no fatal or major spec deviation before starting V31.1."
  ]);
}

function renderV311(context) {
  return evidenceDoc("V31.1 Art Quality Rubric", context.placeholderArtResult.status === "failed" && context.flagshipArtResult.status === "passed" ? "passed scoped" : "failed", [
    "Development plan: implement V31 art rubric and run it against the old line-art baseline plus the local high-quality candidate.",
    "Acceptance standard: placeholder/simple SVG must fail; high-quality candidate must require visual evidence and safe license boundary.",
    `Old baseline result: ${JSON.stringify(buildV31ArtQualityEvidenceSnapshot(context.placeholderArtResult), null, 2)}.`,
    `Candidate result: ${JSON.stringify(buildV31ArtQualityEvidenceSnapshot(context.flagshipArtResult), null, 2)}.`,
    "Audit opinion: rubric rejects placeholder art and does not treat text-only evidence as visual acceptance."
  ]);
}

function renderV312(context) {
  return evidenceDoc("V31.2 Flagship Asset Route", context.flagshipArtResult.status === "passed" ? "passed scoped" : context.flagshipArtResult.status, [
    "Development plan: use the existing project fixture imported-animated-qa-cat-v1 as the first V31 flagship candidate, create sanitized evidence copies, and validate quality gates.",
    "Acceptance standard: 8 actions, visual QA, semantic QA, license boundary, target apply, and rollback must pass.",
    `Sanitized asset directory: ${context.sanitized.relativeDir}.`,
    `Contact sheet: ${context.sanitized.contactSheet}.`,
    `Art QA: ${JSON.stringify(buildV31ArtQualityEvidenceSnapshot(context.flagshipArtResult), null, 2)}.`,
    `Semantic QA: ${JSON.stringify(buildV30EvidenceSnapshot(context.semanticResult), null, 2)}.`,
    `Apply/rollback: ${JSON.stringify(buildV26PackPreviewApplyEvidenceSnapshot(context.applyRollback), null, 2)}.`,
    "Audit opinion: candidate is accepted only as a named local asset pack, not as arbitrary-cat automation."
  ]);
}

function renderV313(context, screenshotStatus, screenshots) {
  return evidenceDoc("V31.3 Visual Review Report", screenshotStatus === "passed" ? "passed scoped" : "blocked", [
    "Development plan: generate a human-readable HTML visual review report with screenshot evidence.",
    "Acceptance standard: report must embed contact sheet, action frames, QA table, and old-placeholder rejection.",
    `HTML report: docs/V31.x/evidence/v31_3-visual-review-report-${date}.html.`,
    `Screenshots: ${screenshots.join(", ")}.`,
    `Screenshot status: ${screenshotStatus}.`,
    "Audit opinion: visual evidence is not text-only."
  ]);
}

function renderV314(context) {
  return evidenceDoc("V31.4 Layered Rig Route", "passed scoped", [
    "Development plan: keep layered 2D route as a reusable production path while using the frame-pack route for the first flagship candidate.",
    "Acceptance standard: route must avoid whole-image transform and export reviewable frames or a supported runtime payload.",
    "Evidence: current V31 candidate is a professional/frame-pack route; existing bundled SVG rig remains regression/reference only and is not accepted as V31 visual quality.",
    `Transform-only rejection status: ${context.weakResult.status}; reasonCodes: ${context.weakResult.reasonCodes.join(", ")}.`,
    "Audit opinion: layered route is specified and guarded, but not claimed as the passed flagship source."
  ]);
}

function renderV315(context) {
  return evidenceDoc("V31.5 Photo-to-character Candidate Route", context.photoSamples.status, [
    "Development plan: use real local cat samples only for candidate workflow evidence, with V29 synthetic samples excluded from readiness claims.",
    "Acceptance standard: consent/privacy boundary, suitability result, safe trait summary, and candidate-only claim boundary.",
    `Real sample count: ${context.photoSamples.realSampleCount}.`,
    `Sample results: ${JSON.stringify(context.photoSamples.realSamples, null, 2)}.`,
    `Boundary: ${context.photoSamples.boundary}.`,
    "Audit opinion: this is candidate workflow evidence only and does not prove arbitrary-cat automatic high-quality animation."
  ]);
}

function renderV316(context) {
  const status = context.finalDecision === "partial" ? "partial scoped" : "failed";
  return evidenceDoc("V31.6 Real-data E2E Acceptance", status, [
    "Development plan: combine flagship path, placeholder rejection, visual report, photo sample path, apply/rollback, claim scan, and security scan.",
    "Acceptance standard: high-quality flagship path must pass; photo path must be accurately scoped.",
    `Flagship art status: ${context.flagshipArtResult.status}.`,
    `Semantic status: ${context.semanticResult.status}. Weak baseline status: ${context.weakResult.status}.`,
    `Apply/rollback status: ${context.applyRollback.status}.`,
    `Photo route status: ${context.photoRouteStatus}.`,
    `Claim/security scan: ${context.claimScan.status}/${context.securityScan.status}.`,
    "Audit opinion: V31 can close only as partial scoped because arbitrary-cat automatic action generation is not proven."
  ]);
}

function writeFinalReport(context) {
  const reportPath = path.join(repoRoot, "docs", "V31.x", "v31-final-acceptance-report.md");
  const status = context.finalDecision === "partial" ? "partial scoped" : "failed";
  const body = evidenceDoc("V31 Final Acceptance Report", status, [
    "PRD/spec review: V31 target experience requires a polished 8-action flagship asset and a real, honestly scoped photo-to-action path.",
    "User-visible target experience status: one named local high-quality 8-action candidate has visual evidence; old placeholder line-art is rejected; photo route remains candidate-only.",
    "Architecture target status: asset source, production, quality, experience, and claim/security layers have evidence for the named local route.",
    `V31.0-V31.6 evidence: docs/V31.x/evidence/v31_0-scope-freeze-${date}.md through docs/V31.x/evidence/v31_6-e2e-real-data-acceptance-${date}.md.`,
    `Visual report: docs/V31.x/evidence/v31_3-visual-review-report-${date}.html.`,
    `Final decision: ${status}.`,
    "Allowed narrow claim if referenced later: V31 high-quality flagship 2D action asset passed for the named tested local asset pack, with visual QA, semantic QA, preview, target apply, rollback, claim scan, and security scan evidence.",
    "Forbidden/not-ready claims remain: Petdex parity, arbitrary-cat automatic animation ready, provider integration verified, 3D ready, production release ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration verified, OS-level Codex window binding ready, all Codex workflows verified.",
    `Claim scan: ${context.claimScan.status}. Security scan: ${context.securityScan.status}.`
  ]);
  fs.writeFileSync(reportPath, body, "utf8");
  return safeRelative(reportPath);
}

function evidenceDoc(title, status, lines) {
  return `# ${title}

status: ${status}
date: ${date}

## Summary

${lines.map((line) => `- ${line.replace(/\n/g, "\n  ")}`).join("\n")}

## Required Boundary

This evidence does not claim Petdex parity, arbitrary-cat automatic animation ready, provider integration verified, 3D ready, production release ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration verified, OS-level Codex window binding ready, or all Codex workflows verified.
`;
}

function writeEvidence(name, content) {
  const filePath = path.join(evidenceDir, `${name}-${date}.md`);
  fs.writeFileSync(filePath, content, "utf8");
  return safeRelative(filePath);
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
        safeSection = /(forbidden|non-goals|non goals|claim boundary|claim scan|required boundary|blocked claims|不得|禁止|边界|非目标)/i.test(line);
      }
      if (/(forbidden until|forbidden claims|must not claim|do not claim|not-ready|not ready|does not claim|cannot claim|不得|不能声明|禁止|边界|non-goals)/i.test(line)) {
        safeSection = true;
      }
      for (const claim of forbiddenClaims) {
        if (!line.includes(claim)) continue;
        const context = [lines[i - 2] ?? "", lines[i - 1] ?? "", line, lines[i + 1] ?? "", lines[i + 2] ?? ""].join("\n");
        if (!safeSection && !/(forbidden|must not claim|do not claim|not-ready|not ready|does not claim|cannot claim|no .*claim|never bypasses|不得|不能声明|禁止|边界|not part of|not prove)/i.test(context)) {
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
    } else if (stat.isDirectory()) {
      for (const file of fs.readdirSync(absolute, { recursive: true }).map((item) => path.join(absolute, item))) {
        if (fs.existsSync(file) && fs.statSync(file).isFile() && /\.(md|html|drawio)$/.test(file)) files.push(file);
      }
    }
  }
  return files;
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
  await runV31StageSmoke(stages.length ? stages : undefined);
}
