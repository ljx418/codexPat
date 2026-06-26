# V38 Target Architecture

Date: 2026-06-26

## Architecture Chain

```text
Wikimedia public source manifest
  -> scripts/v38_1_public_source_intake_smoke.mjs
  -> /tmp/codexpat-v38-public-sources original downloads
  -> scripts/v38_2_pixel_sanitization_smoke.mjs
  -> docs/V38.x/evidence/assets/<sampleId>/sanitized.png
  -> apps/desktop/public/v38/<sampleId>/sanitized.png
  -> scripts/v38_3_renderable_action_pack_smoke.mjs
  -> apps/desktop/public/v38/<sampleId>/frames/*.png
  -> contact-sheet.png / animated-preview.gif
  -> apps/desktop/src/assets/v38-public-photo-action-pipeline.ts
  -> apps/desktop/src/main.ts V38 settings panel
  -> docs/V38.x/evidence/v38_6-public-photo-review-report-2026-06-26.html
  -> docs/V38.x/v38-final-public-photo-action-report.md
```

## Concrete Code Entities

- `apps/desktop/src/assets/v38-public-photo-action-pipeline.ts`: source manifest, sanitized asset contract, renderable pack contract, claim/security helpers.
- `apps/desktop/src/assets/v38-public-photo-action-pipeline.test.ts`: unit coverage for source manifest, blocked empty pipeline, and passing scoped pipeline.
- `apps/desktop/src/main.ts`: settings UI V38 panel and product anchors.
- `apps/desktop/src/styles.css`: V38 panel layout and responsive behavior.
- `scripts/v38_smoke_common.mjs`: shared download, metadata, sanitization, frame generation, report, screenshot, scan helpers.
- `scripts/v38_0` to `scripts/v38_7`: phase evidence and final gate.
- `docs/V38.x/evidence/assets/<sampleId>/`: sanitized images, hashes, frames, contact sheet, GIF.
- `apps/desktop/public/v38/<sampleId>/`: desktop-served derived assets.

## Current To Target Difference

- Current before V38: line-drawn/default or named deterministic assets can demonstrate control flow, but they do not show a real public photo flowing into action evidence.
- Target after V38: real public cat photos produce sanitized derived pixels and renderable action evidence for three tested samples.
- Remaining outside target: arbitrary photo generation, provider-backed art quality, production packaging, and platform readiness.

## Route Decision

V38 executes Route A2: local deterministic sample-bound generation with public photos. Route B remains recorded as a potential higher-quality route for later comparison because it may achieve better visual results if provider/model integration is approved and verified later.
