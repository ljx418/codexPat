#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V23-V28.x/evidence/v27-retry-cost-guidance-smoke-${DATE}.md`;
const V26_EVIDENCE = "docs/V23-V28.x/evidence/v26-pack-preview-apply-smoke-2026-06-16.md";

const snapshot = runSnapshot();
const records = [];

record(
  "V26 prerequisite evidence exists and passed",
  existsSync(resolve(REPO_ROOT, V26_EVIDENCE)) && /^status:\s*passed/m.test(readFileSync(resolve(REPO_ROOT, V26_EVIDENCE), "utf8")),
  V26_EVIDENCE
);
record(
  "retry budget enforced",
  snapshot.budget.status === "budget_exhausted"
    && snapshot.budget.reasonCodes.includes("retry_budget_exhausted")
    && snapshot.budget.reasonCodes.includes("total_budget_exhausted"),
  snapshot.budget.reasonCodes.join(", ")
);
record(
  "repeated reason requires repair before retry",
  snapshot.repeated.status === "repair_required"
    && snapshot.repeated.reasonCodes.includes("repeated_reason_requires_repair")
    && snapshot.repeated.nextActions.includes("repair_generation_strategy"),
  snapshot.repeated.reasonCodes.join(", ")
);
record(
  "provider route blocked without consent, credential, and disclosures",
  snapshot.providerBlocked.status === "provider_blocked"
    && snapshot.providerBlocked.providerExecutionStarted === false
    && snapshot.providerBlocked.providerExecutionAllowed === false
    && snapshot.providerBlocked.reasonCodes.includes("provider_credential_missing")
    && snapshot.providerBlocked.reasonCodes.includes("provider_consent_required")
    && snapshot.providerBlocked.reasonCodes.includes("provider_cost_disclosure_required")
    && snapshot.providerBlocked.reasonCodes.includes("provider_privacy_disclosure_required")
    && snapshot.providerBlocked.reasonCodes.includes("provider_retention_disclosure_required")
    && snapshot.providerBlocked.reasonCodes.includes("provider_license_disclosure_required"),
  snapshot.providerBlocked.reasonCodes.join(", ")
);
record(
  "budget exhaustion shows actionable next step",
  snapshot.budget.nextActions.includes("switch_route") && snapshot.budget.nextActions.includes("stop_keep_current_pet"),
  snapshot.budget.nextActions.join(", ")
);
record(
  "better-photo guidance is actionable",
  snapshot.photoGuidance.reasonCodes.includes("better_photo_required") && snapshot.photoGuidance.nextActions.includes("use_single_cat_photo"),
  snapshot.photoGuidance.nextActions.join(", ")
);
record(
  "previous visible pet remains unchanged",
  snapshot.allPreservePreviousPack === true && snapshot.allNoLivePetMutation === true,
  "previousPackPreserved=true; livePetMutationAttempted=false"
);
record(
  "desktop target test passed",
  snapshot.testPassed,
  snapshot.testPassed ? "retry-cost-failure-guidance.test.ts passed" : snapshot.testOutput
);
record(
  "security scan",
  !securityLeak(JSON.stringify(snapshot)),
  "no credential, auth header, private file identifiers, provider body, image bytes, geodata"
);
record(
  "claim scan",
  !/(V27 final passed|V28 final passed|provider integration verified\s+passed|automatic photo-to-2D ready\s+passed|Petdex parity achieved\s+passed|3D ready\s+passed)/i.test(renderEvidence("scan")),
  "forbidden claims are not used as passed"
);

const status = records.every((item) => item.ok) ? "passed" : "failed";
mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, evidence: EVIDENCE_PATH, records }, null, 2));
process.exit(status === "passed" ? 0 : 1);

