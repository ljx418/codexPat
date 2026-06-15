# V8.x Remote Milestones

status: planned
date: 2026-06-01

V8 depends on external/provider conditions. These milestones define when remote
or provider-dependent work is allowed to move forward.

## R1 Provider Capability Confirmation

Goal:

- identify a named 3D-capable provider or toolchain.
- confirm output format, API/CLI availability, cost, privacy, retention,
  license, and attribution terms.

Exit:

- provider can produce GLB/GLTF or a documented convertible 3D format.
- terms do not block local app import/testing.
- credentials can be supplied through redacted local config.

No-Go:

- provider only generates images/video.
- provider terms prohibit local use or evidence capture.
- credential handling cannot be redacted.

## R2 Real 3D Output Acquisition

Goal:

- run an explicit-consent job with a real or approved test cat photo.
- obtain real provider-produced 3D output.

Exit:

- output stored in quarantined local staging.
- provider job ID/status recorded with safe fields only.
- raw response, credentials, raw photo, and full paths are absent from evidence.

No-Go:

- output missing.
- output is not 3D.
- provider returns remote-only asset URL that cannot be imported locally without
  violating the remote loading boundary.

## R3 License / Retention / Attribution Review

Goal:

- verify generated asset can be used in local runtime testing and future package
  scenarios.

Exit:

- license/attribution note recorded.
- retention/deletion limitations visible to user.
- distribution limitations are explicit.

No-Go:

- provider terms are ambiguous or prohibit intended use.

## R4 Remote Beta Evidence Package

Goal:

- package a redacted evidence bundle for external review.

Exit:

- screenshots/recordings.
- GLTF scan report.
- action coverage table.
- claim scan.
- redaction scan.

No-Go:

- evidence includes raw photo, prompt, credential, Authorization, full local
  path, raw response, or unapproved provider data.

## R5 Productization Candidate Review

Goal:

- decide whether V8 can proceed to a user-facing beta or must remain a
  provider-specific prototype.

Exit:

- V8.7 final report selects narrowest claim.
- all High risks are closed or explicitly block the gate.

No-Go:

- any claim depends on fixture GLB, image-only provider output, or non-repeatable
  manual evidence.
