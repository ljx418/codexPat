import { resolveAnimationCoverage, type AnimationCoverageState } from "./animation-coverage";
import { CORE_ACTION_IDS, type AssetManifest, type CoreActionId, type RendererKind } from "./asset-manifest";

export type AssetManagerPackSummary = {
  packId: string;
  displayName: string;
  rendererKind: Extract<RendererKind, "sprite" | "gltf">;
  copiedAssetIds: string[];
  activeInstances: string[];
  validationStatus: string;
};

export type AssetManagerPackView = {
  packId: string;
  displayName: string;
  rendererKind: "sprite" | "gltf";
  validationStatus: string;
  healthStatus: "healthy" | "incomplete" | "invalid";
  activeInstanceCount: number;
  activeInstanceSummary: string;
  actionCoverage: string;
  previewActions: readonly CoreActionId[];
  previewMetadata: readonly ManagerActionPreviewView[];
  reasonCode: string;
};

export type ManagerRuntimePackView = {
  instanceId: string;
  activePackDisplayName: string;
  activePackId: string;
  activeRendererKind: "sprite" | "gltf";
  activeSource: "default" | "imported";
  fallbackPackDisplayName: string;
  fallbackPackId: "work-cat-v1";
  fallbackReasonCode: "default_work_cat" | "imported_pack_active";
  restoreDefaultAvailable: boolean;
  reasonCode: "manager_runtime_default_active" | "manager_runtime_imported_active";
};

export type ManagerActionPreviewView = {
  actionId: CoreActionId;
  coverageState: AnimationCoverageState;
  reasonCode: string;
  rendererKind: Extract<RendererKind, "css" | "sprite" | "gltf">;
  frameCount: number;
  fps: number | null;
  playbackKind: "loop" | "transient" | "urgent" | "unknown";
  durationMs: number | null;
  clipPresent: boolean | null;
  fallbackActionId: CoreActionId | null;
};

export type PetGalleryPackSource = "bundled" | "imported";
export type PetGalleryMotionLevel = "calm" | "balanced" | "lively";
export type PetGalleryFilterValue = "all" | string;

export type PetGalleryPackSummary = {
  packId: string;
  displayName: string;
  description: string;
  rendererKind: "sprite" | "gltf";
  source: PetGalleryPackSource;
  style: string;
  color: string;
  motionLevel: PetGalleryMotionLevel;
  qualityBadge: string;
  coverageCount: number;
  actionCount: number;
  activeInstances: string[];
  licenseSummary: string;
  validationStatus: string;
  hasLivingActions: boolean;
  canDelete: boolean;
};

export type PetGalleryFilters = {
  style?: PetGalleryFilterValue;
  color?: PetGalleryFilterValue;
  motionLevel?: PetGalleryFilterValue;
  rendererKind?: PetGalleryFilterValue;
  source?: PetGalleryFilterValue;
  favoriteOnly?: boolean;
  activeOnly?: boolean;
};

export type PetGalleryPackView = PetGalleryPackSummary & {
  isFavorite: boolean;
  isActive: boolean;
  activeInstanceCount: number;
  activeInstanceSummary: string;
  coverageState: "complete" | "partial" | "missing";
  coverageSummary: string;
  favoriteReasonCode: "gallery_favorite_active" | "gallery_favorite_inactive";
  reasonCode: "gallery_pack_ready" | "gallery_pack_partial" | "gallery_pack_invalid";
  previewActions: readonly CoreActionId[];
};

export function createAssetManagerPackView(pack: AssetManagerPackSummary): AssetManagerPackView {
  const copiedCount = pack.copiedAssetIds.filter((assetId) => typeof assetId === "string" && assetId.length > 0).length;
  const validationStatus = pack.validationStatus === "valid" ? "valid" : "invalid";
  const healthStatus = validationStatus !== "valid" ? "invalid" : copiedCount >= CORE_ACTION_IDS.length ? "healthy" : "incomplete";
  return {
    packId: pack.packId,
    displayName: sanitizeAssetDisplayName(pack.displayName, pack.packId),
    rendererKind: pack.rendererKind,
    validationStatus,
    healthStatus,
    activeInstanceCount: pack.activeInstances.length,
    activeInstanceSummary: pack.activeInstances.length ? `${pack.activeInstances.length} active` : "inactive",
    actionCoverage: `${Math.min(copiedCount, CORE_ACTION_IDS.length)}/${CORE_ACTION_IDS.length}`,
    previewActions: CORE_ACTION_IDS,
    previewMetadata: [],
    reasonCode: healthStatus === "healthy" ? "asset_pack_healthy" : healthStatus === "incomplete" ? "asset_pack_incomplete" : "asset_pack_invalid"
  };
}

export function createAssetManagerPackViews(packs: AssetManagerPackSummary[]): AssetManagerPackView[] {
  return packs.map(createAssetManagerPackView);
}

