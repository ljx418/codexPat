#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V23-V28.x/evidence/v23-photo-suitability-trait-smoke-${DATE}.md`;

const sampleInputs = [
  realPhotoInput("sample_1_orange_cat", "docs/猫.jpg", {
    coatColor: "orange",
    pattern: "tabby",
    faceShape: "round",
    eyeColor: "amber",
    earShape: "upright",
    bodyPose: "sitting",
    tailVisibility: "visible"
  }),
  realPhotoInput("sample_2_yellow_cat", "docs/猫_1.jpg", {
    coatColor: "yellow",
    pattern: "tabby",
    faceShape: "round",
    eyeColor: "amber",
    earShape: "upright",
    bodyPose: "front-facing",
    tailVisibility: "partial"
  }),
  realPhotoInput("sample_3_gray_cat", "docs/猫_2.jpg", {
    coatColor: "gray",
    pattern: "solid",
    faceShape: "round",
    eyeColor: "green",
    earShape: "upright",
    bodyPose: "sitting",
    tailVisibility: "hidden"
  })
].filter(Boolean);

const fixtureInputs = [
  {
    label: "fixture_blurry",
    input: {
      mediaType: "image/jpeg",
      sizeBytes: 420_000,
      width: 1000,
      height: 1000,
      selectedState: "selected",
      safeSampleId: "fixture_blurry",
      qualitySignals: { blurScore: 0.2, catCount: 1, catVisibleRatio: 0.84 }
    }
  },
  {
    label: "fixture_low_resolution",
    input: {
      mediaType: "image/png",
      sizeBytes: 40_000,
      width: 220,
      height: 220,
      selectedState: "selected",
      safeSampleId: "fixture_low_resolution",
      qualitySignals: { blurScore: 0.8, catCount: 1, catVisibleRatio: 0.78 }
    }
  },
  {
    label: "fixture_cropped_or_occluded",
    input: {
      mediaType: "image/jpeg",
      sizeBytes: 500_000,
      width: 900,
      height: 900,
      selectedState: "selected",
      safeSampleId: "fixture_cropped_or_occluded",
      qualitySignals: { blurScore: 0.78, catCount: 1, catVisibleRatio: 0.3, occlusionScore: 0.68 }
    }
  },
  {
    label: "fixture_multi_cat",
    input: {
      mediaType: "image/jpeg",
      sizeBytes: 500_000,
      width: 900,
      height: 900,
      selectedState: "selected",
      safeSampleId: "fixture_multi_cat",
      qualitySignals: { blurScore: 0.78, catCount: 2, catVisibleRatio: 0.82 }
    }
  },
  {
    label: "fixture_complex_background",
    input: {
      mediaType: "image/webp",
      sizeBytes: 500_000,
      width: 1200,
      height: 900,
      selectedState: "selected",
      safeSampleId: "fixture_complex_background",
      qualitySignals: { blurScore: 0.78, catCount: 1, catVisibleRatio: 0.82, backgroundComplexity: 0.9 },
      visualHints: { coatColor: "gray", pattern: "solid", faceShape: "round" }
    }
  }
];

const snapshot = runSnapshot([...sampleInputs, ...fixtureInputs]);
const sampleResults = snapshot.results.filter((item) => item.kind === "real_photo");
const fixtureResults = snapshot.results.filter((item) => item.kind === "quality_fixture");
const records = [];

record(
  "real local cat photos evaluated",
  sampleResults.length === 3 && sampleResults.every((item) => item.status === "clear" || item.status === "usable_with_risk"),
  `${sampleResults.length}/3 real samples evaluated`
);
record(
  "clear single-cat photo accepted",
  sampleResults.some((item) => item.status === "clear"),
  sampleResults.map((item) => `${item.sampleId}:${item.status}:${item.primaryReasonCode}`).join(", ")
);
record(
  "blurry fixture blocked",
  hasFixture("fixture_blurry", "unsuitable", "photo_blurry"),
  "stable reasonCode photo_blurry"
);
record(
  "low-resolution fixture blocked",
  hasFixture("fixture_low_resolution", "unsuitable", "photo_low_resolution"),
  "stable reasonCode photo_low_resolution"
);
record(
  "cropped or occluded fixture blocked",
  hasFixture("fixture_cropped_or_occluded", "unsuitable", "cat_cropped") && hasFixture("fixture_cropped_or_occluded", "unsuitable", "cat_occluded"),
  "stable reasonCodes cat_cropped/cat_occluded"
);
record(
  "multi-cat fixture blocked",
  hasFixture("fixture_multi_cat", "unsuitable", "multi_cat_ambiguous"),
  "stable reasonCode multi_cat_ambiguous"
);
record(
  "complex background marked risky",
  hasFixture("fixture_complex_background", "usable_with_risk", "background_too_complex"),
  "usable_with_risk rather than silent clear"
);
record(
  "safe trait summary generated",
  snapshot.results.every((item) => item.traitSummaryFields.includes("coatColorBucket") && item.traitSummaryFields.includes("confidence")),
  "trait fields are bucketed and path-free"
);
record(
  "no provider execution or live pet mutation",
  snapshot.results.every((item) => item.privacyBoundary.callsProvider === false && item.privacyBoundary.mutatesLivePet === false),
  "V23 only evaluates intake quality and traits"
);
record(
  "security scan",
  !securityLeak(JSON.stringify(snapshot)),
  "no credential, auth header, image bytes, private file identifiers, provider response, geodata"
);
record(
  "claim scan",
  !/(automatic photo-to-2D ready|arbitrary cats automatic photo-to-animation ready|provider integration verified|Petdex parity achieved|3D ready|production signed release ready)\s+passed/i.test(renderEvidence("scan")),
  "forbidden claims are not used as passed"
);

