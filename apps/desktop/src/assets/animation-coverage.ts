import { CORE_ACTION_IDS, type AssetManifest, type CoreActionId, type RendererKind, isCoreActionId } from "./asset-manifest";

export type AnimationCoverageState = "animated" | "static" | "fallback" | "missing";

export type AnimationCoverageReasonCode =
  | "action_frames_present"
  | "action_static_sprite"
  | "action_missing_fallback_idle"
  | "action_missing"
  | "gltf_clip_present"
  | "gltf_clip_missing"
  | "gltf_static_or_partial"
  | "renderer_kind_unsupported";

export type AnimationCoverage = {
  actionId: CoreActionId;
  requestedActionId: CoreActionId;
  coverageState: AnimationCoverageState;
  reasonCode: AnimationCoverageReasonCode;
  rendererKind: Extract<RendererKind, "css" | "sprite" | "gltf">;
  frameCount?: number;
  fps?: number;
  playbackKind?: "loop" | "transient" | "urgent";
  durationMs?: number;
  clipPresent?: boolean;
  fallbackActionId?: CoreActionId;
};

export type GltfClipCoverage = {
  rendererKind: "gltf";
  acceptedClips: CoreActionId[];
  ignoredClipCount: number;
  missingClips: CoreActionId[];
  coverageState: "animated" | "static" | "fallback" | "missing";
  reasonCode: "gltf_clip_present" | "gltf_clip_missing" | "gltf_static_or_partial";
};

export function resolveAnimationCoverage(manifest: AssetManifest, requestedActionId: CoreActionId): AnimationCoverage {
  const rendererKind = manifest.rendererKind === "gltf" ? "gltf" : manifest.rendererKind === "sprite" ? "sprite" : "css";
  const directAction = manifest.actions[requestedActionId];
  const fallbackAction = manifest.actions.idle;
  const resolvedActionId = directAction ? requestedActionId : fallbackAction ? "idle" : requestedActionId;
  const action = directAction ?? fallbackAction;
  const asset = action ? manifest.assets[action.assetId] : undefined;

  if (!action || !asset) {
    return {
      actionId: requestedActionId,
      requestedActionId,
      coverageState: "missing",
      reasonCode: "action_missing",
      rendererKind
    };
  }

  if (!directAction && fallbackAction) {
    return {
      actionId: resolvedActionId,
      requestedActionId,
      coverageState: "fallback",
      reasonCode: "action_missing_fallback_idle",
      rendererKind,
      frameCount: frameCountForAsset(asset),
      fps: asset.fps,
      playbackKind: playbackKindForAction(action),
      durationMs: action.durationMs,
      clipPresent: rendererKind === "gltf" ? false : undefined,
      fallbackActionId: "idle"
    };
  }

  if (rendererKind === "sprite") {
    const frameCount = frameCountForAsset(asset);
    return {
      actionId: resolvedActionId,
      requestedActionId,
      coverageState: frameCount > 1 ? "animated" : "static",
      reasonCode: frameCount > 1 ? "action_frames_present" : "action_static_sprite",
      rendererKind,
      frameCount,
      fps: asset.fps,
      playbackKind: playbackKindForAction(action),
      durationMs: action.durationMs
    };
  }

  if (rendererKind === "gltf") {
    return {
      actionId: resolvedActionId,
      requestedActionId,
      coverageState: "static",
      reasonCode: "gltf_static_or_partial",
      rendererKind,
      playbackKind: playbackKindForAction(action),
      durationMs: action.durationMs,
      clipPresent: false
    };
  }

  return {
    actionId: resolvedActionId,
    requestedActionId,
    coverageState: "static",
    reasonCode: "renderer_kind_unsupported",
    rendererKind,
    playbackKind: playbackKindForAction(action),
    durationMs: action.durationMs
  };
}

export function classifyGltfClipCoverage(clipNames: readonly string[]): GltfClipCoverage {
  const accepted = new Set<CoreActionId>();
  let ignoredClipCount = 0;

  for (const name of clipNames) {
    if (typeof name === "string" && isCoreActionId(name)) {
      accepted.add(name);
    } else {
      ignoredClipCount += 1;
    }
  }

  const acceptedClips = CORE_ACTION_IDS.filter((actionId) => accepted.has(actionId));
  const missingClips = CORE_ACTION_IDS.filter((actionId) => !accepted.has(actionId));
  const hasAnyAcceptedClip = acceptedClips.length > 0;
  const hasFullCoverage = missingClips.length === 0;

  return {
    rendererKind: "gltf",
    acceptedClips,
    ignoredClipCount,
    missingClips,
    coverageState: hasFullCoverage ? "animated" : hasAnyAcceptedClip ? "fallback" : "static",
    reasonCode: hasFullCoverage ? "gltf_clip_present" : hasAnyAcceptedClip ? "gltf_clip_missing" : "gltf_static_or_partial"
  };
}

function frameCountForAsset(asset: { fileName?: string; frameFiles?: string[] }) {
  if (Array.isArray(asset.frameFiles) && asset.frameFiles.length > 0) {
    return asset.frameFiles.length;
  }
  return asset.fileName ? 1 : 1;
}

function playbackKindForAction(action: { loop: boolean; priority?: string }) {
  if (action.priority === "urgent") {
    return "urgent";
  }
  if (action.loop) {
    return "loop";
  }
  return "transient";
}
