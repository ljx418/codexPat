import type { PetInstance } from "./tauri-commands";

export type PetInstanceLimits = {
  totalCount: number;
  softLimit: number;
  hardLimit: number;
  overSoftLimit: boolean;
  atHardLimit: boolean;
};

export type PetInstanceListResult = {
  instances: PetInstance[];
  limits: PetInstanceLimits;
};

export function defaultPetInstance(): PetInstance {
  return {
    instanceId: "default",
    sourceKind: "system",
    sourceId: "default",
    displayName: "Agent Desktop Pet",
    windowLabel: "main",
    workspaceHash: null,
    workspaceLabel: null,
    position: { x: 0, y: 0 },
    visible: true,
    currentState: "idle",
    catProfileId: "default-cat",
    createdAt: "legacy",
    updatedAt: "legacy",
    lastEventAt: null,
    isDefault: true
  };
}

export function derivePetInstanceLimits(instances: PetInstance[]): PetInstanceLimits {
  const totalCount = instances.length;
  const softLimit = 6;
  const hardLimit = 12;
  return {
    totalCount,
    softLimit,
    hardLimit,
    overSoftLimit: totalCount >= softLimit,
    atHardLimit: totalCount >= hardLimit
  };
}
