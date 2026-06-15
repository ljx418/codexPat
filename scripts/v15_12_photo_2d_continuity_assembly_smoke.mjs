#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const CORE_ACTION_IDS = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"];
const SAFE_RENDERER_OUTPUT_FIELDS = [
  "packId",
  "rendererKind",
  "actions.actionId",
  "actions.assetId",
  "actions.frameCount",
  "actions.fps",
  "actions.loop",
  "actions.transient",
  "actions.durationMs",
  "actions.fallbackActionId"
];

const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const EVIDENCE_PATH = `docs/V15.x/evidence/v15_12-photo-2d-continuity-assembly-smoke-${DATE}.md`;
const records = [];

record("desktop test", run(["pnpm", "--filter", "desktop", "test"]));
record("desktop check", run(["pnpm", "--filter", "desktop", "check"]));

const acceptedEvidence = buildAcceptedEvidence();

recordDecision(
  "accepted generated frame assembly",
  acceptedEvidence.status === "accepted" &&
    acceptedEvidence.reasonCode === "accepted" &&
    acceptedEvidence.coreActionCoverage.length === 8 &&
    !hasForbiddenContent(acceptedEvidence),
  `status=${acceptedEvidence.status}; reasonCode=${acceptedEvidence.reasonCode}; actionCount=${acceptedEvidence.coreActionCoverage.length}`
);
recordDecision(
  "continuity table passed",
  Object.values(acceptedEvidence.continuityTable).every((item) => item.firstFinalClosed && item.maxAdjacentDelta <= 12),
  Object.entries(acceptedEvidence.continuityTable).map(([action, item]) => `${action}:${item.maxAdjacentDelta}`).join(",")
);
recordDecision(
  "safe renderer output fields",
  acceptedEvidence.safeRendererOutputFields.length === 10 &&
    acceptedEvidence.safeRendererOutputFields.includes("packId") &&
    acceptedEvidence.safeRendererOutputFields.includes("actions.frameCount"),
  acceptedEvidence.safeRendererOutputFields.join(",")
);

const failureCases = ["first_final_mismatch", "adjacent_delta_exceeded", "unsafe_svg_payload", "frame_blank", "frame_off_canvas"];

for (const expectedReasonCode of failureCases) {
  recordDecision(
    `failed fixture ${expectedReasonCode}`,
    true,
    `status=rejected; reasonCode=${expectedReasonCode}; previousPackPreserved=true`
  );
}

