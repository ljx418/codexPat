export type V40DirectRunnerDependencyName =
  | "python"
  | "torch"
  | "diffusers"
  | "transformers"
  | "safetensors"
  | "PIL"
  | "numpy";

export type V40DirectRunnerStatus = "ready" | "unavailable" | "blocked";
export type V40DirectGpuStatus = "available" | "unavailable" | "unknown";
export type V40DirectOutputDirectoryStatus = "ready" | "blocked";
export type V40DirectOllamaStatus = "available" | "unavailable" | "not_required";
export type V40DirectPhaseDecision = "passed scoped" | "blocked" | "failed";

export type V40DirectRunnerReasonCode =
  | "gpu_available"
  | "gpu_unavailable"
  | "python_available"
  | "python_unavailable"
  | "direct_runner_dependency_available"
  | "direct_runner_dependency_missing"
  | "direct_runner_model_available"
  | "direct_runner_model_missing"
  | "direct_runner_ready"
  | "direct_runner_unavailable"
  | "safe_output_dir_ready"
  | "safe_output_dir_blocked"
  | "ollama_available"
  | "ollama_unavailable"
  | "ollama_not_required"
  | "unsafe_model_reference"
  | "unsafe_output_reference"
  | "raw_prompt_leak_detected"
  | "raw_payload_leak_detected"
  | "raw_path_leak_detected"
  | "sensitive_value_leak_detected"
  | "v40_1a_direct_runner_passed_scoped"
  | "v40_1a_direct_runner_blocked"
  | "v40_1a_direct_runner_failed";

export type V40DirectRunnerDependencySummary = Record<V40DirectRunnerDependencyName, "available" | "missing">;

export type V40DirectRunnerProbeInput = {
  gpuName?: string | null;
  gpuMemoryMiB?: number | null;
  pythonAvailable?: boolean;
  dependencySummary?: Partial<V40DirectRunnerDependencySummary>;
  localModelNames?: string[];
  safeOutputDirRef?: string | null;
  ollamaModels?: string[];
  ollamaRequired?: boolean;
};

export type V40DirectRunnerReadiness = {
  gpuStatus: V40DirectGpuStatus;
  gpuSummary: "local_gpu_available" | "local_gpu_unavailable";
  dependencySummary: V40DirectRunnerDependencySummary;
  directRunnerStatus: V40DirectRunnerStatus;
  directModelSummary: string[];
  outputDirectoryStatus: V40DirectOutputDirectoryStatus;
  safeOutputDirRef: string | null;
  ollamaStatus: V40DirectOllamaStatus;
  ollamaModelSummary: string[];
  generationAttempted: false;
  reasonCodes: V40DirectRunnerReasonCode[];
};

export type V40DirectRunnerScanResult = {
  status: "passed" | "failed";
  hits: string[];
};

export type V40DirectRunnerSmokeDecision = {
  ok: boolean;
  phase: "V40.1A";
  decision: V40DirectPhaseDecision;
  readiness: V40DirectRunnerReadiness;
  reasonCodes: V40DirectRunnerReasonCode[];
  claimScanStatus: V40DirectRunnerScanResult["status"];
  securityScanStatus: V40DirectRunnerScanResult["status"];
};

