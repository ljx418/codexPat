import {
  buildV36Context,
  escapeHtml,
  evidenceHeader,
  matrixRows,
  printResult,
  reviewRows,
  routeA2Rows,
  routeBRows,
  scanBlock,
  v36Date,
  writeEvidence
} from "./v36_smoke_common.mjs";

const context = buildV36Context();
const reportRel = `docs/V36.x/evidence/v36_7-product-ux-report-${v36Date}.html`;
const reportHtml = htmlReport(context);
writeEvidence(reportRel, reportHtml);
const scan = scanBlock({ product: context.product, reportRel });
const ok = context.product.status === "partial_scoped" && scan.claimScan.status === "passed" && scan.securityScan.status === "passed";
const evidencePath = reportRel;

printResult({ ok, status: ok ? "passed scoped" : context.product.status, evidencePath });

function htmlReport(context) {
  const cards = context.routeA2.samples.slice(0, 8).map((item) => `
    <article class="card">
      <h3>${escapeHtml(item.sampleId)}</h3>
      <p><strong>${escapeHtml(item.status)}</strong></p>
      <p>Template similarity: ${item.templateSimilarityScore}</p>
      <p>Local motion ceiling: ${item.localMotionCeiling}</p>
      <p>${escapeHtml(item.reasonCodes.join(", "))}</p>
    </article>`).join("");
  return `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<title>V36.7 产品 UX 自动化验收报告</title>
<style>
body{font-family:Arial,"Microsoft YaHei",sans-serif;margin:0;background:#f8fafc;color:#172033}
main{max-width:1180px;margin:0 auto;padding:32px}
h1{font-size:28px;margin:0 0 12px}
h2{margin-top:32px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.card{background:#fff;border:1px solid #dbe3ef;border-radius:8px;padding:16px}
table{width:100%;border-collapse:collapse;background:#fff}
th,td{border:1px solid #dbe3ef;padding:8px;text-align:left;font-size:13px;vertical-align:top}
.warn{background:#fff7ed;border:1px solid #fdba74;border-radius:8px;padding:12px}
code{word-break:break-all}
</style>
<main>
<h1>V36.7 产品 UX 自动化验收报告</h1>
<p>本报告使用 V36 scoped metadata、Route A2 derivative visual evidence 和产品路径摘要生成。没有记录 raw photo bytes、EXIF/GPS、完整本地路径或 provider payload。</p>
<section class="warn">
<strong>当前结论：</strong>V36 产品 UX 证据为 partial scoped。Route B 没有真实 source-bound professional-assisted assets，因此不能声明 Route B 已验证或任意猫自动生成 ready。
</section>
<h2>目标架构与当前架构</h2>
<p>${escapeHtml(context.product.targetArchitectureSummary)}</p>
<p>${escapeHtml(context.product.currentArchitectureSummary)}</p>
<h2>用户可见路径</h2>
<ul>
<li>Preview: ${escapeHtml(context.product.previewStatus)}</li>
<li>Apply: ${escapeHtml(context.product.applyStatus)}</li>
<li>Rollback: ${escapeHtml(context.product.rollbackStatus)}</li>
<li>Failed/blocked candidate: ${escapeHtml(context.product.blockedCandidateStatus)}</li>
</ul>
<h2>Route A2 样本卡片</h2>
<div class="grid">${cards}</div>
<h2>Route A2 Ceiling</h2>
<table><thead><tr><th>sampleId</th><th>candidateId</th><th>difficulty</th><th>status</th><th>templateSimilarity</th><th>identityDifferentiation</th><th>localMotion</th><th>reasonCodes</th></tr></thead><tbody>${rowsToHtml(routeA2Rows(context.routeA2))}</tbody></table>
<h2>Route B Boundary</h2>
<table><thead><tr><th>sampleId</th><th>status</th><th>rubricStatus</th><th>assetProvenance</th><th>reasonCodes</th></tr></thead><tbody>${rowsToHtml(routeBRows(context.routeB))}</tbody></table>
<h2>泛化矩阵</h2>
<table><thead><tr><th>sampleId</th><th>difficulty</th><th>routeId</th><th>rubricStatus</th><th>humanReviewStatus</th><th>productPathStatus</th><th>reasonCodes</th></tr></thead><tbody>${rowsToHtml(matrixRows(context.generalization))}</tbody></table>
<h2>人工视觉审查</h2>
<table><thead><tr><th>sampleId</th><th>identity</th><th>motion</th><th>polish</th><th>conflict</th><th>finalStatus</th><th>reasonCodes</th></tr></thead><tbody>${rowsToHtml(reviewRows(context.review))}</tbody></table>
<h2>证据引用</h2>
<ul>${context.product.screenshotManifest.map((ref) => `<li><code>${escapeHtml(ref)}</code></li>`).join("")}</ul>
<h2>声明边界</h2>
<p>只能声明 tested named/public metadata samples scoped risk closure evidence。不得声明 broad readiness。</p>
</main>
</html>`;
}

function rowsToHtml(markdownRows) {
  return markdownRows.split("\n").filter(Boolean).map((row) => {
    const cells = row.split("|").slice(1, -1).map((cell) => `<td>${escapeHtml(cell.trim())}</td>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
}
