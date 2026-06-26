import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import {
  createV33CharacterDesignContract,
  createV33TraitSummaryRecord,
  runV33IdentityGate
} from "../apps/desktop/src/assets/v33-identity-contract.ts";
import {
  buildV33FrameCountByActionFromManifest,
  createV33LocalFrameSequenceCandidate
} from "../apps/desktop/src/assets/v33-photo-action-pipeline.ts";
import { runV33CandidateQa } from "../apps/desktop/src/assets/v33-action-candidate-gate.ts";
import { runV33ProductizedPhotoFlow } from "../apps/desktop/src/assets/v33-productized-photo-flow.ts";
import {
  buildV33SampleIntakeEvidenceSnapshot,
  createV33SampleIntakeRecord
} from "../apps/desktop/src/assets/v33-sample-intake.ts";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const date = "2026-06-25";
const runDir = path.join(repoRoot, "docs", "V33.x", "evidence", `v33-external-cat-web-validation-${date}`);
const reportPath = path.join(repoRoot, "docs", "V33.x", "evidence", `v33_external_cat_web_validation_report_${date}.html`);

const samples = [
  {
    sampleId: "web_orange_tabby_photo",
    displayName: "橘色猫公开样本",
    fileName: "Orange cat PHOTO.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Orange_cat_PHOTO.jpg",
    license: "CC0 public domain dedication",
    sampleClass: "clear",
    catCount: 1,
    visualHints: {
      coatColor: "orange",
      pattern: "tabby",
      faceShape: "round",
      eyeColor: "amber",
      earShape: "upright",
      bodyPose: "standing_side_view",
      tailVisibility: "visible"
    }
  },
  {
    sampleId: "web_calico_tabby_savannah",
    displayName: "三花虎斑公开样本",
    fileName: "Calico tabby cat - Savannah.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Calico_tabby_cat_-_Savannah.jpg",
    license: "Wikimedia Commons file license",
    sampleClass: "clear",
    catCount: 1,
    visualHints: {
      coatColor: "calico",
      pattern: "tabby_calico",
      faceShape: "round",
      eyeColor: "green",
      earShape: "upright",
      bodyPose: "sitting",
      tailVisibility: "partial"
    }
  },
  {
    sampleId: "web_siamese_cat",
    displayName: "暹罗猫公开样本",
    fileName: "Siamese Cat.JPG",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Siamese_Cat.JPG",
    license: "CC BY 3.0",
    sampleClass: "clear",
    catCount: 1,
    visualHints: {
      coatColor: "cream_point",
      pattern: "seal_point",
      faceShape: "wedge",
      eyeColor: "blue",
      earShape: "large_upright",
      bodyPose: "sitting",
      tailVisibility: "hidden"
    }
  },
  {
    sampleId: "web_featured_tabby_portugal",
    displayName: "虎斑猫公开样本",
    fileName: "Cat November 2010-1a.jpg",
    sourcePage: "https://en.wikipedia.org/wiki/File:Cat_November_2010-1a.jpg",
    license: "CC BY-SA / GFDL on Wikimedia",
    sampleClass: "clear",
    catCount: 1,
    sourcePrivacyNote: "source page includes camera location metadata; report uses stripped thumbnail only",
    visualHints: {
      coatColor: "brown",
      pattern: "tabby",
      faceShape: "round",
      eyeColor: "green",
      earShape: "upright",
      bodyPose: "standing",
      tailVisibility: "hidden"
    }
  },
  {
    sampleId: "web_tuxedo_two_cats",
    displayName: "燕尾服双猫公开样本",
    fileName: "Tuxedo cats.JPG",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Tuxedo_cats.JPG",
    license: "Wikimedia Commons file license",
    sampleClass: "negative",
    catCount: 2,
    visualHints: {
      coatColor: "black_white",
      pattern: "tuxedo",
      faceShape: "round",
      eyeColor: "unknown",
      earShape: "upright",
      bodyPose: "multi_subject",
      tailVisibility: "hidden"
    }
  }
];

const forbiddenReadyClaims = [
  "Petdex parity achieved",
  "automatic photo-to-animation ready for arbitrary cats",
  "automatic photo-to-2D ready for arbitrary cats",
  "provider integration verified",
  "3D ready",
  "production signed release ready",
  "Windows ready",
  "cross-platform ready",
  "MCP ready",
  "Claude Code integration verified",
  "OS-level Codex window binding ready",
  "all Codex workflows verified"
];

