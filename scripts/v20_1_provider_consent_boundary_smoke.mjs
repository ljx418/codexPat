#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V20.x/evidence/v20_1-provider-consent-boundary-${DATE}.md`;
const records = [];
const env = readDotEnv();

const snapshot = runBoundarySnapshot(Boolean(env.MINIMAX_API_KEY));

record("provider selector defaults to MiniMax", snapshot.defaultProvider.providerId === "minimax" && snapshot.defaultProvider.reasonCode === "provider_consent_required", `provider=${snapshot.defaultProvider.providerId}; reasonCode=${snapshot.defaultProvider.reasonCode}`);
record("non-active mainland providers are document-only", snapshot.documentOnlyProvider.reasonCode === "provider_document_only", `provider=${snapshot.documentOnlyProvider.providerId}; reasonCode=${snapshot.documentOnlyProvider.reasonCode}`);
record("consent unchecked blocks provider call", snapshot.noConsent.canStartProvider === false && snapshot.noConsent.reasonCode === "provider_consent_required", `reasonCode=${snapshot.noConsent.reasonCode}`);
record("terms and disclosure gates are required", snapshot.termsMissing.reasonCode === "provider_terms_required" && snapshot.costMissing.reasonCode === "provider_cost_disclosure_required" && snapshot.privacyMissing.reasonCode === "provider_privacy_disclosure_required" && snapshot.retentionMissing.reasonCode === "provider_retention_disclosure_required" && snapshot.licenseMissing.reasonCode === "provider_license_disclosure_required" && snapshot.attributionMissing.reasonCode === "provider_attribution_disclosure_required", "terms/cost/privacy/retention/license/attribution reasonCodes covered");
record("missing credential is stable", snapshot.credentialMissing.reasonCode === "provider_credential_missing" && snapshot.credentialMissing.credentialState === "missing", `reasonCode=${snapshot.credentialMissing.reasonCode}`);
record("configured credential is redacted", snapshot.readyWithEnv.credentialState === (env.MINIMAX_API_KEY ? "configured" : "missing") && !snapshot.forbiddenLeak, `credentialState=${snapshot.readyWithEnv.credentialState}`);
record("provider execution is gated by actual local env", env.MINIMAX_API_KEY ? snapshot.readyWithEnv.status === "ready" : snapshot.readyWithEnv.reasonCode === "provider_credential_missing", env.MINIMAX_API_KEY ? "MINIMAX_API_KEY present; value redacted" : "MINIMAX_API_KEY missing; no provider call allowed");
record("reference image evidence fields enforced", snapshot.referenceImagePassed.status === "passed" && snapshot.referenceImagePassed.reference_image_attached === true && snapshot.referenceImagePassed.provider_capability === "reference_image_supported" && snapshot.referenceImagePassed.text_to_image_only === false && snapshot.referenceImageBlocked.reasonCode === "reference_image_evidence_missing", "reference_image_attached/provider_capability/text_to_image_only gate covered");
record("provider benchmark unit tests pass", snapshot.testPassed, snapshot.testPassed ? "v20-provider-benchmark.test.ts passed" : snapshot.testOutput);
record("safe output fields only", snapshot.safeFieldsOk, snapshot.safeFields.join(", "));
record("evidence security scan", !securityLeak(JSON.stringify(snapshot)), "no token, Authorization, raw photo bytes, raw provider response, raw HTTP payload, full local path, or private filename");

const status = records.every((item) => item.ok) ? "passed" : "failed";
mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, evidence: EVIDENCE_PATH, records }, null, 2));
process.exit(status === "passed" ? 0 : 1);

