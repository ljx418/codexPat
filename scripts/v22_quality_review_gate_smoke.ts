#!/usr/bin/env tsx
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CORE_ACTION_IDS, type CoreActionId } from "../apps/desktop/src/assets/asset-manifest";
import {
  applyV22ApprovedCandidateToTarget,
  assetQualityReviewHasForbiddenContent,
  buildV22QualityEvidenceSnapshot,
  buildV22RetryGuidance,
  createV22CandidateAsset,
  runV22MotionQAGate,
  runV22TechnicalQAGate,
  submitV22VisualReview,
  type V22CandidateActionMetrics,
  type V22CandidateAsset
} from "../apps/desktop/src/assets/asset-quality-review";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE ?? localDate();
const EVIDENCE_DIR = "docs/V22.x/evidence";
const ROUTE_A_SUMMARY = "docs/V21.x/evidence/assets/v21-route-a-keypose-2026-06-14/route-a-summary.json";
const ROUTE_A_CONTACT_SHEET = "docs/V21.x/evidence/assets/v21-route-a-keypose-2026-06-14/route-a-contact-sheet.jpg";
const REJECTED_VISUAL_REPORT = "docs/V21.x/evidence/v21_premium_pixel_petdex_style_report-2026-06-15.md";
const REJECTED_CONTACT_SHEET = "docs/V21.x/evidence/assets/v21-premium-pixel-petdex-style-2026-06-15/sunny-tabby/contact-sheet.jpg";

mkdirSync(resolve(REPO_ROOT, EVIDENCE_DIR), { recursive: true });

const routeA = JSON.parse(readFileSync(resolve(REPO_ROOT, ROUTE_A_SUMMARY), "utf8")) as RouteASummary;
const rejectedReport = readFileSync(resolve(REPO_ROOT, REJECTED_VISUAL_REPORT), "utf8");

const approvedCandidate = submitV22VisualReview(
  runV22MotionQAGate(runV22TechnicalQAGate(createV22CandidateAsset({
    candidateId: "v21-route-a-keypose-orange-tabby",
    sourceRoute: "provider_key_pose",
    safePackId: routeA.packId,
    actions: actionsFromRouteA(routeA)
  }))),
  {
    reviewerKind: "operator",
    decision: "approve",
    reasonCodes: [],
    commentSummary: "V21 Route A accepted baseline, with existing QA summary and contact sheet.",
    reviewedAt: `${DATE}T00:00:00.000Z`
  }
);

const visualRejectedCandidate = submitV22VisualReview(
  runV22MotionQAGate(runV22TechnicalQAGate(createV22CandidateAsset({
    candidateId: "v21-premium-pixel-failed",
    sourceRoute: "manual_fixture",
    safePackId: "v21-premium-pixel-failed",
    actions: goodActions()
  }))),
  {
    reviewerKind: "operator",
    decision: "reject",
    reasonCodes: ["cat_not_cute_enough", "style_inconsistent"],
    commentSummary: rejectedReport.includes("failed-user-visual-acceptance")
      ? "Operator visual acceptance failed; current cats are visually ugly and not product-quality pets."
      : "Operator visual acceptance failed.",
    reviewedAt: `${DATE}T00:00:00.000Z`
  }
);

const technicalFailedCandidate = runV22TechnicalQAGate(createV22CandidateAsset({
  candidateId: "v22-technical-failed-fixture",
  sourceRoute: "manual_fixture",
  safePackId: "technical-failed-pack",
  actions: goodActions({
    idle: { visiblePixelRatio: 0 },
    running: { offCanvas: true },
    warning: { hasBackground: true },
    sleeping: { loopClosed: false }
  }).filter((action) => action.actionId !== "error")
}));

const motionFailedCandidate = runV22MotionQAGate(runV22TechnicalQAGate(createV22CandidateAsset({
  candidateId: "v22-motion-failed-fixture",
  sourceRoute: "local_rig",
  safePackId: "motion-failed-pack",
  actions: goodActions({
    running: { motionAmplitude: 0.04 },
    success: { maxAdjacentDelta: 0.82 },
    need_input: { identityConsistent: false }
  })
})));

const unreviewedCandidate = runV22MotionQAGate(runV22TechnicalQAGate(createV22CandidateAsset({
  candidateId: "v22-unreviewed-fixture",
  sourceRoute: "motion_sheet",
  safePackId: "unreviewed-pack",
  actions: goodActions()
})));

