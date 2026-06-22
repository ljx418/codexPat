# V30.2 Semantic Candidate Generation Evidence - 2026-06-17

status: passed

## Real Asset Inputs

- weak baseline pack: v16-host-image-tool-orange-tabby
- semantic candidate pack: flagship-work-cat-v2
- V5 manifest path retained: yes
- renderer kind: sprite

## Weak Baseline Frame Coverage

| Action | Frame count |
| --- | --- |
| idle | 6 |
| thinking | 6 |
| running | 6 |
| success | 6 |
| warning | 6 |
| error | 6 |
| need_input | 6 |
| sleeping | 6 |

## Semantic Candidate Frame Coverage

| Action | Frame count |
| --- | --- |
| idle | 11 |
| thinking | 10 |
| running | 33 |
| success | 18 |
| warning | 12 |
| error | 10 |
| need_input | 10 |
| sleeping | 10 |

## Candidate Boundary

The weak baseline is included only as a negative comparison target. It must not be used as V30 pass evidence because it is mostly whole-image transform motion.

The semantic candidate is local controlled SVG sprite output from the bundled work-cat renderer. It does not use provider payloads, raw photo bytes, remote URLs, shell commands, token, Authorization, full local paths, or workspace/config paths.
