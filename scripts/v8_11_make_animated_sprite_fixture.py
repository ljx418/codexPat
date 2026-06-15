from pathlib import Path
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont


ACTIONS = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"]
FRAME_COUNT = 4
FPS = 8


def main() -> int:
    if len(sys.argv) != 4:
        print("usage: v8_11_make_animated_sprite_fixture.py <source-dir> <output-dir> <evidence-dir>", file=sys.stderr)
        return 2

    source_dir = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    evidence_dir = Path(sys.argv[3])
    output_dir.mkdir(parents=True, exist_ok=True)
    evidence_dir.mkdir(parents=True, exist_ok=True)

    for action_index, action in enumerate(ACTIONS):
        source = source_dir / f"{action}.png"
        if not source.exists():
            print(f"missing source action: {action}", file=sys.stderr)
            return 3
        base = Image.open(source).convert("RGBA")
        for frame_index in range(FRAME_COUNT):
            frame = make_frame(base, action, action_index, frame_index)
            frame.save(output_dir / f"{action}-{frame_index:03}.png")

    write_manifest(output_dir)
    write_contact_sheet(output_dir, evidence_dir / "v8_11-animated-sprite-contact-sheet-2026-06-03.png")
    write_animation_gif(output_dir, evidence_dir / "v8_11-animated-sprite-animation-preview-2026-06-03.gif")
    write_html(output_dir, evidence_dir / "v8_11-animated-sprite-animation-preview-2026-06-03.html")
    print(json.dumps({
        "status": "passed",
        "actionCount": len(ACTIONS),
        "frameCount": FRAME_COUNT,
        "fps": FPS,
        "manifest": "manifest.json"
    }, indent=2))
    return 0


def make_frame(base: Image.Image, action: str, action_index: int, frame_index: int) -> Image.Image:
    canvas = Image.new("RGBA", base.size, (0, 0, 0, 0))
    x_offset = [-4, 0, 4, 0][frame_index % 4]
    y_offset = [0, -4, 0, 4][(frame_index + action_index) % 4]
    canvas.alpha_composite(base, (x_offset, y_offset))

    draw = ImageDraw.Draw(canvas)
    marker_color = [
        (250, 204, 21, 220),
        (59, 130, 246, 220),
        (34, 197, 94, 220),
        (239, 68, 68, 220),
    ][frame_index % 4]
    radius = 7 + frame_index
    draw.ellipse((12, 12, 12 + radius * 2, 12 + radius * 2), fill=marker_color)
    draw.text((12, base.size[1] - 22), f"{action} {frame_index}", fill=(17, 24, 39, 220), font=ImageFont.load_default())
    return canvas


