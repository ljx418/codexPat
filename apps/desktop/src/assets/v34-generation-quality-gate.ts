import { CORE_ACTION_IDS } from "./asset-manifest";
import type { CoreActionId } from "./asset-manifest";
import { buildV33CandidateQaEvidenceSnapshot, runV33CandidateQa, type V33CandidateQaResult } from "./v33-action-candidate-gate";
import type { Photo2DActionFrameSet, Photo2DFrameMetadata } from "./photo-to-2d-continuity-assembler";
import { runV33ProductizedPhotoFlow, type V33ProductApplicationResult } from "./v33-productized-photo-flow";
import type { Photo2DPreviewApplyInstance } from "./photo-to-2d-preview-apply-flow";
import type { V33ActionCandidateManifest } from "./v33-photo-action-pipeline";
import type { V33PhaseStatus } from "./v33-sample-intake";
import {
  V34_TARGET_ACTION_IDS,
  type V34GeneratedActionPack,
  type V34SynthesisReasonCode,
  v34RigFrameSynthesisHasForbiddenContent
} from "./v34-rig-frame-synthesis";

export type V34GenerationQaResult = {
  candidateId: string;
  sampleId: string;
  generationChainStatus: V33PhaseStatus;
  semanticQa: ReturnType<typeof buildV33CandidateQaEvidenceSnapshot>["semanticQa"];
  artQa: ReturnType<typeof buildV33CandidateQaEvidenceSnapshot>["artQa"];
  frameQa: ReturnType<typeof buildV33CandidateQaEvidenceSnapshot>["frameQa"];
  identityQa: ReturnType<typeof buildV33CandidateQaEvidenceSnapshot>["identityQa"];
  overallStatus: V33PhaseStatus;
  reasonCodes: V34SynthesisReasonCode[];
  repairGuidance: string[];
};

export type V34GenerationProductE2EResult = {
  candidateId: string;
  sampleId: string;
  characterAssetId: string;
  targetInstanceId: string;
  qaStatus: V33PhaseStatus;
  previewStatus: string;
  applyStatus: string;
  rollbackStatus: string;
  previousPackRestored: boolean;
  failedCandidateBlocked: boolean;
  diagnosticsSafe: boolean;
  runtimeManifest: V33ActionCandidateManifest;
  actionFrameCounts: Record<CoreActionId, number>;
  product: V33ProductApplicationResult;
};

