import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CORE_ACTIONS = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"];
const SAFE_CLIP_NAMES = new Set(CORE_ACTIONS);
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_MESHES = 128;
const MAX_MATERIALS = 128;
const MAX_TEXTURES = 128;
const MAX_ANIMATIONS = 64;
const MAX_DURATION_SECONDS = 30;
const REAL_GLB_LABEL = "apps/desktop/public/assets/3d/agent-desktop-pet-cat-prototype.glb";
const EVIDENCE_PATH = "docs/V7.11/evidence/v7_11-external-glb-intake-smoke-2026-06-01.md";

const cases = [];
const realAsset = inspectGlbAsset(REAL_GLB_LABEL, readFileSync(REAL_GLB_LABEL), "local_fixture");

record("real GLB file exists", existsSync(REAL_GLB_LABEL), "real local GLB fixture is present");
record("real GLB deep scan", realAsset.ok, realAsset.summary);
record(
  "real GLB action classification",
  realAsset.classification === "action_ready",
  `classification=${realAsset.classification}; clips=${realAsset.clipNames.join(",")}`
);

const fixtureRoot = join(tmpdir(), "agent-desktop-pet-v7-11-gltf-fixtures");
mkdirSync(fixtureRoot, { recursive: true });

const rejectionFixtures = [
  {
    name: "remote uri rejected",
    json: { asset: { version: "2.0" }, buffers: [{ uri: "https://example.invalid/cat.bin", byteLength: 1 }], scenes: [{}] },
    reasonCode: "gltf_external_resource_rejected"
  },
  {
    name: "external bin rejected",
    json: { asset: { version: "2.0" }, buffers: [{ uri: "cat.bin", byteLength: 1 }], scenes: [{}] },
    reasonCode: "gltf_external_resource_rejected"
  },
  {
    name: "data uri rejected",
    json: { asset: { version: "2.0" }, images: [{ uri: "data:image/png;base64,AAAA" }], scenes: [{}] },
    reasonCode: "gltf_external_resource_rejected"
  },
  {
    name: "required extension rejected",
    json: { asset: { version: "2.0" }, extensionsRequired: ["KHR_texture_basisu"], scenes: [{}] },
    reasonCode: "gltf_required_extension_rejected"
  },
  {
    name: "unknown action clip rejected",
    json: { asset: { version: "2.0" }, scenes: [{}], animations: [{ name: "dance", channels: [{}] }] },
    reasonCode: "gltf_action_clip_rejected"
  }
];

for (const fixture of rejectionFixtures) {
  const result = scanGltfJson(fixture.json);
  record(fixture.name, result.ok === false && result.reasonCode === fixture.reasonCode, result.ok ? "unexpected pass" : result.reasonCode);
}

const staticPreview = scanGltfJson({ asset: { version: "2.0" }, scenes: [{}], animations: [{ name: "idle", channels: [{}] }] });
record(
  "missing clips classified static preview",
  staticPreview.ok && staticPreview.classification === "static_preview",
  staticPreview.ok ? `classification=${staticPreview.classification}` : staticPreview.reasonCode
);

const securitySummary = JSON.stringify(cases);
record(
  "security redaction scan",
  !/(token|Authorization|raw payload|raw provider response|\/Users\/|workspace path|config path|api-token\.json)/i.test(securitySummary),
  "summary contains no token, Authorization, raw payload, local user path, workspace path, config path, or api-token.json"
);

const failed = cases.filter((item) => item.result !== "passed");
const status = failed.length ? "failed" : "passed";
writeEvidence(status, realAsset, cases);

console.log(JSON.stringify({
  status,
  evidence: EVIDENCE_PATH,
  sourceCategory: realAsset.sourceCategory,
  classification: realAsset.classification,
  cases
}, null, 2));

if (failed.length) process.exit(1);

function inspectGlbAsset(label, bytes, sourceCategory) {
  if (!bytes?.length) {
    return { ok: false, sourceCategory, classification: "blocked", clipNames: [], summary: "empty GLB" };
  }
  if (bytes.length > MAX_FILE_BYTES) {
    return { ok: false, sourceCategory, classification: "blocked", clipNames: [], summary: "file_size_limit_exceeded" };
  }
  let json;
  try {
    json = parseGlbJson(bytes);
  } catch {
    return { ok: false, sourceCategory, classification: "blocked", clipNames: [], summary: "glb_parse_failed" };
  }
  const scan = scanGltfJson(json);
  return {
    ok: scan.ok,
    sourceCategory,
    classification: scan.ok ? scan.classification : "blocked",
    clipNames: scan.ok ? scan.clipNames : [],
    summary: scan.ok
      ? `source=${sourceCategory}; classification=${scan.classification}; clipCount=${scan.clipNames.length}; meshCount=${arrayLen(json.meshes)}; materialCount=${arrayLen(json.materials)}; textureCount=${arrayLen(json.textures)}`
      : scan.reasonCode
  };
}

