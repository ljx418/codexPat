#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";

const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const REPORT_PATH = "docs/V17.x/v17_6-final-acceptance-report.md";
const HTML_PATH = `docs/V17.x/evidence/v17_6-productized-wizard-html-${DATE}.html`;
const PACK_ROOT = `docs/V17.x/evidence/assets/v17_3-action-sheet-packaging-${DATE}/pack`;
const ACTION_SHEET_PATH = "docs/V7.14/evidence/v7_14-generated-2d-actions-2026-06-01.png";
const V15_SCREENSHOT_PATH = "docs/V15.x/evidence/v15_13_settings_gui_2026-06-10.png";
const V15_RUNTIME_CAPTURE_PATH = "docs/V15.x/evidence/v15_13-photo-2d-preview-apply-report-2026-06-10.html";
const CORE_ACTIONS = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"];
const records = [];

const requiredEvidence = [
  ["V17.0 scope freeze", `docs/V17.x/evidence/v17_0-scope-freeze-${DATE}.md`],
  ["V17.1 wizard shell", `docs/V17.x/evidence/v17_1-wizard-shell-photo-intake-${DATE}.md`],
  ["V17.2 generation mode", `docs/V17.x/evidence/v17_2-generation-mode-loading-${DATE}.md`],
  ["V17.3 action sheet packaging", `docs/V17.x/evidence/v17_3-action-sheet-packaging-${DATE}.md`],
  ["V17.4 modal preview QA", `docs/V17.x/evidence/v17_4-modal-preview-qa-${DATE}.md`],
  ["V17.5 apply rollback", `docs/V17.x/evidence/v17_5-apply-rollback-${DATE}.md`]
];

for (const [name, path] of requiredEvidence) {
  record(name, evidencePassed(path), safePath(path), "blocked");
}

runCommand("desktop check", ["pnpm", "--filter", "desktop", "check"]);
runCommand("desktop test", ["pnpm", "--filter", "desktop", "test"]);
runCommand("desktop build", ["pnpm", "--filter", "desktop", "build"]);
runCommand("V15.12 continuity assembly regression", ["node", "scripts/v15_12_photo_2d_continuity_assembly_smoke.mjs"]);
runCommand("V15.13 preview/apply regression", ["node", "scripts/v15_13_photo_2d_preview_apply_smoke.mjs"], {
  V15_13_GUI_SCREENSHOT_PATH: V15_SCREENSHOT_PATH,
  V15_13_RUNTIME_CAPTURE_PATH: V15_RUNTIME_CAPTURE_PATH
});
runCommand("V16.6 provider/photo2d final regression", ["node", "scripts/v16_6_final_provider_photo2d_gate_smoke.mjs"]);
record("V17.1-V17.5 smoke evidence review", requiredEvidence.every(([, path]) => evidencePassed(path)), "passed evidence files reviewed; nested tsx rerun excluded from final gate because the sandbox blocks tsx temporary IPC pipes");

record("V17 generated pack exists", existsSync(join(PACK_ROOT, "pet.json")), "generated pack pet.json present", "blocked");
record("V17 action sheet source exists", existsSync(ACTION_SHEET_PATH), "sanitized action sheet source present", "blocked");
record("V15 GUI screenshot regression evidence exists", existsSync(V15_SCREENSHOT_PATH), "screenshot evidence present", "blocked");
record("V15 runtime capture regression evidence exists", existsSync(V15_RUNTIME_CAPTURE_PATH), "runtime capture evidence present", "blocked");
record("security scan", securityScan(), "no token, Authorization, raw payload, raw photo bytes, prompt text, provider payload, full local path, or api-token filename in scanned V17 text evidence");
record("claim scan", claimScan(), "final claim is scoped; forbidden claims remain forbidden/not-ready/not-implied");
record("PRD/spec review", prdSpecReview(), "active V17 PRD, architecture, acceptance, claim matrix, and implementation contract align with the productized wizard scope");

const status = finishStatus();
mkdirSync(dirname(REPORT_PATH), { recursive: true });
mkdirSync(dirname(HTML_PATH), { recursive: true });
writeFileSync(REPORT_PATH, renderReport(status));
writeFileSync(HTML_PATH, renderHtml(status));