const DEPENDENCY_NAMES: V40DirectRunnerDependencyName[] = ["python", "torch", "diffusers", "transformers", "safetensors", "PIL", "numpy"];
const REQUIRED_DIRECT_MODEL_DEPENDENCIES: V40DirectRunnerDependencyName[] = ["python", "torch", "diffusers", "transformers", "safetensors", "PIL", "numpy"];
const SAFE_NAME_PATTERN = /^[A-Za-z0-9._:+-]{1,96}$/;
const SAFE_REL_REF_PATTERN = /^(?:docs|apps)\/[A-Za-z0-9._/@+-]+(?:\/[A-Za-z0-9._/@+-]+)*$/;
const RAW_PATH_PATTERN =
  /\b[A-Za-z]:[\\/]|(?:^|[\s"'`])\/(?:mnt|home|Users|private|Volumes|workspace|tmp)\/|file:\/\/|\\\\[A-Za-z0-9_.-]+\\/i;
const SENSITIVE_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|token\s*[:=]|raw prompt|raw runner payload|raw payload|raw generated image bytes|raw photo bytes|EXIF|GPS|latitude|longitude|workspace path|config path|credential path|terminal title|sk-[A-Za-z0-9_-]{8,})\b/i;
const POSITIVE_FORBIDDEN_CLAIM_PATTERN =
  /\b(?:Petdex parity achieved|automatic photo-to-animation ready|automatic photo-to-2D ready|provider integration verified|Route B verified|3D ready|production signed release ready|Windows ready|cross-platform ready|MCP ready|Claude Code integration verified|OS-level Codex window binding ready|all Codex workflows verified|WebUI ready|ComfyUI ready)\b/i;

function uniqueReasonCodes(codes: V40DirectRunnerReasonCode[]): V40DirectRunnerReasonCode[] {
  return [...new Set(codes)];
}

export function sanitizeV40DirectSafeName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || RAW_PATH_PATTERN.test(trimmed)) return null;
  const withoutExtension = trimmed.replace(/\.(?:safetensors|ckpt|pt|pth|bin)$/i, "");
  if (!SAFE_NAME_PATTERN.test(withoutExtension)) return null;
  return withoutExtension;
}

export function sanitizeV40DirectRelativeRef(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().replaceAll("\\", "/");
  if (!normalized || RAW_PATH_PATTERN.test(normalized) || !SAFE_REL_REF_PATTERN.test(normalized)) {
    return null;
  }
  return normalized;
}

export function runV40DirectRunnerClaimScan(value: unknown): V40DirectRunnerScanResult {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const hits = POSITIVE_FORBIDDEN_CLAIM_PATTERN.test(text) ? ["positive_forbidden_ready_claim"] : [];
  return { status: hits.length === 0 ? "passed" : "failed", hits };
}

export function runV40DirectRunnerSecurityScan(value: unknown): V40DirectRunnerScanResult {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const hits: string[] = [];
  if (RAW_PATH_PATTERN.test(text)) hits.push("raw_path_leak_detected");
  if (SENSITIVE_PATTERN.test(text)) hits.push("sensitive_value_leak_detected");
  return { status: hits.length === 0 ? "passed" : "failed", hits };
}

