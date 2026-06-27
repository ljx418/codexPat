import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assessV39TargetExperienceCandidate,
  buildV39EvidenceSnapshot,
  buildV39Pipeline,
  createV39ActionFramePack,
  createV39CharacterizedAssetContracts,
  createV39HumanPreferenceGate,
  createV39LayeredPartRigs,
  createV39ProductPreviewApplyRollback,
  createV39RouteBComparisonRecords,
  createV39SourceSampleMatrix,
  createV39TargetExperienceRubric,
  createV39V38StyleOverlayFailureCandidate,
  decideV39FinalGate,
  runV39ActionQualityGate,
  runV39ClaimScan,
  v39HasForbiddenContent
} from "./v39-characterized-action-assets";

describe("V39 characterized 2D action assets", () => {
  it("rejects V38-style photo-card overlay candidates before V39.2", () => {
    const rubric = createV39TargetExperienceRubric();
    const assessment = assessV39TargetExperienceCandidate(createV39V38StyleOverlayFailureCandidate(), rubric);

    assert.equal(assessment.status, "failed");
    assert.equal(assessment.reasonCodes.includes("photo_card_frame"), true);
    assert.equal(assessment.reasonCodes.includes("whole_image_transform_only"), true);
  });

  it("builds a real V38-derived sample matrix with passing cats and blocked/negative samples", () => {
    const matrix = createV39SourceSampleMatrix();

    assert.equal(matrix.status, "passed");
    assert.equal(matrix.passingCatCount >= 2, true);
    assert.equal(matrix.blockedOrNegativeCount >= 1, true);
    assert.equal(v39HasForbiddenContent(matrix), false);
  });

  it("creates distinct characterized assets and rejects non-cat or multi-cat records", () => {
    const contracts = createV39CharacterizedAssetContracts();
    const passed = contracts.filter((contract) => contract.status === "passed");
    const blockedOrFailed = contracts.filter((contract) => contract.status !== "passed");

    assert.equal(passed.length >= 2, true);
    assert.equal(blockedOrFailed.length >= 1, true);
    assert.equal(new Set(passed.map((contract) => contract.characterAssetId)).size, passed.length);
    assert.equal(passed.every((contract) => contract.noCardNoLabelProof.hasDecorativeCard === false), true);
    assert.equal(v39HasForbiddenContent(contracts), false);
  });

  it("creates layered part rigs that do not assign action motion to the whole image", () => {
    const rigs = createV39LayeredPartRigs();
    const passed = rigs.filter((rig) => rig.status === "passed");

    assert.equal(passed.length >= 2, true);
    assert.equal(passed.every((rig) => rig.wholeImageMotionResponsibility === false), true);
    assert.equal(passed.every((rig) => rig.parts.some((part) => part.partId === "tail" && part.actionResponsibilities.includes("play"))), true);
  });

  it("generates A2++ action packs and rejects transform-only packs", () => {
    const rig = createV39LayeredPartRigs().find((item) => item.status === "passed");
    assert.ok(rig);

    const pack = createV39ActionFramePack(rig);
    const gate = runV39ActionQualityGate(pack);
    const weak = createV39ActionFramePack(rig, { transformOnly: true });
    const weakGate = runV39ActionQualityGate(weak);

    assert.equal(gate.status, "passed");
    assert.equal(pack.actionSequences.length, 8);
    assert.equal(pack.actionSequences.every((sequence) => sequence.frameCount >= 8), true);
    assert.equal(weakGate.status, "failed");
    assert.equal(weakGate.reasonCodes.includes("whole_image_transform_only"), true);
  });

  it("blocks failed candidates from product apply and keeps Route B honest", () => {
    const pipeline = buildV39Pipeline();
    const product = createV39ProductPreviewApplyRollback({
      packs: pipeline.actionPacks,
      assessments: pipeline.rubricAssessments,
      includeFailedCandidate: true
    });
    const routeB = createV39RouteBComparisonRecords(pipeline.actionPacks);

    assert.equal(product.status, "passed");
    assert.equal(product.failedCandidateBlocked, true);
    assert.equal(routeB.every((record) => record.routeBStatus === "blocked_not_supplied"), true);
    assert.equal(routeB.every((record) => record.canParticipateInAcceptance === false), true);
  });

  it("produces a scoped final decision only with two tested passing samples and clean scans", () => {
    const pipeline = buildV39Pipeline();
    const snapshot = buildV39EvidenceSnapshot(pipeline);
    const human = createV39HumanPreferenceGate(pipeline.rubricAssessments);
    const final = decideV39FinalGate(pipeline);

    assert.equal(pipeline.status, "passed");
    assert.equal(human.status, "passed");
    assert.equal(final.decision, "passed scoped");
    assert.equal(final.passedSampleCount >= 2, true);
    assert.equal(runV39ClaimScan(snapshot).status, "passed");
    assert.equal(v39HasForbiddenContent(snapshot), false);
  });
});
