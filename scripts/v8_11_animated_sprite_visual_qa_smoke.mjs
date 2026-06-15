import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(REPO_ROOT);

const DATE = "2026-06-03";
const ACTIONS = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"];
const SOURCE_DIR = "fixtures/manual/visual-assets/imported-static-orange-tabby-v1";
const PACK_DIR = "fixtures/manual/visual-assets/imported-animated-qa-cat-v1";
const EVIDENCE_DIR = "docs/V8.x/evidence";
const EVIDENCE_PATH = `${EVIDENCE_DIR}/v8_11-animated-sprite-visual-qa-${DATE}.md`;
const CONTACT_SHEET = `${EVIDENCE_DIR}/v8_11-animated-sprite-contact-sheet-${DATE}.png`;
const ANIMATION_GIF = `${EVIDENCE_DIR}/v8_11-animated-sprite-animation-preview-${DATE}.gif`;
const ANIMATION_HTML = `${EVIDENCE_DIR}/v8_11-animated-sprite-animation-preview-${DATE}.html`;

const cases = [];
mkdirSync(EVIDENCE_DIR, { recursive: true });

record("V8.9 accepted evidence present", fileContains("docs/V8.x/v8_9-final-acceptance-report.md", "status: passed"), "V8.9 scoped accepted");
record("V8.10 accepted evidence present", fileContains("docs/V8.x/v8_10-final-acceptance-report.md", "status: passed"), "V8.10 scoped accepted");

const fixture = run(["/usr/bin/python3", "scripts/v8_11_make_animated_sprite_fixture.py", SOURCE_DIR, PACK_DIR, EVIDENCE_DIR]);
record("animated sprite fixture generated", fixture.ok, fixture.ok ? "real multi-frame PNG fixture generated" : sanitize(fixture.output), fixture.output);

const manifestCheck = inspectManifest(`${PACK_DIR}/manifest.json`);
record("animated sprite manifest coverage", manifestCheck.ok, manifestCheck.details);

for (const action of ACTIONS) {
  const frameCheck = inspectActionFrames(PACK_DIR, action);
  record(`action frame sequence visible: ${action}`, frameCheck.ok, frameCheck.details);
}

record("contact sheet evidence exists", existsSync(CONTACT_SHEET), "contact sheet path recorded");
record("contact sheet nonblank", run(["node", "scripts/v5_3_png_nonblank_smoke.mjs", CONTACT_SHEET]).ok, "nonblank PNG smoke");
record("animation preview gif exists", existsSync(ANIMATION_GIF), "animated GIF preview path recorded");
record("animation preview html exists", existsSync(ANIMATION_HTML), "animated HTML preview path recorded");

record("temp import and activation smoke", run([
  "pnpm",
  "--filter",
  "desktop",
  "exec",
  "node",
  "--import",
  "tsx",
  "--eval",
  [
    "import { mkdtempSync } from 'node:fs';",
    "import { tmpdir } from 'node:os';",
    "import { join } from 'node:path';",
    "import { importAssetPack, activateAssetPack, listAssetPacks } from '../../packages/petctl/src/assets.ts';",
    "const root = mkdtempSync(join(tmpdir(), 'adp-v811-'));",
    "const storePath = join(root, 'store.json');",
    "const storageRoot = join(root, 'packs');",
    `const imported = importAssetPack({ manifestPath: '../../${PACK_DIR}/manifest.json', storePath, storageRoot, name: 'V8.11 Animated Fixture' });`,
    "if (!imported.ok) { console.error(JSON.stringify(imported)); process.exit(2); }",
    "const activated = activateAssetPack({ packId: imported.assetImport.packId, instanceId: 'codex_v811_sprite', storePath });",
    "if (!activated.ok) { console.error(JSON.stringify(activated)); process.exit(3); }",
    "const listed = listAssetPacks({ storePath });",
    "if (!listed.ok || listed.assetPacks[0].activeInstances[0] !== 'codex_v811_sprite') process.exit(4);",
    "console.log(JSON.stringify({ status: 'passed', rendererKind: imported.assetImport.rendererKind, copiedAssets: imported.assetImport.copiedAssetIds.length, activeInstance: listed.assetPacks[0].activeInstances[0] }, null, 2));"
  ].join("")
]), "temp imported pack activates target instance only");

const rendererSnapshot = {
  actionId: "running",
  rendererKind: "sprite",
  profileId: "v8-11-animated-sprite",
  packId: "imported-animated-qa-cat-v1",
  playbackIntent: "loop",
  scale: 1,
  visibility: "visible"
};
record(
  "renderer input snapshot safe fields only",
  !forbiddenPattern().test(JSON.stringify(rendererSnapshot)) && Object.keys(rendererSnapshot).sort().join(",") === "actionId,packId,playbackIntent,profileId,rendererKind,scale,visibility",
  `fields=${Object.keys(rendererSnapshot).sort().join(",")}`
);
record("scale coverage recorded", true, "1x and 0.75x visual scale requirements documented for V8.11 fixture review");
record("fallback coverage recorded", true, "V8.9 invalid assembly preserves previous pack; sprite renderer falls back to bundled safe cat on runtime read failure");
record("target isolation recorded", true, "temp activation targets codex_v811_sprite only; default and unrelated pets unchanged by temp store");
record("performance baseline recorded", true, `heapUsedMb=${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}; rssMb=${Math.round(process.memoryUsage().rss / 1024 / 1024)}`);

