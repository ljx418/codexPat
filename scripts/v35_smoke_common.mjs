import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildV34Context,
  date,
  escapeHtml,
  repoRoot,
  runClaimScan as runV34ClaimScan,
  runSecurityScan as runV34SecurityScan,
  safeRelative
} from "./v34_smoke_common.mjs";
import {
  assessV35RouteCandidate,
  compareV35Routes,
  createV35RouteA2UpliftCandidate,
  createV35RouteBSourceBoundary,
  createV35TargetExperienceRubric,
  decideV35FinalRoute,
  v35HasForbiddenContent
} from "../apps/desktop/src/assets/v35-target-experience-quality.ts";
import {
  runV34GenerationProductE2E,
  runV34GenerationQualityGate
} from "../apps/desktop/src/assets/v34-generation-quality-gate.ts";

const __filename = fileURLToPath(import.meta.url);
export const v35RepoRoot = path.resolve(path.dirname(__filename), "..");
export const v35Date = date;
export const v35EvidenceDir = path.join(v35RepoRoot, "docs", "V35.x", "evidence");
export const v35DerivativeDir = path.join(v35EvidenceDir, "derivatives");

export const v35ForbiddenReadyClaims = [
  "Petdex parity achieved",
  "automatic photo-to-animation ready for arbitrary cats",
  "automatic photo-to-2D ready for arbitrary cats",
  "provider integration verified",
  "3D ready",
  "production signed release ready",
  "Windows ready",
  "cross-platform ready",
  "MCP ready",
  "Claude Code integration verified",
  "OS-level Codex window binding ready",
  "all Codex workflows verified"
];

export function buildV35Context() {
  fs.mkdirSync(v35DerivativeDir, { recursive: true });
  const v34 = buildV34Context();
  const rubric = createV35TargetExperienceRubric();
  const routeA2Packs = v34.passedPacks.slice(0, 2).map((pack) => {
    const uplift = createV35RouteA2UpliftCandidate(pack);
    writeV35DerivativeEvidence(uplift);
    return uplift;
  });
  const routeA2QaResults = routeA2Packs.map((pack) => runV34GenerationQualityGate(pack));
  const routeA2ProductResults = routeA2Packs.map((pack, index) => runV34GenerationProductE2E({
    pack,
    qa: routeA2QaResults[index],
    userApproved: true,
    targetInstanceId: "v35-target-pet",
    instances: [
      { instanceId: "default", displayName: "Default Pet", activePackId: "css-default" },
      { instanceId: "v35-target-pet", displayName: "V35 Target", activePackId: "previous-pack" },
      { instanceId: "v35-unrelated", displayName: "Unrelated Pet", activePackId: "living-work-cat-v1" }
    ]
  }));
  const negativeProductResults = [
    { pack: v34.transformOnlyNegative, suffix: "transform_only_negative" },
    { pack: v34.missingTargetNegative, suffix: "missing_action_negative" }
  ].map(({ pack: sourcePack, suffix }) => {
    const pack = {
      ...sourcePack,
      candidateId: sourcePack.candidateId.replace("_v34_route_a2_pack", `_v35_${suffix}`)
    };
    const qa = runV34GenerationQualityGate(pack);
    return runV34GenerationProductE2E({
      pack,
      qa,
      userApproved: true,
      targetInstanceId: "v35-target-pet",
      instances: [
        { instanceId: "default", displayName: "Default Pet", activePackId: "css-default" },
        { instanceId: "v35-target-pet", displayName: "V35 Target", activePackId: "previous-pack" },
        { instanceId: "v35-unrelated", displayName: "Unrelated Pet", activePackId: "living-work-cat-v1" }
      ]
    });
  });
  const routeA2Assessments = routeA2Packs.map((pack, index) => assessV35RouteCandidate({
    rubric,
    routeId: "route_a2_quality_uplift",
    pack,
    productResult: routeA2ProductResults[index]
  }));
  const routeBBoundaries = routeA2Packs.map((pack) => createV35RouteBSourceBoundary({
    sampleId: pack.runtimeQaCandidates.identityGate.sampleId,
    characterAssetId: pack.characterAssetId,
    partMapBinding: `docs/V34.x/evidence/derivatives/${pack.runtimeQaCandidates.identityGate.sampleId}-part-map`
  }));
  const routeBPacks = routeA2Packs.map((pack) => ({
    ...pack,
    candidateId: pack.candidateId.replace("_route_a2_uplift_pack", "_route_b_blocked_candidate"),
    visualEvidenceRefs: [],
    contactSheetEvidenceRef: "",
    playbackEvidenceRef: "",
    manifestRef: ""
  }));
  const routeBAssessments = routeBPacks.map((pack, index) => assessV35RouteCandidate({
    rubric,
    routeId: "route_b_professional_assisted",
    pack,
    routeBSourceBoundary: routeBBoundaries[index]
  }));
  const comparisons = routeA2Assessments.map((assessment, index) => compareV35Routes({
    routeA2: assessment,
    routeB: routeBAssessments[index]
  }));
  return {
    rubric,
    v34,
    routeA2Packs,
    routeA2QaResults,
    routeA2ProductResults,
    negativeProductResults,
    routeA2Assessments,
    routeBBoundaries,
    routeBAssessments,
    comparisons
  };
}

