#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V29.x/evidence/v29_4-productized-wizard-smoke-${DATE}.md`;

const snapshot = runSnapshot();
const records = [];

record("approved candidate completes preview/apply/rollback", snapshot.accepted.status === "passed" && snapshot.accepted.states.includes("preview_ready") && snapshot.accepted.states.includes("applied") && snapshot.accepted.states.includes("rolled_back"), snapshot.accepted.reasonCodes.join(", "));
record("preview remains isolated", snapshot.accepted.previewSafety.acceptedPetEvents === 0 && snapshot.accepted.previewSafety.callsNotify === false && snapshot.accepted.previewSafety.writesCatStateMachine === false, "zero PetEvent / no notify / no CatStateMachine");
record("QA failed candidate cannot apply", snapshot.qaFailed.status === "blocked" && snapshot.qaFailed.reasonCodes.includes("qa_failed_candidate_blocked") && snapshot.qaFailed.previewApply === null, snapshot.qaFailed.reasonCodes.join(", "));
record("missing photo blocks wizard", snapshot.noPhoto.status === "blocked" && snapshot.noPhoto.reasonCodes.includes("wizard_photo_required"), snapshot.noPhoto.reasonCodes.join(", "));
record("missing target blocks apply", snapshot.noTarget.status === "blocked" && snapshot.noTarget.reasonCodes.includes("apply_target_missing"), snapshot.noTarget.reasonCodes.join(", "));
record("wizard target test passed", snapshot.testPassed === true, snapshot.testOutput);
record("security scan", !securityLeak(JSON.stringify(snapshot)), "safe wizard snapshot only");
record("claim scan", !/(V29 productized photo generation wizard passed.*final|automatic photo-to-2D ready.*passed|provider integration verified\s+passed|Petdex parity achieved\s+passed)/i.test(renderEvidence("scan")), "no forbidden ready claim");

const status = records.every((item) => item.ok) ? "passed" : "failed";
mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, evidence: EVIDENCE_PATH, records }, null, 2));
process.exit(status === "passed" ? 0 : 1);

function runSnapshot() {
  const code = `
import { runV29ProductizedGenerationWizard } from "./src/assets/productized-generation-wizard.ts";
import { v29AcceptedActionMetrics } from "./src/assets/quality-gate-v2.ts";

const instances = [
  { instanceId: "default", displayName: "Default", activePackId: "flagship-work-cat-v2", isDefault: true },
  { instanceId: "codex_other", displayName: "Other", activePackId: "premium-silver" },
  { instanceId: "codex_target", displayName: "Target", activePackId: "previous-visible-pack" }
];
const base = {
  safeSampleId: "docs_cat_1",
  photoSelected: true,
  candidateId: "v29_wizard_candidate",
  safePackId: "v29_wizard_pack",
  displayName: "V29 Wizard Cat",
  candidateMetrics: v29AcceptedActionMetrics(),
  userApproved: true,
  targetInstanceId: "codex_target",
  instances
};
const accepted = runV29ProductizedGenerationWizard(base);
const qaFailed = runV29ProductizedGenerationWizard({
  ...base,
  safeSampleId: "docs_cat_2",
  candidateId: "v29_wizard_bad_candidate",
  safePackId: "v29_wizard_bad_pack",
  candidateMetrics: v29AcceptedActionMetrics({ sameCatScore: 0.3 })
});
const noPhoto = runV29ProductizedGenerationWizard({ ...base, photoSelected: false });
const noTarget = runV29ProductizedGenerationWizard({ ...base, targetInstanceId: null });
console.log(JSON.stringify({ accepted, qaFailed, noPhoto, noTarget }));
`;
  const raw = execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "--eval", code], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  let testPassed = false;
  let testOutput = "not-run";
  try {
    execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--test", "--import", "tsx", "src/assets/productized-generation-wizard.test.ts"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    testPassed = true;
    testOutput = "productized-generation-wizard.test.ts passed";
  } catch (error) {
    testOutput = sanitize(String(error.stdout || error.stderr || error.message));
  }
  return { ...JSON.parse(raw), testPassed, testOutput };
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function renderEvidence(status) {
  return `# V29.4 Productized Wizard Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

V29.4 verifies a tested productized wizard model for upload/generate/QA/preview/
apply/rollback semantics. It does not prove the V29.2 diverse photo benchmark,
provider integration, or V29 final readiness.

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${sanitize(item.details)} |`).join("\n")}

## Scenario Table

| Scenario | Status | States | Reason codes |
| --- | --- | --- | --- |
| accepted | ${snapshot.accepted.status} | ${snapshot.accepted.states.join(" -> ")} | ${snapshot.accepted.reasonCodes.join(", ")} |
| qaFailed | ${snapshot.qaFailed.status} | ${snapshot.qaFailed.states.join(" -> ")} | ${snapshot.qaFailed.reasonCodes.join(", ")} |
| noPhoto | ${snapshot.noPhoto.status} | ${snapshot.noPhoto.states.join(" -> ")} | ${snapshot.noPhoto.reasonCodes.join(", ")} |
| noTarget | ${snapshot.noTarget.status} | ${snapshot.noTarget.states.join(" -> ")} | ${snapshot.noTarget.reasonCodes.join(", ")} |

## PRD / Spec Review

The tested wizard path shows that an approved candidate can reach preview,
target-only apply, and rollback without shell commands or raw manifest editing.
QA-failed candidates, missing photos, and missing target instances are blocked
with stable reasonCodes.

V29.2 remains blocked by insufficient benchmark sample count, so V29.6 remains
No-Go.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| QA failed candidate can apply | High | qa_failed_candidate_blocked and previewApply=null |
| Preview mutates live state | High | zero PetEvent / no notify / no CatStateMachine |
| Missing target silently falls back to default | High | apply_target_missing blocks apply |
| Wizard evidence mistaken for stable photo benchmark | High | V29.2 remains blocked; no final claim |

## Allowed Claim

${status === "passed"
    ? "V29 productized photo generation wizard passed for tested upload, generate, preview, apply, and rollback scenario."
    : "No V29.4 passed claim is made."}

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for all arbitrary cats
- provider integration verified
- Petdex parity achieved beyond tested standards
- Petdex asset reuse authorization
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
