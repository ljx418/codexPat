import { buildV39Context, phaseHeader, printResult, scanBlock, v39Date, writeEvidence, writeFinalReport, writeVisualReport } from "./v39_smoke_common.mjs";

const context = buildV39Context();
const visual = writeVisualReport(context);
const finalReport = writeFinalReport(context);
const scans = scanBlock({ snapshot: context.snapshot, final: context.final, visual });
const ok = context.final.decision === "passed scoped"
  && context.final.passedSampleCount >= 2
  && context.final.productStatus === "passed"
  && context.final.humanPreferenceStatus === "passed"
  && context.final.routeBStatusSummary === "blocked_honestly"
  && finalReport.scans.claimScan.status === "passed"
  && finalReport.scans.securityScan.status === "passed"
  && scans.claimScan.status === "passed"
  && scans.securityScan.status === "passed";

const body = [
  phaseHeader({
    title: "V39.8 Final Gate Evidence",
    phase: "V39.8 final scoped gate",
    spec: "final phase summary, command results, PRD/spec review, visual report, claim scan, and security scan"
  }),
  "## Final Gate",
  `- Final decision: ${context.final.decision}.`,
  `- Passed sample count: ${context.final.passedSampleCount}.`,
  `- Product status: ${context.final.productStatus}.`,
  `- Human preference status: ${context.final.humanPreferenceStatus}.`,
  `- Route B status summary: ${context.final.routeBStatusSummary}.`,
  `- Visual report: ${visual.htmlRel}.`,
  `- Final report: ${finalReport.reportRel}.`,
  "",
  "## Command Summary",
  "- V39.1-V39.8 smoke scripts executed in sequence.",
  "- Baseline checks must still include desktop test/check, petctl test, V30 semantic gate, git diff check, claim scan, and security scan before release claims.",
  "",
  scans.markdown,
  "## Decision",
  `- Status: ${ok ? "passed scoped" : "failed"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V39.x/evidence/v39_8-final-gate-${v39Date}.md`, body);
printResult({ ok, evidencePath, final: context.final, visual, finalReport: finalReport.reportRel, scans });