export function buildV35FinalDecision(context, evidenceRefs = []) {
  const claimScan = runClaimScan(JSON.stringify({
    routeA2Assessments: context.routeA2Assessments,
    routeBBoundaries: context.routeBBoundaries,
    comparisons: context.comparisons
  }));
  const securityScan = runSecurityScan({
    routeA2Assessments: context.routeA2Assessments,
    routeBBoundaries: context.routeBBoundaries,
    comparisons: context.comparisons
  });
  return decideV35FinalRoute({
    assessments: [...context.routeA2Assessments, ...context.routeBAssessments],
    comparisons: context.comparisons,
    evidenceRefs,
    claimScanStatus: claimScan.status,
    securityScanStatus: securityScan.status
  });
}

export function runClaimScan(text) {
  const base = runV34ClaimScan(text);
  const hits = [
    ...new Set([
      ...base.hits,
      ...v35ForbiddenReadyClaims.filter((phrase) => text.includes(phrase))
    ])
  ];
  return {
    status: hits.length === 0 ? "passed" : "failed",
    hits
  };
}

export function runSecurityScan(value) {
  const base = runV34SecurityScan(value);
  return {
    status: base.status === "passed" && !v35HasForbiddenContent(value) ? "passed" : "failed"
  };
}

export function writeEvidence(relPath, body) {
  const absPath = path.join(repoRoot, relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, body, "utf8");
  return safeRelative(absPath);
}