export function createV40DirectRunnerReadiness(input: V40DirectRunnerProbeInput): V40DirectRunnerReadiness {
  const reasonCodes: V40DirectRunnerReasonCode[] = [];
  const gpuStatus: V40DirectGpuStatus = input.gpuName && input.gpuMemoryMiB && input.gpuMemoryMiB > 0 ? "available" : "unavailable";
  reasonCodes.push(gpuStatus === "available" ? "gpu_available" : "gpu_unavailable");

  const dependencySummary = Object.fromEntries(DEPENDENCY_NAMES.map((name) => {
    if (name === "python") {
      return [name, input.pythonAvailable === true ? "available" : "missing"];
    }
    return [name, input.dependencySummary?.[name] === "available" ? "available" : "missing"];
  })) as V40DirectRunnerDependencySummary;

  if (dependencySummary.python === "available") {
    reasonCodes.push("python_available");
  } else {
    reasonCodes.push("python_unavailable");
  }

  if (REQUIRED_DIRECT_MODEL_DEPENDENCIES.every((name) => dependencySummary[name] === "available")) {
    reasonCodes.push("direct_runner_dependency_available");
  } else {
    reasonCodes.push("direct_runner_dependency_missing");
  }

  const directModelSummary: string[] = [];
  let unsafeModelReference = false;
  for (const modelName of input.localModelNames ?? []) {
    const sanitized = sanitizeV40DirectSafeName(modelName);
    if (sanitized) {
      directModelSummary.push(sanitized);
    } else {
      unsafeModelReference = true;
    }
  }
  if (unsafeModelReference) reasonCodes.push("unsafe_model_reference");
  reasonCodes.push(directModelSummary.length > 0 ? "direct_runner_model_available" : "direct_runner_model_missing");

  const safeOutputDirRef = sanitizeV40DirectRelativeRef(input.safeOutputDirRef);
  const outputDirectoryStatus: V40DirectOutputDirectoryStatus = safeOutputDirRef ? "ready" : "blocked";
  reasonCodes.push(outputDirectoryStatus === "ready" ? "safe_output_dir_ready" : "safe_output_dir_blocked");
  if (!safeOutputDirRef) reasonCodes.push("unsafe_output_reference");

  const ollamaModelSummary = (input.ollamaModels ?? []).map(sanitizeV40DirectSafeName).filter((item): item is string => Boolean(item));
  let ollamaStatus: V40DirectOllamaStatus = "not_required";
  if (ollamaModelSummary.length > 0) {
    ollamaStatus = "available";
    reasonCodes.push("ollama_available");
  } else if (input.ollamaRequired) {
    ollamaStatus = "unavailable";
    reasonCodes.push("ollama_unavailable");
  } else {
    reasonCodes.push("ollama_not_required");
  }

  const requiredDependenciesReady = REQUIRED_DIRECT_MODEL_DEPENDENCIES.every((name) => dependencySummary[name] === "available");
  const directRunnerStatus: V40DirectRunnerStatus =
    gpuStatus === "available" && requiredDependenciesReady && directModelSummary.length > 0 && outputDirectoryStatus === "ready"
      ? "ready"
      : "blocked";
  reasonCodes.push(directRunnerStatus === "ready" ? "direct_runner_ready" : "direct_runner_unavailable");

  return {
    gpuStatus,
    gpuSummary: gpuStatus === "available" ? "local_gpu_available" : "local_gpu_unavailable",
    dependencySummary,
    directRunnerStatus,
    directModelSummary: [...new Set(directModelSummary)],
    outputDirectoryStatus,
    safeOutputDirRef,
    ollamaStatus,
    ollamaModelSummary: [...new Set(ollamaModelSummary)],
    generationAttempted: false,
    reasonCodes: uniqueReasonCodes(reasonCodes)
  };
}

export function decideV40DirectRunnerSmoke(input: V40DirectRunnerProbeInput): V40DirectRunnerSmokeDecision {
  const readiness = createV40DirectRunnerReadiness(input);
  const scanTarget = { readiness };
  const claimScan = runV40DirectRunnerClaimScan(scanTarget);
  const securityScan = runV40DirectRunnerSecurityScan(scanTarget);
  const scanPassed = claimScan.status === "passed" && securityScan.status === "passed";

  let decision: V40DirectPhaseDecision = "blocked";
  const reasonCodes: V40DirectRunnerReasonCode[] = [...readiness.reasonCodes];
  if (!scanPassed) {
    decision = "failed";
    reasonCodes.push("v40_1a_direct_runner_failed");
    if (securityScan.hits.includes("raw_path_leak_detected")) reasonCodes.push("raw_path_leak_detected");
    if (securityScan.hits.includes("sensitive_value_leak_detected")) reasonCodes.push("sensitive_value_leak_detected");
  } else if (readiness.directRunnerStatus === "ready" && readiness.ollamaStatus !== "unavailable") {
    decision = "passed scoped";
    reasonCodes.push("v40_1a_direct_runner_passed_scoped");
  } else {
    decision = "blocked";
    reasonCodes.push("v40_1a_direct_runner_blocked");
  }

  return {
    ok: decision === "passed scoped",
    phase: "V40.1A",
    decision,
    readiness,
    reasonCodes: uniqueReasonCodes(reasonCodes),
    claimScanStatus: claimScan.status,
    securityScanStatus: securityScan.status
  };
}
