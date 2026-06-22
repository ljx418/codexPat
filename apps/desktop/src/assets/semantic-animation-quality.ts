import { CORE_ACTION_IDS, type CoreActionId } from "./asset-manifest";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V30LoopType = "loop" | "transient";
export type V30RouteKind = "provider_key_pose" | "local_2d_rig" | "manual_frame_import" | "weak_baseline_comparison";
export type V30QAStatus = "passed" | "blocked" | "failed";

export type V30ReasonCode =
  | "storyboard_missing"
  | "key_pose_missing"
  | "action_semantics_unreadable"
  | "whole_image_transform_only"
  | "motion_amplitude_too_low"
  | "key_pose_diversity_too_low"
  | "silhouette_change_too_low"
  | "anchor_drift_too_high"
  | "loop_closure_failed"
  | "adjacent_frame_jump"
  | "identity_drift"
  | "background_residue"
  | "off_canvas_frame"
  | "visual_review_rejected"
  | "qa_failed_pack_blocked"
  | "approved_pack_applied"
  | "rollback_restored_previous_pack"
  | "semantic_animation_passed";

export type V30ActionStoryboard = {
  actionId: CoreActionId;
  semanticGoal: string;
  keyPoses: string[];
  timing: string;
  loopType: V30LoopType;
  rejectIfMostlyWholeImageTransform: true;
  manualReviewPrompt: string;
};

export type V30ActionCandidateMetrics = {
  actionId: CoreActionId;
  frameCount: number;
  routeKind: V30RouteKind;
  mostlyWholeImageTransform: boolean;
  motionAmplitude: number;
  keyPoseDiversity: number;
  silhouetteChange: number;
  anchorDrift: number;
  maxAdjacentDelta: number;
  loopClosed: boolean;
  sameCatScore: number;
  backgroundClean: boolean;
  offCanvas: boolean;
  semanticReadable: boolean;
  manualVisualPass: boolean;
};

export type V30Candidate = {
  candidateId: string;
  safePackId: string;
  routeKind: V30RouteKind;
  actions: V30ActionCandidateMetrics[];
};

export type V30MotionReadabilityResult = {
  status: V30QAStatus;
  candidateId: string;
  safePackId: string;
  routeKind: V30RouteKind;
  reasonCodes: V30ReasonCode[];
  actionCoverage: Record<CoreActionId, boolean>;
  actionScores: Record<CoreActionId, {
    semanticReadable: boolean;
    motionBucket: "low" | "medium" | "high";
    keyPoseBucket: "low" | "medium" | "high";
    transformOnly: boolean;
  }>;
  transformOnlyScore: "low" | "medium" | "high";
  keyPoseDiversityScore: "low" | "medium" | "high";
  semanticChecklistResult: "passed" | "failed";
  loopClosureResult: "passed" | "failed";
  adjacentDeltaResult: "passed" | "failed";
  sameCatResult: "passed" | "failed";
};

export const V30_ACTION_STORYBOARDS: Record<CoreActionId, V30ActionStoryboard> = {
  idle: {
    actionId: "idle",
    semanticGoal: "Calm living idle with subtle breathing, blink, ear or tail life.",
    keyPoses: ["neutral sit", "small breath lift", "blink or tail settle"],
    timing: "slow loop, low amplitude",
    loopType: "loop",
    rejectIfMostlyWholeImageTransform: true,
    manualReviewPrompt: "Can this read as a living pet without drifting around?"
  },
  thinking: {
    actionId: "thinking",
    semanticGoal: "Curious thinking: head turns, paw or chin gesture, eyes focused aside.",
    keyPoses: ["look aside", "paw/chin emphasis", "return to thinking pose"],
    timing: "medium loop with asymmetric head/paw pose",
    loopType: "loop",
    rejectIfMostlyWholeImageTransform: true,
    manualReviewPrompt: "Can I tell the cat is thinking without the label?"
  },
  running: {
    actionId: "running",
    semanticGoal: "Clear locomotion or forward-energy run with body lean and stride rhythm.",
    keyPoses: ["anticipation crouch", "forward stride", "airborne/extension", "recovery stride"],
    timing: "fast loop, high amplitude",
    loopType: "loop",
    rejectIfMostlyWholeImageTransform: true,
    manualReviewPrompt: "Does this look like running rather than sliding?"
  },
  success: {
    actionId: "success",
    semanticGoal: "Celebration with anticipation, jump or raised paws, and recovery.",
    keyPoses: ["pre-jump crouch", "celebration extension", "happy landing/recover"],
    timing: "short transient with strong peak pose",
    loopType: "transient",
    rejectIfMostlyWholeImageTransform: true,
    manualReviewPrompt: "Does the cat visibly celebrate?"
  },
  warning: {
    actionId: "warning",
    semanticGoal: "Alert posture with ears/eyes/body attention and cautious movement.",
    keyPoses: ["alert ears", "look/check", "cautious hold"],
    timing: "medium loop, controlled tension",
    loopType: "transient",
    rejectIfMostlyWholeImageTransform: true,
    manualReviewPrompt: "Does it read as alert or warning rather than random shake?"
  },
  error: {
    actionId: "error",
    semanticGoal: "Failure/confusion: collapse, imbalance, dizzy or visibly uncomfortable pose.",
    keyPoses: ["lose balance", "dizzy/collapse", "recover or hold failed state"],
    timing: "transient with clear failure pose",
    loopType: "transient",
    rejectIfMostlyWholeImageTransform: true,
    manualReviewPrompt: "Is this clearly different from warning and idle?"
  },
  need_input: {
    actionId: "need_input",
    semanticGoal: "The cat asks the user: look toward viewer, paw raise, waiting posture.",
    keyPoses: ["look at user", "raise paw or lean forward", "hold waiting pose"],
    timing: "medium loop, user-facing attention",
    loopType: "transient",
    rejectIfMostlyWholeImageTransform: true,
    manualReviewPrompt: "Does this communicate 'I need you' without a symbol?"
  },
  sleeping: {
    actionId: "sleeping",
    semanticGoal: "Resting sleep: lying or curled posture with calm breathing.",
    keyPoses: ["lie/curl down", "closed eyes", "soft breath"],
    timing: "slow loop, low amplitude",
    loopType: "loop",
    rejectIfMostlyWholeImageTransform: true,
    manualReviewPrompt: "Does this read as sleep rather than sitting lower?"
  }
};

