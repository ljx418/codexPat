import { buildV37Context, evidenceHeader, printResult, scanBlock, v37Date, writeEvidence } from "./v37_smoke_common.mjs";

const context = buildV37Context();
const scan = scanBlock(context.snapshot);
const anchors = ["#v37-photo-action-entry", "#v37-sample-status", "#v37-action-candidate-list", "#v37-action-preview-stage", "[data-v37-apply-candidate]", "#v37-rollback-candidate", "#v37-blocked-candidate-reason"];
const ok = context.pathResult.status === "passed" && scan.claimScan.status === "passed" && scan.securityScan.status === "passed";
const body = [
  evidenceHeader({ title: "V37.1 Product UX Contract", phase: "V37.1 product UX contract", spec: "docs/V37.x/v37-engineering-implementation-blueprint.md" }),
  "## UI Contract",
  ...anchors.map((anchor) => `- ${anchor}`),
  "",
  "## User-Visible Behavior",
  `- Product path status: ${context.pathResult.status}`,
  `- Candidate count: ${context.snapshot.actionCandidates.length}`,
  `- Failed/blocked candidates are not apply-ready: ${context.snapshot.productGate.failedCandidateBlocked}`,
  "",
  scan.markdown,
  "## Scoped Decision",
  ok ? "- passed scoped: V37.1 product UX contract is represented by stable anchors and scoped product path evidence." : "- failed: V37.1 contract evidence did not pass.",
  ""
].join("\n");
const evidencePath = writeEvidence(`docs/V37.x/evidence/v37_1-product-ux-contract-${v37Date}.md`, body);
printResult({ ok, status: ok ? "passed scoped" : "failed", evidencePath });
