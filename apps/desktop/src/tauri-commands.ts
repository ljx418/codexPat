import { invoke } from "@tauri-apps/api/core";
import type { CatState } from "./pet-states";
import type { PlaybackPriority } from "./assets/asset-manifest";

export type AppSettings = {
  muted: boolean;
  petVisible: boolean;
  petX: number | null;
  petY: number | null;
};

export type WindowPosition = {
  x: number;
  y: number;
};

export type PetInstance = {
  instanceId: string;
  sourceKind: string;
  sourceId: string;
  displayName: string;
  windowLabel: string;
  workspaceLabel?: string | null;
  workspaceHash?: string | null;
  position: WindowPosition;
  visible: boolean;
  currentState: string;
  catProfileId: string;
  createdAt: string;
  updatedAt: string;
  lastEventAt?: string | null;
  isDefault: boolean;
};

export type PersonalizedAssetPack = {
  packId: string;
  displayName: string;
  rendererKind: "sprite" | "gltf";
  copiedAssetIds: string[];
  manifestHash: string;
  createdAt: string;
  activeInstances: string[];
  validationStatus: string;
};

export type PersonalizedAssetImportResult = {
  packId: string;
  displayName: string;
  rendererKind: "sprite" | "gltf";
  copiedAssetIds: string[];
  manifestHash: string;
  appManagedStorage: boolean;
  validationStatus: string;
};

export type PersonalizedAssetActivationResult = {
  packId: string;
  instanceId: string;
  rendererKind: "sprite" | "gltf";
  validationStatus: string;
};

export type AnimatedSpriteAssemblyResult = {
  packId: string;
  displayName: string;
  rendererKind: "sprite";
  actionFrameCounts: Record<string, number>;
  fps: number;
  manifestGenerated: boolean;
  imported: boolean;
  activatedInstanceId?: string;
  reasonCode: string;
};

export type PersonalizedAssetUpdateEvent = {
  instanceId: string;
};

export type RuntimeImportedAssetPack = {
  schemaVersion: "5.0";
  packId: string;
  version: string;
  rendererKind: "sprite" | "gltf";
  license: {
    type: string;
    attribution: string;
  };
  assets: Record<string, {
    assetId: string;
    kind: "sprite" | "gltf";
  }>;
  actions: Record<string, {
    assetId: string;
    loop: boolean;
    priority: PlaybackPriority;
    durationMs?: number;
  }>;
  validationStatus: string;
};

export type RuntimeAssetData = {
  mimeType: string;
  base64: string;
  frames?: Array<{
    mimeType: string;
    base64: string;
  }>;
  fps?: number;
};

export type CatProfile = {
  id: string;
  name: string;
  description?: string;
  cssClass: string;
  previewColor?: string;
  builtIn: true;
};

export type ApiEventSummary = {
  id: string;
  sourceId?: string | null;
  level?: string | null;
  titlePreview?: string | null;
  messagePreview?: string | null;
  targetInstanceId?: string | null;
  targetWindowLabel?: string | null;
  status: number;
  accepted: boolean;
  reasonCode?: string | null;
  reasonField?: string | null;
  reason?: string | null;
  receivedAt: string;
};

export type BridgeDiagnostics = {
  enabled: boolean;
  listenAddress: string;
  queueLength: number;
  queueCapacity: number;
  acceptedEvents: ApiEventSummary[];
  rejectedEvents: ApiEventSummary[];
  lastAccepted?: ApiEventSummary | null;
  lastRejected?: ApiEventSummary | null;
  sound: {
    playbackAvailable: boolean;
    muted: boolean;
    cooldownMs: number;
    acceptedIds: string[];
    lastDecision?: {
      sound: string;
      played: boolean;
      reason: string;
      decidedAt: string;
    } | null;
  };
  hardwareLight: boolean;
  startupError?: string | null;
};

export type TokenStatus = "configured" | "missing" | "unreadable";

