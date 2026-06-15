#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  DATE,
  finish,
  pngVisibilityCheck,
  record,
  securityScanText,
  writeEvidence
} from "./v12-utils.mjs";

const htmlPath = `docs/V12.x/evidence/v12_6-complete-acceptance-html-${DATE}.html`;
const evidencePath = `docs/V12.x/evidence/v12_6-complete-acceptance-html-smoke-${DATE}.md`;
const records = [];

const desktopPath = `docs/V12.x/evidence/screenshots/v12_3-real-desktop-${DATE}.png`;
const regionPath = `docs/V12.x/evidence/screenshots/v12_3-real-pet-region-${DATE}.png`;
const firstRunPath = `docs/V12.x/evidence/screenshots/v12_4-first-run-desktop-${DATE}.png`;
const resetBeforePath = `docs/V12.x/evidence/screenshots/v12_5-reset-position-before-${DATE}.png`;
const resetAfterPath = `docs/V12.x/evidence/screenshots/v12_5-reset-position-after-${DATE}.png`;
const runtimePath = `docs/V11.x/evidence/v11_5-flagship-living-cat-runtime-capture-${DATE}.html`;

const imageChecks = [
  ["real desktop screenshot", desktopPath],
  ["pet-region screenshot", regionPath],
  ["first-run screenshot", firstRunPath],
  ["reset before screenshot", resetBeforePath],
  ["reset after screenshot", resetAfterPath]
].map(([name, path]) => {
  const check = existsSync(path) ? pngVisibilityCheck(path) : { ok: false, reasonCode: "desktop_capture_missing" };
  record(records, name, check.ok, `${path} ${JSON.stringify(check)}`, check.reasonCode === "desktop_capture_missing" ? "blocked" : "failed");
  return { name, path, check };
});

const phaseEvidence = [
  `docs/V12.x/evidence/v12_1-visibility-diagnostics-smoke-${DATE}.md`,
  `docs/V12.x/evidence/v12_2-window-layering-smoke-${DATE}.md`,
  `docs/V12.x/evidence/v12_3-real-screenshot-harness-smoke-${DATE}.md`,
  `docs/V12.x/evidence/v12_4-first-run-real-desktop-proof-${DATE}.md`,
  `docs/V12.x/evidence/v12_5-window-monitor-regression-${DATE}.md`
];
record(records, "phase evidence files exist", phaseEvidence.every(existsSync), phaseEvidence.join(", "), "blocked");

const runtimeExists = existsSync(runtimePath);
record(
  records,
  "runtime capture labeled non-desktop",
  true,
  runtimeExists
    ? `${runtimePath} (auxiliary only; not used for desktop gate)`
    : "optional V11 runtime capture missing; not required for V12 desktop gate"
);

const html = buildHtml(imageChecks, phaseEvidence, runtimeExists ? runtimePath : null);
mkdirSync(dirname(htmlPath), { recursive: true });
writeFileSync(htmlPath, html, "utf8");
record(records, "HTML report generated", existsSync(htmlPath), htmlPath);
record(records, "HTML embeds screenshots", imageChecks.every((item) => html.includes(`data:image/png;base64,`) || !existsSync(item.path)), "embedded data URLs");
record(records, "redaction scan", securityScanText(html), "no sensitive text in HTML report");

const status = finish(records);
writeEvidence(evidencePath, "V12.6 Complete Acceptance HTML Smoke Evidence", status, records, `
## HTML Report

- report: \`${htmlPath}\`

The report labels V11 runtime capture as non-desktop evidence and cannot use it
to satisfy the real desktop screenshot gate.
`);

console.log(JSON.stringify({ ok: status === "passed", status, evidencePath, htmlPath, records }, null, 2));
process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;

function buildHtml(images, evidenceFiles, runtimeCapturePath) {
  const status = images.every((item) => item.check.ok) ? "passed" : "blocked";
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>V12 桌面可见性验收汇报</title>
  <style>
    body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f5f7fb;color:#172033}
    main{max-width:1200px;margin:28px auto;padding:0 20px}
    .hero{background:#111827;color:white;border-radius:12px;padding:24px}
    .badge{display:inline-block;border-radius:999px;padding:4px 10px;background:${status === "passed" ? "#16a34a" : "#b45309"};font-weight:800}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;margin:18px 0}
    .card{background:white;border:1px solid #d8dee8;border-radius:10px;padding:14px}
    img{max-width:100%;border:1px solid #cfd8e3;border-radius:8px;background:#eef2f7}
    table{width:100%;border-collapse:collapse;background:white;border:1px solid #d8dee8;border-radius:8px;overflow:hidden}
    th,td{border-bottom:1px solid #e5eaf2;padding:9px;text-align:left;vertical-align:top;font-size:13px}
    th{background:#f8fafc}
    code{overflow-wrap:anywhere}
  </style>
</head>
<body>
<main>
  <section class="hero">
    <p><span class="badge">V12.6 ${status}</span></p>
    <h1>桌面宠物真实桌面可见性验收</h1>
    <p>本页直接嵌入真实 macOS 桌面截图和宠物区域截图。运行态 HTML 截图单独标注，不能替代真实桌面截图。</p>
  </section>
  <section class="grid">
    ${images.map(imageCard).join("\n")}
  </section>
  <h2>阶段证据</h2>
  <table><thead><tr><th>文件</th><th>状态</th></tr></thead><tbody>
    ${evidenceFiles.map((path) => `<tr><td><code>${escapeHtml(path)}</code></td><td>${existsSync(path) ? "exists" : "missing"}</td></tr>`).join("")}
  </tbody></table>
  <h2>运行态截图</h2>
  <p><strong>非桌面证据：</strong> ${runtimeCapturePath ? `<code>${escapeHtml(runtimeCapturePath)}</code>` : "missing"}。该项只能辅助说明动画效果，不能满足 V12 真实桌面截图门禁。</p>
  <h2>允许声明</h2>
  <pre>V12 desktop pet visibility and screenshot-backed acceptance passed for tested local macOS desktop scenarios.</pre>
  <h2>禁止声明</h2>
  <pre>production signed release ready
cross-platform ready
Windows ready
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
OS-level Codex window binding ready
already-open Codex auto-monitoring ready
all Codex workflows verified</pre>
  <h2>Blockers</h2>
  ${status === "passed" ? "<p>当前 HTML 汇报未发现截图 blocker。V12.7 仍需运行完整回归与 claim scan。</p>" : "<p>至少一个真实截图缺失或像素检查未通过，V12 不得声明通过。</p>"}
</main>
</body>
</html>`;
}

function imageCard(item) {
  const src = existsSync(item.path) ? `data:image/png;base64,${readFileSync(item.path).toString("base64")}` : "";
  return `<article class="card">
    <h2>${escapeHtml(item.name)}</h2>
    <p><code>${escapeHtml(item.path)}</code></p>
    <p>check: ${escapeHtml(JSON.stringify(item.check))}</p>
    ${src ? `<img src="${src}" alt="${escapeHtml(item.name)}">` : "<p>missing screenshot</p>"}
  </article>`;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
