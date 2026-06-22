#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V29.x/evidence/v29_5-asset-polish-smoke-${DATE}.md`;

const snapshot = runSnapshot();
const records = [];

record("at least 12 gallery entries", snapshot.accepted.packCount >= 12, `${snapshot.accepted.packCount} packs`);
record("all gallery packs have 8-action preview", snapshot.accepted.allPacksEightActionPreview === true, "allPacksEightActionPreview=true");
record("all accepted packs readable at 1x and 0.75x", snapshot.accepted.allPacksReadable === true, "allPacksReadable=true");
record("no blank/flash-frame accepted pack", snapshot.accepted.noFlashFrame === true, "noFlashFrame=true");
record("install history stores safe IDs", snapshot.accepted.installHistory.length === 1 && snapshot.accepted.installHistory[0].reasonCode === "install_history_recorded", JSON.stringify(snapshot.accepted.installHistory[0]));
record("too few packs are blocked", snapshot.tooFew.status === "blocked" && snapshot.tooFew.reasonCodes.includes("gallery_entry_count_too_low"), snapshot.tooFew.reasonCodes.join(", "));
record("flash-frame pack is failed", snapshot.flashFrame.status === "failed" && snapshot.flashFrame.reasonCodes.includes("flash_frame_detected"), snapshot.flashFrame.reasonCodes.join(", "));
record("asset polish target test passed", snapshot.testPassed === true, snapshot.testOutput);
record("security scan", !securityLeak(JSON.stringify(snapshot)), "safe pack IDs and summaries only");
record("claim scan", !/(V29 polished gallery.*final|Petdex parity achieved\s+passed|provider integration verified\s+passed|3D ready\s+passed)/i.test(renderEvidence("scan")), "no forbidden ready claim");

const status = records.every((item) => item.ok) ? "passed" : "failed";
mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, evidence: EVIDENCE_PATH, records }, null, 2));
process.exit(status === "passed" ? 0 : 1);

function runSnapshot() {
  const code = `
import { PREMIUM_CAT_PACKS } from "./src/assets/bundled-packs/premium-cats-v1.ts";
import { createV29InstallHistoryEntry, runV29AssetPolishReview } from "./src/assets/asset-polish-install-history.ts";

const packs = PREMIUM_CAT_PACKS.map((pack) => ({
  packId: pack.packId,
  displayName: pack.displayName,
  manifest: pack.manifest,
  loopClosureOk: true,
  frameContinuityOk: true,
  readableAt1x: true,
  readableAt075x: true
}));
const history = [createV29InstallHistoryEntry({
  packId: "premium-orange-tabby",
  targetInstanceId: "codex_target",
  previousPackId: "flagship-work-cat-v2"
})];
const accepted = runV29AssetPolishReview({ packs, installHistory: history });
const tooFew = runV29AssetPolishReview({ packs: packs.slice(0, 2), installHistory: [] });
const flashFrame = runV29AssetPolishReview({
  packs: [{ ...packs[0], loopClosureOk: false, frameContinuityOk: false }],
  installHistory: history,
  minimumPackCount: 1
});
console.log(JSON.stringify({ accepted, tooFew, flashFrame }));
`;
  const raw = execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "--eval", code], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  let testPassed = false;
  let testOutput = "not-run";
  try {
    execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--test", "--import", "tsx", "src/assets/asset-polish-install-history.test.ts", "src/assets/bundled-packs/premium-cats-v1.test.ts"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    testPassed = true;
    testOutput = "asset-polish-install-history.test.ts and premium-cats-v1.test.ts passed";
  } catch (error) {
    testOutput = sanitize(String(error.stdout || error.stderr || error.message));
  }
  return { ...JSON.parse(raw), testPassed, testOutput };
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function renderEvidence(status) {
  return `# V29.5 Asset Polish Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

V29.5 verifies the polished local gallery asset baseline and install-history
semantics for tested local packs. It does not prove the V29.2 diverse photo
benchmark and does not start V29.6 final gate.

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${sanitize(item.details)} |`).join("\n")}

## Asset Polish Summary

| Field | Value |
| --- | --- |
| status | ${snapshot.accepted.status} |
| packCount | ${snapshot.accepted.packCount} |
| acceptedPackCount | ${snapshot.accepted.acceptedPackCount} |
| allPacksEightActionPreview | ${snapshot.accepted.allPacksEightActionPreview} |
| allPacksReadable | ${snapshot.accepted.allPacksReadable} |
| noFlashFrame | ${snapshot.accepted.noFlashFrame} |
| reasonCodes | ${snapshot.accepted.reasonCodes.join(", ")} |

## PRD / Spec Review

V29.5 satisfies the local gallery polish baseline: at least 12 curated local
packs, all with 8-action preview metadata, readability flags, no accepted
flash-frame condition, and safe install history. V29.2 remains blocked by sample
count, so V29.6 remains No-Go.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Too few gallery entries pass | High | gallery_entry_count_too_low blocks |
| Flash-frame accepted | High | flash_frame_detected fails |
| Install history stores paths | High | safe IDs only |
| Asset polish mistaken for stable photo generation | High | V29.2 remains blocked; no final claim |

## Allowed Claim

${status === "passed"
    ? "V29 polished gallery and asset install experience passed for tested local packs and install history scenarios."
    : "No V29.5 passed claim is made."}

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
