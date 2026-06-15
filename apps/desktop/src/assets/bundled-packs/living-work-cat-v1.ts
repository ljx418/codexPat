import {
  CORE_ACTION_IDS,
  type AssetManifest,
  type AssetManifestAction,
  type AssetManifestAsset,
  type CoreActionId,
  type OptionalActionId,
  type PlaybackPriority,
  type SafeActionId
} from "../asset-manifest";
import {
  WORK_CAT_V1_ACTIONS,
  renderWorkCatFrame,
  type WorkCatAction,
  type WorkCatFrame,
  type WorkCatPalette
} from "./work-cat-v1";
import { stabilizeWorkCatAction } from "./work-cat-animation-continuity";

export const LIVING_WORK_CAT_V1_PACK_ID = "living-work-cat-v1";

export const LIVING_WORK_CAT_OPTIONAL_ACTION_IDS = [
  "idle_blink",
  "idle_look_left",
  "idle_look_right",
  "idle_tail_sway",
  "idle_stretch",
  "idle_settle",
  "idle_nap",
  "idle_wake",
  "pointer_near",
  "pointer_leave",
  "click",
  "double_click",
  "drag",
  "drag_start",
  "dragging",
  "drop"
] as const satisfies readonly OptionalActionId[];

export type LivingWorkCatActionId = CoreActionId | (typeof LIVING_WORK_CAT_OPTIONAL_ACTION_IDS)[number];

export type LivingWorkCatPack = {
  packId: typeof LIVING_WORK_CAT_V1_PACK_ID;
  displayName: string;
  description: string;
  paletteName: string;
  attribution: string;
  actions: Record<LivingWorkCatActionId, WorkCatAction>;
  manifest: AssetManifest;
};

