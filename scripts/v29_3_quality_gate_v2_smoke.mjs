#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V29.x/evidence/v29_3-quality-gate-v2-smoke-${DATE}.md`;

const snapshot = runSnapshot();
const records = [];

record("accepted candidate passes all hard gates", snapshot.accepted.status === "accepted" && snapshot.accepted.rank === "A", snapshot.accepted.reasonCodes.join(", "));
record("missing action coverage rejected", snapshot.missing.status === "rejected" && snapshot.missing.reasonCodes.includes("action_coverage_incomplete"), snapshot.missing.reasonCodes.join(", "));
record("weak motion rejected", snapshot.weakMotion.status === "rejected" && snapshot.weakMotion.reasonCodes.includes("motion_amplitude_too_low"), snapshot.weakMotion.reasonCodes.join(", "));
record("identity drift rejected", snapshot.identityDrift.status === "rejected" && snapshot.identityDrift.reasonCodes.includes("same_cat_score_too_low"), snapshot.identityDrift.reasonCodes.join(", "));
record("bad background rejected", snapshot.badBackground.status === "rejected" && snapshot.badBackground.reasonCodes.includes("background_not_clean"), snapshot.badBackground.reasonCodes.join(", "));
record("flicker and loop failures rejected", snapshot.flicker.status === "rejected" && snapshot.flicker.reasonCodes.includes("frame_delta_too_large") && snapshot.flicker.reasonCodes.includes("loop_closure_failed"), snapshot.flicker.reasonCodes.join(", "));
record("aesthetic ranking cannot override hard rejection", snapshot.prettyBad.status === "rejected" && snapshot.prettyBad.rank === "rejected" && !snapshot.prettyBad.reasonCodes.includes("candidate_ranked"), snapshot.prettyBad.reasonCodes.join(", "));
record("quality gate target test passed", snapshot.testPassed === true, snapshot.testOutput);
record("security scan", !securityLeak(JSON.stringify(snapshot)), "safe QA snapshot only");
record("claim scan", !/(V29 quality gate v2 passed.*final|Petdex parity achieved\s+passed|provider integration verified\s+passed|3D ready\s+passed)/i.test(renderEvidence("scan")), "no forbidden ready claim");

const status = records.every((item) => item.ok) ? "passed" : "failed";
mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, evidence: EVIDENCE_PATH, records }, null, 2));
process.exit(status === "passed" ? 0 : 1);

function runSnapshot() {
  const code = `
import {
  buildV29QualityGateEvidenceSnapshot,
  runV29QualityGateV2,
  v29AcceptedActionMetrics
} from "./src/assets/quality-gate-v2.ts";

function snapshot(input) {
  return buildV29QualityGateEvidenceSnapshot(runV29QualityGateV2(input));
}
const base = { candidateId: "v29_candidate", safePackId: "v29_pack" };
const accepted = snapshot({ ...base, actions: v29AcceptedActionMetrics() });
const missing = snapshot({ ...base, candidateId: "v29_missing", safePackId: "v29_missing_pack", actions: v29AcceptedActionMetrics().filter((action) => action.actionId !== "sleeping") });
const weakMotion = snapshot({ ...base, candidateId: "v29_weak_motion", safePackId: "v29_weak_motion_pack", actions: v29AcceptedActionMetrics({ motionAmplitude: 0.02 }) });
const identityDrift = snapshot({ ...base, candidateId: "v29_identity_drift", safePackId: "v29_identity_drift_pack", actions: v29AcceptedActionMetrics({ sameCatScore: 0.44 }) });
const badBackground = snapshot({ ...base, candidateId: "v29_bad_background", safePackId: "v29_bad_background_pack", actions: v29AcceptedActionMetrics({ backgroundClean: false }) });
const flicker = snapshot({ ...base, candidateId: "v29_flicker", safePackId: "v29_flicker_pack", actions: v29AcceptedActionMetrics({ maxAdjacentDelta: 0.88, loopClosed: false }) });
const prettyBad = snapshot({ ...base, candidateId: "v29_pretty_bad", safePackId: "v29_pretty_bad_pack", actions: v29AcceptedActionMetrics({ sameCatScore: 0.4, aestheticScore: 1 }) });
console.log(JSON.stringify({ accepted, missing, weakMotion, identityDrift, badBackground, flicker, prettyBad }));
`;
  const raw = execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "--eval", code], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  let testPassed = false;
  let testOutput = "not-run";
  try {
    execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--test", "--import", "tsx", "src/assets/quality-gate-v2.test.ts"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    testPassed = true;
    testOutput = "quality-gate-v2.test.ts passed";
  } catch (error) {
    testOutput = sanitize(String(error.stdout || error.stderr || error.message));
  }
  return { ...JSON.parse(raw), testPassed, testOutput };
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function renderEvidence(status) {
  return `# V29.3 Quality Gate V2 Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

V29.3 verifies Quality Gate V2 for tested same-cat, motion, background,
continuity, readability, and aesthetic ranking scenarios. It does not prove the
V29.2 diverse photo benchmark and does not start V29.6 final gate.

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${sanitize(item.details)} |`).join("\n")}

## Scenario Table

| Scenario | Status | Rank | Hard rejected | Reason codes |
| --- | --- | --- | --- | --- |
${["accepted", "missing", "weakMotion", "identityDrift", "badBackground", "flicker", "prettyBad"].map((key) => {
    const item = snapshot[key];
    return `| ${key} | ${item.status} | ${item.rank} | ${item.hardRejected} | ${item.reasonCodes.join(", ")} |`;
  }).join("\n")}

## PRD / Spec Review

V29.3 satisfies the PRD requirement that bad generated assets are rejected before
preview/apply. Aesthetic ranking is available only after hard gates pass and
cannot override missing action coverage, weak motion, identity drift, bad
background, flicker, off-canvas, or loop closure failures.

V29.2 remains blocked until the benchmark has enough diverse samples. Therefore
V29.6 remains No-Go.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Pretty but wrong cat gets accepted | High | same_cat_score_too_low hard rejects |
| Static frames pass as motion | High | motion_amplitude_too_low hard rejects |
| Flicker or jump accepted | High | frame_delta_too_large / loop_closure_failed hard reject |
| Aesthetic score overrides QA | High | candidate_ranked absent for hard rejected cases |

## Allowed Claim

${status === "passed"
    ? "V29 quality gate v2 passed for tested same-cat, motion, background, continuity, and aesthetic rejection scenarios."
    : "No V29.3 passed claim is made."}

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
