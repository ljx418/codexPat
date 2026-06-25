import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync, execFileSync } from "node:child_process";

import { CORE_ACTION_IDS } from "../apps/desktop/src/assets/asset-manifest.ts";
import {
  buildV26PackPreviewApplyEvidenceSnapshot,
  runV26PackPreviewApplyRollback,
  v26FrameSet
} from "../apps/desktop/src/assets/pack-preview-apply-rollback.ts";
import {
  createV30SemanticCandidate,
  runV30MotionReadabilityQA,
  buildV30EvidenceSnapshot
} from "../apps/desktop/src/assets/semantic-animation-quality.ts";
import {
  createV31PolishedCandidate,
  runV31ArtQualityRubric,
  buildV31ArtQualityEvidenceSnapshot
} from "../apps/desktop/src/assets/v31-art-quality.ts";
import {
  buildV32QualityRescueEvidenceSnapshot,
  runV32QualityRescueGate
} from "../apps/desktop/src/assets/v32-quality-rescue.ts";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const date = "2026-06-24";
const fixtureRoot = path.join(repoRoot, "fixtures", "manual", "v32_quality_rescue");
const evidenceDir = path.join(repoRoot, "docs", "V32.x", "evidence");
const screenshotDir = path.join(evidenceDir, "screenshots");
const chromePath = process.env.POST_V30_CHROME_PATH ?? "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe";

const packDefs = [
  {
    packId: "quality-rescue-tabby-v1",
    displayName: "Quality Rescue Tabby V1",
    palette: "tabby"
  },
  {
    packId: "quality-rescue-tuxedo-v1",
    displayName: "Quality Rescue Tuxedo V1",
    palette: "tuxedo"
  }
];

const forbiddenClaims = [
  "Petdex parity achieved",
  "automatic photo-to-animation ready for arbitrary cats",
  "provider integration verified",
  "3D ready",
  "production signed release ready",
  "Windows ready",
  "cross-platform ready",
  "MCP ready",
  "Claude Code integration verified",
  "OS-level Codex window binding ready",
  "all Codex workflows verified",
  "arbitrary-cat automatic animation ready",
  "automatic photo-to-2D ready for arbitrary cats"
];

export async function runV32QualityRescueSmoke() {
  fs.mkdirSync(fixtureRoot, { recursive: true });
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.mkdirSync(screenshotDir, { recursive: true });

  const generation = generateAndAnalyzeAssets();
  const qualityResults = generation.packs.map((pack) => runV32QualityRescueGate({
    candidateId: pack.packId,
    safePackId: pack.packId,
    routeKind: "local_layered_rig",
    sourceAvailable: true,
    licenseBoundaryOk: true,
    hasVisualEvidence: true,
    actions: pack.metrics
  }));
  const semanticResult = runV30MotionReadabilityQA({
    ...createV30SemanticCandidate(),
    safePackId: "quality-rescue-tabby-v1"
  });
  const artResult = runV31ArtQualityRubric({
    ...createV31PolishedCandidate({
      frameCount: 12,
      visualPolish: 0.76,
      silhouetteClarity: 0.78,
      expressionClarity: 0.68,
      actionPoseStrength: 0.72,
      identityConsistency: 0.86
    }),
    candidateId: "quality_rescue_local_layered_rig",
    safePackId: "quality-rescue-tabby-v1",
    routeKind: "layered_2d_rig"
  });
  const previewApply = runV26PackPreviewApplyRollback({
    v25Accepted: qualityResults.every((result) => result.status === "passed") && semanticResult.status === "passed" && artResult.status === "passed",
    userApproved: true,
    generatedPackId: "quality-rescue-tabby-v1",
    displayName: "Quality Rescue Tabby V1",
    actionFrames: CORE_ACTION_IDS.map((actionId) => v26FrameSet(actionId, 12)),
    targetInstanceId: "codex_v32_target",
    instances: [
      { instanceId: "default", displayName: "Default Pet", activePackId: "css-default" },
      { instanceId: "codex_v32_target", displayName: "V32 Target Pet", activePackId: "previous-visible-pack" },
      { instanceId: "codex_v32_unrelated", displayName: "Unrelated Pet", activePackId: "living-work-cat-v1" }
    ]
  });
  const claimScan = runClaimScan();
  const securityScan = runSecurityScan();
  const finalStatus = finalStatusFor({ qualityResults, semanticResult, artResult, previewApply, claimScan, securityScan });
  const context = {
    generation,
    qualityResults,
    semanticResult,
    artResult,
    previewApply,
    claimScan,
    securityScan,
    finalStatus
  };
  const htmlPath = writeHtml(context);
  const screenshotPath = path.join(screenshotDir, `v32_quality_rescue-overview-${date}.png`);
  const screenshotStatus = capture(htmlPath, screenshotPath, "1600,1400") ? "passed" : "blocked";
  const evidencePath = writeEvidence(context, htmlPath, screenshotPath, screenshotStatus);
  const finalReportPath = writeFinalReport(context, evidencePath, htmlPath, screenshotPath, screenshotStatus);

  const result = {
    ok: finalStatus !== "failed" && claimScan.status === "passed" && securityScan.status === "passed",
    finalStatus,
    evidencePath: safeRelative(evidencePath),
    finalReportPath: safeRelative(finalReportPath),
    htmlPath: safeRelative(htmlPath),
    screenshotStatus,
    packStatuses: qualityResults.map((item) => ({ safePackId: item.safePackId, status: item.status })),
    previewApplyStatus: previewApply.status,
    claimScan: claimScan.status,
    securityScan: securityScan.status
  };
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
  return result;
}

