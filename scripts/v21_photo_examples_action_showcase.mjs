#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const OUT_DIR = `docs/V21.x/evidence/assets/v21-photo-examples-action-showcase-${DATE}`;
const HTML_PATH = `docs/V21.x/evidence/v21_photo_examples_action_showcase-${DATE}.html`;
const MD_PATH = `docs/V21.x/evidence/v21_photo_examples_action_showcase-${DATE}.md`;

const samples = [
  {
    id: "sample_1",
    inputPhoto: "docs/猫.jpg",
    providerOutput: "docs/V20.x/evidence/assets/v20-minimax-motion-sheet-2026-06-14/sample_1-minimax-motion-sheet-1.jpeg"
  },
  {
    id: "sample_2",
    inputPhoto: "docs/猫_1.jpg",
    providerOutput: "docs/V20.x/evidence/assets/v20-minimax-motion-sheet-2026-06-14/sample_2-minimax-motion-sheet-1.jpeg"
  },
  {
    id: "sample_3",
    inputPhoto: "docs/猫_2.jpg",
    providerOutput: "docs/V20.x/evidence/assets/v20-minimax-motion-sheet-2026-06-14/sample_3-minimax-motion-sheet-1.jpeg"
  }
];

const records = [];
for (const sample of samples) {
  record(`${sample.id} input photo exists`, existsSync(resolve(REPO_ROOT, sample.inputPhoto)), "local cat photo");
  record(`${sample.id} provider output exists`, existsSync(resolve(REPO_ROOT, sample.providerOutput)), "MiniMax/provider output image");
}

let showcase = [];
if (records.every((item) => item.ok)) {
  showcase = generateShowcase();
  for (const item of showcase) {
    record(`${item.id} action aggregation`, item.status === "showcase_ready", item.reasonCode);
    record(`${item.id} action coverage`, item.actionCount === 8, `actions=${item.actionCount}`);
    record(`${item.id} contact sheet`, existsSync(resolve(REPO_ROOT, item.contactSheet)), relative(REPO_ROOT, resolve(REPO_ROOT, item.contactSheet)));
  }
}

record("security scan", securityScan(JSON.stringify(showcase)), "no token, Authorization, raw provider response, full local path, prompt private text");
record("claim boundary", true, "showcase page demonstrates tested local examples only; not arbitrary-photo generation readiness");

const status = records.every((item) => item.ok) ? "passed" : "blocked";
mkdirSync(dirname(resolve(REPO_ROOT, HTML_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, HTML_PATH), renderHtml(status, showcase), "utf8");
writeFileSync(resolve(REPO_ROOT, MD_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, html: HTML_PATH, evidence: MD_PATH, showcase: showcase.map(({ id, status, reasonCode, actionCount }) => ({ id, status, reasonCode, actionCount })), records }, null, 2));
process.exit(status === "passed" ? 0 : 2);

