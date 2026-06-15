# V6.5 Development Plan: Photo-Guided Personalization

status: planning-ready

date: 2026-05-30

## Scope

V6.5 productizes the local guided personalization workflow. It helps a user turn a cat description and optional photo reference into a standardized prompt pack, manifest template, and import checklist.

This phase may implement:

- user-facing description capture.
- optional local photo reference acknowledgement.
- explicit no-upload / no-raw-photo-persistence copy.
- standardized prompt pack generation for sprite and GLTF targets.
- manifest template generation.
- import checklist generation.
- privacy and redaction evidence.

This phase must not implement:

- provider upload.
- provider API call.
- local photo-to-3D generation.
- raw photo storage.
- EXIF/GPS extraction or storage.
- remote asset loading.
- direct renderer activation that skips import validation.

## Product Requirements

V6.5 maps to PRD Track D:

- V6-D1: local description capture.
- V6-D2: photo reference flow with no default upload and no raw photo persistence.
- V6-D3: prompt pack generation.
- V6-D4: generated assets still go through local import validation.

## User Flow

1. User opens Desktop Manager.
2. User enters cat name and user-approved visual notes.
3. User optionally selects a local photo reference for manual comparison.
4. App states that the selected photo is not uploaded, not read into evidence, and not persisted by default.
5. User generates prompt pack, manifest template, and import checklist.
6. User uses an external tool manually and imports generated assets through Desktop Manager.

## Required Checks

```bash
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
```

## Allowed Claim

```text
V6.5 photo-guided personalized asset workflow passed for local prompt and import-instruction generation.
```

## Forbidden Claims

```text
photo customization ready
automatic photo-to-3D ready
provider integration verified
remote generation ready
asset marketplace ready
production signed release ready
```
