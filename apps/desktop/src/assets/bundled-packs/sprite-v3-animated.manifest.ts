import type { AssetManifest, AssetManifestAction, AssetManifestAsset, CoreActionId, PlaybackPriority } from "../asset-manifest";
import { CORE_ACTION_IDS } from "../asset-manifest";
import { SPRITE_V3_ANIMATED_ACTIONS, SPRITE_V3_ANIMATED_PACK_ID } from "./sprite-v3-animated";

const TRANSIENT_ACTIONS = new Set<CoreActionId>(["success", "warning", "error", "need_input"]);

export const SPRITE_V3_ANIMATED_ASSET_MANIFEST: AssetManifest = {
  schemaVersion: "5.0",
  packId: SPRITE_V3_ANIMATED_PACK_ID,
  version: "1.0.0",
  rendererKind: "sprite",
  license: {
    type: "bundled",
    attribution: "Agent Desktop Pet bundled animated sprite v3"
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
      frameFiles: frameNames(actionId, SPRITE_V3_ANIMATED_ACTIONS[actionId].frames.length),
      fps: SPRITE_V3_ANIMATED_ACTIONS[actionId].fps
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
  if (actionId === "success") return 2200;
  if (actionId === "warning") return 3600;
  if (actionId === "error") return 6000;
  if (actionId === "need_input") return 8000;
  return undefined;
}

function actionManifest(action: AssetManifestAction): AssetManifestAction {
  return Object.fromEntries(Object.entries(action).filter(([, value]) => typeof value !== "undefined")) as AssetManifestAction;
}