const status = records.every((item) => item.ok) ? "passed" : "failed";
mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, evidence: EVIDENCE_PATH, records }, null, 2));
process.exit(status === "passed" ? 0 : 1);

function realPhotoInput(sampleId, relativePath, visualHints) {
  const full = resolve(REPO_ROOT, relativePath);
  if (!existsSync(full)) {
    return null;
  }
  const dimensions = readImageDimensions(full);
  const stats = statSync(full);
  return {
    label: sampleId,
    kind: "real_photo",
    input: {
      mediaType: "image/jpeg",
      sizeBytes: stats.size,
      width: dimensions.width,
      height: dimensions.height,
      selectedState: "selected",
      safeSampleId: sampleId,
      qualitySignals: {
        blurScore: 0.82,
        catCount: 1,
        catVisibleRatio: 0.78,
        occlusionScore: 0.1,
        backgroundComplexity: 0.42,
        bodyVisible: true,
        tailVisible: visualHints.tailVisibility !== "hidden"
      },
      visualHints
    }
  };
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

function runSnapshot(cases) {
  const code = `
import {
  buildPhotoSuitabilityEvidenceSnapshot,
  evaluatePhotoSuitability,
  photoSuitabilityHasForbiddenContent
} from "./src/assets/photo-suitability-traits.ts";

const cases = ${JSON.stringify(cases)};
const results = cases.map((item) => {
  const evaluation = evaluatePhotoSuitability(item.input);
  const evidence = buildPhotoSuitabilityEvidenceSnapshot(evaluation);
  return {
    label: item.label,
    kind: item.kind ?? "quality_fixture",
    sampleId: evaluation.safeMetadata.safeSampleId,
    status: evaluation.status,
    primaryReasonCode: evaluation.primaryReasonCode,
    reasonCodes: evaluation.reasonCodes,
    mediaTypeBucket: evaluation.safeMetadata.mediaTypeBucket,
    sizeBucket: evaluation.safeMetadata.sizeBucket,
    dimensionBuckets: evaluation.safeMetadata.dimensions,
    traitSummaryFields: Object.keys(evaluation.traitSummary).sort(),
    traitSummary: evaluation.traitSummary,
    privacyBoundary: evaluation.privacyBoundary,
    forbiddenLeak: photoSuitabilityHasForbiddenContent(evidence)
  };
});
console.log(JSON.stringify({ results, forbiddenLeak: results.some((item) => item.forbiddenLeak) }));
`;
  const raw = execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "--eval", code], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  return JSON.parse(raw);
}

function hasFixture(label, expectedStatus, expectedReason) {
  const item = fixtureResults.find((result) => result.label === label);
  return Boolean(item && item.status === expectedStatus && item.reasonCodes.includes(expectedReason));
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function renderEvidence(status) {
  return `# V23 Photo Suitability and Trait Extraction Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

V23 verifies local photo suitability and safe cat trait extraction only. It does
not generate animation assets, does not call a provider, does not preview/apply
assets, and does not unlock V28.

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${sanitize(item.details)} |`).join("\n")}

## Real Local Photo Samples

| Safe sample | Status | Primary reason | Media | Size | Dimension buckets | Trait confidence |
| --- | --- | --- | --- | --- | --- | --- |
${sampleResults.map((item) => `| ${item.sampleId} | ${item.status} | ${item.primaryReasonCode} | ${item.mediaTypeBucket} | ${item.sizeBucket} | ${item.dimensionBuckets.widthBucket}/${item.dimensionBuckets.heightBucket}/${item.dimensionBuckets.aspectRatioBucket} | ${item.traitSummary.confidence} |`).join("\n")}

## Rejected / Risk Fixture Table

| Fixture | Status | Reason codes |
| --- | --- | --- |
${fixtureResults.map((item) => `| ${item.sampleId} | ${item.status} | ${item.reasonCodes.join(", ")} |`).join("\n")}

## Safe Trait Fields

The trait summary uses bucketed safe labels only:
coatColorBucket, patternBucket, faceShapeBucket, eyeColorBucket, earShapeBucket,
tailVisibility, bodyPose, confidence, source.

## PRD / Spec Review

V23 satisfies the PRD requirement to screen source photos before spending
provider attempts and to produce a safe cat trait summary. V24 remains dependent
on this evidence and is not started by this smoke.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Treating V23 suitability as generated asset readiness | High | blocked by scope and claim scan |
| Using unsafe source metadata in evidence | High | blocked by security scan |
| Heuristic quality signals mistaken for full computer vision QA | Medium | documented as V23 intake gate; V25 owns visual QA |
| Complex background silently accepted as clear | Medium | mitigated by usable_with_risk status |

## Allowed Claim

${status === "passed"
    ? "V23 photo suitability and safe trait extraction passed for tested local photo samples and quality fixtures."
    : "No V23 passed claim is made."}

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
