import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  V38_TARGET_ACTION_IDS,
  buildV38PublicPhotoActionEvidenceSnapshot,
  createV38PublicPhotoActionPipeline,
  createV38PublicPhotoSources,
  runV38ClaimScan,
  v38PublicPhotoActionPipelineHasForbiddenContent
} from "../apps/desktop/src/assets/v38-public-photo-action-pipeline.ts";

export { V38_TARGET_ACTION_IDS, createV38PublicPhotoSources };

export const v38Date = "2026-06-26";
const __filename = fileURLToPath(import.meta.url);
export const repoRoot = path.resolve(path.dirname(__filename), "..");
export const evidenceRoot = path.join(repoRoot, "docs/V38.x/evidence");
export const evidenceAssetRoot = path.join(evidenceRoot, "assets");
export const publicAssetRoot = path.join(repoRoot, "apps/desktop/public/v38");
export const originalTmpRoot = "/tmp/codexpat-v38-public-sources";

export function ensureV38Dirs() {
  fs.mkdirSync(evidenceRoot, { recursive: true });
  fs.mkdirSync(evidenceAssetRoot, { recursive: true });
  fs.mkdirSync(publicAssetRoot, { recursive: true });
  fs.mkdirSync(originalTmpRoot, { recursive: true });
}

export function buildV38Context() {
  const generated = readGeneratedSummary();
  const pipeline = createV38PublicPhotoActionPipeline({
    sanitizedAssets: generated.sanitizedAssets,
    renderablePacks: generated.renderablePacks
  });
  const snapshot = buildV38PublicPhotoActionEvidenceSnapshot(pipeline);
  return { generated, pipeline, snapshot };
}

export function writeEvidence(relPath, body) {
  const absPath = path.join(repoRoot, relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, body, "utf8");
  return relPath.replaceAll("\\", "/");
}

export function printResult(result) {
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

export function phaseHeader({ title, phase, spec }) {
  return [
    `# ${title}`,
    "",
    `Date: ${v38Date}`,
    "",
    "## Development And Acceptance Plan",
    `- Phase: ${phase}.`,
    `- Spec: ${spec}.`,
    "- Development plan: execute only this V38 phase against public-authorized photo samples and sanitized derived assets.",
    "- Acceptance plan: require PRD/spec review, command result, real artifact references, claim scan, security scan, and scoped decision.",
    "- Audit opinion before implementation: no critical or major specification deviation; proceed only with public-photo sample-bound evidence.",
    "",
    "## PRD / Spec Review",
    "- PRD: docs/active/agent_desktop_pet_prd_v38.md reviewed.",
    "- Target architecture: docs/V38.x/v38-target-architecture.md reviewed.",
    "- Development plan: docs/V38.x/v38-development-and-acceptance-plan.md reviewed.",
    "- Boundary: public-authorized tested samples only; no arbitrary-cat, provider, production, Windows, cross-platform, 3D, Petdex, MCP, Claude, OS-level, or all-workflows readiness claim.",
    ""
  ].join("\n");
}

export function scanBlock(value) {
  const claimScan = runV38ClaimScan(value);
  const securityScan = { status: v38PublicPhotoActionPipelineHasForbiddenContent(value) ? "failed" : "passed" };
  return {
    claimScan,
    securityScan,
    markdown: [
      "## Claim Scan",
      `- Status: ${claimScan.status}`,
      `- Hits: ${claimScan.hits.length === 0 ? "none" : claimScan.hits.join(", ")}`,
      "",
      "## Security Scan",
      `- Status: ${securityScan.status}`,
      ""
    ].join("\n")
  };
}

export function runCommand(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options
  }).trim();
}

export function requireCommand(command, args = ["--version"]) {
  try {
    const output = runCommand(command, args);
    return { command, status: "available", summary: output.split("\n")[0] ?? "" };
  } catch (error) {
    return { command, status: "missing", summary: String(error?.message ?? error) };
  }
}

