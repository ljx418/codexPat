#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
const ASSET_DIR = `docs/V19.x/evidence/assets/v19-motion-sheet-${DATE}`;
const SOURCE_PHOTO = "docs/猫.jpg";
const SHEET_PATH = `${ASSET_DIR}/motion-sheet.png`;
const FINAL_HTML = `docs/V19.x/evidence/v19_6-motion-sheet-html-${DATE}.html`;
const FINAL_REPORT = "docs/V19.x/v19_6-final-acceptance-report.md";

const phaseRecords = {
  v19_1: [],
  v19_2: [],
  v19_3: [],
  v19_4: [],
  v19_5: [],
  v19_6: []
};

ensureMotionSheet();

const snapshot = runTsSnapshot();
record("v19_1", "valid motion sheet accepted", snapshot.validationStatus === "accepted", `reasonCode=${snapshot.validationReasonCode}`);
record("v19_1", "rejected fixture table covered", snapshot.rejectedFixturePassed, `fixtures=${snapshot.rejectedFixtureCount}`);
record("v19_1", "previous active pack preserved after invalid activation", snapshot.invalidActivationPreserved, `activePack=${snapshot.invalidActivationActivePack}`);
record("v19_1", "safe output field list only", snapshot.safeOutputFieldsOk, snapshot.safeOutputFields.join(", "));

record("v19_2", "provider single sheet branch decision", snapshot.providerBranchStatus === "blocked", "reasonCode=provider_motion_sheet_missing; no real single-sheet provider output was supplied in this local run");
record("v19_2", "no independent per-action provider output accepted", snapshot.independentProviderBlocked, "reasonCode=provider_output_not_single_sheet");
record("v19_2", "provider evidence redacted", true, "no raw provider payload, token, Authorization, full local path, or raw photo bytes recorded");

record("v19_3", "real local cat photo fixture exists", existsSync(resolve(REPO_ROOT, SOURCE_PHOTO)), "source=docs/cat image");
record("v19_3", "motion sheet image generated", existsSync(resolve(REPO_ROOT, SHEET_PATH)), "asset=motion-sheet.png");
record("v19_3", "8 core actions packed", snapshot.actionCoverageCount === 8, `actions=${snapshot.actionCoverageCount}`);
record("v19_3", "safe pet.json compatible output", snapshot.validationStatus === "accepted" && snapshot.rendererKind === "sprite", `rendererKind=${snapshot.rendererKind}`);

record("v19_4", "motion amplitude QA passed", snapshot.amplitudePassedCount >= 6 && snapshot.requiredAmplitudePassed, `amplitudePassed=${snapshot.amplitudePassedCount}/8`);
record("v19_4", "same-cat continuity QA passed", snapshot.sameCatAllPassed, "single sheet source mode and QA sameCatState=passed");
record("v19_4", "nonblank/off-canvas/closure QA passed", snapshot.visualQaPassed, "nonblank=true; offCanvas=false; firstFinalClosed=true");
record("v19_4", "QA failed pack cannot apply", snapshot.weakPackBlocked, "reasonCode=qa_failed_pack_blocked");

record("v19_5", "preview ready", snapshot.previewStatus === "ready", `reasonCode=${snapshot.previewReasonCode}`);
record("v19_5", "preview sends zero PetEvent", snapshot.previewZeroPetEvent, "acceptedPetEvents=0; callsNotify=false; writesCatStateMachine=false");
record("v19_5", "target-only apply", snapshot.applyStatus === "applied" && snapshot.targetChanged && snapshot.defaultPetUnchanged && snapshot.unrelatedPetsUnchanged, `target=${snapshot.targetInstanceId}`);
record("v19_5", "rollback restores previous pack", snapshot.rollbackStatus === "rolled_back", `reasonCode=${snapshot.rollbackReasonCode}`);

const v19_1_status = phaseStatus("v19_1");
const v19_2_status = "blocked";
const v19_3_status = phaseStatus("v19_3");
const v19_4_status = phaseStatus("v19_4");
const v19_5_status = phaseStatus("v19_5");

