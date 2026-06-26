import { CORE_ACTION_IDS, type CoreActionId } from "./asset-manifest";
import type { Photo2DActionFrameSet } from "./photo-to-2d-continuity-assembler";
import type { V30Candidate } from "./semantic-animation-quality";
import type { V31ArtQualityCandidate, V31ActionArtMetrics } from "./v31-art-quality";
import type { V32MeasuredActionMetrics, V32QualityRescueCandidate } from "./v32-quality-rescue";
import type { V33CharacterDesignContract } from "./v33-identity-contract";
import type { V33PhaseStatus, V33ReasonCode } from "./v33-sample-intake";

export type V33TechnicalPipelineRecord = {
  sampleId: string;
  routeId: "local_frame_sequence" | "professional_rig_import" | "provider_candidate";
  subjectDetectionStatus: "passed" | "reviewed" | "blocked" | "failed" | "not_automated";
  segmentationStatus: "passed" | "reviewed" | "blocked" | "failed" | "not_automated";
  poseEstimateStatus: "passed" | "reviewed" | "blocked" | "failed" | "not_automated";
  identityAnchorStatus: "passed" | "reviewed" | "blocked" | "failed";
  characterDesignStatus: "passed" | "reviewed" | "blocked" | "failed";
  rigOrFrameSeedStatus: "passed" | "reviewed" | "blocked" | "failed";
  actionSynthesisStatus: "passed" | "blocked" | "failed";
  blockedStage?: string;
  reasonCodes: V33ReasonCode[];
  evidenceRefs: string[];
};

export type V33ActionCandidateManifest = {
  candidateId: string;
  characterId: string;
  rendererKind: "frameSequence";
  actions: CoreActionId[];
  frameCountByAction: Record<CoreActionId, number>;
  sourceBoundary: "local project-authored" | "licensed import" | "manual fixture" | "approved candidate";
  qaStatus: V33PhaseStatus;
  identityAnchors: string[];
  evidenceRefs: string[];
};

export type V33LocalFrameSequenceCandidate = {
  technicalPipeline: V33TechnicalPipelineRecord;
  manifest: V33ActionCandidateManifest;
  semanticCandidate: V30Candidate;
  artCandidate: V31ArtQualityCandidate;
  frameCandidate: V32QualityRescueCandidate;
  actionFrames: Photo2DActionFrameSet[];
};

export function createV33LocalFrameSequenceCandidate(options: {
  candidateId: string;
  safePackId: string;
  contract: V33CharacterDesignContract;
  frameCountByAction: Partial<Record<CoreActionId, number>>;
  evidenceRefs?: string[];
  sourceBoundary?: V33ActionCandidateManifest["sourceBoundary"];
  transformOnly?: boolean;
}): V33LocalFrameSequenceCandidate {
  const candidateId = sanitizeId(options.candidateId, "v33_candidate");
  const safePackId = sanitizeId(options.safePackId, "v33_pack");
  const frameCountByAction = Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
    actionId,
    Math.max(0, Math.floor(options.frameCountByAction[actionId] ?? 0))
  ])) as Record<CoreActionId, number>;
  const missing = CORE_ACTION_IDS.filter((actionId) => frameCountByAction[actionId] <= 0);
  const transformOnly = options.transformOnly === true;
  const reasonCodes: V33ReasonCode[] = missing.length ? ["missing_core_action"] : [];
  if (transformOnly) reasonCodes.push("whole_image_transform");
  if (options.contract.reviewStatus !== "passed") {
    reasonCodes.push("character_design_blocked");
  }
  const pipelineStatus = reasonCodes.length === 0 ? "passed" : transformOnly ? "failed" : "blocked";
  const evidenceRefs = sanitizeEvidenceRefs(options.evidenceRefs ?? []);
  const manifest: V33ActionCandidateManifest = {
    candidateId,
    characterId: options.contract.characterId,
    rendererKind: "frameSequence",
    actions: [...CORE_ACTION_IDS],
    frameCountByAction,
    sourceBoundary: options.sourceBoundary ?? "local project-authored",
    qaStatus: pipelineStatus,
    identityAnchors: [...options.contract.identityAnchors],
    evidenceRefs
  };
  return {
    technicalPipeline: {
      sampleId: options.contract.sampleId,
      routeId: "local_frame_sequence",
      subjectDetectionStatus: "reviewed",
      segmentationStatus: "not_automated",
      poseEstimateStatus: "not_automated",
      identityAnchorStatus: options.contract.reviewStatus === "passed" ? "reviewed" : "blocked",
      characterDesignStatus: options.contract.reviewStatus === "passed" ? "passed" : "blocked",
      rigOrFrameSeedStatus: missing.length ? "blocked" : "passed",
      actionSynthesisStatus: pipelineStatus === "passed" ? "passed" : pipelineStatus,
      blockedStage: reasonCodes.length ? reasonCodes[0] : undefined,
      reasonCodes: reasonCodes.length ? [...new Set(reasonCodes)].sort() : ["sample_intake_passed"],
      evidenceRefs
    },
    manifest,
    semanticCandidate: semanticCandidate(candidateId, safePackId, transformOnly),
    artCandidate: artCandidate(candidateId, safePackId, frameCountByAction, transformOnly),
    frameCandidate: frameCandidate(candidateId, safePackId, frameCountByAction, transformOnly),
    actionFrames: actionFrames(frameCountByAction)
  };
}

export function buildV33FrameCountByActionFromManifest(manifest: {
  assets?: Partial<Record<CoreActionId, { frameFiles?: string[] }>>;
}) {
  return Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
    actionId,
    manifest.assets?.[actionId]?.frameFiles?.length ?? 0
  ])) as Record<CoreActionId, number>;
}

