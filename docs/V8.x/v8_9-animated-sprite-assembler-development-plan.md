# V8.9 Animated Sprite Assembler Development Plan

status: planned
date: 2026-06-03

## Objective

Build a local animated 2D sprite pack assembler that turns user-provided PNG
frame sequences into a validated Agent Desktop Pet sprite pack. V8.9 is local
assembly only. It does not generate images, call providers, or claim AI asset
generation readiness.

## Baseline

- `sprite` runtime supports static PNG assets and the new `frameFiles` + `fps`
  manifest fields.
- import validation already rejects unsafe names, path traversal, remote URLs,
  scripts, and oversized packs.
- Desktop Manager already supports local asset import, activation, deactivation,
  rename, and delete flows.

## Development Scope

Implement a Desktop Manager guided assembly path:

1. User selects a local folder of PNG frames.
2. App scans for the eight core action groups:
   - `idle`
   - `thinking`
   - `running`
   - `success`
   - `warning`
   - `error`
   - `need_input`
   - `sleeping`
3. App accepts files named `<action>-NNN.png`, where `NNN` is a zero-padded
   numeric frame index.
4. App lets the user enter a safe pack display name and fps.
5. App generates a safe `schemaVersion: "5.8"` sprite manifest using
   `frameFiles` and `fps`.
6. App imports the generated pack through the existing local import validation.
7. App optionally activates the imported pack to one selected PetInstance.

## Stable Reason Codes

- `animated_sprite_source_missing`
- `animated_sprite_core_action_missing`
- `animated_sprite_frame_count_invalid`
- `animated_sprite_frame_name_invalid`
- `animated_sprite_fps_invalid`
- `animated_sprite_manifest_generated`
- `animated_sprite_import_failed`
- `animated_sprite_activation_failed`
- `previous_pack_preserved`

## Security Boundary

V8.9 must not persist or expose:

- source folder path.
- full local path.
- token.
- Authorization.
- raw payload.
- prompt text.
- provider payload.
- raw photo.
- workspace path.
- config path.
- api-token.json.

The assembler output may include only safe file names, safe pack IDs, safe action
IDs, frame counts, fps, renderer kind, license attribution, and sanitized
diagnostics.

## Allowed Claim

```text
V8.9 local animated sprite pack assembler passed for tested local frame-sequence asset scenarios.
```

## Forbidden Claims

- AI asset generation ready.
- automatic photo-to-animation ready.
- provider integration verified.
- Live2D ready.
- Rive ready.
- 3D ready.
- production signed release ready.

## Go / No-Go

V8.9 is Go after this plan and the acceptance plan are reviewed with no
unresolved High risk. V8.10 and V8.11 remain No-Go until V8.9 has accepted or
explicitly excluded evidence.
