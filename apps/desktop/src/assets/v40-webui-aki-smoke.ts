export type V40WebUiGpuStatus = "available" | "unavailable" | "unknown";
export type V40WebUiOllamaStatus = "available" | "unavailable" | "not_required";
export type V40WebUiApiStatus = "api_ready" | "unavailable" | "blocked";
export type V40WebUiModelStatus = "available" | "missing" | "unknown";
export type V40WebUiOutputDirectoryStatus = "ready" | "blocked";
export type V40WebUiPythonRuntimeStatus = "compatible" | "incompatible" | "unknown";
export type V40WebUiPhaseDecision = "passed scoped" | "blocked" | "failed";

export type V40WebUiReasonCode =
  | "gpu_available"
  | "gpu_unavailable"
  | "ollama_available"
  | "ollama_unavailable"
  | "ollama_not_required"
  | "webui_api_ready"
  | "webui_api_unavailable"
  | "webui_model_available"
  | "webui_model_missing"
  | "webui_generation_not_attempted"
  | "webui_python_runtime_compatible"
  | "webui_python_runtime_incompatible"
  | "webui_python_runtime_unknown"
  | "webui_safe_output_dir_ready"
  | "webui_safe_output_dir_blocked"
  | "unsafe_model_reference"
  | "unsafe_output_reference"
  | "raw_prompt_leak_detected"
  | "raw_payload_leak_detected"
  | "raw_path_leak_detected"
  | "sensitive_value_leak_detected"
  | "v40_1a_smoke_passed_scoped"
  | "v40_1a_smoke_blocked"
  | "v40_1a_smoke_failed";

export type V40WebUiAkiProbeInput = {
  gpuName?: string | null;
  gpuMemoryMiB?: number | null;
  ollamaModels?: string[];
  ollamaRequired?: boolean;
  webuiApiReachable?: boolean;
  webuiApiModelNames?: string[];
  localCheckpointNames?: string[];
  webuiPythonRuntimeCompatible?: boolean | null;
  safeOutputDirRef?: string | null;
};

export type V40WebUiAkiReadiness = {
  gpuStatus: V40WebUiGpuStatus;
  gpuSummary: "local_gpu_available" | "local_gpu_unavailable";
  ollamaStatus: V40WebUiOllamaStatus;
  ollamaModelSummary: string[];
  webuiStatus: V40WebUiApiStatus;
  webuiModelStatus: V40WebUiModelStatus;
  webuiModelSummary: string[];
  webuiPythonRuntimeStatus: V40WebUiPythonRuntimeStatus;
  outputDirectoryStatus: V40WebUiOutputDirectoryStatus;
  safeOutputDirRef: string | null;
  generationAttempted: false;
  reasonCodes: V40WebUiReasonCode[];
};

export type V40WebUiScanResult = {
  status: "passed" | "failed";
  hits: string[];
};

export type V40WebUiAkiSmokeDecision = {
  ok: boolean;
  phase: "V40.1A";
  decision: V40WebUiPhaseDecision;
  readiness: V40WebUiAkiReadiness;
  reasonCodes: V40WebUiReasonCode[];
  claimScanStatus: V40WebUiScanResult["status"];
  securityScanStatus: V40WebUiScanResult["status"];
};

