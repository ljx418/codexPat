import { buildV33Context, printResult, writeHtmlReport } from "./v33_smoke_common.mjs";

const context = buildV33Context();
const result = writeHtmlReport(context);

printResult({
  ok: result.ok,
  htmlPath: result.htmlPath,
  candidateQa: context.qa.overallStatus,
  preview: context.product.previewStatus,
  apply: context.product.applyStatus,
  rollback: context.product.rollbackStatus,
  claimScan: result.claimScan,
  securityScan: result.securityScan
});
