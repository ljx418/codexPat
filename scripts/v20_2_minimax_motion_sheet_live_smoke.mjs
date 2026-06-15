#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V20.x/evidence/v20_2-minimax-motion-sheet-live-smoke-${DATE}.md`;
const ASSET_DIR = `docs/V20.x/evidence/assets/v20-minimax-motion-sheet-${DATE}`;
const SOURCE_PHOTOS = ["docs/猫.jpg", "docs/猫_1.jpg", "docs/猫_2.jpg"];
const records = [];
const env = readDotEnv();

const credentialAvailable = Boolean(env.MINIMAX_API_KEY);
const uploadConsent = parseBool(env.MINIMAX_PROVIDER_SMOKE_CONSENT);
const termsAccepted = parseBool(env.MINIMAX_PROVIDER_TERMS_ACCEPTED);
const disclosuresAccepted = uploadConsent && termsAccepted;
const samplePaths = SOURCE_PHOTOS.filter((path) => existsSync(resolve(REPO_ROOT, path)));

record("real local cat photo samples exist", samplePaths.length >= 3, `sampleCount=${samplePaths.length}; sampleIds=${samplePaths.map((_, index) => `sample_${index + 1}`).join(",")}`);
record("sample size supports benchmark", samplePaths.length >= 3, samplePaths.length >= 3 ? "three real cat photos available" : "less than 3 real cat photos available; low-retry reliability claim is forbidden");
record("credential present", credentialAvailable, credentialAvailable ? "MINIMAX_API_KEY present; value redacted" : "MINIMAX_API_KEY missing");
record("upload consent and provider terms present", uploadConsent && termsAccepted, `uploadConsent=${uploadConsent}; termsAccepted=${termsAccepted}`);

let providerResult = null;
let referenceEvidence = {
  status: "blocked",
  reasonCode: "reference_image_evidence_missing",
  reference_image_attached: false,
  provider_capability: "unknown",
  text_to_image_only: false
};
let benchmark = {
  status: "blocked",
  reasonCode: "sample_size_limited",
  sampleCount: samplePaths.length,
  acceptedSampleCount: 0,
  medianAcceptedAttemptCount: null,
  canClaimLowRetryReliability: false,
  canClaimScopedSmoke: false
};

if (samplePaths.length && credentialAvailable && uploadConsent && termsAccepted) {
  mkdirSync(resolve(REPO_ROOT, ASSET_DIR), { recursive: true });
  providerResult = runMinimaxLiveSmoke(samplePaths);
  referenceEvidence = providerResult.referenceEvidence;
  benchmark = providerResult.benchmark;
  record("reference image request fields confirmed", referenceEvidence.reference_image_attached === true && referenceEvidence.provider_capability === "reference_image_supported" && referenceEvidence.text_to_image_only === false, `reference_image_attached=${referenceEvidence.reference_image_attached}; provider_capability=${referenceEvidence.provider_capability}; text_to_image_only=${referenceEvidence.text_to_image_only}`);
  record("MiniMax live output received", providerResult.summaries.some((summary) => summary.ok && summary.imageCount > 0), `acceptedOutputs=${providerResult.summaries.filter((summary) => summary.ok && summary.imageCount > 0).length}/${providerResult.summaries.length}`);
  record("safe provider summary", !securityLeak(JSON.stringify(providerResult)), "no token, Authorization, raw request, raw provider response, raw photo bytes, private filename, or full local path");
} else {
  const reason = !credentialAvailable ? "provider_credential_missing"
    : !uploadConsent ? "provider_consent_required"
      : !termsAccepted ? "provider_terms_required"
        : "sample_size_limited";
  record("MiniMax live output received", false, `blocked before provider call; reasonCode=${reason}`);
}

record("reference image evidence gate", referenceEvidence.status === "passed", `reasonCode=${referenceEvidence.reasonCode}`);
record("benchmark low-retry reliability result", samplePaths.length >= 3 ? benchmark.canClaimLowRetryReliability === true : benchmark.canClaimLowRetryReliability === false, `sampleCount=${benchmark.sampleCount}; acceptedSampleCount=${benchmark.acceptedSampleCount}; medianAcceptedAttemptCount=${benchmark.medianAcceptedAttemptCount}`);
record("scoped smoke result", benchmark.canClaimScopedSmoke === true || providerResult === null, providerResult ? `status=${benchmark.status}; reasonCode=${benchmark.reasonCode}` : "provider call did not start");