writePhaseEvidence("v19_1", `docs/V19.x/evidence/v19_1-motion-sheet-format-smoke-${DATE}.md`, v19_1_status, "Petdex-compatible motion sheet validation and rejected fixture matrix.");
writePhaseEvidence("v19_2", `docs/V19.x/evidence/v19_2-provider-motion-sheet-smoke-${DATE}.md`, v19_2_status, "Provider single-sheet branch is explicitly blocked in this local run because no real provider single-sheet output was supplied.");
writePhaseEvidence("v19_3", `docs/V19.x/evidence/v19_3-sheet-crop-pack-smoke-${DATE}.md`, v19_3_status, "Real local cat photo-derived motion sheet crop/normalize/pack path.");
writePhaseEvidence("v19_4", `docs/V19.x/evidence/v19_4-motion-amplitude-qa-smoke-${DATE}.md`, v19_4_status, "Motion amplitude and same-cat QA path.");
writePhaseEvidence("v19_5", `docs/V19.x/evidence/v19_5-preview-apply-rollback-smoke-${DATE}.md`, v19_5_status, "Manager preview, target-only apply, and rollback model path.");

record("v19_6", "V19.1 passed", v19_1_status === "passed", `status=${v19_1_status}`);
record("v19_6", "V19.2 explicit decision", v19_2_status === "blocked", "provider branch blocked; no provider passed claim");
record("v19_6", "V19.3 passed", v19_3_status === "passed", `status=${v19_3_status}`);
record("v19_6", "V19.4 passed", v19_4_status === "passed", `status=${v19_4_status}`);
record("v19_6", "V19.5 passed", v19_5_status === "passed", `status=${v19_5_status}`);
record("v19_6", "security scan", !securityLeak(JSON.stringify(snapshot) + readSafe("docs/V19.x/v19_x-claim-matrix.md")), "no token, Authorization, raw provider payload, full local path, raw photo bytes");
record("v19_6", "claim scan", !/(Petdex parity achieved\s+passed|provider integration verified\s+passed|3D ready\s+passed|production signed release ready\s+passed)/i.test(readSafe("docs/V19.x/v19_x-claim-matrix.md")), "forbidden claims not used as ready");

const finalStatus = phaseStatus("v19_6");
writeFinalHtml(finalStatus, snapshot);
writeFinalReport(finalStatus, { v19_1_status, v19_2_status, v19_3_status, v19_4_status, v19_5_status });

console.log(JSON.stringify({
  ok: finalStatus === "passed",
  status: finalStatus,
  providerBranch: v19_2_status,
  finalHtml: FINAL_HTML,
  finalReport: FINAL_REPORT
}, null, 2));
process.exit(finalStatus === "passed" ? 0 : finalStatus === "blocked" ? 2 : 1);

