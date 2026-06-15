from pathlib import Path
import sys

from PIL import Image, ImageDraw, ImageFont


def main() -> int:
    if len(sys.argv) < 4:
        print("usage: v7_14_make_contact_sheet.py <output.png> <title> <image...>", file=sys.stderr)
        return 2

    output = Path(sys.argv[1])
    title = sys.argv[2]
    image_paths = [Path(item) for item in sys.argv[3:]]

    cell_w = 260
    cell_h = 260
    cols = 4
    rows = (len(image_paths) + cols - 1) // cols
    header_h = 86
    margin = 24
    width = cols * cell_w + margin * 2
    height = header_h + rows * cell_h + margin

    sheet = Image.new("RGB", (width, height), (246, 247, 248))
    draw = ImageDraw.Draw(sheet)
    title_font = ImageFont.load_default()
    label_font = ImageFont.load_default()
    draw.text((margin, 26), title, fill=(23, 32, 42), font=title_font)
    draw.text((margin, 50), "Isolated V7.14 generated 2D action evidence", fill=(83, 96, 109), font=label_font)

    for index, path in enumerate(image_paths):
      img = Image.open(path).convert("RGBA")
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
      img_x = x + (cell_w - 18 - img.width) // 2
      img_y = y + 26
      sheet.paste(checker, (x + 31, y + 18))
      sheet.paste(img, (img_x, img_y), img)
      draw.text((x + 24, y + 212), path.stem, fill=(23, 32, 42), font=label_font)

    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