const hardFailures = records.filter((item) =>
  item.name !== "sample size is limited" &&
  item.name !== "one-sample scoped smoke result" &&
  !item.ok
);
const status = hardFailures.length === 0 && providerResult?.summaries?.some((summary) => summary.ok) ? "passed" : "blocked";
mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({
  ok: status === "passed",
  status,
  evidence: EVIDENCE_PATH,
  providerReasonCode: providerResult?.summaries?.map((summary) => summary.reasonCode ?? "provider_capability_confirmed") ?? null,
  benchmarkReasonCode: benchmark.reasonCode,
  records
}, null, 2));
process.exit(status === "passed" ? 0 : 2);

function runMinimaxLiveSmoke(samplePaths) {
  const code = `
import { readFileSync } from "node:fs";
import {
  createMinimaxReferenceImagePrompt,
  generateMinimaxCatReferenceActionImage,
  minimaxSummaryHasForbiddenLeak
} from "./src/assets/minimax-image-provider.ts";
import {
  createV20ReferenceImageEvidence,
  evaluateV20Benchmark,
  v20ProviderEvidenceHasForbiddenLeak
} from "./src/assets/v20-provider-benchmark.ts";

const samplePaths = ${JSON.stringify(samplePaths.map((path) => resolve(REPO_ROOT, path)))};
const outputBases = ${JSON.stringify(samplePaths.map((_, index) => resolve(REPO_ROOT, `${ASSET_DIR}/sample_${index + 1}-minimax-motion-sheet`)))};
const prompt = [
  createMinimaxReferenceImagePrompt({
    catTraits: "same reference cat identity, same coat color, same face markings, same eye shape",
    actionIntent: "a single 8 rows by 9 columns sprite motion sheet"
  }),
  "Output exactly one single image containing an 8x9 animation sprite sheet.",
  "Rows in order: idle, thinking, running, success, warning, error, need_input, sleeping.",
  "Each row has 9 frames, same cat identity, transparent or plain clean background, no text, no labels, no watermark.",
  "Use stronger visible poses: jump, run, alert, ask, sleep, stretch. Keep the cat centered and do not crop it."
].join(" ");

const summaries = [];
for (let index = 0; index < samplePaths.length; index += 1) {
  const result = await generateMinimaxCatReferenceActionImage({
    apiKey: process.env.MINIMAX_API_KEY,
    prompt,
    actionIntent: "8x9 same-cat desktop pet motion sheet",
    uploadConsent: true,
    costDisclosureAccepted: true,
    privacyRetentionAccepted: true,
    licenseAttributionAccepted: true,
    referenceImageBytes: readFileSync(samplePaths[index]),
    referenceImageMediaType: "image/jpeg",
    outputFileBase: outputBases[index]
  });
  summaries.push(result);
}

const referenceEvidence = createV20ReferenceImageEvidence({
  referenceImageAttached: summaries.every((result) => result.capability !== "text_to_image_only" && result.reasonCode !== "provider_reference_not_supported"),
  providerCapability: summaries.some((result) => result.capability === "text_to_image_only") ? "text_to_image_only" : "reference_image_supported",
  textToImageOnly: summaries.some((result) => result.capability === "text_to_image_only")
});
const benchmark = evaluateV20Benchmark({
  samples: summaries.map((result, index) => ({
    sampleId: "sample_" + (index + 1),
    mediaType: "image/jpeg",
    sizeBucket: result.referenceImage?.sizeBucket ?? "small",
    dimensions: { width: 0, height: 0 },
    selected: true,
    consent: true
  })),
  attempts: summaries.map((result, index) => ({
    sampleId: "sample_" + (index + 1),
    promptVariant: "strict_grid_motion_sheet",
    attemptIndex: 1,
    accepted: result.ok && result.imageCount > 0,
    reasonCode: result.ok && result.imageCount > 0 ? "accepted" : result.reasonCode === "provider_output_missing" ? "provider_output_missing" : "provider_output_rejected"
  }))
});
const snapshot = {
  summaries,
  referenceEvidence,
  benchmark,
  minimaxLeak: minimaxSummaryHasForbiddenLeak(summaries),
  v20Leak: v20ProviderEvidenceHasForbiddenLeak({ summaries, referenceEvidence, benchmark })
};
if (snapshot.minimaxLeak || snapshot.v20Leak) {
  snapshot.summaries = [{ ok: false, providerName: "MiniMax", model: "image-01", endpointHost: "api.minimaxi.com", capability: "reference_image_rejected", reasonCode: "provider_output_rejected", imageCount: 0, outputFiles: [], baseStatusCode: null, baseStatusMessage: "redaction failed" }];
}
console.log(JSON.stringify(snapshot));
`;
  let raw;
  try {
    raw = execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "--eval", code], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      MINIMAX_API_KEY: env.MINIMAX_API_KEY
    },
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 180000
    });
  } catch (error) {
    return {
      summary: {
        ok: false,
        providerName: "MiniMax",
        model: "image-01",
        endpointHost: "api.minimaxi.com",
        capability: "reference_image_rejected",
        reasonCode: "provider_unavailable",
        imageCount: 0,
        outputFiles: [],
        baseStatusCode: null,
        baseStatusMessage: "provider child process unavailable"
      },
      summaries: [{
        ok: false,
        providerName: "MiniMax",
        model: "image-01",
        endpointHost: "api.minimaxi.com",
        capability: "reference_image_rejected",
        reasonCode: "provider_unavailable",
        imageCount: 0,
        outputFiles: [],
        baseStatusCode: null,
        baseStatusMessage: "provider child process unavailable"
      }],
      referenceEvidence: {
        status: "blocked",
        reasonCode: "reference_image_evidence_missing",
        reference_image_attached: false,
        provider_capability: "unknown",
        text_to_image_only: false
      },
      benchmark: {
        status: "blocked",
        reasonCode: "provider_benchmark_blocked",
        sampleCount: samplePaths.length,
        acceptedSampleCount: 0,
        medianAcceptedAttemptCount: null,
        canClaimLowRetryReliability: false,
        canClaimScopedSmoke: false
      }
    };
  }
  return JSON.parse(raw);
}

