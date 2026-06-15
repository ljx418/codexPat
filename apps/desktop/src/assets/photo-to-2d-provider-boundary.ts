import { createHash } from "node:crypto";

const SECRET_PATTERN = /(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|Authorization\s*[:=]|api[_-]?key\s*[:=]\s*[^\s"']+|cookie\s*[:=]\s*[^\s"']+)/i;
const PATH_PATTERN = /(\/Users\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/]|workspace path|config path|api-token\.json)/i;
const RAW_PATTERN = /(raw provider response|raw payload|raw prompt|raw photo|prompt text|provider payload|hook payload|MCP payload|HTTP payload)/i;
const UNSAFE_TEXT_PATTERN = new RegExp(`${SECRET_PATTERN.source}|${PATH_PATTERN.source}|${RAW_PATTERN.source}`, "i");

export type V16Photo2DProviderKind = "host_image_tool" | "minimax";

export type V16Photo2DProviderReasonCode =
  | "provider_boundary_ready"
  | "provider_credential_missing"
  | "provider_consent_required"
  | "provider_terms_required"
  | "provider_cost_ack_required"
  | "provider_retention_ack_required"
  | "provider_license_ack_required"
  | "provider_request_rejected"
  | "provider_unavailable";

export type V16Photo2DProviderBoundaryReview =
  | {
      status: "accepted";
      reasonCode: "provider_boundary_ready";
      providerKind: V16Photo2DProviderKind;
      providerName: string;
      credentialRequired: boolean;
      credentialState: "not_required" | "configured_redacted";
      consent: true;
      costDisclosureAccepted: true;
      privacyRetentionAccepted: true;
      licenseAttributionAccepted: true;
      allowedOutputFields: readonly string[];
      forbiddenOutputFields: readonly string[];
    }
  | {
      status: "blocked" | "rejected";
      reasonCode: Exclude<V16Photo2DProviderReasonCode, "provider_boundary_ready">;
      providerKind: V16Photo2DProviderKind;
      providerName: string;
      credentialRequired: boolean;
      credentialState: "not_required" | "missing" | "configured_redacted";
      consent: boolean;
      costDisclosureAccepted: boolean;
      privacyRetentionAccepted: boolean;
      licenseAttributionAccepted: boolean;
    };

export type V16Photo2DProviderActionSummary = {
  actionId: string;
  frameCount: number;
  outputFileDigests: string[];
};

export type V16Photo2DProviderSafeJobSummary = {
  providerKind: V16Photo2DProviderKind;
  providerName: string;
  modelFamily: string;
  safeJobIdDigest: string;
  sourcePhotoDigest: string;
  promptDigest: string;
  actionCount: number;
  totalFrameCount: number;
  actions: V16Photo2DProviderActionSummary[];
  reasonCode: "provider_output_accepted";
};

export function createV16Photo2DProviderBoundaryReview(options: {
  providerKind: V16Photo2DProviderKind;
  providerName?: string;
  credentialAvailable?: boolean;
  consent?: boolean;
  termsAccepted?: boolean;
  costDisclosureAccepted?: boolean;
  privacyRetentionAccepted?: boolean;
  licenseAttributionAccepted?: boolean;
  unsafeRequestPreview?: string;
}): V16Photo2DProviderBoundaryReview {
  const providerKind = options.providerKind;
  const credentialRequired = providerKind !== "host_image_tool";
  const providerName = sanitizeProviderName(options.providerName ?? defaultProviderName(providerKind));
  const credentialState = credentialRequired
    ? options.credentialAvailable ? "configured_redacted" : "missing"
    : "not_required";

  if (options.unsafeRequestPreview && containsForbidden(options.unsafeRequestPreview)) {
    return blocked("rejected", "provider_request_rejected", providerKind, providerName, credentialRequired, credentialState, options);
  }
  if (credentialRequired && !options.credentialAvailable) {
    return blocked("blocked", "provider_credential_missing", providerKind, providerName, credentialRequired, credentialState, options);
  }
  if (!options.consent) {
    return blocked("blocked", "provider_consent_required", providerKind, providerName, credentialRequired, credentialState, options);
  }
  if (!options.termsAccepted) {
    return blocked("blocked", "provider_terms_required", providerKind, providerName, credentialRequired, credentialState, options);
  }
  if (!options.costDisclosureAccepted) {
    return blocked("blocked", "provider_cost_ack_required", providerKind, providerName, credentialRequired, credentialState, options);
  }
  if (!options.privacyRetentionAccepted) {
    return blocked("blocked", "provider_retention_ack_required", providerKind, providerName, credentialRequired, credentialState, options);
  }
  if (!options.licenseAttributionAccepted) {
    return blocked("blocked", "provider_license_ack_required", providerKind, providerName, credentialRequired, credentialState, options);
  }

  const acceptedCredentialState: "not_required" | "configured_redacted" = credentialRequired ? "configured_redacted" : "not_required";
  return {
    status: "accepted",
    reasonCode: "provider_boundary_ready",
    providerKind,
    providerName,
    credentialRequired,
    credentialState: acceptedCredentialState,
    consent: true,
    costDisclosureAccepted: true,
    privacyRetentionAccepted: true,
    licenseAttributionAccepted: true,
    allowedOutputFields: [
      "providerKind",
      "providerName",
      "modelFamily",
      "safeJobIdDigest",
      "sourcePhotoDigest",
      "promptDigest",
      "actionId",
      "frameCount",
      "outputFileDigest",
      "byteLength",
      "reasonCode"
    ],
    forbiddenOutputFields: [
      "token",
      "Authorization",
      "raw payload",
      "raw prompt",
      "prompt text",
      "raw photo",
      "raw provider response",
      "full local path",
      "workspace path",
      "config path",
      "api-token.json"
    ]
  };
}

export function createV16Photo2DProviderSafeJobSummary(options: {
  boundary: V16Photo2DProviderBoundaryReview;
  modelFamily: string;
  jobId: string;
  sourcePhotoDigest: string;
  promptDigest: string;
  actions: V16Photo2DProviderActionSummary[];
}): V16Photo2DProviderSafeJobSummary | {
  status: "blocked";
  reasonCode: V16Photo2DProviderReasonCode;
} {
  if (options.boundary.status !== "accepted") {
    return {
      status: "blocked",
      reasonCode: options.boundary.reasonCode
    };
  }
  const actions = options.actions.map((action) => ({
    actionId: sanitizeActionId(action.actionId),
    frameCount: Math.max(0, Math.min(48, Math.floor(action.frameCount))),
    outputFileDigests: action.outputFileDigests.map((digest) => sanitizeDigest(digest))
  }));
  const summary: V16Photo2DProviderSafeJobSummary = {
    providerKind: options.boundary.providerKind,
    providerName: options.boundary.providerName,
    modelFamily: sanitizeModelFamily(options.modelFamily),
    safeJobIdDigest: digestText(options.jobId),
    sourcePhotoDigest: sanitizeDigest(options.sourcePhotoDigest),
    promptDigest: sanitizeDigest(options.promptDigest),
    actionCount: actions.length,
    totalFrameCount: actions.reduce((sum, action) => sum + action.frameCount, 0),
    actions,
    reasonCode: "provider_output_accepted"
  };
  if (v16ProviderBoundaryHasForbiddenLeak(summary)) {
    return {
      status: "blocked",
      reasonCode: "provider_request_rejected"
    };
  }
  return summary;
}

export function v16ProviderBoundaryHasForbiddenLeak(value: unknown) {
  const serialized = JSON.stringify(value)
    .replace(/"forbiddenOutputFields":\[[^\]]*\]/g, "\"forbiddenOutputFields\":[]")
    .replace(/"allowedOutputFields":\[[^\]]*\]/g, "\"allowedOutputFields\":[]")
    .replace(/credentialRequired|credentialState|configured_redacted|not_required/g, "");
  return containsForbidden(serialized);
}

