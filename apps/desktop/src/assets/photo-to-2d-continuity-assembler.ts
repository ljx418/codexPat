import { CORE_ACTION_IDS, type AssetManifest, type CoreActionId } from "./asset-manifest";
import { adaptV10PetJsonAnimationPack, type SafeAnimationPackAdapterOutput, type V10PetJsonPack } from "./animation-pack-adapter";

const SAFE_FRAME_FILE_PATTERN = /^[a-z0-9][a-z0-9._/-]{0,95}\.(png|webp)$/;
const FORBIDDEN_PATTERN = /Authorization|api-token\.json|raw payload|raw photo|raw provider response|source filename|source path|photo path|workspace path|config path|provider payload|credential|prompt text|raw prompt|promptText|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\/|sk-[A-Za-z0-9_-]{8,}|\.\./i;
const MAX_ADJACENT_DELTA = 12;

export type Photo2DFrameMetadata = {
  fileName: string;
  poseSignature: string;
  bodyY: number;
  headY: number;
  silhouetteWidth: number;
  alphaCoverage: number;
  offCanvas: boolean;
};

export type Photo2DActionFrameSet = {
  actionId: CoreActionId;
  frames: Photo2DFrameMetadata[];
  fps: number;
};

export type Photo2DContinuityAssemblyReasonCode =
  | "accepted"
  | "frame_folder_required"
  | "core_action_missing"
  | "frame_count_insufficient"
  | "frame_decode_failed"
  | "frame_blank"
  | "frame_transparent"
  | "frame_off_canvas"
  | "first_final_mismatch"
  | "adjacent_delta_exceeded"
  | "unsafe_svg_payload"
  | "manifest_import_failed"
  | "previous_pack_preserved";

export type Photo2DContinuityIssue = {
  actionId?: CoreActionId;
  reasonCode: Exclude<Photo2DContinuityAssemblyReasonCode, "accepted">;
  frameIndex?: number;
  details: string;
};

export type Photo2DContinuityAssemblyResult = {
  status: "accepted" | "rejected";
  reasonCode: Photo2DContinuityAssemblyReasonCode;
  generatedPackId: string;
  manifest?: AssetManifest;
  safeRendererOutput?: SafeAnimationPackAdapterOutput;
  frameCountTable: Record<CoreActionId, number>;
  continuityTable: Record<CoreActionId, {
    firstFinalClosed: boolean;
    maxAdjacentDelta: number;
  }>;
  issues: Photo2DContinuityIssue[];
  preservedPreviousActivePack: boolean;
};

export function assemblePhoto2DContinuityPack(options: {
  generatedPackId: string;
  displayName: string;
  actionFrames: Photo2DActionFrameSet[];
  previousActiveManifest?: AssetManifest;
}): Photo2DContinuityAssemblyResult {
  const generatedPackId = safeId(options.generatedPackId) || "photo-2d-generated-pack";
  const frameCountTable = emptyFrameCountTable();
  const continuityTable = emptyContinuityTable();
  const issues: Photo2DContinuityIssue[] = [];

  if (!Array.isArray(options.actionFrames) || options.actionFrames.length === 0) {
    return rejected("frame_folder_required", generatedPackId, frameCountTable, continuityTable, issues, Boolean(options.previousActiveManifest));
  }

  const byAction = new Map(options.actionFrames.map((action) => [action.actionId, action]));
  for (const actionId of CORE_ACTION_IDS) {
    const action = byAction.get(actionId);
    if (!action) {
      issues.push({ actionId, reasonCode: "core_action_missing", details: "required core action is missing" });
      continue;
    }
    validateAction(action, frameCountTable, continuityTable, issues);
  }

  if (issues.length > 0) {
    return rejected(issues[0].reasonCode, generatedPackId, frameCountTable, continuityTable, issues, true);
  }

  const pack = buildPetJsonPack(generatedPackId, options.displayName, CORE_ACTION_IDS.map((actionId) => byAction.get(actionId)!));
  const adapter = adaptV10PetJsonAnimationPack(pack);
  if (!adapter.ok || !adapter.manifest || !adapter.safeOutput) {
    return rejected("manifest_import_failed", generatedPackId, frameCountTable, continuityTable, [
      ...issues,
      { reasonCode: "manifest_import_failed", details: adapter.reasonCode }
    ], true);
  }

  return {
    status: "accepted",
    reasonCode: "accepted",
    generatedPackId,
    manifest: adapter.manifest,
    safeRendererOutput: adapter.safeOutput,
    frameCountTable,
    continuityTable,
    issues: [],
    preservedPreviousActivePack: false
  };
}

export function buildPhoto2DContinuityAssemblyEvidenceSnapshot(result: Photo2DContinuityAssemblyResult) {
  return {
    status: result.status,
    reasonCode: result.reasonCode,
    generatedPackId: result.generatedPackId,
    coreActionCoverage: CORE_ACTION_IDS.filter((actionId) => result.frameCountTable[actionId] > 0),
    frameCountTable: result.frameCountTable,
    continuityTable: result.continuityTable,
    issueTable: result.issues.map((issue) => ({
      actionId: issue.actionId,
      reasonCode: issue.reasonCode,
      frameIndex: issue.frameIndex
    })),
    preservedPreviousActivePack: result.preservedPreviousActivePack,
    safeRendererOutputFields: result.safeRendererOutput ? [
      "packId",
      "rendererKind",
      "actions.actionId",
      "actions.assetId",
      "actions.frameCount",
      "actions.fps",
      "actions.loop",
      "actions.transient",
      "actions.durationMs",
      "actions.fallbackActionId"
    ] : []
  };
}