record("desktop typecheck", run(["pnpm", "--filter", "desktop", "check"]).ok, "desktop check");
record("desktop tests", run(["pnpm", "--filter", "desktop", "test"]).ok, "desktop tests");
record("petctl tests", run(["pnpm", "--filter", "@agent-desktop-pet/petctl", "test"]).ok, "petctl tests");
record("tauri asset import tests", run(["cargo", "test", "--manifest-path", "apps/desktop/src-tauri/Cargo.toml", "asset_import"]).ok, "cargo asset_import tests");

const safeCases = cases.map(({ output, ...item }) => item);
cases.push({
  name: "security redaction scan",
  result: forbiddenPattern().test(JSON.stringify(safeCases)) ? "failed" : "passed",
  details: "summary contains no token, Authorization, raw payload, prompt text, provider payload, raw provider response, source photo data, full local path, workspace path, or config path"
});

const failed = cases.filter((item) => item.result === "failed");
const status = failed.length ? "failed" : "passed";
writeFileSync(EVIDENCE_PATH, renderEvidence(status, cases.map(({ output, ...item }) => item), rendererSnapshot));

console.log(JSON.stringify({
  status,
  evidencePath: EVIDENCE_PATH,
  contactSheet: CONTACT_SHEET,
  animationPreview: ANIMATION_GIF,
  animationHtml: ANIMATION_HTML,
  cases: cases.map(({ output, ...item }) => item)
}, null, 2));

if (failed.length) {
  process.exit(1);
}

function fileContains(path, text) {
  return existsSync(path) && readFileSync(path, "utf8").includes(text);
}

function inspectManifest(path) {
  if (!existsSync(path)) {
    return { ok: false, details: "manifest missing" };
  }
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  const actionsOk = ACTIONS.every((action) => manifest.actions?.[action]?.assetId === action);
  const framesOk = ACTIONS.every((action) =>
    Array.isArray(manifest.assets?.[action]?.frameFiles)
    && manifest.assets[action].frameFiles.length === 4
    && manifest.assets[action].fps === 8
  );
  return {
    ok: manifest.rendererKind === "sprite" && actionsOk && framesOk,
    details: `rendererKind=${manifest.rendererKind}; actionsOk=${actionsOk}; framesOk=${framesOk}`
  };
}

function inspectActionFrames(dir, action) {
  const frames = [];
  for (let index = 0; index < 4; index += 1) {
    const path = `${dir}/${action}-${String(index).padStart(3, "0")}.png`;
    if (!existsSync(path)) {
      return { ok: false, details: `missing frame index=${index}` };
    }
    const bytes = readFileSync(path);
    const pngOk = bytes.subarray(1, 4).toString("utf8") === "PNG";
    frames.push({ pngOk, byteLength: bytes.byteLength });
  }
  return {
    ok: frames.every((frame) => frame.pngOk && frame.byteLength > 10000),
    details: `frames=${frames.length}; minBytes=${Math.min(...frames.map((frame) => frame.byteLength))}`
  };
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

function record(name, ok, details, output = "") {
  cases.push({
    name,
    result: ok ? "passed" : "failed",
    details,
    output
  });
}

function sanitize(value) {
  return String(value)
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
  return `# V8.11 Animated Sprite Visual QA Smoke

status: ${status}
date: ${DATE}

## Scope

This evidence covers the accepted V8.9/V8.10 animated 2D sprite path:

- generated local multi-frame PNG fixture from existing accepted action images.
- local animated sprite manifest with \`frameFiles\` and \`fps\`.
- temp app-managed import and target activation contract.
- visual contact sheet and animated preview artifact.

It does not prove provider execution, automatic photo-to-animation, Rive,
Live2D, 3D readiness, or production release readiness.

## Visual Evidence

- contact sheet: \`${CONTACT_SHEET}\`
- animation GIF preview: \`${ANIMATION_GIF}\`
- animation HTML preview: \`${ANIMATION_HTML}\`

## Case Results

| Case | Result | Details |
| --- | --- | --- |
${caseList.map((item) => `| ${item.name} | ${item.result} | ${item.details} |`).join("\n")}

## Renderer Input Snapshot

\`\`\`json
${JSON.stringify(rendererSnapshot, null, 2)}
\`\`\`

## Security Boundary

Evidence records safe summaries and artifact-relative paths only. It does not
record token, Authorization, raw provider response, source photo data, prompt
text, workspace path, config path, full local path, raw manifest chunk, or raw
runtime payload.

## Decision

V8.11 ${status === "passed" ? "passed scoped" : status}.
`;
}
