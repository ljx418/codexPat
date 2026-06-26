import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createV33CharacterDesignContract, createV33TraitSummaryRecord } from "./v33-identity-contract";
import { createV33SampleIntakeRecord, type V33SafeSampleInput } from "./v33-sample-intake";
import { createV34SubjectDetectionRecord } from "./v34-subject-detection";
import { createV34SegmentationMaskRecord } from "./v34-segmentation-mask";
import { createV34PosePartMapRecord } from "./v34-pose-part-map";
import { createV34CharacterAssetContract } from "./v34-character-asset-contract";
import { runV34GenerationQualityGate } from "./v34-generation-quality-gate";
import {
  buildV34RigFrameSynthesisEvidenceSnapshot,
  createV34GeneratedActionPack,
  createV34RigFrameSeed,
  V34_TARGET_ACTION_IDS,
  V34_TARGET_TO_RUNTIME_CORE_A2,
  v34RigFrameSynthesisHasForbiddenContent
} from "./v34-rig-frame-synthesis";
import { CORE_ACTION_IDS } from "./asset-manifest";

describe("V34.5 Route A2 rig/frame synthesis", () => {
  it("creates scoped generated candidates with target actions and runtime core projection", () => {
    const packs = [
      generatedPack("v34_a2_orange_tabby", "orange", "tabby"),
      generatedPack("v34_a2_calico", "calico", "patched")
    ];
    const snapshot = buildV34RigFrameSynthesisEvidenceSnapshot(packs);
    const qaResults = packs.map((pack) => runV34GenerationQualityGate(pack));

    assert.equal(snapshot.passedCount, 2);
    assert.equal(snapshot.distinctPassedCharacterAssetCount, 2);
    assert.equal(snapshot.targetActionCoveragePassed, true);
    assert.equal(snapshot.runtimeProjectionCoveragePassed, true);
    assert.equal(snapshot.routeBQualityFallbackRecorded, true);
    assert.equal(qaResults.every((result) => result.overallStatus === "passed"), true);
    assert.deepEqual(Object.keys(V34_TARGET_TO_RUNTIME_CORE_A2).sort(), [...V34_TARGET_ACTION_IDS].sort());
    assert.deepEqual([...new Set(Object.values(V34_TARGET_TO_RUNTIME_CORE_A2))].sort(), [...CORE_ACTION_IDS].sort());
    assert.equal(v34RigFrameSynthesisHasForbiddenContent(snapshot), false);
  });

  it("rejects transform-only Route A2 candidates", () => {
    const pack = generatedPack("v34_a2_transform_only", "silver", "tabby", { transformOnly: true });
    const qa = runV34GenerationQualityGate(pack);

    assert.equal(pack.status, "failed");
    assert.equal(qa.overallStatus, "failed");
    assert.equal(qa.reasonCodes.includes("whole_image_transform"), true);
  });

  it("blocks generation from non-ready character asset contracts", () => {
    const chain = characterContract("v34_a2_incomplete_part", "black", "solid", { incompletePartMap: true });
    const seed = createV34RigFrameSeed({ contract: chain.contract });
    const pack = createV34GeneratedActionPack({ contract: chain.contract, seed });
    const qa = runV34GenerationQualityGate(pack);

    assert.equal(chain.contract.reviewStatus, "blocked");
    assert.equal(seed.reasonCodes.includes("frame_seed_blocked"), true);
    assert.equal(pack.status, "blocked");
    assert.equal(qa.overallStatus, "blocked");
  });
});

function generatedPack(
  sampleId: string,
  coatColor: string,
  pattern: string,
  options: { transformOnly?: boolean } = {}
) {
  const chain = characterContract(sampleId, coatColor, pattern);
  const seed = createV34RigFrameSeed({ contract: chain.contract });
  return createV34GeneratedActionPack({ contract: chain.contract, seed, transformOnly: options.transformOnly });
}

function characterContract(
  sampleId: string,
  coatColor: string,
  pattern: string,
  options: { incompletePartMap?: boolean } = {}
) {
  const intake = createV33SampleIntakeRecord(clearSample(sampleId, coatColor, pattern));
  const traitSummary = createV33TraitSummaryRecord({ intake });
  const designContract = createV33CharacterDesignContract({ intake, traitSummary });
  const detection = createV34SubjectDetectionRecord(intake);
  const mask = createV34SegmentationMaskRecord({ detection });
  const partMap = createV34PosePartMapRecord({
    mask,
    designContract,
    partConfidence: options.incompletePartMap ? { tail: "low" } : undefined
  });
  const contract = createV34CharacterAssetContract({ designContract, mask, partMap });
  return { contract };
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
    evidenceRefs: ["docs/V34.x/evidence/safe-rig-frame-synthesis"]
  };
}
