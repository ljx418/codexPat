import { buildV37Context, evidenceHeader, printResult, scanBlock, v37Date, writeEvidence } from "./v37_smoke_common.mjs";

const context = buildV37Context();
const scan = scanBlock(context.snapshot.productGate);
const ok = context.snapshot.productGate.status === "passed" && scan.claimScan.status === "passed" && scan.securityScan.status === "passed";
const body = [
  evidenceHeader({ title: "V37.5 Product Preview Apply Rollback", phase: "V37.5 product preview/apply/rollback", spec: "docs/V37.x/v37-engineering-implementation-blueprint.md" }),
  "## Product Gate",
  `- Preview ready: ${context.snapshot.productGate.previewReady}`,
  `- Target-only apply passed: ${context.snapshot.productGate.targetOnlyApplyPassed}`,
  `- Rollback passed: ${context.snapshot.productGate.rollbackPassed}`,
  `- Failed candidate blocked: ${context.snapshot.productGate.failedCandidateBlocked}`,
  `- Previous pack restored: ${context.snapshot.productGate.previousPackRestored}`,
  "",
  scan.markdown,
  "## Scoped Decision",
  ok ? "- passed scoped: product preview/apply/rollback gate passed for tested named candidates." : "- failed: product gate did not pass.",
  ""
].join("\n");
const evidencePath = writeEvidence(`docs/V37.x/evidence/v37_5-product-preview-apply-rollback-${v37Date}.md`, body);
printResult({ ok, status: ok ? "passed scoped" : "failed", evidencePath });