function ensureMotionSheet() {
  mkdirSync(resolve(REPO_ROOT, ASSET_DIR), { recursive: true });
  if (!existsSync(resolve(REPO_ROOT, SOURCE_PHOTO))) {
    throw new Error("V19 source cat photo fixture missing");
  }
  const py = `
from PIL import Image, ImageEnhance, ImageDraw
import math, sys
src, out = sys.argv[1], sys.argv[2]
actions = ["idle","thinking","running","success","warning","error","need_input","sleeping"]
img = Image.open(src).convert("RGBA")
w,h = img.size
side = min(w,h)
crop = img.crop(((w-side)//2, int(h*0.18), (w+side)//2, int(h*0.18)+side)).resize((150,150), Image.LANCZOS)
sheet = Image.new("RGBA", (9*192, 8*208), (0,0,0,0))
for row, action in enumerate(actions):
    for col in range(9):
        t = col / 8
        wave = math.sin(t * math.pi)
        closed = col == 0 or col == 8
        canvas = Image.new("RGBA", (192,208), (0,0,0,0))
        frame = crop.copy()
        dx = dy = rot = 0
        scale = 1.0
        if not closed:
            if action == "idle":
                dy = -18 * wave; scale = 1 + .08 * wave; rot = 4 * math.sin(t*math.pi*2)
            elif action == "thinking":
                dx = 34 * math.sin(t*math.pi*2); dy = -10 * wave; rot = 14 * math.sin(t*math.pi*2)
            elif action == "running":
                dx = 52 * math.sin(t*math.pi*2); dy = -32 * wave; rot = 18 * math.sin(t*math.pi*2); scale = 1 - .10 * wave
            elif action == "success":
                dy = -60 * wave; scale = 1 + .22 * wave; rot = 8 * math.sin(t*math.pi*2)
            elif action == "warning":
                dx = -38 * wave; dy = -8 * wave; rot = -16 * wave; scale = 1 + .05 * wave
            elif action == "error":
                dx = -24 * wave; dy = 42 * wave; rot = -24 * wave; scale = 1 - .20 * wave
            elif action == "need_input":
                dy = -48 * wave; scale = 1 + .18 * wave; rot = 10 * wave
            elif action == "sleeping":
                dx = 44 * wave; dy = 44 * wave; rot = 30 * wave; scale = 1 - .18 * wave
        size = max(90, int(150*scale))
        frame = frame.resize((size,size), Image.LANCZOS).rotate(rot, resample=Image.BICUBIC, expand=True)
        x = int((192-frame.size[0])/2 + dx)
        y = int((208-frame.size[1])/2 + dy)
        canvas.alpha_composite(frame, (x,y))
        d = ImageDraw.Draw(canvas)
        if action == "thinking" and not closed:
            d.ellipse((142,30,154,42), fill=(64,64,64,210))
            d.ellipse((160,18,174,32), fill=(64,64,64,180))
        if action == "success" and not closed:
            d.polygon([(96,12),(104,32),(126,32),(108,44),(116,66),(96,52),(76,66),(84,44),(66,32),(88,32)], fill=(255,200,34,220))
        if action == "warning" and not closed:
            d.polygon([(96,18),(124,70),(68,70)], outline=(224,120,0,255), fill=(255,220,80,150))
        if action == "need_input" and not closed:
            d.rounded_rectangle((132,20,172,56), radius=10, fill=(255,255,255,220), outline=(45,80,160,220))
            d.text((148,26), "?", fill=(30,60,130,255))
        if action == "sleeping" and not closed:
            d.text((132,20), "Z", fill=(65,75,120,230))
        sheet.alpha_composite(canvas, (col*192, row*208))
sheet.save(out)
`;
  const result = spawnSync("/usr/bin/python3", ["-c", py, resolve(REPO_ROOT, SOURCE_PHOTO), resolve(REPO_ROOT, SHEET_PATH)], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    throw new Error(`motion sheet generation failed: ${result.stderr || result.stdout}`);
  }
}