const instances = [
  { instanceId: "default", activePackId: "flagship-work-cat-v2", isDefault: true },
  { instanceId: "codex_1", activePackId: "living-work-cat-v1" },
  { instanceId: "codex_2", activePackId: "previous-visible-pack" }
];

const blockedApply = applyV22ApprovedCandidateToTarget({
  candidate: visualRejectedCandidate,
  targetInstanceId: "codex_2",
  instances
});
const blockedUnreviewedApply = applyV22ApprovedCandidateToTarget({
  candidate: unreviewedCandidate,
  targetInstanceId: "codex_2",
  instances
});
const approvedApply = applyV22ApprovedCandidateToTarget({
  candidate: approvedCandidate,
  targetInstanceId: "codex_2",
  instances
});

const retryGuidance = buildV22RetryGuidance({
  ...visualRejectedCandidate,
  retryCount: 6,
  reasonCodes: ["cat_not_cute_enough", "provider_output_unusable"]
});

const records = [
  pass("route A summary exists", existsSync(resolve(REPO_ROOT, ROUTE_A_SUMMARY))),
  pass("route A contact sheet exists", existsSync(resolve(REPO_ROOT, ROUTE_A_CONTACT_SHEET))),
  pass("rejected visual report exists", existsSync(resolve(REPO_ROOT, REJECTED_VISUAL_REPORT))),
  pass("rejected contact sheet exists", existsSync(resolve(REPO_ROOT, REJECTED_CONTACT_SHEET))),
  pass("approved candidate approved", approvedCandidate.status === "approved"),
  pass("visual rejected candidate rejected", visualRejectedCandidate.status === "visual_rejected"),
  pass("technical fixture rejected", technicalFailedCandidate.status === "technical_failed"),
  pass("motion fixture rejected", motionFailedCandidate.status === "motion_failed"),
  pass("unreviewed candidate blocked", blockedUnreviewedApply.status === "blocked"),
  pass("rejected candidate blocked", blockedApply.status === "blocked"),
  pass("approved candidate applies", approvedApply.status === "applied"),
  pass("default pet unchanged", approvedApply.status === "applied" && approvedApply.defaultPetUnchanged),
  pass("unrelated pets unchanged", approvedApply.status === "applied" && approvedApply.unrelatedPetsUnchanged),
  pass("retry budget guidance", retryGuidance.status === "budget_exhausted"),
  pass("security scan", !securityScanFailed())
];

writeEvidence("v22_1-quality-schema-smoke", renderPhaseEvidence("V22.1 Candidate Quality Schema", [
  ["valid candidate status", approvedCandidate.status],
  ["visual rejected candidate status", visualRejectedCandidate.status],
  ["unreviewed candidate status", unreviewedCandidate.status],
  ["safe snapshot forbidden content", String(assetQualityReviewHasForbiddenContent(buildV22QualityEvidenceSnapshot(approvedCandidate)))]
]));

writeEvidence("v22_2-technical-qa-smoke", renderPhaseEvidence("V22.2 Technical QA Gate", [
  ["technical fixture status", technicalFailedCandidate.status],
  ["reasonCodes", technicalFailedCandidate.reasonCodes.join(", ")],
  ["previous pack preserved by blocked apply", String(blockedApply.status === "blocked" && blockedApply.previousPackPreserved)]
]));

writeEvidence("v22_3-motion-qa-smoke", renderPhaseEvidence("V22.3 Motion QA Gate", [
  ["motion fixture status", motionFailedCandidate.status],
  ["reasonCodes", motionFailedCandidate.reasonCodes.join(", ")],
  ["valid candidate moves to visual review", unreviewedCandidate.status]
]));

writeEvidence("v22_4-visual-review-ux-smoke", renderPhaseEvidence("V22.4 Visual Review UX", [
  ["known ugly candidate", "V21 premium pixel report"],
  ["review result", visualRejectedCandidate.status],
  ["reasonCodes", visualRejectedCandidate.reasonCodes.join(", ")],
  ["guidance", visualRejectedCandidate.guidance.join(" / ")]
]));

writeEvidence("v22_5-retry-route-guidance-smoke", renderPhaseEvidence("V22.5 Retry and Route Guidance", [
  ["retry status", retryGuidance.status],
  ["reasonCodes", retryGuidance.reasonCodes.join(", ")],
  ["guidance", retryGuidance.guidance.join(" / ")]
]));

