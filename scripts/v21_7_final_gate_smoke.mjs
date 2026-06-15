#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const FINAL_MD = `docs/V21.x/v21_7-final-acceptance-report.md`;
const FINAL_HTML = `docs/V21.x/evidence/v21_7-final-acceptance-dashboard-${DATE}.html`;

const evidencePaths = [
  ["V21.0 Scope Freeze", `docs/V21.x/evidence/v21_0-scope-freeze-${DATE}.md`, "passed"],
  ["V21.1 Route A", `docs/V21.x/evidence/v21_1-route-a-keypose-pack-smoke-${DATE}.md`, "passed"],
  ["V21.2 Route B", `docs/V21.x/evidence/v21_2-route-b-provider-preflight-${DATE}.md`, "passed"],
  ["V21.3 Route C", `docs/V21.x/evidence/v21_3-route-c-local-rig-smoke-${DATE}.md`, "passed"],
  ["V21.4 Route D", `docs/V21.x/evidence/v21_4-route-d-video-frame-smoke-${DATE}.md`, "excluded"],
  ["V21.5 Comparator", `docs/V21.x/evidence/v21_5-route-comparator-smoke-${DATE}.md`, "passed"],
  ["V21.6 Best Route", `docs/V21.x/evidence/v21_6-best-route-preview-apply-rollback-${DATE}.md`, "passed"]
];

const records = [];
const evidenceTexts = [];

for (const [name, path, expected] of evidencePaths) {
  const text = read(path);
  evidenceTexts.push(text);
  const status = statusOf(text);
  record(name, Boolean(text) && status === expected, `status=${status || "missing"}; expected=${expected}`, "blocked");
}

const routeAContact = imageData(`docs/V21.x/evidence/assets/v21-route-a-keypose-${DATE}/route-a-contact-sheet.jpg`, "image/jpeg");
const routeCContact = imageData(`docs/V21.x/evidence/assets/v21-route-c-local-rig-${DATE}/route-c-contact-sheet.jpg`, "image/jpeg");
const v21_6Preview = imageData(`docs/V21.x/evidence/assets/v21_6-best-route-preview-apply-rollback-${DATE}/route-a-preview-grid.png`, "image/png");
record("visual evidence available", Boolean(routeAContact && routeCContact && v21_6Preview), "Route A, Route C, and V21.6 preview images embedded", "blocked");

const regression = runRegression();
record("pnpm --filter desktop check", regression.desktopCheck, "desktop TypeScript check passed", "failed");
record("pnpm --filter @agent-desktop-pet/petctl test", regression.petctlTest, "petctl tests passed", "failed");

const artifact = artifactScan();
record("git artifact scan", artifact.ok, artifact.details, "failed");
record("security scan", securityScan(evidenceTexts.join("\n")), "no token, Authorization, raw provider response, raw photo bytes, full local path, prompt private text", "failed");
record("claim scan", claimScan(evidenceTexts.join("\n")), "forbidden claims only appear in forbidden/not-ready/not-implied contexts", "failed");

const failed = records.some((item) => item.result === "failed");
const blocked = records.some((item) => item.result === "blocked");
const status = failed ? "failed" : blocked ? "blocked" : "passed";

mkdirSync(dirname(resolve(REPO_ROOT, FINAL_MD)), { recursive: true });
mkdirSync(dirname(resolve(REPO_ROOT, FINAL_HTML)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, FINAL_MD), renderMarkdown(status), "utf8");
writeFileSync(resolve(REPO_ROOT, FINAL_HTML), renderHtml(status, routeAContact, routeCContact, v21_6Preview), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, finalReport: FINAL_MD, dashboard: FINAL_HTML, records }, null, 2));
process.exit(status === "passed" ? 0 : status === "blocked" ? 2 : 1);

function runRegression() {
  return {
    desktopCheck: run("pnpm", ["--filter", "desktop", "check"]),
    petctlTest: run("pnpm", ["--filter", "@agent-desktop-pet/petctl", "test"])
  };
}

