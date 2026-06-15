# V10.6 Animation Format Rebaseline Smoke

Date: 2026-06-04

Status: passed

Scope: validates V10.6 local animation pack adapter for safe local `pet.json + spritesheet` and `pet.json + png frame sequence` formats. This does not claim product-grade V10, 3D readiness, provider integration, or Petdex parity.

## Summary

| Check | Result | Details |
| --- | --- | --- |
| accepted spritesheet case | passed | 8 core actions mapped to safe sprite manifest |
| accepted frame-sequence case | passed | 8 core actions mapped to safe sprite manifest |
| rejected fixture count | passed | 12/12 |
| active pack preserved after invalid activation | passed | previous active pack preserved |
| safe output field list | passed | packId, rendererKind, actions.actionId, actions.assetId, actions.frameCount, actions.fps, actions.loop, actions.transient, actions.durationMs, actions.fallbackActionId |
| V5 manifest regression result | passed | CSS default and sprite-v3 manifests still validate |
| security scan | passed | unsafe fixtures rejected; safe output does not expose unsafe fields |
| claim scan | passed | V10.6 claims format rebaseline only; no product-grade, 3D, provider, or release claim |

## Rejected Fixture Table

| Fixture | Result | Adapter reasonCode |
| --- | --- | --- |
| remote_url | passed | forbidden_content |
| absolute_path | passed | forbidden_content |
| path_traversal | passed | forbidden_content |
| script_field | passed | forbidden_content |
| event_handler | passed | forbidden_content |
| external_href | passed | forbidden_content |
| shell_command | passed | forbidden_content |
| raw_provider_payload | passed | forbidden_content |
| prompt_text | passed | forbidden_content |
| token | passed | forbidden_content |
| authorization | passed | forbidden_content |
| raw_local_path | passed | forbidden_content |

## Safe Runtime Adapter Output Fields

- `packId`
- `rendererKind`
- `actions.actionId`
- `actions.assetId`
- `actions.frameCount`
- `actions.fps`
- `actions.loop`
- `actions.transient`
- `actions.durationMs`
- `actions.fallbackActionId`

## V5 Manifest Regression

CSS default and sprite-v3 manifests still validate.

## Security Scan

- Unsafe fixtures for remote URL, absolute path, path traversal, script field, event handler, external href, shell command, raw provider payload, prompt text, token, Authorization, and raw local path are rejected.
- Evidence records reason codes and safe field names only.
- Runtime adapter output contains only safe pack/action/frame metadata.

## Claim Scan

Allowed claim:

```text
V10.6 animation format rebaseline passed for tested local pet.json spritesheet and frame-sequence scenarios.
```

Forbidden claims remain not made:

```text
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
animated GLTF playback passed without real accepted clip evidence
Rive ready
Live2D ready
marketplace ready
production signed release ready
cross-platform ready
Windows ready
```
