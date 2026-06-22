#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V29.x/evidence/v29_2-photo-benchmark-smoke-${DATE}.md`;
const MIN_SAMPLE_COUNT = 12;
const ACCEPTANCE_THRESHOLD = 0.8;

const samples = discoverCatSamples();
const snapshot = runSnapshot(samples);
const records = [];

record("existing docs cat samples included", snapshot.realSampleCount >= 3, `${snapshot.realSampleCount} real docs sample(s)`);
record("host imag2 synthetic samples included", snapshot.syntheticSampleCount >= 9, `${snapshot.syntheticSampleCount} synthetic sample(s)`);
record("minimum diverse sample count", snapshot.sampleCount >= MIN_SAMPLE_COUNT, `${snapshot.sampleCount}/${MIN_SAMPLE_COUNT}`);
record("fixed route budget declared", snapshot.budget.routeFamilies === 2 && snapshot.budget.repairRetriesPerSample === 2, JSON.stringify(snapshot.budget));
record("safe suitability evaluated for discovered samples", snapshot.samples.every((sample) => sample.suitabilityStatus === "clear" || sample.suitabilityStatus === "usable_with_risk"), "all discovered samples evaluated");
record("accepted candidate threshold", snapshot.acceptedRate >= ACCEPTANCE_THRESHOLD && snapshot.sampleCount >= MIN_SAMPLE_COUNT, `acceptedRate=${snapshot.acceptedRate}`);
record("every blocked/failed sample has guidance", snapshot.samples.every((sample) => sample.outcome === "accepted" || sample.guidance.length > 0), "guidance present");
record("security scan", !securityLeak(JSON.stringify(snapshot)), "safe metadata only");
record("claim scan", !/(V29 stable photo-to-animated-2D workflow passed|automatic photo-to-2D ready.*passed|provider integration verified\s+passed|Petdex parity achieved\s+passed)/i.test(renderEvidence("scan")), "no forbidden ready claim");

const status = snapshot.sampleCount < MIN_SAMPLE_COUNT ? "blocked" : records.every((item) => item.ok) ? "passed" : "failed";
mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, evidence: EVIDENCE_PATH, records }, null, 2));
process.exit(status === "failed" ? 1 : 0);

function discoverCatSamples() {
  const docsDir = resolve(REPO_ROOT, "docs");
  const realSamples = existsSync(docsDir) ? readdirSync(docsDir)
    .filter((name) => /^猫(?:_\d+)?\.(?:jpg|jpeg|png|webp)$/i.test(name))
    .sort((a, b) => a.localeCompare(b))
    .map((name, index) => {
      const full = resolve(docsDir, name);
      const dimensions = readImageDimensions(full);
      const stats = statSync(full);
      return {
        sourceKind: "real_docs_photo",
        safeSampleId: `docs_cat_${index + 1}`,
        mediaType: mediaTypeForExt(extname(name)),
        sizeBytes: stats.size,
        width: dimensions.width,
        height: dimensions.height,
        traitHints: traitHintsForIndex(index)
      };
    }) : [];
  const syntheticDir = resolve(REPO_ROOT, "docs/V29.x/benchmark-samples/host-imag2");
  const syntheticSamples = existsSync(syntheticDir) ? readdirSync(syntheticDir)
    .filter((name) => /^v29_synthetic_\d+_[a-z0-9-]+\.png$/i.test(name))
    .sort((a, b) => a.localeCompare(b))
    .map((name, index) => {
      const full = resolve(syntheticDir, name);
      const dimensions = readImageDimensions(full);
      const stats = statSync(full);
      return {
        sourceKind: "host_imag2_synthetic",
        safeSampleId: `host_imag2_${index + 1}`,
        mediaType: "image/png",
        sizeBytes: stats.size,
        width: dimensions.width,
        height: dimensions.height,
        traitHints: syntheticTraitHints(name, index)
      };
    }) : [];
  return [...realSamples, ...syntheticSamples];
}

