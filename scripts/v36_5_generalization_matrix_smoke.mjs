import {
  buildV36Context,
  evidenceHeader,
  matrixRows,
  printResult,
  scanBlock,
  v36Date,
  writeEvidence
} from "./v36_smoke_common.mjs";

const context = buildV36Context();
const scan = scanBlock(context.generalization);
const ok = context.generalization.sampleCount >= 20
  && context.generalization.targetExperienceCount >= 2
  && context.generalization.engineeringOnlyCount > 0
  && scan.claimScan.status === "passed"
  && scan.securityScan.status === "passed";
const evidencePath = writeEvidence(`docs/V36.x/evidence/v36_5-generalization-matrix-${v36Date}.md`, [
  evidenceHeader({
    title: "V36.5 Generalization Matrix Evidence",
    phase: "V36.5 generalization matrix",
    spec: "docs/V36.x/v36_5-generalization-matrix-spec.md"
  }),
  "## Generalization Matrix",
  "| sampleId | difficulty | routeId | rubricStatus | humanReviewStatus | productPathStatus | reasonCodes |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  matrixRows(context.generalization),
  "",
  "## Result",
  `- Status: ${context.generalization.status}`,
  `- Sample count: ${context.generalization.sampleCount}`,
  `- Target-experience count: ${context.generalization.targetExperienceCount}`,
  `- Engineering-only count: ${context.generalization.engineeringOnlyCount}`,
  `- Blocked count: ${context.generalization.blockedCount}`,
  `- Failed count: ${context.generalization.failedCount}`,
  `- Reason codes: ${context.generalization.reasonCodes.join(", ")}`,
  "",
  scan.markdown,
  "## Scoped Decision",
  ok ? "- passed scoped: generalization matrix records tested sample statuses and risks." : "- failed or blocked: generalization matrix is insufficient.",
  ""
].join("\n"));

printResult({ ok, status: ok ? "passed scoped" : context.generalization.status, evidencePath });
