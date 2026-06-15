import { CORE_ACTION_IDS, type CoreActionId } from "./asset-manifest";

const FORBIDDEN_PATTERN = /Authorization\s*[:=]|api-token\.json|raw payload|raw photo|raw provider response|provider payload|credential\s*[:=]|token\s*[:=]|prompt text|raw prompt|promptText|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\/|sk-[A-Za-z0-9_-]{8,}/i;

export type Photo2DWizardReasonCode =
  | "wizard_ready"
  | "wizard_security_scan_failed";

export type Photo2DWizardRuntimeState =
  | "idle"
  | "photo_selected"
  | "consent_required"
  | "consent_ready"
  | "traits_required"
  | "generation_ready"
  | "blocked";

export type Photo2DWizardGenerationMode =
  | "none"
  | "host_image_tool_assisted"
  | "provider_api"
  | "local_action_sheet_import";

export type Photo2DWizardJobState =
  | "pending_user_action"
  | "running"
  | "waiting_for_output"
  | "output_ready"
  | "blocked"
  | "failed";

export type Photo2DWizardIntakeReasonCode =
  | "photo_required"
  | "photo_preview_ready"
  | "consent_required"
  | "consent_ready"
  | "traits_required"
  | "generation_ready"
  | "photo_metadata_rejected"
  | "wizard_security_scan_failed";

export type Photo2DWizardGenerationReasonCode =
  | "generation_mode_required"
  | "intake_not_ready"
  | "host_tool_prompt_ready"
  | "consent_required"
  | "provider_credential_missing"
  | "provider_terms_required"
  | "provider_cost_disclosure_required"
  | "provider_privacy_disclosure_required"
  | "provider_retention_disclosure_required"
  | "provider_license_disclosure_required"
  | "provider_output_missing"
  | "action_sheet_required"
  | "action_sheet_output_ready"
  | "generation_status_safe"
  | "wizard_security_scan_failed";

export type Photo2DWizardSafePhotoInput = {
  selected: boolean;
  mediaType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  safeSourceRef?: string;
};

export type Photo2DWizardSafeActionSheetInput = {
  selected: boolean;
  mediaType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  safeSourceRef?: string;
};

export type Photo2DWizardSafePhotoMetadata = {
  selected: boolean;
  mediaType: "none" | "image/png" | "image/jpeg" | "image/webp" | "unsupported";
  sizeBucket: "none" | "tiny" | "small" | "medium" | "large" | "too_large";
  dimensions: "unknown" | `${number}x${number}`;
  safeSourceRef: "none" | "selected-local-photo" | "sanitized-reference";
};

export type Photo2DWizardSafeActionSheetMetadata = Photo2DWizardSafePhotoMetadata;

export type Photo2DWizardIntakeSnapshot = {
  state: Photo2DWizardRuntimeState;
  reasonCode: Photo2DWizardIntakeReasonCode;
  safeMetadata: Photo2DWizardSafePhotoMetadata;
  approvedTraits: string;
  targetPackName: string;
  targetPackId: string;
  consent: boolean;
  safety: {
    acceptedPetEvents: 0;
    callsNotify: false;
    writesCatStateMachine: false;
    mutatesLivePetInstance: false;
    storesRawPhoto: false;
    storesExifGps: false;
    exposesFullLocalPath: false;
    exposesOriginalFilename: false;
  };
};

export type Photo2DWizardGenerationSnapshot = {
  mode: Photo2DWizardGenerationMode;
  jobState: Photo2DWizardJobState;
  reasonCode: Photo2DWizardGenerationReasonCode;
  nextAction: string;
  canCopyPrompt: boolean;
  canSelectActionSheet: boolean;
  canStartProvider: boolean;
  actionSheetMetadata: Photo2DWizardSafeActionSheetMetadata;
  safety: {
    acceptedPetEvents: 0;
    callsNotify: false;
    writesCatStateMachine: false;
    mutatesLivePetInstance: false;
    storesRawProviderResponse: false;
    exposesRawPromptInStatus: false;
    exposesCredential: false;
    exposesFullLocalPath: false;
  };
};

