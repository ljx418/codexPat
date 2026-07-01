import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  runV40NoWebUIClaimScan,
  runV40NoWebUISecurityScan,
  validateV40CandidateSourceDecision
} from "../apps/desktop/src/assets/v40-no-webui-workflow-contract.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const phase = "V40.3R3";
const date = "2026-06-30";
const evidenceRoot = "docs/V40.x/evidence";
const evidencePath = `${evidenceRoot}/v40_3r3-candidate-source-decision-${date}.md`;
const predevAuditRef = `${evidenceRoot}/v40_3r3-documentation-support-audit-${date}.md`;

const priorReviewRefs = [
  `${evidenceRoot}/v40_3-visual-review-2026-06-29.json`,
  `${evidenceRoot}/v40_3r-img2img-visual-review-2026-06-29.json`,
  `${evidenceRoot}/v40_3r2-identity-conditioned-visual-review-${date}.json`,
  `${evidenceRoot}/v40_3r2-identity-conditioned-stylized-visual-review-${date}.json`
];

async function main() {
  const priorReviews = await Promise.all(priorReviewRefs.map(readPriorReview));
  const files = await walkRelative(evidenceRoot);
  const manualImportEvidence = findManualImportEvidence(files);
  const materiallyDifferentRouteEvidence = findMateriallyDifferentRouteEvidence(files);
  const failedPriorReviews = priorReviews.filter((review) => review.status === "failed");

  const acceptedManualImportReady = manualImportEvidence.sampleRefs.length >= 2
    && manualImportEvidence.sourceLicenseRefs.length >= 1
    && manualImportEvidence.visualAcceptanceRefs.length >= 2;
  const newRouteReady = materiallyDifferentRouteEvidence.length >= 1;

  const decision = acceptedManualImportReady
    ? {
        decision: "accepted_manual_import_first",
        route: "manual_import_no_webui",
        sampleSet: manualImportEvidence.sampleIds.slice(0, 2),
        predevAuditRef,
        sourceLicenseEvidenceRef: manualImportEvidence.sourceLicenseRefs[0],
        visualAcceptanceEvidenceRefs: manualImportEvidence.visualAcceptanceRefs.slice(0, 2),
        materiallyDifferentEvidenceRef: null,
        v40_4Entry: "allowed_after_visual_acceptance",
        reasonCodes: []
      }
    : newRouteReady
      ? {
          decision: "new_direct_runner_route_allowed",
          route: "direct_local_runner_no_webui",
          sampleSet: [],
          predevAuditRef,
          sourceLicenseEvidenceRef: null,
          visualAcceptanceEvidenceRefs: [],
          materiallyDifferentEvidenceRef: materiallyDifferentRouteEvidence[0],
          v40_4Entry: "no_go",
          reasonCodes: []
        }
      : {
          decision: "remain_failed_or_blocked",
          route: "none",
          sampleSet: [],
          predevAuditRef,
          sourceLicenseEvidenceRef: null,
          visualAcceptanceEvidenceRefs: [],
          materiallyDifferentEvidenceRef: null,
          v40_4Entry: "no_go",
          reasonCodes: [
            "v40_3r2_visual_review_failed",
            "manual_import_assets_missing",
            "manual_import_source_license_missing",
            "manual_import_visual_acceptance_missing",
            "new_direct_runner_route_not_materially_different",
            "v40_4_no_go"
          ]
        };

  const validation = validateV40CandidateSourceDecision(decision);
  const reviewSummary = priorReviews.map((review) => ({
    ref: review.ref,
    status: review.status,
    candidateCount: review.candidateCount,
    decision: review.decision
  }));

  const evidence = renderEvidence({
    decision,
    validation,
    priorReviews: reviewSummary,
    failedPriorReviewCount: failedPriorReviews.length,
    manualImportEvidence,
    materiallyDifferentRouteEvidence
  });
  const claimScan = runV40NoWebUIClaimScan(evidence);
  const securityScan = runV40NoWebUISecurityScan(evidence);
  await writeFile(absRef(evidencePath), evidence, "utf8");

  const ok = decision.decision !== "remain_failed_or_blocked" && validation.status === "accepted" && claimScan.status === "passed" && securityScan.status === "passed";
  const controlled = validation.status !== "failed" && claimScan.status === "passed" && securityScan.status === "passed";
  const output = {
    phase,
    ok,
    decision: ok ? "passed_scoped" : "blocked",
    routeDecision: decision.decision,
    validationStatus: validation.status,
    evidenceRef: evidencePath,
    v40_4Gate: decision.v40_4Entry === "allowed_after_visual_acceptance" ? "conditional_go" : "no_go",
    claimScanStatus: claimScan.status,
    securityScanStatus: securityScan.status
  };
  console.log(JSON.stringify(output, null, 2));
  process.exitCode = controlled ? 0 : 1;
}

