#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  buildPhoto2DTraitPromptEvidenceSnapshot,
  generatePhoto2DTraitPromptPack,
  photo2DTraitPromptPackHasForbiddenContent
} from "../apps/desktop/src/assets/photo-to-2d-trait-prompt-pack.ts";

const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const EVIDENCE_PATH = `docs/V15.x/evidence/v15_10-trait-prompt-pack-smoke-${DATE}.md`;
const records = [];

record("desktop test", run(["pnpm", "--filter", "desktop", "test"]));
record("desktop check", run(["pnpm", "--filter", "desktop", "check"]));

const accepted = generatePhoto2DTraitPromptPack({
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
const acceptedEvidence = buildPhoto2DTraitPromptEvidenceSnapshot(accepted);

recordDecision(
  "approved trait table accepted",
  accepted.status === "accepted" &&
    accepted.reasonCode === "prompt_pack_ready" &&
    "approvedTraitTable" in acceptedEvidence &&
    !photo2DTraitPromptPackHasForbiddenContent(acceptedEvidence),
  accepted.status === "accepted"
    ? `status=${accepted.status}; reasonCode=${accepted.reasonCode}; traitId=${accepted.approvedTraits.traitId}`
    : `status=${accepted.status}; reasonCode=${accepted.reasonCode}`
);

const actionCoverage = accepted.status === "accepted"
  ? Object.values(accepted.promptPack.actionPrompts)
  : [];
recordDecision(
  "8 action prompt coverage",
  actionCoverage.length === 8 &&
    ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"].every((actionId) =>
      actionCoverage.some((entry) => entry.actionId === actionId)
    ),
  `actionCount=${actionCoverage.length}; actions=${actionCoverage.map((entry) => entry.actionId).join(",")}`
);
recordDecision(
  "prompt digest list only",
  actionCoverage.length === 8 &&
    actionCoverage.every((entry) => /^prompt_[a-f0-9]{8}$/.test(entry.promptDigest)) &&
    accepted.status === "accepted" &&
    accepted.promptPack.safetySummary.fullPromptPrinted === false,
  `digestCount=${actionCoverage.filter((entry) => /^prompt_[a-f0-9]{8}$/.test(entry.promptDigest)).length}; fullPromptPrinted=false`
);
recordDecision(
  "frame intent and expected count model",
  actionCoverage.filter((entry) => entry.frameIntent === "loop" && entry.expectedFrameCount === 6).length === 4 &&
    actionCoverage.filter((entry) => entry.frameIntent === "priority" && entry.expectedFrameCount === 3).length === 2 &&
    actionCoverage.filter((entry) => entry.frameIntent === "transient" && entry.expectedFrameCount === 3).length === 2,
  "loop=4x6; priority=2x3; transient=2x3"
);

const unapproved = generatePhoto2DTraitPromptPack({
  traits: {
    traitId: "unapproved",
    coatColor: "orange",
    pattern: "tabby",
    approved: false
  }
});
recordDecision(
  "traits approval required",
  unapproved.status === "rejected" && unapproved.reasonCode === "traits_approval_required",
  `status=${unapproved.status}; reasonCode=${unapproved.reasonCode}`
);

const unsafeCases = [
  ["absolute path trait", "/Users/example/private-cat.png"],
  ["remote URL trait", "https://example.invalid/cat.png"],
  ["token-like trait", "sk-secret123456"]
].map(([name, unsafeValue]) => [
  name,
  generatePhoto2DTraitPromptPack({
    traits: {
      traitId: `unsafe-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
      coatColor: "orange",
      pattern: String(unsafeValue),
      approved: true
    }
  })
]);

for (const [name, result] of unsafeCases) {
  recordDecision(
    String(name),
    result.status === "rejected" && result.reasonCode === "trait_schema_invalid",
    `status=${result.status}; reasonCode=${result.reasonCode}`
  );
}

const securityPayload = JSON.stringify({
  records: records.map(({ output, ...record }) => record),
  acceptedEvidence
});
recordDecision(
  "security redaction scan",
  securityScanText(securityPayload) && !photo2DTraitPromptPackHasForbiddenContent(acceptedEvidence),
  "no raw photo, source filename, full path, EXIF/GPS payload, token, Authorization, raw prompt text, prompt text, or raw provider response"
);
recordDecision(
  "claim scan",
  claimScanPassed(),
  "V15.10 claim remains scoped and forbidden claims stay forbidden/not-ready"
);
recordDecision(
  "PRD/spec review",
  prdSpecPassed(),
  "active PRD, V15 plan, detailed spec, and acceptance plan align with V15.10"
);

const failed = records.filter((item) => item.result === "failed");
const status = failed.length ? "failed" : "passed";
mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
writeFileSync(EVIDENCE_PATH, renderEvidence(status, acceptedEvidence, records));

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
    .replace(/promptDigest|promptPack|PromptPack|fullPromptPrinted|prompt_pack_ready/g, "")
    .replace(/includesExifGps|includesSourcePath|approvedAt|hasApprovedAt/g, "");
  return !/sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization\s*:|\/Users\/[^/\s]+|api-token\.json|raw photo|source filename|sourceFileName|sourcePath|photo path|fullLocalPath|raw provider response|raw prompt|promptText|workspace path|config path|GPS payload|EXIF payload/i.test(sanitized);
}

function claimScanPassed() {
  const text = [
    "docs/V15.x/v15_x-claim-matrix.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-asset-plan.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-detailed-implementation-spec.md"
  ].map(readSafe).join("\n");
  return text.includes("V15.10 cat trait review and 8-action prompt pack generation passed for tested local scenarios.") &&
    text.includes("automatic photo-to-2D ready") &&
    text.includes("provider integration verified") &&
    !text.includes("automatic photo-to-2D ready | allowed") &&
    !text.includes("provider integration verified | allowed");
}

function prdSpecPassed() {
  const text = [
    "docs/active/agent_desktop_pet_prd_v15.md",
    "docs/V15.x/v15_x-acceptance-plan.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-asset-plan.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-detailed-implementation-spec.md"
  ].map(readSafe).join("\n");
  return text.includes("V15.10") &&
    text.includes("CatTraitReviewModel") &&
    text.includes("Photo2DPromptPackGenerator") &&
    text.includes("traits_approval_required") &&
    text.includes("full prompt not printed");
}

function readSafe(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function renderEvidence(status, evidence, rows) {
  const table = rows.map((item) => `| ${item.name} | ${item.result} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  const accepted = evidence.status === "accepted" && "promptPack" in evidence;
  const traitRows = accepted
    ? Object.entries(evidence.approvedTraitTable)
        .map(([field, value]) => `| ${field} | ${String(value).replace(/\|/g, "\\|")} |`)
        .join("\n")
    : "| unavailable | rejected |";
  const actionRows = accepted
    ? evidence.promptPack.actionCoverage
        .map((entry) => `| ${entry.actionId} | ${entry.promptDigest} | ${entry.frameIntent} | ${entry.expectedFrameCount} | ${entry.safeSummary.replace(/\|/g, "\\|")} |`)
        .join("\n")
    : "| unavailable | unavailable | unavailable | unavailable | unavailable |";

  return `# V15.10 Trait Prompt Pack Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

V15.10 validates user-approved safe cat traits and digest-only 8-action prompt
pack generation for the photo-guided 2D action asset workflow. It does not call
a provider, does not upload photos, does not export full prompt text, and does
not claim automatic photo-to-2D readiness.

## Approved Trait Table

| Field | Value |
| --- | --- |
${traitRows}

## 8 Action Prompt Coverage

| Action | Prompt Digest | Frame Intent | Expected Frames | Safe Summary |
| --- | --- | --- | ---: | --- |
${actionRows}

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${table}

## Security Boundary

Evidence records only approved safe traits, action IDs, prompt digests, frame
intent, expected frame counts, and safe summaries. It excludes raw photo bytes,
source filename, full local path, EXIF/GPS payload, token, Authorization, full
prompt text, raw prompt text, raw provider request, and raw provider response.

## Allowed Claim

${status === "passed" ? "V15.10 cat trait review and 8-action prompt pack generation passed for tested local scenarios." : "No V15.10 claim may be used while this evidence is not passed."}

## Forbidden Claims

This evidence does not claim automatic photo-to-2D ready, automatic
photo-to-animation ready, provider integration verified, photo customization
ready for arbitrary cats, Petdex parity, 3D ready, automatic photo-to-3D ready,
production signed release ready, cross-platform ready, or Windows ready.
`;
}
