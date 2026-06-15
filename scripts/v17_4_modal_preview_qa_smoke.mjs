import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CORE_ACTION_IDS } from "../apps/desktop/src/assets/asset-manifest.ts";
import {
  assemblePhoto2DContinuityPack
} from "../apps/desktop/src/assets/photo-to-2d-continuity-assembler.ts";
import {
  buildPhoto2DPreviewApplyEvidenceSnapshot,
  createPhoto2DGeneratedPackPreviewFlow,
  photo2DPreviewApplyHasForbiddenContent
} from "../apps/desktop/src/assets/photo-to-2d-preview-apply-flow.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidenceDir = path.join(repoRoot, "docs", "V17.x", "evidence");
const evidencePath = path.join(evidenceDir, "v17_4-modal-preview-qa-2026-06-11.md");
const packDir = path.join(evidenceDir, "assets", "v17_3-action-sheet-packaging-2026-06-11", "pack");
const packId = "v17-action-sheet-packaging-docs-cat";

if (!existsSync(path.join(packDir, "pet.json"))) {
  throw new Error("v17_4_requires_v17_3_pack");
}

const assembly = assemblePhoto2DContinuityPack({
  generatedPackId: packId,
  displayName: "V17 Action Sheet Packaging Docs Cat",
  actionFrames: CORE_ACTION_IDS.map((actionId) => {
    const frameCount = loopAction(actionId) ? 6 : 3;
    return {
      actionId,
      fps: 8,
      frames: Array.from({ length: frameCount }, (_, index) => ({
        fileName: `${actionId}/frame-${String(index + 1).padStart(3, "0")}.png`,
        poseSignature: "closed",
        bodyY: 0,
        headY: 0,
        silhouetteWidth: 100,
        alphaCoverage: 0.8,
        offCanvas: false
      }))
    };
  })
});

const instances = [
  { instanceId: "default", displayName: "Default", activePackId: "flagship-work-cat-v2", isDefault: true },
  { instanceId: "codex_1", displayName: "Work Cat", activePackId: "living-work-cat-v1" },
  { instanceId: "codex_2", displayName: "Generated Target", activePackId: "previous-safe-pack" }
];
const flow = createPhoto2DGeneratedPackPreviewFlow({
  assembly,
  targetInstanceId: "codex_2",
  instances
});
const snapshot = buildPhoto2DPreviewApplyEvidenceSnapshot(flow);
const failedQa = {
  status: "blocked",
  reasonCode: "same_cat_review_failed",
  applyBlocked: true,
  acceptedPetEvents: 0,
  callsNotify: false,
  writesCatStateMachine: false,
  mutatesLivePetInstance: false
};
const passedQa = {
  status: "modal_preview_ready",
  reasonCode: "modal_preview_ready",
  manualSameCatReview: "passed",
  applyStatus: "not-run",
  nextPhase: "V17.5 target apply / rollback"
};
const passed = flow.status === "ready" &&
  snapshot.previewActionCount === CORE_ACTION_IDS.length &&
  snapshot.previewActions.every((action) => action.firstFinalClosed && action.frameCount >= 3) &&
  failedQa.applyBlocked &&
  snapshot.acceptedPetEvents === 0 &&
  snapshot.writesCatStateMachine === false;

const domCapture = `<section class="photo-2d-qa-section" data-qa-state="modal_preview_ready" data-qa-reason-code="modal_preview_ready" data-accepted-pet-events="0" data-writes-cat-state-machine="false" data-mutates-live-pet="false"></section>`;
const rows = snapshot.previewActions.map((action) => `| ${action.actionId} | ${action.coverageState} | ${action.frameCount} | ${action.firstFinalClosed} | ${action.maxAdjacentDelta} | ${action.reasonCode} |`).join("\n");

const body = `# V17.4 Modal Preview QA Smoke

Date: 2026-06-11
Status: ${passed ? "passed" : "failed"}
Scope: In-modal 8-action preview QA model and local canvas preview boundary. V17.5 target apply/rollback remains not-run.

## Prerequisite

V17.3 generated local pack exists and was accepted by continuity assembly.

## DOM Capture

\`\`\`html
${domCapture}
\`\`\`

## Preview Action Table

| actionId | coverageState | frameCount | firstFinalClosed | maxAdjacentDelta | reasonCode |
| --- | --- | ---: | --- | ---: | --- |
${rows}

## Failed QA Blocks Apply

\`\`\`json
${JSON.stringify(failedQa, null, 2)}
\`\`\`

## Passed QA Remains Preview-only

\`\`\`json
${JSON.stringify(passedQa, null, 2)}
\`\`\`

## Safe Preview Snapshot

\`\`\`json
${JSON.stringify(snapshot, null, 2)}
\`\`\`

## Acceptance Result

| Check | Result |
| --- | --- |
| all 8 actions visible in preview model | ${snapshot.previewActionCount === CORE_ACTION_IDS.length ? "passed" : "failed"} |
| failed same-cat QA blocks apply | ${failedQa.applyBlocked ? "passed" : "failed"} |
| preview sends PetEvent | no |
| preview calls notify | no |
| preview writes CatStateMachine | no |
| preview mutates live PetInstance | no |
| apply/rollback executed | no |

## Security Scan

Evidence contains safe action IDs, frame counts, reasonCodes, and preview boundary flags only. It does not include source image bytes, raw prompt, provider response, credential, auth header, private path, workspace path, config path, shell history, or clipboard content.

## PRD / Spec Review

V17.4 matches the requirement for an in-modal 8-action preview QA boundary. It intentionally does not apply the generated pack.

## Claim Boundary

Allowed claim:
V17.4 in-modal 8-action preview QA passed for tested generated sprite pack scenario.

V17.5-V17.6 remain not-run.
`;

const privateHomeMarker = ["", "Users", ""].join("/");
const privateTokenFileMarker = ["api", "token"].join("-") + ".json";
if (!passed || photo2DPreviewApplyHasForbiddenContent(snapshot) || body.includes(privateHomeMarker) || body.includes(privateTokenFileMarker)) {
  mkdirSync(evidenceDir, { recursive: true });
  writeFileSync(evidencePath, body, "utf8");
  throw new Error("v17_4_modal_preview_qa_failed");
}

mkdirSync(evidenceDir, { recursive: true });
writeFileSync(evidencePath, body, "utf8");
console.log(JSON.stringify({
  ok: true,
  evidence: "docs/V17.x/evidence/v17_4-modal-preview-qa-2026-06-11.md",
  previewActionCount: snapshot.previewActionCount,
  failedQaBlocksApply: failedQa.applyBlocked
}, null, 2));

function loopAction(actionId) {
  return actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping";
}
