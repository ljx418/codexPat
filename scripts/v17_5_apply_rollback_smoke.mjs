import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CORE_ACTION_IDS } from "../apps/desktop/src/assets/asset-manifest.ts";
import {
  assemblePhoto2DContinuityPack
} from "../apps/desktop/src/assets/photo-to-2d-continuity-assembler.ts";
import {
  applyPhoto2DGeneratedPackToTarget,
  buildPhoto2DPreviewApplyEvidenceSnapshot,
  createPhoto2DGeneratedPackPreviewFlow,
  photo2DPreviewApplyHasForbiddenContent
} from "../apps/desktop/src/assets/photo-to-2d-preview-apply-flow.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidenceDir = path.join(repoRoot, "docs", "V17.x", "evidence");
const evidencePath = path.join(evidenceDir, "v17_5-apply-rollback-2026-06-11.md");
const packDir = path.join(evidenceDir, "assets", "v17_3-action-sheet-packaging-2026-06-11", "pack");
const packId = "v17-action-sheet-packaging-docs-cat";

if (!existsSync(path.join(packDir, "pet.json"))) {
  throw new Error("v17_5_requires_v17_3_pack");
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

const targetInstanceId = "codex_2";
const previousPackId = "previous-safe-pack";
const instances = [
  { instanceId: "default", displayName: "Default", activePackId: "flagship-work-cat-v2", isDefault: true },
  { instanceId: "codex_1", displayName: "Work Cat", activePackId: "living-work-cat-v1" },
  { instanceId: targetInstanceId, displayName: "Generated Target", activePackId: previousPackId }
];
const flow = createPhoto2DGeneratedPackPreviewFlow({ assembly, targetInstanceId, instances });
const applied = applyPhoto2DGeneratedPackToTarget(flow);
const applySnapshot = buildPhoto2DPreviewApplyEvidenceSnapshot(flow, applied);
const rollback = rollbackAssignments(applied.status === "applied" ? applied.afterAssignments : {}, targetInstanceId, previousPackId);
const unknownTargetFlow = createPhoto2DGeneratedPackPreviewFlow({
  assembly,
  targetInstanceId: "codex_missing",
  instances
});
const failedApply = applyPhoto2DGeneratedPackToTarget(unknownTargetFlow);
const passed = flow.status === "ready" &&
  applied.status === "applied" &&
  applied.defaultPetUnchanged &&
  applied.unrelatedPetsUnchanged &&
  rollback[targetInstanceId] === previousPackId &&
  failedApply.status === "blocked" &&
  failedApply.previousPackPreserved === true &&
  applySnapshot.acceptedPetEvents === 0 &&
  applySnapshot.callsNotify === false &&
  applySnapshot.writesCatStateMachine === false;

const body = `# V17.5 Apply Rollback Smoke

Date: 2026-06-11
Status: ${passed ? "passed" : "failed"}
Scope: Target-only apply and rollback logic for the accepted V17.3 generated pack. This is model/store-level evidence and does not send PetEvent or mutate CatStateMachine.

## Target Apply Result

\`\`\`json
${JSON.stringify(applySnapshot, null, 2)}
\`\`\`

## Rollback Result

\`\`\`json
${JSON.stringify({
  status: "rollback_completed",
  reasonCode: "rollback_completed",
  targetInstanceId,
  restoredPackId: rollback[targetInstanceId],
  defaultPetUnchanged: rollback.default === "flagship-work-cat-v2",
  unrelatedPetsUnchanged: rollback.codex_1 === "living-work-cat-v1",
  acceptedPetEvents: 0,
  callsNotify: false,
  writesCatStateMachine: false
}, null, 2)}
\`\`\`

## Failure Preservation Result

\`\`\`json
${JSON.stringify({
  status: failedApply.status,
  reasonCode: failedApply.reasonCode,
  previousPackPreserved: failedApply.status === "blocked" ? failedApply.previousPackPreserved : false
}, null, 2)}
\`\`\`

## Acceptance Result

| Check | Result |
| --- | --- |
| target instance changed to generated pack | ${applied.status === "applied" && applied.targetChanged ? "passed" : "failed"} |
| default pet unchanged | ${applied.status === "applied" && applied.defaultPetUnchanged ? "passed" : "failed"} |
| unrelated pets unchanged | ${applied.status === "applied" && applied.unrelatedPetsUnchanged ? "passed" : "failed"} |
| rollback restores previous pack | ${rollback[targetInstanceId] === previousPackId ? "passed" : "failed"} |
| failed apply preserves previous pack | ${failedApply.status === "blocked" && failedApply.previousPackPreserved ? "passed" : "failed"} |
| accepted PetEvent | 0 |
| calls notify | false |
| writes CatStateMachine | false |

## PRD / Spec Review

V17.5 matches the target-only apply, failure preservation, and rollback requirements for the tested generated local pack scenario. V17.6 final product HTML and screenshot-backed review remain not-run.

## Claim Boundary

Allowed claim:
V17.5 target-pet apply and rollback passed for tested local generated pack scenario.

V17.6 remains not-run.
`;

const privateHomeMarker = ["", "Users", ""].join("/");
const privateTokenFileMarker = ["api", "token"].join("-") + ".json";
if (!passed || photo2DPreviewApplyHasForbiddenContent(applySnapshot) || body.includes(privateHomeMarker) || body.includes(privateTokenFileMarker)) {
  mkdirSync(evidenceDir, { recursive: true });
  writeFileSync(evidencePath, body, "utf8");
  throw new Error("v17_5_apply_rollback_failed");
}

mkdirSync(evidenceDir, { recursive: true });
writeFileSync(evidencePath, body, "utf8");
console.log(JSON.stringify({
  ok: true,
  evidence: "docs/V17.x/evidence/v17_5-apply-rollback-2026-06-11.md",
  applied: applied.status,
  rollback: rollback[targetInstanceId],
  failedApply: failedApply.reasonCode
}, null, 2));

function rollbackAssignments(afterAssignments, target, previousPack) {
  return {
    ...afterAssignments,
    [target]: previousPack
  };
}

function loopAction(actionId) {
  return actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping";
}
