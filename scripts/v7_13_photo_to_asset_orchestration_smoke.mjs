import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPhotoIntakePrivacySession,
  buildPhotoIntakeEvidenceSnapshot,
  photoIntakeHasForbiddenContent
} from "../apps/desktop/src/assets/photo-intake-privacy-boundary.ts";
import {
  generateLocalTraitPromptPack,
  localTraitPromptPackHasForbiddenContent
} from "../apps/desktop/src/assets/local-trait-prompt-pack.ts";
import {
  createPhotoToAssetOrchestrationSummary,
  photoToAssetOrchestrationHasForbiddenContent
} from "../apps/desktop/src/assets/photo-to-asset-orchestration.ts";
import {
  activateAssetPack,
  importAssetPack,
  listAssetPacks
} from "../packages/petctl/src/assets.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(REPO_ROOT);

const EVIDENCE_PATH = "docs/V7.13/evidence/v7_13-photo-to-asset-orchestration-smoke-2026-06-01.md";
const TARGET_SPRITE = "codex_v713_sprite";
const TARGET_GLTF = "codex_v713_gltf";
const UNRELATED = "codex_v713_unrelated";
const cases = [];

record("desktop V7.13 unit coverage", run(["pnpm", "--filter", "desktop", "test"]));
record("desktop typecheck", run(["pnpm", "--filter", "desktop", "check"]));

const fixtureImage = "fixtures/manual/visual-assets/imported-static-orange-tabby-v1/idle.png";
const photoStats = statSync(fixtureImage);
const photoSession = createPhotoIntakePrivacySession({
  catName: "V7.13 Orange Tabby",
  approvedTraits: "orange tabby, amber eyes, white chest, curled tail, playful desktop companion",
  photo: {
    fileName: "cat-reference.png",
    mediaType: "image/png",
    sizeBytes: photoStats.size
  },
  localReferenceConsent: true
});
const photoEvidence = buildPhotoIntakeEvidenceSnapshot(photoSession);
recordDecision(
  "photo privacy boundary",
  photoSession.status === "accepted" && photoSession.reasonCode === "photo_privacy_boundary_ok" && !photoIntakeHasForbiddenContent({ photoEvidence }),
  `reasonCode=${photoSession.reasonCode}; safeFields=${photoEvidence.safePhotoFields.join(",")}`
);

const traitPack = generateLocalTraitPromptPack({
  catName: "V7.13 Orange Tabby",
  coat: "orange tabby",
  markings: "white chest and soft tabby stripes",
  eyes: "amber eyes",
  tail: "curled tail",
  personality: "playful quiet desktop companion",
  rendererTarget: "sprite",
  photoReferenceMode: photoSession.photoReferenceMode
});
recordDecision(
  "user-approved trait prompt pack",
  traitPack.status === "accepted" && traitPack.reasonCode === "trait_prompt_pack_ok" && !localTraitPromptPackHasForbiddenContent(traitPack),
  `reasonCode=${traitPack.reasonCode}; renderer=${traitPack.rendererTarget}; actionCount=${Object.keys(traitPack.promptPack?.actionPrompts ?? {}).length}`
);

const tempRoot = mkdtempSync(join(tmpdir(), "pet-v7-13-"));
const storePath = join(tempRoot, "asset-store.json");
const storageRoot = join(tempRoot, "asset-packs");

const spriteImport = importAssetPack({
  manifestPath: "fixtures/manual/visual-assets/imported-static-orange-tabby-v1/manifest.json",
  name: "Imported Static Orange Tabby V1",
  storePath,
  storageRoot
});
recordAssetResult("2D generated asset import", spriteImport, "assetImport");

const spriteActivation = spriteImport.ok
  ? activateAssetPack({ packId: spriteImport.assetImport.packId, instanceId: TARGET_SPRITE, storePath })
  : spriteImport;
recordAssetResult("2D generated target activation", spriteActivation, "assetActivation");

const gltfImport = importAssetPack({
  manifestPath: "fixtures/manual/visual-assets/imported-gltf-prototype-cat-v1/manifest.json",
  name: "Imported GLTF Prototype Cat V1",
  storePath,
  storageRoot
});
recordAssetResult("external GLB import", gltfImport, "assetImport");

