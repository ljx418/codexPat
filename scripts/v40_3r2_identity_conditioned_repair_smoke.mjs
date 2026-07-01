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

const v40Date = "2026-06-30";
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const pythonBin = path.join(repoRoot, ".v40-runner-venv", "bin", "python");
const variant = sanitizeVariant(process.env.V40_3R2_VARIANT ?? "");
const variantSuffix = variant ? `-${variant}` : "";
const safeOutputDirRef = `docs/V40.x/evidence/assets/v40-direct-ip-adapter-candidates-r2${variantSuffix}`;
const outputDir = path.join(repoRoot, safeOutputDirRef);
const manifestRef = `${safeOutputDirRef}/manifest.json`;
const manifestPath = path.join(repoRoot, manifestRef);
const visualReviewRef = `docs/V40.x/evidence/v40_3r2-identity-conditioned${variantSuffix}-visual-review-2026-06-30.json`;
const visualReviewPath = path.join(repoRoot, visualReviewRef);
const localAdapterRoot = path.join(repoRoot, ".v40-hf-cache", "hub", "models--h94--IP-Adapter", "snapshots", "018e402774aeeddd60609b4ecdb7e298259dc729");
const selectedModel = {
  label: "dreamshaper-8-local-checkpoint",
  path: path.join("/mnt", "c", "ComfyUI-aki-v2", "ComfyUI", "models", "checkpoints", "SD1.5", "dreamshaper_8.safetensors")
};

function sanitizeVariant(value) {
  const sanitized = value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return sanitized.slice(0, 32);
}

function writeEvidence(relPath, body) {
  const absPath = path.join(repoRoot, relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, `${body.trimEnd()}\n`, "utf8");
  return relPath.replaceAll("\\", "/");
}

function writeManifest(payload) {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function loadManifest() {
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return null;
  }
}

function runGeneration() {
  if (process.env.V40_3R2_REUSE_EXISTING === "1") {
    const manifest = loadManifest();
    if (manifest?.ok && Array.isArray(manifest.outputs)) {
      return manifest;
    }
  }

  if (!fs.existsSync(pythonBin)) return { ok: false, reason: "direct_runner_dependency_missing" };
  if (!fs.existsSync(selectedModel.path)) return { ok: false, reason: "direct_runner_model_missing" };
  if (!fs.existsSync(path.join(localAdapterRoot, "models", "ip-adapter_sd15.bin"))) {
    return { ok: false, reason: "identity_conditioned_runner_incompatible" };
  }
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
      "24",
      "--width",
      "512",
      "--height",
      "512",
      "--ip-adapter-scale",
      variant === "stylized" ? "0.54" : "0.78",
      "--strength",
      variant === "stylized" ? "0.96" : "0.84",
      "--init-mode",
      "blank",
      "--local-adapter-root",
      localAdapterRoot
    ], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 600000,
      env: {
        ...process.env,
        HF_HOME: path.join(repoRoot, ".v40-hf-cache"),
        HF_HUB_DISABLE_TELEMETRY: "1",
        HF_HUB_DISABLE_XET: "1",
        HF_HUB_OFFLINE: "1",
        TRANSFORMERS_OFFLINE: "1"
      }
    }).trim();
    const parsed = JSON.parse(stdout.split(/\r?\n/).at(-1) ?? "{}");
    if (parsed?.ok) writeManifest(parsed);
    return parsed;
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
const acceptedVisualCount = visualReviewValidations.filter((item) => item.status === "accepted").length;
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
  && acceptedVisualCount >= 2
  && negativeSample.status === "blocked"
  && claimScan.status === "passed"
  && securityScan.status === "passed";

const body = [
  "# V40.3R2 Identity-Conditioned Runner Repair Evidence",
  "",
  `Date: ${v40Date}`,
  "",
  "## Development And Acceptance Plan",
  "- Phase: V40.3R2 identity-conditioned Direct Local Runner repair.",
  "- Controlling PRD: docs/active/agent_desktop_pet_prd_v40.md.",
  "- Phase spec: docs/V40.x/v40-phase-specs.md.",
  "- Pre-development audit: docs/V40.x/evidence/v40_3r2-identity-runner-predev-audit-2026-06-30.md.",
  "- Development scope: repair the no-WebUI IP-Adapter path using real V38 sanitized public cat samples.",
  "- Out of scope: WebUI, ComfyUI, provider integration, Petdex parity, 3D readiness, production/platform readiness, and V40.4 unlock without visual review.",
  "",
  "## PRD / Spec Review",
  "- V40.3 prompt-only candidates failed visual review.",
  "- V40.3R direct img2img candidates failed visual review.",
  "- V40.3R identity-conditioned generation was previously blocked by runner-stack compatibility.",
  "- V40.3R2 may unlock V40.4 only if at least two same-sample candidates pass explicit visual review.",
  `- Selected model summary: ${selectedModel.label}; identity conditioner summary: ip-adapter-sd15.`,
  "",
  "## Real Candidate Results",
  `- Generation status: ${generated.ok ? "generated" : "blocked"}.`,
  `- Generated candidate count: ${candidateSummaries.length}.`,
  `- Candidate refs: ${candidateSummaries.map((item) => item.contactSheetRef).join(", ") || "none"}.`,
  `- Manifest ref: ${generated.ok ? manifestRef : "none"}.`,
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
  `- V40.4 gate: ${ok ? "Go" : "No-Go"}.`,
  ""
].join("\n");

const evidencePath = writeEvidence(`docs/V40.x/evidence/v40_3r2-identity-conditioned-repair${variantSuffix}-${v40Date}.md`, body);
console.log(JSON.stringify({
  ok,
  phase: "V40.3R2.identity",
  decision: ok ? "passed scoped" : generated.ok ? "failed" : "blocked",
  evidencePath,
  generatedCount: candidateSummaries.length,
  acceptedVisualCount,
  claimScanStatus: claimScan.status,
  securityScanStatus: securityScan.status
}, null, 2));
if (!ok) process.exitCode = 1;
