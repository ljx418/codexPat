import {
  buildV36Context,
  evidenceHeader,
  printResult,
  routeBRows,
  scanBlock,
  v36Date,
  writeEvidence
} from "./v36_smoke_common.mjs";

const context = buildV36Context();
const scan = scanBlock(context.routeB);
const ok = context.routeB.status === "blocked_scoped" && scan.claimScan.status === "passed" && scan.securityScan.status === "passed";
const evidencePath = writeEvidence(`docs/V36.x/evidence/v36_3-route-b-real-assets-${v36Date}.md`, [
  evidenceHeader({
    title: "V36.3 Route B Real Assets Evidence",
    phase: "V36.3 Route B real assets",
    spec: "docs/V36.x/v36_3-route-b-real-assets-spec.md"
  }),
  "## Route B Source-Bound Asset Matrix",
  "| sampleId | status | rubricStatus | assetProvenance | reasonCodes |",
  "| --- | --- | --- | --- | --- |",
  routeBRows(context.routeB),
  "",
  "## Result",
  `- Status: ${context.routeB.status}`,
  `- Available count: ${context.routeB.availableCount}`,
  `- Partial count: ${context.routeB.partialCount}`,
  `- Blocked count: ${context.routeB.blockedCount}`,
  `- Reason codes: ${context.routeB.reasonCodes.join(", ")}`,
  "",
  scan.markdown,
  "## Scoped Decision",
  "- blocked scoped: no real source-bound professional-assisted Route B asset is available in this run. Route B cannot participate in a winning comparison.",
  ""
].join("\n"));

printResult({ ok, status: "blocked scoped", evidencePath, routeBStatus: context.routeB.status });
