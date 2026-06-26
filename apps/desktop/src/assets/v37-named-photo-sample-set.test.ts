import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildV37NamedPhotoSampleSetEvidenceSnapshot,
  createV37NamedPhotoSampleSet,
  v37NamedPhotoSampleSetHasForbiddenContent
} from "./v37-named-photo-sample-set";

describe("V37 named photo sample set", () => {
  it("builds two passing named samples plus negative and blocked samples with safe metadata only", () => {
    const set = createV37NamedPhotoSampleSet();
    const snapshot = buildV37NamedPhotoSampleSetEvidenceSnapshot(set);

    assert.equal(set.status, "passed");
    assert.equal(set.passedCount, 2);
    assert.equal(set.negativeRejectedCount, 1);
    assert.equal(set.blockedCount, 1);
    assert.equal(set.distinctPassedIdentityCount, 2);
    assert.equal(snapshot.privacyBoundary.storesRawPhoto, false);
    assert.equal(snapshot.privacyBoundary.persistsExifGps, false);
    assert.equal(v37NamedPhotoSampleSetHasForbiddenContent(snapshot), false);
  });

  it("fails closed when the sample matrix lacks a second passing identity", () => {
    const set = createV37NamedPhotoSampleSet().records;
    const reduced = createV37NamedPhotoSampleSet(set
      .filter((record) => record.sampleId !== "v37_misty_distinct_tuxedo")
      .map((record) => ({
        displayName: record.displayName,
        difficultyClass: record.difficultyClass,
        sourceKind: record.sourceKind,
        permissionSummary: record.permissionSummary,
        sample: {
          sampleId: record.sampleId,
          sampleClass: record.intake.sampleClass,
          catName: record.displayName,
          approvedTraits: record.intake.traitSummary.coatColorBucket,
          localReferenceConsent: true,
          photo: { mediaType: "image/png", sizeBytes: 400_000, fileExtension: "png" },
          width: 1000,
          height: 800,
          qualitySignals: record.intake.sampleClass === "negative"
            ? { catCount: 0, catVisibleRatio: 0 }
            : { catCount: record.intake.sampleClass === "blocked" ? 2 : 1, catVisibleRatio: 0.9, bodyVisible: true, tailVisible: true }
        }
      })));

    assert.equal(reduced.status, "failed");
    assert.equal(reduced.reasonCodes.includes("insufficient_passing_named_samples"), true);
  });
});
