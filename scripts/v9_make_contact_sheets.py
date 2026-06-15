from pathlib import Path
from PIL import Image, ImageDraw


ACTIONS = ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"]


def make_static_sheet(base: Path) -> None:
    make_sheet(base, [(action, base / f"{action}.png") for action in ACTIONS], base / "contact-sheet.png")


def make_dynamic_sheet(base: Path) -> None:
    entries = []
    for action in ACTIONS:
        entries.append((f"{action}-0", base / f"{action}-000.png"))
        entries.append((f"{action}-1", base / f"{action}-001.png"))
    make_sheet(base, entries, base / "contact-sheet.png", columns=4)


def make_sheet(base: Path, entries: list[tuple[str, Path]], output: Path, columns: int = 4) -> None:
    if not base.exists():
        raise SystemExit(f"missing directory: {base}")
    size = 220
    margin = 24
    label_h = 28
    rows = (len(entries) + columns - 1) // columns
    canvas = Image.new("RGB", (columns * (size + margin) + margin, rows * (size + label_h + margin) + margin), "white")
    draw = ImageDraw.Draw(canvas)
    for index, (label, path) in enumerate(entries):
        image = Image.open(path).convert("RGBA")
        image.thumbnail((size, size))
        x = margin + (index % columns) * (size + margin)
        y = margin + (index // columns) * (size + label_h + margin)
        canvas.paste(Image.new("RGB", (size, size), "#f6f6f6"), (x, y))
        canvas.paste(image, (x + (size - image.width) // 2, y + (size - image.height) // 2), image)
        draw.text((x, y + size + 4), label, fill="black")
    canvas.save(output)


def main() -> None:
    evidence = Path("docs/V9.x/evidence")
    make_static_sheet(evidence / "v9_2-minimax-static-2d-pack-2026-06-03")
    make_dynamic_sheet(evidence / "v9_3-minimax-dynamic-2d-pack-2026-06-03")


if __name__ == "__main__":
    main()