function runBoundarySnapshot(credentialAvailable) {
  const code = `
import {
  createV20ProviderConsentBoundary,
  createV20ReferenceImageEvidence,
  V20_SAFE_PROVIDER_OUTPUT_FIELDS,
  v20ProviderEvidenceHasForbiddenLeak
} from "./src/assets/v20-provider-benchmark.ts";

const base = {
  uploadConsent: true,
  termsAccepted: true,
  costDisclosureAccepted: true,
  privacyDisclosureAccepted: true,
  retentionDisclosureAccepted: true,
  licenseDisclosureAccepted: true,
  attributionDisclosureAccepted: true
};
const defaultProvider = createV20ProviderConsentBoundary({ credentialAvailable: true });
const documentOnlyProvider = createV20ProviderConsentBoundary({ providerId: "aliyun_wanxiang", ...base, credentialAvailable: true });
const noConsent = createV20ProviderConsentBoundary({ credentialAvailable: true });
const termsMissing = createV20ProviderConsentBoundary({ uploadConsent: true, credentialAvailable: true });
const costMissing = createV20ProviderConsentBoundary({ uploadConsent: true, termsAccepted: true, credentialAvailable: true });
const privacyMissing = createV20ProviderConsentBoundary({ uploadConsent: true, termsAccepted: true, costDisclosureAccepted: true, credentialAvailable: true });
const retentionMissing = createV20ProviderConsentBoundary({ uploadConsent: true, termsAccepted: true, costDisclosureAccepted: true, privacyDisclosureAccepted: true, credentialAvailable: true });
const licenseMissing = createV20ProviderConsentBoundary({ uploadConsent: true, termsAccepted: true, costDisclosureAccepted: true, privacyDisclosureAccepted: true, retentionDisclosureAccepted: true, credentialAvailable: true });
const attributionMissing = createV20ProviderConsentBoundary({ uploadConsent: true, termsAccepted: true, costDisclosureAccepted: true, privacyDisclosureAccepted: true, retentionDisclosureAccepted: true, licenseDisclosureAccepted: true, credentialAvailable: true });
const credentialMissing = createV20ProviderConsentBoundary({ ...base, credentialAvailable: false });
const readyWithEnv = createV20ProviderConsentBoundary({ ...base, credentialAvailable: ${credentialAvailable ? "true" : "false"} });
const referenceImagePassed = createV20ReferenceImageEvidence({ referenceImageAttached: true, providerCapability: "reference_image_supported", textToImageOnly: false });
const referenceImageBlocked = createV20ReferenceImageEvidence({ referenceImageAttached: false, providerCapability: "text_to_image_only", textToImageOnly: true });
const safeFields = [...V20_SAFE_PROVIDER_OUTPUT_FIELDS];
const snapshot = {
  defaultProvider,
  documentOnlyProvider,
  noConsent,
  termsMissing,
  costMissing,
  privacyMissing,
  retentionMissing,
  licenseMissing,
  attributionMissing,
  credentialMissing,
  readyWithEnv,
  referenceImagePassed,
  referenceImageBlocked,
  safeFields,
  safeFieldsOk: safeFields.every((field) => !/path|payload|token|Authorization|photo|prompt private/i.test(field)),
  forbiddenLeak: v20ProviderEvidenceHasForbiddenLeak({ defaultProvider, documentOnlyProvider, readyWithEnv, referenceImagePassed, referenceImageBlocked })
};
console.log(JSON.stringify(snapshot));
`;
  const raw = execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "--eval", code], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  const snapshot = JSON.parse(raw);
  try {
    execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--test", "--import", "tsx", "src/assets/v20-provider-benchmark.test.ts"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { ...snapshot, testPassed: true, testOutput: "passed" };
  } catch (error) {
    return { ...snapshot, testPassed: false, testOutput: sanitize(String(error.stdout || error.stderr || error.message)) };
  }
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

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function renderEvidence(status) {
  return `# V20.1 Provider Consent Boundary Evidence

status: ${status}
date: ${DATE}

## Scope

V20.1 verifies the product boundary before any mainland provider call. This
smoke does not upload a photo, does not call MiniMax, and does not persist any
provider credential. It verifies consent, terms, disclosure, credential presence,
document-only provider blocking, and reference-image evidence field requirements.

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${sanitize(item.details)} |`).join("\n")}

## Safe Metadata

| Field | Value |
| --- | --- |
| provider | MiniMax / 海螺 |
| credentialState | ${snapshot.readyWithEnv.credentialState} |
| providerCallStarted | false |
| uploadStarted | false |
| tokenPrinted | false |
| AuthorizationPrinted | false |
| rawPhotoBytesRecorded | false |
| rawProviderResponseRecorded | false |

## PRD / Spec Review

V20.1 satisfies the provider consent/disclosure boundary required by the V20 PRD.
V20.2 remains a separate conditional provider benchmark gate and is not implied
by this evidence.

## Allowed Claim

${status === "passed"
    ? "V20.1 mainland provider consent and credential boundary passed without starting provider execution."
    : "No V20.1 passed claim is made."}

## Forbidden Claims

- provider integration verified
- MiniMax benchmark passed
- arbitrary cats automatic photo-to-animation ready
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- production signed release ready
`;
}

function securityLeak(value) {
  return /(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|Authorization\s*[:=]|api-token\.json|\/Users\/|\/private\/|raw provider response|raw HTTP payload|raw photo|EXIF|GPS|full local path|private filename|workspace path|config path|prompt private text)/i.test(String(value));
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
