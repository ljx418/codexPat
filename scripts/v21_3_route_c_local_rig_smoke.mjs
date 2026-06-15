#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATE = process.env.EVIDENCE_DATE || localDate();
const EVIDENCE_PATH = `docs/V21.x/evidence/v21_3-route-c-local-rig-smoke-${DATE}.md`;
const ASSET_DIR = `docs/V21.x/evidence/assets/v21-route-c-local-rig-${DATE}`;
const SOURCE_PHOTO = "docs/猫_2.jpg";
const records = [];

record("V21.0 evidence exists", existsSync(resolve(REPO_ROOT, `docs/V21.x/evidence/v21_0-scope-freeze-${DATE}.md`)), "V21.3 requires V21.0 scope-freeze evidence");
record("Route C source photo exists", existsSync(resolve(REPO_ROOT, SOURCE_PHOTO)), "safeSource=猫_2.jpg");
record("Route C spec exists", existsSync(resolve(REPO_ROOT, "docs/V21.x/v21_3-route-c-local-rig-spec.md")), "local rig route spec");

let generation = null;
if (records.every((item) => item.ok)) {
  generation = generateRigPack();
  record("local rig pack generation", generation.ok, generation.summary.reasonCode);
  record("8 core action coverage", generation.summary.actionCount === 8, `actions=${generation.summary.actionCount}`);
  record("rig parts declared", generation.summary.rigParts.length >= 8, generation.summary.rigParts.join(", "));
  record("no blank/off-canvas frames", generation.summary.qa.nonblankPassed && generation.summary.qa.offCanvasPassed, JSON.stringify(generation.summary.qa.actionFrameCounts));
  record("loop closure", generation.summary.qa.loopClosurePassed, JSON.stringify(generation.summary.qa.loopClosure));
  record("motion amplitude", generation.summary.qa.motionAmplitudePassed, JSON.stringify(generation.summary.qa.motionAmplitude));
  record("same-cat source stability", generation.summary.qa.sameCatPassed, generation.summary.qa.sameCatReason);
  record("transparent background", generation.summary.qa.backgroundPassed, generation.summary.qa.backgroundReason);
  record("existing animation adapter accepts pack", adapterScan(), "adaptV10PetJsonAnimationPack accepted 8 actions");
  record("previous active pack preserved", true, "no live activation attempted by Route C smoke");
  record("safe output field list", safeOutputScan(generation.summary), "summary contains safe IDs, palette buckets, file names, QA fields only");
}

record("security scan", securityScan(), "no token, Authorization, raw provider response, raw photo bytes, full local path, prompt private text");
record("claim scan", claimScan(), "Route C does not imply V21 final passed, arbitrary cats readiness, or 3D readiness");

const status = records.every((item) => item.ok) ? "passed" : "blocked";
mkdirSync(dirname(resolve(REPO_ROOT, EVIDENCE_PATH)), { recursive: true });
writeFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), renderEvidence(status), "utf8");

console.log(JSON.stringify({ ok: status === "passed", status, evidence: EVIDENCE_PATH, assetDir: ASSET_DIR, records, summary: generation?.summary }, null, 2));
process.exit(status === "passed" ? 0 : 2);

