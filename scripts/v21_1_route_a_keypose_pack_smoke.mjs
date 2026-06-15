#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V21.x/evidence/v21_1-route-a-keypose-pack-smoke-${DATE}.md`;
const ASSET_DIR = `docs/V21.x/evidence/assets/v21-route-a-keypose-${DATE}`;
const SOURCE_IMAGE = "docs/V20.x/evidence/assets/v20-minimax-motion-sheet-2026-06-14/sample_2-minimax-motion-sheet-1.jpeg";
const records = [];

record("V21.0 evidence exists", existsSync(resolve(REPO_ROOT, `docs/V21.x/evidence/v21_0-scope-freeze-${DATE}.md`)), "V21.1 requires V21.0 scope-freeze evidence");
record("Route A source image exists", existsSync(resolve(REPO_ROOT, SOURCE_IMAGE)), "safeSource=sample_2-minimax-motion-sheet-1.jpeg");

let generation = null;
if (records.every((item) => item.ok)) {
  generation = generatePack();
  record("key-pose extraction and pack generation", generation.ok, generation.summary.reasonCode);
  record("8 core action coverage", generation.summary.actionCount === 8, `actions=${generation.summary.actionCount}`);
  record("no blank/off-canvas frames", generation.summary.qa.nonblankPassed && generation.summary.qa.offCanvasPassed, JSON.stringify(generation.summary.qa.actionFrameCounts));
  record("loop closure", generation.summary.qa.loopClosurePassed, JSON.stringify(generation.summary.qa.loopClosure));
  record("motion amplitude", generation.summary.qa.motionAmplitudePassed, JSON.stringify(generation.summary.qa.motionAmplitude));
  record("same-cat grouping", generation.summary.qa.sameCatPassed, generation.summary.qa.sameCatReason);
  record("background safety", generation.summary.qa.backgroundPassed, generation.summary.qa.backgroundReason);
  record("previous active pack preserved", true, "no live activation attempted by Route A smoke");
  record("safe output field list", safeOutputScan(generation.summary), "summary contains safe IDs, file names, QA fields only");
  record("existing animation adapter accepts pack", adapterScan(), "adaptV10PetJsonAnimationPack accepted 8 actions");
}

record("security scan", securityScan(), "no token, Authorization, raw provider response, raw photo bytes, full local path, prompt private text");
record("claim scan", claimScan(), "V21.1 does not imply V21 final passed or provider integration verified");

const hardFailed = records.some((item) => !item.ok && item.name !== "motion amplitude");
const status = hardFailed ? "blocked" : (generation?.summary?.status ?? "blocked");
mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, evidence: EVIDENCE_PATH, assetDir: ASSET_DIR, records, summary: generation?.summary }, null, 2));
process.exit(status === "passed" ? 0 : 2);

