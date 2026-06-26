import type { V33PhaseStatus } from "./v33-sample-intake";
import {
  type V34SubjectDetectionRecord,
  v34SubjectDetectionHasForbiddenContent
} from "./v34-subject-detection";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V34SegmentationReasonCode =
  | "sample_intake_passed"
  | "subject_detection_failed"
  | "segmentation_failed"
  | "mask_background_leakage"
  | "privacy_boundary_failed"
  | "transparent_crop_missing";

export type V34ForegroundCoverageBucket = "complete" | "usable" | "partial" | "missing";
export type V34BackgroundLeakageBucket = "none" | "low" | "medium" | "high" | "unknown";
export type V34AlphaCoverageBucket = "tight" | "usable" | "weak" | "missing";

export type V34SegmentationMaskRecord = {
  sampleId: string;
  status: V33PhaseStatus;
  foregroundCoverageBucket: V34ForegroundCoverageBucket;
  backgroundLeakageBucket: V34BackgroundLeakageBucket;
  alphaCoverageBucket: V34AlphaCoverageBucket;
  transparentCropEvidenceRef: string;
  reasonCodes: V34SegmentationReasonCode[];
};

export type V34SegmentationMaskInput = {
  detection: V34SubjectDetectionRecord;
  transparentCropEvidenceRef?: string;
  foregroundCoverageRatio?: number;
  backgroundLeakageRatio?: number;
  alphaCoverageRatio?: number;
};

export function createV34SegmentationMaskRecord(input: V34SegmentationMaskInput): V34SegmentationMaskRecord {
  const detection = input.detection;
  const foregroundCoverageBucket = foregroundCoverageFor(input.foregroundCoverageRatio, detection);
  const backgroundLeakageBucket = backgroundLeakageFor(input.backgroundLeakageRatio, detection);
  const alphaCoverageBucket = alphaCoverageFor(input.alphaCoverageRatio, detection);
  const transparentCropEvidenceRef = sanitizeEvidenceRef(
    input.transparentCropEvidenceRef ?? `docs/V34.x/evidence/derivatives/${detection.sampleId}-transparent-crop`
  );
  const reasonCodes = new Set<V34SegmentationReasonCode>();

  if (detection.status !== "passed" || detection.subjectCount !== "one") {
    reasonCodes.add("subject_detection_failed");
  }
  if (!transparentCropEvidenceRef) {
    reasonCodes.add("transparent_crop_missing");
  }
  if (foregroundCoverageBucket === "missing" || foregroundCoverageBucket === "partial") {
    reasonCodes.add("segmentation_failed");
  }
  if (backgroundLeakageBucket === "high" || backgroundLeakageBucket === "unknown") {
    reasonCodes.add("mask_background_leakage");
  }
  if (alphaCoverageBucket === "missing" || alphaCoverageBucket === "weak") {
    reasonCodes.add("segmentation_failed");
  }

  let status: V33PhaseStatus = "passed";
  if (reasonCodes.has("subject_detection_failed")) {
    status = detection.status === "failed" ? "failed" : "blocked";
  } else if (reasonCodes.has("mask_background_leakage") || reasonCodes.has("segmentation_failed") || reasonCodes.has("transparent_crop_missing")) {
    status = "blocked";
  }

  const record: V34SegmentationMaskRecord = {
    sampleId: detection.sampleId,
    status,
    foregroundCoverageBucket,
    backgroundLeakageBucket,
    alphaCoverageBucket,
    transparentCropEvidenceRef,
    reasonCodes: Array.from(reasonCodes).sort()
  };

  if (v34SegmentationMaskHasForbiddenContent(record) || v34SubjectDetectionHasForbiddenContent(detection)) {
    return {
      ...record,
      status: "blocked",
      reasonCodes: [...new Set<V34SegmentationReasonCode>([...record.reasonCodes, "privacy_boundary_failed"])].sort()
    };
  }
  return record;
}

export function buildV34SegmentationMaskEvidenceSnapshot(records: V34SegmentationMaskRecord[]) {
  return {
    records: records.map((record) => ({
      sampleId: record.sampleId,
      status: record.status,
      foregroundCoverageBucket: record.foregroundCoverageBucket,
      backgroundLeakageBucket: record.backgroundLeakageBucket,
      alphaCoverageBucket: record.alphaCoverageBucket,
      transparentCropEvidenceRef: record.transparentCropEvidenceRef,
      reasonCodes: record.reasonCodes
    })),
    passedCount: records.filter((record) => record.status === "passed").length,
    blockedCount: records.filter((record) => record.status === "blocked").length,
    failedCount: records.filter((record) => record.status === "failed").length,
    eligibleForCharacterAssetCount: records.filter((record) =>
      record.status === "passed"
      && record.backgroundLeakageBucket !== "high"
      && record.alphaCoverageBucket !== "weak"
      && record.foregroundCoverageBucket !== "partial"
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

export function v34SegmentationMaskHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function foregroundCoverageFor(
  ratio: number | undefined,
  detection: V34SubjectDetectionRecord
): V34ForegroundCoverageBucket {
  if (detection.status !== "passed") return "missing";
  const value = ratio ?? (detection.safeBoundingBoxBucket === "full_body" ? 0.9 : 0.7);
  if (value >= 0.85) return "complete";
  if (value >= 0.72) return "usable";
  if (value >= 0.55) return "partial";
  return "missing";
}

function backgroundLeakageFor(
  ratio: number | undefined,
  detection: V34SubjectDetectionRecord
): V34BackgroundLeakageBucket {
  if (detection.status !== "passed") return "unknown";
  const value = ratio ?? (detection.visibleRatio === "high" ? 0.05 : 0.16);
  if (value <= 0.02) return "none";
  if (value <= 0.1) return "low";
  if (value <= 0.22) return "medium";
  return "high";
}

function alphaCoverageFor(ratio: number | undefined, detection: V34SubjectDetectionRecord): V34AlphaCoverageBucket {
  if (detection.status !== "passed") return "missing";
  const value = ratio ?? (detection.catSubjectConfidence === "high" ? 0.92 : 0.78);
  if (value >= 0.88) return "tight";
  if (value >= 0.72) return "usable";
  if (value >= 0.5) return "weak";
  return "missing";
}

function sanitizeEvidenceRef(ref: string) {
  const normalized = ref.replace(/\\/g, "/").replace(/[^A-Za-z0-9._/-]/g, "_").slice(0, 140);
  return normalized && !FORBIDDEN_PATTERN.test(normalized) ? normalized : "";
}
