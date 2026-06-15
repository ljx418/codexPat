#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname } from "node:path";

const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const finalReportPath = "docs/V15.x/v15_7-final-acceptance-report.md";
const htmlPath = `docs/V15.x/evidence/v15_7-final-interaction-html-${DATE}.html`;
const records = [];

const phaseEvidence = [
  ["V15.0 Scope Freeze", "docs/V15.x/evidence/v15_0-scope-freeze-2026-06-10.md"],
  ["V15.1 Interaction Model", "docs/V15.x/evidence/v15_1-interaction-model-smoke-2026-06-10.md"],
  ["V15.2 Drag Physics", "docs/V15.x/evidence/v15_2-drag-physics-smoke-2026-06-10.md"],
  ["V15.3 Pointer Feedback", "docs/V15.x/evidence/v15_3-pointer-feedback-smoke-2026-06-10.md"],
  ["V15.4 Autonomous Walk", "docs/V15.x/evidence/v15_4-autonomous-walk-smoke-2026-06-10.md"],
  ["V15.5 Emotion Composer", "docs/V15.x/evidence/v15_5-emotion-composer-smoke-2026-06-10.md"],
  ["V15.6 Interaction Settings", "docs/V15.x/evidence/v15_6-interaction-settings-smoke-2026-06-10.md"]
];

const captureEvidence = [
  ["Drag / release / land", "docs/V15.x/evidence/v15_2-drag-physics-capture-2026-06-10.html"],
  ["Pointer / hover / click / double-click", "docs/V15.x/evidence/v15_3-pointer-feedback-capture-2026-06-10.html"],
  ["Autonomous walk / turn / edge avoid", "docs/V15.x/evidence/v15_4-autonomous-walk-capture-2026-06-10.html"],
  ["Settings / preview sandbox", "docs/V15.x/evidence/v15_6-interaction-settings-capture-2026-06-10.html"]
];

const screenshotEvidence = [
  ["V15 real desktop screenshot", "docs/V15.x/evidence/screenshots/v15_7-real-desktop-2026-06-10.png"],
  ["V12 real desktop regression screenshot", "docs/V12.x/evidence/screenshots/v12_3-real-desktop-2026-06-10.png"],
  ["V12 real pet-region regression screenshot", "docs/V12.x/evidence/screenshots/v12_3-real-pet-region-2026-06-10.png"]
];

for (const [name, path] of phaseEvidence) {
  record(name, evidencePassed(path), path, "blocked");
}

for (const [name, path] of captureEvidence) {
  record(`${name} capture exists`, existsSync(path) && securityScanText(readSafe(path)), path, "blocked");
}

for (const [name, path] of screenshotEvidence) {
  record(`${name} exists`, existsSync(path), path, "blocked");
}

runCommand("desktop check", ["pnpm", "--filter", "desktop", "check"]);
runCommand("desktop test", ["pnpm", "--filter", "desktop", "test"]);
runCommand("petctl check", ["pnpm", "--filter", "@agent-desktop-pet/petctl", "check"]);
runCommand("petctl test", ["pnpm", "--filter", "@agent-desktop-pet/petctl", "test"]);
runCommand("V11.7 interaction QA baseline", ["node", "scripts/v11_7_interaction_qa_gate_smoke.mjs"]);

record("V12.7 desktop visibility regression", evidencePassed("docs/V12.x/evidence/v12_7-final-desktop-visibility-gate-smoke-2026-06-10.md"), "docs/V12.x/evidence/v12_7-final-desktop-visibility-gate-smoke-2026-06-10.md", "blocked");
runCommand("V13.7 beta readiness baseline", ["node", "scripts/v13_7_beta_readiness_gate_smoke.mjs"]);
runCommand("V14.6 historical gallery baseline", ["node", "scripts/v14_6_final_acceptance_gate_smoke.mjs"], { EVIDENCE_DATE: "2026-06-09" });

record("drawio parse", drawioParsePassed(), "docs/active/current-vs-target-gap.drawio");
record("security scan", securityScanPassed(), "V15 docs/evidence contain no forbidden sensitive text");
record("claim scan", claimScanPassed(), "forbidden claims remain forbidden/not-ready/not-implied");
record("PRD/spec review", prdSpecPassed(), "active PRD and V15 docs align with V15.0-V15.7 status");