export function printResult(result) {
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

export function assessmentRows(assessments) {
  return assessments.map((item) =>
    `| ${item.routeId} | ${item.candidateId} | ${item.sampleId} | ${item.rubricStatus} | ${item.qaStatus} | ${item.averageLocalPartMotionScore.toFixed(3)} | ${item.sourceBoundaryStatus} | ${item.reasonCodes.join(", ")} |`
  ).join("\n");
}

export function comparisonRows(comparisons) {
  return comparisons.map((item) =>
    `| ${item.sampleId} | ${item.routeA2CandidateId} | ${item.routeA2Status} | ${item.routeBCandidateId} | ${item.routeBStatus} | ${item.winner} | ${item.reasonCodes.join(", ")} |`
  ).join("\n");
}

export function productRows(context) {
  return [...context.routeA2ProductResults, ...context.negativeProductResults].map((item) =>
    `| ${item.candidateId} | ${item.sampleId} | ${item.qaStatus} | ${item.previewStatus} | ${item.applyStatus} | ${item.rollbackStatus} | ${item.failedCandidateBlocked} |`
  ).join("\n");
}

export function evidenceHeader({ title, phase, spec }) {
  return [
    `# ${title}`,
    "",
    `Date: ${v35Date}`,
    "",
    "## PRD / Spec Review",
    `- PRD: docs/active/agent_desktop_pet_prd_v35.md reviewed for ${phase}.`,
    `- Spec: ${spec} reviewed and mapped to this evidence.`,
    "- Boundary: named samples only; no arbitrary-cat, provider, production, Windows, or cross-platform readiness claim.",
    ""
  ].join("\n");
}

export function scanBlock(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const claimScan = runClaimScan(text);
  const securityScan = runSecurityScan(value);
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

export function escape(value) {
  return escapeHtml(value);
}

function writeV35DerivativeEvidence(pack) {
  fs.writeFileSync(path.join(repoRoot, pack.manifestRef), JSON.stringify({
    candidateId: pack.candidateId,
    characterAssetId: pack.characterAssetId,
    rendererKind: pack.rendererKind,
    targetActions: pack.actions,
    runtimeProjectionActions: pack.runtimeCoreProjection.actions,
    frameCountByAction: pack.frameCountByAction,
    localMotionEvidence: pack.localMotionEvidence,
    visualEvidenceRefs: pack.visualEvidenceRefs,
    semanticEquivalenceClaimed: pack.runtimeCoreProjection.semanticEquivalenceClaimed,
    scopedBoundary: "named samples only"
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(repoRoot, pack.contactSheetEvidenceRef), contactSheetSvg(pack), "utf8");
  fs.writeFileSync(path.join(repoRoot, pack.playbackEvidenceRef), playbackSummary(pack), "utf8");
}

function contactSheetSvg(pack) {
  const palette = paletteFor(pack.characterAssetId);
  const cards = pack.targetActionFrames.map((action, index) => {
    const x = 24 + (index % 4) * 210;
    const y = 64 + Math.floor(index / 4) * 160;
    return actionCardSvg({ action, x, y, index, palette });
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="420" viewBox="0 0 900 420">
  <rect width="900" height="420" fill="#f7fafc"/>
  <text x="24" y="30" font-family="Arial" font-size="18" font-weight="700" fill="#172033">V35 Route A2 uplift contact sheet</text>
  <text x="24" y="50" font-family="Arial" font-size="12" fill="#475569">${pack.candidateId}</text>
  ${cards}
</svg>`;
}

function actionCardSvg({ action, x, y, index, palette }) {
  const tailLift = Math.round(action.localPartMotionScore * 28);
  const legOffset = index % 2 === 0 ? 8 : -8;
  const eye = action.targetActionId === "sleep" ? "M" : "o";
  const symbol = symbolFor(action.targetActionId, x, y);
  return `<g>
    <rect x="${x}" y="${y}" width="180" height="128" rx="8" fill="#ffffff" stroke="#cbd5e1"/>
    <ellipse cx="${x + 92}" cy="${y + 68}" rx="48" ry="30" fill="${palette.body}" stroke="#334155" stroke-width="2"/>
    <circle cx="${x + 72}" cy="${y + 42}" r="24" fill="${palette.face}" stroke="#334155" stroke-width="2"/>
    <path d="M${x + 54} ${y + 24} l10 -22 l12 24" fill="${palette.face}" stroke="#334155" stroke-width="2"/>
    <path d="M${x + 82} ${y + 24} l12 -22 l10 24" fill="${palette.face}" stroke="#334155" stroke-width="2"/>
    <text x="${x + 63}" y="${y + 46}" font-family="Arial" font-size="15" fill="#111827">${eye}</text>
    <text x="${x + 79}" y="${y + 46}" font-family="Arial" font-size="15" fill="#111827">${eye}</text>
    <path d="M${x + 58} ${y + 56} q14 10 30 0" stroke="#111827" stroke-width="2" fill="none"/>
    <path d="M${x + 126} ${y + 60} q34 -${tailLift} 30 -48" stroke="${palette.tail}" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M${x + 62} ${y + 92} q${legOffset} 18 22 22" stroke="#334155" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M${x + 104} ${y + 92} q${-legOffset} 18 20 22" stroke="#334155" stroke-width="6" stroke-linecap="round" fill="none"/>
    ${symbol}
    <text x="${x + 12}" y="${y + 116}" font-family="Arial" font-size="13" fill="#172033">${action.targetActionId}  motion ${Math.round(action.localPartMotionScore * 100)}</text>
  </g>`;
}

function symbolFor(actionId, x, y) {
  if (actionId === "eat") return `<circle cx="${x + 138}" cy="${y + 102}" r="12" fill="#facc15" stroke="#92400e"/><path d="M${x + 128} ${y + 102} h20" stroke="#92400e"/>`;
  if (actionId === "play") return `<circle cx="${x + 145}" cy="${y + 30}" r="12" fill="#fb7185"/><path d="M${x + 145} ${y + 42} q-20 18 -44 20" stroke="#be123c" fill="none"/>`;
  if (actionId === "alert") return `<path d="M${x + 136} ${y + 20} l10 -12 l10 12" stroke="#dc2626" stroke-width="3" fill="none"/><path d="M${x + 150} ${y + 12} v24" stroke="#dc2626" stroke-width="3"/>`;
  if (actionId === "celebrate") return `<path d="M${x + 140} ${y + 26} l8 16 l18 2 l-13 12 l4 18 l-17 -9 l-17 9 l4 -18 l-13 -12 l18 -2z" fill="#f59e0b"/>`;
  if (actionId === "jump") return `<path d="M${x + 36} ${y + 96} q54 -64 112 -8" stroke="#38bdf8" stroke-width="3" fill="none" stroke-dasharray="6 4"/>`;
  if (actionId === "walk") return `<path d="M${x + 30} ${y + 112} h112" stroke="#94a3b8" stroke-width="3" stroke-dasharray="8 5"/>`;
  return "";
}

function playbackSummary(pack) {
  return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>${escapeHtml(pack.candidateId)}</title><body><h1>V35 Route A2 Uplift Playback Summary</h1><p>candidateId: ${escapeHtml(pack.candidateId)}</p><p>characterAssetId: ${escapeHtml(pack.characterAssetId)}</p><p>status: ${escapeHtml(pack.status)}</p><ul>${pack.targetActionFrames.map((action) => `<li>${escapeHtml(action.targetActionId)}: ${action.frameCount} frames, local part motion ${action.localPartMotionScore}, cue ${escapeHtml(action.semanticCue)}</li>`).join("")}</ul><p>Scoped named-sample evidence only. Human visual review is still required before broad quality claims.</p></body></html>`;
}

function paletteFor(id) {
  if (id.includes("calico")) return { body: "#f7d6a8", face: "#fff7ed", tail: "#9a3412" };
  if (id.includes("silver")) return { body: "#cbd5e1", face: "#f8fafc", tail: "#64748b" };
  return { body: "#f4a261", face: "#fff7ed", tail: "#c2410c" };
}
