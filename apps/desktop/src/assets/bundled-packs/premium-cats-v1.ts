import type { AssetManifest, AssetManifestAction, AssetManifestAsset, CoreActionId, PlaybackPriority } from "../asset-manifest";
import { CORE_ACTION_IDS } from "../asset-manifest";
import {
  WORK_CAT_V1_ACTIONS,
  renderWorkCatFrame,
  type WorkCatAction,
  type WorkCatFrame,
  type WorkCatPalette
} from "./work-cat-v1";
import { stabilizeWorkCatAction } from "./work-cat-animation-continuity";

export type PremiumCatPack = {
  packId: PremiumCatPackId;
  displayName: string;
  description: string;
  paletteName: string;
  attribution: string;
  actions: Record<CoreActionId, WorkCatAction>;
  manifest: AssetManifest;
};

const TRANSIENT_ACTIONS = new Set<CoreActionId>(["success", "warning", "error", "need_input"]);

const PREMIUM_CAT_DEFINITIONS = [
  {
    packId: "premium-orange-tabby",
    displayName: "橘子工作猫",
    description: "暖橘色条纹猫，适合作为默认活力工作猫。",
    paletteName: "orange tabby",
    palette: {
      body: "#E88A3A",
      bodyDark: "#9A4E20",
      cream: "#F8D7A0",
      line: "#5B3019",
      eye: "#1F2933",
      nose: "#E86C72",
      blush: "#F7A08C",
      shadow: "rgba(31, 41, 51, 0.16)"
    }
  },
  {
    packId: "premium-tuxedo",
    displayName: "礼服工作猫",
    description: "黑白礼服猫，轮廓更利落，适合专注和 review 场景。",
    paletteName: "tuxedo",
    palette: {
      body: "#20242B",
      bodyDark: "#0D1117",
      cream: "#F8F4EA",
      line: "#0B0F14",
      eye: "#FBBF24",
      nose: "#F08AA0",
      blush: "#E8A0B1",
      shadow: "rgba(15, 23, 42, 0.20)"
    }
  },
  {
    packId: "premium-silver",
    displayName: "银灰工作猫",
    description: "银灰短毛猫，低饱和配色，适合长时间桌面陪伴。",
    paletteName: "silver",
    palette: {
      body: "#AEB7C2",
      bodyDark: "#66717F",
      cream: "#EEF2F6",
      line: "#374151",
      eye: "#2563EB",
      nose: "#E68B93",
      blush: "#E9A4B3",
      shadow: "rgba(51, 65, 85, 0.16)"
    }
  },
  {
    packId: "premium-calico",
    displayName: "三花工作猫",
    description: "三花猫，状态动作的色块变化更容易辨认。",
    paletteName: "calico",
    palette: {
      body: "#F6E7D0",
      bodyDark: "#B96A36",
      cream: "#FFF5E8",
      line: "#5A3423",
      eye: "#15803D",
      nose: "#E8798C",
      blush: "#F3A6A6",
      shadow: "rgba(87, 65, 50, 0.16)"
    }
  },
  {
    packId: "premium-cream",
    displayName: "奶油工作猫",
    description: "奶油色圆脸猫，情绪反馈更柔和。",
    paletteName: "cream",
    palette: {
      body: "#F1C27D",
      bodyDark: "#C07A36",
      cream: "#FFF1C7",
      line: "#6B3F1D",
      eye: "#3F2A1D",
      nose: "#E77876",
      blush: "#F0A38F",
      shadow: "rgba(92, 64, 41, 0.15)"
    }
  },
  {
    packId: "premium-blue",
    displayName: "蓝灰工作猫",
    description: "蓝灰猫，高对比表情，适合深色桌面。",
    paletteName: "blue gray",
    palette: {
      body: "#6B7D90",
      bodyDark: "#35475C",
      cream: "#D9E2EC",
      line: "#1F2937",
      eye: "#A7F3D0",
      nose: "#F09AA4",
      blush: "#EAB0B8",
      shadow: "rgba(15, 23, 42, 0.22)"
    }
  },
  {
    packId: "premium-black",
    displayName: "黑曜工作猫",
    description: "黑色短毛猫，亮眼表情和强轮廓，适合深浅桌面快速辨认。",
    paletteName: "black",
    palette: {
      body: "#1F242C",
      bodyDark: "#090D12",
      cream: "#D9DEE7",
      line: "#05070A",
      eye: "#FDE047",
      nose: "#F28AA1",
      blush: "#D991A7",
      shadow: "rgba(2, 6, 23, 0.24)"
    }
  },
  {
    packId: "premium-white",
    displayName: "雪白工作猫",
    description: "白色长毛感工作猫，柔和阴影，适合清爽桌面。",
    paletteName: "white",
    palette: {
      body: "#F7F8FA",
      bodyDark: "#CBD5E1",
      cream: "#FFFFFF",
      line: "#64748B",
      eye: "#38BDF8",
      nose: "#F0909D",
      blush: "#F5B6C4",
      shadow: "rgba(100, 116, 139, 0.16)"
    }
  },
  {
    packId: "premium-ginger-white",
    displayName: "橘白工作猫",
    description: "橘白拼色猫，活泼但更清爽，适合作为日常默认猫。",
    paletteName: "ginger white",
    palette: {
      body: "#F59E42",
      bodyDark: "#B45309",
      cream: "#FFF7ED",
      line: "#7C2D12",
      eye: "#14532D",
      nose: "#EF7D83",
      blush: "#FDB0A1",
      shadow: "rgba(124, 45, 18, 0.17)"
    }
  },
  {
    packId: "premium-brown-tabby",
    displayName: "狸花工作猫",
    description: "棕狸花配色，条纹更沉稳，适合工作流状态监控。",
    paletteName: "brown tabby",
    palette: {
      body: "#A1623A",
      bodyDark: "#5C2E16",
      cream: "#EBD3B3",
      line: "#3F2214",
      eye: "#84CC16",
      nose: "#D97787",
      blush: "#D99A91",
      shadow: "rgba(63, 34, 20, 0.20)"
    }
  },
  {
    packId: "premium-lilac",
    displayName: "丁香工作猫",
    description: "淡紫灰猫，低饱和治愈配色，适合长时间陪伴。",
    paletteName: "lilac",
    palette: {
      body: "#B9A7C8",
      bodyDark: "#746184",
      cream: "#F0EAF5",
      line: "#4C3B5A",
      eye: "#5EEAD4",
      nose: "#E78BA4",
      blush: "#E7B1C6",
      shadow: "rgba(76, 59, 90, 0.16)"
    }
  },
  {
    packId: "premium-golden",
    displayName: "金渐层工作猫",
    description: "金色渐层风格，明亮但不刺眼，适合展示和演示场景。",
    paletteName: "golden shaded",
    palette: {
      body: "#DCA54A",
      bodyDark: "#8A5A18",
      cream: "#FFF0C2",
      line: "#5F3A10",
      eye: "#0F766E",
      nose: "#E98586",
      blush: "#F2AD91",
      shadow: "rgba(95, 58, 16, 0.18)"
    }
  }
] as const satisfies readonly {
  packId: string;
  displayName: string;
  description: string;
  paletteName: string;
  palette: WorkCatPalette;
}[];

