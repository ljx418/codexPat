import { CORE_ACTION_IDS, type CoreActionId } from "./asset-manifest";

const SAME_CAT_MINIMUM = 0.78;
const MOTION_MINIMUM = 0.22;
const IDLE_MOTION_MINIMUM = 0.04;
const VISIBLE_PIXEL_MINIMUM = 0.02;
const MAX_ADJACENT_DELTA = 0.36;
const MIN_AESTHETIC_SCORE = 0.58;

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V29QualityGateStatus = "accepted" | "rejected";

export type V29QualityGateReasonCode =
  | "quality_gate_passed"
  | "action_coverage_incomplete"
  | "same_cat_score_too_low"
  | "motion_amplitude_too_low"
  | "background_not_clean"
  | "blank_or_transparent_frame"
  | "off_canvas_frame"
  | "frame_delta_too_large"
  | "loop_closure_failed"
  | "readability_failed"
  | "aesthetic_score_too_low"
  | "candidate_ranked"
  | "unsafe_field_detected";

export type V29ActionQualityMetrics = {
  actionId: CoreActionId;
  frameCount: number;
  sameCatScore: number;
  motionAmplitude: number;
  visiblePixelRatio: number;
  backgroundClean: boolean;
  offCanvas: boolean;
  maxAdjacentDelta: number;
  loopClosed: boolean;
  readableAt1x: boolean;
  readableAt075x: boolean;
  aestheticScore: number;
};

export type V29QualityGateInput = {
  candidateId: string;
  safePackId: string;
  actions: V29ActionQualityMetrics[];
};

export type V29QualityGateResult = {
  status: V29QualityGateStatus;
  reasonCodes: V29QualityGateReasonCode[];
  candidateId: string;
  safePackId: string;
  actionCoverage: Record<CoreActionId, boolean>;
  hardRejected: boolean;
  scoreBuckets: {
    sameCat: "low" | "medium" | "high";
    motion: "low" | "medium" | "high";
    aesthetic: "low" | "medium" | "high";
  };
  rank: "A" | "B" | "C" | "rejected";
};

const LOOP_ACTIONS = new Set<CoreActionId>(["idle", "thinking", "running", "sleeping"]);

export function runV29QualityGateV2(input: V29QualityGateInput): V29QualityGateResult {
  const reasonCodes = new Set<V29QualityGateReasonCode>();
  const sanitizedCandidateId = safeId(input.candidateId, "v29_candidate");
  const sanitizedPackId = safeId(input.safePackId, "v29_pack");
  const actionCoverage = buildActionCoverage(input.actions);

  if (!CORE_ACTION_IDS.every((actionId) => actionCoverage[actionId])) {
    reasonCodes.add("action_coverage_incomplete");
  }

  for (const action of input.actions) {
    const sameCatScore = clampScore(action.sameCatScore);
    const motionAmplitude = clampScore(action.motionAmplitude);
    const visiblePixelRatio = clampScore(action.visiblePixelRatio);
    const maxAdjacentDelta = clampScore(action.maxAdjacentDelta);
    const aestheticScore = clampScore(action.aestheticScore);
    const minimumMotion = action.actionId === "idle" ? IDLE_MOTION_MINIMUM : MOTION_MINIMUM;

    if (sameCatScore < SAME_CAT_MINIMUM) reasonCodes.add("same_cat_score_too_low");
    if (motionAmplitude < minimumMotion) reasonCodes.add("motion_amplitude_too_low");
    if (!action.backgroundClean) reasonCodes.add("background_not_clean");
    if (visiblePixelRatio < VISIBLE_PIXEL_MINIMUM) reasonCodes.add("blank_or_transparent_frame");
    if (action.offCanvas) reasonCodes.add("off_canvas_frame");
    if (maxAdjacentDelta > MAX_ADJACENT_DELTA) reasonCodes.add("frame_delta_too_large");
    if (LOOP_ACTIONS.has(action.actionId) && !action.loopClosed) reasonCodes.add("loop_closure_failed");
    if (!action.readableAt1x || !action.readableAt075x) reasonCodes.add("readability_failed");
    if (aestheticScore < MIN_AESTHETIC_SCORE) reasonCodes.add("aesthetic_score_too_low");
  }

  if (qualityGateV2HasForbiddenContent({ candidateId: input.candidateId, safePackId: input.safePackId })) {
    reasonCodes.add("unsafe_field_detected");
  }

  const hardRejected = Array.from(reasonCodes).some((code) => code !== "aesthetic_score_too_low");
  const rejected = hardRejected || reasonCodes.has("aesthetic_score_too_low");

  if (!rejected) {
    reasonCodes.add("quality_gate_passed");
    reasonCodes.add("candidate_ranked");
  }

  const aggregate = aggregateScores(input.actions);
  return {
    status: rejected ? "rejected" : "accepted",
    reasonCodes: Array.from(reasonCodes).sort(),
    candidateId: sanitizedCandidateId,
    safePackId: sanitizedPackId,
    actionCoverage,
    hardRejected,
    scoreBuckets: {
      sameCat: bucket(aggregate.sameCat),
      motion: bucket(aggregate.motion),
      aesthetic: bucket(aggregate.aesthetic)
    },
    rank: rejected ? "rejected" : rankAccepted(aggregate)
  };
}

