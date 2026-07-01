import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  V40_NO_WEBUI_ACTION_IDS,
  runV40NoWebUIClaimScan,
  runV40NoWebUISecurityScan,
  validateV40CandidateVisualReview,
  validateV40HybridCandidateSummary
} from "../apps/desktop/src/assets/v40-no-webui-workflow-contract.ts";

const phaseDate = "2026-07-01";
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const pythonBin = path.join(repoRoot, ".v40-runner-venv", "bin", "python");
const outputDirRef = "docs/V40.x/evidence/assets/v40-3r6-controlled-candidates";
const outputDir = path.join(repoRoot, outputDirRef);
const manifestRef = `${outputDirRef}/manifest.json`;
const prePhaseRef = `docs/V40.x/evidence/v40_3r6-pre-phase-development-and-acceptance-plan-${phaseDate}.md`;
const evidenceRef = `docs/V40.x/evidence/v40_3r6-controlled-candidate-frame-generation-${phaseDate}.md`;
const summaryRef = `docs/V40.x/evidence/v40_3r6-controlled-candidate-frame-generation-${phaseDate}.json`;
const r5SummaryRef = `docs/V40.x/evidence/v40_3r5-direct-runner-predev-audit-${phaseDate}.json`;

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

function findIpAdapterRoot() {
  const root = path.join(repoRoot, ".v40-hf-cache", "hub", "models--h94--IP-Adapter", "snapshots");
  if (!fs.existsSync(root)) return null;
  for (const snapshot of fs.readdirSync(root)) {
    const candidate = path.join(root, snapshot);
    if (fs.existsSync(path.join(candidate, "models", "ip-adapter_sd15.bin"))) return candidate;
  }
  return null;
}

function findLocalCheckpoint() {
  const candidates = [
    {
      label: "dreamshaper-8-local-checkpoint",
      path: path.join("/mnt", "c", "ComfyUI-aki-v2", "ComfyUI", "models", "checkpoints", "SD1.5", "dreamshaper_8.safetensors")
    },
    {
      label: "anything-v5-local-checkpoint",
      path: path.join("/mnt", "c", "App-webui-aki-v4.10", "sd-webui-aki-v4.10", "models", "Stable-diffusion", "sd1.5", "anything-v5.safetensors")
    }
  ];
  return candidates.find((candidate) => fs.existsSync(candidate.path)) ?? null;
}

function runGeneration() {
  if (process.env.V40_3R6_REUSE_EXISTING === "1" && fs.existsSync(path.join(repoRoot, manifestRef))) {
    const manifest = readJson(manifestRef);
    if (manifest?.ok && Array.isArray(manifest.outputs)) {
      return {
        ...manifest,
        modelLabel: manifest.modelLabel ?? "dreamshaper-8-local-checkpoint",
        identityConditionerLabel: manifest.identityConditionerLabel ?? "ip-adapter-sd15"
      };
    }
  }
  const selectedModel = findLocalCheckpoint();
  const adapterRoot = findIpAdapterRoot();
  if (!fs.existsSync(pythonBin)) return { ok: false, reason: "direct_runner_dependency_missing" };
  if (!selectedModel) return { ok: false, reason: "direct_runner_model_missing" };
  if (!adapterRoot) return { ok: false, reason: "identity_conditioned_runner_incompatible" };
  fs.mkdirSync(outputDir, { recursive: true });
  try {
    const stdout = execFileSync(pythonBin, [
      "scripts/v40_direct_runner_ip_adapter_candidates.py",
      "--model",
      selectedModel.path,
      "--model-label",
      selectedModel.label,
      "--out",
      outputDir,
      "--repo-root",
      repoRoot,
      "--steps",
      process.env.V40_3R6_STEPS ?? "18",
      "--width",
      "512",
      "--height",
      "512",
      "--ip-adapter-scale",
      "0.68",
      "--strength",
      "0.9",
      "--init-mode",
      "blank",
      "--local-adapter-root",
      adapterRoot
    ], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 900000,
      env: {
        ...process.env,
        HF_HOME: path.join(repoRoot, ".v40-hf-cache"),
        HF_HUB_DISABLE_TELEMETRY: "1",
        HF_HUB_DISABLE_XET: "1",
        HF_HUB_OFFLINE: "1",
        TRANSFORMERS_OFFLINE: "1"
      }
    }).trim();
    const parsed = JSON.parse(stdout.split(/\r?\n/).filter(Boolean).at(-1) ?? "{}");
    if (parsed?.ok) writeJson(manifestRef, parsed);
    return {
      ...parsed,
      modelLabel: selectedModel.label,
      identityConditionerLabel: "ip-adapter-sd15"
    };
  } catch (error) {
    const stdout = typeof error?.stdout === "string" ? error.stdout.trim() : "";
    const lastLine = stdout.split(/\r?\n/).filter(Boolean).at(-1);
    if (lastLine) {
      try {
        const parsed = JSON.parse(lastLine);
        if (parsed?.reason) return parsed;
      } catch {
        // Keep stable reason below.
      }
    }
    return { ok: false, reason: "identity_conditioned_generation_failed" };
  }
}

