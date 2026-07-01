import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  decideV40WebUiAkiSmoke,
  runV40WebUiClaimScan,
  runV40WebUiSecurityScan,
  sanitizeV40WebUiSafeName
} from "../apps/desktop/src/assets/v40-webui-aki-smoke.ts";

const v40Date = "2026-06-29";
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const safeOutputDirRef = "docs/V40.x/evidence/assets/v40-webui-candidates";
const webUiRoot = path.join("/mnt", "c", "App-webui-aki-v4.10", "sd-webui-aki-v4.10");
const webUiApiBaseUrl = process.env.V40_WEBUI_AKI_API_URL ?? "http://127.0.0.1:7860";

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
      .filter(Boolean)
      .map((name) => sanitizeV40WebUiSafeName(name))
      .filter(Boolean);
    return { ollamaModels: models };
  }
  return { ollamaModels: [] };
}

async function fetchJsonIfReachable(url, timeout = 1800) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return { ok: false, value: null };
    return { ok: true, value: await response.json() };
  } catch {
    return { ok: false, value: null };
  } finally {
    clearTimeout(timer);
  }
}

async function probeWebUiApi() {
  const modelsEndpoint = `${webUiApiBaseUrl.replace(/\/$/, "")}/sdapi/v1/sd-models`;
  const result = await fetchJsonIfReachable(modelsEndpoint);
  if (!result.ok || !Array.isArray(result.value)) {
    return { webuiApiReachable: false, webuiApiModelNames: [] };
  }
  const modelNames = result.value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      return sanitizeV40WebUiSafeName(String(item.model_name ?? item.title ?? ""));
    })
    .filter(Boolean);
  return { webuiApiReachable: true, webuiApiModelNames: modelNames };
}

function probeWebUiPythonRuntimeCompatible() {
  const result = safeExec(path.join(webUiRoot, "venv", "Scripts", "python.exe"), ["--version"], 2000);
  if (!result.ok) return null;
  const match = result.stdout.match(/Python\s+(\d+)\.(\d+)\./);
  if (!match) return null;
  return match[1] === "3" && match[2] === "10";
}

function probeLocalCheckpointNames() {
  const stableDiffusionDirs = [
    path.join(webUiRoot, "models", "Stable-diffusion")
  ];
  const names = [];
  const visit = (dir, depth) => {
    if (depth > 2) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const child = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(child, depth + 1);
        continue;
      }
      if (!entry.isFile() || !/\.(?:safetensors|ckpt)$/i.test(entry.name)) continue;
      const safeName = sanitizeV40WebUiSafeName(entry.name);
      if (safeName) names.push(safeName);
    }
  };
  for (const dir of stableDiffusionDirs) {
    try {
      visit(dir, 0);
    } catch {
      // Missing local install is represented by an empty model list.
    }
  }
  return [...new Set(names)];
}

function writeEvidence(relPath, body) {
  const absPath = path.join(repoRoot, relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, `${body.trimEnd()}\n`, "utf8");
  return relPath.replaceAll("\\", "/");
}

fs.mkdirSync(path.join(repoRoot, safeOutputDirRef), { recursive: true });

const gpu = probeGpu();
const ollama = probeOllama();
const webuiApi = await probeWebUiApi();
const webuiPythonRuntimeCompatible = probeWebUiPythonRuntimeCompatible();
const localCheckpointNames = probeLocalCheckpointNames();

const decision = decideV40WebUiAkiSmoke({
  ...gpu,
  ...ollama,
  ...webuiApi,
  webuiPythonRuntimeCompatible,
  localCheckpointNames,
  safeOutputDirRef
});