const LIVING_PALETTE: WorkCatPalette = {
  body: "#D9782D",
  bodyDark: "#7A3518",
  cream: "#FFE0A8",
  line: "#2F1A10",
  eye: "#111827",
  nose: "#E95D66",
  blush: "#F59E92",
  shadow: "rgba(17, 24, 39, 0.24)"
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

const CORE_FRAME_AMPLIFIERS: Partial<Record<CoreActionId, (frame: WorkCatFrame, index: number) => Partial<WorkCatFrame>>> = {
  idle: (_frame, index) => ({
    bodyY: 143 + [1, -1, -2, -1, 1, 2, 0, -1][index % 8],
    bodyScaleX: 1.04,
    headY: 78 + [2, 0, -1, 0, 2, 3, 1, 0][index % 8],
    tailPhase: index,
    earTilt: [1, 2, 0, -1, 0, 2, 1, -1][index % 8]
  }),
  thinking: (frame) => ({
    headX: frame.headX - 2,
    headTilt: frame.headTilt - 2,
    earTilt: frame.earTilt - 2,
    eyeMode: "focus"
  }),
  running: (frame, index) => ({
    bodyScaleX: frame.bodyScaleX + 0.04,
    bodyScaleY: frame.bodyScaleY - 0.02,
    headX: frame.headX + 2,
    frontPawLift: frame.frontPawLift + [2, 0, -2, 1, 0, -2, 2, 0][index % 8],
    backPawLift: frame.backPawLift + [-1, 2, 1, -2, 2, 1, -1, 2][index % 8]
  }),
  success: (frame, index) => ({
    bodyY: frame.bodyY - [0, 7, 5, 0][index % 4],
    frontPawLift: frame.frontPawLift + [1, 6, 4, 1][index % 4],
    eyeMode: "wide",
    mouthMode: "open"
  }),
  warning: (frame, index) => ({
    headTilt: frame.headTilt + [-2, -7, 7, 0][index % 4],
    earTilt: frame.earTilt + 4,
    eyeMode: "wide"
  }),
  error: (frame) => ({
    bodyY: frame.bodyY + 2,
    bodyScaleY: frame.bodyScaleY + 0.03,
    headY: frame.headY + 2,
    eyeMode: "sad",
    mouthMode: "sad"
  }),
  need_input: (frame, index) => ({
    headY: frame.headY - [0, 3, 2, 0][index % 4],
    frontPawLift: frame.frontPawLift + [2, 8, 9, 4][index % 4],
    eyeMode: index === 0 ? "open" : "wide"
  }),
  sleeping: (frame, index) => ({
    bodyScaleX: frame.bodyScaleX + 0.03,
    bodyScaleY: frame.bodyScaleY - 0.02,
    headY: frame.headY + [0, 1, 2, 1, 0, -1, 0, 1][index % 8]
  })
};

export const LIVING_WORK_CAT_V1_ACTIONS: Record<LivingWorkCatActionId, WorkCatAction> = {
  ...Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
    actionId,
    coreAction(actionId)
  ])) as Record<CoreActionId, WorkCatAction>,
  idle_blink: actionFrom("idle", 10, false, [0, 1, 2, 3], [
    { eyeMode: "open", mouthMode: "smile" },
    { eyeMode: "blink", mouthMode: "small", headY: 80 },
    { eyeMode: "blink", mouthMode: "small", headY: 81 },
    { eyeMode: "open", mouthMode: "smile" }
  ]),
  idle_look_left: actionFrom("idle", 9, false, [0, 1, 2, 3], [
    { headX: 123, headTilt: -3, eyeMode: "focus" },
    { headX: 119, headTilt: -6, eyeMode: "focus", earTilt: -3 },
    { headX: 118, headTilt: -7, eyeMode: "focus", earTilt: -4 },
    { headX: 123, headTilt: -3, eyeMode: "open" }
  ]),
  idle_look_right: actionFrom("idle", 9, false, [4, 5, 6, 7], [
    { headX: 129, headTilt: 3, eyeMode: "focus" },
    { headX: 134, headTilt: 6, eyeMode: "focus", earTilt: 3 },
    { headX: 135, headTilt: 7, eyeMode: "focus", earTilt: 4 },
    { headX: 129, headTilt: 3, eyeMode: "open" }
  ]),
  idle_tail_sway: actionFrom("idle", 8, true, [0, 1, 2, 3, 4, 5, 6, 7], [
    { tailPhase: 0 },
    { tailPhase: 1, bodyY: 142 },
    { tailPhase: 2, bodyY: 141 },
    { tailPhase: 3, headTilt: -2 },
    { tailPhase: 4 },
    { tailPhase: 5, bodyY: 146 },
    { tailPhase: 6, headTilt: 2 },
    { tailPhase: 7 }
  ]),
  idle_stretch: actionFrom("idle", 8, false, [0, 1, 2, 3, 4], [
    { bodyScaleX: 1.08, bodyScaleY: 0.94, headY: 82, frontPawLift: 2 },
    { bodyScaleX: 1.16, bodyScaleY: 0.84, headY: 88, frontPawLift: 9, backPawLift: -2, eyeMode: "blink" },
    { bodyScaleX: 1.2, bodyScaleY: 0.8, headY: 91, frontPawLift: 12, backPawLift: -3, mouthMode: "open" },
    { bodyScaleX: 1.13, bodyScaleY: 0.9, headY: 85, frontPawLift: 7 },
    { bodyScaleX: 1.04, bodyScaleY: 1.0, headY: 80, frontPawLift: 1 }
  ]),
  idle_settle: actionFrom("idle", 8, false, [5, 6, 7, 0], [
    { bodyY: 146, bodyScaleX: 1.01, bodyScaleY: 1.02 },
    { bodyY: 148, bodyScaleX: 0.99, bodyScaleY: 1.04, eyeMode: "blink" },
    { bodyY: 146, bodyScaleX: 1.0, bodyScaleY: 1.02 },
    { bodyY: 144, bodyScaleX: 1.03, bodyScaleY: 1.0, eyeMode: "open" }
  ]),
  idle_nap: actionFrom("sleeping", 7, true, [0, 1, 2, 3, 4, 5, 6, 7], [
    {}, {}, {}, {}, {}, {}, {}, {}
  ]),
  idle_wake: actionFrom("sleeping", 9, false, [3, 2, 1, 0], [
    { eyeMode: "sleep", mouthMode: "sleep" },
    { bodyScaleX: 1.08, bodyScaleY: 0.86, headX: 111, headY: 120, eyeMode: "blink", mouthMode: "small" },
    { bodyScaleX: 1.02, bodyScaleY: 0.96, headX: 120, headY: 92, headTilt: -2, eyeMode: "wide", mouthMode: "small" },
    { bodyScaleX: 1.04, bodyScaleY: 1.0, headX: 126, headY: 80, eyeMode: "open", mouthMode: "smile" }
  ]),
  pointer_near: actionFrom("idle", 10, false, [0, 1, 2, 3], [
    { headY: 78, eyeMode: "open" },
    { headY: 75, headTilt: -3, earTilt: 4, eyeMode: "wide" },
    { headY: 75, headTilt: 3, earTilt: 5, eyeMode: "wide", frontPawLift: 3 },
    { headY: 77, headTilt: 0, earTilt: 3, eyeMode: "open" }
  ]),
  pointer_leave: actionFrom("idle", 9, false, [3, 2, 1, 0], [
    { headY: 77, headTilt: 0, earTilt: 3, eyeMode: "open" },
    { headY: 79, headTilt: 2, earTilt: 1, eyeMode: "blink", mouthMode: "small" },
    { headY: 80, headTilt: -1, earTilt: 0, eyeMode: "open" },
    { headY: 78, headTilt: 0, earTilt: 1, eyeMode: "open", mouthMode: "smile" }
  ]),
  click: actionFrom("success", 12, false, [0, 1, 2, 3], [
    { bodyY: 140, eyeMode: "wide", mouthMode: "smile" },
    { bodyY: 128, frontPawLift: 13, backPawLift: 5, eyeMode: "wide", mouthMode: "open" },
    { bodyY: 133, headTilt: -6, frontPawLift: 9, eyeMode: "wide", mouthMode: "smile" },
    { bodyY: 142, frontPawLift: 3, eyeMode: "open", mouthMode: "smile" }
  ]),
  double_click: actionFrom("success", 12, false, [0, 1, 2, 1, 3, 0], [
    { bodyY: 140, eyeMode: "wide" },
    { bodyY: 126, headTilt: 8, frontPawLift: 14, backPawLift: 8, mouthMode: "open" },
    { bodyY: 136, headTilt: -8, frontPawLift: 12, backPawLift: -4, mouthMode: "smile" },
    { bodyY: 126, headTilt: -6, frontPawLift: 15, backPawLift: 7, mouthMode: "open" },
    { bodyY: 138, headTilt: 5, frontPawLift: 8, eyeMode: "wide" },
    { bodyY: 143, headTilt: 0, frontPawLift: 1, eyeMode: "open" }
  ]),
  drag: actionFrom("running", 12, true, [0, 1, 2, 3, 4, 5], [
    { bodyY: 136, headY: 72, eyeMode: "wide", mouthMode: "small" },
    { bodyY: 132, headY: 68, headTilt: 6, frontPawLift: 10, backPawLift: 4 },
    { bodyY: 136, headY: 72, headTilt: -6, frontPawLift: -4, backPawLift: 10 },
    { bodyY: 132, headY: 68, headTilt: 5, frontPawLift: 9, backPawLift: -3 },
    { bodyY: 136, headY: 72, headTilt: -5, frontPawLift: -3, backPawLift: 9 },
    { bodyY: 134, headY: 70, headTilt: 0, frontPawLift: 6, backPawLift: 6 }
  ]),
  drag_start: actionFrom("running", 12, false, [0, 1, 2, 3], [
    { bodyScaleX: 1.08, bodyScaleY: 0.92, headY: 77, eyeMode: "wide" },
    { bodyScaleX: 0.98, bodyScaleY: 1.1, headY: 72, frontPawLift: 12, backPawLift: 12, eyeMode: "wide", mouthMode: "open" },
    { bodyScaleX: 1.04, bodyScaleY: 0.96, headY: 76, frontPawLift: 6, backPawLift: -4 },
    { bodyScaleX: 1.02, bodyScaleY: 1.0, headY: 78, eyeMode: "open" }
  ]),
  dragging: actionFrom("running", 12, true, [0, 1, 2, 3, 4, 5], [
    { bodyY: 136, headY: 72, eyeMode: "wide", mouthMode: "small" },
    { bodyY: 132, headY: 68, headTilt: 6, frontPawLift: 10, backPawLift: 4 },
    { bodyY: 136, headY: 72, headTilt: -6, frontPawLift: -4, backPawLift: 10 },
    { bodyY: 132, headY: 68, headTilt: 5, frontPawLift: 9, backPawLift: -3 },
    { bodyY: 136, headY: 72, headTilt: -5, frontPawLift: -3, backPawLift: 9 },
    { bodyY: 134, headY: 70, headTilt: 0, frontPawLift: 6, backPawLift: 6 }
  ]),
  drop: actionFrom("idle", 10, false, [0, 1, 2, 3], [
    { bodyY: 132, bodyScaleX: 1.0, bodyScaleY: 1.0, eyeMode: "wide", mouthMode: "open" },
    { bodyY: 151, bodyScaleX: 1.14, bodyScaleY: 0.82, headY: 86, frontPawLift: 3, backPawLift: 3, eyeMode: "wide" },
    { bodyY: 146, bodyScaleX: 1.02, bodyScaleY: 1.03, headY: 81, eyeMode: "blink", mouthMode: "small" },
    { bodyY: 143, bodyScaleX: 1.04, bodyScaleY: 1.0, headY: 78, eyeMode: "open", mouthMode: "smile" }
  ])
};

