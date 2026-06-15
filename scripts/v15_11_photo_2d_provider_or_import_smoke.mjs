#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  buildPhoto2DProviderOrImportEvidenceSnapshot,
  createPhoto2DProviderOrImportBranch,
  photo2DProviderOrImportHasForbiddenContent
} from "../apps/desktop/src/assets/photo-to-2d-provider-or-import-branch.ts";
import { generatePhoto2DTraitPromptPack } from "../apps/desktop/src/assets/photo-to-2d-trait-prompt-pack.ts";

const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const EVIDENCE_PATH = `docs/V15.x/evidence/v15_11-photo-2d-provider-or-import-smoke-${DATE}.md`;
const records = [];

record("desktop test", run(["pnpm", "--filter", "desktop", "test"]));
record("desktop check", run(["pnpm", "--filter", "desktop", "check"]));

const promptPackResult = generatePhoto2DTraitPromptPack({
  traits: {
    traitId: "orange-tabby-approved",
    coatColor: "warm orange",
    pattern: "classic tabby stripes with white chest",
    eyeColor: "amber",
    faceShape: "round kitten-like",
    bodyBuild: "small sitting companion",
    tailNotes: "curled fluffy tail",
    distinctiveNotes: "soft cheeks and symmetrical forehead stripes",
    approved: true,
    approvedAt: "2026-06-10T00:00:00.000Z"
  },
  createdAt: "2026-06-10T01:00:00.000Z"
});

const importReady = createPhoto2DProviderOrImportBranch({
  promptPackResult,
  branch: "import-ready"
});
const importReadyEvidence = buildPhoto2DProviderOrImportEvidenceSnapshot(importReady);

recordDecision(
  "import-ready branch selected",
  importReady.status === "accepted" &&
    importReady.reasonCode === "import_ready_branch_selected" &&
    importReady.branch === "import-ready" &&
    !photo2DProviderOrImportHasForbiddenContent(importReadyEvidence),
  importReady.status === "accepted"
    ? `status=${importReady.status}; branch=${importReady.branch}; reasonCode=${importReady.reasonCode}; actionCount=${importReady.actionPlan.length}`
    : `status=${importReady.status}; branch=${importReady.branch}; reasonCode=${importReady.reasonCode}`
);

recordDecision(
  "8 action import plan coverage",
  importReady.status === "accepted" &&
    importReady.actionPlan.length === 8 &&
    importReady.actionPlan.every((action) => action.fileNamingRule.includes("frame-001.png")),
  importReady.status === "accepted"
    ? `actions=${importReady.actionPlan.map((action) => action.actionId).join(",")}`
    : "unavailable"
);

recordDecision(
  "provider branch not run by default",
  importReady.status === "accepted" &&
    importReady.providerBranch.attempted === false &&
    importReady.providerBranch.reasonCode === "provider_output_missing" &&
    importReady.safetyBoundary.callsProviderApi === false &&
    importReady.safetyBoundary.uploadsByDefault === false,
  importReady.status === "accepted"
    ? `attempted=${importReady.providerBranch.attempted}; reasonCode=${importReady.providerBranch.reasonCode}; callsProviderApi=false; uploadsByDefault=false`
    : "unavailable"
);

const providerNoConsent = createPhoto2DProviderOrImportBranch({ promptPackResult, branch: "provider" });
const providerNoTerms = createPhoto2DProviderOrImportBranch({ promptPackResult, branch: "provider", providerConsent: true });
const providerNoSecret = createPhoto2DProviderOrImportBranch({
  promptPackResult,
  branch: "provider",
  providerConsent: true,
  providerTermsReviewed: true
});
const providerNoOutput = createPhoto2DProviderOrImportBranch({
  promptPackResult,
  branch: "provider",
  providerConsent: true,
  providerTermsReviewed: true,
  providerCredentialAvailable: true
});

for (const [name, result, expected] of [
  ["provider consent required", providerNoConsent, "consent_required"],
  ["provider terms required", providerNoTerms, "provider_terms_required"],
  ["provider secret unavailable", providerNoSecret, "provider_credential_missing"],
  ["provider output missing", providerNoOutput, "provider_output_missing"]
]) {
  recordDecision(
    name,
    result.status === "blocked" && result.reasonCode === expected,
    `status=${result.status}; reasonCode=${result.reasonCode}`
  );
}

const invalidPromptPack = createPhoto2DProviderOrImportBranch({
  promptPackResult: generatePhoto2DTraitPromptPack({
    traits: {
      traitId: "unapproved",
      coatColor: "orange",
      pattern: "tabby",
      approved: false
    }
  }),
  branch: "import-ready"
});
recordDecision(
  "trait prompt pack required",
  invalidPromptPack.status === "blocked" && invalidPromptPack.reasonCode === "trait_prompt_pack_invalid",
  `status=${invalidPromptPack.status}; reasonCode=${invalidPromptPack.reasonCode}`
);

const securityPayload = JSON.stringify({
  records: records.map(({ output, ...record }) => record),
  importReadyEvidence
});
recordDecision(
  "security redaction scan",
  securityScanText(securityPayload) && !photo2DProviderOrImportHasForbiddenContent(importReadyEvidence),
  "safe import branch evidence contains no private data values or provider response details"
);
recordDecision(
  "claim scan",
  claimScanPassed(),
  "V15.11 claim remains import-ready scoped and forbidden claims stay forbidden/not-ready"
);
recordDecision(
  "PRD/spec review",
  prdSpecPassed(),
  "active PRD, V15 plan, detailed spec, and acceptance plan align with V15.11 import-ready branch"
);

