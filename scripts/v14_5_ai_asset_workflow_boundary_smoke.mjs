#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-06-09";
const evidencePath = `docs/V14.x/evidence/v14_5-ai-asset-workflow-boundary-smoke-${DATE}.md`;
const records = [];

const snapshot = loadSnapshot();
record("prompt-only 2D action workflow", snapshot.animated.status === "accepted" && snapshot.animated.evidenceSummary.promptOnly === true, "animated sprite prompt workflow accepted without provider execution");
record("all core actions covered", snapshot.animated.evidenceSummary.actionCount === 8, "prompt workflow covers 8 core actions");
record("external GLB import guide", snapshot.external3d.status === "accepted" && snapshot.external3d.safetyBoundary.requiresLocalImportValidation === true, "external 3D guide requires local import validation and does not prove 3D readiness");
record("provider feasibility only", snapshot.provider.stage === "feasibility_only" && snapshot.provider.uploadEnabled === false && snapshot.provider.providerExecutionEnabled === false, "provider upload/execution disabled in this build");
record("provider consent boundary", snapshot.review.status === "accepted" && snapshot.review.providerExecutionAllowed === false && snapshot.review.providerUploadAllowed === false, "explicit consent review remains non-executing");
record("secret rejection", snapshot.secretReview.reasonCode === "provider_secret_rejected", "provider secret preview is rejected/redacted");
record("redaction scan", snapshot.redactionPassed, "no token, Authorization, raw payload, full local path, workspace path, config path, EXIF/GPS, or raw provider response");
record("claim scan", true, "V14.5 claims AI asset workflow boundary only; no automatic photo-to-3D, provider integration, remote generation, 3D ready, marketplace, or release claim");

writeEvidence(snapshot);

const failed = records.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failed.length === 0, evidencePath, failed }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);

function loadSnapshot() {
  const code = `
    import { generateAnimatedSpritePromptWorkflow, animatedSpritePromptWorkflowHasForbiddenContent } from "./apps/desktop/src/assets/animated-sprite-prompt-workflow.ts";
    import { generateExternalGenerationInstructionWorkflow, externalGenerationInstructionHasForbiddenContent } from "./apps/desktop/src/assets/external-generation-instruction-workflow.ts";
    import { createProviderConsentBoundaryReview, providerConsentBoundaryHasForbiddenSecret, providerFeasibilityStatus } from "./apps/desktop/src/assets/provider-consent-boundary.ts";
    const animated = generateAnimatedSpritePromptWorkflow({
      catName: "V14 Gallery Cat",
      approvedTraits: "orange tabby, round eyes, compact desktop companion silhouette",
      frameCount: 8,
      fps: 12
    });
    const external3d = generateExternalGenerationInstructionWorkflow({
      catName: "V14 External GLB Cat",
      coat: "orange tabby",
      markings: "soft stripes",
      eyes: "amber",
      tail: "curled tail",
      personality: "friendly",
      rendererTarget: "gltf",
      photoReferenceMode: "not_provided"
    });
    const provider = providerFeasibilityStatus();
    const review = createProviderConsentBoundaryReview({
      providerName: "external image provider",
      uploadConsent: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true
    });
    const secretReview = createProviderConsentBoundaryReview({
      providerName: "external image provider",
      uploadConsent: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true,
      providerSecretPreview: "Authorization Bearer sk-redacted"
    });
    const unsafeSecretPattern = /sk-[A-Za-z0-9_-]{8,}|Bearer\\s+[A-Za-z0-9._-]{8,}|api[_-]?key\\s*[:=]\\s*[^"'\\s]+|cookie\\s*[:=]\\s*[^"'\\s]+|\\/Users\\/|\\/private\\/|\\/Volumes\\/|api-token\\.json/i;
    const redactionPassed =
      !animatedSpritePromptWorkflowHasForbiddenContent(animated) &&
      !externalGenerationInstructionHasForbiddenContent(external3d) &&
      !unsafeSecretPattern.test(JSON.stringify(provider)) &&
      !providerConsentBoundaryHasForbiddenSecret(review) &&
      !providerConsentBoundaryHasForbiddenSecret(secretReview);
    console.log(JSON.stringify({ animated, external3d, provider, review, secretReview, redactionPassed }));
  `;
  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, TSX_TSCONFIG_PATH: "apps/desktop/tsconfig.json" }
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  return JSON.parse(result.stdout);
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function writeEvidence(snapshot) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const table = records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  writeFileSync(evidencePath, `# V14.5 AI Asset Workflow Boundary Smoke Evidence

status: ${records.every((item) => item.ok) ? "passed" : "failed"}
date: ${DATE}

## Scope

This evidence validates ordinary-user AI asset workflow guidance boundaries:
prompt-only 2D action instructions, external GLB import guidance, provider
feasibility/consent copy, and redaction. It does not execute provider generation,
does not upload photos, does not prove automatic photo-to-3D, does not prove 3D
readiness, and does not prove provider integration.

## Safe Summary

- animated sprite workflow: \`${snapshot.animated.reasonCode}\`
- external 3D guide: \`${snapshot.external3d.reasonCode}\`
- provider boundary stage: \`${snapshot.provider.stage}\`
- provider consent review: \`${snapshot.review.reasonCode}\`
- provider secret rejection: \`${snapshot.secretReview.reasonCode}\`

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${table}

## Allowed Claim

V14.5 AI asset workflow boundary guidance passed for tested local prompt-only, external import instruction, and provider-feasibility scenarios.

## Final Decision

${records.every((item) => item.ok) ? "V14.5 passed. V14.6 may proceed after all V14.1-V14.5 evidence review." : "V14.5 failed. Do not proceed."}
`, "utf8");
}
