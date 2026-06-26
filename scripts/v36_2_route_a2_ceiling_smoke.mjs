import {
  buildV36Context,
  evidenceHeader,
  printResult,
  publicRouteA2,
  routeA2Rows,
  scanBlock,
  v36Date,
  writeEvidence
} from "./v36_smoke_common.mjs";

const context = buildV36Context();
const scan = scanBlock(publicRouteA2(context.routeA2));
const ok = context.routeA2.samples.length >= 6
  && context.routeA2.targetExperienceCount >= 2
  && (context.routeA2.engineeringOnlyCount > 0 || context.routeA2.blockedCount > 0)
  && scan.claimScan.status === "passed"
  && scan.securityScan.status === "passed";
const evidencePath = writeEvidence(`docs/V36.x/evidence/v36_2-route-a2-ceiling-${v36Date}.md`, [
  evidenceHeader({
    title: "V36.2 Route A2 Ceiling Evidence",
    phase: "V36.2 Route A2 ceiling",
    spec: "docs/V36.x/v36_2-route-a2-ceiling-spec.md"
  }),
  "## Route A2 Ceiling Matrix",
  "| sampleId | candidateId | difficulty | status | templateSimilarity | identityDifferentiation | localMotionCeiling | reasonCodes |",
  "| --- | --- | --- | --- | --- | --- | --- | --- |",
  routeA2Rows(context.routeA2),
  "",
  "## Result",
  `- Recommendation: ${context.routeA2.recommendation}`,
  `- Target-experience count: ${context.routeA2.targetExperienceCount}`,
  `- Engineering-only count: ${context.routeA2.engineeringOnlyCount}`,
  `- Reason codes: ${context.routeA2.reasonCodes.join(", ")}`,
  "",
  scan.markdown,
  "## Scoped Decision",
  ok ? "- passed scoped: Route A2 ceiling is measured; target-quality risk remains scoped." : "- failed or blocked: Route A2 ceiling evidence is insufficient.",
  ""
].join("\n"));

printResult({ ok, status: ok ? "passed scoped" : "failed", evidencePath, recommendation: context.routeA2.recommendation });
