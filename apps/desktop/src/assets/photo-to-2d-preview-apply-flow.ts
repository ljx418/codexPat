import { CORE_ACTION_IDS, type CoreActionId, type RendererKind } from "./asset-manifest";
import {
  buildPhoto2DContinuityAssemblyEvidenceSnapshot,
  photo2DContinuityAssemblyHasForbiddenContent,
  type Photo2DContinuityAssemblyResult
} from "./photo-to-2d-continuity-assembler";

const FORBIDDEN_PATTERN = /Authorization|api-token\.json|raw payload|raw photo|raw provider response|source filename|source path|photo path|workspace path|config path|provider payload|credential|prompt text|raw prompt|promptText|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\/|sk-[A-Za-z0-9_-]{8,}|\.\./i;

export type Photo2DPreviewApplyReasonCode =
  | "preview_apply_ready"
  | "generated_pack_not_accepted"
  | "target_instance_required"
  | "target_instance_not_found"
  | "preview_missing_action"
  | "preview_security_scan_failed"
  | "apply_security_scan_failed"
  | "target_pack_applied"
  | "previous_pack_preserved";

export type Photo2DPreviewApplyInstance = {
  instanceId: string;
  displayName: string;
  activePackId: string;
  isDefault?: boolean;
};

export type Photo2DGeneratedPackPreviewAction = {
  actionId: CoreActionId;
  coverageState: "animated";
  rendererKind: Extract<RendererKind, "sprite">;
  frameCount: number;
  firstFinalClosed: boolean;
  maxAdjacentDelta: number;
  fallbackActionId: CoreActionId;
  reasonCode: "generated_action_preview_ready";
};

export type Photo2DGeneratedPackPreviewFlow =
  | {
    status: "ready";
    reasonCode: "preview_apply_ready";
    generatedPackId: string;
    rendererKind: Extract<RendererKind, "sprite">;
    targetInstanceId: string;
    previewActions: Photo2DGeneratedPackPreviewAction[];
    previewSafety: {
      acceptedPetEvents: 0;
      callsNotify: false;
      writesCatStateMachine: false;
      mutatesLivePetInstance: false;
    };
    safeRendererInputFields: string[];
    beforeAssignments: Record<string, string>;
  }
  | {
    status: "blocked";
    reasonCode: Exclude<Photo2DPreviewApplyReasonCode, "preview_apply_ready" | "target_pack_applied">;
    generatedPackId: string;
    targetInstanceId?: string;
    previewActions: [];
    previousPackPreserved: true;
  };

export type Photo2DGeneratedPackApplyResult =
  | {
    status: "applied";
    reasonCode: "target_pack_applied";
    generatedPackId: string;
    targetInstanceId: string;
    afterAssignments: Record<string, string>;
    targetChanged: true;
    defaultPetUnchanged: boolean;
    unrelatedPetsUnchanged: boolean;
    acceptedPetEvents: 0;
    callsNotify: false;
    writesCatStateMachine: false;
  }
  | {
    status: "blocked";
    reasonCode: Exclude<Photo2DPreviewApplyReasonCode, "preview_apply_ready" | "target_pack_applied">;
    generatedPackId: string;
    targetInstanceId?: string;
    afterAssignments: Record<string, string>;
    previousPackPreserved: true;
  };

export function createPhoto2DGeneratedPackPreviewFlow(options: {
  assembly: Photo2DContinuityAssemblyResult;
  targetInstanceId?: string;
  instances: Photo2DPreviewApplyInstance[];
}): Photo2DGeneratedPackPreviewFlow {
  const generatedPackId = safeId(options.assembly.generatedPackId) || "photo-2d-generated-pack";
  const beforeAssignments = assignmentMap(options.instances);

  if (options.assembly.status !== "accepted" || !options.assembly.manifest) {
    return blocked(generatedPackId, "generated_pack_not_accepted", options.targetInstanceId);
  }
  if (!options.targetInstanceId || !isSafeId(options.targetInstanceId)) {
    return blocked(generatedPackId, "target_instance_required", options.targetInstanceId);
  }
  if (!options.instances.some((instance) => instance.instanceId === options.targetInstanceId)) {
    return blocked(generatedPackId, "target_instance_not_found", options.targetInstanceId);
  }

  const previewActions: Photo2DGeneratedPackPreviewAction[] = [];
  for (const actionId of CORE_ACTION_IDS) {
    const frameCount = options.assembly.frameCountTable[actionId] ?? 0;
    const continuity = options.assembly.continuityTable[actionId];
    if (frameCount <= 0 || !continuity?.firstFinalClosed) {
      return blocked(generatedPackId, "preview_missing_action", options.targetInstanceId);
    }
    previewActions.push({
      actionId,
      coverageState: "animated" as const,
      rendererKind: "sprite" as const,
      frameCount,
      firstFinalClosed: continuity.firstFinalClosed,
      maxAdjacentDelta: continuity.maxAdjacentDelta,
      fallbackActionId: "idle" as const,
      reasonCode: "generated_action_preview_ready" as const
    });
  }

  const flow = {
    status: "ready" as const,
    reasonCode: "preview_apply_ready" as const,
    generatedPackId,
    rendererKind: "sprite" as const,
    targetInstanceId: options.targetInstanceId,
    previewActions,
    previewSafety: {
      acceptedPetEvents: 0 as const,
      callsNotify: false as const,
      writesCatStateMachine: false as const,
      mutatesLivePetInstance: false as const
    },
    safeRendererInputFields: [
      "safeActionId",
      "rendererKind",
      "safePackId",
      "playbackIntent",
      "scale",
      "visibility"
    ],
    beforeAssignments
  };

  if (photo2DPreviewApplyHasForbiddenContent(flow) || photo2DContinuityAssemblyHasForbiddenContent(buildPhoto2DContinuityAssemblyEvidenceSnapshot(options.assembly))) {
    return blocked(generatedPackId, "preview_security_scan_failed", options.targetInstanceId);
  }
  return flow;
}

