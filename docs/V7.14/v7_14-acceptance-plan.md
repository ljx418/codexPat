# V7.14 Acceptance Plan

status: accepted
date: 2026-06-01

## Required Checks

V7.14 must read V7.13 final accepted paths and perform visual QA only for the
paths that V7.13 passed and claimed. If V7.13 records
`real_provider_3d_branch_blocked`, V7.14 must not fabricate provider 3D visual QA.

- Generated 2D pack screenshots or recordings cover all core actions.
- Imported GLB/GLTF screenshots or recordings cover all supported core actions,
  or explicitly document safe fallback for unsupported actions.
- Nonblank and bounding-box checks pass for sprite and GLB/GLTF runtime views.
- Scale checks pass at 1x and 0.75x.
- CPU and memory baseline is recorded for idle and active animation.
- Cat does not become transparent after switching, deleting, failing import,
  activating a corrupt asset, or restoring default.
- Default and unrelated pets remain unchanged during target-pack QA.
- Manual user acceptance result is recorded.

## Path Dependency

| V7.13 Path Result | V7.14 Action |
| --- | --- |
| generated 2D path passed | run generated 2D visual QA for all core actions |
| external GLB import workflow passed | run imported GLB/GLTF nonblank, bounding-box, scale, and fallback QA |
| `real_provider_3d_branch_blocked` | do not run or claim provider 3D visual QA |
| path missing or failed | V7.14 is No-Go for that path |

## Renderer Payload Check

Evidence must include a sanitized renderer input snapshot proving runtime adapters
receive only:

- safe action ID.
- renderer kind.
- safe profile ID and pack ID.
- playback intent.
- scale.
- visibility.

Renderer payloads must not include raw manifest path, raw provider payload,
prompt text, photo metadata, token, Authorization, workspace path, config path,
full local path, or raw Agent/Codex/terminal/MCP/HTTP payload.

## Failure Rule

If the user cannot visibly distinguish the new cat or action changes, V7.14
cannot pass. If any visual path goes transparent instead of falling back to CSS,
V7.14 is failed until corrected and rerun.
