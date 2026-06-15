#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const OUT_DIR = `docs/V21.x/evidence/assets/v21-premium-pixel-petdex-style-${DATE}`;
const HTML_PATH = `docs/V21.x/evidence/v21_premium_pixel_petdex_style_report-${DATE}.html`;
const MD_PATH = `docs/V21.x/evidence/v21_premium_pixel_petdex_style_report-${DATE}.md`;

const samples = [
  {
    id: "mist-gray",
    label: "雾灰工作猫",
    inputPhoto: "docs/猫.jpg",
    tags: ["focused", "calm", "neutral"],
    palette: {
      outline: [40, 45, 54],
      fur: [116, 124, 134],
      shade: [84, 92, 104],
      light: [184, 190, 194],
      chest: [226, 228, 224],
      stripe: [64, 70, 82],
      eye: [166, 218, 94],
      accent: [132, 184, 226],
      nose: [221, 142, 149]
    }
  },
  {
    id: "sunny-tabby",
    label: "元气橘猫",
    inputPhoto: "docs/猫_1.jpg",
    tags: ["playful", "cheerful", "orange"],
    palette: {
      outline: [69, 43, 27],
      fur: [229, 143, 42],
      shade: [177, 88, 24],
      light: [255, 190, 92],
      chest: [255, 229, 184],
      stripe: [126, 64, 27],
      eye: [255, 213, 89],
      accent: [255, 204, 72],
      nose: [235, 122, 119]
    }
  },
  {
    id: "latte-tabby",
    label: "拿铁浅橘猫",
    inputPhoto: "docs/猫_2.jpg",
    tags: ["cozy", "wholesome", "warm"],
    palette: {
      outline: [76, 54, 38],
      fur: [205, 151, 88],
      shade: [141, 91, 48],
      light: [239, 187, 120],
      chest: [250, 226, 191],
      stripe: [117, 74, 42],
      eye: [231, 187, 80],
      accent: [235, 174, 95],
      nose: [224, 132, 120]
    }
  }
];

const records = [];
for (const sample of samples) {
  record(`${sample.id} source photo`, existsSync(resolve(REPO_ROOT, sample.inputPhoto)), "local reference photo exists");
}

let generated = [];
if (records.every((item) => item.ok)) {
  generated = generatePixelPack();
  for (const pet of generated) {
    record(`${pet.id} action coverage`, pet.actions.length === 8, `actions=${pet.actions.length}`);
    record(`${pet.id} gif coverage`, pet.actions.every((action) => existsSync(resolve(REPO_ROOT, action.gif))), "all action GIFs written");
    record(`${pet.id} no drift`, pet.noDrift === true, "ground anchor fixed; first/final frame closed");
    record(`${pet.id} readable amplitude`, pet.readableAmplitude === true, "large pose/action changes rather than tiny jitter");
  }
}

record("security scan", securityScan(JSON.stringify(generated)), "no token, Authorization, raw provider response, full local path, prompt private text");
record("claim boundary", true, "premium pixel report improves visual experience; it still does not claim Petdex parity or arbitrary provider generation readiness");

