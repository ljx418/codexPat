# V7.1 Development Plan: Photo Intake & Privacy Boundary

status: accepted

date: 2026-05-31

## Goal

Let a user choose a local cat photo or enter traits while preserving a no-upload, no-raw-photo-persistence default.

## Development Content

- add local photo selection UI in Desktop Manager.
- display privacy explanation before selection.
- extract or collect user-approved safe trait metadata.
- provide clear delete/cancel behavior.
- ensure logs/evidence do not contain full local paths or raw image data.

## Out of Scope

- upload to provider.
- local AI vision extraction unless separately planned.
- automatic 3D generation.

## Allowed Claim

```text
V7.1 local photo intake privacy boundary passed for tested local no-upload scenarios.
```
