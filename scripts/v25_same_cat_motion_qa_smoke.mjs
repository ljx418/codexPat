#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V23-V28.x/evidence/v25-same-cat-motion-qa-smoke-${DATE}.md`;
const V24_EVIDENCE = "docs/V23-V28.x/evidence/v24-multi-route-generation-smoke-2026-06-16.md";

const snapshot = runSnapshot();
const records = [];

record(
  "V24 prerequisite evidence exists and passed",
  existsSync(resolve(REPO_ROOT, V24_EVIDENCE)) && /^status:\s*passed/m.test(readFileSync(resolve(REPO_ROOT, V24_EVIDENCE), "utf8")),
  V24_EVIDENCE
);
record(
  "accepted candidate proceeds to V22 visual review",
  snapshot.accepted.status === "accepted_for_v22_review" && snapshot.accepted.proceedsToV22VisualReview,
  `status=${snapshot.accepted.status}; v22=${snapshot.accepted.v22Status}`
);
record(
  "identity drift rejected",
  snapshot.identityDrift.status === "rejected" && snapshot.identityDrift.reasonCodes.includes("identity_drift_detected"),
  snapshot.identityDrift.reasonCodes.join(", ")
);
record(
  "weak motion rejected",
  snapshot.weakMotion.status === "rejected" && snapshot.weakMotion.reasonCodes.includes("motion_amplitude_too_low"),
  snapshot.weakMotion.reasonCodes.join(", ")
);
record(
  "large frame delta rejected",
  snapshot.jumpy.status === "rejected" && snapshot.jumpy.reasonCodes.includes("frame_delta_too_large"),
  snapshot.jumpy.reasonCodes.join(", ")
);
record(
  "loop closure failure rejected",
  snapshot.jumpy.status === "rejected" && snapshot.jumpy.reasonCodes.includes("loop_closure_failed"),
  snapshot.jumpy.reasonCodes.join(", ")
);
record(
  "blank transparent off-canvas rejected",
  snapshot.technicalBad.status === "rejected"
    && snapshot.technicalBad.reasonCodes.includes("blank_frame_detected")
    && snapshot.technicalBad.reasonCodes.includes("transparent_frame_detected")
    && snapshot.technicalBad.reasonCodes.includes("off_canvas_frame_detected"),
  snapshot.technicalBad.reasonCodes.join(", ")
);
record(
  "desktop target test passed",
  snapshot.testPassed,
  snapshot.testPassed ? "same-cat-motion-qa.test.ts passed" : snapshot.testOutput
);
record(
  "security scan",
  !securityLeak(JSON.stringify(snapshot)),
  "no credential, auth header, private file identifiers, provider body, image bytes, geodata"
);
record(
  "claim scan",
  !/(V25 final passed|V28 final passed|provider integration verified\s+passed|automatic photo-to-2D ready\s+passed|Petdex parity achieved\s+passed|3D ready\s+passed)/i.test(renderEvidence("scan")),
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
  buildV25QAEvidenceSnapshot,
  runV25SameCatMotionQA,
  sameCatMotionQAHasForbiddenContent
} from "./src/assets/same-cat-motion-qa.ts";

function action(actionId) {
  const loopAction = ["idle", "thinking", "running", "sleeping"].includes(actionId);
  return {
    actionId,
    frameCount: loopAction ? 6 : 3,
    visiblePixelRatio: 0.28,
    offCanvas: false,
    hasBackground: false,
    hasWatermark: false,
    loopClosed: true,
    maxAdjacentDelta: 0.18,
    anchorDrift: 0.05,
    motionAmplitude: actionId === "idle" ? 0.08 : 0.28,
    identityConsistent: true,
    humanReadable: true,
    staticLike: false
  };
}
function validActions() {
  return CORE_ACTION_IDS.map(action);
}
function qa(label, overrides) {
  const result = runV25SameCatMotionQA({
    candidateId: "v25_" + label,
    safePackId: "v25_" + label + "_pack",
    sourceRoute: "local_rig",
    sameCatConsistencyScore: overrides.sameCatConsistencyScore ?? 0.9,
    traitMismatchCount: overrides.traitMismatchCount ?? 0,
    actions: overrides.actions ?? validActions()
  });
  return buildV25QAEvidenceSnapshot(result);
}
const accepted = qa("accepted", {});
const identityDrift = qa("identity_drift", { sameCatConsistencyScore: 0.5, traitMismatchCount: 2 });
const weakMotion = qa("weak_motion", {
  actions: validActions().map((item) => item.actionId === "running" ? { ...item, motionAmplitude: 0.02, staticLike: true, humanReadable: false } : item)
});
const jumpy = qa("jumpy", {
  actions: validActions().map((item) => {
    if (item.actionId === "thinking") return { ...item, loopClosed: false };
    if (item.actionId === "need_input") return { ...item, maxAdjacentDelta: 0.8 };
    return item;
  })
});
const technicalBad = qa("technical_bad", {
  actions: validActions()
    .filter((item) => item.actionId !== "sleeping")
    .map((item) => {
      if (item.actionId === "error") return { ...item, visiblePixelRatio: 0, offCanvas: true };
      if (item.actionId === "warning") return { ...item, visiblePixelRatio: 0.005 };
      return item;
    })
});
console.log(JSON.stringify({
  accepted,
  identityDrift,
  weakMotion,
  jumpy,
  technicalBad,
  forbiddenLeak: sameCatMotionQAHasForbiddenContent({ accepted, identityDrift, weakMotion, jumpy, technicalBad })
}));
`;
  const raw = execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "--eval", code], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  const snapshot = JSON.parse(raw);
  try {
    execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--test", "--import", "tsx", "src/assets/same-cat-motion-qa.test.ts"], {
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
  return `# V25 Same-cat and Motion QA Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

V25 verifies same-cat, motion, continuity, loop, and visibility QA before V22
visual review. It does not preview, apply, roll back, call providers, or unlock
V28.

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${sanitize(item.details)} |`).join("\n")}

## QA Scenario Table

| Scenario | Status | Reason codes | V22 status | Proceeds to V22 visual review |
| --- | --- | --- | --- | --- |
${["accepted", "identityDrift", "weakMotion", "jumpy", "technicalBad"].map((key) => {
  const item = snapshot[key];
  return `| ${key} | ${item.status} | ${item.reasonCodes.join(", ")} | ${item.v22Status} | ${item.proceedsToV22VisualReview} |`;
}).join("\n")}

## PRD / Spec Review

V25 satisfies the PRD requirement to reject identity drift, weak motion,
jumpy adjacent frames, open loops, and invisible/off-canvas frames before user
preview or apply. V26 remains responsible for pack assembly, isolated preview,
target-only apply, and rollback.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| QA rejected candidate can still apply | High | V25 has no apply path; V26 must enforce approved-only apply |
| Motion too weak but counted as complete | High | rejected by motion_amplitude_too_low |
| Same-cat drift hidden by route success | High | rejected by identity_drift_detected |
| V25 accepted treated as final visual approval | Medium | accepted only means V22 visual_review_required |

## Allowed Claim

${status === "passed"
    ? "V25 same-cat and motion QA passed for tested candidate metrics and rejection scenarios."
    : "No V25 passed claim is made."}

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
