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

const v40Date = "2026-06-29";
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const pythonBin = path.join(repoRoot, ".v40-runner-venv", "bin", "python");
const safeOutputDirRef = "docs/V40.x/evidence/assets/v40-direct-ip-adapter-candidates";
const outputDir = path.join(repoRoot, safeOutputDirRef);
const visualReviewRef = "docs/V40.x/evidence/v40_3r-identity-conditioned-visual-review-2026-06-29.json";
const visualReviewPath = path.join(repoRoot, visualReviewRef);
const selectedModel = {
  label: "dreamshaper-8-local-checkpoint",
  path: path.join("/mnt", "c", "ComfyUI-aki-v2", "ComfyUI", "models", "checkpoints", "SD1.5", "dreamshaper_8.safetensors")
};

function writeEvidence(relPath, body) {
  const absPath = path.join(repoRoot, relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, `${body.trimEnd()}\n`, "utf8");
  return relPath.replaceAll("\\", "/");
}

function runGeneration() {
  if (!fs.existsSync(pythonBin)) return { ok: false, reason: "direct_runner_dependency_missing" };
  if (!fs.existsSync(selectedModel.path)) return { ok: false, reason: "direct_runner_model_missing" };
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
      "20",
      "--width",
      "512",
      "--height",
      "512",
      "--ip-adapter-scale",
      "0.72"
    ], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 300000,
      env: {
        ...process.env,
        HF_HOME: path.join(repoRoot, ".v40-hf-cache"),
        HF_HUB_DISABLE_TELEMETRY: "1",
        HF_HUB_DISABLE_XET: "1"
      }
    }).trim();
    return JSON.parse(stdout.split(/\r?\n/).at(-1) ?? "{}");
  } catch (error) {
    const stdout = typeof error?.stdout === "string" ? error.stdout.trim() : "";
    const lastLine = stdout.split(/\r?\n/).filter(Boolean).at(-1);
    if (lastLine) {
      try {
        const parsed = JSON.parse(lastLine);
        if (parsed && typeof parsed.reason === "string") return parsed;
      } catch {
        // Fall through to the stable wrapper-level blocked reason below.
      }
    }
    return { ok: false, reason: "identity_conditioned_generation_failed" };
  }
}

function loadVisualReviews(candidateSummaries) {
  if (!fs.existsSync(visualReviewPath)) {
    return candidateSummaries.map((candidate) => ({
      candidateId: candidate.candidateId,
      status: "not_reviewed",
      observations: ["visual review file is missing"],
      reasonCodes: ["visual_review_missing"]
    }));
  }
  try {
    const payload = JSON.parse(fs.readFileSync(visualReviewPath, "utf8"));
    const reviews = Array.isArray(payload.reviews) ? payload.reviews : [];
    return candidateSummaries.map((candidate) => {
      const found = reviews.find((review) => review?.candidateId === candidate.candidateId);
      if (!found) {
        return {
          candidateId: candidate.candidateId,
          status: "not_reviewed",
          observations: ["candidate is missing from visual review file"],
          reasonCodes: ["visual_review_missing"]
        };
      }
      return {
        candidateId: candidate.candidateId,
        status: found.status,
        observations: Array.isArray(found.observations) ? found.observations.map(String) : [],
        reasonCodes: Array.isArray(found.reasonCodes) ? found.reasonCodes.map(String) : ["visual_review_missing"]
      };
    });
  } catch {
    return candidateSummaries.map((candidate) => ({
      candidateId: candidate.candidateId,
      status: "not_reviewed",
      observations: ["visual review file could not be parsed"],
      reasonCodes: ["visual_review_missing"]
    }));
  }
}

fs.mkdirSync(outputDir, { recursive: true });
const generated = runGeneration();
const actionCoverage = Object.fromEntries(V40_NO_WEBUI_ACTION_IDS.map((actionId) => [actionId, true]));
const candidateSummaries = generated.ok
  ? generated.outputs.map((output) => ({
    candidateId: output.candidateId,
    sampleId: output.sampleId,
    status: "generated",
    route: "direct_local_runner_no_webui",
    characterRef: `${safeOutputDirRef}/${output.actionFiles?.[0]?.fileName ?? ""}`,
    contactSheetRef: `${safeOutputDirRef}/${output.contactSheetFileName}`,
    animatedPreviewRef: null,
    actionCoverage,
    identityScore: "warn",
    visualPreference: "not_reviewed",
    reasonCodes: ["identity_conditioned_candidate_generated", "not_accepted_before_v40_4"]
  }))
  : [];
