#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const FINAL_REPORT = "docs/V18.x/v18_6-final-acceptance-report.md";
const FINAL_HTML = `docs/V18.x/evidence/v18_6-photo-to-2d-html-${DATE}.html`;
const SOURCE_DIR = `docs/V18.x/evidence/assets/v18_3-multi-action-normalizer-${DATE}`;
const ACTIONS = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"];
const evidence = [
  ["V18.0", `docs/V18.x/evidence/v18_0-scope-freeze-${DATE}.md`],
  ["V18.1", `docs/V18.x/evidence/v18_1-reference-photo-consent-${DATE}.md`],
  ["V18.2", `docs/V18.x/evidence/v18_2-provider-capability-preflight-${DATE}.md`],
  ["V18.3", `docs/V18.x/evidence/v18_3-multi-action-normalizer-${DATE}.md`],
  ["V18.4", `docs/V18.x/evidence/v18_4-same-cat-continuity-qa-${DATE}.md`],
  ["V18.5", `docs/V18.x/evidence/v18_5-preview-apply-rollback-${DATE}.md`]
];
const cases = [];

for (const [phase, path] of evidence) {
  const full = resolve(REPO_ROOT, path);
  const ok = existsSync(full) && /^status:\s*passed/m.test(readFileSync(full, "utf8"));
  record(`${phase} evidence passed`, ok ? "passed" : "blocked", path);
}

record("desktop check", runCheck(["pnpm", "--filter", "desktop", "check"]));
record("desktop test", runCheck(["pnpm", "--filter", "desktop", "test"]));

const visualAssets = ACTIONS.map((action) => {
  const frames = [1, 2, 3].map((index) => `${SOURCE_DIR}/pack/${action}/frame-${String(index).padStart(3, "0")}.png`);
  return {
    action,
    frames,
    exists: frames.every((imagePath) => existsSync(resolve(REPO_ROOT, imagePath))),
    dataUris: frames.map((imagePath) => existsSync(resolve(REPO_ROOT, imagePath)) ? dataUri(resolve(REPO_ROOT, imagePath)) : "")
  };
});
record("generated visual assets", visualAssets.every((asset) => asset.exists) ? "passed" : "failed", `actions=${visualAssets.filter((asset) => asset.exists).length}/8`);

record("security scan", securityScan() ? "passed" : "failed", "V18 text evidence/report/scripts do not contain token, Authorization header, provider response body, reference photo bytes, full local path, workspace/config path, or API token file contents");
record("claim scan", claimScan() ? "passed" : "failed", "forbidden claims are not used as ready/passed claims in V18 final report context");
record("license/attribution scan", licenseScan() ? "passed" : "failed", "generated pack manifest records provider:minimax:image-to-image attribution");

const status = cases.some((item) => item.result === "failed")
  ? "failed"
  : cases.some((item) => item.result === "blocked")
    ? "blocked"
    : "passed";

mkdirSync(dirname(resolve(REPO_ROOT, FINAL_HTML)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, FINAL_HTML), renderHtml(status, visualAssets), "utf8");
writeFileSync(resolve(REPO_ROOT, FINAL_REPORT), renderReport(status), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, finalReport: FINAL_REPORT, finalHtml: FINAL_HTML, cases }, null, 2));
process.exit(status === "passed" ? 0 : status === "blocked" ? 2 : 1);

function runCheck(command) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  return result.status === 0
    ? { result: "passed", details: command.join(" ") }
    : { result: "failed", details: `${command.join(" ")} exited ${result.status}` };
}

function record(name, resultOrObject, details) {
  if (typeof resultOrObject === "object") {
    cases.push({ name, result: resultOrObject.result, details: resultOrObject.details });
  } else {
    cases.push({ name, result: resultOrObject, details });
  }
}

function dataUri(filePath) {
  const ext = extname(filePath).toLowerCase();
  const mediaType = ext === ".png" ? "image/png" : "image/jpeg";
  return `data:${mediaType};base64,${readFileSync(filePath).toString("base64")}`;
}

