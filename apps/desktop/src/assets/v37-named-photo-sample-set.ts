import { createV33SampleIntakeRecord, type V33SafeSampleInput, type V33SampleIntakeRecord } from "./v33-sample-intake";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V37DifficultyClass = "clear" | "second_distinct_identity" | "negative" | "blocked_risk";
export type V37SourceKind = "local_safe_fixture" | "public_metadata_reference" | "approved_user_sample";
export type V37SampleSetStatus = "passed" | "blocked" | "failed";

export type V37NamedPhotoSampleInput = {
  sample: V33SafeSampleInput;
  displayName: string;
  difficultyClass: V37DifficultyClass;
  sourceKind: V37SourceKind;
  permissionSummary: string;
};

export type V37NamedPhotoSampleRecord = {
  sampleId: string;
  displayName: string;
  difficultyClass: V37DifficultyClass;
  sourceKind: V37SourceKind;
  permissionSummary: string;
  intakeStatus: V33SampleIntakeRecord["status"];
  reasonCodes: string[];
  intake: V33SampleIntakeRecord;
};

export type V37NamedPhotoSampleSet = {
  setId: "v37_named_photo_sample_set";
  sampleScope: "tested_named_samples_only";
  records: V37NamedPhotoSampleRecord[];
  passedCount: number;
  negativeRejectedCount: number;
  blockedCount: number;
  distinctPassedIdentityCount: number;
  status: V37SampleSetStatus;
  reasonCodes: string[];
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

export function createV37DefaultNamedPhotoSampleInputs(): V37NamedPhotoSampleInput[] {
  return [
    {
      displayName: "Amber clear tabby",
      difficultyClass: "clear",
      sourceKind: "local_safe_fixture",
      permissionSummary: "project safe metadata fixture; no raw photo bytes stored",
      sample: {
        sampleId: "v37_amber_clear_tabby",
        sampleClass: "clear",
        catName: "Amber",
        approvedTraits: "orange tabby, green eyes, ringed tail, compact body",
        localReferenceConsent: true,
        photo: { mediaType: "image/png", sizeBytes: 450_000, fileExtension: "png" },
        width: 1200,
        height: 900,
        qualitySignals: { catCount: 1, catVisibleRatio: 0.92, bodyVisible: true, tailVisible: true, blurScore: 0.86 },
        visualHints: { coatColor: "orange", pattern: "tabby", eyeColor: "green", tailVisibility: "visible" },
        evidenceRefs: ["docs/V37.x/evidence/derivatives/v37_amber_clear_tabby-safe-metadata"]
      }
    },
    {
      displayName: "Misty distinct tuxedo",
      difficultyClass: "second_distinct_identity",
      sourceKind: "local_safe_fixture",
      permissionSummary: "project safe metadata fixture; no raw photo bytes stored",
      sample: {
        sampleId: "v37_misty_distinct_tuxedo",
        sampleClass: "clear",
        catName: "Misty",
        approvedTraits: "black and white tuxedo, amber eyes, white paws, long tail",
        localReferenceConsent: true,
        photo: { mediaType: "image/webp", sizeBytes: 520_000, fileExtension: "webp" },
        width: 1280,
        height: 960,
        qualitySignals: { catCount: 1, catVisibleRatio: 0.88, bodyVisible: true, tailVisible: true, blurScore: 0.84 },
        visualHints: { coatColor: "black_white", pattern: "tuxedo", eyeColor: "amber", tailVisibility: "visible" },
        evidenceRefs: ["docs/V37.x/evidence/derivatives/v37_misty_distinct_tuxedo-safe-metadata"]
      }
    },
    {
      displayName: "Negative non-cat sample",
      difficultyClass: "negative",
      sourceKind: "local_safe_fixture",
      permissionSummary: "negative metadata fixture; no raw image stored",
      sample: {
        sampleId: "v37_negative_non_cat",
        sampleClass: "negative",
        catName: "Negative",
        approvedTraits: "not a cat",
        localReferenceConsent: true,
        photo: { mediaType: "image/jpeg", sizeBytes: 300_000, fileExtension: "jpg" },
        width: 900,
        height: 700,
        qualitySignals: { catCount: 0, catVisibleRatio: 0, bodyVisible: false, tailVisible: false, blurScore: 0.7 },
        evidenceRefs: ["docs/V37.x/evidence/derivatives/v37_negative_non_cat-safe-metadata"]
      }
    },
    {
      displayName: "Blocked risk sample",
      difficultyClass: "blocked_risk",
      sourceKind: "local_safe_fixture",
      permissionSummary: "blocked metadata fixture; no raw image stored",
      sample: {
        sampleId: "v37_blocked_multi_cat",
        sampleClass: "blocked",
        catName: "Blocked",
        approvedTraits: "multiple cats, ambiguous identity",
        localReferenceConsent: true,
        photo: { mediaType: "image/png", sizeBytes: 610_000, fileExtension: "png" },
        width: 1200,
        height: 900,
        qualitySignals: { catCount: 2, catVisibleRatio: 0.55, bodyVisible: true, tailVisible: false, blurScore: 0.72 },
        evidenceRefs: ["docs/V37.x/evidence/derivatives/v37_blocked_multi_cat-safe-metadata"]
      }
    }
  ];
}

export function createV37NamedPhotoSampleSet(
  inputs: V37NamedPhotoSampleInput[] = createV37DefaultNamedPhotoSampleInputs()
): V37NamedPhotoSampleSet {
  const records = inputs.map((input) => {
    const intake = createV33SampleIntakeRecord(input.sample);
    return {
      sampleId: intake.sampleId,
      displayName: sanitizeText(input.displayName),
      difficultyClass: input.difficultyClass,
      sourceKind: input.sourceKind,
      permissionSummary: sanitizeText(input.permissionSummary),
      intakeStatus: intake.status,
      reasonCodes: intake.reasonCodes,
      intake
    };
  });
  const passed = records.filter((record) => record.intakeStatus === "passed");
  const negativeRejectedCount = records.filter((record) =>
    record.difficultyClass === "negative" && record.intakeStatus !== "passed"
  ).length;
  const blockedCount = records.filter((record) => record.intakeStatus === "blocked").length;
  const reasonCodes = new Set<string>();
  if (passed.length < 2) reasonCodes.add("insufficient_passing_named_samples");
  if (new Set(passed.map((record) => record.intake.traitSummary.coatColorBucket + "|" + record.intake.traitSummary.patternBucket)).size < 2) {
    reasonCodes.add("distinct_identity_count_too_low");
  }
  if (negativeRejectedCount < 1) reasonCodes.add("negative_sample_not_rejected");
  if (blockedCount < 1) reasonCodes.add("blocked_risk_sample_missing");
  if (v37NamedPhotoSampleSetHasForbiddenContent(records)) reasonCodes.add("privacy_boundary_failed");
  const blocked = reasonCodes.has("privacy_boundary_failed") || reasonCodes.has("blocked_risk_sample_missing");
  const status: V37SampleSetStatus = blocked ? "blocked" : reasonCodes.size > 0 ? "failed" : "passed";
  return {
    setId: "v37_named_photo_sample_set",
    sampleScope: "tested_named_samples_only",
    records,
    passedCount: passed.length,
    negativeRejectedCount,
    blockedCount,
    distinctPassedIdentityCount: new Set(passed.map((record) =>
      record.intake.traitSummary.coatColorBucket + "|" + record.intake.traitSummary.patternBucket
    )).size,
    status,
    reasonCodes: reasonCodes.size === 0 ? ["sample_set_ready"] : Array.from(reasonCodes).sort(),
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

export function buildV37NamedPhotoSampleSetEvidenceSnapshot(set: V37NamedPhotoSampleSet) {
  return {
    setId: set.setId,
    sampleScope: set.sampleScope,
    records: set.records.map((record) => ({
      sampleId: record.sampleId,
      displayName: record.displayName,
      difficultyClass: record.difficultyClass,
      sourceKind: record.sourceKind,
      permissionSummary: record.permissionSummary,
      intakeStatus: record.intakeStatus,
      reasonCodes: record.reasonCodes
    })),
    passedCount: set.passedCount,
    negativeRejectedCount: set.negativeRejectedCount,
    blockedCount: set.blockedCount,
    distinctPassedIdentityCount: set.distinctPassedIdentityCount,
    status: set.status,
    reasonCodes: set.reasonCodes,
    privacyBoundary: set.privacyBoundary
  };
}

export function v37NamedPhotoSampleSetHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function sanitizeText(value: string) {
  return value.replace(/[^A-Za-z0-9:_ .;,'/-]/g, "_").trim().slice(0, 160);
}