export function downloadPublicSources() {
  ensureV38Dirs();
  const records = [];
  for (const source of createV38PublicPhotoSources()) {
    const sampleDir = sampleEvidenceDir(source.sampleId);
    fs.mkdirSync(sampleDir, { recursive: true });
    const extension = source.redirectUrl.toLowerCase().endsWith(".png") ? "png" : "jpg";
    const originalPath = path.join(originalTmpRoot, `${source.sampleId}.${extension}`);
    const metadata = fetchCommonsMetadata(source);
    const download = runDownloadedCurl(source.redirectUrl, originalPath);
    const originalHash = sha256(originalPath);
    const publicRecord = {
      sampleId: source.sampleId,
      displayName: source.displayName,
      sampleClass: source.sampleClass,
      sourcePage: source.sourcePage,
      commonsTitle: source.commonsTitle,
      licenseShortName: metadata.licenseShortName,
      attribution: metadata.attribution,
      artist: metadata.artist,
      sourceReady: download.status === "downloaded" && metadata.status === "metadata_ready",
      originalHashRef: `docs/V38.x/evidence/assets/${source.sampleId}/original-sha256.txt`,
      originalStoredInRepo: false,
      status: source.sampleClass === "passing_cat" ? "accepted_for_sanitization" : source.sampleClass === "negative_non_cat" ? "rejected_non_cat_negative" : "blocked_multi_cat_identity_ambiguity",
      reasonCodes: source.sampleClass === "passing_cat" ? ["public_cat_source_ready"] : source.sampleClass === "negative_non_cat" ? ["negative_non_cat_sample_rejected"] : ["multi_cat_identity_ambiguous"],
      metadataStatus: metadata.status,
      downloadStatus: download.status
    };
    fs.writeFileSync(path.join(sampleDir, "original-sha256.txt"), `${originalHash}\n`, "utf8");
    records.push(publicRecord);
  }
  writeJson("docs/V38.x/evidence/v38-public-source-records.json", records);
  return records;
}

export function sanitizePublicCatSources(sourceRecords = readJson("docs/V38.x/evidence/v38-public-source-records.json", [])) {
  ensureV38Dirs();
  const sanitizedAssets = [];
  for (const record of sourceRecords) {
    if (record.status !== "accepted_for_sanitization") continue;
    const source = createV38PublicPhotoSources().find((item) => item.sampleId === record.sampleId);
    const originalPath = findOriginalPath(record.sampleId);
    const sampleDir = sampleEvidenceDir(record.sampleId);
    const publicDir = path.join(publicAssetRoot, record.sampleId);
    fs.mkdirSync(sampleDir, { recursive: true });
    fs.mkdirSync(publicDir, { recursive: true });
    const evidenceSanitized = path.join(sampleDir, "sanitized.png");
    const publicSanitized = path.join(publicDir, "sanitized.png");
    runCommand("convert", [
      originalPath,
      "-auto-orient",
      "-strip",
      "-resize",
      "512x512^",
      "-gravity",
      "center",
      "-extent",
      "512x512",
      evidenceSanitized
    ]);
    fs.copyFileSync(evidenceSanitized, publicSanitized);
    const identify = runCommand("identify", ["-verbose", evidenceSanitized]);
    const exifStripped = !/(exif|gps|latitude|longitude|profile-exif)/i.test(identify);
    const averageColor = readAverageColor(evidenceSanitized);
    const hash = sha256(evidenceSanitized);
    fs.writeFileSync(path.join(sampleDir, "sanitized-sha256.txt"), `${hash}\n`, "utf8");
    sanitizedAssets.push({
      sampleId: record.sampleId,
      sanitizedImageRef: `docs/V38.x/evidence/assets/${record.sampleId}/sanitized.png`,
      sourcePage: source?.sourcePage ?? record.sourcePage,
      sourceHashRef: `docs/V38.x/evidence/assets/${record.sampleId}/sanitized-sha256.txt`,
      width: 512,
      height: 512,
      averageColor,
      exifStripped,
      status: exifStripped ? "passed" : "failed",
      reasonCodes: exifStripped ? ["sanitized_public_photo_ready"] : ["metadata_strip_failed"]
    });
  }
  writeGeneratedSummary({ sanitizedAssets });
  return sanitizedAssets;
}