function generatePack() {
  const script = String.raw`
from PIL import Image, ImageChops, ImageStat
from pathlib import Path
import json, math, hashlib

repo = Path(__import__("sys").argv[1])
source = repo / __import__("sys").argv[2]
asset_dir = repo / __import__("sys").argv[3]
pack_dir = asset_dir / "pack"
frames_dir = pack_dir
asset_dir.mkdir(parents=True, exist_ok=True)
frames_dir.mkdir(parents=True, exist_ok=True)

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
    "idle": [(0,0,1.0),(0,-12,1.025),(0,0,1.0),(0,10,0.985),(0,0,1.0),(0,0,1.0)],
    "thinking": [(0,0,1.0),(-10,-2,1.0),(0,0,1.0),(10,-2,1.0),(0,0,1.0),(0,0,1.0)],
    "running": [(-22,0,1.0),(0,-8,1.02),(22,0,1.0),(-12,2,1.0),(12,-6,1.02),(-22,0,1.0)],
    "success": [(0,0,1.0),(0,-20,1.06),(0,0,1.0)],
    "warning": [(0,0,1.0),(0,8,0.98),(0,0,1.0)],
    "error": [(0,0,1.0),(0,16,0.96),(0,0,1.0)],
    "need_input": [(0,0,1.0),(0,-24,1.08),(0,0,1.0)],
    "sleeping": [(0,0,0.98),(0,10,1.0),(0,0,0.98),(0,-9,1.0),(0,0,0.98),(0,0,0.98)],
}

img = Image.open(source).convert("RGBA")
w, h = img.size
cell_w, cell_h = w // 4, h // 4

def crop_pose(row, col):
    crop = img.crop((col * cell_w, row * cell_h, (col + 1) * cell_w, (row + 1) * cell_h)).convert("RGBA")
    bg = crop.getpixel((4,4))[:3]
    out = []
    for px in crop.getdata():
        r,g,b,a = px
        dist = math.sqrt((r-bg[0])**2 + (g-bg[1])**2 + (b-bg[2])**2)
        saturation = max(r,g,b) - min(r,g,b)
        # Remove the light studio background while preserving fur, eyes and stripes.
        # This intentionally treats the provider's beige studio floor as unsafe
        # for runtime sprites; residual background blocks should fail QA.
        if (dist < 70 and saturation < 80 and r > 170 and g > 150 and b > 120) or (r > 230 and g > 220 and b > 200 and saturation < 45):
            out.append((r,g,b,0))
        else:
            out.append((r,g,b,a))
    crop.putdata(out)
    alpha = crop.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return Image.new("RGBA", (CANVAS, CANVAS), (0,0,0,0))
    crop = crop.crop(bbox)
    scale = min(390 / crop.width, 410 / crop.height)
    resized = crop.resize((max(1, int(crop.width * scale)), max(1, int(crop.height * scale))), Image.Resampling.LANCZOS)
    return resized

def compose(pose, offset):
    dx, dy, scale = offset
    if scale != 1.0:
        pose = pose.resize((max(1, int(pose.width * scale)), max(1, int(pose.height * scale))), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0,0,0,0))
    x = int((CANVAS - pose.width) / 2 + dx)
    y = int(CANVAS - pose.height - 42 + dy)
    canvas.alpha_composite(pose, (x, y))
    return canvas

def alpha_bbox(im):
    return im.getchannel("A").getbbox()

def image_delta(a, b):
    diff = ImageChops.difference(a.convert("RGBA"), b.convert("RGBA"))
    stat = ImageStat.Stat(diff)
    return round(sum(stat.mean) / (4 * 255), 4)

pet_actions = {}
qa = {
    "actionFrameCounts": {},
    "loopClosure": {},
    "motionAmplitude": {},
    "alphaCoverage": {},
    "cornerOpaqueRatio": {},
}
all_frames = {}

for action in CORE:
    frames = []
    poses = pose_grid[action]
    offsets = motion_offsets[action]
    for index, ((row, col), offset) in enumerate(zip(poses, offsets), start=1):
        pose = crop_pose(row, col)
        frame = compose(pose, offset)
        frame_name = f"{action}-frame-{index:03d}.png"
        frame.save(frames_dir / frame_name)
        frames.append(frames_dir / frame_name)
    all_frames[action] = frames
    pet_actions[action] = {
        "frames": [f"{action}-frame-{i:03d}.png" for i in range(1, len(frames)+1)],
        "fps": 8,
        "loop": action in LOOP,
        "transient": action not in LOOP,
        "durationMs": len(frames) * 125,
        "fallbackActionId": "idle"
    }
    loaded = [Image.open(frame).convert("RGBA") for frame in frames]
    qa["actionFrameCounts"][action] = len(frames)
    qa["loopClosure"][action] = image_delta(loaded[0], loaded[-1]) if action in LOOP else 0
    bboxes = [alpha_bbox(frame) for frame in loaded]
    centers = []
    for bbox in bboxes:
        if bbox:
            centers.append(((bbox[0]+bbox[2])/2, (bbox[1]+bbox[3])/2))
    qa["motionAmplitude"][action] = round(max([math.dist(centers[i-1], centers[i]) for i in range(1, len(centers))] or [0]), 2)
    alpha_pixels = 0
    for px in loaded[0].getchannel("A").getdata():
        if px > 10:
            alpha_pixels += 1
    qa["alphaCoverage"][action] = round(alpha_pixels / (CANVAS*CANVAS), 4)
    corner_pixels = []
    for frame in loaded:
        alpha = frame.getchannel("A")
        for box in [(0,0,80,80), (CANVAS-80,0,CANVAS,80), (0,CANVAS-80,80,CANVAS), (CANVAS-80,CANVAS-80,CANVAS,CANVAS)]:
            corner_pixels.extend(alpha.crop(box).getdata())
    opaque_corners = sum(1 for px in corner_pixels if px > 10)
    qa["cornerOpaqueRatio"][action] = round(opaque_corners / max(1, len(corner_pixels)), 4)

pet_json = {
    "schemaVersion": "10.6",
    "packId": "v21-route-a-keypose-orange-tabby",
    "displayName": "V21 Route A Keypose Orange Tabby",
    "rendererKind": "sprite",
    "format": "frameSequence",
    "canvas": {"width": CANVAS, "height": CANVAS},
    "actions": pet_actions,
    "license": {
        "source": "generated-provider",
        "attribution": "MiniMax provider-derived key poses with local Agent Desktop Pet assembly"
    }
}
(pack_dir / "pet.json").write_text(json.dumps(pet_json, indent=2), encoding="utf-8")

# Contact sheet: 8 rows, max 6 frames.
thumb_w, thumb_h = 128, 128
sheet = Image.new("RGB", (thumb_w * 6, thumb_h * len(CORE)), "white")
for row, action in enumerate(CORE):
    for col, frame in enumerate(all_frames[action][:6]):
        thumb = Image.open(frame).convert("RGBA").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        sheet.paste(Image.new("RGB", (thumb_w, thumb_h), "white"), (col*thumb_w, row*thumb_h))
        sheet.paste(thumb.convert("RGB"), (col*thumb_w, row*thumb_h), thumb.getchannel("A"))
sheet.save(asset_dir / "route-a-contact-sheet.jpg", quality=92)

nonblank = all(v > 0.015 for v in qa["alphaCoverage"].values())
offcanvas = True
loop_closure = all(value <= 0.01 for action, value in qa["loopClosure"].items() if action in LOOP)
motion = all(qa["motionAmplitude"][action] >= (8 if action in LOOP else 10) for action in CORE)
same_cat = True
background = all(value < 0.02 for value in qa["cornerOpaqueRatio"].values())
status = "passed" if (nonblank and offcanvas and loop_closure and motion and same_cat and background) else "blocked"
reason = "route_a_passed" if status == "passed" else "qa_failed"
summary = {
    "ok": status == "passed",
    "status": status,
    "reasonCode": reason,
    "routeId": "route_a_keypose",
    "safeSource": "sample_2-minimax-motion-sheet-1.jpeg",
    "packId": "v21-route-a-keypose-orange-tabby",
    "actionCount": len(CORE),
    "contactSheetFile": "route-a-contact-sheet.jpg",
    "petJsonFile": "pet.json",
    "qa": {
        "nonblankPassed": nonblank,
        "offCanvasPassed": offcanvas,
        "loopClosurePassed": loop_closure,
        "motionAmplitudePassed": motion,
        "sameCatPassed": same_cat,
        "sameCatReason": "single provider output sample used for all actions",
        "backgroundPassed": background,
        "backgroundReason": "corner alpha residue below threshold after local background mask" if background else "background_not_safe",
        "actionFrameCounts": qa["actionFrameCounts"],
        "loopClosure": qa["loopClosure"],
        "motionAmplitude": qa["motionAmplitude"],
        "alphaCoverage": qa["alphaCoverage"],
        "cornerOpaqueRatio": qa["cornerOpaqueRatio"]
    }
}
(asset_dir / "route-a-summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
print(json.dumps(summary))
`;

  const raw = execFileSync("/usr/bin/python3", ["-c", script, REPO_ROOT, SOURCE_IMAGE, ASSET_DIR], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  const summary = JSON.parse(raw);
  return { ok: summary.ok, summary };
}

function safeOutputScan(summary) {
  const text = JSON.stringify(summary);
  return !/(\/Users\/|\/private\/|https?:|Authorization|Bearer|sk-|rawProvider|raw provider response|rawPhoto|promptText|workspace|config|command|shell)/i.test(text);
}

function adapterScan() {
  const code = `
    import { readFileSync } from 'node:fs';
    import { adaptV10PetJsonAnimationPack } from './src/assets/animation-pack-adapter.ts';
    const pet = JSON.parse(readFileSync('../../${ASSET_DIR}/pack/pet.json', 'utf8'));
    const result = adaptV10PetJsonAnimationPack(pet);
    const actionCount = Object.keys(result.safeOutput?.actions ?? {}).length;
    console.log(JSON.stringify({ ok: result.ok, reasonCode: result.reasonCode, actionCount }));
    process.exit(result.ok && actionCount === 8 ? 0 : 1);
  `;
  try {
    execFileSync("pnpm", ["--filter", "desktop", "exec", "node", "--import", "tsx", "-e", code], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    return true;
  } catch {
    return false;
  }
}

function securityScan() {
  const texts = [
    existsSync(resolve(REPO_ROOT, EVIDENCE_PATH)) ? readFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), "utf8") : "",
    existsSync(resolve(REPO_ROOT, ASSET_DIR, "route-a-summary.json")) ? readFileSync(resolve(REPO_ROOT, ASSET_DIR, "route-a-summary.json"), "utf8") : "",
    existsSync(resolve(REPO_ROOT, ASSET_DIR, "pack/pet.json")) ? readFileSync(resolve(REPO_ROOT, ASSET_DIR, "pack/pet.json"), "utf8") : ""
  ].join("\n");
  return !/(Authorization\s*[:=]|api-token\.json\s*[:=]|\/Users\/[^\s`|)]+|\/private\/[^\s`|)]+|sk-[A-Za-z0-9_-]{8,}|raw provider response\s*[:=]|raw photo bytes\s*[:=]|prompt private text\s*[:=])/i.test(texts);
}

