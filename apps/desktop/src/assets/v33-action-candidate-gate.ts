import {
  buildV30EvidenceSnapshot,
  runV30MotionReadabilityQA,
  type V30Candidate,
  type V30MotionReadabilityResult
} from "./semantic-animation-quality";
import {
  buildV31ArtQualityEvidenceSnapshot,
  runV31ArtQualityRubric,
  type V31ArtQualityCandidate,
  type V31ArtQualityResult
} from "./v31-art-quality";
import {
  buildV32QualityRescueEvidenceSnapshot,
  runV32QualityRescueGate,
  type V32QualityRescueCandidate,
  type V32QualityRescueResult
} from "./v32-quality-rescue";
import {
  buildV33IdentityEvidenceSnapshot,
  type V33IdentityGateResult
} from "./v33-identity-contract";
import type { V33PhaseStatus, V33ReasonCode } from "./v33-sample-intake";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V33CandidateQaResult = {
  semanticQa: V30MotionReadabilityResult;
  artQa: V31ArtQualityResult;
  frameQa: V32QualityRescueResult;
  identityQa: V33IdentityGateResult;
  overallStatus: V33PhaseStatus;
  reasonCodes: V33ReasonCode[];
  repairGuidance: string[];
};

export function runV33CandidateQa(options: {
  semanticCandidate: V30Candidate;
  artCandidate: V31ArtQualityCandidate;
  frameCandidate: V32QualityRescueCandidate;
  identityGate: V33IdentityGateResult;
}): V33CandidateQaResult {
  const semanticQa = runV30MotionReadabilityQA(options.semanticCandidate);
  const artQa = runV31ArtQualityRubric(options.artCandidate);
  const frameQa = runV32QualityRescueGate(options.frameCandidate);
  const identityQa = options.identityGate;
  const reasonCodes = new Set<V33ReasonCode>();
  if (semanticQa.reasonCodes.includes("whole_image_transform_only")) reasonCodes.add("whole_image_transform");
  if (semanticQa.reasonCodes.includes("motion_amplitude_too_low") || semanticQa.reasonCodes.includes("action_semantics_unreadable")) reasonCodes.add("weak_motion");
  if (semanticQa.reasonCodes.includes("storyboard_missing")) reasonCodes.add("missing_core_action");
  if (artQa.reasonCodes.includes("visual_polish_too_low") || artQa.reasonCodes.includes("placeholder_line_art_rejected")) reasonCodes.add("low_art_quality");
  if (frameQa.status !== "passed") reasonCodes.add("frame_quality_failed");
  if (identityQa.reasonCodes.includes("trait_confidence_low")) reasonCodes.add("trait_confidence_low");
  if (identityQa.reasonCodes.includes("identity_drift")) reasonCodes.add("identity_drift");
  if (v33CandidateQaHasForbiddenContent(options)) reasonCodes.add("privacy_boundary_failed");

  const statuses = [semanticQa.status, artQa.status, frameQa.status, identityQa.status];
  const overallStatus: V33PhaseStatus = statuses.includes("blocked") || reasonCodes.has("privacy_boundary_failed") || reasonCodes.has("trait_confidence_low")
    ? "blocked"
    : statuses.includes("failed") || reasonCodes.size > 0
      ? "failed"
      : "passed";
  return {
    semanticQa,
    artQa,
    frameQa,
    identityQa,
    overallStatus,
    reasonCodes: reasonCodes.size === 0 ? ["sample_intake_passed"] : Array.from(reasonCodes).sort(),
    repairGuidance: guidanceFor(reasonCodes)
  };
}

export function buildV33CandidateQaEvidenceSnapshot(result: V33CandidateQaResult) {
  return {
    overallStatus: result.overallStatus,
    reasonCodes: result.reasonCodes,
    semanticQa: buildV30EvidenceSnapshot(result.semanticQa),
    artQa: buildV31ArtQualityEvidenceSnapshot(result.artQa),
    frameQa: buildV32QualityRescueEvidenceSnapshot(result.frameQa),
    identityQa: buildV33IdentityEvidenceSnapshot(result.identityQa),
    repairGuidance: result.repairGuidance
  };
}

export function v33CandidateQaHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function guidanceFor(reasonCodes: Set<V33ReasonCode>) {
  const guidance: string[] = [];
  if (reasonCodes.has("whole_image_transform")) guidance.push("Reject transform-only animation and require local part motion.");
  if (reasonCodes.has("weak_motion")) guidance.push("Add readable key poses for each core action.");
  if (reasonCodes.has("low_art_quality")) guidance.push("Replace placeholder art with polished frameSequence or reviewed rig output.");
  if (reasonCodes.has("frame_quality_failed")) guidance.push("Increase frame count, motion delta, transparent background, and small-scale readability.");
  if (reasonCodes.has("identity_drift")) guidance.push("Rebuild candidate against the named character design contract.");
  if (guidance.length === 0) guidance.push("Candidate is scoped acceptable for the named sample and named local pack only.");
  return guidance;
}
