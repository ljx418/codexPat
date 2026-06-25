# V31.2 Flagship 2D Asset Route Spec

文档状态：planned execution spec；V31.2 entry document。
当前日期：2026-06-24。

## Purpose

V31.2 defines the fastest route to a real target user experience: one
high-quality flagship 8-action 2D cat asset pack. The preferred route is a
human/professional-tool sprite sheet or frame pack, because V31 needs a visual
quality baseline before automating arbitrary cats.

## In Scope

- One named flagship cat asset pack.
- Eight core actions: `idle`, `thinking`, `running`, `success`, `warning`,
  `error`, `need_input`, `sleeping`.
- Safe import, normalization, metadata, QA, preview, approved-only apply, and
  rollback requirements.
- License and attribution recording.

## Out of Scope

- Petdex asset reuse without explicit license evidence.
- Claiming arbitrary-cat automatic generation ready.
- Provider output as trusted final result without local QA.
- 3D, production release, Windows, or cross-platform readiness.

## Asset Pack Contract

Future implementation must accept a normalized pack with:

```text
pack/
  manifest.json
  frames/
    idle/frame-001.png
    thinking/frame-001.png
    running/frame-001.png
    success/frame-001.png
    warning/frame-001.png
    error/frame-001.png
    need_input/frame-001.png
    sleeping/frame-001.png
```

`manifest.json` must include safe fields only:

- `packId`
- `displayName`
- `sourceRoute`
- `licenseSummary`
- `actions[]`
- `frameCount`
- `canvas`
- `transparentBackground`
- `qaVersion`
- `claimBoundary`

It must not include private local paths, raw prompts, provider payloads, EXIF,
GPS, tokens, or copied third-party asset contents without license evidence.

## Development Tasks

1. Select or create a real high-quality flagship asset source.
2. Normalize the asset into the existing preview/QA/apply pipeline.
3. Preserve V30 semantic QA and add V31 visual quality QA.
4. Generate contact sheets and playback evidence.
5. Verify failed placeholder/simple transform packs cannot apply.
6. Verify approved flagship pack applies only to the target pet and rollback
   restores the previous visible pack.

## Output Evidence

Create:

```text
docs/V31.x/evidence/v31_2-flagship-asset-route-YYYY-MM-DD.md
```

Required sections:

- PRD/spec review.
- Asset source and license summary.
- Normalized pack inventory.
- QA results with reasonCodes.
- Preview evidence links or embedded images.
- Apply/rollback result.
- Claim scan.
- Security scan.

## Pass / Block / Fail

- Pass: one named 8-action flagship pack is decision-complete for import,
  visual QA, preview, apply, rollback, and evidence.
- Blocked: no legal/high-quality asset source is available.
- Failed: the chosen asset is placeholder-like, incomplete, unsafe to license,
  or bypasses QA/apply controls.