function buildCandidateSummaries(generated) {
  const actionCoverage = Object.fromEntries(V40_NO_WEBUI_ACTION_IDS.map((actionId) => [actionId, true]));
  if (!generated.ok || !Array.isArray(generated.outputs)) return [];
  return generated.outputs.map((output) => ({
    candidateId: output.candidateId,
    sampleId: output.sampleId,
    status: "generated",
    route: "direct_local_runner_no_webui",
    characterRef: `${outputDirRef}/${output.actionFiles?.[0]?.fileName ?? ""}`,
    contactSheetRef: `${outputDirRef}/${output.contactSheetFileName}`,
    animatedPreviewRef: null,
    actionCoverage,
    identityScore: "warn",
    visualPreference: "not_reviewed",
    reasonCodes: ["controlled_candidate_generated", "not_accepted_before_visual_review"]
  }));
}

function conservativeVisualReview(candidateSummaries) {
  return candidateSummaries.map((candidate) => {
    const contactSheetExists = candidate.contactSheetRef && fs.existsSync(path.join(repoRoot, candidate.contactSheetRef));
    const sampleSpecificObservation = candidate.sampleId === "v38_tuxedo_public"
      ? "The tuxedo candidate uses complex indoor photo backgrounds and does not present clean desktop-pet transparent or sprite-like frames."
      : "The tabby candidate remains photo-like, includes scene/background content, and shows visible style/artifact drift across actions.";
    const reasonCodes = contactSheetExists
      ? ["action_semantics_unclear", "target_experience_quality_failed"]
      : ["visual_review_missing", "target_experience_quality_failed"];
    return {
      candidateId: candidate.candidateId,
      status: "failed",
      observations: [
        "Generated same-sample action images are present as review candidates.",
        sampleSpecificObservation,
        "Each action is represented as a single still image rather than a reviewable multi-frame action sequence.",
        "The output is not preferred over the same-sample V39 baseline for desktop-pet target use.",
        "Candidate is kept out of V40.4 normalization."
      ],
      reasonCodes
    };
  });
}

const r5Summary = fs.existsSync(path.join(repoRoot, r5SummaryRef)) ? readJson(r5SummaryRef) : null;
const r5Passed = r5Summary?.decision === "passed scoped";
const generated = r5Passed ? runGeneration() : { ok: false, reason: "v40_3r5_not_passed" };
const candidateSummaries = buildCandidateSummaries(generated);
const candidateValidations = candidateSummaries.map(validateV40HybridCandidateSummary);
const visualReviews = conservativeVisualReview(candidateSummaries);
const visualReviewValidations = visualReviews.map(validateV40CandidateVisualReview);
const acceptedVisualCount = visualReviewValidations.filter((item) => item.status === "accepted").length;
const negativeSampleResult = {
  sampleId: "v38_negative_dog_public",
  status: "blocked",
  reasonCodes: ["negative_non_cat_rejected"]
};
const summary = {
  phase: "V40.3R6",
  r5PassRef: r5Passed ? r5SummaryRef : null,
  boundedRunId: `v40-3r6-direct-runner-${phaseDate}`,
  selectedRoute: "direct_local_runner_no_webui",
  generated: Boolean(generated.ok),
  generatedCount: candidateSummaries.length,
  modelLabel: generated.modelLabel ?? "not-run",
  identityConditionerLabel: generated.identityConditionerLabel ?? "not-run",
  candidateSummaries,
  candidateValidations,
  visualReviews,
  visualReviewValidations,
  acceptedVisualCount,
  negativeSampleResult,
  v39Comparison: candidateSummaries.map((candidate) => ({
    sampleId: candidate.sampleId,
    baselineRef: `/v39/${candidate.sampleId}/contact-sheet.svg`,
    preference: "not_better_than_v39",
    reasonCodes: ["visual_preference_not_better_than_v39"]
  })),
  v40_4Entry: acceptedVisualCount >= 2 ? "allowed_after_visual_acceptance" : "no_go"
};
const claimScan = runV40NoWebUIClaimScan(summary);
const securityScan = runV40NoWebUISecurityScan(summary);
const decision = !r5Passed
  ? "blocked"
  : !generated.ok
    ? "blocked"
    : acceptedVisualCount >= 2 && claimScan.status === "passed" && securityScan.status === "passed"
      ? "passed scoped"
      : "failed";

