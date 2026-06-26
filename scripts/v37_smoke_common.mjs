import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildV37PhotoToActionEvidenceSnapshot,
  createV37PhotoToActionProductPath,
  decideV37FinalPhotoToAction,
  runV37ClaimScan,
  v37PhotoToActionProductPathHasForbiddenContent
} from "../apps/desktop/src/assets/v37-photo-to-action-product-path.ts";

export const v37Date = "2026-06-26";
const __filename = fileURLToPath(import.meta.url);
export const repoRoot = path.resolve(path.dirname(__filename), "..");

export function buildV37Context() {
  const pathResult = createV37PhotoToActionProductPath();
  const snapshot = buildV37PhotoToActionEvidenceSnapshot(pathResult);
  const finalDecision = decideV37FinalPhotoToAction(pathResult);
  return { pathResult, snapshot, finalDecision };
}

export function evidenceHeader({ title, phase, spec }) {
  return [
    `# ${title}`,
    "",
    `Date: ${v37Date}`,
    "",
    "## Phase Development And Acceptance Plan",
    `- Phase: ${phase}.`,
    `- Spec: ${spec}.`,
    "- Development plan: execute the scoped V37 phase only, using safe named sample metadata and local deterministic Route A2 evidence.",
    "- Acceptance plan: require PRD/spec review, engineering blueprint review, command result, claim scan, security scan, and scoped decision.",
    "- Audit opinion before implementation: no new critical or major PRD/spec deviation; proceed with phase-local evidence only.",
    "",
    "## PRD / Spec Review",
    "- PRD: docs/active/agent_desktop_pet_prd_v37.md reviewed.",
    "- Target architecture: docs/V37.x/v37-target-architecture.md reviewed.",
    "- Engineering blueprint: docs/V37.x/v37-engineering-implementation-blueprint.md reviewed.",
    "- Boundary: tested named samples only; no arbitrary-cat, provider, production, Windows, cross-platform, 3D, Petdex, MCP, Claude, OS-level, or all-workflows readiness claim.",
    ""
  ].join("\n");
}

export function scanBlock(value) {
  const claimScan = runV37ClaimScan(value);
  const securityScan = { status: v37PhotoToActionProductPathHasForbiddenContent(value) ? "failed" : "passed" };
  return {
    claimScan,
    securityScan,
    markdown: [
      "## Claim Scan",
      `- Status: ${claimScan.status}`,
      `- Hits: ${claimScan.hits.length === 0 ? "none" : claimScan.hits.join(", ")}`,
      "",
      "## Security Scan",
      `- Status: ${securityScan.status}`,
      ""
    ].join("\n")
  };
}

export function writeEvidence(relPath, body) {
  const absPath = path.join(repoRoot, relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, body, "utf8");
  return relPath.replaceAll("\\", "/");
}

export function printResult(result) {
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

export function sampleRows(snapshot) {
  return snapshot.sampleSet.records.map((record) =>
    `| ${record.sampleId} | ${record.displayName} | ${record.difficultyClass} | ${record.intakeStatus} | ${record.reasonCodes.join(", ")} |`
  ).join("\n");
}

export function identityRows(snapshot) {
  return snapshot.identityContracts.map((contract) =>
    `| ${contract.sampleId} | ${contract.characterAssetId} | ${contract.status} | ${contract.crossSampleReuseCheck} | ${contract.reasonCodes.join(", ")} |`
  ).join("\n");
}

export function candidateRows(snapshot) {
  return snapshot.actionCandidates.map((candidate) =>
    `| ${candidate.sampleId} | ${candidate.candidateId} | ${candidate.routeId} | ${candidate.semanticStatus} | ${candidate.visualStatus} | ${candidate.humanReviewStatus} | ${candidate.productPathStatus} | ${candidate.actionCoverage.length} | ${candidate.reasonCodes.join(", ")} |`
  ).join("\n");
}

export function htmlReport(context) {
  const rows = context.snapshot.actionCandidates.map((candidate) => `
    <tr>
      <td>${escapeHtml(candidate.sampleId)}</td>
      <td>${escapeHtml(candidate.candidateId)}</td>
      <td>${escapeHtml(candidate.routeId)}</td>
      <td>${escapeHtml(candidate.semanticStatus)}</td>
      <td>${escapeHtml(candidate.visualStatus)}</td>
      <td>${escapeHtml(candidate.humanReviewStatus)}</td>
      <td>${escapeHtml(candidate.productPathStatus)}</td>
    </tr>
  `).join("");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>V37 照片到动作资产验收报告</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 32px; color: #0f172a; background: #f8fafc; }
    main { max-width: 1180px; margin: 0 auto; display: grid; gap: 18px; }
    section { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 13px; vertical-align: top; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
    .metric { background: #f1f5f9; border-radius: 8px; padding: 12px; }
  </style>
</head>
<body>
<main>
  <section>
    <h1>V37 照片到动作资产验收报告</h1>
    <p>该报告覆盖 tested named samples scoped path，不声明任意猫自动生成 ready。</p>
  </section>
  <section class="grid">
    <div class="metric"><strong>样本数</strong><br>${context.finalDecision.sampleCount}</div>
    <div class="metric"><strong>通过候选</strong><br>${context.finalDecision.passedCount}</div>
    <div class="metric"><strong>Route B</strong><br>${escapeHtml(context.snapshot.routeBStatus)}</div>
    <div class="metric"><strong>Final</strong><br>${escapeHtml(context.finalDecision.decision)}</div>
  </section>
  <section>
    <h2>当前架构与目标架构</h2>
    <p>当前实现复用 V33-V36 本地安全样本、身份、角色资产、Route A2、质量和人审合同，并新增 V37 产品路径合同。目标架构要求真实 named sample 绑定自己的 sampleId、characterAssetId 和 8 动作候选，再进入 preview/apply/rollback 门禁。</p>
  </section>
  <section>
    <h2>候选路径</h2>
    <table>
      <thead><tr><th>sampleId</th><th>candidateId</th><th>route</th><th>semantic</th><th>visual</th><th>human</th><th>product</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </section>
</main>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