export type DiagnosticsViewState = {
  diagnostics: BridgeDiagnostics;
  tokenStatus: TokenStatus;
  refreshedAt: Date;
  error?: string;
};

export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

const previewInstance: PetInstance = {
  instanceId: "default",
  sourceKind: "preview",
  sourceId: "browser-preview",
  displayName: "Agent Desktop Pet Preview",
  windowLabel: "main",
  workspaceLabel: null,
  workspaceHash: null,
  position: { x: 120, y: 120 },
  visible: true,
  currentState: "idle",
  catProfileId: "orange-tabby",
  createdAt: "browser-preview",
  updatedAt: "browser-preview",
  lastEventAt: null,
  isDefault: true
};

function previewSettings(): AppSettings {
  return {
    muted: false,
    petVisible: true,
    petX: previewInstance.position.x,
    petY: previewInstance.position.y
  };
}

function previewProfiles(): CatProfile[] {
  return [
    {
      id: "default-cat",
      name: "Default Cat",
      description: "Browser preview default cat profile.",
      cssClass: "cat-profile-default",
      previewColor: "#8d99a8",
      builtIn: true
    },
    {
      id: "orange-tabby",
      name: "Orange Tabby",
      description: "Browser preview orange tabby profile.",
      cssClass: "cat-profile-orange-tabby",
      previewColor: "#d97706",
      builtIn: true
    },
    {
      id: "black-cat",
      name: "Black Cat",
      description: "Browser preview black cat profile.",
      cssClass: "cat-profile-black-cat",
      previewColor: "#111827",
      builtIn: true
    }
  ];
}

function previewDiagnostics(): BridgeDiagnostics {
  return {
    enabled: false,
    listenAddress: "browser-preview-no-tauri-bridge",
    queueLength: 0,
    queueCapacity: 32,
    acceptedEvents: [],
    rejectedEvents: [],
    lastAccepted: null,
    lastRejected: null,
    sound: {
      playbackAvailable: false,
      muted: false,
      cooldownMs: 1200,
      acceptedIds: ["none"],
      lastDecision: null
    },
    hardwareLight: false,
    startupError: "browser_preview_without_tauri_runtime"
  };
}

async function tauriInvoke<T>(command: string, args?: Record<string, unknown>, fallback?: () => T): Promise<T> {
  if (isTauriRuntime()) {
    return invoke<T>(command, args);
  }
  if (fallback) {
    return fallback();
  }
  throw new Error(`Tauri command ${command} is unavailable in browser preview.`);
}

export function getSettings(): Promise<AppSettings> {
  return tauriInvoke("get_settings", undefined, previewSettings);
}

export function setMuted(muted: boolean): Promise<AppSettings> {
  return tauriInvoke("set_muted", { muted }, () => ({ ...previewSettings(), muted }));
}

export function getPetPosition(): Promise<WindowPosition> {
  return tauriInvoke("get_pet_position", undefined, () => previewInstance.position);
}

export function setCurrentPetPosition(position: WindowPosition): Promise<WindowPosition> {
  return tauriInvoke("set_current_pet_position", { position }, () => position);
}

export function getApiDebugState(): Promise<BridgeDiagnostics> {
  return tauriInvoke("get_api_debug_state", undefined, previewDiagnostics);
}

export function getCurrentPetInstance(): Promise<PetInstance> {
  return tauriInvoke("get_current_pet_instance", undefined, () => previewInstance);
}

export function listPetInstances(): Promise<PetInstance[]> {
  return tauriInvoke("list_pet_instances", undefined, () => [previewInstance]);
}

export function listCatProfiles(): Promise<CatProfile[]> {
  return tauriInvoke("list_cat_profiles", undefined, previewProfiles);
}

export function listPersonalizedAssetPacks(): Promise<PersonalizedAssetPack[]> {
  return tauriInvoke("list_personalized_asset_packs", undefined, () => []);
}

