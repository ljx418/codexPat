const FORBIDDEN_PATTERN = /Authorization|api-token\.json|raw payload|raw photo|workspace path|config path|provider payload|providerPayload|credential|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\/|sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}/i;

export type PhotoToAssetStepStatus = "not_started" | "ready" | "blocked" | "running" | "passed" | "failed";

export type PhotoToAssetReasonCode =
  | "traits_approval_required"
  | "consent_required"
  | "provider_output_missing"
  | "provider_output_rejected"
  | "asset_validation_failed"
  | "gltf_scan_failed"
  | "manifest_import_failed"
  | "activation_failed"
  | "previous_pack_preserved"
  | "external_glb_import_passed"
  | "real_provider_3d_branch_blocked"
  | "orchestration_passed";

export type PhotoToAssetPathInput = {
  name: "generated_2d" | "external_glb_import" | "real_provider_3d";
  status: PhotoToAssetStepStatus;
  reasonCode?: PhotoToAssetReasonCode;
  rendererKind?: "sprite" | "gltf";
  packId?: string;
  targetInstanceId?: string;
};

export type PhotoToAssetFailureInput = {
  status: "failed" | "passed";
  reasonCode: PhotoToAssetReasonCode;
  previousPackPreserved: boolean;
};

export type PhotoToAssetOrchestrationSummary = {
  status: "passed" | "blocked" | "failed";
  allowedClaim: string | null;
  blockedClaims: string[];
  approvedTraitSource: "user_approved_metadata";
  photoBoundary: {
    storesRawPhoto: false;
    uploadsByDefault: false;
    persistsPrivateImageMetadata: false;
    persistsFullPath: false;
  };
  paths: PhotoToAssetPathInput[];
  reasonCodes: PhotoToAssetReasonCode[];
  targetIsolation: {
    defaultUnchanged: boolean;
    unrelatedPetsUnchanged: boolean;
  };
  failurePreservation: {
    previousPackPreserved: boolean;
    reasonCode: PhotoToAssetReasonCode;
  };
};

export function createPhotoToAssetOrchestrationSummary(options: {
  traitsApproved: boolean;
  consentAccepted: boolean;
  generated2d: PhotoToAssetPathInput;
  externalGlbImport: PhotoToAssetPathInput;
  realProvider3d?: PhotoToAssetPathInput;
  failurePreservation: PhotoToAssetFailureInput;
  defaultUnchanged: boolean;
  unrelatedPetsUnchanged: boolean;
}): PhotoToAssetOrchestrationSummary {
  const paths: PhotoToAssetPathInput[] = [
    normalizePath(options.generated2d),
    normalizePath(options.externalGlbImport),
    normalizePath(options.realProvider3d ?? {
      name: "real_provider_3d",
      status: "blocked",
      reasonCode: "real_provider_3d_branch_blocked"
    })
  ];

  const reasonCodes = new Set<PhotoToAssetReasonCode>();
  if (!options.traitsApproved) {
    reasonCodes.add("traits_approval_required");
  }
  if (!options.consentAccepted) {
    reasonCodes.add("consent_required");
  }
  for (const path of paths) {
    if (path.reasonCode) {
      reasonCodes.add(path.reasonCode);
    }
  }
  if (paths.some((path) => path.name === "real_provider_3d" && path.status === "blocked")) {
    reasonCodes.add("provider_output_missing");
    reasonCodes.add("real_provider_3d_branch_blocked");
  }
  if (options.failurePreservation.previousPackPreserved) {
    reasonCodes.add("previous_pack_preserved");
  }
  if (options.failurePreservation.reasonCode) {
    reasonCodes.add(options.failurePreservation.reasonCode);
  }

  const generated2dPassed = paths.some((path) => path.name === "generated_2d" && path.status === "passed");
  const externalGlbPassed = paths.some((path) => path.name === "external_glb_import" && path.status === "passed");
  const hasFailedPath = paths.some((path) => path.status === "failed") || options.failurePreservation.status === "failed";
  const isolationPassed = options.defaultUnchanged && options.unrelatedPetsUnchanged;
  const requiredPassed = options.traitsApproved && options.consentAccepted && generated2dPassed && externalGlbPassed && isolationPassed && options.failurePreservation.previousPackPreserved;

  const status = hasFailedPath ? "failed" : requiredPassed ? "passed" : "blocked";
  if (status === "passed") {
    reasonCodes.add("orchestration_passed");
  }

  return {
    status,
    allowedClaim: status === "passed"
      ? "V7.13 photo-to-asset orchestration passed for tested local 2D generated asset workflow and external GLB import workflow."
      : null,
    blockedClaims: [
      "automatic photo-to-3D ready",
      "provider integration verified",
      "broad 3D ready"
    ],
    approvedTraitSource: "user_approved_metadata",
    photoBoundary: {
      storesRawPhoto: false,
      uploadsByDefault: false,
      persistsPrivateImageMetadata: false,
      persistsFullPath: false
    },
    paths,
    reasonCodes: Array.from(reasonCodes).sort(),
    targetIsolation: {
      defaultUnchanged: options.defaultUnchanged,
      unrelatedPetsUnchanged: options.unrelatedPetsUnchanged
    },
    failurePreservation: {
      previousPackPreserved: options.failurePreservation.previousPackPreserved,
      reasonCode: options.failurePreservation.reasonCode
    }
  };
}

export function photoToAssetOrchestrationHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function normalizePath(path: PhotoToAssetPathInput): PhotoToAssetPathInput {
  return {
    name: path.name,
    status: path.status,
    reasonCode: path.reasonCode,
    rendererKind: path.rendererKind,
    packId: sanitizeId(path.packId),
    targetInstanceId: sanitizeId(path.targetInstanceId)
  };
}

function sanitizeId(value: string | undefined) {
  if (!value) {
    return undefined;
  }
  return /^[A-Za-z0-9._-]{1,96}$/.test(value) ? value : "redacted-id";
}