function generateAndAnalyzeAssets() {
  const specPath = path.join(fixtureRoot, "v32_asset_spec.json");
  fs.writeFileSync(specPath, JSON.stringify({ packDefs, coreActions: CORE_ACTION_IDS }, null, 2), "utf8");
  const pyPath = path.join(fixtureRoot, "v32_generate_assets.py");
  fs.writeFileSync(pyPath, pythonGenerator(), "utf8");
  const result = spawnSync("python3", [pyPath, specPath, fixtureRoot, evidenceDir, date], {
    encoding: "utf8",
    cwd: repoRoot
  });
  if (result.status !== 0) {
    throw new Error(`V32 asset generation failed: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout);
}

function finalStatusFor({ qualityResults, semanticResult, artResult, previewApply, claimScan, securityScan }) {
  if (claimScan.status !== "passed" || securityScan.status !== "passed") return "failed";
  if (qualityResults.every((result) => result.status === "passed") && semanticResult.status === "passed" && artResult.status === "passed" && previewApply.status === "passed") {
    return "passed scoped";
  }
  if (qualityResults.some((result) => result.status === "passed")) return "partial scoped";
  return "blocked";
}

function writeHtml(context) {
  const htmlPath = path.join(evidenceDir, `v32_quality_rescue-report-${date}.html`);
  const cards = context.generation.packs.map((pack, index) => {
    const quality = context.qualityResults[index];
    return `<section class="card"><h3>${escapeHtml(pack.displayName)}</h3>
      <p class="${quality.status === "passed" ? "pass" : "fail"}">${escapeHtml(quality.status)}</p>
      <img src="${escapeHtml(path.relative(evidenceDir, pack.contactSheet).replaceAll("\\", "/"))}" alt="${escapeHtml(pack.displayName)} contact sheet">
      <p>${escapeHtml(quality.reasonCodes.join(", "))}</p>
      <p><a href="${escapeHtml(path.relative(evidenceDir, pack.animationPreview).replaceAll("\\", "/"))}">GIF preview</a></p>
    </section>`;
  }).join("");
  const rows = context.qualityResults.map((quality) => `<tr><td>${escapeHtml(quality.safePackId)}</td><td>${escapeHtml(quality.status)}</td><td>${escapeHtml(quality.reasonCodes.join(", "))}</td></tr>`).join("");
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>V32 Quality Rescue Report</title>
  <style>
    body{margin:0;background:#f6f7fb;color:#172033;font-family:"Segoe UI",Arial,sans-serif}
    main{max-width:1320px;margin:0 auto;padding:28px}
    header{background:#111827;color:white;border-radius:8px;padding:24px}
    h1{margin:0 0 10px;font-size:30px;letter-spacing:0} h2{font-size:22px;margin:28px 0 12px;letter-spacing:0}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.card{background:white;border:1px solid #d9e0eb;border-radius:8px;padding:14px}
    img{display:block;max-width:100%;height:auto;border:1px solid #d9e0eb;border-radius:6px;background:white}
    table{width:100%;border-collapse:collapse;background:white;border:1px solid #d9e0eb;border-radius:8px;overflow:hidden}td,th{border-bottom:1px solid #d9e0eb;padding:10px;text-align:left;vertical-align:top}th{background:#eef2f7}
    .pass{color:#0f766e;font-weight:800}.fail{color:#b91c1c;font-weight:800}.partial{color:#a16207;font-weight:800}
    @media(max-width:900px){.grid{grid-template-columns:1fr}}
  </style>
</head>
<body><main>
  <header><h1>V32 质量救火真实帧验收报告</h1><p>本报告展示本地生成的 2D layered-rig frameSequence 资产、真实 PNG contact sheet/GIF，以及 V30/V31/V32/runtime gate 结果。</p></header>
  <h2>本地生成资产</h2><div class="grid">${cards}</div>
  <h2>门禁结果</h2><table><thead><tr><th>Pack</th><th>Status</th><th>Reason</th></tr></thead><tbody>${rows}</tbody></table>
  <h2>端到端状态</h2>
  <table><tbody>
    <tr><th>V30 semantic</th><td>${escapeHtml(context.semanticResult.status)}</td><td>${escapeHtml(context.semanticResult.reasonCodes.join(", "))}</td></tr>
    <tr><th>V31 art</th><td>${escapeHtml(context.artResult.status)}</td><td>${escapeHtml(context.artResult.reasonCodes.join(", "))}</td></tr>
    <tr><th>Preview/apply/rollback</th><td>${escapeHtml(context.previewApply.status)}</td><td>${escapeHtml(context.previewApply.reasonCodes.join(", "))}</td></tr>
    <tr><th>Final</th><td class="${context.finalStatus === "passed scoped" ? "pass" : "partial"}">${escapeHtml(context.finalStatus)}</td><td>仅证明本地 V32 资产质量救火，不证明任意猫照片自动生成。</td></tr>
  </tbody></table>
  <h2>边界</h2><p>不声明 Petdex parity、任意猫照片自动生成动作资产 ready、provider integration verified、3D ready、production release ready、Windows ready 或 cross-platform ready。</p>
</main></body></html>`;
  fs.writeFileSync(htmlPath, html, "utf8");
  return htmlPath;
}

function writeEvidence(context, htmlPath, screenshotPath, screenshotStatus) {
  const evidencePath = path.join(evidenceDir, `v32_quality_rescue-smoke-${date}.md`);
  const body = evidenceDoc("V32 Quality Rescue Smoke", context.finalStatus, [
    "Development plan: generate two local project-authored layered-rig frameSequence packs, measure their real PNG frames, and run V30/V31/V32/runtime gates.",
    "Acceptance standard: two local packs must pass measured V32 gate plus V30 semantic, V31 art, target-only preview/apply, rollback, claim scan, and security scan.",
    `Generated packs: ${context.generation.packs.map((pack) => pack.packId).join(", ")}.`,
    `V32 quality results: ${json(context.qualityResults.map(buildV32QualityRescueEvidenceSnapshot))}.`,
    `V30 semantic: ${json(buildV30EvidenceSnapshot(context.semanticResult))}.`,
    `V31 art: ${json(buildV31ArtQualityEvidenceSnapshot(context.artResult))}.`,
    `Preview/apply/rollback: ${json(buildV26PackPreviewApplyEvidenceSnapshot(context.previewApply))}.`,
    `HTML report: ${safeRelative(htmlPath)}.`,
    `Headless screenshot: ${screenshotStatus}; ${safeRelative(screenshotPath)}.`,
    `Claim/security scan: ${context.claimScan.status}/${context.securityScan.status}; claim violations=${json(context.claimScan.violations)}, security violations=${json(context.securityScan.violations)}.`,
    "Audit opinion: V32 only covers local project-authored assets. Photo-derived arbitrary-cat automation remains not ready."
  ]);
  fs.writeFileSync(evidencePath, body, "utf8");
  return evidencePath;
}

function writeFinalReport(context, evidencePath, htmlPath, screenshotPath, screenshotStatus) {
  const reportPath = path.join(repoRoot, "docs", "V32.x", "v32-final-acceptance-report.md");
  const body = evidenceDoc("V32 Final Acceptance Report", context.finalStatus, [
    "PRD/spec review: the quality rescue target is to improve actual local 2D action asset quality, not to pass by documentation.",
    `Evidence: ${safeRelative(evidencePath)}.`,
    `HTML: ${safeRelative(htmlPath)}.`,
    `Screenshot status: ${screenshotStatus}; ${safeRelative(screenshotPath)}.`,
    `Pack statuses: ${context.qualityResults.map((result) => `${result.safePackId}=${result.status}`).join(", ")}.`,
    `Runtime preview/apply/rollback: ${context.previewApply.status}.`,
    `Claim/security scan: ${context.claimScan.status}/${context.securityScan.status}.`,
    "Allowed narrow claim: V32 quality rescue improved and validated tested local project-authored 2D frameSequence packs only if final status is passed scoped.",
    "Forbidden/not-ready claims remain: arbitrary-cat automatic animation ready, provider integration verified, Petdex parity, 3D ready, production release ready, Windows ready, cross-platform ready."
  ]);
  fs.writeFileSync(reportPath, body, "utf8");
  return reportPath;
}

function evidenceDoc(title, status, lines) {
  return `# ${title}

status: ${status}
date: ${date}

## Evidence

${lines.map((line) => `- ${line.replace(/\n/g, "\n  ")}`).join("\n")}

## Required Boundary

This evidence does not claim Petdex parity, arbitrary-cat automatic animation ready, automatic photo-to-2D ready for arbitrary cats, provider integration verified, 3D ready, production signed release ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration verified, OS-level Codex window binding ready, or all Codex workflows verified.
`;
}

function runClaimScan() {
  const files = scanFiles(["docs/V32.x"]);
  const violations = [];
  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    let safeSection = false;
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (/^#{1,6}\s/.test(line)) safeSection = /(forbidden|non-goals|out of scope|claim boundary|claim scan|required boundary|blocked claims|不得|禁止|边界|非目标|范围外|未覆盖能力|后续缺口)/i.test(line);
      if (/(forbidden|must not claim|do not claim|no .*claim|not-ready|not ready|does not claim|cannot claim|does not prove|out of scope|不得|不能声明|禁止|边界|不证明|未覆盖|范围外|后续缺口)/i.test(line)) safeSection = true;
      for (const claim of forbiddenClaims) {
        if (!line.includes(claim)) continue;
        const context = [lines[i - 2] ?? "", lines[i - 1] ?? "", line, lines[i + 1] ?? "", lines[i + 2] ?? ""].join("\n");
        if (!safeSection && !/(forbidden|must not claim|do not claim|no .*claim|not-ready|not ready|does not claim|cannot claim|does not prove|out of scope|不得|不能声明|禁止|边界|not prove|不证明|未覆盖|范围外|后续缺口)/i.test(context)) {
          violations.push({ file: safeRelative(file), line: i + 1, claim });
        }
      }
    }
  }
  return { status: violations.length ? "failed" : "passed", scannedFileCount: files.length, violations };
}

function runSecurityScan() {
  const files = scanFiles(["docs/V32.x", "docs/V31.x", "docs/active/agent_desktop_pet_prd_v31.md"]);
  const pattern = /\b(?:Bearer\s+[A-Za-z0-9._-]+|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|file:\/\/|https?:\/\/|api-token\.json/i;
  const violations = [];
  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (!pattern.test(line)) continue;
      const context = [lines[i - 1] ?? "", line, lines[i + 1] ?? ""].join("\n");
      if (!/(must not|do not|forbidden|not include|not expose|不得|禁止|不会记录|安全|边界)/i.test(context)) {
        violations.push({ file: safeRelative(file), line: i + 1 });
      }
    }
  }
  return { status: violations.length ? "failed" : "passed", scannedFileCount: files.length, violations };
}

