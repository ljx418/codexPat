import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createPhotoToAssetOrchestrationSummary,
  photoToAssetOrchestrationHasForbiddenContent
} from "./photo-to-asset-orchestration";

describe("V7.13 photo-to-asset orchestration", () => {
  it("passes scoped 2D and external GLB paths while blocking real provider 3D", () => {
    const summary = createPhotoToAssetOrchestrationSummary({
      traitsApproved: true,
      consentAccepted: true,
      generated2d: {
        name: "generated_2d",
        status: "passed",
        rendererKind: "sprite",
        packId: "imported-static-orange-tabby-v1",
        targetInstanceId: "codex_v713_sprite"
      },
      externalGlbImport: {
        name: "external_glb_import",
        status: "passed",
        reasonCode: "external_glb_import_passed",
        rendererKind: "gltf",
        packId: "imported-gltf-prototype-cat-v1",
        targetInstanceId: "codex_v713_gltf"
      },
      failurePreservation: {
        status: "passed",
        reasonCode: "asset_validation_failed",
        previousPackPreserved: true
      },
      defaultUnchanged: true,
      unrelatedPetsUnchanged: true
    });

    assert.equal(summary.status, "passed");
    assert.ok(summary.reasonCodes.includes("provider_output_missing"));
    assert.ok(summary.reasonCodes.includes("real_provider_3d_branch_blocked"));
    assert.ok(summary.reasonCodes.includes("external_glb_import_passed"));
    assert.ok(summary.reasonCodes.includes("previous_pack_preserved"));
    assert.equal(summary.allowedClaim?.includes("automatic photo-to-3D"), false);
    assert.equal(photoToAssetOrchestrationHasForbiddenContent(summary), false);
  });

  it("blocks when traits are not approved", () => {
    const summary = createPhotoToAssetOrchestrationSummary({
      traitsApproved: false,
      consentAccepted: true,
      generated2d: { name: "generated_2d", status: "blocked" },
      externalGlbImport: { name: "external_glb_import", status: "blocked" },
      failurePreservation: {
        status: "passed",
        reasonCode: "previous_pack_preserved",
        previousPackPreserved: true
      },
      defaultUnchanged: true,
      unrelatedPetsUnchanged: true
    });

    assert.equal(summary.status, "blocked");
    assert.ok(summary.reasonCodes.includes("traits_approval_required"));
    assert.equal(summary.allowedClaim, null);
  });

  it("detects forbidden evidence content", () => {
    assert.equal(photoToAssetOrchestrationHasForbiddenContent({ providerPayload: "raw provider response" }), true);
    assert.equal(photoToAssetOrchestrationHasForbiddenContent({ packId: "safe-pack", status: "passed" }), false);
  });
});
