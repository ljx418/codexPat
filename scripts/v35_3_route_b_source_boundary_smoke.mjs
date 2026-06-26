import {
  buildV35Context,
  evidenceHeader,
  printResult,
  scanBlock,
  v35Date,
  writeEvidence
} from "./v35_smoke_common.mjs";

const relPath = `docs/V35.x/evidence/v35_3-route-b-source-boundary-${v35Date}.md`;
const context = buildV35Context();
const boundaryRows = context.routeBBoundaries.map((item) =>
  `| ${item.sourceBoundaryId} | ${item.sampleId} | ${item.characterAssetId} | ${item.assetProvenance} | ${item.status} | ${item.reasonCodes.join(", ")} |`
).join("\n");

const body = [
  evidenceHeader({
    title: "V35.3 Route B Source Boundary Evidence",
    phase: "V35.3 Route B source boundary",
    spec: "docs/V35.x/v35_3-route-b-source-boundary-spec.md"
  }),
  "## Source Boundary Table",
  "| Boundary | Sample | Character Asset | Provenance | Status | Reasons |",
  "| --- | --- | --- | --- | --- | --- |",
  boundaryRows,
  "",
  "## Route B Decision",
  "- Route B is recorded as professional assisted import boundary.",
  "- No professional frameSequence or rig-ready parts were supplied in this run.",
  "- Therefore Route B is blocked/not executed for comparison, not passed.",
  "",
  "## Decision",
  "- Status: passed scoped for boundary recording; Route B execution blocked",
  "- Rationale: source, permission, sample binding, QA, and product path requirements are explicit and cannot be silently bypassed.",
  ""
].join("\n");
const scans = scanBlock({ boundaries: context.routeBBoundaries, body });
const evidencePath = writeEvidence(relPath, `${body}${scans.markdown}`);

printResult({
  ok: context.routeBBoundaries.every((item) => item.status === "blocked_not_executed") && scans.claimScan.status === "passed" && scans.securityScan.status === "passed",
  evidencePath,
  boundaryCount: context.routeBBoundaries.length,
  status: "passed scoped for boundary; route b blocked",
  claimScan: scans.claimScan.status,
  securityScan: scans.securityScan.status
});