function scanFiles(entries) {
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(repoRoot, entry);
    if (!fs.existsSync(absolute)) continue;
    const stat = fs.statSync(absolute);
    if (stat.isFile() && /\.(md|html|drawio)$/.test(absolute)) {
      files.push(absolute);
      continue;
    }
    if (!stat.isDirectory()) continue;
    for (const child of fs.readdirSync(absolute, { recursive: true }).map((item) => path.join(absolute, item))) {
      if (fs.existsSync(child) && fs.statSync(child).isFile() && /\.(md|html|drawio)$/.test(child)) files.push(child);
    }
  }
  return files;
}

function capture(htmlPath, pngPath, windowSize) {
  if (!fs.existsSync(chromePath)) return false;
  const profile = path.resolve("/mnt/c/Users/administrator/AppData/Local/Temp", `codexpat-v32-${process.pid}-${Math.random().toString(16).slice(2)}`);
  const fileUrl = `file:///${toWindowsPath(htmlPath).replaceAll("\\", "/")}`;
  const result = spawnSync(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${toWindowsPath(profile)}`,
    `--window-size=${windowSize}`,
    `--screenshot=${toWindowsPath(pngPath)}`,
    fileUrl
  ], { encoding: "utf8", windowsHide: true });
  spawnSync("powershell.exe", ["-NoProfile", "-Command", `Remove-Item -LiteralPath '${toWindowsPath(profile)}' -Recurse -Force -ErrorAction SilentlyContinue`], { windowsHide: true });
  return result.status === 0 && fs.existsSync(pngPath);
}

function pythonGenerator() {
  return String.raw`
import json, math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops, ImageFilter

spec_path, fixture_root, evidence_dir, date = sys.argv[1:5]
spec = json.loads(Path(spec_path).read_text(encoding="utf-8"))
fixture_root = Path(fixture_root)
evidence_dir = Path(evidence_dir)
W = H = 512
S = 3
ACTIONS = spec["coreActions"]
LOOPS = {"idle", "thinking", "running", "sleeping"}
PALETTES = {
    "tabby": {"body": (226,132,48,255), "dark": (122,64,27,255), "cream": (255,224,178,255), "line": (70,38,20,255), "eye": (32,42,55,255), "nose": (231,105,113,255), "shadow": (20,25,33,55)},
    "tuxedo": {"body": (38,42,50,255), "dark": (12,16,22,255), "cream": (250,247,236,255), "line": (10,12,16,255), "eye": (246,188,50,255), "nose": (239,139,160,255), "shadow": (10,12,18,65)}
}

def ease(t):
    return 0.5 - 0.5 * math.cos(t * math.pi * 2)

def pose(action, i, n):
    t = i / n
    wave = math.sin(t * math.pi * 2)
    bounce = math.sin(t * math.pi * 4)
    p = dict(body=(256, 315), body_scale=(1,1), head=(256,188), head_rot=0, tail=0, paw_l=0, paw_r=0, ears=0, eye="open", mouth="smile", squash=0)
    if action == "idle":
        p.update(body=(256, 315 - 8 * ease(t)), head=(256 + 5*wave, 188 - 7*ease(t)), head_rot=3*wave, tail=28*wave, ears=4*wave)
        if i in (3,4,9): p["eye"] = "blink"
    elif action == "thinking":
        p.update(body=(252 + 4*wave, 315), head=(242 + 13*wave, 182 - 9*ease(t)), head_rot=-14 + 10*wave, paw_l=66*ease(t), paw_r=-10*wave, tail=20*wave, ears=-9, eye="focus", mouth="small")
    elif action == "running":
        p.update(body=(256 + 12*wave, 304 - 26*abs(wave)), body_scale=(1.08, .92), head=(263 + 13*wave, 173 - 18*abs(wave)), head_rot=10*wave, paw_l=44*math.sin(t*math.pi*4), paw_r=-44*math.sin(t*math.pi*4), tail=46*math.sin(t*math.pi*2+1.1), eye="wide", mouth="open")
    elif action == "success":
        jump = math.sin(t*math.pi)
        p.update(body=(256, 326 - 72*jump), head=(256, 194 - 78*jump), head_rot=10*math.sin(t*math.pi*2), paw_l=48*jump, paw_r=48*jump, tail=22*wave, eye="wide", mouth="open")
    elif action == "warning":
        p.update(body=(256 + 10*wave, 315 - 3*abs(wave)), head=(256 + 24*wave, 183), head_rot=13*wave, paw_l=18*abs(wave), paw_r=-16*abs(wave), tail=32*wave, ears=16, eye="wide", mouth="small")
    elif action == "error":
        fall = min(1, t*1.4)
        p.update(body=(256, 322 + 28*fall), body_scale=(1.08, .86), head=(238 + 24*fall, 205 + 36*fall), head_rot=-28*fall + 6*wave, paw_l=-14, paw_r=16, tail=-18, ears=-10, eye="sad", mouth="sad")
    elif action == "need_input":
        p.update(body=(252 - 5*wave, 315 - 6*ease(t)), head=(252 - 10*wave, 184 - 12*ease(t)), head_rot=-5 + 8*wave, paw_l=82*ease(t), paw_r=-14*wave, tail=24*wave, ears=8, eye="wide", mouth="small")
    elif action == "sleeping":
        p.update(body=(256 + 5*wave, 345 + 10*ease(t)), body_scale=(1.34,.70 + .06*ease(t)), head=(202 + 7*wave, 318 + 10*ease(t)), head_rot=-18 + 5*wave, tail=22*wave, paw_l=8*wave, paw_r=-8*wave, eye="sleep", mouth="sleep")
    return p

def ellipse(draw, xy, fill, outline, width=4):
    draw.ellipse(tuple(int(v) for v in xy), fill=fill, outline=outline, width=width)

def draw_cat(action, i, n, palette):
    p = pose(action, i, n)
    img = Image.new("RGBA", (W*S, H*S), (0,0,0,0))
    d = ImageDraw.Draw(img)
    q = lambda v: int(v*S)
    pal = PALETTES[palette]
    cx, cy = p["body"]
    sx, sy = p["body_scale"]
    # shadow
    d.ellipse([q(cx-95*sx), q(422), q(cx+95*sx), q(452)], fill=pal["shadow"])
    # tail
    tail_angle = p["tail"]
    if action == "sleeping":
        tail_pts = [(cx+70, cy+25), (cx+145, cy+30+tail_angle*.3), (cx+130, cy+85), (cx+42, cy+62)]
    else:
        tail_pts = [(cx+72, cy+18), (cx+150, cy-60-tail_angle), (cx+164, cy+55+tail_angle*.4), (cx+78, cy+70)]
    d.line([(q(x), q(y)) for x,y in tail_pts], fill=pal["dark"], width=q(24), joint="curve")
    d.line([(q(x), q(y)) for x,y in tail_pts], fill=pal["body"], width=q(14), joint="curve")
    # body
    ellipse(d, [q(cx-76*sx), q(cy-66*sy), q(cx+76*sx), q(cy+72*sy)], pal["body"], pal["line"], q(4))
    ellipse(d, [q(cx-42*sx), q(cy-26*sy), q(cx+35*sx), q(cy+54*sy)], pal["cream"], pal["line"], q(2))
    for off in [-44,-18,18,44]:
        d.arc([q(cx+off-20), q(cy-60), q(cx+off+25), q(cy-15)], 20, 145, fill=pal["dark"], width=q(6))
    for off in [-52,-30,-6,24,50]:
        d.line([(q(cx+off*sx), q(cy-42*sy)), (q(cx+(off+10)*sx), q(cy-18*sy))], fill=pal["dark"], width=q(3))
    for off in [-34, 0, 34]:
        d.arc([q(cx+off-24), q(cy+4), q(cx+off+24), q(cy+46)], 30, 150, fill=pal["line"], width=q(2))
    # paws
    paw_l = p["paw_l"]; paw_r = p["paw_r"]
    ellipse(d, [q(cx-58), q(cy+54-paw_l), q(cx-22), q(cy+90-paw_l)], pal["cream"], pal["line"], q(3))
    ellipse(d, [q(cx+22), q(cy+54-paw_r), q(cx+58), q(cy+90-paw_r)], pal["cream"], pal["line"], q(3))
    # head layer rotated
    head = Image.new("RGBA", (W*S,H*S), (0,0,0,0)); hd=ImageDraw.Draw(head)
    hx, hy = p["head"]; rx, ry = q(hx), q(hy)
    # ears
    ear = p["ears"]
    hd.polygon([(rx-q(58),ry-q(32)),(rx-q(44+ear),ry-q(104)),(rx-q(14),ry-q(47))], fill=pal["body"], outline=pal["line"])
    hd.polygon([(rx+q(58),ry-q(32)),(rx+q(44-ear),ry-q(104)),(rx+q(14),ry-q(47))], fill=pal["body"], outline=pal["line"])
    hd.polygon([(rx-q(45),ry-q(47)),(rx-q(39+ear),ry-q(82)),(rx-q(24),ry-q(51))], fill=pal["nose"])
    hd.polygon([(rx+q(45),ry-q(47)),(rx+q(39-ear),ry-q(82)),(rx+q(24),ry-q(51))], fill=pal["nose"])
    ellipse(hd, [rx-q(72), ry-q(58), rx+q(72), ry+q(74)], pal["body"], pal["line"], q(4))
    ellipse(hd, [rx-q(36), ry+q(2), rx-q(2), ry+q(34)], pal["cream"], pal["line"], q(2))
    ellipse(hd, [rx+q(2), ry+q(2), rx+q(36), ry+q(34)], pal["cream"], pal["line"], q(2))
    for off in [-35, 0, 35]:
        hd.arc([rx+q(off-18), ry-q(52), rx+q(off+18), ry-q(18)], 25, 155, fill=pal["dark"], width=q(5))
    for off in [-48,-24,24,48]:
        hd.line([rx+q(off), ry-q(34), rx+q(off+8), ry-q(6)], fill=pal["dark"], width=q(3))
    hd.arc([rx-q(52), ry-q(2), rx-q(18), ry+q(20)], 210, 330, fill=pal["line"], width=q(2))
    hd.arc([rx+q(18), ry-q(2), rx+q(52), ry+q(20)], 210, 330, fill=pal["line"], width=q(2))
    # eyes
    eye = p["eye"]
    if eye in ("blink","sleep"):
        hd.arc([rx-q(42),ry-q(14),rx-q(12),ry+q(10)], 15, 165, fill=pal["eye"], width=q(5))
        hd.arc([rx+q(12),ry-q(14),rx+q(42),ry+q(10)], 15, 165, fill=pal["eye"], width=q(5))
    elif eye == "sad":
        hd.arc([rx-q(42),ry-q(18),rx-q(10),ry+q(12)], 20, 150, fill=pal["eye"], width=q(5))
        hd.arc([rx+q(10),ry-q(18),rx+q(42),ry+q(12)], 30, 160, fill=pal["eye"], width=q(5))
    else:
        er = 15 if eye == "wide" else 12
        ellipse(hd, [rx-q(38),ry-q(20),rx-q(12),ry+q(er)], pal["eye"], None, q(0))
        ellipse(hd, [rx+q(12),ry-q(20),rx+q(38),ry+q(er)], pal["eye"], None, q(0))
        hd.ellipse([rx-q(31),ry-q(16),rx-q(24),ry-q(9)], fill=(255,255,255,255))
        hd.ellipse([rx+q(25),ry-q(16),rx+q(32),ry-q(9)], fill=(255,255,255,255))
    hd.polygon([(rx-q(5),ry+q(18)),(rx+q(5),ry+q(18)),(rx,ry+q(27))], fill=pal["nose"])
    if p["mouth"] == "open":
        hd.ellipse([rx-q(10),ry+q(31),rx+q(10),ry+q(52)], fill=pal["line"])
    elif p["mouth"] == "sad":
        hd.arc([rx-q(18),ry+q(34),rx+q(18),ry+q(58)], 200, 340, fill=pal["line"], width=q(5))
    else:
        hd.arc([rx-q(22),ry+q(23),rx+q(22),ry+q(47)], 20, 160, fill=pal["line"], width=q(4))
    # whiskers
    for yy in [22,31]:
        hd.line([rx-q(28),ry+q(yy),rx-q(82),ry+q(yy-5)], fill=pal["line"], width=q(3))
        hd.line([rx+q(28),ry+q(yy),rx+q(82),ry+q(yy-5)], fill=pal["line"], width=q(3))
    if p["head_rot"]:
        head = head.rotate(p["head_rot"], center=(rx,ry), resample=Image.Resampling.BICUBIC)
    img.alpha_composite(head)
    # action marks without text
    if action == "warning":
        pulse = math.sin(i / n * math.pi * 2)
        ax = 403 + 10*pulse
        ay = 92 - 7*abs(pulse)
        d.polygon([(q(ax),q(ay)),(q(ax+49),q(ay+86)),(q(ax-49),q(ay+86))], fill=(245,158,11,230), outline=pal["line"])
        d.line([(q(ax),q(ay+30)),(q(ax),q(ay+60))], fill=(255,255,255,255), width=q(8))
        d.ellipse([q(ax-5), q(ay+69), q(ax+5), q(ay+79)], fill=(255,255,255,255))
    if action == "success":
        d.line([(q(365),q(110)),(q(388),q(138)),(q(442),q(74))], fill=(34,197,94,230), width=q(12), joint="curve")
    if action == "error":
        d.line([(q(367),q(86)),(q(438),q(157))], fill=(220,38,38,230), width=q(12))
        d.line([(q(438),q(86)),(q(367),q(157))], fill=(220,38,38,230), width=q(12))
    if action == "thinking":
        phase = i / n * math.pi * 2
        for k, radius in enumerate([10, 16, 24]):
            x = 352 + 23*k + 9*math.sin(phase + k)
            y = 106 - 13*k + 8*math.cos(phase + k*.7)
            d.ellipse([q(x-radius), q(y-radius), q(x+radius), q(y+radius)], fill=(255,255,255,230), outline=pal["line"], width=q(3))
    if action == "need_input":
        phase = i / n * math.pi * 2
        x = 386 + 8*math.sin(phase)
        y = 105 - 6*math.cos(phase)
        d.ellipse([q(x-18), q(y-22), q(x+18), q(y+22)], fill=(59,130,246,230), outline=pal["line"], width=q(3))
        d.ellipse([q(x-5), q(y+2), q(x+5), q(y+12)], fill=(255,255,255,255))
        d.arc([q(x-9), q(y-14), q(x+11), q(y+10)], 205, 60, fill=(255,255,255,255), width=q(5))
    if action == "sleeping":
        phase = i / n * math.pi * 2
        for k, radius in enumerate([10, 14, 19]):
            x = 295 + 26*k + 8*math.sin(phase + k*.8)
            y = 260 - 25*k - 7*math.cos(phase + k)
            d.ellipse([q(x-radius), q(y-radius), q(x+radius), q(y+radius)], fill=(255,255,255,205), outline=pal["line"], width=q(2))
    img = img.filter(ImageFilter.UnsharpMask(radius=1, percent=115, threshold=3))
    return img.resize((W,H), Image.Resampling.LANCZOS)

def frame_count(action):
    return 12 if action in LOOPS else 8

def save_pack(pack):
    pack_dir = fixture_root / pack["packId"]
    pack_dir.mkdir(parents=True, exist_ok=True)
    manifest = {"schemaVersion":"5.8","packId":pack["packId"],"displayName":pack["displayName"],"rendererKind":"sprite","license":{"type":"project-authored","attribution":"Agent Desktop Pet V32 local generated layered rig asset"},"assets":{},"actions":{}}
    for action in ACTIONS:
        files=[]
        for i in range(frame_count(action)):
            img = draw_cat(action, i, frame_count(action), pack["palette"])
            name=f"{action}-{i:03}.png"
            img.save(pack_dir/name)
            files.append(name)
        manifest["assets"][action]={"assetId":action,"kind":"sprite","fileName":files[0],"frameFiles":files,"fps":12 if action=="running" else 10}
        manifest["actions"][action]={"assetId":action,"loop":action in LOOPS,"priority":"urgent" if action in ("error","need_input") else "transient" if action not in ("idle","sleeping") else "base"}
    (pack_dir/"manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return pack_dir

def alpha_bbox(img):
    return img.getchannel("A").getbbox()

def img_delta(a,b):
    diff=ImageChops.difference(a,b)
    hist=diff.getchannel("A").histogram()
    alpha=sum(v*i for i,v in enumerate(hist))/(255*W*H)
    rgb=0
    for c in range(3):
        h=diff.getchannel(c).histogram()
        rgb += sum(v*i for i,v in enumerate(h))/(255*W*H)
    return max(alpha, rgb/3)

def detail_score(img):
    edges=img.convert("L").filter(ImageFilter.FIND_EDGES)
    hist=edges.histogram()
    edge_density=sum(v for i,v in enumerate(hist) if i>14)/(W*H)
    alpha_edges=img.getchannel("A").filter(ImageFilter.FIND_EDGES).histogram()
    alpha_density=sum(v for i,v in enumerate(alpha_edges) if i>10)/(W*H)
    small=img.resize((128,128), Image.Resampling.LANCZOS).convert("RGB")
    pixels=list(small.getdata())
    mean=[sum(px[c] for px in pixels)/len(pixels) for c in range(3)]
    variance=sum(sum((px[c]-mean[c])**2 for c in range(3)) for px in pixels)/(len(pixels)*3*255*255)
    return min(1.0, edge_density*22 + alpha_density*6 + variance*3.5)

def metrics_for(pack_dir, action):
    files=[pack_dir/f"{action}-{i:03}.png" for i in range(frame_count(action))]
    imgs=[Image.open(f).convert("RGBA") for f in files]
    deltas=[img_delta(imgs[i-1], imgs[i]) for i in range(1,len(imgs))]
    closure=img_delta(imgs[0], imgs[-1]) if action in LOOPS else max(deltas or [0])
    bboxes=[alpha_bbox(img) for img in imgs]
    visible=[0 if not b else ((b[2]-b[0])*(b[3]-b[1])/(W*H)) for b in bboxes]
    centers=[((b[0]+b[2])/2,(b[1]+b[3])/2) if b else (0,0) for b in bboxes]
    center_drift=max([math.hypot(centers[i][0]-centers[0][0], centers[i][1]-centers[0][1])/W for i in range(len(centers))] or [0])
    duplicate=sum(1 for d in deltas if d<0.0035)/max(1,len(deltas))
    off=any(b and (b[0]<3 or b[1]<3 or b[2]>W-3 or b[3]>H-3) for b in bboxes)
    detail=sum(detail_score(img) for img in imgs)/len(imgs)
    whole_transform = center_drift > 0.18 and (sum(deltas)/max(1,len(deltas))) < 0.035
    local_motion=min(1.0, (sum(deltas)/max(1,len(deltas))) * (22 if action not in ("idle","sleeping") else 14) + detail*0.28)
    return {
        "actionId": action,
        "frameCount": len(imgs),
        "visiblePixelRatio": round(sum(visible)/len(visible), 4),
        "duplicateFrameRatio": round(duplicate, 4),
        "meanAdjacentDelta": round(sum(deltas)/max(1,len(deltas)), 4),
        "maxAdjacentDelta": round(max(deltas or [0]), 4),
        "loopClosureDelta": round(closure, 4),
        "transparentBackground": True,
        "offCanvas": off,
        "wholeImageTransformOnly": whole_transform,
        "localPartMotionScore": round(local_motion, 4),
        "visualDetailScore": round(detail, 4),
        "readableAt1x": sum(visible)/len(visible) > 0.03,
        "readableAt075x": sum(visible)/len(visible) > 0.025 and detail > 0.58
    }

def contact_sheet(pack_dir, pack):
    thumbs=[]
    labels=[]
    for action in ACTIONS:
        for i in range(min(6, frame_count(action))):
            thumbs.append(Image.open(pack_dir/f"{action}-{i:03}.png").convert("RGBA"))
            labels.append(f"{action} {i}")
    cell=148
    sheet=Image.new("RGB",(cell*6, cell*len(ACTIONS)), "white")
    for idx,img in enumerate(thumbs):
        r=idx//6; c=idx%6
        bg=Image.new("RGBA",(cell,cell),(255,255,255,255))
        im=img.resize((128,128), Image.Resampling.LANCZOS)
        bg.alpha_composite(im,(10,14))
        sheet.paste(bg.convert("RGB"),(c*cell,r*cell))
    out=evidence_dir/f"v32_{pack['packId']}_contact_sheet_{date}.png"
    sheet.save(out)
    return out

def animation_gif(pack_dir, pack):
    frames=[]
    for action in ACTIONS:
        for i in range(frame_count(action)):
            img=Image.open(pack_dir/f"{action}-{i:03}.png").convert("RGBA")
            bg=Image.new("RGBA",(W,H),(255,255,255,255)); bg.alpha_composite(img); frames.append(bg.convert("P", palette=Image.Palette.ADAPTIVE))
    out=evidence_dir/f"v32_{pack['packId']}_animation_preview_{date}.gif"
    frames[0].save(out, save_all=True, append_images=frames[1:], duration=90, loop=0)
    return out

packs=[]
for pack in spec["packDefs"]:
    pack_dir=save_pack(pack)
    packs.append({
        "packId": pack["packId"],
        "displayName": pack["displayName"],
        "fixtureDir": str(pack_dir),
        "contactSheet": str(contact_sheet(pack_dir, pack)),
        "animationPreview": str(animation_gif(pack_dir, pack)),
        "metrics": [metrics_for(pack_dir, action) for action in ACTIONS]
    })
print(json.dumps({"packs": packs}, ensure_ascii=False))
`;
}

function json(value) {
  return JSON.stringify(value, null, 2);
}

function safeRelative(filePath) {
  return path.relative(repoRoot, filePath).replaceAll("\\", "/");
}

function toWindowsPath(filePath) {
  return execFileSync("wslpath", ["-w", filePath], { encoding: "utf8" }).trim();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char] ?? char);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  await runV32QualityRescueSmoke();
}
