import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  compareV36SameSampleRoutes,
  createV36DefaultVisualGoldenInputs,
  createV36GeneralizationMatrix,
  createV36HumanVisualReviewGate,
  createV36ProductUxScreenshotReport,
  createV36RouteA2CeilingAnalysis,
  createV36RouteBRealAssetResult,
  createV36VisualGoldenSet,
  decideV36FinalRiskClosure,
  v36HasForbiddenContent,
  type V36RouteBAssetInput
} from "./v36-risk-closure";

describe("V36 risk closure", () => {
  it("builds 8+ public metadata visual goldens without storing raw image data", () => {
    const goldens = createV36VisualGoldenSet();

    assert.equal(goldens.status, "passed");
    assert.equal(goldens.samples.length >= 8, true);
    assert.equal(goldens.sourceBoundaryStatus, "complete");
    assert.equal(goldens.samples.every((sample) => sample.sourceBoundary.rawImageStored === false), true);
    assert.equal(goldens.samples.every((sample) => sample.sourceBoundary.exifGpsStored === false), true);
    assert.equal(v36HasForbiddenContent(goldens), false);
  });

  it("records Route A2 ceiling risk instead of silently expanding V35 scoped pass", () => {
    const goldens = createV36VisualGoldenSet();
    const routeA2 = createV36RouteA2CeilingAnalysis(goldens);

    assert.equal(routeA2.samples.length >= 6, true);
    assert.equal(routeA2.targetExperienceCount >= 2, true);
    assert.equal(routeA2.engineeringOnlyCount > 0 || routeA2.blockedCount > 0, true);
    assert.equal(routeA2.recommendation !== "blocked", true);
    assert.equal(routeA2.samples.some((sample) => sample.reasonCodes.includes("route_a2_template_similarity_high")), true);
    assert.equal(v36HasForbiddenContent(routeA2), false);
  });

  it("keeps Route B blocked when real professional assisted assets are missing", () => {
    const goldens = createV36VisualGoldenSet();
    const routeB = createV36RouteBRealAssetResult(goldens);

    assert.equal(routeB.status, "blocked_scoped");
    assert.equal(routeB.availableCount, 0);
    assert.equal(routeB.blockedCount >= 2, true);
    assert.equal(routeB.reasonCodes.includes("route_b_real_assets_not_available"), true);
  });

  it("requires two same-sample Route B assets before full comparison can pass", () => {
    const goldens = createV36VisualGoldenSet();
    const routeA2 = createV36RouteA2CeilingAnalysis(goldens);
    const oneAsset = createV36RouteBRealAssetResult(goldens, [assetFor(routeA2.samples[0].sampleId, routeA2.samples[0].characterAssetId)]);
    const oneComparison = compareV36SameSampleRoutes(routeA2, oneAsset);
    const twoAsset = createV36RouteBRealAssetResult(goldens, [
      assetFor(routeA2.samples[0].sampleId, routeA2.samples[0].characterAssetId),
      assetFor(routeA2.samples[1].sampleId, routeA2.samples[1].characterAssetId)
    ]);
    const twoComparison = compareV36SameSampleRoutes(routeA2, twoAsset);

    assert.equal(oneAsset.status, "partial_scoped");
    assert.equal(oneComparison.status, "partial_scoped");
    assert.equal(twoAsset.status, "available_for_full_comparison");
    assert.equal(twoComparison.status, "passed");
    assert.equal(twoComparison.completedComparisonCount, 2);
  });

  it("uses human review as a target-experience gate and produces a narrow final decision", () => {
    const goldens = createV36VisualGoldenSet();
    const routeA2 = createV36RouteA2CeilingAnalysis(goldens);
    const routeB = createV36RouteBRealAssetResult(goldens);
    const comparison = compareV36SameSampleRoutes(routeA2, routeB);
    const matrix = createV36GeneralizationMatrix(routeA2);
    const review = createV36HumanVisualReviewGate(matrix, routeA2);
    const product = createV36ProductUxScreenshotReport({
      reportPath: "docs/V36.x/evidence/v36_7-product-ux-report-2026-06-26.html",
      routeA2,
      routeB,
      review,
      claimScanStatus: "passed",
      securityScanStatus: "passed"
    });
    const final = decideV36FinalRiskClosure({
      goldens,
      routeA2,
      routeB,
      comparison,
      generalization: matrix,
      review,
      product,
      claimScanStatus: "passed",
      securityScanStatus: "passed"
    });

    assert.equal(matrix.sampleCount, 20);
    assert.equal(review.targetExperienceCount >= 2, true);
    assert.equal(product.status, "partial_scoped");
    assert.equal(final.decision, "V36 partial scoped");
    assert.match(final.narrowFinalClaim, /Route B remained blocked/);
    assert.equal(v36HasForbiddenContent(final), false);
  });
});

function assetFor(sampleId: string, characterAssetId: string): V36RouteBAssetInput {
  return {
    sampleId,
    characterAssetId,
    sourceBoundaryId: `${sampleId}_professional_assisted_boundary`,
    assetProvenance: "professional_assisted_import",
    licenseOrPermissionSummary: "project reviewed source-bound professional assisted asset permission summary",
    partMapBinding: `docs/V36.x/evidence/derivatives/${sampleId}-part-map-binding`,
    frameSequenceEvidence: [`docs/V36.x/evidence/derivatives/${sampleId}-route-b-frame-sequence`],
    qaEvidence: [`docs/V36.x/evidence/derivatives/${sampleId}-route-b-qa`],
    productPathEvidence: [`docs/V36.x/evidence/derivatives/${sampleId}-route-b-product-path`],
    visualQualityScore: 0.9
  };
}
