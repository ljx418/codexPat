import { CORE_ACTION_IDS, type SafeActionId } from "./asset-manifest";
import { runConsentDryRun, type ConsentDryRunResult } from "./provider-consent-dryrun";

export type ConsentDisclosureCategory = "cost" | "privacy" | "retention" | "license";

export type ConsentDisclosure = {
  category: ConsentDisclosureCategory;
  label: string;
  text: string;
  visible: boolean;
};

export type GuidedFlowStep =
  | "idle"
  | "select_photo_or_traits"
  | "review_traits"
  | "choose_provider_or_import"
  | "show_consent"
  | "waiting_for_consent"
  | "running_generation"
  | "preview_output"
  | "activating"
  | "complete"
  | "error";

export type GuidedFlowReasonCode =
  | "consent_required"
  | "consent_given"
  | "generation_running"
  | "generation_failed"
  | "scan_failed"
  | "normalization_failed"
  | "activation_failed"
  | "complete"
  | "provider_not_selected"
  | "provider_credential_missing"
  | "provider_ready_redacted";

export type GuidedFlowState = {
  step: GuidedFlowStep;
  reasonCode: GuidedFlowReasonCode;
  consentGiven: boolean;
  consentTimestamp: string | null;
  uploadedAssetPath: string | null;
  activatedPackId: string | null;
  errorMessage: string | null;
};

export const CONSENT_DISCLOSURES: ConsentDisclosure[] = [
  {
    category: "cost",
    label: "Cost",
    text: "Tripo3D image-to-3D generation costs 30 credits per request. Your account balance will be charged accordingly.",
    visible: true
  },
  {
    category: "privacy",
    label: "Privacy",
    text: "Your photo will be sent to Tripo3D API (api.tripo3d.ai) for 3D model generation. The photo is processed remotely and may be retained by Tripo3D per their data retention policy.",
    visible: true
  },
  {
    category: "retention",
    label: "Retention",
    text: "Tripo3D may retain the uploaded photo and generated 3D model according to their service terms. Deleted requests are removed from active queue but retention policy applies.",
    visible: true
  },
  {
    category: "license",
    label: "License",
    text: "Generated 3D models are subject to Tripo3D's license terms. You are responsible for ensuring your use complies with applicable terms of service.",
    visible: true
  }
];

export function createInitialGuidedFlowState(): GuidedFlowState {
  return {
    step: "idle",
    reasonCode: "consent_required",
    consentGiven: false,
    consentTimestamp: null,
    uploadedAssetPath: null,
    activatedPackId: null,
    errorMessage: null
  };
}

export function canProceedToGeneration(state: GuidedFlowState): boolean {
  return state.consentGiven && state.step === "show_consent";
}

export function isProviderConfigured(): boolean {
  const diag = runConsentDryRun();
  return diag.reasonCode === "provider_ready_redacted" ||
         diag.reasonCode === "provider_not_selected";
}

export function getConsentDryRunResult(): ConsentDryRunResult {
  return runConsentDryRun();
}

export function allDisclosuresVisible(disclosures: ConsentDisclosure[]): boolean {
  return disclosures.filter(d => d.visible).length === CONSENT_DISCLOSURES.length;
}

export function buildGuidedFlowStateFromConsent(
  currentState: GuidedFlowState,
  consentResult: ConsentDryRunResult
): GuidedFlowState {
  const consentGiven = consentResult.ok && consentResult.consentFlowComplete;

  return {
    ...currentState,
    consentGiven,
    consentTimestamp: consentGiven ? new Date().toISOString() : currentState.consentTimestamp,
    reasonCode: consentGiven ? "consent_given" : "consent_required",
    step: consentGiven ? "waiting_for_consent" : currentState.step
  };
}

export function sanitizeGuidedFlowStateForEvidence(state: GuidedFlowState): GuidedFlowState {
  return {
    ...state,
    consentTimestamp: state.consentTimestamp ? "[CONSENT_TIMESTAMP]" : null,
    uploadedAssetPath: state.uploadedAssetPath
      ? state.uploadedAssetPath.replace(/\/Users\/[^\/]+/, "[REDACTED_PATH]")
                               .replace(/\/tmp\/[^\/]+/, "[REDACTED_TMP]")
      : null,
    activatedPackId: state.activatedPackId
      ? state.activatedPackId.replace(/[^A-Za-z0-9._-]/g, "_")
      : null,
    errorMessage: state.errorMessage
      ? state.errorMessage.replace(/\/Users\/[^\/]+/, "[REDACTED_PATH]")
                         .replace(/\/tmp\/[^\/]+/, "[REDACTED_TMP]")
                         .replace(/sk-[A-Za-z0-9_-]{4,}/g, "sk-...xxxx")
      : null
  };
}

export function validateGuidedFlowState(state: unknown): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!state || typeof state !== "object") {
    return { ok: false, errors: ["state must be an object"] };
  }

  const s = state as Partial<GuidedFlowState>;

  if (typeof s.step !== "string") {
    errors.push("step must be a string");
  }

  if (s.consentGiven !== undefined && typeof s.consentGiven !== "boolean") {
    errors.push("consentGiven must be boolean");
  }

  if (s.uploadedAssetPath !== undefined &&
      s.uploadedAssetPath !== null &&
      typeof s.uploadedAssetPath !== "string") {
    errors.push("uploadedAssetPath must be string or null");
  }

  if (s.activatedPackId !== undefined &&
      s.activatedPackId !== null &&
      typeof s.activatedPackId !== "string") {
    errors.push("activatedPackId must be string or null");
  }

  return { ok: errors.length === 0, errors };
}