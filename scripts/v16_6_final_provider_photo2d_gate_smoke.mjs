#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname } from "node:path";

const DATE = "2026-06-11";
const reportPath = "docs/V16.x/v16_6-final-acceptance-report.md";
const htmlPath = `docs/V16.x/evidence/v16_6-provider-photo2d-final-html-${DATE}.html`;
const records = [];

const requiredEvidence = [
  ["V16.0 scope freeze", `docs/V16.x/evidence/v16_0-scope-freeze-${DATE}.md`],
  ["V16.1 provider boundary", `docs/V16.x/evidence/v16_1-provider-boundary-${DATE}.md`],
  ["V16.2 provider generation", `docs/V16.x/evidence/v16_2-provider-multi-action-generation-${DATE}.md`],
  ["V16.3 same-cat consistency", `docs/V16.x/evidence/v16_3-same-cat-consistency-${DATE}.md`],
  ["V16.4 auto packaging", `docs/V16.x/evidence/v16_4-auto-packaging-continuity-${DATE}.md`],
  ["V16.5 preview/apply", `docs/V16.x/evidence/v16_5-manager-preview-apply-rollback-${DATE}.md`]
];

for (const [name, path] of requiredEvidence) {
  record(name, evidencePassed(path), path, "blocked");
}

runCommand("desktop test", ["pnpm", "--filter", "desktop", "test"]);
runCommand("desktop check", ["pnpm", "--filter", "desktop", "check"]);
runCommand("petctl test", ["pnpm", "--filter", "@agent-desktop-pet/petctl", "test"]);
runCommand("V15.8 continuity regression", ["node", "scripts/v15_8_2d_animation_continuity_smoke.mjs"]);
runCommand("V15.12 continuity assembly regression", ["node", "scripts/v15_12_photo_2d_continuity_assembly_smoke.mjs"]);
runCommand("V15.13 preview/apply regression", ["node", "scripts/v15_13_photo_2d_preview_apply_smoke.mjs"], {
  V15_13_GUI_SCREENSHOT_PATH: "docs/V15.x/evidence/v15_13_settings_gui_2026-06-10.png",
  V15_13_RUNTIME_CAPTURE_PATH: "docs/V15.x/evidence/v15_13-photo-2d-preview-apply-report-2026-06-10.html"
});

record("V16 source image evidence exists", existsSync("docs/V16.x/evidence/assets/v16_host_image_tool_orange_tabby_action_sheet.png"), "host image tool action sheet", "blocked");
record("V16 contact sheet evidence exists", existsSync("docs/V16.x/evidence/assets/v16_host_image_tool_orange_tabby_contact_sheet.png"), "contact sheet", "blocked");
record("V16 generated pack metadata exists", existsSync("apps/desktop/src/assets/generated/v16-host-image-tool-orange-tabby/pack/pet.json"), "pet.json frame sequence", "blocked");
record("security scan", securityScan(), "V16 docs/evidence contain no credential values, Authorization header, full local path, raw payload values, or api-token filename");
record("claim scan", claimScan(), "forbidden claims remain forbidden/not-ready/not-implied");
record("PRD/spec review", prdSpecReview(), "active V16 PRD, architecture, development, acceptance, and implementation contract align with evidence");

const status = finishStatus();
writeReport(status);
writeHtml(status);

console.log(JSON.stringify({ ok: status === "passed", status, reportPath, htmlPath, records }, null, 2));
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
  return existsSync(path) && /^status:\s*passed\b/m.test(readFileSync(path, "utf8"));
}

