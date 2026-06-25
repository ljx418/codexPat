import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { resolve } from "node:path";

import { CORE_ACTION_IDS } from "../apps/desktop/src/assets/asset-manifest.ts";
import {
  FLAGSHIP_WORK_CAT_V2_ACTIONS,
  FLAGSHIP_WORK_CAT_V2_PACK_ID,
  renderFlagshipWorkCatV2Frame
} from "../apps/desktop/src/assets/bundled-packs/flagship-work-cat-v2.ts";
import {
  V30_ACTION_STORYBOARDS,
  buildV30EvidenceSnapshot,
  createV30SemanticCandidate,
  createV30WeakTransformCandidate,
  runV30MotionReadabilityQA
} from "../apps/desktop/src/assets/semantic-animation-quality.ts";

const root = resolve(new URL("..", import.meta.url).pathname);
const date = "2026-06-24";
const outDir = resolve(root, "docs/V30.x/evidence/v30-action-assets-2026-06-24");
const reportPath = resolve(root, "docs/V30.x/evidence/v30-action-asset-acceptance-2026-06-24.html");
const chromePath = process.env.POST_V30_CHROME_PATH ?? "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe";

mkdirSync(outDir, { recursive: true });

const semanticResult = runV30MotionReadabilityQA({
  ...createV30SemanticCandidate(),
  safePackId: FLAGSHIP_WORK_CAT_V2_PACK_ID
});
const weakResult = runV30MotionReadabilityQA(createV30WeakTransformCandidate());

writeFileSync(reportPath, renderReport(), "utf8");
capture(reportPath, resolve(outDir, "01-v30-action-assets-overview.png"), "1600,1200");
capture(reportPath, resolve(outDir, "02-v30-action-assets-full.png"), "1600,1800");

const results = {
  status: weakResult.status === "failed" && semanticResult.status === "passed"
    ? "semantic gate passed; visual art quality failed"
    : "failed",
  semanticGateStatus: weakResult.status === "failed" && semanticResult.status === "passed" ? "passed scoped" : "failed",
  visualArtQualityStatus: "failed",
  reportPath: "docs/V30.x/evidence/v30-action-asset-acceptance-2026-06-24.html",
  screenshots: [
    "docs/V30.x/evidence/v30-action-assets-2026-06-24/01-v30-action-assets-overview.png",
    "docs/V30.x/evidence/v30-action-assets-2026-06-24/02-v30-action-assets-full.png"
  ],
  semantic: buildV30EvidenceSnapshot(semanticResult),
  weak: buildV30EvidenceSnapshot(weakResult),
  boundary: "tested local action packs only; not arbitrary-cat automatic animation readiness"
};
writeFileSync(resolve(outDir, "test-results.json"), JSON.stringify(results, null, 2), "utf8");
console.log(JSON.stringify(results, null, 2));

function capture(htmlPath, pngPath, windowSize) {
  const profile = resolve("/mnt/c/Users/administrator/AppData/Local/Temp", `codexpat-v30-action-assets-${process.pid}-${Math.random().toString(16).slice(2)}`);
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
  if (result.status !== 0) {
    throw new Error(`Chrome screenshot failed: ${result.stderr || result.stdout}`);
  }
}

function toWindowsPath(path) {
  return execFileSync("wslpath", ["-w", path], { encoding: "utf8" }).trim();
}

