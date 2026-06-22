const ACCEPTED_MEDIA_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_PHOTO_BYTES = 12 * 1024 * 1024;
const MIN_DIMENSION_PX = 384;
const MIN_CLEAR_BLUR_SCORE = 0.42;
const RISK_BLUR_SCORE = 0.58;
const MIN_VISIBLE_RATIO = 0.35;
const RISK_VISIBLE_RATIO = 0.55;
const MAX_OCCLUSION_SCORE = 0.72;
const RISK_OCCLUSION_SCORE = 0.38;
const RISK_BACKGROUND_COMPLEXITY = 0.72;

const FORBIDDEN_TEXT_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b/i;
const PATH_PATTERN = /(?:\/Users\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/])/i;
const URL_PATTERN = /\b(?:https?|wss?|file):\/\//i;

export type PhotoSuitabilityStatus = "clear" | "usable_with_risk" | "unsuitable";

export type PhotoSuitabilityReasonCode =
  | "photo_suitability_clear"
  | "photo_missing"
  | "photo_type_unsupported"
  | "photo_too_large"
  | "photo_low_resolution"
  | "photo_blurry"
  | "cat_cropped"
  | "cat_occluded"
  | "multi_cat_ambiguous"
  | "background_too_complex"
  | "trait_summary_ready"
  | "trait_summary_low_confidence"
  | "unsafe_metadata_rejected";

export type PhotoSuitabilityInput = {
  mediaType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  selectedState?: "selected" | "not_selected";
  safeSampleId?: string;
  sourceLabel?: string;
  qualitySignals?: {
    blurScore?: number;
    catCount?: number;
    catVisibleRatio?: number;
    occlusionScore?: number;
    backgroundComplexity?: number;
    bodyVisible?: boolean;
    tailVisible?: boolean;
  };
  visualHints?: {
    coatColor?: string;
    pattern?: string;
    faceShape?: string;
    eyeColor?: string;
    earShape?: string;
    bodyPose?: string;
    tailVisibility?: "visible" | "partial" | "hidden" | string;
  };
};

export type SafePhotoMetadata = {
  mediaTypeBucket: "png" | "jpeg" | "webp" | "unknown";
  sizeBucket: "small" | "medium" | "large" | "unknown";
  dimensions: {
    widthBucket: "tiny" | "small" | "medium" | "large" | "unknown";
    heightBucket: "tiny" | "small" | "medium" | "large" | "unknown";
    aspectRatioBucket: "portrait" | "square" | "landscape" | "unknown";
  };
  selectedState: "selected" | "not_selected";
  safeSampleId: string;
};

export type CatTraitSummary = {
  coatColorBucket: string;
  patternBucket: string;
  faceShapeBucket: string;
  eyeColorBucket: string;
  earShapeBucket: string;
  tailVisibility: "visible" | "partial" | "hidden" | "unknown";
  bodyPose: string;
  confidence: "high" | "medium" | "low";
  source: "safe_visual_hints" | "metadata_only";
};

export type PhotoSuitabilityResult = {
  status: PhotoSuitabilityStatus;
  primaryReasonCode: PhotoSuitabilityReasonCode;
  reasonCodes: PhotoSuitabilityReasonCode[];
  safeMetadata: SafePhotoMetadata;
  traitSummary: CatTraitSummary;
  userGuidance: string[];
  privacyBoundary: {
    storesSourceImageBytes: false;
    persistsExifGps: false;
    persistsSourceFileName: false;
    persistsFullPath: false;
    callsProvider: false;
    mutatesLivePet: false;
  };
};

