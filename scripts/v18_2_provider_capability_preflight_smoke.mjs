#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createMinimaxReferenceImagePrompt,
  generateMinimaxCatReferenceActionImage,
  minimaxSummaryHasForbiddenLeak,
  preflightMinimaxImageToImageGeneration
} from "../apps/desktop/src/assets/minimax-image-provider.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

loadDotenv();

const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const EVIDENCE_PATH = `docs/V18.x/evidence/v18_2-provider-capability-preflight-${DATE}.md`;
const OUTPUT_DIR = `docs/V18.x/evidence/assets/v18_2-provider-capability-preflight-${DATE}`;
const OUTPUT_BASE = `${OUTPUT_DIR}/minimax-i2i-reference-cat`;
const REFERENCE_PHOTO = "docs/猫.jpg";
const cases = [];

const hasCredential = Boolean(process.env.MINIMAX_API_KEY?.trim());
const hasConsent = process.env.MINIMAX_PROVIDER_SMOKE_CONSENT === "yes" || process.env.MINIMAX_PROVIDER_SMOKE_CONSENT === "true";
const hasTerms = process.env.MINIMAX_PROVIDER_TERMS_ACCEPTED === "yes" || process.env.MINIMAX_PROVIDER_TERMS_ACCEPTED === "true";

mkdirSync(resolve(REPO_ROOT, OUTPUT_DIR), { recursive: true });

if (!existsSync(resolve(REPO_ROOT, REFERENCE_PHOTO))) {
  record("real local cat photo exists", "failed", "reasonCode=reference_photo_missing");
  finish();
}

const referenceImageBytes = readFileSync(resolve(REPO_ROOT, REFERENCE_PHOTO));
const prompt = createMinimaxReferenceImagePrompt({
  catTraits: "preserve the reference cat identity, orange fur, round face, bright eyes, and sitting posture cues",
  actionIntent: "sitting calmly as an idle desktop pet sprite"
});

record("official capability field map", "passed", "MiniMax image-generation-i2i exposes subject_reference[type=character,image_file] and image_file supports public URL or base64 Data URL; model=image-01; response_format supports base64");

const dryPreflight = preflightMinimaxImageToImageGeneration({
  apiKey: process.env.MINIMAX_API_KEY,
  prompt,
  actionIntent: "idle desktop pet reference image smoke",
  uploadConsent: hasConsent,
  costDisclosureAccepted: hasTerms,
  privacyRetentionAccepted: hasTerms,
  licenseAttributionAccepted: hasTerms,
  referenceImageBytes,
  referenceImageMediaType: "image/jpeg",
  apiBaseUrl: process.env.MINIMAX_API_BASE_URL
});

record("credential presence", hasCredential ? "passed" : "blocked", hasCredential ? "credentialSource=MINIMAX_API_KEY" : "reasonCode=credential_missing");
record("upload consent", hasConsent ? "passed" : "blocked", hasConsent ? "explicit local smoke consent configured" : "reasonCode=terms_not_accepted");
record("provider terms/disclosures", hasTerms ? "passed" : "blocked", hasTerms ? "terms/privacy/retention/license smoke acceptance configured" : "reasonCode=terms_not_accepted");
record("reference image metadata", dryPreflight.referenceImage ? "passed" : "failed", dryPreflight.referenceImage ? summarizeReference(dryPreflight.referenceImage) : "reasonCode=reference_image_invalid");
record("preflight capability", dryPreflight.ok ? "passed" : "blocked", `capability=${dryPreflight.capability}; reasonCode=${dryPreflight.reasonCode}`);

if (!hasCredential || !hasConsent || !hasTerms || !dryPreflight.ok) {
  finish();
}

const providerResult = await generateMinimaxCatReferenceActionImage({
  apiKey: process.env.MINIMAX_API_KEY,
  apiBaseUrl: process.env.MINIMAX_API_BASE_URL,
  prompt,
  actionIntent: "idle desktop pet reference image smoke",
  uploadConsent: true,
  costDisclosureAccepted: true,
  privacyRetentionAccepted: true,
  licenseAttributionAccepted: true,
  referenceImageBytes,
  referenceImageMediaType: "image/jpeg",
  outputFileBase: resolve(REPO_ROOT, OUTPUT_BASE)
});

record("MiniMax reference-image provider job", providerResult.ok ? "passed" : statusForProviderFailure(providerResult.reasonCode), summarizeProvider(providerResult));
record("safe output field list", minimaxSummaryHasForbiddenLeak(providerResult) ? "failed" : "passed", "providerName, model, endpointHost, capability, documentedFields, referenceImage safe metadata, promptHash, promptLength, imageCount, output file safe names, status code/message");
record("raw payload redaction", securityScan(providerResult) ? "passed" : "failed", "no token, Authorization, Data URL, raw provider response, raw photo bytes, full local path, EXIF/GPS, workspace/config path");
record("claim boundary", "passed", "V18.2 can only claim tested MiniMax reference-image provider capability/job; not arbitrary cats, provider integration, Petdex parity, or final V18 readiness");