export function runV34GenerationQualityGate(pack: V34GeneratedActionPack): V34GenerationQaResult {
  const v33Qa = runV33CandidateQa(pack.runtimeQaCandidates);
  const v33Snapshot = buildV33CandidateQaEvidenceSnapshot(v33Qa);
  const reasonCodes = new Set<V34SynthesisReasonCode>();
  for (const code of pack.reasonCodes) {
    if (code !== "sample_intake_passed") reasonCodes.add(code);
  }
  if (!V34_TARGET_ACTION_IDS.every((actionId) => pack.actions.includes(actionId))) reasonCodes.add("missing_core_action");
  if (!CORE_ACTION_IDS.every((actionId) => pack.runtimeCoreProjection.actions.includes(actionId))) reasonCodes.add("missing_core_action");
  if (pack.targetActionFrames.some((action) => action.mostlyWholeImageTransform)) reasonCodes.add("whole_image_transform");
  if (pack.targetActionFrames.some((action) => action.localPartMotionScore < 0.08)) reasonCodes.add("weak_motion");
  if (pack.runtimeCoreProjection.semanticEquivalenceClaimed !== false) reasonCodes.add("action_template_failed");
  if (!pack.contactSheetEvidenceRef || !pack.playbackEvidenceRef || !pack.manifestRef) reasonCodes.add("generation_chain_incomplete");
  if (v33Qa.reasonCodes.includes("whole_image_transform")) reasonCodes.add("whole_image_transform");
  if (v33Qa.reasonCodes.includes("weak_motion")) reasonCodes.add("weak_motion");
  if (v33Qa.reasonCodes.includes("missing_core_action")) reasonCodes.add("missing_core_action");
  if (v33Qa.reasonCodes.includes("identity_drift")) reasonCodes.add("same_pack_reuse_identity_drift");
  if (v33Qa.overallStatus !== "passed") reasonCodes.add("generation_chain_incomplete");
  if (v34RigFrameSynthesisHasForbiddenContent(pack)) reasonCodes.add("privacy_boundary_failed");

  const blocked = pack.status === "blocked" || reasonCodes.has("privacy_boundary_failed") || reasonCodes.has("character_asset_blocked") || reasonCodes.has("frame_seed_blocked");
  const failed = pack.status === "failed" || Array.from(reasonCodes).some((code) => code !== "sample_intake_passed");
  const overallStatus: V33PhaseStatus = blocked ? "blocked" : failed ? "failed" : "passed";
  return {
    candidateId: pack.candidateId,
    sampleId: pack.runtimeQaCandidates.identityGate.sampleId,
    generationChainStatus: pack.status,
    semanticQa: v33Snapshot.semanticQa,
    artQa: v33Snapshot.artQa,
    frameQa: v33Snapshot.frameQa,
    identityQa: v33Snapshot.identityQa,
    overallStatus,
    reasonCodes: reasonCodes.size === 0 ? ["sample_intake_passed"] : Array.from(reasonCodes).sort(),
    repairGuidance: overallStatus === "passed"
      ? ["Route A2 candidate is scoped acceptable for named samples only; compare Route B for higher visual quality before final acceptance."]
      : ["Repair Route A2 action mapping, local part motion, visual evidence, or switch to Route B professional assisted import."]
  };
}

export function runV34GenerationProductE2E(options: {
  pack: V34GeneratedActionPack;
  qa: V34GenerationQaResult;
  userApproved: boolean;
  targetInstanceId: string;
  instances: Photo2DPreviewApplyInstance[];
}): V34GenerationProductE2EResult {
  const v33Qa = runV33CandidateQa(options.pack.runtimeQaCandidates);
  const effectiveQa: V33CandidateQaResult = options.qa.overallStatus === "passed"
    ? v33Qa
    : {
      ...v33Qa,
      overallStatus: options.qa.overallStatus,
      reasonCodes: options.qa.reasonCodes as V33CandidateQaResult["reasonCodes"],
      repairGuidance: options.qa.repairGuidance
    };
  const runtimeManifest = buildV34RuntimeProductManifest(options.pack, options.qa);
  const actionFrames = options.qa.overallStatus === "passed"
    ? buildV34RuntimeActionFrames(options.pack)
    : [];
  const product = runV33ProductizedPhotoFlow({
    manifest: runtimeManifest,
    qa: effectiveQa,
    userApproved: options.userApproved,
    actionFrames,
    targetInstanceId: options.targetInstanceId,
    instances: options.instances
  });

  return {
    candidateId: options.pack.candidateId,
    sampleId: options.qa.sampleId,
    characterAssetId: options.pack.characterAssetId,
    targetInstanceId: options.targetInstanceId,
    qaStatus: options.qa.overallStatus,
    previewStatus: product.previewStatus,
    applyStatus: product.applyStatus,
    rollbackStatus: product.rollbackStatus,
    previousPackRestored: product.previousPackRestored,
    failedCandidateBlocked: product.failedCandidateBlocked,
    diagnosticsSafe: product.diagnosticsSafe,
    runtimeManifest,
    actionFrameCounts: runtimeManifest.frameCountByAction,
    product
  };
}

