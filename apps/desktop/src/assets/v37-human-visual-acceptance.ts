import type { V33PhaseStatus } from "./v33-sample-intake";
import type { V35RubricStatus } from "./v35-target-experience-quality";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V37HumanVisualReviewInput = {
  sampleId: string;
  candidateId: string;
  automatedStatus: V35RubricStatus;
  identityScore: number;
  motionReadabilityScore: number;
  visualPolishScore: number;
  nonPlaceholderResult: "passed" | "failed";
  builtInCatReuseDetected?: boolean;
};

export type V37HumanVisualReviewItem = V37HumanVisualReviewInput & {
  reviewerRole: "codex_visual_reviewer";
  conflictWithAutomatedScore: boolean;
  finalStatus: V35RubricStatus;
  reasonCodes: string[];
};

export type V37HumanVisualAcceptanceGate = {
  gateId: "v37_human_visual_acceptance";
  reviews: V37HumanVisualReviewItem[];
  targetExperienceCount: number;
  engineeringOnlyCount: number;
  blockedCount: number;
  failedCount: number;
  status: V33PhaseStatus;
  reasonCodes: string[];
};

export function createV37HumanVisualAcceptanceGate(inputs: V37HumanVisualReviewInput[]): V37HumanVisualAcceptanceGate {
  const reviews = inputs.map(reviewOne);
  const targetExperienceCount = reviews.filter((review) => review.finalStatus === "target_experience").length;
  const engineeringOnlyCount = reviews.filter((review) => review.finalStatus === "engineering_only").length;
  const blockedCount = reviews.filter((review) => review.finalStatus === "blocked").length;
  const failedCount = reviews.filter((review) => review.finalStatus === "failed").length;
  const reasonCodes = new Set<string>();
  if (targetExperienceCount < 2) reasonCodes.add("target_experience_review_count_too_low");
  if (reviews.some((review) => review.builtInCatReuseDetected)) reasonCodes.add("built_in_cat_reuse_detected");
  if (reviews.some((review) => review.nonPlaceholderResult === "failed")) reasonCodes.add("placeholder_or_line_art_detected");
  if (v37HumanVisualAcceptanceHasForbiddenContent(reviews)) reasonCodes.add("security_boundary_failed");
  const status: V33PhaseStatus = reasonCodes.has("security_boundary_failed") || blockedCount > 0
    ? "blocked"
    : failedCount > 0 || reasonCodes.size > 0
      ? "failed"
      : "passed";
  return {
    gateId: "v37_human_visual_acceptance",
    reviews,
    targetExperienceCount,
    engineeringOnlyCount,
    blockedCount,
    failedCount,
    status,
    reasonCodes: reasonCodes.size === 0 ? ["human_visual_review_passed"] : Array.from(reasonCodes).sort()
  };
}

export function buildV37HumanVisualAcceptanceEvidenceSnapshot(gate: V37HumanVisualAcceptanceGate) {
  return {
    gateId: gate.gateId,
    reviews: gate.reviews.map((review) => ({
      sampleId: review.sampleId,
      candidateId: review.candidateId,
      automatedStatus: review.automatedStatus,
      identityScore: review.identityScore,
      motionReadabilityScore: review.motionReadabilityScore,
      visualPolishScore: review.visualPolishScore,
      nonPlaceholderResult: review.nonPlaceholderResult,
      builtInCatReuseDetected: review.builtInCatReuseDetected === true,
      conflictWithAutomatedScore: review.conflictWithAutomatedScore,
      finalStatus: review.finalStatus,
      reasonCodes: review.reasonCodes
    })),
    targetExperienceCount: gate.targetExperienceCount,
    engineeringOnlyCount: gate.engineeringOnlyCount,
    blockedCount: gate.blockedCount,
    failedCount: gate.failedCount,
    status: gate.status,
    reasonCodes: gate.reasonCodes
  };
}

export function v37HumanVisualAcceptanceHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function reviewOne(input: V37HumanVisualReviewInput): V37HumanVisualReviewItem {
  const reasonCodes = new Set<string>();
  if (input.identityScore < 0.78) reasonCodes.add("identity_score_too_low");
  if (input.motionReadabilityScore < 0.72) reasonCodes.add("motion_readability_too_low");
  if (input.visualPolishScore < 0.68) reasonCodes.add("visual_polish_too_low");
  if (input.nonPlaceholderResult === "failed") reasonCodes.add("placeholder_or_line_art_detected");
  if (input.builtInCatReuseDetected === true) reasonCodes.add("built_in_cat_reuse_detected");
  if (v37HumanVisualAcceptanceHasForbiddenContent(input)) reasonCodes.add("security_boundary_failed");
  const finalStatus: V35RubricStatus = reasonCodes.has("security_boundary_failed") || input.automatedStatus === "blocked"
    ? "blocked"
    : reasonCodes.size > 0 || input.automatedStatus === "failed"
      ? "failed"
      : input.identityScore >= 0.84 && input.motionReadabilityScore >= 0.76 && input.visualPolishScore >= 0.72
        ? "target_experience"
        : "engineering_only";
  return {
    ...input,
    reviewerRole: "codex_visual_reviewer",
    conflictWithAutomatedScore: input.automatedStatus !== finalStatus,
    finalStatus,
    reasonCodes: reasonCodes.size === 0 ? ["human_visual_review_passed"] : Array.from(reasonCodes).sort()
  };
}
