import {
  buildPhotoIntakeEvidenceSnapshot,
  createPhotoIntakePrivacySession,
  photoIntakeHasForbiddenContent,
  type PhotoIntakeSession
} from "./photo-intake-privacy-boundary";
import {
  buildPhotoSuitabilityEvidenceSnapshot,
  evaluatePhotoSuitability,
  photoSuitabilityHasForbiddenContent,
  type CatTraitSummary,
  type PhotoSuitabilityInput,
  type PhotoSuitabilityResult
} from "./photo-suitability-traits";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V33PhaseStatus = "passed" | "blocked" | "failed";
export type V33SampleClass = "clear" | "difficult" | "blocked" | "negative";

export type V33ReasonCode =
  | "sample_intake_passed"
  | "low_resolution"
  | "not_cat"
  | "multi_subject"
  | "unsafe_metadata"
  | "insufficient_body_visibility"
  | "subject_detection_failed"
  | "segmentation_failed"
  | "pose_estimate_failed"
  | "trait_confidence_low"
  | "identity_drift"
  | "character_design_blocked"
  | "rig_export_blocked"
  | "missing_core_action"
  | "weak_motion"
  | "whole_image_transform"
  | "low_art_quality"
  | "frame_quality_failed"
  | "preview_failed"
  | "apply_blocked"
  | "rollback_failed"
  | "privacy_boundary_failed"
  | "unsupported_media_type"
  | "photo_too_large"
  | "photo_missing"
  | "sample_blocked"
  | "sample_failed";

export type V33SafeSampleInput = {
  sampleId: string;
  sampleClass: V33SampleClass;
  catName?: string;
  approvedTraits?: string;
  localReferenceConsent: boolean;
  photo?: {
    mediaType?: string;
    sizeBytes?: number;
    fileExtension?: "png" | "jpg" | "jpeg" | "webp" | string;
  } | null;
  width?: number;
  height?: number;
  qualitySignals?: PhotoSuitabilityInput["qualitySignals"];
  visualHints?: PhotoSuitabilityInput["visualHints"];
  evidenceRefs?: string[];
};

export type V33SampleIntakeRecord = {
  sampleId: string;
  sampleClass: V33SampleClass;
  status: V33PhaseStatus;
  reasonCode: V33ReasonCode;
  reasonCodes: V33ReasonCode[];
  safeTraitsAvailable: boolean;
  traitSummary: CatTraitSummary;
  evidenceRefs: string[];
  intakeSnapshot: ReturnType<typeof buildPhotoIntakeEvidenceSnapshot>;
  suitabilitySnapshot: ReturnType<typeof buildPhotoSuitabilityEvidenceSnapshot>;
  privacyBoundary: {
    storesRawPhoto: false;
    readsRawPhotoBytes: false;
    uploadsByDefault: false;
    persistsExifGps: false;
    persistsSourceFileName: false;
    persistsFullPath: false;
    includesProviderCall: false;
  };
};

export function createV33SampleIntakeRecord(input: V33SafeSampleInput): V33SampleIntakeRecord {
  const safeSampleId = sanitizeId(input.sampleId, "v33_sample");
  const privacySession = createPhotoIntakePrivacySession({
    catName: input.catName,
    approvedTraits: input.approvedTraits,
    localReferenceConsent: input.localReferenceConsent,
    photo: input.photo
      ? {
          fileName: safeSyntheticFileName(input.photo.fileExtension),
          mediaType: input.photo.mediaType,
          sizeBytes: input.photo.sizeBytes
        }
      : null
  });
  const suitability = evaluatePhotoSuitability({
    safeSampleId,
    selectedState: input.photo ? "selected" : "not_selected",
    mediaType: input.photo?.mediaType,
    sizeBytes: input.photo?.sizeBytes,
    width: input.width,
    height: input.height,
    sourceLabel: input.sampleClass,
    qualitySignals: input.qualitySignals,
    visualHints: input.visualHints
  });
  const reasonCodes = mapReasonCodes(input, privacySession, suitability);
  const status = statusFor(input, privacySession, suitability, reasonCodes);
  if (status === "passed" && reasonCodes.length === 0) {
    reasonCodes.push("sample_intake_passed");
  }
  const evidenceRefs = sanitizeEvidenceRefs(input.evidenceRefs ?? []);
  const record: V33SampleIntakeRecord = {
    sampleId: safeSampleId,
    sampleClass: input.sampleClass,
    status,
    reasonCode: reasonCodes[0] ?? "sample_intake_passed",
    reasonCodes: [...new Set(reasonCodes)].sort(),
    safeTraitsAvailable: status === "passed" && suitability.traitSummary.confidence !== "low",
    traitSummary: suitability.traitSummary,
    evidenceRefs,
    intakeSnapshot: buildPhotoIntakeEvidenceSnapshot(privacySession),
    suitabilitySnapshot: buildPhotoSuitabilityEvidenceSnapshot(suitability),
    privacyBoundary: privacySession.privacyBoundary
  };
  if (v33SampleIntakeHasForbiddenContent(record)) {
    return {
      ...record,
      status: "blocked",
      reasonCode: "privacy_boundary_failed",
      reasonCodes: [...new Set<V33ReasonCode>([...record.reasonCodes, "privacy_boundary_failed"])].sort(),
      safeTraitsAvailable: false
    };
  }
  return record;
}