export function evaluatePhotoSuitability(input: PhotoSuitabilityInput): PhotoSuitabilityResult {
  const safeMetadata = buildSafePhotoMetadata(input);
  const reasonCodes: PhotoSuitabilityReasonCode[] = [];

  if (hasUnsafeMetadata(input)) {
    reasonCodes.push("unsafe_metadata_rejected");
    return result("unsuitable", reasonCodes, safeMetadata, input);
  }

  if (input.selectedState === "not_selected" || !input.mediaType) {
    reasonCodes.push("photo_missing");
    return result("unsuitable", reasonCodes, safeMetadata, input);
  }

  if (!ACCEPTED_MEDIA_TYPES.has(input.mediaType.toLowerCase())) {
    reasonCodes.push("photo_type_unsupported");
  }

  const sizeBytes = finite(input.sizeBytes);
  if (sizeBytes <= 0 || sizeBytes > MAX_PHOTO_BYTES) {
    reasonCodes.push("photo_too_large");
  }

  const width = finite(input.width);
  const height = finite(input.height);
  if (width < MIN_DIMENSION_PX || height < MIN_DIMENSION_PX) {
    reasonCodes.push("photo_low_resolution");
  }

  const quality = input.qualitySignals ?? {};
  const catCount = finiteOrDefault(quality.catCount, 1);
  if (catCount !== 1) {
    reasonCodes.push("multi_cat_ambiguous");
  }

  const blurScore = finiteOrDefault(quality.blurScore, 0.72);
  if (blurScore < MIN_CLEAR_BLUR_SCORE) {
    reasonCodes.push("photo_blurry");
  } else if (blurScore < RISK_BLUR_SCORE) {
    reasonCodes.push("photo_blurry");
  }

  const visibleRatio = finiteOrDefault(quality.catVisibleRatio, 0.78);
  if (visibleRatio < MIN_VISIBLE_RATIO || quality.bodyVisible === false) {
    reasonCodes.push("cat_cropped");
  } else if (visibleRatio < RISK_VISIBLE_RATIO) {
    reasonCodes.push("cat_cropped");
  }

  const occlusionScore = finiteOrDefault(quality.occlusionScore, 0.12);
  if (occlusionScore > RISK_OCCLUSION_SCORE) {
    reasonCodes.push("cat_occluded");
  }

  const backgroundComplexity = finiteOrDefault(quality.backgroundComplexity, 0.35);
  if (backgroundComplexity > RISK_BACKGROUND_COMPLEXITY) {
    reasonCodes.push("background_too_complex");
  }

  if (reasonCodes.length === 0) {
    reasonCodes.push("photo_suitability_clear");
  }

  const hardBlock = reasonCodes.some((code) =>
    [
      "photo_type_unsupported",
      "photo_too_large",
      "photo_low_resolution",
      "multi_cat_ambiguous",
      "unsafe_metadata_rejected"
    ].includes(code)
  ) || blurScore < MIN_CLEAR_BLUR_SCORE || visibleRatio < MIN_VISIBLE_RATIO || occlusionScore > MAX_OCCLUSION_SCORE || quality.bodyVisible === false;

  const status: PhotoSuitabilityStatus = hardBlock
    ? "unsuitable"
    : reasonCodes.includes("photo_suitability_clear")
      ? "clear"
      : "usable_with_risk";

  return result(status, reasonCodes, safeMetadata, input);
}

export function buildPhotoSuitabilityEvidenceSnapshot(evaluation: PhotoSuitabilityResult) {
  return {
    status: evaluation.status,
    primaryReasonCode: evaluation.primaryReasonCode,
    reasonCodes: evaluation.reasonCodes,
    safePhotoFields: Object.keys(evaluation.safeMetadata).sort(),
    safeMetadata: evaluation.safeMetadata,
    traitSummaryFields: Object.keys(evaluation.traitSummary).sort(),
    traitSummary: evaluation.traitSummary,
    privacyBoundary: evaluation.privacyBoundary
  };
}

export function photoSuitabilityHasForbiddenContent(value: unknown) {
  const serialized = JSON.stringify(value);
  return FORBIDDEN_TEXT_PATTERN.test(serialized) || PATH_PATTERN.test(serialized) || URL_PATTERN.test(serialized);
}

function result(
  status: PhotoSuitabilityStatus,
  reasonCodes: PhotoSuitabilityReasonCode[],
  safeMetadata: SafePhotoMetadata,
  input: PhotoSuitabilityInput
): PhotoSuitabilityResult {
  const traitSummary = buildTraitSummary(input);
  const enrichedReasons = [...new Set([
    ...reasonCodes,
    traitSummary.confidence === "low" ? "trait_summary_low_confidence" : "trait_summary_ready"
  ])] as PhotoSuitabilityReasonCode[];
  return {
    status,
    primaryReasonCode: enrichedReasons[0] ?? "photo_suitability_clear",
    reasonCodes: enrichedReasons,
    safeMetadata,
    traitSummary,
    userGuidance: guidanceFor(status, enrichedReasons),
    privacyBoundary: {
      storesSourceImageBytes: false,
      persistsExifGps: false,
      persistsSourceFileName: false,
      persistsFullPath: false,
      callsProvider: false,
      mutatesLivePet: false
    }
  };
}

function buildSafePhotoMetadata(input: PhotoSuitabilityInput): SafePhotoMetadata {
  return {
    mediaTypeBucket: mediaTypeBucket(input.mediaType),
    sizeBucket: sizeBucket(input.sizeBytes),
    dimensions: {
      widthBucket: dimensionBucket(input.width),
      heightBucket: dimensionBucket(input.height),
      aspectRatioBucket: aspectRatioBucket(input.width, input.height)
    },
    selectedState: input.selectedState ?? (input.mediaType ? "selected" : "not_selected"),
    safeSampleId: safeId(input.safeSampleId)
  };
}