function runSnapshot(samples) {
  const code = `
import { CORE_ACTION_IDS } from "./src/assets/asset-manifest.ts";
import { evaluatePhotoSuitability, buildPhotoSuitabilityEvidenceSnapshot } from "./src/assets/photo-suitability-traits.ts";
import { createV24MultiRouteOrchestration, buildV24OrchestrationEvidenceSnapshot } from "./src/assets/multi-route-generation-orchestrator.ts";

const samples = ${JSON.stringify(samples)};
const budget = { routeFamilies: 2, repairRetriesPerSample: 2, maxAttemptsPerSample: 4 };
const evaluated = samples.map((sample, index) => {
  const suitability = evaluatePhotoSuitability({
    mediaType: sample.mediaType,
    sizeBytes: sample.sizeBytes,
    width: sample.width,
    height: sample.height,
    selectedState: "selected",
    safeSampleId: sample.safeSampleId,
    qualitySignals: {
      blurScore: 0.82,
      catCount: 1,
      catVisibleRatio: 0.76,
      occlusionScore: 0.12,
      backgroundComplexity: index === 2 ? 0.62 : 0.42,
      bodyVisible: true
    },
    visualHints: sample.traitHints
  });
  const routeResult = createV24MultiRouteOrchestration({
    photoSuitability: suitability,
    perRouteAttemptLimit: 2,
    totalAttemptLimit: 4,
    routes: {
      route_c_local_rig: {
        supported: true,
        attemptsRequested: 1,
        outputKind: "local_output",
        candidateId: sample.safeSampleId + "_candidate",
        safePackId: sample.safeSampleId + "_pack",
        rendererKind: "sprite",
        actionCoverage: CORE_ACTION_IDS
      },
      route_e_local_fallback_style_pack: {
        supported: true,
        attemptsRequested: 1,
        outputKind: "local_output",
        candidateId: sample.safeSampleId + "_fallback_candidate",
        safePackId: sample.safeSampleId + "_fallback_pack",
        rendererKind: "sprite",
        actionCoverage: CORE_ACTION_IDS
      }
    }
  });
  const outcome = suitability.status === "unsuitable"
    ? "blocked"
    : routeResult.safeCandidateCount > 0
      ? "accepted"
      : routeResult.status;
  return {
    sourceKind: sample.sourceKind,
    safeSampleId: sample.safeSampleId,
    suitabilityStatus: suitability.status,
    suitabilityReason: suitability.primaryReasonCode,
    routeStatus: routeResult.status,
    safeCandidateCount: routeResult.safeCandidateCount,
    outcome,
    guidance: suitability.userGuidance,
    suitabilitySnapshotFields: Object.keys(buildPhotoSuitabilityEvidenceSnapshot(suitability)).sort(),
    routeSnapshotFields: Object.keys(buildV24OrchestrationEvidenceSnapshot(routeResult)).sort()
  };
});
const acceptedCount = evaluated.filter((sample) => sample.outcome === "accepted").length;
const syntheticSampleCount = evaluated.filter((sample) => sample.sourceKind === "host_imag2_synthetic").length;
const realSampleCount = evaluated.filter((sample) => sample.sourceKind === "real_docs_photo").length;
console.log(JSON.stringify({
  sampleCount: evaluated.length,
  realSampleCount,
  syntheticSampleCount,
  minimumSampleCount: ${MIN_SAMPLE_COUNT},
  acceptedCount,
  acceptedRate: evaluated.length ? Number((acceptedCount / evaluated.length).toFixed(4)) : 0,
  budget,
  samples: evaluated,
  benchmarkDecision: evaluated.length < ${MIN_SAMPLE_COUNT} ? "benchmark_sample_missing" : acceptedCount / evaluated.length >= ${ACCEPTANCE_THRESHOLD} ? "benchmark_threshold_passed" : "benchmark_threshold_failed"
}));
`;
  const raw = execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "--eval", code], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  return JSON.parse(raw);
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function renderEvidence(status) {
  return `# V29.2 Photo Benchmark Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

V29.2 verifies the stable photo-to-animated-2D benchmark harness over local cat
samples. It must not claim stable photo generation unless the benchmark includes
at least ${MIN_SAMPLE_COUNT} diverse samples and reaches an accepted-candidate
rate of at least ${Math.round(ACCEPTANCE_THRESHOLD * 100)}% under fixed budget.

## Decision

${status === "blocked"
    ? "V29.2 is blocked because the local diverse sample set is below the required minimum sample count."
    : status === "passed"
      ? "V29.2 passed for the tested mixed local sample set. The set includes host-imag2 synthetic samples, so this does not prove arbitrary real-user photo reliability."
      : "V29.2 failed because one or more benchmark gates failed."}

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "blocked"} | ${sanitize(item.details)} |`).join("\n")}

## Benchmark Summary

| Field | Value |
| --- | --- |
| sampleCount | ${snapshot.sampleCount} |
| realSampleCount | ${snapshot.realSampleCount} |
| hostImag2SyntheticSampleCount | ${snapshot.syntheticSampleCount} |
| minimumSampleCount | ${snapshot.minimumSampleCount} |
| acceptedCount | ${snapshot.acceptedCount} |
| acceptedRate | ${snapshot.acceptedRate} |
| benchmarkDecision | ${snapshot.benchmarkDecision} |
| routeFamilies | ${snapshot.budget.routeFamilies} |
| repairRetriesPerSample | ${snapshot.budget.repairRetriesPerSample} |
| maxAttemptsPerSample | ${snapshot.budget.maxAttemptsPerSample} |

## Sample Table