export function buildV29QualityGateEvidenceSnapshot(result: V29QualityGateResult) {
  return {
    status: result.status,
    reasonCodes: result.reasonCodes,
    candidateId: result.candidateId,
    safePackId: result.safePackId,
    actionCoverage: result.actionCoverage,
    hardRejected: result.hardRejected,
    scoreBuckets: result.scoreBuckets,
    rank: result.rank
  };
}

export function qualityGateV2HasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

export function v29AcceptedActionMetrics(overrides: Partial<V29ActionQualityMetrics> = {}): V29ActionQualityMetrics[] {
  return CORE_ACTION_IDS.map((actionId) => ({
    actionId,
    frameCount: LOOP_ACTIONS.has(actionId) ? 8 : 4,
    sameCatScore: 0.9,
    motionAmplitude: actionId === "idle" ? 0.08 : 0.34,
    visiblePixelRatio: 0.72,
    backgroundClean: true,
    offCanvas: false,
    maxAdjacentDelta: 0.18,
    loopClosed: true,
    readableAt1x: true,
    readableAt075x: true,
    aestheticScore: 0.76,
    ...overrides
  }));
}

function buildActionCoverage(actions: V29ActionQualityMetrics[]): Record<CoreActionId, boolean> {
  const set = new Set(actions.map((action) => action.actionId));
  return Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [actionId, set.has(actionId)])) as Record<CoreActionId, boolean>;
}

function aggregateScores(actions: V29ActionQualityMetrics[]) {
  const actionCount = Math.max(1, actions.length);
  return {
    sameCat: actions.reduce((total, action) => total + clampScore(action.sameCatScore), 0) / actionCount,
    motion: actions.reduce((total, action) => {
      const minimumMotion = action.actionId === "idle" ? IDLE_MOTION_MINIMUM : MOTION_MINIMUM;
      return total + clampScore(action.motionAmplitude / Math.max(0.01, minimumMotion));
    }, 0) / actionCount,
    aesthetic: actions.reduce((total, action) => total + clampScore(action.aestheticScore), 0) / actionCount
  };
}

function bucket(value: number): "low" | "medium" | "high" {
  if (value >= 0.82) return "high";
  if (value >= 0.58) return "medium";
  return "low";
}

function rankAccepted(scores: ReturnType<typeof aggregateScores>): "A" | "B" | "C" {
  const average = (scores.sameCat + scores.motion + scores.aesthetic) / 3;
  if (average >= 0.78) return "A";
  if (average >= 0.68) return "B";
  return "C";
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function safeId(value: string, fallback: string) {
  return /^[A-Za-z0-9._-]{1,96}$/.test(value) ? value : fallback;
}
