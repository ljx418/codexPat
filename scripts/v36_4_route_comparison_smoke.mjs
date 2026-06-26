import {
  buildV36Context,
  comparisonRows,
  evidenceHeader,
  printResult,
  scanBlock,
  v36Date,
  writeEvidence
} from "./v36_smoke_common.mjs";

const context = buildV36Context();
const scan = scanBlock(context.comparison);
const ok = context.comparison.status === "blocked_scoped" && scan.claimScan.status === "passed" && scan.securityScan.status === "passed";
const evidencePath = writeEvidence(`docs/V36.x/evidence/v36_4-route-comparison-${v36Date}.md`, [
  evidenceHeader({
    title: "V36.4 Same-Sample Route Comparison Evidence",
    phase: "V36.4 same-sample comparison",
    spec: "docs/V36.x/v36_4-route-comparison-spec.md"
  }),
  "## Same-Sample Comparison Matrix",
  "| sampleId | routeA2CandidateId | routeA2Status | routeBCandidateId | routeBStatus | winner | reasonCodes |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  comparisonRows(context.comparison),
  "",
  "## Result",
  `- Status: ${context.comparison.status}`,
  `- Completed comparison count: ${context.comparison.completedComparisonCount}`,
  `- Reason codes: ${context.comparison.reasonCodes.join(", ")}`,
  "",
  scan.markdown,
  "## Scoped Decision",
  "- blocked scoped: same-sample Route A2 / Route B comparison cannot pass because Route B assets are unavailable.",
  ""
].join("\n"));

printResult({ ok, status: "blocked scoped", evidencePath, comparisonStatus: context.comparison.status });
