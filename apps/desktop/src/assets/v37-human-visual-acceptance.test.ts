import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildV37HumanVisualAcceptanceEvidenceSnapshot,
  createV37HumanVisualAcceptanceGate
} from "./v37-human-visual-acceptance";

describe("V37 human visual acceptance", () => {
  it("passes only when two candidates meet target-experience review", () => {
    const gate = createV37HumanVisualAcceptanceGate([
      {
        sampleId: "v37_amber_clear_tabby",
        candidateId: "amber_candidate",
        automatedStatus: "target_experience",
        identityScore: 0.9,
        motionReadabilityScore: 0.82,
        visualPolishScore: 0.78,
        nonPlaceholderResult: "passed"
      },
      {
        sampleId: "v37_misty_distinct_tuxedo",
        candidateId: "misty_candidate",
        automatedStatus: "target_experience",
        identityScore: 0.88,
        motionReadabilityScore: 0.8,
        visualPolishScore: 0.76,
        nonPlaceholderResult: "passed"
      }
    ]);
    const snapshot = buildV37HumanVisualAcceptanceEvidenceSnapshot(gate);

    assert.equal(gate.status, "passed");
    assert.equal(snapshot.targetExperienceCount, 2);
  });

  it("fails closed for built-in cat reuse or placeholder art", () => {
    const gate = createV37HumanVisualAcceptanceGate([
      {
        sampleId: "v37_amber_clear_tabby",
        candidateId: "bad_candidate",
        automatedStatus: "target_experience",
        identityScore: 0.9,
        motionReadabilityScore: 0.82,
        visualPolishScore: 0.78,
        nonPlaceholderResult: "failed",
        builtInCatReuseDetected: true
      }
    ]);

    assert.equal(gate.status, "failed");
    assert.equal(gate.reasonCodes.includes("built_in_cat_reuse_detected"), true);
    assert.equal(gate.reasonCodes.includes("placeholder_or_line_art_detected"), true);
  });
});
