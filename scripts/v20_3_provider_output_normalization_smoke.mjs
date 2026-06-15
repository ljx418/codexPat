#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V20.x/evidence/v20_3-provider-output-normalization-smoke-${DATE}.md`;
const records = [];

const providerImages = findLatestProviderImages();
record("provider output files exist", providerImages.length >= 3, providerImages.length ? `fileNames=${providerImages.map((item) => basename(item)).join(", ")}` : "no V20.2 provider output files found");

let analyses = [];
if (providerImages.length) {
  analyses = providerImages.map((providerImage) => ({ fileName: basename(providerImage), ...analyzeProviderImage(providerImage) }));
  record("image dimensions readable", analyses.every((item) => item.width > 0 && item.height > 0), analyses.map((item) => `${item.fileName}:${item.width}x${item.height}`).join("; "));
  record("8x9 row coverage", analyses.every((item) => item.rowCoveragePassed), analyses.map((item) => `${item.fileName}:rows=${item.rowsWithEnoughFrames}/8`).join("; "));
  record("all expected grid cells nonblank", analyses.every((item) => item.nonblankCellCount >= 72), analyses.map((item) => `${item.fileName}:cells=${item.nonblankCellCount}/72`).join("; "));
  record("background gate", analyses.every((item) => item.hasAlpha || item.whiteBackgroundRatio > 0.5), analyses.map((item) => `${item.fileName}:alpha=${item.hasAlpha},white=${item.whiteBackgroundRatio}`).join("; "));
  record("safe generated file names only", providerImages.every((item) => !/[\\/]|https?:|file:|sk-|Authorization/i.test(basename(item))), providerImages.map((item) => basename(item)).join(", "));
}

record("operator visual review", false, "generated outputs are concept/multi-pose sheets or repeated-pose grids, not accepted 8x9 per-action motion sheets; sample 1 also shows different-cat identity drift");
record("previous active pack preserved", true, "no activation attempted after provider output normalization failed");

const status = "blocked";
mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({ ok: false, status, evidence: EVIDENCE_PATH, analyses, records }, null, 2));
process.exit(2);

function findLatestProviderImages() {
  const root = resolve(REPO_ROOT, "docs/V20.x/evidence/assets");
  if (!existsSync(root)) {
    return [];
  }
  const allFiles = [];
  walk(root, allFiles);
  const sampleFiles = allFiles
    .filter((path) => /v20-minimax-motion-sheet/.test(path) && /sample_\d+-minimax-motion-sheet-\d+\.(png|jpe?g|webp)$/i.test(path));
  const byDir = new Map();
  for (const file of sampleFiles) {
    const dir = dirname(file);
    const current = byDir.get(dir) ?? [];
    current.push(file);
    byDir.set(dir, current);
  }
  let latest = [];
  let latestTime = -1;
  for (const [dir, files] of byDir.entries()) {
    const time = statSync(dir).mtimeMs;
    if (time > latestTime) {
      latestTime = time;
      latest = files;
    }
  }
  return latest.sort();
}

function walk(dir, files) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(path, files);
    } else {
      files.push(path);
    }
  }
}

function analyzeProviderImage(path) {
  const code = `
from PIL import Image
import json, sys
p = sys.argv[1]
im = Image.open(p)
mode = im.mode
rgba = im.convert("RGBA")
w, h = rgba.size
rows, cols = 8, 9
nonblank = 0
row_counts = []
white_pixels = 0
total_pixels = w * h
has_alpha = False
for px in rgba.getdata():
    if px[3] < 250:
        has_alpha = True
    if px[3] > 10 and px[0] > 238 and px[1] > 238 and px[2] > 238:
        white_pixels += 1
for r in range(rows):
    row_nonblank = 0
    for c in range(cols):
        box = (int(c*w/cols), int(r*h/rows), int((c+1)*w/cols), int((r+1)*h/rows))
        crop = rgba.crop(box)
        pix = list(crop.getdata())
        changed = 0
        for px in pix:
            if px[3] > 10 and (px[0] < 238 or px[1] < 238 or px[2] < 238):
                changed += 1
        ratio = changed / max(1, len(pix))
        if ratio > 0.03:
            nonblank += 1
            row_nonblank += 1
    row_counts.append(row_nonblank)
print(json.dumps({
    "width": w,
    "height": h,
    "mode": mode,
    "expectedRows": rows,
    "expectedColumns": cols,
    "nonblankCellCount": nonblank,
    "rowNonblankCounts": row_counts,
    "rowsWithEnoughFrames": sum(1 for count in row_counts if count >= 8),
    "rowCoveragePassed": all(count >= 8 for count in row_counts),
    "hasAlpha": has_alpha,
    "whiteBackgroundRatio": round(white_pixels / max(1, total_pixels), 4)
}))
`;
  const raw = execFileSync("/usr/bin/python3", ["-c", code, path], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  return JSON.parse(raw);
}

function renderEvidence(status) {
  return `# V20.3 Provider Output Normalization Evidence

status: ${status}
date: ${DATE}

## Scope

V20.3 validates whether the V20.2 MiniMax provider output can be normalized as a
single 8x9 same-cat motion sheet. It does not apply or activate any asset when
normalization fails.

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "blocked/failed"} | ${sanitize(item.details)} |`).join("\n")}

## Provider Output Summary

| Field | Value |
| --- | --- |
| safeFileName | ${providerImages.length ? providerImages.map((item) => basename(item)).join(", ") : "none"} |
| dimensions | ${analyses.length ? analyses.map((item) => `${item.fileName}:${item.width}x${item.height}`).join("; ") : "not-run"} |
| expectedGrid | 8 rows x 9 columns |
| nonblankCells | ${analyses.length ? analyses.map((item) => `${item.fileName}:${item.nonblankCellCount}/72`).join("; ") : "0/72"} |
| rowNonblankCounts | ${analyses.length ? analyses.map((item) => `${item.fileName}:${item.rowNonblankCounts.join("/")}`).join("; ") : "not-run"} |
| statusReason | provider_output_not_parseable_as_8x9_motion_sheet |

## PRD / Spec Review

The generated MiniMax image did not satisfy the V20 target architecture contract
for provider output normalization. V20.4 motion QA and V20.5 preview/apply are
No-Go until V20.3 receives an accepted normalized motion sheet.

## Allowed Claim

V20.3 provider output normalization is blocked because the tested MiniMax output
is not a valid 8x9 motion sheet.

## Forbidden Claims

- provider motion-sheet path passed
- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- Petdex parity achieved
- production signed release ready
`;
}

function record(name, ok, details) {
  records.push({ name, ok, details });
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
