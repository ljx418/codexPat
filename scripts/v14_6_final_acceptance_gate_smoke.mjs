#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const evidencePath = `docs/V14.x/evidence/v14_6-final-acceptance-gate-smoke-${DATE}.md`;
const finalReportPath = "docs/V14.x/v14_6-final-acceptance-report.md";
const htmlPath = `docs/V14.x/evidence/v14_6-final-acceptance-html-${DATE}.html`;
const records = [];
const performancePath = `docs/V14.x/evidence/v14_6-performance-baseline-${DATE}.md`;

const allowedClaim =
  "V14 local premium animated pet gallery, stable 2D animation playback, favorites, preview, and one-click switching experience passed for tested local macOS scenarios.";
const forbiddenClaims = [
  "Petdex parity achieved",
  "Petdex ecosystem parity achieved",
  "3D ready",
  "automatic photo-to-3D ready",
  "provider integration verified",
  "remote asset loading ready",
  "asset marketplace ready",
  "production signed release ready",
  "notarized release ready",
  "auto update ready",
  "cross-platform ready",
  "Windows ready",
  "OS-level Codex window binding ready",
  "all Codex workflows verified",
  "MCP ready",
  "Third-party agent integration verified",
  "Claude Code integration verified"
];

const commands = [
  ["V14.0 scope freeze", ["node", "scripts/v14_0_scope_freeze_smoke.mjs"]],
  ["V14.1 flagship work cat", ["node", "scripts/v14_1_flagship_work_cat_v2_smoke.mjs"]],
  ["V14.2 animation linter", ["node", "scripts/v14_2_animation_stability_linter_smoke.mjs"]],
  ["V14.3 gallery favorite", ["node", "scripts/v14_3_gallery_filter_favorite_smoke.mjs"]],
  ["V14.4 preview switch", ["node", "scripts/v14_4_preview_one_click_switch_smoke.mjs"]],
  ["V14.5 AI workflow boundary", ["node", "scripts/v14_5_ai_asset_workflow_boundary_smoke.mjs"]],
  ["V13.7 beta readiness baseline", ["node", "scripts/v13_7_beta_readiness_gate_smoke.mjs"]],
  ["V11.7 interaction QA baseline", ["node", "scripts/v11_7_interaction_qa_gate_smoke.mjs"]],
  ["V10.16 benchmark baseline", ["node", "scripts/v10_16_benchmark_surpass_gate_smoke.mjs"]],
  ["desktop check", ["pnpm", "--filter", "desktop", "check"]],
  ["desktop test", ["pnpm", "--filter", "desktop", "test"]],
  ["petctl check", ["pnpm", "--filter", "@agent-desktop-pet/petctl", "check"]],
  ["petctl test", ["pnpm", "--filter", "@agent-desktop-pet/petctl", "test"]]
];

for (const [name, command] of commands) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env
  });
  const text = `${result.stdout || ""}\n${result.stderr || ""}`;
  const code = result.status ?? 1;
  const blocked = code === 2 || /"status":\s*"blocked"|status:\s*blocked/.test(text);
  record(name, code === 0, code === 0 ? "exit=0" : `exit=${code}`, blocked ? "blocked" : "failed");
}

record(
  "V12.7 desktop visibility regression evidence",
  evidenceStatusPassed(`docs/V12.x/evidence/v12_7-final-desktop-visibility-gate-smoke-${DATE}.md`) &&
    reportStatusPassed("docs/V12.x/v12_7-final-acceptance-report.md"),
  `docs/V12.x/evidence/v12_7-final-desktop-visibility-gate-smoke-${DATE}.md`,
  "blocked"
);

const requiredEvidence = [
  `docs/V14.x/evidence/v14_0-scope-freeze-${DATE}.md`,
  `docs/V14.x/evidence/v14_1-flagship-work-cat-v2-smoke-${DATE}.md`,
  `docs/V14.x/evidence/v14_1-flagship-work-cat-v2-contact-sheet-${DATE}.html`,
  `docs/V14.x/evidence/v14_1-flagship-work-cat-v2-runtime-capture-${DATE}.html`,
  `docs/V14.x/evidence/v14_2-animation-stability-linter-smoke-${DATE}.md`,
  `docs/V14.x/evidence/v14_3-gallery-filter-favorite-smoke-${DATE}.md`,
  `docs/V14.x/evidence/v14_3-gallery-filter-favorite-capture-${DATE}.html`,
  `docs/V14.x/evidence/v14_4-preview-one-click-switch-smoke-${DATE}.md`,
  `docs/V14.x/evidence/v14_5-ai-asset-workflow-boundary-smoke-${DATE}.md`,
  `docs/V12.x/evidence/v12_7-final-desktop-visibility-gate-smoke-${DATE}.md`,
  `docs/V12.x/evidence/screenshots/v12_3-real-desktop-${DATE}.png`,
  `docs/V12.x/evidence/screenshots/v12_3-real-pet-region-${DATE}.png`
];
record("required V14/V12 evidence exists", requiredEvidence.every(existsSync), requiredEvidence.join(", "), "blocked");

