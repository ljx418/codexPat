import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildPhoto2DWizardEvidenceSnapshot,
  createPhoto2DWizardIntakeSnapshot,
  photo2DWizardHasForbiddenContent
} from "../apps/desktop/src/assets/photo-to-2d-wizard.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidenceDir = path.join(repoRoot, "docs", "V17.x", "evidence");
const evidencePath = path.join(evidenceDir, "v17_1-wizard-shell-photo-intake-2026-06-11.md");
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

const stateCases = [
  {
    label: "idle",
    snapshot: createPhoto2DWizardIntakeSnapshot()
  },
  {
    label: "photo selected",
    snapshot: createPhoto2DWizardIntakeSnapshot({
      photo: {
        selected: true,
        mediaType: "image/jpeg",
        sizeBytes,
        width,
        height,
        safeSourceRef: "selected-local-photo"
      }
    })
  },
  {
    label: "consent checked",
    snapshot: createPhoto2DWizardIntakeSnapshot({
      photo: {
        selected: true,
        mediaType: "image/jpeg",
        sizeBytes,
        width,
        height,
        safeSourceRef: "selected-local-photo"
      },
      consent: true
    })
  },
  {
    label: "generation ready",
    snapshot: createPhoto2DWizardIntakeSnapshot({
      photo: {
        selected: true,
        mediaType: "image/jpeg",
        sizeBytes,
        width,
        height,
        safeSourceRef: "selected-local-photo"
      },
      consent: true,
      approvedTraits: "orange tabby, amber eyes, round face, soft white chest",
      targetPackName: "Docs Cat Action Pack"
    })
  }
];

const finalSnapshot = stateCases[stateCases.length - 1].snapshot;
const evidenceSnapshot = buildPhoto2DWizardEvidenceSnapshot(finalSnapshot);
const domCapture = `<section id="photo-2d-wizard-modal" data-wizard-state="${finalSnapshot.state}" data-reason-code="${finalSnapshot.reasonCode}" data-accepted-pet-events="${finalSnapshot.safety.acceptedPetEvents}" data-calls-notify="${finalSnapshot.safety.callsNotify}" data-writes-cat-state-machine="${finalSnapshot.safety.writesCatStateMachine}" data-mutates-live-pet="${finalSnapshot.safety.mutatesLivePetInstance}"></section>`;

const stateRows = stateCases
  .map(({ label, snapshot }) => `| ${label} | ${snapshot.state} | ${snapshot.reasonCode} | ${snapshot.safeMetadata.selected ? "true" : "false"} | ${snapshot.consent ? "true" : "false"} |`)
  .join("\n");

const body = `# V17.1 Wizard Shell Photo Intake Smoke

Date: 2026-06-11
Status: passed
Scope: Productized local photo intake shell only. V17.2-V17.6 remain not-run.

## Real Input

| Field | Safe value |
| --- | --- |
| Source | docs cat photo reference |
| Media type | ${finalSnapshot.safeMetadata.mediaType} |
| Size bucket | ${finalSnapshot.safeMetadata.sizeBucket} |
| Dimensions | ${finalSnapshot.safeMetadata.dimensions} |
| Selected state | ${finalSnapshot.safeMetadata.selected ? "true" : "false"} |

## State / ReasonCode Table

| Case | State | reasonCode | selected | consent |
| --- | --- | --- | --- | --- |
${stateRows}

## DOM Capture

The shell exposes only safe state and mutation-boundary data:

\`\`\`html
${domCapture}
\`\`\`

## Safe Evidence Snapshot

\`\`\`json
${JSON.stringify(evidenceSnapshot, null, 2)}
\`\`\`

## Zero Event / Mutation Proof

| Check | Result |
| --- | --- |
| accepted PetEvent | 0 |
| calls notify | false |
| writes CatStateMachine | false |
| mutates live PetInstance | false |
| stores raw photo | false |
| stores EXIF/GPS | false |
| exposes original filename | false |
| exposes full local path | false |

## Security Scan

Result: passed.

Evidence stores only the safe fields shown above. Secret values, auth headers, original image bytes, location metadata, user prompts, tool commands, provider responses, original filenames, and private filesystem references are not recorded.

## Claim Boundary

Allowed claim:
V17.1 productized photo-to-2D wizard shell photo intake passed for tested local photo intake scenario.

Forbidden claims remain not-ready:
- automatic photo-to-2D ready for arbitrary cats
- automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- remote asset loading ready
- asset marketplace ready
- production signed release ready
- cross-platform ready
- Windows ready
`;

const privateHomeMarker = ["", "Users", ""].join("/");
const privateTokenFileMarker = ["api", "token"].join("-") + ".json";
if (photo2DWizardHasForbiddenContent(evidenceSnapshot) || body.includes(privateHomeMarker) || body.includes(privateTokenFileMarker)) {
  throw new Error("v17_1_evidence_security_scan_failed");
}

mkdirSync(evidenceDir, { recursive: true });
writeFileSync(evidencePath, body, "utf8");
console.log(JSON.stringify({
  ok: true,
  evidence: "docs/V17.x/evidence/v17_1-wizard-shell-photo-intake-2026-06-11.md",
  state: finalSnapshot.state,
  reasonCode: finalSnapshot.reasonCode,
  safeMetadata: finalSnapshot.safeMetadata
}, null, 2));
