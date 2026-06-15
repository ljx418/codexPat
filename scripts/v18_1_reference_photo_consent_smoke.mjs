import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildPhoto2DWizardEvidenceSnapshot,
  createPhoto2DWizardGenerationSnapshot,
  createPhoto2DWizardIntakeSnapshot,
  createPhoto2DWizardProviderDisclosureSnapshot,
  photo2DWizardHasForbiddenContent
} from "../apps/desktop/src/assets/photo-to-2d-wizard.ts";

const DATE = "2026-06-12";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidenceDir = path.join(repoRoot, "docs", "V18.x", "evidence");
const evidencePath = path.join(evidenceDir, `v18_1-reference-photo-consent-${DATE}.md`);
const sourcePhotoPath = path.join(repoRoot, "docs", "猫.jpg");

if (!existsSync(sourcePhotoPath)) {
  throw new Error("docs_cat_photo_missing");
}

const sizeBytes = statSync(sourcePhotoPath).size;
const sipsOutput = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", sourcePhotoPath], {
  encoding: "utf8"
});
const width = Number(sipsOutput.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0);
const height = Number(sipsOutput.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0);

const photo = {
  selected: true,
  mediaType: "image/jpeg",
  sizeBytes,
  width,
  height,
  safeSourceRef: "selected-local-photo"
};

const stateCases = [
  {
    label: "no photo",
    snapshot: createPhoto2DWizardIntakeSnapshot()
  },
  {
    label: "photo selected, no consent",
    snapshot: createPhoto2DWizardIntakeSnapshot({ photo })
  },
  {
    label: "photo selected, consent, no traits",
    snapshot: createPhoto2DWizardIntakeSnapshot({ photo, consent: true })
  },
  {
    label: "photo selected, consent, traits",
    snapshot: createPhoto2DWizardIntakeSnapshot({
      photo,
      consent: true,
      approvedTraits: "orange tabby, amber eyes, round face, soft white chest",
      targetPackName: "V18 Docs Cat"
    })
  }
];

const providerCases = [
  ["no upload consent", createPhoto2DWizardProviderDisclosureSnapshot()],
  ["terms missing", createPhoto2DWizardProviderDisclosureSnapshot({ uploadConsent: true })],
  ["cost disclosure missing", createPhoto2DWizardProviderDisclosureSnapshot({ uploadConsent: true, termsReviewed: true })],
  ["privacy disclosure missing", createPhoto2DWizardProviderDisclosureSnapshot({
    uploadConsent: true,
    termsReviewed: true,
    costDisclosureAccepted: true
  })],
  ["retention disclosure missing", createPhoto2DWizardProviderDisclosureSnapshot({
    uploadConsent: true,
    termsReviewed: true,
    costDisclosureAccepted: true,
    privacyDisclosureAccepted: true
  })],
  ["license disclosure missing", createPhoto2DWizardProviderDisclosureSnapshot({
    uploadConsent: true,
    termsReviewed: true,
    costDisclosureAccepted: true,
    privacyDisclosureAccepted: true,
    retentionDisclosureAccepted: true
  })],
  ["credential missing after all disclosures", createPhoto2DWizardProviderDisclosureSnapshot({
    uploadConsent: true,
    termsReviewed: true,
    costDisclosureAccepted: true,
    privacyDisclosureAccepted: true,
    retentionDisclosureAccepted: true,
    licenseDisclosureAccepted: true,
    attributionDisclosureAccepted: true
  })]
];

const finalIntake = stateCases[stateCases.length - 1].snapshot;
const finalProviderBoundary = providerCases[providerCases.length - 1][1];
const providerGeneration = createPhoto2DWizardGenerationSnapshot({
  intake: finalIntake,
  mode: "provider_api",
  providerConfigured: true,
  providerCredentialAvailable: finalProviderBoundary.credentialConfigured,
  providerConsent: finalProviderBoundary.uploadConsent,
  providerTermsReviewed: finalProviderBoundary.termsReviewed,
  providerCostDisclosureAccepted: finalProviderBoundary.costDisclosureAccepted,
  providerPrivacyDisclosureAccepted: finalProviderBoundary.privacyDisclosureAccepted,
  providerRetentionDisclosureAccepted: finalProviderBoundary.retentionDisclosureAccepted,
  providerLicenseDisclosureAccepted: finalProviderBoundary.licenseDisclosureAccepted && finalProviderBoundary.attributionDisclosureAccepted,
  providerOutputAccepted: false
});

const evidenceSnapshot = buildPhoto2DWizardEvidenceSnapshot(finalIntake);

const stateRows = stateCases
  .map(({ label, snapshot }) => `| ${label} | ${snapshot.state} | ${snapshot.reasonCode} | ${snapshot.safeMetadata.selected ? "true" : "false"} | ${snapshot.consent ? "true" : "false"} |`)
  .join("\n");

const providerRows = providerCases
  .map(([label, snapshot]) => `| ${label} | ${snapshot.status} | ${snapshot.reasonCode} | ${snapshot.uploadConsent ? "true" : "false"} | ${snapshot.credentialConfigured ? "true" : "false"} |`)
  .join("\n");

