import { CORE_ACTION_IDS, type AssetManifest } from "./asset-manifest";
import { resolveAnimationCoverage } from "./animation-coverage";

const SAFE_ID_PATTERN = /^[A-Za-z0-9._-]{1,96}$/;
const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V29InstallHistoryEntry = {
  safePackId: string;
  targetInstanceId: string;
  previousPackId: string;
  installedAtBucket: "recent" | "older";
  reasonCode: "install_history_recorded";
};

export type V29AssetPolishPackInput = {
  packId: string;
  displayName: string;
  manifest: AssetManifest;
  loopClosureOk: boolean;
  frameContinuityOk: boolean;
  readableAt1x: boolean;
  readableAt075x: boolean;
};

export type V29AssetPolishResult = {
  status: "passed" | "blocked" | "failed";
  reasonCodes: string[];
  packCount: number;
  acceptedPackCount: number;
  allPacksEightActionPreview: boolean;
  allPacksReadable: boolean;
  noFlashFrame: boolean;
  installHistory: V29InstallHistoryEntry[];
};

export function createV29InstallHistoryEntry(input: {
  packId: string;
  targetInstanceId: string;
  previousPackId: string;
  installedAtBucket?: "recent" | "older";
}): V29InstallHistoryEntry {
  return {
    safePackId: safeId(input.packId, "unknown-pack"),
    targetInstanceId: safeId(input.targetInstanceId, "unknown-target"),
    previousPackId: safeId(input.previousPackId, "unknown-previous"),
    installedAtBucket: input.installedAtBucket ?? "recent",
    reasonCode: "install_history_recorded"
  };
}

export function runV29AssetPolishReview(input: {
  packs: V29AssetPolishPackInput[];
  installHistory: V29InstallHistoryEntry[];
  minimumPackCount?: number;
}): V29AssetPolishResult {
  const minimumPackCount = input.minimumPackCount ?? 12;
  const reasonCodes = new Set<string>();
  const packReviews = input.packs.map(reviewPack);
  const acceptedPackCount = packReviews.filter((review) => review.accepted).length;
  const allPacksEightActionPreview = packReviews.every((review) => review.allActionsPreviewable);
  const allPacksReadable = packReviews.every((review) => review.readable);
  const noFlashFrame = packReviews.every((review) => review.noFlashFrame);

  if (input.packs.length < minimumPackCount) reasonCodes.add("gallery_entry_count_too_low");
  if (!allPacksEightActionPreview) reasonCodes.add("preview_action_coverage_incomplete");
  if (!allPacksReadable) reasonCodes.add("readability_failed");
  if (!noFlashFrame) reasonCodes.add("flash_frame_detected");
  if (assetPolishHasForbiddenContent({ packs: input.packs.map((pack) => pack.packId), installHistory: input.installHistory })) {
    reasonCodes.add("unsafe_field_detected");
  }
  if (reasonCodes.size === 0) {
    reasonCodes.add("asset_polish_passed");
    reasonCodes.add("install_history_ready");
  }

  const failed = reasonCodes.has("unsafe_field_detected") || reasonCodes.has("flash_frame_detected");
  const blocked = reasonCodes.has("gallery_entry_count_too_low") || reasonCodes.has("preview_action_coverage_incomplete") || reasonCodes.has("readability_failed");
  return {
    status: failed ? "failed" : blocked ? "blocked" : "passed",
    reasonCodes: Array.from(reasonCodes).sort(),
    packCount: input.packs.length,
    acceptedPackCount,
    allPacksEightActionPreview,
    allPacksReadable,
    noFlashFrame,
    installHistory: input.installHistory
  };
}

export function assetPolishHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function reviewPack(pack: V29AssetPolishPackInput) {
  const coverage = CORE_ACTION_IDS.map((actionId) => resolveAnimationCoverage(pack.manifest, actionId));
  const allActionsPreviewable = coverage.length === CORE_ACTION_IDS.length && coverage.every((item) => item.coverageState === "animated" || item.coverageState === "static");
  const readable = pack.readableAt1x && pack.readableAt075x;
  const noFlashFrame = pack.loopClosureOk && pack.frameContinuityOk;
  return {
    packId: safeId(pack.packId, "pack"),
    accepted: allActionsPreviewable && readable && noFlashFrame,
    allActionsPreviewable,
    readable,
    noFlashFrame
  };
}

function safeId(value: string, fallback: string) {
  return SAFE_ID_PATTERN.test(value) ? value : fallback;
}
