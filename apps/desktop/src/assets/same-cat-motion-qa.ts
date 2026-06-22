import type { CoreActionId } from "./asset-manifest";
import {
  buildV22QualityEvidenceSnapshot,
  createV22CandidateAsset,
  runV22MotionQAGate,
  runV22TechnicalQAGate,
  type V22CandidateActionMetrics,
  type V22ReasonCode,
  type V22SourceRoute
} from "./asset-quality-review";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;
const SAFE_ID_PATTERN = /^[A-Za-z0-9._-]{1,96}$/;
const SAME_CAT_THRESHOLD = 0.72;
const MOTION_MINIMUM = 0.18;

export type V25QAStatus = "accepted_for_v22_review" | "rejected";

export type V25QAReasonCode =
  | V22ReasonCode
  | "same_cat_qa_passed"
  | "same_cat_score_too_low"
  | "v22_visual_review_ready"
  | "safe_qa_snapshot_ready";

export type V25SameCatMotionQAInput = {
  candidateId: string;
  safePackId: string;
  sourceRoute: V22SourceRoute;
  sameCatConsistencyScore: number;
  traitMismatchCount?: number;
  actions: V22CandidateActionMetrics[];
};

export type V25SameCatMotionQAResult = {
  status: V25QAStatus;
  reasonCodes: V25QAReasonCode[];
  candidateId: string;
  safePackId: string;
  sourceRoute: V22SourceRoute;
  sameCatConsistencyScoreBucket: "low" | "medium" | "high";
  actionCoverage: Record<CoreActionId, boolean>;
  v22Status: string;
  proceedsToV22VisualReview: boolean;
  safeSnapshot: ReturnType<typeof buildV22QualityEvidenceSnapshot>;
};

export function runV25SameCatMotionQA(input: V25SameCatMotionQAInput): V25SameCatMotionQAResult {
  const candidate = createV22CandidateAsset({
    candidateId: input.candidateId,
    sourceRoute: input.sourceRoute,
    safePackId: input.safePackId,
    actions: input.actions
  });
  const technical = runV22TechnicalQAGate(candidate);
  const motion = runV22MotionQAGate(technical);
  const reasonCodes = new Set<V25QAReasonCode>(motion.reasonCodes);
  const sameCatScore = finiteScore(input.sameCatConsistencyScore);
  const mismatchCount = Math.max(0, Math.floor(input.traitMismatchCount ?? 0));

  if (sameCatScore < SAME_CAT_THRESHOLD || mismatchCount > 1) {
    reasonCodes.add("identity_drift_detected");
    reasonCodes.add("same_cat_score_too_low");
  } else {
    reasonCodes.add("same_cat_qa_passed");
  }

  if (input.actions.some((action) => action.motionAmplitude < MOTION_MINIMUM && action.actionId !== "idle")) {
    reasonCodes.add("motion_amplitude_too_low");
  }
  if (input.actions.some((action) => action.maxAdjacentDelta > 0.42 || action.anchorDrift > 0.18)) {
    reasonCodes.add("frame_delta_too_large");
  }
  if (input.actions.some((action) => !action.loopClosed)) {
    reasonCodes.add("loop_closure_failed");
  }
  if (input.actions.some((action) => action.visiblePixelRatio <= 0)) {
    reasonCodes.add("blank_frame_detected");
  }
  if (input.actions.some((action) => action.visiblePixelRatio < 0.01)) {
    reasonCodes.add("transparent_frame_detected");
  }
  if (input.actions.some((action) => action.offCanvas)) {
    reasonCodes.add("off_canvas_frame_detected");
  }

  const rejected = motion.status !== "visual_review_required"
    || reasonCodes.has("identity_drift_detected")
    || reasonCodes.has("same_cat_score_too_low")
    || sameCatMotionQAHasForbiddenContent({ input, motion });

  if (!rejected) {
    reasonCodes.add("v22_visual_review_ready");
  }
  reasonCodes.add("safe_qa_snapshot_ready");

  return {
    status: rejected ? "rejected" : "accepted_for_v22_review",
    reasonCodes: Array.from(reasonCodes).sort(),
    candidateId: safeId(input.candidateId, "candidate"),
    safePackId: safeId(input.safePackId, "pack"),
    sourceRoute: input.sourceRoute,
    sameCatConsistencyScoreBucket: sameCatScore >= 0.86 ? "high" : sameCatScore >= SAME_CAT_THRESHOLD ? "medium" : "low",
    actionCoverage: Object.fromEntries(input.actions.map((action) => [action.actionId, true])) as Record<CoreActionId, boolean>,
    v22Status: motion.status,
    proceedsToV22VisualReview: !rejected && motion.status === "visual_review_required",
    safeSnapshot: buildV22QualityEvidenceSnapshot(motion)
  };
}

export function buildV25QAEvidenceSnapshot(result: V25SameCatMotionQAResult) {
  return {
    status: result.status,
    candidateId: result.candidateId,
    safePackId: result.safePackId,
    sourceRoute: result.sourceRoute,
    reasonCodes: result.reasonCodes,
    sameCatConsistencyScoreBucket: result.sameCatConsistencyScoreBucket,
    actionCoverage: result.actionCoverage,
    v22Status: result.v22Status,
    proceedsToV22VisualReview: result.proceedsToV22VisualReview,
    safeSnapshotFields: Object.keys(result.safeSnapshot).sort()
  };
}

export function sameCatMotionQAHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function finiteScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

function safeId(value: string, fallback: string) {
  return SAFE_ID_PATTERN.test(value) ? value : fallback;
}