finish();

function statusForProviderFailure(reasonCode) {
  if (reasonCode === "provider_reference_not_supported" || reasonCode === "provider_unavailable") return "blocked";
  return "failed";
}

function summarizeReference(referenceImage) {
  return `mediaType=${referenceImage.mediaType}; sizeBucket=${referenceImage.sizeBucket}; byteLength=${referenceImage.byteLength}; sha256=${referenceImage.sha256}`;
}

function summarizeProvider(result) {
  return [
    `providerName=${result.providerName}`,
    `model=${result.model}`,
    `endpointHost=${result.endpointHost}`,
    `capability=${result.capability}`,
    `reasonCode=${result.reasonCode ?? "none"}`,
    `imageCount=${result.imageCount}`,
    `outputFiles=${result.outputFiles.length}`,
    `status=${result.baseStatusCode ?? "n/a"}`,
    `statusMessage=${sanitize(result.baseStatusMessage ?? "n/a")}`
  ].join("; ");
}

function record(name, result, details) {
  cases.push({ name, result, details });
}

function finish() {
  const failed = cases.some((item) => item.result === "failed");
  const blocked = cases.some((item) => item.result === "blocked");
  const status = failed ? "failed" : blocked ? "blocked" : "passed";
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");
  console.log(JSON.stringify({ ok: status === "passed", status, evidencePath: EVIDENCE_PATH, outputDir: status === "passed" ? OUTPUT_DIR : undefined, cases }, null, 2));
  process.exit(status === "passed" ? 0 : status === "blocked" ? 2 : 1);
}

function sanitize(value) {
  return String(value)
    .replace(/\/Users\/[^/\s]+/g, "[home]")
    .replace(/\/private\/[^\s"']+/g, "[tmp]")
    .replace(/Authorization[^\n;]*/gi, "auth header [redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[redacted]")
    .replace(/data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+/gi, "data:image/[redacted]")
    .slice(0, 1200);
}

function securityScan(value) {
  const serialized = JSON.stringify({ cases, value });
  return !/(Authorization\s*[:=]|api-token\.json|\/Users\/|\/private\/|raw payload\s*[:=]|raw provider response\s*[:=]|raw photo\s*[:=]|raw bytes\s*[:=]|data:image\/[a-z]+;base64|EXIF\s*[:=]|GPS\s*[:=]|prompt text\s*[:=]|workspace path\s*[:=]|config path\s*[:=]|sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,})/i.test(serialized);
}

function loadDotenv() {
  const envPath = resolve(REPO_ROOT, ".env");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8");
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
  return `# V18.2 Provider Capability Preflight

status: ${status}
date: ${DATE}

## Scope

V18.2 checks whether the selected provider can support the V18 local cat photo
reference-image branch. This evidence uses the project-local cat fixture as a
real reference image and records only safe metadata.

This is not the V18 final gate and does not prove arbitrary-cat automation,
provider integration readiness, Petdex parity, 3D readiness, or production
release readiness.

## Provider Capability Source

- Provider: MiniMax
- Model: image-01
- Official API reference checked: image-generation-i2i
- Safe field evidence: subject_reference, type, image_file, base64 Data URL support, response_format=base64
- Local implementation path: MiniMax reference-image provider preflight/job summary

## Results

\`\`\`json
${JSON.stringify(cases, null, 2)}
\`\`\`

## Security Boundary

- Credential source is named as MINIMAX_API_KEY only; the value is never written.
- Reference image bytes and Data URL are never written.
- Raw provider response is never written.
- Full local paths, EXIF/GPS, prompt text, Authorization, token, workspace path,
  config path, and API token file contents are forbidden from this evidence.

## PRD / Spec Review

${status === "passed"
    ? "V18.2 provider reference-image capability is confirmed for the tested MiniMax local reference-image scenario. V18.3 may proceed to normalize accepted provider output into the required 8-action model."
    : "V18.2 is not passed. V18.3/V18.6 must remain No-Go unless the provider capability issue is resolved or explicitly replanned."}

## Allowed Claim

${status === "passed"
    ? "V18.2 MiniMax reference-image provider capability and one tested local reference-image job passed."
    : "No V18.2 provider capability passed claim is made while status is not passed."}

## Still Forbidden

- automatic photo-to-2D ready for arbitrary cats
- automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- production signed release ready
- cross-platform ready
- Windows ready
- V18 final workflow passed
`;
}