function runSnapshot() {
  const code = `
import {
  buildV27RetryGuidanceEvidenceSnapshot,
  createV27RetryCostFailureGuidance
} from "./src/assets/retry-cost-failure-guidance.ts";

const repeated = buildV27RetryGuidanceEvidenceSnapshot(createV27RetryCostFailureGuidance({
  routeId: "route_a_provider_key_pose",
  failureReason: "same_cat_score_too_low",
  routeAttemptLimit: 3,
  attemptHistory: [
    { routeId: "route_a_provider_key_pose", reasonCode: "same_cat_score_too_low" },
    { routeId: "route_a_provider_key_pose", reasonCode: "same_cat_score_too_low" }
  ]
}));
const budget = buildV27RetryGuidanceEvidenceSnapshot(createV27RetryCostFailureGuidance({
  routeId: "route_c_local_rig",
  failureReason: "motion_amplitude_too_low",
  routeAttemptLimit: 2,
  totalAttemptLimit: 3,
  attemptHistory: [
    { routeId: "route_c_local_rig", reasonCode: "motion_amplitude_too_low", repairApplied: true },
    { routeId: "route_c_local_rig", reasonCode: "motion_amplitude_too_low", repairApplied: true },
    { routeId: "route_e_local_fallback_style_pack", reasonCode: "route_output_rejected", repairApplied: true }
  ]
}));
const providerBlocked = buildV27RetryGuidanceEvidenceSnapshot(createV27RetryCostFailureGuidance({
  routeId: "route_b_provider_action_sheet",
  failureReason: "provider_unavailable",
  attemptHistory: [],
  providerGate: {
    isProviderRoute: true,
    credentialRequired: true,
    credentialPresent: false,
    consentRequired: true,
    consentAccepted: false,
    costDisclosureShown: false,
    privacyDisclosureShown: false,
    retentionDisclosureShown: false,
    licenseDisclosureShown: false
  }
}));
const photoGuidance = buildV27RetryGuidanceEvidenceSnapshot(createV27RetryCostFailureGuidance({
  routeId: "route_e_local_fallback_style_pack",
  failureReason: "multi_cat_ambiguous",
  attemptHistory: []
}));
const all = [repeated, budget, providerBlocked, photoGuidance];
console.log(JSON.stringify({
  repeated,
  budget,
  providerBlocked,
  photoGuidance,
  allPreservePreviousPack: all.every((item) => item.previousPackPreserved === true),
  allNoLivePetMutation: all.every((item) => item.livePetMutationAttempted === false)
}));
`;
  const raw = execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "--eval", code], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  const snapshot = JSON.parse(raw);
  try {
    execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--test", "--import", "tsx", "src/assets/retry-cost-failure-guidance.test.ts"], {
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
  return `# V27 Retry Cost Guidance Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

V27 verifies route retry budgets, repeated-failure repair guidance, provider
credential/consent/cost/privacy/retention/license gates, and user-facing next
steps. It does not create assets, call a provider, apply a pack, or run the V28
final gate.

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${sanitize(item.details)} |`).join("\n")}

## Guidance Summary

| Scenario | Status | Reason codes | Next actions |
| --- | --- | --- | --- |
| repeated same reason | ${snapshot.repeated.status} | ${snapshot.repeated.reasonCodes.join(", ")} | ${snapshot.repeated.nextActions.join(", ")} |
| budget exhausted | ${snapshot.budget.status} | ${snapshot.budget.reasonCodes.join(", ")} | ${snapshot.budget.nextActions.join(", ")} |
| provider blocked | ${snapshot.providerBlocked.status} | ${snapshot.providerBlocked.reasonCodes.join(", ")} | ${snapshot.providerBlocked.nextActions.join(", ")} |
| better photo | ${snapshot.photoGuidance.status} | ${snapshot.photoGuidance.reasonCodes.join(", ")} | ${snapshot.photoGuidance.nextActions.join(", ")} |

## PRD / Spec Review

V27 satisfies the PRD requirement that repeated failures must not blindly retry,
provider routes must not start without consent/credential/disclosures, exhausted
budgets must show actionable next steps, and the previous visible pet remains
unchanged.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Repeated failure silently retries | High | blocked by repeated_reason_requires_repair |
| Provider route starts without consent/credential/disclosure | High | providerExecutionStarted=false |
| Budget exhaustion keeps trying | High | budget_exhausted with switch/stop guidance |
| Guidance mutates live pet | High | livePetMutationAttempted=false |

## Allowed Claim

${status === "passed"
    ? "V27 retry, cost, and failure guidance passed for tested local failure and provider-gate scenarios."
    : "No V27 passed claim is made."}

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
