import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CORE_ACTION_IDS } from "./asset-manifest";
import { createV33SampleIntakeRecord } from "./v33-sample-intake";
import {
  createV33CharacterDesignContract,
  createV33TraitSummaryRecord,
  runV33IdentityGate
} from "./v33-identity-contract";
import {
  buildV33ActionCandidateEvidenceSnapshot,
  createV33LocalFrameSequenceCandidate
} from "./v33-photo-action-pipeline";
import {
  buildV33CandidateQaEvidenceSnapshot,
  runV33CandidateQa
} from "./v33-action-candidate-gate";
import { runV33ProductizedPhotoFlow } from "./v33-productized-photo-flow";
import { clearSample } from "./v33-sample-intake.test";

describe("V33 local frameSequence action pipeline", () => {
  it("accepts a reviewed local frameSequence candidate through QA and product preview/apply/rollback", () => {
    const contract = contractForClearSample();
    const candidate = createV33LocalFrameSequenceCandidate({
      candidateId: "quality-rescue-tabby-v1",
      safePackId: "quality-rescue-tabby-v1",
      contract,
      frameCountByAction: frameCounts(),
      evidenceRefs: [
        "docs/V32.x/evidence/v32_quality-rescue-tabby-v1_contact_sheet_2026-06-24.png",
        "docs/V32.x/evidence/v32_quality-rescue-tabby-v1_animation_preview_2026-06-24.gif"
      ]
    });
    const identityGate = runV33IdentityGate({
      contract,
      candidateId: candidate.manifest.candidateId,
      candidateAnchors: contract.identityAnchors,
      actionIdentityConsistency: 0.9
    });
    const qa = runV33CandidateQa({
      semanticCandidate: candidate.semanticCandidate,
      artCandidate: candidate.artCandidate,
      frameCandidate: candidate.frameCandidate,
      identityGate
    });
    candidate.manifest.qaStatus = qa.overallStatus;
    const product = runV33ProductizedPhotoFlow({
      manifest: candidate.manifest,
      qa,
      userApproved: true,
      actionFrames: candidate.actionFrames,
      targetInstanceId: "v33_target_pet",
      instances: [
        { instanceId: "default", displayName: "Default Pet", activePackId: "css-default" },
        { instanceId: "v33_target_pet", displayName: "V33 Target", activePackId: "previous-pack" },
        { instanceId: "unrelated", displayName: "Unrelated", activePackId: "living-work-cat-v1" }
      ]
    });

    assert.equal(candidate.technicalPipeline.actionSynthesisStatus, "passed");
    assert.equal(qa.overallStatus, "passed");
    assert.equal(product.applyStatus, "applied");
    assert.equal(product.rollbackStatus, "rolled_back");
    assert.equal(product.previousPackRestored, true);
    assert.equal(buildV33ActionCandidateEvidenceSnapshot(candidate).manifest.actions.length, CORE_ACTION_IDS.length);
    assert.equal(buildV33CandidateQaEvidenceSnapshot(qa).overallStatus, "passed");
  });

  it("fails transform-only candidates and blocks them from product apply", () => {
    const contract = contractForClearSample();
    const candidate = createV33LocalFrameSequenceCandidate({
      candidateId: "v33-transform-only-negative",
      safePackId: "v33-transform-only-negative",
      contract,
      frameCountByAction: frameCounts(),
      transformOnly: true
    });
    const identityGate = runV33IdentityGate({
      contract,
      candidateId: candidate.manifest.candidateId,
      candidateAnchors: contract.identityAnchors,
      actionIdentityConsistency: 0.82
    });
    const qa = runV33CandidateQa({
      semanticCandidate: candidate.semanticCandidate,
      artCandidate: candidate.artCandidate,
      frameCandidate: candidate.frameCandidate,
      identityGate
    });
    const product = runV33ProductizedPhotoFlow({
      manifest: candidate.manifest,
      qa,
      userApproved: true,
      actionFrames: candidate.actionFrames,
      targetInstanceId: "v33_target_pet",
      instances: [
        { instanceId: "v33_target_pet", displayName: "V33 Target", activePackId: "previous-pack" }
      ]
    });

    assert.equal(qa.overallStatus, "failed");
    assert.equal(qa.reasonCodes.includes("whole_image_transform"), true);
    assert.equal(product.failedCandidateBlocked, true);
    assert.equal(product.applyStatus, "blocked");
  });
});

function contractForClearSample() {
  const intake = createV33SampleIntakeRecord(clearSample());
  const trait = createV33TraitSummaryRecord({ intake });
  return createV33CharacterDesignContract({ intake, traitSummary: trait });
}

function frameCounts() {
  return {
    idle: 12,
    thinking: 12,
    running: 12,
    success: 8,
    warning: 8,
    error: 8,
    need_input: 8,
    sleeping: 12
  };
}
