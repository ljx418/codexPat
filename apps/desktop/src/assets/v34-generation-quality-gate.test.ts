import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createV33CharacterDesignContract, createV33TraitSummaryRecord } from "./v33-identity-contract";
import { createV33SampleIntakeRecord, type V33SafeSampleInput } from "./v33-sample-intake";
import { createV34CharacterAssetContract } from "./v34-character-asset-contract";
import {
  buildV34GenerationProductEvidenceSnapshot,
  runV34GenerationProductE2E,
  runV34GenerationQualityGate
} from "./v34-generation-quality-gate";
import { createV34PosePartMapRecord } from "./v34-pose-part-map";
import {
  createV34GeneratedActionPack,
  createV34RigFrameSeed,
  V34_TARGET_ACTION_IDS,
  type V34TargetActionId
} from "./v34-rig-frame-synthesis";
import { createV34SegmentationMaskRecord } from "./v34-segmentation-mask";
import { createV34SubjectDetectionRecord } from "./v34-subject-detection";

describe("V34.6 generation product E2E gate", () => {
  it("allows passed Route A2 candidates to preview, apply, and rollback on the target instance", () => {
    const products = [
      productFor("v34_product_orange_tabby", "orange", "tabby"),
      productFor("v34_product_calico", "calico", "patched")
    ];
    const snapshot = buildV34GenerationProductEvidenceSnapshot(products);

    assert.equal(snapshot.passedCandidateCount, 2);
    assert.equal(snapshot.previewReadyCount, 2);
    assert.equal(snapshot.appliedCount, 2);
    assert.equal(snapshot.rolledBackCount, 2);
    assert.equal(snapshot.targetOnlyApplyPassed, true);
    assert.equal(snapshot.rollbackPassed, true);
    assert.equal(snapshot.diagnosticsSafe, true);
    assert.equal(products.every((product) => product.runtimeManifest.actions.length === 8), true);
  });

  it("blocks transform-only candidates before preview and apply", () => {
    const product = productFor("v34_product_transform_only", "silver", "tabby", { transformOnly: true });

    assert.equal(product.qaStatus, "failed");
    assert.equal(product.previewStatus, "blocked");
    assert.equal(product.applyStatus, "blocked");
    assert.equal(product.rollbackStatus, "not-run");
    assert.equal(product.failedCandidateBlocked, true);
  });

  it("blocks candidates that miss a V34 target action even if the runtime projection exists", () => {
    const product = productFor("v34_product_missing_target", "black", "solid", { missingTargetAction: "play" });

    assert.equal(product.qaStatus, "failed");
    assert.equal(product.previewStatus, "blocked");
    assert.equal(product.applyStatus, "blocked");
    assert.equal(product.failedCandidateBlocked, true);
  });
});

function productFor(
  sampleId: string,
  coatColor: string,
  pattern: string,
  options: { transformOnly?: boolean; missingTargetAction?: V34TargetActionId } = {}
) {
  const contract = characterContract(sampleId, coatColor, pattern);
  const seed = createV34RigFrameSeed({ contract });
  const pack = createV34GeneratedActionPack({
    contract,
    seed,
    transformOnly: options.transformOnly,
    missingTargetAction: options.missingTargetAction
  });
  const qa = runV34GenerationQualityGate(pack);
  return runV34GenerationProductE2E({
    pack,
    qa,
    userApproved: true,
    targetInstanceId: "v34-target-pet",
    instances: [
      { instanceId: "default", displayName: "Default Pet", activePackId: "css-default" },
      { instanceId: "v34-target-pet", displayName: "V34 Target", activePackId: "previous-pack" },
      { instanceId: "v34-unrelated", displayName: "Unrelated Pet", activePackId: "living-work-cat-v1" }
    ]
  });
}

function characterContract(sampleId: string, coatColor: string, pattern: string) {
  const intake = createV33SampleIntakeRecord(clearSample(sampleId, coatColor, pattern));
  const traitSummary = createV33TraitSummaryRecord({ intake });
  const designContract = createV33CharacterDesignContract({ intake, traitSummary });
  const detection = createV34SubjectDetectionRecord(intake);
  const mask = createV34SegmentationMaskRecord({ detection });
  const partMap = createV34PosePartMapRecord({ mask, designContract });
  return createV34CharacterAssetContract({ designContract, mask, partMap });
}

function clearSample(sampleId: string, coatColor: string, pattern: string): V33SafeSampleInput {
  return {
    sampleId,
    sampleClass: "clear",
    catName: "Named Cat",
    approvedTraits: `${coatColor} ${pattern}, compact body, round face, amber eyes, visible tail`,
    localReferenceConsent: true,
    photo: { mediaType: "image/png", sizeBytes: 1_300_000, fileExtension: "png" },
    width: 1024,
    height: 1024,
    qualitySignals: {
      blurScore: 0.82,
      catCount: 1,
      catVisibleRatio: 0.82,
      occlusionScore: 0.08,
      backgroundComplexity: 0.28,
      bodyVisible: true,
      tailVisible: true
    },
    visualHints: {
      coatColor,
      pattern,
      faceShape: "round",
      eyeColor: "amber",
      earShape: "upright",
      bodyPose: "compact_sitting",
      tailVisibility: "visible"
    },
    evidenceRefs: ["docs/V34.x/evidence/safe-generation-product-e2e"]
  };
}

assert.equal(V34_TARGET_ACTION_IDS.length, 8);