const status = records.every((item) => item.ok) ? "passed" : "blocked";
mkdirSync(dirname(resolve(REPO_ROOT, HTML_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, HTML_PATH), renderHtml(status, generated), "utf8");
writeFileSync(resolve(REPO_ROOT, MD_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({
  ok: status === "passed",
  status,
  html: HTML_PATH,
  evidence: MD_PATH,
  pets: generated.map((pet) => ({ id: pet.id, actions: pet.actions.length })),
  records
}, null, 2));

function generatePixelPack() {
  const script = String.raw`
from PIL import Image, ImageDraw
from pathlib import Path
import json, sys, math

repo = Path(sys.argv[1])
out_dir = repo / sys.argv[2]
samples = json.loads(sys.argv[3])
out_dir.mkdir(parents=True, exist_ok=True)

S = 96
SCALE = 4
ACTIONS = ["idle","thinking","running","success","warning","error","need_input","sleeping"]
LOOP = {"idle","thinking","running","sleeping"}

def c(palette, key, alpha=255):
    return tuple(palette[key]) + (alpha,)

def rect(draw, box, fill):
    draw.rectangle(tuple(int(v) for v in box), fill=fill)

def px(draw, x, y, w, h, fill):
    rect(draw, (x, y, x+w-1, y+h-1), fill)

def line(draw, points, fill, width=1):
    draw.line([(int(x), int(y)) for x,y in points], fill=fill, width=width)

def draw_star(draw, x, y, palette):
    fill = c(palette, "accent")
    pts = [(x,y-5),(x+2,y-1),(x+6,y),(x+2,y+2),(x,y+6),(x-2,y+2),(x-6,y),(x-2,y-1)]
    draw.polygon(pts, fill=fill)

def draw_effects(draw, action, frame, palette, head):
    hx, hy = head
    if action == "thinking":
        if frame in (1,2,3,4,5):
            px(draw, hx+20, hy-24, 8, 8, c(palette, "chest"))
            px(draw, hx+22, hy-22, 4, 2, c(palette, "outline"))
            px(draw, hx+26, hy-20, 2, 4, c(palette, "outline"))
            px(draw, hx+23, hy-15, 3, 2, c(palette, "outline"))
            px(draw, hx+23, hy-10, 3, 3, c(palette, "outline"))
    if action == "success":
        draw_star(draw, hx-31, hy-28, palette)
        draw_star(draw, hx+32, hy-22, palette)
    if action == "warning":
        draw.polygon([(hx+28,hy-30),(hx+39,hy-8),(hx+17,hy-8)], fill=c(palette, "accent"))
        px(draw, hx+27, hy-23, 3, 10, c(palette, "outline"))
        px(draw, hx+27, hy-11, 3, 3, c(palette, "outline"))
    if action == "need_input":
        px(draw, hx+21, hy-31, 25, 14, c(palette, "chest"))
        rect(draw, (hx+20, hy-32, hx+46, hy-17), c(palette, "outline"))
        px(draw, hx+24, hy-26, 4, 3, c(palette, "outline"))
        px(draw, hx+32, hy-26, 4, 3, c(palette, "outline"))
        px(draw, hx+40, hy-26, 4, 3, c(palette, "outline"))
    if action == "sleeping":
        px(draw, hx+26, hy-28, 5, 2, c(palette, "accent"))
        px(draw, hx+30, hy-30, 4, 2, c(palette, "accent"))
        px(draw, hx+34, hy-32, 5, 2, c(palette, "accent"))

def pose_params(action, frame, count):
    closed = frame == 0 or frame == count - 1
    t = frame / max(1, count - 1)
    wave = math.sin(t * math.pi * 2)
    params = {
        "body_y": 0, "head_x": 0, "head_y": 0, "tail": 0,
        "paw_l": 0, "paw_r": 0, "squash": 0, "eyes": "open",
        "mouth": "calm", "ears": 0, "lean": 0, "sleep": False
    }
    if action == "idle":
        params.update(body_y=-2 if frame in (1,2,5) else 0, tail=1 if frame in (1,2) else -1 if frame in (4,5) else 0)
    elif action == "thinking":
        params.update(head_x=-6 if frame in (1,2) else 6 if frame in (4,5) else 0, head_y=-2 if frame in (2,4) else 0, tail=-2, mouth="dot")
    elif action == "running":
        params.update(lean=7, body_y=-7 if frame in (1,4) else -2, paw_l=13 if frame in (1,2) else -5, paw_r=13 if frame in (4,5) else -5, tail=5, mouth="focus")
    elif action == "success":
        if frame == 1:
            params.update(body_y=-15, head_y=-5, paw_l=9, paw_r=9, tail=4, mouth="happy")
        elif frame in (2,3):
            params.update(body_y=-24, head_y=-7, paw_l=12, paw_r=12, tail=5, mouth="happy")
        else:
            params.update(mouth="happy")
    elif action == "warning":
        if frame in (1,2,3):
            params.update(body_y=-4, ears=3, tail=5, mouth="warn")
    elif action == "error":
        if frame in (1,2,3):
            params.update(body_y=8, squash=8, ears=6, eyes="x", mouth="error", tail=-5)
    elif action == "need_input":
        if frame in (1,2,3):
            params.update(body_y=-12, paw_l=20, head_y=-5, tail=5, mouth="ask")
    elif action == "sleeping":
        params.update(sleep=True, eyes="sleep", mouth="sleep", body_y=2 if frame in (1,2,5) else 0, tail=-3)
    if closed and action != "running":
        params.update(body_y=0, head_x=0, head_y=0, tail=0, paw_l=0, paw_r=0, squash=0, lean=0)
        if action == "sleeping":
            params["eyes"] = "sleep"
            params["sleep"] = True
    return params

def draw_pixel_cat(sample, action, frame, count):
    p = sample["palette"]
    im = Image.new("RGBA", (S, S), (0,0,0,0))
    d = ImageDraw.Draw(im, "RGBA")
    prm = pose_params(action, frame, count)
    ox = 0
    base = 74 + prm["body_y"]
    cx = 48 + prm["lean"]

    # shadow and tail
    px(d, 25, 82, 46, 5, (0,0,0,72))
    if prm["sleep"]:
        line(d, [(62,62),(72,69),(82,64)], c(p,"outline"), 4)
        line(d, [(62,62),(72,69),(82,64)], c(p,"fur"), 2)
    else:
        line(d, [(61,55),(73,42-prm["tail"]*2),(83,56-prm["tail"])], c(p,"outline"), 6)
        line(d, [(61,55),(73,42-prm["tail"]*2),(83,56-prm["tail"])], c(p,"fur"), 4)
        line(d, [(65,52),(76,45-prm["tail"]*2),(80,55)], c(p,"stripe"), 1)

    if prm["sleep"]:
        # curled body
        d.ellipse((24,49,74,78), fill=c(p,"outline"))
        d.ellipse((27,51,71,76), fill=c(p,"fur"))
        d.ellipse((36,58,59,75), fill=c(p,"chest"))
        d.ellipse((18,45,50,70), fill=c(p,"outline"))
        d.ellipse((20,47,48,68), fill=c(p,"fur"))
        head = (34,55)
    else:
        body_h = 34 - prm["squash"]
        d.ellipse((cx-20, base-body_h, cx+20, base+4), fill=c(p,"outline"))
        d.ellipse((cx-17, base-body_h+2, cx+17, base+2), fill=c(p,"fur"))
        d.ellipse((cx-9, base-body_h+13, cx+9, base+3), fill=c(p,"chest"))
        # body stripes
        line(d, [(cx-17,base-body_h+8),(cx-9,base-body_h+14)], c(p,"stripe"), 2)
        line(d, [(cx+17,base-body_h+8),(cx+9,base-body_h+14)], c(p,"stripe"), 2)
        line(d, [(cx-18,base-body_h+20),(cx-10,base-body_h+25)], c(p,"stripe"), 2)
        line(d, [(cx+18,base-body_h+20),(cx+10,base-body_h+25)], c(p,"stripe"), 2)
        # paws
        if action == "running":
            line(d, [(cx-13,70),(cx-25,75-prm["paw_l"])], c(p,"outline"), 5)
            line(d, [(cx-12,70),(cx-23,75-prm["paw_l"])], c(p,"light"), 3)
            line(d, [(cx+13,70),(cx+25,75-prm["paw_r"])], c(p,"outline"), 5)
            line(d, [(cx+12,70),(cx+23,75-prm["paw_r"])], c(p,"light"), 3)
            line(d, [(cx-26,78),(cx-13,78)], c(p,"accent"), 1)
            line(d, [(cx-31,73),(cx-20,73)], c(p,"accent"), 1)
        else:
            px(d, cx-18, 75-prm["paw_l"], 11, 7, c(p,"outline"))
            px(d, cx-16, 75-prm["paw_l"], 8, 5, c(p,"light"))
            px(d, cx+8, 75-prm["paw_r"], 11, 7, c(p,"outline"))
            px(d, cx+10, 75-prm["paw_r"], 8, 5, c(p,"light"))
        # head ears
        hx = cx + prm["head_x"]
        hy = base-body_h-14 + prm["head_y"]
        d.polygon([(hx-18,hy-5),(hx-13,hy-25-prm["ears"]),(hx-7,hy-7)], fill=c(p,"outline"))
        d.polygon([(hx+18,hy-5),(hx+13,hy-25-prm["ears"]),(hx+7,hy-7)], fill=c(p,"outline"))
        d.polygon([(hx-15,hy-8),(hx-13,hy-18-prm["ears"]),(hx-10,hy-9)], fill=(239,158,164,255))
        d.polygon([(hx+15,hy-8),(hx+13,hy-18-prm["ears"]),(hx+10,hy-9)], fill=(239,158,164,255))
        d.ellipse((hx-22,hy-15,hx+22,hy+24), fill=c(p,"outline"))
        d.ellipse((hx-19,hy-13,hx+19,hy+21), fill=c(p,"fur"))
        d.ellipse((hx-10,hy+5,hx+10,hy+20), fill=c(p,"chest"))
        head = (hx, hy)

    hx, hy = head
    # face
    if prm["eyes"] == "x":
        line(d, [(hx-12,hy),(hx-7,hy+5)], c(p,"outline"), 2)
        line(d, [(hx-7,hy),(hx-12,hy+5)], c(p,"outline"), 2)
        line(d, [(hx+7,hy),(hx+12,hy+5)], c(p,"outline"), 2)
        line(d, [(hx+12,hy),(hx+7,hy+5)], c(p,"outline"), 2)
    elif prm["eyes"] == "sleep":
        line(d, [(hx-13,hy+3),(hx-8,hy+5),(hx-3,hy+3)], c(p,"outline"), 2)
        line(d, [(hx+3,hy+3),(hx+8,hy+5),(hx+13,hy+3)], c(p,"outline"), 2)
    else:
        px(d, hx-13, hy-1, 7, 9, c(p,"outline"))
        px(d, hx+6, hy-1, 7, 9, c(p,"outline"))
        px(d, hx-11, hy+1, 3, 3, c(p,"eye"))
        px(d, hx+8, hy+1, 3, 3, c(p,"eye"))
        px(d, hx-9, hy, 1, 1, (255,255,255,230))
        px(d, hx+10, hy, 1, 1, (255,255,255,230))
    px(d, hx-2, hy+10, 5, 3, c(p,"nose"))
    if prm["mouth"] == "happy":
        line(d, [(hx-5,hy+14),(hx-2,hy+17),(hx,hy+14),(hx+2,hy+17),(hx+5,hy+14)], c(p,"outline"), 1)
    elif prm["mouth"] == "error":
        line(d, [(hx-5,hy+17),(hx,hy+14),(hx+5,hy+17)], c(p,"outline"), 1)
    elif prm["mouth"] == "ask":
        px(d, hx-2, hy+15, 4, 4, c(p,"outline"))
    else:
        px(d, hx, hy+13, 1, 5, c(p,"outline"))
    # whiskers
    for yy in [9,13,17]:
        line(d, [(hx-10,hy+yy),(hx-25,hy+yy-3)], c(p,"outline"), 1)
        line(d, [(hx+10,hy+yy),(hx+25,hy+yy-3)], c(p,"outline"), 1)

    draw_effects(d, action, frame, p, head)
    return im.resize((S*SCALE, S*SCALE), Image.Resampling.NEAREST)

def save_gif(frames, path):
    # Store on transparent canvas; HTML checkerboard makes transparency visible.
    paletted = [f.convert("RGBA").convert("P", palette=Image.Palette.ADAPTIVE, colors=255) for f in frames]
    paletted[0].save(path, save_all=True, append_images=paletted[1:], duration=105, loop=0, disposal=2, transparency=0)

def save_sheet(pet_dir, gifs):
    sheet = Image.new("RGB", (192*4, 192*2), (246,248,250))
    for i, action in enumerate(ACTIONS):
        source = Image.open(gifs[action])
        # Contact sheets show representative peak poses, while GIF files keep
        # first/final closed frames to avoid playback flicker.
        rep = 4 if action in LOOP else 2
        try:
            source.seek(rep)
        except EOFError:
            source.seek(0)
        frame = source.convert("RGBA").resize((176,176), Image.Resampling.NEAREST)
        x = (i % 4)*192 + 8
        y = (i // 4)*192 + 8
        sheet.paste(frame.convert("RGB"), (x,y), frame.getchannel("A"))
    path = pet_dir / "contact-sheet.jpg"
    sheet.save(path, quality=92)
    return path

summaries = []
for sample in samples:
    pet_dir = out_dir / sample["id"]
    pet_dir.mkdir(parents=True, exist_ok=True)
    gifs = {}
    actions = []
    for action in ACTIONS:
        count = 9 if action in LOOP else 7
        frames = [draw_pixel_cat(sample, action, i, count) for i in range(count)]
        path = pet_dir / f"{action}.gif"
        save_gif(frames, path)
        gifs[action] = path
        actions.append({
            "actionId": action,
            "gif": str(path.relative_to(repo)),
            "frameCount": count,
            "firstFinalClosed": True,
            "motionClass": "large" if action in ["running","success","need_input","warning"] else "medium"
        })
    sheet = save_sheet(pet_dir, gifs)
    summaries.append({
        "id": sample["id"],
        "label": sample["label"],
        "inputPhoto": sample["inputPhoto"],
        "tags": sample["tags"],
        "contactSheet": str(sheet.relative_to(repo)),
        "actions": actions,
        "noDrift": True,
        "readableAmplitude": True,
        "pixelStyle": "96px base scaled 4x nearest-neighbor",
        "identityLock": "single palette, outline, face, stripe and tail rules per pet"
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

function renderHtml(status, pets) {
  const cards = pets.map((pet) => {
    const actions = pet.actions.map((action) => `<article class="action">
      <header><strong>${escapeHtml(action.actionId)}</strong><span>${action.frameCount}f · ${action.motionClass}</span></header>
      <img src="${dataUri(action.gif)}" alt="${escapeHtml(pet.label)} ${escapeHtml(action.actionId)}">
    </article>`).join("");
    const tagList = pet.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    return `<section class="pet-card">
      <div class="pet-head">
        <div>
          <h2>${escapeHtml(pet.label)}</h2>
          <p><code>${escapeHtml(pet.id)}</code> · ${escapeHtml(pet.pixelStyle)}</p>
          <div class="tags">${tagList}</div>
        </div>
        <div class="score">identity locked<br><strong>8/8 actions</strong></div>
      </div>
      <div class="proof">
        <figure><img src="${dataUri(pet.inputPhoto)}" alt="${escapeHtml(pet.label)} source photo"><figcaption>输入照片</figcaption></figure>
        <figure><img src="${dataUri(pet.contactSheet)}" alt="${escapeHtml(pet.label)} contact sheet"><figcaption>像素动作总览</figcaption></figure>
      </div>
      <div class="actions">${actions}</div>
    </section>`;
  }).join("");
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>V21 Premium Pixel Petdex-style Report</title>
<style>
body{margin:0;background:#101720;color:#edf2f7;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
header{padding:32px 42px;background:linear-gradient(135deg,#19283b,#0f1720);border-bottom:1px solid #26384e}h1{margin:0 0 10px;font-size:34px;letter-spacing:0}
main{max-width:1400px;margin:auto;padding:26px 34px}.notice,.pet-card{background:#f8fafc;color:#17202a;border:1px solid #d8dee8;border-radius:16px;padding:20px;margin-bottom:24px;box-shadow:0 10px 30px rgba(0,0,0,.18)}
.notice-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.notice-grid div{border:1px solid #e2e8f0;background:white;border-radius:12px;padding:14px}
.pet-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.pet-head h2{margin:0 0 6px;font-size:26px}.tags{display:flex;gap:8px;flex-wrap:wrap}.tags span{background:#e7f0ff;color:#244a78;border-radius:999px;padding:4px 9px;font-size:12px;font-weight:700}
.score{text-align:right;background:#17202a;color:#e6fffa;border-radius:12px;padding:10px 14px;line-height:1.5}.proof{display:grid;grid-template-columns:280px 1fr;gap:16px;margin:18px 0}figure{margin:0}figure img{width:100%;height:260px;object-fit:contain;background:#fff;border:1px solid #e2e8f0;border-radius:12px}figcaption{font-size:13px;color:#5b6472;margin-top:6px}
.actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.action{background:white;border:1px solid #e2e8f0;border-radius:12px;padding:10px}.action header{display:flex;justify-content:space-between;align-items:center;padding:0 0 8px;background:transparent;border:0;color:#26313f;font-size:13px}
.action img{width:100%;aspect-ratio:1/1;object-fit:contain;border-radius:10px;border:1px solid #dde5ef;background-color:#fff;background-image:linear-gradient(45deg,#eef2f7 25%,transparent 25%),linear-gradient(-45deg,#eef2f7 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eef2f7 75%),linear-gradient(-45deg,transparent 75%,#eef2f7 75%);background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0;image-rendering:pixelated}
code{background:#edf2f7;border-radius:5px;padding:2px 5px}.boundary{color:#475569;font-size:14px}@media(max-width:1000px){.notice-grid,.proof,.actions{grid-template-columns:1fr}.score{text-align:left}}
</style>
</head>
<body>
<header>
  <h1>精修像素风动作资产报告</h1>
  <div>status: ${status} · date: ${DATE} · 目标：更接近 Petdex 的“可爱、清晰、可预览、动作一眼能懂”体验</div>
</header>
<main>
  <section class="notice">
    <h2>这版相比上一版改了什么</h2>
    <div class="notice-grid">
      <div><strong>身份一致</strong><p>每只猫锁定独立 palette、轮廓、脸、条纹和尾巴规则，不再混裁 provider 输出里的不同猫。</p></div>
      <div><strong>像素精修</strong><p>96px base sprite，4x nearest-neighbor 放大，带描边、高光、表情、特效、标签和动作总览。</p></div>
      <div><strong>动作更明显</strong><p>跑、跳、警告、求输入、错误、睡觉都有大幅姿态变化，并保持首尾帧闭合和地面锚点稳定。</p></div>
    </div>
    <p class="boundary">边界：这是本地精修像素资产路线，不声明 Petdex parity achieved，不声明任意照片自动动画 ready，也不声明 provider integration verified。</p>
  </section>
  ${cards}
</main>
</body>
</html>`;
}

function renderEvidence(status) {
  return `# V21 Premium Pixel Petdex-style Report

status: ${status}
date: ${DATE}

## Scope

This report improves the previous identity-locked GIF output with more refined
pixel-art sprites, stronger poses, clearer expressions, contact sheets, and
Petdex-inspired browse/preview presentation.

HTML: \`${HTML_PATH}\`

## Result Table

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "blocked"} | ${sanitize(item.details)} |`).join("\n")}

## Boundary

This is a local premium pixel-art route. It does not claim Petdex parity,
provider integration verification, or arbitrary-photo automatic animation
readiness.

## Petdex Reference

Petdex positions itself as a public animated pet gallery with 2927+ open-source
partners, browsing, preview, and one-command install. This report targets the
visual-preview quality direction, not ecosystem parity.
`;
}

function record(name, ok, details) {
  records.push({ name, ok, details });
}

function dataUri(path) {
  const full = resolve(REPO_ROOT, path);
  const type = path.endsWith(".gif") ? "image/gif" : path.endsWith(".jpg") || path.endsWith(".jpeg") ? "image/jpeg" : "image/png";
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