function parseGlbJson(bytes) {
  if (bytes.subarray(0, 4).toString("utf8") !== "glTF") throw new Error("bad magic");
  if (bytes.readUInt32LE(4) !== 2) throw new Error("bad version");
  const jsonLength = bytes.readUInt32LE(12);
  const jsonType = bytes.readUInt32LE(16);
  if (jsonType !== 0x4e4f534a) throw new Error("bad json chunk");
  return JSON.parse(bytes.subarray(20, 20 + jsonLength).toString("utf8").trim());
}

function scanGltfJson(json) {
  const uriDecision = rejectUnsafeUris(json);
  if (!uriDecision.ok) return uriDecision;
  if (arrayLen(json.meshes) > MAX_MESHES || arrayLen(json.materials) > MAX_MATERIALS || arrayLen(json.textures) > MAX_TEXTURES || arrayLen(json.animations) > MAX_ANIMATIONS) {
    return { ok: false, reasonCode: "gltf_size_limit_rejected" };
  }
  const required = Array.isArray(json.extensionsRequired) ? json.extensionsRequired : [];
  if (required.length > 0) return { ok: false, reasonCode: "gltf_required_extension_rejected" };
  const animations = Array.isArray(json.animations) ? json.animations : [];
  const clipNames = animations.map((animation) => typeof animation?.name === "string" ? animation.name : "").filter(Boolean);
  for (const name of clipNames) {
    if (!SAFE_CLIP_NAMES.has(name)) return { ok: false, reasonCode: "gltf_action_clip_rejected" };
  }
  for (const animation of animations) {
    if (typeof animation?.duration === "number" && animation.duration > MAX_DURATION_SECONDS) {
      return { ok: false, reasonCode: "gltf_animation_duration_rejected" };
    }
  }
  const hasAllCore = CORE_ACTIONS.every((action) => clipNames.includes(action));
  const allCoreHaveChannels = CORE_ACTIONS.every((action) => {
    const animation = animations.find((item) => item?.name === action);
    return Array.isArray(animation?.channels) && animation.channels.length > 0;
  });
  return {
    ok: true,
    classification: hasAllCore && allCoreHaveChannels ? "action_ready" : "static_preview",
    clipNames
  };
}

function rejectUnsafeUris(value) {
  if (Array.isArray(value)) {
    for (const item of value) {
      const decision = rejectUnsafeUris(item);
      if (!decision.ok) return decision;
    }
    return { ok: true };
  }
  if (!value || typeof value !== "object") return { ok: true };
  for (const [key, nested] of Object.entries(value)) {
    if (key === "uri" && typeof nested === "string") {
      if (/^(https?:|file:|javascript:|data:)/i.test(nested)) return { ok: false, reasonCode: "gltf_external_resource_rejected" };
      if (nested.includes("..") || nested.startsWith("/") || /^[A-Za-z]:[\\/]/.test(nested)) return { ok: false, reasonCode: "gltf_external_resource_rejected" };
      if (nested.trim() !== "") return { ok: false, reasonCode: "gltf_external_resource_rejected" };
    }
    const decision = rejectUnsafeUris(nested);
    if (!decision.ok) return decision;
  }
  return { ok: true };
}

function arrayLen(value) {
  return Array.isArray(value) ? value.length : 0;
}

function record(name, ok, details) {
  cases.push({ name, result: ok ? "passed" : "failed", details });
}

function writeEvidence(status, realAsset, caseList) {
  const lines = [
    "# V7.11 External GLB/GLTF Intake Smoke",
    "",
    "status: " + status,
    "date: 2026-06-01",
    "",
    "## Scope",
    "",
    "This smoke validates the GLB/GLTF intake contract against one real local GLB fixture and unsafe local rejection fixtures.",
    "",
    "It does not claim automatic photo-to-3D, provider integration, remote generation, broad 3D readiness, or production release readiness.",
    "",
    "## Real Asset Summary",
    "",
    "- source category: `" + realAsset.sourceCategory + "`",
    "- classification: `" + realAsset.classification + "`",
    "- safe clip names: `" + realAsset.clipNames.join(", ") + "`",
    "",
    "## Case Results",
    "",
    "| Case | Result | Details |",
    "| --- | --- | --- |",
    ...caseList.map((item) => `| ${item.name} | ${item.result} | ${item.details} |`),
    "",
    "## Security Redaction",
    "",
    "Evidence records safe field names and decisions only. It excludes raw JSON chunks, token, Authorization, provider credential, raw provider response, full local user path, workspace path, config path, and api-token.json.",
    "",
    "## Final Decision",
    "",
    status === "passed"
      ? "Passed for local GLB/GLTF intake contract. External photo-to-3D provider output remains not-ready because no real external provider GLB/GLTF output was used."
      : "Failed. Do not claim V7.11 passed."
  ];
  writeFileSync(EVIDENCE_PATH, lines.join("\n"));
}
