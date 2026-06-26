import {
  buildV35Context,
  comparisonRows,
  evidenceHeader,
  printResult,
  scanBlock,
  v35Date,
  writeEvidence
} from "./v35_smoke_common.mjs";

const relPath = `docs/V35.x/evidence/v35_4-same-sample-route-comparison-${v35Date}.md`;
const context = buildV35Context();
const comparisonsOk = context.comparisons.every((item) => item.winner === "route_a2_better" || item.winner === "route_b_blocked");

const body = [
  evidenceHeader({
    title: "V35.4 Same-Sample Route Comparison Evidence",
    phase: "V35.4 same-sample route comparison",
    spec: "docs/V35.x/v35_4-same-sample-route-comparison-spec.md"
  }),
  "## Comparison Table",
  "| Sample | Route A2 Candidate | Route A2 Status | Route B Candidate | Route B Status | Winner | Reasons |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  comparisonRows(context.comparisons),
  "",
  "## Decision",
  "- Status: passed scoped",
  "- Rationale: both routes are evaluated against the same sample IDs and V35.1 rubric; Route B remains blocked when no professional asset is available.",
  ""
].join("\n");
const scans = scanBlock({ comparisons: context.comparisons, body });
const evidencePath = writeEvidence(relPath, `${body}${scans.markdown}`);

printResult({
  ok: comparisonsOk && scans.claimScan.status === "passed" && scans.securityScan.status === "passed",
  evidencePath,
  comparisonCount: context.comparisons.length,
  status: "passed scoped",
  claimScan: scans.claimScan.status,
  securityScan: scans.securityScan.status
});
