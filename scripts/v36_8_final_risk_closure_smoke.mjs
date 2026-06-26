import {
  buildV36Context,
  buildV36FinalDecision,
  comparisonRows,
  evidenceHeader,
  matrixRows,
  printResult,
  publicRouteA2,
  routeA2Rows,
  routeBRows,
  scanBlock,
  v36Date,
  visualGoldenRows,
  writeEvidence
} from "./v36_smoke_common.mjs";

const context = buildV36Context();
const finalDecision = buildV36FinalDecision(context, [
  `docs/V36.x/evidence/v36_1-visual-goldens-${v36Date}.md`,
  `docs/V36.x/evidence/v36_2-route-a2-ceiling-${v36Date}.md`,
  `docs/V36.x/evidence/v36_3-route-b-real-assets-${v36Date}.md`,
  `docs/V36.x/evidence/v36_4-route-comparison-${v36Date}.md`,
  `docs/V36.x/evidence/v36_5-generalization-matrix-${v36Date}.md`,
  `docs/V36.x/evidence/v36_6-human-visual-review-${v36Date}.md`,
  `docs/V36.x/evidence/v36_7-product-ux-report-${v36Date}.html`
]);
const scan = scanBlock({ finalDecision, routeA2: publicRouteA2(context.routeA2), routeB: context.routeB, comparison: context.comparison });
const ok = finalDecision.decision === "V36 partial scoped" && scan.claimScan.status === "passed" && scan.securityScan.status === "passed";
const body = [
  evidenceHeader({
    title: "V36.8 Final Risk Closure Report",
    phase: "V36.8 final risk closure gate",
    spec: "docs/V36.x/v36_8-final-risk-closure-spec.md"
  }),
  "## Phase Summary",
  `- V36.1 visual goldens: ${context.goldens.status}`,
  `- V36.2 Route A2 ceiling: ${context.routeA2.recommendation}`,
  `- V36.3 Route B real assets: ${context.routeB.status}`,
  `- V36.4 same-sample comparison: ${context.comparison.status}`,
  `- V36.5 generalization matrix: ${context.generalization.status}`,
  `- V36.6 human visual review: ${context.review.status}`,
  `- V36.7 product UX report: ${context.product.status}`,
  "",
  "## PRD Target Mapping",
  `- 8+ visual goldens: ${context.goldens.samples.length}`,
  `- 2 same-sample Route A2 / Route B comparisons: ${context.comparison.completedComparisonCount}; Route B unavailable, so this remains blocked.`,
  `- Generalization samples: ${context.generalization.sampleCount}`,
  `- Human review target-experience count: ${context.review.targetExperienceCount}`,
  `- Product path: preview ${context.product.previewStatus}, apply ${context.product.applyStatus}, rollback ${context.product.rollbackStatus}`,
  "",
  "## Visual Goldens",
  "| sampleId | difficulty | intakeStatus | sourceKind | sourceRef | licenseOrPermissionSummary |",
  "| --- | --- | --- | --- | --- | --- |",
  visualGoldenRows(context.goldens),
  "",
  "## Route A2 Ceiling",
  "| sampleId | candidateId | difficulty | status | templateSimilarity | identityDifferentiation | localMotionCeiling | reasonCodes |",
  "| --- | --- | --- | --- | --- | --- | --- | --- |",
  routeA2Rows(context.routeA2),
  "",
  "## Route B",
  "| sampleId | status | rubricStatus | assetProvenance | reasonCodes |",
  "| --- | --- | --- | --- | --- |",
  routeBRows(context.routeB),
  "",
  "## Same-Sample Comparison",
  "| sampleId | routeA2CandidateId | routeA2Status | routeBCandidateId | routeBStatus | winner | reasonCodes |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  comparisonRows(context.comparison),
  "",
  "## Generalization Matrix",
  "| sampleId | difficulty | routeId | rubricStatus | humanReviewStatus | productPathStatus | reasonCodes |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  matrixRows(context.generalization),
  "",
  "## Final Decision",
  `- Decision: ${finalDecision.decision}`,
  `- Route recommendation: ${finalDecision.routeRecommendation}`,
  `- Narrow final claim: ${finalDecision.narrowFinalClaim}`,
  `- Remaining risks: ${finalDecision.remainingRisks.join(" / ")}`,
  "",
  scan.markdown,
  "## Scoped Decision",
  ok ? "- partial scoped: V36 has scoped Route A2 and generalization evidence, but Route B real assets remain blocked." : "- failed or blocked: final gate did not pass scan or expected decision.",
  ""
].join("\n");
const evidencePath = writeEvidence("docs/V36.x/v36-final-risk-closure-report.md", body);
writeEvidence(`docs/V36.x/evidence/v36_8-final-risk-closure-${v36Date}.md`, body);

printResult({ ok, status: ok ? "partial scoped" : finalDecision.decision, evidencePath, decision: finalDecision.decision });
