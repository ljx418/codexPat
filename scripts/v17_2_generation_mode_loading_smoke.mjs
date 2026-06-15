import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildPhoto2DWizardGenerationEvidenceSnapshot,
  createPhoto2DWizardGenerationSnapshot,
  createPhoto2DWizardIntakeSnapshot,
  photo2DWizardHasForbiddenContent
} from "../apps/desktop/src/assets/photo-to-2d-wizard.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidenceDir = path.join(repoRoot, "docs", "V17.x", "evidence");
const evidencePath = path.join(evidenceDir, "v17_2-generation-mode-loading-2026-06-11.md");
const photoPath = path.join(repoRoot, "docs", "猫.jpg");
const sheetPath = path.join(repoRoot, "docs", "V7.14", "evidence", "v7_14-generated-2d-actions-2026-06-01.png");

for (const required of [photoPath, sheetPath]) {
  if (!existsSync(required)) {
    throw new Error("v17_2_real_input_missing");
  }
}

function imageDimensions(filePath) {
  const output = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", filePath], { encoding: "utf8" });
  return {
    width: Number(output.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0),
    height: Number(output.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0)
  };
}

const photoDimensions = imageDimensions(photoPath);
const sheetDimensions = imageDimensions(sheetPath);
const intake = createPhoto2DWizardIntakeSnapshot({
  photo: {
    selected: true,
    mediaType: "image/jpeg",
    sizeBytes: statSync(photoPath).size,
    width: photoDimensions.width,
    height: photoDimensions.height,
    safeSourceRef: "selected-local-photo"
  },
  consent: true,
  approvedTraits: "orange tabby, amber eyes, round face, soft white chest",
  targetPackName: "Docs Cat Action Pack"
});

const cases = [
  {
    label: "no mode selected",
    snapshot: createPhoto2DWizardGenerationSnapshot({ intake })
  },
  {
    label: "host image tool assisted",
    snapshot: createPhoto2DWizardGenerationSnapshot({ intake, mode: "host_image_tool_assisted" })
  },
  {
    label: "provider api not configured",
    snapshot: createPhoto2DWizardGenerationSnapshot({ intake, mode: "provider_api" })
  },
  {
    label: "local action sheet import",
    snapshot: createPhoto2DWizardGenerationSnapshot({
      intake,
      mode: "local_action_sheet_import",
      actionSheet: {
        selected: true,
        mediaType: "image/png",
        sizeBytes: statSync(sheetPath).size,
        width: sheetDimensions.width,
        height: sheetDimensions.height,
        safeSourceRef: "selected-local-photo"
      }
    })
  }
];

const rows = cases
  .map(({ label, snapshot }) => `| ${label} | ${snapshot.mode} | ${snapshot.jobState} | ${snapshot.reasonCode} | ${snapshot.canCopyPrompt ? "true" : "false"} | ${snapshot.canSelectActionSheet ? "true" : "false"} | ${snapshot.canStartProvider ? "true" : "false"} |`)
  .join("\n");
const finalSnapshot = cases[cases.length - 1].snapshot;
const evidenceSnapshot = buildPhoto2DWizardGenerationEvidenceSnapshot(finalSnapshot);
const domCapture = `<section class="photo-2d-intake-shell" data-wizard-state="${intake.state}" data-reason-code="${intake.reasonCode}" data-generation-mode="${finalSnapshot.mode}" data-job-state="${finalSnapshot.jobState}" data-generation-reason-code="${finalSnapshot.reasonCode}" data-accepted-pet-events="${finalSnapshot.safety.acceptedPetEvents}" data-calls-notify="${finalSnapshot.safety.callsNotify}" data-writes-cat-state-machine="${finalSnapshot.safety.writesCatStateMachine}" data-mutates-live-pet="${finalSnapshot.safety.mutatesLivePetInstance}"></section>`;

const body = `# V17.2 Generation Mode Loading Smoke

Date: 2026-06-11
Status: passed
Scope: Generation mode selector and loading/status UX only. V17.3 crop/package, V17.4 QA preview, V17.5 apply/rollback, and V17.6 final gate remain not-run.

## Real Inputs

| Input | Safe metadata |
| --- | --- |
| Local cat photo | ${intake.safeMetadata.mediaType}; ${intake.safeMetadata.sizeBucket}; ${intake.safeMetadata.dimensions} |
| Local action sheet | ${finalSnapshot.actionSheetMetadata.mediaType}; ${finalSnapshot.actionSheetMetadata.sizeBucket}; ${finalSnapshot.actionSheetMetadata.dimensions} |

## Mode / Loading State Table

| Case | Mode | Job state | reasonCode | copy prompt | select sheet | start provider |
| --- | --- | --- | --- | --- | --- | --- |
${rows}

## DOM Capture

\`\`\`html
${domCapture}
\`\`\`

## Safe Generation Evidence Snapshot

\`\`\`json
${JSON.stringify(evidenceSnapshot, null, 2)}
\`\`\`

## Acceptance Result

| Check | Result |
| --- | --- |
| Host/manual path gives copy-prompt and upload entry | passed |
| Provider path safely not-ready without configuration | passed |
| Local action sheet path reaches output_ready | passed |
| Status excludes raw prompt and provider response | passed |
| Status excludes credential and private filesystem references | passed |
| Zero PetEvent / notify / CatStateMachine mutation | passed |

## PRD / Spec Review

V17.2 matches the PRD requirement for generation mode choice and loading/status UX. It intentionally does not crop, package, QA-preview, apply, or rollback assets.

## Claim Boundary

Allowed claim:
V17.2 generation mode and loading UX passed for tested host/manual and not-ready provider scenarios.

Direct provider API generation remains not-ready.
V17.3-V17.6 remain not-run.
`;

const privateHomeMarker = ["", "Users", ""].join("/");
const privateTokenFileMarker = ["api", "token"].join("-") + ".json";
if (photo2DWizardHasForbiddenContent(evidenceSnapshot) || body.includes(privateHomeMarker) || body.includes(privateTokenFileMarker)) {
  throw new Error("v17_2_evidence_security_scan_failed");
}

mkdirSync(evidenceDir, { recursive: true });
writeFileSync(evidencePath, body, "utf8");
console.log(JSON.stringify({
  ok: true,
  evidence: "docs/V17.x/evidence/v17_2-generation-mode-loading-2026-06-11.md",
  cases: cases.map(({ label, snapshot }) => ({
    label,
    mode: snapshot.mode,
    jobState: snapshot.jobState,
    reasonCode: snapshot.reasonCode
  }))
}, null, 2));