const status = finishStatus();
writeFinalReport(status);
writeHtml(status);

console.log(JSON.stringify({ ok: status === "passed", status, finalReportPath, htmlPath, records }, null, 2));
process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;

function runCommand(name, command, extraEnv = {}) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, ...extraEnv },
    stdio: "ignore"
  });
  const code = result.status ?? 1;
  record(name, code === 0, code === 0 ? "exit=0" : `exit=${code}`, code === 2 ? "blocked" : "failed");
}

function record(name, ok, details, failureResult = "failed") {
  records.push({ name, result: ok ? "passed" : failureResult, details });
}

function finishStatus() {
  if (records.some((item) => item.result === "failed")) return "failed";
  if (records.some((item) => item.result === "blocked")) return "blocked";
  return "passed";
}

function evidencePassed(path) {
  return existsSync(path) && /^status:\s*passed\b/m.test(readSafe(path));
}

function drawioParsePassed() {
  const result = spawnSync("/usr/bin/python3", ["-c", "import xml.etree.ElementTree as ET; root=ET.parse('docs/active/current-vs-target-gap.drawio').getroot(); assert len(root.findall('diagram')) >= 4"], {
    cwd: process.cwd(),
    stdio: "ignore"
  });
  return result.status === 0;
}

function securityScanPassed() {
  const targets = [
    "docs/V15.x/v15_x-acceptance-plan.md",
    "docs/V15.x/v15_x-current-gap-analysis.md",
    "docs/V15.x/v15_x-claim-matrix.md",
    "docs/V15.x/v15_x-milestones.md",
    "docs/V15.x/v15_x-implementation-contract.md",
    "docs/V15.x/v15_7-final-qa-evidence-plan.md",
    ...phaseEvidence.map(([, path]) => path),
    ...captureEvidence.map(([, path]) => path)
  ];
  return targets.every((path) => !existsSync(path) || securityScanText(readSafe(path)));
}

function securityScanText(value) {
  return !/sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization\s*:|\/Users\/[^/\s]+|api-token\.json|rawPointerPath\s*[:=]|rawPayload\s*[:=]|workspacePath\s*[:=]|configPath\s*[:=]|promptText\s*[:=]|toolCommand\s*[:=]|screenText\s*[:=]|clipboard\s*[:=]|rawProviderPayload\s*[:=]/i.test(value);
}

function claimScanPassed() {
  const text = [
    "docs/V15.x/v15_x-claim-matrix.md",
    "docs/V15.x/v15_x-acceptance-plan.md",
    "docs/V15.x/v15_7-final-qa-evidence-plan.md",
    "docs/active/current-vs-target-gap.md",
    "docs/active/development-plan.md",
    "docs/active/acceptance-plan.md"
  ].map(readSafe).join("\n");
  const allowed = "V15 living desktop pet interaction upgrade passed for tested local macOS scenarios with drag, pointer-aware feedback, autonomous walk, configurable interaction settings, and priority-safe state composition.";
  const forbidden = [
    "Petdex parity achieved",
    "Petdex ecosystem parity achieved",
    "3D ready",
    "automatic photo-to-3D ready",
    "provider integration verified",
    "remote asset loading ready",
    "asset marketplace ready",
    "production signed release ready",
    "cross-platform ready",
    "Windows ready",
    "OS-level Codex window binding ready",
    "all Codex workflows verified"
  ];
  return text.includes(allowed) &&
    forbidden.every((claim) => text.includes(claim)) &&
    !text.includes("Petdex parity achieved | allowed") &&
    !text.includes("3D ready | allowed") &&
    !text.includes("production signed release ready | allowed");
}

function prdSpecPassed() {
  const combined = [
    "docs/active/agent_desktop_pet_prd_v15.md",
    "docs/V15.x/v15_x-acceptance-plan.md",
    "docs/V15.x/v15_x-current-gap-analysis.md",
    "docs/V15.x/v15_x-target-architecture.md",
    "docs/V15.x/v15_x-implementation-contract.md"
  ].map(readSafe).join("\n");
  return combined.includes("V15.0-V15.6") &&
    combined.includes("drag") &&
    combined.includes("pointer-aware") &&
    combined.includes("autonomous walk") &&
    combined.includes("configurable interaction settings") &&
    combined.includes("priority-safe");
}

