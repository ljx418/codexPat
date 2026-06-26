import {
  captureHtmlScreenshot,
  evaluateQualityGate,
  phaseHeader,
  printResult,
  scanBlock,
  v38Date,
  writeEvidence,
  writeHtmlReport
} from "./v38_smoke_common.mjs";

const htmlRel = writeHtmlReport();
const screenshot = captureHtmlScreenshot(htmlRel);
const quality = evaluateQualityGate();
const scans = scanBlock({ htmlRel, screenshot, quality });
const ok = quality.decision === "passed_scoped"
  && screenshot.status === "passed"
  && scans.claimScan.status === "passed"
  && scans.securityScan.status === "passed";

const body = [
  phaseHeader({
    title: "V38.6 Human Visual Review Evidence",
    phase: "V38.6 human visual review",
    spec: "HTML report and automated screenshot evidence"
  }),
  "## Report Artifacts",
  `- HTML report: ${htmlRel}.`,
  `- Screenshot status: ${screenshot.status}.`,
  screenshot.screenshotRel ? `- Screenshot: ${screenshot.screenshotRel}.` : `- Screenshot reason: ${screenshot.reason}.`,
  "",
  "## Review Boundary",
  "- This evidence shows generated contact sheets and GIF previews for public sample cats.",
  "- It is suitable for human review of the scoped V38 product path.",
  "- It is not a final visual taste approval for arbitrary user photos.",
  "",
  scans.markdown,
  "## Decision",
  `- Status: ${ok ? "passed scoped" : "blocked"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V38.x/evidence/v38_6-human-visual-review-${v38Date}.md`, body);
printResult({ ok, evidencePath, htmlRel, screenshot });