const ACTIVE_ACTIONS = new Set<CoreActionId>(["running", "success", "warning", "error", "need_input"]);
const LOW_MOTION_ACTIONS = new Set<CoreActionId>(["idle", "sleeping"]);

export function validateV30Storyboards(storyboards: Record<CoreActionId, V30ActionStoryboard> = V30_ACTION_STORYBOARDS) {
  const reasonCodes = new Set<V30ReasonCode>();
  const coverage = Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [actionId, Boolean(storyboards[actionId])])) as Record<CoreActionId, boolean>;
  for (const actionId of CORE_ACTION_IDS) {
    const storyboard = storyboards[actionId];
    if (!storyboard) {
      reasonCodes.add("storyboard_missing");
      continue;
    }
    if (storyboard.keyPoses.length < (ACTIVE_ACTIONS.has(actionId) ? 3 : 2)) {
      reasonCodes.add("key_pose_missing");
    }
    if (!storyboard.rejectIfMostlyWholeImageTransform) {
      reasonCodes.add("whole_image_transform_only");
    }
  }
  return {
    status: reasonCodes.size ? "failed" as const : "passed" as const,
    reasonCodes: Array.from(reasonCodes).sort(),
    actionCoverage: coverage,
    storyboardCount: CORE_ACTION_IDS.filter((actionId) => coverage[actionId]).length
  };
}

export function runV30MotionReadabilityQA(candidate: V30Candidate): V30MotionReadabilityResult {
  const reasonCodes = new Set<V30ReasonCode>();
  const actionCoverage = Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
    actionId,
    candidate.actions.some((action) => action.actionId === actionId)
  ])) as Record<CoreActionId, boolean>;

  for (const actionId of CORE_ACTION_IDS) {
    if (!actionCoverage[actionId]) reasonCodes.add("storyboard_missing");
  }

  let transformOnlyCount = 0;
  let keyPoseTotal = 0;
  let sameCatFailed = false;
  let loopFailed = false;
  let adjacentFailed = false;
  const actionScores = {} as V30MotionReadabilityResult["actionScores"];

  for (const action of candidate.actions) {
    const storyboard = V30_ACTION_STORYBOARDS[action.actionId];
    const isLowMotion = LOW_MOTION_ACTIONS.has(action.actionId);
    const motionMinimum = isLowMotion ? 0.04 : 0.26;
    const keyPoseMinimum = isLowMotion ? 0.12 : 0.42;
    const silhouetteMinimum = isLowMotion ? 0.04 : 0.18;

    if (!storyboard) reasonCodes.add("storyboard_missing");
    if (action.mostlyWholeImageTransform) {
      reasonCodes.add("whole_image_transform_only");
      transformOnlyCount += 1;
    }
    if (action.motionAmplitude < motionMinimum) reasonCodes.add("motion_amplitude_too_low");
    if (action.keyPoseDiversity < keyPoseMinimum) reasonCodes.add("key_pose_diversity_too_low");
    if (action.silhouetteChange < silhouetteMinimum) reasonCodes.add("silhouette_change_too_low");
    if (action.anchorDrift > 0.22) reasonCodes.add("anchor_drift_too_high");
    if (action.maxAdjacentDelta > 0.48) {
      reasonCodes.add("adjacent_frame_jump");
      adjacentFailed = true;
    }
    if (!action.loopClosed) {
      reasonCodes.add("loop_closure_failed");
      loopFailed = true;
    }
    if (action.sameCatScore < 0.78) {
      reasonCodes.add("identity_drift");
      sameCatFailed = true;
    }
    if (!action.backgroundClean) reasonCodes.add("background_residue");
    if (action.offCanvas) reasonCodes.add("off_canvas_frame");
    if (!action.semanticReadable) reasonCodes.add("action_semantics_unreadable");
    if (!action.manualVisualPass) reasonCodes.add("visual_review_rejected");

    keyPoseTotal += clampScore(action.keyPoseDiversity);
    actionScores[action.actionId] = {
      semanticReadable: action.semanticReadable,
      motionBucket: bucket(action.motionAmplitude),
      keyPoseBucket: bucket(action.keyPoseDiversity),
      transformOnly: action.mostlyWholeImageTransform
    };
  }

  if (semanticAnimationHasForbiddenContent(candidate)) reasonCodes.add("visual_review_rejected");
  const failed = reasonCodes.size > 0;
  if (!failed) reasonCodes.add("semantic_animation_passed");

  const actionCount = Math.max(1, candidate.actions.length);
  return {
    status: failed ? "failed" : "passed",
    candidateId: safeId(candidate.candidateId, "v30_candidate"),
    safePackId: safeId(candidate.safePackId, "v30_pack"),
    routeKind: candidate.routeKind,
    reasonCodes: Array.from(reasonCodes).sort(),
    actionCoverage,
    actionScores,
    transformOnlyScore: bucket(transformOnlyCount / actionCount),
    keyPoseDiversityScore: bucket(keyPoseTotal / actionCount),
    semanticChecklistResult: failed ? "failed" : "passed",
    loopClosureResult: loopFailed ? "failed" : "passed",
    adjacentDeltaResult: adjacentFailed ? "failed" : "passed",
    sameCatResult: sameCatFailed ? "failed" : "passed"
  };
}

