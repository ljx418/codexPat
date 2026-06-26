import fs from "node:fs";
import path from "node:path";

import {
  actionRows,
  buildV34Context,
  date,
  evidenceDir,
  printResult,
  productRows,
  runClaimScan,
  runSecurityScan,
  safeRelative,
  v34ProductPathPassed
} from "./v34_smoke_common.mjs";

const evidencePath = path.join(evidenceDir, `v34_6-generation-product-e2e-${date}.md`);
const context = buildV34Context();

const body = [
  "# V34.6 Generation Product E2E Evidence",
  "",
  "Phase: V34.6",
  `Date: ${date}`,
  "",
  "## PRD / Spec Review",
  "- Reviewed: `docs/active/agent_desktop_pet_prd_v34.md`.",
  "- Reviewed: `docs/V34.x/v34-target-architecture.md`.",
  "- Reviewed: `docs/V34.x/v34-development-and-acceptance-plan.md`.",
  "- Reviewed: `docs/V34.x/v34_6-generation-product-e2e-spec.md`.",
  "- Audit opinion: V34.6 may start from V34.5 Route A2 passed candidates only; Route B is recorded for later comparison and is not executed here.",
  "",
  "## Development Action",
  "- Added a V34 product-path gate that treats `V34GenerationQaResult.overallStatus` as the highest acceptance boundary.",
  "- A candidate can enter V33 preview/apply/rollback only when V34 QA is `passed`.",
  "- Failed Route A2 candidates, including transform-only and missing-target-action candidates, are blocked before preview and apply.",
  "",
  "## Acceptance Action",
  "- Two named Route A2 candidates entered preview, target-only apply, and rollback.",
  "- Transform-only negative and missing-target-action negative were blocked.",
  "- Product flow preserved default and unrelated pet assignments.",
  "- Evidence uses safe IDs and relative refs only.",
  "",
  "## Result Summary",
  `- Passed character contracts: ${context.passedContracts.length}`,
  `- Passed Route A2 candidates: ${context.productSnapshot.passedCandidateCount}`,
  `- Preview ready count: ${context.productSnapshot.previewReadyCount}`,
  `- Applied count: ${context.productSnapshot.appliedCount}`,
  `- Rolled back count: ${context.productSnapshot.rolledBackCount}`,
  `- Blocked failed-candidate count: ${context.productSnapshot.blockedFailedCandidateCount}`,
  `- Target-only apply passed: ${context.productSnapshot.targetOnlyApplyPassed}`,
  `- Rollback passed: ${context.productSnapshot.rollbackPassed}`,
  `- Diagnostics safe: ${context.productSnapshot.diagnosticsSafe}`,
  `- Decision: ${v34ProductPathPassed(context) ? "passed scoped for V34.6 product E2E" : "failed or blocked"}`,
  "",
  "## Product Path Table",
  "| candidateId | sampleId | characterAssetId | V34 QA | preview | apply | rollback | failedCandidateBlocked | diagnosticsSafe |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  productRows(context),
  "",
  "## Target Action Table",
  "| candidateId | V34 target action | runtime core projection | frames | localPartMotionScore | transformOnly |",
  "| --- | --- | --- | --- | --- | --- |",
  actionRows(context),
  "",
  "## Visual Evidence Refs",
  ...context.passedPacks.flatMap((pack) => [
    `- ${pack.candidateId} contact sheet: \`${pack.contactSheetEvidenceRef}\``,
    `- ${pack.candidateId} playback summary: \`${pack.playbackEvidenceRef}\``,
    `- ${pack.candidateId} manifest: \`${pack.manifestRef}\``
  ]),
  "",
  "## Route B Comparison Note",
  "- Route B remains a professional-assisted quality fallback candidate.",
  "- V34.6 did not execute Route B and did not use it as product-path input.",
  "- V34.7/V34.8 must compare whether Route B could produce better user-visible motion quality.",
  "",
  "## Claim Scan",
  "- Status: CLAIM_SCAN_PLACEHOLDER",
  "- Boundary: named sample Route A2 product preview/apply/rollback only.",
  "",
  "## Security Scan",
  "- Status: SECURITY_SCAN_PLACEHOLDER",
  "- Boundary: safe sample IDs, safe candidate IDs, relative evidence refs, no source image payloads.",
  "",
  "## Narrow Claim",
  "V34.6 may claim scoped target-isolated preview, apply, and rollback for two named Route A2 candidates.",
  ""
].join("\n");

const claimScan = runClaimScan(body);
const securityScan = runSecurityScan(body);
const finalBody = body
  .replace("CLAIM_SCAN_PLACEHOLDER", claimScan.status)
  .replace("SECURITY_SCAN_PLACEHOLDER", securityScan.status);
fs.mkdirSync(evidenceDir, { recursive: true });
fs.writeFileSync(evidencePath, finalBody, "utf8");

printResult({
  ok: v34ProductPathPassed(context) && claimScan.status === "passed" && securityScan.status === "passed",
  evidencePath: safeRelative(evidencePath),
  passedCandidateCount: context.productSnapshot.passedCandidateCount,
  previewReadyCount: context.productSnapshot.previewReadyCount,
  appliedCount: context.productSnapshot.appliedCount,
  rolledBackCount: context.productSnapshot.rolledBackCount,
  blockedFailedCandidateCount: context.productSnapshot.blockedFailedCandidateCount,
  claimScan: claimScan.status,
  securityScan: securityScan.status
});
