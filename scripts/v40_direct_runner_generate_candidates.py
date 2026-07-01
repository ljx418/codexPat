import argparse
import json
import os
from pathlib import Path

import torch
from diffusers import StableDiffusionPipeline


SAMPLES = [
    {
        "sampleId": "v38_a_cat_public",
        "style": "brown tabby cat",
        "traits": "green eyes, striped forehead, white chin, short fur",
    },
    {
        "sampleId": "v38_tuxedo_public",
        "style": "black and white bicolor house cat",
        "traits": "white chest, black ears, white muzzle, natural cat body",
    },
]

ACTION_PROMPTS = [
    ("idle", "standing calmly"),
    ("walk", "walking side view"),
    ("jump", "jumping upward"),
    ("sleep", "single cat curled sleeping alone"),
    ("eat", "eating from bowl"),
    ("play", "paw raised playing"),
    ("alert", "ears up surprised"),
    ("celebrate", "happy cheering"),
]


def safe_name(value: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "-" for ch in value).strip("-")[:80] or "candidate"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--model-label", default="local-checkpoint")
    parser.add_argument("--out", required=True)
    parser.add_argument("--steps", type=int, default=8)
    parser.add_argument("--width", type=int, default=512)
    parser.add_argument("--height", type=int, default=512)
    args = parser.parse_args()

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    if not torch.cuda.is_available():
      print(json.dumps({"ok": False, "reason": "cuda_unavailable"}))
      return 2

    pipe = StableDiffusionPipeline.from_single_file(
        args.model,
        torch_dtype=torch.float16,
        safety_checker=None,
        requires_safety_checker=False,
    )
    pipe = pipe.to("cuda")
    if hasattr(pipe, "enable_attention_slicing"):
        pipe.enable_attention_slicing()

    outputs = []
    negative_prompt = "human, person, girl, clothes, bowtie, bow, collar, suit, vest, text, logo, watermark, letters, multiple cats, second cat, duplicate, extra limbs, blurry"
    for index, sample in enumerate(SAMPLES):
        sample_dir = out_dir / safe_name(sample["sampleId"])
        sample_dir.mkdir(parents=True, exist_ok=True)
        action_files = []
        action_images = []
        for action_index, (action_id, action_phrase) in enumerate(ACTION_PROMPTS):
            generator = torch.Generator(device="cuda").manual_seed(4040 + index * 100 + action_index)
            prompt = (
                f"cute 2D game pet sprite, single cat, one full body {sample['style']}, "
                f"{sample['traits']}, {action_phrase}, plain gray background"
            )
            image = pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                num_inference_steps=args.steps,
                guidance_scale=7.0,
                width=args.width,
                height=args.height,
                generator=generator,
            ).images[0]
            file_name = f"{action_id}.png"
            image.save(sample_dir / file_name)
            action_files.append({"actionId": action_id, "fileName": f"{safe_name(sample['sampleId'])}/{file_name}"})
            action_images.append((action_id, image))
        contact_sheet = make_contact_sheet(action_images, args.width, args.height)
        contact_file = f"{safe_name(sample['sampleId'])}-contact-sheet.png"
        contact_sheet.save(out_dir / contact_file)
        outputs.append({
            "sampleId": sample["sampleId"],
            "candidateId": f"v40-{safe_name(sample['sampleId'])}-direct-candidate",
            "modelLabel": safe_name(args.model_label),
            "fileName": action_files[0]["fileName"],
            "contactSheetFileName": contact_file,
            "actionFiles": action_files,
            "route": "direct_local_runner_no_webui",
        })

    print(json.dumps({"ok": True, "outputs": outputs}))
    return 0


def make_contact_sheet(action_images, width, height):
    from PIL import Image, ImageDraw
    cols = 4
    rows = 2
    label_h = 26
    sheet = Image.new("RGB", (cols * width, rows * (height + label_h)), (238, 240, 244))
    draw = ImageDraw.Draw(sheet)
    for index, (action_id, image) in enumerate(action_images):
        col = index % cols
        row = index // cols
        x = col * width
        y = row * (height + label_h)
        sheet.paste(image.convert("RGB"), (x, y))
        draw.rectangle((x, y + height, x + width, y + height + label_h), fill=(30, 41, 59))
        draw.text((x + 8, y + height + 6), action_id, fill=(255, 255, 255))
    return sheet


if __name__ == "__main__":
    raise SystemExit(main())
