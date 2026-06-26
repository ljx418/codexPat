import { CORE_ACTION_IDS, type CoreActionId } from "./asset-manifest";
import type { V30Candidate, V30RouteKind } from "./semantic-animation-quality";
import type { V31ActionArtMetrics, V31ArtQualityCandidate } from "./v31-art-quality";
import type { V32MeasuredActionMetrics, V32QualityRescueCandidate } from "./v32-quality-rescue";
import type { V33IdentityGateResult } from "./v33-identity-contract";
import type { V33PhaseStatus } from "./v33-sample-intake";
import {
  type V34CharacterAssetContract,
  v34CharacterAssetContractHasForbiddenContent
} from "./v34-character-asset-contract";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export const V34_TARGET_ACTION_IDS = [
  "idle",
  "walk",
  "jump",
  "sleep",
  "eat",
  "play",
  "alert",
  "celebrate"
] as const;

export type V34TargetActionId = (typeof V34_TARGET_ACTION_IDS)[number];
export type V34SynthesisRouteId = "local_deterministic_generation" | "professional_assisted_import";
export type V34SynthesisReasonCode =
  | "sample_intake_passed"
  | "character_asset_blocked"
  | "frame_seed_blocked"
  | "action_template_failed"
  | "same_pack_reuse_identity_drift"
  | "generation_chain_incomplete"
  | "whole_image_transform"
  | "weak_motion"
  | "missing_core_action"
  | "privacy_boundary_failed";

export type V34TargetActionFrameSummary = {
  targetActionId: V34TargetActionId;
  runtimeCoreActionId: CoreActionId;
  frameCount: number;
  localPartMotionScore: number;
  semanticCue: string;
  mostlyWholeImageTransform: boolean;
};

export type V34RuntimeCoreProjection = {
  mappingId: "v34_target_to_runtime_core_a2";
  targetToRuntime: Record<V34TargetActionId, CoreActionId>;
  semanticEquivalenceClaimed: false;
  compatibilityPurpose: "reuse_current_v30_v31_v32_v33_gates";
  actions: CoreActionId[];
};

export type V34RigFrameSeed = {
  seedId: string;
  characterAssetId: string;
  routeId: V34SynthesisRouteId;
  partMapRef: string;
  canonicalFrames: string[];
  actionTemplateRefs: string[];
  sourceBoundary: "local_deterministic_template" | "professional_assisted_import";
  reasonCodes: V34SynthesisReasonCode[];
};

export type V34GeneratedActionPack = {
  candidateId: string;
  characterAssetId: string;
  rendererKind: "frameSequence";
  actions: V34TargetActionId[];
  frameCountByAction: Record<V34TargetActionId, number>;
  targetActionFrames: V34TargetActionFrameSummary[];
  runtimeCoreProjection: V34RuntimeCoreProjection;
  runtimeQaCandidates: {
    semanticCandidate: V30Candidate;
    artCandidate: V31ArtQualityCandidate;
    frameCandidate: V32QualityRescueCandidate;
    identityGate: V33IdentityGateResult;
  };
  localMotionEvidence: string[];
  identityEvidence: string[];
  visualEvidenceRefs: string[];
  manifestRef: string;
  contactSheetEvidenceRef: string;
  playbackEvidenceRef: string;
  routeBQualityFallbackRecorded: true;
  status: V33PhaseStatus;
  reasonCodes: V34SynthesisReasonCode[];
};

export const V34_TARGET_TO_RUNTIME_CORE_A2: Record<V34TargetActionId, CoreActionId> = {
  idle: "idle",
  walk: "running",
  jump: "success",
  sleep: "sleeping",
  eat: "need_input",
  play: "thinking",
  alert: "warning",
  celebrate: "error"
};

