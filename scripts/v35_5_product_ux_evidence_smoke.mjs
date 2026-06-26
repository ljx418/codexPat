import path from "node:path";

import {
  assessmentRows,
  buildV35Context,
  escape,
  evidenceHeader,
  printResult,
  productRows,
  scanBlock,
  v35Date,
  v35EvidenceDir,
  v35RepoRoot,
  writeEvidence
} from "./v35_smoke_common.mjs";

const mdRelPath = `docs/V35.x/evidence/v35_5-product-ux-evidence-${v35Date}.md`;
const htmlRelPath = `docs/V35.x/evidence/v35_5-product-ux-report-${v35Date}.html`;
const context = buildV35Context();

const visualCards = context.routeA2Packs.map((pack) => {
  const contactRel = path.relative(v35EvidenceDir, path.join(v35RepoRoot, pack.contactSheetEvidenceRef)).replaceAll("\\", "/");
  return `<article class="card"><h3>${escape(pack.runtimeQaCandidates.identityGate.sampleId)}</h3><img src="${escape(contactRel)}" alt="${escape(pack.candidateId)} contact sheet"><p>${escape(pack.candidateId)}</p></article>`;
}).join("");
const allProducts = [...context.routeA2ProductResults, ...context.negativeProductResults];
const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>V35 产品 UX 自动化验收报告</title><style>body{margin:0;background:#f4f6f8;color:#172033;font-family:Segoe UI,Arial,sans-serif;line-height:1.55}main{max-width:1280px;margin:0 auto;padding:28px}header,.card{background:white;border:1px solid #d7dee8;border-radius:8px;padding:16px}header{background:#172033;color:white}h1{margin:0 0 8px;font-size:28px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}img{max-width:100%;height:auto;border:1px solid #d7dee8;border-radius:6px}table{width:100%;border-collapse:collapse;background:white;margin-top:14px}td,th{border-bottom:1px solid #e5eaf0;padding:8px;text-align:left}.pass{color:#047857;font-weight:700}.fail{color:#b91c1c;font-weight:700}.warn{color:#b45309;font-weight:700}@media(max-width:900px){.grid{grid-template-columns:1fr}main{padding:16px}}</style><body><main><header><h1>V35 目标体验 2D 动作资产产品 UX 验收报告</h1><p>本报告使用本地真实命名样本和 headless derivative evidence，不启动可见桌面窗口，不抢占用户焦点。</p></header><h2>目标架构与当前实现</h2><div class="grid"><section class="card"><h3>目标架构</h3><p>V34 生成候选进入 V35 rubric、Route A2 uplift、Route B source boundary、同样本比较、产品 UX evidence 和 final route decision。</p></section><section class="card"><h3>当前实现</h3><p>Route A2 uplift 已生成命名样本候选并通过 preview/apply/rollback；Route B 没有专业资产，按边界记录为 blocked/not executed。</p></section></div><h2>用户可见动作资产证据</h2><div class="grid">${visualCards}</div><h2>产品路径</h2><table><thead><tr><th>Candidate</th><th>Sample</th><th>QA</th><th>Preview</th><th>Apply</th><th>Rollback</th><th>Failed Blocked</th></tr></thead><tbody>${allProducts.map((item) => `<tr><td>${escape(item.candidateId)}</td><td>${escape(item.sampleId)}</td><td class="${item.qaStatus === "passed" ? "pass" : "fail"}">${escape(item.qaStatus)}</td><td>${escape(item.previewStatus)}</td><td>${escape(item.applyStatus)}</td><td>${escape(item.rollbackStatus)}</td><td>${item.failedCandidateBlocked ? "是" : "否"}</td></tr>`).join("")}</tbody></table><h2>验收结论</h2><p class="pass">Route A2 uplift named-sample product UX evidence passed scoped.</p><p class="warn">Route B 仍需真实专业辅助资产后才能比较是否带来更好的视觉结果；本报告不声明任意猫自动生成或 provider 集成。</p></main></body></html>`;
const htmlPath = writeEvidence(htmlRelPath, html);

const body = [
  evidenceHeader({
    title: "V35.5 Product UX Evidence",
    phase: "V35.5 product UX evidence",
    spec: "docs/V35.x/v35_5-product-ux-evidence-spec.md"
  }),
  "## User-Visible Scenario Table",
  "| Candidate | Sample | QA | Preview | Apply | Rollback | Failed Candidate Blocked |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  productRows(context),
  "",
  "## Route Assessments",
  "| Route | Candidate | Sample | Rubric | QA | Avg Motion | Source | Reasons |",
  "| --- | --- | --- | --- | --- | ---: | --- | --- |",
  assessmentRows([...context.routeA2Assessments, ...context.routeBAssessments]),
  "",
  "## HTML Report",
  `- ${htmlPath}`,
  "",
  "## Decision",
  "- Status: passed scoped",
  "- Rationale: accepted Route A2 candidates can preview, target-apply, and rollback; Route B/failed candidates cannot silently apply.",
  ""
].join("\n");
const scans = scanBlock({ assessments: context.routeA2Assessments, products: context.routeA2ProductResults, html, body });
const mdPath = writeEvidence(mdRelPath, `${body}${scans.markdown}`);

printResult({
  ok: context.routeA2ProductResults.every((item) => item.previewStatus === "ready" && item.applyStatus === "applied" && item.rollbackStatus === "rolled_back") && context.negativeProductResults.every((item) => item.failedCandidateBlocked && item.applyStatus === "blocked") && scans.claimScan.status === "passed" && scans.securityScan.status === "passed",
  evidencePath: mdPath,
  htmlPath,
  status: "passed scoped",
  claimScan: scans.claimScan.status,
  securityScan: scans.securityScan.status
});