const failed = records.filter((item) => item.result === "failed");
const status = failed.length ? "failed" : "passed";
mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
writeFileSync(EVIDENCE_PATH, renderEvidence(status, importReadyEvidence, records));

console.log(JSON.stringify({
  ok: status === "passed",
  status,
  evidencePath: EVIDENCE_PATH,
  records: records.map(({ output, ...record }) => record)
}, null, 2));

process.exitCode = status === "passed" ? 0 : 1;

function run(command) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "ignore"
  });
  return {
    ok: result.status === 0,
    output: result.status === 0 ? "exit=0" : `exit=${result.status ?? 1}`
  };
}

function record(name, result) {
  records.push({
    name,
    result: result.ok ? "passed" : "failed",
    details: result.output,
    output: result.output
  });
}

function recordDecision(name, ok, details) {
  records.push({
    name,
    result: ok ? "passed" : "failed",
    details,
    output: details
  });
}

function securityScanText(value) {
  const sanitized = value
    .replace(/promptDigest|providerBranch|provider_output_missing|provider_output_rejected|provider_generation_failed|provider_credential_missing|provider_terms_required/g, "")
    .replace(/storesProviderResponse|callsProviderApi|provesProviderIntegration|provesAutomaticPhotoTo2D/g, "");
  return !/sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization\s*:|\/Users\/[^/\s]+|api-token\.json|raw photo|source filename|sourceFileName|sourcePath|photo path|fullLocalPath|raw provider response|raw prompt|promptText|workspace path|config path|GPS payload|EXIF payload/i.test(sanitized);
}

function claimScanPassed() {
  const text = [
    "docs/V15.x/v15_x-claim-matrix.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-asset-plan.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-detailed-implementation-spec.md"
  ].map(readSafe).join("\n");
  return text.includes("V15.11 photo-guided 2D action import-ready prompt workflow passed for tested local scenarios") &&
    text.includes("provider integration verified") &&
    text.includes("automatic photo-to-2D ready") &&
    !text.includes("provider integration verified | allowed") &&
    !text.includes("automatic photo-to-2D ready | allowed");
}

function prdSpecPassed() {
  const text = [
    "docs/active/agent_desktop_pet_prd_v15.md",
    "docs/V15.x/v15_x-acceptance-plan.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-asset-plan.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-detailed-implementation-spec.md"
  ].map(readSafe).join("\n");
  return text.includes("V15.11") &&
    text.includes("ProviderOrImportBranch") &&
    text.includes("import-ready") &&
    text.includes("provider_output_missing");
}

function readSafe(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function renderEvidence(status, evidence, rows) {
  const table = rows.map((item) => `| ${item.name} | ${item.result} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  const accepted = evidence.status === "accepted" && "actionCoverage" in evidence;
  const actionRows = accepted
    ? evidence.actionCoverage
        .map((entry) => `| ${entry.actionId} | ${entry.promptDigest} | ${entry.frameIntent} | ${entry.expectedFrameCount} | ${entry.fileNamingRule.replace(/\|/g, "\\|")} |`)
        .join("\n")
    : "| unavailable | unavailable | unavailable | unavailable | unavailable |";

  return `# V15.11 Photo 2D Provider Or Import Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

V15.11 validates the import-ready branch for the photo-guided 2D action asset
workflow. The provider branch is not run in this evidence. This evidence does
not upload photos, does not call a provider API, does not store provider
response details, and does not claim provider integration or automatic
photo-to-2D readiness.

## Branch Decision

| Field | Value |
| --- | --- |
| status | ${evidence.status} |
| branch | ${evidence.branch} |
| reasonCode | ${evidence.reasonCode} |
| providerAttempted | ${evidence.providerBranch.attempted} |
| providerReasonCode | ${evidence.providerBranch.reasonCode} |
| uploadsByDefault | ${evidence.safetyBoundary.uploadsByDefault} |
| callsProviderApi | ${evidence.safetyBoundary.callsProviderApi} |
| requiresLocalImportValidation | ${evidence.safetyBoundary.requiresLocalImportValidation} |

## Import-Ready Action Plan

| Action | Prompt Digest | Frame Intent | Expected Frames | File Naming Rule |
| --- | --- | --- | ---: | --- |
${actionRows}

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${table}

## Security Boundary

Evidence records only safe branch, action, digest, expected frame, checklist
count, and safety booleans. It excludes raw photo bytes, source filename, full
local path, EXIF/GPS payload, token, Authorization, full prompt text, raw
prompt text, provider request details, and provider response details.

## Allowed Claim

${status === "passed" ? "V15.11 photo-guided 2D action import-ready prompt workflow passed for tested local scenarios." : "No V15.11 claim may be used while this evidence is not passed."}

## Forbidden Claims

This evidence does not claim named-provider 2D generation smoke passed,
automatic photo-to-2D ready, automatic photo-to-animation ready, provider
integration verified, photo customization ready for arbitrary cats, Petdex
parity, 3D ready, automatic photo-to-3D ready, production signed release ready,
cross-platform ready, or Windows ready.
`;
}

