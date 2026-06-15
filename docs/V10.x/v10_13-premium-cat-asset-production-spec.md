# V10.13 Premium Cat Asset Production Spec

status: planned
date: 2026-06-05

## Goal

Define production-ready rules for the V10.13 premium bundled animated 2D cat
library. This spec must be complete enough for implementation without deciding
visual identity, frame requirements, file layout, or acceptance thresholds later.

## Asset Production Strategy

V10.13 uses local bundled SVG-procedural frame packs first. Generated raster
assets may be used only if they are converted into the same safe local animation
pack contract and pass the same validation.

Allowed production paths:

- controlled TypeScript/SVG templates committed in the app source.
- generated PNG/WebP frame sequences imported into app-managed bundled packs.
- local contact sheet and runtime capture generated from bundled assets.

Forbidden production paths:

- remote runtime loading.
- arbitrary local paths in manifests.
- script, event handler, `foreignObject`, external href, shell command, raw
  provider payload, prompt text, token, Authorization, or full local path.

## Required Pack Identities

The final V10.13 library must contain at least six distinct visible cat
identities:

| packId | Identity | Palette | Visual signal |
| --- | --- | --- | --- |
| `work-cat-v2-orange` | focused orange work cat | warm orange / cream | friendly default |
| `work-cat-v2-black` | calm black work cat | black / charcoal / gold eyes | high contrast silhouette |
| `work-cat-v2-white` | clean white work cat | white / pale gray / blue accents | bright and soft |
| `work-cat-v2-calico` | energetic calico work cat | orange / black / white | patch pattern |
| `work-cat-v2-gray` | quiet gray work cat | gray / slate / green eyes | calm concentration |
| `work-cat-v2-tuxedo` | formal tuxedo work cat | black / white / red accent | crisp formal look |

Implementation may add more packs, but must not ship fewer than six accepted
packs.

## Canvas And Frame Rules

| Field | Requirement |
| --- | --- |
| canvas | 256 x 256 logical pixels |
| visible bounds | cat body remains within 12 px margin |
| transparent background | required |
| base orientation | 3/4 front view unless action requires profile |
| line style | clean rounded outline, no noisy sketch lines |
| shading | simple two-tone or soft cell shading |
| frame naming | `<packId>/<actionId>/<actionId>_<frameIndex>.svg` or `.png` |
| frame index | zero-padded two digits |
| loop fps | 8-12 fps |
| transient duration | 450-1200 ms |

## Core Action Storyboard

| actionId | Type | Minimum frames | Required motion / pose |
| --- | --- | --- | --- |
| `idle` | loop | 8 | breathing, blink, subtle tail sway |
| `thinking` | loop | 8 | head tilt, small ear/tail movement, focus mark or paw-to-chin pose |
| `running` | loop | 8 | readable run cycle or fast typing/working motion |
| `success` | transient | 4 | happy bounce or paw raise, returns to idle |
| `warning` | loop | 4 | alert ears, caution expression, visible accent |
| `error` | loop | 4 | slumped or startled pose, clear red/error expression |
| `need_input` | loop | 4 | raised paw / looking at user / prompt-like gesture |
| `sleeping` | loop | 8 | curled/resting pose, breathing or Z motion |

## Quality Thresholds

Each pack must pass:

- every action has required frame count.
- every action has at least 3 unique visual poses for loop actions.
- every action has at least 2 unique visual poses for transient actions.
- nonblank pixel or SVG geometry check passes for every frame.
- frame-difference check passes for every animated action.
- action-distinctness check passes against `idle`.
- 1x and 0.75x screenshots are readable.
- no frame is blank, fully transparent, or off canvas.
- visual identity remains consistent across all actions.

## License And Attribution

Each bundled pack must include safe metadata:

- `license: "project-authored"` or a compatible local license string.
- `attribution: "Agent Desktop Pet bundled premium work-cat asset"`.
- no third-party asset claim unless license evidence is separately committed.

## Evidence Requirements

Required evidence for V10.13:

- one combined library contact sheet.
- one runtime playback capture per pack or a combined capture showing all packs.
- visual QA report listing every pack/action.
- operator pass/fail rubric.
- security scan and claim scan.

