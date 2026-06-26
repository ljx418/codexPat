import {
  assessmentRows,
  buildV35Context,
  evidenceHeader,
  printResult,
  productRows,
  scanBlock,
  v35Date,
  writeEvidence
} from "./v35_smoke_common.mjs";

const relPath = `docs/V35.x/evidence/v35_2-route-a2-quality-uplift-${v35Date}.md`;
const context = buildV35Context();
const passed = context.routeA2Assessments.filter((item) => item.rubricStatus === "target_experience");

const body = [
  evidenceHeader({
    title: "V35.2 Route A2 Quality Uplift Evidence",
    phase: "V35.2 Route A2 quality uplift",
    spec: "docs/V35.x/v35_2-route-a2-quality-uplift-spec.md"
  }),
  "## Development Result",
  "- Implemented local Route A2 uplift candidate generation from V34 generated packs.",
  "- Uplift adds higher local part motion scores, action symbols, expression/pose cues, contact sheet refs, playback refs, and product path evidence.",
  "- Route A2 remains named-sample scoped and local project-authored.",
  "",
  "## Route A2 Assessments",
  "| Route | Candidate | Sample | Rubric | QA | Avg Motion | Source | Reasons |",
  "| --- | --- | --- | --- | --- | ---: | --- | --- |",
  assessmentRows(context.routeA2Assessments),
  "",
  "## Product Path Summary",
  "| Candidate | Sample | QA | Preview | Apply | Rollback | Failed Candidate Blocked |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  productRows(context),
  "",
  "## Visual Evidence Refs",
  ...context.routeA2Packs.flatMap((pack) => [
    `- ${pack.contactSheetEvidenceRef}`,
    `- ${pack.playbackEvidenceRef}`
  ]),
  "",
  "## Decision",
  `- Status: ${passed.length >= context.rubric.minimumDistinctSampleCount ? "passed scoped" : "partial scoped"}`,
  "- Rationale: Route A2 uplift is evaluated by V35.1 rubric and V33/V34 product path; human visual review remains a residual risk.",
  ""
].join("\n");
const scans = scanBlock({ assessments: context.routeA2Assessments, products: context.routeA2ProductResults, body });
const evidencePath = writeEvidence(relPath, `${body}${scans.markdown}`);

printResult({
  ok: passed.length >= context.rubric.minimumDistinctSampleCount && scans.claimScan.status === "passed" && scans.securityScan.status === "passed",
  evidencePath,
  passedCount: passed.length,
  status: passed.length >= context.rubric.minimumDistinctSampleCount ? "passed scoped" : "partial scoped",
  claimScan: scans.claimScan.status,
  securityScan: scans.securityScan.status
});
