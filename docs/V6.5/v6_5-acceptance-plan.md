# V6.5 Acceptance Plan: Photo-Guided Personalization

status: planning-ready

date: 2026-05-30

## Entry Criteria

- V6.4 final acceptance passed.
- V6.5 plan audit has no unresolved Critical or High risk.

## Functional Acceptance

- user can enter cat name.
- user can enter user-approved visual description.
- user can choose sprite or GLTF target.
- user can optionally select a local photo reference without upload.
- output includes 8 core action prompts.
- output includes manifest template.
- output includes import checklist.
- output states generated assets must pass local import validation.
- output does not auto-import or auto-activate assets.

## Privacy Acceptance

- raw photo is not persisted by default.
- photo bytes are not logged in evidence.
- EXIF/GPS is not extracted or stored.
- full local photo path is not displayed or recorded.
- prompt text redacts token-like values, local paths, URLs, provider metadata, and Authorization text.
- no provider credential is accepted.

## Regression Acceptance

```bash
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
```

## Drift / False-Green Risk Gate

Stop before implementation or before V6.6 if any item is High:

- UI implies automatic photo-to-3D.
- UI uploads or stores raw photo.
- evidence includes photo content, local full path, EXIF/GPS, prompt secrets, token, or provider response.
- output implies provider generation is verified.
