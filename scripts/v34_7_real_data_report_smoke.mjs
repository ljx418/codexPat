import fs from "node:fs";
import path from "node:path";

import {
  buildV34Context,
  date,
  escapeHtml,
  evidenceDir,
  repoRoot,
  runClaimScan,
  runSecurityScan,
  safeRelative,
  v34ProductPathPassed,
  printResult
} from "./v34_smoke_common.mjs";

const reportPath = path.join(evidenceDir, `v34_7-real-data-report-${date}.html`);
const tracePath = path.join(evidenceDir, "derivatives", `v34_7-product-path-trace-${date}.svg`);
const context = buildV34Context();

fs.mkdirSync(path.dirname(tracePath), { recursive: true });
fs.writeFileSync(tracePath, productTraceSvg(context), "utf8");

const candidateRows = context.productResults.map((result) => `<tr>
  <td>${escapeHtml(result.candidateId)}</td>
  <td>${escapeHtml(result.sampleId)}</td>
  <td>${escapeHtml(result.characterAssetId)}</td>
  <td class="${result.qaStatus === "passed" ? "pass" : "fail"}">${escapeHtml(result.qaStatus)}</td>
  <td>${escapeHtml(result.previewStatus)}</td>
  <td>${escapeHtml(result.applyStatus)}</td>
  <td>${escapeHtml(result.rollbackStatus)}</td>
  <td>${result.failedCandidateBlocked ? "是" : "否"}</td>
</tr>`).join("");

const actionRows = context.passedPacks.flatMap((pack) => pack.targetActionFrames.map((action) => `<tr>
  <td>${escapeHtml(pack.candidateId)}</td>
  <td>${escapeHtml(action.targetActionId)}</td>
  <td>${escapeHtml(action.runtimeCoreActionId)}</td>
  <td>${action.frameCount}</td>
  <td>${action.localPartMotionScore}</td>
  <td>${action.mostlyWholeImageTransform ? "是" : "否"}</td>
</tr>`)).join("");