export function buildV30EvidenceSnapshot(result: V30MotionReadabilityResult) {
  return {
    status: result.status,
    candidateId: result.candidateId,
    safePackId: result.safePackId,
    routeKind: result.routeKind,
    reasonCodes: result.reasonCodes,
    actionCoverage: result.actionCoverage,
    actionScores: result.actionScores,
    transformOnlyScore: result.transformOnlyScore,
    keyPoseDiversityScore: result.keyPoseDiversityScore,
    semanticChecklistResult: result.semanticChecklistResult,
    loopClosureResult: result.loopClosureResult,
    adjacentDeltaResult: result.adjacentDeltaResult,
    sameCatResult: result.sameCatResult
  };
}

export function createV30WeakTransformCandidate(overrides: Partial<V30ActionCandidateMetrics> = {}): V30Candidate {
  return {
    candidateId: "v30_weak_transform_candidate",
    safePackId: "v16-host-image-tool-orange-tabby",
    routeKind: "weak_baseline_comparison",
    actions: CORE_ACTION_IDS.map((actionId) => ({
      actionId,
      frameCount: LOW_MOTION_ACTIONS.has(actionId) ? 6 : 6,
      routeKind: "weak_baseline_comparison",
      mostlyWholeImageTransform: true,
      motionAmplitude: LOW_MOTION_ACTIONS.has(actionId) ? 0.04 : 0.16,
      keyPoseDiversity: LOW_MOTION_ACTIONS.has(actionId) ? 0.08 : 0.18,
      silhouetteChange: LOW_MOTION_ACTIONS.has(actionId) ? 0.03 : 0.08,
      anchorDrift: 0.08,
      maxAdjacentDelta: 0.18,
      loopClosed: true,
      sameCatScore: 0.9,
      backgroundClean: true,
      offCanvas: false,
      semanticReadable: LOW_MOTION_ACTIONS.has(actionId),
      manualVisualPass: false,
      ...overrides
    }))
  };
}

export function createV30SemanticCandidate(overrides: Partial<V30ActionCandidateMetrics> = {}): V30Candidate {
  return {
    candidateId: "v30_semantic_candidate",
    safePackId: "v30-semantic-work-cat",
    routeKind: "local_2d_rig",
    actions: CORE_ACTION_IDS.map((actionId) => ({
      actionId,
      frameCount: LOW_MOTION_ACTIONS.has(actionId) ? 6 : 6,
      routeKind: "local_2d_rig",
      mostlyWholeImageTransform: false,
      motionAmplitude: LOW_MOTION_ACTIONS.has(actionId) ? 0.08 : 0.42,
      keyPoseDiversity: LOW_MOTION_ACTIONS.has(actionId) ? 0.18 : 0.62,
      silhouetteChange: LOW_MOTION_ACTIONS.has(actionId) ? 0.08 : 0.32,
      anchorDrift: 0.08,
      maxAdjacentDelta: 0.22,
      loopClosed: true,
      sameCatScore: 0.9,
      backgroundClean: true,
      offCanvas: false,
      semanticReadable: true,
      manualVisualPass: true,
      ...overrides
    }))
  };
}

export function semanticAnimationHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function bucket(value: number): "low" | "medium" | "high" {
  if (value >= 0.66) return "high";
  if (value >= 0.34) return "medium";
  return "low";
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function safeId(value: string, fallback: string) {
  return /^[A-Za-z0-9._-]{1,96}$/.test(value) ? value : fallback;
}