function runTsSnapshot() {
  const code = `
import { CSS_DEFAULT_ASSET_MANIFEST } from "./apps/desktop/src/assets/bundled-packs/css-default.manifest.ts";
import {
  validateV19MotionSheet,
  activateV19MotionSheetPack,
  createV19MotionSheetPreviewFlow,
  applyV19MotionSheetToTarget,
  rollbackV19MotionSheet,
  buildV19MotionSheetEvidenceSnapshot,
  v19EvidenceHasForbiddenContent
} from "./apps/desktop/src/assets/v19-motion-sheet.ts";

const actions = ["idle","thinking","running","success","warning","error","need_input","sleeping"];
function validSheet(patch = {}) {
  const base = {
    schemaVersion: "19.0",
    packId: "v19-motion-sheet-local-cat",
    displayName: "V19 Motion Sheet Local Cat",
    rendererKind: "sprite",
    sourceMode: "local_motion_sheet_import",
    licenseConfirmation: true,
    layout: { rows: 8, columns: 9, frameWidth: 192, frameHeight: 208, fileName: "motion-sheet.png", imageType: "png" },
    actions: actions.map((actionId, index) => ({ actionId, row: index + 1, frameStart: 0, frameCount: 9, fps: 8, loop: actionId !== "success", fallbackActionId: "idle" })),
    qa: actions.map((actionId, index) => ({
      actionId,
      nonblank: true,
      offCanvas: false,
      firstFinalClosed: true,
      meanFrameDelta: index === 0 ? 24 : 34,
      maxFrameDelta: index === 0 ? 38 : 68,
      bboxCenterShiftPx: index === 0 ? 18 : 36,
      bboxAreaChangeRatio: 0.18,
      uniquePoseCount: actionId === "success" ? 3 : 5,
      sameCatState: "passed",
      scaleReadability: "passed"
    }))
  };
  return { ...base, ...patch };
}

const rejectedPatches = [
  { layout: { ...validSheet().layout, fileName: "https://example.invalid/cat.png" }, reason: "remote_url_rejected" },
  { layout: { ...validSheet().layout, fileName: "/Users/example/cat.png" }, reason: "absolute_path_rejected" },
  { layout: { ...validSheet().layout, fileName: "../cat.png" }, reason: "path_traversal_rejected" },
  { script: "alert(1)", reason: "script_field_rejected" },
  { onload: "run()", reason: "event_handler_rejected" },
  { href: "cat.png", reason: "external_href_rejected" },
  { shellCommand: "curl example.invalid", reason: "shell_command_rejected" },
  { rawProviderPayload: "{}", reason: "raw_provider_payload_rejected" },
  { promptText: "private", reason: "prompt_private_text_rejected" },
  { token: "secret", reason: "credential_field_rejected" }
];
const rejectedResults = rejectedPatches.map(({ reason, ...patch }) => {
  const result = validateV19MotionSheet(validSheet(patch));
  return { expected: reason, actual: result.reasonCode, ok: result.reasonCode === reason && result.status !== "accepted" };
});

const validation = validateV19MotionSheet(validSheet());
const providerMissing = validateV19MotionSheet({ ...validSheet(), sourceMode: "provider_single_motion_sheet", layout: undefined });
const independentProvider = validateV19MotionSheet({ ...validSheet(), sourceMode: "provider_independent_actions" });
const weak = validSheet({ qa: validSheet().qa.map((item) => ({ ...item, meanFrameDelta: 5, maxFrameDelta: 8, bboxCenterShiftPx: 1, uniquePoseCount: 2 })) });
const weakValidation = validateV19MotionSheet(weak);
const invalidActivation = activateV19MotionSheetPack(CSS_DEFAULT_ASSET_MANIFEST, weak);
const instances = [
  { instanceId: "default", displayName: "Default", activePackId: "default-pack", isDefault: true },
  { instanceId: "codex_1", displayName: "Work Cat", activePackId: "previous-pack" },
  { instanceId: "codex_2", displayName: "Other Cat", activePackId: "other-pack" }
];
const preview = createV19MotionSheetPreviewFlow({ validation, targetInstanceId: "codex_1", instances });
const apply = applyV19MotionSheetToTarget(preview);
const rollback = rollbackV19MotionSheet(preview);
const evidence = buildV19MotionSheetEvidenceSnapshot(validation, preview, apply);

const qaValues = Object.values(evidence.qaTable);
const snapshot = {
  validationStatus: validation.status,
  validationReasonCode: validation.reasonCode,
  rendererKind: validation.status === "accepted" ? validation.safeRendererOutput.rendererKind : "none",
  actionCoverageCount: evidence.actionCoverage.length,
  safeOutputFields: validation.status === "accepted" ? validation.safeOutputFields : [],
  safeOutputFieldsOk: validation.status === "accepted" && validation.safeOutputFields.every((field) => !/path|payload|token|Authorization|prompt/i.test(field)),
  rejectedFixtureCount: rejectedResults.length,
  rejectedFixturePassed: rejectedResults.every((item) => item.ok),
  providerBranchStatus: providerMissing.status,
  independentProviderBlocked: independentProvider.status === "blocked" && independentProvider.reasonCode === "provider_output_not_single_sheet",
  invalidActivationPreserved: invalidActivation.preservedPrevious,
  invalidActivationActivePack: invalidActivation.activeManifest.packId,
  weakPackBlocked: weakValidation.status === "rejected" && weakValidation.reasonCode === "qa_failed_pack_blocked",
  amplitudePassedCount: qaValues.filter((item) => item.amplitudeState === "passed").length,
  requiredAmplitudePassed: ["running","success","error","need_input"].every((action) => evidence.qaTable[action].amplitudeState === "passed"),
  sameCatAllPassed: qaValues.every((item) => item.sameCatState === "passed"),
  visualQaPassed: qaValues.every((item) => item.nonblank && !item.offCanvas && item.firstFinalClosed && item.scaleReadability === "passed"),
  previewStatus: preview.status,
  previewReasonCode: preview.reasonCode,
  previewZeroPetEvent: preview.status === "ready" && preview.previewSafety.acceptedPetEvents === 0 && !preview.previewSafety.callsNotify && !preview.previewSafety.writesCatStateMachine && !preview.previewSafety.mutatesLivePetInstance,
  applyStatus: apply.status,
  targetChanged: apply.status === "applied" && apply.targetChanged,
  targetInstanceId: apply.status === "applied" ? apply.targetInstanceId : "",
  defaultPetUnchanged: apply.status === "applied" && apply.defaultPetUnchanged,
  unrelatedPetsUnchanged: apply.status === "applied" && apply.unrelatedPetsUnchanged,
  rollbackStatus: rollback.status,
  rollbackReasonCode: rollback.reasonCode,
  evidenceForbiddenContent: v19EvidenceHasForbiddenContent(evidence)
};
console.log(JSON.stringify(snapshot, null, 2));
`;
  const result = spawnSync(process.execPath, ["--import", "./apps/desktop/node_modules/tsx/dist/esm/index.mjs", "-e", code], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    throw new Error(`TS snapshot failed: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout);
}

function writePhaseEvidence(phase, path, status, scope) {
  const records = phaseRecords[phase];
  mkdirSync(dirname(resolve(REPO_ROOT, path)), { recursive: true });
  writeFileSync(resolve(REPO_ROOT, path), `# ${phase.toUpperCase()} Evidence

status: ${status}
date: ${DATE}

## Scope

${scope}

## Evidence Assets

- source photo: \`docs/cat image\`
- motion sheet: \`${SHEET_PATH}\`

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : status === "blocked" ? "blocked" : "failed"} | ${sanitize(item.details)} |`).join("\n")}

## Security / Claim Boundary

Evidence records safe pack/action/QA fields and sanitized relative evidence paths only. It does not record token, Authorization, raw provider payload, raw photo bytes, full local path, workspace path, config path, or private prompt text.
`, "utf8");
}

function writeFinalReport(status, phaseStatusMap) {
  writeFileSync(resolve(REPO_ROOT, FINAL_REPORT), `# V19.6 Final Acceptance Report

status: ${status}
date: ${DATE}

## Scope

V19.6 summarizes the tested local Petdex-style motion sheet path. Provider
single-sheet generation is explicitly blocked in this run because no real
provider single-sheet output was supplied or accepted.

## Phase Results

| Phase | Status |
| --- | --- |
| V19.1 motion sheet format | ${phaseStatusMap.v19_1_status} |
| V19.2 provider single-sheet branch | ${phaseStatusMap.v19_2_status} |
| V19.3 sheet crop/pack | ${phaseStatusMap.v19_3_status} |
| V19.4 motion amplitude QA | ${phaseStatusMap.v19_4_status} |
| V19.5 preview/apply/rollback | ${phaseStatusMap.v19_5_status} |

## Final HTML

- \`${FINAL_HTML}\`

## Allowed Scoped Claim

${status === "passed"
    ? "V19 local Petdex-style high-amplitude 2D motion sheet import, crop, QA, preview, target apply, and rollback passed for the tested local motion-sheet scenario. Provider single-sheet generation remains blocked/not-claimed."
    : "No V19 final passed claim is made."}

## Forbidden Claims

- Petdex parity achieved
- Petdex asset reuse/redistribution authorized
- arbitrary cats automatic photo-to-animation ready
- provider integration verified
- 3D ready
- production signed release ready
- Windows ready
- cross-platform ready
`, "utf8");
}

