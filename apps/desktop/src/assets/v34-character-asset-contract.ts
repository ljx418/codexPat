import type { V33CharacterDesignContract } from "./v33-identity-contract";
import type { V33PhaseStatus } from "./v33-sample-intake";
import {
  type V34SegmentationMaskRecord,
  v34SegmentationMaskHasForbiddenContent
} from "./v34-segmentation-mask";
import {
  type V34PosePart,
  type V34PosePartMapRecord,
  v34PosePartMapHasForbiddenContent
} from "./v34-pose-part-map";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V34AssetReadiness = "ready" | "blocked";
export type V34CharacterAssetReasonCode =
  | "sample_intake_passed"
  | "character_asset_blocked"
  | "identity_drift"
  | "segmentation_failed"
  | "part_map_incomplete"
  | "character_design_blocked"
  | "privacy_boundary_failed";

export type V34CharacterAssetContract = {
  sampleId: string;
  characterAssetId: string;
  identityAnchors: string[];
  requiredParts: V34PosePart[];
  allowedStylization: string[];
  disallowedDrift: string[];
  rigReadiness: V34AssetReadiness;
  frameSeedReadiness: V34AssetReadiness;
  reviewStatus: V33PhaseStatus;
  evidenceRefs: string[];
  reasonCodes: V34CharacterAssetReasonCode[];
};

export type V34CharacterAssetContractInput = {
  designContract: V33CharacterDesignContract;
  mask: V34SegmentationMaskRecord;
  partMap: V34PosePartMapRecord;
  evidenceRefs?: string[];
};

const requiredParts: V34PosePart[] = ["head", "body", "leftEar", "rightEar", "eyes", "tail", "frontLegs", "backLegs"];

export function createV34CharacterAssetContract(
  input: V34CharacterAssetContractInput
): V34CharacterAssetContract {
  const reasonCodes = new Set<V34CharacterAssetReasonCode>();
  const sampleIds = new Set([input.designContract.sampleId, input.mask.sampleId, input.partMap.sampleId]);
  if (sampleIds.size !== 1) {
    reasonCodes.add("identity_drift");
    reasonCodes.add("character_asset_blocked");
  }
  if (input.designContract.reviewStatus !== "passed") {
    reasonCodes.add("character_design_blocked");
    reasonCodes.add("character_asset_blocked");
  }
  if (input.mask.status !== "passed") {
    reasonCodes.add("segmentation_failed");
    reasonCodes.add("character_asset_blocked");
  }
  if (input.partMap.status !== "passed" || input.partMap.missingOrLowConfidenceParts.length > 0) {
    reasonCodes.add("part_map_incomplete");
    reasonCodes.add("character_asset_blocked");
  }
  if (!requiredParts.every((part) => input.partMap.visibleParts.includes(part))) {
    reasonCodes.add("part_map_incomplete");
    reasonCodes.add("character_asset_blocked");
  }

  const sampleId = sanitizeId(input.designContract.sampleId, "v34_sample");
  const reviewStatus: V33PhaseStatus = reasonCodes.has("identity_drift") ? "failed" : reasonCodes.size > 0 ? "blocked" : "passed";
  const contract: V34CharacterAssetContract = {
    sampleId,
    characterAssetId: `${sampleId}_v34_character_asset`,
    identityAnchors: sanitizeList(input.designContract.identityAnchors),
    requiredParts: [...requiredParts],
    allowedStylization: sanitizeList([
      ...input.designContract.allowedStylization,
      "part-level 2D rig or frame-seed friendly simplification",
      "same-character facial expression exaggeration"
    ]),
    disallowedDrift: sanitizeList([
      ...input.designContract.disallowedDrift,
      "reuse_another_cat_character_asset",
      "change_required_part_identity",
      "merge_photo_background_into_character"
    ]),
    rigReadiness: reviewStatus === "passed" ? "ready" : "blocked",
    frameSeedReadiness: reviewStatus === "passed" ? "ready" : "blocked",
    reviewStatus,
    evidenceRefs: sanitizeEvidenceRefs([
      ...input.designContract.evidenceRefs,
      input.mask.transparentCropEvidenceRef,
      ...(input.evidenceRefs ?? [])
    ]),
    reasonCodes: reasonCodes.size === 0 ? ["sample_intake_passed"] : Array.from(reasonCodes).sort()
  };

  if (
    v34CharacterAssetContractHasForbiddenContent(contract)
    || v34SegmentationMaskHasForbiddenContent(input.mask)
    || v34PosePartMapHasForbiddenContent(input.partMap)
  ) {
    return {
      ...contract,
      reviewStatus: "blocked",
      rigReadiness: "blocked",
      frameSeedReadiness: "blocked",
      reasonCodes: [...new Set<V34CharacterAssetReasonCode>([...contract.reasonCodes, "privacy_boundary_failed"])].sort()
    };
  }
  return contract;
}

export function buildV34CharacterAssetContractEvidenceSnapshot(contracts: V34CharacterAssetContract[]) {
  const characterIds = new Set<string>();
  const identitySignatures = new Set<string>();
  let duplicateCharacterAssetIdCount = 0;
  let duplicateIdentitySignatureCount = 0;
  for (const contract of contracts.filter((record) => record.reviewStatus === "passed")) {
    if (characterIds.has(contract.characterAssetId)) duplicateCharacterAssetIdCount += 1;
    characterIds.add(contract.characterAssetId);
    const signature = contract.identityAnchors.join("|");
    if (identitySignatures.has(signature)) duplicateIdentitySignatureCount += 1;
    identitySignatures.add(signature);
  }
  return {
    contracts: contracts.map((contract) => ({
      sampleId: contract.sampleId,
      characterAssetId: contract.characterAssetId,
      reviewStatus: contract.reviewStatus,
      identityAnchors: contract.identityAnchors,
      requiredParts: contract.requiredParts,
      rigReadiness: contract.rigReadiness,
      frameSeedReadiness: contract.frameSeedReadiness,
      reasonCodes: contract.reasonCodes
    })),
    passedCount: contracts.filter((contract) => contract.reviewStatus === "passed").length,
    blockedCount: contracts.filter((contract) => contract.reviewStatus === "blocked").length,
    failedCount: contracts.filter((contract) => contract.reviewStatus === "failed").length,
    duplicateCharacterAssetIdCount,
    duplicateIdentitySignatureCount,
    readyForFrameSeedCount: contracts.filter((contract) =>
      contract.reviewStatus === "passed"
      && contract.rigReadiness === "ready"
      && contract.frameSeedReadiness === "ready"
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

export function v34CharacterAssetContractHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function sanitizeEvidenceRefs(refs: string[]) {
  return refs
    .map((ref) => ref.replace(/\\/g, "/").replace(/[^A-Za-z0-9._/-]/g, "_").slice(0, 140))
    .filter((ref) => ref && !FORBIDDEN_PATTERN.test(ref));
}

function sanitizeList(values: string[]) {
  return values
    .map((value) => value.replace(/[^A-Za-z0-9:_ .-]/g, "_").trim().slice(0, 120))
    .filter((value) => value && !FORBIDDEN_PATTERN.test(value));
}

function sanitizeId(value: string, fallback: string) {
  const normalized = value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 96);
  return /^[A-Za-z0-9._-]{1,96}$/.test(normalized) ? normalized : fallback;
}
