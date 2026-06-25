import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildV31ArtQualityEvidenceSnapshot,
  createV31PlaceholderLineArtCandidate,
  createV31PolishedCandidate,
  runV31ArtQualityRubric,
  v31ArtQualityHasForbiddenContent
} from "./v31-art-quality";

describe("V31 art quality rubric", () => {
  it("rejects the current placeholder-like line art baseline", () => {
    const result = runV31ArtQualityRubric(createV31PlaceholderLineArtCandidate());

    assert.equal(result.status, "failed");
    assert.ok(result.reasonCodes.includes("placeholder_line_art_rejected"));
    assert.ok(result.reasonCodes.includes("visual_polish_too_low"));
    assert.ok(result.reasonCodes.includes("small_scale_readability_failed"));
  });

  it("accepts a polished local frame-pack candidate with visual evidence", () => {
    const result = runV31ArtQualityRubric(createV31PolishedCandidate());
    const snapshot = buildV31ArtQualityEvidenceSnapshot(result);

    assert.equal(result.status, "passed");
    assert.deepEqual(result.reasonCodes, ["v31_art_quality_passed"]);
    assert.equal(result.evidenceMode, "visual");
    assert.equal(snapshot.scoreBuckets.visualPolish, "high");
  });

  it("blocks missing source or license instead of pretending to pass", () => {
    const candidate = createV31PolishedCandidate();
    candidate.sourceAvailable = false;
    candidate.licenseBoundaryOk = false;
    const result = runV31ArtQualityRubric(candidate);

    assert.equal(result.status, "blocked");
    assert.ok(result.reasonCodes.includes("source_asset_missing"));
    assert.ok(result.reasonCodes.includes("license_boundary_missing"));
  });

  it("rejects text-only visual acceptance and unsafe fields", () => {
    const candidate = createV31PolishedCandidate();
    candidate.hasVisualEvidence = false;
    candidate.candidateId = "/Users/private/cat";
    const result = runV31ArtQualityRubric(candidate);

    assert.equal(result.status, "failed");
    assert.ok(result.reasonCodes.includes("text_only_evidence_rejected"));
    assert.ok(result.reasonCodes.includes("unsafe_field_detected"));
    assert.equal(v31ArtQualityHasForbiddenContent({ note: "Authorization Bearer abcdefghi" }), true);
  });

  it("rejects background, overlay, watermark, weak pose, identity, and timing failures", () => {
    const result = runV31ArtQualityRubric(createV31PolishedCandidate({
      backgroundClean: false,
      overlayTextDetected: true,
      watermarkDetected: true,
      actionPoseStrength: 0.1,
      identityConsistency: 0.3,
      loopOrTimingOk: false,
      wholeImageTransformOnly: true
    }));

    assert.equal(result.status, "failed");
    assert.ok(result.reasonCodes.includes("background_not_clean"));
    assert.ok(result.reasonCodes.includes("overlay_text_detected"));
    assert.ok(result.reasonCodes.includes("watermark_detected"));
    assert.ok(result.reasonCodes.includes("action_pose_too_weak"));
    assert.ok(result.reasonCodes.includes("identity_consistency_too_low"));
    assert.ok(result.reasonCodes.includes("loop_or_timing_failed"));
    assert.ok(result.reasonCodes.includes("whole_image_transform_rejected"));
  });
});
