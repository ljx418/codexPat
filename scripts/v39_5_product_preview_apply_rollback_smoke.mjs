import { buildV39Context, phaseHeader, printResult, scanBlock, v39Date, writeEvidence } from "./v39_smoke_common.mjs";

const context = buildV39Context();
const product = context.pipeline.productGate;
const scans = scanBlock({ product });
const ok = product.status === "passed"
  && product.approvedCandidateCount >= 2
  && product.targetOnlyApplyPassed
  && product.rollbackPassed
  && product.failedCandidateBlocked
  && product.productUiAnchors.includes("v39-product-apply-rollback")
  && scans.claimScan.status === "passed"
  && scans.securityScan.status === "passed";

const body = [
  phaseHeader({
    title: "V39.5 Product Preview Apply Rollback Evidence",
    phase: "V39.5 product preview/apply/rollback",
    spec: "approved candidates can preview/apply/rollback and failed candidates are blocked"
  }),
  "## Product Gate Result",
  `- Product status: ${product.status}.`,
  `- Approved candidates: ${product.approvedCandidateCount}.`,
  `- Preview ready: ${product.previewReadyCount}.`,
  `- Applied: ${product.appliedCount}.`,
  `- Rolled back: ${product.rolledBackCount}.`,
  `- Failed candidate blocked: ${product.failedCandidateBlocked}.`,
  `- UI anchors: ${product.productUiAnchors.join(", ")}.`,
  "",
  scans.markdown,
  "## Decision",
  `- Status: ${ok ? "passed scoped" : "failed"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V39.x/evidence/v39_5-product-preview-apply-rollback-${v39Date}.md`, body);
printResult({ ok, evidencePath, product, scans });