function readDotEnv() {
  const result = {};
  const envPath = resolve(REPO_ROOT, ".env");
  if (!existsSync(envPath)) {
    return result;
  }
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const index = trimmed.indexOf("=");
    if (index <= 0) {
      continue;
    }
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      result[key] = value;
    }
  }
  return result;
}

function parseBool(value) {
  return /^(1|true|yes|y)$/i.test(String(value ?? "").trim());
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function renderEvidence(status) {
  return `# V20.2 MiniMax Motion Sheet Live Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

V20.2 verifies whether MiniMax can be called through the current reference-image
/ image-to-image path using a real local cat photo. The repository currently
contains one real cat photo sample, so this evidence cannot support any low-retry
reliability claim even if the provider returns an image.

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "blocked/failed"} | ${sanitize(item.details)} |`).join("\n")}

## Provider Summary

| Field | Value |
| --- | --- |
| provider | MiniMax / 海螺 |
| model | image-01 |
| reference_image_attached | ${referenceEvidence.reference_image_attached} |
| provider_capability | ${referenceEvidence.provider_capability} |
| text_to_image_only | ${referenceEvidence.text_to_image_only} |
| imageCount | ${(providerResult?.summaries ?? []).reduce((sum, summary) => sum + (summary.imageCount ?? 0), 0)} |
| safeOutputFileNames | ${(providerResult?.summaries ?? []).flatMap((summary) => summary.outputFiles ?? []).map((item) => item.fileName).join(", ") || "none"} |
| benchmarkReasonCode | ${benchmark.reasonCode} |
| lowRetryReliabilityClaim | false |

## PRD / Spec Review

V20.2 is only accepted as a scoped one-sample provider smoke when a real MiniMax
reference-image output is returned. V20.2 does not prove provider reliability
because fewer than three real cat samples are available in the repository.

## Allowed Claim

${status === "passed"
    ? "V20.2 MiniMax reference-image one-sample motion-sheet provider smoke returned output; low-retry reliability remains not claimed."
    : "V20.2 MiniMax provider motion-sheet branch remains blocked for this run."}

## Forbidden Claims

- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- production signed release ready
`;
}

function securityLeak(value) {
  return /(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|Authorization\s*[:=]|api-token\.json|\/Users\/|\/private\/|raw provider response|raw HTTP payload|raw photo|EXIF|GPS|full local path|private filename|workspace path|config path|prompt private text|data:image\/)/i.test(String(value));
}

function sanitize(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ").slice(0, 500);
}

function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
