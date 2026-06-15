import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

loadDotenv();

const actions = [
  ["idle", "sitting calmly with a soft friendly expression"],
  ["thinking", "looking curious and focused, paw near chin"],
  ["running", "playing energetically with a feather wand"],
  ["success", "jumping happily with a celebratory pose"],
  ["warning", "standing alert with ears up and wide eyes"],
  ["error", "looking confused with a small dizzy expression"],
  ["need_input", "raising one paw to ask for attention"],
  ["sleeping", "curled up sleeping peacefully"]
];

const cases = [];
const evidencePath = "docs/V7.10/evidence/v7_10-generated-2d-action-pack-smoke-2026-05-31.md";
const jpegBase = "../../docs/V7.10/evidence/v7_10-minimax-action";
const packDir = "fixtures/manual/visual-assets/imported-static-orange-tabby-v1";
const displayName = "Imported Static Orange Tabby V1";

record("desktop MiniMax boundary tests", run(["pnpm", "--filter", "desktop", "test"]));
record("desktop typecheck", run(["pnpm", "--filter", "desktop", "check"]));

const hasCredential = Boolean(process.env.MINIMAX_API_KEY?.trim());
const hasConsent = process.env.MINIMAX_PROVIDER_SMOKE_CONSENT === "yes";
const hasDisclosures = process.env.MINIMAX_PROVIDER_TERMS_ACCEPTED === "yes";

if (hasCredential && hasConsent && hasDisclosures) {
  await mkdir(packDir, { recursive: true });
  for (const [actionId, actionIntent] of actions) {
    record(`generate ${actionId}`, runEval([
      "import { createMinimaxCatActionPrompt, generateMinimaxCatActionImage, minimaxSummaryHasForbiddenLeak } from './src/assets/minimax-image-provider.ts';",
      `const prompt = createMinimaxCatActionPrompt({ catTraits: 'consistent cute orange tabby cat, bright eyes, round face, warm striped fur', actionIntent: '${actionIntent}' });`,
      `const result = await generateMinimaxCatActionImage({ apiKey: process.env.MINIMAX_API_KEY, apiBaseUrl: process.env.MINIMAX_API_BASE_URL, prompt, actionIntent: '${actionIntent}', uploadConsent: true, costDisclosureAccepted: true, privacyRetentionAccepted: true, licenseAttributionAccepted: true, outputFileBase: '${jpegBase}-${actionId}' });`,
      "if (minimaxSummaryHasForbiddenLeak(result)) process.exit(3);",
      "console.log(JSON.stringify(result, null, 2));",
      "if (!result.ok || result.imageCount < 1) process.exit(2);"
    ], { env: process.env }));

    const jpegPath = `docs/V7.10/evidence/v7_10-minimax-action-${actionId}-1.jpeg`;
    const pngPath = `${packDir}/${actionId}.png`;
    record(`convert ${actionId} to png`, run(["sips", "-s", "format", "png", jpegPath, "--out", pngPath]));
    record(`png signature ${actionId}`, checkPng(pngPath));
  }
  await writeFile(`${packDir}/manifest.json`, JSON.stringify(createManifest(), null, 2), "utf8");
  record("manifest core action coverage", checkManifest(`${packDir}/manifest.json`));
} else {
  cases.push({
    name: "generate core actions",
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
  packDir,
  cases: cases.map(({ output, ...item }) => item)
}, null, 2));

if (failed.length) {
  process.exit(1);
}
if (blocked.length) {
  process.exit(2);
}

function createManifest() {
  const assets = Object.fromEntries(actions.map(([actionId]) => [
    actionId,
    {
      assetId: actionId,
      kind: "sprite",
      fileName: `${actionId}.png`
    }
  ]));
  const actionEntries = Object.fromEntries(actions.map(([actionId]) => [
    actionId,
    {
      assetId: actionId,
      loop: actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping",
      priority: actionId === "error" || actionId === "need_input" ? "urgent" : actionId === "success" || actionId === "warning" ? "transient" : "base",
      ...(actionId === "success" || actionId === "warning" ? { durationMs: 3200 } : {}),
      ...(actionId === "error" || actionId === "need_input" ? { durationMs: 6000 } : {})
    }
  ]));
  return {
    schemaVersion: "5.8",
    packId: "imported-static-orange-tabby-v1",
    displayName,
    rendererKind: "sprite",
    license: {
      type: "generated-local-fixture",
      attribution: "Generated orange tabby action images for Agent Desktop Pet visual asset fixture"
    },
    assets,
    actions: actionEntries
  };
}

function checkManifest(path) {
  try {
    const manifest = JSON.parse(readFileSync(path, "utf8"));
    const missing = actions.map(([actionId]) => actionId).filter((actionId) => !manifest.actions?.[actionId] || !manifest.assets?.[actionId]);
    const serialized = JSON.stringify(manifest);
    return {
      ok: missing.length === 0 && !forbiddenPattern().test(serialized),
      output: JSON.stringify({
        missing,
        packId: manifest.packId,
        rendererKind: manifest.rendererKind,
        actionCount: Object.keys(manifest.actions ?? {}).length
      })
    };
  } catch (error) {
    return { ok: false, output: String(error) };
  }
}

function checkPng(path) {
  try {
    const bytes = readFileSync(path);
    const ok = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    return {
      ok,
      output: JSON.stringify({ fileName: path.split("/").pop(), byteLength: bytes.byteLength, sha256: hash(bytes) })
    };
  } catch (error) {
    return { ok: false, output: String(error) };
  }
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
    return JSON.stringify({
      providerName: parsed.providerName,
      reasonCode: parsed.reasonCode,
      imageCount: parsed.imageCount,
      actionIntent: parsed.actionIntent,
      promptHash: parsed.promptHash,
      outputFiles: parsed.outputFiles,
      endpointHost: parsed.endpointHost,
      fileName: parsed.fileName,
      byteLength: parsed.byteLength,
      sha256: parsed.sha256,
      packId: parsed.packId,
      rendererKind: parsed.rendererKind,
      actionCount: parsed.actionCount,
      missing: parsed.missing
    });
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
  return `# V7.10 Generated 2D Action Pack Smoke

status: ${status}
date: 2026-05-31

## Scope

Generate a full MiniMax-based 2D action image set, convert it to PNG sprite frames, and assemble a local asset pack manifest.

This evidence does not claim runtime activation, automatic photo-to-3D, broad 3D readiness, provider integration verified, or production release readiness.

## Results

\`\`\`json
${JSON.stringify(safeCases, null, 2)}
\`\`\`

## Output

- Pack directory: \`${packDir}\`
- Manifest: \`${packDir}/manifest.json\`

## Security Scan

${safeCases.some((item) => item.result === "failed") ? "Failed." : "Passed for recorded summaries."}

Evidence excludes token, Authorization, raw prompt, raw provider request, raw provider response, source photo, EXIF/GPS, full local path, workspace path, config path, and api-token.json.

## Final Decision

${status === "passed" ? "Passed for generated 2D action pack assembly. Runtime activation remains V7.12/V7.13 scope unless separately accepted." : status === "blocked" ? "Blocked until MiniMax credential, consent, and provider terms are available." : "Failed."}
`;
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}