const gltfActivation = gltfImport.ok
  ? activateAssetPack({ packId: gltfImport.assetImport.packId, instanceId: TARGET_GLTF, storePath })
  : gltfImport;
recordAssetResult("external GLB target activation", gltfActivation, "assetActivation");

const beforeInvalid = listAssetPacks({ storePath });
const invalidImport = importAssetPack({
  manifestPath: "fixtures/manual/v5_11/invalid/manifest.json",
  name: "V7.13 Invalid Pack",
  storePath,
  storageRoot
});
const afterInvalid = listAssetPacks({ storePath });
const preserved = activePackFor(afterInvalid, TARGET_GLTF) === activePackFor(beforeInvalid, TARGET_GLTF);
recordDecision(
  "invalid import preserves previous active pack",
  !invalidImport.ok && invalidImport.reasonCode === "asset_manifest_forbidden_content" && preserved,
  `reasonCode=${invalidImport.reasonCode}; previousPackPreserved=${preserved}`
);

const defaultUnchanged = activePackFor(afterInvalid, "default") === null;
const unrelatedUnchanged = activePackFor(afterInvalid, UNRELATED) === null;
recordDecision(
  "target isolation",
  defaultUnchanged && unrelatedUnchanged,
  `defaultUnchanged=${defaultUnchanged}; unrelatedPetsUnchanged=${unrelatedUnchanged}`
);

const orchestration = createPhotoToAssetOrchestrationSummary({
  traitsApproved: traitPack.status === "accepted",
  consentAccepted: photoSession.status === "accepted",
  generated2d: {
    name: "generated_2d",
    status: spriteImport.ok && spriteActivation.ok ? "passed" : "failed",
    rendererKind: "sprite",
    packId: spriteImport.ok ? spriteImport.assetImport.packId : undefined,
    targetInstanceId: TARGET_SPRITE,
    reasonCode: spriteImport.ok && spriteActivation.ok ? undefined : "activation_failed"
  },
  externalGlbImport: {
    name: "external_glb_import",
    status: gltfImport.ok && gltfActivation.ok ? "passed" : "failed",
    reasonCode: gltfImport.ok && gltfActivation.ok ? "external_glb_import_passed" : "gltf_scan_failed",
    rendererKind: "gltf",
    packId: gltfImport.ok ? gltfImport.assetImport.packId : undefined,
    targetInstanceId: TARGET_GLTF
  },
  realProvider3d: {
    name: "real_provider_3d",
    status: "blocked",
    reasonCode: "real_provider_3d_branch_blocked",
    rendererKind: "gltf"
  },
  failurePreservation: {
    status: preserved ? "passed" : "failed",
    reasonCode: invalidImport.ok ? "manifest_import_failed" : "asset_validation_failed",
    previousPackPreserved: preserved
  },
  defaultUnchanged,
  unrelatedPetsUnchanged: unrelatedUnchanged
});
recordDecision(
  "orchestration summary",
  orchestration.status === "passed" && !photoToAssetOrchestrationHasForbiddenContent(orchestration),
  `status=${orchestration.status}; reasonCodes=${orchestration.reasonCodes.join(",")}`
);

const safeCases = cases.map(({ output, ...item }) => item);
const securityPayload = JSON.stringify({ cases: safeCases, orchestration });
cases.push({
  name: "security redaction scan",
  result: forbiddenPattern().test(securityPayload) ? "failed" : "passed",
  details: "summary contains no token, Authorization, raw photo, raw provider response, full local path, workspace path, config path, raw manifest chunk, or raw GLTF chunk"
});

const failed = cases.filter((item) => item.result === "failed");
const status = failed.length ? "failed" : "passed";
writeFileSync(EVIDENCE_PATH, renderEvidence(status, orchestration, safeCases));

console.log(JSON.stringify({
  status,
  evidencePath: EVIDENCE_PATH,
  allowedClaim: orchestration.allowedClaim,
  reasonCodes: orchestration.reasonCodes,
  cases: safeCases
}, null, 2));

if (failed.length) {
  process.exit(1);
}

function activePackFor(result, instanceId) {
  const packs = result.assetPacks ?? [];
  const active = packs.find((pack) => Array.isArray(pack.activeInstances) && pack.activeInstances.includes(instanceId));
  return active?.packId ?? null;
}

