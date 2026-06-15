import type {
  Photo2DCoreActionId,
  Photo2DPromptFrameIntent,
  Photo2DTraitPromptPackResult
} from "./photo-to-2d-trait-prompt-pack";

const CORE_ACTIONS: Photo2DCoreActionId[] = [
  "idle",
  "thinking",
  "running",
  "success",
  "warning",
  "error",
  "need_input",
  "sleeping"
];

const FORBIDDEN_PATTERN = /Authorization|api-token\.json|raw payload|raw photo|raw provider response|source filename|source path|photo path|workspace path|config path|provider payload|credential|prompt text|raw prompt|promptText|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\/|sk-[A-Za-z0-9_-]{8,}/i;

export type Photo2DGenerationBranch = "import-ready" | "provider";

export type Photo2DProviderOrImportReasonCode =
  | "import_ready_branch_selected"
  | "provider_terms_required"
  | "consent_required"
  | "provider_credential_missing"
  | "provider_output_missing"
  | "provider_output_rejected"
  | "provider_generation_failed"
  | "trait_prompt_pack_invalid"
  | "security_scan_failed";

export type Photo2DImportReadyAction = {
  actionId: Photo2DCoreActionId;
  promptDigest: string;
  expectedFrameCount: number;
  frameIntent: Photo2DPromptFrameIntent;
  fileNamingRule: string;
};

export type Photo2DProviderOrImportResult =
  | {
    status: "accepted";
    branch: "import-ready";
    reasonCode: "import_ready_branch_selected";
    traitId: string;
    rendererKind: "sprite";
    actionPlan: Photo2DImportReadyAction[];
    importChecklist: string[];
    licenseChecklist: string[];
    validationChecklist: string[];
    providerBranch: {
      attempted: false;
      reasonCode: "provider_output_missing";
    };
    safetyBoundary: Photo2DProviderOrImportSafetyBoundary;
  }
  | {
    status: "blocked" | "failed";
    branch: Photo2DGenerationBranch;
    reasonCode: Exclude<Photo2DProviderOrImportReasonCode, "import_ready_branch_selected">;
    providerBranch: {
      attempted: boolean;
      reasonCode: Exclude<Photo2DProviderOrImportReasonCode, "import_ready_branch_selected" | "trait_prompt_pack_invalid" | "security_scan_failed">;
    };
    safetyBoundary: Photo2DProviderOrImportSafetyBoundary;
  };

export type Photo2DProviderOrImportSafetyBoundary = {
  uploadsByDefault: false;
  callsProviderApi: false;
  storesProviderResponse: false;
  storesRawPhoto: false;
  requiresLocalImportValidation: true;
  provesProviderIntegration: false;
  provesAutomaticPhotoTo2D: false;
};

export function createPhoto2DProviderOrImportBranch(options: {
  promptPackResult: Photo2DTraitPromptPackResult;
  branch?: Photo2DGenerationBranch;
  providerConsent?: boolean;
  providerTermsReviewed?: boolean;
  providerCredentialAvailable?: boolean;
  providerOutputAvailable?: boolean;
}): Photo2DProviderOrImportResult {
  const branch = options.branch ?? "import-ready";
  const promptPackResult = options.promptPackResult;
  if (promptPackResult.status !== "accepted" || hasForbiddenContent(promptPackResult)) {
    return blocked(branch, "trait_prompt_pack_invalid", false, "provider_output_missing");
  }

  if (branch === "provider") {
    if (!options.providerConsent) return blocked("provider", "consent_required", false, "consent_required");
    if (!options.providerTermsReviewed) return blocked("provider", "provider_terms_required", false, "provider_terms_required");
    if (!options.providerCredentialAvailable) return blocked("provider", "provider_credential_missing", false, "provider_credential_missing");
    if (!options.providerOutputAvailable) return blocked("provider", "provider_output_missing", true, "provider_output_missing");
    return blocked("provider", "provider_output_rejected", true, "provider_output_rejected");
  }

  const actionPlan = CORE_ACTIONS.map((actionId) => {
    const prompt = promptPackResult.promptPack.actionPrompts[actionId];
    return {
      actionId,
      promptDigest: prompt.promptDigest,
      expectedFrameCount: prompt.expectedFrameCount,
      frameIntent: prompt.frameIntent,
      fileNamingRule: `${actionId}/frame-001.png ... frame-${String(prompt.expectedFrameCount).padStart(3, "0")}.png`
    };
  });
  const result: Photo2DProviderOrImportResult = {
    status: "accepted",
    branch: "import-ready",
    reasonCode: "import_ready_branch_selected",
    traitId: promptPackResult.approvedTraits.traitId,
    rendererKind: "sprite",
    actionPlan,
    importChecklist: [
      "Use a user-selected external image tool or manual drawing process.",
      "Generate one local PNG frame sequence folder per accepted core action.",
      "Keep all frames visually consistent with the approved cat traits.",
      "Do not paste local paths, secret values, terminal logs, or private photo metadata into any external tool.",
      "Bring generated frames back through V15.12 local continuity assembly and validation."
    ],
    licenseChecklist: [
      "Record the external tool/provider name manually if one is used.",
      "Record attribution, commercial-use, redistribution, and retention terms before import.",
      "Do not store secret values or provider response details in the asset pack."
    ],
    validationChecklist: [
      "All 8 core action folders are present.",
      "Loop actions have at least 6 frames and transient/priority actions have at least 3 frames.",
      "V15.12 continuity assembly must verify first/final closure and adjacent-frame continuity.",
      "Desktop Manager preview must be visible before target-only apply.",
      "Default and unrelated pets must remain unchanged."
    ],
    providerBranch: {
      attempted: false,
      reasonCode: "provider_output_missing"
    },
    safetyBoundary: safetyBoundary()
  };

  if (photo2DProviderOrImportHasForbiddenContent(result)) {
    return blocked("import-ready", "security_scan_failed", false, "provider_output_missing");
  }

  return result;
}

