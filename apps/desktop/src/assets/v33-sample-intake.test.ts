import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildV33SampleIntakeEvidenceSnapshot,
  createV33SampleIntakeRecord,
  v33SampleIntakeHasForbiddenContent
} from "./v33-sample-intake";

describe("V33 safe sample intake", () => {
  it("accepts a clear authorized local reference without retaining private photo fields", () => {
    const record = createV33SampleIntakeRecord(clearSample());

    assert.equal(record.status, "passed");
    assert.equal(record.safeTraitsAvailable, true);
    assert.equal(record.privacyBoundary.storesRawPhoto, false);
    assert.equal(record.privacyBoundary.includesProviderCall, false);
    assert.equal(v33SampleIntakeHasForbiddenContent(record), false);
  });

  it("keeps difficult samples scoped and traceable instead of silently rejecting them", () => {
    const record = createV33SampleIntakeRecord({
      ...clearSample(),
      sampleId: "v33_difficult_tabby_reviewed",
      sampleClass: "difficult",
      qualitySignals: {
        ...clearSample().qualitySignals,
        blurScore: 0.5,
        catVisibleRatio: 0.5
      }
    });

    assert.equal(record.status, "passed");
    assert.equal(record.reasonCodes.includes("insufficient_body_visibility"), true);
    assert.equal(record.safeTraitsAvailable, true);
  });

  it("blocks privacy failures and fails unsuitable negative samples", () => {
    const blocked = createV33SampleIntakeRecord({
      ...clearSample(),
      sampleId: "v33_blocked_no_consent",
      sampleClass: "blocked",
      localReferenceConsent: false
    });
    const negative = createV33SampleIntakeRecord({
      ...clearSample(),
      sampleId: "v33_negative_multi_subject",
      sampleClass: "negative",
      qualitySignals: {
        ...clearSample().qualitySignals,
        catCount: 2
      }
    });

    assert.equal(blocked.status, "blocked");
    assert.equal(blocked.safeTraitsAvailable, false);
    assert.equal(negative.status, "failed");
    assert.equal(negative.reasonCodes.includes("multi_subject"), true);
  });

  it("builds a safe evidence snapshot for all sample classes", () => {
    const records = [
      createV33SampleIntakeRecord(clearSample()),
      createV33SampleIntakeRecord({
        ...clearSample(),
        sampleId: "v33_blocked_no_consent",
        sampleClass: "blocked",
        localReferenceConsent: false
      })
    ];
    const snapshot = buildV33SampleIntakeEvidenceSnapshot(records);

    assert.equal(snapshot.passedCount, 1);
    assert.equal(snapshot.blockedCount, 1);
    assert.equal(v33SampleIntakeHasForbiddenContent(snapshot), false);
  });
});

export function clearSample() {
  return {
    sampleId: "v33_clear_tabby_reference",
    sampleClass: "clear" as const,
    catName: "Reference Tabby",
    approvedTraits: "orange tabby, compact body, round face, amber eyes, visible tail",
    localReferenceConsent: true,
    photo: {
      mediaType: "image/png",
      sizeBytes: 1_400_000,
      fileExtension: "png"
    },
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
      coatColor: "orange",
      pattern: "tabby",
      faceShape: "round",
      eyeColor: "amber",
      earShape: "upright",
      bodyPose: "compact_sitting",
      tailVisibility: "visible"
    },
    evidenceRefs: ["docs/V33.x/evidence/safe-sample-records"]
  };
}