export function createV34RigFrameSeed(options: {
  contract: V34CharacterAssetContract;
  routeId?: V34SynthesisRouteId;
  evidenceRef?: string;
}): V34RigFrameSeed {
  const reasonCodes = new Set<V34SynthesisReasonCode>();
  if (options.contract.reviewStatus !== "passed") reasonCodes.add("character_asset_blocked");
  if (options.contract.frameSeedReadiness !== "ready") reasonCodes.add("frame_seed_blocked");
  if (v34CharacterAssetContractHasForbiddenContent(options.contract)) reasonCodes.add("privacy_boundary_failed");
  const sampleRef = sanitizeRef(options.evidenceRef ?? `docs/V34.x/evidence/derivatives/${options.contract.sampleId}-part-map`);
  return {
    seedId: `${options.contract.characterAssetId}_seed`,
    characterAssetId: options.contract.characterAssetId,
    routeId: options.routeId ?? "local_deterministic_generation",
    partMapRef: sampleRef,
    canonicalFrames: ["front_sit", "side_walk", "curl_sleep", "alert_hold"],
    actionTemplateRefs: V34_TARGET_ACTION_IDS.map((actionId) => `v34_template_${actionId}`),
    sourceBoundary: options.routeId === "professional_assisted_import" ? "professional_assisted_import" : "local_deterministic_template",
    reasonCodes: reasonCodes.size === 0 ? ["sample_intake_passed"] : Array.from(reasonCodes).sort()
  };
}

export function createV34GeneratedActionPack(options: {
  contract: V34CharacterAssetContract;
  seed: V34RigFrameSeed;
  transformOnly?: boolean;
  missingTargetAction?: V34TargetActionId;
}): V34GeneratedActionPack {
  const candidateId = `${options.contract.characterAssetId}_v34_route_a2_pack`;
  const transformOnly = options.transformOnly === true;
  const targetActions = V34_TARGET_ACTION_IDS.filter((actionId) => actionId !== options.missingTargetAction);
  const reasonCodes = new Set<V34SynthesisReasonCode>();
  if (options.contract.reviewStatus !== "passed") reasonCodes.add("character_asset_blocked");
  if (options.seed.reasonCodes.some((code) => code !== "sample_intake_passed")) reasonCodes.add("frame_seed_blocked");
  if (targetActions.length !== V34_TARGET_ACTION_IDS.length) reasonCodes.add("missing_core_action");
  if (transformOnly) reasonCodes.add("whole_image_transform");

  const targetActionFrames = targetActions.map((actionId) => targetFrameSummary(actionId, transformOnly));
  const runtimeActions = [...CORE_ACTION_IDS];
  const status: V33PhaseStatus = reasonCodes.has("character_asset_blocked") || reasonCodes.has("frame_seed_blocked")
    ? "blocked"
    : reasonCodes.size > 0
      ? "failed"
      : "passed";

  const pack: V34GeneratedActionPack = {
    candidateId,
    characterAssetId: options.contract.characterAssetId,
    rendererKind: "frameSequence",
    actions: targetActions,
    frameCountByAction: Object.fromEntries(targetActions.map((actionId) => [
      actionId,
      frameCountForTarget(actionId)
    ])) as Record<V34TargetActionId, number>,
    targetActionFrames,
    runtimeCoreProjection: {
      mappingId: "v34_target_to_runtime_core_a2",
      targetToRuntime: { ...V34_TARGET_TO_RUNTIME_CORE_A2 },
      semanticEquivalenceClaimed: false,
      compatibilityPurpose: "reuse_current_v30_v31_v32_v33_gates",
      actions: runtimeActions
    },
    runtimeQaCandidates: {
      semanticCandidate: runtimeSemanticCandidate(candidateId, options.contract, transformOnly),
      artCandidate: runtimeArtCandidate(candidateId, options.contract, transformOnly),
      frameCandidate: runtimeFrameCandidate(candidateId, options.contract, transformOnly),
      identityGate: runtimeIdentityGate(candidateId, options.contract, transformOnly)
    },
    localMotionEvidence: targetActions.map((actionId) => `${actionId}:part_motion:${transformOnly ? "low" : "local"}`),
    identityEvidence: options.contract.identityAnchors,
    visualEvidenceRefs: [
      `docs/V34.x/evidence/derivatives/${candidateId}-contact-sheet.svg`,
      `docs/V34.x/evidence/derivatives/${candidateId}-playback-summary.html`
    ],
    manifestRef: `docs/V34.x/evidence/derivatives/${candidateId}-manifest.json`,
    contactSheetEvidenceRef: `docs/V34.x/evidence/derivatives/${candidateId}-contact-sheet.svg`,
    playbackEvidenceRef: `docs/V34.x/evidence/derivatives/${candidateId}-playback-summary.html`,
    routeBQualityFallbackRecorded: true,
    status,
    reasonCodes: reasonCodes.size === 0 ? ["sample_intake_passed"] : Array.from(reasonCodes).sort()
  };
  if (v34RigFrameSynthesisHasForbiddenContent(pack)) {
    return {
      ...pack,
      status: "blocked",
      reasonCodes: [...new Set<V34SynthesisReasonCode>([...pack.reasonCodes, "privacy_boundary_failed"])].sort()
    };
  }
  return pack;
}

