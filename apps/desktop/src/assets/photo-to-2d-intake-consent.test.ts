import assert from "node:assert/strict";
import { statSync } from "node:fs";
import { describe, it } from "node:test";
import {
  buildPhoto2DIntakeEvidenceSnapshot,
  createPhoto2DIntakeConsentSession,
  photo2DIntakeHasForbiddenContent
} from "./photo-to-2d-intake-consent";

const REAL_FIXTURE_PATH = "../../fixtures/manual/visual-assets/imported-static-orange-tabby-v1/idle.png";

describe("V15.9 photo-to-2D intake consent boundary", () => {
  it("accepts real local fixture metadata with sanitized evidence only", () => {
    const stats = statSync(REAL_FIXTURE_PATH);
    const session = createPhoto2DIntakeConsentSession({
      sessionId: "v15_9_real_fixture",
      photo: {
        fileName: "cat-reference.png",
        mimeType: "image/png",
        sizeBytes: stats.size,
        width: 512,
        height: 512,
        hasExif: true,
        decodeOk: true
      },
      localProcessingConsent: true
    });
    const evidence = buildPhoto2DIntakeEvidenceSnapshot(session);
    const serialized = JSON.stringify({ session, evidence });

    assert.equal(session.status, "photo_selected");
    assert.equal(session.reasonCode, "exif_redacted");
    assert.equal(session.photoMetadata.hasExif, true);
    assert.equal(session.photoMetadata.exifStripped, true);
    assert.equal(session.privacyBoundary.storesRawPhoto, false);
    assert.equal(session.privacyBoundary.uploadsByDefault, false);
    assert.equal(session.privacyBoundary.persistsExifGps, false);
    assert.equal(session.privacyBoundary.persistsSourceFileName, false);
    assert.equal(session.privacyBoundary.persistsFullPath, false);
    assert.equal(session.privacyBoundary.includesProviderCall, false);
    assert.doesNotMatch(serialized, /fixtures\/manual/);
    assert.doesNotMatch(serialized, /idle\.png/);
    assert.doesNotMatch(serialized, /cat-reference\.png/);
    assert.equal(photo2DIntakeHasForbiddenContent({ session, evidence }), false);
  });

  it("requires local processing consent before accepting a selected photo", () => {
    const session = createPhoto2DIntakeConsentSession({
      sessionId: "v15_9_no_consent",
      photo: {
        fileName: "cat.png",
        mimeType: "image/png",
        sizeBytes: 1000
      },
      localProcessingConsent: false
    });

    assert.equal(session.status, "consent_required");
    assert.equal(session.reasonCode, "consent_required");
    assert.equal(session.privacyBoundary.uploadsByDefault, false);
  });

  it("requires provider terms before allowing provider upload consent", () => {
    const session = createPhoto2DIntakeConsentSession({
      sessionId: "v15_9_provider_terms",
      photo: {
        fileName: "cat.webp",
        mimeType: "image/webp",
        sizeBytes: 1000
      },
      localProcessingConsent: true,
      providerUploadConsent: true,
      providerName: "minimax",
      providerTermsReviewed: false
    });

    assert.equal(session.status, "consent_required");
    assert.equal(session.reasonCode, "provider_terms_required");
    assert.equal(session.consent.providerUploadAllowed, true);
    assert.equal(session.consent.providerName, "minimax");
  });

  it("rejects missing, unsafe, unsupported, too-large, and undecodable photos with stable reason codes", () => {
    const missing = createPhoto2DIntakeConsentSession({ sessionId: "missing" });
    const unsafe = createPhoto2DIntakeConsentSession({
      sessionId: "unsafe",
      photo: { fileName: "/Users/example/cat.png", mimeType: "image/png", sizeBytes: 1000 },
      localProcessingConsent: true
    });
    const unsupported = createPhoto2DIntakeConsentSession({
      sessionId: "unsupported",
      photo: { fileName: "cat.gif", mimeType: "image/gif", sizeBytes: 1000 },
      localProcessingConsent: true
    });
    const tooLarge = createPhoto2DIntakeConsentSession({
      sessionId: "too_large",
      photo: { fileName: "cat.png", mimeType: "image/png", sizeBytes: 13 * 1024 * 1024 },
      localProcessingConsent: true
    });
    const decodeFailed = createPhoto2DIntakeConsentSession({
      sessionId: "decode_failed",
      photo: { fileName: "cat.png", mimeType: "image/png", sizeBytes: 1000, decodeOk: false },
      localProcessingConsent: true
    });

    assert.equal(missing.reasonCode, "photo_required");
    assert.equal(unsafe.reasonCode, "security_scan_failed");
    assert.equal(unsupported.reasonCode, "photo_mime_unsupported");
    assert.equal(tooLarge.reasonCode, "photo_too_large");
    assert.equal(decodeFailed.reasonCode, "photo_decode_failed");
  });

  it("flags forbidden serialized diagnostics", () => {
    assert.equal(photo2DIntakeHasForbiddenContent({ sourcePath: "/Users/example/cat.png" }), true);
    assert.equal(photo2DIntakeHasForbiddenContent({ auth: "Authorization Bearer secret" }), true);
    assert.equal(photo2DIntakeHasForbiddenContent({ note: "raw photo bytes" }), true);
  });
});