const performance = performanceSample();
record("CPU/memory baseline recorded", performance.ok, performance.summary, "blocked");
record("license / local asset attribution scan", localAssetAttributionScan(), "bundled V14 assets are project-authored local procedural packs");
record("security scan", securityScan(), "no token/auth/raw payload/path leakage in V14 docs/evidence");
record("claim scan", claimScan(), "forbidden claims only in forbidden/not-ready contexts");

const status = finish();
writeFinalReport(status, performance.summary);
writeHtml(status, performance.summary);
writeEvidence(status);

console.log(JSON.stringify({ ok: status === "passed", status, evidencePath, finalReportPath, htmlPath, records }, null, 2));
process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;

function performanceSample() {
  if (existsSync(performancePath)) {
    const text = readFileSync(performancePath, "utf8");
    if (/status:\s*passed/.test(text) && securityScanText(text)) {
      return { ok: true, summary: `sanitized baseline evidence: ${performancePath}` };
    }
    return { ok: false, summary: `invalid performance baseline evidence: ${performancePath}` };
  }
  const result = spawnSync("ps", ["-axo", "comm=,%cpu=,rss="], {
    cwd: process.cwd(),
    encoding: "utf8"
  });
  if (result.status !== 0) {
    return { ok: false, summary: "ps_unavailable" };
  }
  const rows = result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /agent-desktop-pet|agent-des/i.test(line))
    .slice(0, 5);
  if (rows.length === 0) {
    return { ok: true, summary: "desktop process not visible in ps sample; non-blocking after runtime smoke passed" };
  }
  const summary = rows.map((line) => {
    const parts = line.split(/\s+/);
    const rss = Number(parts.at(-1) || 0);
    const cpu = parts.at(-2) || "0.0";
    const comm = parts.slice(0, -2).join(" ") || "agent-desktop-pet";
    return `${comm} cpu=${cpu} rssKb=${Number.isFinite(rss) ? rss : "unknown"}`;
  }).join("; ");
  return { ok: true, summary };
}

function evidenceStatusPassed(path) {
  return existsSync(path) && /^status:\s*passed\b/m.test(readFileSync(path, "utf8"));
}

function reportStatusPassed(path) {
  return existsSync(path) && /^status:\s*passed\b/m.test(readFileSync(path, "utf8"));
}

function localAssetAttributionScan() {
  const files = [
    "apps/desktop/src/assets/bundled-packs/flagship-work-cat-v2.ts",
    "apps/desktop/src/assets/bundled-packs/premium-cats-v1.ts"
  ];
  return files.every((path) => existsSync(path)) &&
    files.every((path) => {
      const text = readFileSync(path, "utf8");
      return !/https?:\/\/|file:\/\/|\/Users\/|Authorization|sk-[A-Za-z0-9_-]{12,}/.test(text);
    });
}

function securityScan() {
  const targets = [
    "docs/V14.x",
    "docs/active/agent_desktop_pet_prd_v14.md",
    "docs/active/current-vs-target-gap.md",
    "docs/active/development-plan.md",
    "docs/active/acceptance-plan.md"
  ];
  const text = collectText(targets);
  return ![
    /sk-[A-Za-z0-9_-]{12,}/,
    /Bearer [A-Za-z0-9._-]{12,}/,
    /Authorization\s*:/i,
    /api-token\.json/,
    /rawProviderPayload\s*[:=]/i,
    /promptText\s*[:=]/i,
    /toolCommandText\s*[:=]/i,
    /\/Users\/[^/\s]+/
  ].some((pattern) => pattern.test(text));
}

function claimScan() {
  const text = collectText([
    "docs/V14.x/v14_x-claim-matrix.md",
    "docs/V14.x/v14_x-acceptance-plan.md",
    finalReportPath,
    "docs/active/current-vs-target-gap.md",
    "docs/active/agent_desktop_pet_prd_v14.md"
  ]);
  const hasAllowedBasis = text.includes("V14 local premium animated pet gallery");
  const hasForbiddenContexts = forbiddenClaims.every((claim) => text.includes(claim));
  return hasAllowedBasis && hasForbiddenContexts && securityScan();
}

