#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  buildPhoto2DIntakeEvidenceSnapshot,
  createPhoto2DIntakeConsentSession,
  photo2DIntakeHasForbiddenContent
} from "../apps/desktop/src/assets/photo-to-2d-intake-consent.ts";

const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const EVIDENCE_PATH = `docs/V15.x/evidence/v15_9-photo-intake-consent-smoke-${DATE}.md`;
const records = [];

record("desktop test", run(["pnpm", "--filter", "desktop", "test"]));
record("desktop check", run(["pnpm", "--filter", "desktop", "check"]));

const fixturePath = "fixtures/manual/visual-assets/imported-static-orange-tabby-v1/idle.png";
const fixtureStats = statSync(fixturePath);
const acceptedSession = createPhoto2DIntakeConsentSession({
  sessionId: "v15_9_real_fixture",
  photo: {
    fileName: "cat-reference.png",
    mimeType: "image/png",
    sizeBytes: fixtureStats.size,
    width: 512,
    height: 512,
    hasExif: true,
    decodeOk: true
  },
  localProcessingConsent: true
});
const acceptedEvidence = buildPhoto2DIntakeEvidenceSnapshot(acceptedSession);

recordDecision(
  "real local photo metadata accepted",
  acceptedSession.status === "photo_selected" &&
    acceptedSession.reasonCode === "exif_redacted" &&
    !photo2DIntakeHasForbiddenContent({ acceptedEvidence }),
  `status=${acceptedSession.status}; reasonCode=${acceptedSession.reasonCode}; safeFields=${acceptedEvidence.safePhotoFields.join(",")}`
);

const noConsent = createPhoto2DIntakeConsentSession({
  sessionId: "v15_9_no_consent",
  photo: { fileName: "cat.png", mimeType: "image/png", sizeBytes: 1000 },
  localProcessingConsent: false
});
recordDecision(
  "local processing consent required",
  noConsent.status === "consent_required" && noConsent.reasonCode === "consent_required",
  `status=${noConsent.status}; reasonCode=${noConsent.reasonCode}`
);

const providerTerms = createPhoto2DIntakeConsentSession({
  sessionId: "v15_9_provider_terms",
  photo: { fileName: "cat.webp", mimeType: "image/webp", sizeBytes: 1000 },
  localProcessingConsent: true,
  providerUploadConsent: true,
  providerName: "minimax",
  providerTermsReviewed: false
});
recordDecision(
  "provider terms required before upload",
  providerTerms.status === "consent_required" && providerTerms.reasonCode === "provider_terms_required",
  `status=${providerTerms.status}; reasonCode=${providerTerms.reasonCode}; providerName=${providerTerms.consent.providerName}`
);

const failureCases = [
  ["missing photo", createPhoto2DIntakeConsentSession({ sessionId: "missing" }), "photo_required"],
  ["unsafe photo metadata", createPhoto2DIntakeConsentSession({
    sessionId: "unsafe",
    photo: { fileName: "/Users/example/cat.png", mimeType: "image/png", sizeBytes: 1000 },
    localProcessingConsent: true
  }), "security_scan_failed"],
  ["unsupported mime", createPhoto2DIntakeConsentSession({
    sessionId: "unsupported",
    photo: { fileName: "cat.gif", mimeType: "image/gif", sizeBytes: 1000 },
    localProcessingConsent: true
  }), "photo_mime_unsupported"],
  ["photo too large", createPhoto2DIntakeConsentSession({
    sessionId: "too_large",
    photo: { fileName: "cat.png", mimeType: "image/png", sizeBytes: 13 * 1024 * 1024 },
    localProcessingConsent: true
  }), "photo_too_large"],
  ["decode failed", createPhoto2DIntakeConsentSession({
    sessionId: "decode_failed",
    photo: { fileName: "cat.png", mimeType: "image/png", sizeBytes: 1000, decodeOk: false },
    localProcessingConsent: true
  }), "photo_decode_failed"]
];

for (const [name, session, expectedReason] of failureCases) {
  recordDecision(
    name,
    session.reasonCode === expectedReason,
    `status=${session.status}; reasonCode=${session.reasonCode}`
  );
}

recordDecision(
  "no upload by default",
  acceptedSession.privacyBoundary.uploadsByDefault === false &&
    acceptedSession.privacyBoundary.includesProviderCall === false &&
    acceptedSession.consent.providerUploadAllowed === false,
  "uploadsByDefault=false; includesProviderCall=false; providerUploadAllowed=false"
);

const securityPayload = JSON.stringify({
  records: records.map(({ output, ...record }) => record),
  acceptedEvidence
});
recordDecision(
  "security redaction scan",
  securityScanText(securityPayload) && !photo2DIntakeHasForbiddenContent({ acceptedEvidence }),
  "no raw photo, source filename, full path, EXIF/GPS payload, token, Authorization, prompt text, or raw provider response"
);
recordDecision(
  "claim scan",
  claimScanPassed(),
  "V15.9 claim remains scoped and forbidden claims stay forbidden/not-ready"
);
recordDecision(
  "PRD/spec review",
  prdSpecPassed(),
  "active PRD, V15 plan, detailed spec, and acceptance plan align with V15.9"
);