export type Photo2DWizardProviderDisclosureSnapshot = {
  providerName: "minimax" | "manual-provider" | "not-selected";
  uploadConsent: boolean;
  termsReviewed: boolean;
  costDisclosureAccepted: boolean;
  privacyDisclosureAccepted: boolean;
  retentionDisclosureAccepted: boolean;
  licenseDisclosureAccepted: boolean;
  attributionDisclosureAccepted: boolean;
  credentialConfigured: boolean;
  status: "ready" | "blocked";
  reasonCode:
    | "provider_capability_ready"
    | "consent_required"
    | "provider_terms_required"
    | "provider_cost_disclosure_required"
    | "provider_privacy_disclosure_required"
    | "provider_retention_disclosure_required"
    | "provider_license_disclosure_required"
    | "provider_credential_missing";
  safeFieldList: string[];
  safety: {
    acceptedPetEvents: 0;
    callsNotify: false;
    writesCatStateMachine: false;
    mutatesLivePetInstance: false;
    exposesCredential: false;
    exposesFullLocalPath: false;
    storesRawProviderResponse: false;
  };
};

export type Photo2DWizardStepId =
  | "prepare_photo"
  | "generate_action_sheet"
  | "package_frames"
  | "preview_apply";

export type Photo2DWizardStep = {
  id: Photo2DWizardStepId;
  title: string;
  status: "ready" | "manual_review" | "automated" | "preview_only";
  summary: string;
  acceptance: string[];
};

export type Photo2DWizardModel =
  | {
    status: "ready";
    reasonCode: "wizard_ready";
    sourcePhotoRef: string;
    targetPackId: string;
    providerKind: "host_image_tool";
    steps: Photo2DWizardStep[];
    prompt: string;
    outputNames: {
      actionSheetFile: string;
      contactSheetFile: string;
      packId: string;
      manifestFile: "pet.json";
    };
    safety: {
      uploadsByDefault: false;
      storesRawPhoto: false;
      mutatesLivePetDuringPreview: false;
      emitsPetEventDuringPreview: false;
      writesCatStateMachineDuringPreview: false;
      safeRendererInputFields: string[];
    };
    minimumVerification: string[];
    forbiddenClaims: string[];
  }
  | {
    status: "blocked";
    reasonCode: "wizard_security_scan_failed";
    sourcePhotoRef: string;
    targetPackId: string;
  };

export function createPhoto2DWizardModel(options: {
  sourcePhotoRef?: string;
  catDescription?: string;
  targetPackId?: string;
} = {}): Photo2DWizardModel {
  const sourcePhotoRef = sanitizeSourceRef(options.sourcePhotoRef ?? "docs/猫.jpg");
  const targetPackId = sanitizePackId(options.targetPackId ?? "photo-2d-docs-cat");
  const catDescription = sanitizeDescription(options.catDescription ?? "长毛浅橘/奶油色猫，高耳尖、琥珀色眼睛、柔软口鼻和蓬松胸毛");
  const prompt = buildActionSheetPrompt(catDescription);
  const model: Photo2DWizardModel = {
    status: "ready",
    reasonCode: "wizard_ready",
    sourcePhotoRef,
    targetPackId,
    providerKind: "host_image_tool",
    steps: [
      {
        id: "prepare_photo",
        title: "准备照片",
        status: "ready",
        summary: "选择一张清晰猫照片，只保留相对引用和人工确认 traits。",
        acceptance: [
          "照片可打开，主体猫清楚",
          "不记录完整本地路径、EXIF/GPS、token 或 Authorization",
          "用户确认猫的主要外观 traits"
        ]
      },
      {
        id: "generate_action_sheet",
        title: "生成 8 动作图",
        status: "manual_review",
        summary: "用宿主图像工具生成 4x2 动作表，人工确认同一只猫的一致性。",
        acceptance: CORE_ACTION_IDS.map((action) => `${action} 动作可见且仍像同一只猫`)
      },
      {
        id: "package_frames",
        title: "自动打包",
        status: "automated",
        summary: "把动作表归一化为本地 frameSequence pack，首尾帧闭合并生成 contact sheet。",
        acceptance: [
          "8 个 core actions 全覆盖",
          "loop 动作首尾帧闭合",
          "帧间差异不过大且无空白/透明/出框",
          "pet.json 只包含 safe pack/action/frame 字段"
        ]
      },
      {
        id: "preview_apply",
        title: "预览并应用",
        status: "preview_only",
        summary: "先在隔离预览里确认，再应用到目标猫；预览不触发 live 状态。",
        acceptance: [
          "预览不调用 notify",
          "预览不写 CatStateMachine",
          "只应用到目标 PetInstance",
          "default 和 unrelated pets 不变"
        ]
      }
    ],
    prompt,
    outputNames: {
      actionSheetFile: `${targetPackId}_action_sheet.png`,
      contactSheetFile: `${targetPackId}_contact_sheet.png`,
      packId: targetPackId,
      manifestFile: "pet.json"
    },
    safety: {
      uploadsByDefault: false,
      storesRawPhoto: false,
      mutatesLivePetDuringPreview: false,
      emitsPetEventDuringPreview: false,
      writesCatStateMachineDuringPreview: false,
      safeRendererInputFields: [
        "safeActionId",
        "rendererKind",
        "safePackId",
        "playbackIntent",
        "scale",
        "visibility"
      ]
    },
    minimumVerification: [
      "打开向导，确认 sourcePhotoRef 显示为 docs/猫.jpg",
      "复制提示词到宿主图像工具，并以 docs/猫.jpg 作为参考图生成 4x2 动作表",
      "人工确认 8 个动作都像同一只猫",
      "将动作表作为 provider output 进入本地打包流程",
      "查看 contact sheet，确认首尾帧闭合、无闪帧、无出框",
      "在设置页隔离预览目标 pack，确认预览不改变 live pet",
      "应用到目标猫后确认 default 和 unrelated pets 不变"
    ],
    forbiddenClaims: [
      "automatic photo-to-2D ready for arbitrary cats",
      "automatic photo-to-animation ready",
      "provider integration verified",
      "photo-to-3D ready",
      "3D ready",
      "production signed release ready"
    ]
  };

  if (photo2DWizardHasForbiddenContent(model)) {
    return {
      status: "blocked",
      reasonCode: "wizard_security_scan_failed",
      sourcePhotoRef,
      targetPackId
    };
  }
  return model;
}