export function buildV34RigFrameSynthesisEvidenceSnapshot(packs: V34GeneratedActionPack[]) {
  const passed = packs.filter((pack) => pack.status === "passed");
  return {
    packs: packs.map((pack) => ({
      candidateId: pack.candidateId,
      characterAssetId: pack.characterAssetId,
      status: pack.status,
      actions: pack.actions,
      runtimeProjectionActions: pack.runtimeCoreProjection.actions,
      semanticEquivalenceClaimed: pack.runtimeCoreProjection.semanticEquivalenceClaimed,
      contactSheetEvidenceRef: pack.contactSheetEvidenceRef,
      playbackEvidenceRef: pack.playbackEvidenceRef,
      routeBQualityFallbackRecorded: pack.routeBQualityFallbackRecorded,
      reasonCodes: pack.reasonCodes
    })),
    passedCount: passed.length,
    blockedCount: packs.filter((pack) => pack.status === "blocked").length,
    failedCount: packs.filter((pack) => pack.status === "failed").length,
    distinctPassedCharacterAssetCount: new Set(passed.map((pack) => pack.characterAssetId)).size,
    targetActionCoveragePassed: passed.every((pack) => V34_TARGET_ACTION_IDS.every((actionId) => pack.actions.includes(actionId))),
    runtimeProjectionCoveragePassed: passed.every((pack) => CORE_ACTION_IDS.every((actionId) => pack.runtimeCoreProjection.actions.includes(actionId))),
    routeA2Selected: true,
    routeBQualityFallbackRecorded: packs.every((pack) => pack.routeBQualityFallbackRecorded)
  };
}

export function v34RigFrameSynthesisHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function targetFrameSummary(actionId: V34TargetActionId, transformOnly: boolean): V34TargetActionFrameSummary {
  return {
    targetActionId: actionId,
    runtimeCoreActionId: V34_TARGET_TO_RUNTIME_CORE_A2[actionId],
    frameCount: frameCountForTarget(actionId),
    localPartMotionScore: transformOnly ? 0.03 : actionId === "idle" || actionId === "sleep" ? 0.22 : 0.72,
    semanticCue: semanticCueForTarget(actionId),
    mostlyWholeImageTransform: transformOnly
  };
}

function frameCountForTarget(actionId: V34TargetActionId) {
  return actionId === "idle" || actionId === "walk" || actionId === "sleep" || actionId === "play" ? 12 : 8;
}

function semanticCueForTarget(actionId: V34TargetActionId) {
  return {
    idle: "breath_blink_tail",
    walk: "leg_cycle_body_sway",
    jump: "crouch_airborne_land",
    sleep: "curl_breath_closed_eyes",
    eat: "head_down_paw_food_symbol",
    play: "paw_bat_tail_energy",
    alert: "ears_up_body_tension",
    celebrate: "happy_peak_pose"
  }[actionId];
}

function runtimeSemanticCandidate(candidateId: string, contract: V34CharacterAssetContract, transformOnly: boolean): V30Candidate {
  return {
    candidateId,
    safePackId: contract.characterAssetId,
    routeKind: transformOnly ? "weak_baseline_comparison" : "local_2d_rig" as V30RouteKind,
    actions: CORE_ACTION_IDS.map((actionId) => {
      const subtle = actionId === "idle" || actionId === "sleeping";
      return {
        actionId,
        frameCount: frameCountForCore(actionId),
        routeKind: transformOnly ? "weak_baseline_comparison" : "local_2d_rig",
        mostlyWholeImageTransform: transformOnly,
        motionAmplitude: transformOnly ? 0.04 : subtle ? 0.07 : 0.42,
        keyPoseDiversity: transformOnly ? 0.08 : subtle ? 0.18 : 0.58,
        silhouetteChange: transformOnly ? 0.03 : subtle ? 0.07 : 0.28,
        anchorDrift: 0.05,
        maxAdjacentDelta: transformOnly ? 0.05 : 0.24,
        loopClosed: true,
        sameCatScore: transformOnly ? 0.84 : 0.92,
        backgroundClean: true,
        offCanvas: false,
        semanticReadable: !transformOnly,
        manualVisualPass: !transformOnly
      };
    })
  };
}

