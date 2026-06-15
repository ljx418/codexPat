#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageStat


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


def transform_frame(base: Image.Image, phase: int) -> Image.Image:
    if phase == 0:
        return base.copy()
    scale = 1.0 + (0.018 * phase)
    dx = 0
    dy = -3 * phase
    size = (max(1, int(base.width * scale)), max(1, int(base.height * scale)))
    scaled = base.resize(size, Image.Resampling.BICUBIC)
    canvas = Image.new("RGBA", base.size, (255, 255, 255, 0))
    x = (base.width - scaled.width) // 2 + dx
    y = (base.height - scaled.height) // 2 + dy
    canvas.alpha_composite(scaled, (x, y))
    return canvas


def phases_for(action: str) -> list[int]:
    if action in LOOP_ACTIONS:
        return [0, 1, 2, 1, 0, 0]
    return [0, 1, 0]


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
    cells = crop_cells(source_image)
    frames_by_action: dict[str, list[Path]] = {}
    frame_summary: dict[str, dict[str, object]] = {}
    actions_manifest: dict[str, dict[str, object]] = {}

    for action, base in cells.items():
        action_dir = pack_dir / action
        action_dir.mkdir(parents=True, exist_ok=True)
        frames: list[Path] = []
        rendered_frames: list[Image.Image] = []
        for index, phase in enumerate(phases_for(action), start=1):
            frame = transform_frame(base, phase)
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