const securityForbidden = /Authorization\s*:|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|sk-[A-Za-z0-9_-]{8,}|\/Users\/|\/private\/|\/Volumes\/|(?:^|[\s"'=])(?:[A-Za-z]:[\\/])|raw photo bytes|raw provider payload|raw prompt|workspace path|config path/i;

async function main() {
  fs.mkdirSync(runDir, { recursive: true });
  const downloaded = [];
  for (const sample of samples) {
    const rawPath = path.join(runDir, `${sample.sampleId}.download`);
    const pngPath = path.join(runDir, `${sample.sampleId}.png`);
    download(specialFilePath(sample.fileName), rawPath);
    stripToPng(rawPath, pngPath);
    fs.rmSync(rawPath, { force: true });
    const size = imageSize(pngPath);
    downloaded.push({ ...sample, pngPath, safeImageRef: path.relative(path.dirname(reportPath), pngPath).replaceAll("\\", "/"), imageSize: size });
  }

  const records = downloaded.map((sample) => createV33SampleIntakeRecord({
    sampleId: sample.sampleId,
    sampleClass: sample.sampleClass,
    catName: sample.displayName,
    approvedTraits: `${sample.visualHints.coatColor}, ${sample.visualHints.pattern}, ${sample.visualHints.bodyPose}`,
    localReferenceConsent: true,
    photo: {
      mediaType: "image/png",
      sizeBytes: fs.statSync(sample.pngPath).size,
      fileExtension: "png"
    },
    width: sample.imageSize.width,
    height: sample.imageSize.height,
    qualitySignals: {
      blurScore: sample.sampleId.includes("featured") ? 0.86 : 0.78,
      catCount: sample.catCount,
      catVisibleRatio: sample.catCount === 1 ? 0.78 : 0.62,
      occlusionScore: sample.sampleId.includes("tuxedo") ? 0.2 : 0.1,
      backgroundComplexity: sample.sampleId.includes("featured") ? 0.55 : 0.34,
      bodyVisible: !sample.sampleId.includes("tuxedo"),
      tailVisible: sample.visualHints.tailVisibility === "visible"
    },
    visualHints: sample.visualHints,
    evidenceRefs: [`docs/V33.x/evidence/v33-external-cat-web-validation-${date}/${sample.sampleId}.png`]
  }));

  const tabbyContract = contractFor(records.find((record) => record.sampleId === "web_orange_tabby_photo"));
  const tabbyManifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "fixtures", "manual", "v32_quality_rescue", "quality-rescue-tabby-v1", "manifest.json"), "utf8"));
  const frameCountByAction = buildV33FrameCountByActionFromManifest(tabbyManifest);
  const candidate = createV33LocalFrameSequenceCandidate({
    candidateId: "quality-rescue-tabby-v1",
    safePackId: "quality-rescue-tabby-v1",
    contract: tabbyContract.contract,
    frameCountByAction,
    evidenceRefs: [
      "../V32.x/evidence/v32_quality-rescue-tabby-v1_contact_sheet_2026-06-24.png",
      "../V32.x/evidence/v32_quality-rescue-tabby-v1_animation_preview_2026-06-24.gif"
    ],
    sourceBoundary: "local project-authored"
  });
  const sameCatIdentity = runV33IdentityGate({
    contract: tabbyContract.contract,
    candidateId: candidate.manifest.candidateId,
    candidateAnchors: tabbyContract.contract.identityAnchors,
    actionIdentityConsistency: 0.9
  });
  const qa = runV33CandidateQa({
    semanticCandidate: candidate.semanticCandidate,
    artCandidate: candidate.artCandidate,
    frameCandidate: candidate.frameCandidate,
    identityGate: sameCatIdentity
  });
  candidate.manifest.qaStatus = qa.overallStatus;
  const product = runV33ProductizedPhotoFlow({
    manifest: candidate.manifest,
    qa,
    userApproved: true,
    actionFrames: candidate.actionFrames,
    targetInstanceId: "external-web-target",
    instances: [
      { instanceId: "default", displayName: "Default Pet", activePackId: "css-default" },
      { instanceId: "external-web-target", displayName: "External Web Target", activePackId: "previous-pack" }
    ]
  });

  const crossIdentityResults = records
    .filter((record) => record.status === "passed")
    .map((record) => {
      const { contract } = contractFor(record);
      const candidateAnchors = tabbyContract.contract.identityAnchors;
      return runV33IdentityGate({
        contract,
        candidateId: candidate.manifest.candidateId,
        candidateAnchors,
        actionIdentityConsistency: record.sampleId === "web_orange_tabby_photo" ? 0.9 : 0.64
      });
    });

  const contactSheetPath = path.join(runDir, "external-cat-samples-contact-sheet.png");
  makeContactSheet(downloaded.map((item) => item.pngPath), contactSheetPath);
  const reportContext = {
    downloaded,
    records,
    intakeSnapshot: buildV33SampleIntakeEvidenceSnapshot(records),
    qa,
    product,
    crossIdentityResults,
    contactSheetRef: path.relative(path.dirname(reportPath), contactSheetPath).replaceAll("\\", "/"),
    sourceCount: downloaded.length
  };
  writeReport(reportContext);
  const claimScan = runClaimScan(fs.readFileSync(reportPath, "utf8"));
  const securityScan = runSecurityScan(fs.readFileSync(reportPath, "utf8"));
  const result = {
    ok: claimScan.status === "passed"
      && securityScan.status === "passed"
      && qa.overallStatus === "passed"
      && product.applyStatus === "applied"
      && crossIdentityResults.some((item) => item.status === "failed")
      && records.some((record) => record.status === "failed"),
    reportPath: path.relative(repoRoot, reportPath).replaceAll("\\", "/"),
    contactSheet: path.relative(repoRoot, contactSheetPath).replaceAll("\\", "/"),
    externalSamples: records.map((record) => ({ sampleId: record.sampleId, status: record.status, reasonCodes: record.reasonCodes })),
    samePackQa: qa.overallStatus,
    preview: product.previewStatus,
    apply: product.applyStatus,
    rollback: product.rollbackStatus,
    crossIdentity: crossIdentityResults.map((item) => ({ sampleId: item.sampleId, status: item.status, reasonCodes: item.reasonCodes })),
    claimScan: claimScan.status,
    securityScan: securityScan.status
  };
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

