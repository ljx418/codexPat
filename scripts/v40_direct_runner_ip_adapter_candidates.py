import argparse
import json
from pathlib import Path

import torch
from diffusers import StableDiffusionImg2ImgPipeline
from PIL import Image


SAMPLES = [
    {
        "sampleId": "v38_a_cat_public",
        "sourceRef": "docs/V38.x/evidence/assets/v38_a_cat_public/sanitized.png",
        "style": "brown tabby cat, green eyes, striped forehead, white chin",
    },
    {
        "sampleId": "v38_tuxedo_public",
        "sourceRef": "docs/V38.x/evidence/assets/v38_tuxedo_public/sanitized.png",
        "style": "black and white bicolor house cat, white chest, black ears, white muzzle",
    },
]

ACTION_PROMPTS = [
    ("idle", "standing calmly"),
    ("walk", "walking side view, one paw lifted"),
    ("jump", "jumping upward"),
    ("sleep", "curled sleeping alone"),
    ("eat", "eating from a small bowl"),
    ("play", "playing with one paw raised"),
    ("alert", "ears up surprised"),
    ("celebrate", "happy cheerful pose"),
]


def safe_name(value: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "-" for ch in value).strip("-")[:80] or "candidate"


def load_reference(repo_root: Path, rel_ref: str, width: int, height: int) -> Image.Image:
    image = Image.open(repo_root / rel_ref).convert("RGB")
    image.thumbnail((width, height), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (width, height), (210, 210, 210))
    x = (width - image.width) // 2
    y = (height - image.height) // 2
    canvas.paste(image, (x, y))
    return canvas


def make_init_canvas(width: int, height: int, mode: str, reference: Image.Image) -> Image.Image:
    if mode == "reference":
        return reference.copy()
    canvas = Image.new("RGB", (width, height), (194, 198, 204))
    return canvas


def make_contact_sheet(action_images, width, height):
    from PIL import ImageDraw

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


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--model-label", default="local-checkpoint")
    parser.add_argument("--out", required=True)
    parser.add_argument("--repo-root", default=".")
    parser.add_argument("--steps", type=int, default=20)
    parser.add_argument("--width", type=int, default=512)
    parser.add_argument("--height", type=int, default=512)
    parser.add_argument("--ip-adapter-scale", type=float, default=0.72)
    parser.add_argument("--strength", type=float, default=0.84)
    parser.add_argument("--guidance-scale", type=float, default=7.0)
    parser.add_argument("--init-mode", choices=["blank", "reference"], default="blank")
    parser.add_argument("--adapter-repo", default="h94/IP-Adapter")
    parser.add_argument("--local-adapter-root", default=None)
    parser.add_argument("--adapter-subfolder", default="models")
    parser.add_argument("--adapter-weight", default="ip-adapter_sd15.bin")
    args = parser.parse_args()

    out_dir = Path(args.out)
    repo_root = Path(args.repo_root)
    out_dir.mkdir(parents=True, exist_ok=True)

    if not torch.cuda.is_available():
        print(json.dumps({"ok": False, "reason": "cuda_unavailable"}))
        return 2

    pipe = StableDiffusionImg2ImgPipeline.from_single_file(
        args.model,
        torch_dtype=torch.float16,
        safety_checker=None,
        requires_safety_checker=False,
    )
    try:
        adapter_source = args.local_adapter_root or args.adapter_repo
        pipe.load_ip_adapter(
            adapter_source,
            subfolder=args.adapter_subfolder,
            weight_name=args.adapter_weight,
            local_files_only=bool(args.local_adapter_root),
        )
        pipe.set_ip_adapter_scale(args.ip_adapter_scale)
    except (AttributeError, OSError, ValueError, RuntimeError) as exc:
        reason = "identity_conditioned_runner_incompatible"
        if "out of memory" in str(exc).lower():
            reason = "vram_exhausted"
        print(json.dumps({"ok": False, "reason": reason}))
        return 3

    pipe = pipe.to("cuda")
    # Diffusers 0.35.2 + SD1.5 IP-Adapter img2img can return tuple-shaped
    # attention state when attention slicing is enabled. Keep slicing disabled
    # for this identity-conditioned route and rely on the 4090 VRAM budget.

    outputs = []
    negative_prompt = (
        "human, person, girl, clothes, bowtie, collar, text, logo, watermark, letters, "
        "multiple cats, second cat, duplicate, extra limbs, blurry, photo background, "
        "real photo, photorealistic, indoor room, furniture, window, door, carpet, "
        "cropped head, cropped body, close-up portrait"
    )
    for sample_index, sample in enumerate(SAMPLES):
        sample_dir = out_dir / safe_name(sample["sampleId"])
        sample_dir.mkdir(parents=True, exist_ok=True)
        reference = load_reference(repo_root, sample["sourceRef"], args.width, args.height)
        action_files = []
        action_images = []
        for action_index, (action_id, action_phrase) in enumerate(ACTION_PROMPTS):
            generator = torch.Generator(device="cuda").manual_seed(9040 + sample_index * 100 + action_index)
            init_image = make_init_canvas(args.width, args.height, args.init_mode, reference)
            prompt = (
                f"cute high quality 2D game desktop pet sprite, one single full body cat, {sample['style']}, "
                f"{action_phrase}, readable full-body silhouette, expressive pet animation pose, "
                f"clean hand-painted sticker concept art, cartoon sprite sheet frame, centered character, "
                f"plain light gray studio background, no room, no furniture"
            )
            try:
                image = pipe(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    image=init_image,
                    ip_adapter_image=reference,
                    strength=args.strength,
                    num_inference_steps=args.steps,
                    guidance_scale=args.guidance_scale,
                    width=args.width,
                    height=args.height,
                    generator=generator,
                ).images[0]
            except AttributeError:
                print(json.dumps({"ok": False, "reason": "identity_conditioned_runner_incompatible"}))
                return 3
            except RuntimeError as exc:
                reason = "vram_exhausted" if "out of memory" in str(exc).lower() else "identity_conditioned_generation_failed"
                print(json.dumps({"ok": False, "reason": reason}))
                return 3
            file_name = f"{action_id}.png"
            image.save(sample_dir / file_name)
            action_files.append({"actionId": action_id, "fileName": f"{safe_name(sample['sampleId'])}/{file_name}"})
            action_images.append((action_id, image))

        contact_file = f"{safe_name(sample['sampleId'])}-contact-sheet.png"
        make_contact_sheet(action_images, args.width, args.height).save(out_dir / contact_file)
        outputs.append({
            "sampleId": sample["sampleId"],
            "candidateId": f"v40r-{safe_name(sample['sampleId'])}-ip-adapter-candidate",
            "modelLabel": safe_name(args.model_label),
            "sourceRef": sample["sourceRef"],
            "contactSheetFileName": contact_file,
            "actionFiles": action_files,
            "route": "direct_local_ip_adapter_no_webui",
        })

    print(json.dumps({"ok": True, "outputs": outputs}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