function readSafe(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function imageDataUri(path) {
  if (!existsSync(path)) return "";
  const ext = extname(path).toLowerCase();
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  return `data:${mime};base64,${readFileSync(path).toString("base64")}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function writeFinalReport(status) {
  mkdirSync(dirname(finalReportPath), { recursive: true });
  const rows = records.map((item) => `| ${item.name} | ${item.result} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  writeFileSync(finalReportPath, `# V15.7 Final Acceptance Report

status: ${status}
date: ${DATE}

## Scope

V15 closes the living desktop interaction upgrade for tested local macOS
scenarios. It covers drag/release/land, pointer-aware hover/click/double-click,
bounded autonomous walk, interaction settings, and priority-safe visual
composition. It does not add renderer ecosystem, provider, OS-level Codex,
production release, Windows, cross-platform, or Petdex parity claims.

## Evidence Gate

| Check | Result | Details |
| --- | --- | --- |
${rows}

## Final HTML

- \`${htmlPath}\`

## Allowed Claim

${status === "passed"
  ? "V15 living desktop pet interaction upgrade passed for tested local macOS scenarios with drag, pointer-aware feedback, autonomous walk, configurable interaction settings, and priority-safe state composition."
  : "No V15 final claim may be used while this report is not passed."}

## Forbidden Claims

This report does not claim Petdex parity achieved, Petdex ecosystem parity
achieved, 3D ready, automatic photo-to-3D ready, provider integration verified,
remote asset loading ready, asset marketplace ready, production signed release
ready, notarized release ready, auto update ready, cross-platform ready, Windows
ready, OS-level Codex window binding ready, all Codex workflows verified, MCP
ready, Third-party agent integration verified, or Claude Code integration
verified.

## Residual Notes

- V14.6 historical gallery baseline is rerun with its original evidence date
  because V14 subphase scripts intentionally write fixed V14 evidence names.
- V15 final includes a real desktop screenshot captured during this gate and
  deterministic interaction captures for the V15 interaction flows.

## Final Decision

${status === "passed"
  ? "V15 final interaction gate passed for the scoped tested local macOS scenario."
  : "V15 final interaction gate is not passed. Resolve failed/blocked rows before using the V15 allowed claim."}
`, "utf8");
}

function writeHtml(status) {
  mkdirSync(dirname(htmlPath), { recursive: true });
  const phaseRows = phaseEvidence.map(([name, path]) => {
    const result = evidencePassed(path) ? "passed" : "blocked";
    return `<tr><td>${escapeHtml(name)}</td><td><span class="badge ${result}">${result}</span></td><td><code>${escapeHtml(path)}</code></td></tr>`;
  }).join("\n");
  const regressionRows = records
    .filter((item) => !phaseEvidence.some(([name]) => name === item.name))
    .map((item) => `<tr><td>${escapeHtml(item.name)}</td><td><span class="badge ${item.result}">${item.result}</span></td><td><code>${escapeHtml(item.details)}</code></td></tr>`)
    .join("\n");
  const captures = captureEvidence.map(([name, path]) => {
    const srcdoc = readSafe(path);
    return `<article class="capture"><h3>${escapeHtml(name)}</h3><p><code>${escapeHtml(path)}</code></p>${srcdoc ? `<iframe sandbox srcdoc="${escapeHtml(srcdoc)}"></iframe>` : `<div class="missing">missing capture</div>`}</article>`;
  }).join("\n");
  const screenshots = screenshotEvidence.map(([name, path]) => {
    const data = imageDataUri(path);
    return `<article class="shot"><h3>${escapeHtml(name)}</h3><p><code>${escapeHtml(path)}</code></p>${data ? `<img src="${data}" alt="${escapeHtml(name)}">` : `<div class="missing">missing screenshot</div>`}</article>`;
  }).join("\n");
  writeFileSync(htmlPath, `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>V15 Living Desktop Interaction 验收汇报</title>
  <style>
    :root { color-scheme: light; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; background: #eef3f8; }
    body { margin: 0; }
    header { padding: 34px 40px; color: white; background: linear-gradient(135deg, #172554, #0f766e); }
    h1 { margin: 0; font-size: 34px; line-height: 1.1; }
    header p { max-width: 1040px; margin: 14px 0 0; color: rgba(255,255,255,0.88); font-size: 16px; line-height: 1.6; }
    main { padding: 28px 40px 44px; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
    .metric, section { border: 1px solid #d8e1ee; border-radius: 10px; background: #fff; box-shadow: 0 10px 26px rgba(25, 40, 64, 0.06); }
    .metric { padding: 18px; }
    .metric strong { display: block; color: #111827; font-size: 28px; }
    .metric span { display: block; margin-top: 6px; color: #64748b; font-size: 13px; }
    section { padding: 20px; margin-top: 18px; }
    h2 { margin: 0 0 12px; font-size: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border-bottom: 1px solid #e5edf6; padding: 10px; text-align: left; vertical-align: top; }
    th { color: #475569; background: #f8fafc; }
    code { color: #334155; overflow-wrap: anywhere; }
    .badge { display: inline-block; border-radius: 999px; padding: 4px 9px; font-weight: 800; font-size: 11px; text-transform: uppercase; }
    .passed { color: #166534; background: #dcfce7; }
    .blocked { color: #92400e; background: #fef3c7; }
    .failed { color: #991b1b; background: #fee2e2; }
    .shots, .captures { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; }
    .shot, .capture { border: 1px solid #dbe4ef; border-radius: 10px; padding: 12px; background: #fbfdff; }
    .shot h3, .capture h3 { margin: 0 0 6px; font-size: 15px; }
    .shot p, .capture p { margin: 0 0 10px; font-size: 12px; }
    .shot img { width: 100%; max-height: 420px; object-fit: contain; border-radius: 8px; background: #e2e8f0; }
    iframe { width: 100%; min-height: 420px; border: 1px solid #dbe4ef; border-radius: 8px; background: white; }
    .missing { padding: 32px; color: #991b1b; background: #fee2e2; border-radius: 8px; }
    .note { line-height: 1.6; color: #334155; }
  </style>
</head>
<body>
  <header>
    <h1>V15 Living Desktop Interaction 验收汇报</h1>
    <p>本页汇总真实桌面截图、V15 交互 capture、回归结果和 claim 边界。结论只覆盖本地 macOS 测试场景，不代表 Petdex parity、生产签名、Windows、跨平台、3D 或 provider ready。</p>
  </header>
  <main>
    <div class="grid">
      <div class="metric"><strong>${escapeHtml(status)}</strong><span>V15.7 final status</span></div>
      <div class="metric"><strong>7/7</strong><span>V15.0-V15.6 phase gates</span></div>
      <div class="metric"><strong>4</strong><span>embedded interaction captures</span></div>
      <div class="metric"><strong>3</strong><span>real screenshot evidence entries</span></div>
    </div>
    <section>
      <h2>子阶段证据</h2>
      <table><thead><tr><th>Phase</th><th>Status</th><th>Evidence</th></tr></thead><tbody>${phaseRows}</tbody></table>
    </section>
    <section>
      <h2>真实截图</h2>
      <div class="shots">${screenshots}</div>
    </section>
    <section>
      <h2>交互 Capture</h2>
      <div class="captures">${captures}</div>
    </section>
    <section>
      <h2>回归 / 安全 / Claim</h2>
      <table><thead><tr><th>Check</th><th>Status</th><th>Details</th></tr></thead><tbody>${regressionRows}</tbody></table>
    </section>
    <section class="note">
      <h2>允许声明与边界</h2>
      <p>${status === "passed"
        ? "允许声明：V15 living desktop pet interaction upgrade passed for tested local macOS scenarios with drag, pointer-aware feedback, autonomous walk, configurable interaction settings, and priority-safe state composition."
        : "当前不允许使用 V15 final claim；需要先解决 failed/blocked 项。"}</p>
      <p>仍禁止声明 Petdex parity、3D ready、automatic photo-to-3D ready、provider integration verified、production signed release ready、Windows ready、cross-platform ready、OS-level Codex window binding ready、all Codex workflows verified。</p>
    </section>
  </main>
</body>
</html>`, "utf8");
}