export function buildPhoto2DProviderOrImportEvidenceSnapshot(result: Photo2DProviderOrImportResult) {
  if (result.status !== "accepted") {
    return {
      status: result.status,
      branch: result.branch,
      reasonCode: result.reasonCode,
      providerBranch: result.providerBranch,
      safetyBoundary: result.safetyBoundary
    };
  }

  return {
    status: result.status,
    branch: result.branch,
    reasonCode: result.reasonCode,
    traitId: result.traitId,
    rendererKind: result.rendererKind,
    actionCoverage: result.actionPlan.map((action) => ({
      actionId: action.actionId,
      promptDigest: action.promptDigest,
      expectedFrameCount: action.expectedFrameCount,
      frameIntent: action.frameIntent,
      fileNamingRule: action.fileNamingRule
    })),
    checklistCounts: {
      import: result.importChecklist.length,
      license: result.licenseChecklist.length,
      validation: result.validationChecklist.length
    },
    providerBranch: result.providerBranch,
    safetyBoundary: result.safetyBoundary
  };
}

export function photo2DProviderOrImportHasForbiddenContent(value: unknown) {
  const serialized = JSON.stringify(value)
    .replace(/promptDigest|providerBranch|provider_output_missing|provider_output_rejected|provider_generation_failed|provider_credential_missing|provider_terms_required/g, "")
    .replace(/storesProviderResponse|callsProviderApi|provesProviderIntegration|provesAutomaticPhotoTo2D/g, "");
  return FORBIDDEN_PATTERN.test(serialized);
}

function blocked(
  branch: Photo2DGenerationBranch,
  reasonCode: Exclude<Photo2DProviderOrImportReasonCode, "import_ready_branch_selected">,
  attempted: boolean,
  providerReasonCode: Exclude<Photo2DProviderOrImportReasonCode, "import_ready_branch_selected" | "trait_prompt_pack_invalid" | "security_scan_failed">
): Photo2DProviderOrImportResult {
  return {
    status: reasonCode === "provider_output_rejected" || reasonCode === "provider_generation_failed" || reasonCode === "security_scan_failed" ? "failed" : "blocked",
    branch,
    reasonCode,
    providerBranch: {
      attempted,
      reasonCode: providerReasonCode
    },
    safetyBoundary: safetyBoundary()
  };
}

function safetyBoundary(): Photo2DProviderOrImportSafetyBoundary {
  return {
    uploadsByDefault: false,
    callsProviderApi: false,
    storesProviderResponse: false,
    storesRawPhoto: false,
    requiresLocalImportValidation: true,
    provesProviderIntegration: false,
    provesAutomaticPhotoTo2D: false
  };
}

function hasForbiddenContent(value: unknown) {
  return photo2DProviderOrImportHasForbiddenContent(value);
}
