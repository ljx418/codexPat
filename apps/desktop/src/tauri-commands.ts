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

export function getSettings(): Promise<AppSettings> {
  return invoke<AppSettings>("get_settings");
}

export function setMuted(muted: boolean): Promise<AppSettings> {
  return invoke<AppSettings>("set_muted", { muted });
}

export function getPetPosition(): Promise<WindowPosition> {
  return invoke<WindowPosition>("get_pet_position");
}

export function setCurrentPetPosition(position: WindowPosition): Promise<WindowPosition> {
  return invoke<WindowPosition>("set_current_pet_position", { position });
}

export function getApiDebugState(): Promise<BridgeDiagnostics> {
  return invoke<BridgeDiagnostics>("get_api_debug_state");
}

export function getCurrentPetInstance(): Promise<PetInstance> {
  return invoke<PetInstance>("get_current_pet_instance");
}

export function listPetInstances(): Promise<PetInstance[]> {
  return invoke<PetInstance[]>("list_pet_instances");
}

export function listCatProfiles(): Promise<CatProfile[]> {
  return invoke<CatProfile[]>("list_cat_profiles");
}

export function listPersonalizedAssetPacks(): Promise<PersonalizedAssetPack[]> {
  return invoke<PersonalizedAssetPack[]>("list_personalized_asset_packs");
}

export function assembleAnimatedSpritePack(
  sourceFolderPath: string,
  displayName: string,
  fps: number,
  activateInstanceId?: string
): Promise<AnimatedSpriteAssemblyResult> {
  return invoke<AnimatedSpriteAssemblyResult>("assemble_animated_sprite_pack", {
    sourceFolderPath,
    displayName,
    fps,
    activateInstanceId: activateInstanceId || null
  });
}

export function importPersonalizedAssetPack(manifestPath: string, displayName?: string): Promise<PersonalizedAssetImportResult> {
  return invoke<PersonalizedAssetImportResult>("import_personalized_asset_pack", {
    manifestPath,
    displayName: displayName || null
  });
}

export function activatePersonalizedAssetPack(packId: string, instanceId: string): Promise<PersonalizedAssetActivationResult> {
  return invoke<PersonalizedAssetActivationResult>("activate_personalized_asset_pack", {
    packId,
    instanceId
  });
}

export function deactivatePersonalizedAssetPack(instanceId: string): Promise<void> {
  return invoke<void>("deactivate_personalized_asset_pack", {
    instanceId
  });
}

export function deletePersonalizedAssetPack(packId: string): Promise<PersonalizedAssetPack[]> {
  return invoke<PersonalizedAssetPack[]>("delete_personalized_asset_pack", {
    packId
  });
}

export function renamePersonalizedAssetPack(packId: string, displayName: string): Promise<PersonalizedAssetPack> {
  return invoke<PersonalizedAssetPack>("rename_personalized_asset_pack", {
    packId,
    displayName
  });
}

export function runtimePersonalizedAssetPack(instanceId: string): Promise<RuntimeImportedAssetPack | null> {
  return invoke<RuntimeImportedAssetPack | null>("runtime_personalized_asset_pack", {
    instanceId
  });
}

export function runtimePersonalizedAssetData(packId: string, actionId: string): Promise<RuntimeAssetData> {
  return invoke<RuntimeAssetData>("runtime_personalized_asset_data", {
    packId,
    actionId
  });
}

export function createPetInstance(displayName?: string): Promise<PetInstance> {
  return invoke<PetInstance>("create_pet_instance", { displayName });
}

export function renamePetInstance(instanceId: string, displayName: string): Promise<PetInstance> {
  return invoke<PetInstance>("rename_pet_instance", { instanceId, displayName });
}

export function setPetInstanceProfile(instanceId: string, catProfileId: string): Promise<PetInstance> {
  return invoke<PetInstance>("set_pet_instance_profile", { instanceId, catProfileId });
}

export function setPetInstanceVisible(instanceId: string, visible: boolean): Promise<PetInstance> {
  return invoke<PetInstance>("set_pet_instance_visible", { instanceId, visible });
}

export function resetPetInstancePosition(instanceId: string): Promise<PetInstance> {
  return invoke<PetInstance>("reset_pet_instance_position", { instanceId });
}

export function detachPetInstance(instanceId: string): Promise<PetInstance[]> {
  return invoke<PetInstance[]>("detach_pet_instance", { instanceId });
}

export function sendTestPetReaction(instanceId: string, level: CatState = "success"): Promise<{ accepted: true; eventId: string; instanceId: string; level: CatState }> {
  return invoke<{ accepted: true; eventId: string; instanceId: string; level: CatState }>("send_test_pet_reaction", {
    instanceId,
    level
  });
}