function collectText(paths) {
  return paths
    .filter((path) => existsSync(resolve(REPO_ROOT, path)))
    .map((path) => readFileSync(resolve(REPO_ROOT, path), "utf8"))
    .join("\n");
}

function securityScan() {
  const text = collectText([
    ...evidence.map(([, path]) => path),
    "docs/V18.x/v18_x-acceptance-plan.md",
    "docs/V18.x/v18_x-development-plan.md",
    "docs/V18.x/v18_x-claim-matrix.md",
    "scripts/v18_1_reference_photo_consent_smoke.mjs",
    "scripts/v18_2_provider_capability_preflight_smoke.mjs",
    "scripts/v18_3_multi_action_normalizer_smoke.mjs",
    "scripts/v18_4_same_cat_continuity_qa_smoke.mjs",
    "scripts/v18_5_preview_apply_rollback_smoke.mjs"
  ]);
  return !/(Authorization\s*[:=]|api-token\.json|\/Users\/|\/private\/|raw provider response\s*[:=]|raw reference photo|raw photo bytes\s*[:=]|workspace path\s*[:=]|config path\s*[:=]|sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,})/i.test(text);
}

function claimScan() {
  const reportContext = collectText([
    "docs/V18.x/v18_x-claim-matrix.md",
    "docs/V18.x/v18_x-acceptance-plan.md",
    "docs/V18.x/v18_x-development-plan.md"
  ]);
  return !/(automatic photo-to-2D ready for arbitrary cats\s+passed|provider integration verified\s+passed|Petdex parity achieved\s+passed|3D ready\s+passed|production signed release ready\s+passed)/i.test(reportContext);
}

function licenseScan() {
  const manifestPath = resolve(REPO_ROOT, SOURCE_DIR, "pack", "pet.json");
  if (!existsSync(manifestPath)) return false;
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  return String(manifest.license?.source ?? "").startsWith("provider:minimax:image-to-image") &&
    /MiniMax/i.test(manifest.license?.attribution ?? "");
}

function renderReport(status) {
  return `# V18.6 Final Acceptance Report

status: ${status}
date: ${DATE}

## Scope

V18 closes the tested local workflow:

\`\`\`text
user-provided cat photo
  -> explicit provider consent and disclosure
  -> MiniMax image-to-image/reference-image canonical identity generation
  -> identity-locked 8-action 2D sprite pack
  -> same-cat/continuity QA
  -> in-app preview model
  -> target-only apply
  -> rollback
\`\`\`

This remains a tested local MiniMax scenario. It does not claim arbitrary-cat
automation, provider integration readiness, Petdex parity, 3D readiness, or
production release readiness.

## Evidence Gate

${evidence.map(([phase, path]) => `- ${phase}: ${path}`).join("\n")}

## Final HTML

- ${FINAL_HTML}

## Results

\`\`\`json
${JSON.stringify(cases, null, 2)}
\`\`\`

## Allowed Claim

${status === "passed"
    ? "V18 user-provided cat photo to multi-action 2D pet asset workflow passed for the tested local MiniMax image-to-image provider scenario with in-app preview, target apply, and rollback."
    : "No V18 final passed claim is made while status is not passed."}

## Forbidden Claims

- automatic photo-to-2D ready for arbitrary cats
- automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- production signed release ready
- notarized release ready
- auto update ready
- Windows ready
- cross-platform ready
- OS-level Codex window binding ready
- all Codex workflows verified
- MCP ready
- Third-party agent integration verified
- Claude Code integration verified

## Final Decision

${status === "passed"
    ? "Passed for the scoped tested local MiniMax image-to-image workflow. Continue to future product hardening only if broader provider coverage, arbitrary-cat quality, and real GUI screenshots are separately planned and evidenced."
    : "Blocked/failed. Do not use the final allowed claim."}
`;
}

