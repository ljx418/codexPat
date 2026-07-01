#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


SAMPLES = [
    {
        "sampleId": "host-orange-tabby",
        "label": "Orange tabby host sample",
        "fur": (224, 136, 45),
        "stripe": (145, 74, 32),
        "chest": (252, 226, 182),
        "pattern": "tabby",
    },
    {
        "sampleId": "host-tuxedo",
        "label": "Tuxedo host sample",
        "fur": (36, 39, 45),
        "stripe": (82, 87, 95),
        "chest": (244, 246, 244),
        "pattern": "tuxedo",
    },
    {
        "sampleId": "host-calico",
        "label": "Calico host sample",
        "fur": (236, 232, 216),
        "stripe": (194, 104, 43),
        "chest": (255, 244, 220),
        "pattern": "calico",
    },
]

ACTIONS = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"]


def rgba(color, alpha=255):
    return tuple(color) + (alpha,)


def transparent(size=320):
    return Image.new("RGBA", (size, size), (0, 0, 0, 0))


def draw_source(sample, path):
    img = Image.new("RGB", (512, 512), (236, 241, 247))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.rounded_rectangle((24, 24, 488, 488), radius=34, fill=(255, 255, 255, 255), outline=(201, 213, 225, 255), width=3)
    draw.ellipse((102, 312, 410, 360), fill=(0, 0, 0, 28))
    draw_tail(draw, 260, 330, sample, "idle", 0, scale=1.35)
    draw_cat(draw, 256, 340, sample, "idle", 0, 0, scale=1.25, source=True)
    draw.text((36, 36), sample["label"], fill=(42, 55, 75, 255))
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)


def draw_tail(draw, cx, y, sample, action, phase, scale=1.0):
    fur = rgba(sample["fur"])
    stripe = rgba(sample["stripe"], 210)
    lift = -36 if action in ("running", "success", "warning") else -18
    sway = int(18 * phase)
    pts = [
        (cx + int(48 * scale), y - int(62 * scale)),
        (cx + int((95 + sway) * scale), y + int(lift * scale)),
        (cx + int((124 + sway) * scale), y - int(56 * scale)),
    ]
    draw.line(pts, fill=fur, width=int(21 * scale), joint="curve")
    draw.line(pts, fill=stripe, width=max(3, int(5 * scale)), joint="curve")


def draw_pattern(draw, sample, cx, y, body_h, scale, lean):
    if sample["pattern"] == "tabby":
        for i in range(5):
            yy = y - body_h + int((30 + i * 18) * scale)
            draw.arc((cx - int(70 * scale) + lean, yy, cx + int(70 * scale) + lean, yy + int(42 * scale)), 205, 335, fill=rgba(sample["stripe"], 190), width=max(2, int(4 * scale)))
    elif sample["pattern"] == "tuxedo":
        draw.ellipse((cx - int(38 * scale) + lean, y - body_h + int(42 * scale), cx + int(38 * scale) + lean, y - int(8 * scale)), fill=rgba(sample["chest"]))
        draw.ellipse((cx - int(24 * scale) + lean, y - body_h - int(48 * scale), cx + int(24 * scale) + lean, y - body_h - int(18 * scale)), fill=rgba(sample["chest"]))
    elif sample["pattern"] == "calico":
        draw.ellipse((cx - int(60 * scale) + lean, y - body_h + int(18 * scale), cx - int(18 * scale) + lean, y - body_h + int(66 * scale)), fill=rgba((210, 109, 42), 230))
        draw.ellipse((cx + int(18 * scale) + lean, y - body_h + int(52 * scale), cx + int(62 * scale) + lean, y - int(18 * scale)), fill=rgba((40, 40, 42), 220))
        draw.ellipse((cx - int(18 * scale) + lean, y - body_h - int(40 * scale), cx + int(26 * scale) + lean, y - body_h - int(2 * scale)), fill=rgba((216, 112, 44), 230))