const safeEvidenceSummary = {
  phase: decision.phase,
  decision: decision.decision,
  gpuStatus: decision.readiness.gpuStatus,
  gpuSummary: decision.readiness.gpuSummary,
  ollamaStatus: decision.readiness.ollamaStatus,
  ollamaModelSummary: decision.readiness.ollamaModelSummary,
  webuiStatus: decision.readiness.webuiStatus,
  webuiModelStatus: decision.readiness.webuiModelStatus,
  webuiModelSummary: decision.readiness.webuiModelSummary,
  webuiPythonRuntimeStatus: decision.readiness.webuiPythonRuntimeStatus,
  outputDirectoryStatus: decision.readiness.outputDirectoryStatus,
  safeOutputDirRef: decision.readiness.safeOutputDirRef,
  generationAttempted: decision.readiness.generationAttempted,
  reasonCodes: decision.reasonCodes
};
const claimScan = runV40WebUiClaimScan(safeEvidenceSummary);
const securityScan = runV40WebUiSecurityScan(safeEvidenceSummary);
const finalDecision = claimScan.status === "passed" && securityScan.status === "passed" ? decision.decision : "failed";
const finalReasonCodes = [...new Set([
  ...decision.reasonCodes,
  ...(claimScan.status === "passed" ? [] : ["v40_1a_smoke_failed"]),
  ...(securityScan.hits.includes("raw_path_leak_detected") ? ["raw_path_leak_detected"] : []),
  ...(securityScan.hits.includes("sensitive_value_leak_detected") ? ["sensitive_value_leak_detected"] : [])
])];

const evidenceBody = [
  "# V40.1A WebUI Aki Smoke Evidence",
  "",
  `Date: ${v40Date}`,
  "",
  "## Development And Acceptance Plan",
  "- Phase: V40.1A WebUI Aki smoke.",
  "- Controlling PRD: docs/active/agent_desktop_pet_prd_v40.md.",
  "- Phase spec: docs/V40.x/v40-phase-specs.md.",
  "- Objective: verify the scriptable WebUI Aki API/model boundary before any candidate generation or quality claim.",
  "- Audit opinion before implementation: no fatal or major specification deviation; this phase must stop as blocked if WebUI API is unavailable.",
  "",
  "## PRD / Spec Review",
  "- V40 active route is no-Comfy WebUI Aki candidate generation with V39 same-sample comparison and product gates.",
  "- This phase does not generate image candidates and does not prove asset quality.",
  "- Ollama is advisory only and cannot approve assets.",
  "- ComfyUI remains a historical blocked route, not an active V40 dependency.",
  "- V39 A2++ remains baseline and fallback.",
  "",
  "## Real Tool Probe Summary",
  `- GPU status: ${safeEvidenceSummary.gpuStatus}.`,
  `- GPU summary: ${safeEvidenceSummary.gpuSummary}.`,
  `- Ollama status: ${safeEvidenceSummary.ollamaStatus}.`,
  `- Ollama model summary: ${safeEvidenceSummary.ollamaModelSummary.length === 0 ? "none" : safeEvidenceSummary.ollamaModelSummary.join(", ")}.`,
  `- WebUI API status: ${safeEvidenceSummary.webuiStatus}.`,
  `- WebUI model status: ${safeEvidenceSummary.webuiModelStatus}.`,
  `- WebUI model summary: ${safeEvidenceSummary.webuiModelSummary.length === 0 ? "none" : safeEvidenceSummary.webuiModelSummary.join(", ")}.`,
  `- WebUI Python runtime status: ${safeEvidenceSummary.webuiPythonRuntimeStatus}.`,
  `- Safe output directory contract: ${safeEvidenceSummary.outputDirectoryStatus}.`,
  `- Safe output directory reference: ${safeEvidenceSummary.safeOutputDirRef ?? "none"}.`,
  `- Generation attempted: ${safeEvidenceSummary.generationAttempted}.`,
  `- Reason codes: ${finalReasonCodes.join(", ")}.`,
  "",
  "## User-Visible Impact",
  "- If blocked, users still cannot expect V40 WebUI-generated high-quality action assets.",
  "- Later candidate generation may start only after WebUI API/model smoke passes or the route is explicitly narrowed to accepted manual/import assets.",
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
  "- Next phase: V40.2 may start only if this phase passed scoped, or if the route is explicitly narrowed to accepted import/manual assets.",
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V40.x/evidence/v40_1a-webui-aki-smoke-${v40Date}.md`, evidenceBody);
console.log(JSON.stringify({
  ok: finalDecision === "passed scoped",
  phase: "V40.1A",
  decision: finalDecision,
  evidencePath,
  reasonCodes: finalReasonCodes,
  claimScanStatus: claimScan.status,
  securityScanStatus: securityScan.status
}, null, 2));