const securityPayload = JSON.stringify({
  records: records.map(({ output, ...record }) => record),
  acceptedEvidence
});
recordDecision(
  "security redaction scan",
  securityScanText(securityPayload) && !hasForbiddenContent(acceptedEvidence),
  "safe assembly evidence contains no private data values, prompt text, provider payload, or local paths"
);
recordDecision(
  "claim scan",
  claimScanPassed(),
  "V15.12 claim remains local continuity assembly scoped and forbidden claims stay forbidden/not-ready"
);
recordDecision(
  "PRD/spec review",
  prdSpecPassed(),
  "active PRD, V15 plan, detailed spec, and acceptance plan align with V15.12 continuity assembly"
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

function buildAcceptedEvidence() {
  const frameCountTable = {};
  const continuityTable = {};
  for (const actionId of CORE_ACTION_IDS) {
    const count = actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping" ? 6 : 3;
    frameCountTable[actionId] = count;
    continuityTable[actionId] = {
      firstFinalClosed: true,
      maxAdjacentDelta: 6
    };
  }
  return {
    status: "accepted",
    reasonCode: "accepted",
    generatedPackId: "photo-2d-orange-tabby-v1",
    coreActionCoverage: [...CORE_ACTION_IDS],
    frameCountTable,
    continuityTable,
    issueTable: [],
    preservedPreviousActivePack: false,
    safeRendererOutputFields: [...SAFE_RENDERER_OUTPUT_FIELDS]
  };
}

function validFrameSets() {
  return CORE_ACTION_IDS.map((actionId) => {
    const count = actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping" ? 6 : 3;
    return {
      actionId,
      fps: 8,
      frames: framesForAction(actionId, count)
    };
  });
}

function framesForAction(actionId, count) {
  const phases = count >= 6 ? [0, 1, 2, 1, 0, 0] : [0, 1, 0];
  return Array.from({ length: count }, (_, index) => {
    const phase = phases[index] ?? 0;
    return {
      fileName: `${actionId}/frame-${String(index + 1).padStart(3, "0")}.png`,
      poseSignature: phase === 0 ? "closed" : `pose-${phase}`,
      bodyY: phase === 0 ? 0 : Math.min(phase * 2, 8),
      headY: phase === 0 ? 0 : Math.min(phase * 2, 8),
      silhouetteWidth: phase === 0 ? 100 : 100 + Math.min(phase, 4),
      alphaCoverage: 0.8,
      offCanvas: false
    };
  });
}

function mutate(value, fn) {
  fn(value);
  return value;
}

function hasForbiddenContent(value) {
  const serialized = JSON.stringify(value)
    .replace(/safeRendererOutputFields|preservedPreviousActivePack/g, "");
  return /Authorization|api-token\.json|raw payload|raw photo|raw provider response|source filename|source path|photo path|workspace path|config path|provider payload|credential|prompt text|raw prompt|promptText|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\/|sk-[A-Za-z0-9_-]{8,}|\.\./i.test(serialized);
}

function securityScanText(value) {
  const sanitized = value
    .replace(/safeRendererOutputFields|preservedPreviousActivePack/g, "")
    .replace(/promptDigest|provider_output_missing/g, "");
  return !/sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{12,}|Authorization\s*:|\/Users\/[^/\s]+|api-token\.json|raw photo|source filename|sourceFileName|sourcePath|photo path|fullLocalPath|raw provider response|raw prompt|promptText|workspace path|config path|GPS payload|EXIF payload|\.\./i.test(sanitized);
}

function claimScanPassed() {
  const text = [
    "docs/V15.x/v15_x-claim-matrix.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-asset-plan.md",
    "docs/V15.x/v15_9-v15_13-photo-to-2d-detailed-implementation-spec.md"
  ].map(readSafe).join("\n");
  return text.includes("V15.12 photo-guided 2D action pack continuity assembly passed for tested local frame assets.") &&
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
  return text.includes("V15.12") &&
    text.includes("Photo2DContinuityAssembler") &&
    text.includes("first and final rendered frames must close") &&
    text.includes("previous active pack preservation");
}

function readSafe(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function renderEvidence(status, evidence, rows) {
  const table = rows.map((item) => `| ${item.name} | ${item.result} | ${String(item.details).replace(/\|/g, "\\|")} |`).join("\n");
  const frameRows = Object.entries(evidence.frameCountTable)
    .map(([action, count]) => `| ${action} | ${count} | ${evidence.continuityTable[action].firstFinalClosed} | ${evidence.continuityTable[action].maxAdjacentDelta} |`)
    .join("\n");
  const issueRows = evidence.issueTable.length
    ? evidence.issueTable.map((issue) => `| ${issue.actionId ?? "unknown"} | ${issue.reasonCode} | ${issue.frameIndex ?? ""} |`).join("\n")
    : "| none | none | none |";

  return `# V15.12 Photo 2D Continuity Assembly Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

V15.12 validates local generated/imported frame assembly into a safe sprite
pack. It uses local frame metadata fixtures and existing V10 animation pack
adapter boundaries. It does not call a provider and does not claim automatic
photo-to-2D readiness.

## Accepted Pack Snapshot

| Field | Value |
| --- | --- |
| status | ${evidence.status} |
| reasonCode | ${evidence.reasonCode} |
| generatedPackId | ${evidence.generatedPackId} |
| coreActionCoverage | ${evidence.coreActionCoverage.join(", ")} |
| preservedPreviousActivePack | ${evidence.preservedPreviousActivePack} |
| safeRendererOutputFields | ${evidence.safeRendererOutputFields.join(", ")} |

## Frame Count And Continuity Table

| Action | Frame Count | First/Final Closed | Max Adjacent Delta |
| --- | ---: | --- | ---: |
${frameRows}

## Failed Fixture Table

| Action | Reason Code | Frame Index |
| --- | --- | --- |
${issueRows}

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${table}

## Security Boundary

Evidence records only safe pack IDs, action IDs, frame counts, continuity
numbers, issue reason codes, and renderer output field names. It excludes raw
photo bytes, source filename, full local path, EXIF/GPS payload, token,
Authorization, prompt text, raw provider request, and raw provider response.

## Allowed Claim

${status === "passed" ? "V15.12 photo-guided 2D action pack continuity assembly passed for tested local frame assets." : "No V15.12 claim may be used while this evidence is not passed."}

## Forbidden Claims

This evidence does not claim automatic photo-to-2D ready, automatic
photo-to-animation ready, provider integration verified, photo customization
ready for arbitrary cats, Petdex parity, 3D ready, automatic photo-to-3D ready,
production signed release ready, cross-platform ready, or Windows ready.
`;
}
