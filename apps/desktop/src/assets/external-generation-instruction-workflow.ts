import { generateLocalTraitPromptPack, localTraitPromptPackHasForbiddenContent, type LocalTraitPromptPack } from "./local-trait-prompt-pack";
import type { GuidedAssetRendererTarget } from "./guided-prompt-workflow";

const FORBIDDEN_PATTERN = /Authorization|api-token\.json|raw payload|raw photo|workspace path|config path|provider payload|credential|EXIF|GPS|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\/|sk-[A-Za-z0-9_-]{8,}/i;

export type ExternalGenerationInstructionWorkflow = {
  status: "accepted" | "rejected";
  reasonCode: "external_instruction_workflow_ok" | "trait_prompt_pack_invalid" | "instruction_redaction_failed";
  rendererTarget: GuidedAssetRendererTarget;
  actionCoverage: string[];
  instructionSteps: string[];
  fileNamingRules: string[];
  manifestChecklist: string[];
  licenseChecklist: string[];
  validationChecklist: string[];
  copyText: string;
  safetyBoundary: {
    uploadsByDefault: false;
    callsProviderApi: false;
    storesProviderResponse: false;
    requiresLocalImportValidation: true;
    provesProviderIntegration: false;
    provesGeneratedAssetReady: false;
  };
};

export function generateExternalGenerationInstructionWorkflow(options: {
  catName?: string;
  coat?: string;
  markings?: string;
  eyes?: string;
  tail?: string;
  personality?: string;
  rendererTarget?: GuidedAssetRendererTarget;
  photoReferenceMode?: "not_provided" | "local_reference_only";
}): ExternalGenerationInstructionWorkflow {
  const promptPack = generateLocalTraitPromptPack(options);
  return generateExternalGenerationInstructionWorkflowFromPromptPack(promptPack);
}

export function generateExternalGenerationInstructionWorkflowFromPromptPack(
  promptPack: LocalTraitPromptPack
): ExternalGenerationInstructionWorkflow {
  const rendererTarget = promptPack.rendererTarget;
  if (promptPack.status !== "accepted" || !promptPack.promptPack || localTraitPromptPackHasForbiddenContent(promptPack)) {
    return rejected("trait_prompt_pack_invalid", rendererTarget);
  }

  const actionCoverage = Object.keys(promptPack.promptPack.actionPrompts).sort();
  const extension = rendererTarget === "sprite" ? "png" : "glb";
  const fileNamingRules = actionCoverage.map((action) => `${action}.${extension}`);
  const instructionSteps = [
    "Use the local prompt pack as instructions in a user-selected external generation tool.",
    "Do not paste local file paths, app tokens, terminal logs, provider secrets, or private metadata.",
    "Generate one output for every accepted core action ID.",
    rendererTarget === "sprite"
      ? "Export transparent PNG assets with consistent scale, silhouette, and identity."
      : "Export local single-file GLB assets with no external buffers, textures, image references, or unsupported required extensions.",
    "Create or update manifest.json with the exact local relative file names.",
    "Import the manifest through Desktop Manager and let local validation decide whether the pack can be activated."
  ];
  const manifestChecklist = [
    "schemaVersion is present.",
    `rendererKind is ${rendererTarget}.`,
    "all core actions are mapped.",
    "all file names are local relative names only.",
    "no remote URL, absolute path, traversal, executable, script, or untrusted event fields are present."
  ];
  const licenseChecklist = [
    "record provider/tool name manually if the user used one.",
    "record attribution required by the user-selected tool.",
    "record commercial-use and redistribution terms before import.",
    "do not store provider secrets or raw provider responses in the asset pack."
  ];
  const validationChecklist = [
    "run local import validation.",
    "for GLTF/GLB, run deep scan before activation.",
    "preview every core action.",
    "activate only on a target PetInstance after import passes.",
    "confirm default and unrelated pets are unchanged."
  ];
  const copyText = [
    "Agent Desktop Pet external generation instructions",
    `Renderer target: ${rendererTarget}`,
    `Cat identity: ${promptPack.traitMetadata.catName}`,
    `Approved traits: ${promptPack.traitMetadata.approvedTraitSummary}`,
    "Required action files:",
    ...fileNamingRules.map((rule) => `- ${rule}`),
    "Validation required: generated outputs are not ready until local import validation passes."
  ].join("\n");
  const workflow: ExternalGenerationInstructionWorkflow = {
    status: "accepted",
    reasonCode: "external_instruction_workflow_ok",
    rendererTarget,
    actionCoverage,
    instructionSteps,
    fileNamingRules,
    manifestChecklist,
    licenseChecklist,
    validationChecklist,
    copyText,
    safetyBoundary: safetyBoundary()
  };
  if (externalGenerationInstructionHasForbiddenContent(workflow)) {
    return rejected("instruction_redaction_failed", rendererTarget);
  }
  return workflow;
}

export function externalGenerationInstructionHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function rejected(
  reasonCode: ExternalGenerationInstructionWorkflow["reasonCode"],
  rendererTarget: GuidedAssetRendererTarget
): ExternalGenerationInstructionWorkflow {
  return {
    status: "rejected",
    reasonCode,
    rendererTarget,
    actionCoverage: [],
    instructionSteps: [],
    fileNamingRules: [],
    manifestChecklist: [],
    licenseChecklist: [],
    validationChecklist: [],
    copyText: "",
    safetyBoundary: safetyBoundary()
  };
}

function safetyBoundary(): ExternalGenerationInstructionWorkflow["safetyBoundary"] {
  return {
    uploadsByDefault: false,
    callsProviderApi: false,
    storesProviderResponse: false,
    requiresLocalImportValidation: true,
    provesProviderIntegration: false,
    provesGeneratedAssetReady: false
  };
}
