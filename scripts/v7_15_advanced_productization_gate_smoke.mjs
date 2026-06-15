import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = "2026-06-01";
const EVIDENCE_PATH = `docs/V7.15/evidence/v7_15-advanced-productization-gate-smoke-${DATE}.md`;
const cases = [];

record("V7.13 final report passed", fileContains("docs/V7.13/v7_13-final-acceptance-report.md", "status: passed"), "V7.13 scoped orchestration final report exists");
record("V7.14 final report passed", fileContains("docs/V7.14/v7_14-final-acceptance-report.md", "status: passed"), "V7.14 scoped visual QA final report exists");
record("generated 2D path basis", fileContains("docs/V7.13/v7_13-final-acceptance-report.md", "2D generated workflow: passed"), "generated 2D path accepted");
record("external GLB import path basis", fileContains("docs/V7.13/v7_13-final-acceptance-report.md", "External GLB import workflow: passed"), "external GLB import path accepted");
record("real provider 3D branch blocked", fileContains("docs/V7.13/v7_13-final-acceptance-report.md", "real_provider_3d_branch_blocked"), "automatic photo-to-3D remains not-ready");
record("V7.14 generated 2D visual evidence", existsSync("docs/V7.14/evidence/v7_14-generated-2d-actions-2026-06-01.png"), "generated 2D contact sheet retained");
record("V7.14 visual QA evidence", fileContains("docs/V7.14/evidence/v7_14-advanced-visual-qa-2026-06-01.md", "status: passed"), "advanced visual QA evidence passed");

record("V7.13 orchestration smoke rerun", run(["pnpm", "--filter", "desktop", "exec", "node", "--import", "tsx", "../../scripts/v7_13_photo_to_asset_orchestration_smoke.mjs"]), "V7.13 smoke rerun");
record("V7.14 visual QA smoke rerun", run(["node", "scripts/v7_14_advanced_visual_qa_smoke.mjs"]), "V7.14 smoke rerun");
record("desktop check", run(["pnpm", "--filter", "desktop", "check"]), "desktop typecheck");
record("petctl test", run(["pnpm", "--filter", "@agent-desktop-pet/petctl", "test"]), "petctl unit/regression");

const securityTargets = [
  "docs/V7.13/evidence/v7_13-photo-to-asset-orchestration-smoke-2026-06-01.md",
  "docs/V7.13/v7_13-final-acceptance-report.md",
  "docs/V7.14/evidence/v7_14-advanced-visual-qa-2026-06-01.md",
  "docs/V7.14/v7_14-final-acceptance-report.md"
];
record("security scan", !securityTargets.some((path) => forbiddenSecurityPattern().test(readFileSync(path, "utf8"))), "no forbidden secret/path/raw-payload leakage in final evidence set");

const claimTargets = [
  "docs/V7.13/v7_13-final-acceptance-report.md",
  "docs/V7.14/v7_14-final-acceptance-report.md",
  "docs/V7.15/v7_15-claim-matrix.md"
];
record("claim scan", claimTargets.every((path) => claimContextLooksScoped(readFileSync(path, "utf8"))), "forbidden ready claims appear only in forbidden/not-ready/conditional contexts");
record("license/attribution scan", fileContains("fixtures/manual/visual-assets/imported-static-orange-tabby-v1/manifest.json", "attribution") && fileContains("fixtures/manual/visual-assets/imported-gltf-prototype-cat-v1/manifest.json", "attribution"), "claimed fixture manifests include attribution");
const gitStatus = run(["git", "status", "--short"]);
record(
  "artifact scan",
  gitStatus.ok && !/(\s|^)(dist|target|node_modules)\//.test(gitStatus.output),
  "generated dist/, target/, and node_modules/ are not present as source changes"
);

const failed = cases.filter((item) => item.result === "failed");
const status = failed.length ? "failed" : "passed";
mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
writeFileSync(EVIDENCE_PATH, renderEvidence(status, cases));

