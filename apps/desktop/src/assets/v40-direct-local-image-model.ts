import {
  runV40NoWebUIClaimScan,
  runV40NoWebUISecurityScan,
  sanitizeV40NoWebUIRelativeRef,
  type V40ContractScanResult,
  type V40NoWebUIActionId
} from "./v40-no-webui-workflow-contract";

export type V40DirectModelComponentId =
  | "python_wrapper"
  | "torch"
  | "diffusers"
  | "local_checkpoint"
  | "identity_conditioner"
  | "image_io";

export type V40DirectModelComponentStatus = "available" | "missing" | "blocked";
export type V40DirectRunnerRoute = "direct_local_runner_no_webui";

export type V40DirectModelComponentSummary = {
  componentId: V40DirectModelComponentId;
  status: V40DirectModelComponentStatus;
  safeLabel: string;
  reasonCodes: string[];
};

export type DirectDiffusersFrameRunner = {
  runnerId: "v40_direct_diffusers_frame_runner";
  route: V40DirectRunnerRoute;
  modelLabel: string;
  outputDirRef: string;
  components: V40DirectModelComponentSummary[];
  generationAllowed: boolean;
  redactionBoundary: {
    allowSafeRelativeRefs: true;
    forbidRawPrompts: true;
    forbidRawPayloads: true;
    forbidRawImageBytes: true;
    forbidAbsolutePaths: true;
  };
  claimScan: V40ContractScanResult;
  securityScan: V40ContractScanResult;
  reasonCodes: string[];
};

export type CandidateFrameSequence = {
  candidateId: string;
  sampleId: string;
  route: V40DirectRunnerRoute;
  actionIds: V40NoWebUIActionId[];
  outputDirRef: string;
  manifestRef: string | null;
  contactSheetRef: string | null;
  reasonCodes: string[];
};

export function createDirectDiffusersFrameRunner(input: {
  modelLabel: string;
  outputDirRef: string;
  components: V40DirectModelComponentSummary[];
}): DirectDiffusersFrameRunner {
  const reasonCodes = new Set<string>();
  const safeOutputDirRef = sanitizeV40NoWebUIRelativeRef(input.outputDirRef);
  if (!safeOutputDirRef) reasonCodes.add("unsafe_output_reference");

  const requiredComponents: V40DirectModelComponentId[] = [
    "python_wrapper",
    "torch",
    "diffusers",
    "local_checkpoint",
    "identity_conditioner",
    "image_io"
  ];
  const available = new Set(input.components.filter((item) => item.status === "available").map((item) => item.componentId));
  for (const componentId of requiredComponents) {
    if (!available.has(componentId)) reasonCodes.add(`${componentId}_missing`);
  }

  const generationAllowed = Boolean(safeOutputDirRef)
    && requiredComponents.every((componentId) => available.has(componentId));
  if (generationAllowed) {
    reasonCodes.add("direct_diffusers_frame_runner_ready");
  } else {
    reasonCodes.add("direct_diffusers_frame_runner_blocked");
  }

  const runner: Omit<DirectDiffusersFrameRunner, "claimScan" | "securityScan"> = {
    runnerId: "v40_direct_diffusers_frame_runner",
    route: "direct_local_runner_no_webui",
    modelLabel: sanitizeLabel(input.modelLabel),
    outputDirRef: safeOutputDirRef ?? "",
    components: input.components.map((item) => ({
      ...item,
      safeLabel: sanitizeLabel(item.safeLabel),
      reasonCodes: [...new Set(item.reasonCodes)]
    })),
    generationAllowed,
    redactionBoundary: {
      allowSafeRelativeRefs: true,
      forbidRawPrompts: true,
      forbidRawPayloads: true,
      forbidRawImageBytes: true,
      forbidAbsolutePaths: true
    },
    reasonCodes: [...reasonCodes].sort()
  };

  return {
    ...runner,
    claimScan: runV40NoWebUIClaimScan(runner),
    securityScan: runV40NoWebUISecurityScan(runner)
  };
}

function sanitizeLabel(value: string): string {
  return value.trim().replace(/[^A-Za-z0-9._:+-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96) || "local-component";
}
