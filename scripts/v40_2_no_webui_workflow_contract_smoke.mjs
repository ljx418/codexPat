import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  V40_NO_WEBUI_ACTION_IDS,
  runV40NoWebUIClaimScan,
  runV40NoWebUISecurityScan,
  validateV40HybridCandidateSummary,
  validateV40NoWebUIRunRequest,
  validateV40ProductGateSummary
} from "../apps/desktop/src/assets/v40-no-webui-workflow-contract.ts";

const v40Date = "2026-06-29";
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");

function writeEvidence(relPath, body) {
  const absPath = path.join(repoRoot, relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, `${body.trimEnd()}\n`, "utf8");
  return relPath.replaceAll("\\", "/");
}

const actionCoverage = Object.fromEntries(V40_NO_WEBUI_ACTION_IDS.map((actionId) => [actionId, true]));
const validRequest = validateV40NoWebUIRunRequest({
  sampleId: "v38-a-cat-public",
  sourceRef: "docs/V38.x/evidence/assets/v38-a-cat-public/sanitized.png",
  baselineV39Ref: "/v39/v38_a_cat_public/contact-sheet.svg",
  route: "direct_local_runner_no_webui",
  actionSet: [...V40_NO_WEBUI_ACTION_IDS],
  consentBoundary: "public_sample"
});
const invalidRequest = validateV40NoWebUIRunRequest({
  sampleId: "bad sample",
  sourceRef: "https://example.com/cat.png",
  baselineV39Ref: "/mnt/c/workspace/codexpat/v39.svg",
  route: "direct_local_runner_no_webui",
  actionSet: ["idle"],
  consentBoundary: "public_sample"
});
const validCandidate = validateV40HybridCandidateSummary({
  candidateId: "v40-candidate-a",
  sampleId: "v38-a-cat-public",
  status: "generated",
  route: "direct_local_runner_no_webui",
  characterRef: "docs/V40.x/evidence/assets/v40-direct-runner-candidates/v40-candidate-a-character.png",
  contactSheetRef: "docs/V40.x/evidence/assets/v40-direct-runner-candidates/v40-candidate-a-contact.png",
  animatedPreviewRef: "docs/V40.x/evidence/assets/v40-direct-runner-candidates/v40-candidate-a-preview.gif",
  actionCoverage,
  identityScore: "warn",
  visualPreference: "not_reviewed",
  reasonCodes: ["candidate_generated"]
});
const invalidCandidate = validateV40HybridCandidateSummary({
  candidateId: "v40-candidate-b",
  sampleId: "v38-a-cat-public",
  status: "generated",
  route: "direct_local_runner_no_webui",
  characterRef: "docs/V40.x/evidence/assets/v40-direct-runner-candidates/v40-candidate-b-character.png",
  contactSheetRef: null,
  animatedPreviewRef: null,
  actionCoverage: { ...actionCoverage, play: undefined },
  identityScore: "warn",
  visualPreference: "not_reviewed",
  reasonCodes: ["candidate_generated"]
});
const validProductGate = validateV40ProductGateSummary({
  previewReady: true,
  targetOnlyApplyReady: true,
  rollbackReady: true,
  activePackPreservedOnFailure: true,
  blockedReason: null
});
const invalidProductGate = validateV40ProductGateSummary({
  previewReady: false,
  targetOnlyApplyReady: false,
  rollbackReady: false,
  activePackPreservedOnFailure: true,
  blockedReason: "candidate_not_ready"
});

const summary = {
  validRequest,
  invalidRequest,
  validCandidate,
  invalidCandidate,
  validProductGate,
  invalidProductGate
};
const claimScan = runV40NoWebUIClaimScan(summary);
const securityScan = runV40NoWebUISecurityScan({
  validRequest,
  validCandidate,
  validProductGate,
  invalidCandidate
});
const ok = validRequest.status === "accepted"
  && invalidRequest.status !== "accepted"
  && validCandidate.status === "accepted"
  && invalidCandidate.status !== "accepted"
  && validProductGate.status === "accepted"
  && invalidProductGate.status !== "accepted"
  && claimScan.status === "passed"
  && securityScan.status === "passed";

const body = [
  "# V40.2 No-WebUI Workflow Contract Evidence",
  "",
  `Date: ${v40Date}`,
  "",
  "## Development And Acceptance Plan",
  "- Phase: V40.2 No-WebUI workflow contract.",
  "- Controlling PRD: docs/active/agent_desktop_pet_prd_v40.md.",
  "- Phase spec: docs/V40.x/v40-phase-specs.md.",
  "- Pre-development audit: docs/V40.x/evidence/v40_2-no-webui-workflow-contract-predev-audit-2026-06-29.md.",
  "- Development scope: safe run requests, candidate summaries, product gate summaries, reason codes, claim scan, and security scan.",
  "",
  "## PRD / Spec Review",
  "- V40.1A Direct Local Runner smoke passed scoped.",
  "- This phase defines contracts only; it does not generate assets.",
  "- WebUI and ComfyUI remain historical blocked routes, not active dependencies.",
  "",
  "## Contract Results",
  `- Safe run request: ${validRequest.status}.`,
  `- Unsafe run request: ${invalidRequest.status}; reasons ${invalidRequest.reasonCodes.join(", ")}.`,
  `- Safe candidate summary: ${validCandidate.status}.`,
  `- Malformed candidate summary: ${invalidCandidate.status}; reasons ${invalidCandidate.reasonCodes.join(", ")}.`,
  `- Safe product gate: ${validProductGate.status}.`,
  `- Blocked product gate: ${invalidProductGate.status}; reasons ${invalidProductGate.reasonCodes.join(", ")}.`,
  "",
  "## Claim Scan",
  `- Status: ${claimScan.status}.`,
  `- Hits: ${claimScan.hits.length === 0 ? "none" : claimScan.hits.join(", ")}.`,
  "",
  "## Security Scan",
  `- Status: ${securityScan.status}.`,
  `- Hits: ${securityScan.hits.length === 0 ? "none" : securityScan.hits.join(", ")}.`,
  "",
  "## Decision",
  `- Status: ${ok ? "passed scoped" : "failed"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V40.x/evidence/v40_2-no-webui-workflow-contract-${v40Date}.md`, body);
console.log(JSON.stringify({ ok, phase: "V40.2", decision: ok ? "passed scoped" : "failed", evidencePath, claimScanStatus: claimScan.status, securityScanStatus: securityScan.status }, null, 2));
if (!ok) process.exitCode = 1;
