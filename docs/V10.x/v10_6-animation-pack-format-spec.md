# V10.6 Animation Pack Format Spec

status: accepted-spec-v10.6-passed
date: 2026-06-04

## Goal

Define the local animation pack format accepted by V10.6 implementation. This
spec adds a product-oriented local pack shape while preserving the existing V5
manifest pipeline.

Allowed baseline claim:

```text
V10.1-V10.5 baseline accepted scoped.
```

This spec does not claim product-grade V10 acceptance.

## Supported Formats

V10.6 supports two local app-managed formats:

```text
pet.json + spritesheet.png|webp
pet.json + png frame sequence
```

Both formats are imported into app-managed storage before runtime use. Runtime
renderers must never receive raw source paths.

## pet.json Schema

```ts
type V10PetJson = {
  schemaVersion: "10.6";
  packId: string;
  displayName: string;
  rendererKind: "sprite";
  format: "spritesheet" | "frameSequence";
  canvas: {
    width: number;
    height: number;
  };
  spritesheet?: {
    fileName: string;
    columns: number;
    rows: number;
    frameWidth: number;
    frameHeight: number;
  };
  actions: Record<CoreActionId, V10ActionSpec>;
  license?: {
    attribution: string;
    source: "project-authored" | "user-provided" | "generated-local" | "generated-provider";
  };
};

type V10ActionSpec = {
  frames: Array<string | V10FrameRect>;
  fps: number;
  loop: boolean;
  transient: boolean;
  durationMs?: number;
  fallbackActionId?: CoreActionId;
};

type V10FrameRect = {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
};
```

Accepted `CoreActionId` values:

```text
idle
thinking
running
success
warning
error
need_input
sleeping
```

## Spritesheet Format

Rules:

- `spritesheet.fileName` must match the safe filename pattern.
- `columns` and `rows` must be positive integers.
- `frameWidth` and `frameHeight` must equal `canvas.width` and
  `canvas.height`.
- `frames` may use `V10FrameRect` references.
- frame rects must stay within the spritesheet bounds.
- external image references are not allowed.

## PNG Frame Sequence Format

Rules:

- each frame entry must be a safe relative file name.
- all frames must be stored under the app-managed imported pack directory.
- frames must have the same dimensions as `canvas`.
- missing frame files reject the pack.
- mixed absolute and relative paths are rejected.

## Limits

| Field | Limit |
| --- | --- |
| rendererKind | `sprite` only |
| fps | integer 1-24 |
| action frame count | 1-48 |
| V10.7 loop action minimum | 8 frames |
| V10.7 transient action minimum | 4 frames |
| canvas width / height | 64-512 px |
| individual image size | <= 2 MB |
| spritesheet size | <= 16 MB |
| spritesheet pixels | <= 4096 x 4096 |
| durationMs | 250-10000 ms when present |

## Safe Filename Pattern

Accepted filenames:

```text
^[a-z0-9][a-z0-9._-]{0,95}\.(png|webp)$
```

Rejected:

- leading dot.
- slash or backslash.
- colon.
- path traversal.
- whitespace-only names.
- query string.
- fragment.
- shell metacharacters.

## Metadata Rules

- `loop=true` means action can continue until the state changes.
- `transient=true` means action returns to the current base state after
  `durationMs` or after one playback cycle.
- `fallbackActionId` must be one of the accepted core actions.
- missing optional metadata uses safe defaults only after validation.
- `rendererKind` must be `sprite`.

## App-managed Local Asset Boundary

- source files are copied into app-managed storage after validation.
- runtime uses only app-managed pack IDs and safe frame IDs.
- runtime and evidence must not expose source folder, original filename path,
  workspace path, config path, or full local path.

## V5 Manifest Compatibility

V10.6 must not remove or break the V5 manifest import path. The
`AnimationPackAdapter` accepts:

- existing validated V5 manifest packs.
- new validated V10 `pet.json` packs.

Both become the same internal safe action coverage model.

## Rejected Fixtures

V10.6 implementation must include rejected fixtures for:

- remote URL: `https://example.test/cat.png`.
- absolute path: `<absolute-local-path>/cat.png`.
- path traversal: `../cat.png`.
- script field: `"script": "alert(1)"`.
- event handler: `"onload": "..."`.
- external href: `"href": "https://example.test/x"`.
- shell command: `"command": "rm -rf /"`.
- raw provider payload field.
- prompt text field.
- token field.
- Authorization field.
- raw local path field.

Invalid fixtures must fail without changing the active pack.

## Evidence Requirements

Evidence file:

```text
docs/V10.x/evidence/v10_6-animation-format-rebaseline-smoke-2026-06-04.md
```

Evidence must record:

- accepted format cases.
- rejected fixture cases.
- active pack preserved after invalid input.
- safe output field list.
- security scan result.
- claim scan result.

Evidence must not record raw local paths, raw image payloads, token,
Authorization, provider payload, prompt text, shell command, or raw unsafe
fixture payloads.