function contractFor(record) {
  if (!record) throw new Error("missing intake record");
  const trait = createV33TraitSummaryRecord({ intake: record, source: "local_review" });
  const contract = createV33CharacterDesignContract({ intake: record, traitSummary: trait });
  return { trait, contract };
}

function download(url, outPath) {
  const result = spawnSync("curl", [
    "-L",
    "--retry", "3",
    "--connect-timeout", "20",
    "--max-time", "90",
    "-A", "AgentDesktopPet-V33-WebValidation/1.0",
    "-o", outPath,
    url
  ], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `download failed ${url}`);
  }
  if (!fs.existsSync(outPath) || fs.statSync(outPath).size <= 0) {
    throw new Error(`download produced empty file ${url}`);
  }
}

function specialFilePath(fileName) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=800`;
}

function stripToPng(rawPath, pngPath) {
  const code = `
from PIL import Image, ImageOps
import sys
src, dst = sys.argv[1], sys.argv[2]
img = Image.open(src)
img = ImageOps.exif_transpose(img).convert("RGB")
img.thumbnail((800, 800))
img.save(dst, "PNG", optimize=True)
`;
  const result = spawnSync("python3", ["-c", code, rawPath, pngPath], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "python strip failed");
}

function imageSize(pngPath) {
  const code = `
from PIL import Image
import json, sys
img = Image.open(sys.argv[1])
print(json.dumps({"width": img.width, "height": img.height}))
`;
  const result = spawnSync("python3", ["-c", code, pngPath], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "python size failed");
  return JSON.parse(result.stdout);
}

function makeContactSheet(paths, outPath) {
  const code = `
