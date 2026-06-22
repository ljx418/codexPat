import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { WORK_CAT_V1_ASSET_MANIFEST } from "./bundled-packs/work-cat-v1.manifest";
import { PREMIUM_CAT_PACKS } from "./bundled-packs/premium-cats-v1";
import {
  createAssetManagerPackView,
  createManagerActionPreviewViews,
  createManagerRuntimePackView,
  createPetGalleryPackViews,
  sanitizeAssetDisplayName,
  sanitizeFavoritePackIds
} from "./asset-manager-view-model";

describe("V6.4 asset manager view model", () => {
  it("reports healthy pack status using only safe fields", () => {
    const view = createAssetManagerPackView({
      packId: "mochi-sprite",
      displayName: "Mochi",
      rendererKind: "sprite",
      copiedAssetIds: ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"],
      activeInstances: ["codex_123"],
      validationStatus: "valid"
    });

    assert.equal(view.healthStatus, "healthy");
    assert.equal(view.activeInstanceCount, 1);
    assert.equal(view.actionCoverage, "8/8");
    assert.equal(view.reasonCode, "asset_pack_healthy");
    assert.deepEqual(view.previewActions, ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"]);
    assert.equal(JSON.stringify(view).includes("/Users/"), false);
  });

  it("sanitizes display names and reports incomplete packs without raw diagnostics", () => {
    assert.equal(sanitizeAssetDisplayName("  Demo\nPack\t "), "Demo Pack");
    const view = createAssetManagerPackView({
      packId: "bad-pack",
      displayName: "",
      rendererKind: "gltf",
      copiedAssetIds: ["idle"],
      activeInstances: [],
      validationStatus: "valid"
    });

    assert.equal(view.displayName, "bad-pack");
    assert.equal(view.healthStatus, "incomplete");
    assert.equal(view.reasonCode, "asset_pack_incomplete");
  });

  it("reports V10.9 active and fallback pack display without paths", () => {
    const defaultView = createManagerRuntimePackView("default", []);
    assert.equal(defaultView.activePackId, "work-cat-v1");
    assert.equal(defaultView.activeSource, "default");
    assert.equal(defaultView.restoreDefaultAvailable, false);

    const importedView = createManagerRuntimePackView("codex_1", [{
      packId: "imported-orange",
      displayName: "Imported Orange",
      rendererKind: "sprite",
      copiedAssetIds: ["idle"],
      activeInstances: ["codex_1"],
      validationStatus: "valid"
    }]);
    assert.equal(importedView.activePackId, "imported-orange");
    assert.equal(importedView.fallbackPackId, "work-cat-v1");
    assert.equal(importedView.restoreDefaultAvailable, true);
    assert.equal(JSON.stringify(importedView).includes("/Users/"), false);
  });

  it("reports V10.9 safe preview metadata for all core actions", () => {
    const views = createManagerActionPreviewViews(WORK_CAT_V1_ASSET_MANIFEST);
    assert.equal(views.length, 8);
    assert.equal(views.every((view) => view.coverageState === "animated"), true);
    assert.equal(views.every((view) => view.frameCount >= 4), true);
    assert.equal(views.every((view) => typeof view.fps === "number" && view.fps >= 1 && view.fps <= 24), true);
    assert.equal(views.some((view) => view.playbackKind === "loop"), true);
    assert.equal(views.some((view) => view.playbackKind === "urgent"), true);
    assert.equal(JSON.stringify(views).includes("/Users/"), false);
  });

  it("reports V14.3 gallery filters and favorites without mutating runtime fields", () => {
    const views = createPetGalleryPackViews([
      {
        packId: "premium-orange-tabby",
        displayName: "Orange",
        description: "Bundled orange cat",
        rendererKind: "sprite",
        source: "bundled",
        style: "tabby",
        color: "orange",
        motionLevel: "lively",
        qualityBadge: "curated",
        coverageCount: 8,
        actionCount: 8,
        activeInstances: ["default"],
        licenseSummary: "bundled attribution",
        validationStatus: "valid",
        hasLivingActions: false,
        canDelete: false
      },
      {
        packId: "imported-silver",
        displayName: "Imported Silver",
        description: "Imported silver cat",
        rendererKind: "gltf",
        source: "imported",
        style: "short hair",
        color: "silver",
        motionLevel: "calm",
        qualityBadge: "imported",
        coverageCount: 1,
        actionCount: 8,
        activeInstances: [],
        licenseSummary: "user imported",
        validationStatus: "valid",
        hasLivingActions: false,
        canDelete: true
      }
    ], ["premium-orange-tabby"], { favoriteOnly: true, rendererKind: "sprite" });

    assert.equal(views.length, 1);
    assert.equal(views[0].packId, "premium-orange-tabby");
    assert.equal(views[0].isFavorite, true);
    assert.equal(views[0].isActive, true);
    assert.equal(views[0].coverageState, "complete");
    assert.equal(views[0].reasonCode, "gallery_pack_ready");
    assert.deepEqual(views[0].previewActions, ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"]);
    assert.equal(JSON.stringify(views).includes("/Users/"), false);
  });

  it("stores only V14.3 safe favorite pack IDs", () => {
    const ids = sanitizeFavoritePackIds([
      "premium-orange-tabby",
      "../secret",
      "/Users/Zhuanz/token",
      "premium-orange-tabby",
      "missing-pack"
    ], ["premium-orange-tabby", "imported-silver"]);

    assert.deepEqual(ids, ["premium-orange-tabby"]);
  });

  it("supports V29.1 gallery UX evidence with curated packs, filters, favorites, and safe previews", () => {
    const summaries = PREMIUM_CAT_PACKS.map((pack) => ({
      packId: pack.packId,
      displayName: pack.displayName,
      description: pack.description,
      rendererKind: "sprite" as const,
      source: "bundled" as const,
      style: "premium work cat",
      color: pack.paletteName,
      motionLevel: "lively" as const,
      qualityBadge: "curated premium",
      coverageCount: 8,
      actionCount: 8,
      activeInstances: pack.packId === "premium-orange-tabby" ? ["codex_target"] : [],
      licenseSummary: pack.attribution,
      validationStatus: "valid",
      hasLivingActions: false,
      canDelete: false
    }));

    const allViews = createPetGalleryPackViews(summaries, ["premium-orange-tabby"]);
    const favoriteViews = createPetGalleryPackViews(summaries, ["premium-orange-tabby"], {
      favoriteOnly: true,
      rendererKind: "sprite"
    });
    const orangeViews = createPetGalleryPackViews(summaries, [], { color: "orange tabby" });
    const previewMetadata = createManagerActionPreviewViews(PREMIUM_CAT_PACKS[0].manifest);

    assert.ok(allViews.length >= 12);
    assert.equal(favoriteViews.length, 1);
    assert.equal(favoriteViews[0].packId, "premium-orange-tabby");
    assert.equal(favoriteViews[0].isFavorite, true);
    assert.equal(favoriteViews[0].isActive, true);
    assert.equal(orangeViews.length, 1);
    assert.equal(allViews.every((view) => view.previewActions.length === 8), true);
    assert.equal(allViews.every((view) => view.coverageState === "complete"), true);
    assert.equal(previewMetadata.length, 8);
    assert.equal(previewMetadata.every((view) => view.rendererKind === "sprite"), true);
    assert.equal(JSON.stringify({ allViews, favoriteViews, orangeViews, previewMetadata }).includes("/Users/"), false);
  });
});
