const ACCEPTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const ACCEPTED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);
const MAX_PHOTO_BYTES = 12 * 1024 * 1024;
const REMOTE_URL_PATTERN = /\b(?:https?|wss?):\/\/|file:\/\//i;
const ABSOLUTE_PATH_PATTERN = /(?:^|[\s"'=])(?:\/Users\/|\/var\/|\/tmp\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/])/;
const TOKEN_PATTERN = /\b(?:sk-[A-Za-z0-9_-]{8,}|Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json)\b/i;
const GPS_EXIF_PATTERN = /\b(?:exif|gps|latitude|longitude|geotag|location)\b/i;

export type PhotoIntakeMediaType = "image/png" | "image/jpeg" | "image/webp";
export type PhotoIntakeMode = "not_provided" | "local_reference_only";
export type PhotoIntakeStatus = "accepted" | "rejected";
export type PhotoIntakeReasonCode =
  | "photo_not_selected"
  | "photo_privacy_boundary_ok"
  | "photo_type_unsupported"
  | "photo_too_large"
  | "trait_invalid"
  | "local_reference_consent_required";

export type PhotoIntakeFileMetadata = {
  fileName?: string;
  mediaType?: string;
  sizeBytes?: number;
};

export type PhotoIntakeSession = {
  status: PhotoIntakeStatus;
  reasonCode: PhotoIntakeReasonCode;
  catName: string;
  approvedTraits: string;
  photoReferenceMode: PhotoIntakeMode;
  photoSummary: {
    provided: boolean;
    mediaType?: PhotoIntakeMediaType;
    extension?: string;
    sizeBucket?: "small" | "medium" | "large";
  };
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

export function createPhotoIntakePrivacySession(options: {
  catName?: string;
  approvedTraits?: string;
  photo?: PhotoIntakeFileMetadata | null;
  localReferenceConsent?: boolean;
}): PhotoIntakeSession {
  const catName = sanitizeText(options.catName ?? "", "Personalized Cat", 80);
  const approvedTraits = sanitizeText(options.approvedTraits ?? "", "user-approved cat appearance traits", 360);
  if (isUnsafeText(options.catName ?? "") || isUnsafeText(options.approvedTraits ?? "")) {
    return rejected("trait_invalid", catName, approvedTraits, false);
  }

  if (!options.photo) {
    return accepted("photo_not_selected", catName, approvedTraits, {
      provided: false
    });
  }

  if (!options.localReferenceConsent) {
    return rejected("local_reference_consent_required", catName, approvedTraits, true);
  }

  const extension = extensionFromName(options.photo.fileName ?? "");
  const mediaType = normalizeMediaType(options.photo.mediaType ?? "", extension);
  if (!mediaType || !extension || !ACCEPTED_EXTENSIONS.has(extension)) {
    return rejected("photo_type_unsupported", catName, approvedTraits, true);
  }

  const sizeBytes = Number.isFinite(options.photo.sizeBytes) ? Number(options.photo.sizeBytes) : 0;
  if (sizeBytes <= 0 || sizeBytes > MAX_PHOTO_BYTES) {
    return rejected("photo_too_large", catName, approvedTraits, true, mediaType, extension);
  }

  return accepted("photo_privacy_boundary_ok", catName, approvedTraits, {
    provided: true,
    mediaType,
    extension,
    sizeBucket: sizeBucket(sizeBytes)
  });
}

export function buildPhotoIntakeEvidenceSnapshot(session: PhotoIntakeSession) {
  return {
    status: session.status,
    reasonCode: session.reasonCode,
    photoReferenceMode: session.photoReferenceMode,
    photoProvided: session.photoSummary.provided,
    safePhotoFields: Object.keys(session.photoSummary).sort(),
    privacyBoundary: session.privacyBoundary,
    approvedTraitLength: session.approvedTraits.length
  };
}

export function photoIntakeHasForbiddenContent(value: unknown) {
  const serialized = JSON.stringify(value);
  return /Authorization|api-token\.json|raw payload|raw photo|workspace path|config path|provider payload|prompt text/i.test(serialized)
    || /\/Users\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/]/.test(serialized)
    || /sk-[A-Za-z0-9_-]{8,}/.test(serialized)
    || GPS_EXIF_PATTERN.test(serialized);
}

function accepted(
  reasonCode: PhotoIntakeReasonCode,
  catName: string,
  approvedTraits: string,
  photoSummary: PhotoIntakeSession["photoSummary"]
): PhotoIntakeSession {
  return {
    status: "accepted",
    reasonCode,
    catName,
    approvedTraits,
    photoReferenceMode: photoSummary.provided ? "local_reference_only" : "not_provided",
    photoSummary,
    privacyBoundary: privacyBoundary()
  };
}

function rejected(
  reasonCode: PhotoIntakeReasonCode,
  catName: string,
  approvedTraits: string,
  provided: boolean,
  mediaType?: PhotoIntakeMediaType,
  extension?: string
): PhotoIntakeSession {
  return {
    status: "rejected",
    reasonCode,
    catName,
    approvedTraits,
    photoReferenceMode: provided ? "local_reference_only" : "not_provided",
    photoSummary: {
      provided,
      mediaType,
      extension
    },
    privacyBoundary: privacyBoundary()
  };
}

function privacyBoundary(): PhotoIntakeSession["privacyBoundary"] {
  return {
    storesRawPhoto: false,
    readsRawPhotoBytes: false,
    uploadsByDefault: false,
    persistsExifGps: false,
    persistsSourceFileName: false,
    persistsFullPath: false,
    includesProviderCall: false
  };
}

function sanitizeText(value: string, fallback: string, maxLength: number) {
  const sanitized = value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
  return sanitized || fallback;
}

function isUnsafeText(value: string) {
  return REMOTE_URL_PATTERN.test(value) || ABSOLUTE_PATH_PATTERN.test(value) || TOKEN_PATTERN.test(value) || GPS_EXIF_PATTERN.test(value);
}

function extensionFromName(fileName: string) {
  const match = /\.([a-z0-9]+)$/i.exec(fileName.trim());
  return match ? match[1].toLowerCase() : "";
}

function normalizeMediaType(mediaType: string, extension: string): PhotoIntakeMediaType | null {
  const normalized = mediaType.toLowerCase();
  if (ACCEPTED_IMAGE_TYPES.has(normalized)) {
    return normalized as PhotoIntakeMediaType;
  }
  if (extension === "png") {
    return "image/png";
  }
  if (extension === "jpg" || extension === "jpeg") {
    return "image/jpeg";
  }
  if (extension === "webp") {
    return "image/webp";
  }
  return null;
}

function sizeBucket(sizeBytes: number): "small" | "medium" | "large" {
  if (sizeBytes < 1_000_000) {
    return "small";
  }
  if (sizeBytes < 5_000_000) {
    return "medium";
  }
  return "large";
}