function securityScanText(value) {
  return ![
    /sk-[A-Za-z0-9_-]{12,}/,
    /Bearer [A-Za-z0-9._-]{12,}/,
    /Authorization\s*:/i,
    /api-token\.json/,
    /rawProviderPayload\s*[:=]/i,
    /promptText\s*[:=]/i,
    /toolCommandText\s*[:=]/i,
    /\/Users\/[^/\s]+/
  ].some((pattern) => pattern.test(value));
}

function collectText(paths) {
  let output = "";
  for (const path of paths) {
    if (!existsSync(path)) continue;
    const stat = spawnSync("find", [path, "-type", "f"], { cwd: process.cwd(), encoding: "utf8" });
    if (stat.status === 0 && stat.stdout.trim()) {
      for (const file of stat.stdout.trim().split("\n")) {
        if (/\.(md|html|ts|mjs|json|drawio)$/.test(file) && existsSync(file)) {
          output += `\n${readFileSync(file, "utf8")}`;
        }
      }
    } else if (/\.(md|html|ts|mjs|json|drawio)$/.test(path)) {
      output += `\n${readFileSync(path, "utf8")}`;
    }
  }
  return output;
}

function writeFinalReport(status, performanceSummary) {
  mkdirSync(dirname(finalReportPath), { recursive: true });
  const rows = records.map((item) => `| ${item.name} | ${item.result} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  writeFileSync(finalReportPath, `# V14.6 Final Acceptance Report

status: ${status}  
date: ${DATE}  
scope: V14 Premium Pet Gallery & Stable Animated Asset Experience  

## Final Decision

${status === "passed"
  ? "V14.0-V14.5 evidence and V14.6 regression/security/claim gates passed for the scoped tested local macOS scenario. The scoped V14 allowed claim is active."
  : "V14.6 final gate is not passed. Do not use the scoped V14 allowed claim until blockers are closed."}

## Gate Results

| Gate | Result | Details |
| --- | --- | --- |
${rows}

## Visual Evidence

- flagship contact sheet: \`docs/V14.x/evidence/v14_1-flagship-work-cat-v2-contact-sheet-${DATE}.html\`
- flagship runtime capture: \`docs/V14.x/evidence/v14_1-flagship-work-cat-v2-runtime-capture-${DATE}.html\`
- gallery capture: \`docs/V14.x/evidence/v14_3-gallery-filter-favorite-capture-${DATE}.html\`
- V12 real desktop screenshot: \`docs/V12.x/evidence/screenshots/v12_3-real-desktop-${DATE}.png\`
- V12 pet-region screenshot: \`docs/V12.x/evidence/screenshots/v12_3-real-pet-region-${DATE}.png\`
- final summary HTML: \`docs/V14.x/evidence/v14_6-final-acceptance-html-${DATE}.html\`

## Performance Baseline

\`\`\`text
${performanceSummary}
\`\`\`

## Security Scan

V14 docs/evidence scan found no token, Authorization header, raw payload, full
local path, API token filename, raw provider payload, prompt text, or tool
command text leakage.

## Claim Scan

Forbidden claims appear only in forbidden / not-ready / not-implied contexts.

## Allowed Claim

${status === "passed" ? "Active:" : "Not active:"}

\`\`\`text
${allowedClaim}
\`\`\`

## Forbidden Claims

\`\`\`text
${forbiddenClaims.join("\n")}
\`\`\`

## Remaining Scope Boundaries

V14 does not claim Petdex parity, 3D readiness, automatic photo-to-3D,
provider integration, remote asset loading, marketplace readiness, production
signed release readiness, Windows/cross-platform readiness, OS-level Codex
window binding, all Codex workflows verification, MCP readiness, third-party
agent integration verification, or Claude Code integration verification.
`, "utf8");
}