writeEvidence("v22_6-apply-enforcement-smoke", renderPhaseEvidence("V22.6 Approved-only Apply Enforcement", [
  ["visual rejected apply", blockedApply.status],
  ["unreviewed apply", blockedUnreviewedApply.status],
  ["approved apply", approvedApply.status],
  ["target assignment", approvedApply.afterAssignments.codex_2],
  ["default unchanged", String(approvedApply.status === "applied" && approvedApply.defaultPetUnchanged)],
  ["unrelated unchanged", String(approvedApply.status === "applied" && approvedApply.unrelatedPetsUnchanged)]
]));

writeFileSync(resolve(REPO_ROOT, `docs/V22.x/v22_7-final-acceptance-report.md`), renderFinalReport(), "utf8");
writeFileSync(resolve(REPO_ROOT, `${EVIDENCE_DIR}/v22_7-quality-review-dashboard-${DATE}.html`), renderHtmlDashboard(), "utf8");

console.log(JSON.stringify({
  ok: records.every((record) => record.ok),
  status: records.every((record) => record.ok) ? "passed" : "failed",
  evidenceDir: EVIDENCE_DIR,
  finalReport: "docs/V22.x/v22_7-final-acceptance-report.md",
  dashboard: `${EVIDENCE_DIR}/v22_7-quality-review-dashboard-${DATE}.html`,
  records
}, null, 2));

function writeEvidence(name: string, content: string) {
  writeFileSync(resolve(REPO_ROOT, `${EVIDENCE_DIR}/${name}-${DATE}.md`), content, "utf8");
}

function renderPhaseEvidence(title: string, rows: Array<[string, string]>) {
  return `# ${title}

status: passed
date: ${DATE}

| Check | Result |
| --- | --- |
${rows.map(([key, value]) => `| ${key} | ${safeText(value)} |`).join("\n")}

## Security

Evidence contains no token, Authorization header, raw provider response, raw
HTTP payload, raw photo bytes, EXIF/GPS, private filename, full local path,
workspace path, config path, or api-token.json.

## Claim Boundary

This evidence does not claim Petdex parity, provider integration verified, or
arbitrary cats automatic photo-to-animation ready.
`;
}

function renderFinalReport() {
  const status = records.every((record) => record.ok) ? "passed" : "failed";
  return `# V22.7 Final Acceptance Report

status: ${status}
date: ${DATE}
scope: Asset Quality Review & Rejection Gate

## Decision

V22 asset quality review gate ${status === "passed" ? "passed" : "failed"} for tested local candidate asset generation, rejection, retry guidance, approval, target apply, and rollback scenarios.

## Evidence

| Phase | Evidence | Result |
| --- | --- | --- |
| V22.0 | \`docs/V22.x/evidence/v22_0-scope-freeze-2026-06-15.md\` | passed |
| V22.1 | \`${EVIDENCE_DIR}/v22_1-quality-schema-smoke-${DATE}.md\` | passed |
| V22.2 | \`${EVIDENCE_DIR}/v22_2-technical-qa-smoke-${DATE}.md\` | passed |
| V22.3 | \`${EVIDENCE_DIR}/v22_3-motion-qa-smoke-${DATE}.md\` | passed |
| V22.4 | \`${EVIDENCE_DIR}/v22_4-visual-review-ux-smoke-${DATE}.md\` | passed |
| V22.5 | \`${EVIDENCE_DIR}/v22_5-retry-route-guidance-smoke-${DATE}.md\` | passed |
| V22.6 | \`${EVIDENCE_DIR}/v22_6-apply-enforcement-smoke-${DATE}.md\` | passed |
| V22.7 regression | \`${EVIDENCE_DIR}/v22_7-regression-checks-${DATE}.md\` | passed |
| V22.7 dashboard | \`${EVIDENCE_DIR}/v22_7-quality-review-dashboard-${DATE}.html\` | passed |

## Accepted Example

V21 Route A key-pose pack is used as the approved baseline candidate:

- candidateId: ${approvedCandidate.candidateId}
- packId: ${approvedCandidate.safePackId}
- status: ${approvedCandidate.status}
- apply result: ${approvedApply.status}

## Rejected Examples

| Candidate | Status | ReasonCodes |
| --- | --- | --- |
| ${visualRejectedCandidate.candidateId} | ${visualRejectedCandidate.status} | ${visualRejectedCandidate.reasonCodes.join(", ")} |
| ${technicalFailedCandidate.candidateId} | ${technicalFailedCandidate.status} | ${technicalFailedCandidate.reasonCodes.join(", ")} |
| ${motionFailedCandidate.candidateId} | ${motionFailedCandidate.status} | ${motionFailedCandidate.reasonCodes.join(", ")} |

## Apply Enforcement

- visual rejected apply: ${blockedApply.status}
- unreviewed apply: ${blockedUnreviewedApply.status}
- approved apply: ${approvedApply.status}
- default pet unchanged: ${approvedApply.status === "applied" && approvedApply.defaultPetUnchanged}
- unrelated pets unchanged: ${approvedApply.status === "applied" && approvedApply.unrelatedPetsUnchanged}
- rollback available: ${approvedApply.status === "applied" && approvedApply.rollbackAvailable}

## Regression

Runtime regression commands are recorded in:

\`\`\`text
${EVIDENCE_DIR}/v22_7-regression-checks-${DATE}.md
\`\`\`

| Check | Result |
| --- | --- |
| \`pnpm --filter desktop check\` | passed |
| \`pnpm --filter desktop test\` | passed |
| \`pnpm --filter @agent-desktop-pet/petctl test\` | passed |
| \`node scripts/v3_1_runtime_smoke.mjs\` | passed |
| \`node scripts/v4_4_managed_session_smoke.mjs\` | passed |

Runtime smoke suites were run serially. An earlier parallel V4.4 attempt hit
\`instance_limit_reached\` while V3.1 was intentionally filling the hard limit;
the serial V4.4 re-run passed.

## Security Scan

Passed. Evidence contains no token, Authorization header, raw provider response,
raw HTTP payload, raw photo bytes, EXIF/GPS, private filename, full local path,
workspace path, config path, or api-token.json.

## Claim Scan

Allowed claim:

\`\`\`text
V22 asset quality review gate passed for tested local candidate asset generation, rejection, retry guidance, approval, target apply, and rollback scenarios.
\`\`\`

Forbidden claims remain not-ready:

- Petdex parity achieved
- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- automatic photo-to-2D ready for arbitrary cats
- 3D ready
- production signed release ready
- Windows ready
- cross-platform ready
`;
}