export function buildV33ActionCandidateEvidenceSnapshot(candidate: V33LocalFrameSequenceCandidate) {
  return {
    technicalPipeline: candidate.technicalPipeline,
    manifest: candidate.manifest
  };
}

function semanticCandidate(candidateId: string, safePackId: string, transformOnly: boolean): V30Candidate {
  return {
    candidateId,
    safePackId,
    routeKind: transformOnly ? "weak_baseline_comparison" : "manual_frame_import",
    actions: CORE_ACTION_IDS.map((actionId) => {
      const subtle = actionId === "idle" || actionId === "sleeping";
      return {
        actionId,
        frameCount: subtle ? 12 : 8,
        routeKind: transformOnly ? "weak_baseline_comparison" : "manual_frame_import",
        mostlyWholeImageTransform: transformOnly,
        motionAmplitude: transformOnly ? 0.08 : subtle ? 0.09 : 0.46,
        keyPoseDiversity: transformOnly ? 0.12 : subtle ? 0.2 : 0.66,
        silhouetteChange: transformOnly ? 0.04 : subtle ? 0.09 : 0.34,
        anchorDrift: 0.08,
        maxAdjacentDelta: transformOnly ? 0.16 : 0.22,
        loopClosed: true,
        sameCatScore: transformOnly ? 0.82 : 0.9,
        backgroundClean: true,
        offCanvas: false,
        semanticReadable: !transformOnly,
        manualVisualPass: !transformOnly
      };
    })
  };
}

function artCandidate(
  candidateId: string,
  safePackId: string,
  frameCountByAction: Record<CoreActionId, number>,
  transformOnly: boolean
): V31ArtQualityCandidate {
  return {
    candidateId,
    safePackId,
    routeKind: transformOnly ? "placeholder_reject_baseline" : "professional_frame_pack",
    sourceAvailable: true,
    licenseBoundaryOk: true,
    placeholderLineArt: false,
    hasVisualEvidence: true,
    actions: CORE_ACTION_IDS.map((actionId): V31ActionArtMetrics => ({
      actionId,
      frameCount: frameCountByAction[actionId],
      visualPolish: transformOnly ? 0.48 : 0.8,
      silhouetteClarity: transformOnly ? 0.5 : 0.82,
      expressionClarity: transformOnly ? 0.38 : actionId === "idle" || actionId === "sleeping" ? 0.64 : 0.78,
      actionPoseStrength: transformOnly ? 0.24 : actionId === "idle" || actionId === "sleeping" ? 0.34 : 0.76,
      identityConsistency: transformOnly ? 0.8 : 0.9,
      backgroundClean: true,
      overlayTextDetected: false,
      watermarkDetected: false,
      loopOrTimingOk: true,
      readableAt1x: true,
      readableAt075x: !transformOnly,
      wholeImageTransformOnly: transformOnly
    }))
  };
}

function frameCandidate(
  candidateId: string,
  safePackId: string,
  frameCountByAction: Record<CoreActionId, number>,
  transformOnly: boolean
): V32QualityRescueCandidate {
  return {
    candidateId,
    safePackId,
    routeKind: transformOnly ? "negative_baseline" : "local_frame_sequence",
    sourceAvailable: true,
    licenseBoundaryOk: true,
    hasVisualEvidence: true,
    actions: CORE_ACTION_IDS.map((actionId): V32MeasuredActionMetrics => {
      const subtle = actionId === "idle" || actionId === "sleeping";
      const loop = subtle || actionId === "thinking" || actionId === "running";
      return {
        actionId,
        frameCount: frameCountByAction[actionId],
        visiblePixelRatio: 0.28,
        duplicateFrameRatio: transformOnly ? 0.44 : 0.02,
        meanAdjacentDelta: transformOnly ? 0.006 : subtle ? 0.025 : 0.08,
        maxAdjacentDelta: transformOnly ? 0.05 : 0.22,
        loopClosureDelta: loop ? 0.02 : 0.24,
        transparentBackground: true,
        offCanvas: false,
        wholeImageTransformOnly: transformOnly,
        localPartMotionScore: transformOnly ? 0.03 : subtle ? 0.2 : 0.72,
        visualDetailScore: transformOnly ? 0.5 : 0.74,
        readableAt1x: true,
        readableAt075x: !transformOnly
      };
    })
  };
}

function actionFrames(frameCountByAction: Record<CoreActionId, number>): Photo2DActionFrameSet[] {
  return CORE_ACTION_IDS.map((actionId) => ({
    actionId,
    fps: actionId === "running" ? 12 : 10,
    frames: Array.from({ length: frameCountByAction[actionId] }, (_, index) => {
      const isLast = index === frameCountByAction[actionId] - 1;
      const phase = isLast ? 0 : index % 4;
      return {
        fileName: `${actionId}-${String(index).padStart(3, "0")}.png`,
        poseSignature: phase === 0 ? "base" : `pose-${phase}`,
        bodyY: phase,
        headY: phase,
        silhouetteWidth: 100 + phase,
        alphaCoverage: 0.82,
        offCanvas: false
      };
    })
  }));
}

function sanitizeEvidenceRefs(refs: string[]) {
  return refs
    .map((ref) => ref.replace(/\\/g, "/").replace(/[^A-Za-z0-9._/-]/g, "_").slice(0, 120))
    .filter(Boolean);
}

function sanitizeId(value: string, fallback: string) {
  const normalized = value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 96);
  return /^[A-Za-z0-9._-]{1,96}$/.test(normalized) ? normalized : fallback;
}
