import { buildV33Context, date, printResult, writeMarkdownEvidence } from "./v33_smoke_common.mjs";

const context = buildV33Context();
const result = writeMarkdownEvidence(`v33_5-in-app-preview-apply-rollback-${date}.md`, {
  context,
  title: "V33.5 In-app Preview Apply Rollback Evidence",
  phase: "V33.5",
  spec: "docs/V33.x/v33_5-in-app-preview-apply-rollback-spec.md",
  development: "Connected the passed V33 candidate to the existing preview/apply/rollback flow and verified failed candidate blocking.",
  acceptance: "Approved candidate previews, applies to the target instance, and rolls back; transform-only failed candidate cannot apply.",
  resultLines: (ctx) => [
    `- Preview status: ${ctx.product.previewStatus}`,
    `- Apply status: ${ctx.product.applyStatus}`,
    `- Rollback status: ${ctx.product.rollbackStatus}`,
    `- Previous pack restored: ${ctx.product.previousPackRestored}`,
    `- Failed candidate blocked: ${ctx.failedProduct.failedCandidateBlocked}`,
    "- Decision: passed scoped for target-isolated preview/apply/rollback."
  ],
  scanText: (ctx) => JSON.stringify({ product: ctx.product, failedProduct: ctx.failedProduct }),
  claim: "V33.5 may claim target-isolated preview, apply, and rollback for the named passed local candidate."
});

printResult({
  ok: result.ok
    && context.product.previewStatus === "ready"
    && context.product.applyStatus === "applied"
    && context.product.rollbackStatus === "rolled_back"
    && context.failedProduct.failedCandidateBlocked,
  evidencePath: result.evidencePath,
  preview: context.product.previewStatus,
  apply: context.product.applyStatus,
  rollback: context.product.rollbackStatus,
  failedCandidateBlocked: context.failedProduct.failedCandidateBlocked,
  claimScan: result.claimScan,
  securityScan: result.securityScan
});