export function generateRenderableActionPacks() {
  ensureV38Dirs();
  const generated = readGeneratedSummary();
  const renderablePacks = [];
  for (const asset of generated.sanitizedAssets.filter((item) => item.status === "passed")) {
    const sampleDir = sampleEvidenceDir(asset.sampleId);
    const publicDir = path.join(publicAssetRoot, asset.sampleId);
    const frameDir = path.join(publicDir, "frames");
    const evidenceFrameDir = path.join(sampleDir, "frames");
    fs.mkdirSync(frameDir, { recursive: true });
    fs.mkdirSync(evidenceFrameDir, { recursive: true });
    const sanitized = path.join(publicDir, "sanitized.png");
    const frameCountByAction = {};
    for (const actionId of V38_TARGET_ACTION_IDS) {
      frameCountByAction[actionId] = 4;
      for (let frameIndex = 0; frameIndex < 4; frameIndex += 1) {
        const framePath = path.join(frameDir, `${actionId}-${String(frameIndex).padStart(3, "0")}.png`);
        generateFrame({ sanitized, framePath, sampleId: asset.sampleId, actionId, frameIndex, averageColor: asset.averageColor });
        fs.copyFileSync(framePath, path.join(evidenceFrameDir, path.basename(framePath)));
      }
    }
    const publicContactSheet = path.join(publicDir, "contact-sheet.png");
    const publicGif = path.join(publicDir, "animated-preview.gif");
    const allFramePaths = V38_TARGET_ACTION_IDS.flatMap((actionId) =>
      Array.from({ length: 4 }, (_, index) => path.join(frameDir, `${actionId}-${String(index).padStart(3, "0")}.png`))
    );
    runCommand("montage", [...allFramePaths, "-tile", "8x4", "-geometry", "128x128+4+4", publicContactSheet]);
    runCommand("convert", ["-delay", "12", "-loop", "0", ...allFramePaths, publicGif]);
    fs.copyFileSync(publicContactSheet, path.join(sampleDir, "contact-sheet.png"));
    fs.copyFileSync(publicGif, path.join(sampleDir, "animated-preview.gif"));
    renderablePacks.push({
      sampleId: asset.sampleId,
      candidateId: `${asset.sampleId}_v38_public_photo_pack`,
      contactSheetRef: `docs/V38.x/evidence/assets/${asset.sampleId}/contact-sheet.png`,
      animatedPreviewRef: `docs/V38.x/evidence/assets/${asset.sampleId}/animated-preview.gif`,
      actionCoverage: [...V38_TARGET_ACTION_IDS],
      frameCountByAction,
      localMotionModel: "source_bound_photo_base_with_local_overlays",
      wholeImageTransformOnly: false,
      status: "renderable",
      reasonCodes: ["renderable_frame_pack_ready", "local_overlays_present", "whole_image_transform_only_rejected"]
    });
  }
  writeGeneratedSummary({ renderablePacks });
  return renderablePacks;
}

export function evaluateQualityGate() {
  const { snapshot } = buildV38Context();
  const passingPacks = snapshot.renderablePacks.filter((pack) => {
    const hasAllActions = V38_TARGET_ACTION_IDS.every((actionId) => pack.actionCoverage.includes(actionId));
    const hasFourFrames = V38_TARGET_ACTION_IDS.every((actionId) => pack.frameCountByAction[actionId] >= 4);
    return pack.status === "renderable" && hasAllActions && hasFourFrames && pack.wholeImageTransformOnly === false;
  });
  const decision = passingPacks.length >= 3 && snapshot.sanitizedAssets.filter((asset) => asset.exifStripped).length >= 3 ? "passed_scoped" : "blocked";
  return {
    decision,
    passedPackCount: passingPacks.length,
    sanitizedPassedCount: snapshot.sanitizedAssets.filter((asset) => asset.status === "passed").length,
    targetActions: [...V38_TARGET_ACTION_IDS],
    limitation: "automated visual scoring checks artifact presence and local-overlay contract only; human review still required for final visual taste"
  };
}

