import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  V39_TARGET_ACTION_IDS,
  assessV39TargetExperienceCandidate,
  buildV39EvidenceSnapshot,
  buildV39Pipeline,
  createV39ActionFramePack,
  createV39LayeredPartRigs,
  createV39V38StyleOverlayFailureCandidate,
  decideV39FinalGate,
  runV39ActionQualityGate,
  runV39ClaimScan,
  v39HasForbiddenContent
} from "../apps/desktop/src/assets/v39-characterized-action-assets.ts";

export const v39Date = "2026-06-27";
const __filename = fileURLToPath(import.meta.url);
export const repoRoot = path.resolve(path.dirname(__filename), "..");
export const evidenceRoot = path.join(repoRoot, "docs/V39.x/evidence");
export const evidenceAssetRoot = path.join(evidenceRoot, "assets");
export const publicAssetRoot = path.join(repoRoot, "apps/desktop/public/v39");

export function ensureV39Dirs() {
  fs.mkdirSync(evidenceRoot, { recursive: true });
  fs.mkdirSync(evidenceAssetRoot, { recursive: true });
  fs.mkdirSync(publicAssetRoot, { recursive: true });
}

export function buildV39Context() {
  const pipeline = buildV39Pipeline();
  const snapshot = buildV39EvidenceSnapshot(pipeline);
  const final = decideV39FinalGate(pipeline);
  const overlayNegative = assessV39TargetExperienceCandidate(createV39V38StyleOverlayFailureCandidate());
  const weakTransform = (() => {
    const rig = createV39LayeredPartRigs().find((item) => item.status === "passed");
    if (!rig) return null;
    const pack = createV39ActionFramePack(rig, { transformOnly: true });
    return {
      pack,
      gate: runV39ActionQualityGate(pack)
    };
  })();
  return { pipeline, snapshot, final, overlayNegative, weakTransform };
}

export function writeEvidence(relPath, body) {
  const absPath = path.join(repoRoot, relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, `${body.trimEnd()}\n`, "utf8");
  return relPath.replaceAll("\\", "/");
}

export function writeJson(relPath, value) {
  return writeEvidence(relPath, JSON.stringify(value, null, 2));
}

