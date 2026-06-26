import type { V33CharacterDesignContract } from "./v33-identity-contract";
import type { V33PhaseStatus } from "./v33-sample-intake";
import {
  type V34SegmentationMaskRecord,
  v34SegmentationMaskHasForbiddenContent
} from "./v34-segmentation-mask";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V34PosePart =
  | "head"
  | "body"
  | "leftEar"
  | "rightEar"
  | "eyes"
  | "tail"
  | "frontLegs"
  | "backLegs";
export type V34CanonicalPose = "compact_sitting" | "standing_side" | "curled_sleeping" | "unknown";
export type V34PartConfidence = "high" | "medium" | "low" | "missing";
export type V34PoseReasonCode =
  | "sample_intake_passed"
  | "pose_estimate_failed"
  | "part_map_incomplete"
  | "segmentation_failed"
  | "character_design_blocked"
  | "privacy_boundary_failed";

export type V34PosePartMapRecord = {
  sampleId: string;
  status: V33PhaseStatus;
  canonicalPose: V34CanonicalPose;
  visibleParts: V34PosePart[];
  partConfidence: Record<V34PosePart, V34PartConfidence>;
  missingOrLowConfidenceParts: V34PosePart[];
  reasonCodes: V34PoseReasonCode[];
};

export type V34PosePartMapInput = {
  mask: V34SegmentationMaskRecord;
  designContract?: V33CharacterDesignContract;
  canonicalPose?: V34CanonicalPose;
  partConfidence?: Partial<Record<V34PosePart, V34PartConfidence>>;
};

const allParts: V34PosePart[] = ["head", "body", "leftEar", "rightEar", "eyes", "tail", "frontLegs", "backLegs"];

export function createV34PosePartMapRecord(input: V34PosePartMapInput): V34PosePartMapRecord {
  const reasonCodes = new Set<V34PoseReasonCode>();
  const partConfidence = normalizePartConfidence(input.partConfidence, input.mask);
  const missingOrLowConfidenceParts = allParts.filter((part) =>
    partConfidence[part] === "missing" || partConfidence[part] === "low"
  );
  const visibleParts = allParts.filter((part) =>
    partConfidence[part] === "high" || partConfidence[part] === "medium"
  );

  if (input.mask.status !== "passed") {
    reasonCodes.add("segmentation_failed");
    reasonCodes.add("pose_estimate_failed");
  }
  if (input.designContract && input.designContract.reviewStatus !== "passed") {
    reasonCodes.add("character_design_blocked");
  }
  if (missingOrLowConfidenceParts.length > 0) {
    reasonCodes.add("part_map_incomplete");
  }
  if (visibleParts.length === 0) {
    reasonCodes.add("pose_estimate_failed");
  }

  let status: V33PhaseStatus = "passed";
  if (input.mask.status === "failed") {
    status = "failed";
  } else if (reasonCodes.size > 0) {
    status = "blocked";
  }

  const record: V34PosePartMapRecord = {
    sampleId: input.mask.sampleId,
    status,
    canonicalPose: status === "passed" ? input.canonicalPose ?? "compact_sitting" : "unknown",
    visibleParts,
    partConfidence,
    missingOrLowConfidenceParts,
    reasonCodes: reasonCodes.size === 0 ? ["sample_intake_passed"] : Array.from(reasonCodes).sort()
  };

  if (v34PosePartMapHasForbiddenContent(record) || v34SegmentationMaskHasForbiddenContent(input.mask)) {
    return {
      ...record,
      status: "blocked",
      reasonCodes: [...new Set<V34PoseReasonCode>([...record.reasonCodes, "privacy_boundary_failed"])].sort()
    };
  }
  return record;
}

export function buildV34PosePartMapEvidenceSnapshot(records: V34PosePartMapRecord[]) {
  return {
    records: records.map((record) => ({
      sampleId: record.sampleId,
      status: record.status,
      canonicalPose: record.canonicalPose,
      visibleParts: record.visibleParts,
      missingOrLowConfidenceParts: record.missingOrLowConfidenceParts,
      reasonCodes: record.reasonCodes
    })),
    passedCount: records.filter((record) => record.status === "passed").length,
    blockedCount: records.filter((record) => record.status === "blocked").length,
    failedCount: records.filter((record) => record.status === "failed").length,
    referencableByCharacterAssetContractCount: records.filter((record) =>
      record.status === "passed"
      && record.visibleParts.length === allParts.length
      && record.missingOrLowConfidenceParts.length === 0
    ).length,
    privacyBoundary: {
      storesRawPhoto: false,
      readsRawPhotoBytes: false,
      uploadsByDefault: false,
      persistsExifGps: false,
      persistsSourceFileName: false,
      persistsFullPath: false,
      includesProviderCall: false
    }
  };
}

export function v34PosePartMapHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function normalizePartConfidence(
  override: Partial<Record<V34PosePart, V34PartConfidence>> | undefined,
  mask: V34SegmentationMaskRecord
): Record<V34PosePart, V34PartConfidence> {
  const defaultConfidence: V34PartConfidence = mask.status === "passed"
    && mask.foregroundCoverageBucket !== "partial"
    && mask.alphaCoverageBucket !== "weak"
    ? "high"
    : "missing";
  return Object.fromEntries(allParts.map((part) => [
    part,
    override?.[part] ?? defaultConfidence
  ])) as Record<V34PosePart, V34PartConfidence>;
}
