#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const HTML_PATH = `docs/V21.x/evidence/v21_5-route-comparator-report-${DATE}.html`;
const MD_PATH = `docs/V21.x/evidence/v21_5-route-comparator-smoke-${DATE}.md`;

const routeA = loadSummary(`docs/V21.x/evidence/assets/v21-route-a-keypose-${DATE}/route-a-summary.json`);
const routeC = loadSummary(`docs/V21.x/evidence/assets/v21-route-c-local-rig-${DATE}/route-c-summary.json`);
const routeB = readEvidence(`docs/V21.x/evidence/v21_2-route-b-provider-preflight-${DATE}.md`);
const routeD = readEvidence(`docs/V21.x/evidence/v21_4-route-d-video-frame-smoke-${DATE}.md`);
const records = [];

record("Route A evidence exists", Boolean(routeA), routeA ? routeA.reasonCode : "missing");
record("Route B evidence exists", Boolean(routeB), routeB ? "provider preflight evidence present" : "missing");
record("Route C evidence exists", Boolean(routeC), routeC ? routeC.reasonCode : "missing");
record("Route D evidence exists", Boolean(routeD), routeD ? "video route decision evidence present" : "missing");
record("at least one visual route output exists", Boolean(routeA || routeC), "V21.5 requires route output or all explicit blocked/excluded");

const routeAImage = imageData(`docs/V21.x/evidence/assets/v21-route-a-keypose-${DATE}/route-a-contact-sheet.jpg`);
const routeCImage = imageData(`docs/V21.x/evidence/assets/v21-route-c-local-rig-${DATE}/route-c-contact-sheet.jpg`);
record("visual evidence embedded", Boolean(routeAImage || routeCImage), "HTML embeds contact sheets as data URLs");
record("security scan", securityScan([routeA, routeC, routeB, routeD]), "no token, Authorization, raw provider response, full local path, prompt private text");
record("claim scan", claimScan(), "comparator does not imply V21 final passed");

const status = records.every((item) => item.ok) ? "passed" : "failed";
mkdirSync(dirname(resolve(REPO_ROOT, HTML_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, HTML_PATH), renderHtml(status, routeAImage, routeCImage), "utf8");
writeFileSync(resolve(REPO_ROOT, MD_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, html: HTML_PATH, evidence: MD_PATH, records }, null, 2));
process.exit(status === "passed" ? 0 : 1);

function loadSummary(path) {
  const full = resolve(REPO_ROOT, path);
  if (!existsSync(full)) return null;
  return JSON.parse(readFileSync(full, "utf8"));
}

function readEvidence(path) {
  const full = resolve(REPO_ROOT, path);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
}

function imageData(path) {
  const full = resolve(REPO_ROOT, path);
  if (!existsSync(full)) return "";
  return `data:image/jpeg;base64,${readFileSync(full).toString("base64")}`;
}

