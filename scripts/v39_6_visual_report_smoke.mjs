import { buildV39Context, phaseHeader, printResult, scanBlock, v39Date, writeEvidence, writeVisualReport } from "./v39_smoke_common.mjs";

const context = buildV39Context();
const report = writeVisualReport(context);
const scans = scanBlock({ report, snapshot: context.snapshot });
const ok = context.pipeline.actionPacks.length >= 2
  && report.htmlRel.endsWith(".html")
  && scans.claimScan.status === "passed"
  && scans.securityScan.status === "passed";

const body = [
  phaseHeader({
    title: "V39.6 Visual Report Evidence",
    phase: "V39.6 automated visual report",
    spec: "Chinese HTML report with source, character, part map, actions, product path, failures, and scans"
  }),
  "## Visual Report",
  `- HTML report: ${report.htmlRel}.`,
  `- Visual assets: ${report.assets.evidenceRoot}.`,
  `- Generated sample count: ${report.assets.sampleCount}.`,
  "",
  scans.markdown,
  "## Decision",
  `- Status: ${ok ? "passed scoped" : "failed"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V39.x/evidence/v39_6-visual-report-${v39Date}.md`, body);
printResult({ ok, evidencePath, htmlReport: report.htmlRel, assets: report.assets, scans });
