# V10.13 Premium Built-in Animated Cat Library Acceptance Plan

status: planned
date: 2026-06-05

## Required Assets

At least 6 bundled local animated 2D cat packs:

| Pack Slot | Requirement |
| --- | --- |
| work-cat-v2-orange | high-quality orange work cat |
| work-cat-v2-black | high-quality black work cat |
| work-cat-v2-white | high-quality white work cat |
| work-cat-v2-calico | high-quality calico work cat |
| work-cat-v2-gray | high-quality gray work cat |
| work-cat-v2-tuxedo | high-quality tuxedo work cat |

Names may change during implementation, but the final library must contain at
least 6 distinct visible cat identities.

## Per-pack Acceptance

Each pack must pass:

- 8 core actions exist.
- loop actions have at least 8 frames.
- transient actions have at least 4 frames.
- all frames are nonblank.
- frame-difference check passes.
- action-distinctness check passes.
- 1x and 0.75x screenshots are visible.
- no blank, transparent, or off-canvas frame.
- license and attribution metadata exists.
- activation affects only the target PetInstance.
- fallback is visible after corrupt/missing asset simulation.

## Evidence

- contact sheet.
- runtime playback capture.
- visual QA smoke report.
- operator visual acceptance rubric.

