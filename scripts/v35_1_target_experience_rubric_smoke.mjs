import {
  buildV35Context,
  evidenceHeader,
  printResult,
  scanBlock,
  v35Date,
  writeEvidence
} from "./v35_smoke_common.mjs";

const relPath = `docs/V35.x/evidence/v35_1-target-experience-rubric-${v35Date}.md`;
const context = buildV35Context();
const rubric = context.rubric;

const body = [
  evidenceHeader({
    title: "V35.1 Target-Experience Rubric Evidence",
    phase: "V35.1 target-experience rubric",
    spec: "docs/V35.x/v35_1-target-experience-rubric-spec.md"
  }),
  "## Rubric Table",
  `- Rubric ID: ${rubric.rubricId}`,
  `- Sample scope: ${rubric.sampleScope}`,
  `- Required actions: ${rubric.requiredActions.join(", ")}`,
  `- Minimum distinct sample count: ${rubric.minimumDistinctSampleCount}`,
  `- Minimum average local part motion: ${rubric.minimumAverageLocalPartMotionScore}`,
  `- Minimum per-action local part motion: ${rubric.minimumPerActionLocalPartMotionScore}`,
  `- Minimum pose readability: ${rubric.minimumPoseReadabilityScore}`,
  `- Minimum expression or symbol score: ${rubric.minimumExpressionOrSymbolScore}`,
  `- Status scale: ${rubric.statusScale.join(", ")}`,
  `- Review method: ${rubric.reviewMethod}`,
  "",
  "## Hard Non-Pass Examples",
  ...rubric.hardNonPassCriteria.map((item) => `- ${item}`),
  "",
  "## Evidence Requirements",
  ...rubric.requiredEvidenceRefs.map((item) => `- ${item}`),
  "",
  "## Decision",
  "- Status: passed scoped",
  "- Rationale: later candidates can be evaluated without inventing new V35 quality thresholds.",
  ""
].join("\n");
const scans = scanBlock({ rubric, body });
const evidencePath = writeEvidence(relPath, `${body}${scans.markdown}`);

printResult({
  ok: scans.claimScan.status === "passed" && scans.securityScan.status === "passed",
  evidencePath,
  status: "passed scoped",
  claimScan: scans.claimScan.status,
  securityScan: scans.securityScan.status
});
