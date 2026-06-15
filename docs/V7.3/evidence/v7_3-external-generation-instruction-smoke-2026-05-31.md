# V7.3 External Generation Instruction Smoke Evidence

status: passed

date: 2026-05-31

commit: c07cdd0e

## Scope

Validated local instruction workflow for a user-guided external asset generation process.

This evidence proves instructions only. It does not prove provider integration, photo upload, generated asset quality, local import validation, runtime activation, or 3D readiness.

## Commands

- `pnpm --filter desktop test`
- `pnpm --filter desktop check`
- `pnpm --filter desktop build`
- `node scripts/v7_3_external_generation_instruction_smoke.mjs`

## Smoke Result

```text
status: passed
desktop V7.3 unit coverage: passed
desktop typecheck: passed
real guided external instruction workflow: passed
security redaction scan: passed
```

## Covered Instruction Areas

- all 8 core action file names.
- local manifest checklist.
- license and attribution checklist.
- local import validation requirement.
- GLTF/GLB deep scan reminder for GLTF target.
- no-upload / no-provider-call safety boundary.

## Rejected / Not Included

- raw photo bytes
- source filename
- full local path
- EXIF/GPS
- token
- Authorization
- raw payload
- provider payload
- credential value
- workspace path
- config path
- remote URL

## Decision

V7.3 external generation instruction workflow passed for tested local guided asset scenarios.
