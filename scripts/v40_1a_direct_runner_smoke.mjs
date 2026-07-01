import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  decideV40DirectRunnerSmoke,
  runV40DirectRunnerClaimScan,
  runV40DirectRunnerSecurityScan,
  sanitizeV40DirectSafeName
} from "../apps/desktop/src/assets/v40-direct-local-runner.ts";

const v40Date = "2026-06-29";
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");

function safeExec(command, args, options = {}) {
  try {
    return {
      ok: true,
      stdout: execFileSync(command, args, {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: options.timeout ?? 10000
      }).trim()
    };
  } catch (error) {
    return { ok: false, stdout: "" };
  }
}

function probeGpu() {
  const result = safeExec("nvidia-smi", ["--query-gpu=name,memory.total", "--format=csv,noheader"], { timeout: 10000 });
  if (!result.ok || !result.stdout) return { gpuName: null, gpuMemoryMiB: null };
  const [name, memory] = result.stdout.split("\n")[0].split(",").map((item) => item.trim());
  const memoryMatch = memory?.match(/(\d+)/);
  return {
    gpuName: name || null,
    gpuMemoryMiB: memoryMatch ? Number(memoryMatch[1]) : null
  };
}

function probePythonDependencies() {
  const pythonCandidates = [
    path.join(repoRoot, ".v40-runner-venv", "bin", "python"),
    "python3"
  ];
  const script = [
    "mods=['torch','diffusers','transformers','safetensors','PIL','numpy']",
    "for m in mods:",
    "    try:",
    "        __import__(m)",
    "        print(f'{m}=available')",
    "    except Exception:",
    "        print(f'{m}=missing')"
  ].join("\n");
  let result = { ok: false, stdout: "" };
  for (const pythonBin of pythonCandidates) {
    result = safeExec(pythonBin, ["-c", script], { timeout: 60000 });
    if (result.ok) break;
  }
  const summary = {};
  if (!result.ok) {
    return { pythonAvailable: false, summary };
  }
  for (const line of result.stdout.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_]+)=(available|missing)$/);
    if (match) summary[match[1]] = match[2];
  }
  return { pythonAvailable: true, summary };
}

function probeLocalModelNames() {
  const candidateRoots = [
    path.join("/mnt", "c", "App-webui-aki-v4.10", "sd-webui-aki-v4.10", "models", "Stable-diffusion"),
    path.join(repoRoot, "models"),
    path.join(repoRoot, "docs", "V40.x", "model-candidates")
  ];
  const names = [];
  for (const root of candidateRoots) {
    if (!fs.existsSync(root)) continue;
    const stack = [root];
    while (stack.length > 0 && names.length < 8) {
      const current = stack.pop();
      if (!current) continue;
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const entryPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          stack.push(entryPath);
        } else if (/\.(?:safetensors|ckpt|pt|pth)$/i.test(entry.name)) {
          const safeName = sanitizeV40DirectSafeName(entry.name);
          if (safeName) names.push(safeName);
        }
      }
    }
  }
  return [...new Set(names)];
}

function probeOllamaModels() {
  const result = safeExec("cmd.exe", ["/c", "ollama list"], { timeout: 10000 });
  if (!result.ok || !result.stdout) return [];
  return result.stdout
    .split(/\r?\n/)
    .slice(1)
    .map((line) => sanitizeV40DirectSafeName(line.trim().split(/\s+/)[0] ?? ""))
    .filter(Boolean)
    .slice(0, 8);
}

function writeEvidence(relPath, body) {
  const absPath = path.join(repoRoot, relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, `${body.trimEnd()}\n`, "utf8");
  return relPath.replaceAll("\\", "/");
}

const safeOutputDirRef = "docs/V40.x/evidence/assets/v40-direct-runner-candidates";
fs.mkdirSync(path.join(repoRoot, safeOutputDirRef), { recursive: true });

const gpu = probeGpu();
const dependencies = probePythonDependencies();
const localModelNames = probeLocalModelNames();
const ollamaModels = probeOllamaModels();

const decision = decideV40DirectRunnerSmoke({
  gpuName: gpu.gpuName,
  gpuMemoryMiB: gpu.gpuMemoryMiB,
  pythonAvailable: dependencies.pythonAvailable,
  dependencySummary: dependencies.summary,
  localModelNames,
  safeOutputDirRef,
  ollamaModels,
  ollamaRequired: false
});

