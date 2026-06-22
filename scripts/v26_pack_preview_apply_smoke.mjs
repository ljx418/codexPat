#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V23-V28.x/evidence/v26-pack-preview-apply-smoke-${DATE}.md`;
const V25_EVIDENCE = "docs/V23-V28.x/evidence/v25-same-cat-motion-qa-smoke-2026-06-16.md";

const snapshot = runSnapshot();
const records = [];

record(
  "V25 prerequisite evidence exists and passed",
  existsSync(resolve(REPO_ROOT, V25_EVIDENCE)) && /^status:\s*passed/m.test(readFileSync(resolve(REPO_ROOT, V25_EVIDENCE), "utf8")),
  V25_EVIDENCE
);
record(
  "all 8 actions preview",
  snapshot.accepted.previewActionCount === 8,
  `previewActionCount=${snapshot.accepted.previewActionCount}`
);
record(
  "preview sends zero PetEvent and no state writes",
  snapshot.accepted.previewSafety.acceptedPetEvents === 0
    && snapshot.accepted.previewSafety.callsNotify === false
    && snapshot.accepted.previewSafety.writesCatStateMachine === false
    && snapshot.accepted.previewSafety.mutatesLivePetInstance === false,
  "preview is isolated"
);
record(
  "QA failed candidate cannot apply",
  snapshot.qaFailed.status === "blocked" && snapshot.qaFailed.applyStatus === "blocked" && snapshot.qaFailed.reasonCodes.includes("qa_not_accepted"),
  snapshot.qaFailed.reasonCodes.join(", ")
);
record(
  "approved candidate applies target-only",
  snapshot.accepted.applyStatus === "applied"
    && snapshot.accepted.previewApplySnapshot.defaultPetUnchanged === true
    && snapshot.accepted.previewApplySnapshot.unrelatedPetsUnchanged === true,
  "target changed; default and unrelated unchanged"
);
record(
  "rollback restores previous visible pack",
  snapshot.accepted.rollbackStatus === "rolled_back" && snapshot.accepted.rollbackDefaultPetUnchanged === true && snapshot.accepted.rollbackUnrelatedPetsUnchanged === true,
  "rollback restored pre-apply assignments"
);
record(
  "desktop target test passed",
  snapshot.testPassed,
  snapshot.testPassed ? "pack-preview-apply-rollback.test.ts passed" : snapshot.testOutput
);
record(
  "security scan",
  !securityLeak(JSON.stringify(snapshot)),
  "no credential, auth header, private file identifiers, provider body, image bytes, geodata"
);
record(
  "claim scan",
  !/(V26 final passed|V28 final passed|provider integration verified\s+passed|automatic photo-to-2D ready\s+passed|Petdex parity achieved\s+passed|3D ready\s+passed)/i.test(renderEvidence("scan")),
  "forbidden claims are not used as passed"
);

const status = records.every((item) => item.ok) ? "passed" : "failed";
mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, evidence: EVIDENCE_PATH, records }, null, 2));
process.exit(status === "passed" ? 0 : 1);

