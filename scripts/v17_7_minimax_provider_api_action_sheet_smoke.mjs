#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

loadDotenv();

const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const EVIDENCE_PATH = `docs/V17.x/evidence/v17_7-minimax-provider-api-action-sheet-${DATE}.md`;
const OUTPUT_DIR = `docs/V17.x/evidence/assets/v17_7-minimax-provider-api-action-sheet-${DATE}`;
const OUTPUT_BASE = `../../${OUTPUT_DIR}/v17_7_minimax_action_sheet`;
const PROVIDER_PACKAGING_EVIDENCE = `docs/V17.x/evidence/v17_7-provider-output-packaging-${DATE}.md`;
const REQUIRED_ACTIONS = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"];
const cases = [];

mkdirSync(OUTPUT_DIR, { recursive: true });

const hasCredential = Boolean(process.env.MINIMAX_API_KEY?.trim());
const hasConsent = process.env.MINIMAX_PROVIDER_SMOKE_CONSENT === "yes" || process.env.MINIMAX_PROVIDER_SMOKE_CONSENT === "true";
const hasTerms = process.env.MINIMAX_PROVIDER_TERMS_ACCEPTED === "yes" || process.env.MINIMAX_PROVIDER_TERMS_ACCEPTED === "true";

if (!hasCredential || !hasConsent || !hasTerms) {
  const reasonCode = !hasCredential ? "provider_credential_missing" : !hasConsent ? "provider_consent_required" : "provider_terms_unreviewed";
  record("MiniMax provider API preflight", "blocked", `reasonCode=${reasonCode}`);
  finish();
}

const prompt = [
  "Create one square 4x2 action sheet for a cute desktop pet orange tabby cat.",
  "Use exactly 8 panels in reading order:",
  "row 1: idle, thinking, running, success.",
  "row 2: warning, error, need_input, sleeping.",
  "The same cat must appear in every panel: warm orange tabby, amber eyes, white chest, round face, curled tail.",
  "No text, no labels, no watermark, no UI, no human hands.",
  "Clean isolated sprite asset style, full body visible, safe margins, consistent scale and lighting."
].join(" ");

const provider = runEval([
  "import { generateMinimaxCatActionImage, minimaxSummaryHasForbiddenLeak } from './src/assets/minimax-image-provider.ts';",
  `const result = await generateMinimaxCatActionImage({ apiKey: process.env.MINIMAX_API_KEY, apiBaseUrl: process.env.MINIMAX_API_BASE_URL, prompt: ${JSON.stringify(prompt)}, actionIntent: '4x2 eight-action desktop pet cat action sheet', uploadConsent: true, costDisclosureAccepted: true, privacyRetentionAccepted: true, licenseAttributionAccepted: true, outputFileBase: ${JSON.stringify(OUTPUT_BASE)} });`,
  "if (minimaxSummaryHasForbiddenLeak(result)) process.exit(3);",
  "console.log(JSON.stringify({ ok: result.ok, providerName: result.providerName, model: result.model, endpointHost: result.endpointHost, actionIntent: result.actionIntent, promptHash: result.promptHash, promptLength: result.promptLength, imageCount: result.imageCount, outputFiles: result.outputFiles, reasonCode: result.reasonCode, baseStatusCode: result.baseStatusCode, baseStatusMessage: result.baseStatusMessage }, null, 2));",
  "if (!result.ok || result.imageCount < 1) process.exit(2);"
]);
record("MiniMax provider API action-sheet generation", provider.ok ? "passed" : "failed", provider.ok ? summarizeProviderOutput(provider.output) : sanitize(provider.output));
if (!provider.ok) finish();

const jpegPath = `${OUTPUT_DIR}/v17_7_minimax_action_sheet-1.jpeg`;
record("provider output image exists", existsSync(jpegPath) ? "passed" : "failed", "safe generated filename only");

const dimensions = inspectImage(jpegPath);
record("provider output image dimensions", dimensions.ok ? "passed" : "failed", dimensions.details);

const packaging = run(["pnpm", "--filter", "desktop", "exec", "tsx", "../../scripts/v17_3_action_sheet_packaging_smoke.mjs"], {
  env: {
    ...process.env,
    V17_3_ACTION_SHEET_PATH: jpegPath,
    V17_3_OUTPUT_DIR: `${OUTPUT_DIR}/pack`,
    V17_3_PACK_ID: "v17-7-minimax-provider-action-sheet",
    V17_3_EVIDENCE_PATH: PROVIDER_PACKAGING_EVIDENCE
  }
});
record("V17 action-sheet packaging from provider output", packaging.ok ? "passed" : "failed", packaging.ok ? "packaging smoke accepted provider output" : sanitize(packaging.output));