const SAFE_NAME_PATTERN = /^[A-Za-z0-9._:+-]{1,96}$/;
const SAFE_REL_REF_PATTERN = /^(?:docs|apps)\/[A-Za-z0-9._/@+-]+(?:\/[A-Za-z0-9._/@+-]+)*$/;
const RAW_PATH_PATTERN =
  /\b[A-Za-z]:[\\/]|(?:^|[\s"'`])\/(?:mnt|home|Users|private|Volumes|workspace|tmp)\/|file:\/\/|\\\\[A-Za-z0-9_.-]+\\/i;
const SENSITIVE_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|token\s*[:=]|raw prompt|raw WebUI API payload|raw payload|raw generated image bytes|raw photo bytes|EXIF|GPS|latitude|longitude|workspace path|config path|credential path|terminal title|sk-[A-Za-z0-9_-]{8,})\b/i;
const POSITIVE_FORBIDDEN_CLAIM_PATTERN =
  /\b(?:Petdex parity achieved|automatic photo-to-animation ready|automatic photo-to-2D ready|provider integration verified|Route B verified|3D ready|production signed release ready|Windows ready|cross-platform ready|MCP ready|Claude Code integration verified|OS-level Codex window binding ready|all Codex workflows verified)\b/i;

function uniqueReasonCodes(codes: V40WebUiReasonCode[]): V40WebUiReasonCode[] {
  return [...new Set(codes)];
}

export function sanitizeV40WebUiSafeName(value: string): string | null {
  const baseName = value.trim().split(/[\\/]/).pop() ?? "";
  const withoutExtension = baseName.replace(/\.(?:safetensors|ckpt|pt|pth)$/i, "");
  if (!withoutExtension || RAW_PATH_PATTERN.test(value) || !SAFE_NAME_PATTERN.test(withoutExtension)) {
    return null;
  }
  return withoutExtension;
}

export function sanitizeV40WebUiRelativeRef(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().replaceAll("\\", "/");
  if (!normalized || RAW_PATH_PATTERN.test(normalized) || !SAFE_REL_REF_PATTERN.test(normalized)) {
    return null;
  }
  return normalized;
}

export function runV40WebUiClaimScan(value: unknown): V40WebUiScanResult {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const hits = POSITIVE_FORBIDDEN_CLAIM_PATTERN.test(text) ? ["positive_forbidden_ready_claim"] : [];
  return { status: hits.length === 0 ? "passed" : "failed", hits };
}

export function runV40WebUiSecurityScan(value: unknown): V40WebUiScanResult {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const hits: string[] = [];
  if (RAW_PATH_PATTERN.test(text)) hits.push("raw_path_leak_detected");
  if (SENSITIVE_PATTERN.test(text)) hits.push("sensitive_value_leak_detected");
  return { status: hits.length === 0 ? "passed" : "failed", hits };
}

export function createV40WebUiAkiReadiness(input: V40WebUiAkiProbeInput): V40WebUiAkiReadiness {
  const reasonCodes: V40WebUiReasonCode[] = [];
  const gpuStatus: V40WebUiGpuStatus = input.gpuName && input.gpuMemoryMiB && input.gpuMemoryMiB > 0 ? "available" : "unavailable";
  reasonCodes.push(gpuStatus === "available" ? "gpu_available" : "gpu_unavailable");

  const ollamaModelSummary: string[] = [];
  let unsafeModelReference = false;
  for (const model of input.ollamaModels ?? []) {
    const sanitized = sanitizeV40WebUiSafeName(model);
    if (sanitized) {
      ollamaModelSummary.push(sanitized);
    } else {
      unsafeModelReference = true;
    }
  }
  if (unsafeModelReference) reasonCodes.push("unsafe_model_reference");

  let ollamaStatus: V40WebUiOllamaStatus = "not_required";
  if (ollamaModelSummary.length > 0) {
    ollamaStatus = "available";
    reasonCodes.push("ollama_available");
  } else if (input.ollamaRequired) {
    ollamaStatus = "unavailable";
    reasonCodes.push("ollama_unavailable");
  } else {
    reasonCodes.push("ollama_not_required");
  }

  const webuiStatus: V40WebUiApiStatus = input.webuiApiReachable ? "api_ready" : "unavailable";
  reasonCodes.push(webuiStatus === "api_ready" ? "webui_api_ready" : "webui_api_unavailable");

  let webuiPythonRuntimeStatus: V40WebUiPythonRuntimeStatus = "unknown";
  if (input.webuiPythonRuntimeCompatible === true) {
    webuiPythonRuntimeStatus = "compatible";
    reasonCodes.push("webui_python_runtime_compatible");
  } else if (input.webuiPythonRuntimeCompatible === false) {
    webuiPythonRuntimeStatus = "incompatible";
    reasonCodes.push("webui_python_runtime_incompatible");
  } else {
    reasonCodes.push("webui_python_runtime_unknown");
  }

  const webuiModelSummary: string[] = [];
  for (const model of [...(input.webuiApiModelNames ?? []), ...(input.localCheckpointNames ?? [])]) {
    const sanitized = sanitizeV40WebUiSafeName(model);
    if (sanitized) {
      webuiModelSummary.push(sanitized);
    } else {
      unsafeModelReference = true;
    }
  }
  if (unsafeModelReference && !reasonCodes.includes("unsafe_model_reference")) {
    reasonCodes.push("unsafe_model_reference");
  }

  const webuiModelStatus: V40WebUiModelStatus = webuiModelSummary.length > 0 ? "available" : "missing";
  reasonCodes.push(webuiModelStatus === "available" ? "webui_model_available" : "webui_model_missing");

  const safeOutputDirRef = sanitizeV40WebUiRelativeRef(input.safeOutputDirRef);
  const outputDirectoryStatus: V40WebUiOutputDirectoryStatus = safeOutputDirRef ? "ready" : "blocked";
  reasonCodes.push(outputDirectoryStatus === "ready" ? "webui_safe_output_dir_ready" : "webui_safe_output_dir_blocked");
  reasonCodes.push("webui_generation_not_attempted");

  return {
    gpuStatus,
    gpuSummary: gpuStatus === "available" ? "local_gpu_available" : "local_gpu_unavailable",
    ollamaStatus,
    ollamaModelSummary: [...new Set(ollamaModelSummary)],
    webuiStatus,
    webuiModelStatus,
    webuiModelSummary: [...new Set(webuiModelSummary)],
    webuiPythonRuntimeStatus,
    outputDirectoryStatus,
    safeOutputDirRef,
    generationAttempted: false,
    reasonCodes: uniqueReasonCodes(reasonCodes)
  };
}

export function decideV40WebUiAkiSmoke(input: V40WebUiAkiProbeInput): V40WebUiAkiSmokeDecision {
  const readiness = createV40WebUiAkiReadiness(input);
  const scanTarget = { readiness };
  const claimScan = runV40WebUiClaimScan(scanTarget);
  const securityScan = runV40WebUiSecurityScan(scanTarget);
  const scanPassed = claimScan.status === "passed" && securityScan.status === "passed";
  const requiredToolsReady =
    readiness.gpuStatus === "available"
    && readiness.webuiStatus === "api_ready"
    && readiness.webuiModelStatus === "available"
    && readiness.outputDirectoryStatus === "ready"
    && readiness.ollamaStatus !== "unavailable";

  let decision: V40WebUiPhaseDecision = "blocked";
  const reasonCodes: V40WebUiReasonCode[] = [...readiness.reasonCodes];
  if (!scanPassed) {
    decision = "failed";
    reasonCodes.push("v40_1a_smoke_failed");
    if (securityScan.hits.includes("raw_path_leak_detected")) reasonCodes.push("raw_path_leak_detected");
    if (securityScan.hits.includes("sensitive_value_leak_detected")) reasonCodes.push("sensitive_value_leak_detected");
  } else if (requiredToolsReady) {
    decision = "passed scoped";
    reasonCodes.push("v40_1a_smoke_passed_scoped");
  } else {
    decision = "blocked";
    reasonCodes.push("v40_1a_smoke_blocked");
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