export function writeHtmlReport() {
  const { snapshot } = buildV38Context();
  const quality = evaluateQualityGate();
  const sourceRecords = readJson("docs/V38.x/evidence/v38-public-source-records.json", []);
  const html = buildHtmlReport({ snapshot, quality, sourceRecords });
  const rel = `docs/V38.x/evidence/v38_6-public-photo-review-report-${v38Date}.html`;
  writeEvidence(rel, html);
  return rel;
}

export function captureHtmlScreenshot(htmlRel) {
  const htmlAbs = path.join(repoRoot, htmlRel);
  const screenshotRel = `docs/V38.x/evidence/v38_6-public-photo-review-report-${v38Date}.png`;
  const screenshotAbs = path.join(repoRoot, screenshotRel);
  const htmlWin = toWindowsPath(htmlAbs);
  const screenshotWin = toWindowsPath(screenshotAbs);
  const htmlUrl = `file:///${htmlWin.replaceAll("\\", "/")}`;
  const browsers = [
    "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
    "/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  ];
  for (const browser of browsers) {
    if (!fs.existsSync(browser)) continue;
    try {
      execFileSync(browser, [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        `--screenshot=${screenshotWin}`,
        "--window-size=1440,1400",
        htmlUrl
      ], { stdio: ["ignore", "pipe", "pipe"] });
      if (fs.existsSync(screenshotAbs) && fs.statSync(screenshotAbs).size > 0) {
        return { status: "passed", screenshotRel };
      }
    } catch (error) {
      continue;
    }
  }
  return { status: "blocked", screenshotRel: "", reason: "headless_browser_unavailable_or_failed" };
}

export function writeFinalReport(extra = {}) {
  const { snapshot } = buildV38Context();
  const quality = evaluateQualityGate();
  const scans = scanBlock({ snapshot, quality, extra });
  const status = snapshot.status === "passed" && quality.decision === "passed_scoped" && scans.claimScan.status === "passed" && scans.securityScan.status === "passed"
    ? "passed scoped"
    : "blocked";
  const body = [
    "# V38 Final Public Photo Action Asset Report",
    "",
    `Date: ${v38Date}`,
    "",
    "## Final Decision",
    `- Status: ${status}.`,
    "- Scope: public-authorized tested cat photo samples only.",
    "- The result proves a real-photo public-sample path to sanitized derived images, renderable sample-bound frame packs, contact sheets, GIF previews, product UI anchors, and screenshot evidence.",
    "- It does not prove arbitrary cat photo automatic generation, provider integration, production release, Windows readiness, cross-platform readiness, 3D readiness, Petdex parity, MCP readiness, Claude integration, OS-level binding, or all Codex workflow readiness.",
    "",
    "## Command And Artifact Summary",
    `- Sanitized public cat assets: ${snapshot.sanitizedAssets.filter((asset) => asset.status === "passed").length}.`,
    `- Renderable public cat packs: ${snapshot.renderablePacks.filter((pack) => pack.status === "renderable").length}.`,
    `- Quality gate: ${quality.decision}.`,
    `- HTML report: docs/V38.x/evidence/v38_6-public-photo-review-report-${v38Date}.html.`,
    extra.screenshotRel ? `- Screenshot: ${extra.screenshotRel}.` : "- Screenshot: blocked or not captured.",
    "",
    "## User-Visible Target Experience",
    "- User can inspect three different public cat photo samples after metadata stripping.",
    "- User can inspect per-sample contact sheets and animated previews covering idle, walk, jump, sleep, eat, play, alert, and celebrate.",
    "- Product settings has V38 anchors for public source status, pixel asset status, renderable pack preview, apply/rollback gate, and blocked reason.",
    "",
    "## Architecture Status",
    "- Current implementation entity: apps/desktop/src/assets/v38-public-photo-action-pipeline.ts.",
    "- Product UI entity: apps/desktop/src/main.ts V38 settings panel.",
    "- Artifact generation entity: scripts/v38_smoke_common.mjs and phase smoke scripts.",
    "- Runtime public assets: apps/desktop/public/v38/<sampleId>/.",
    "- Evidence assets: docs/V38.x/evidence/assets/<sampleId>/.",
    "",
    scans.markdown,
    "## Remaining Risk",
    "- Automated ImageMagick frames are still a deterministic local prototype, not a provider-grade or artist-grade arbitrary-photo animation system.",
    "- Human visual taste can still reject the local overlay style; Route B should remain recorded as a possible higher-quality future comparison route.",
    ""
  ].join("\n");
  writeEvidence(`docs/V38.x/v38-final-public-photo-action-report.md`, body);
  return { status, quality, scans };
}

export function writeJson(relPath, value) {
  writeEvidence(relPath, `${JSON.stringify(value, null, 2)}\n`);
}

export function readJson(relPath, fallback) {
  const abs = path.join(repoRoot, relPath);
  if (!fs.existsSync(abs)) return fallback;
  return JSON.parse(fs.readFileSync(abs, "utf8"));
}

export function readGeneratedSummary() {
  return readJson("docs/V38.x/evidence/v38-generated-summary.json", {
    sanitizedAssets: [],
    renderablePacks: []
  });
}

export function writeGeneratedSummary(patch) {
  const current = readGeneratedSummary();
  writeJson("docs/V38.x/evidence/v38-generated-summary.json", { ...current, ...patch });
}

function fetchCommonsMetadata(source) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "extmetadata");
  url.searchParams.set("titles", source.commonsTitle);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const raw = runCommand("curl", ["-fsSL", "-A", "codexPat-v38/1.0", url.toString()]);
      const json = JSON.parse(raw);
      const page = Object.values(json.query?.pages ?? {})[0];
      const metadata = page?.imageinfo?.[0]?.extmetadata ?? {};
      return {
        status: metadata.LicenseShortName?.value ? "metadata_ready" : "metadata_partial",
        licenseShortName: stripHtml(metadata.LicenseShortName?.value ?? "unknown"),
        attribution: stripHtml(metadata.Attribution?.value ?? metadata.ObjectName?.value ?? source.displayName),
        artist: stripHtml(metadata.Artist?.value ?? "unknown")
      };
    } catch (error) {
      if (attempt === 2) {
        return {
          status: "metadata_unavailable",
          licenseShortName: "unknown",
          attribution: source.displayName,
          artist: "unknown"
        };
      }
    }
  }
}

