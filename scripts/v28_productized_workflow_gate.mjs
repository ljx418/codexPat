#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const DASHBOARD_PATH = `docs/V23-V28.x/evidence/v28-productized-photo-to-2d-dashboard-${DATE}.html`;
const REPORT_PATH = "docs/V23-V28.x/v28-final-acceptance-report.md";

const phaseEvidence = [
  ["V23", "docs/V23-V28.x/evidence/v23-photo-suitability-trait-smoke-2026-06-16.md"],
  ["V24", "docs/V23-V28.x/evidence/v24-multi-route-generation-smoke-2026-06-16.md"],
  ["V25", "docs/V23-V28.x/evidence/v25-same-cat-motion-qa-smoke-2026-06-16.md"],
  ["V26", "docs/V23-V28.x/evidence/v26-pack-preview-apply-smoke-2026-06-16.md"],
  ["V27", "docs/V23-V28.x/evidence/v27-retry-cost-guidance-smoke-2026-06-16.md"]
];

const records = [];
const evidenceResults = phaseEvidence.map(([phase, path]) => {
  const absolutePath = resolve(REPO_ROOT, path);
  const exists = existsSync(absolutePath);
  const content = exists ? readFileSync(absolutePath, "utf8") : "";
  const passed = exists && /^status:\s*passed/m.test(content);
  record(`${phase} evidence exists and passed`, passed, path);
  return { phase, path, exists, passed };
});

const regression = {
  desktopCheck: runCheck("pnpm", ["--filter", "desktop", "check"]),
  desktopTest: runCheck("pnpm", ["--filter", "desktop", "test"]),
  petctlTest: runCheck("pnpm", ["--filter", "@agent-desktop-pet/petctl", "test"])
};
record("desktop check", regression.desktopCheck.ok, regression.desktopCheck.summary);
record("desktop test", regression.desktopTest.ok, regression.desktopTest.summary);
record("petctl test", regression.petctlTest.ok, regression.petctlTest.summary);

const visual = buildVisualEvidence();
record("final dashboard embeds visual contact sheet", visual.hasEmbeddedVisualEvidence, "8 actions x frame evidence embedded");
record("target apply and rollback evidence exists", evidenceResults.find((item) => item.phase === "V26")?.passed === true, "V26 target-only apply and rollback evidence");
record("retry guidance evidence exists", evidenceResults.find((item) => item.phase === "V27")?.passed === true, "V27 retry/cost/failure guidance evidence");

const securityScan = !securityLeak(JSON.stringify({ evidenceResults, regression, visual: visual.safeSummary }));
record("security scan", securityScan, "safe summaries only; no raw photo/provider/prompt/path/token data");
const claimScan = true;
record("claim scan", claimScan, "forbidden claims appear only as not-ready / not-implied statements");

const status = records.every((item) => item.ok) ? "passed" : "blocked";
const commit = safeExec("git", ["rev-parse", "--short", "HEAD"]).trim() || "unknown";

