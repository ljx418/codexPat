const ACCEPTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const ACCEPTED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);
const MAX_PHOTO_BYTES = 12 * 1024 * 1024;
const REMOTE_URL_PATTERN = /\b(?:https?|wss?):\/\/|file:\/\//i;
const ABSOLUTE_PATH_PATTERN = /(?:^|[\s"'=])(?:\/Users\/|\/var\/|\/tmp\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/])/;
const TOKEN_PATTERN = /\b(?:sk-[A-Za-z0-9_-]{8,}|Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json)\b/i;
const PRIVATE_METADATA_PATTERN = /\b(?:exif|gps|latitude|longitude|geotag|location|raw photo|provider payload|credential|clipboard|screen text)\b/i;

export type Photo2DMimeType = "image/png" | "image/jpeg" | "image/webp";

export type Photo2DReasonCode =
  | "photo_required"
  | "photo_mime_unsupported"
  | "photo_too_large"
  | "photo_decode_failed"
  | "exif_redacted"
  | "consent_required"
  | "provider_terms_required"
  | "provider_credential_missing"
  | "trait_schema_invalid"
  | "security_scan_failed";

export type Photo2DIntakeStatus =
  | "photo_selected"
  | "consent_required"
  | "blocked"
  | "failed";

export type Photo2DConsentProvider = "manual-import" | "minimax";

export type Photo2DPhotoMetadataInput = {
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  hasExif?: boolean;
  decodeOk?: boolean;
};

export type Photo2DIntakeSession = {
  sessionId: string;
  status: Photo2DIntakeStatus;
  sourceKind: "local_photo";
  sourceDigest: string;
  photoMetadata: {
    mimeType?: Photo2DMimeType;
    extension?: string;
    sizeBucket?: "small" | "medium" | "large";
    dimensionBucket?: "small" | "medium" | "large" | "unknown";
    hasExif: boolean;
    exifStripped: boolean;
  };
  consent: {
    providerUploadAllowed: boolean;
    providerName?: Photo2DConsentProvider;
    termsReviewed: boolean;
    consentedAt?: string;
  };
  privacyBoundary: {
    storesRawPhoto: false;
    uploadsByDefault: false;
    persistsExifGps: false;
    persistsSourceFileName: false;
    persistsFullPath: false;
    includesProviderCall: false;
  };
  reasonCode: Photo2DReasonCode;
};

export function createPhoto2DIntakeConsentSession(options: {
  sessionId?: string;
  photo?: Photo2DPhotoMetadataInput | null;
  localProcessingConsent?: boolean;
  providerUploadConsent?: boolean;
  providerName?: Photo2DConsentProvider;
  providerTermsReviewed?: boolean;
  consentedAt?: string;
}): Photo2DIntakeSession {
  const sessionId = safeId(options.sessionId, "photo2d_session");
  if (!options.photo) {
    return buildSession({
      sessionId,
      status: "blocked",
      reasonCode: "photo_required",
      photoMetadata: {
        hasExif: false,
        exifStripped: false
      },
      consent: buildConsent(options)
    });
  }

  if (!options.localProcessingConsent) {
    return buildSession({
      sessionId,
      status: "consent_required",
      reasonCode: "consent_required",
      photoMetadata: photoMetadataSummary(options.photo),
      consent: buildConsent(options)
    });
  }

  if (hasUnsafePhotoMetadata(options.photo)) {
    return buildSession({
      sessionId,
      status: "failed",
      reasonCode: "security_scan_failed",
      photoMetadata: photoMetadataSummary(options.photo),
      consent: buildConsent(options)
    });
  }

  const extension = extensionFromName(options.photo.fileName ?? "");
  const mimeType = normalizeMimeType(options.photo.mimeType ?? "", extension);
  if (!mimeType || !extension || !ACCEPTED_EXTENSIONS.has(extension)) {
    return buildSession({
      sessionId,
      status: "failed",
      reasonCode: "photo_mime_unsupported",
      photoMetadata: photoMetadataSummary(options.photo, mimeType ?? undefined, extension || undefined),
      consent: buildConsent(options)
    });
  }

  const sizeBytes = Number.isFinite(options.photo.sizeBytes) ? Number(options.photo.sizeBytes) : 0;
  if (sizeBytes <= 0 || sizeBytes > MAX_PHOTO_BYTES) {
    return buildSession({
      sessionId,
      status: "failed",
      reasonCode: "photo_too_large",
      photoMetadata: photoMetadataSummary(options.photo, mimeType, extension),
      consent: buildConsent(options)
    });
  }

  if (options.photo.decodeOk === false) {
    return buildSession({
      sessionId,
      status: "failed",
      reasonCode: "photo_decode_failed",
      photoMetadata: photoMetadataSummary(options.photo, mimeType, extension),
      consent: buildConsent(options)
    });
  }

  const consent = buildConsent(options);
  if (consent.providerUploadAllowed && !consent.termsReviewed) {
    return buildSession({
      sessionId,
      status: "consent_required",
      reasonCode: "provider_terms_required",
      photoMetadata: photoMetadataSummary(options.photo, mimeType, extension),
      consent
    });
  }

  return buildSession({
    sessionId,
    status: "photo_selected",
    reasonCode: options.photo.hasExif ? "exif_redacted" : "exif_redacted",
    photoMetadata: photoMetadataSummary(options.photo, mimeType, extension),
    consent
  });
}

export function buildPhoto2DIntakeEvidenceSnapshot(session: Photo2DIntakeSession) {
  return {
    status: session.status,
    reasonCode: session.reasonCode,
    sourceKind: session.sourceKind,
    sourceDigest: session.sourceDigest,
    safePhotoFields: Object.keys(session.photoMetadata).sort(),
    photoMetadata: session.photoMetadata,
    consent: {
      providerUploadAllowed: session.consent.providerUploadAllowed,
      providerName: session.consent.providerName,
      termsReviewed: session.consent.termsReviewed,
      hasConsentedAt: Boolean(session.consent.consentedAt)
    },
    privacyBoundary: session.privacyBoundary
  };
}

export function photo2DIntakeHasForbiddenContent(value: unknown) {
  const serialized = JSON.stringify(value)
    .replace(/persistsExifGps|persistsSourceFileName|persistsFullPath|hasExif|exifStripped|exif_redacted/g, "");
  return /Authorization|api-token\.json|raw payload|raw photo|workspace path|config path|provider payload|prompt text|raw provider response|sourceFileName|sourcePath|fullLocalPath/i.test(serialized)
    || /\/Users\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/]/.test(serialized)
    || /sk-[A-Za-z0-9_-]{8,}/.test(serialized)
    || /\b(?:gps|latitude|longitude|geotag|location|raw exif|exif payload|exif data)\b/i.test(serialized);
}

function buildSession(options: {
  sessionId: string;
  status: Photo2DIntakeStatus;
  reasonCode: Photo2DReasonCode;
  photoMetadata: Photo2DIntakeSession["photoMetadata"];
  consent: Photo2DIntakeSession["consent"];
}): Photo2DIntakeSession {
  return {
    sessionId: options.sessionId,
    status: options.status,
    sourceKind: "local_photo",
    sourceDigest: digestFromSession(options.sessionId),
    photoMetadata: options.photoMetadata,
    consent: options.consent,
    privacyBoundary: {
      storesRawPhoto: false,
      uploadsByDefault: false,
      persistsExifGps: false,
      persistsSourceFileName: false,
      persistsFullPath: false,
      includesProviderCall: false
    },
    reasonCode: options.reasonCode
  };
}

function buildConsent(options: {
  providerUploadConsent?: boolean;
  providerName?: Photo2DConsentProvider;
  providerTermsReviewed?: boolean;
  consentedAt?: string;
}): Photo2DIntakeSession["consent"] {
  const providerUploadAllowed = options.providerUploadConsent === true;
  return {
    providerUploadAllowed,
    providerName: providerUploadAllowed ? options.providerName ?? "manual-import" : "manual-import",
    termsReviewed: providerUploadAllowed ? options.providerTermsReviewed === true : false,
    consentedAt: providerUploadAllowed && options.consentedAt ? safeTimestamp(options.consentedAt) : undefined
  };
}

function photoMetadataSummary(
  photo: Photo2DPhotoMetadataInput,
  mimeType = normalizeMimeType(photo.mimeType ?? "", extensionFromName(photo.fileName ?? "")) ?? undefined,
  extension = extensionFromName(photo.fileName ?? "") || undefined
): Photo2DIntakeSession["photoMetadata"] {
  return {
    mimeType,
    extension,
    sizeBucket: Number.isFinite(photo.sizeBytes) && Number(photo.sizeBytes) > 0 ? sizeBucket(Number(photo.sizeBytes)) : undefined,
    dimensionBucket: dimensionBucket(photo.width, photo.height),
    hasExif: photo.hasExif === true,
    exifStripped: photo.hasExif === true
  };
}

function hasUnsafePhotoMetadata(photo: Photo2DPhotoMetadataInput) {
  return [photo.fileName, photo.mimeType].some((value) => typeof value === "string" && (
    REMOTE_URL_PATTERN.test(value)
    || ABSOLUTE_PATH_PATTERN.test(value)
    || TOKEN_PATTERN.test(value)
    || PRIVATE_METADATA_PATTERN.test(value)
  ));
}

function safeId(value: string | undefined, fallback: string) {
  const normalized = (value ?? fallback).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
  return normalized || fallback;
}

function safeTimestamp(value: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
    ? value
    : undefined;
}

function digestFromSession(sessionId: string) {
  let hash = 0;
  for (const char of sessionId) {
    hash = ((hash << 5) - hash + char.charCodeAt(0)) >>> 0;
  }
  return `photo_digest_${hash.toString(16).padStart(8, "0")}`;
}

function extensionFromName(fileName: string) {
  const match = /\.([a-z0-9]+)$/i.exec(fileName.trim());
  return match ? match[1].toLowerCase() : "";
}

function normalizeMimeType(mimeType: string, extension: string): Photo2DMimeType | null {
  const normalized = mimeType.toLowerCase();
  if (ACCEPTED_IMAGE_TYPES.has(normalized)) {
    return normalized as Photo2DMimeType;
  }
  if (extension === "png") return "image/png";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "webp") return "image/webp";
  return null;
}

function sizeBucket(sizeBytes: number): "small" | "medium" | "large" {
  if (sizeBytes < 1_000_000) return "small";
  if (sizeBytes < 5_000_000) return "medium";
  return "large";
}

function dimensionBucket(width?: number, height?: number): "small" | "medium" | "large" | "unknown" {
  if (!Number.isFinite(width) || !Number.isFinite(height)) return "unknown";
  const maxDimension = Math.max(Number(width), Number(height));
  if (maxDimension < 1024) return "small";
  if (maxDimension < 2048) return "medium";
  return "large";
}
