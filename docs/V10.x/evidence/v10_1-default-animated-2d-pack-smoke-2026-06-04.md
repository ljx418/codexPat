# V10.1 Default Animated 2D Pack Smoke

Date: 2026-06-04

Status: passed

Scope: validates bundled `sprite-v3-animated` procedural SVG animation frames. This is 2D animation evidence only.

Artifacts:
- Contact sheet: `docs/V10.x/evidence/v10_1-default-animated-2d-contact-sheet-2026-06-04.html`
- Runtime playback capture: `docs/V10.x/evidence/v10_1-runtime-playback-capture-2026-06-04.html`

| Check | Result | Details |
| --- | --- | --- |
| idle frame count | passed | 6/6 |
| idle unique frames | passed | 6/3 |
| idle nonblank | passed | SVG includes visible primitives |
| idle frame-difference | passed | frame strings differ |
| idle safe SVG | passed | no script, foreignObject, href, event handler, or URL |
| thinking frame count | passed | 6/6 |
| thinking unique frames | passed | 6/3 |
| thinking nonblank | passed | SVG includes visible primitives |
| thinking frame-difference | passed | frame strings differ |
| thinking safe SVG | passed | no script, foreignObject, href, event handler, or URL |
| running frame count | passed | 6/6 |
| running unique frames | passed | 6/3 |
| running nonblank | passed | SVG includes visible primitives |
| running frame-difference | passed | frame strings differ |
| running safe SVG | passed | no script, foreignObject, href, event handler, or URL |
| success frame count | passed | 3/3 |
| success unique frames | passed | 3/2 |
| success nonblank | passed | SVG includes visible primitives |
| success frame-difference | passed | frame strings differ |
| success safe SVG | passed | no script, foreignObject, href, event handler, or URL |
| warning frame count | passed | 3/3 |
| warning unique frames | passed | 3/2 |
| warning nonblank | passed | SVG includes visible primitives |
| warning frame-difference | passed | frame strings differ |
| warning safe SVG | passed | no script, foreignObject, href, event handler, or URL |
| error frame count | passed | 3/3 |
| error unique frames | passed | 3/2 |
| error nonblank | passed | SVG includes visible primitives |
| error frame-difference | passed | frame strings differ |
| error safe SVG | passed | no script, foreignObject, href, event handler, or URL |
| need_input frame count | passed | 3/3 |
| need_input unique frames | passed | 3/2 |
| need_input nonblank | passed | SVG includes visible primitives |
| need_input frame-difference | passed | frame strings differ |
| need_input safe SVG | passed | no script, foreignObject, href, event handler, or URL |
| sleeping frame count | passed | 6/6 |
| sleeping unique frames | passed | 6/3 |
| sleeping nonblank | passed | SVG includes visible primitives |
| sleeping frame-difference | passed | frame strings differ |
| sleeping safe SVG | passed | no script, foreignObject, href, event handler, or URL |
| pack id | passed | sprite-v3-animated |
| renderer kind | passed | sprite |
| 1x and 0.75x visibility | passed | contact sheet includes 1x frames; playback capture uses scalable SVG viewport |
| CSS fallback visible | passed | unchanged CSS renderer remains registered as fallback |

Security boundary:
- SVG frames are generated from a controlled local template.
- No script, foreignObject, external href, remote URL, or event handler was accepted.
- Evidence records action IDs, counts, and safe artifact names only; it does not record full local paths or raw unsafe SVG payload.

Allowed claim:
V10.1 default high-quality animated 2D pack passed for tested bundled sprite-v3-animated scenarios.

Forbidden claims remain not made: Petdex parity achieved, 3D ready, automatic photo-to-3D ready, provider integration verified, Rive ready, Live2D ready, asset marketplace ready, remote asset loading ready, production signed release ready, cross-platform ready, Windows ready.