function recordAssetResult(name, result, key) {
  const item = result[key];
  cases.push({
    name,
    result: result.ok ? "passed" : "failed",
    details: result.ok
      ? `packId=${item.packId}; renderer=${item.rendererKind}; assets=${item.copiedAssetIds?.length ?? 0}; instanceId=${item.instanceId ?? "n/a"}`
      : `reasonCode=${result.reasonCode}`,
    output: JSON.stringify(result)
  });
}

function recordDecision(name, ok, details) {
  cases.push({
    name,
    result: ok ? "passed" : "failed",
    details,
    output: details
  });
}

function record(name, result) {
  cases.push({
    name,
    result: result.ok ? "passed" : "failed",
    details: result.ok ? "ok" : sanitize(result.output),
    output: result.output
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

function sanitize(value) {
  return String(value)
    .replace(/\/Users\/[^/\s]+/g, "[home]")
    .replace(/\/private\/[^\s"']+/g, "[tmp]")
    .replace(/Authorization[^\n]*/gi, "Authorization [redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[redacted]")
    .replace(/api[_-]?key\s*[:=]\s*[^\s"']+/gi, "api key redacted")
    .replace(/cookie\s*[:=]\s*[^\n\r"']+/gi, "cookie redacted")
    .slice(0, 1200);
}

function forbiddenPattern() {
  return /(Authorization|api-token\.json|\/Users\/|raw payload|raw prompt|raw provider response|raw photo|workspace path|config path|EXIF|GPS|sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|api[_-]?key\s*[:=]\s*[^"'\s]+|cookie\s*[:=]\s*[^"'\s]+)/i;
}

function renderEvidence(status, orchestration, caseList) {
  return `# V7.13 Photo-To-Asset Orchestration Smoke

status: ${status}
date: 2026-06-01

## Scope

This smoke validates V7.13 orchestration for tested local 2D generated asset workflow and external GLB import workflow.

It does not claim automatic photo-to-3D ready, provider integration verified, broad 3D ready, remote generation ready, or production signed release ready.

## Runtime Data Used

- generated 2D action pack: accepted V7.10 MiniMax-generated local sprite fixture.
- external GLB import: accepted V5.12/V7.12 local GLB runtime fixture.
- photo reference: local fixture metadata through privacy boundary only.
- real provider 3D branch: blocked because no real 3D provider output was supplied.

## Case Results

| Case | Result | Details |
| --- | --- | --- |
${caseList.map((item) => `| ${item.name} | ${item.result} | ${item.details} |`).join("\n")}

## Orchestration Summary

- status: \`${orchestration.status}\`
- allowed claim: ${orchestration.allowedClaim ? `\`${orchestration.allowedClaim}\`` : "`none`"}
- reason codes: \`${orchestration.reasonCodes.join(", ")}\`
- generated 2D path: \`${orchestration.paths.find((item) => item.name === "generated_2d")?.status}\`
- external GLB import path: \`${orchestration.paths.find((item) => item.name === "external_glb_import")?.status}\`
- real provider 3D branch: \`${orchestration.paths.find((item) => item.name === "real_provider_3d")?.status}\`
- provider branch reason: \`provider_output_missing, real_provider_3d_branch_blocked\`
- previous active pack preserved: \`${orchestration.failurePreservation.previousPackPreserved}\`
- default unchanged: \`${orchestration.targetIsolation.defaultUnchanged}\`
- unrelated pets unchanged: \`${orchestration.targetIsolation.unrelatedPetsUnchanged}\`

## Security Redaction

Evidence records safe field names, reason codes, pack IDs, renderer kinds, and target instance IDs only.

It excludes raw photo bytes, EXIF/GPS, prompt text, raw provider responses, tokens, Authorization values, full local paths, workspace paths, config paths, raw manifest JSON chunks, and raw GLTF JSON chunks.

## Final Decision

${status === "passed"
  ? "Passed for V7.13 scoped orchestration. The real provider photo-to-3D branch remains blocked with `provider_output_missing` and `real_provider_3d_branch_blocked`."
  : "Failed. Do not claim V7.13 passed."}
`;
}