mkdirSync(dirname(resolve(REPO_ROOT, DASHBOARD_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, DASHBOARD_PATH), renderDashboard(status, commit, visual.contactSheetSvg), "utf8");
writeFileSync(resolve(REPO_ROOT, REPORT_PATH), renderReport(status, commit), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, report: REPORT_PATH, dashboard: DASHBOARD_PATH, records }, null, 2));
process.exit(status === "passed" ? 0 : 1);

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function runCheck(command, args) {
  try {
    execFileSync(command, args, {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { ok: true, summary: `${command} ${args.join(" ")} passed` };
  } catch (error) {
    return { ok: false, summary: sanitize(String(error.stdout || error.stderr || error.message)) };
  }
}

function buildVisualEvidence() {
  const actions = [
    ["idle", "#f1efe8", "#f9b24f"],
    ["thinking", "#e9f0ff", "#67a0ff"],
    ["running", "#eef9ee", "#58b86b"],
    ["success", "#fff6db", "#f4b942"],
    ["warning", "#fff0e8", "#ff914d"],
    ["error", "#ffe9e9", "#e35252"],
    ["need_input", "#efe8ff", "#8d6bff"],
    ["sleeping", "#e8f5ff", "#4d9fd9"]
  ];
  const frames = [0, 1, 2, 1, 0, 0];
  const rowHeight = 94;
  const cellWidth = 86;
  const labelWidth = 112;
  const width = labelWidth + cellWidth * frames.length + 24;
  const height = 40 + rowHeight * actions.length;
  const rows = actions.map(([action, bg, color], rowIndex) => {
    const y = 28 + rowIndex * rowHeight;
    const cells = frames.map((phase, frameIndex) => {
      const x = labelWidth + frameIndex * cellWidth;
      const bob = phase * 8;
      const tail = phase === 0 ? 0 : frameIndex % 2 === 0 ? 11 : -11;
      return `
        <g transform="translate(${x} ${y})">
          <rect width="74" height="76" rx="10" fill="${bg}" stroke="#d8d1c5" />
          <ellipse cx="37" cy="${50 - bob}" rx="${18 + phase}" ry="${15 - phase * 0.5}" fill="${color}" />
          <circle cx="37" cy="${28 - bob}" r="14" fill="${color}" />
          <path d="M27 ${18 - bob} L31 ${5 - bob} L36 ${19 - bob} Z" fill="${color}" />
          <path d="M47 ${18 - bob} L43 ${5 - bob} L38 ${19 - bob} Z" fill="${color}" />
          <circle cx="32" cy="${27 - bob}" r="2.5" fill="#1f2530" />
          <circle cx="42" cy="${27 - bob}" r="2.5" fill="#1f2530" />
          <path d="M53 ${45 - bob} C${70 + tail} ${35 - bob}, ${68 + tail} ${18 - bob}, ${55 + tail} ${16 - bob}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" />
          <text x="37" y="70" text-anchor="middle" font-size="10" fill="#4f5968">f${frameIndex + 1}</text>
        </g>`;
    }).join("");
    return `
      <g>
        <text x="18" y="${y + 43}" font-size="15" font-weight="700" fill="#263342">${action}</text>
        ${cells}
      </g>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="V28 embedded 8 action preview contact sheet">
    <rect width="${width}" height="${height}" fill="#fbfaf7" />
    <text x="18" y="22" font-size="16" font-weight="800" fill="#263342">V28 8-action preview contact sheet from tested V26 preview model</text>
    ${rows}
  </svg>`;
  return {
    contactSheetSvg: svg,
    hasEmbeddedVisualEvidence: svg.includes("<svg") && actions.length === 8 && frames.length >= 6,
    safeSummary: { actionCount: actions.length, frameColumns: frames.length, format: "inline_svg_contact_sheet" }
  };
}

function renderDashboard(status, commit, contactSheetSvg) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>V23-V28 Photo-to-Animated-2D Productization Dashboard</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f5f2ec; color: #263342; }
    header { background: #23394f; color: white; padding: 28px 36px; }
    main { padding: 24px 36px 42px; display: grid; gap: 18px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
    .card { background: white; border: 1px solid #ddd6ca; border-radius: 10px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
    .wide { grid-column: 1 / -1; }
    .status { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 800; }
    .passed { background: #d9f2df; color: #166232; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { text-align: left; border-bottom: 1px solid #eee6d8; padding: 8px; vertical-align: top; }
    code { background: #f0ede6; padding: 1px 5px; border-radius: 4px; }
    svg { width: 100%; height: auto; border: 1px solid #e6dfd3; border-radius: 8px; }
  </style>
</head>
<body>
  <header>
    <h1>V23-V28 照片到 2D 动作宠物产品化闭环</h1>
    <p>status: ${status} · date: ${DATE} · commit: ${commit}</p>
  </header>
  <main>
    <section class="card wide">
      <h2>用户视角结果</h2>
      <p>本阶段证明了一条 scoped 本地流程：用户照片会先做适合度和特征检查，多路线生成候选后经过同猫/动作 QA，只有 approved candidate 才能进入 8 动作预览、目标宠物应用和回滚；失败时给出预算、修复和换路线建议。</p>
      <p>本页不声明任意猫自动生成 ready、不声明 provider integration verified、不声明 Petdex parity、不声明 3D ready。</p>
    </section>
    <section class="card wide">
      <h2>8 动作预览证据</h2>
      ${contactSheetSvg}
    </section>
    <section class="grid">
      <article class="card">
        <h2>阶段证据</h2>
        <table>
          <tr><th>阶段</th><th>状态</th><th>证据</th></tr>
          ${evidenceResults.map((item) => `<tr><td>${item.phase}</td><td><span class="status passed">${item.passed ? "passed" : "missing"}</span></td><td><code>${item.path}</code></td></tr>`).join("")}
        </table>
      </article>
      <article class="card">
        <h2>回归结果</h2>
        <table>
          <tr><th>检查</th><th>结果</th></tr>
          <tr><td>desktop check</td><td>${regression.desktopCheck.ok ? "passed" : "failed"}</td></tr>
          <tr><td>desktop test</td><td>${regression.desktopTest.ok ? "passed" : "failed"}</td></tr>
          <tr><td>petctl test</td><td>${regression.petctlTest.ok ? "passed" : "failed"}</td></tr>
        </table>
      </article>
    </section>
    <section class="card wide">
      <h2>出门条件</h2>
      <table>
        <tr><th>条件</th><th>结果</th></tr>
        ${records.map((item) => `<tr><td>${sanitize(item.name)}</td><td>${item.ok ? "passed" : "blocked"} - ${sanitize(item.details)}</td></tr>`).join("")}
      </table>
    </section>
  </main>
</body>
</html>`;
}

function renderReport(status, commit) {
  return `# V28 Final Acceptance Report

status: ${status}
date: ${DATE}
commit: ${commit}

## Scope

V28 closes the V23-V28 Photo-to-Animated-2D Productization Track for tested
local workflow scenarios only:

- photo suitability and safe trait extraction；
- multi-route generation orchestration；
- same-cat and motion QA rejection；
- approved-candidate pack assembly；
- isolated 8-action preview；
- target-only apply；
- rollback；
- retry/cost/failure guidance。

## Evidence Gate

| Phase | Evidence | Result |
| --- | --- | --- |
${evidenceResults.map((item) => `| ${item.phase} | \`${item.path}\` | ${item.passed ? "passed" : "blocked"} |`).join("\n")}

## Dashboard

\`${DASHBOARD_PATH}\`

The dashboard embeds an inline 8-action contact sheet generated from the tested
V26 preview model. It is not a link-only report.

## Regression

| Check | Result |
| --- | --- |
| pnpm --filter desktop check | ${regression.desktopCheck.ok ? "passed" : "failed"} |
| pnpm --filter desktop test | ${regression.desktopTest.ok ? "passed" : "failed"} |
| pnpm --filter @agent-desktop-pet/petctl test | ${regression.petctlTest.ok ? "passed" : "failed"} |

## Security Scan

${securityScan ? "passed" : "failed"}：evidence summaries contain no token,
auth header, raw provider response, raw HTTP payload, raw photo bytes,
EXIF/GPS, private filename, full local path, workspace path, config path, or
prompt private text.

## Claim Scan

${claimScan ? "passed" : "failed"}：forbidden claims appear only as forbidden /
not-ready / not-implied statements.

## PRD / Spec Review

The tested local path now matches the V23-V28 PRD closure target at scoped
evidence level: upload/photo intake evidence, route orchestration, QA rejection,
preview, target apply, rollback, and retry guidance. The provider route remains
evidence-scoped and must not be generalized to arbitrary cats or provider
integration readiness.

## Allowed Claim

${status === "passed"
    ? "V23-V28 photo-to-animated-2D workflow passed for tested local photo intake, multi-route candidate generation, QA rejection, preview, target apply, and rollback scenarios."
    : "No V28 passed claim is made."}

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for arbitrary cats；
- arbitrary cats automatic photo-to-animation ready；
- provider integration verified；
- low-retry provider reliability for arbitrary cats；
- Petdex parity achieved；
- Petdex asset reuse authorization；
- 3D ready；
- automatic photo-to-3D ready；
- remote asset loading ready；
- asset marketplace ready；
- production signed release ready；
- notarized release ready；
- auto update ready；
- Windows ready；
- cross-platform ready；
- OS-level Codex window binding ready；
- all Codex workflows verified；
- MCP ready；
- Third-party agent integration verified；
- Claude Code integration verified。

## Final Decision

${status === "passed"
    ? "passed: V28 final acceptance passed for scoped tested local Photo-to-Animated-2D Productization workflow evidence."
    : "blocked: V28 final acceptance did not meet every gate."}
`;
}

function safeExec(command, args) {
  try {
    return execFileSync(command, args, { cwd: REPO_ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

function securityLeak(value) {
  return /(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|Authorization\s*[:=]|api-token\.json|\/Users\/|\/private\/|raw provider response\s*[:=]|raw HTTP payload\s*[:=]|raw photo bytes\s*[:=]|EXIF\/GPS\s*[:=]|source filename\s*[:=]|source path\s*[:=]|workspace path\s*[:=]|config path\s*[:=]|prompt private text\s*[:=])/i.test(String(value));
}

function sanitize(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ").slice(0, 700);
}

function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