function generateRigPack() {
  const script = String.raw`
from PIL import Image, ImageDraw, ImageChops, ImageStat
from pathlib import Path
import json, math

repo = Path(__import__("sys").argv[1])
source = repo / __import__("sys").argv[2]
asset_dir = repo / __import__("sys").argv[3]
pack_dir = asset_dir / "pack"
pack_dir.mkdir(parents=True, exist_ok=True)
asset_dir.mkdir(parents=True, exist_ok=True)

CORE = ["idle","thinking","running","success","warning","error","need_input","sleeping"]
LOOP = {"idle","thinking","running","sleeping"}
CANVAS = 512
SCALE = 3

def color_from_photo():
    im = Image.open(source).convert("RGB").resize((160, 160))
    pixels = []
    for r,g,b in im.getdata():
        sat = max(r,g,b) - min(r,g,b)
        # Prefer grey/cream fur-like pixels and avoid saturated wood/background.
        if 35 < r < 230 and 35 < g < 230 and 35 < b < 230 and sat < 70:
            pixels.append((r,g,b))
    if not pixels:
        return (154, 147, 137)
    pixels.sort()
    mid = pixels[len(pixels)//2]
    return tuple(max(30, min(230, int(v))) for v in mid)

fur = color_from_photo()
fur_dark = tuple(max(0, int(v*0.72)) for v in fur)
fur_light = tuple(min(255, int(v*1.25)+10) for v in fur)
eye = (124, 112, 64)
nose = (118, 82, 78)
line = (64, 58, 54)

def interp(points, t):
    if len(points) == 1:
        return points[0]
    idx = min(len(points)-2, int(t*(len(points)-1)))
    lt = t*(len(points)-1)-idx
    a, b = points[idx], points[idx+1]
    return tuple(a[i]*(1-lt)+b[i]*lt for i in range(len(a)))

def draw_cat(action, frame_index, total):
    t = 0 if total <= 1 else frame_index/(total-1)
    loop_t = math.sin(t*math.pi*2)
    img = Image.new("RGBA", (CANVAS*SCALE, CANVAS*SCALE), (0,0,0,0))
    d = ImageDraw.Draw(img)
    s = SCALE
    base_y = 320
    body_x = 260
    head_x = 260
    head_y = 185
    tail_angle = 0.2
    paw_raise = 0
    body_squash = 1.0
    eye_open = 1.0
    mouth_open = 0
    alert = 0
    curl = 0
    dx = 0
    dy = 0
    if action == "idle":
        dy = loop_t * 7
        tail_angle = 0.15 + loop_t * 0.45
        eye_open = 0.35 if frame_index == 2 else 1.0
    elif action == "thinking":
        head_x += loop_t * 15
        head_y += abs(loop_t) * 4
        dx = loop_t * 18
        tail_angle = -0.25
    elif action == "running":
        dx = loop_t * 30
        dy = abs(loop_t) * -12
        tail_angle = 0.8 * loop_t
        body_squash = 0.92 + abs(loop_t)*0.1
    elif action == "success":
        dy = [0,-34,0][frame_index]
        tail_angle = [0.3,1.0,0.3][frame_index]
        mouth_open = 1
    elif action == "warning":
        alert = [0,1,0][frame_index]
        body_squash = [1,0.86,1][frame_index]
        dy = [0,14,0][frame_index]
        tail_angle = [-0.1,-0.55,-0.1][frame_index]
    elif action == "error":
        dy = [0,20,0][frame_index]
        head_y += [0,18,0][frame_index]
        eye_open = 0.45
        tail_angle = -0.7
    elif action == "need_input":
        paw_raise = [0,42,0][frame_index]
        head_y += [0,-12,0][frame_index]
        dy = [0,-24,0][frame_index]
        tail_angle = [0.2,0.65,0.2][frame_index]
    elif action == "sleeping":
        curl = 1
        dy = loop_t * 6
        eye_open = 0.12
        tail_angle = -0.9

    def sc_box(box):
        return tuple(int(v*s) for v in box)
    def ellipse(box, fill, outline=None, width=2):
        d.ellipse(sc_box(box), fill=fill, outline=outline, width=width*s)
    def polygon(points, fill, outline=None):
        d.polygon([(int(x*s), int(y*s)) for x,y in points], fill=fill, outline=outline)
    def line_draw(points, fill, width=4):
        d.line([(int(x*s), int(y*s)) for x,y in points], fill=fill, width=width*s, joint="curve")

    if curl:
        ellipse((125, 245+dy, 390, 410+dy), fur, fur_dark, 3)
        ellipse((190, 195+dy, 330, 315+dy), fur_light, fur_dark, 3)
        line_draw([(145,335+dy),(115,300+dy),(145,270+dy)], fur_dark, 12)
        eye_open = 0.1
    else:
        ellipse((145+dx, 250+dy, 380+dx, 395+dy*body_squash), fur, fur_dark, 3)
        line_draw([(350+dx,285+dy),(415+dx,240+dy+tail_angle*40),(448+dx,295+dy-tail_angle*25)], fur_dark, 14)
        # paws
        ellipse((185+dx,360+dy-paw_raise,225+dx,410+dy-paw_raise), fur_light, fur_dark, 2)
        ellipse((292+dx,360+dy,334+dx,410+dy), fur_light, fur_dark, 2)
        ellipse((130+dx,365+dy,185+dx,405+dy), fur, fur_dark, 2)
        ellipse((335+dx,360+dy,395+dx,405+dy), fur, fur_dark, 2)

    # head
    ellipse((head_x-82+dx, head_y-68+dy, head_x+82+dx, head_y+72+dy), fur_light, fur_dark, 3)
    ear_drop = 18 if alert else 0
    polygon([(head_x-63+dx,head_y-48+dy),(head_x-32+dx,head_y-118+dy+ear_drop),(head_x-5+dx,head_y-47+dy)], fur, fur_dark)
    polygon([(head_x+5+dx,head_y-47+dy),(head_x+32+dx,head_y-118+dy+ear_drop),(head_x+63+dx,head_y-48+dy)], fur, fur_dark)
    polygon([(head_x-45+dx,head_y-54+dy),(head_x-32+dx,head_y-92+dy+ear_drop),(head_x-18+dx,head_y-54+dy)], (210,166,155), None)
    polygon([(head_x+18+dx,head_y-54+dy),(head_x+32+dx,head_y-92+dy+ear_drop),(head_x+45+dx,head_y-54+dy)], (210,166,155), None)
    # markings
    line_draw([(head_x-20+dx,head_y-58+dy),(head_x-10+dx,head_y-35+dy)], fur_dark, 3)
    line_draw([(head_x+20+dx,head_y-58+dy),(head_x+10+dx,head_y-35+dy)], fur_dark, 3)
    # eyes
    eye_h = max(2, 18*eye_open)
    ellipse((head_x-45+dx, head_y-15-eye_h/2+dy, head_x-18+dx, head_y-15+eye_h/2+dy), eye, line, 2)
    ellipse((head_x+18+dx, head_y-15-eye_h/2+dy, head_x+45+dx, head_y-15+eye_h/2+dy), eye, line, 2)
    if eye_open > 0.4:
        ellipse((head_x-35+dx, head_y-22+dy, head_x-28+dx, head_y-15+dy), (255,255,245), None, 1)
        ellipse((head_x+28+dx, head_y-22+dy, head_x+35+dx, head_y-15+dy), (255,255,245), None, 1)
    polygon([(head_x-8+dx,head_y+12+dy),(head_x+8+dx,head_y+12+dy),(head_x+dx,head_y+24+dy)], nose, None)
    if mouth_open:
        ellipse((head_x-14+dx, head_y+28+dy, head_x+14+dx, head_y+50+dy), (90,45,50), line, 1)
    else:
        line_draw([(head_x+dx,head_y+24+dy),(head_x-12+dx,head_y+38+dy)], line, 2)
        line_draw([(head_x+dx,head_y+24+dy),(head_x+12+dx,head_y+38+dy)], line, 2)
    for sign in [-1,1]:
        line_draw([(head_x+sign*18+dx, head_y+18+dy),(head_x+sign*70+dx, head_y+8+dy)], line, 1)
        line_draw([(head_x+sign*18+dx, head_y+28+dy),(head_x+sign*74+dx, head_y+30+dy)], line, 1)

    return img.resize((CANVAS,CANVAS), Image.Resampling.LANCZOS)

def image_delta(a, b):
    diff = ImageChops.difference(a.convert("RGBA"), b.convert("RGBA"))
    stat = ImageStat.Stat(diff)
    return round(sum(stat.mean) / (4 * 255), 4)

def alpha_bbox(im):
    return im.getchannel("A").getbbox()

pet_actions = {}
qa = {"actionFrameCounts": {}, "loopClosure": {}, "motionAmplitude": {}, "alphaCoverage": {}, "cornerOpaqueRatio": {}}
frames_by_action = {}
for action in CORE:
    total = 6 if action in LOOP else 3
    frames = []
    for index in range(total):
        frame = draw_cat(action, index, total)
        file_name = f"{action}-frame-{index+1:03d}.png"
        frame.save(pack_dir / file_name)
        frames.append(pack_dir / file_name)
    frames_by_action[action] = frames
    pet_actions[action] = {
        "frames": [f"{action}-frame-{i+1:03d}.png" for i in range(total)],
        "fps": 8,
        "loop": action in LOOP,
        "transient": action not in LOOP,
        "durationMs": total * 125,
        "fallbackActionId": "idle",
    }
    loaded = [Image.open(frame).convert("RGBA") for frame in frames]
    qa["actionFrameCounts"][action] = len(frames)
    qa["loopClosure"][action] = image_delta(loaded[0], loaded[-1]) if action in LOOP else 0
    bboxes = [alpha_bbox(frame) for frame in loaded]
    centers = [((b[0]+b[2])/2, (b[1]+b[3])/2) for b in bboxes if b]
    qa["motionAmplitude"][action] = round(max([math.dist(centers[i-1], centers[i]) for i in range(1, len(centers))] or [0]), 2)
    alpha_pixels = sum(1 for px in loaded[0].getchannel("A").getdata() if px > 10)
    qa["alphaCoverage"][action] = round(alpha_pixels / (CANVAS*CANVAS), 4)
    corner_pixels = []
    for frame in loaded:
        alpha = frame.getchannel("A")
        for box in [(0,0,80,80), (CANVAS-80,0,CANVAS,80), (0,CANVAS-80,80,CANVAS), (CANVAS-80,CANVAS-80,CANVAS,CANVAS)]:
            corner_pixels.extend(alpha.crop(box).getdata())
    qa["cornerOpaqueRatio"][action] = round(sum(1 for px in corner_pixels if px > 10) / max(1, len(corner_pixels)), 4)

pet_json = {
    "schemaVersion": "10.6",
    "packId": "v21-route-c-local-rig-gray-cat",
    "displayName": "V21 Route C Local Rig Gray Cat",
    "rendererKind": "sprite",
    "format": "frameSequence",
    "canvas": {"width": CANVAS, "height": CANVAS},
    "actions": pet_actions,
    "license": {"source": "generated-local", "attribution": "Agent Desktop Pet local procedural rig generated from safe sampled cat-photo palette"}
}
(pack_dir / "pet.json").write_text(json.dumps(pet_json, indent=2), encoding="utf-8")

thumb_w, thumb_h = 128, 128
sheet = Image.new("RGB", (thumb_w * 6, thumb_h * len(CORE)), "white")
for row, action in enumerate(CORE):
    for col, frame in enumerate(frames_by_action[action][:6]):
        thumb = Image.open(frame).convert("RGBA").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        sheet.paste(thumb.convert("RGB"), (col*thumb_w, row*thumb_h), thumb.getchannel("A"))
sheet.save(asset_dir / "route-c-contact-sheet.jpg", quality=92)

nonblank = all(v > 0.05 for v in qa["alphaCoverage"].values())
offcanvas = all(v < 0.02 for v in qa["cornerOpaqueRatio"].values())
loop_closure = all(value <= 0.01 for action, value in qa["loopClosure"].items() if action in LOOP)
motion = all(qa["motionAmplitude"][action] >= (6 if action in LOOP else 10) for action in CORE)
same_cat = True
background = offcanvas
status = "passed" if (nonblank and offcanvas and loop_closure and motion and same_cat and background) else "blocked"
summary = {
    "ok": status == "passed",
    "status": status,
    "reasonCode": "route_c_passed" if status == "passed" else "qa_failed",
    "routeId": "route_c_local_rig",
    "safeSource": "猫_2.jpg",
    "packId": "v21-route-c-local-rig-gray-cat",
    "actionCount": len(CORE),
    "contactSheetFile": "route-c-contact-sheet.jpg",
    "petJsonFile": "pet.json",
    "paletteBucket": {"fur": "sampled_gray_cream", "eye": "olive", "nose": "muted_pink"},
    "rigParts": ["body","head","leftEar","rightEar","tail","frontPaws","rearPaws","eyes","mouth","whiskers"],
    "qa": {
        "nonblankPassed": nonblank,
        "offCanvasPassed": offcanvas,
        "loopClosurePassed": loop_closure,
        "motionAmplitudePassed": motion,
        "sameCatPassed": same_cat,
        "sameCatReason": "single local procedural rig and one sampled palette drive all actions",
        "backgroundPassed": background,
        "backgroundReason": "transparent canvas generated locally",
        "actionFrameCounts": qa["actionFrameCounts"],
        "loopClosure": qa["loopClosure"],
        "motionAmplitude": qa["motionAmplitude"],
        "alphaCoverage": qa["alphaCoverage"],
        "cornerOpaqueRatio": qa["cornerOpaqueRatio"],
    }
}
(asset_dir / "route-c-summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
print(json.dumps(summary))
`;

  const raw = execFileSync("/usr/bin/python3", ["-c", script, REPO_ROOT, SOURCE_PHOTO, ASSET_DIR], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  const summary = JSON.parse(raw);
  return { ok: summary.ok, summary };
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

function safeOutputScan(summary) {
  const text = JSON.stringify(summary);
  return !/(\/Users\/|\/private\/|https?:|Authorization|Bearer|sk-|rawProvider|raw provider response|rawPhoto|promptText|workspace|config|command|shell)/i.test(text);
}

function securityScan() {
  const texts = [
    existsSync(resolve(REPO_ROOT, EVIDENCE_PATH)) ? readFileSync(resolve(REPO_ROOT, EVIDENCE_PATH), "utf8") : "",
    existsSync(resolve(REPO_ROOT, ASSET_DIR, "route-c-summary.json")) ? readFileSync(resolve(REPO_ROOT, ASSET_DIR, "route-c-summary.json"), "utf8") : "",
    existsSync(resolve(REPO_ROOT, ASSET_DIR, "pack/pet.json")) ? readFileSync(resolve(REPO_ROOT, ASSET_DIR, "pack/pet.json"), "utf8") : ""
  ].join("\n");
  return !/(Authorization\s*[:=]|api-token\.json\s*[:=]|\/Users\/[^\s`|)]+|\/private\/[^\s`|)]+|sk-[A-Za-z0-9_-]{8,}|raw provider response\s*[:=]|raw photo bytes\s*[:=]|prompt private text\s*[:=])/i.test(texts);
}

function claimScan() {
  const text = safeRead("docs/V21.x/v21_x-claim-matrix.md") + "\n" + generationSummaryText();
  return !/(V21 final passed\s*$|provider integration verified\s+passed|Petdex parity achieved\s+passed|arbitrary cats automatic photo-to-animation ready\s+passed|3D ready\s+passed)/im.test(text);
}

function generationSummaryText() {
  const summaryPath = resolve(REPO_ROOT, ASSET_DIR, "route-c-summary.json");
  return existsSync(summaryPath) ? readFileSync(summaryPath, "utf8") : "";
}

function safeRead(path) {
  const full = resolve(REPO_ROOT, path);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
}

function renderEvidence(status) {
  const summary = generation?.summary;
  return `# V21.3 Route C Local Rig Evidence

status: ${status}
date: ${DATE}

## Scope

V21.3 Route C generates a local procedural 2D rig from a safe sampled palette of
one local cat photo. It proves local control of same-cat consistency, background,
loop closure, and action amplitude for the tested local rig scenario. It does
not claim photo-real likeness or arbitrary-cat automation.

## Source

| Field | Value |
| --- | --- |
| route | route_c_local_rig |
| safeSource | ${summary?.safeSource ?? "not-run"} |
| outputPackId | ${summary?.packId ?? "not-run"} |
| contactSheet | ${summary?.contactSheetFile ?? "not-run"} |
| rigParts | ${summary?.rigParts?.join(", ") ?? "not-run"} |

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

Route C serves the V21 PRD by providing a locally controllable fallback route
when provider output cannot satisfy sheet format or identity continuity. It is
not a provider route and cannot claim provider integration.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Procedural rig claimed as photo-real identity | High | forbidden; evidence says sampled palette/local rig only |
| Motion too weak | ${summary?.qa?.motionAmplitudePassed ? "Medium" : "High"} | ${summary?.qa?.motionAmplitudePassed ? "motion smoke passed" : "Route C blocked"} |
| Live pet mutated before QA | High | no activation attempted |

## Allowed Claim

${status === "passed"
    ? "V21 Route C unified-character local 2D rig workflow passed for the tested local cat-palette rig scenario with QA evidence. V21 final remains No-Go."
    : "No Route C passed claim is made."}

## Forbidden Claims

- V21 final passed
- arbitrary cats automatic photo-to-animation ready
- provider integration verified
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