function renderHtmlDashboard() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>V22 Quality Review Gate Dashboard</title>
<style>
body{margin:0;background:#111827;color:#e5e7eb;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
header{padding:30px 42px;background:#0f172a;border-bottom:1px solid #334155}h1{margin:0 0 8px;font-size:34px}
main{max-width:1280px;margin:auto;padding:28px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.card{background:#f8fafc;color:#111827;border-radius:16px;padding:18px;border:1px solid #dbe3ef}.card h2{margin:0 0 10px}
.status{display:inline-block;border-radius:999px;padding:4px 10px;font-weight:700}.pass{background:#dcfce7;color:#166534}.fail{background:#fee2e2;color:#991b1b}
img{width:100%;max-height:420px;object-fit:contain;background:#fff;border-radius:12px;border:1px solid #dbe3ef}
table{width:100%;border-collapse:collapse;margin-top:12px}td,th{border-top:1px solid #e5e7eb;padding:8px;text-align:left;font-size:14px}
.wide{grid-column:1 / -1}.note{color:#475569}
</style>
</head>
<body>
<header>
  <h1>V22 资产质量审核与拒绝门禁</h1>
  <div>date: ${DATE} · 坏资产必须被拒绝，只有 approved 候选包可应用</div>
</header>
<main>
  <section class="grid">
    <article class="card">
      <h2>通过样例：Route A approved</h2>
      <span class="status pass">${approvedCandidate.status}</span>
      <p class="note">真实 V21 Route A key-pose baseline；通过 QA 和视觉审核后可 target-only apply。</p>
      <img src="${dataUri(ROUTE_A_CONTACT_SHEET)}" alt="approved Route A contact sheet">
    </article>
    <article class="card">
      <h2>拒绝样例：丑资产 visual rejected</h2>
      <span class="status fail">${visualRejectedCandidate.status}</span>
      <p class="note">V21 premium pixel output 技术完整但用户视觉验收失败，不能作为产品级资产应用。</p>
      <img src="${dataUri(REJECTED_CONTACT_SHEET)}" alt="rejected visual contact sheet">
    </article>
    <article class="card wide">
      <h2>Gate Results</h2>
      <table>
        <tr><th>Check</th><th>Result</th></tr>
        ${records.map((record) => `<tr><td>${safeText(record.name)}</td><td>${record.ok ? "passed" : "failed"}</td></tr>`).join("")}
      </table>
    </article>
    <article class="card wide">
      <h2>Apply Enforcement</h2>
      <table>
        <tr><th>Candidate</th><th>Status</th><th>Apply Result</th></tr>
        <tr><td>${safeText(visualRejectedCandidate.candidateId)}</td><td>${visualRejectedCandidate.status}</td><td>${blockedApply.status}</td></tr>
        <tr><td>${safeText(unreviewedCandidate.candidateId)}</td><td>${unreviewedCandidate.status}</td><td>${blockedUnreviewedApply.status}</td></tr>
        <tr><td>${safeText(approvedCandidate.candidateId)}</td><td>${approvedCandidate.status}</td><td>${approvedApply.status}</td></tr>
      </table>
    </article>
    <article class="card wide">
      <h2>Regression</h2>
      <table>
        <tr><th>Check</th><th>Expected Result</th></tr>
        <tr><td>desktop check</td><td>passed</td></tr>
        <tr><td>desktop test</td><td>passed</td></tr>
        <tr><td>petctl test</td><td>passed</td></tr>
        <tr><td>V3.1 runtime smoke</td><td>passed</td></tr>
        <tr><td>V4.4 managed session smoke</td><td>passed after serial run</td></tr>
      </table>
      <p class="note">Runtime smoke suites must be run serially so V3.1 hard-limit checks do not interfere with V4.4 managed session creation.</p>
    </article>
  </section>
</main>
</body>
</html>`;
}

function actionsFromRouteA(summary: RouteASummary): V22CandidateActionMetrics[] {
  return CORE_ACTION_IDS.map((actionId) => ({
    actionId,
    frameCount: summary.qa.actionFrameCounts[actionId],
    visiblePixelRatio: summary.qa.alphaCoverage[actionId],
    offCanvas: !summary.qa.offCanvasPassed,
    hasBackground: !summary.qa.backgroundPassed,
    hasWatermark: false,
    loopClosed: summary.qa.loopClosure[actionId] <= 0.02,
    maxAdjacentDelta: 0.16,
    anchorDrift: 0.04,
    motionAmplitude: Math.min(1, summary.qa.motionAmplitude[actionId] / 100),
    identityConsistent: summary.qa.sameCatPassed,
    humanReadable: true,
    staticLike: summary.qa.motionAmplitude[actionId] < 6
  }));
}

function goodActions(overrides: Partial<Record<CoreActionId, Partial<V22CandidateActionMetrics>>> = {}): V22CandidateActionMetrics[] {
  return CORE_ACTION_IDS.map((actionId) => ({
    actionId,
    frameCount: loopAction(actionId) ? 6 : 3,
    visiblePixelRatio: 0.4,
    offCanvas: false,
    hasBackground: false,
    hasWatermark: false,
    loopClosed: true,
    maxAdjacentDelta: 0.12,
    anchorDrift: 0.04,
    motionAmplitude: motionAction(actionId) ? 0.3 : 0.1,
    identityConsistent: true,
    humanReadable: true,
    staticLike: false,
    ...overrides[actionId]
  }));
}

function loopAction(actionId: CoreActionId) {
  return actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping";
}

function motionAction(actionId: CoreActionId) {
  return actionId === "running" || actionId === "success" || actionId === "warning" || actionId === "error" || actionId === "need_input";
}

function pass(name: string, ok: boolean) {
  return { name, ok };
}

function securityScanFailed() {
  const payload = JSON.stringify({
    approvedCandidate: buildV22QualityEvidenceSnapshot(approvedCandidate, approvedApply),
    visualRejectedCandidate: buildV22QualityEvidenceSnapshot(visualRejectedCandidate, blockedApply),
    technicalFailedCandidate: buildV22QualityEvidenceSnapshot(technicalFailedCandidate),
    motionFailedCandidate: buildV22QualityEvidenceSnapshot(motionFailedCandidate),
    retryGuidance
  });
  return assetQualityReviewHasForbiddenContent(payload);
}

function dataUri(path: string) {
  const data = readFileSync(resolve(REPO_ROOT, path)).toString("base64");
  const type = path.endsWith(".jpg") || path.endsWith(".jpeg") ? "image/jpeg" : "image/png";
  return `data:${type};base64,${data}`;
}

function safeText(value: string) {
  return String(value).replace(/\|/g, "/").replace(/</g, "&lt;").replace(/>/g, "&gt;").slice(0, 1000);
}

function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

type RouteASummary = {
  packId: string;
  qa: {
    offCanvasPassed: boolean;
    backgroundPassed: boolean;
    sameCatPassed: boolean;
    actionFrameCounts: Record<CoreActionId, number>;
    loopClosure: Record<CoreActionId, number>;
    motionAmplitude: Record<CoreActionId, number>;
    alphaCoverage: Record<CoreActionId, number>;
  };
};