function run(command, args) {
  try {
    execFileSync(command, args, { cwd: REPO_ROOT, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function artifactScan() {
  let output = "";
  try {
    output = execFileSync("git", ["status", "--short", "--", "."], { cwd: REPO_ROOT, encoding: "utf8" });
  } catch {
    return { ok: false, details: "git_status_failed" };
  }
  const lines = output.split(/\r?\n/).filter(Boolean);
  const forbidden = lines.filter((line) => /(^|\/)(node_modules|target|dist)\//.test(line) || /provider-raw|raw-provider|api-token\.json/i.test(line));
  return {
    ok: forbidden.length === 0,
    details: forbidden.length === 0 ? `tracked workspace changes=${lines.length}; no generated dist/target/node_modules/provider raw artifacts in project pathspec` : `forbidden artifacts=${forbidden.length}`
  };
}

function read(path) {
  const full = resolve(REPO_ROOT, path);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
}

function statusOf(text) {
  return /^status:\s*(passed|blocked|failed|excluded)/m.exec(text)?.[1] ?? "";
}

function imageData(path, type) {
  const full = resolve(REPO_ROOT, path);
  return existsSync(full) ? `data:${type};base64,${readFileSync(full).toString("base64")}` : "";
}

function securityScan(text) {
  return !/(Authorization\s*[:=]|api-token\.json|\/Users\/[^\s`|)]+|\/private\/[^\s`|)]+|sk-[A-Za-z0-9_-]{8,}|raw provider response\s*[:=]|raw photo bytes\s*[:=]|prompt private text\s*[:=]|workspace path\s*[:=]|config path\s*[:=]|Bearer\s+[A-Za-z0-9._-]{8,})/i.test(text);
}

function claimScan(text) {
  const forbidden = [
    "arbitrary cats automatic photo-to-animation ready",
    "automatic photo-to-2D ready for arbitrary cats",
    "provider integration verified",
    "low-retry provider reliability for arbitrary cats",
    "Petdex parity achieved",
    "3D ready",
    "automatic photo-to-3D ready",
    "remote asset loading ready",
    "asset marketplace ready",
    "production signed release ready",
    "Windows ready",
    "cross-platform ready",
    "OS-level Codex window binding ready",
    "all Codex workflows verified",
    "MCP ready",
    "Third-party agent integration verified",
    "Claude Code integration verified"
  ];
  return forbidden.every((claim) => {
    const lines = text.split(/\r?\n/);
    return lines.every((line, index) => {
      if (!line.includes(claim)) return true;
      const context = lines.slice(Math.max(0, index - 10), Math.min(lines.length, index + 2)).join("\n");
      return /forbidden|forbidden claims|not-ready|not implied|not-implied|禁止|不得|仍禁止|no claim|does not claim|does not imply|must not claim|不是|不声明|不能声明/i.test(context);
    });
  });
}

function record(name, ok, details, failStatus = "failed") {
  records.push({ name, result: ok ? "passed" : failStatus, details });
}

function renderMarkdown(status) {
  return `# V21.7 Final Acceptance Report

status: ${status}
date: ${DATE}

## Scope

V21 closes the multi-route animation asset recovery track. It validates route
evidence for provider-derived key-pose recovery, alternate provider review,
local rig fallback, video-route exclusion, visual comparison, and best-route
preview/apply/rollback.

This report does not claim provider integration, arbitrary-cat automatic
photo-to-animation, Petdex parity, 3D readiness, or production release readiness.

## Evidence Gate

| Gate | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.result} | ${sanitize(item.details)} |`).join("\n")}

## Route Decision

| Route | Final Status | Decision |
| --- | --- | --- |
| Route A Provider key-pose -> local animation pack | passed | selected best route for V21.6 |
| Route B Alternate provider preflight | passed as review | not final route evidence alone |
| Route C Unified character local 2D rig | passed | available fallback/comparison route |
| Route D Image-to-video -> frames | excluded | no safe explicit-consent video source |

## Regression

- pnpm --filter desktop check: ${regression.desktopCheck ? "passed" : "failed"}
- pnpm --filter @agent-desktop-pet/petctl test: ${regression.petctlTest ? "passed" : "failed"}

## Human-visible Dashboard

\`${FINAL_HTML}\`

## Allowed Claim

V21 multi-route animation asset recovery passed for the tested Route A
MiniMax-derived key-pose to local animation pack scenario with QA, visual
comparator, target-only preview/apply, and rollback evidence. Route C local 2D
rig also passed as a tested fallback route.

## Forbidden Claims

- arbitrary cats automatic photo-to-animation ready
- provider integration verified
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- 3D ready
- production signed release ready
- Windows ready
- cross-platform ready

## Final Decision

${status === "passed"
  ? "V21 scoped acceptance passed. The project has a route-scoped recovery path, not a general provider/product parity claim."
  : "V21 final acceptance did not pass. Do not use the allowed claim."}
`;
}

function renderHtml(status, routeAImage, routeCImage, previewImage) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>V21 Final Acceptance Dashboard</title>
<style>
body{margin:0;background:#f4f1ea;color:#20242a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
header{background:#26384d;color:white;padding:30px 40px}h1{margin:0 0 8px;font-size:32px}main{max-width:1280px;margin:auto;padding:26px 36px}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.card{background:white;border:1px solid #d8d2c7;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:18px}
.wide{grid-column:1/-1}.status{display:inline-block;padding:5px 10px;border-radius:999px;font-weight:700}.passed{background:#d9f2df;color:#166232}.blocked,.excluded{background:#fff0cc;color:#745100}.failed{background:#ffd9d4;color:#8c1d18}
img{width:100%;height:auto;border:1px solid #e5e0d6;border-radius:8px;background:#fff}table{width:100%;border-collapse:collapse;font-size:14px}td,th{border-bottom:1px solid #eee7da;padding:8px;text-align:left;vertical-align:top}code{background:#f0ede6;border-radius:4px;padding:1px 4px}
@media(max-width:900px){.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<header>
  <h1>V21 Final Acceptance Dashboard</h1>
  <div>status: ${status} · date: ${DATE} · route-scoped recovery, not provider integration verified</div>
</header>
<main>
  <section class="card wide">
    <h2>阶段结论</h2>
    <p><span class="status ${status}">${status}</span></p>
    <p>V21 通过四路线验证，最终选择 Route A 作为测试场景的最佳路线：MiniMax 派生关键姿势 -> 本地动作包 -> QA -> 可视化对比 -> 目标实例 apply/rollback。Route C 作为本地 rig 备选路线也通过。Route D 因没有安全视频来源被排除。</p>
    <p>这不是任意猫自动动画 ready，也不是 provider integration verified。</p>
  </section>
  <section class="grid">
    <article class="card">
      <h2>Route A：最终推荐路线</h2>
      <p>Provider-derived key poses to local animation pack。</p>
      <img src="${routeAImage}" alt="Route A contact sheet">
    </article>
    <article class="card">
      <h2>Route C：可控本地 rig 备选</h2>
      <p>Unified character local 2D rig。</p>
      <img src="${routeCImage}" alt="Route C contact sheet">
    </article>
    <article class="card wide">
      <h2>V21.6 目标应用预览</h2>
      <p>真实 Route A 帧输入，模型层证明 preview zero PetEvent、target-only apply、rollback restored previous pack。</p>
      <img src="${previewImage}" alt="V21.6 preview grid">
    </article>
    <article class="card wide">
      <h2>证据与回归</h2>
      <table>
        <tr><th>Check</th><th>Result</th><th>Details</th></tr>
        ${records.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.result)}</td><td>${escapeHtml(item.details)}</td></tr>`).join("")}
      </table>
    </article>
  </section>
</main>
</body>
</html>`;
}

function sanitize(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ").slice(0, 500);
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