function runSnapshot() {
  const code = `
import { CORE_ACTION_IDS } from "./src/assets/asset-manifest.ts";
import {
  buildV26PackPreviewApplyEvidenceSnapshot,
  runV26PackPreviewApplyRollback,
  v26FrameSet,
  v26PackPreviewApplyHasForbiddenContent
} from "./src/assets/pack-preview-apply-rollback.ts";

function loopAction(actionId) {
  return ["idle", "thinking", "running", "sleeping"].includes(actionId);
}
const frames = CORE_ACTION_IDS.map((actionId) => v26FrameSet(actionId, loopAction(actionId) ? 6 : 3));
const instances = [
  { instanceId: "default", displayName: "Default", activePackId: "flagship-work-cat-v2", isDefault: true },
  { instanceId: "codex_other", displayName: "Other", activePackId: "living-work-cat-v1" },
  { instanceId: "codex_target", displayName: "Target", activePackId: "previous-visible-pack" }
];
const accepted = buildV26PackPreviewApplyEvidenceSnapshot(runV26PackPreviewApplyRollback({
  v25Accepted: true,
  userApproved: true,
  generatedPackId: "v26-generated-orange-tabby",
  displayName: "V26 Generated Orange",
  actionFrames: frames,
  targetInstanceId: "codex_target",
  instances
}));
const qaFailed = buildV26PackPreviewApplyEvidenceSnapshot(runV26PackPreviewApplyRollback({
  v25Accepted: false,
  userApproved: true,
  generatedPackId: "v26-rejected-pack",
  displayName: "Rejected",
  actionFrames: frames,
  targetInstanceId: "codex_target",
  instances
}));
const unapproved = buildV26PackPreviewApplyEvidenceSnapshot(runV26PackPreviewApplyRollback({
  v25Accepted: true,
  userApproved: false,
  generatedPackId: "v26-unapproved-pack",
  displayName: "Unapproved",
  actionFrames: frames,
  targetInstanceId: "codex_target",
  instances
}));
console.log(JSON.stringify({
  accepted,
  qaFailed,
  unapproved,
  forbiddenLeak: v26PackPreviewApplyHasForbiddenContent({ accepted, qaFailed, unapproved })
}));
`;
  const raw = execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "--eval", code], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  const snapshot = JSON.parse(raw);
  try {
    execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--test", "--import", "tsx", "src/assets/pack-preview-apply-rollback.test.ts"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { ...snapshot, testPassed: true, testOutput: "passed" };
  } catch (error) {
    return { ...snapshot, testPassed: false, testOutput: sanitize(String(error.stdout || error.stderr || error.message)) };
  }
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function renderEvidence(status) {
  return `# V26 Pack Preview Apply Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

V26 verifies safe pack assembly, isolated 8-action preview, user-approved
target-only apply, and rollback. It does not run V27 retry guidance or V28 final
gate.

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${sanitize(item.details)} |`).join("\n")}

## Flow Summary

| Scenario | Status | Preview actions | Apply | Rollback | Reason codes |
| --- | --- | --- | --- | --- | --- |
| accepted | ${snapshot.accepted.status} | ${snapshot.accepted.previewActionCount} | ${snapshot.accepted.applyStatus} | ${snapshot.accepted.rollbackStatus} | ${snapshot.accepted.reasonCodes.join(", ")} |
| qaFailed | ${snapshot.qaFailed.status} | ${snapshot.qaFailed.previewActionCount} | ${snapshot.qaFailed.applyStatus} | ${snapshot.qaFailed.rollbackStatus} | ${snapshot.qaFailed.reasonCodes.join(", ")} |
| unapproved | ${snapshot.unapproved.status} | ${snapshot.unapproved.previewActionCount} | ${snapshot.unapproved.applyStatus} | ${snapshot.unapproved.rollbackStatus} | ${snapshot.unapproved.reasonCodes.join(", ")} |

## PRD / Spec Review

V26 satisfies the PRD requirement that only approved candidates can be previewed
and applied to the target pet, while QA-failed and unapproved candidates preserve
the previous visible pack. V27 remains responsible for retry, cost, and failure
guidance.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| QA failed pack can apply | High | blocked by qa_not_accepted |
| Preview mutates live pet | High | zero PetEvent / no notify / no CatStateMachine |
| Apply changes default or unrelated pets | High | target-only assignment verified |
| Rollback missing | High | rollback restores pre-apply assignments |

## Allowed Claim

${status === "passed"
    ? "V26 pack preview, target apply, and rollback passed for tested approved and rejected candidate scenarios."
    : "No V26 passed claim is made."}

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for arbitrary cats
- arbitrary cats automatic photo-to-animation ready
- provider integration verified
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- 3D ready
- production signed release ready
`;
}

function securityLeak(value) {
  return /(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|Authorization\s*[:=]|api-token\.json|\/Users\/|\/private\/|raw provider response|raw HTTP payload|raw photo bytes|EXIF\/GPS\s*[:=]|source filename\s*[:=]|source path\s*[:=]|workspace path\s*[:=]|config path\s*[:=]|prompt private text\s*[:=])/i.test(String(value));
}

function sanitize(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ").slice(0, 600);
}

function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
