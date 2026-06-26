import type { V33ReasonCode, V33SampleClass, V33SampleIntakeRecord, V33PhaseStatus } from "./v33-sample-intake";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V34SubjectCount = "none" | "one" | "multiple" | "unknown";
export type V34ConfidenceBucket = "high" | "medium" | "low";
export type V34VisibleRatioBucket = "high" | "medium" | "low" | "unknown";
export type V34SafeBoundingBoxBucket = "full_body" | "partial_body" | "unavailable";
export type V34SourceBoundary = "local_safe_fixture" | "public_web_stripped_thumbnail" | "approved_user_sample";

export type V34PhotoSampleSetRecord = {
  sampleSetId: string;
  sampleIds: string[];
  sourceBoundary: V34SourceBoundary;
  hasClearSamples: boolean;
  hasDifficultSamples: boolean;
  hasNegativeSamples: boolean;
  evidenceRefs: string[];
};

export type V34SubjectDetectionRecord = {
  sampleId: string;
  status: V33PhaseStatus;
  subjectCount: V34SubjectCount;
  catSubjectConfidence: V34ConfidenceBucket;
  visibleRatio: V34VisibleRatioBucket;
  safeBoundingBoxBucket: V34SafeBoundingBoxBucket;
  reasonCodes: V33ReasonCode[];
  evidenceRefs: string[];
};

export function buildV34PhotoSampleSetRecord(options: {
  sampleSetId: string;
  sourceBoundary?: V34SourceBoundary;
  records: V33SampleIntakeRecord[];
  evidenceRefs?: string[];
}): V34PhotoSampleSetRecord {
  const sampleIds = options.records.map((record) => record.sampleId).sort();
  const sampleClasses = new Set<V33SampleClass>(options.records.map((record) => record.sampleClass));
  return {
    sampleSetId: sanitizeId(options.sampleSetId, "v34_sample_set"),
    sampleIds,
    sourceBoundary: options.sourceBoundary ?? "local_safe_fixture",
    hasClearSamples: sampleClasses.has("clear"),
    hasDifficultSamples: sampleClasses.has("difficult"),
    hasNegativeSamples: sampleClasses.has("negative") || sampleClasses.has("blocked"),
    evidenceRefs: sanitizeEvidenceRefs([
      ...(options.evidenceRefs ?? []),
      ...options.records.flatMap((record) => record.evidenceRefs)
    ])
  };
}

export function createV34SubjectDetectionRecord(intake: V33SampleIntakeRecord): V34SubjectDetectionRecord {
  const reasonCodes = new Set<V33ReasonCode>(intake.reasonCodes);
  const status = subjectStatusFor(intake, reasonCodes);
  const record: V34SubjectDetectionRecord = {
    sampleId: intake.sampleId,
    status,
    subjectCount: subjectCountFor(intake, reasonCodes),
    catSubjectConfidence: confidenceFor(intake, reasonCodes),
    visibleRatio: visibleRatioFor(intake, reasonCodes),
    safeBoundingBoxBucket: boundingBoxFor(intake, reasonCodes, status),
    reasonCodes: Array.from(reasonCodes).sort(),
    evidenceRefs: sanitizeEvidenceRefs(intake.evidenceRefs)
  };
  if (v34SubjectDetectionHasForbiddenContent(record)) {
    return {
      ...record,
      status: "blocked",
      reasonCodes: [...new Set<V33ReasonCode>([...record.reasonCodes, "privacy_boundary_failed"])].sort()
    };
  }
  return record;
}

export function buildV34SubjectDetectionEvidenceSnapshot(options: {
  sampleSet: V34PhotoSampleSetRecord;
  detections: V34SubjectDetectionRecord[];
}) {
  return {
    sampleSet: options.sampleSet,
    statusBySample: options.detections.map((record) => ({
      sampleId: record.sampleId,
      status: record.status,
      subjectCount: record.subjectCount,
      catSubjectConfidence: record.catSubjectConfidence,
      visibleRatio: record.visibleRatio,
      safeBoundingBoxBucket: record.safeBoundingBoxBucket,
      reasonCodes: record.reasonCodes
    })),
    passedCount: options.detections.filter((record) => record.status === "passed").length,
    blockedCount: options.detections.filter((record) => record.status === "blocked").length,
    failedCount: options.detections.filter((record) => record.status === "failed").length,
    singleCatPassedCount: options.detections.filter((record) =>
      record.status === "passed" && record.subjectCount === "one"
    ).length,
    negativeRejectedCount: options.detections.filter((record) =>
      record.status !== "passed" && (record.subjectCount === "multiple" || record.subjectCount === "none")
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

export function v34SubjectDetectionHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function subjectStatusFor(intake: V33SampleIntakeRecord, reasonCodes: Set<V33ReasonCode>): V33PhaseStatus {
  if (intake.status === "blocked" || reasonCodes.has("privacy_boundary_failed") || reasonCodes.has("unsafe_metadata")) {
    return "blocked";
  }
  if (
    intake.status === "failed"
    || reasonCodes.has("not_cat")
    || reasonCodes.has("multi_subject")
    || reasonCodes.has("photo_missing")
    || reasonCodes.has("low_resolution")
    || reasonCodes.has("unsupported_media_type")
    || reasonCodes.has("photo_too_large")
  ) {
    return "failed";
  }
  if (reasonCodes.has("insufficient_body_visibility") || reasonCodes.has("trait_confidence_low")) {
    return "blocked";
  }
  if (reasonCodes.size === 0) {
    reasonCodes.add("sample_intake_passed");
  }
  return "passed";
}

function subjectCountFor(intake: V33SampleIntakeRecord, reasonCodes: Set<V33ReasonCode>): V34SubjectCount {
  if (reasonCodes.has("not_cat")) return "none";
  if (reasonCodes.has("multi_subject")) return "multiple";
  if (reasonCodes.has("photo_missing") || intake.status === "blocked") return "unknown";
  return "one";
}

function confidenceFor(intake: V33SampleIntakeRecord, reasonCodes: Set<V33ReasonCode>): V34ConfidenceBucket {
  if (reasonCodes.has("not_cat") || reasonCodes.has("multi_subject") || reasonCodes.has("trait_confidence_low")) {
    return "low";
  }
  return intake.traitSummary.confidence;
}

function visibleRatioFor(intake: V33SampleIntakeRecord, reasonCodes: Set<V33ReasonCode>): V34VisibleRatioBucket {
  if (reasonCodes.has("photo_missing")) return "unknown";
  if (reasonCodes.has("insufficient_body_visibility")) return "low";
  if (intake.sampleClass === "difficult") return "medium";
  return intake.status === "passed" ? "high" : "low";
}

function boundingBoxFor(
  intake: V33SampleIntakeRecord,
  reasonCodes: Set<V33ReasonCode>,
  status: V33PhaseStatus
): V34SafeBoundingBoxBucket {
  if (status !== "passed") return "unavailable";
  if (reasonCodes.has("insufficient_body_visibility") || intake.sampleClass === "difficult") return "partial_body";
  return "full_body";
}

function sanitizeEvidenceRefs(refs: string[]) {
  return refs
    .map((ref) => ref.replace(/\\/g, "/").replace(/[^A-Za-z0-9._/-]/g, "_").slice(0, 120))
    .filter((ref) => ref && !FORBIDDEN_PATTERN.test(ref));
}

function sanitizeId(value: string, fallback: string) {
  const normalized = value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 96);
  return /^[A-Za-z0-9._-]{1,96}$/.test(normalized) ? normalized : fallback;
}
