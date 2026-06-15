export type V20MainlandProviderId =
  | "minimax"
  | "aliyun_wanxiang"
  | "volcengine_seedream"
  | "kling"
  | "baidu_qianfan"
  | "tencent_hunyuan";

export type V20ProviderReasonCode =
  | "provider_ready"
  | "provider_document_only"
  | "provider_not_selected"
  | "provider_consent_required"
  | "provider_terms_required"
  | "provider_cost_disclosure_required"
  | "provider_privacy_disclosure_required"
  | "provider_retention_disclosure_required"
  | "provider_license_disclosure_required"
  | "provider_attribution_disclosure_required"
  | "provider_credential_missing"
  | "sample_size_limited"
  | "provider_benchmark_passed"
  | "provider_smoke_passed_sample_limited"
  | "provider_benchmark_blocked"
  | "provider_benchmark_failed"
  | "provider_budget_limited"
  | "reference_image_evidence_missing";

export type V20ProviderCandidate = {
  providerId: V20MainlandProviderId;
  displayName: string;
  priority: "P0" | "P1" | "P2";
  activeCandidate: boolean;
  expectedUse: string;
  decision: "active_candidate" | "document_only" | "future_track";
};

export type V20ConsentBoundaryInput = {
  providerId?: V20MainlandProviderId;
  uploadConsent?: boolean;
  termsAccepted?: boolean;
  costDisclosureAccepted?: boolean;
  privacyDisclosureAccepted?: boolean;
  retentionDisclosureAccepted?: boolean;
  licenseDisclosureAccepted?: boolean;
  attributionDisclosureAccepted?: boolean;
  credentialAvailable?: boolean;
};

export type V20ConsentBoundary = {
  providerId: V20MainlandProviderId;
  providerName: string;
  status: "ready" | "blocked";
  reasonCode: V20ProviderReasonCode;
  canStartProvider: boolean;
  credentialState: "configured" | "missing";
  disclosureState: {
    uploadConsent: boolean;
    termsAccepted: boolean;
    costDisclosureAccepted: boolean;
    privacyDisclosureAccepted: boolean;
    retentionDisclosureAccepted: boolean;
    licenseDisclosureAccepted: boolean;
    attributionDisclosureAccepted: boolean;
  };
  safeFields: readonly string[];
};

export type V20CatPhotoSample = {
  sampleId: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
  sizeBucket: "small" | "medium" | "large";
  dimensions: {
    width: number;
    height: number;
  };
  selected: boolean;
  consent: boolean;
};

export type V20BenchmarkAttempt = {
  sampleId: string;
  promptVariant:
    | "strict_grid_motion_sheet"
    | "character_animation_sheet"
    | "high_amplitude_sprite_sheet";
  attemptIndex: 1 | 2;
  accepted: boolean;
  reasonCode:
    | "accepted"
    | "provider_output_not_single_sheet"
    | "background_gate_failed"
    | "same_cat_qa_failed"
    | "motion_amplitude_too_low"
    | "loop_closure_failed"
    | "adjacent_frame_jump"
    | "off_canvas_frame"
    | "watermark_or_label_detected"
    | "provider_output_missing"
    | "provider_output_rejected";
};

export type V20ReferenceImageEvidence = {
  referenceImageAttached: boolean;
  providerCapability: "reference_image_supported" | "text_to_image_only" | "unknown";
  textToImageOnly: boolean;
};

export const V20_SAFE_PROVIDER_OUTPUT_FIELDS = [
  "providerName",
  "endpointHost",
  "model",
  "capability",
  "reference_image_attached",
  "provider_capability",
  "text_to_image_only",
  "reasonCode",
  "imageCount",
  "outputKind",
  "safeOutputFileNames",
  "promptHash",
  "promptLength",
  "credentialState",
  "sampleCount",
  "acceptedSampleCount",
  "medianAcceptedAttemptCount"
] as const;

export function getV20MainlandProviderCandidates(): V20ProviderCandidate[] {
  return [
    {
      providerId: "minimax",
      displayName: "MiniMax / 海螺",
      priority: "P0",
      activeCandidate: true,
      expectedUse: "reference-image to 8x9 motion sheet across multi-sample benchmark",
      decision: "active_candidate"
    },
    {
      providerId: "aliyun_wanxiang",
      displayName: "阿里云百炼 / 通义万相",
      priority: "P1",
      activeCandidate: false,
      expectedUse: "reference image / image edit / image generation",
      decision: "document_only"
    },
    {
      providerId: "volcengine_seedream",
      displayName: "火山方舟 / 豆包 Seedream / 即梦",
      priority: "P1",
      activeCandidate: false,
      expectedUse: "image edit / multi-image / video motion exploration",
      decision: "document_only"
    },
    {
      providerId: "kling",
      displayName: "可灵 / Kling",
      priority: "P2",
      activeCandidate: false,
      expectedUse: "image-to-video then frame extraction",
      decision: "future_track"
    },
    {
      providerId: "baidu_qianfan",
      displayName: "百度千帆 / 文心",
      priority: "P2",
      activeCandidate: false,
      expectedUse: "image generation/edit candidate",
      decision: "future_track"
    },
    {
      providerId: "tencent_hunyuan",
      displayName: "腾讯混元",
      priority: "P2",
      activeCandidate: false,
      expectedUse: "image generation/edit candidate",
      decision: "future_track"
    }
  ];
}

