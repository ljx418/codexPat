#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import math
from collections import deque
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageStat


CORE_ACTIONS = [
    "idle",
    "thinking",
    "running",
    "success",
    "warning",
    "error",
    "need_input",
    "sleeping",
]

LOOP_ACTIONS = {"idle", "thinking", "running", "sleeping"}


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def alpha_coverage(image: Image.Image) -> float:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    visible = sum(1 for value in alpha.getdata() if value > 8)
    return round(visible / float(rgba.width * rgba.height), 4)


def image_delta(a: Image.Image, b: Image.Image) -> float:
    diff = ImageChops.difference(a.convert("RGBA"), b.convert("RGBA"))
    stat = ImageStat.Stat(diff)
    return round(sum(stat.mean) / len(stat.mean), 4)


def crop_cells(source: Image.Image) -> dict[str, Image.Image]:
    width, height = source.size
    cell_w = width // 4
    cell_h = height // 2
    cells: dict[str, Image.Image] = {}
    for index, action in enumerate(CORE_ACTIONS):
        col = index % 4
        row = index // 4
        box = (col * cell_w, row * cell_h, (col + 1) * cell_w, (row + 1) * cell_h)
        crop = source.crop(box).convert("RGBA")
        cells[action] = crop.resize((512, 512), Image.Resampling.LANCZOS)
    return cells