export function photo2DContinuityAssemblyHasForbiddenContent(value: unknown) {
  const serialized = JSON.stringify(value)
    .replace(/safeRendererOutputFields|preservedPreviousActivePack/g, "");
  return FORBIDDEN_PATTERN.test(serialized);
}

function validateAction(
  action: Photo2DActionFrameSet,
  frameCountTable: Record<CoreActionId, number>,
  continuityTable: Photo2DContinuityAssemblyResult["continuityTable"],
  issues: Photo2DContinuityIssue[]
) {
  const requiredFrames = action.actionId === "idle" || action.actionId === "thinking" || action.actionId === "running" || action.actionId === "sleeping" ? 6 : 3;
  frameCountTable[action.actionId] = action.frames.length;
  if (action.frames.length < requiredFrames) {
    issues.push({ actionId: action.actionId, reasonCode: "frame_count_insufficient", details: `expected at least ${requiredFrames} frames` });
    return;
  }

  for (const [index, frame] of action.frames.entries()) {
    if (!SAFE_FRAME_FILE_PATTERN.test(frame.fileName) || photo2DContinuityAssemblyHasForbiddenContent(frame)) {
      issues.push({ actionId: action.actionId, reasonCode: "unsafe_svg_payload", frameIndex: index, details: "frame metadata is unsafe" });
      return;
    }
    if (frame.alphaCoverage <= 0) {
      issues.push({ actionId: action.actionId, reasonCode: "frame_blank", frameIndex: index, details: "frame has no visible pixels" });
      return;
    }
    if (frame.alphaCoverage < 0.08) {
      issues.push({ actionId: action.actionId, reasonCode: "frame_transparent", frameIndex: index, details: "frame is too transparent" });
      return;
    }
    if (frame.offCanvas) {
      issues.push({ actionId: action.actionId, reasonCode: "frame_off_canvas", frameIndex: index, details: "frame is off canvas" });
      return;
    }
  }

  const first = action.frames[0];
  const last = action.frames[action.frames.length - 1];
  const firstFinalClosed = first.poseSignature === last.poseSignature &&
    first.bodyY === last.bodyY &&
    first.headY === last.headY &&
    first.silhouetteWidth === last.silhouetteWidth;
  if (!firstFinalClosed) {
    issues.push({ actionId: action.actionId, reasonCode: "first_final_mismatch", frameIndex: action.frames.length - 1, details: "first/final frame does not close" });
  }

  let maxAdjacentDelta = 0;
  for (let index = 1; index < action.frames.length; index += 1) {
    maxAdjacentDelta = Math.max(maxAdjacentDelta, frameDelta(action.frames[index - 1], action.frames[index]));
  }
  continuityTable[action.actionId] = {
    firstFinalClosed,
    maxAdjacentDelta
  };
  if (maxAdjacentDelta > MAX_ADJACENT_DELTA) {
    issues.push({ actionId: action.actionId, reasonCode: "adjacent_delta_exceeded", details: `maxAdjacentDelta=${maxAdjacentDelta}` });
  }
}

function buildPetJsonPack(generatedPackId: string, displayName: string, actionFrames: Photo2DActionFrameSet[]): V10PetJsonPack {
  return {
    schemaVersion: "10.6",
    packId: generatedPackId,
    displayName: sanitizeDisplayName(displayName),
    rendererKind: "sprite",
    format: "frameSequence",
    canvas: { width: 512, height: 512 },
    actions: Object.fromEntries(actionFrames.map((action) => [
      action.actionId,
      {
        frames: action.frames.map((frame) => normalizeFrameFileName(frame.fileName)),
        fps: Math.min(12, Math.max(4, action.fps)),
        loop: action.actionId === "idle" || action.actionId === "thinking" || action.actionId === "running" || action.actionId === "sleeping",
        transient: action.actionId === "success" || action.actionId === "warning" || action.actionId === "error" || action.actionId === "need_input",
        durationMs: action.frames.length * 120,
        fallbackActionId: "idle"
      }
    ])) as V10PetJsonPack["actions"],
    license: {
      source: "generated-local",
      attribution: `${generatedPackId} local generated frame sequence`
    }
  };
}

function emptyFrameCountTable() {
  return Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [actionId, 0])) as Record<CoreActionId, number>;
}

function emptyContinuityTable() {
  return Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [actionId, {
    firstFinalClosed: false,
    maxAdjacentDelta: 0
  }])) as Photo2DContinuityAssemblyResult["continuityTable"];
}

function rejected(
  reasonCode: Photo2DContinuityAssemblyReasonCode,
  generatedPackId: string,
  frameCountTable: Record<CoreActionId, number>,
  continuityTable: Photo2DContinuityAssemblyResult["continuityTable"],
  issues: Photo2DContinuityIssue[],
  preservedPreviousActivePack: boolean
): Photo2DContinuityAssemblyResult {
  return {
    status: "rejected",
    reasonCode,
    generatedPackId,
    frameCountTable,
    continuityTable,
    issues,
    preservedPreviousActivePack
  };
}

function frameDelta(a: Photo2DFrameMetadata, b: Photo2DFrameMetadata) {
  return Math.round(Math.abs(a.bodyY - b.bodyY) + Math.abs(a.headY - b.headY) + Math.abs(a.silhouetteWidth - b.silhouetteWidth));
}

function safeId(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return /^[a-z0-9][a-z0-9._-]{0,63}$/.test(normalized) ? normalized : "";
}

function sanitizeDisplayName(value: string) {
  const sanitized = value.replace(/[^A-Za-z0-9 ._-]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  return sanitized || "Photo 2D Generated Cat";
}

function normalizeFrameFileName(value: string) {
  return value.replace(/[\\/]+/g, "-");
}
