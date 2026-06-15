import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { importAssetPack, activateAssetPack, listAssetPacks } from "../packages/petctl/dist/assets.js";

loadDotenv();

const DATE = "2026-06-03";
const ACTIONS = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"];
const ACTION_INTENTS = {
  idle: "idle breathing loop, second pose with a tiny shoulder and tail shift",
  thinking: "thinking loop, second pose with a curious head tilt and ear twitch",
  running: "running loop, second pose with opposite paws forward",
  success: "success loop, second pose with a small celebratory hop",
  warning: "warning loop, second pose with alert ears and raised tail",
  error: "error loop, second pose with surprised recovery posture",
  need_input: "need input loop, second pose raising one paw slightly higher",
  sleeping: "sleeping loop, second pose with soft breathing curl"
};
const EVIDENCE_DIR = "docs/V9.x/evidence";
const STATIC_DIR = `${EVIDENCE_DIR}/v9_2-minimax-static-2d-pack-${DATE}`;
const OUTPUT_DIR = `${EVIDENCE_DIR}/v9_3-minimax-dynamic-2d-pack-${DATE}`;
const EVIDENCE_PATH = `${EVIDENCE_DIR}/v9_3-minimax-dynamic-2d-generation-smoke-${DATE}.md`;
const PACK_ID = "v9-3-minimax-dynamic-2d";
const TARGET_INSTANCE = "codex_v93_dynamic";

const cases = [];
mkdirSync(OUTPUT_DIR, { recursive: true });

const hasCredential = Boolean(process.env.MINIMAX_API_KEY?.trim());
const hasConsent = process.env.MINIMAX_PROVIDER_SMOKE_CONSENT === "yes" || process.env.MINIMAX_PROVIDER_SMOKE_CONSENT === "true";
const hasTerms = process.env.MINIMAX_PROVIDER_TERMS_ACCEPTED === "yes" || process.env.MINIMAX_PROVIDER_TERMS_ACCEPTED === "true";

if (!hasCredential || !hasConsent || !hasTerms) {
  const reasonCode = !hasCredential ? "provider_credential_missing" : !hasConsent ? "provider_consent_required" : "provider_terms_unreviewed";
  record("MiniMax dynamic execution preflight", false, `blocked:${reasonCode}`);
  finish();
}

for (const action of ACTIONS) {
  const staticPng = `${STATIC_DIR}/${action}.png`;
  const frame0 = `${OUTPUT_DIR}/${action}-000.png`;
  if (!existsSync(staticPng)) {
    record(`static seed frame present: ${action}`, false, "v9_2_static_frame_missing");
    finish();
  }
  copyFileSync(staticPng, frame0);
  record(`reuse provider-generated seed frame: ${action}`, true, `fileName=${action}-000.png`);

  const outputBase = `${OUTPUT_DIR}/${action}-001`;
  const result = runEval([
    "import { createMinimaxCatActionPrompt, generateMinimaxCatActionImage, minimaxSummaryHasForbiddenLeak } from './src/assets/minimax-image-provider.ts';",
    `const prompt = createMinimaxCatActionPrompt({ catTraits: 'same warm orange tabby cat as the V9.2 action pack, amber eyes, white chest, curled tail, consistent clean cutout style', actionIntent: ${JSON.stringify(ACTION_INTENTS[action])} });`,
    `const result = await generateMinimaxCatActionImage({ apiKey: process.env.MINIMAX_API_KEY, apiBaseUrl: process.env.MINIMAX_API_BASE_URL, prompt, actionIntent: ${JSON.stringify(ACTION_INTENTS[action])}, uploadConsent: true, costDisclosureAccepted: true, privacyRetentionAccepted: true, licenseAttributionAccepted: true, outputFileBase: '../../${outputBase}' });`,
    "if (minimaxSummaryHasForbiddenLeak(result)) process.exit(3);",
    "console.log(JSON.stringify({ ok: result.ok, providerName: result.providerName, actionIntent: result.actionIntent, imageCount: result.imageCount, outputFiles: result.outputFiles, reasonCode: result.reasonCode, baseStatusCode: result.baseStatusCode }, null, 2));",
    "if (!result.ok || result.imageCount < 1) process.exit(2);"
  ]);
  record(`MiniMax second animation frame: ${action}`, result.ok, result.ok ? "provider output accepted" : sanitize(result.output), result.output);
  if (!result.ok) finish();

  const jpegPath = `${OUTPUT_DIR}/${action}-001-1.jpeg`;
  const frame1 = `${OUTPUT_DIR}/${action}-001.png`;
  const conversion = run(["/usr/bin/python3", "-c", "from PIL import Image; import sys; Image.open(sys.argv[1]).convert('RGBA').save(sys.argv[2])", jpegPath, frame1]);
  record(`convert second frame to PNG: ${action}`, conversion.ok && existsSync(frame1), conversion.ok ? `fileName=${action}-001.png` : sanitize(conversion.output), conversion.output);
}