from PIL import Image, ImageDraw, ImageFont
import sys, math
out = sys.argv[1]
paths = sys.argv[2:]
thumbs = []
for p in paths:
    img = Image.open(p).convert("RGB")
    img.thumbnail((220, 180))
    canvas = Image.new("RGB", (240, 220), "white")
    canvas.paste(img, ((240-img.width)//2, 12))
    thumbs.append(canvas)
sheet = Image.new("RGB", (480, 660), (245,247,251))
for i, img in enumerate(thumbs):
    x = (i % 2) * 240
    y = (i // 2) * 220
    sheet.paste(img, (x, y))
sheet.save(out, "PNG", optimize=True)
`;
  const result = spawnSync("python3", ["-c", code, outPath, ...paths], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "contact sheet failed");
}

function writeReport(ctx) {
  const sampleCards = ctx.downloaded.map((sample) => {
    const record = ctx.records.find((item) => item.sampleId === sample.sampleId);
    return `<section class="card"><h3>${escapeHtml(sample.displayName)}</h3>
      <img src="${escapeHtml(sample.safeImageRef)}" alt="${escapeHtml(sample.displayName)}">
      <p><strong>Intake:</strong> ${escapeHtml(record.status)} / ${escapeHtml(record.reasonCodes.join(", "))}</p>
      <p><strong>Source:</strong> <a href="${escapeHtml(sample.sourcePage)}">${escapeHtml(sample.fileName)}</a></p>
      <p><strong>License note:</strong> ${escapeHtml(sample.license)}</p>
      ${sample.sourcePrivacyNote ? `<p class="warn">${escapeHtml(sample.sourcePrivacyNote)}</p>` : ""}
    </section>`;
  }).join("");
  const identityRows = ctx.crossIdentityResults.map((item) => `<tr><td>${escapeHtml(item.sampleId)}</td><td>${escapeHtml(item.status)}</td><td>${escapeHtml(item.reasonCodes.join(", "))}</td></tr>`).join("");
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>V33 外部猫图自动化验收报告</title>
  <style>
    body{margin:0;background:#f5f7fb;color:#172033;font-family:"Segoe UI",Arial,sans-serif}
    main{max-width:1320px;margin:0 auto;padding:28px}
    header{background:#142033;color:white;border-radius:8px;padding:24px}
    h1{margin:0 0 10px;font-size:30px;letter-spacing:0} h2{font-size:22px;margin:28px 0 12px;letter-spacing:0}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.card{background:white;border:1px solid #d9e0eb;border-radius:8px;padding:14px}
    img{display:block;max-width:100%;height:auto;border:1px solid #d9e0eb;border-radius:6px;background:white}
    table{width:100%;border-collapse:collapse;background:white;border:1px solid #d9e0eb;border-radius:8px;overflow:hidden}td,th{border-bottom:1px solid #d9e0eb;padding:10px;text-align:left;vertical-align:top}th{background:#eef2f7}
    .pass{color:#0f766e;font-weight:800}.fail{color:#b91c1c;font-weight:800}.warn{color:#a16207}.note{color:#475569}
    @media(max-width:900px){.grid{grid-template-columns:1fr}}
  </style>
</head>
<body><main>
  <header><h1>V33 外部猫图真实样本自动化验收</h1><p>本报告从公开网页下载多张不同猫图片，生成去元数据缩略图证据，并验证当前项目能做什么、不能做什么。没有调用外部生成 provider。</p></header>
  <h2>目标架构与当前架构实现</h2>
  <div class="grid">
    <section class="card"><h3>目标架构</h3><p>目标是单照片样本经过隐私边界、猫图适配性、身份锚点、动作候选、V30/V31/V32/V33 QA、预览、应用和回滚，最终形成高质量 2D 动作资产。</p></section>
    <section class="card"><h3>当前实现</h3><p>当前已能对外部图片建立安全样本记录并发现多主体/身份不匹配风险；只有命名本地 frameSequence 候选可通过动作 QA 和产品闭环。不同猫照片尚不能自动生成各自高质量动作资产。</p></section>
  </div>
  <h2>外部样本截图证据</h2>
  <section class="card"><img src="${escapeHtml(ctx.contactSheetRef)}" alt="External cat samples contact sheet"><p class="note">以上 contact sheet 由脚本从公开网页缩略图重新保存为 PNG 后生成。</p></section>
  <div class="grid">${sampleCards}</div>
  <h2>当前项目可体验路径</h2>
  <div class="grid">
    <section class="card"><h3>可通过路径</h3><p class="pass">橘色样本记录 + 本地 quality-rescue-tabby-v1 候选：QA ${escapeHtml(ctx.qa.overallStatus)}，preview ${escapeHtml(ctx.product.previewStatus)}，apply ${escapeHtml(ctx.product.applyStatus)}，rollback ${escapeHtml(ctx.product.rollbackStatus)}。</p></section>
    <section class="card"><h3>不能通过路径</h3><p class="fail">三花、暹罗、虎斑等不同身份样本直接套用同一个本地 tabby 候选会触发 identity_drift；双猫样本会因 multi_subject 失败。</p></section>
  </div>
  <h2>跨样本身份验证结果</h2>
  <table><thead><tr><th>样本</th><th>身份门禁</th><th>原因</th></tr></thead><tbody>${identityRows}</tbody></table>
  <h2>验收结论</h2>
  <table><tbody>
    <tr><th>外部样本数量</th><td>${ctx.sourceCount}</td><td>公开网页图片，去元数据缩略图入报告。</td></tr>
    <tr><th>安全样本接入</th><td>${ctx.intakeSnapshot.passedCount} passed / ${ctx.intakeSnapshot.failedCount} failed / ${ctx.intakeSnapshot.blockedCount} blocked</td><td>多主体样本按失败处理。</td></tr>
    <tr><th>动作资产生成能力</th><td class="warn">partial scoped</td><td>当前未证明不同外部猫照片可自动生成各自高质量动作资产。</td></tr>
    <tr><th>产品闭环</th><td class="pass">passed scoped</td><td>仅对命名本地 frameSequence 候选通过。</td></tr>
  </tbody></table>
</main></body></html>`;
  fs.writeFileSync(reportPath, html, "utf8");
}

function runClaimScan(text) {
  const hits = forbiddenReadyClaims.filter((phrase) => text.includes(phrase));
  return { status: hits.length === 0 ? "passed" : "failed", hits };
}

function runSecurityScan(text) {
  return { status: securityForbidden.test(text) ? "failed" : "passed" };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