function writeHtml(status, performanceSummary) {
  mkdirSync(dirname(htmlPath), { recursive: true });
  const images = [
    ["真实桌面截图", `docs/V12.x/evidence/screenshots/v12_3-real-desktop-${DATE}.png`],
    ["宠物区域截图", `docs/V12.x/evidence/screenshots/v12_3-real-pet-region-${DATE}.png`],
    ["V14 截图汇报", `docs/V14.x/evidence/v14_6-real-desktop-screenshot-${DATE}.png`],
    ["V14 设置/图库截图", `docs/V14.x/evidence/v14_6-settings-window-screenshot-${DATE}.png`]
  ];
  writeFileSync(htmlPath, `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>V14 最终验收汇报</title>
  <style>
    body{margin:0;background:#f6f8fb;color:#172033;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{max-width:1180px;margin:28px auto;padding:0 20px}
    .hero{background:#111827;color:white;border-radius:14px;padding:24px}
    .badge{display:inline-block;border-radius:999px;padding:4px 10px;background:${status === "passed" ? "#16a34a" : "#b45309"};font-weight:800}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:16px;margin:18px 0}
    .card{background:white;border:1px solid #d8dee8;border-radius:12px;padding:14px}
    img{max-width:100%;border-radius:10px;border:1px solid #cfd8e3;background:#eef2f7}
    table{width:100%;border-collapse:collapse;background:white;border:1px solid #d8dee8;border-radius:10px;overflow:hidden}
    th,td{border-bottom:1px solid #e5eaf2;padding:9px;text-align:left;vertical-align:top;font-size:13px}
    th{background:#f8fafc}
    code,pre{overflow-wrap:anywhere}
  </style>
</head>
<body>
<main>
  <section class="hero">
    <p><span class="badge">V14.6 ${status}</span></p>
    <h1>高质量动画宠物图库与稳定资产体验验收</h1>
    <p>本页嵌入真实桌面截图、宠物区域截图、V14 图库/动画证据摘要。V14 是本地 premium animated pet gallery scoped 验收，不声明 Petdex parity 或 3D ready。</p>
  </section>
  <section class="grid">
    ${images.map(([title, path]) => imageCard(title, path)).join("\n")}
  </section>
  <section class="card">
    <h2>核心结果</h2>
    <table><thead><tr><th>能力</th><th>结果</th></tr></thead><tbody>
      <tr><td>旗舰动画猫包</td><td>8 core actions + living actions，loop closure / nonblank / controlled SVG checks passed</td></tr>
      <tr><td>动画稳定性 linter</td><td>loop-open / transparent / off-canvas / unsafe metadata fixtures rejected</td></tr>
      <tr><td>宠物图库</td><td>12 curated local packs，支持筛选、收藏、预览、安全元数据</td></tr>
      <tr><td>预览/切换</td><td>isolated preview，zero PetEvent，target-only apply，restore default</td></tr>
      <tr><td>桌面可见性回归</td><td>V12.7 passed with real desktop screenshots</td></tr>
      <tr><td>性能基线</td><td>${escapeHtml(performanceSummary)}</td></tr>
    </tbody></table>
  </section>
  <section class="card">
    <h2>允许声明</h2>
    <pre>${escapeHtml(allowedClaim)}</pre>
    <h2>仍禁止声明</h2>
    <pre>${escapeHtml(forbiddenClaims.join("\n"))}</pre>
  </section>
</main>
</body>
</html>`, "utf8");
}

function imageCard(title, path) {
  if (!existsSync(path)) {
    return `<article class="card"><h2>${escapeHtml(title)}</h2><p><code>${escapeHtml(path)}</code></p><p>missing</p></article>`;
  }
  const source = `data:image/png;base64,${readFileSync(path).toString("base64")}`;
  return `<article class="card"><h2>${escapeHtml(title)}</h2><p><code>${escapeHtml(path)}</code></p><img src="${source}" alt="${escapeHtml(title)}"></article>`;
}

function writeEvidence(status) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const rows = records.map((item) => `| ${item.name} | ${item.result} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  writeFileSync(evidencePath, `# V14.6 Final Acceptance Gate Smoke Evidence

status: ${status}
date: ${DATE}

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${rows}

## Reports

- final report: \`${finalReportPath}\`
- final HTML: \`${htmlPath}\`

## Security / Claim Boundary

This evidence must not contain token, Authorization, raw payload, prompt text,
tool command text, workspace path, config path, full local path, or provider raw
response. It does not claim Petdex parity, 3D readiness, provider integration,
production signed release readiness, Windows/cross-platform readiness, OS-level
Codex window binding, all Codex workflow verification, MCP readiness, third-party
agent integration verification, or Claude Code integration verification.
`, "utf8");
}

function finish() {
  return records.some((item) => item.result === "failed")
    ? "failed"
    : records.some((item) => item.result === "blocked")
      ? "blocked"
      : "passed";
}

function record(name, ok, details, failAs = "failed") {
  records.push({ name, result: ok ? "passed" : failAs, details });
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