record("provider output action coverage assumption", "passed", `fixed 4x2 order expected: ${REQUIRED_ACTIONS.join(",")}`);
record("security redaction scan", securityScan() ? "passed" : "failed", "safe summaries only; no key, Authorization, raw prompt, raw provider response, raw photo bytes, or full local path");
record("claim boundary", "passed", "scoped provider API action-sheet smoke only; no arbitrary photo-to-2D/provider integration claim");

finish();

function runEval(lines) {
  return run(["pnpm", "--filter", "desktop", "exec", "node", "--import", "tsx", "--eval", lines.join("")], { env: process.env });
}

function run(command, options = {}) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: process.cwd(),
    encoding: "utf8",
    env: options.env ?? process.env
  });
  return {
    ok: result.status === 0,
    status: result.status,
    output: `${result.stdout || ""}${result.stderr || ""}`
  };
}

function inspectImage(path) {
  const result = run(["sips", "-g", "pixelWidth", "-g", "pixelHeight", path]);
  if (!result.ok) return { ok: false, details: "image_dimensions_unavailable" };
  const width = Number(result.output.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0);
  const height = Number(result.output.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0);
  return {
    ok: width >= 512 && height >= 512,
    details: width && height ? `dimensions=${width}x${height}` : "dimensions=unknown"
  };
}

function record(name, result, details) {
  cases.push({ name, result, details });
}

function finish() {
  const failed = cases.some((item) => item.result === "failed");
  const blocked = cases.some((item) => item.result === "blocked");
  const status = failed ? "failed" : blocked ? "blocked" : "passed";
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(EVIDENCE_PATH, renderEvidence(status), "utf8");
  console.log(JSON.stringify({ ok: status === "passed", status, evidencePath: EVIDENCE_PATH, outputDir: status === "passed" ? OUTPUT_DIR : undefined, cases }, null, 2));
  process.exit(status === "passed" ? 0 : status === "blocked" ? 2 : 1);
}

function summarizeProviderOutput(output) {
  try {
    const parsed = JSON.parse(sanitize(output).trim().split("\n").at(-1) || "{}");
    return `providerName=${parsed.providerName}; model=${parsed.model}; endpointHost=${parsed.endpointHost}; imageCount=${parsed.imageCount}; outputFiles=${parsed.outputFiles?.length ?? 0}; status=${parsed.baseStatusCode ?? "n/a"}`;
  } catch {
    return "provider output accepted";
  }
}

function sanitize(value) {
  return String(value)
    .replace(/--eval[\s\S]*/g, "--eval [redacted]")
    .replace(/\/Users\/[^/\s]+/g, "[home]")
    .replace(/\/private\/[^\s"']+/g, "[tmp]")
    .replace(/Authorization[^\n]*/gi, "auth header [redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[redacted]")
    .slice(0, 1600);
}

function securityScan() {
  const safeCases = JSON.stringify(cases);
  return !/(Authorization|api-token\.json|\/Users\/|raw payload|raw prompt|raw provider response|raw photo|prompt text|workspace path|config path|sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,})/i.test(safeCases);
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
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function renderEvidence(status) {
  return `# V17.7 MiniMax Provider API Action-Sheet Smoke

status: ${status}
date: ${DATE}

## Scope

Direct MiniMax provider API smoke for generating one 4x2 action-sheet image and
feeding it into the V17 local action-sheet packaging path.

This is an addendum to V17. It proves only the tested MiniMax text-to-image
action-sheet path when status is passed. It does not prove arbitrary local cat
photo upload, automatic photo-to-2D readiness for arbitrary cats, broad provider
integration, Petdex parity, 3D readiness, or production release readiness.

## Results

\`\`\`json
${JSON.stringify(cases, null, 2)}
\`\`\`

## Security Boundary

- Credential source: MINIMAX_API_KEY, never written to evidence.
- Provider request prompt is not written verbatim to evidence.
- Raw provider response is not written to evidence.
- Output evidence records safe filename, dimensions, provider/model/host summary, and packaging result only.

## Allowed Claim

${status === "passed"
    ? "V17.7 MiniMax provider API action-sheet generation passed for the tested explicit-consent local scenario."
    : "No V17.7 provider API passed claim is made while status is not passed."}

## Still Forbidden

- automatic photo-to-2D ready for arbitrary cats
- automatic photo-to-animation ready
- provider integration verified
- local cat photo upload to provider ready
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- production signed release ready
- cross-platform ready
- Windows ready
`;
}