writeManifest();
const manifestCheck = inspectManifest(`${OUTPUT_DIR}/manifest.json`);
record("generated animated manifest coverage", manifestCheck.ok, manifestCheck.details);
const temp = mkdtempSync(join(tmpdir(), "adp-v93-"));
const imported = importAssetPack({
  manifestPath: `${OUTPUT_DIR}/manifest.json`,
  storePath: join(temp, "store.json"),
  storageRoot: join(temp, "packs"),
  name: "V9.3 MiniMax Dynamic 2D"
});
record("generated animated pack import", imported.ok, imported.ok ? `packId=${imported.assetImport.packId}; assets=${imported.assetImport.copiedAssetIds.length}` : imported.reasonCode);
const activated = imported.ok ? activateAssetPack({ packId: imported.assetImport.packId, instanceId: TARGET_INSTANCE, storePath: join(temp, "store.json") }) : imported;
record("generated animated pack target activation", activated.ok, activated.ok ? `instanceId=${TARGET_INSTANCE}` : activated.reasonCode);
const listed = listAssetPacks({ storePath: join(temp, "store.json") });
record("target isolation contract", listed.ok && listed.assetPacks?.[0]?.activeInstances?.[0] === TARGET_INSTANCE, "target instance only in temp store");
record("security redaction scan", !forbiddenPattern().test(JSON.stringify(cases.map(({ output, ...item }) => item))), "safe summaries only");

finish();

function writeManifest() {
  const assets = {};
  const actions = {};
  for (const action of ACTIONS) {
    assets[action] = {
      assetId: action,
      kind: "sprite",
      fileName: `${action}-000.png`,
      frameFiles: [`${action}-000.png`, `${action}-001.png`],
      fps: 4
    };
    actions[action] = {
      assetId: action,
      loop: ["idle", "thinking", "running", "sleeping"].includes(action),
      priority: ["error", "need_input"].includes(action) ? "urgent" : ["idle", "sleeping"].includes(action) ? "base" : "transient"
    };
  }
  writeFileSync(`${OUTPUT_DIR}/manifest.json`, JSON.stringify({
    schemaVersion: "5.8",
    packId: PACK_ID,
    displayName: "V9.3 MiniMax Dynamic 2D Action Pack",
    rendererKind: "sprite",
    license: { type: "provider:minimax", attribution: "Generated via MiniMax image provider for V9.3 smoke" },
    assets,
    actions
  }, null, 2));
}

function inspectManifest(path) {
  if (!existsSync(path)) return { ok: false, details: "manifest missing" };
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  const ok = manifest.rendererKind === "sprite"
    && ACTIONS.every((action) => Array.isArray(manifest.assets?.[action]?.frameFiles)
      && manifest.assets[action].frameFiles.length === 2
      && manifest.actions?.[action]?.assetId === action
      && existsSync(`${OUTPUT_DIR}/${action}-000.png`)
      && existsSync(`${OUTPUT_DIR}/${action}-001.png`));
  return { ok, details: `rendererKind=${manifest.rendererKind}; actionCount=${Object.keys(manifest.actions ?? {}).length}; framesPerAction=2` };
}

function runEval(lines) {
  return run(["pnpm", "--filter", "desktop", "exec", "node", "--import", "tsx", "--eval", lines.join("")], { env: process.env });
}

function run(command, options = {}) {
  const result = spawnSync(command[0], command.slice(1), { cwd: process.cwd(), encoding: "utf8", env: options.env ?? process.env });
  return { ok: result.status === 0, status: result.status, output: `${result.stdout || ""}${result.stderr || ""}` };
}

function record(name, ok, details, output = "") {
  cases.push({ name, result: ok ? "passed" : "failed", details, output });
}

function finish() {
  const safeCases = cases.map(({ output, ...item }) => item);
  const failed = cases.filter((item) => item.result === "failed");
  const status = failed.length ? "failed" : "passed";
  writeFileSync(EVIDENCE_PATH, renderEvidence(status, safeCases), "utf8");
  console.log(JSON.stringify({ status, evidencePath: EVIDENCE_PATH, outputDir: status === "passed" ? OUTPUT_DIR : undefined, cases: safeCases }, null, 2));
  process.exit(failed.length ? 1 : 0);
}

function sanitize(value) {
  return String(value)
    .replace(/--eval[\s\S]*/g, "--eval [redacted]")
    .replace(/\/Users\/[^/\s]+/g, "[home]")
    .replace(/\/private\/[^\s\"']+/g, "[tmp]")
    .replace(/Authorization[^\n]*/gi, "auth header [redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[redacted]")
    .slice(0, 1200);
}

function forbiddenPattern() {
  return /(Authorization|api-token\.json|\/Users\/|raw payload|raw prompt|raw provider response|raw photo|prompt text|workspace path|config path|sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,})/i;
}

function loadDotenv() {
  if (!existsSync(".env")) return;
  const content = readFileSync(".env", "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index <= 0) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

function renderEvidence(status, safeCases) {
  return `# V9.3 MiniMax Dynamic 2D Generation Smoke

status: ${status}
date: ${DATE}

## Scope

Real explicit-consent MiniMax dynamic 2D generation for a minimal two-frame
eight-action local sprite asset pack. The first frame is the V9.2
provider-generated action image; the second frame is generated by MiniMax for
V9.3. This does not prove arbitrary photo-to-animation, 3D provider output,
broad provider integration, or production release readiness.

## Results

\`\`\`json
${JSON.stringify(safeCases, null, 2)}
\`\`\`

## Decision

${status === "passed" ? "V9.3 MiniMax dynamic 2D action pack generation passed for tested explicit-consent local scenario." : "V9.3 failed."}
`;
}
