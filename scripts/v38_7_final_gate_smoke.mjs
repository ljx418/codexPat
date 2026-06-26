import {
  captureHtmlScreenshot,
  phaseHeader,
  printResult,
  scanBlock,
  v38Date,
  writeEvidence,
  writeFinalReport,
  writeHtmlReport
} from "./v38_smoke_common.mjs";

const htmlRel = writeHtmlReport();
const screenshot = captureHtmlScreenshot(htmlRel);
const final = writeFinalReport({ htmlRel, screenshotRel: screenshot.screenshotRel, screenshotStatus: screenshot.status });
const scans = scanBlock({ final, htmlRel, screenshot });
const ok = final.status === "passed scoped"
  && screenshot.status === "passed"
  && final.scans.claimScan.status === "passed"
  && final.scans.securityScan.status === "passed"
  && scans.claimScan.status === "passed"
  && scans.securityScan.status === "passed";

const body = [
  phaseHeader({
    title: "V38.7 Final Gate Evidence",
    phase: "V38.7 final gate",
    spec: "V38 final public-photo action asset scoped exit"
  }),
  "## Final Gate",
  `- Final status: ${final.status}.`,
  `- Quality decision: ${final.quality.decision}.`,
  `- HTML report: ${htmlRel}.`,
  screenshot.screenshotRel ? `- Screenshot: ${screenshot.screenshotRel}.` : "- Screenshot: blocked.",
  "- Final report: docs/V38.x/v38-final-public-photo-action-report.md.",
  "",
  scans.markdown,
  "## Decision",
  `- Status: ${ok ? "passed scoped" : "blocked"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V38.x/evidence/v38_7-final-gate-${v38Date}.md`, body);
printResult({ ok, evidencePath, final, screenshot });
