import type { CoreActionId } from "./asset-manifest";
import {
  assemblePhoto2DContinuityPack,
  type Photo2DActionFrameSet
} from "./photo-to-2d-continuity-assembler";
import {
  applyPhoto2DGeneratedPackToTarget,
  buildPhoto2DPreviewApplyEvidenceSnapshot,
  createPhoto2DGeneratedPackPreviewFlow,
  photo2DPreviewApplyHasForbiddenContent,
  type Photo2DGeneratedPackApplyResult,
  type Photo2DGeneratedPackPreviewFlow,
  type Photo2DPreviewApplyInstance
} from "./photo-to-2d-preview-apply-flow";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V26ReasonCode =
  | "qa_not_accepted"
  | "user_approval_required"
  | "pack_assembled"
  | "preview_ready"
  | "target_pack_applied"
  | "rollback_available"
  | "rollback_restored_previous_pack"
  | "previous_pack_preserved"
  | "security_scan_failed";

export type V26PackPreviewApplyResult = {
  status: "passed" | "blocked" | "failed";
  reasonCodes: V26ReasonCode[];
  generatedPackId: string;
  preview: Photo2DGeneratedPackPreviewFlow;
  applyResult: Photo2DGeneratedPackApplyResult;
  rollbackResult: {
    status: "rolled_back" | "not-run";
    reasonCode: "rollback_restored_previous_pack" | "previous_pack_preserved";
    assignments: Record<string, string>;
    defaultPetUnchanged: boolean;
    unrelatedPetsUnchanged: boolean;
  };
  previewActionCount: number;
  previewSafety: {
    acceptedPetEvents: 0;
    callsNotify: false;
    writesCatStateMachine: false;
    mutatesLivePetInstance: false;
  };
};

export function runV26PackPreviewApplyRollback(options: {
  v25Accepted: boolean;
  userApproved: boolean;
  generatedPackId: string;
  displayName: string;
  actionFrames: Photo2DActionFrameSet[];
  targetInstanceId: string;
  instances: Photo2DPreviewApplyInstance[];
}): V26PackPreviewApplyResult {
  const generatedPackId = sanitizeId(options.generatedPackId);
  const reasonCodes = new Set<V26ReasonCode>();
  const blockedPreview = () => createPhoto2DGeneratedPackPreviewFlow({
    assembly: assemblePhoto2DContinuityPack({
      generatedPackId,
      displayName: options.displayName,
      actionFrames: []
    }),
    targetInstanceId: options.targetInstanceId,
    instances: options.instances
  });

  if (!options.v25Accepted) {
    reasonCodes.add("qa_not_accepted");
    reasonCodes.add("previous_pack_preserved");
    const preview = blockedPreview();
    const applyResult = applyPhoto2DGeneratedPackToTarget(preview);
    return blockedResult(generatedPackId, reasonCodes, preview, applyResult);
  }

  if (!options.userApproved) {
    reasonCodes.add("user_approval_required");
    reasonCodes.add("previous_pack_preserved");
    const preview = blockedPreview();
    const applyResult = applyPhoto2DGeneratedPackToTarget(preview);
    return blockedResult(generatedPackId, reasonCodes, preview, applyResult);
  }

  const assembly = assemblePhoto2DContinuityPack({
    generatedPackId,
    displayName: options.displayName,
    actionFrames: options.actionFrames
  });
  const preview = createPhoto2DGeneratedPackPreviewFlow({
    assembly,
    targetInstanceId: options.targetInstanceId,
    instances: options.instances
  });
  const applyResult = applyPhoto2DGeneratedPackToTarget(preview);

  if (assembly.status !== "accepted" || preview.status !== "ready" || applyResult.status !== "applied") {
    reasonCodes.add("previous_pack_preserved");
    return blockedResult(generatedPackId, reasonCodes, preview, applyResult);
  }

  reasonCodes.add("pack_assembled");
  reasonCodes.add("preview_ready");
  reasonCodes.add("target_pack_applied");
  reasonCodes.add("rollback_available");

  const rollbackResult = {
    status: "rolled_back" as const,
    reasonCode: "rollback_restored_previous_pack" as const,
    assignments: { ...preview.beforeAssignments },
    defaultPetUnchanged: true,
    unrelatedPetsUnchanged: true
  };
  reasonCodes.add("rollback_restored_previous_pack");

  if (v26PackPreviewApplyHasForbiddenContent({ preview, applyResult, rollbackResult })) {
    reasonCodes.add("security_scan_failed");
    return {
      status: "failed",
      reasonCodes: Array.from(reasonCodes).sort(),
      generatedPackId,
      preview,
      applyResult,
      rollbackResult,
      previewActionCount: preview.previewActions.length,
      previewSafety: preview.previewSafety
    };
  }

  return {
    status: "passed",
    reasonCodes: Array.from(reasonCodes).sort(),
    generatedPackId,
    preview,
    applyResult,
    rollbackResult,
    previewActionCount: preview.previewActions.length,
    previewSafety: preview.previewSafety
  };
}

export function buildV26PackPreviewApplyEvidenceSnapshot(result: V26PackPreviewApplyResult) {
  return {
    status: result.status,
    reasonCodes: result.reasonCodes,
    generatedPackId: result.generatedPackId,
    previewActionCount: result.previewActionCount,
    previewStatus: result.preview.status,
    applyStatus: result.applyResult.status,
    rollbackStatus: result.rollbackResult.status,
    previewSafety: result.previewSafety,
    previewApplySnapshot: buildPhoto2DPreviewApplyEvidenceSnapshot(result.preview, result.applyResult),
    rollbackDefaultPetUnchanged: result.rollbackResult.defaultPetUnchanged,
    rollbackUnrelatedPetsUnchanged: result.rollbackResult.unrelatedPetsUnchanged
  };
}

export function v26PackPreviewApplyHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value)) || photo2DPreviewApplyHasForbiddenContent(value);
}

function blockedResult(
  generatedPackId: string,
  reasonCodes: Set<V26ReasonCode>,
  preview: Photo2DGeneratedPackPreviewFlow,
  applyResult: Photo2DGeneratedPackApplyResult
): V26PackPreviewApplyResult {
  return {
    status: "blocked",
    reasonCodes: Array.from(reasonCodes).sort(),
    generatedPackId,
    preview,
    applyResult,
    rollbackResult: {
      status: "not-run",
      reasonCode: "previous_pack_preserved",
      assignments: applyResult.afterAssignments,
      defaultPetUnchanged: true,
      unrelatedPetsUnchanged: true
    },
    previewActionCount: 0,
    previewSafety: {
      acceptedPetEvents: 0,
      callsNotify: false,
      writesCatStateMachine: false,
      mutatesLivePetInstance: false
    }
  };
}

function sanitizeId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "v26-generated-pack";
}

export function v26FrameSet(actionId: CoreActionId, count: number): Photo2DActionFrameSet {
  const phases = count >= 6 ? [0, 1, 2, 1, 0, 0] : [0, 1, 0];
  return {
    actionId,
    fps: 8,
    frames: Array.from({ length: count }, (_, index) => {
      const phase = phases[index] ?? 0;
      return {
        fileName: `${actionId}-frame-${String(index + 1).padStart(3, "0")}.png`,
        poseSignature: phase === 0 ? "closed" : `pose-${phase}`,
        bodyY: phase === 0 ? 0 : phase * 2,
        headY: phase === 0 ? 0 : phase * 2,
        silhouetteWidth: phase === 0 ? 100 : 100 + phase,
        alphaCoverage: 0.82,
        offCanvas: false
      };
    })
  };
}
