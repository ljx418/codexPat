export const V40_TARGET_ACTION_IDS = ["idle", "walk", "jump", "sleep", "eat", "play", "alert", "celebrate"] as const;

export type V40TargetActionId = (typeof V40_TARGET_ACTION_IDS)[number];
export type V40GpuStatus = "available" | "unavailable" | "unknown";
export type V40OllamaStatus = "available" | "unavailable" | "blocked";
export type V40ComfyStatus = "api_ready" | "cli_ready" | "unavailable" | "blocked";
export type V40ComfyMode = "api" | "cli" | "none";
export type V40PhaseDecision = "passed scoped" | "blocked" | "failed";

export type V40ReasonCode =
  | "gpu_available"
  | "gpu_unavailable"
  | "ollama_available"
  | "ollama_unavailable"
  | "ollama_not_required"
  | "comfy_api_ready"
  | "comfy_cli_ready"
  | "comfy_api_unavailable"
  | "comfy_cli_unavailable"
  | "comfy_install_detected_but_not_scriptable"
  | "workflow_missing"
  | "unsafe_model_reference"
  | "raw_prompt_leak_detected"
  | "raw_path_leak_detected"
  | "sensitive_value_leak_detected"
  | "tool_smoke_passed_scoped"
  | "tool_smoke_blocked"
  | "tool_smoke_failed";

export type V40LocalToolProbeInput = {
  gpuName?: string | null;
  gpuMemoryMiB?: number | null;
  ollamaModels?: string[];
  ollamaOptional?: boolean;
  comfyApiReachable?: boolean;
  comfyCliAvailable?: boolean;
  comfyInstallDetected?: boolean;
};

export type V40LocalToolReadiness = {
  gpuStatus: V40GpuStatus;
  gpuSummary: string;
  ollamaStatus: V40OllamaStatus;
  ollamaModelSummary: string[];
  comfyStatus: V40ComfyStatus;
  comfyMode: V40ComfyMode;
  reasonCodes: V40ReasonCode[];
};

export type V40ScanResult = {
  status: "passed" | "failed";
  hits: string[];
};

export type V40ToolSmokeDecision = {
  ok: boolean;
  phase: "V40.1";
  decision: V40PhaseDecision;
  readiness: V40LocalToolReadiness;
  reasonCodes: V40ReasonCode[];
  claimScanStatus: V40ScanResult["status"];
  securityScanStatus: V40ScanResult["status"];
};