export function buildV33SampleIntakeEvidenceSnapshot(records: V33SampleIntakeRecord[]) {
  return {
    statusBySample: records.map((record) => ({
      sampleId: record.sampleId,
      sampleClass: record.sampleClass,
      status: record.status,
      reasonCodes: record.reasonCodes,
      safeTraitsAvailable: record.safeTraitsAvailable
    })),
    passedCount: records.filter((record) => record.status === "passed").length,
    blockedCount: records.filter((record) => record.status === "blocked").length,
    failedCount: records.filter((record) => record.status === "failed").length,
    privacyBoundary: {
      storesRawPhoto: false,
      readsRawPhotoBytes: false,
      uploadsByDefault: false,
      persistsExifGps: false,
      persistsSourceFileName: false,
      persistsFullPath: false
    }
  };
}

export function v33SampleIntakeHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value))
    || photoIntakeHasForbiddenContent(value)
    || photoSuitabilityHasForbiddenContent(value);
}

function mapReasonCodes(
  input: V33SafeSampleInput,
  privacySession: PhotoIntakeSession,
  suitability: PhotoSuitabilityResult
): V33ReasonCode[] {
  const codes: V33ReasonCode[] = [];
  if (input.sampleClass === "blocked") codes.push("sample_blocked");
  if (input.sampleClass === "negative") codes.push("sample_failed");
  if (privacySession.status === "rejected") {
    if (privacySession.reasonCode === "local_reference_consent_required") codes.push("privacy_boundary_failed");
    if (privacySession.reasonCode === "photo_type_unsupported") codes.push("unsupported_media_type");
    if (privacySession.reasonCode === "photo_too_large") codes.push("photo_too_large");
    if (privacySession.reasonCode === "trait_invalid") codes.push("unsafe_metadata");
  }
  for (const code of suitability.reasonCodes) {
    if (code === "photo_missing") codes.push("photo_missing");
    if (code === "photo_low_resolution") codes.push("low_resolution");
    if (code === "photo_type_unsupported") codes.push("unsupported_media_type");
    if (code === "photo_too_large") codes.push("photo_too_large");
    if (code === "multi_cat_ambiguous") codes.push("multi_subject");
    if (code === "unsafe_metadata_rejected") codes.push("unsafe_metadata");
    if (code === "cat_cropped" || code === "cat_occluded") codes.push("insufficient_body_visibility");
    if (code === "trait_summary_low_confidence") codes.push("trait_confidence_low");
  }
  if (input.qualitySignals?.catCount === 0) codes.push("not_cat");
  return [...new Set(codes)];
}

function statusFor(
  input: V33SafeSampleInput,
  privacySession: PhotoIntakeSession,
  suitability: PhotoSuitabilityResult,
  reasonCodes: V33ReasonCode[]
): V33PhaseStatus {
  if (reasonCodes.includes("privacy_boundary_failed") || reasonCodes.includes("unsafe_metadata") || input.sampleClass === "blocked") {
    return "blocked";
  }
  if (privacySession.status === "rejected" || suitability.status === "unsuitable" || input.sampleClass === "negative") {
    return "failed";
  }
  return "passed";
}

function safeSyntheticFileName(extension: string | undefined) {
  const ext = (extension ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `sample.${ext || "png"}`;
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