export function createV20ProviderConsentBoundary(input: V20ConsentBoundaryInput): V20ConsentBoundary {
  const providerId = input.providerId ?? "minimax";
  const candidate = getV20MainlandProviderCandidates().find((item) => item.providerId === providerId);
  const providerName = candidate?.displayName ?? "Unknown provider";
  const disclosureState = {
    uploadConsent: Boolean(input.uploadConsent),
    termsAccepted: Boolean(input.termsAccepted),
    costDisclosureAccepted: Boolean(input.costDisclosureAccepted),
    privacyDisclosureAccepted: Boolean(input.privacyDisclosureAccepted),
    retentionDisclosureAccepted: Boolean(input.retentionDisclosureAccepted),
    licenseDisclosureAccepted: Boolean(input.licenseDisclosureAccepted),
    attributionDisclosureAccepted: Boolean(input.attributionDisclosureAccepted)
  };

  const blockedReason =
    candidate?.decision !== "active_candidate" ? "provider_document_only"
      : !disclosureState.uploadConsent ? "provider_consent_required"
        : !disclosureState.termsAccepted ? "provider_terms_required"
          : !disclosureState.costDisclosureAccepted ? "provider_cost_disclosure_required"
            : !disclosureState.privacyDisclosureAccepted ? "provider_privacy_disclosure_required"
              : !disclosureState.retentionDisclosureAccepted ? "provider_retention_disclosure_required"
                : !disclosureState.licenseDisclosureAccepted ? "provider_license_disclosure_required"
                  : !disclosureState.attributionDisclosureAccepted ? "provider_attribution_disclosure_required"
                    : !input.credentialAvailable ? "provider_credential_missing"
                      : null;

  return {
    providerId,
    providerName,
    status: blockedReason ? "blocked" : "ready",
    reasonCode: blockedReason ?? "provider_ready",
    canStartProvider: !blockedReason,
    credentialState: input.credentialAvailable ? "configured" : "missing",
    disclosureState,
    safeFields: V20_SAFE_PROVIDER_OUTPUT_FIELDS
  };
}

export function createV20ReferenceImageEvidence(input: V20ReferenceImageEvidence): {
  status: "passed" | "blocked";
  reasonCode: V20ProviderReasonCode | "reference_image_supported";
  reference_image_attached: boolean;
  provider_capability: V20ReferenceImageEvidence["providerCapability"];
  text_to_image_only: boolean;
} {
  const passed = input.referenceImageAttached &&
    input.providerCapability === "reference_image_supported" &&
    input.textToImageOnly === false;
  return {
    status: passed ? "passed" : "blocked",
    reasonCode: passed ? "reference_image_supported" : "reference_image_evidence_missing",
    reference_image_attached: input.referenceImageAttached,
    provider_capability: input.providerCapability,
    text_to_image_only: input.textToImageOnly
  };
}

export function evaluateV20Benchmark(options: {
  samples: V20CatPhotoSample[];
  attempts: V20BenchmarkAttempt[];
  budgetLimited?: boolean;
}) {
  const selectedSamples = options.samples.filter((sample) => sample.selected && sample.consent);
  const acceptedBySample = new Map<string, number>();

  for (const attempt of options.attempts) {
    if (attempt.accepted && !acceptedBySample.has(attempt.sampleId)) {
      acceptedBySample.set(attempt.sampleId, getAttemptOrdinal(options.attempts, attempt));
    }
  }

  const acceptedAttempts = [...acceptedBySample.values()].sort((a, b) => a - b);
  const medianAcceptedAttemptCount = acceptedAttempts.length
    ? acceptedAttempts[Math.floor((acceptedAttempts.length - 1) / 2)]
    : null;
  const sampleCount = selectedSamples.length;
  const acceptedSampleCount = acceptedBySample.size;

  let status: "passed" | "blocked" | "failed";
  let reasonCode: V20ProviderReasonCode;
  if (options.budgetLimited) {
    status = "blocked";
    reasonCode = "provider_budget_limited";
  } else if (sampleCount < 3 && acceptedSampleCount > 0) {
    status = "passed";
    reasonCode = "provider_smoke_passed_sample_limited";
  } else if (sampleCount < 3) {
    status = "blocked";
    reasonCode = "sample_size_limited";
  } else if (acceptedSampleCount >= 2 && medianAcceptedAttemptCount !== null && medianAcceptedAttemptCount <= 4) {
    status = "passed";
    reasonCode = "provider_benchmark_passed";
  } else {
    status = "failed";
    reasonCode = "provider_benchmark_failed";
  }

  return {
    status,
    reasonCode,
    sampleCount,
    acceptedSampleCount,
    medianAcceptedAttemptCount,
    canClaimLowRetryReliability: reasonCode === "provider_benchmark_passed",
    canClaimScopedSmoke: reasonCode === "provider_smoke_passed_sample_limited" || reasonCode === "provider_benchmark_passed"
  };
}

function getAttemptOrdinal(attempts: V20BenchmarkAttempt[], accepted: V20BenchmarkAttempt) {
  return attempts.filter((attempt) => attempt.sampleId === accepted.sampleId)
    .findIndex((attempt) => attempt === accepted) + 1;
}

export function v20ProviderEvidenceHasForbiddenLeak(value: unknown) {
  return /(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|Authorization\s*[:=]|api-token\.json|\/Users\/|\/private\/|raw provider response|raw payload|raw photo|EXIF|GPS|full local path|workspace path|config path|prompt private text)/i.test(JSON.stringify(value));
}