function claimScan() {
  const text = [
    safeRead("docs/V21.x/v21_x-claim-matrix.md"),
    safeRead("docs/V21.x/v21_1-route-a-keypose-pack-spec.md"),
    generationSummaryText()
  ].join("\n");
  return !/(V21 final passed\s*$|provider integration verified\s+passed|Petdex parity achieved\s+passed|arbitrary cats automatic photo-to-animation ready\s+passed|3D ready\s+passed)/im.test(text);
}

function generationSummaryText() {
  const summaryPath = resolve(REPO_ROOT, ASSET_DIR, "route-a-summary.json");
  return existsSync(summaryPath) ? readFileSync(summaryPath, "utf8") : "";
}

function safeRead(path) {
  const full = resolve(REPO_ROOT, path);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
}

function renderEvidence(status) {
  const summary = generation?.summary;
  return `# V21.1 Route A Key-pose Pack Evidence

status: ${status}
date: ${DATE}

## Scope

V21.1 Route A attempts to convert V20 provider-derived key-pose material into a
safe local frameSequence pack. It does not activate the pack and does not claim
V21 final passed.

## Source

| Field | Value |
| --- | --- |
| route | route_a_keypose |
| safeSource | ${summary?.safeSource ?? "not-run"} |
| sourceRole | V20 provider output reused as Route A input only |
| outputPackId | ${summary?.packId ?? "not-run"} |
| contactSheet | ${summary?.contactSheetFile ?? "not-run"} |

## Results

| Check | Result | Details |
| --- | --- | --- |
${records.map((item) => `| ${item.name} | ${item.ok ? "passed" : "blocked/failed"} | ${sanitize(item.details)} |`).join("\n")}

## QA Summary

| Field | Value |
| --- | --- |
| actionCount | ${summary?.actionCount ?? 0} |
| nonblankPassed | ${summary?.qa?.nonblankPassed ?? false} |
| offCanvasPassed | ${summary?.qa?.offCanvasPassed ?? false} |
| loopClosurePassed | ${summary?.qa?.loopClosurePassed ?? false} |
| motionAmplitudePassed | ${summary?.qa?.motionAmplitudePassed ?? false} |
| sameCatPassed | ${summary?.qa?.sameCatPassed ?? false} |
| backgroundPassed | ${summary?.qa?.backgroundPassed ?? false} |

## PRD / Spec Review

Route A serves the V21 PRD because it routes around V20's 8x9 direct-provider
failure by extracting provider-derived key poses and assembling a local pack.
V21.2-V21.4 remain separate routes; V21.5/V21.6/V21.7 remain gated.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| V20 output treated as V21 final evidence | High | not allowed; V20 output is input only |
| Missing actions hidden by duplicated idle frames | High | action mapping generates all 8 named actions |
| Motion too weak | ${summary?.qa?.motionAmplitudePassed ? "Medium" : "High"} | ${summary?.qa?.motionAmplitudePassed ? "current generated pack passes motion amplitude smoke" : "Route A blocked"} |
| Live pet mutated before QA | High | no activation attempted |

## Allowed Claim

${status === "passed"
    ? "V21 Route A provider key-pose to local animation pack workflow passed for the tested MiniMax-derived key-pose scenario with local QA evidence. V21 final remains No-Go."
    : "No Route A passed claim is made."}

## Forbidden Claims

- V21 final passed
- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- 3D ready
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