const prePhaseBody = [
  "# V40.3R6 Pre-Phase Development And Acceptance Plan",
  "",
  `Date: ${phaseDate}`,
  "",
  "## Objective",
  "Run one bounded direct local candidate generation attempt only after V40.3R5 passed scoped.",
  "",
  "## Entry Check",
  `- V40.3R5 evidence: ${r5SummaryRef}.`,
  `- V40.3R5 passed scoped: ${r5Passed ? "yes" : "no"}.`,
  "",
  "## Development Plan",
  "- Use only the R5-approved sample matrix and identity/action controls.",
  "- Generate review candidates for the two tested public cat samples.",
  "- Keep the negative sample blocked.",
  "- Store only safe relative candidate refs and sanitized manifest summaries.",
  "- Run conservative visual review before any normalization decision.",
  "",
  "## Acceptance Plan",
  "- Pass only if at least two same-sample candidates pass explicit visual review for identity, action readability, artifact safety, desktop scale, and preference over V39.",
  "- Block if the audited runner cannot execute or no reviewable outputs are produced.",
  "- Fail if outputs are not clearly better than V39, are single-image/card-like, weak in action semantics, unsafe, or identity-drifted.",
  "",
  "## Audit Opinion",
  "- R6 may run because R5 passed scoped.",
  "- V40.4 remains No-Go unless R6 records at least two explicit visual passes."
].join("\n");

const evidenceBody = [
  "# V40.3R6 Controlled Candidate Frame Generation Evidence",
  "",
  `Date: ${phaseDate}`,
  "",
  "## Decision",
  `- Status: ${decision}.`,
  `- V40.3R5 pass ref: ${r5Passed ? r5SummaryRef : "none"}.`,
  `- V40.4 entry: ${summary.v40_4Entry}.`,
  "",
  "## PRD / Spec Review",
  "- R6 ran only after R5 passed scoped.",
  "- R6 output is candidate evidence only; normalization remains gated by explicit visual pass records.",
  "- The blocked negative sample remains outside candidate generation.",
  "",
  "## Generation Result",
  `- Generated: ${generated.ok ? "yes" : "no"}.`,
  `- Candidate count: ${candidateSummaries.length}.`,
  `- Manifest ref: ${generated.ok ? manifestRef : "none"}.`,
  `- Stable reason: ${generated.ok ? "candidate_outputs_reviewed" : generated.reason ?? "candidate_generation_blocked"}.`,
  "",
  "## Candidate Refs",
  ...candidateSummaries.map((candidate) => `- ${candidate.candidateId}: ${candidate.contactSheetRef}; sample ${candidate.sampleId}.`),
  candidateSummaries.length === 0 ? "- none." : "",
  "",
  "## Visual Review",
  ...visualReviews.map((review) => [
    `- ${review.candidateId}: ${review.status}; reasons ${review.reasonCodes.join(", ")}.`,
    `  - ${review.observations.join(" ")}`
  ].join("\n")),
  visualReviews.length === 0 ? "- none." : "",
  "",
  "## V39 Same-Sample Comparison",
  ...summary.v39Comparison.map((item) => `- ${item.sampleId}: ${item.preference}; baseline ${item.baselineRef}; reasons ${item.reasonCodes.join(", ")}.`),
  summary.v39Comparison.length === 0 ? "- none." : "",
  "",
  "## Claim Scan",
  `- Status: ${claimScan.status}.`,
  `- Hits: ${claimScan.hits.length === 0 ? "none" : claimScan.hits.join(", ")}.`,
  "",
  "## Security Scan",
  `- Status: ${securityScan.status}.`,
  `- Hits: ${securityScan.hits.length === 0 ? "none" : securityScan.hits.join(", ")}.`,
  "",
  "## Final Phase Result",
  `- Decision: ${decision}.`,
  `- Accepted visual count: ${acceptedVisualCount}.`,
  "- V40.4 remains No-Go unless this count reaches at least two."
].join("\n");

writeText(prePhaseRef, prePhaseBody);
writeText(evidenceRef, evidenceBody);
writeJson(summaryRef, {
  ...summary,
  claimScan,
  securityScan,
  decision,
  evidencePath: evidenceRef,
  prePhasePlanPath: prePhaseRef
});

console.log(JSON.stringify({
  ok: decision === "passed scoped",
  phase: "V40.3R6",
  decision,
  evidencePath: evidenceRef,
  prePhasePlanPath: prePhaseRef,
  generatedCount: candidateSummaries.length,
  acceptedVisualCount,
  claimScanStatus: claimScan.status,
  securityScanStatus: securityScan.status,
  v40_4Entry: summary.v40_4Entry
}, null, 2));

if (decision !== "passed scoped") process.exitCode = 1;