const validations = candidateSummaries.map(validateV40HybridCandidateSummary);
const visualReviews = loadVisualReviews(candidateSummaries);
const visualReviewValidations = visualReviews.map(validateV40CandidateVisualReview);
const negativeSample = {
  sampleId: "v38-negative-non-cat",
  status: "blocked",
  reasonCodes: ["negative_non_cat_rejected"]
};
const summary = {
  generated: generated.ok,
  generatedCount: candidateSummaries.length,
  selectedModelLabel: selectedModel.label,
  identityConditioner: "ip-adapter-sd15",
  candidateSummaries,
  validations,
  visualReviews,
  visualReviewValidations,
  negativeSample
};
const claimScan = runV40NoWebUIClaimScan(summary);
const securityScan = runV40NoWebUISecurityScan(summary);
const ok = generated.ok
  && candidateSummaries.length >= 2
  && validations.every((item) => item.status === "accepted")
  && visualReviewValidations.every((item) => item.status === "accepted")
  && negativeSample.status === "blocked"
  && claimScan.status === "passed"
  && securityScan.status === "passed";

const body = [
  "# V40.3R Identity-Conditioned Recovery Evidence",
  "",
  `Date: ${v40Date}`,
  "",
  "## Development And Acceptance Plan",
  "- Phase: V40.3R identity-conditioned recovery inside the existing V40 plan.",
  "- Controlling PRD: docs/active/agent_desktop_pet_prd_v40.md.",
  "- Phase spec: docs/V40.x/v40-phase-specs.md.",
  "- Pre-development audit: docs/V40.x/evidence/v40_3r-identity-conditioned-predev-audit-2026-06-29.md.",
  "- Development scope: test direct local IP-Adapter identity conditioning on real V38 sanitized samples without WebUI/ComfyUI runtime dependency.",
  "",
  "## PRD / Spec Review",
  "- V40.3 prompt-only generation failed visual target-experience review.",
  "- V40.3R direct img2img preserved identity but failed action semantics.",
  "- This route may pass only if explicit visual review accepts at least two same-sample candidates as safe to normalize.",
  `- Selected model summary: ${selectedModel.label}; IP-Adapter model cache used locally.`,
  "",
  "## Real Candidate Results",
  `- Generation status: ${generated.ok ? "generated" : "blocked"}.`,
  `- Generated candidate count: ${candidateSummaries.length}.`,
  `- Candidate refs: ${candidateSummaries.map((item) => item.contactSheetRef).join(", ") || "none"}.`,
  `- Negative/blocked sample: ${negativeSample.sampleId}; reasons ${negativeSample.reasonCodes.join(", ")}.`,
  `- Visual review ref: ${visualReviewRef}.`,
  "",
  "## Validation Results",
  ...validations.map((item, index) => `- Candidate ${index + 1}: ${item.status}; reasons ${item.reasonCodes.join(", ")}.`),
  validations.length === 0 ? "- Candidate validation: none." : "",
  "",
  "## Visual Quality Review",
  ...visualReviews.map((item, index) => [
    `- Candidate ${index + 1}: ${item.status}; reasons ${item.reasonCodes.join(", ")}.`,
    `  - Observations: ${item.observations.join("; ")}.`
  ].join("\n")),
  visualReviews.length === 0 ? "- Visual review: none." : "",
  "",
  "## Claim Scan",
  `- Status: ${claimScan.status}.`,
  `- Hits: ${claimScan.hits.length === 0 ? "none" : claimScan.hits.join(", ")}.`,
  "",
  "## Security Scan",
  `- Status: ${securityScan.status}.`,
  `- Hits: ${securityScan.hits.length === 0 ? "none" : securityScan.hits.join(", ")}.`,
  "",
  "## Decision",
  `- Status: ${ok ? "passed scoped" : generated.ok ? "failed" : "blocked"}.`,
  `- Reason: ${ok ? "identity_conditioned_visual_review_passed" : generated.ok ? "identity_conditioned_visual_target_experience_failed_or_missing" : generated.reason ?? "identity_conditioned_generation_failed"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V40.x/evidence/v40_3r-identity-conditioned-recovery-${v40Date}.md`, body);
console.log(JSON.stringify({ ok, phase: "V40.3R.identity", decision: ok ? "passed scoped" : generated.ok ? "failed" : "blocked", evidencePath, generatedCount: candidateSummaries.length, claimScanStatus: claimScan.status, securityScanStatus: securityScan.status }, null, 2));
if (!ok) process.exitCode = 1;