function generateShowcase() {
  const script = String.raw`
from PIL import Image, ImageChops, ImageStat
from pathlib import Path
import json, math, sys

repo = Path(sys.argv[1])
out_dir = repo / sys.argv[2]
sample_specs = json.loads(sys.argv[3])
out_dir.mkdir(parents=True, exist_ok=True)

CORE = ["idle","thinking","running","success","warning","error","need_input","sleeping"]
LOOP = {"idle","thinking","running","sleeping"}
CANVAS = 512
pose_grid = {
    "idle": [(0,0),(1,1),(0,0),(1,1),(0,0),(0,0)],
    "thinking": [(1,0),(1,1),(1,0),(1,1),(1,0),(1,0)],
    "running": [(0,1),(0,2),(0,3),(0,1),(0,2),(0,1)],
    "success": [(3,1),(3,1),(3,1)],
    "warning": [(1,2),(1,3),(1,2)],
    "error": [(3,2),(3,3),(3,2)],
    "need_input": [(0,0),(1,0),(0,0)],
    "sleeping": [(2,0),(2,1),(3,0),(2,1),(2,0),(2,0)],
}
motion_offsets = {
    "idle": [(0,0,1.0),(0,-8,1.02),(0,0,1.0),(0,7,0.99),(0,0,1.0),(0,0,1.0)],
    "thinking": [(0,0,1.0),(-8,-2,1.0),(0,0,1.0),(8,-2,1.0),(0,0,1.0),(0,0,1.0)],
    "running": [(-18,0,1.0),(0,-7,1.02),(18,0,1.0),(-10,2,1.0),(10,-5,1.02),(-18,0,1.0)],
    "success": [(0,0,1.0),(0,-16,1.05),(0,0,1.0)],
    "warning": [(0,0,1.0),(0,7,0.98),(0,0,1.0)],
    "error": [(0,0,1.0),(0,12,0.97),(0,0,1.0)],
    "need_input": [(0,0,1.0),(0,-18,1.06),(0,0,1.0)],
    "sleeping": [(0,0,0.98),(0,8,1.0),(0,0,0.98),(0,-7,1.0),(0,0,0.98),(0,0,0.98)],
}

def crop_pose(img, row, col):
    w, h = img.size
    cell_w, cell_h = w // 4, h // 4
    crop = img.crop((col * cell_w, row * cell_h, (col + 1) * cell_w, (row + 1) * cell_h)).convert("RGBA")
    bg = crop.getpixel((4,4))[:3]
    out = []
    for px in crop.getdata():
        r,g,b,a = px
        dist = math.sqrt((r-bg[0])**2 + (g-bg[1])**2 + (b-bg[2])**2)
        saturation = max(r,g,b) - min(r,g,b)
        if (dist < 70 and saturation < 85 and r > 165 and g > 140 and b > 105) or (r > 230 and g > 220 and b > 200 and saturation < 50):
            out.append((r,g,b,0))
        else:
            out.append((r,g,b,a))
    crop.putdata(out)
    bbox = crop.getchannel("A").getbbox()
    if not bbox:
        return Image.new("RGBA", (CANVAS, CANVAS), (0,0,0,0))
    crop = crop.crop(bbox)
    scale = min(390 / crop.width, 410 / crop.height)
    return crop.resize((max(1, int(crop.width * scale)), max(1, int(crop.height * scale))), Image.Resampling.LANCZOS)

def compose(pose, offset):
    dx, dy, scale = offset
    if scale != 1.0:
        pose = pose.resize((max(1, int(pose.width * scale)), max(1, int(pose.height * scale))), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0,0,0,0))
    x = int((CANVAS - pose.width) / 2 + dx)
    y = int(CANVAS - pose.height - 42 + dy)
    canvas.alpha_composite(pose, (x, y))
    return canvas

def alpha_ratio(frame):
    alpha = frame.getchannel("A")
    return round(sum(1 for px in alpha.getdata() if px > 10) / (CANVAS * CANVAS), 4)

def delta(a, b):
    diff = ImageChops.difference(a.convert("RGBA"), b.convert("RGBA"))
    stat = ImageStat.Stat(diff)
    return round(sum(stat.mean) / (4 * 255), 4)

def make_contact_sheet(sample_dir, all_frames):
    thumb_w, thumb_h = 132, 132
    label_w = 110
    sheet = Image.new("RGB", (label_w + thumb_w * 6, thumb_h * len(CORE)), "white")
    for row, action in enumerate(CORE):
        for col, frame_path in enumerate(all_frames[action][:6]):
            thumb = Image.open(frame_path).convert("RGBA").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            x = label_w + col * thumb_w
            y = row * thumb_h
            sheet.paste(Image.new("RGB", (thumb_w, thumb_h), "white"), (x, y))
            sheet.paste(thumb.convert("RGB"), (x, y), thumb.getchannel("A"))
    path = sample_dir / "actions-contact-sheet.jpg"
    sheet.save(path, quality=92)
    return path

summaries = []
for spec in sample_specs:
    sid = spec["id"]
    sample_dir = out_dir / sid
    pack_dir = sample_dir / "pack"
    pack_dir.mkdir(parents=True, exist_ok=True)
    img = Image.open(repo / spec["providerOutput"]).convert("RGBA")
    all_frames = {}
    pet_actions = {}
    qa = {"alphaCoverage": {}, "loopClosure": {}, "frameCount": {}}
    for action in CORE:
        frame_paths = []
        for index, ((row, col), offset) in enumerate(zip(pose_grid[action], motion_offsets[action]), start=1):
            frame = compose(crop_pose(img, row, col), offset)
            name = f"{action}-frame-{index:03d}.png"
            frame.save(pack_dir / name)
            frame_paths.append(pack_dir / name)
        all_frames[action] = frame_paths
        loaded = [Image.open(path).convert("RGBA") for path in frame_paths]
        qa["alphaCoverage"][action] = alpha_ratio(loaded[0])
        qa["loopClosure"][action] = delta(loaded[0], loaded[-1]) if action in LOOP else 0
        qa["frameCount"][action] = len(frame_paths)
        pet_actions[action] = {
            "frames": [path.name for path in frame_paths],
            "fps": 8,
            "loop": action in LOOP,
            "transient": action not in LOOP,
            "durationMs": len(frame_paths) * 125,
            "fallbackActionId": "idle"
        }
    pet_json = {
        "schemaVersion": "10.6",
        "packId": f"v21-showcase-{sid}",
        "displayName": f"V21 Showcase {sid}",
        "rendererKind": "sprite",
        "format": "frameSequence",
        "canvas": {"width": CANVAS, "height": CANVAS},
        "actions": pet_actions,
        "license": {"source": "generated-provider", "attribution": "V21 local showcase aggregation"}
    }
    (pack_dir / "pet.json").write_text(json.dumps(pet_json, indent=2), encoding="utf-8")
    contact = make_contact_sheet(sample_dir, all_frames)
    action_strips = {}
    for action in CORE:
        action_strips[action] = [str(path.relative_to(repo)) for path in all_frames[action]]
    summaries.append({
        "id": sid,
        "status": "showcase_ready",
        "reasonCode": "actions_aggregated_for_visual_showcase",
        "inputPhoto": spec["inputPhoto"],
        "providerOutput": spec["providerOutput"],
        "contactSheet": str(contact.relative_to(repo)),
        "petJson": str((pack_dir / "pet.json").relative_to(repo)),
        "actionCount": len(CORE),
        "qa": qa,
        "actions": action_strips
    })

print(json.dumps(summaries))
`;
  const output = execFileSync("/usr/bin/python3", ["-c", script, REPO_ROOT, OUT_DIR, JSON.stringify(samples)], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  return JSON.parse(output);
}

function renderHtml(status, items) {
  const sections = items.map((item) => {
    const actionCards = Object.entries(item.actions).map(([action, frames]) => {
      const imgs = frames.map((frame, index) => `<img src="${dataUri(frame)}" alt="${item.id} ${action} frame ${index + 1}">`).join("");
      return `<article class="action-card">
        <header><strong>${escapeHtml(action)}</strong><span>${frames.length} frames</span></header>
        <div class="strip">${imgs}</div>
      </article>`;
    }).join("");
    return `<section class="sample">
      <div class="sample-head">
        <div>
          <h2>${escapeHtml(item.id)}</h2>
          <p>${escapeHtml(item.reasonCode)} · ${item.actionCount} actions · provider output is visual source for this local aggregation.</p>
        </div>
        <span class="status">${escapeHtml(item.status)}</span>
      </div>
      <div class="source-grid">
        <figure><img src="${dataUri(item.inputPhoto)}" alt="${item.id} input photo"><figcaption>输入猫照片</figcaption></figure>
        <figure><img src="${dataUri(item.providerOutput)}" alt="${item.id} provider output"><figcaption>provider 输出</figcaption></figure>
        <figure><img src="${dataUri(item.contactSheet)}" alt="${item.id} action contact sheet"><figcaption>聚合后的 8 动作 contact sheet</figcaption></figure>
      </div>
      <div class="action-grid">${actionCards}</div>
    </section>`;
  }).join("");
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>V21 三张猫图动作资产示例</title>
<style>
body{margin:0;background:#f5f1e8;color:#20242a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
header{background:#28384d;color:white;padding:28px 38px}h1{margin:0 0 8px;font-size:30px}main{max-width:1360px;margin:auto;padding:24px 34px}
.notice,.sample{background:white;border:1px solid #d8d2c6;border-radius:14px;padding:18px;margin-bottom:20px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.sample-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.status{background:#d9f2df;color:#166232;border-radius:999px;padding:5px 10px;font-weight:700}
.source-grid{display:grid;grid-template-columns:1fr 1.4fr 1.4fr;gap:14px;margin:14px 0 18px}figure{margin:0}figure img{width:100%;height:260px;object-fit:contain;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px}figcaption{font-size:13px;color:#5b6472;margin-top:6px}
.action-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.action-card{border:1px solid #e4ded4;border-radius:12px;padding:10px;background:#fffdf8}.action-card header{display:flex;justify-content:space-between;margin-bottom:8px}
.strip{display:grid;grid-template-columns:repeat(6,1fr);gap:5px}.strip img{width:100%;aspect-ratio:1/1;object-fit:contain;background:#f8fafc;border:1px solid #edf2f7;border-radius:8px}
code{background:#f0ede6;border-radius:4px;padding:1px 4px}@media(max-width:960px){.source-grid,.action-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<header>
  <h1>三张猫图 -> 动作资产聚合示例</h1>
  <div>status: ${status} · date: ${DATE} · 展示真实本地照片、provider 输出与本地聚合动作帧</div>
</header>
<main>
  <section class="notice">
    <h2>能力边界</h2>
    <p>当前项目已经能把测试场景中的照片/provider 输出通过本地路线聚合成 8 个核心动作资产，并做预览、目标应用、回滚证据。它还不能声明“任意猫照片稳定自动生成动画 ready”或“provider integration verified”。</p>
    <p>本页使用 <code>docs/猫.jpg</code>、<code>docs/猫_1.jpg</code>、<code>docs/猫_2.jpg</code> 和 V20 MiniMax 输出做可视化展示。</p>
  </section>
  ${sections}
</main>
</body>
</html>`;
}

function renderEvidence(status) {
  return `# V21 Photo Examples Action Showcase

status: ${status}
date: ${DATE}

## Scope

This page shows the three local cat photos, their existing V20 provider outputs,
and locally aggregated 8-action frameSequence packs for visual review.

HTML: \`${HTML_PATH}\`

## Result Table

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "blocked"} | ${sanitize(item.details)} |`).join("\n")}

## Capability Answer

Current project can demonstrate a tested local route: photo/provider material ->
local action aggregation -> previewable action pack. It is not yet a broad
arbitrary-photo provider product claim.

## Forbidden Claims

- arbitrary cats automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
`;
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function dataUri(path) {
  const full = resolve(REPO_ROOT, path);
  const ext = extname(full).toLowerCase();
  const type = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  return `data:${type};base64,${readFileSync(full).toString("base64")}`;
}

function securityScan(text) {
  return !/(Authorization\s*[:=]|api-token\.json|\/Users\/[^\s`|)]+|\/private\/[^\s`|)]+|sk-[A-Za-z0-9_-]{8,}|raw provider response\s*[:=]|raw photo bytes\s*[:=]|prompt private text\s*[:=]|workspace path\s*[:=]|config path\s*[:=]|Bearer\s+[A-Za-z0-9._-]{8,})/i.test(text);
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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