export function buildV34GenerationProductEvidenceSnapshot(results: V34GenerationProductE2EResult[]) {
  const passed = results.filter((result) => result.qaStatus === "passed");
  const failedOrBlocked = results.filter((result) => result.qaStatus !== "passed");
  return {
    results: results.map((result) => ({
      candidateId: result.candidateId,
      sampleId: result.sampleId,
      characterAssetId: result.characterAssetId,
      targetInstanceId: result.targetInstanceId,
      qaStatus: result.qaStatus,
      previewStatus: result.previewStatus,
      applyStatus: result.applyStatus,
      rollbackStatus: result.rollbackStatus,
      previousPackRestored: result.previousPackRestored,
      failedCandidateBlocked: result.failedCandidateBlocked,
      diagnosticsSafe: result.diagnosticsSafe,
      actionFrameCounts: result.actionFrameCounts
    })),
    passedCandidateCount: passed.length,
    previewReadyCount: passed.filter((result) => result.previewStatus === "ready").length,
    appliedCount: passed.filter((result) => result.applyStatus === "applied").length,
    rolledBackCount: passed.filter((result) => result.rollbackStatus === "rolled_back").length,
    blockedFailedCandidateCount: failedOrBlocked.filter((result) => result.failedCandidateBlocked).length,
    targetOnlyApplyPassed: passed.every((result) => result.product.evidenceSnapshot.previewApplySnapshot.targetChanged === true),
    rollbackPassed: passed.every((result) => result.previousPackRestored),
    diagnosticsSafe: results.every((result) => result.diagnosticsSafe)
  };
}

export function buildV34GenerationQaEvidenceSnapshot(result: V34GenerationQaResult) {
  return {
    candidateId: result.candidateId,
    sampleId: result.sampleId,
    generationChainStatus: result.generationChainStatus,
    overallStatus: result.overallStatus,
    reasonCodes: result.reasonCodes,
    semanticQa: result.semanticQa,
    artQa: result.artQa,
    frameQa: result.frameQa,
    identityQa: result.identityQa,
    repairGuidance: result.repairGuidance
  };
}

function buildV34RuntimeProductManifest(
  pack: V34GeneratedActionPack,
  qa: V34GenerationQaResult
): V33ActionCandidateManifest {
  const frameCountByAction = Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
    actionId,
    runtimeFrameCount(pack, actionId)
  ])) as Record<CoreActionId, number>;
  return {
    candidateId: pack.candidateId,
    characterId: pack.characterAssetId,
    rendererKind: "frameSequence",
    actions: [...CORE_ACTION_IDS],
    frameCountByAction,
    sourceBoundary: "local project-authored",
    qaStatus: qa.overallStatus,
    identityAnchors: pack.identityEvidence,
    evidenceRefs: [pack.manifestRef, pack.contactSheetEvidenceRef, pack.playbackEvidenceRef]
  };
}

function buildV34RuntimeActionFrames(pack: V34GeneratedActionPack): Photo2DActionFrameSet[] {
  return CORE_ACTION_IDS.map((actionId) => ({
    actionId,
    fps: actionId === "running" ? 12 : 10,
    frames: Array.from({ length: runtimeFrameCount(pack, actionId) }, (_, index) => frameMetadata(actionId, index, runtimeFrameCount(pack, actionId)))
  }));
}

function runtimeFrameCount(pack: V34GeneratedActionPack, actionId: CoreActionId) {
  return pack.targetActionFrames
    .filter((action) => action.runtimeCoreActionId === actionId)
    .reduce((max, action) => Math.max(max, action.frameCount), 0);
}

function frameMetadata(actionId: CoreActionId, index: number, count: number): Photo2DFrameMetadata {
  const phase = index === 0 || index === count - 1
    ? 0
    : [1, 2, 1, 0][(index - 1) % 4];
  return {
    fileName: `${actionId}-frame-${String(index + 1).padStart(3, "0")}.png`,
    poseSignature: phase === 0 ? "base" : `pose-${phase}`,
    bodyY: phase,
    headY: phase,
    silhouetteWidth: 100 + phase,
    alphaCoverage: 0.82,
    offCanvas: false
  };
}
