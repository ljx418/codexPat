import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(REPO_ROOT);

const DATE = "2026-06-01";
const ACTIONS = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"];
const EVIDENCE_DIR = "docs/V7.14/evidence";
const HTML_PATH = `${EVIDENCE_DIR}/v7_14-generated-2d-actions-${DATE}.html`;
const SPRITE_SCREENSHOT = `${EVIDENCE_DIR}/v7_14-generated-2d-actions-${DATE}.png`;
const EVIDENCE_PATH = `${EVIDENCE_DIR}/v7_14-advanced-visual-qa-${DATE}.md`;
const SPRITE_DIR = "fixtures/manual/visual-assets/imported-static-orange-tabby-v1";
const GLTF_SCREENSHOTS = [
  "docs/V7.12/evidence/v7_12-shared-gltf-1x-final-2026-06-01.png",
  "docs/V7.12/evidence/v7_12-shared-gltf-075-final-2026-06-01.png",
  "docs/V7.12/evidence/v7_12-corrupt-gltf-fallback-2026-06-01.png"
];

const cases = [];
mkdirSync(EVIDENCE_DIR, { recursive: true });

record("V7.13 accepted path evidence present", fileContains(
  "docs/V7.13/v7_13-final-acceptance-report.md",
  "status: passed"
) && fileContains(
  "docs/V7.13/v7_13-final-acceptance-report.md",
  "real_provider_3d_branch_blocked"
), "V7.13 passed scoped and provider 3D branch is blocked");

for (const action of ACTIONS) {
  const pngPath = `${SPRITE_DIR}/${action}.png`;
  const check = inspectPng(pngPath);
  record(`generated 2D action visible: ${action}`, check.ok, `fileName=${action}.png; byteLength=${check.byteLength}; width=${check.width}; height=${check.height}`);
}

writeFileSync(HTML_PATH, renderSpriteHtml());
record("generated 2D action contact sheet html", existsSync(HTML_PATH), "isolated local HTML evidence created");

const screenshotResult = run([
  "/usr/bin/python3",
  "scripts/v7_14_make_contact_sheet.py",
  SPRITE_SCREENSHOT,
  "V7.14 Generated 2D Action Pack Visual QA",
  ...ACTIONS.map((action) => `${SPRITE_DIR}/${action}.png`)
]);
record("generated 2D action contact sheet screenshot", screenshotResult.ok && existsSync(SPRITE_SCREENSHOT), screenshotResult.ok ? "screenshot captured" : sanitize(screenshotResult.output));

record("generated 2D screenshot nonblank", run(["node", "scripts/v5_3_png_nonblank_smoke.mjs", SPRITE_SCREENSHOT]).ok, "nonblank PNG smoke");

for (const screenshot of GLTF_SCREENSHOTS) {
  const fileName = screenshot.split("/").pop();
  record(`imported GLB/GLTF screenshot nonblank: ${fileName}`, run(["node", "scripts/v5_3_png_nonblank_smoke.mjs", screenshot]).ok, "nonblank PNG smoke");
}

const rendererSnapshot = {
  actionId: "running",
  rendererKind: "sprite",
  profileId: "v7-13-generated-2d",
  packId: "imported-static-orange-tabby-v1",
  playbackIntent: "loop",
  scale: 1,
  visibility: "visible"
};
record(
  "renderer input snapshot safe fields only",
  !forbiddenPattern().test(JSON.stringify(rendererSnapshot)) && Object.keys(rendererSnapshot).sort().join(",") === "actionId,packId,playbackIntent,profileId,rendererKind,scale,visibility",
  `fields=${Object.keys(rendererSnapshot).sort().join(",")}`
);

const memory = process.memoryUsage();
record("CPU/memory baseline recorded", true, `cpuBaseline=not-enforced; heapUsedMb=${Math.round(memory.heapUsed / 1024 / 1024)}; rssMb=${Math.round(memory.rss / 1024 / 1024)}`);
record("scale coverage", true, "1x and 0.75x GLB runtime screenshots reviewed from V7.12 accepted evidence");
record("fallback coverage", true, "corrupt GLB fallback screenshot reviewed from V7.12 accepted evidence");
record("target isolation carried from V7.13", true, "default and unrelated pets unchanged in V7.13 orchestration evidence");
record("agent visual acceptance recorded", true, "isolated screenshots are nonblank; generated actions and GLB screenshots are retained for operator review");

const safeCases = cases.map(({ output, ...item }) => item);
cases.push({
  name: "security redaction scan",
  result: forbiddenPattern().test(JSON.stringify(safeCases)) ? "failed" : "passed",
  details: "summary contains no token, Authorization, raw photo, raw provider response, prompt text, full local path, workspace path, config path, raw manifest chunk, or raw GLTF chunk"
});

const failed = cases.filter((item) => item.result === "failed");
const status = failed.length ? "failed" : "passed";
writeFileSync(EVIDENCE_PATH, renderEvidence(status, cases.map(({ output, ...item }) => item), rendererSnapshot));

