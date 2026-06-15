# V15.8 2D Animation Continuity Smoke Evidence

status: passed
date: 2026-06-10

## Scope

This evidence validates 2D multi-frame continuity for the current default
flagship cat and bundled 2D gallery packs. It does not claim Petdex parity, 3D
readiness, provider integration, marketplace readiness, production signed
release readiness, Windows readiness, or cross-platform readiness.

## Evidence Files

- contact sheet: `docs/V15.x/evidence/v15_8-2d-animation-continuity-contact-sheet-2026-06-10.html`
- runtime capture: `docs/V15.x/evidence/v15_8-2d-animation-continuity-runtime-capture-2026-06-10.html`

## Flagship Action Continuity

| action | frames | unique poses | max adjacent delta | first/final closed |
| --- | ---: | ---: | ---: | --- |
| idle | 11 | 10 | 12.36 | yes |
| thinking | 10 | 9 | 14.41 | yes |
| running | 33 | 32 | 15.37 | yes |
| success | 18 | 17 | 15.76 | yes |
| warning | 12 | 11 | 14.31 | yes |
| error | 10 | 9 | 13.95 | yes |
| need_input | 10 | 9 | 12.91 | yes |
| sleeping | 10 | 9 | 11.58 | yes |

## Premium Pack Summary

| packId | displayName | max adjacent delta | continuity |
| --- | --- | ---: | --- |
| premium-orange-tabby | 橘子工作猫 | 15.92 | passed |
| premium-tuxedo | 礼服工作猫 | 15.92 | passed |
| premium-silver | 银灰工作猫 | 15.92 | passed |
| premium-calico | 三花工作猫 | 15.92 | passed |
| premium-cream | 奶油工作猫 | 15.92 | passed |
| premium-blue | 蓝灰工作猫 | 15.92 | passed |
| premium-black | 黑曜工作猫 | 15.92 | passed |
| premium-white | 雪白工作猫 | 15.92 | passed |
| premium-ginger-white | 橘白工作猫 | 15.92 | passed |
| premium-brown-tabby | 狸花工作猫 | 15.92 | passed |
| premium-lilac | 丁香工作猫 | 15.92 | passed |
| premium-golden | 金渐层工作猫 | 15.92 | passed |

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| flagship core continuity | passed | flagship-work-cat-v2 maxAdjacentDelta=15.76 |
| premium gallery continuity | passed | 12 packs, maxAdjacentDelta=15.92 |
| first/final closure | passed | all scoped core actions render identical first and final frames |
| nonblank scan | passed | all scoped core frames contain visible SVG geometry |
| frame-difference scan | passed | all scoped actions retain required unique pose counts after interpolation |
| security scan | passed | controlled SVG frames contain no script, foreignObject, external href, URL, event handler, token, Authorization, or local path |
| renderer boundary | passed | runtime renderer remains scoped to safe action ID, renderer kind, safe pack ID, playback intent, scale, and visibility |
| claim scan | passed | V15.8 claims only 2D continuity for tested bundled default and gallery packs |

## Safe Renderer Boundary

Renderer input remains limited to safe action ID, renderer kind, safe pack ID,
playback intent, scale, and visibility. The scoped assets use controlled local
SVG frames only and do not introduce script execution, external hrefs, remote
URLs, provider payloads, prompt text, tokens, Authorization values, or local
absolute paths.

## Allowed Claim

```text
V15.8 bundled default and gallery 2D animation continuity passed for tested local sprite scenarios.
```

## Final Decision

V15.8 passed. Default flagship and bundled gallery 2D assets now have automated continuity gates.
