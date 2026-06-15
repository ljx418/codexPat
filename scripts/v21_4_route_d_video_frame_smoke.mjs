#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V21.x/evidence/v21_4-route-d-video-frame-smoke-${DATE}.md`;
const records = [];

const candidateDirs = [
  "docs/V21.x/evidence/assets/video-fixtures",
  "docs/V21.x/fixtures/video",
  "docs/V20.x/evidence/assets/video"
];

record("V21.0 evidence exists", existsSync(resolve(REPO_ROOT, `docs/V21.x/evidence/v21_0-scope-freeze-${DATE}.md`)), "V21.4 requires V21.0 scope-freeze evidence");
record("Route D spec exists", existsSync(resolve(REPO_ROOT, "docs/V21.x/v21_4-route-d-video-frame-spec.md")), "image-to-video frame route spec");

const safeVideos = findSafeVideos();
record("safe explicit-consent video source available", safeVideos.length > 0, safeVideos.length ? safeVideos.join(", ") : "video_source_missing");
record("no unlicensed video used", true, "no third-party video or screen recording is consumed in this run");
record("previous active pack preserved", true, "no extraction, activation, or live pet mutation attempted");
record("security scan", securityScan(), "no token, Authorization, raw provider response, screen text, full local path, prompt private text");
record("claim scan", claimScan(), "Route D excluded/blocked does not imply image-to-video readiness or V21 final passed");

const status = safeVideos.length > 0 ? "blocked" : "excluded";
mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status, safeVideos), "utf8");

console.log(JSON.stringify({ ok: false, status, evidence: EVIDENCE_PATH, safeVideos, records }, null, 2));
process.exit(0);

function findSafeVideos() {
  const videos = [];
  for (const dir of candidateDirs) {
    const full = resolve(REPO_ROOT, dir);
    if (!existsSync(full)) continue;
    for (const entry of readdirSync(full, { withFileTypes: true })) {
      if (entry.isFile() && [".mp4", ".mov", ".webm"].includes(extname(entry.name).toLowerCase())) {
        videos.push(entry.name);
      }
    }
  }
  return videos.filter((name) => /^[a-z0-9][a-z0-9._-]{0,95}\.(mp4|mov|webm)$/i.test(name));
}

function securityScan() {
  const text = safeRead("docs/V21.x/v21_4-route-d-video-frame-spec.md");
  return !/(Authorization\s*[:=]|api-token\.json\s*[:=]|\/Users\/[^\s`|)]+|\/private\/[^\s`|)]+|sk-[A-Za-z0-9_-]{8,}|raw provider response\s*[:=]|screen text contents\s*[:=]|prompt private text\s*[:=])/i.test(text);
}

function claimScan() {
  const text = safeRead("docs/V21.x/v21_x-claim-matrix.md") + "\n" + safeRead("docs/V21.x/v21_4-route-d-video-frame-spec.md");
  return !/(image-to-video.*ready\s+passed|V21 final passed\s*$|provider integration verified\s+passed|Petdex parity achieved\s+passed)/im.test(text);
}

function safeRead(path) {
  const full = resolve(REPO_ROOT, path);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function renderEvidence(status, safeVideos) {
  return `# V21.4 Route D Image-to-video Frame Evidence

status: ${status}
date: ${DATE}

## Scope

V21.4 checks whether a safe image-to-video or local video fixture source exists
for frame extraction. This run does not call a video provider and does not use
unlicensed videos or screen recordings.

## Source Decision

| Field | Value |
| --- | --- |
| route | route_d_video |
| safeVideoSourceCount | ${safeVideos.length} |
| decision | ${status === "excluded" ? "route_d_excluded" : "video_source_present_but_not_processed"} |

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "blocked/excluded"} | ${sanitize(item.details)} |`).join("\n")}

## PRD / Spec Review

Route D remains a valid future path, but V21 cannot claim image-to-video frame
extraction without an explicit-consent provider output, licensed local fixture,
or project-owned generated test video. The route is ${status} for this run.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Video route silently skipped | High | explicit ${status} evidence generated |
| Unlicensed or private screen recording used | High | no video consumed |
| V21 final claims video path | High | forbidden by claim scan |

## Allowed Claim

V21 Route D image-to-video frame extraction is ${status} for this run because no accepted safe video source was processed.

## Forbidden Claims

- image-to-video animation route passed
- provider integration verified
- V21 final passed
- Petdex parity achieved
`;
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
