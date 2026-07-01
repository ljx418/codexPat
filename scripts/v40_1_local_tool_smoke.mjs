import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  decideV40LocalToolSmoke,
  runV40ClaimScan,
  runV40SecurityScan
} from "../apps/desktop/src/assets/v40-local-hybrid-generation.ts";

const v40Date = "2026-06-27";
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");

function safeExec(file, args, timeout = 3000) {
  try {
    return {
      ok: true,
      stdout: execFileSync(file, args, {
        cwd: repoRoot,
        encoding: "utf8",
        timeout,
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"]
      })
    };
  } catch {
    return { ok: false, stdout: "" };
  }
}

function probeGpu() {
  const result = safeExec("nvidia-smi", ["--query-gpu=name,memory.total", "--format=csv,noheader"], 3000);
  if (!result.ok) return {};
  const firstLine = result.stdout.split(/\r?\n/).find(Boolean);
  if (!firstLine) return {};
  const [rawName, rawMemory] = firstLine.split(",").map((part) => part.trim());
  const memory = Number.parseInt(rawMemory.replace(/[^0-9]/g, ""), 10);
  return {
    gpuName: rawName ? "local_gpu_detected" : null,
    gpuMemoryMiB: Number.isFinite(memory) ? memory : null
  };
}

function probeOllama() {
  const candidates = [
    { file: "ollama", args: ["list"] },
    {
      file: path.join("/mnt", "c", "Users", "Administrator", "AppData", "Local", "Programs", "Ollama", "ollama.exe"),
      args: ["list"]
    }
  ];
  for (const candidate of candidates) {
    const result = safeExec(candidate.file, candidate.args, 5000);
    if (!result.ok) continue;
    const models = result.stdout
      .split(/\r?\n/)
      .slice(1)
      .map((line) => line.trim().split(/\s+/)[0])
      .filter(Boolean);
    return { ollamaModels: models };
  }
  return { ollamaModels: [] };
}

async function probeComfyApi() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);
  try {
    const response = await fetch("http://127.0.0.1:8188/system_stats", { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function probeComfyCli() {
  const result = safeExec("bash", ["-lc", "command -v comfy >/dev/null 2>&1 || command -v comfyui >/dev/null 2>&1 || command -v comfy-cli >/dev/null 2>&1"], 2000);
  return result.ok;
}

function probeComfyInstall() {
  const comfyRoot = path.join("/mnt", "c", "ComfyUI-aki-v2", "ComfyUI");
  return fs.existsSync(path.join(comfyRoot, "main.py"))
    && fs.existsSync(path.join(comfyRoot, "script_examples", "basic_api_example.py"));
}

function writeEvidence(relPath, body) {
  const absPath = path.join(repoRoot, relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, `${body.trimEnd()}\n`, "utf8");
  return relPath.replaceAll("\\", "/");
}

const gpu = probeGpu();
const ollama = probeOllama();
const comfyApiReachable = await probeComfyApi();
const comfyCliAvailable = probeComfyCli();
const comfyInstallDetected = probeComfyInstall();
const decision = decideV40LocalToolSmoke({
  ...gpu,
  ...ollama,
  comfyApiReachable,
  comfyCliAvailable,
  comfyInstallDetected
});

const safeEvidenceSummary = {
  phase: decision.phase,
  decision: decision.decision,
  gpuStatus: decision.readiness.gpuStatus,
  gpuSummary: decision.readiness.gpuSummary,
  ollamaStatus: decision.readiness.ollamaStatus,
  ollamaModelSummary: decision.readiness.ollamaModelSummary,
  comfyStatus: decision.readiness.comfyStatus,
  comfyMode: decision.readiness.comfyMode,
  comfyInstallDetected,
  reasonCodes: decision.reasonCodes
};
const claimScan = runV40ClaimScan(safeEvidenceSummary);
const securityScan = runV40SecurityScan(safeEvidenceSummary);
const finalDecision = claimScan.status === "passed" && securityScan.status === "passed" ? decision.decision : "failed";
const finalReasonCodes = [...new Set([
  ...decision.reasonCodes,
  ...(claimScan.status === "passed" ? [] : ["tool_smoke_failed"]),
  ...(securityScan.hits.includes("raw_path_leak_detected") ? ["raw_path_leak_detected"] : []),
  ...(securityScan.hits.includes("sensitive_value_leak_detected") ? ["sensitive_value_leak_detected"] : [])
])];

const evidenceBody = [
  "# V40.1 Local Tool Smoke Evidence",
  "",
  `Date: ${v40Date}`,
  "",
  "## Development And Acceptance Plan",
  "- Phase: V40.1 local tool smoke.",
  "- Controlling PRD: docs/active/agent_desktop_pet_prd_v40.md.",
  "- Phase spec: docs/V40.x/v40-phase-specs.md.",
  "- Objective: verify whether the local hybrid tool route is scriptable before any candidate generation phase.",
  "",
  "## PRD / Spec Review",
  "- V40 target remains local hybrid candidate generation followed by normalization, same-sample V39 comparison, product preview, target-only apply, rollback, visual evidence, and scans.",
  "- V40.1 does not prove generation quality, product path readiness, or final asset acceptance.",
  "- V39 remains the quality baseline and fallback.",
  "",
  "## Real Tool Probe Summary",
  `- GPU status: ${safeEvidenceSummary.gpuStatus}.`,
  `- GPU summary: ${safeEvidenceSummary.gpuSummary}.`,
  `- Ollama status: ${safeEvidenceSummary.ollamaStatus}.`,
  `- Ollama model summary: ${safeEvidenceSummary.ollamaModelSummary.length === 0 ? "none" : safeEvidenceSummary.ollamaModelSummary.join(", ")}.`,
  `- Comfy status: ${safeEvidenceSummary.comfyStatus}.`,
  `- Comfy mode: ${safeEvidenceSummary.comfyMode}.`,
  `- Comfy local install indicator: ${safeEvidenceSummary.comfyInstallDetected ? "detected" : "not_detected"}.`,
  `- Reason codes: ${finalReasonCodes.join(", ")}.`,
  "",
  "## User-Visible Impact",
  "- If this phase is blocked, V40 cannot honestly continue to automated local candidate generation.",
  "- A blocked result still reduces risk by proving which local boundary must be fixed before asset generation.",
  "",
  "## Claim Scan",
  `- Status: ${claimScan.status}.`,
  `- Hits: ${claimScan.hits.length === 0 ? "none" : claimScan.hits.join(", ")}.`,
  "",
  "## Security Scan",
  `- Status: ${securityScan.status}.`,
  `- Hits: ${securityScan.hits.length === 0 ? "none" : securityScan.hits.join(", ")}.`,
  "",
  "## Decision",
  `- Status: ${finalDecision}.`,
  "- Next phase: V40.2 may start only if V40.1 passed, or if the route is explicitly narrowed to an accepted import/manual route.",
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V40.x/evidence/v40_1-local-tool-smoke-${v40Date}.md`, evidenceBody);
console.log(JSON.stringify({
  ok: finalDecision === "passed scoped",
  phase: "V40.1",
  decision: finalDecision,
  evidencePath,
  reasonCodes: finalReasonCodes,
  claimScanStatus: claimScan.status,
  securityScanStatus: securityScan.status
}, null, 2));