export const LIVING_WORK_CAT_V1_PACK: LivingWorkCatPack = {
  packId: LIVING_WORK_CAT_V1_PACK_ID,
  displayName: "Living Work Cat",
  description: "首启默认的高可读动态工作猫，覆盖空闲微动作、点击、双击、拖拽和核心状态。",
  paletteName: "warm flagship tabby",
  attribution: "Agent Desktop Pet bundled flagship living work-cat asset",
  actions: LIVING_WORK_CAT_V1_ACTIONS,
  manifest: buildManifest()
};

export const LIVING_WORK_CAT_V1_ASSET_MANIFEST = LIVING_WORK_CAT_V1_PACK.manifest;

export function isLivingWorkCatPackId(packId: string): packId is typeof LIVING_WORK_CAT_V1_PACK_ID {
  return packId === LIVING_WORK_CAT_V1_PACK_ID;
}

export function getLivingWorkCatPack(packId: string): LivingWorkCatPack | undefined {
  return isLivingWorkCatPackId(packId) ? LIVING_WORK_CAT_V1_PACK : undefined;
}

export function renderLivingWorkCatFrame(frame: WorkCatFrame) {
  return renderWorkCatFrame(frame);
}

function coreAction(actionId: CoreActionId): WorkCatAction {
  const source = WORK_CAT_V1_ACTIONS[actionId];
  const amplifier = CORE_FRAME_AMPLIFIERS[actionId];
  const frames = source.frames.map((frame, index) => livingFrame(frame, amplifier?.(frame, index)));
  return stabilizeWorkCatAction({
    fps: source.fps,
    loop: source.loop,
    frames
  });
}