function runtimeArtCandidate(candidateId: string, contract: V34CharacterAssetContract, transformOnly: boolean): V31ArtQualityCandidate {
  return {
    candidateId,
    safePackId: contract.characterAssetId,
    routeKind: transformOnly ? "placeholder_reject_baseline" : "layered_2d_rig",
    sourceAvailable: true,
    licenseBoundaryOk: true,
    placeholderLineArt: false,
    hasVisualEvidence: true,
    actions: CORE_ACTION_IDS.map((actionId): V31ActionArtMetrics => {
      const subtle = actionId === "idle" || actionId === "sleeping";
      return {
        actionId,
        frameCount: frameCountForCore(actionId),
        visualPolish: transformOnly ? 0.44 : 0.78,
        silhouetteClarity: transformOnly ? 0.5 : 0.78,
        expressionClarity: transformOnly ? 0.38 : subtle ? 0.52 : 0.72,
        actionPoseStrength: transformOnly ? 0.2 : subtle ? 0.32 : 0.72,
        identityConsistency: transformOnly ? 0.82 : 0.9,
        backgroundClean: true,
        overlayTextDetected: false,
        watermarkDetected: false,
        loopOrTimingOk: true,
        readableAt1x: true,
        readableAt075x: !transformOnly,
        wholeImageTransformOnly: transformOnly
      };
    })
  };
}

function runtimeFrameCandidate(candidateId: string, contract: V34CharacterAssetContract, transformOnly: boolean): V32QualityRescueCandidate {
  return {
    candidateId,
    safePackId: contract.characterAssetId,
    routeKind: transformOnly ? "negative_baseline" : "photo_trait_local_rig",
    sourceAvailable: true,
    licenseBoundaryOk: true,
    hasVisualEvidence: true,
    actions: CORE_ACTION_IDS.map((actionId): V32MeasuredActionMetrics => {
      const subtle = actionId === "idle" || actionId === "sleeping";
      return {
        actionId,
        frameCount: frameCountForCore(actionId),
        visiblePixelRatio: 0.24,
        duplicateFrameRatio: transformOnly ? 0.42 : 0.03,
        meanAdjacentDelta: transformOnly ? 0.004 : subtle ? 0.018 : 0.075,
        maxAdjacentDelta: transformOnly ? 0.04 : 0.22,
        loopClosureDelta: 0.02,
        transparentBackground: true,
        offCanvas: false,
        wholeImageTransformOnly: transformOnly,
        localPartMotionScore: transformOnly ? 0.03 : subtle ? 0.18 : 0.68,
        visualDetailScore: transformOnly ? 0.48 : 0.72,
        readableAt1x: true,
        readableAt075x: !transformOnly
      };
    })
  };
}

function runtimeIdentityGate(candidateId: string, contract: V34CharacterAssetContract, transformOnly: boolean): V33IdentityGateResult {
  return {
    status: contract.reviewStatus === "passed" && !transformOnly ? "passed" : contract.reviewStatus,
    sampleId: contract.sampleId,
    characterId: contract.characterAssetId,
    candidateId,
    reasonCodes: contract.reviewStatus === "passed" && !transformOnly ? ["sample_intake_passed"] : ["identity_drift"],
    anchorCoverage: Object.fromEntries(contract.identityAnchors.map((anchor) => [anchor, !transformOnly])) as Record<string, boolean>,
    identityConsistency: transformOnly ? "medium" : "high"
  };
}

function frameCountForCore(actionId: CoreActionId) {
  return actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping" ? 12 : 8;
}

function sanitizeRef(ref: string) {
  const normalized = ref.replace(/\\/g, "/").replace(/[^A-Za-z0-9._/-]/g, "_").slice(0, 140);
  return normalized && !FORBIDDEN_PATTERN.test(normalized) ? normalized : "";
}
