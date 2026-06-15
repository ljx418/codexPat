import {
  type AssetManifest,
  type AssetManifestAction,
  type AssetManifestAsset,
  type CoreActionId,
  type PlaybackPriority,
  type SafeActionId
} from "../asset-manifest";
import {
  LIVING_WORK_CAT_OPTIONAL_ACTION_IDS,
  LIVING_WORK_CAT_V1_ACTIONS,
  type LivingWorkCatActionId
} from "./living-work-cat-v1";
import {
  renderWorkCatFrame,
  type WorkCatAction,
  type WorkCatFrame,
  type WorkCatPalette
} from "./work-cat-v1";
import { stabilizeWorkCatAction } from "./work-cat-animation-continuity";

export const FLAGSHIP_WORK_CAT_V2_PACK_ID = "flagship-work-cat-v2";

export type FlagshipWorkCatV2ActionId = CoreActionId | (typeof LIVING_WORK_CAT_OPTIONAL_ACTION_IDS)[number];

export type FlagshipWorkCatV2Pack = {
  packId: typeof FLAGSHIP_WORK_CAT_V2_PACK_ID;
  displayName: string;
  description: string;
  paletteName: string;
  attribution: string;
  actions: Record<FlagshipWorkCatV2ActionId, WorkCatAction>;
  manifest: AssetManifest;
};

const FLAGSHIP_PALETTE: WorkCatPalette = {
  body: "#E58A35",
  bodyDark: "#8E4218",
  cream: "#FFE6B8",
  line: "#3A2012",
  eye: "#101827",
  nose: "#E96C73",
  blush: "#F7A496",
  shadow: "rgba(17, 24, 39, 0.22)"
};

const LOOP_ACTIONS = new Set<SafeActionId>([
  "idle",
  "thinking",
  "running",
  "sleeping",
  "idle_tail_sway",
  "idle_nap",
  "dragging"
]);

const TRANSIENT_ACTIONS = new Set<SafeActionId>([
  "success",
  "warning",
  "error",
  "need_input",
  "idle_blink",
  "idle_look_left",
  "idle_look_right",
  "idle_stretch",
  "idle_settle",
  "idle_wake",
  "pointer_near",
  "pointer_leave",
  "click",
  "double_click",
  "drag",
  "drag_start",
  "drop"
]);

export const FLAGSHIP_WORK_CAT_V2_ACTIONS = Object.fromEntries(
  (Object.keys(LIVING_WORK_CAT_V1_ACTIONS) as LivingWorkCatActionId[]).map((actionId) => [
    actionId,
    enhanceAction(LIVING_WORK_CAT_V1_ACTIONS[actionId])
  ])
) as Record<FlagshipWorkCatV2ActionId, WorkCatAction>;

export const FLAGSHIP_WORK_CAT_V2_PACK: FlagshipWorkCatV2Pack = {
  packId: FLAGSHIP_WORK_CAT_V2_PACK_ID,
  displayName: "旗舰橘猫 V2",
  description: "V14 默认高质量动画工作猫，保留 living actions，并强化轮廓、表情和状态可读性。",
  paletteName: "premium flagship orange tabby",
  attribution: "Agent Desktop Pet bundled flagship work-cat v2 asset",
  actions: FLAGSHIP_WORK_CAT_V2_ACTIONS,
  manifest: buildManifest()
};

export const FLAGSHIP_WORK_CAT_V2_ASSET_MANIFEST = FLAGSHIP_WORK_CAT_V2_PACK.manifest;

export function isFlagshipWorkCatV2PackId(packId: string): packId is typeof FLAGSHIP_WORK_CAT_V2_PACK_ID {
  return packId === FLAGSHIP_WORK_CAT_V2_PACK_ID;
}

export function getFlagshipWorkCatV2Pack(packId: string): FlagshipWorkCatV2Pack | undefined {
  return isFlagshipWorkCatV2PackId(packId) ? FLAGSHIP_WORK_CAT_V2_PACK : undefined;
}

export function renderFlagshipWorkCatV2Frame(frame: WorkCatFrame) {
  return renderWorkCatFrame(frame);
}

function enhanceAction(action: WorkCatAction): WorkCatAction {
  return stabilizeWorkCatAction({
    ...action,
    frames: action.frames.map((frame, index) => enhanceFrame(frame, index))
  });
}

function enhanceFrame(frame: WorkCatFrame, index: number): WorkCatFrame {
  return {
    ...frame,
    palette: FLAGSHIP_PALETTE,
    bodyScaleX: frame.bodyScaleX + 0.045,
    bodyScaleY: frame.bodyScaleY + (index % 2 === 0 ? 0.01 : 0),
    earTilt: frame.earTilt + (index % 3 === 0 ? 1 : 0)
  };
}

function buildManifest(): AssetManifest {
  const actionIds = Object.keys(FLAGSHIP_WORK_CAT_V2_ACTIONS) as FlagshipWorkCatV2ActionId[];
  return {
    schemaVersion: "5.0",
    packId: FLAGSHIP_WORK_CAT_V2_PACK_ID,
    version: "2.0.0",
    rendererKind: "sprite",
    license: {
      type: "bundled",
      attribution: "Agent Desktop Pet bundled flagship work-cat v2 asset"
    },
    assets: Object.fromEntries(actionIds.map((actionId) => [
      actionId,
      {
        assetId: actionId,
        kind: "sprite",
        frameFiles: frameNames(actionId, FLAGSHIP_WORK_CAT_V2_ACTIONS[actionId].frames.length),
        fps: FLAGSHIP_WORK_CAT_V2_ACTIONS[actionId].fps
      } satisfies AssetManifestAsset
    ])),
    actions: Object.fromEntries(actionIds.map((actionId) => [
      actionId,
      actionManifest({
        assetId: actionId,
        loop: LOOP_ACTIONS.has(actionId),
        priority: priorityForAction(actionId),
        durationMs: durationForAction(actionId)
      })
    ])) as Partial<Record<SafeActionId, AssetManifestAction>>
  };
}

function frameNames(actionId: FlagshipWorkCatV2ActionId, frameCount: number) {
  return Array.from({ length: frameCount }, (_, index) => `${actionId}-${String(index + 1).padStart(2, "0")}.png`);
}

function priorityForAction(actionId: SafeActionId): PlaybackPriority {
  if (actionId === "error" || actionId === "need_input") return "urgent";
  if (TRANSIENT_ACTIONS.has(actionId)) return "transient";
  return "base";
}

function durationForAction(actionId: SafeActionId) {
  if (actionId === "success" || actionId === "click" || actionId === "double_click") return 1200;
  if (actionId === "warning" || actionId === "drop" || actionId === "idle_wake") return 1800;
  if (actionId === "error") return 2800;
  if (actionId === "need_input") return 3600;
  if (TRANSIENT_ACTIONS.has(actionId)) return 900;
  return undefined;
}

function actionManifest(action: AssetManifestAction): AssetManifestAction {
  return Object.fromEntries(Object.entries(action).filter(([, value]) => typeof value !== "undefined")) as AssetManifestAction;
}