export function photo2DWizardHasForbiddenContent(value: unknown) {
  const serialized = JSON.stringify(value)
    .replace(/forbiddenClaims/g, "")
    .replace(/storesRawPhoto|uploadsByDefault|raw photo|storesExifGps|exposesFullLocalPath|exposesOriginalFilename/g, "");
  return FORBIDDEN_PATTERN.test(serialized);
}

export function createPhoto2DWizardIntakeSnapshot(options: {
  photo?: Photo2DWizardSafePhotoInput | null;
  consent?: boolean;
  approvedTraits?: string;
  targetPackName?: string;
} = {}): Photo2DWizardIntakeSnapshot {
  const safeMetadata = sanitizePhotoMetadata(options.photo ?? null);
  const approvedTraits = sanitizeDescription(options.approvedTraits ?? "");
  const targetPackName = sanitizeDisplayName(options.targetPackName ?? "My generated cat");
  const targetPackId = sanitizePackId(targetPackName);
  const consent = options.consent === true;

  let state: Photo2DWizardRuntimeState = "idle";
  let reasonCode: Photo2DWizardIntakeReasonCode = "photo_required";

  if (safeMetadata.mediaType === "unsupported" || safeMetadata.sizeBucket === "too_large") {
    state = "blocked";
    reasonCode = "photo_metadata_rejected";
  } else if (safeMetadata.selected && !consent) {
    state = "consent_required";
    reasonCode = "consent_required";
  } else if (safeMetadata.selected && consent && !approvedTraits) {
    state = "traits_required";
    reasonCode = "traits_required";
  } else if (safeMetadata.selected && consent && approvedTraits) {
    state = "generation_ready";
    reasonCode = "generation_ready";
  } else if (safeMetadata.selected) {
    state = "photo_selected";
    reasonCode = "photo_preview_ready";
  }

  const snapshot: Photo2DWizardIntakeSnapshot = {
    state,
    reasonCode,
    safeMetadata,
    approvedTraits,
    targetPackName,
    targetPackId,
    consent,
    safety: {
      acceptedPetEvents: 0,
      callsNotify: false,
      writesCatStateMachine: false,
      mutatesLivePetInstance: false,
      storesRawPhoto: false,
      storesExifGps: false,
      exposesFullLocalPath: false,
      exposesOriginalFilename: false
    }
  };

  if (photo2DWizardHasForbiddenContent(snapshot)) {
    return {
      ...snapshot,
      state: "blocked",
      reasonCode: "wizard_security_scan_failed",
      approvedTraits: "",
      targetPackName: "blocked",
      targetPackId: "blocked"
    };
  }

  return snapshot;
}

