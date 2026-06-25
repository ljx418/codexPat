import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runV26PackPreviewApplyRollback, v26FrameSet } from "./pack-preview-apply-rollback";
import { CORE_ACTION_IDS } from "./asset-manifest";
import { createV30SemanticCandidate, runV30MotionReadabilityQA } from "./semantic-animation-quality";
import { createV31PlaceholderLineArtCandidate, createV31PolishedCandidate, runV31ArtQualityRubric } from "./v31-art-quality";
import {
  runV31ContinuationFinalGate,
  runV31LayeredRigRuntimeRouteGate,
  runV31NamedPhotoSampleSetGate,
  runV31PhotoActionClosureGate,
  runV31RepeatableAssetProductionGate,
  v31ContinuationHasForbiddenContent
} from "./v31-continuation";

describe("V31 continuation gates", () => {
  it("marks repeatable production partial when only one high-quality asset passes", () => {
    const flagship = runV31ArtQualityRubric(createV31PolishedCandidate());
    const placeholder = runV31ArtQualityRubric(createV31PlaceholderLineArtCandidate());

    const result = runV31RepeatableAssetProductionGate({
      candidates: [
        { candidateId: "flagship", sourceLabel: "real_local_asset", artQuality: flagship },
        { candidateId: "placeholder", sourceLabel: "fixture_negative", artQuality: placeholder }
      ]
    });

    assert.equal(result.status, "partial");
    assert.equal(result.passingCandidateCount, 1);
    assert.ok(result.reasonCodes.includes("only_single_high_quality_asset_passed"));
    assert.ok(result.reasonCodes.includes("candidate_failed_quality_gate"));
  });

  it("passes repeatable production only after two candidates pass the same gate", () => {
    const result = runV31RepeatableAssetProductionGate({
      candidates: [
        { candidateId: "flagship-a", sourceLabel: "real_local_asset", artQuality: runV31ArtQualityRubric(createV31PolishedCandidate()) },
        { candidateId: "flagship-b", sourceLabel: "real_local_asset", artQuality: runV31ArtQualityRubric(createV31PolishedCandidate({ identityConsistency: 0.86 })) }
      ]
    });

    assert.equal(result.status, "passed");
    assert.equal(result.passingCandidateCount, 2);
    assert.deepEqual(result.reasonCodes, ["repeatable_asset_production_passed"]);
  });

  it("blocks layered rig route when only the route contract exists", () => {
    const result = runV31LayeredRigRuntimeRouteGate({
      routeContractPresent: true,
      runtimePayloadAvailable: false,
      normalizedFramesAvailable: false
    });

    assert.equal(result.status, "blocked");
    assert.ok(result.reasonCodes.includes("layered_rig_runtime_payload_missing"));
  });

  it("keeps named photo sample set partial when negative coverage is simulated", () => {
    const result = runV31NamedPhotoSampleSetGate([
      { safeSampleId: "real-cat-front-1", sampleKind: "real_positive", suitabilityStatus: "clear", primaryReasonCode: "photo_suitability_clear" },
      { safeSampleId: "real-cat-sample-2", sampleKind: "real_positive", suitabilityStatus: "clear", primaryReasonCode: "photo_suitability_clear" },
      { safeSampleId: "real-cat-sample-3", sampleKind: "real_difficult", suitabilityStatus: "usable_with_risk", primaryReasonCode: "cat_cropped" },
      { safeSampleId: "simulated-non-cat", sampleKind: "simulated_negative", suitabilityStatus: "unsuitable", primaryReasonCode: "multi_cat_ambiguous" }
    ]);

    assert.equal(result.status, "partial");
    assert.equal(result.realSampleCount, 3);
    assert.equal(result.boundary, "partial_real_data_with_simulated_negative");
    assert.ok(result.reasonCodes.includes("photo_negative_samples_simulated_only"));
  });

  it("blocks photo action closure when no real photo-derived action frames exist", () => {
    const sampleSet = runV31NamedPhotoSampleSetGate([
      { safeSampleId: "real-cat-front-1", sampleKind: "real_positive", suitabilityStatus: "clear", primaryReasonCode: "photo_suitability_clear" },
      { safeSampleId: "real-cat-sample-2", sampleKind: "real_positive", suitabilityStatus: "clear", primaryReasonCode: "photo_suitability_clear" },
      { safeSampleId: "real-cat-sample-3", sampleKind: "real_difficult", suitabilityStatus: "usable_with_risk", primaryReasonCode: "cat_cropped" },
      { safeSampleId: "simulated-blurry", sampleKind: "simulated_blocked", suitabilityStatus: "unsuitable", primaryReasonCode: "photo_blurry" }
    ]);
    const artQuality = runV31ArtQualityRubric(createV31PolishedCandidate());
    const semanticQuality = runV30MotionReadabilityQA(createV30SemanticCandidate());
    const previewApply = runV26PackPreviewApplyRollback({
      v25Accepted: true,
      userApproved: true,
      generatedPackId: "v31-photo-action-candidate",
      displayName: "V31 photo action candidate",
      actionFrames: CORE_ACTION_IDS.map((actionId) => v26FrameSet(actionId, 6)),
      targetInstanceId: "target",
      instances: [
        { instanceId: "default", displayName: "Default", activePackId: "default-pack" },
        { instanceId: "target", displayName: "Target", activePackId: "previous-pack" }
      ]
    });

    const result = runV31PhotoActionClosureGate({
      namedSampleSet: sampleSet,
      artQuality,
      semanticQuality,
      previewApply,
      photoDerivedActionFramesAvailable: false
    });

    assert.equal(result.status, "blocked");
    assert.ok(result.reasonCodes.includes("photo_derived_action_frames_missing"));
  });

  it("final gate preserves partial and rejects unsafe evidence fields", () => {
    const finalGate = runV31ContinuationFinalGate({
      v31_8: "partial",
      v31_9: "blocked",
      v31_10: "partial"
    });

    assert.equal(finalGate.status, "blocked");
    assert.ok(finalGate.reasonCodes.includes("continuation_final_blocked"));
    assert.equal(v31ContinuationHasForbiddenContent({ path: "/Users/example/private-cat.jpg" }), true);
  });
});
