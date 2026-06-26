import { buildV37Context, evidenceHeader, htmlReport, printResult, scanBlock, v37Date, writeEvidence } from "./v37_smoke_common.mjs";

const context = buildV37Context();
const scan = scanBlock(context.snapshot.humanGate);
const ok = context.snapshot.humanGate.status === "passed" && scan.claimScan.status === "passed" && scan.securityScan.status === "passed";
const reportPath = writeEvidence(`docs/V37.x/evidence/v37_6-visual-review-report-${v37Date}.html`, htmlReport(context));
const body = [
  evidenceHeader({ title: "V37.6 Visual Review Report", phase: "V37.6 visual review and report", spec: "docs/V37.x/v37-engineering-implementation-blueprint.md" }),
  "## Visual Report",
  `- HTML report: ${reportPath}`,
  `- Human target-experience count: ${context.snapshot.humanGate.targetExperienceCount}`,
  `- Conflict count: ${context.snapshot.humanGate.reviews.filter((review) => review.conflictWithAutomatedScore).length}`,
  "",
  scan.markdown,
  "## Scoped Decision",
  ok ? "- passed scoped: V37.6 visual review report was generated with scoped model-level review evidence. It is not raw-photo pixel or screenshot-backed animation acceptance." : "- failed: visual review report gate did not pass.",
  ""
].join("\n");
const evidencePath = writeEvidence(`docs/V37.x/evidence/v37_6-visual-review-report-${v37Date}.md`, body);
printResult({ ok, status: ok ? "passed scoped" : "failed", evidencePath, reportPath });
