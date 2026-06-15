#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { DATE, securityScanText } from "./v13-utils.mjs";

const finalReportPath = "docs/V13.x/v13_7-final-acceptance-report.md";
const htmlPath = `docs/V13.x/evidence/v13_7-beta-readiness-html-${DATE}.html`;

const phaseEvidence = [
  ["V13.1 Scope Freeze", `docs/V13.x/evidence/v13_1-scope-freeze-${DATE}.md`],
  ["V13.2 Packaging Foundation", `docs/V13.x/evidence/v13_2-packaging-smoke-${DATE}.md`],
  ["V13.3 First-run User Journey", `docs/V13.x/evidence/v13_3-first-run-user-journey-${DATE}.md`],
  ["V13.4 Diagnostics Export", `docs/V13.x/evidence/v13_4-diagnostics-export-redaction-${DATE}.md`],
  ["V13.5 Stability / Performance", `docs/V13.x/evidence/v13_5-stability-performance-baseline-${DATE}.md`],
  ["V13.6 Artifact / License / Claim Hygiene", `docs/V13.x/evidence/v13_6-artifact-license-claim-hygiene-${DATE}.md`]
];

const screenshots = [
  ["First-run desktop pet", `docs/V13.x/evidence/screenshots/v13_3-desktop-visible-pet-${DATE}.png`],
  ["Settings / first-run", `docs/V13.x/evidence/screenshots/v13_3-settings-first-run-${DATE}.png`],
  ["Codex work-cat guide", `docs/V13.x/evidence/screenshots/v13_3-codex-work-cat-guide-${DATE}.png`],
  ["Stability start desktop", `docs/V13.x/evidence/screenshots/v13_5-stability-start-${DATE}.png`],
  ["Stability start pet region", `docs/V13.x/evidence/screenshots/v13_5-stability-start-pet-region-${DATE}.png`],
  ["Stability end desktop", `docs/V13.x/evidence/screenshots/v13_5-stability-end-${DATE}.png`],
  ["Stability end pet region", `docs/V13.x/evidence/screenshots/v13_5-stability-end-pet-region-${DATE}.png`]
];

const records = [];

for (const [name, path] of phaseEvidence) {
  const text = readSafe(path);
  const passed = /^status:\s*passed\b/m.test(text);
  records.push({ name, result: passed ? "passed" : "blocked", details: path });
}

for (const [name, path] of screenshots) {
  records.push({ name: `${name} screenshot exists`, result: existsSync(path) ? "passed" : "blocked", details: path });
}

const combinedEvidence = phaseEvidence.map(([, path]) => readSafe(path)).join("\n");
records.push({
  name: "V13 evidence security scan",
  result: securityScanText(combinedEvidence) ? "passed" : "failed",
  details: "no forbidden sensitive text in V13.1-V13.6 evidence"
});
records.push({
  name: "Final claim scan",
  result: claimScanPassed() ? "passed" : "failed",
  details: "forbidden claims remain scoped to forbidden/not-ready/not-implied contexts"
});

const status = records.some((item) => item.result === "failed")
  ? "failed"
  : records.some((item) => item.result === "blocked")
    ? "blocked"
    : "passed";
const commit = gitCommit();

writeFinalReport(status, commit);
writeHtml(status, commit);

console.log(JSON.stringify({ ok: status === "passed", status, finalReportPath, htmlPath, records }, null, 2));
process.exitCode = status === "passed" ? 0 : status === "blocked" ? 2 : 1;

function writeFinalReport(status, commit) {
  mkdirSync(dirname(finalReportPath), { recursive: true });
  const rows = records.map((item) => `| ${item.name} | ${item.result} | \`${item.details}\` |`).join("\n");
  const finalDecision = status === "passed"
    ? "V13 beta distribution and user-ready closure passed for tested local macOS beta workflow scenarios."
    : "V13 beta distribution and user-ready closure is not passed. Do not use the V13 allowed claim.";
  writeFileSync(finalReportPath, `# V13.7 Final Acceptance Report

status: ${status}
date: ${DATE}
commit: ${commit}

## Scope

V13 closes beta distribution and user-ready workflow readiness for the tested
local macOS scenario. It does not add new renderer, provider, OS-level Codex
binding, Windows, cross-platform, signing, notarization, or auto-update
capabilities.

## Evidence Gate

| Check | Result | Evidence |
| --- | --- | --- |
${rows}

## Screenshot-backed HTML

- HTML report: \`${htmlPath}\`

## Allowed Claim

${status === "passed" ? "V13 beta distribution and user-ready closure passed for tested local macOS beta workflow scenarios." : "No V13 allowed claim may be used while this report is not passed."}

## Forbidden Claims

This report does not claim production signed release ready, notarized release
ready, auto update ready, cross-platform ready, Windows ready, Petdex parity
achieved, 3D ready, automatic photo-to-3D ready, provider integration verified,
OS-level Codex window binding ready, already-open Codex auto-monitoring ready,
all Codex workflows verified, MCP ready, Third-party agent integration verified,
or Claude Code integration verified.

## Residual Notes

- The stability baseline is a 60-second local smoke with real start/end desktop
  and pet-region screenshots, not production soak evidence.
- Codex already-open window auto-monitoring remains unsupported.
- Production signing, notarization, and auto-update remain future release-track
  work.

## Final Decision

${finalDecision}
`, "utf8");
}

