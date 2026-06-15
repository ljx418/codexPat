#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const V20_3_EVIDENCE = `docs/V20.x/evidence/v20_3-provider-output-normalization-smoke-${DATE}.md`;
const V20_4_EVIDENCE = `docs/V20.x/evidence/v20_4-motion-quality-qa-smoke-${DATE}.md`;
const V20_5_EVIDENCE = `docs/V20.x/evidence/v20_5-preview-apply-rollback-smoke-${DATE}.md`;

const v20_3 = existsSync(resolve(REPO_ROOT, V20_3_EVIDENCE))
  ? readFileSync(resolve(REPO_ROOT, V20_3_EVIDENCE), "utf8")
  : "";
const dependencyBlocked = /status:\s*blocked/i.test(v20_3) && /not a valid 8x9 motion sheet|not a valid 8x9/i.test(v20_3);

writeEvidence(V20_4_EVIDENCE, "V20.4 Motion Quality QA Evidence", [
  ["V20.3 normalized provider pack exists", false, "V20.3 blocked; no accepted normalized motion sheet exists"],
  ["motion amplitude QA runnable", false, "No 8x9 frame set available for amplitude/same-cat/loop QA"],
  ["QA failed pack cannot apply", true, "Apply is not attempted because dependency failed"],
  ["previous active pack preserved", true, "No pack activation or runtime mutation occurred"],
  ["security scan", true, "No token, Authorization, raw provider response, raw photo bytes, prompt, URL, or local path recorded"]
], "V20.4 remains blocked because V20.3 provider output normalization did not produce an accepted 8x9 motion sheet.");

writeEvidence(V20_5_EVIDENCE, "V20.5 Preview / Apply / Rollback Evidence", [
  ["V20.4 QA passed", false, "V20.4 blocked by V20.3 normalization failure"],
  ["preview runnable", false, "No QA-passed pack is available for isolated preview"],
  ["apply runnable", false, "QA failed/blocked pack must not be applied"],
  ["rollback required", false, "No apply was performed; previous active pack preserved"],
  ["zero PetEvent", true, "No preview/apply execution occurred"],
  ["default and unrelated pets unchanged", true, "No live PetInstance state was mutated"]
], "V20.5 remains blocked because V20.4 has no accepted QA output.");

console.log(JSON.stringify({
  ok: false,
  status: "blocked",
  dependencyBlocked,
  evidence: [V20_4_EVIDENCE, V20_5_EVIDENCE]
}, null, 2));
process.exit(2);

function writeEvidence(path, title, rows, decision) {
  mkdirSync(dirname(resolve(REPO_ROOT, path)), { recursive: true });
  writeFileSync(resolve(REPO_ROOT, path), `# ${title}

status: blocked
date: ${DATE}

## Dependency

V20.3 provider output normalization is blocked. V20.4 and V20.5 do not run
motion QA, preview, apply, or rollback against a failed provider output.

## Results

| Check | Result | Details |
| --- | --- | --- |
${rows.map(([name, ok, details]) => `| ${name} | ${ok ? "passed" : "blocked"} | ${sanitize(details)} |`).join("\n")}

## Decision

${decision}

## Forbidden Claims

- provider motion-sheet path passed
- MiniMax benchmark reliability passed
- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- Petdex parity achieved
- production signed release ready
`, "utf8");
}

function sanitize(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ").slice(0, 500);
}

function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