export function digestText(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function blocked(
  status: "blocked" | "rejected",
  reasonCode: Exclude<V16Photo2DProviderReasonCode, "provider_boundary_ready">,
  providerKind: V16Photo2DProviderKind,
  providerName: string,
  credentialRequired: boolean,
  credentialState: "not_required" | "missing" | "configured_redacted",
  options: {
    consent?: boolean;
    costDisclosureAccepted?: boolean;
    privacyRetentionAccepted?: boolean;
    licenseAttributionAccepted?: boolean;
  }
): V16Photo2DProviderBoundaryReview {
  return {
    status,
    reasonCode,
    providerKind,
    providerName,
    credentialRequired,
    credentialState,
    consent: Boolean(options.consent),
    costDisclosureAccepted: Boolean(options.costDisclosureAccepted),
    privacyRetentionAccepted: Boolean(options.privacyRetentionAccepted),
    licenseAttributionAccepted: Boolean(options.licenseAttributionAccepted)
  };
}

function defaultProviderName(providerKind: V16Photo2DProviderKind) {
  return providerKind === "host_image_tool" ? "Host ChatGPT/Codex image tool" : "MiniMax";
}

function sanitizeProviderName(value: string) {
  const sanitized = value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  return sanitized && !containsForbidden(sanitized) ? sanitized : "image provider";
}

function sanitizeModelFamily(value: string) {
  const sanitized = value.replace(/[^A-Za-z0-9 ._-]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  return sanitized || "image generation model";
}

function sanitizeActionId(value: string) {
  const sanitized = value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
  return sanitized || "action";
}

function sanitizeDigest(value: string) {
  return /^[a-f0-9]{8,64}$/i.test(value) ? value.slice(0, 16).toLowerCase() : digestText(value);
}

function containsForbidden(value: string) {
  return UNSAFE_TEXT_PATTERN.test(value);
}
