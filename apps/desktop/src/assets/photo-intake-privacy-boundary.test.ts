import assert from "node:assert/strict";
import { statSync } from "node:fs";
import { describe, it } from "node:test";
import {
  buildPhotoIntakeEvidenceSnapshot,
  createPhotoIntakePrivacySession,
  photoIntakeHasForbiddenContent
} from "./photo-intake-privacy-boundary";

const REAL_FIXTURE_PATH = "../../fixtures/manual/visual-assets/imported-static-orange-tabby-v1/idle.png";

describe("V7.1 photo intake privacy boundary", () => {
  it("accepts real local fixture metadata without storing path, filename, raw photo, or upload state", () => {
    const stats = statSync(REAL_FIXTURE_PATH);
    const session = createPhotoIntakePrivacySession({
      catName: "Orange Tabby",
      approvedTraits: "orange tabby, amber eyes, white chest, curled tail",
      photo: {
        fileName: "idle.png",
        mediaType: "image/png",
        sizeBytes: stats.size
      },
      localReferenceConsent: true
    });
    const evidence = buildPhotoIntakeEvidenceSnapshot(session);
    const serialized = JSON.stringify({ session, evidence });

    assert.equal(session.status, "accepted");
    assert.equal(session.reasonCode, "photo_privacy_boundary_ok");
    assert.equal(session.photoReferenceMode, "local_reference_only");
    assert.equal(session.privacyBoundary.storesRawPhoto, false);
    assert.equal(session.privacyBoundary.readsRawPhotoBytes, false);
    assert.equal(session.privacyBoundary.uploadsByDefault, false);
    assert.equal(session.privacyBoundary.persistsExifGps, false);
    assert.equal(session.privacyBoundary.persistsSourceFileName, false);
    assert.equal(session.privacyBoundary.persistsFullPath, false);
    assert.equal(session.privacyBoundary.includesProviderCall, false);
    assert.doesNotMatch(serialized, /fixtures\/manual/);
    assert.doesNotMatch(serialized, /idle\.png/);
    assert.doesNotMatch(serialized, /\/Users\//);
    assert.equal(photoIntakeHasForbiddenContent({ session, evidence }), false);
  });

  it("supports trait-only intake without requiring a photo", () => {
    const session = createPhotoIntakePrivacySession({
      catName: "Mochi",
      approvedTraits: "black cat, green eyes, short hair"
    });

    assert.equal(session.status, "accepted");
    assert.equal(session.reasonCode, "photo_not_selected");
    assert.equal(session.photoReferenceMode, "not_provided");
    assert.equal(session.photoSummary.provided, false);
  });

  it("rejects unsafe photo metadata and unsafe trait text", () => {
    const unsafeTraits = createPhotoIntakePrivacySession({
      catName: "Mochi",
      approvedTraits: "see /Users/example/cat.png with GPS data"
    });
    const unsafePhoto = createPhotoIntakePrivacySession({
      catName: "Mochi",
      approvedTraits: "orange tabby",
      photo: {
        fileName: "cat.gif",
        mediaType: "image/gif",
        sizeBytes: 1000
      },
      localReferenceConsent: true
    });
    const noConsent = createPhotoIntakePrivacySession({
      catName: "Mochi",
      approvedTraits: "orange tabby",
      photo: {
        fileName: "cat.png",
        mediaType: "image/png",
        sizeBytes: 1000
      },
      localReferenceConsent: false
    });

    assert.equal(unsafeTraits.status, "rejected");
    assert.equal(unsafeTraits.reasonCode, "trait_invalid");
    assert.equal(unsafePhoto.status, "rejected");
    assert.equal(unsafePhoto.reasonCode, "photo_type_unsupported");
    assert.equal(noConsent.status, "rejected");
    assert.equal(noConsent.reasonCode, "local_reference_consent_required");
  });

  it("flags forbidden serialized diagnostics", () => {
    assert.equal(photoIntakeHasForbiddenContent({ path: "/Users/example/cat.png" }), true);
    assert.equal(photoIntakeHasForbiddenContent({ auth: "Authorization Bearer secret" }), true);
    assert.equal(photoIntakeHasForbiddenContent({ note: "raw photo bytes" }), true);
  });
});