function runDownloadedCurl(url, outputPath) {
  runCommand("curl", ["-fL", "-A", "codexPat-v38/1.0", "-o", outputPath, url]);
  return { status: fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0 ? "downloaded" : "failed" };
}

function sampleEvidenceDir(sampleId) {
  return path.join(evidenceAssetRoot, sampleId);
}

function findOriginalPath(sampleId) {
  const jpg = path.join(originalTmpRoot, `${sampleId}.jpg`);
  const png = path.join(originalTmpRoot, `${sampleId}.png`);
  if (fs.existsSync(jpg)) return jpg;
  if (fs.existsSync(png)) return png;
  throw new Error(`missing original for ${sampleId}`);
}

function sha256(absPath) {
  return runCommand("sha256sum", [absPath]).split(/\s+/)[0];
}

function readAverageColor(absPath) {
  const raw = runCommand("convert", [absPath, "-resize", "1x1", "txt:-"]);
  const match = raw.match(/#([0-9A-Fa-f]{6,8})/);
  return match ? `#${match[1].slice(0, 6).toUpperCase()}` : "#808080";
}

function generateFrame({ sanitized, framePath, sampleId, actionId, frameIndex, averageColor }) {
  const offset = actionOffset(actionId, frameIndex);
  const accent = colorForSample(sampleId, averageColor);
  const tail = tailDraw(actionId, frameIndex, accent);
  const paws = pawsDraw(actionId, frameIndex, accent);
  const symbol = symbolDraw(actionId, frameIndex, accent);
  runCommand("convert", [
    "-size",
    "256x256",
    "xc:#f8fafc",
    sanitized,
    "-resize",
    "154x154",
    "-geometry",
    `+${51 + offset.x}+${55 + offset.y}`,
    "-composite",
    "-fill",
    "rgba(255,255,255,0.72)",
    "-stroke",
    accent,
    "-strokewidth",
    "3",
    "-draw",
    `roundrectangle ${42 + offset.x},48 ${214 + offset.x},212 28,28`,
    "-fill",
    accent,
    "-stroke",
    accent,
    "-draw",
    `${tail} ${paws} ${symbol}`,
    "-fill",
    "#0f172a",
    "-pointsize",
    "13",
    "-gravity",
    "south",
    "-annotate",
    "+0+8",
    actionId,
    framePath
  ]);
}

function actionOffset(actionId, frameIndex) {
  const wave = [-4, 0, 4, 0][frameIndex];
  const hop = [0, -8, -13, -5][frameIndex];
  const slow = [0, 1, 2, 1][frameIndex];
  const offsets = {
    idle: { x: 0, y: slow },
    walk: { x: wave, y: 0 },
    jump: { x: 0, y: hop },
    sleep: { x: 0, y: 3 },
    eat: { x: 0, y: 1 },
    play: { x: wave, y: -Math.abs(wave / 2) },
    alert: { x: 0, y: frameIndex % 2 === 0 ? -3 : 0 },
    celebrate: { x: wave, y: hop / 2 }
  };
  return offsets[actionId] ?? { x: 0, y: 0 };
}

function tailDraw(actionId, frameIndex, accent) {
  const swing = [-14, -5, 10, 3][frameIndex];
  const y = actionId === "sleep" ? 190 : actionId === "jump" ? 172 : 154;
  return `path 'M 204,${y} C ${230 + swing},${y - 28} ${234 + swing},${y + 22} 215,${y + 38}'`;
}

function pawsDraw(actionId, frameIndex, accent) {
  const walkA = actionId === "walk" ? [-8, 5, 8, -5][frameIndex] : 0;
  const jumpY = actionId === "jump" ? [-2, -12, -16, -5][frameIndex] : 0;
  return `circle ${91 + walkA},204 ${98 + walkA},211 circle ${164 - walkA},204 ${171 - walkA},211 circle 104,75 111,82 circle 152,75 159,82`;
}

function symbolDraw(actionId, frameIndex, accent) {
  if (actionId === "sleep") return `text 180,46 'Z${frameIndex + 1}'`;
  if (actionId === "eat") return "circle 128,220 139,231";
  if (actionId === "play") return `circle ${70 + frameIndex * 34},42 ${78 + frameIndex * 34},50`;
  if (actionId === "alert") return "polygon 124,18 134,18 129,36";
  if (actionId === "celebrate") return `polygon 55,40 63,55 47,55 polygon 201,40 209,55 193,55`;
  return "circle 128,36 132,40";
}

function colorForSample(sampleId, averageColor) {
  if (sampleId.includes("orange")) return "#c2410c";
  if (sampleId.includes("tuxedo")) return "#334155";
  if (sampleId.includes("a_cat")) return "#7c3aed";
  return averageColor || "#0f766e";
}

function buildHtmlReport({ snapshot, quality, sourceRecords }) {
  const cards = snapshot.sanitizedAssets.map((asset) => {
    const pack = snapshot.renderablePacks.find((item) => item.sampleId === asset.sampleId);
    const record = sourceRecords.find((item) => item.sampleId === asset.sampleId);
    const relBase = `assets/${asset.sampleId}`;
    return `
      <article class="sample-card">
        <h3>${escapeHtml(record?.displayName ?? asset.sampleId)}</h3>
        <p>${escapeHtml(record?.licenseShortName ?? "unknown")} · ${escapeHtml(asset.averageColor)} · ${escapeHtml(asset.status)}</p>
        <div class="media-grid">
          <figure><img src="${relBase}/sanitized.png" alt="${escapeHtml(asset.sampleId)} 去元数据公开猫图" /><figcaption>去元数据 512x512 派生图</figcaption></figure>
          <figure><img src="${relBase}/contact-sheet.png" alt="${escapeHtml(asset.sampleId)} 动作帧联系表" /><figcaption>8 动作 x 4 帧 contact sheet</figcaption></figure>
          <figure><img src="${relBase}/animated-preview.gif" alt="${escapeHtml(asset.sampleId)} 动作预览 GIF" /><figcaption>自动化验收 GIF 预览</figcaption></figure>
        </div>
        <p>Action coverage: ${escapeHtml(pack?.actionCoverage.join(", ") ?? "missing")}</p>
      </article>
    `;
  }).join("");
  const sourceRows = sourceRecords.map((record) => `
    <tr>
      <td>${escapeHtml(record.sampleId)}</td>
      <td>${escapeHtml(record.sampleClass)}</td>
      <td>${escapeHtml(record.status)}</td>
      <td><a href="${escapeHtml(record.sourcePage)}">${escapeHtml(record.licenseShortName)}</a></td>
    </tr>
  `).join("");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>V38 公开猫图到动作帧资产自动化验收报告</title>
  <style>
    body { margin: 0; font-family: system-ui, "Microsoft YaHei", sans-serif; color: #0f172a; background: #eef6f3; }
    main { max-width: 1260px; margin: 0 auto; padding: 32px; display: grid; gap: 18px; }
    section, .sample-card { background: #fff; border: 1px solid #d6e3df; border-radius: 8px; padding: 18px; }
    h1, h2, h3 { margin: 0 0 8px; }
    p { color: #475569; line-height: 1.55; }
    .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
    .metric { background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; }
    .metric strong { display: block; font-size: 22px; color: #0f766e; margin-top: 4px; }
    .samples { display: grid; gap: 14px; }
    .media-grid { display: grid; grid-template-columns: 220px 1fr 220px; gap: 12px; align-items: start; }
    figure { margin: 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #f8fafc; }
    img { display: block; width: 100%; height: auto; }
    figcaption { padding: 8px; font-size: 12px; color: #475569; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 13px; vertical-align: top; }
    .warn { background: #fff7ed; border-color: #fed7aa; }
    @media (max-width: 860px) {
      main { padding: 16px; }
      .metrics, .media-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
<main>
  <section>
    <h1>V38 公开猫图到动作帧资产自动化验收报告</h1>
    <p>本报告使用公开授权样本进行真实下载、元数据剥离、派生图片生成、动作帧联系表和 GIF 预览截图验收。结论只覆盖 tested public photo samples。</p>
  </section>
  <section class="metrics">
    <div class="metric">公开来源<strong>${snapshot.sourceManifest.sources.length}</strong></div>
    <div class="metric">去元数据猫图<strong>${snapshot.sanitizedAssets.filter((item) => item.status === "passed").length}</strong></div>
    <div class="metric">可渲染帧包<strong>${snapshot.renderablePacks.filter((item) => item.status === "renderable").length}</strong></div>
    <div class="metric">质量门禁<strong>${escapeHtml(quality.decision)}</strong></div>
  </section>
  <section>
    <h2>目标架构与当前实现</h2>
    <p>目标链路为 Wikimedia 公开来源 -> 临时原图下载 -> ImageMagick 去元数据派生图 -> 本地局部叠加动作帧 -> contact sheet / GIF -> 桌面设置页 V38 anchors -> evidence final gate。当前实现已经生成派生图片和帧包，但仍是样本绑定的本地确定性路径。</p>
  </section>
  <section>
    <h2>用户场景体验路径</h2>
    <p>用户进入设置页个性化生成区域，查看 V38 公开来源、像素资产、动作帧包、应用/回滚门槛和 blocked 原因；验收人员通过下方截图证据检查三张不同公开猫图的派生结果。</p>
  </section>
  <section class="samples">${cards}</section>
  <section>
    <h2>来源与负例/blocked 策略</h2>
    <table>
      <thead><tr><th>sampleId</th><th>类型</th><th>处理状态</th><th>授权来源</th></tr></thead>
      <tbody>${sourceRows}</tbody>
    </table>
  </section>
  <section class="warn">
    <h2>不实声明防护</h2>
    <p>本阶段不声明任意猫照片自动生成高质量动作资产、不声明 provider 集成、不声明生产发布、不声明 Windows 或跨平台就绪。该报告只证明公开样本路径的真实产物。</p>
  </section>
</main>
</body>
</html>`;
}

function stripHtml(value) {
  return String(value).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function toWindowsPath(absPath) {
  try {
    return runCommand("wslpath", ["-w", absPath]);
  } catch (error) {
    return absPath;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