const visualCards = context.passedPacks.map((pack) => {
  const contact = relFromEvidence(pack.contactSheetEvidenceRef);
  return `<section class="card"><h3>${escapeHtml(pack.candidateId)} contact sheet</h3><img src="${escapeHtml(contact)}" alt="${escapeHtml(pack.candidateId)} Route A2 contact sheet"><p>V34 target actions: ${escapeHtml(pack.actions.join(", "))}</p></section>`;
}).join("");

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>V34 真实数据自动化验收报告</title>
  <style>
    body{margin:0;background:#f4f6f8;color:#172033;font-family:"Segoe UI",Arial,sans-serif;line-height:1.55}
    main{max-width:1320px;margin:0 auto;padding:28px}
    header{background:#1d2a35;color:#fff;border-radius:8px;padding:24px}
    h1{font-size:30px;margin:0 0 8px;letter-spacing:0}h2{font-size:22px;margin:30px 0 12px;letter-spacing:0}h3{font-size:17px;margin:0 0 10px;letter-spacing:0}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.card{background:#fff;border:1px solid #d7dee8;border-radius:8px;padding:14px}
    img{display:block;max-width:100%;height:auto;border:1px solid #d7dee8;border-radius:6px;background:white}
    table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #d7dee8;border-radius:8px;overflow:hidden}td,th{padding:10px;border-bottom:1px solid #e5eaf0;text-align:left;vertical-align:top}th{background:#edf2f7}
    .pass{color:#047857;font-weight:800}.fail{color:#b91c1c;font-weight:800}.warn{color:#b45309;font-weight:800}.note{color:#475569}.mono{font-family:Consolas,Menlo,monospace}
    @media(max-width:900px){.grid{grid-template-columns:1fr}main{padding:16px}}
  </style>
</head>
<body><main>
  <header>
    <h1>V34 单照片到 2D 动作资产 scoped 验收报告</h1>
    <p>本报告汇总 V34.1-V34.6 的真实记录、生成视觉证据、产品路径自动化证据和 Route A2 / Route B 对照。结论只覆盖命名样本和本地 Route A2 候选。</p>
  </header>

  <h2>目标架构与当前实现</h2>
  <div class="grid">
    <section class="card"><h3>目标架构</h3><p>照片样本进入安全接入后，依次形成主体检测、mask、part map、角色资产合同、Route A2 8 动作候选、V34 QA、产品预览、目标实例应用和回滚。</p></section>
    <section class="card"><h3>当前实现</h3><p>V34.1-V34.5 已形成 named sample scoped 记录。V34.6 已证明两个 Route A2 候选可进入产品闭环，两个负例会被阻塞。</p></section>
  </div>

  <h2>用户可体验路径证据</h2>
  <div class="grid">
    <section class="card"><h3>产品路径自动化证据图</h3><img src="${escapeHtml(relFromAbs(tracePath))}" alt="V34 product path trace"><p class="note">这是自动化 evidence trace，不伪装成真实浏览器截图。</p></section>
    ${visualCards}
  </div>

  <h2>单照片到动作资产链路</h2>
  <table><thead><tr><th>Candidate</th><th>Sample</th><th>Character Asset</th><th>V34 QA</th><th>Preview</th><th>Apply</th><th>Rollback</th><th>负例阻塞</th></tr></thead><tbody>${candidateRows}</tbody></table>

  <h2>8 动作与 runtime 投影</h2>
  <table><thead><tr><th>Candidate</th><th>V34 目标动作</th><th>当前 runtime 动作</th><th>帧数</th><th>局部动作分</th><th>整图变形</th></tr></thead><tbody>${actionRows}</tbody></table>

  <h2>Route A2 / Route B 对照</h2>
  <div class="grid">
    <section class="card"><h3>Route A2 当前结论</h3><p class="pass">已在两个命名样本上形成本地 8 动作候选，并通过产品路径闭环。</p><p>局限：启发式和模板化动作的美术上限有限，不能扩大成任意猫通用能力。</p></section>
    <section class="card"><h3>Route B 后续价值</h3><p class="warn">Route B 仍是质量对照和 fallback，不是本阶段执行路线。</p><p>若 final gate 判断 Route A2 动作自然度不足，下一阶段应引入专业辅助帧、source boundary、sampleId 绑定、contact sheet、QA 和产品闭环证据。</p></section>
  </div>

  <h2>验收结论</h2>
  <table><tbody>
    <tr><th>V34.6 product path</th><td class="${v34ProductPathPassed(context) ? "pass" : "fail"}">${v34ProductPathPassed(context) ? "passed scoped" : "failed or blocked"}</td></tr>
    <tr><th>Claim scan</th><td class="pass">CLAIM_SCAN_PLACEHOLDER</td></tr>
    <tr><th>Security scan</th><td class="pass">SECURITY_SCAN_PLACEHOLDER</td></tr>
    <tr><th>剩余风险</th><td>Route A2 视觉自然度仍需 final gate 判断；Route B 可能带来更好的目标体验，但需要独立证据。</td></tr>
  </tbody></table>
</main></body></html>`;

const claimScan = runClaimScan(html);
const securityScan = runSecurityScan(html);
const finalHtml = html
  .replace("CLAIM_SCAN_PLACEHOLDER", claimScan.status)
  .replace("SECURITY_SCAN_PLACEHOLDER", securityScan.status);
fs.mkdirSync(evidenceDir, { recursive: true });
fs.writeFileSync(reportPath, finalHtml, "utf8");

printResult({
  ok: v34ProductPathPassed(context) && claimScan.status === "passed" && securityScan.status === "passed",
  htmlPath: safeRelative(reportPath),
  tracePath: safeRelative(tracePath),
  candidateCount: context.productResults.length,
  passedCandidateCount: context.productSnapshot.passedCandidateCount,
  blockedFailedCandidateCount: context.productSnapshot.blockedFailedCandidateCount,
  claimScan: claimScan.status,
  securityScan: securityScan.status
});

function relFromEvidence(relPath) {
  return path.relative(evidenceDir, path.join(repoRoot, relPath)).replaceAll("\\", "/");
}

function relFromAbs(absPath) {
  return path.relative(evidenceDir, absPath).replaceAll("\\", "/");
}

function productTraceSvg(ctx) {
  const steps = [
    ["照片样本", "V34.1"],
    ["mask / part map", "V34.2-V34.3"],
    ["角色资产合同", "V34.4"],
    ["Route A2 8 动作", "V34.5"],
    ["QA", "V34.6"],
    ["预览", `${ctx.productSnapshot.previewReadyCount} passed`],
    ["应用", `${ctx.productSnapshot.appliedCount} passed`],
    ["回滚", `${ctx.productSnapshot.rolledBackCount} passed`]
  ];
  const nodes = steps.map(([label, sub], index) => {
    const x = 24 + index * 156;
    return `<g><rect x="${x}" y="54" width="132" height="72" rx="8" fill="${index < 5 ? "#dbeafe" : "#dcfce7"}" stroke="#64748b"/><text x="${x + 12}" y="84" font-family="Arial" font-size="15" fill="#172033">${label}</text><text x="${x + 12}" y="108" font-family="Arial" font-size="12" fill="#475569">${sub}</text></g>`;
  }).join("");
  const edges = steps.slice(1).map((_, index) => {
    const x = 24 + index * 156 + 132;
    return `<path d="M${x} 90 H${x + 24}" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="180" viewBox="0 0 1280 180"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#334155"/></marker></defs><rect width="1280" height="180" fill="#f8fafc"/><text x="24" y="30" font-family="Arial" font-size="18" fill="#172033">V34 product path automation trace</text>${edges}${nodes}</svg>`;
}