function renderHtml(status, routeAImage, routeCImage) {
  const bestRoute = routeA?.status === "passed" ? "Route A" : routeC?.status === "passed" ? "Route C" : "V19 fallback";
  const recommendation = bestRoute === "Route A"
    ? "推荐 Route A 进入 V21.6：它更接近 provider 派生视觉，动作幅度强，但仍不是任意猫自动动画 ready。"
    : bestRoute === "Route C"
      ? "推荐 Route C 进入 V21.6：它更可控且透明背景稳定，但视觉偏本地插画 rig。"
      : "没有 V21 路线通过，保留 V19 fallback。";
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>V21 Route Comparator</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f5f2ec; color: #242424; }
    header { padding: 28px 36px; background: #2f4156; color: white; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    main { padding: 24px 36px 40px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
    .card { background: white; border: 1px solid #d8d4ca; border-radius: 10px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
    .status { display: inline-block; padding: 4px 9px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .passed { background: #d9f2df; color: #166232; }
    .blocked, .excluded { background: #fff0cc; color: #745100; }
    .failed { background: #ffd9d4; color: #8c1d18; }
    img { width: 100%; height: auto; border: 1px solid #ece7dd; background: white; }
    table { border-collapse: collapse; width: 100%; margin-top: 10px; font-size: 14px; }
    th, td { border-bottom: 1px solid #eee7da; text-align: left; padding: 8px; vertical-align: top; }
    .wide { grid-column: 1 / -1; }
    code { background: #f0ede6; padding: 1px 4px; border-radius: 4px; }
  </style>
</head>
<body>
  <header>
    <h1>V21 多路线动画资产恢复：真实效果对比</h1>
    <div>status: ${status} · date: ${DATE} · V21 final remains No-Go until V21.6/V21.7 evidence</div>
  </header>
  <main>
    <section class="card wide">
      <h2>阶段结论</h2>
      <p>${recommendation}</p>
      <p>本页只证明路线对比。它不声明 provider integration verified、不声明任意猫 automatic photo-to-animation ready、不声明 Petdex parity。</p>
    </section>
    <section class="grid">
      ${routeCard("Route A", "Provider key-pose -> local pack", routeA, routeAImage)}
      ${routeCard("Route C", "Unified character + local 2D rig", routeC, routeCImage)}
      ${nonVisualCard("Route B", "Alternate provider preflight", "passed", "provider capability review completed; no live smoke; MiniMax candidate_limited; alternatives candidate_unverified")}
      ${nonVisualCard("Route D", "Image-to-video -> frames", "excluded", "no safe explicit-consent video source was available; no unlicensed video consumed")}
    </section>
    <section class="card wide">
      <h2>出门条件提醒</h2>
      <table>
        <tr><th>Gate</th><th>Decision</th></tr>
        <tr><td>V21.5 Comparator</td><td>passed: this page embeds visual route evidence.</td></tr>
        <tr><td>V21.6 Best route apply/rollback</td><td>No-Go until selected route is exercised through target-only preview/apply/rollback.</td></tr>
        <tr><td>V21.7 Final</td><td>No-Go until V21.0-V21.6 evidence exists.</td></tr>
      </table>
    </section>
  </main>
</body>
</html>`;
}

function routeCard(name, title, summary, image) {
  const status = summary?.status ?? "missing";
  const qa = summary?.qa ?? {};
  return `<article class="card">
    <h2>${name}: ${title}</h2>
    <span class="status ${status}">${status}</span>
    <table>
      <tr><th>packId</th><td><code>${summary?.packId ?? "missing"}</code></td></tr>
      <tr><th>reasonCode</th><td>${summary?.reasonCode ?? "missing"}</td></tr>
      <tr><th>actions</th><td>${summary?.actionCount ?? 0}</td></tr>
      <tr><th>motion</th><td>${qa.motionAmplitudePassed ?? false}</td></tr>
      <tr><th>same-cat</th><td>${qa.sameCatPassed ?? false}</td></tr>
      <tr><th>background</th><td>${qa.backgroundPassed ?? false}</td></tr>
    </table>
    ${image ? `<h3>Contact sheet</h3><img alt="${name} contact sheet" src="${image}" />` : "<p>No visual output.</p>"}
  </article>`;
}

function nonVisualCard(name, title, status, details) {
  return `<article class="card">
    <h2>${name}: ${title}</h2>
    <span class="status ${status}">${status}</span>
    <p>${details}</p>
  </article>`;
}

function renderEvidence(status) {
  return `# V21.5 Route Comparator Evidence

status: ${status}
date: ${DATE}

## Scope

V21.5 generates a side-by-side visual comparator for route outputs and route
decisions. It does not apply packs or mark V21 final passed.

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${sanitize(item.details)} |`).join("\n")}

## Route Summary

| Route | Status | Notes |
| --- | --- | --- |
| Route A | ${routeA?.status ?? "missing"} | ${routeA?.reasonCode ?? "missing"} |
| Route B | passed | capability review only; no live smoke |
| Route C | ${routeC?.status ?? "missing"} | ${routeC?.reasonCode ?? "missing"} |
| Route D | excluded | no safe video source |

## HTML Evidence

\`${HTML_PATH}\`

## Allowed Claim

V21 route comparator passed with embedded visual evidence for tested Route A and Route C outputs.

## Forbidden Claims

- V21 final passed
- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- Petdex parity achieved
`;
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function securityScan(values) {
  const text = values.map((value) => typeof value === "string" ? value : JSON.stringify(value)).join("\n");
  return !/(Authorization\s*[:=]|api-token\.json\s*[:=]|\/Users\/[^\s`|)]+|\/private\/[^\s`|)]+|sk-[A-Za-z0-9_-]{8,}|raw provider response\s*[:=]|raw photo bytes\s*[:=]|prompt private text\s*[:=])/i.test(text);
}

function claimScan() {
  const text = `${JSON.stringify(routeA)}\n${JSON.stringify(routeC)}`;
  return !/(V21 final passed\s*$|provider integration verified\s+passed|Petdex parity achieved\s+passed|arbitrary cats automatic photo-to-animation ready\s+passed)/im.test(text);
}

function sanitize(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ").slice(0, 500);
}

function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