export function buildPhoto2DWizardEvidenceSnapshot(snapshot: Photo2DWizardIntakeSnapshot) {
  return {
    state: snapshot.state,
    reasonCode: snapshot.reasonCode,
    safeMetadata: snapshot.safeMetadata,
    targetPackId: snapshot.targetPackId,
    consent: snapshot.consent,
    safeFieldList: [
      "state",
      "reasonCode",
      "safeMetadata.mediaType",
      "safeMetadata.sizeBucket",
      "safeMetadata.dimensions",
      "safeMetadata.selected",
      "consent",
      "targetPackId"
    ],
    mutationBoundary: snapshot.safety
  };
}

export function createPhoto2DWizardGenerationSnapshot(options: {
  intake: Photo2DWizardIntakeSnapshot;
  mode?: Photo2DWizardGenerationMode;
  actionSheet?: Photo2DWizardSafeActionSheetInput | null;
  providerConfigured?: boolean;
  providerCredentialAvailable?: boolean;
  providerConsent?: boolean;
  providerTermsReviewed?: boolean;
  providerCostDisclosureAccepted?: boolean;
  providerPrivacyDisclosureAccepted?: boolean;
  providerRetentionDisclosureAccepted?: boolean;
  providerLicenseDisclosureAccepted?: boolean;
  providerOutputAccepted?: boolean;
}): Photo2DWizardGenerationSnapshot {
  const mode = options.mode ?? "none";
  const actionSheetMetadata = sanitizePhotoMetadata(options.actionSheet ?? null);
  const intakeReady = options.intake.state === "generation_ready";

  let jobState: Photo2DWizardJobState = "blocked";
  let reasonCode: Photo2DWizardGenerationReasonCode = "intake_not_ready";
  let nextAction = "Complete local photo intake first.";
  let canCopyPrompt = false;
  let canSelectActionSheet = false;
  let canStartProvider = false;

  if (!intakeReady) {
    jobState = "blocked";
    reasonCode = "intake_not_ready";
  } else if (mode === "none") {
    jobState = "pending_user_action";
    reasonCode = "generation_mode_required";
    nextAction = "Choose host-assisted, provider API, or local action-sheet import.";
  } else if (mode === "host_image_tool_assisted") {
    jobState = "waiting_for_output";
    reasonCode = "host_tool_prompt_ready";
    nextAction = "Copy the safe prompt, generate a 4x2 action sheet externally, then upload it in this wizard.";
    canCopyPrompt = true;
    canSelectActionSheet = true;
  } else if (mode === "local_action_sheet_import") {
    canSelectActionSheet = true;
    if (!actionSheetMetadata.selected) {
      jobState = "pending_user_action";
      reasonCode = "action_sheet_required";
      nextAction = "Select a local 4x2 action sheet image.";
    } else if (actionSheetMetadata.mediaType === "unsupported" || actionSheetMetadata.sizeBucket === "too_large") {
      jobState = "failed";
      reasonCode = "action_sheet_required";
      nextAction = "Select a PNG, JPEG, or WebP action sheet within the accepted size bucket.";
    } else {
      jobState = "output_ready";
      reasonCode = "action_sheet_output_ready";
      nextAction = "V17.3 can crop and package this selected action sheet.";
    }
  } else if (mode === "provider_api") {
    if (!options.providerConfigured || !options.providerCredentialAvailable) {
      jobState = "blocked";
      reasonCode = "provider_credential_missing";
      nextAction = "Provider API credential is not configured. Use host-assisted or local action-sheet import.";
    } else if (!options.providerConsent) {
      jobState = "blocked";
      reasonCode = "consent_required";
      nextAction = "Provider API requires explicit upload and generation consent before any provider call.";
    } else if (!options.providerTermsReviewed) {
      jobState = "blocked";
      reasonCode = "provider_terms_required";
      nextAction = "Review provider terms before starting generation.";
    } else if (!options.providerCostDisclosureAccepted) {
      jobState = "blocked";
      reasonCode = "provider_cost_disclosure_required";
      nextAction = "Accept provider cost disclosure before starting generation.";
    } else if (!options.providerPrivacyDisclosureAccepted) {
      jobState = "blocked";
      reasonCode = "provider_privacy_disclosure_required";
      nextAction = "Accept provider privacy disclosure before starting generation.";
    } else if (!options.providerRetentionDisclosureAccepted) {
      jobState = "blocked";
      reasonCode = "provider_retention_disclosure_required";
      nextAction = "Accept provider retention disclosure before starting generation.";
    } else if (!options.providerLicenseDisclosureAccepted) {
      jobState = "blocked";
      reasonCode = "provider_license_disclosure_required";
      nextAction = "Accept provider license and attribution disclosure before starting generation.";
    } else if (!options.providerOutputAccepted) {
      jobState = "running";
      reasonCode = "provider_output_missing";
      nextAction = "Provider output is not accepted yet. V18.2 provider capability preflight must run before final acceptance.";
      canStartProvider = true;
    } else {
      jobState = "output_ready";
      reasonCode = "generation_status_safe";
      nextAction = "Accepted provider output can proceed to V18.3 packaging.";
      canStartProvider = true;
    }
  }

  const snapshot: Photo2DWizardGenerationSnapshot = {
    mode,
    jobState,
    reasonCode,
    nextAction: sanitizeStatusText(nextAction),
    canCopyPrompt,
    canSelectActionSheet,
    canStartProvider,
    actionSheetMetadata,
    safety: {
      acceptedPetEvents: 0,
      callsNotify: false,
      writesCatStateMachine: false,
      mutatesLivePetInstance: false,
      storesRawProviderResponse: false,
      exposesRawPromptInStatus: false,
      exposesCredential: false,
      exposesFullLocalPath: false
    }
  };

  if (photo2DWizardHasForbiddenContent(snapshot)) {
    return {
      ...snapshot,
      jobState: "failed",
      reasonCode: "wizard_security_scan_failed",
      nextAction: "Security scan failed."
    };
  }

  return snapshot;
}

