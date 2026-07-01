import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createV40LocalToolReadiness,
  decideV40LocalToolSmoke,
  runV40ClaimScan,
  runV40SecurityScan,
  sanitizeV40OllamaModelName,
  v40HasForbiddenContent
} from "./v40-local-hybrid-generation";

describe("V40 local hybrid generation tool smoke", () => {
  it("passes scoped only when GPU, Ollama, and scriptable Comfy boundary are available", () => {
    const result = decideV40LocalToolSmoke({
      gpuName: "NVIDIA GeForce RTX 4090",
      gpuMemoryMiB: 24564,
      ollamaModels: ["gemma4:26b"],
      comfyApiReachable: true
    });

    assert.equal(result.decision, "passed scoped");
    assert.equal(result.ok, true);
    assert.equal(result.readiness.comfyStatus, "api_ready");
    assert.equal(result.reasonCodes.includes("tool_smoke_passed_scoped"), true);
  });

  it("blocks when ComfyUI is installed but not scriptable from the repo environment", () => {
    const result = decideV40LocalToolSmoke({
      gpuName: "NVIDIA GeForce RTX 4090",
      gpuMemoryMiB: 24564,
      ollamaModels: ["gemma4:26b"],
      comfyInstallDetected: true
    });

    assert.equal(result.decision, "blocked");
    assert.equal(result.ok, false);
    assert.equal(result.readiness.comfyStatus, "blocked");
    assert.equal(result.reasonCodes.includes("comfy_install_detected_but_not_scriptable"), true);
  });

  it("blocks if the local GPU cannot be summarized", () => {
    const result = decideV40LocalToolSmoke({
      ollamaModels: ["gemma4:26b"],
      comfyApiReachable: true
    });

    assert.equal(result.decision, "blocked");
    assert.equal(result.reasonCodes.includes("gpu_unavailable"), true);
  });

  it("keeps model summaries safe and rejects path-like references", () => {
    assert.equal(sanitizeV40OllamaModelName("gemma4:26b"), "gemma4:26b");
    assert.equal(sanitizeV40OllamaModelName("C:\\models\\cat.safetensors"), null);

    const readiness = createV40LocalToolReadiness({
      gpuName: "NVIDIA GeForce RTX 4090",
      gpuMemoryMiB: 24564,
      ollamaModels: ["gemma4:26b", "C:\\models\\cat.safetensors"],
      comfyCliAvailable: true
    });

    assert.deepEqual(readiness.ollamaModelSummary, ["gemma4:26b"]);
    assert.equal(readiness.reasonCodes.includes("unsafe_model_reference"), true);
  });

  it("detects sensitive values and positive forbidden ready claims", () => {
    assert.equal(v40HasForbiddenContent("Authorization: Bearer secret-value"), true);
    assert.equal(runV40SecurityScan("use relative refs only").status, "passed");
    assert.equal(runV40SecurityScan("C:\\Users\\name\\asset.png").status, "failed");
    assert.equal(runV40ClaimScan("V40 tool smoke blocked; no production claim").status, "passed");
    assert.equal(runV40ClaimScan("Petdex parity achieved").status, "failed");
  });
});
