#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V23-V28.x/evidence/v24-multi-route-generation-smoke-${DATE}.md`;
const V23_EVIDENCE = "docs/V23-V28.x/evidence/v23-photo-suitability-trait-smoke-2026-06-16.md";

const snapshot = runSnapshot();
const records = [];

record(
  "V23 prerequisite evidence exists and passed",
  existsSync(resolve(REPO_ROOT, V23_EVIDENCE)) && /^status:\s*passed/m.test(readFileSync(resolve(REPO_ROOT, V23_EVIDENCE), "utf8")),
  V23_EVIDENCE
);
record(
  "all five routes represented",
  snapshot.routeIds.length === 5 && snapshot.routeIds.includes("route_a_provider_key_pose") && snapshot.routeIds.includes("route_e_local_fallback_style_pack"),
  snapshot.routeIds.join(", ")
);
record(
  "unsupported routes fail safely",
  hasRouteReason("route_b_provider_action_sheet", "route_unavailable") && hasRouteReason("route_d_image_to_video", "route_unavailable"),
  "route_b/route_d return route_unavailable"
);
record(
  "provider credential missing is stable and redacted",
  hasRouteReason("route_a_provider_key_pose", "provider_credential_missing") && !securityLeak(JSON.stringify(snapshot)),
  "provider route blocked without credential value"
);
record(
  "local route creates safe candidate",
  snapshot.safeCandidateCount >= 1 && hasRouteState("route_c_local_rig", "candidate_created"),
  `safeCandidateCount=${snapshot.safeCandidateCount}`
);
record(
  "safe candidate metadata only",
  snapshot.candidateFieldSets.every((fields) => fields.join(",") === "actionCoverage,candidateId,rendererKind,safePackId"),
  snapshot.candidateFieldSets.map((fields) => fields.join(",")).join(" / ")
);
record(
  "attempt budgets enforced",
  snapshot.totalAttemptBudget.requested <= snapshot.totalAttemptBudget.allowed && snapshot.routes.every((route) => route.attemptBudget.requested <= route.attemptBudget.allowed),
  `total=${snapshot.totalAttemptBudget.requested}/${snapshot.totalAttemptBudget.allowed}`
);
record(
  "failure does not mutate live pet",
  snapshot.livePetMutationAttempted === false && snapshot.previousPackPreserved === true && snapshot.providerExecutionStarted === false,
  "no PetEvent, no notify, no CatStateMachine write, no live PetInstance mutation"
);
record(
  "desktop target test passed",
  snapshot.testPassed,
  snapshot.testPassed ? "multi-route-generation-orchestrator.test.ts passed" : snapshot.testOutput
);
record(
  "security scan",
  !securityLeak(JSON.stringify(snapshot)),
  "no credential, auth header, private file identifiers, provider body, image bytes, geodata"
);
record(
  "claim scan",
  !/(V24 final passed|V28 final passed|provider integration verified\s+passed|automatic photo-to-2D ready\s+passed|Petdex parity achieved\s+passed|3D ready\s+passed)/i.test(renderEvidence("scan")),
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
  buildV24OrchestrationEvidenceSnapshot,
  createV24MultiRouteOrchestration,
  multiRouteOrchestrationHasForbiddenContent
} from "./src/assets/multi-route-generation-orchestrator.ts";

const photoSuitability = {
  status: "clear",
  primaryReasonCode: "photo_suitability_clear"
};
const result = createV24MultiRouteOrchestration({
  photoSuitability,
  routes: {
    route_a_provider_key_pose: {
      credentialRequired: true,
      credentialPresent: false,
      consentRequired: true,
      consentAccepted: true,
      attemptsRequested: 1
    },
    route_b_provider_action_sheet: {
      supported: false,
      attemptsRequested: 1
    },
    route_c_local_rig: {
      outputKind: "local_output",
      candidateId: "v24_route_c_candidate",
      safePackId: "v24_route_c_safe_pack",
      actionCoverage: CORE_ACTION_IDS
    },
    route_d_image_to_video: {
      supported: false,
      attemptsRequested: 1
    },
    route_e_local_fallback_style_pack: {
      outputKind: "local_output",
      candidateId: "v24_route_e_candidate",
      safePackId: "v24_route_e_safe_pack",
      actionCoverage: CORE_ACTION_IDS
    }
  }
});
const evidence = buildV24OrchestrationEvidenceSnapshot(result);
console.log(JSON.stringify({
  ...evidence,
  routeIds: result.routes.map((route) => route.routeId),
  routes: result.routes,
  candidateFieldSets: result.routes.filter((route) => route.candidate).map((route) => Object.keys(route.candidate).sort()),
  forbiddenLeak: multiRouteOrchestrationHasForbiddenContent(evidence)
}));
`;
  const raw = execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "--eval", code], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  const snapshot = JSON.parse(raw);
  try {
    execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--test", "--import", "tsx", "src/assets/multi-route-generation-orchestrator.test.ts"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { ...snapshot, testPassed: true, testOutput: "passed" };
  } catch (error) {
    return { ...snapshot, testPassed: false, testOutput: sanitize(String(error.stdout || error.stderr || error.message)) };
  }
}

function hasRouteReason(routeId, reasonCode) {
  return snapshot.routes.some((route) => route.routeId === routeId && route.reasonCodes.includes(reasonCode));
}

function hasRouteState(routeId, state) {
  return snapshot.routes.some((route) => route.routeId === routeId && route.state === state);
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function renderEvidence(status) {
  return `# V24 Multi-route Generation Orchestrator Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

V24 verifies route registration, route budgets, safe candidate metadata, and
non-mutating orchestration. It does not run provider generation, does not run
V25 QA, does not preview/apply assets, and does not unlock V28.

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${sanitize(item.details)} |`).join("\n")}

## Route Table

| Route | State | Reason codes | Candidate |
| --- | --- | --- | --- |
${snapshot.routes.map((route) => `| ${route.routeId} | ${route.state} | ${route.reasonCodes.join(", ")} | ${route.candidate ? route.candidate.safePackId : "none"} |`).join("\n")}

## Safe Candidate Metadata

The route orchestrator exposes only candidateId, safePackId, rendererKind, and
actionCoverage for created candidates. Candidate output is not QA approved and
cannot be applied at V24.

## PRD / Spec Review

V24 satisfies the PRD requirement to avoid single-route dependency and to record
honest route states. V25 remains responsible for same-cat, motion, flicker, loop,
and V22 quality review gates.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Route candidate treated as QA approved asset | High | blocked by scope and candidate status |
| Provider unavailable treated as route passed | High | provider route uses blocked/unavailable reasonCodes |
| Route orchestration mutates live pet | High | smoke proves no mutation flags and no provider execution |
| Local fallback hides provider failure | Medium | provider routes retain explicit blocked/unavailable reasonCodes |

## Allowed Claim

${status === "passed"
    ? "V24 multi-route generation orchestrator passed for tested local route registration, safe candidate metadata, and non-mutating route state scenarios."
    : "No V24 passed claim is made."}

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