const SAFE_MODEL_NAME_PATTERN = /^[A-Za-z0-9._:-]{1,80}$/;
const RAW_PATH_PATTERN =
  /\b[A-Za-z]:[\\/]|(?:^|[\s"'`])\/(?:mnt|home|Users|private|Volumes|workspace|tmp)\/|file:\/\/|\\\\[A-Za-z0-9_.-]+\\/i;
const SENSITIVE_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|token\s*[:=]|raw prompt|raw workflow|raw payload|raw photo bytes|EXIF|GPS|latitude|longitude|workspace path|config path|credential path|terminal title|sk-[A-Za-z0-9_-]{8,})\b/i;
const POSITIVE_FORBIDDEN_CLAIM_PATTERN =
  /\b(?:Petdex parity achieved|automatic photo-to-animation ready|automatic photo-to-2D ready|provider integration verified|Route B verified|3D ready|production signed release ready|Windows ready|cross-platform ready|MCP ready|Claude Code integration verified|OS-level Codex window binding ready|all Codex workflows verified)\b/i;

function uniqueReasonCodes(codes: V40ReasonCode[]): V40ReasonCode[] {
  return [...new Set(codes)];
}

export function sanitizeV40OllamaModelName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || RAW_PATH_PATTERN.test(trimmed) || !SAFE_MODEL_NAME_PATTERN.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function v40HasForbiddenContent(value: unknown): boolean {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return RAW_PATH_PATTERN.test(text) || SENSITIVE_PATTERN.test(text);
}

export function runV40SecurityScan(value: unknown): V40ScanResult {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const hits: string[] = [];
  if (RAW_PATH_PATTERN.test(text)) hits.push("raw_path_leak_detected");
  if (SENSITIVE_PATTERN.test(text)) hits.push("sensitive_value_leak_detected");
  return { status: hits.length === 0 ? "passed" : "failed", hits };
}

export function runV40ClaimScan(value: unknown): V40ScanResult {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const hits = POSITIVE_FORBIDDEN_CLAIM_PATTERN.test(text) ? ["positive_forbidden_ready_claim"] : [];
  return { status: hits.length === 0 ? "passed" : "failed", hits };
}

export function createV40LocalToolReadiness(input: V40LocalToolProbeInput): V40LocalToolReadiness {
  const reasonCodes: V40ReasonCode[] = [];
  const gpuStatus: V40GpuStatus = input.gpuName && input.gpuMemoryMiB && input.gpuMemoryMiB > 0 ? "available" : "unavailable";
  if (gpuStatus === "available") {
    reasonCodes.push("gpu_available");
  } else {
    reasonCodes.push("gpu_unavailable");
  }

  const sanitizedModels: string[] = [];
  let unsafeModelReference = false;
  for (const model of input.ollamaModels ?? []) {
    const sanitized = sanitizeV40OllamaModelName(model);
    if (sanitized) {
      sanitizedModels.push(sanitized);
    } else {
      unsafeModelReference = true;
    }
  }
  if (unsafeModelReference) reasonCodes.push("unsafe_model_reference");

  const ollamaStatus: V40OllamaStatus = sanitizedModels.length > 0 ? "available" : input.ollamaOptional ? "blocked" : "unavailable";
  if (ollamaStatus === "available") {
    reasonCodes.push("ollama_available");
  } else if (input.ollamaOptional) {
    reasonCodes.push("ollama_not_required");
  } else {
    reasonCodes.push("ollama_unavailable");
  }

  let comfyStatus: V40ComfyStatus = "unavailable";
  let comfyMode: V40ComfyMode = "none";
  if (input.comfyApiReachable) {
    comfyStatus = "api_ready";
    comfyMode = "api";
    reasonCodes.push("comfy_api_ready");
  } else if (input.comfyCliAvailable) {
    comfyStatus = "cli_ready";
    comfyMode = "cli";
    reasonCodes.push("comfy_cli_ready");
  } else if (input.comfyInstallDetected) {
    comfyStatus = "blocked";
    reasonCodes.push("comfy_api_unavailable", "comfy_cli_unavailable", "comfy_install_detected_but_not_scriptable");
  } else {
    reasonCodes.push("comfy_api_unavailable", "comfy_cli_unavailable", "workflow_missing");
  }

  return {
    gpuStatus,
    gpuSummary: gpuStatus === "available" ? "local_gpu_available" : "local_gpu_unavailable",
    ollamaStatus,
    ollamaModelSummary: sanitizedModels,
    comfyStatus,
    comfyMode,
    reasonCodes: uniqueReasonCodes(reasonCodes)
  };
}

export function decideV40LocalToolSmoke(input: V40LocalToolProbeInput): V40ToolSmokeDecision {
  const readiness = createV40LocalToolReadiness(input);
  const scanTarget = { readiness };
  const claimScan = runV40ClaimScan(scanTarget);
  const securityScan = runV40SecurityScan(scanTarget);

  const toolChainScriptable =
    readiness.gpuStatus === "available"
    && (readiness.ollamaStatus === "available" || readiness.reasonCodes.includes("ollama_not_required"))
    && (readiness.comfyStatus === "api_ready" || readiness.comfyStatus === "cli_ready");
  const scanPassed = claimScan.status === "passed" && securityScan.status === "passed";

  let decision: V40PhaseDecision = "blocked";
  const reasonCodes: V40ReasonCode[] = [...readiness.reasonCodes];
  if (!scanPassed) {
    decision = "failed";
    if (claimScan.status === "failed") reasonCodes.push("tool_smoke_failed");
    if (securityScan.hits.includes("raw_path_leak_detected")) reasonCodes.push("raw_path_leak_detected");
    if (securityScan.hits.includes("sensitive_value_leak_detected")) reasonCodes.push("sensitive_value_leak_detected");
  } else if (toolChainScriptable) {
    decision = "passed scoped";
    reasonCodes.push("tool_smoke_passed_scoped");
  } else {
    decision = "blocked";
    reasonCodes.push("tool_smoke_blocked");
  }

  return {
    ok: decision === "passed scoped",
    phase: "V40.1",
    decision,
    readiness,
    reasonCodes: uniqueReasonCodes(reasonCodes),
    claimScanStatus: claimScan.status,
    securityScanStatus: securityScan.status
  };
}