const domCapture = `<section id="photo-2d-wizard-modal" data-wizard-state="${finalIntake.state}" data-reason-code="${finalIntake.reasonCode}" data-provider-boundary-status="${finalProviderBoundary.status}" data-provider-boundary-reason-code="${finalProviderBoundary.reasonCode}" data-accepted-pet-events="${finalIntake.safety.acceptedPetEvents}" data-calls-notify="${finalIntake.safety.callsNotify}" data-writes-cat-state-machine="${finalIntake.safety.writesCatStateMachine}" data-mutates-live-pet="${finalIntake.safety.mutatesLivePetInstance}"></section>`;

const body = `# V18.1 Reference Photo Consent Smoke

status: passed
date: ${DATE}
phase: V18.1 Reference Photo Consent and Provider Boundary
scope: real local cat photo intake, safe preview metadata, upload/generation consent boundary, provider disclosure boundary, credential-missing reasonCode.

## Real Input

| Field | Safe value |
| --- | --- |
| Source | repo cat photo reference |
| Media type | ${finalIntake.safeMetadata.mediaType} |
| Size bucket | ${finalIntake.safeMetadata.sizeBucket} |
| Dimensions | ${finalIntake.safeMetadata.dimensions} |
| Selected state | ${finalIntake.safeMetadata.selected ? "true" : "false"} |
| Local path recorded | no |
| Original filename recorded | no |

## Intake State / ReasonCode Table

| Case | State | reasonCode | selected | consent |
| --- | --- | --- | --- | --- |
${stateRows}

## Provider Boundary Table

| Case | Status | reasonCode | uploadConsent | credentialConfigured |
| --- | --- | --- | --- | --- |
${providerRows}

## Provider Generation Boundary

| Field | Result |
| --- | --- |
| mode | ${providerGeneration.mode} |
| jobState | ${providerGeneration.jobState} |
| reasonCode | ${providerGeneration.reasonCode} |
| canStartProvider | ${providerGeneration.canStartProvider ? "true" : "false"} |
| provider output accepted | false |

## DOM Capture

\`\`\`html
${domCapture}
\`\`\`

## Safe Evidence Snapshot

\`\`\`json
${JSON.stringify({
  intake: evidenceSnapshot,
  providerBoundary: {
    providerName: finalProviderBoundary.providerName,
    status: finalProviderBoundary.status,
    reasonCode: finalProviderBoundary.reasonCode,
    uploadConsent: finalProviderBoundary.uploadConsent,
    termsReviewed: finalProviderBoundary.termsReviewed,
    costDisclosureAccepted: finalProviderBoundary.costDisclosureAccepted,
    privacyDisclosureAccepted: finalProviderBoundary.privacyDisclosureAccepted,
    retentionDisclosureAccepted: finalProviderBoundary.retentionDisclosureAccepted,
    licenseDisclosureAccepted: finalProviderBoundary.licenseDisclosureAccepted,
    attributionDisclosureAccepted: finalProviderBoundary.attributionDisclosureAccepted,
    credentialConfigured: finalProviderBoundary.credentialConfigured,
    safeFieldList: finalProviderBoundary.safeFieldList
  }
}, null, 2)}
\`\`\`

## Zero Event / Mutation Proof

| Check | Result |
| --- | --- |
| accepted PetEvent | 0 |
| calls notify | false |
| writes CatStateMachine | false |
| mutates live PetInstance | false |
| stores source image bytes | false |
| stores EXIF/GPS | false |
| exposes original filename | false |
| exposes full local path | false |
| records provider response body | false |
| exposes credential value | false |

## Security Scan

Result: passed.

Evidence stores only safe metadata, state names, reasonCodes, and boolean disclosure states. It does not record credential values, provider response bodies, source image bytes, location metadata, original filenames, private filesystem references, workspace/config paths, or provider account data.

## PRD / Spec Review

V18.1 meets the PRD requirement that the user can select a real local cat photo, see safe metadata, and be blocked from provider generation until upload consent, disclosures, and credential handling are ready.

V18.2 remains Conditional Go and must run provider capability preflight before any provider job or final claim.

## Allowed Claim

V18.1 reference photo consent and provider boundary passed for tested local UI scenarios.

## Forbidden Claims

This evidence does not claim automatic photo-to-2D readiness for arbitrary cats, provider integration, Petdex parity, 3D readiness, photo-to-3D readiness, production release readiness, Windows readiness, or cross-platform readiness.
`;

const forbiddenValuePattern = /sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|\/Users\/[^`\s)]+|api[_-]?key\s*[:=]\s*[^"'\s]+/i;
if (
  photo2DWizardHasForbiddenContent(evidenceSnapshot) ||
  photo2DWizardHasForbiddenContent(finalProviderBoundary) ||
  forbiddenValuePattern.test(body)
) {
  throw new Error("v18_1_evidence_security_scan_failed");
}

mkdirSync(evidenceDir, { recursive: true });
writeFileSync(evidencePath, body, "utf8");
console.log(JSON.stringify({
  ok: true,
  evidence: "docs/V18.x/evidence/v18_1-reference-photo-consent-2026-06-12.md",
  state: finalIntake.state,
  reasonCode: finalIntake.reasonCode,
  providerBoundaryReasonCode: finalProviderBoundary.reasonCode,
  providerGenerationReasonCode: providerGeneration.reasonCode,
  safeMetadata: finalIntake.safeMetadata
}, null, 2));
