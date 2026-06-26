import {
  assessmentRows,
  buildV35Context,
  buildV35FinalDecision,
  comparisonRows,
  evidenceHeader,
  printResult,
  scanBlock,
  v35Date,
  writeEvidence
} from "./v35_smoke_common.mjs";

const logRelPath = `docs/V35.x/evidence/v35_6-final-route-decision-${v35Date}.md`;
const reportRelPath = "docs/V35.x/v35-final-route-decision-report.md";
const phaseEvidence = [
  `docs/V35.x/evidence/v35_1-target-experience-rubric-${v35Date}.md`,
  `docs/V35.x/evidence/v35_2-route-a2-quality-uplift-${v35Date}.md`,
  `docs/V35.x/evidence/v35_3-route-b-source-boundary-${v35Date}.md`,
  `docs/V35.x/evidence/v35_4-same-sample-route-comparison-${v35Date}.md`,
  `docs/V35.x/evidence/v35_5-product-ux-evidence-${v35Date}.md`
];
const context = buildV35Context();
const decision = buildV35FinalDecision(context, phaseEvidence);

const report = [
  "# V35 Final Route Decision Report",
  "",
  `Date: ${v35Date}`,
  "",
  "## Phase Summary",
  "- V35.1 target-experience rubric: evidence generated.",
  "- V35.2 Route A2 quality uplift: named-sample uplift candidates generated and assessed.",
  "- V35.3 Route B source boundary: professional-assisted boundary recorded; no professional asset supplied in this run.",
  "- V35.4 same-sample comparison: Route A2 and Route B compared on same sample IDs and same rubric.",
  "- V35.5 product UX evidence: preview, target-only apply, rollback, and blocked route behavior recorded.",
  "",
  "## Route Decision",
  `- Decision: ${decision.decision}`,
  `- Recommendation: ${decision.routeRecommendation}`,
  `- Narrow final claim: ${decision.narrowFinalClaim}`,
  "",
  "## Route Assessments",
  "| Route | Candidate | Sample | Rubric | QA | Avg Motion | Source | Reasons |",
  "| --- | --- | --- | --- | --- | ---: | --- | --- |",
  assessmentRows([...context.routeA2Assessments, ...context.routeBAssessments]),
  "",
  "## Route Comparison",
  "| Sample | Route A2 Candidate | Route A2 Status | Route B Candidate | Route B Status | Winner | Reasons |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  comparisonRows(context.comparisons),
  "",
  "## Evidence Refs",
  ...phaseEvidence.map((item) => `- ${item}`),
  "",
  "## Remaining Risks",
  ...decision.remainingRisks.map((item) => `- ${item}`),
  "",
  "## Claim Scan",
  `- Status: ${decision.claimScanStatus}`,
  "",
  "## Security Scan",
  `- Status: ${decision.securityScanStatus}`,
  ""
].join("\n");
writeEvidence(reportRelPath, report);

const logBody = [
  evidenceHeader({
    title: "V35.6 Final Route Decision Evidence",
    phase: "V35.6 final route decision",
    spec: "docs/V35.x/v35_6-final-route-decision-spec.md"
  }),
  "## Final Decision Snapshot",
  `- Decision: ${decision.decision}`,
  `- Recommendation: ${decision.routeRecommendation}`,
  `- Sample count: ${decision.sampleCount}`,
  `- Target-experience count: ${decision.targetExperienceCount}`,
  `- Engineering-only count: ${decision.engineeringOnlyCount}`,
  `- Blocked count: ${decision.blockedCount}`,
  `- Failed count: ${decision.failedCount}`,
  "",
  "## Final Report",
  `- ${reportRelPath}`,
  "",
  "## Decision",
  `- Status: ${decision.decision}`,
  ""
].join("\n");
const scans = scanBlock({ decision, report, logBody });
const logPath = writeEvidence(logRelPath, `${logBody}${scans.markdown}`);

printResult({
  ok: decision.decision !== "V35 failed" && scans.claimScan.status === "passed" && scans.securityScan.status === "passed",
  evidencePath: logPath,
  reportPath: reportRelPath,
  decision: decision.decision,
  recommendation: decision.routeRecommendation,
  claimScan: scans.claimScan.status,
  securityScan: scans.securityScan.status
});