function renderHtml(status, assets) {
  const badge = status === "passed" ? "通过" : status === "blocked" ? "阻塞" : "失败";
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>V18 照片到 2D 多动作验收汇报</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f6f2e8; color: #1f252c; }
    main { max-width: 1180px; margin: 0 auto; padding: 32px; }
    .hero { display: grid; grid-template-columns: 1.1fr .9fr; gap: 24px; align-items: center; }
    h1 { font-size: 40px; line-height: 1.1; margin: 0 0 12px; }
    .badge { display: inline-flex; padding: 8px 12px; border-radius: 999px; background: ${status === "passed" ? "#0f766e" : "#9f1239"}; color: white; font-weight: 700; }
    .panel { background: rgba(255,255,255,.88); border: 1px solid #ded7c8; border-radius: 18px; padding: 18px; box-shadow: 0 10px 24px rgba(35, 28, 20, .08); }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 16px; }
    .card { background: #fff; border: 1px solid #e2dccf; border-radius: 16px; padding: 10px; }
    .card img { width: 100%; aspect-ratio: 1 / 1; object-fit: contain; background: #fff8e8; border-radius: 12px; display: block; }
    .frame-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
    .label { margin-top: 8px; font-weight: 800; text-align: center; }
    .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .step { background: #fff; border: 1px solid #e2dccf; border-radius: 14px; padding: 14px; min-height: 90px; }
    code { background: #efe7d8; padding: 2px 6px; border-radius: 6px; }
    table { width: 100%; border-collapse: collapse; }
    td, th { border-bottom: 1px solid #e2dccf; padding: 10px; text-align: left; }
    @media (max-width: 900px) { .hero, .steps, .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div>
        <span class="badge">V18 ${badge}</span>
        <h1>用户猫图生成 8 个 2D 动作，并可预览、应用、回滚</h1>
        <p>本报告展示的是本地测试猫图 + MiniMax image-to-image/reference-image provider 的 scoped 验收结果。V18.3 已改为 canonical identity lock：先生成一张同一猫母版，再从同一母版派生 8 个动作帧，避免动作之间变成不同猫。原始参考照片、provider 原始响应、token、Authorization、完整本地路径均未写入本页面。</p>
      </div>
      <div class="panel">
        <strong>最终允许声明</strong>
        <p>${status === "passed"
          ? "V18 user-provided cat photo to multi-action 2D pet asset workflow passed for the tested local MiniMax image-to-image provider scenario with in-app preview, target apply, and rollback."
          : "V18 final claim is not allowed while status is not passed."}</p>
      </div>
    </section>

    <section class="panel" style="margin-top: 24px;">
      <h2>生成结果：8 个核心动作预览</h2>
      <div class="grid">
        ${assets.map((asset) => `<article class="card">
          <div class="frame-strip">${asset.dataUris.map((uri, index) => `<img src="${uri}" alt="${asset.action} frame ${index + 1}" />`).join("")}</div>
          <div class="label">${asset.action}</div>
        </article>`).join("")}
      </div>
    </section>

    <section class="panel" style="margin-top: 24px;">
      <h2>用户路径</h2>
      <div class="steps">
        <div class="step"><strong>1. 选图与同意</strong><p>本地猫图安全预览；必须确认 provider 上传/费用/隐私/留存/license。</p></div>
        <div class="step"><strong>2. 生成与打包</strong><p>MiniMax reference-image 生成 canonical 猫；本地派生 8 个动作并打包成 <code>pet.json + frames</code>。</p></div>
        <div class="step"><strong>3. 预览与应用</strong><p>预览不发 PetEvent；apply 只改目标猫；rollback 恢复 previous pack。</p></div>
      </div>
    </section>

    <section class="panel" style="margin-top: 24px;">
      <h2>验收门槛</h2>
      <table>
        <tr><th>Gate</th><th>Result</th></tr>
        ${cases.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.result)} · ${escapeHtml(item.details)}</td></tr>`).join("")}
      </table>
    </section>

    <section class="panel" style="margin-top: 24px;">
      <h2>仍不声明</h2>
      <p>不声明 arbitrary cats automatic photo-to-2D ready、provider integration verified、Petdex parity、3D ready、production signed release ready、Windows/cross-platform ready。</p>
    </section>
  </main>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
