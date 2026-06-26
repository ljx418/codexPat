import type { Photo2DPreviewApplyInstance } from "./photo-to-2d-preview-apply-flow";
import {
  buildV26PackPreviewApplyEvidenceSnapshot,
  runV26PackPreviewApplyRollback
} from "./pack-preview-apply-rollback";
import type { Photo2DActionFrameSet } from "./photo-to-2d-continuity-assembler";
import type { V33ActionCandidateManifest } from "./v33-photo-action-pipeline";
import type { V33CandidateQaResult } from "./v33-action-candidate-gate";

export type V33ProductApplicationResult = {
  candidateId: string;
  targetInstanceId: string;
  previewStatus: string;
  applyStatus: string;
  rollbackStatus: string;
  previousPackRestored: boolean;
  failedCandidateBlocked: boolean;
  diagnosticsSafe: boolean;
  evidenceSnapshot: ReturnType<typeof buildV26PackPreviewApplyEvidenceSnapshot>;
};

export function runV33ProductizedPhotoFlow(options: {
  manifest: V33ActionCandidateManifest;
  qa: V33CandidateQaResult;
  userApproved: boolean;
  actionFrames: Photo2DActionFrameSet[];
  targetInstanceId: string;
  instances: Photo2DPreviewApplyInstance[];
}): V33ProductApplicationResult {
  const previewApply = runV26PackPreviewApplyRollback({
    v25Accepted: options.qa.overallStatus === "passed" && options.manifest.qaStatus === "passed",
    userApproved: options.userApproved,
    generatedPackId: options.manifest.candidateId,
    displayName: `${options.manifest.candidateId} V33 candidate`,
    actionFrames: options.actionFrames,
    targetInstanceId: options.targetInstanceId,
    instances: options.instances
  });
  const snapshot = buildV26PackPreviewApplyEvidenceSnapshot(previewApply);
  return {
    candidateId: options.manifest.candidateId,
    targetInstanceId: options.targetInstanceId,
    previewStatus: previewApply.preview.status,
    applyStatus: previewApply.applyResult.status,
    rollbackStatus: previewApply.rollbackResult.status,
    previousPackRestored: previewApply.rollbackResult.defaultPetUnchanged && previewApply.rollbackResult.unrelatedPetsUnchanged,
    failedCandidateBlocked: options.qa.overallStatus === "passed" ? previewApply.status !== "passed" : previewApply.status === "blocked",
    diagnosticsSafe: !JSON.stringify(snapshot).match(/Authorization|api-token\.json|raw payload|raw photo|workspace path|config path|exif|gps|[A-Za-z]:[\\/]/i),
    evidenceSnapshot: snapshot
  };
}