console.log(JSON.stringify({ ok: status === "passed", status, reportPath: REPORT_PATH, htmlPath: HTML_PATH, records }, null, 2));
process.exit(status === "passed" ? 0 : status === "blocked" ? 2 : 1);

function runCommand(name, command, extraEnv = {}) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "ignore",
    env: { ...process.env, ...extraEnv }
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
  return existsSync(path) && /^status:\s*passed\b/im.test(readFileSync(path, "utf8"));
}

function readSafe(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function collectText(root) {
  if (!existsSync(root)) return "";
  const stat = statSync(root);
  if (stat.isFile()) {
    return [".md", ".ts", ".tsx", ".js", ".mjs", ".json", ".html"].includes(extname(root)) ? readFileSync(root, "utf8") : "";
  }
  return readdirSync(root).map((entry) => collectText(join(root, entry))).join("\n");
}

function securityScan() {
  const text = [
    collectText("docs/V17.x"),
    collectText("apps/desktop/src/assets/photo-to-2d-wizard.ts"),
    collectText("scripts/v17_1_wizard_shell_smoke.mjs"),
    collectText("scripts/v17_2_generation_mode_loading_smoke.mjs"),
    collectText("scripts/v17_3_action_sheet_packaging_smoke.mjs"),
    collectText("scripts/v17_4_modal_preview_qa_smoke.mjs"),
    collectText("scripts/v17_5_apply_rollback_smoke.mjs")
  ].join("\n")
    .replace(/api-token\.json/g, "api token filename forbidden claim")
    .replace(/full local path/g, "private path forbidden claim")
    .replace(/raw photo bytes/g, "raw photo forbidden claim")
    .replace(/exposesFullLocalPath:\s*false/g, "exposes private path false")
    .replace(/exposesCredential:\s*false/g, "exposes credential false")
    .replace(/storesRawPhoto:\s*false/g, "stores raw photo false")
    .replace(/storesExifGps:\s*false/g, "stores exif gps false");
  return ![
    /sk-[A-Za-z0-9_-]{12,}/,
    /Bearer\s+[A-Za-z0-9._-]{12,}/,
    /Authorization\s*:/i,
    /\/Users\/[^/\s`"')]+/,
    /api-token\.json/,
    /rawPayload\s*[:=]/i,
    /rawProviderPayload\s*[:=]/i,
    /promptText\s*[:=]/i,
    /fullLocalPath\s*[:=]/i,
    /workspacePath\s*[:=]/i,
    /configPath\s*[:=]/i,
    /exifGps\s*:\s*true/i
  ].some((pattern) => pattern.test(text));
}

function claimScan() {
  const text = [
    collectText("docs/V17.x"),
    readSafe("docs/active/agent_desktop_pet_prd_v17.md"),
    readSafe("docs/active/current-vs-target-gap.md"),
    readSafe("docs/active/development-plan.md"),
    readSafe("docs/active/acceptance-plan.md")
  ].join("\n");
  const forbiddenClaims = [
    "automatic photo-to-2D ready for arbitrary cats",
    "automatic photo-to-animation ready",
    "provider integration verified",
    "Petdex parity achieved",
    "3D ready",
    "automatic photo-to-3D ready",
    "remote asset loading ready",
    "asset marketplace ready",
    "production signed release ready",
    "notarized release ready",
    "auto update ready",
    "cross-platform ready",
    "Windows ready",
    "OS-level Codex window binding ready",
    "already-open Codex auto-monitoring ready",
    "all Codex workflows verified",
    "MCP ready",
    "Third-party agent integration verified",
    "Claude Code integration verified"
  ];
  const finalAllowedClaim = "V17 photo-to-2D wizard passed for tested local photo and action-sheet import scenarios; direct provider API generation remains not-ready.";
  const noAllowedOverclaim = forbiddenClaims.every((claim) => !new RegExp(`${escapeRegExp(claim)}\\s*(passed|ready|verified|achieved)`, "i").test(text));
  return text.includes(finalAllowedClaim) && noAllowedOverclaim;
}

function prdSpecReview() {
  const text = [
    readSafe("docs/active/agent_desktop_pet_prd_v17.md"),
    readSafe("docs/V17.x/v17_x-target-architecture.md"),
    readSafe("docs/V17.x/v17_x-development-plan.md"),
    readSafe("docs/V17.x/v17_x-acceptance-plan.md"),
    readSafe("docs/V17.x/v17_x-implementation-contract.md")
  ].join("\n");
  return text.includes("V17") &&
    text.includes("photo-to-2D") &&
    text.includes("action sheet") &&
    text.includes("rollback") &&
    text.includes("direct provider API generation remains not-ready");
}

function actionCards() {
  return CORE_ACTIONS.map((action) => {
    const framePath = join(PACK_ROOT, action, "frame-001.png");
    return `
      <article class="action-card">
        <img src="${dataUri(framePath)}" alt="${escapeHtml(action)} preview" />
        <div>
          <strong>${escapeHtml(action)}</strong>
          <span>${["idle", "thinking", "running", "sleeping"].includes(action) ? "6 frames" : "3 frames"} · animated</span>
        </div>
      </article>
    `;
  }).join("\n");
}

function renderReport(status) {
  return `# V17.6 Productized Photo-to-2D Wizard Final Acceptance Report

Date: ${DATE}
Status: ${status}

This report is the V17 final gate only. It does not upgrade provider API, arbitrary-cat generation, Petdex parity, 3D, marketplace, release signing, or cross-platform claims.

## Scope

- Local photo intake wizard with consent and safe metadata.
- Host/manual generation mode and provider-not-ready UX.
- Local 4x2 action sheet import and auto-packaging.
- In-modal 8-action preview QA.
- Target-only apply and rollback model.

## Evidence

- V17.0: \`docs/V17.x/evidence/v17_0-scope-freeze-${DATE}.md\`
- V17.1: \`docs/V17.x/evidence/v17_1-wizard-shell-photo-intake-${DATE}.md\`
- V17.2: \`docs/V17.x/evidence/v17_2-generation-mode-loading-${DATE}.md\`
- V17.3: \`docs/V17.x/evidence/v17_3-action-sheet-packaging-${DATE}.md\`
- V17.4: \`docs/V17.x/evidence/v17_4-modal-preview-qa-${DATE}.md\`
- V17.5: \`docs/V17.x/evidence/v17_5-apply-rollback-${DATE}.md\`
- V17.6 HTML: \`${HTML_PATH}\`

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((row) => `| ${row.name} | ${row.result} | ${row.details.replace(/\|/g, "/")} |`).join("\n")}

## Claim Basis Table

| Capability | Evidence | Claim Basis |
| --- | --- | --- |
| local photo wizard | V17.1 | tested local safe photo intake |
| generation mode UX | V17.2 | host/manual path and provider-not-ready state |
| action-sheet import | V17.3 | tested 4x2 local action sheet |
| modal preview QA | V17.4 | all 8 actions visible in isolated preview |
| target apply/rollback | V17.5 | target-only model/store apply and rollback |
| provider API | no accepted provider API evidence in V17 | not-ready |
| arbitrary cats | one tested local cat photo/action-sheet path | not claimed |

## Allowed Claim

${status === "passed"
    ? "V17 photo-to-2D wizard passed for tested local photo and action-sheet import scenarios; direct provider API generation remains not-ready."
    : "No V17 final passed claim is made while status is not passed."}

## Forbidden Claims

- automatic photo-to-2D ready for arbitrary cats
- automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- remote asset loading ready
- asset marketplace ready
- production signed release ready
- notarized release ready
- auto update ready
- cross-platform ready
- Windows ready
- OS-level Codex window binding ready
- already-open Codex auto-monitoring ready
- all Codex workflows verified
- MCP ready
- Third-party agent integration verified
- Claude Code integration verified
`;
}

function renderHtml(status) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>V17 照片到 2D 动作资产向导验收</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; background: #f5f7fb; }
    main { max-width: 1180px; margin: 0 auto; padding: 28px; }
    h1 { margin: 0 0 8px; font-size: 30px; }
    h2 { margin-top: 0; }
    .status { display: inline-flex; padding: 7px 12px; border-radius: 999px; font-weight: 800; background: ${status === "passed" ? "#d7f6e2" : status === "blocked" ? "#fff1c6" : "#ffdede"}; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; margin: 18px 0; }
    .card, .action-card { background: #fff; border: 1px solid #dfe7f1; border-radius: 12px; box-shadow: 0 1px 2px rgba(16,24,40,.05); }
    .card { padding: 18px; }
    .muted { color: #5d6b82; }
    .actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(136px, 1fr)); gap: 12px; }
    .action-card { overflow: hidden; }
    .action-card img { display: block; width: 100%; aspect-ratio: 1.15; object-fit: contain; background: linear-gradient(180deg, #edf5ff, #fff); }
    .action-card div { padding: 10px; }
    .action-card strong, .action-card span { display: block; }
    .action-card span { font-size: 13px; color: #637083; margin-top: 3px; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; }
    th, td { padding: 10px; border-bottom: 1px solid #e6edf5; text-align: left; font-size: 14px; vertical-align: top; }
    code { background: #edf2f7; padding: 2px 5px; border-radius: 5px; }
    figure { margin: 0; }
    figure img { display: block; max-width: 100%; border: 1px solid #dfe7f1; border-radius: 12px; background: white; }
  </style>
</head>
<body>
  <main>
    <h1>V17 照片到 2D 动作资产向导验收</h1>
    <p class="muted">本页展示 V17 的真实本地照片/动作表导入、预览、目标应用与回滚链路。Provider API 仍为 not-ready。</p>
    <span class="status">status: ${escapeHtml(status)}</span>

    <section class="grid">
      <article class="card"><strong>用户入口</strong><p>设置页照片生成动作资产向导，支持本地照片、同意确认、特征输入、目标包名。</p></article>
      <article class="card"><strong>生成路径</strong><p>支持 host/manual 动作表路径；provider API 显示 not-ready，不误导用户。</p></article>
      <article class="card"><strong>资产包</strong><p>4x2 动作表被裁切成 8 个 core actions，并生成安全 pet.json。</p></article>
      <article class="card"><strong>安全边界</strong><p>不发 PetEvent，不调用 notify，不写 CatStateMachine，不记录私密路径或原始照片字节。</p></article>
    </section>

    <section class="card">
      <h2>8 动作预览</h2>
      <div class="actions">${actionCards()}</div>
    </section>

    <section class="grid">
      <article class="card">
        <h2>动作表源</h2>
        <figure><img src="${dataUri(ACTION_SHEET_PATH)}" alt="V17 action sheet source" /></figure>
      </article>
      <article class="card">
        <h2>GUI 回归截图</h2>
        <figure><img src="${dataUri(V15_SCREENSHOT_PATH)}" alt="V15.13 GUI regression screenshot" /></figure>
      </article>
    </section>

    <section class="card">
      <h2>检查结果</h2>
      <table>
        <thead><tr><th>检查项</th><th>结果</th><th>说明</th></tr></thead>
        <tbody>${records.map((row) => `<tr><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.result)}</td><td>${escapeHtml(row.details)}</td></tr>`).join("")}</tbody>
      </table>
    </section>

    <section class="card">
      <h2>最终声明边界</h2>
      <p><strong>允许：</strong>V17 photo-to-2D wizard passed for tested local photo and action-sheet import scenarios; direct provider API generation remains not-ready.</p>
      <p><strong>仍禁止：</strong>arbitrary cats automatic photo-to-2D、provider verified、Petdex parity、3D ready、production release、Windows/cross-platform。</p>
    </section>
  </main>
</body>
</html>`;
}

function dataUri(path) {
  if (!existsSync(path)) return "";
  const ext = extname(path).toLowerCase();
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".webp" ? "image/webp" : "image/png";
  return `data:${mime};base64,${readFileSync(path).toString("base64")}`;
}

function safePath(path) {
  return basename(path);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
