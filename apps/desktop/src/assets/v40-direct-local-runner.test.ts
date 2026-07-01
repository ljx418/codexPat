import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createV40DirectRunnerReadiness,
  decideV40DirectRunnerSmoke,
  runV40DirectRunnerClaimScan,
  runV40DirectRunnerSecurityScan,
  sanitizeV40DirectRelativeRef,
  sanitizeV40DirectSafeName
} from "./v40-direct-local-runner";

const availableDependencies = {
  torch: "available",
  diffusers: "available",
  transformers: "available",
  safetensors: "available",
  PIL: "available",
  numpy: "available"
} as const;

describe("V40.1A Direct Local Runner smoke", () => {
  it("passes scoped only when direct runner dependencies, model, GPU, and safe output are ready", () => {
    const decision = decideV40DirectRunnerSmoke({
      gpuName: "NVIDIA GeForce RTX 4090",
      gpuMemoryMiB: 24564,
      pythonAvailable: true,
      dependencySummary: availableDependencies,
      localModelNames: ["anything-v5.safetensors"],
      safeOutputDirRef: "docs/V40.x/evidence/assets/v40-direct-runner-candidates",
      ollamaModels: ["gemma4:26b"]
    });

    assert.equal(decision.decision, "passed scoped");
    assert.equal(decision.ok, true);
    assert.equal(decision.reasonCodes.includes("direct_runner_ready"), true);
  });

  it("blocks when required Python model dependencies are missing", () => {
    const decision = decideV40DirectRunnerSmoke({
      gpuName: "NVIDIA GeForce RTX 4090",
      gpuMemoryMiB: 24564,
      pythonAvailable: true,
      dependencySummary: { PIL: "available", numpy: "available" },
      localModelNames: ["anything-v5.safetensors"],
      safeOutputDirRef: "docs/V40.x/evidence/assets/v40-direct-runner-candidates",
      ollamaModels: ["gemma4:26b"]
    });

    assert.equal(decision.decision, "blocked");
    assert.equal(decision.ok, false);
    assert.equal(decision.reasonCodes.includes("direct_runner_dependency_missing"), true);
  });

  it("blocks when a model is missing even if dependencies are available", () => {
    const decision = decideV40DirectRunnerSmoke({
      gpuName: "NVIDIA GeForce RTX 4090",
      gpuMemoryMiB: 24564,
      pythonAvailable: true,
      dependencySummary: availableDependencies,
      localModelNames: [],
      safeOutputDirRef: "docs/V40.x/evidence/assets/v40-direct-runner-candidates",
      ollamaModels: ["gemma4:26b"]
    });

    assert.equal(decision.decision, "blocked");
    assert.equal(decision.reasonCodes.includes("direct_runner_model_missing"), true);
  });

  it("keeps only safe names and safe relative references", () => {
    assert.equal(sanitizeV40DirectSafeName("anything-v5.safetensors"), "anything-v5");
    assert.equal(sanitizeV40DirectSafeName("C:\\models\\cat.safetensors"), null);
    assert.equal(
      sanitizeV40DirectRelativeRef("docs/V40.x/evidence/assets/v40-direct-runner-candidates"),
      "docs/V40.x/evidence/assets/v40-direct-runner-candidates"
    );
    assert.equal(sanitizeV40DirectRelativeRef("/mnt/c/workspace/codexpat/out"), null);

    const readiness = createV40DirectRunnerReadiness({
      gpuName: "NVIDIA GeForce RTX 4090",
      gpuMemoryMiB: 24564,
      pythonAvailable: true,
      dependencySummary: availableDependencies,
      localModelNames: ["C:\\models\\cat.safetensors"],
      safeOutputDirRef: "docs/V40.x/evidence/assets/v40-direct-runner-candidates"
    });
    assert.equal(readiness.directModelSummary.length, 0);
    assert.equal(readiness.reasonCodes.includes("unsafe_model_reference"), true);
  });

  it("fails claim and security scans for forbidden ready claims or sensitive values", () => {
    assert.equal(runV40DirectRunnerSecurityScan("safe relative references only").status, "passed");
    assert.equal(runV40DirectRunnerSecurityScan("Authorization: Bearer secret-value").status, "failed");
    assert.equal(runV40DirectRunnerSecurityScan("raw runner payload: {}").status, "failed");
    assert.equal(runV40DirectRunnerClaimScan("V40.1A direct runner smoke blocked").status, "passed");
    assert.equal(runV40DirectRunnerClaimScan("automatic photo-to-2D ready for arbitrary cats").status, "failed");
    assert.equal(runV40DirectRunnerClaimScan("WebUI ready").status, "failed");
  });
});