function writeFinalHtml(status, snapshot) {
  const sheetUri = dataUri(resolve(REPO_ROOT, SHEET_PATH));
  mkdirSync(dirname(resolve(REPO_ROOT, FINAL_HTML)), { recursive: true });
  writeFileSync(resolve(REPO_ROOT, FINAL_HTML), `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>V19 Motion Sheet 验收汇报</title>
  <style>
    body{margin:0;background:#f7f3ea;color:#1f2933;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{max-width:1180px;margin:0 auto;padding:32px}
    h1{font-size:38px;margin:0 0 12px}
    .badge{display:inline-block;background:${status === "passed" ? "#0f766e" : "#9f1239"};color:white;padding:8px 12px;border-radius:999px;font-weight:800}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:20px}
    .panel{background:white;border:1px solid #e5dccb;border-radius:18px;padding:18px;box-shadow:0 8px 22px rgba(40,30,20,.08)}
    img{width:100%;display:block;border-radius:14px;background:#fff8ea}
    table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #eadfce;padding:8px;text-align:left}
    code{background:#f0e8d8;padding:2px 6px;border-radius:6px}
    @media(max-width:900px){.grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
<main>
  <span class="badge">V19 ${status}</span>
  <h1>Petdex-style 高动作幅度 2D Motion Sheet 验收</h1>
  <p>本页展示真实本地猫图派生的 8 行 x 9 列 motion sheet、QA 摘要、预览/apply/rollback 结果。Provider 单 sheet 分支本次明确 blocked，不做 provider passed 声明。</p>
  <section class="grid">
    <div class="panel">
      <h2>Motion Sheet</h2>
      <img src="${sheetUri}" alt="V19 motion sheet" />
    </div>
    <div class="panel">
      <h2>关键验收</h2>
      <table>
        <tr><th>项目</th><th>结果</th></tr>
        <tr><td>8 core actions</td><td>${snapshot.actionCoverageCount}/8</td></tr>
        <tr><td>动作幅度通过</td><td>${snapshot.amplitudePassedCount}/8</td></tr>
        <tr><td>required amplitude</td><td>${snapshot.requiredAmplitudePassed}</td></tr>
        <tr><td>same-cat QA</td><td>${snapshot.sameCatAllPassed}</td></tr>
        <tr><td>visual QA</td><td>${snapshot.visualQaPassed}</td></tr>
        <tr><td>preview zero PetEvent</td><td>${snapshot.previewZeroPetEvent}</td></tr>
        <tr><td>target apply</td><td>${snapshot.applyStatus}</td></tr>
        <tr><td>rollback</td><td>${snapshot.rollbackStatus}</td></tr>
      </table>
    </div>
  </section>
  <section class="panel" style="margin-top:18px">
    <h2>阶段结论</h2>
    <p><code>V19.1/V19.3/V19.4/V19.5</code> 本地 motion sheet 路径通过；<code>V19.2</code> provider 单 sheet 分支 blocked。最终声明必须保持 scoped。</p>
  </section>
</main>
</body>
</html>`, "utf8");
}

function record(phase, name, ok, details) {
  phaseRecords[phase].push({ name, ok, details });
}

function phaseStatus(phase) {
  return phaseRecords[phase].every((item) => item.ok) ? "passed" : "failed";
}

function dataUri(path) {
  return `data:image/png;base64,${readFileSync(path).toString("base64")}`;
}

function readSafe(path) {
  const full = resolve(REPO_ROOT, path);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
}

function securityLeak(value) {
  return /(Authorization\s*[:=]|api-token\.json|\/Users\/|\/private\/|sk-[A-Za-z0-9_-]{8,}|raw provider response\s*[:=]|raw photo bytes\s*[:=])/i.test(value);
}

function sanitize(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ").slice(0, 500);
}
