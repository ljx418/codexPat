# V8.9 Animated Sprite Assembler Implementation Design

status: planned
date: 2026-06-03

## UI Entry

Desktop Manager adds a local animated sprite assembler panel under the existing
personalized asset import section.

Inputs:

- source folder path.
- display name.
- fps, default `12`.
- optional target PetInstance ID.

The UI must show only sanitized frame counts and reason codes. It must not echo
the full source folder path after submission.

## Frame Scan Contract

Accepted files:

```text
<action>-NNN.png
```

Where:

- `action` is one of `idle`, `thinking`, `running`, `success`, `warning`,
  `error`, `need_input`, `sleeping`.
- `NNN` is a zero-padded integer.
- files are sorted by numeric index.
- each action must have 2-48 frames.
- duplicate indexes fail.
- index gaps fail.
- non-PNG, path traversal, remote URL, script-like names, and symlinks fail.

## Manifest Generation

Generated manifest:

- `schemaVersion: "5.8"`.
- `rendererKind: "sprite"`.
- `packId`: generated from display name plus a stable safe suffix.
- `license.type`: `user-generated`.
- `license.attribution`: `User assembled local animated sprite asset`.
- `assets[action].fileName`: first frame file.
- `assets[action].frameFiles`: sorted safe frame file names.
- `assets[action].fps`: validated fps.
- `actions[action]`: standard loop / priority defaults.

## Import And Activation

Implementation uses app-managed staging:

1. copy accepted frames into a temporary app-managed staging directory.
2. write generated `manifest.json` into staging.
3. call the existing import validation path.
4. delete staging after success/failure where practical.
5. optionally activate imported pack to the selected PetInstance.

Invalid assembly/import must preserve the previous active pack.

## Result Shape

Safe result fields:

- `packId`
- `displayName`
- `rendererKind`
- `actionFrameCounts`
- `fps`
- `manifestGenerated`
- `imported`
- `activatedInstanceId`
- `reasonCode`

Forbidden result fields:

- source folder path.
- full local path.
- raw manifest path.
- prompt text.
- provider payload.
- raw photo.
- token.
- Authorization.
- workspace path.
- config path.
- api-token.json.

## Smoke Output

`scripts/v8_9_animated_sprite_assembler_smoke.mjs` records only:

- scenario name.
- pass/fail.
- reasonCode.
- safe pack ID.
- renderer kind.
- action frame counts.
- fps.
- imported/activated booleans.
- forbidden-content scan result.