export type PremiumCatPackId = (typeof PREMIUM_CAT_DEFINITIONS)[number]["packId"];

export const PREMIUM_CAT_PACKS: readonly PremiumCatPack[] = PREMIUM_CAT_DEFINITIONS.map((definition) => {
  const actions = buildActionsForPalette(definition.palette);
  return {
    packId: definition.packId,
    displayName: definition.displayName,
    description: definition.description,
    paletteName: definition.paletteName,
    attribution: "Agent Desktop Pet bundled premium work-cat asset",
    actions,
    manifest: buildManifest(definition.packId, definition.displayName, actions)
  };
});

export const PREMIUM_CAT_PACK_IDS = PREMIUM_CAT_PACKS.map((pack) => pack.packId) as readonly PremiumCatPackId[];

export function isPremiumCatPackId(packId: string): packId is PremiumCatPackId {
  return PREMIUM_CAT_PACKS.some((pack) => pack.packId === packId);
}

export function getPremiumCatPack(packId: string): PremiumCatPack | undefined {
  return PREMIUM_CAT_PACKS.find((pack) => pack.packId === packId);
}

export function renderPremiumCatFrame(frame: WorkCatFrame) {
  return renderWorkCatFrame(frame);
}

function buildActionsForPalette(palette: WorkCatPalette): Record<CoreActionId, WorkCatAction> {
  return Object.fromEntries(CORE_ACTION_IDS.map((actionId) => {
    const action = WORK_CAT_V1_ACTIONS[actionId];
    return [
      actionId,
      stabilizeWorkCatAction({
        ...action,
        frames: action.frames.map((frame) => ({
          ...frame,
          palette
        }))
      })
    ];
  })) as Record<CoreActionId, WorkCatAction>;
}

function buildManifest(packId: PremiumCatPackId, displayName: string, actions: Record<CoreActionId, WorkCatAction>): AssetManifest {
  return {
    schemaVersion: "5.0",
    packId,
    version: "1.0.0",
    rendererKind: "sprite",
    license: {
      type: "bundled",
      attribution: "Agent Desktop Pet bundled premium work-cat asset"
    },
    assets: Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
      actionId,
      {
        assetId: actionId,
        kind: "sprite",
        frameFiles: frameNames(actionId, actions[actionId].frames.length),
        fps: actions[actionId].fps
      } satisfies AssetManifestAsset
    ])),
    actions: Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
      actionId,
      actionManifest({
        assetId: actionId,
        loop: !TRANSIENT_ACTIONS.has(actionId),
        priority: priorityForAction(actionId),
        durationMs: durationForAction(actionId)
      })
    ])) as Partial<Record<CoreActionId, AssetManifestAction>>
  };
}

function frameNames(actionId: CoreActionId, frameCount: number) {
  return Array.from({ length: frameCount }, (_, index) => `${actionId}-${String(index + 1).padStart(2, "0")}.png`);
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
