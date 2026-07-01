import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createV40WebUiAkiReadiness,
  decideV40WebUiAkiSmoke,
  runV40WebUiClaimScan,
  runV40WebUiSecurityScan,
  sanitizeV40WebUiRelativeRef,
  sanitizeV40WebUiSafeName
} from "./v40-webui-aki-smoke";

describe("V40.1A WebUI Aki smoke", () => {
  it("passes scoped only when GPU, WebUI API, model, and safe output directory are ready", () => {
    const decision = decideV40WebUiAkiSmoke({
      gpuName: "NVIDIA GeForce RTX 4090",
      gpuMemoryMiB: 24564,
      ollamaModels: ["gemma4:26b"],
      webuiApiReachable: true,
      webuiApiModelNames: ["anything-v5.safetensors"],
      webuiPythonRuntimeCompatible: true,
      safeOutputDirRef: "docs/V40.x/evidence/assets/v40-webui-candidates"
    });

    assert.equal(decision.decision, "passed scoped");
    assert.equal(decision.ok, true);
    assert.equal(decision.readiness.webuiStatus, "api_ready");
    assert.equal(decision.readiness.generationAttempted, false);
    assert.equal(decision.reasonCodes.includes("v40_1a_smoke_passed_scoped"), true);
  });

  it("blocks when WebUI API is unavailable even if a local checkpoint exists", () => {
    const decision = decideV40WebUiAkiSmoke({
      gpuName: "NVIDIA GeForce RTX 4090",
      gpuMemoryMiB: 24564,
      ollamaModels: ["gemma4:26b"],
      webuiApiReachable: false,
      localCheckpointNames: ["anything-v5.safetensors"],
      webuiPythonRuntimeCompatible: false,
      safeOutputDirRef: "docs/V40.x/evidence/assets/v40-webui-candidates"
    });

    assert.equal(decision.decision, "blocked");
    assert.equal(decision.ok, false);
    assert.equal(decision.readiness.webuiStatus, "unavailable");
    assert.equal(decision.readiness.webuiModelStatus, "available");
    assert.equal(decision.readiness.webuiPythonRuntimeStatus, "incompatible");
    assert.equal(decision.reasonCodes.includes("webui_api_unavailable"), true);
    assert.equal(decision.reasonCodes.includes("webui_python_runtime_incompatible"), true);
  });

  it("treats Ollama as advisory unless required for the smoke", () => {
    const optional = createV40WebUiAkiReadiness({
      gpuName: "NVIDIA GeForce RTX 4090",
      gpuMemoryMiB: 24564,
      webuiApiReachable: true,
      webuiApiModelNames: ["anything-v5"],
      webuiPythonRuntimeCompatible: true,
      safeOutputDirRef: "docs/V40.x/evidence/assets/v40-webui-candidates"
    });
    const required = createV40WebUiAkiReadiness({
      gpuName: "NVIDIA GeForce RTX 4090",
      gpuMemoryMiB: 24564,
      webuiApiReachable: true,
      webuiApiModelNames: ["anything-v5"],
      webuiPythonRuntimeCompatible: true,
      safeOutputDirRef: "docs/V40.x/evidence/assets/v40-webui-candidates",
      ollamaRequired: true
    });

    assert.equal(optional.ollamaStatus, "not_required");
    assert.equal(required.ollamaStatus, "unavailable");
  });

  it("sanitizes model names and safe relative output references", () => {
    assert.equal(sanitizeV40WebUiSafeName("anything-v5.safetensors"), "anything-v5");
    assert.equal(sanitizeV40WebUiSafeName("C:\\models\\cat.safetensors"), null);
    assert.equal(
      sanitizeV40WebUiRelativeRef("docs/V40.x/evidence/assets/v40-webui-candidates"),
      "docs/V40.x/evidence/assets/v40-webui-candidates"
    );
    assert.equal(sanitizeV40WebUiRelativeRef("/mnt/c/workspace/codexpat/out"), null);
  });

  it("detects sensitive values and forbidden ready claims", () => {
    assert.equal(runV40WebUiSecurityScan("safe relative references only").status, "passed");
    assert.equal(runV40WebUiSecurityScan("Authorization: Bearer secret-value").status, "failed");
    assert.equal(runV40WebUiSecurityScan("raw WebUI API payload: {}").status, "failed");
    assert.equal(runV40WebUiClaimScan("V40.1A WebUI smoke blocked").status, "passed");
    assert.equal(runV40WebUiClaimScan("automatic photo-to-2D ready for arbitrary cats").status, "failed");
  });
});