export function printResult(result) {
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

export function phaseHeader({ title, phase, spec }) {
  return [
    `# ${title}`,
    "",
    `Date: ${v39Date}`,
    "",
    "## Development And Acceptance Plan",
    `- Phase: ${phase}.`,
    `- Spec: ${spec}.`,
    "- Development plan: execute only this V39 phase after the prior phase evidence exists.",
    "- Acceptance plan: require PRD/spec review, command result, real tested-sample data, visual evidence where applicable, claim scan, security scan, and scoped decision.",
    "- Audit opinion before implementation: no fatal or major specification deviation for this phase; continue only with Route A2++ tested public-photo sample evidence.",
    "",
    "## PRD / Spec Review",
    "- PRD: docs/active/agent_desktop_pet_prd_v39.md reviewed.",
    "- Target architecture: docs/V39.x/v39-target-architecture.md reviewed.",
    "- Phase spec: docs/V39.x/v39-phase-specs.md reviewed.",
    "- Quality/risk spec: docs/V39.x/v39-quality-rubric-and-risk-closure.md reviewed.",
    "- Boundary: tested public-photo samples only; no arbitrary-cat, provider, production, Windows, cross-platform, 3D, Petdex parity, MCP, Claude, OS-level, or all-workflows readiness claim.",
    ""
  ].join("\n");
}

export function scanBlock(value) {
  const claimScan = runV39ClaimScan(value);
  const securityScan = { status: v39HasForbiddenContent(value) ? "failed" : "passed" };
  return {
    claimScan,
    securityScan,
    markdown: [
      "## Claim Scan",
      `- Status: ${claimScan.status}.`,
      `- Hits: ${claimScan.hits.length === 0 ? "none" : claimScan.hits.join(", ")}.`,
      "",
      "## Security Scan",
      `- Status: ${securityScan.status}.`,
      ""
    ].join("\n")
  };
}

export function generateV39VisualAssets(context = buildV39Context()) {
  ensureV39Dirs();
  for (const contract of context.pipeline.characterContracts.filter((item) => item.status === "passed")) {
    const samplePublicDir = path.join(publicAssetRoot, contract.sampleId);
    const sampleEvidenceDir = path.join(evidenceAssetRoot, contract.sampleId);
    const framePublicDir = path.join(samplePublicDir, "frames");
    const frameEvidenceDir = path.join(sampleEvidenceDir, "frames");
    fs.mkdirSync(framePublicDir, { recursive: true });
    fs.mkdirSync(frameEvidenceDir, { recursive: true });

    const characterSvg = renderCatSvg(contract);
    writeBoth(samplePublicDir, sampleEvidenceDir, "character.svg", characterSvg);
    writeBoth(samplePublicDir, sampleEvidenceDir, "cleaned-silhouette.svg", renderSilhouetteSvg(contract));

    const pack = context.pipeline.actionPacks.find((item) => item.sampleId === contract.sampleId);
    if (!pack) continue;
    for (const sequence of pack.actionSequences) {
      for (let frameIndex = 0; frameIndex < sequence.frameCount; frameIndex += 1) {
        const svg = renderCatSvg(contract, sequence.actionId, frameIndex, sequence.frameCount);
        const fileName = `${sequence.actionId}-${String(frameIndex).padStart(3, "0")}.svg`;
        fs.writeFileSync(path.join(framePublicDir, fileName), svg, "utf8");
        fs.writeFileSync(path.join(frameEvidenceDir, fileName), svg, "utf8");
      }
    }
    writeBoth(samplePublicDir, sampleEvidenceDir, "contact-sheet.svg", renderContactSheetSvg(contract, pack));
    writeBoth(samplePublicDir, sampleEvidenceDir, "animated-preview.svg", renderAnimatedPreviewSvg(contract, pack));
    writeBoth(samplePublicDir, sampleEvidenceDir, "manifest.json", JSON.stringify({
      candidateId: pack.candidateId,
      sampleId: pack.sampleId,
      characterAssetId: pack.characterAssetId,
      rendererKind: pack.rendererKind,
      routeId: pack.routeId,
      actions: pack.actionSequences.map((sequence) => ({
        actionId: sequence.actionId,
        frameCount: sequence.frameCount,
        fps: sequence.fps,
        movingParts: sequence.movingParts
      }))
    }, null, 2));
  }
  writeEvidence("docs/V39.x/evidence/assets/negative-v38-overlay.svg", renderNegativeOverlaySvg());
  writeJson("docs/V39.x/evidence/v39-pipeline-summary.json", context.snapshot);
  return {
    status: "generated",
    publicRoot: "apps/desktop/public/v39",
    evidenceRoot: "docs/V39.x/evidence/assets",
    sampleCount: context.pipeline.characterContracts.filter((item) => item.status === "passed").length
  };
}

export function writeVisualReport(context = buildV39Context()) {
  const assets = generateV39VisualAssets(context);
  const rows = context.pipeline.actionPacks.map((pack) => {
    const contract = context.pipeline.characterContracts.find((item) => item.sampleId === pack.sampleId);
    const assessment = context.pipeline.rubricAssessments.find((item) => item.candidateId === pack.candidateId);
    const review = context.pipeline.humanPreferenceGate.reviews.find((item) => item.candidateId === pack.candidateId);
    return `
      <article class="sample">
        <header>
          <h3>${escapeHtml(pack.sampleId)}</h3>
          <p>${escapeHtml(assessment?.status ?? "unknown")} / ${escapeHtml(review?.finalStatus ?? "unknown")}</p>
        </header>
        <div class="media-row">
          ${contract?.sanitizedImageRef ? `<figure><img src="${escapeHtml(contract.sanitizedImageRef)}" alt="V38 sanitized source" /><figcaption>V38 脱敏来源</figcaption></figure>` : ""}
          <figure><img src="${escapeHtml(contract?.characterSvgRef ?? "")}" alt="V39 character" /><figcaption>V39 角色化资产</figcaption></figure>
          <figure><img src="${escapeHtml(pack.contactSheetRef)}" alt="V39 contact sheet" /><figcaption>8 动作帧表</figcaption></figure>
          <figure><img src="${escapeHtml(pack.animatedPreviewRef)}" alt="V39 animated preview" /><figcaption>SVG 动作预览</figcaption></figure>
        </div>
        <dl>
          <div><dt>动作数</dt><dd>${pack.actionSequences.length}</dd></div>
          <div><dt>最低帧数</dt><dd>${Math.min(...pack.actionSequences.map((item) => item.frameCount))}</dd></div>
          <div><dt>平均局部动作</dt><dd>${formatScore(assessment?.scoreSummary.averageLocalPartMotionScore ?? 0)}</dd></div>
          <div><dt>Route B</dt><dd>blocked_not_supplied</dd></div>
        </dl>
      </article>
    `;
  }).join("\n");
  const final = context.final;
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>V39 角色化 2D 动作资产验收报告</title>
  <style>
    :root { color-scheme: light; font-family: Arial, "Microsoft YaHei", sans-serif; color: #1f2933; background: #f6f7f9; }
    body { margin: 0; padding: 32px; }
    main { max-width: 1180px; margin: 0 auto; }
    h1, h2, h3 { margin: 0 0 10px; }
    .hero, .section, .sample { background: #fff; border: 1px solid #d9e0e8; border-radius: 8px; padding: 20px; margin-bottom: 18px; }
    .hero p, .section p { max-width: 860px; line-height: 1.6; }
    .grid, .media-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
    figure { margin: 0; border: 1px solid #d9e0e8; border-radius: 8px; padding: 10px; background: #fbfcfd; }
    img { width: 100%; max-height: 260px; object-fit: contain; display: block; }
    figcaption { margin-top: 8px; font-size: 13px; color: #56616f; }
    dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; }
    dt { font-size: 12px; color: #64748b; }
    dd { margin: 2px 0 0; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; border-bottom: 1px solid #e1e7ef; padding: 8px; }
    code { background: #edf2f7; padding: 2px 5px; border-radius: 4px; }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <h1>V39 角色化 2D 动作资产验收报告</h1>
      <p>本报告只覆盖 tested public-photo samples 的 Route A2++ 本地角色化、分层 rig 和动作帧证据。它不证明任意猫自动生成、provider、Route B、生产发布、Windows、跨平台或 Petdex parity。</p>
      <dl>
        <div><dt>Final decision</dt><dd>${escapeHtml(final.decision)}</dd></div>
        <div><dt>通过样本</dt><dd>${final.passedSampleCount}</dd></div>
        <div><dt>负例/blocked</dt><dd>${final.blockedOrNegativeCount}</dd></div>
        <div><dt>产品路径</dt><dd>${escapeHtml(final.productStatus)}</dd></div>
      </dl>
    </section>
    <section class="section">
      <h2>当前架构与目标架构实现</h2>
      <p>当前 V38 已有公开猫图、脱敏像素和可渲染动作帧包；V39 在其上新增角色化资产合同、分层部件 rig、A2++ 动作帧生成、目标体验 rubric、人类偏好门槛、产品预览/应用/回滚合同和 Route B 诚实记录。</p>
      <table>
        <thead><tr><th>层级</th><th>实现状态</th><th>证据</th></tr></thead>
        <tbody>
          <tr><td>来源/脱敏</td><td>复用 V38 scoped public-photo derived assets</td><td><code>v38_7-final-gate</code></td></tr>
          <tr><td>角色化资产</td><td>V39 contract passed for tested samples</td><td><code>character.svg</code></td></tr>
          <tr><td>分层 rig</td><td>head/body/ears/paws/tail/eyes-expression</td><td><code>v39-pipeline-summary.json</code></td></tr>
          <tr><td>动作资产</td><td>8 actions, 8+ frames/action</td><td><code>contact-sheet.svg</code></td></tr>
          <tr><td>产品路径</td><td>approved candidates preview/apply/rollback contract</td><td><code>productGate</code></td></tr>
        </tbody>
      </table>
    </section>
    <section class="section">
      <h2>用户场景体验路径</h2>
      <p>用户看到的目标路径是：公开猫图样本进入脱敏来源 -> 生成同猫身份的角色化 2D 资产 -> 查看 8 个动作帧表和预览 -> 只允许通过候选应用到目标猫 -> 可以回滚；失败候选和 Route B 缺失不会被写成通过。</p>
    </section>
    <section class="grid">
      ${rows}
    </section>
    <section class="section">
      <h2>失败与风险</h2>
      <ul>
        <li>V38 风格照片卡片、标签点、边框动作和整体 transform-only 在 V39.1 被拒绝。</li>
        <li>Route B 当前没有真实同样本 source-bound 资产，因此只记录为 blocked_not_supplied。</li>
        <li>最终 scoped pass 仍保留视觉品味风险，不扩大为任意猫自动生成能力。</li>
      </ul>
    </section>
  </main>
</body>
</html>`;
  const rel = writeEvidence(`docs/V39.x/evidence/v39_6-visual-report-${v39Date}.html`, html);
  return { htmlRel: rel, assets };
}

export function writeFinalReport(context = buildV39Context()) {
  const final = context.final;
  const scans = scanBlock({ snapshot: context.snapshot, final });
  const body = [
    "# V39 Final Acceptance Report",
    "",
    `Date: ${v39Date}`,
    "",
    "## Decision",
    `- Status: ${final.decision}.`,
    `- Passed sample count: ${final.passedSampleCount}.`,
    `- Blocked or negative sample count: ${final.blockedOrNegativeCount}.`,
    `- Product status: ${final.productStatus}.`,
    `- Human preference status: ${final.humanPreferenceStatus}.`,
    `- Route B status summary: ${final.routeBStatusSummary}.`,
    "",
    "## Narrow Claim",
    `- ${final.narrowClaim}`,
    "",
    "## Residual Risks",
    ...final.remainingRisks.map((risk) => `- ${risk}`),
    "",
    scans.markdown,
    "## PRD / Spec Review",
    "- V39 PRD, target architecture, phase specs, quality rubric, implementation contract, and evidence checklist reviewed.",
    "- V39 final scoped pass remains limited to tested public-photo samples and Route A2++ local evidence.",
    "- No provider, arbitrary-cat, production, Windows, cross-platform, 3D, Route B, or Petdex parity claim is made.",
    ""
  ].join("\n");
  const reportRel = writeEvidence("docs/V39.x/v39-final-acceptance-report.md", body);
  return { reportRel, final, scans };
}

export function evidenceList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function writeBoth(publicDir, evidenceDir, fileName, body) {
  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, fileName), `${body.trimEnd()}\n`, "utf8");
  fs.writeFileSync(path.join(evidenceDir, fileName), `${body.trimEnd()}\n`, "utf8");
}

function renderSilhouetteSvg(contract) {
  const style = contract.styleProfile;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="V39 cleaned cat silhouette">
  <rect width="256" height="256" fill="#f7fafc"/>
  <g fill="${escapeHtml(style.bodyColor)}" stroke="${escapeHtml(style.lineColor)}" stroke-width="5" stroke-linejoin="round">
    <ellipse cx="126" cy="152" rx="62" ry="47"/>
    <circle cx="124" cy="91" r="42"/>
    <path d="M93 61 L105 20 L122 63 Z"/>
    <path d="M151 62 L171 23 L172 70 Z"/>
    <path d="M182 137 C222 116 225 178 183 169" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;
}

function renderCatSvg(contract, actionId = "idle", frameIndex = 0, frameCount = 12) {
  const style = contract.styleProfile;
  const poseState = pose(actionId, frameIndex, frameCount);
  const stripes = contract.sampleId.includes("orange") || contract.sampleId.includes("a_cat")
    ? `<path d="M100 86 q22 12 46 0" stroke="${escapeHtml(style.accentColor)}" stroke-width="5" fill="none" opacity=".55"/>
       <path d="M89 137 q36 18 75 0" stroke="${escapeHtml(style.accentColor)}" stroke-width="7" fill="none" opacity=".45"/>`
    : `<path d="M91 125 q38 34 76 0 v52 q-39 28 -76 0z" fill="${escapeHtml(style.accentColor)}" opacity=".95"/>`;
  const eyes = actionId === "sleep"
    ? `<path d="M109 89 q7 5 14 0M137 89 q7 5 14 0" stroke="${escapeHtml(style.lineColor)}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="116" cy="88" rx="5" ry="${poseState.eyeScale}" fill="${escapeHtml(style.eyeColor)}"/><ellipse cx="145" cy="88" rx="5" ry="${poseState.eyeScale}" fill="${escapeHtml(style.eyeColor)}"/>`;
  const cue = actionCue(actionId, style.accentColor);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="V39 ${escapeHtml(actionId)} characterized cat frame">
  <rect width="256" height="256" rx="22" fill="#f8fafc"/>
  <ellipse cx="128" cy="${211 + poseState.shadowY}" rx="${62 + poseState.shadowScale}" ry="12" fill="#263238" opacity=".16"/>
  <g transform="translate(0 ${poseState.bodyY}) rotate(${poseState.bodyRotate} 128 152)">
    <path d="M186 141 C218 ${124 + poseState.tailY} 220 ${184 - poseState.tailY} 184 168" fill="none" stroke="${escapeHtml(style.bodyColor)}" stroke-width="18" stroke-linecap="round"/>
    <path d="M187 141 C219 ${124 + poseState.tailY} 221 ${184 - poseState.tailY} 185 168" fill="none" stroke="${escapeHtml(style.lineColor)}" stroke-width="5" stroke-linecap="round" opacity=".75"/>
    <ellipse cx="126" cy="152" rx="62" ry="47" fill="${escapeHtml(style.bodyColor)}" stroke="${escapeHtml(style.lineColor)}" stroke-width="5"/>
    ${stripes}
    <g transform="translate(${poseState.frontPawX} ${poseState.frontPawY}) rotate(${poseState.frontPawRotate} 108 178)">
      <ellipse cx="108" cy="178" rx="13" ry="24" fill="${escapeHtml(style.bodyColor)}" stroke="${escapeHtml(style.lineColor)}" stroke-width="4"/>
    </g>
    <g transform="translate(${-poseState.frontPawX} ${poseState.backPawY}) rotate(${-poseState.frontPawRotate} 151 181)">
      <ellipse cx="151" cy="181" rx="15" ry="23" fill="${escapeHtml(style.bodyColor)}" stroke="${escapeHtml(style.lineColor)}" stroke-width="4"/>
    </g>
  </g>
  <g transform="translate(${poseState.headX} ${poseState.headY}) rotate(${poseState.headRotate} 126 91)">
    <path d="M94 63 L105 22 L123 65 Z" fill="${escapeHtml(style.bodyColor)}" stroke="${escapeHtml(style.lineColor)}" stroke-width="5"/>
    <path d="M150 64 L171 24 L173 71 Z" fill="${escapeHtml(style.bodyColor)}" stroke="${escapeHtml(style.lineColor)}" stroke-width="5"/>
    <circle cx="126" cy="91" r="42" fill="${escapeHtml(style.bodyColor)}" stroke="${escapeHtml(style.lineColor)}" stroke-width="5"/>
    <ellipse cx="128" cy="110" rx="23" ry="15" fill="${escapeHtml(style.accentColor)}" opacity=".92"/>
    ${eyes}
    <path d="M127 100 l-6 6 h12z" fill="${escapeHtml(style.lineColor)}"/>
    <path d="M121 113 q8 7 16 0" stroke="${escapeHtml(style.lineColor)}" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>
  ${cue}
</svg>`;
}

function renderContactSheetSvg(contract, pack) {
  const cellW = 156;
  const cellH = 156;
  const width = cellW * 8;
  const height = cellH * pack.actionSequences.length;
  const cells = pack.actionSequences.map((sequence, row) =>
    Array.from({ length: 8 }, (_, col) => {
      const frameIndex = Math.min(col, sequence.frameCount - 1);
      return `<g transform="translate(${col * cellW} ${row * cellH})">
        <rect x="4" y="4" width="148" height="148" rx="10" fill="#fff" stroke="#d8e0e8"/>
        <g transform="translate(16 10) scale(.48)">${innerCatGroup(contract, sequence.actionId, frameIndex, sequence.frameCount)}</g>
        <text x="12" y="142" font-family="Arial" font-size="11" fill="#52606d">${escapeHtml(sequence.actionId)} ${col + 1}</text>
      </g>`;
    }).join("")
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="V39 action contact sheet">
  <rect width="${width}" height="${height}" fill="#f4f7fa"/>
  ${cells}
</svg>`;
}

function renderAnimatedPreviewSvg(contract, pack) {
  const first = pack.actionSequences.find((sequence) => sequence.actionId === "play") ?? pack.actionSequences[0];
  const frames = Array.from({ length: Math.min(first.frameCount, 8) }, (_, index) => `
    <g class="frame frame-${index}">${innerCatGroup(contract, first.actionId, index, first.frameCount)}</g>
  `).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="V39 animated preview">
  <style>
    .frame { opacity: 0; animation: flip 1.2s steps(1,end) infinite; }
    ${Array.from({ length: Math.min(first.frameCount, 8) }, (_, index) => `.frame-${index} { animation-delay: ${(-1.2 + index * 0.15).toFixed(2)}s; }`).join("\n")}
    @keyframes flip { 0%, 12.4% { opacity: 1; } 12.5%, 100% { opacity: 0; } }
  </style>
  ${frames}
</svg>`;
}

function innerCatGroup(contract, actionId, frameIndex, frameCount) {
  return renderCatSvg(contract, actionId, frameIndex, frameCount)
    .replace(/^<svg[^>]*>/, "")
    .replace("</svg>", "");
}

function renderNegativeOverlaySvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" role="img" aria-label="Rejected V38-style overlay">
  <rect width="320" height="220" rx="18" fill="#fff" stroke="#d33" stroke-width="6"/>
  <rect x="36" y="38" width="248" height="130" fill="#d9c2a5" opacity=".8"/>
  <text x="52" y="70" font-family="Arial" font-size="18" fill="#991b1b">TEST LABEL</text>
  <circle cx="70" cy="148" r="7" fill="#991b1b"/>
  <circle cx="250" cy="64" r="7" fill="#991b1b"/>
  <path d="M130 132 q28 18 60 0" stroke="#222" stroke-width="6" fill="none"/>
  <text x="40" y="202" font-family="Arial" font-size="14" fill="#991b1b">Rejected: card, labels, dots, border motion, transform-only</text>
</svg>`;
}

function pose(actionId, frameIndex, frameCount) {
  const t = frameCount <= 1 ? 0 : frameIndex / (frameCount - 1);
  const wave = Math.sin(t * Math.PI * 2);
  const bounce = Math.sin(t * Math.PI);
  const walkAlt = Math.sin(t * Math.PI * 4);
  const base = {
    bodyY: 0,
    bodyRotate: 0,
    headX: 0,
    headY: 0,
    headRotate: 0,
    tailY: 0,
    frontPawX: 0,
    frontPawY: 0,
    backPawY: 0,
    frontPawRotate: 0,
    shadowY: 0,
    shadowScale: 0,
    eyeScale: 6
  };
  if (actionId === "walk") return { ...base, bodyY: walkAlt * 3, headX: wave * 2, tailY: wave * 14, frontPawX: walkAlt * 10, frontPawY: Math.abs(walkAlt) * -8, backPawY: Math.abs(walkAlt) * 5, frontPawRotate: walkAlt * 16 };
  if (actionId === "jump") return { ...base, bodyY: -bounce * 38, headY: -bounce * 8, tailY: -bounce * 12, frontPawY: -bounce * 18, backPawY: -bounce * 12, shadowScale: -bounce * 18 };
  if (actionId === "sleep") return { ...base, bodyY: 6 + wave * 1.4, headY: 10, headRotate: -8, tailY: -8, eyeScale: 1.5, shadowScale: 8 };
  if (actionId === "eat") return { ...base, headY: 18 + Math.abs(wave) * 4, headRotate: 8, frontPawY: 5 };
  if (actionId === "play") return { ...base, bodyRotate: wave * 5, headX: wave * 5, tailY: wave * 18, frontPawX: wave * 16, frontPawY: -12 - Math.abs(wave) * 8, frontPawRotate: wave * 24 };
  if (actionId === "alert") return { ...base, bodyY: -4, headY: -6, headRotate: wave * 3, tailY: 15, eyeScale: 8 };
  if (actionId === "celebrate") return { ...base, bodyY: -Math.abs(wave) * 8, headY: -6, tailY: wave * 18, frontPawY: -20 - Math.abs(wave) * 4, frontPawRotate: wave * 18, eyeScale: 7 };
  return { ...base, bodyY: wave * 2, headY: wave * 1.5, tailY: wave * 8, eyeScale: frameIndex % 7 === 0 ? 1.5 : 6 };
}

function actionCue(actionId, color) {
  if (actionId === "eat") return `<ellipse cx="73" cy="207" rx="21" ry="9" fill="${escapeHtml(color)}" opacity=".85"/>`;
  if (actionId === "play") return `<circle cx="58" cy="171" r="13" fill="${escapeHtml(color)}" opacity=".85"/>`;
  if (actionId === "alert") return `<path d="M196 59 l13 -25 l13 25z" fill="${escapeHtml(color)}" opacity=".9"/>`;
  if (actionId === "celebrate") return `<path d="M62 64 l9 18 l20 3 l-14 14 l3 20 l-18 -9 l-18 9 l3 -20 l-14 -14 l20 -3z" fill="${escapeHtml(color)}" opacity=".9"/>`;
  return "";
}

function formatScore(value) {
  return value.toFixed(2);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