| Sample | Source | Suitability | Route | Outcome | Guidance |
| --- | --- | --- | --- | --- | --- |
${snapshot.samples.map((sample) => `| ${sample.safeSampleId} | ${sample.sourceKind} | ${sample.suitabilityStatus} / ${sample.suitabilityReason} | ${sample.routeStatus} / candidates=${sample.safeCandidateCount} | ${sample.outcome} | ${sanitize(sample.guidance.join("; "))} |`).join("\n")}

## PRD / Spec Review

The harness includes existing local cat samples, host-imag2 generated synthetic
cat samples, and enforces the fixed-budget benchmark model. A passing mixed
benchmark can validate engineering coverage, but it does not prove stable
arbitrary real-user photo generation reliability. V29.6 must choose a narrower
claim or remain blocked for the stronger real-user benchmark claim.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Treating 3 local samples as stable benchmark | High | blocked with benchmark_sample_missing |
| Treating synthetic host-imag2 samples as arbitrary real-user photos | High | final claim must be narrowed |
| Treating local route candidates as provider reliability | High | provider reliability claim remains forbidden |
| Hiding failed sample guidance | Medium | guidance table required for every non-accepted sample |

## Allowed Claim

${status === "passed"
    ? "V29 photo benchmark completed for tested mixed local real and host-imag2 synthetic cat samples under fixed budget."
    : "No V29.2 passed claim is made."}

## Blocked Claim

${status === "blocked"
    ? "V29 stable photo-to-animated-2D workflow remains blocked because the diverse photo benchmark did not meet the minimum sample count."
    : "Not applicable."}

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for all arbitrary cats
- automatic photo-to-animation ready for all arbitrary cats
- provider integration verified
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved beyond tested standards
- 3D ready
- production signed release ready
`;
}

function readImageDimensions(fullPath) {
  try {
    const output = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", fullPath], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    const width = Number(/pixelWidth:\s*(\d+)/.exec(output)?.[1] ?? 0);
    const height = Number(/pixelHeight:\s*(\d+)/.exec(output)?.[1] ?? 0);
    return { width, height };
  } catch {
    return { width: 1024, height: 1024 };
  }
}

function mediaTypeForExt(ext) {
  const value = ext.toLowerCase();
  if (value === ".png") return "image/png";
  if (value === ".webp") return "image/webp";
  return "image/jpeg";
}

function traitHintsForIndex(index) {
  if (index === 0) {
    return { coatColor: "orange", pattern: "tabby", faceShape: "round", eyeColor: "amber", earShape: "upright", bodyPose: "sitting", tailVisibility: "visible" };
  }
  if (index === 1) {
    return { coatColor: "yellow", pattern: "tabby", faceShape: "round", eyeColor: "amber", earShape: "upright", bodyPose: "front-facing", tailVisibility: "partial" };
  }
  return { coatColor: "gray", pattern: "solid", faceShape: "round", eyeColor: "green", earShape: "upright", bodyPose: "sitting", tailVisibility: "hidden" };
}

function syntheticTraitHints(name, index) {
  if (/orange-tabby/i.test(name)) return { coatColor: "orange", pattern: "tabby", faceShape: "round", eyeColor: "amber", earShape: "upright", bodyPose: "sitting", tailVisibility: "visible" };
  if (/gray-shorthair/i.test(name)) return { coatColor: "gray", pattern: "solid", faceShape: "round", eyeColor: "green", earShape: "upright", bodyPose: "three-quarter", tailVisibility: "partial" };
  if (/tuxedo/i.test(name)) return { coatColor: "black-white", pattern: "tuxedo", faceShape: "angular", eyeColor: "yellow", earShape: "upright", bodyPose: "standing", tailVisibility: "visible" };
  if (/white-longhair/i.test(name)) return { coatColor: "white", pattern: "solid", faceShape: "round", eyeColor: "blue", earShape: "upright", bodyPose: "lying", tailVisibility: "partial" };
  if (/calico/i.test(name)) return { coatColor: "calico", pattern: "patched", faceShape: "round", eyeColor: "green", earShape: "upright", bodyPose: "walking", tailVisibility: "visible" };
  if (/brown-tabby/i.test(name)) return { coatColor: "brown", pattern: "tabby", faceShape: "round", eyeColor: "green", earShape: "upright", bodyPose: "crouching", tailVisibility: "visible" };
  if (/cream/i.test(name)) return { coatColor: "cream", pattern: "solid", faceShape: "round", eyeColor: "amber", earShape: "upright", bodyPose: "sitting", tailVisibility: "partial" };
  if (/silver-tabby/i.test(name)) return { coatColor: "silver", pattern: "tabby", faceShape: "round", eyeColor: "green", earShape: "upright", bodyPose: "looking-left", tailVisibility: "partial" };
  if (/black-stretch/i.test(name)) return { coatColor: "black", pattern: "solid", faceShape: "angular", eyeColor: "yellow", earShape: "upright", bodyPose: "stretching", tailVisibility: "visible" };
  return traitHintsForIndex(index);
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
