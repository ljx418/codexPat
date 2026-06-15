# V10.7 work-cat-v1 Visual Smoke

Date: 2026-06-04

Status: passed

Scope: validates bundled `work-cat-v1` animated 2D sprite pack using project-authored controlled SVG frames. This does not claim V10 product-grade final acceptance, Petdex parity, 3D readiness, provider integration, or production release readiness.

## Evidence Files

- Contact sheet: `docs/V10.x/evidence/v10_7-work-cat-v1-contact-sheet-2026-06-04.html`
- Runtime playback capture: `docs/V10.x/evidence/v10_7-work-cat-v1-runtime-playback-2026-06-04.html`

## Summary

| Check | Result | Details |
| --- | --- | --- |
| pack identity | passed | work-cat-v1 bundled sprite manifest is default runtime sprite pack |
| frame count table | passed | idle:8/8, thinking:8/8, running:8/8, success:4/4, warning:4/4, error:4/4, need_input:4/4, sleeping:8/8 |
| unique pose count table | passed | idle:8/4, thinking:8/4, running:8/4, success:4/3, warning:4/3, error:4/3, need_input:4/3, sleeping:8/4 |
| nonblank scan | passed | all generated SVG frames include visible shape geometry |
| frame-difference check | passed | all actions meet unique pose thresholds |
| scale readability | passed | all frames generated at 256px source and are captured at 1x and 0.75x in runtime evidence |
| bounding box / off-canvas check | passed | all frames use fixed 256x256 viewBox and safe-area storyboard values |
| baseline comparison | passed | idle:tags 28.6 vs 16.5, thinking:tags 30.6 vs 18.5, running:tags 30.4 vs 18.0, success:tags 31.3 vs 18.0, warning:tags 32.3 vs 20.0, error:tags 28.0 vs 15.0, need_input:tags 31.0 vs 19.0, sleeping:tags 26.0 vs 14.0 |
| operator visual rubric | passed | automated rubric pass: identity, action readability, visible motion, no blank/off-canvas frames |
| security scan | passed | controlled SVG frames contain no script, foreignObject, event handler, external href, URL, data URI, text label, token, or local path |
| claim scan | passed | V10.7 claims work-cat-v1 visual smoke only; product-grade V10 remains pending V10.8-V10.10 |

## Frame And Quality Table

| Action | Frame Count | Unique Poses | FPS | Playback | Avg Geometry Tags | Baseline Avg Tags |
| --- | ---: | ---: | ---: | --- | ---: | ---: |
| idle | 8 | 8 | 9 | loop | 28.6 | 16.5 |
| thinking | 8 | 8 | 9 | loop | 30.6 | 18.5 |
| running | 8 | 8 | 12 | loop | 30.4 | 18.0 |
| success | 4 | 4 | 10 | transient | 31.3 | 18.0 |
| warning | 4 | 4 | 9 | transient | 32.3 | 20.0 |
| error | 4 | 4 | 8 | transient | 28.0 | 15.0 |
| need_input | 4 | 4 | 8 | transient | 31.0 | 19.0 |
| sleeping | 8 | 8 | 7 | loop | 26.0 | 14.0 |

## Operator Visual Acceptance

Automated operator rubric result: passed for all core actions based on identity consistency, visible action geometry, unique pose count, nonblank frames, 1x/0.75x capture generation, and side-by-side baseline comparison. Manual final product-grade acceptance remains V10.10.

## Security Scan

- Frames are generated from controlled local SVG templates.
- No script, foreignObject, event handler, external href, remote URL, data URI, text label, token, Authorization, provider payload, prompt text, or local path was accepted.
- Evidence records safe pack/action metrics and generated HTML evidence paths only.

## Claim Scan

Allowed scoped claim:

```text
V10.7 work-cat-v1 visual smoke passed for tested local bundled animated 2D sprite scenarios.
```

Forbidden claims remain not made:

```text
V10 product-grade animated 2D work-cat experience passed
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
Rive ready
Live2D ready
marketplace ready
production signed release ready
cross-platform ready
Windows ready
```