export function createPhoto2DWizardProviderDisclosureSnapshot(options: {
  providerName?: Photo2DWizardProviderDisclosureSnapshot["providerName"];
  uploadConsent?: boolean;
  termsReviewed?: boolean;
  costDisclosureAccepted?: boolean;
  privacyDisclosureAccepted?: boolean;
  retentionDisclosureAccepted?: boolean;
  licenseDisclosureAccepted?: boolean;
  attributionDisclosureAccepted?: boolean;
  credentialConfigured?: boolean;
} = {}): Photo2DWizardProviderDisclosureSnapshot {
  const uploadConsent = options.uploadConsent === true;
  const termsReviewed = options.termsReviewed === true;
  const costDisclosureAccepted = options.costDisclosureAccepted === true;
  const privacyDisclosureAccepted = options.privacyDisclosureAccepted === true;
  const retentionDisclosureAccepted = options.retentionDisclosureAccepted === true;
  const licenseDisclosureAccepted = options.licenseDisclosureAccepted === true;
  const attributionDisclosureAccepted = options.attributionDisclosureAccepted === true;
  const credentialConfigured = options.credentialConfigured === true;

  let reasonCode: Photo2DWizardProviderDisclosureSnapshot["reasonCode"] = "provider_capability_ready";
  if (!uploadConsent) {
    reasonCode = "consent_required";
  } else if (!termsReviewed) {
    reasonCode = "provider_terms_required";
  } else if (!costDisclosureAccepted) {
    reasonCode = "provider_cost_disclosure_required";
  } else if (!privacyDisclosureAccepted) {
    reasonCode = "provider_privacy_disclosure_required";
  } else if (!retentionDisclosureAccepted) {
    reasonCode = "provider_retention_disclosure_required";
  } else if (!licenseDisclosureAccepted || !attributionDisclosureAccepted) {
    reasonCode = "provider_license_disclosure_required";
  } else if (!credentialConfigured) {
    reasonCode = "provider_credential_missing";
  }

  const snapshot: Photo2DWizardProviderDisclosureSnapshot = {
    providerName: options.providerName ?? "minimax",
    uploadConsent,
    termsReviewed,
    costDisclosureAccepted,
    privacyDisclosureAccepted,
    retentionDisclosureAccepted,
    licenseDisclosureAccepted,
    attributionDisclosureAccepted,
    credentialConfigured,
    status: reasonCode === "provider_capability_ready" ? "ready" : "blocked",
    reasonCode,
    safeFieldList: [
      "providerName",
      "uploadConsent",
      "termsReviewed",
      "costDisclosureAccepted",
      "privacyDisclosureAccepted",
      "retentionDisclosureAccepted",
      "licenseDisclosureAccepted",
      "attributionDisclosureAccepted",
      "credentialConfigured",
      "status",
      "reasonCode"
    ],
    safety: {
      acceptedPetEvents: 0,
      callsNotify: false,
      writesCatStateMachine: false,
      mutatesLivePetInstance: false,
      exposesCredential: false,
      exposesFullLocalPath: false,
      storesRawProviderResponse: false
    }
  };

  if (photo2DWizardHasForbiddenContent(snapshot)) {
    return {
      ...snapshot,
      status: "blocked",
      reasonCode: "provider_credential_missing",
      credentialConfigured: false
    };
  }

  return snapshot;
}