function buildTraitSummary(input: PhotoSuitabilityInput): CatTraitSummary {
  const hints = input.visualHints ?? {};
  const hintCount = [
    hints.coatColor,
    hints.pattern,
    hints.faceShape,
    hints.eyeColor,
    hints.earShape,
    hints.bodyPose,
    hints.tailVisibility
  ].filter(Boolean).length;

  return {
    coatColorBucket: safeTrait(hints.coatColor, "unknown-coat"),
    patternBucket: safeTrait(hints.pattern, "unknown-pattern"),
    faceShapeBucket: safeTrait(hints.faceShape, "unknown-face"),
    eyeColorBucket: safeTrait(hints.eyeColor, "unknown-eye"),
    earShapeBucket: safeTrait(hints.earShape, "unknown-ear"),
    tailVisibility: normalizeTailVisibility(hints.tailVisibility, input.qualitySignals?.tailVisible),
    bodyPose: safeTrait(hints.bodyPose, "unknown-pose"),
    confidence: hintCount >= 5 ? "high" : hintCount >= 3 ? "medium" : "low",
    source: hintCount > 0 ? "safe_visual_hints" : "metadata_only"
  };
}

function hasUnsafeMetadata(input: PhotoSuitabilityInput) {
  return [input.safeSampleId, input.sourceLabel, ...Object.values(input.visualHints ?? {})]
    .filter((value): value is string => typeof value === "string")
    .some((value) => FORBIDDEN_TEXT_PATTERN.test(value) || PATH_PATTERN.test(value) || URL_PATTERN.test(value));
}

function guidanceFor(status: PhotoSuitabilityStatus, reasonCodes: PhotoSuitabilityReasonCode[]) {
  if (status === "clear") {
    return ["Photo can proceed to candidate generation routes after explicit consent."];
  }
  const guidance: string[] = [];
  if (reasonCodes.includes("photo_low_resolution")) {
    guidance.push("Use a larger image where the cat is clearly visible.");
  }
  if (reasonCodes.includes("photo_blurry")) {
    guidance.push("Use a sharper photo with the face and body in focus.");
  }
  if (reasonCodes.includes("cat_cropped") || reasonCodes.includes("cat_occluded")) {
    guidance.push("Use a photo where the full cat body is visible and not blocked.");
  }
  if (reasonCodes.includes("multi_cat_ambiguous")) {
    guidance.push("Use one photo containing exactly one cat.");
  }
  if (reasonCodes.includes("background_too_complex")) {
    guidance.push("Prefer a simpler background to reduce identity drift.");
  }
  if (reasonCodes.includes("unsafe_metadata_rejected")) {
    guidance.push("Remove private paths, credentials, URLs, location, and provider payload text.");
  }
  return guidance.length > 0 ? guidance : ["Use a clearer single-cat photo before generation."];
}

function finite(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function finiteOrDefault(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function mediaTypeBucket(mediaType: string | undefined): SafePhotoMetadata["mediaTypeBucket"] {
  const normalized = (mediaType ?? "").toLowerCase();
  if (normalized === "image/png") return "png";
  if (normalized === "image/jpeg") return "jpeg";
  if (normalized === "image/webp") return "webp";
  return "unknown";
}

function sizeBucket(sizeBytes: unknown): SafePhotoMetadata["sizeBucket"] {
  const size = finite(sizeBytes);
  if (size <= 0) return "unknown";
  if (size < 1_000_000) return "small";
  if (size < 5_000_000) return "medium";
  return "large";
}

function dimensionBucket(value: unknown): SafePhotoMetadata["dimensions"]["widthBucket"] {
  const dimension = finite(value);
  if (dimension <= 0) return "unknown";
  if (dimension < MIN_DIMENSION_PX) return "tiny";
  if (dimension < 900) return "small";
  if (dimension < 1800) return "medium";
  return "large";
}

function aspectRatioBucket(widthValue: unknown, heightValue: unknown): SafePhotoMetadata["dimensions"]["aspectRatioBucket"] {
  const width = finite(widthValue);
  const height = finite(heightValue);
  if (width <= 0 || height <= 0) return "unknown";
  const ratio = width / height;
  if (ratio > 1.15) return "landscape";
  if (ratio < 0.85) return "portrait";
  return "square";
}

function safeId(value: string | undefined) {
  const raw = (value ?? "sample_unknown").trim();
  const sanitized = raw.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
  return sanitized || "sample_unknown";
}

function safeTrait(value: string | undefined, fallback: string) {
  const raw = (value ?? "").trim().toLowerCase();
  if (!raw || FORBIDDEN_TEXT_PATTERN.test(raw) || PATH_PATTERN.test(raw) || URL_PATTERN.test(raw)) {
    return fallback;
  }
  return raw.replace(/[^a-z0-9 _-]/g, "").replace(/\s+/g, "-").slice(0, 40) || fallback;
}

function normalizeTailVisibility(
  value: string | undefined,
  tailVisible: boolean | undefined
): CatTraitSummary["tailVisibility"] {
  if (value === "visible" || value === "partial" || value === "hidden") {
    return value;
  }
  if (tailVisible === true) {
    return "visible";
  }
  if (tailVisible === false) {
    return "hidden";
  }
  return "unknown";
}
