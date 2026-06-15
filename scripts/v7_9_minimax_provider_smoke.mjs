import { writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

loadDotenv();

const cases = [];
const evidencePath = "docs/V7.9/evidence/v7_9-minimax-provider-smoke-2026-05-31.md";
const liveOutputBase = "../../docs/V7.9/evidence/v7_9-minimax-generated-cat-action-2026-05-31";

record("desktop MiniMax boundary tests", run(["pnpm", "--filter", "desktop", "test"]));
record("desktop typecheck", run(["pnpm", "--filter", "desktop", "check"]));
record("missing credential preflight", runEval([
  "import { createMinimaxCatActionPrompt, preflightMinimaxGeneration, minimaxSummaryHasForbiddenLeak } from './src/assets/minimax-image-provider.ts';",
  "const prompt = createMinimaxCatActionPrompt();",
  "const result = preflightMinimaxGeneration({ prompt, actionIntent: 'playing with a feather wand', uploadConsent: true, costDisclosureAccepted: true, privacyRetentionAccepted: true, licenseAttributionAccepted: true });",
  "if (result.ok || result.reasonCode !== 'provider_credential_missing') process.exit(2);",
  "if (minimaxSummaryHasForbiddenLeak(result)) process.exit(3);",
  "console.log(JSON.stringify({ ok: result.ok, reasonCode: result.reasonCode, providerName: result.providerName, endpointHost: result.endpointHost }, null, 2));"
]));
record("missing consent preflight", runEval([
  "import { createMinimaxCatActionPrompt, preflightMinimaxGeneration, minimaxSummaryHasForbiddenLeak } from './src/assets/minimax-image-provider.ts';",
  "const prompt = createMinimaxCatActionPrompt();",
  "const result = preflightMinimaxGeneration({ apiKey: 'sk-redacted-test', prompt, actionIntent: 'playing with a feather wand', uploadConsent: false, costDisclosureAccepted: true, privacyRetentionAccepted: true, licenseAttributionAccepted: true });",
  "if (result.ok || result.reasonCode !== 'upload_consent_required') process.exit(2);",
  "if (minimaxSummaryHasForbiddenLeak(result)) process.exit(3);",
  "console.log(JSON.stringify({ ok: result.ok, reasonCode: result.reasonCode, providerName: result.providerName, consent: result.consent }, null, 2));"
]));

const hasCredential = Boolean(process.env.MINIMAX_API_KEY?.trim());
const hasConsent = process.env.MINIMAX_PROVIDER_SMOKE_CONSENT === "yes";
const hasDisclosures = process.env.MINIMAX_PROVIDER_TERMS_ACCEPTED === "yes";
const apiBaseUrl = process.env.MINIMAX_API_BASE_URL || "https://api.minimaxi.com";

if (hasCredential && hasConsent && hasDisclosures) {
  record("live MiniMax provider smoke", runEval([
    "import { createMinimaxCatActionPrompt, generateMinimaxCatActionImage, minimaxSummaryHasForbiddenLeak } from './src/assets/minimax-image-provider.ts';",
    "const prompt = createMinimaxCatActionPrompt({ catTraits: 'orange tabby cat, bright eyes, round face, warm striped fur', actionIntent: 'playing with a feather wand' });",
    `const result = await generateMinimaxCatActionImage({ apiKey: process.env.MINIMAX_API_KEY, apiBaseUrl: process.env.MINIMAX_API_BASE_URL, prompt, actionIntent: 'playing with a feather wand', uploadConsent: true, costDisclosureAccepted: true, privacyRetentionAccepted: true, licenseAttributionAccepted: true, outputFileBase: '${liveOutputBase}' });`,
    "if (minimaxSummaryHasForbiddenLeak(result)) process.exit(3);",
    "console.log(JSON.stringify(result, null, 2));",
    "if (!result.ok || result.imageCount < 1) process.exit(2);"
  ], { env: process.env }));
} else {
  cases.push({
    name: "live MiniMax provider smoke",
    result: "blocked",
    details: "requires MINIMAX_API_KEY, MINIMAX_PROVIDER_SMOKE_CONSENT=yes, and MINIMAX_PROVIDER_TERMS_ACCEPTED=yes"
  });
}

const safeCasesForScan = cases.map(({ output, ...item }) => item);
const scanPayload = JSON.stringify(safeCasesForScan);
cases.push({
  name: "security redaction scan",
  result: forbiddenPattern().test(scanPayload) ? "failed" : "passed",
  details: "summary contains no token, Authorization, raw prompt, raw provider response, local path, workspace path, config path, or api-token.json"
});

const failed = cases.filter((item) => item.result === "failed");
const blocked = cases.filter((item) => item.result === "blocked");
const status = failed.length ? "failed" : blocked.length ? "blocked" : "passed";

await writeFile(evidencePath, renderEvidence(status), "utf8");

console.log(JSON.stringify({
  status,
  evidencePath,
  cases: cases.map(({ output, ...item }) => item)
}, null, 2));

if (failed.length) {
  process.exit(1);
}
if (blocked.length) {
  process.exit(2);
}

function runEval(lines, options = {}) {
  return run([
    "pnpm",
    "--filter",
    "desktop",
    "exec",
    "node",
    "--import",
    "tsx",
    "--eval",
    lines.join("")
  ], options);
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

function record(name, result) {
  cases.push({
    name,
    result: result.ok ? "passed" : "failed",
    details: result.ok ? summarize(result.output) : sanitize(result.output),
    output: result.output
  });
}

function summarize(value) {
  const sanitized = sanitize(value);
  try {
    const parsed = JSON.parse(sanitized.trim().split("\n").at(-1) || "{}");
    if (parsed.providerName || parsed.reasonCode || parsed.imageCount !== undefined) {
      return JSON.stringify({
        providerName: parsed.providerName,
        reasonCode: parsed.reasonCode,
        imageCount: parsed.imageCount,
        actionIntent: parsed.actionIntent,
        promptHash: parsed.promptHash,
        outputFiles: parsed.outputFiles,
        endpointHost: parsed.endpointHost
      });
    }
  } catch {
    // fall through
  }
  return "ok";
}

function sanitize(value) {
  return String(value)
    .replace(/--eval[\s\S]*/g, "--eval [redacted]")
    .replace(/Command failed with exit code \d+:[\s\S]*/g, "Command failed with exit code [redacted]")
    .replace(/\/Users\/[^/\s]+/g, "[home]")
    .replace(/\/private\/[^\s"']+/g, "[tmp]")
    .replace(/Authorization[^\n]*/gi, "Authorization [redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[redacted]")
    .replace(/api[_-]?key\s*[:=]\s*[^\s"']+/gi, "api key redacted")
    .replace(/cookie\s*[:=]\s*[^\n\r"']+/gi, "cookie redacted")
    .slice(0, 1200);
}

function forbiddenPattern() {
  return /(Authorization|api-token\.json|\/Users\/|raw payload|raw prompt|raw provider response|raw photo|workspace path|config path|EXIF|GPS|sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|api[_-]?key\s*[:=]\s*[^"'\s]+|cookie\s*[:=]\s*[^"'\s]+)/i;
}

function loadDotenv() {
  const envPath = ".env";
  if (!existsSync(envPath)) {
    return;
  }
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function renderEvidence(status) {
  const safeCases = cases.map(({ output, ...item }) => item);
  return `# V7.9 MiniMax Provider Smoke

status: ${status}
date: 2026-05-31

## Scope

Explicit-consent MiniMax image generation smoke for one user-approved local cat action scenario.

This evidence does not claim provider integration verified, automatic photo-to-3D ready, GLB/GLTF generation, broad 3D readiness, or production release readiness.

## Provider Terms / Consent

- Provider: MiniMax image generation.
- Model: image-01.
- Endpoint host: ${safeEndpointHost(apiBaseUrl)}.
- Upload/provider execution consent: ${hasConsent ? "accepted for this smoke" : "missing"}.
- Cost/privacy/retention/license review: ${hasDisclosures ? "accepted for this smoke" : "missing"}.
- Credential source: MINIMAX_API_KEY, never written to evidence.

## Results

\`\`\`json
${JSON.stringify(safeCases, null, 2)}
\`\`\`

## Security Scan

${safeCases.some((item) => item.result === "failed") ? "Failed." : "Passed for recorded summaries."}

Evidence excludes token, Authorization, raw prompt, raw provider request, raw provider response, source photo, EXIF/GPS, full local path, workspace path, config path, and api-token.json.

## Final Decision

${status === "passed" ? "Passed for the scoped MiniMax image provider smoke." : status === "blocked" ? "Blocked until MiniMax credential, consent, and provider terms are available in the local environment." : "Failed."}
`;
}

function safeEndpointHost(value) {
  try {
    return new URL(value).host;
  } catch {
    return "api.minimaxi.com";
  }
}