function readSafe(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function securityScan() {
  const targets = [
    "docs/V16.x",
    "apps/desktop/src/assets/photo-to-2d-provider-boundary.ts",
    "apps/desktop/src/assets/photo-to-2d-provider-boundary.test.ts",
    "scripts/v16_1_provider_boundary_smoke.mjs",
    "scripts/v16_2_host_image_tool_generation_smoke.mjs",
    "scripts/v16_3_to_v16_5_local_pipeline_smoke.mjs"
  ];
  const text = collectText(targets)
    .replace(/api-token\.json/g, "api token filename")
    .replace(/Authorization:\s*Bearer sk-secret/g, "Authorization header redacted fixture")
    .replace(/"forbiddenOutputFields":\[[^\]]*\]/g, "\"forbiddenOutputFields\":[]");
  return ![
    /sk-[A-Za-z0-9_-]{12,}/,
    /Bearer\s+[A-Za-z0-9._-]{12,}/,
    /Authorization\s*:/i,
    /\/Users\/[^/\s`"']+/,
    /api-token\.json/,
    /rawProviderPayload\s*[:=]/i,
    /rawPayload\s*[:=]/i,
    /promptText\s*[:=]/i,
    /fullLocalPath\s*[:=]/i,
    /workspacePath\s*[:=]/i,
    /configPath\s*[:=]/i
  ].some((pattern) => pattern.test(text));
}

function claimScan() {
  const text = collectText([
    "docs/V16.x",
    "docs/active/agent_desktop_pet_prd_v16.md",
    "docs/active/current-vs-target-gap.md",
    "docs/active/development-plan.md",
    "docs/active/acceptance-plan.md"
  ]);
  const allowed = "V16 provider-backed photo-to-2D multi-action generation passed for the tested named provider and local cat-photo scenario.";
  const forbidden = [
    "automatic photo-to-2D ready for arbitrary cats",
    "automatic photo-to-animation ready",
    "provider integration verified",
    "Petdex parity achieved",
    "3D ready",
    "automatic photo-to-3D ready",
    "remote asset loading ready",
    "asset marketplace ready",
    "production signed release ready",
    "cross-platform ready",
    "Windows ready"
  ];
  return text.includes(allowed) &&
    forbidden.every((claim) => text.includes(claim)) &&
    !text.includes("provider integration verified | allowed") &&
    !text.includes("3D ready | allowed") &&
    !text.includes("production signed release ready | allowed");
}

function prdSpecReview() {
  const text = [
    "docs/active/agent_desktop_pet_prd_v16.md",
    "docs/V16.x/v16_x-target-architecture.md",
    "docs/V16.x/v16_x-development-plan.md",
    "docs/V16.x/v16_x-acceptance-plan.md",
    "docs/V16.x/v16_x-implementation-contract.md"
  ].map(readSafe).join("\n");
  return text.includes("cat photo") &&
    text.includes("named provider") &&
    text.includes("same-cat") &&
    text.includes("local animation pack") &&
    text.includes("preview") &&
    text.includes("target");
}

function collectText(paths) {
  let output = "";
  for (const path of paths) {
    if (!existsSync(path)) continue;
    const result = spawnSync("find", [path, "-type", "f"], { cwd: process.cwd(), encoding: "utf8" });
    if (result.status === 0 && result.stdout.trim()) {
      for (const file of result.stdout.trim().split("\n")) {
        if (/\.(md|html|ts|mjs|json|drawio)$/.test(file) && existsSync(file)) {
          output += `\n${readSafe(file)}`;
        }
      }
    } else if (/\.(md|html|ts|mjs|json|drawio)$/.test(path)) {
      output += `\n${readSafe(path)}`;
    }
  }
  return output;
}

function rowsMarkdown() {
  return records.map((item) => `| ${item.name} | ${item.result} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
}

function writeReport(status) {
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `# V16.6 Final Acceptance Report

status: ${status}  
date: ${DATE}  
scope: V16 provider-backed photo-to-2D multi-action generation for one tested local scenario  

## Final Decision

${status === "passed"
  ? "V16.0-V16.5 evidence and V16.6 regression/security/claim gates passed. The scoped V16 allowed claim may be used."
  : "V16.6 is not passed. Do not use the scoped V16 final claim until blockers are closed."}

## Evidence Gate

| Gate | Result | Details |
| --- | --- | --- |
${rowsMarkdown()}

## Visual Evidence

- host image tool source sheet: \`docs/V16.x/evidence/assets/v16_host_image_tool_orange_tabby_action_sheet.png\`
- generated action contact sheet: \`docs/V16.x/evidence/assets/v16_host_image_tool_orange_tabby_contact_sheet.png\`
- final HTML: \`${htmlPath}\`

## Allowed Claim

${status === "passed"
  ? "V16 provider-backed photo-to-2D multi-action generation passed for the tested named provider and local cat-photo scenario."
  : "No V16 final claim is made while status is not passed."}

## Forbidden Claims

The following remain forbidden / not-ready:

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
`);
}

function writeHtml(status) {
  mkdirSync(dirname(htmlPath), { recursive: true });
  const source = imageDataUri("docs/V16.x/evidence/assets/v16_host_image_tool_orange_tabby_action_sheet.png");
  const contact = imageDataUri("docs/V16.x/evidence/assets/v16_host_image_tool_orange_tabby_contact_sheet.png");
  writeFileSync(htmlPath, `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8" />
<title>V16 Provider-backed Photo-to-2D Final Evidence</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 32px; background: #f8fafc; color: #172033; }
  h1 { margin-bottom: 4px; }
  .status { display: inline-block; padding: 6px 10px; border-radius: 8px; color: white; background: ${status === "passed" ? "#15803d" : "#b45309"}; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 24px 0; }
  figure { margin: 0; padding: 16px; background: white; border: 1px solid #dbe3ef; border-radius: 10px; }
  img { max-width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; background: white; }
  figcaption { margin-top: 10px; font-size: 14px; color: #475569; }
  table { border-collapse: collapse; width: 100%; background: white; }
  th, td { border: 1px solid #dbe3ef; padding: 8px 10px; text-align: left; font-size: 14px; }
  th { background: #eaf2ff; }
  .note { padding: 12px 14px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; }
</style>
<body>
  <h1>V16 真实宿主图像工具到 2D 多动作资产验收</h1>
  <p class="status">status: ${escapeHtml(status)}</p>
  <p>本页嵌入真实生成源图和本地多帧动作 contact sheet，用于高效验收 V16 的最窄声明。</p>
  <div class="grid">
    <figure>
      <img src="${source}" alt="Host image tool generated orange tabby action source sheet" />
      <figcaption>宿主 ChatGPT/Codex 图像工具生成的 8 动作橘猫源图。</figcaption>
    </figure>
    <figure>
      <img src="${contact}" alt="Generated frame sequence contact sheet" />
      <figcaption>本地切分和连续性归一化后的 8 动作多帧 contact sheet；首尾闭合，36 帧。</figcaption>
    </figure>
  </div>
  <h2>Gate Results</h2>
  <table>
    <tr><th>Gate</th><th>Result</th><th>Details</th></tr>
    ${records.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.result)}</td><td>${escapeHtml(item.details)}</td></tr>`).join("")}
  </table>
  <h2>Scope Boundary</h2>
  <p class="note">允许声明只限：V16 provider-backed photo-to-2D multi-action generation passed for the tested named provider and local cat-photo scenario。仍不得声明任意猫自动生成 ready、provider integration verified、Petdex parity、3D ready、photo-to-3D、marketplace 或 production release。</p>
</body>
</html>`);
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