function actionFrom(
  sourceActionId: CoreActionId,
  fps: number,
  loop: boolean,
  sourceIndexes: number[],
  overrides: Array<Partial<WorkCatFrame>>
): WorkCatAction {
  const source = WORK_CAT_V1_ACTIONS[sourceActionId].frames;
  const frames = sourceIndexes.map((sourceIndex, index) => livingFrame(source[sourceIndex % source.length], overrides[index] ?? {}));
  return stabilizeWorkCatAction({
    fps,
    loop,
    frames
  });
}

function livingFrame(frame: WorkCatFrame, overrides: Partial<WorkCatFrame> = {}): WorkCatFrame {
  return {
    ...frame,
    palette: LIVING_PALETTE,
    bodyScaleX: frame.bodyScaleX + 0.03,
    ...overrides
  };
}

function buildManifest(): AssetManifest {
  const actionIds = Object.keys(LIVING_WORK_CAT_V1_ACTIONS) as LivingWorkCatActionId[];
  return {
    schemaVersion: "5.0",
    packId: LIVING_WORK_CAT_V1_PACK_ID,
    version: "1.0.0",
    rendererKind: "sprite",
    license: {
      type: "bundled",
      attribution: "Agent Desktop Pet bundled flagship living work-cat asset"
    },
    assets: Object.fromEntries(actionIds.map((actionId) => [
      actionId,
      {
        assetId: actionId,
        kind: "sprite",
        frameFiles: frameNames(actionId, LIVING_WORK_CAT_V1_ACTIONS[actionId].frames.length),
        fps: LIVING_WORK_CAT_V1_ACTIONS[actionId].fps
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

function frameNames(actionId: LivingWorkCatActionId, frameCount: number) {
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