def draw_cat(draw, cx, base_y, sample, action, frame_index, phase, scale=1.0, source=False):
    squash = 1.0
    body_shift = 0
    head_shift = 0
    lean = 0
    paw_lift = 0
    eye_open = True
    mouth = "calm"
    if action == "idle":
        body_shift = int(-5 * abs(phase) * scale)
    elif action == "thinking":
        lean = int(10 * phase * scale)
        head_shift = int(-8 * scale)
        mouth = "dot"
    elif action == "running":
        lean = int(16 * scale)
        body_shift = int(-15 * abs(phase) * scale)
        paw_lift = int(26 * abs(phase) * scale)
    elif action == "success":
        body_shift = int(-42 * abs(phase) * scale)
        head_shift = int(-16 * abs(phase) * scale)
        mouth = "happy"
    elif action == "warning":
        body_shift = int(-10 * abs(phase) * scale)
        mouth = "warn"
    elif action == "error":
        squash = 0.86 if abs(phase) > 0.8 else 1.0
        body_shift = int(18 * abs(phase) * scale)
        eye_open = abs(phase) < 0.8
        mouth = "error"
    elif action == "need_input":
        paw_lift = int(38 * abs(phase) * scale)
        head_shift = int(-8 * abs(phase) * scale)
        mouth = "ask"
    elif action == "sleeping":
        body_shift = int(7 * abs(phase) * scale)
        eye_open = False
        mouth = "sleep"

    y = base_y + body_shift
    draw_tail(draw, cx, y, sample, action, phase, scale)
    body_w = int(92 * scale)
    body_h = int(116 * squash * scale)
    draw.ellipse((cx - body_w + lean, y - body_h, cx + body_w + lean, y + int(12 * scale)), fill=rgba(sample["fur"]))
    draw.ellipse((cx - int(34 * scale) + lean, y - body_h + int(45 * scale), cx + int(34 * scale) + lean, y - int(4 * scale)), fill=rgba(sample["chest"]))
    draw_pattern(draw, sample, cx, y, body_h, scale, lean)
    draw.ellipse((cx - int(70 * scale) + lean, y - int(19 * scale) - paw_lift, cx - int(35 * scale) + lean, y + int(11 * scale) - paw_lift), fill=rgba(sample["chest"]))
    draw.ellipse((cx + int(35 * scale) + lean, y - int(19 * scale) + paw_lift // 2, cx + int(70 * scale) + lean, y + int(11 * scale) + paw_lift // 2), fill=rgba(sample["chest"]))

    hx = cx + lean // 2
    hy = y - body_h - int(16 * scale) + head_shift
    draw.polygon([(hx - int(50 * scale), hy - int(22 * scale)), (hx - int(31 * scale), hy - int(82 * scale)), (hx - int(8 * scale), hy - int(30 * scale))], fill=rgba(sample["fur"]))
    draw.polygon([(hx + int(50 * scale), hy - int(22 * scale)), (hx + int(31 * scale), hy - int(82 * scale)), (hx + int(8 * scale), hy - int(30 * scale))], fill=rgba(sample["fur"]))
    draw.ellipse((hx - int(59 * scale), hy - int(56 * scale), hx + int(59 * scale), hy + int(48 * scale)), fill=rgba(sample["fur"]))
    if sample["pattern"] == "calico":
        draw.pieslice((hx - int(50 * scale), hy - int(55 * scale), hx + int(30 * scale), hy + int(30 * scale)), 110, 290, fill=rgba((208, 105, 42), 220))
        draw.pieslice((hx - int(10 * scale), hy - int(55 * scale), hx + int(56 * scale), hy + int(32 * scale)), -70, 90, fill=rgba((40, 40, 42), 220))
    elif sample["pattern"] == "tabby":
        for dx in [-24, 0, 24]:
            draw.line((hx + int(dx * scale), hy - int(54 * scale), hx + int((dx // 2) * scale), hy - int(30 * scale)), fill=rgba(sample["stripe"], 190), width=max(2, int(3 * scale)))
    draw.ellipse((hx - int(28 * scale), hy + int(8 * scale), hx + int(28 * scale), hy + int(42 * scale)), fill=rgba(sample["chest"], 230))
    if eye_open:
        draw.ellipse((hx - int(30 * scale), hy - int(20 * scale), hx - int(12 * scale), hy + int(5 * scale)), fill=(20, 20, 18, 255))
        draw.ellipse((hx + int(12 * scale), hy - int(20 * scale), hx + int(30 * scale), hy + int(5 * scale)), fill=(20, 20, 18, 255))
    else:
        draw.arc((hx - int(32 * scale), hy - int(13 * scale), hx - int(8 * scale), hy + int(9 * scale)), 15, 165, fill=(48, 43, 40, 255), width=max(2, int(3 * scale)))
        draw.arc((hx + int(8 * scale), hy - int(13 * scale), hx + int(32 * scale), hy + int(9 * scale)), 15, 165, fill=(48, 43, 40, 255), width=max(2, int(3 * scale)))
    draw.polygon([(hx - int(7 * scale), hy + int(13 * scale)), (hx + int(7 * scale), hy + int(13 * scale)), (hx, hy + int(21 * scale))], fill=(218, 126, 126, 255))
    if mouth == "happy":
        draw.arc((hx - int(18 * scale), hy + int(17 * scale), hx, hy + int(36 * scale)), 20, 160, fill=(58, 46, 42, 255), width=max(2, int(3 * scale)))
        draw.arc((hx, hy + int(17 * scale), hx + int(18 * scale), hy + int(36 * scale)), 20, 160, fill=(58, 46, 42, 255), width=max(2, int(3 * scale)))
    elif mouth == "error":
        draw.arc((hx - int(16 * scale), hy + int(25 * scale), hx + int(16 * scale), hy + int(45 * scale)), 200, 340, fill=(58, 46, 42, 255), width=max(2, int(3 * scale)))
    elif mouth == "ask":
        draw.ellipse((hx - int(5 * scale), hy + int(27 * scale), hx + int(5 * scale), hy + int(37 * scale)), fill=(58, 46, 42, 255))
    else:
        draw.line((hx, hy + int(21 * scale), hx, hy + int(31 * scale)), fill=(58, 46, 42, 255), width=max(1, int(2 * scale)))

    for side in [-1, 1]:
        for dy in [-2, 7, 15]:
            draw.line((hx + side * int(18 * scale), hy + int((15 + dy) * scale), hx + side * int(66 * scale), hy + int((8 + dy) * scale)), fill=(83, 74, 66, 185), width=max(1, int(2 * scale)))
    if action == "thinking" and not source:
        draw.text((hx + int(56 * scale), hy - int(78 * scale)), "?", fill=(66, 82, 110, 220))
    if action == "warning" and not source:
        draw.polygon([(hx + int(64 * scale), hy - int(78 * scale)), (hx + int(84 * scale), hy - int(36 * scale)), (hx + int(44 * scale), hy - int(36 * scale))], fill=(244, 180, 48, 230))
    if action == "need_input" and not source:
        draw.rounded_rectangle((hx + int(46 * scale), hy - int(70 * scale), hx + int(126 * scale), hy - int(34 * scale)), radius=int(10 * scale), fill=(255, 255, 255, 235), outline=(123, 136, 154, 255), width=max(1, int(2 * scale)))
        draw.text((hx + int(66 * scale), hy - int(63 * scale)), "...", fill=(45, 55, 78, 255))
    if action == "sleeping" and not source:
        draw.text((hx + int(56 * scale), hy - int(78 * scale)), "Z", fill=(70, 84, 120, 190))


def draw_action_frame(sample, action, frame_index, frame_count):
    size = 320
    phase = math.sin((frame_index / max(1, frame_count - 1)) * math.pi * 2)
    if frame_index == 0 or frame_index == frame_count - 1:
        phase = 0
    img = transparent(size)
    draw = ImageDraw.Draw(img, "RGBA")
    draw.ellipse((72, 278, 248, 300), fill=(0, 0, 0, 35))
    draw_cat(draw, 160, 276, sample, action, frame_index, phase, scale=0.78)
    return img


def save_gif(frames, path):
    paletted = [frame.convert("RGBA").convert("P", palette=Image.Palette.ADAPTIVE, colors=255) for frame in frames]
    path.parent.mkdir(parents=True, exist_ok=True)
    paletted[0].save(path, save_all=True, append_images=paletted[1:], duration=115, loop=0, disposal=2, transparency=0)


def contact_sheet(sample_dir, action_paths):
    sheet = Image.new("RGB", (960, 480), (248, 250, 252))
    draw = ImageDraw.Draw(sheet)
    for idx, action in enumerate(ACTIONS):
        gif_path = action_paths[action]
        frame = Image.open(gif_path).convert("RGBA")
        thumb = frame.resize((210, 210), Image.Resampling.LANCZOS)
        x = (idx % 4) * 240 + 15
        y = (idx // 4) * 240 + 12
        draw.rounded_rectangle((x, y, x + 220, y + 222), radius=14, fill=(255, 255, 255), outline=(218, 226, 235), width=2)
        sheet.paste(thumb.convert("RGB"), (x + 5, y + 5), thumb.getchannel("A"))
        draw.text((x + 12, y + 202), action, fill=(40, 53, 72))
    path = sample_dir / "contact-sheet.png"
    sheet.save(path)
    return path


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: v40_host_sample_animation_probe.py <repo-root> <out-dir-rel>")
    repo = Path(sys.argv[1])
    out_dir = repo / sys.argv[2]
    out_dir.mkdir(parents=True, exist_ok=True)
    results = []
    for sample in SAMPLES:
        sample_dir = out_dir / sample["sampleId"]
        sample_dir.mkdir(parents=True, exist_ok=True)
        source_path = sample_dir / "source.png"
        draw_source(sample, source_path)
        action_paths = {}
        actions = []
        for action in ACTIONS:
            frame_count = 7 if action in ("idle", "thinking", "running", "sleeping") else 5
            frames = [draw_action_frame(sample, action, idx, frame_count) for idx in range(frame_count)]
            gif_path = sample_dir / f"{action}.gif"
            save_gif(frames, gif_path)
            action_paths[action] = gif_path
            actions.append({
                "actionId": action,
                "gif": str(gif_path.relative_to(repo)).replace("\\", "/"),
                "frameCount": frame_count,
                "firstFinalClosed": True,
                "motionClass": "large" if action in ("running", "success", "need_input") else "medium",
            })
        sheet_path = contact_sheet(sample_dir, action_paths)
        results.append({
            "sampleId": sample["sampleId"],
            "label": sample["label"],
            "coatPattern": sample["pattern"],
            "sourceImage": str(source_path.relative_to(repo)).replace("\\", "/"),
            "contactSheet": str(sheet_path.relative_to(repo)).replace("\\", "/"),
            "actions": actions,
            "generationRoute": "host_synthetic_template_probe",
            "auditDecision": "not_accepted_for_v40_target",
            "boundary": "synthetic host image plus deterministic template animation; does not prove image understanding or arbitrary-cat high-quality photo-to-animation readiness",
        })
    manifest = {
        "status": "probe_generated_not_v40_passed",
        "sampleCount": len(results),
        "actionCountPerSample": len(ACTIONS),
        "samples": results,
        "claimBoundary": "This host-process probe is evidence of local controlled asset generation only. It is not V40 high-quality image-to-action acceptance.",
    }
    manifest_path = out_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"ok": True, "manifest": str(manifest_path.relative_to(repo)).replace("\\", "/"), **manifest}, ensure_ascii=False))


if __name__ == "__main__":
    main()