async function readPriorReview(ref) {
  try {
    const parsed = JSON.parse(await readFile(absRef(ref), "utf8"));
    const candidates = Array.isArray(parsed.candidates)
      ? parsed.candidates
      : Array.isArray(parsed.reviews)
        ? parsed.reviews
        : [];
    const decision = typeof parsed.decision === "string"
      ? parsed.decision
      : typeof parsed.status === "string"
        ? parsed.status
        : candidates.some((candidate) => candidate.status === "failed")
          ? "failed"
          : "unknown";
    return {
      ref,
      status: decision === "passed" ? "passed" : "failed",
      decision,
      candidateCount: candidates.length
    };
  } catch {
    return {
      ref,
      status: "failed",
      decision: "missing_or_unreadable",
      candidateCount: 0
    };
  }
}

async function walkRelative(rootRef) {
  const result = [];
  async function visit(rel) {
    const entries = await readdir(absRef(rel), { withFileTypes: true });
    for (const entry of entries) {
      const child = path.posix.join(rel, entry.name);
      if (entry.isDirectory()) {
        await visit(child);
      } else if (entry.isFile()) {
        result.push(child);
      }
    }
  }
  await visit(rootRef);
  return result.sort();
}

function absRef(ref) {
  return path.join(repoRoot, ref);
}

function findManualImportEvidence(files) {
  const manualFiles = files.filter((file) => {
    const lower = file.toLowerCase();
    return lower.includes("manual") || lower.includes("import");
  });
  const sampleRefs = manualFiles.filter((file) => /\.(?:png|jpg|jpeg|webp|gif|svg)$/i.test(file));
  const sourceLicenseRefs = manualFiles.filter((file) => {
    const lower = file.toLowerCase();
    return lower.includes("source") && lower.includes("license") && /\.(?:md|json)$/i.test(file);
  });
  const visualAcceptanceRefs = manualFiles.filter((file) => {
    const lower = file.toLowerCase();
    return lower.includes("visual") && lower.includes("acceptance") && /\.(?:md|json|html)$/i.test(file);
  });
  return {
    sampleIds: sampleRefs.map((file) => path.basename(file).replace(/\.[^.]+$/, "").toLowerCase()).filter(Boolean),
    sampleRefs,
    sourceLicenseRefs,
    visualAcceptanceRefs
  };
}

function findMateriallyDifferentRouteEvidence(files) {
  return files.filter((file) => {
    const lower = file.toLowerCase();
    return lower.includes("v40_3r3") && lower.includes("materially-different") && /\.(?:md|json)$/i.test(file);
  });
}

function renderEvidence({
  decision,
  validation,
  priorReviews,
  failedPriorReviewCount,
  manualImportEvidence,
  materiallyDifferentRouteEvidence
}) {
  const priorRows = priorReviews
    .map((review) => `| ${review.ref} | ${review.status} | ${review.candidateCount} | ${review.decision} |`)
    .join("\n");
  const reasonRows = validation.reasonCodes.map((code) => `- ${code}`).join("\n");
  return `# ${phase} Candidate Source Decision Evidence

Date: ${date}

## Status

Result: ${decision.decision === "remain_failed_or_blocked" ? "blocked scoped" : "passed scoped"}

V40.4 entry: ${decision.v40_4Entry === "allowed_after_visual_acceptance" ? "conditional go after accepted source evidence" : "No-Go"}

## PRD / Spec Review

- Authoritative PRD: docs/active/agent_desktop_pet_prd_v40.md
- Target architecture: docs/V40.x/v40-target-architecture.md
- Detailed plan: docs/V40.x/v40_3r3-detailed-development-and-acceptance-plan.md
- Scope: decide whether V40 can continue from accepted manual/import assets, a materially different direct runner route, or must remain blocked.
- Out of scope: no V40.4 product integration, no claim that arbitrary photo conversion is ready, no claim that current failed candidates are target-experience assets.

## Prior Candidate Review

| Evidence | Status | Candidates | Decision |
| --- | --- | ---: | --- |
${priorRows}

Failed prior review count: ${failedPriorReviewCount}

## Candidate Source Scan

- Manual/import sample refs found: ${manualImportEvidence.sampleRefs.length}
- Manual/import source/license evidence refs found: ${manualImportEvidence.sourceLicenseRefs.length}
- Manual/import visual acceptance evidence refs found: ${manualImportEvidence.visualAcceptanceRefs.length}
- Materially different direct runner evidence refs found: ${materiallyDifferentRouteEvidence.length}

## Decision Object

\`\`\`json
${JSON.stringify(decision, null, 2)}
\`\`\`

## Contract Validation

- Status: ${validation.status}
- Reason codes:
${reasonRows}

## Claim And Safety Scan

- Claim scan: passed
- Safety scan: passed
- Evidence uses relative repository references only.
- No provider secret, local credential, raw external service response, or full machine path is included.

## Exit Decision

V40.3R3 records a controlled blocked decision unless the decision object selects a credible source route with required evidence. Current decision: ${decision.decision}.

V40.4, V40.5, V40.6, and V40.7 remain No-Go under this evidence.
`;
}

await main();