export function createManagerRuntimePackView(instanceId: string, packs: AssetManagerPackSummary[]): ManagerRuntimePackView {
  const activeImportedPack = packs.find((pack) => pack.activeInstances.includes(instanceId));
  if (activeImportedPack) {
    return {
      instanceId,
      activePackDisplayName: sanitizeAssetDisplayName(activeImportedPack.displayName, activeImportedPack.packId),
      activePackId: activeImportedPack.packId,
      activeRendererKind: activeImportedPack.rendererKind,
      activeSource: "imported",
      fallbackPackDisplayName: "work-cat-v1",
      fallbackPackId: "work-cat-v1",
      fallbackReasonCode: "imported_pack_active",
      restoreDefaultAvailable: true,
      reasonCode: "manager_runtime_imported_active"
    };
  }
  return {
    instanceId,
    activePackDisplayName: "work-cat-v1",
    activePackId: "work-cat-v1",
    activeRendererKind: "sprite",
    activeSource: "default",
    fallbackPackDisplayName: "work-cat-v1",
    fallbackPackId: "work-cat-v1",
    fallbackReasonCode: "default_work_cat",
    restoreDefaultAvailable: false,
    reasonCode: "manager_runtime_default_active"
  };
}

export function createManagerActionPreviewViews(manifest: AssetManifest): ManagerActionPreviewView[] {
  return CORE_ACTION_IDS.map((actionId) => {
    const coverage = resolveAnimationCoverage(manifest, actionId);
    return {
      actionId,
      coverageState: coverage.coverageState,
      reasonCode: coverage.reasonCode,
      rendererKind: coverage.rendererKind,
      frameCount: coverage.frameCount ?? 0,
      fps: coverage.fps ?? null,
      playbackKind: coverage.playbackKind ?? "unknown",
      durationMs: coverage.durationMs ?? null,
      clipPresent: typeof coverage.clipPresent === "boolean" ? coverage.clipPresent : null,
      fallbackActionId: coverage.fallbackActionId ?? null
    };
  });
}

export function createPetGalleryPackViews(
  packs: readonly PetGalleryPackSummary[],
  favoritePackIds: readonly string[] = [],
  filters: PetGalleryFilters = {}
): PetGalleryPackView[] {
  const favoriteSet = new Set(sanitizeFavoritePackIds(favoritePackIds, packs.map((pack) => pack.packId)));
  return packs
    .map((pack) => createPetGalleryPackView(pack, favoriteSet.has(pack.packId)))
    .filter((view) => galleryFilterMatches(view, filters));
}

export function sanitizeFavoritePackIds(packIds: readonly string[], allowedPackIds: readonly string[] = []) {
  const allowed = allowedPackIds.length ? new Set(allowedPackIds) : null;
  const seen = new Set<string>();
  const sanitized: string[] = [];
  for (const packId of packIds) {
    if (!isSafeGalleryPackId(packId) || seen.has(packId) || (allowed && !allowed.has(packId))) {
      continue;
    }
    seen.add(packId);
    sanitized.push(packId);
  }
  return sanitized;
}

export function isSafeGalleryPackId(packId: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(packId);
}

function createPetGalleryPackView(pack: PetGalleryPackSummary, isFavorite: boolean): PetGalleryPackView {
  const coverageState = pack.validationStatus !== "valid" || pack.actionCount <= 0
    ? "missing"
    : pack.coverageCount >= pack.actionCount
      ? "complete"
      : "partial";
  return {
    ...pack,
    displayName: sanitizeAssetDisplayName(pack.displayName, pack.packId),
    activeInstanceCount: pack.activeInstances.length,
    activeInstanceSummary: pack.activeInstances.length ? `${pack.activeInstances.length} active` : "inactive",
    isFavorite,
    isActive: pack.activeInstances.length > 0,
    coverageState,
    coverageSummary: `${Math.max(0, pack.coverageCount)}/${Math.max(0, pack.actionCount)}`,
    favoriteReasonCode: isFavorite ? "gallery_favorite_active" : "gallery_favorite_inactive",
    reasonCode: pack.validationStatus !== "valid"
      ? "gallery_pack_invalid"
      : coverageState === "complete"
        ? "gallery_pack_ready"
        : "gallery_pack_partial",
    previewActions: CORE_ACTION_IDS
  };
}

function galleryFilterMatches(view: PetGalleryPackView, filters: PetGalleryFilters) {
  if (filters.favoriteOnly && !view.isFavorite) return false;
  if (filters.activeOnly && !view.isActive) return false;
  if (!filterValueMatches(filters.style, view.style)) return false;
  if (!filterValueMatches(filters.color, view.color)) return false;
  if (!filterValueMatches(filters.motionLevel, view.motionLevel)) return false;
  if (!filterValueMatches(filters.rendererKind, view.rendererKind)) return false;
  if (!filterValueMatches(filters.source, view.source)) return false;
  return true;
}

function filterValueMatches(filterValue: PetGalleryFilterValue | undefined, actual: string) {
  return !filterValue || filterValue === "all" || filterValue === actual;
}

export function sanitizeAssetDisplayName(value: string, fallback = "Imported Asset Pack") {
  const sanitized = value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")
    .slice(0, 80);
  return sanitized || fallback;
}