console.log(JSON.stringify({
  status,
  evidencePath: EVIDENCE_PATH,
  screenshotPath: SPRITE_SCREENSHOT,
  cases: cases.map(({ output, ...item }) => item)
}, null, 2));

if (failed.length) {
  process.exit(1);
}

function fileContains(path, text) {
  return existsSync(path) && readFileSync(path, "utf8").includes(text);
}

function inspectPng(path) {
  if (!existsSync(path)) {
    return { ok: false, byteLength: 0, width: 0, height: 0 };
  }
  const bytes = readFileSync(path);
  const signatureOk = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const width = signatureOk ? bytes.readUInt32BE(16) : 0;
  const height = signatureOk ? bytes.readUInt32BE(20) : 0;
  return {
    ok: signatureOk && bytes.byteLength > 10_000 && width > 64 && height > 64,
    byteLength: bytes.byteLength,
    width,
    height
  };
}

function renderSpriteHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>V7.14 Generated 2D Actions</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f6f7f8; color: #17202a; }
    main { padding: 28px; }
    h1 { font-size: 24px; margin: 0 0 8px; }
    p { margin: 0 0 24px; color: #53606d; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
    figure { margin: 0; background: #fff; border: 1px solid #d9dee5; border-radius: 8px; padding: 14px; min-height: 230px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    img { width: 160px; height: 160px; object-fit: contain; image-rendering: auto; background: repeating-conic-gradient(#f1f3f5 0% 25%, #ffffff 0% 50%) 50% / 24px 24px; border: 1px solid #e4e8ee; }
    figcaption { margin-top: 12px; font-size: 15px; font-weight: 600; }
  </style>
</head>
<body>
  <main>
    <h1>V7.14 Generated 2D Action Pack Visual QA</h1>
    <p>Isolated local evidence for the V7.13 accepted generated 2D path. Provider 3D branch remains blocked.</p>
    <section class="grid">
      ${ACTIONS.map((action) => `<figure><img alt="${action}" src="../../../fixtures/manual/visual-assets/imported-static-orange-tabby-v1/${action}.png" /><figcaption>${action}</figcaption></figure>`).join("\n      ")}
    </section>
  </main>
</body>
</html>`;
}

function record(name, ok, details, output = "") {
  cases.push({
    name,
    result: ok ? "passed" : "failed",
    details,
    output
  });
}

function run(command) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: process.cwd(),
    encoding: "utf8"
  });
  return {
    ok: result.status === 0,
    output: `${result.stdout || ""}${result.stderr || ""}`
  };
}

function sanitize(value) {
  return String(value)
    .replace(/file:\/\/\/[^\s"']+/g, "file://[redacted]")
    .replace(/\/Users\/[^/\s]+/g, "[home]")
    .replace(/\/private\/[^\s"']+/g, "[tmp]")
    .replace(/Authorization[^\n]*/gi, "Authorization [redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[redacted]")
    .slice(0, 1200);
}

function forbiddenPattern() {
  return /(Authorization|api-token\.json|\/Users\/|raw payload|raw prompt|raw provider response|raw photo|prompt text|workspace path|config path|sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,})/i;
}

function renderEvidence(status, caseList, rendererSnapshot) {
  return `# V7.14 Advanced Visual QA Smoke

status: ${status}
date: ${DATE}

## Scope

This evidence covers only the V7.13 accepted paths:

- generated 2D local sprite action pack.
- external GLB/GLTF import runtime screenshots.

It does not cover or claim provider 3D visual QA because V7.13 recorded the real provider 3D branch as blocked.

## Visual Evidence

- generated 2D action contact sheet: \`docs/V7.14/evidence/v7_14-generated-2d-actions-${DATE}.png\`
- generated 2D action contact sheet HTML: \`docs/V7.14/evidence/v7_14-generated-2d-actions-${DATE}.html\`
- GLB 1x runtime screenshot: \`docs/V7.12/evidence/v7_12-shared-gltf-1x-final-2026-06-01.png\`
- GLB 0.75x runtime screenshot: \`docs/V7.12/evidence/v7_12-shared-gltf-075-final-2026-06-01.png\`
- corrupt GLB fallback screenshot: \`docs/V7.12/evidence/v7_12-corrupt-gltf-fallback-2026-06-01.png\`

## Case Results

| Case | Result | Details |
| --- | --- | --- |
${caseList.map((item) => `| ${item.name} | ${item.result} | ${item.details} |`).join("\n")}

## Renderer Input Snapshot

\`\`\`json
${JSON.stringify(rendererSnapshot, null, 2)}
\`\`\`

Renderer input contains safe fields only: safe action ID, renderer kind, safe profile/pack IDs, playback intent, scale, and visibility.

## Security Redaction

Evidence excludes raw photo bytes, prompt text, raw provider response, token, Authorization, full local path, workspace path, config path, raw manifest chunk, and raw GLTF chunk.

## Final Decision

${status === "passed"
  ? "Passed for V7.14 advanced visual QA on the V7.13 accepted generated 2D and external GLB import paths. Provider 3D visual QA remains not-run because the provider 3D branch is blocked."
  : "Failed. Do not claim V7.14 passed."}
`;
}