export function assembleAnimatedSpritePack(
  sourceFolderPath: string,
  displayName: string,
  fps: number,
  activateInstanceId?: string
): Promise<AnimatedSpriteAssemblyResult> {
  return tauriInvoke("assemble_animated_sprite_pack", {
    sourceFolderPath,
    displayName,
    fps,
    activateInstanceId: activateInstanceId || null
  });
}

export function importPersonalizedAssetPack(manifestPath: string, displayName?: string): Promise<PersonalizedAssetImportResult> {
  return tauriInvoke("import_personalized_asset_pack", {
    manifestPath,
    displayName: displayName || null
  });
}

export function activatePersonalizedAssetPack(packId: string, instanceId: string): Promise<PersonalizedAssetActivationResult> {
  return tauriInvoke("activate_personalized_asset_pack", {
    packId,
    instanceId
  }, () => ({
    packId,
    instanceId,
    rendererKind: "sprite",
    validationStatus: "browser_preview"
  }));
}

export function deactivatePersonalizedAssetPack(instanceId: string): Promise<void> {
  return tauriInvoke("deactivate_personalized_asset_pack", { instanceId }, () => undefined);
}

export function deletePersonalizedAssetPack(packId: string): Promise<PersonalizedAssetPack[]> {
  return tauriInvoke("delete_personalized_asset_pack", { packId }, () => []);
}

export function renamePersonalizedAssetPack(packId: string, displayName: string): Promise<PersonalizedAssetPack> {
  return tauriInvoke("rename_personalized_asset_pack", {
    packId,
    displayName
  });
}

export function runtimePersonalizedAssetPack(instanceId: string): Promise<RuntimeImportedAssetPack | null> {
  return tauriInvoke("runtime_personalized_asset_pack", { instanceId }, () => null);
}

export function runtimePersonalizedAssetData(packId: string, actionId: string): Promise<RuntimeAssetData> {
  return tauriInvoke("runtime_personalized_asset_data", {
    packId,
    actionId
  });
}

export function createPetInstance(displayName?: string): Promise<PetInstance> {
  return tauriInvoke("create_pet_instance", { displayName }, () => ({
    ...previewInstance,
    instanceId: "browser-preview-work-cat",
    displayName: displayName || "Codex Work Cat",
    isDefault: false
  }));
}

export function renamePetInstance(instanceId: string, displayName: string): Promise<PetInstance> {
  return tauriInvoke("rename_pet_instance", { instanceId, displayName }, () => ({
    ...previewInstance,
    instanceId,
    displayName
  }));
}

export function setPetInstanceProfile(instanceId: string, catProfileId: string): Promise<PetInstance> {
  return tauriInvoke("set_pet_instance_profile", { instanceId, catProfileId }, () => ({
    ...previewInstance,
    instanceId,
    catProfileId
  }));
}

export function setPetInstanceVisible(instanceId: string, visible: boolean): Promise<PetInstance> {
  return tauriInvoke("set_pet_instance_visible", { instanceId, visible }, () => ({
    ...previewInstance,
    instanceId,
    visible
  }));
}

export function resetPetInstancePosition(instanceId: string): Promise<PetInstance> {
  return tauriInvoke("reset_pet_instance_position", { instanceId }, () => ({
    ...previewInstance,
    instanceId,
    position: { x: 0, y: 0 }
  }));
}

export function detachPetInstance(instanceId: string): Promise<PetInstance[]> {
  return tauriInvoke("detach_pet_instance", { instanceId }, () => [previewInstance]);
}

export function sendTestPetReaction(instanceId: string, level: CatState = "success"): Promise<{ accepted: true; eventId: string; instanceId: string; level: CatState }> {
  return tauriInvoke("send_test_pet_reaction", {
    instanceId,
    level
  }, () => ({
    accepted: true,
    eventId: "browser-preview-event",
    instanceId,
    level
  }));
}