def is_edge_background(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    if a < 12:
        return True
    # Generated sheets use warm white panels. Flood-filling only from edges
    # keeps white chest fur while removing the connected panel/background.
    return r >= 224 and g >= 220 and b >= 214 and (max(r, g, b) - min(r, g, b)) <= 34


def remove_edge_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    width, height = rgba.size
    px = rgba.load()
    seen = set()
    queue: deque[tuple[int, int]] = deque()

    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        if (x, y) in seen or x < 0 or y < 0 or x >= width or y >= height:
            continue
        seen.add((x, y))
        if not is_edge_background(px[x, y]):
            continue
        px[x, y] = (255, 255, 255, 0)
        queue.extend(((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))

    alpha = rgba.getchannel("A").filter(ImageFilter.GaussianBlur(0.35))
    rgba.putalpha(alpha)
    return rgba


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    bbox = image.getchannel("A").point(lambda value: 255 if value > 12 else 0).getbbox()
    if not bbox:
        return (0, 0, image.width, image.height)
    return bbox


def normalize_foreground(image: Image.Image, *, max_extent: int = 440) -> Image.Image:
    cleaned = remove_edge_background(image)
    bbox = alpha_bbox(cleaned)
    obj = cleaned.crop(bbox)
    scale = min(max_extent / obj.width, max_extent / obj.height, 1.4)
    size = (max(1, round(obj.width * scale)), max(1, round(obj.height * scale)))
    obj = obj.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (512, 512), (255, 255, 255, 0))
    x = (512 - obj.width) // 2
    y = 478 - obj.height
    canvas.alpha_composite(obj, (x, max(12, y)))
    return canvas


def motion_specs(action: str) -> list[dict[str, float]]:
    specs: dict[str, list[dict[str, float]]] = {
        "idle": [
            {"dx": 0, "dy": 0, "rot": 0, "sx": 1.0, "sy": 1.0},
            {"dx": 1, "dy": -5, "rot": -1, "sx": 1.01, "sy": 0.995},
            {"dx": 0, "dy": -8, "rot": 1, "sx": 0.995, "sy": 1.012},
            {"dx": -1, "dy": -5, "rot": 0.5, "sx": 1.005, "sy": 1.0},
            {"dx": 0, "dy": -2, "rot": -0.5, "sx": 1.0, "sy": 1.0},
            {"dx": 0, "dy": 0, "rot": 0, "sx": 1.0, "sy": 1.0},
        ],
        "thinking": [
            {"dx": -8, "dy": 0, "rot": -6, "sx": 1.0, "sy": 1.0},
            {"dx": -5, "dy": -7, "rot": -3, "sx": 1.01, "sy": 0.99},
            {"dx": 1, "dy": -10, "rot": 2, "sx": 0.995, "sy": 1.01},
            {"dx": 7, "dy": -5, "rot": 6, "sx": 1.0, "sy": 1.0},
            {"dx": 2, "dy": -2, "rot": 2, "sx": 1.0, "sy": 1.0},
            {"dx": -8, "dy": 0, "rot": -6, "sx": 1.0, "sy": 1.0},
        ],
        "running": [
            {"dx": -30, "dy": 7, "rot": -6, "sx": 1.03, "sy": 0.96},
            {"dx": -12, "dy": -9, "rot": 2, "sx": 0.98, "sy": 1.03},
            {"dx": 13, "dy": 0, "rot": 5, "sx": 1.02, "sy": 0.98},
            {"dx": 32, "dy": -16, "rot": 0, "sx": 0.99, "sy": 1.04},
            {"dx": 8, "dy": 1, "rot": -3, "sx": 1.02, "sy": 0.98},
            {"dx": -30, "dy": 7, "rot": -6, "sx": 1.03, "sy": 0.96},
        ],
        "success": [
            {"dx": 0, "dy": 0, "rot": 0, "sx": 1.0, "sy": 1.0},
            {"dx": -7, "dy": -24, "rot": -8, "sx": 0.99, "sy": 1.03},
            {"dx": 4, "dy": -58, "rot": 6, "sx": 1.02, "sy": 0.98},
            {"dx": 9, "dy": -32, "rot": 9, "sx": 1.0, "sy": 1.0},
            {"dx": 2, "dy": -8, "rot": 2, "sx": 1.01, "sy": 0.99},
            {"dx": 0, "dy": 0, "rot": 0, "sx": 1.0, "sy": 1.0},
        ],
        "warning": [
            {"dx": -15, "dy": 1, "rot": -4, "sx": 1.0, "sy": 1.0},
            {"dx": 15, "dy": -4, "rot": 4, "sx": 1.01, "sy": 0.99},
            {"dx": -12, "dy": -1, "rot": -3, "sx": 1.0, "sy": 1.0},
            {"dx": 12, "dy": -5, "rot": 3, "sx": 1.0, "sy": 1.0},
            {"dx": 0, "dy": -2, "rot": 0, "sx": 1.0, "sy": 1.0},
            {"dx": -15, "dy": 1, "rot": -4, "sx": 1.0, "sy": 1.0},
        ],
        "error": [
            {"dx": 0, "dy": 8, "rot": 0, "sx": 1.04, "sy": 0.94},
            {"dx": -9, "dy": 17, "rot": -8, "sx": 1.07, "sy": 0.9},
            {"dx": 8, "dy": 11, "rot": 7, "sx": 1.04, "sy": 0.94},
            {"dx": -6, "dy": 20, "rot": -6, "sx": 1.08, "sy": 0.88},
            {"dx": 3, "dy": 12, "rot": 4, "sx": 1.05, "sy": 0.92},
            {"dx": 0, "dy": 8, "rot": 0, "sx": 1.04, "sy": 0.94},
        ],
        "need_input": [
            {"dx": 0, "dy": 0, "rot": 0, "sx": 1.0, "sy": 1.0},
            {"dx": -3, "dy": -12, "rot": -3, "sx": 0.99, "sy": 1.02},
            {"dx": 5, "dy": -22, "rot": 4, "sx": 1.01, "sy": 1.0},
            {"dx": 3, "dy": -15, "rot": 2, "sx": 1.0, "sy": 1.0},
            {"dx": 0, "dy": -5, "rot": 0, "sx": 1.0, "sy": 1.0},
            {"dx": 0, "dy": 0, "rot": 0, "sx": 1.0, "sy": 1.0},
        ],
        "sleeping": [
            {"dx": 0, "dy": 0, "rot": 0, "sx": 1.0, "sy": 1.0},
            {"dx": 0, "dy": 6, "rot": -1, "sx": 1.03, "sy": 0.96},
            {"dx": 1, "dy": 11, "rot": -2, "sx": 1.06, "sy": 0.92},
            {"dx": -1, "dy": 8, "rot": -1, "sx": 1.04, "sy": 0.94},
            {"dx": 0, "dy": 3, "rot": 0, "sx": 1.01, "sy": 0.98},
            {"dx": 0, "dy": 0, "rot": 0, "sx": 1.0, "sy": 1.0},
        ],
    }
    return specs[action]


def transform_frame(base: Image.Image, action: str, frame_index: int) -> Image.Image:
    spec = motion_specs(action)[frame_index]
    bbox = alpha_bbox(base)
    obj = base.crop(bbox)
    width = max(1, round(obj.width * spec["sx"]))
    height = max(1, round(obj.height * spec["sy"]))
    obj = obj.resize((width, height), Image.Resampling.BICUBIC)
    obj = obj.rotate(spec["rot"], resample=Image.Resampling.BICUBIC, expand=True)

    canvas = Image.new("RGBA", base.size, (255, 255, 255, 0))
    x = round((base.width - obj.width) / 2 + spec["dx"])
    y = round(478 - obj.height + spec["dy"])
    canvas.alpha_composite(obj, (x, max(-40, y)))
    draw_action_overlay(canvas, action, overlay_phase(frame_index), spec)
    return canvas


def overlay_phase(frame_index: int) -> int:
    # Keep first and final frames visually identical for seamless loops.
    return [0, 1, 2, 3, 1, 0][frame_index]


def draw_action_overlay(canvas: Image.Image, action: str, phase: int, spec: dict[str, float]) -> None:
    draw = ImageDraw.Draw(canvas, "RGBA")
    if action == "running":
        shift = int(spec["dx"])
        for i, y in enumerate((176, 226, 282)):
            x0 = 74 - max(0, shift // 4) - i * 8
            draw.line((x0, y, x0 + 66, y - 10), fill=(216, 113, 45, 78), width=5)
            draw.line((x0 + 8, y + 20, x0 + 52, y + 12), fill=(216, 113, 45, 56), width=3)
    elif action == "success":
        for angle in (0, 72, 144, 216, 288):
            radius = 82 + phase * 5
            x = 256 + math.cos(math.radians(angle)) * radius
            y = 118 + math.sin(math.radians(angle)) * 28
            draw.regular_polygon((x, y, 7), n_sides=5, rotation=angle, fill=(255, 184, 77, 150))
    elif action == "warning":
        draw.rounded_rectangle((330, 78, 394, 136), radius=14, fill=(255, 213, 107, 190), outline=(151, 91, 0, 170), width=4)
        draw.line((362, 92, 362, 116), fill=(106, 64, 0, 210), width=5)
        draw.ellipse((358, 121, 366, 129), fill=(106, 64, 0, 210))
    elif action == "error":
        center = (258, 88)
        for i in range(3):
            offset = i * 42 + phase * 5
            draw.arc((center[0] - 82 + offset, center[1] - 18, center[0] - 16 + offset, center[1] + 24), 195, 345, fill=(154, 91, 0, 105), width=5)
        draw.text((334, 84), "×", fill=(160, 45, 45, 190))
    elif action == "need_input":
        draw.ellipse((338, 76, 414, 152), fill=(255, 255, 255, 210), outline=(217, 111, 50, 190), width=4)
        draw.text((366, 90), "!", fill=(217, 111, 50, 230))
        draw.ellipse((322, 150, 338, 166), fill=(255, 255, 255, 180), outline=(217, 111, 50, 120), width=2)
    elif action == "thinking":
        for i, size in enumerate((12, 18, 24)):
            x = 326 + i * 28
            y = 104 - i * 14 + (phase % 3) * 2
            draw.ellipse((x, y, x + size, y + size), fill=(255, 255, 255, 210), outline=(217, 111, 50, 125), width=3)
    elif action == "sleeping":
        alpha = 110 + phase * 22
        draw.text((330, 96 - phase * 3), "Z", fill=(80, 104, 130, min(220, alpha)))
        draw.text((364, 76 - phase * 4), "z", fill=(80, 104, 130, min(190, alpha)))


def make_contact_sheet(frames_by_action: dict[str, list[Path]], out: Path) -> None:
    thumb = 160
    cols = 6
    rows = len(CORE_ACTIONS)
    sheet = Image.new("RGBA", (thumb * cols, thumb * rows), (245, 247, 250, 255))
    for row, action in enumerate(CORE_ACTIONS):
        for col, frame_path in enumerate(frames_by_action[action][:cols]):
            frame = Image.open(frame_path).convert("RGBA").resize((thumb, thumb), Image.Resampling.LANCZOS)
            sheet.alpha_composite(frame, (col * thumb, row * thumb))
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.convert("RGB").save(out, quality=92)


def main() -> None:
    root = Path(".")
    source = root / "apps/desktop/src/assets/generated/v16-host-image-tool-orange-tabby/source-action-sheet.png"
    pack_dir = root / "apps/desktop/src/assets/generated/v16-host-image-tool-orange-tabby/pack"
    evidence_assets = root / "docs/V16.x/evidence/assets"
    pack_dir.mkdir(parents=True, exist_ok=True)
    evidence_assets.mkdir(parents=True, exist_ok=True)

    if not source.exists():
        raise SystemExit(json.dumps({"ok": False, "reasonCode": "provider_output_missing"}))

    source_image = Image.open(source).convert("RGBA")
    cells = {
        action: normalize_foreground(crop)
        for action, crop in crop_cells(source_image).items()
    }
    frames_by_action: dict[str, list[Path]] = {}
    frame_summary: dict[str, dict[str, object]] = {}
    actions_manifest: dict[str, dict[str, object]] = {}

    for action, base in cells.items():
        action_dir = pack_dir / action
        action_dir.mkdir(parents=True, exist_ok=True)
        frames: list[Path] = []
        rendered_frames: list[Image.Image] = []
        for index, _spec in enumerate(motion_specs(action), start=1):
            frame = transform_frame(base, action, index - 1)
            file_name = f"frame-{index:03d}.png"
            frame_path = action_dir / file_name
            frame.save(frame_path)
            frames.append(frame_path)
            rendered_frames.append(frame)
        frames_by_action[action] = frames
        first_final_delta = image_delta(rendered_frames[0], rendered_frames[-1])
        adjacent_deltas = [
            image_delta(rendered_frames[i - 1], rendered_frames[i])
            for i in range(1, len(rendered_frames))
        ]
        frame_summary[action] = {
            "frameCount": len(frames),
            "firstFinalDelta": first_final_delta,
            "maxAdjacentDelta": max(adjacent_deltas) if adjacent_deltas else 0,
            "alphaCoverage": alpha_coverage(rendered_frames[0]),
            "digests": [sha256_file(path)[:16] for path in frames],
        }
        actions_manifest[action] = {
            "frames": [f"{action}/frame-{index:03d}.png" for index in range(1, len(frames) + 1)],
            "fps": 8,
            "loop": action in LOOP_ACTIONS,
            "transient": action not in LOOP_ACTIONS,
            "durationMs": len(frames) * 125,
            "fallbackActionId": "idle",
        }

    pet_json = {
        "schemaVersion": "10.6",
        "packId": "v16-host-image-tool-orange-tabby",
        "displayName": "V16 Host Image Tool Orange Tabby",
        "rendererKind": "sprite",
        "format": "frameSequence",
        "canvas": {"width": 512, "height": 512},
        "actions": actions_manifest,
        "license": {
            "source": "generated-provider",
            "attribution": "Host ChatGPT/Codex image tool generated orange tabby action sheet",
        },
    }
    (pack_dir / "pet.json").write_text(json.dumps(pet_json, indent=2), encoding="utf-8")

    contact_sheet = evidence_assets / "v16_host_image_tool_orange_tabby_contact_sheet.png"
    make_contact_sheet(frames_by_action, contact_sheet)

    safe_summary = {
        "ok": True,
        "providerKind": "host_image_tool",
        "providerName": "Host ChatGPT/Codex image tool",
        "modelFamily": "host image generation tool",
        "packId": "v16-host-image-tool-orange-tabby",
        "sourceImageDigest": sha256_file(source)[:16],
        "contactSheetFile": contact_sheet.name,
        "petJsonFile": "pet.json",
        "actionCount": len(CORE_ACTIONS),
        "totalFrameCount": sum(int(item["frameCount"]) for item in frame_summary.values()),
        "actions": frame_summary,
    }
    (evidence_assets / "v16_host_image_tool_orange_tabby_summary.json").write_text(
        json.dumps(safe_summary, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(safe_summary, indent=2))


if __name__ == "__main__":
    main()
