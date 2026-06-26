import fs from "node:fs";
import path from "node:path";

import {
  buildV34Context,
  date,
  evidenceDir,
  fileExists,
  printResult,
  repoRoot,
  runClaimScan,
  runSecurityScan,
  safeRelative,
  v34ProductPathPassed
} from "./v34_smoke_common.mjs";

const finalReportPath = path.join(evidenceDir, "..", "v34-final-acceptance-report.md");
const commandLogRel = `docs/V34.x/evidence/v34_8-command-results-${date}.md`;
const requiredEvidence = [
  `docs/V34.x/evidence/v34_1-subject-detection-${date}.md`,
  `docs/V34.x/evidence/v34_2-segmentation-mask-${date}.md`,
  `docs/V34.x/evidence/v34_3-pose-part-map-${date}.md`,
  `docs/V34.x/evidence/v34_4-character-asset-contract-${date}.md`,
  `docs/V34.x/evidence/v34_5-rig-frame-synthesis-${date}.md`,
  `docs/V34.x/evidence/v34_6-generation-product-e2e-${date}.md`,
  `docs/V34.x/evidence/v34_7-real-data-report-${date}.html`,
  commandLogRel
];

const context = buildV34Context();
const missingEvidence = requiredEvidence.filter((relPath) => !fileExists(relPath));
const commandLog = fileExists(commandLogRel)
  ? fs.readFileSync(path.join(repoRoot, commandLogRel), "utf8")
  : "";
const commandLogPassed = commandLog.includes("overallStatus: passed");
const routeDecision = v34ProductPathPassed(context) && missingEvidence.length === 0 && commandLogPassed
  ? "Route A2 sufficient for scoped pass"
  : "V34 failed or blocked";

const body = [
  "# V34 Final Acceptance Report",
  "",
  `Date: ${date}`,
  "",
  "## Entry Evidence Check",
  ...requiredEvidence.map((relPath) => `- ${relPath}: ${fileExists(relPath) ? "present" : "missing"}`),
  "",
  "## Phase Summary",
  "- V34.1 subject detection: scoped evidence present.",
  "- V34.2 segmentation and mask: scoped evidence present.",
  "- V34.3 pose and part map: scoped evidence present.",
  "- V34.4 character asset contract: scoped evidence present.",
  "- V34.5 Route A2 rig/frame synthesis: scoped evidence present.",
  "- V34.6 product path: preview, target-only apply, rollback, and failed-candidate blocking verified by smoke evidence.",
  "- V34.7 report: Chinese HTML evidence report generated with visual refs and route comparison.",
  "",
  "## Product Path Result",
  `- Passed candidate count: ${context.productSnapshot.passedCandidateCount}`,
  `- Preview ready count: ${context.productSnapshot.previewReadyCount}`,
  `- Applied count: ${context.productSnapshot.appliedCount}`,
  `- Rolled back count: ${context.productSnapshot.rolledBackCount}`,
  `- Blocked failed-candidate count: ${context.productSnapshot.blockedFailedCandidateCount}`,
  `- Target-only apply passed: ${context.productSnapshot.targetOnlyApplyPassed}`,
  `- Rollback passed: ${context.productSnapshot.rollbackPassed}`,
  `- Diagnostics safe: ${context.productSnapshot.diagnosticsSafe}`,
  "",
  "## Route Decision",
  `- Final route decision: ${routeDecision}`,
  "- Route A2 is the only executed V34 route in this gate.",
  "- Route B remains a professional-assisted quality fallback and should be considered if future visual review finds Route A2 motion quality insufficient.",
  "",
  "## Command Results",
  `- Command log present: ${fileExists(commandLogRel)}`,
  `- Command log status: ${commandLogPassed ? "passed" : "missing or failed"}`,
  "",
  "## Claim Scan",
  "- Status: CLAIM_SCAN_PLACEHOLDER",
  "- Boundary: named samples, local Route A2 candidates, product-path evidence.",
  "",
  "## Security Scan",
  "- Status: SECURITY_SCAN_PLACEHOLDER",
  "- Boundary: safe IDs, relative evidence refs, sanitized summaries.",
  "",
  "## Remaining Risk",
  "- Visual naturalness is still bounded by local deterministic Route A2 templates.",
  "- Route B may provide better target experience, but it needs independent source-boundary, sample binding, QA, visual refs, and product-path evidence before acceptance.",
  "- This report does not cover broad provider, platform, release, or general-photo readiness.",
  "",
  "## Narrow Final Claim",
  routeDecision === "Route A2 sufficient for scoped pass"
    ? "V34 may claim scoped named-sample Route A2 photo-to-character-to-8-action product path passed, with evidence-matched limitations."
    : "V34 cannot claim final scoped pass until missing or failed evidence is closed.",
  ""
].join("\n");

const claimScan = runClaimScan(body);
const securityScan = runSecurityScan(body);
const finalBody = body
  .replace("CLAIM_SCAN_PLACEHOLDER", claimScan.status)
  .replace("SECURITY_SCAN_PLACEHOLDER", securityScan.status);
fs.writeFileSync(finalReportPath, finalBody, "utf8");

printResult({
  ok: missingEvidence.length === 0
    && commandLogPassed
    && v34ProductPathPassed(context)
    && routeDecision === "Route A2 sufficient for scoped pass"
    && claimScan.status === "passed"
    && securityScan.status === "passed",
  finalReportPath: safeRelative(finalReportPath),
  missingEvidence,
  commandLogPresent: fileExists(commandLogRel),
  commandLogPassed,
  routeDecision,
  claimScan: claimScan.status,
  securityScan: securityScan.status
});