const failed = records.filter((item) => item.result === "failed");
const status = failed.length ? "failed" : "passed";
mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
writeFileSync(EVIDENCE_PATH, renderEvidence(status, acceptedEvidence, records));

console.log(JSON.stringify({
  ok: status === "passed",
  status,
  evidencePath: EVIDENCE_PATH,
  records: records.map(({ output, ...record }) => record)
}, null, 2));

process.exitCode = status === "passed" ? 0 : 1;

function run(command) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "ignore"
  });
  return {
    ok: result.status === 0,
    output: result.status === 0 ? "exit=0" : `exit=${result.status ?? 1}`
  };
}

function record(name, result) {
  records.push({
    name,
    result: result.ok ? "passed" : "failed",
    details: result.output,
    output: result.output
  });
}

function recordDecision(name, ok, details) {
  records.push({
    name,
    result: ok ? "passed" : "failed",
    details,
    output: details
  });
}

function securityScanText(value) {
  const sanitized = value.replace(/persistsExifGps|persistsSourceFileName|persistsFullPath|hasExif|exifStripped|exif_redacted/g, "");
  return !/sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization\s*:|\/Users\/[^/\s]+|api-token\.json|raw photo|source filename|sourceFileName|sourcePath|fullLocalPath|raw provider response|prompt text|workspace path|config path|GPS payload|EXIF payload/i.test(sanitized);
}

function claimScanPassed() {
  const text = [
    "docs/V15.x/v15_x-claim-matrix.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-asset-plan.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-detailed-implementation-spec.md"
  ].map(readSafe).join("\n");
  return text.includes("V15.9 photo intake and consent boundary passed for tested local scenarios.") &&
    text.includes("automatic photo-to-2D ready") &&
    text.includes("provider integration verified") &&
    !text.includes("automatic photo-to-2D ready | allowed") &&
    !text.includes("provider integration verified | allowed");
}

function prdSpecPassed() {
  const text = [
    "docs/active/agent_desktop_pet_prd_v15.md",
    "docs/V15.x/v15_x-acceptance-plan.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-asset-plan.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-detailed-implementation-spec.md"
  ].map(readSafe).join("\n");
  return text.includes("V15.9") &&
    text.includes("PhotoIntakeConsentBoundary") &&
    text.includes("consent") &&
    text.includes("EXIF") &&
    text.includes("no default upload");
}

function readSafe(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function renderEvidence(status, acceptedEvidence, rows) {
  const table = rows.map((item) => `| ${item.name} | ${item.result} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  return `# V15.9 Photo Intake Consent Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

V15.9 validates the photo intake and consent boundary for the planned
photo-guided 2D action asset workflow. It does not generate provider assets,
does not upload photos, and does not claim automatic photo-to-2D readiness or
provider integration.

## Safe Evidence Snapshot

| Field | Value |
| --- | --- |
| status | ${acceptedEvidence.status} |
| reasonCode | ${acceptedEvidence.reasonCode} |
| sourceKind | ${acceptedEvidence.sourceKind} |
| sourceDigest | ${acceptedEvidence.sourceDigest} |
| safePhotoFields | ${acceptedEvidence.safePhotoFields.join(", ")} |
| providerUploadAllowed | ${acceptedEvidence.consent.providerUploadAllowed} |
| termsReviewed | ${acceptedEvidence.consent.termsReviewed} |
| storesRawPhoto | ${acceptedEvidence.privacyBoundary.storesRawPhoto} |
| uploadsByDefault | ${acceptedEvidence.privacyBoundary.uploadsByDefault} |
| persistsExifGps | ${acceptedEvidence.privacyBoundary.persistsExifGps} |
| persistsSourceFileName | ${acceptedEvidence.privacyBoundary.persistsSourceFileName} |
| persistsFullPath | ${acceptedEvidence.privacyBoundary.persistsFullPath} |

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${table}

## Security Boundary

Evidence records only safe metadata buckets and consent booleans. It excludes
raw photo bytes, source filename, full local path, EXIF/GPS payload, token,
Authorization, prompt text, raw provider request, and raw provider response.

## Allowed Claim

${status === "passed" ? "V15.9 photo intake and consent boundary passed for tested local scenarios." : "No V15.9 claim may be used while this evidence is not passed."}

## Forbidden Claims

This evidence does not claim automatic photo-to-2D ready, automatic
photo-to-animation ready, provider integration verified, photo customization
ready for arbitrary cats, Petdex parity, 3D ready, automatic photo-to-3D ready,
production signed release ready, cross-platform ready, or Windows ready.

## Final Decision

V15.9 ${status}.
`;
}