const evidenceSummary = {
  phase: decision.phase,
  decision: decision.decision,
  gpuStatus: decision.readiness.gpuStatus,
  gpuSummary: decision.readiness.gpuSummary,
  dependencySummary: decision.readiness.dependencySummary,
  directRunnerStatus: decision.readiness.directRunnerStatus,
  directModelSummary: decision.readiness.directModelSummary,
  outputDirectoryStatus: decision.readiness.outputDirectoryStatus,
  safeOutputDirRef: decision.readiness.safeOutputDirRef,
  ollamaStatus: decision.readiness.ollamaStatus,
  ollamaModelSummary: decision.readiness.ollamaModelSummary,
  generationAttempted: decision.readiness.generationAttempted,
  reasonCodes: decision.reasonCodes
};

const claimScan = runV40DirectRunnerClaimScan(evidenceSummary);
const securityScan = runV40DirectRunnerSecurityScan(evidenceSummary);
const ok = decision.ok && claimScan.status === "passed" && securityScan.status === "passed";

const body = [
  "# V40.1A Direct Local Runner Smoke Evidence",
  "",
  `Date: ${v40Date}`,
  "",
  "## Development And Acceptance Plan",
  "- Phase: V40.1A Direct Local Runner smoke.",
  "- Controlling PRD: docs/active/agent_desktop_pet_prd_v40.md.",
  "- Phase spec: docs/V40.x/v40-phase-specs.md.",
  "- Pre-development audit: docs/V40.x/evidence/v40_1a-direct-runner-predev-audit-2026-06-29.md.",
  "- Development scope: verify no-WebUI direct runner dependency, local model, safe output, GPU, and Ollama advisory boundaries.",
  "- Out of scope: image generation, action packaging, product apply, WebUI, ComfyUI, provider integration, production readiness.",
  "",
  "## PRD / Spec Review",
  "- V40 active PRD reviewed.",
  "- V40 target architecture reviewed.",
  "- V40 implementation contract reviewed.",
  "- Boundary: no WebUI or ComfyUI active runtime dependency.",
  "- Boundary: this phase cannot claim high-quality generated 2D action assets.",
  "",
  "## Real Command Results",
  `- GPU status: ${decision.readiness.gpuStatus}.`,
  `- GPU summary: ${decision.readiness.gpuSummary}.`,
  `- Python status: ${decision.readiness.dependencySummary.python}.`,
  `- Required dependency summary: torch=${decision.readiness.dependencySummary.torch}, diffusers=${decision.readiness.dependencySummary.diffusers}, transformers=${decision.readiness.dependencySummary.transformers}, safetensors=${decision.readiness.dependencySummary.safetensors}, PIL=${decision.readiness.dependencySummary.PIL}, numpy=${decision.readiness.dependencySummary.numpy}.`,
  `- Direct model summary: ${decision.readiness.directModelSummary.length === 0 ? "none" : decision.readiness.directModelSummary.join(", ")}.`,
  `- Safe output directory status: ${decision.readiness.outputDirectoryStatus}.`,
  `- Safe output directory ref: ${decision.readiness.safeOutputDirRef ?? "none"}.`,
  `- Ollama status: ${decision.readiness.ollamaStatus}.`,
  `- Ollama model summary: ${decision.readiness.ollamaModelSummary.length === 0 ? "none" : decision.readiness.ollamaModelSummary.join(", ")}.`,
  `- Generation attempted: ${decision.readiness.generationAttempted}.`,
  "",
  "## User-Visible Impact",
  "- Users still cannot expect V40 no-WebUI generated action assets from this phase.",
  "- The project now has a scoped, sanitized direct-runner readiness gate.",
  "- Later candidate generation remains blocked unless missing direct-model dependencies are installed in a project-controlled environment.",
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
  `- Status: ${ok ? "passed scoped" : decision.decision}.`,
  `- Reason codes: ${decision.reasonCodes.join(", ")}.`,
  "",
  "## Next Phase Gate",
  "- V40.2 is No-Go until V40.1A passes or the route is explicitly narrowed to accepted manual/import assets.",
  "- Current evidence does not satisfy V40.2 entry criteria if the decision is blocked.",
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V40.x/evidence/v40_1a-direct-runner-smoke-${v40Date}.md`, body);
console.log(JSON.stringify({
  ok,
  phase: "V40.1A",
  decision: ok ? "passed scoped" : decision.decision,
  evidencePath,
  reasonCodes: decision.reasonCodes,
  claimScanStatus: claimScan.status,
  securityScanStatus: securityScan.status
}, null, 2));

if (!ok) process.exitCode = 1;
