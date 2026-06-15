import type { AssetManifest, AssetManifestAction, AssetManifestAsset, CoreActionId, PlaybackPriority } from "../asset-manifest";
import { CORE_ACTION_IDS } from "../asset-manifest";
import { WORK_CAT_V1_ACTIONS, WORK_CAT_V1_PACK_ID } from "./work-cat-v1";

const TRANSIENT_ACTIONS = new Set<CoreActionId>(["success", "warning", "error", "need_input"]);

export const WORK_CAT_V1_ASSET_MANIFEST: AssetManifest = {
  schemaVersion: "5.0",
  packId: WORK_CAT_V1_PACK_ID,
  version: "1.0.0",
  rendererKind: "sprite",
  license: {
    type: "bundled",
    attribution: "Agent Desktop Pet bundled work-cat-v1 procedural sprite pack"
  },
  assets: buildAssets(),
  actions: buildActions()
};

function frameNames(actionId: CoreActionId, frameCount: number) {
  return Array.from({ length: frameCount }, (_, index) => `${actionId}-${String(index + 1).padStart(2, "0")}.png`);
}

function buildAssets(): Record<string, AssetManifestAsset> {
  return Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
    actionId,
    {
      assetId: actionId,
      kind: "sprite",
      frameFiles: frameNames(actionId, WORK_CAT_V1_ACTIONS[actionId].frames.length),
      fps: WORK_CAT_V1_ACTIONS[actionId].fps
    }
  ]));
}

function buildActions(): Partial<Record<CoreActionId, AssetManifestAction>> {
  return Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
    actionId,
    actionManifest({
      assetId: actionId,
      loop: !TRANSIENT_ACTIONS.has(actionId),
      priority: priorityForAction(actionId),
      durationMs: durationForAction(actionId)
    })
  ]));
}

function priorityForAction(actionId: CoreActionId): PlaybackPriority {
  if (actionId === "error" || actionId === "need_input") return "urgent";
  if (actionId === "success" || actionId === "warning") return "transient";
  return "base";
}

function durationForAction(actionId: CoreActionId) {
  if (actionId === "success") return 1600;
  if (actionId === "warning") return 2200;
  if (actionId === "error") return 2800;
  if (actionId === "need_input") return 3600;
  return undefined;
}

function actionManifest(action: AssetManifestAction): AssetManifestAction {
  return Object.fromEntries(Object.entries(action).filter(([, value]) => typeof value !== "undefined")) as AssetManifestAction;
}