def write_manifest(output_dir: Path) -> None:
    assets = {}
    actions = {}
    for action in ACTIONS:
        assets[action] = {
            "assetId": action,
            "kind": "sprite",
            "fileName": f"{action}-000.png",
            "frameFiles": [f"{action}-{index:03}.png" for index in range(FRAME_COUNT)],
            "fps": FPS,
        }
        actions[action] = {
            "assetId": action,
            "loop": action in {"idle", "thinking", "running", "sleeping"},
            "priority": "urgent" if action in {"error", "need_input"} else "base" if action in {"idle", "sleeping"} else "transient",
        }
    manifest = {
        "schemaVersion": "5.8",
        "packId": "v8-11-animated-orange-tabby",
        "displayName": "V8.11 Animated Orange Tabby",
        "rendererKind": "sprite",
        "license": {
            "type": "project-fixture",
            "attribution": "Agent Desktop Pet V8.11 animated sprite fixture",
        },
        "assets": assets,
        "actions": actions,
    }
    (output_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def write_contact_sheet(output_dir: Path, output: Path) -> None:
    cell_w = 260
    cell_h = 260
    cols = 4
    rows = 2
    header_h = 86
    margin = 24
    width = cols * cell_w + margin * 2
    height = header_h + rows * cell_h + margin
    sheet = Image.new("RGB", (width, height), (246, 247, 248))
    draw = ImageDraw.Draw(sheet)
    draw.text((margin, 26), "V8.11 Animated Sprite Visual QA", fill=(23, 32, 42), font=ImageFont.load_default())
    draw.text((margin, 50), "First frame from each generated multi-frame action sequence", fill=(83, 96, 109), font=ImageFont.load_default())
    for index, action in enumerate(ACTIONS):
        img = Image.open(output_dir / f"{action}-000.png").convert("RGBA")
        img.thumbnail((172, 172), Image.LANCZOS)
        col = index % cols
        row = index // cols
        x = margin + col * cell_w
        y = header_h + row * cell_h
        draw.rounded_rectangle((x, y, x + cell_w - 18, y + cell_h - 18), radius=8, fill=(255, 255, 255), outline=(217, 222, 229))
        checker = Image.new("RGB", (180, 180), (255, 255, 255))
        checker_draw = ImageDraw.Draw(checker)
        for cy in range(0, 180, 20):
            for cx in range(0, 180, 20):
                if (cx // 20 + cy // 20) % 2 == 0:
                    checker_draw.rectangle((cx, cy, cx + 19, cy + 19), fill=(241, 243, 245))
        sheet.paste(checker, (x + 31, y + 18))
        sheet.paste(img, (x + (cell_w - 18 - img.width) // 2, y + 26), img)
        draw.text((x + 24, y + 212), action, fill=(23, 32, 42), font=ImageFont.load_default())
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output)


def write_animation_gif(output_dir: Path, output: Path) -> None:
    frames = []
    for action in ACTIONS:
        for index in range(FRAME_COUNT):
            frames.append(Image.open(output_dir / f"{action}-{index:03}.png").convert("RGBA"))
    frames[0].save(output, save_all=True, append_images=frames[1:], duration=int(1000 / FPS), loop=0)


def write_html(output_dir: Path, output: Path) -> None:
    cards = []
    rel = Path(os.path.relpath(output_dir, output.parent))
    for action in ACTIONS:
        frames = [f"{rel}/{action}-{index:03}.png" for index in range(FRAME_COUNT)]
        cards.append(f"""
          <figure>
            <img alt="{action}" data-frames="{'|'.join(frames)}" src="{frames[0]}" />
            <figcaption>{action}</figcaption>
          </figure>
        """)
    output.write_text(f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>V8.11 Animated Sprite Preview</title>
  <style>
    body {{ margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f6f7f8; color: #17202a; }}
    main {{ padding: 28px; }}
    h1 {{ font-size: 24px; margin: 0 0 8px; }}
    p {{ margin: 0 0 24px; color: #53606d; }}
    .grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }}
    figure {{ margin: 0; background: #fff; border: 1px solid #d9dee5; border-radius: 8px; padding: 14px; min-height: 230px; display: flex; flex-direction: column; align-items: center; justify-content: center; }}
    img {{ width: 160px; height: 160px; object-fit: contain; background: repeating-conic-gradient(#f1f3f5 0% 25%, #ffffff 0% 50%) 50% / 24px 24px; border: 1px solid #e4e8ee; }}
    figcaption {{ margin-top: 12px; font-size: 15px; font-weight: 600; }}
  </style>
</head>
<body>
  <main>
    <h1>V8.11 Animated Sprite Preview</h1>
    <p>Local generated multi-frame sprite fixture. No provider execution.</p>
    <section class="grid">{''.join(cards)}</section>
  </main>
  <script>
    const images = [...document.querySelectorAll('img[data-frames]')];
    let index = 0;
    setInterval(() => {{
      index += 1;
      for (const img of images) {{
        const frames = img.dataset.frames.split('|');
        img.src = frames[index % frames.length];
      }}
    }}, {int(1000 / FPS)});
  </script>
</body>
</html>""", encoding="utf-8")


if __name__ == "__main__":
    raise SystemExit(main())