console.log(JSON.stringify({
  status,
  evidencePath: EVIDENCE_PATH,
  finalAllowedClaim: finalAllowedClaim(),
  cases
}, null, 2));

if (failed.length) {
  process.exit(1);
}

function fileContains(path, text) {
  return existsSync(path) && readFileSync(path, "utf8").includes(text);
}

function record(name, okOrResult, details) {
  const ok = typeof okOrResult === "boolean" ? okOrResult : okOrResult.ok;
  cases.push({
    name,
    result: ok ? "passed" : "failed",
    details: ok ? details : sanitize(typeof okOrResult === "boolean" ? details : okOrResult.output)
  });
}

function run(command) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: process.cwd(),
    encoding: "utf8"
  });
  return {
    ok: result.status === 0,
    output: `${result.stdout || ""}${result.stderr || ""}`
  };
}

function forbiddenSecurityPattern() {
  return /\/Users\/|sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|api[_-]?key\s*[:=]\s*[^"'\s]+|cookie\s*[:=]\s*[^"'\s]+/i;
}

function claimContextLooksScoped(text) {
  const forbidden = [
    "automatic photo-to-3D ready",
    "provider integration verified",
    "broad 3D ready",
    "production signed release ready"
  ];
  for (const claim of forbidden) {
    const index = text.indexOf(claim);
    if (index === -1) continue;
    const context = text.slice(Math.max(0, index - 160), index + claim.length + 160).toLowerCase();
    if (!/(forbidden|not-ready|not ready|cannot claim|does not claim|no .*claim|unless|conditional|blocked|cannot)/i.test(context)) {
      return false;
    }
  }
  return true;
}

function sanitize(value) {
  return String(value)
    .replace(/\/Users\/[^/\s]+/g, "[home]")
    .replace(/\/private\/[^\s"']+/g, "[tmp]")
    .replace(/Authorization[^\n]*/gi, "Authorization [redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[redacted]")
    .slice(0, 1200);
}

function finalAllowedClaim() {
  return "V7 advanced personalized cat asset workflow passed for tested generated 2D and imported GLB/GLTF runtime scenarios; automatic photo-to-3D remains not-ready.";
}

function renderEvidence(status, caseList) {
  return `# V7.15 Advanced Productization Gate Smoke

status: ${status}
date: ${DATE}

## Scope

This final gate covers V7.13 and V7.14 accepted paths only:

- generated 2D local sprite path.
- external GLB/GLTF import path.

The real 3D provider output path remains blocked, so automatic photo-to-3D remains not-ready.

## Claim Basis Table

| Claim Basis | Evidence Path | Result | Claim Impact |
| --- | --- | --- | --- |
| generated 2D path | \`docs/V7.13/v7_13-final-acceptance-report.md\`, \`docs/V7.14/evidence/v7_14-generated-2d-actions-2026-06-01.png\` | passed | supports generated 2D workflow claim |
| external GLB import path | \`docs/V7.13/v7_13-final-acceptance-report.md\`, V7.12 GLB runtime screenshots | passed | supports imported GLB/GLTF runtime scenario claim |
| real 3D provider output | \`docs/V7.13/v7_13-final-acceptance-report.md\` | blocked | no provider 3D claim |
| automatic photo-to-3D | V7.13/V7.14 final reports | not-ready | forbidden because real 3D provider output is missing |
| final allowed claim | this evidence | ${status === "passed" ? "passed" : "failed"} | ${finalAllowedClaim()} |

## Case Results

| Case | Result | Details |
| --- | --- | --- |
${caseList.map((item) => `| ${item.name} | ${item.result} | ${item.details} |`).join("\n")}

## Final Decision

${status === "passed" ? `Passed. Allowed claim: ${finalAllowedClaim()}` : "Failed. Do not claim V7.15 passed."}
`;
}
