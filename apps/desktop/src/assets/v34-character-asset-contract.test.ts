import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createV33CharacterDesignContract, createV33TraitSummaryRecord } from "./v33-identity-contract";
import { createV33SampleIntakeRecord, type V33SafeSampleInput } from "./v33-sample-intake";
import { createV34SubjectDetectionRecord } from "./v34-subject-detection";
import { createV34SegmentationMaskRecord } from "./v34-segmentation-mask";
import { createV34PosePartMapRecord } from "./v34-pose-part-map";
import {
  buildV34CharacterAssetContractEvidenceSnapshot,
  createV34CharacterAssetContract,
  v34CharacterAssetContractHasForbiddenContent
} from "./v34-character-asset-contract";

describe("V34.4 character asset contract", () => {
  it("creates independent character asset contracts for different passed samples", () => {
    const contracts = [
      passedContract("v34_asset_orange_tabby", "orange", "tabby"),
      passedContract("v34_asset_silver_tabby", "silver", "tabby"),
      passedContract("v34_asset_calico", "calico", "patched")
    ];
    const snapshot = buildV34CharacterAssetContractEvidenceSnapshot(contracts);

    assert.equal(snapshot.passedCount, 3);
    assert.equal(snapshot.readyForFrameSeedCount, 3);
    assert.equal(snapshot.duplicateCharacterAssetIdCount, 0);
    assert.equal(snapshot.duplicateIdentitySignatureCount, 0);
    assert.equal(v34CharacterAssetContractHasForbiddenContent(snapshot), false);
  });

  it("blocks contracts when required part maps are incomplete", () => {
    const chain = passedChain("v34_asset_low_tail", "orange", "tabby");
    const incompletePartMap = createV34PosePartMapRecord({
      mask: chain.mask,
      designContract: chain.designContract,
      partConfidence: { tail: "low" }
    });
    const contract = createV34CharacterAssetContract({
      designContract: chain.designContract,
      mask: chain.mask,
      partMap: incompletePartMap
    });

    assert.equal(contract.reviewStatus, "blocked");
    assert.equal(contract.rigReadiness, "blocked");
    assert.equal(contract.reasonCodes.includes("part_map_incomplete"), true);
  });

  it("fails contracts when sample ids across chain records do not match", () => {
    const left = passedChain("v34_asset_left", "orange", "tabby");
    const right = passedChain("v34_asset_right", "black", "solid");
    const contract = createV34CharacterAssetContract({
      designContract: left.designContract,
      mask: right.mask,
      partMap: left.partMap
    });

    assert.equal(contract.reviewStatus, "failed");
    assert.equal(contract.reasonCodes.includes("identity_drift"), true);
  });
});

function passedContract(sampleId: string, coatColor: string, pattern: string) {
  const chain = passedChain(sampleId, coatColor, pattern);
  return createV34CharacterAssetContract(chain);
}

function passedChain(sampleId: string, coatColor: string, pattern: string) {
  const intake = createV33SampleIntakeRecord(clearSample(sampleId, coatColor, pattern));
  const traitSummary = createV33TraitSummaryRecord({ intake });
  const designContract = createV33CharacterDesignContract({ intake, traitSummary });
  const detection = createV34SubjectDetectionRecord(intake);
  const mask = createV34SegmentationMaskRecord({ detection });
  const partMap = createV34PosePartMapRecord({ mask, designContract });
  return { designContract, mask, partMap };
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
    qualitySignals: clearSignals(),
    visualHints: {
      coatColor,
      pattern,
      faceShape: "round",
      eyeColor: "amber",
      earShape: "upright",
      bodyPose: "compact_sitting",
      tailVisibility: "visible"
    },
    evidenceRefs: ["docs/V34.x/evidence/safe-character-asset-contract"]
  };
}

function clearSignals() {
  return {
    blurScore: 0.82,
    catCount: 1,
    catVisibleRatio: 0.82,
    occlusionScore: 0.08,
    backgroundComplexity: 0.28,
    bodyVisible: true,
    tailVisible: true
  };
}
