import {
  buildV36Context,
  evidenceHeader,
  printResult,
  scanBlock,
  v36Date,
  visualGoldenRows,
  writeEvidence
} from "./v36_smoke_common.mjs";

const context = buildV36Context();
const scan = scanBlock(context.goldens);
const ok = context.goldens.status === "passed" && scan.claimScan.status === "passed" && scan.securityScan.status === "passed";
const evidencePath = writeEvidence(`docs/V36.x/evidence/v36_1-visual-goldens-${v36Date}.md`, [
  evidenceHeader({
    title: "V36.1 Visual Goldens Evidence",
    phase: "V36.1 visual goldens",
    spec: "docs/V36.x/v36_1-visual-goldens-spec.md"
  }),
  "## Visual Golden Samples",
  "| sampleId | difficulty | intakeStatus | sourceKind | sourceRef | licenseOrPermissionSummary |",
  "| --- | --- | --- | --- | --- | --- |",
  visualGoldenRows(context.goldens),
  "",
  "## Result",
  `- Status: ${context.goldens.status}`,
  `- Sample count: ${context.goldens.samples.length}`,
  `- Passed intake count: ${context.goldens.passedIntakeCount}`,
  `- Source boundary status: ${context.goldens.sourceBoundaryStatus}`,
  `- Reason codes: ${context.goldens.reasonCodes.join(", ")}`,
  "",
  scan.markdown,
  "## Scoped Decision",
  ok ? "- passed scoped: visual goldens are ready for V36.2-V36.7 scoped testing." : "- failed or blocked: visual goldens cannot be used for later phases.",
  ""
].join("\n"));

printResult({ ok, status: ok ? "passed scoped" : context.goldens.status, evidencePath });