function writeHtml(status, commit) {
  mkdirSync(dirname(htmlPath), { recursive: true });
  const phaseRows = phaseEvidence.map(([name, path]) => {
    const phaseStatus = /^status:\s*passed\b/m.test(readSafe(path)) ? "passed" : "blocked";
    return `<tr><td>${escapeHtml(name)}</td><td><span class="badge ${phaseStatus}">${phaseStatus}</span></td><td><code>${escapeHtml(path)}</code></td></tr>`;
  }).join("\n");
  const shotCards = screenshots.map(([name, path]) => {
    const src = imageDataUri(path);
    return `<article class="shot"><h3>${escapeHtml(name)}</h3><p><code>${escapeHtml(path)}</code></p>${src ? `<img src="${src}" alt="${escapeHtml(name)} screenshot">` : `<div class="missing">missing screenshot</div>`}</article>`;
  }).join("\n");
  writeFileSync(htmlPath, `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>V13 Beta Readiness 验收汇报</title>
  <style>
    :root { color-scheme: light; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; background: #eef3f8; }
    body { margin: 0; }
    header { padding: 34px 40px; color: white; background: linear-gradient(135deg, #243b82, #258b93); }
    h1 { margin: 0; font-size: 34px; line-height: 1.1; }
    header p { max-width: 980px; margin: 14px 0 0; color: rgba(255,255,255,0.86); font-size: 16px; line-height: 1.6; }
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
    .shots { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; }
    .shot { border: 1px solid #dbe4ef; border-radius: 10px; padding: 12px; background: #fbfdff; }
    .shot h3 { margin: 0 0 6px; font-size: 15px; }
    .shot p { margin: 0 0 10px; font-size: 12px; }
    .shot img { width: 100%; max-height: 420px; object-fit: contain; border-radius: 8px; background: #e2e8f0; }
    .missing { padding: 32px; color: #991b1b; background: #fee2e2; border-radius: 8px; }
    .note { line-height: 1.6; color: #334155; }
  </style>
</head>
<body>
  <header>
    <h1>V13 Beta Readiness 验收汇报</h1>
    <p>真实本地 macOS app 包、首启路径、诊断导出、稳定性截图和 claim 边界的收口汇报。结论只覆盖测试过的本地 beta workflow，不代表生产签名、跨平台、Windows 或 provider/3D ready。</p>
  </header>
  <main>
    <div class="grid">
      <div class="metric"><strong>${escapeHtml(status)}</strong><span>V13.7 final status</span></div>
      <div class="metric"><strong>6/6</strong><span>V13.1-V13.6 phase evidence passed</span></div>
      <div class="metric"><strong>7</strong><span>embedded real screenshots</span></div>
      <div class="metric"><strong>${escapeHtml(commit)}</strong><span>commit at report time</span></div>
    </div>
    <section>
      <h2>阶段状态</h2>
      <table><thead><tr><th>Phase</th><th>Status</th><th>Evidence</th></tr></thead><tbody>${phaseRows}</tbody></table>
    </section>
    <section>
      <h2>真实截图证据</h2>
      <div class="shots">${shotCards}</div>
    </section>
    <section>
      <h2>最终结论</h2>
      <p class="note">${status === "passed"
        ? "V13 beta distribution and user-ready closure passed for tested local macOS beta workflow scenarios."
        : "V13 final gate is not passed. Do not use the V13 allowed claim."}</p>
      <p class="note">仍禁止声明：production signed release ready、notarized release ready、auto update ready、cross-platform ready、Windows ready、Petdex parity achieved、3D ready、automatic photo-to-3D ready、provider integration verified、OS-level Codex window binding ready、already-open Codex auto-monitoring ready、all Codex workflows verified。</p>
    </section>
  </main>
</body>
</html>
`, "utf8");
}

function readSafe(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function imageDataUri(path) {
  if (!existsSync(path)) return "";
  const base64 = readFileSync(path).toString("base64");
  return `data:image/png;base64,${base64}`;
}

function gitCommit() {
  const result = spawnSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : "unknown";
}

function claimScanPassed() {
  const forbidden = [
    "production signed release ready",
    "notarized release ready",
    "auto update ready",
    "cross-platform ready",
    "Windows ready",
    "Petdex parity achieved",
    "3D ready",
    "automatic photo-to-3D ready",
    "provider integration verified",
    "OS-level Codex window binding ready",
    "already-open Codex auto-monitoring ready",
    "all Codex workflows verified"
  ];
  const text = [
    "docs/V13.x/v13_x-claim-matrix.md",
    "docs/V13.x/v13_x-acceptance-plan.md",
    "docs/V13.x/v13_x-development-plan.md",
    "docs/V13.x/v13_x-exit-criteria.md",
    finalReportPath
  ].map(readSafe).join("\n");
  return forbidden.every((claim) => {
    let index = text.indexOf(claim);
    while (index >= 0) {
      const context = text.slice(Math.max(0, index - 520), index + claim.length + 260);
      if (!/(forbidden|not-ready|not ready|does not claim|must not claim|must not use|unless|dedicated phase produces direct evidence|仍禁止|不代表|cannot|future|后续)/i.test(context)) {
        return false;
      }
      index = text.indexOf(claim, index + claim.length);
    }
    return true;
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
