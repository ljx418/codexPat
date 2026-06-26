import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createV33CharacterDesignContract, createV33TraitSummaryRecord } from "./v33-identity-contract";
import { createV33SampleIntakeRecord, type V33SafeSampleInput } from "./v33-sample-intake";
import { createV34SubjectDetectionRecord } from "./v34-subject-detection";
import { createV34SegmentationMaskRecord } from "./v34-segmentation-mask";
import {
  buildV34PosePartMapEvidenceSnapshot,
  createV34PosePartMapRecord,
  v34PosePartMapHasForbiddenContent
} from "./v34-pose-part-map";

describe("V34.3 pose part map", () => {
  it("creates complete part maps for passed mask samples", () => {
    const maps = ["v34_pose_orange_tabby", "v34_pose_silver_tabby", "v34_pose_calico"].map((sampleId) =>
      createV34PosePartMapRecord(passedInput(sampleId))
    );
    const snapshot = buildV34PosePartMapEvidenceSnapshot(maps);

    assert.equal(snapshot.passedCount, 3);
    assert.equal(snapshot.referencableByCharacterAssetContractCount, 3);
    assert.equal(snapshot.records.every((record) => record.visibleParts.length === 8), true);
    assert.equal(v34PosePartMapHasForbiddenContent(snapshot), false);
  });

  it("blocks low-confidence or missing parts instead of silently inventing them", () => {
    const record = createV34PosePartMapRecord({
      ...passedInput("v34_pose_low_tail"),
      partConfidence: {
        tail: "low",
        backLegs: "missing"
      }
    });

    assert.equal(record.status, "blocked");
    assert.deepEqual(record.missingOrLowConfidenceParts.sort(), ["backLegs", "tail"].sort());
    assert.equal(record.reasonCodes.includes("part_map_incomplete"), true);
  });

  it("does not create passed part maps from failed or blocked masks", () => {
    const failedMask = createV34SegmentationMaskRecord({
      detection: createV34SubjectDetectionRecord(createV33SampleIntakeRecord({
        ...clearSample("v34_pose_not_cat"),
        sampleClass: "negative",
        qualitySignals: { ...clearSignals(), catCount: 0 }
      }))
    });
    const failedMap = createV34PosePartMapRecord({ mask: failedMask });

    assert.equal(failedMask.status, "failed");
    assert.equal(failedMap.status, "failed");
    assert.equal(failedMap.reasonCodes.includes("pose_estimate_failed"), true);
  });
});

function passedInput(sampleId: string) {
  const intake = createV33SampleIntakeRecord(clearSample(sampleId));
  const traitSummary = createV33TraitSummaryRecord({ intake });
  const designContract = createV33CharacterDesignContract({ intake, traitSummary });
  const detection = createV34SubjectDetectionRecord(intake);
  const mask = createV34SegmentationMaskRecord({ detection });
  return { mask, designContract };
}

function clearSample(sampleId: string): V33SafeSampleInput {
  return {
    sampleId,
    sampleClass: "clear",
    catName: "Named Cat",
    approvedTraits: "orange tabby, compact body, round face, amber eyes, visible tail",
    localReferenceConsent: true,
    photo: { mediaType: "image/png", sizeBytes: 1_300_000, fileExtension: "png" },
    width: 1024,
    height: 1024,
    qualitySignals: clearSignals(),
    visualHints: {
      coatColor: "orange",
      pattern: "tabby",
      faceShape: "round",
      eyeColor: "amber",
      earShape: "upright",
      bodyPose: "compact_sitting",
      tailVisibility: "visible"
    },
    evidenceRefs: ["docs/V34.x/evidence/safe-pose-part-map"]
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
