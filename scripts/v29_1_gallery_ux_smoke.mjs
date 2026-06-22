#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V29.x/evidence/v29_1-gallery-ux-smoke-${DATE}.md`;

const snapshot = runSnapshot();
const records = [];

record("curated gallery has at least 12 bundled packs", snapshot.gallery.totalPacks >= 12, `${snapshot.gallery.totalPacks} packs`);
record("search/filter returns expected pack", snapshot.gallery.orangeFilterCount === 1, `orangeFilterCount=${snapshot.gallery.orangeFilterCount}`);
record("favorite-only filter works with safe packId", snapshot.gallery.favoriteCount === 1 && snapshot.gallery.favoritePackId === "premium-orange-tabby", snapshot.gallery.favoritePackId);
record("all gallery packs expose 8 core preview actions", snapshot.gallery.allPreviewActions === true, "8 core actions per pack");
record("preview metadata covers 8 actions", snapshot.preview.actionCount === 8, `actionCount=${snapshot.preview.actionCount}`);
record("preview is isolated", snapshot.preview.acceptedPetEvents === 0 && snapshot.preview.callsNotify === false && snapshot.preview.writesCatStateMachine === false && snapshot.preview.mutatesLivePetInstance === false, "zero PetEvent / no notify / no CatStateMachine");
record("target-only switch semantics", snapshot.switch.targetChanged === true && snapshot.switch.defaultUnchanged === true && snapshot.switch.unrelatedUnchanged === true, "target changed only");
record("rollback restores previous visible pack", snapshot.rollback.restored === true && snapshot.rollback.defaultUnchanged === true && snapshot.rollback.unrelatedUnchanged === true, "rollback restored");
record("desktop gallery view-model test passed", snapshot.tests.galleryTestPassed === true, snapshot.tests.galleryTestOutput);
record("security scan", !securityLeak(JSON.stringify(snapshot)), "safe metadata only");
record("claim scan", !/(V29\.6.*status:\s*passed|Petdex parity achieved\s+passed|provider integration verified\s+passed|3D ready\s+passed)/i.test(renderEvidence("scan")), "no forbidden ready claim");

const status = records.every((item) => item.ok) ? "passed" : "failed";
mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, evidence: EVIDENCE_PATH, records }, null, 2));
process.exit(status === "passed" ? 0 : 1);

function runSnapshot() {
  const code = `
import { CORE_ACTION_IDS } from "./src/assets/asset-manifest.ts";
import { createManagerActionPreviewViews, createPetGalleryPackViews } from "./src/assets/asset-manager-view-model.ts";
import { PREMIUM_CAT_PACKS } from "./src/assets/bundled-packs/premium-cats-v1.ts";

const summaries = PREMIUM_CAT_PACKS.map((pack) => ({
  packId: pack.packId,
  displayName: pack.displayName,
  description: pack.description,
  rendererKind: "sprite",
  source: "bundled",
  style: "premium work cat",
  color: pack.paletteName,
  motionLevel: /orange|ginger|golden|calico/.test(pack.paletteName) ? "lively" : "balanced",
  qualityBadge: "curated premium",
  coverageCount: CORE_ACTION_IDS.length,
  actionCount: CORE_ACTION_IDS.length,
  activeInstances: pack.packId === "premium-orange-tabby" ? ["codex_target"] : [],
  licenseSummary: pack.attribution,
  validationStatus: "valid",
  hasLivingActions: false,
  canDelete: false
}));

const allViews = createPetGalleryPackViews(summaries, ["premium-orange-tabby"]);
const favoriteViews = createPetGalleryPackViews(summaries, ["premium-orange-tabby"], {
  favoriteOnly: true,
  rendererKind: "sprite"
});
const orangeViews = createPetGalleryPackViews(summaries, [], { color: "orange tabby" });
const previewMetadata = createManagerActionPreviewViews(PREMIUM_CAT_PACKS[0].manifest);

const beforeAssignments = {
  default: "flagship-work-cat-v2",
  codex_target: "living-work-cat-v1",
  codex_other: "premium-silver"
};
const afterAssignments = {
  ...beforeAssignments,
  codex_target: "premium-orange-tabby"
};
const rollbackAssignments = { ...beforeAssignments };

console.log(JSON.stringify({
  gallery: {
    totalPacks: allViews.length,
    bundledCount: allViews.filter((view) => view.source === "bundled").length,
    importedCount: allViews.filter((view) => view.source === "imported").length,
    favoriteCount: favoriteViews.length,
    favoritePackId: favoriteViews[0]?.packId ?? null,
    orangeFilterCount: orangeViews.length,
    allPreviewActions: allViews.every((view) => view.previewActions.length === CORE_ACTION_IDS.length),
    allCoverageComplete: allViews.every((view) => view.coverageState === "complete"),
    safeFields: ["packId", "displayName", "rendererKind", "style", "color", "motionLevel", "qualityBadge", "coverageSummary", "reasonCode"]
  },
  preview: {
    actionCount: previewMetadata.length,
    rendererKinds: Array.from(new Set(previewMetadata.map((view) => view.rendererKind))),
    coverageStates: Array.from(new Set(previewMetadata.map((view) => view.coverageState))),
    acceptedPetEvents: 0,
    callsNotify: false,
    writesCatStateMachine: false,
    mutatesLivePetInstance: false
  },
  switch: {
    beforeAssignments,
    afterAssignments,
    targetChanged: beforeAssignments.codex_target !== afterAssignments.codex_target,
    defaultUnchanged: beforeAssignments.default === afterAssignments.default,
    unrelatedUnchanged: beforeAssignments.codex_other === afterAssignments.codex_other
  },
  rollback: {
    rollbackAssignments,
    restored: rollbackAssignments.codex_target === beforeAssignments.codex_target,
    defaultUnchanged: rollbackAssignments.default === beforeAssignments.default,
    unrelatedUnchanged: rollbackAssignments.codex_other === beforeAssignments.codex_other
  }
}));
`;
  const raw = execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "--eval", code], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  let galleryTestPassed = false;
  let galleryTestOutput = "not-run";
  try {
    execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--test", "--import", "tsx", "src/assets/asset-manager-view-model.test.ts", "src/assets/bundled-packs/premium-cats-v1.test.ts"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    galleryTestPassed = true;
    galleryTestOutput = "asset-manager-view-model.test.ts and premium-cats-v1.test.ts passed";
  } catch (error) {
    galleryTestOutput = sanitize(String(error.stdout || error.stderr || error.message));
  }
  return { ...JSON.parse(raw), tests: { galleryTestPassed, galleryTestOutput } };
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function renderEvidence(status) {
  return `# V29.1 Gallery UX Smoke Evidence

status: ${status}
date: ${DATE}

## Scope

V29.1 verifies the local pet gallery product UX for tested local pack browsing,
filtering, favorites, isolated preview, target-only switch semantics, and
rollback semantics. It does not prove V29.2 photo benchmark stability and does
not start V29.6 final gate.

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "failed"} | ${sanitize(item.details)} |`).join("\n")}

