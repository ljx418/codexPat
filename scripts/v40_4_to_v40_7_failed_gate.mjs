import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  runV40NoWebUIClaimScan,
  runV40NoWebUISecurityScan,
  validateV40ProductGateSummary
} from "../apps/desktop/src/assets/v40-no-webui-workflow-contract.ts";

const phaseDate = "2026-07-01";
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const evidenceRoot = "docs/V40.x/evidence";
const r5Ref = `${evidenceRoot}/v40_3r5-direct-runner-predev-audit-${phaseDate}.json`;
const r6Ref = `${evidenceRoot}/v40_3r6-controlled-candidate-frame-generation-${phaseDate}.json`;

const refs = {
  v40_4Plan: `${evidenceRoot}/v40_4-pre-phase-development-and-acceptance-plan-${phaseDate}.md`,
  v40_4Evidence: `${evidenceRoot}/v40_4-normalization-action-packaging-${phaseDate}.md`,
  v40_5Plan: `${evidenceRoot}/v40_5-pre-phase-development-and-acceptance-plan-${phaseDate}.md`,
  v40_5Evidence: `${evidenceRoot}/v40_5-product-preview-apply-rollback-${phaseDate}.md`,
  v40_6Plan: `${evidenceRoot}/v40_6-pre-phase-development-and-acceptance-plan-${phaseDate}.md`,
  v40_6Report: `${evidenceRoot}/v40_6-visual-report-${phaseDate}.html`,
  v40_7Plan: `${evidenceRoot}/v40_7-pre-phase-development-and-acceptance-plan-${phaseDate}.md`,
  v40_7Evidence: `${evidenceRoot}/v40_7-final-gate-${phaseDate}.md`,
  summary: `${evidenceRoot}/v40_4_to_v40_7-final-failed-gate-${phaseDate}.json`
};

function readJson(relRef) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relRef), "utf8"));
}

