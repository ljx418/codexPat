# V10.10 Product-grade Visual QA Matrix

status: accepted
date: 2026-06-04

## Goal

Define the final product-grade V10 QA gate. V10.10 has passed scoped with
`docs/V10.x/v10_x-product-grade-final-acceptance-report.md`.

## Visual QA Matrix

| Area | Required Evidence | Pass Rule |
| --- | --- | --- |
| all core actions | contact sheet and runtime playback capture | every action visible and readable |
| nonblank scan | automated frame scan | no blank or fully transparent frame |
| frame difference | automated unique pose scan | loop >= 4 unique poses; transient >= 3 unique poses |
| scale | 1x and 0.75x captures | cat remains readable |
| off-canvas | bbox scan | bbox stays inside canvas with margin |
| idle micro-action | 30-second capture | at least one idle micro-action visible |
| click feedback | interaction capture | clicked pet responds without state mutation |
| drag feedback | drag capture | drag pose visible and position persists |
| corrupt asset fallback | screenshot/capture | visible safe cat remains |
| missing asset fallback | screenshot/capture | visible safe cat remains |
| deleted asset fallback | screenshot/capture | visible safe cat remains |
| partial asset fallback | screenshot/capture | visible safe cat remains |
| target isolation | runtime check | target pet only changes |
| performance | baseline metrics | recorded and no obvious runaway animation loop |

## Required Core Actions

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

## Performance Baseline

Record:

- idle CPU / memory baseline.
- active animation CPU / memory baseline.
- Manager preview CPU / memory baseline.
- number of active pets during test.

V10.10 does not require production performance certification, but it must
record enough data to detect obvious regressions.

## Security Scan

Scan evidence, logs, and UI diagnostics for:

- token.
- Authorization.
- raw payload.
- raw image payload.
- raw GLTF JSON chunk.
- raw local path.
- full local path.
- workspace path.
- config path.
- provider payload.
- prompt text.
- shell command.
- script source.

## Claim Scan

Allowed final claim only if all V10.6-V10.10 gates pass:

```text
V10 product-grade animated 2D work-cat experience passed for tested local bundled work-cat-v1 scenarios.
```

Forbidden claims:

```text
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
Rive ready
Live2D ready
asset marketplace ready
remote asset loading ready
production signed release ready
cross-platform ready
Windows ready
```

## PRD / Spec Review

Review must confirm:

- V10 goal is limited to product-grade local bundled animated 2D work cat.
- V10 does not include ecosystem, marketplace, provider, broad 3D, or release
  readiness.
- V10.1-V10.5 remain baseline evidence only.
- V10.6-V10.10 evidence supports the final claim.

## Drawio Sync

Before final acceptance:

- `docs/active/current-vs-target-gap.drawio` must show final V10 status.
- drawio must include target architecture vs current architecture.
- drawio must include development and acceptance plan.
- drawio must include milestones.
- drawio must include exit conditions.

## Final Evidence

Final report:

```text
docs/V10.x/v10_x-product-grade-final-acceptance-report.md
```

It must include:

- status: passed / blocked / failed.
- V10.6 result.
- V10.7 result.
- V10.8 result.
- V10.9 result.
- visual QA result.
- regression result.
- security scan result.
- claim scan result.
- PRD/spec review.
- allowed claim.
- forbidden claims.
- final decision.
