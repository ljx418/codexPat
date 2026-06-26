import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  V38_TARGET_ACTION_IDS,
  buildV38PublicPhotoActionEvidenceSnapshot,
  createV38BundledPublicPhotoActionPipeline,
  createV38PublicPhotoActionPipeline,
  createV38SourceManifest,
  runV38ClaimScan,
  v38PublicPhotoActionPipelineHasForbiddenContent,
  type V38RenderableActionFramePack,
  type V38SanitizedPixelAsset
} from "./v38-public-photo-action-pipeline";

describe("V38 public photo action pipeline", () => {
  it("defines a public-source manifest with passing, negative, and blocked samples", () => {
    const manifest = createV38SourceManifest();

    assert.equal(manifest.status, "passed");
    assert.equal(manifest.passingCatCount, 3);
    assert.equal(manifest.negativeCount, 1);
    assert.equal(manifest.blockedCount, 1);
    assert.equal(manifest.sources.every((source) => source.sourcePage.startsWith("https://commons.wikimedia.org/wiki/File:")), true);
    assert.equal(v38PublicPhotoActionPipelineHasForbiddenContent(manifest), false);
  });

  it("requires sanitized pixels and renderable frame packs before the pipeline can pass", () => {
    const empty = createV38PublicPhotoActionPipeline();

    assert.equal(empty.status, "blocked");
    assert.match(empty.reasonCodes.join(","), /sanitized_public_photo_count_too_low/);
    assert.match(empty.reasonCodes.join(","), /renderable_public_photo_pack_count_too_low/);
  });

  it("passes scoped only when three public cat samples have sanitized pixels and renderable packs", () => {
    const assets: V38SanitizedPixelAsset[] = ["v38_orange_tabby_public", "v38_tuxedo_public", "v38_a_cat_public"].map((sampleId) => ({
      sampleId,
      sanitizedImageRef: `docs/V38.x/evidence/assets/${sampleId}/sanitized.png`,
      sourcePage: `https://commons.wikimedia.org/wiki/File:${sampleId}`,
      sourceHashRef: `docs/V38.x/evidence/assets/${sampleId}/sha256.txt`,
      width: 512,
      height: 512,
      averageColor: "#887766",
      exifStripped: true,
      status: "passed",
      reasonCodes: ["sanitized_public_photo_ready"]
    }));
    const packs: V38RenderableActionFramePack[] = assets.map((asset) => ({
      sampleId: asset.sampleId,
      candidateId: `${asset.sampleId}_v38_public_photo_pack`,
      contactSheetRef: `docs/V38.x/evidence/assets/${asset.sampleId}/contact-sheet.png`,
      animatedPreviewRef: `docs/V38.x/evidence/assets/${asset.sampleId}/animated-preview.gif`,
      actionCoverage: [...V38_TARGET_ACTION_IDS],
      frameCountByAction: Object.fromEntries(V38_TARGET_ACTION_IDS.map((actionId) => [actionId, 4])) as V38RenderableActionFramePack["frameCountByAction"],
      localMotionModel: "source_bound_photo_base_with_local_overlays",
      wholeImageTransformOnly: false,
      status: "renderable",
      reasonCodes: ["renderable_frame_pack_ready"]
    }));
    const pipeline = createV38PublicPhotoActionPipeline({ sanitizedAssets: assets, renderablePacks: packs });
    const snapshot = buildV38PublicPhotoActionEvidenceSnapshot(pipeline);

    assert.equal(pipeline.status, "passed");
    assert.equal(runV38ClaimScan(snapshot).status, "passed");
    assert.equal(v38PublicPhotoActionPipelineHasForbiddenContent(snapshot), false);
  });

  it("exposes bundled generated public assets for the product UI panel", () => {
    const pipeline = createV38BundledPublicPhotoActionPipeline();
    const firstAsset = pipeline.sanitizedAssets[0];
    const firstPack = pipeline.renderablePacks[0];

    assert.equal(pipeline.status, "passed");
    assert.equal(pipeline.sanitizedAssets.length, 3);
    assert.equal(pipeline.renderablePacks.length, 3);
    assert.equal(firstAsset.sanitizedImageRef.startsWith("/v38/"), true);
    assert.equal(firstPack.contactSheetRef.startsWith("/v38/"), true);
    assert.equal(firstPack.animatedPreviewRef.endsWith(".gif"), true);
  });
});