function writeText(relRef, body) {
  const abs = path.join(repoRoot, relRef);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${body.trimEnd()}\n`, "utf8");
}

function writeJson(relRef, payload) {
  const abs = path.join(repoRoot, relRef);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function scan(payload) {
  return {
    claimScan: runV40NoWebUIClaimScan(payload),
    securityScan: runV40NoWebUISecurityScan(payload)
  };
}

const r5 = fs.existsSync(path.join(repoRoot, r5Ref)) ? readJson(r5Ref) : null;
const r6 = fs.existsSync(path.join(repoRoot, r6Ref)) ? readJson(r6Ref) : null;
const r5Passed = r5?.decision === "passed scoped";
const r6AcceptedCount = Number(r6?.acceptedVisualCount ?? 0);
const r6GeneratedCount = Number(r6?.generatedCount ?? 0);
const r6Passed = r6?.decision === "passed scoped" && r6AcceptedCount >= 2;
const candidateSummaries = Array.isArray(r6?.candidateSummaries) ? r6.candidateSummaries : [];
const visualReviews = Array.isArray(r6?.visualReviews) ? r6.visualReviews : [];
const v39Comparison = Array.isArray(r6?.v39Comparison) ? r6.v39Comparison : [];

const v40_4 = {
  phase: "V40.4",
  decision: "blocked",
  entryAllowed: r6Passed,
  acceptedVisualCount: r6AcceptedCount,
  reasonCodes: r6Passed ? [] : ["v40_4_no_go", "v40_3r6_visual_review_failed", "accepted_candidate_count_insufficient"]
};
const v40_5 = {
  phase: "V40.5",
  decision: "blocked",
  previewReady: false,
  targetOnlyApplyReady: false,
  rollbackReady: true,
  reasonCodes: ["v40_4_no_accepted_candidates", "product_preview_not_ready", "target_apply_blocked"]
};
const productGate = validateV40ProductGateSummary({
  previewReady: false,
  targetOnlyApplyReady: false,
  rollbackReady: true,
  activePackPreservedOnFailure: true,
  blockedReason: "v40_4_no_accepted_candidates"
});
const v40_6 = {
  phase: "V40.6",
  decision: "passed scoped",
  reportRef: refs.v40_6Report,
  visualArtifactCount: candidateSummaries.length,
  reasonCodes: ["failed_visual_report_generated", "v40_4_no_go_recorded"]
};
const v40_7 = {
  phase: "V40.7",
  decision: "failed",
  reasonCodes: [
    r5Passed ? "v40_3r5_predev_audit_passed_scoped" : "v40_3r5_missing_or_not_passed",
    r6GeneratedCount > 0 ? "v40_3r6_candidates_generated" : "v40_3r6_no_candidates",
    "v40_3r6_visual_review_failed",
    "v40_4_no_go",
    "v40_final_gate_failed"
  ]
};

const scanTarget = {
  r5: { decision: r5?.decision ?? "missing" },
  r6: { decision: r6?.decision ?? "missing", generatedCount: r6GeneratedCount, acceptedVisualCount: r6AcceptedCount },
  v40_4,
  v40_5,
  v40_6,
  v40_7
};
const scans = scan(scanTarget);

writeText(refs.v40_4Plan, [
  "# V40.4 Pre-Phase Development And Acceptance Plan",
  "",
  `Date: ${phaseDate}`,
  "",
  "## Objective",
  "Attempt V40.4 normalization only if V40.3R6 produced at least two same-sample candidates with explicit visual review passes.",
  "",
  "## Entry Review",
  `- V40.3R5 passed scoped: ${r5Passed ? "yes" : "no"}.`,
  `- V40.3R6 decision: ${r6?.decision ?? "missing"}.`,
  `- V40.3R6 accepted visual count: ${r6AcceptedCount}.`,
  "",
  "## Audit Opinion",
  "- Fatal blocker: V40.3R6 has fewer than two accepted visual candidates.",
  "- Development action is restricted to blocked evidence. Normalization must not run on failed candidates.",
  "",
  "## Acceptance Criteria",
  "- Pass: not applicable without accepted R6 candidates.",
  "- Block: record V40.4 No-Go because R6 did not satisfy visual acceptance.",
  "- Fail: would occur if failed candidates were normalized or treated as accepted."
].join("\n"));

writeText(refs.v40_4Evidence, [
  "# V40.4 Normalization And Action Packaging Evidence",
  "",
  `Date: ${phaseDate}`,
  "",
  "## Decision",
  "- Status: blocked.",
  "- V40.4 entry: No-Go.",
  "",
  "## PRD / Spec Review",
  "- V40.4 requires V40.3R6 accepted candidates and at least two same-sample visual passes.",
  `- Current accepted visual count: ${r6AcceptedCount}.`,
  "- Failed R6 candidates are not normalized and are not accepted product assets.",
  "",
  "## Candidate Status",
  ...candidateSummaries.map((candidate) => `- ${candidate.candidateId}: generated candidate only; contact sheet ${candidate.contactSheetRef}; not accepted.`),
  candidateSummaries.length === 0 ? "- none." : "",
  "",
  "## Decision Rationale",
  "- Normalization would create false acceptance risk because R6 visual review failed.",
  "- V40.5 cannot start with product preview/apply because there is no accepted V40 pack.",
  "",
  "## Scans",
  `- Claim scan: ${scans.claimScan.status}.`,
  `- Security scan: ${scans.securityScan.status}.`,
  "",
  "## Final Phase Result",
  `- Decision: ${v40_4.decision}.`,
  `- Reason codes: ${v40_4.reasonCodes.join(", ")}.`
].join("\n"));

writeText(refs.v40_5Plan, [
  "# V40.5 Pre-Phase Development And Acceptance Plan",
  "",
  `Date: ${phaseDate}`,
  "",
  "## Objective",
  "Expose accepted V40 candidates to preview/apply/rollback only after V40.4 normalization has accepted at least one safe pack.",
  "",
  "## Entry Review",
  "- V40.4 decision: blocked.",
  "- Accepted V40 normalized packs: 0.",
  "",
  "## Audit Opinion",
  "- Fatal blocker: no accepted V40 pack exists.",
  "- Product preview/apply must remain disabled for failed V40 candidates.",
  "",
  "## Acceptance Criteria",
  "- Block with previous active pack preserved.",
  "- Fail if any failed V40 candidate becomes applicable to product runtime."
].join("\n"));

writeText(refs.v40_5Evidence, [
  "# V40.5 Product Preview / Apply / Rollback Evidence",
  "",
  `Date: ${phaseDate}`,
  "",
  "## Decision",
  "- Status: blocked.",
  "",
  "## PRD / Spec Review",
  "- V40.5 requires accepted V40.4 candidates.",
  "- Current accepted V40.4 candidates: 0.",
  "- Failed R6 candidates are not preview/apply candidates.",
  "",
  "## Product Gate Summary",
  `- Preview ready: ${v40_5.previewReady}.`,
  `- Target-only apply ready: ${v40_5.targetOnlyApplyReady}.`,
  `- Rollback ready: ${v40_5.rollbackReady}.`,
  `- Product gate validation: ${productGate.status}; reasons ${productGate.reasonCodes.join(", ")}.`,
  "",
  "## Safety Result",
  "- Previous active pack is preserved because no V40 candidate is applied.",
  "- V40.6 may still create an honest visual report using failed candidate evidence.",
  "",
  "## Scans",
  `- Claim scan: ${scans.claimScan.status}.`,
  `- Security scan: ${scans.securityScan.status}.`,
  "",
  "## Final Phase Result",
  `- Decision: ${v40_5.decision}.`,
  `- Reason codes: ${v40_5.reasonCodes.join(", ")}.`
].join("\n"));

writeText(refs.v40_6Plan, [
  "# V40.6 Pre-Phase Development And Acceptance Plan",
  "",
  `Date: ${phaseDate}`,
  "",
  "## Objective",
  "Produce a Chinese visual report that lets humans audit the V40 failed state without claiming product success.",
  "",
  "## Entry Review",
  "- V40.5 has a stable blocked reason.",
  `- R6 generated visual artifacts: ${candidateSummaries.length}.`,
  "",
  "## Acceptance Criteria",
  "- Pass scoped only if the report is readable, nonblank, evidence-backed, and honest about failed quality.",
  "- Fail if the report hides failures or treats R6 candidates as accepted assets."
].join("\n"));

const reportCards = candidateSummaries.map((candidate, index) => {
  const review = visualReviews[index];
  const comparison = v39Comparison.find((item) => item.sampleId === candidate.sampleId);
  const imgRef = candidate.contactSheetRef?.replace("docs/V40.x/evidence/", "") ?? "";
  return `
    <section class="candidate">
      <h3>${candidate.sampleId}</h3>
      <p><strong>候选状态：</strong>${candidate.status}，但未通过视觉验收。</p>
      <p><strong>V40 contact sheet：</strong>${candidate.contactSheetRef}</p>
      <img src="${imgRef}" alt="${candidate.sampleId} V40 failed candidate contact sheet" />
      <p><strong>视觉审查：</strong>${review?.status ?? "missing"}；原因：${(review?.reasonCodes ?? []).join(", ") || "none"}</p>
      <p><strong>观察：</strong>${(review?.observations ?? []).join(" ") || "none"}</p>
      <p><strong>V39 对比：</strong>${comparison?.preference ?? "missing"}；基线：${comparison?.baselineRef ?? "missing"}</p>
    </section>`;
}).join("\n");

writeText(refs.v40_6Report, `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>V40.6 视觉验收报告 - failed scoped evidence</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 32px; color: #162033; background: #f7f8fb; }
    main { max-width: 1180px; margin: 0 auto; }
    h1, h2, h3 { color: #14213d; }
    .summary, .candidate, .gate { background: white; border: 1px solid #d9dee8; border-radius: 8px; padding: 18px; margin: 16px 0; }
    .status-failed { color: #b42318; font-weight: 700; }
    img { width: 100%; max-width: 1040px; border: 1px solid #cfd6e4; background: #fff; display: block; margin-top: 12px; }
    code { background: #eef2f7; padding: 2px 5px; border-radius: 4px; }
    ul { line-height: 1.7; }
  </style>
</head>
<body>
<main>
  <h1>V40.6 自动化视觉验收报告</h1>
  <section class="summary">
    <h2>结论</h2>
    <p class="status-failed">V40 当前未通过。R6 生成了真实候选，但 0 个候选通过显式视觉审查，V40.4-V40.5 保持 No-Go / blocked。</p>
    <p>本报告只证明本轮失败状态可审计，不证明图生高质量动作资产完成。</p>
  </section>
  <section class="gate">
    <h2>目标架构与当前实现</h2>
    <ul>
      <li>目标链路：真实样本 -> source/license -> mask/crop -> identity anchors -> action pose controls -> direct local runner -> candidate frame sequence -> visual review -> V39 same-sample comparison。</li>
      <li>当前已实现：R5 predev audit passed scoped；R6 direct local runner 生成了 2 个同样本候选。</li>
      <li>当前未达成：候选仍是照片式单帧集合，背景复杂，动作语义弱，不是可进入 V40.4 的高质量桌宠动作资产。</li>
    </ul>
  </section>
  <section class="gate">
    <h2>阶段门禁</h2>
    <ul>
      <li>V40.3R5：passed scoped。</li>
      <li>V40.3R6：failed，acceptedVisualCount = ${r6AcceptedCount}。</li>
      <li>V40.4：blocked，原因是没有两个视觉通过候选。</li>
      <li>V40.5：blocked，原因是没有 accepted V40 pack 可预览或应用。</li>
      <li>V40.7：final failed。</li>
    </ul>
  </section>
  ${reportCards || "<p>没有可展示候选。</p>"}
  <section class="gate">
    <h2>禁止声明</h2>
    <p>不能声明 V40 passed、任意猫图生动作 ready、Petdex parity、provider verified、WebUI/ComfyUI route verified、production ready、Windows/cross-platform ready。</p>
  </section>
</main>
</body>
</html>`);

writeText(refs.v40_7Plan, [
  "# V40.7 Pre-Phase Development And Acceptance Plan",
  "",
  `Date: ${phaseDate}`,
  "",
  "## Objective",
  "Close V40 with a truthful final gate decision after R5-R6 and V40.4-V40.6 evidence exists.",
  "",
  "## Entry Review",
  "- V40.3R5 passed scoped.",
  "- V40.3R6 failed visual review.",
  "- V40.4 blocked.",
  "- V40.5 blocked.",
  "- V40.6 report generated.",
  "",
  "## Acceptance Criteria",
  "- Pass requires two accepted same-sample candidates, product preview/apply/rollback, and clean scans.",
  "- Fail when tools generated candidates but quality/product path did not meet V40 acceptance.",
  "- The only valid final decision for this run is failed."
].join("\n"));

writeText(refs.v40_7Evidence, [
  "# V40.7 Final Gate Evidence",
  "",
  `Date: ${phaseDate}`,
  "",
  "## Decision",
  "- Status: failed.",
  "",
  "## Phase Summary",
  "- V40.3R5 passed scoped for pre-generation audit.",
  "- V40.3R6 generated two real candidates, but both failed explicit visual review.",
  "- V40.4 was blocked because accepted visual candidate count is below two.",
  "- V40.5 was blocked because no accepted V40 pack exists for preview/apply/rollback.",
  "- V40.6 produced an honest failed-state visual report.",
  "",
  "## User-Visible Target Experience Status",
  "- Not achieved. Current V40 outputs do not provide high-quality desktop-pet image-to-action assets.",
  "- V39 remains the fallback product asset path.",
  "",
  "## Architecture Target Status",
  "- Predev architecture is now code-backed and auditable.",
  "- Candidate generation route is real but does not meet visual target experience.",
  "- Product normalization and runtime apply are intentionally not unlocked.",
  "",
  "## Evidence Refs",
  `- R5: ${r5Ref}.`,
  `- R6: ${r6Ref}.`,
  `- V40.4: ${refs.v40_4Evidence}.`,
  `- V40.5: ${refs.v40_5Evidence}.`,
  `- V40.6: ${refs.v40_6Report}.`,
  "",
  "## Claim Scan",
  `- Status: ${scans.claimScan.status}.`,
  `- Hits: ${scans.claimScan.hits.length === 0 ? "none" : scans.claimScan.hits.join(", ")}.`,
  "",
  "## Security Scan",
  `- Status: ${scans.securityScan.status}.`,
  `- Hits: ${scans.securityScan.hits.length === 0 ? "none" : scans.securityScan.hits.join(", ")}.`,
  "",
  "## Final Phase Result",
  `- Decision: ${v40_7.decision}.`,
  `- Reason codes: ${v40_7.reasonCodes.join(", ")}.`
].join("\n"));

const summary = {
  phase: "V40.4-V40.7",
  decision: "failed",
  r5: { decision: r5?.decision ?? "missing" },
  r6: { decision: r6?.decision ?? "missing", generatedCount: r6GeneratedCount, acceptedVisualCount: r6AcceptedCount },
  v40_4,
  v40_5,
  productGate,
  v40_6,
  v40_7,
  refs,
  ...scans
};
writeJson(refs.summary, summary);

console.log(JSON.stringify({
  ok: false,
  phase: "V40.4-V40.7",
  decision: "failed",
  v40_4: v40_4.decision,
  v40_5: v40_5.decision,
  v40_6: v40_6.decision,
  v40_7: v40_7.decision,
  reportPath: refs.v40_6Report,
  finalEvidencePath: refs.v40_7Evidence,
  claimScanStatus: scans.claimScan.status,
  securityScanStatus: scans.securityScan.status
}, null, 2));

process.exitCode = 1;