function renderReport() {
  const semanticRows = CORE_ACTION_IDS.map((actionId) => actionCard(actionId)).join("");
  const storyboardRows = CORE_ACTION_IDS.map((actionId) => {
    const storyboard = V30_ACTION_STORYBOARDS[actionId];
    return `<tr><td><code>${escapeHtml(actionId)}</code></td><td>${escapeHtml(storyboard.semanticGoal)}</td><td>${escapeHtml(storyboard.keyPoses.join(" -> "))}</td><td>${escapeHtml(storyboard.manualReviewPrompt)}</td></tr>`;
  }).join("");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>V30 猫动作资产自动化验收报告</title>
  <style>
    :root { color-scheme: light; --ink:#111827; --muted:#5b6474; --line:#d9e0eb; --blue:#2563eb; --green:#0f766e; --red:#b91c1c; --bg:#f6f8fb; }
    body { margin:0; font-family:"Segoe UI", Arial, sans-serif; background:var(--bg); color:var(--ink); }
    main { max-width:1320px; margin:0 auto; padding:28px 24px 56px; }
    header { background:#101827; color:white; border-radius:8px; padding:26px 28px; }
    h1 { margin:0 0 10px; font-size:30px; letter-spacing:0; }
    h2 { margin:30px 0 14px; font-size:22px; letter-spacing:0; }
    h3 { margin:0 0 8px; font-size:16px; letter-spacing:0; }
    p { line-height:1.6; color:var(--muted); }
    header p { color:#cbd5e1; }
    .badge { display:inline-block; padding:6px 10px; border-radius:6px; font-weight:700; background:#dcfce7; color:#166534; }
    .badge.warn { background:#fef3c7; color:#92400e; }
    .boundary { background:#fff7ed; border:1px solid #fed7aa; color:#9a3412; padding:12px 14px; border-radius:8px; margin-top:16px; }
    .grid { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:14px; }
    .card { background:white; border:1px solid var(--line); border-radius:8px; padding:14px; box-shadow:0 1px 2px rgba(15,23,42,.05); }
    .strip { display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; }
    .frame { min-height:132px; display:flex; align-items:center; justify-content:center; border:1px solid var(--line); border-radius:7px; background:linear-gradient(180deg,#f8fbff,#eef5ff); overflow:hidden; }
    .frame svg { width:100%; max-width:132px; height:auto; display:block; }
    .metrics { display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; }
    .metric { background:white; border:1px solid var(--line); border-radius:8px; padding:14px; }
    .metric strong { display:block; font-size:22px; margin-top:4px; }
    table { width:100%; border-collapse:collapse; background:white; border:1px solid var(--line); border-radius:8px; overflow:hidden; }
    th, td { text-align:left; vertical-align:top; padding:10px 12px; border-bottom:1px solid var(--line); font-size:13px; }
    th { background:#eef2f7; }
    tr:last-child td { border-bottom:0; }
    code { background:#eef2f7; padding:2px 5px; border-radius:4px; }
    .pass { color:var(--green); font-weight:800; }
    .fail { color:var(--red); font-weight:800; }
    .shot-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .shot-grid img { width:100%; border:1px solid var(--line); border-radius:8px; background:white; }
    @media (max-width: 900px) { .grid, .metrics, .shot-grid { grid-template-columns:1fr; } }
  </style>
</head>
<body>
<main>
  <header>
    <span class="badge warn">semantic gate passed · visual art failed</span>
    <h1>V30 猫动作资产自动化验收报告</h1>
    <p>这份报告专门展示 V30 的核心验收对象：tested local 2D cat action pack。重新视觉审查后，当前猫资产只能证明语义动作门禁，不满足目标体验里的高质量猫动作资产要求。</p>
  </header>

  <section class="boundary">
    <strong>边界：</strong>本报告只证明 tested local action packs 的语义 2D 动作质量门禁。不得据此声明 Petdex parity、任意猫自动生成动作资产 ready、provider integration verified、3D ready、production release ready、Windows ready 或 cross-platform ready。
  </section>

  <h2>当前项目目标架构与实现</h2>
  <div class="metrics">
    <article class="metric"><span>目标体验</span><strong>8 个核心动作可读</strong><p>用户能看到同一只猫在 idle、thinking、running、success、warning、error、need_input、sleeping 中呈现不同语义姿态。</p></article>
    <article class="metric"><span>目标架构</span><strong>语义 QA 门禁</strong><p>动作资产必须通过 storyboard、key pose、motion readability、same-cat、preview/apply/rollback 约束。</p></article>
    <article class="metric"><span>当前实现</span><strong>${escapeHtml(FLAGSHIP_WORK_CAT_V2_PACK_ID)}</strong><p>本地 2D rig / bundled sprite-style SVG frames，使用局部姿态、表情、身体和尾巴变化，但视觉仍是工程占位级简化线条猫。</p></article>
    <article class="metric"><span>拒绝路径</span><strong>transform-only failed</strong><p>整体缩放、平移、抖动、扭动整图的弱动作候选被 QA 拒绝。</p></article>
  </div>

  <h2>视觉审查结论</h2>
  <table>
    <thead><tr><th>维度</th><th>结论</th><th>证据说明</th></tr></thead>
    <tbody>
      <tr><td>语义动作门禁</td><td class="pass">passed scoped</td><td>8 个核心动作有不同局部姿态，且 transform-only 弱候选被拒绝。</td></tr>
      <tr><td>目标美术质量</td><td class="fail">failed / not accepted</td><td>当前猫是简化 SVG 线条风格，细节、体积感、材质、表情精度和动作吸引力不足；不应作为目标用户体验的最终动作资产。</td></tr>
      <tr><td>用户可感知体验</td><td class="fail">failed / too placeholder-like</td><td>截图中猫体型和动作差异偏小，整体观感偏工程 demo，不能代表高质量桌宠。</td></tr>
      <tr><td>后续方向</td><td>requires new asset route</td><td>需要新增高质量 2D sprite、part-rig、Live2D-like 或人工绘制多帧资产路线，并增加美术质量门禁。</td></tr>
    </tbody>
  </table>

  <h2>猫动作资产截图证据</h2>
  <p>下列卡片直接渲染当前接受的语义动作候选，每个动作展示前 4 帧。它们能证明局部姿态变化，但也暴露出当前美术质量仍然过低。</p>
  <div class="grid">${semanticRows}</div>

  <h2>QA 结论</h2>
  <table>
    <thead><tr><th>候选</th><th>状态</th><th>原因 / 结果</th></tr></thead>
    <tbody>
      <tr><td>旧弱资产 / transform-only baseline</td><td class="fail">${escapeHtml(weakResult.status)}</td><td>${escapeHtml(weakResult.reasonCodes.join(", "))}</td></tr>
      <tr><td>新语义动作候选 / ${escapeHtml(FLAGSHIP_WORK_CAT_V2_PACK_ID)}</td><td class="pass">${escapeHtml(semanticResult.status)}</td><td>${escapeHtml(semanticResult.reasonCodes.join(", "))}; 仅代表语义动作门禁通过，不代表视觉资产质量通过。</td></tr>
    </tbody>
  </table>

  <h2>动作语义规格</h2>
  <table>
    <thead><tr><th>动作</th><th>语义目标</th><th>关键姿势</th><th>人工验收问题</th></tr></thead>
    <tbody>${storyboardRows}</tbody>
  </table>

  <h2>自动化截图附件</h2>
  <p>以下图片由 Windows Chrome headless 生成，用于证明报告页面本身包含可见动作资产证据。</p>
  <div class="shot-grid">
    <article class="card"><h3>概览截图</h3><img src="v30-action-assets-2026-06-24/01-v30-action-assets-overview.png" alt="V30 action assets overview screenshot"></article>
    <article class="card"><h3>动作资产全景截图</h3><img src="v30-action-assets-2026-06-24/02-v30-action-assets-full.png" alt="V30 action assets full screenshot"></article>
  </div>
</main>
</body>
</html>`;
}

function actionCard(actionId) {
  const action = FLAGSHIP_WORK_CAT_V2_ACTIONS[actionId];
  const storyboard = V30_ACTION_STORYBOARDS[actionId];
  const frames = action.frames.slice(0, 4).map((frame, index) => `
    <div class="frame" title="${escapeHtml(actionId)} frame ${index + 1}">
      ${renderFlagshipWorkCatV2Frame(frame)}
    </div>`).join("");
  return `<article class="card">
    <h3>${escapeHtml(actionId)}</h3>
    <p>${escapeHtml(storyboard.semanticGoal)}</p>
    <div class="strip">${frames}</div>
  </article>`;
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