export function buildPhoto2DWizardGenerationEvidenceSnapshot(snapshot: Photo2DWizardGenerationSnapshot) {
  return {
    mode: snapshot.mode,
    jobState: snapshot.jobState,
    reasonCode: snapshot.reasonCode,
    canCopyPrompt: snapshot.canCopyPrompt,
    canSelectActionSheet: snapshot.canSelectActionSheet,
    canStartProvider: snapshot.canStartProvider,
    actionSheetMetadata: snapshot.actionSheetMetadata,
    safeFieldList: [
      "mode",
      "jobState",
      "reasonCode",
      "actionSheetMetadata.mediaType",
      "actionSheetMetadata.sizeBucket",
      "actionSheetMetadata.dimensions",
      "canCopyPrompt",
      "canSelectActionSheet",
      "canStartProvider"
    ],
    mutationBoundary: snapshot.safety
  };
}

function buildActionSheetPrompt(catDescription: string) {
  return [
    "Use the provided cat photo as the exact identity reference.",
    `Keep these traits consistent across every cell: ${catDescription}.`,
    "Generate a clean 4x2 action sheet for a desktop pet 2D animation pack.",
    `Create 8 square transparent-background action poses in this order: ${CORE_ACTION_IDS.join(", ")}.`,
    "Style: polished cute 2D desktop pet mascot, consistent lighting, consistent camera angle, full body visible, no text, no UI, no extra cats.",
    "Each pose must preserve the same cat identity and leave enough margin for frame-sequence animation packaging."
  ].join(" ");
}

function sanitizeSourceRef(value: string) {
  const normalized = value
    .replace(/\\/g, "/")
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .slice(-2)
    .join("/");
  return normalized || "docs/猫.jpg";
}

function sanitizePackId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "photo-2d-generated-cat";
}

function sanitizeDisplayName(value: string) {
  return value
    .replace(/[<>]/g, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/file:\/\/\S+/gi, "")
    .replace(/\/Users\/\S+/g, "")
    .replace(/[^\p{L}\p{N} ._-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "My generated cat";
}

function sanitizeDescription(value: string) {
  return value
    .replace(/[<>]/g, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/file:\/\/\S+/gi, "")
    .replace(/\/Users\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

function sanitizeStatusText(value: string) {
  return value
    .replace(/[<>]/g, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/file:\/\/\S+/gi, "")
    .replace(/\/Users\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

function sanitizePhotoMetadata(photo: Photo2DWizardSafePhotoInput | null): Photo2DWizardSafePhotoMetadata {
  if (!photo?.selected) {
    return {
      selected: false,
      mediaType: "none",
      sizeBucket: "none",
      dimensions: "unknown",
      safeSourceRef: "none"
    };
  }

  const mediaType = normalizeMediaType(photo.mediaType);
  const width = finitePositiveInteger(photo.width);
  const height = finitePositiveInteger(photo.height);
  return {
    selected: true,
    mediaType,
    sizeBucket: bucketSize(photo.sizeBytes),
    dimensions: width && height ? `${width}x${height}` : "unknown",
    safeSourceRef: photo.safeSourceRef === "selected-local-photo" ? "selected-local-photo" : "sanitized-reference"
  };
}

function normalizeMediaType(value: string | undefined): Photo2DWizardSafePhotoMetadata["mediaType"] {
  if (value === "image/png" || value === "image/jpeg" || value === "image/webp") {
    return value;
  }
  return "unsupported";
}

function bucketSize(value: number | undefined): Photo2DWizardSafePhotoMetadata["sizeBucket"] {
  if (!Number.isFinite(value) || value === undefined || value <= 0) {
    return "none";
  }
  if (value < 256 * 1024) return "tiny";
  if (value < 2 * 1024 * 1024) return "small";
  if (value < 8 * 1024 * 1024) return "medium";
  if (value < 16 * 1024 * 1024) return "large";
  return "too_large";
}

function finitePositiveInteger(value: number | undefined) {
  return Number.isFinite(value) && value !== undefined && value > 0 ? Math.round(value) : null;
}
