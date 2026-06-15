import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  externalGenerationInstructionHasForbiddenContent,
  generateExternalGenerationInstructionWorkflow
} from "./external-generation-instruction-workflow";

describe("V7.3 external generation instruction workflow", () => {
  it("generates copyable local instructions covering all core actions", () => {
    const workflow = generateExternalGenerationInstructionWorkflow({
      catName: "Orange Tabby",
      coat: "warm orange short hair",
      markings: "white chest and tabby stripes",
      eyes: "amber eyes",
      tail: "curled tail",
      personality: "playful desktop companion",
      rendererTarget: "sprite",
      photoReferenceMode: "local_reference_only"
    });

    assert.equal(workflow.status, "accepted");
    assert.equal(workflow.reasonCode, "external_instruction_workflow_ok");
    assert.equal(workflow.actionCoverage.length, 8);
    assert.ok(workflow.fileNamingRules.includes("idle.png"));
    assert.ok(workflow.validationChecklist.some((item) => /local import validation/.test(item)));
    assert.equal(workflow.safetyBoundary.uploadsByDefault, false);
    assert.equal(workflow.safetyBoundary.callsProviderApi, false);
    assert.equal(workflow.safetyBoundary.requiresLocalImportValidation, true);
    assert.equal(workflow.safetyBoundary.provesProviderIntegration, false);
    assert.equal(workflow.safetyBoundary.provesGeneratedAssetReady, false);
    assert.equal(externalGenerationInstructionHasForbiddenContent(workflow), false);
  });

  it("generates GLTF-specific deep-scan instructions without claiming 3D readiness", () => {
    const workflow = generateExternalGenerationInstructionWorkflow({
      catName: "Mochi",
      coat: "black coat",
      markings: "white paws",
      eyes: "green eyes",
      tail: "long tail",
      personality: "calm work companion",
      rendererTarget: "gltf"
    });

    assert.equal(workflow.status, "accepted");
    assert.ok(workflow.fileNamingRules.includes("idle.glb"));
    assert.ok(workflow.validationChecklist.some((item) => /deep scan/.test(item)));
    assert.doesNotMatch(JSON.stringify(workflow), /3D ready/);
  });

  it("rejects unsafe trait input before producing instructions", () => {
    const workflow = generateExternalGenerationInstructionWorkflow({
      catName: "Mochi",
      coat: "see /Users/example/cat.png",
      rendererTarget: "sprite"
    });

    assert.equal(workflow.status, "rejected");
    assert.equal(workflow.reasonCode, "trait_prompt_pack_invalid");
  });
});