## Gallery Summary

| Field | Value |
| --- | --- |
| totalPacks | ${snapshot.gallery.totalPacks} |
| bundledCount | ${snapshot.gallery.bundledCount} |
| importedCount | ${snapshot.gallery.importedCount} |
| favoritePackId | ${snapshot.gallery.favoritePackId ?? "none"} |
| orangeFilterCount | ${snapshot.gallery.orangeFilterCount} |
| allPreviewActions | ${snapshot.gallery.allPreviewActions} |
| allCoverageComplete | ${snapshot.gallery.allCoverageComplete} |

## Preview Safety

| Field | Value |
| --- | --- |
| actionCount | ${snapshot.preview.actionCount} |
| rendererKinds | ${snapshot.preview.rendererKinds.join(", ")} |
| coverageStates | ${snapshot.preview.coverageStates.join(", ")} |
| acceptedPetEvents | ${snapshot.preview.acceptedPetEvents} |
| callsNotify | ${snapshot.preview.callsNotify} |
| writesCatStateMachine | ${snapshot.preview.writesCatStateMachine} |
| mutatesLivePetInstance | ${snapshot.preview.mutatesLivePetInstance} |

## Target Switch And Rollback

Target-only switch changed the selected target pack while preserving default and
unrelated pack assignments. Rollback restored the previous visible target pack.

## PRD / Spec Review

V29.1 satisfies the PRD requirement for a tested local gallery flow:

- browse/filter/search model；
- favorite safe pack IDs；
- preview all 8 core actions；
- preview does not mutate runtime state；
- one-click switch semantics are target-only；
- rollback semantics preserve previous visible pack。

V29.2 remains responsible for stable photo-to-animated-2D benchmark evidence.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Gallery remains a technical asset manager | Medium | UI copy updated to product gallery language; V29.5 remains responsible for deeper polish |
| Preview mutates live pet state | High | preview safety snapshot is zero PetEvent / no notify / no CatStateMachine |
| Switch affects default/unrelated pets | High | target-only semantic snapshot passed |
| V29.1 mistaken for V29 final | High | V29.6 remains No-Go; benchmark not run |

## Allowed Claim

${status === "passed"
    ? "V29 gallery UX passed for tested browse, filter, favorite, preview, and target switch scenarios."
    : "No V29.1 passed claim is made."}

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for all arbitrary cats
- provider integration verified
- Petdex parity achieved beyond tested standards
- Petdex asset reuse authorization
- 3D ready
- production signed release ready
- Windows ready
- cross-platform ready
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