export function applyPhoto2DGeneratedPackToTarget(flow: Photo2DGeneratedPackPreviewFlow): Photo2DGeneratedPackApplyResult {
  const afterAssignments = flow.status === "ready" ? { ...flow.beforeAssignments } : {};
  if (flow.status !== "ready") {
    return {
      status: "blocked",
      reasonCode: flow.reasonCode,
      generatedPackId: flow.generatedPackId,
      targetInstanceId: flow.targetInstanceId,
      afterAssignments,
      previousPackPreserved: true
    };
  }

  afterAssignments[flow.targetInstanceId] = flow.generatedPackId;
  const result = {
    status: "applied" as const,
    reasonCode: "target_pack_applied" as const,
    generatedPackId: flow.generatedPackId,
    targetInstanceId: flow.targetInstanceId,
    afterAssignments,
    targetChanged: true as const,
    defaultPetUnchanged: targetIsolationPassed(flow.beforeAssignments, afterAssignments, flow.targetInstanceId, "default"),
    unrelatedPetsUnchanged: unrelatedIsolationPassed(flow.beforeAssignments, afterAssignments, flow.targetInstanceId),
    acceptedPetEvents: 0 as const,
    callsNotify: false as const,
    writesCatStateMachine: false as const
  };

  if (photo2DPreviewApplyHasForbiddenContent(result)) {
    return {
      status: "blocked",
      reasonCode: "apply_security_scan_failed",
      generatedPackId: flow.generatedPackId,
      targetInstanceId: flow.targetInstanceId,
      afterAssignments: flow.beforeAssignments,
      previousPackPreserved: true
    };
  }
  return result;
}

export function buildPhoto2DPreviewApplyEvidenceSnapshot(
  flow: Photo2DGeneratedPackPreviewFlow,
  applyResult?: Photo2DGeneratedPackApplyResult
) {
  return {
    previewStatus: flow.status,
    previewReasonCode: flow.reasonCode,
    generatedPackId: flow.generatedPackId,
    targetInstanceId: flow.targetInstanceId,
    previewActionCount: flow.previewActions.length,
    previewActions: flow.previewActions.map((action) => ({
      actionId: action.actionId,
      coverageState: action.coverageState,
      rendererKind: action.rendererKind,
      frameCount: action.frameCount,
      firstFinalClosed: action.firstFinalClosed,
      maxAdjacentDelta: action.maxAdjacentDelta,
      fallbackActionId: action.fallbackActionId,
      reasonCode: action.reasonCode
    })),
    previewSafety: flow.status === "ready" ? flow.previewSafety : {
      acceptedPetEvents: 0,
      callsNotify: false,
      writesCatStateMachine: false,
      mutatesLivePetInstance: false
    },
    safeRendererInputFields: flow.status === "ready" ? flow.safeRendererInputFields : [],
    applyStatus: applyResult?.status ?? "not-run",
    applyReasonCode: applyResult?.reasonCode ?? "previous_pack_preserved",
    targetChanged: applyResult?.status === "applied" ? applyResult.targetChanged : false,
    defaultPetUnchanged: applyResult?.status === "applied" ? applyResult.defaultPetUnchanged : true,
    unrelatedPetsUnchanged: applyResult?.status === "applied" ? applyResult.unrelatedPetsUnchanged : true,
    acceptedPetEvents: applyResult?.status === "applied" ? applyResult.acceptedPetEvents : 0,
    callsNotify: applyResult?.status === "applied" ? applyResult.callsNotify : false,
    writesCatStateMachine: applyResult?.status === "applied" ? applyResult.writesCatStateMachine : false
  };
}

export function photo2DPreviewApplyHasForbiddenContent(value: unknown) {
  const serialized = JSON.stringify(value)
    .replace(/safeRendererInputFields|previewSafety|acceptedPetEvents|callsNotify|writesCatStateMachine/g, "");
  return FORBIDDEN_PATTERN.test(serialized);
}

function assignmentMap(instances: Photo2DPreviewApplyInstance[]) {
  return Object.fromEntries(instances
    .filter((instance) => isSafeId(instance.instanceId))
    .map((instance) => [instance.instanceId, isSafeId(instance.activePackId) ? instance.activePackId : "unknown-pack"]));
}

function targetIsolationPassed(before: Record<string, string>, after: Record<string, string>, targetInstanceId: string, instanceId: string) {
  if (targetInstanceId === instanceId) {
    return true;
  }
  return before[instanceId] === after[instanceId];
}

function unrelatedIsolationPassed(before: Record<string, string>, after: Record<string, string>, targetInstanceId: string) {
  return Object.entries(before)
    .filter(([instanceId]) => instanceId !== targetInstanceId)
    .every(([instanceId, packId]) => after[instanceId] === packId);
}

function blocked(
  generatedPackId: string,
  reasonCode: Exclude<Photo2DPreviewApplyReasonCode, "preview_apply_ready" | "target_pack_applied">,
  targetInstanceId?: string
): Photo2DGeneratedPackPreviewFlow {
  return {
    status: "blocked",
    reasonCode,
    generatedPackId,
    targetInstanceId,
    previewActions: [],
    previousPackPreserved: true
  };
}

function safeId(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return isSafeId(normalized) ? normalized : "";
}

function isSafeId(value: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(value);
}
