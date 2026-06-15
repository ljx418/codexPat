# V5.13 Photo-Guided Workflow Smoke Evidence

status: passed

date: 2026-05-30

## Scope

This evidence covers the V5.13 local guided asset prompt workflow.

It verifies local prompt/instruction generation only. It does not verify photo upload, provider generation, automatic photo-to-3D, remote asset loading, or production readiness.

## Real Data

The smoke used a local orange tabby description:

```text
orange tabby, amber eyes, white chest, curled tail, playful jumping and yarn-ball actions
```

The retained evidence records only this non-sensitive descriptive note, action coverage, renderer target, and pass/fail decisions.

## Commands

```bash
node scripts/v5_13_guided_workflow_smoke.mjs
pnpm --filter desktop build
node scripts/v5_12_runtime_imported_pack_smoke.mjs
```

## Result

```text
passed
```

Observed cases:

- desktop guided workflow tests passed.
- desktop typecheck passed.
- petctl real-data prompt pack baseline passed.
- desktop build passed.
- V5.12 runtime imported pack smoke regression passed.
- security redaction scan passed.

## UI Boundary

The Desktop Manager now includes a local guided asset section that generates:

- standardized core-action prompts.
- a manifest template.
- an import checklist.
- safety notes.

Generated content stays in the current UI session. The clear control removes the generated content from the UI.

## Security Notes

The V5.13 workflow does not upload photos by default, does not call a provider, and does not generate 3D locally.

No retained evidence contains token, Authorization header, raw photo bytes, EXIF/GPS, source file name, full local path, workspace path, config path, provider payload, or remote URL.

## Claim Boundary

Allowed:

```text
V5.13 photo-guided personalized asset workflow passed for local prompt and import-instruction generation.
```

Forbidden:

```text
photo customization ready
photo-to-3D ready
provider integration ready
provider integration verified
remote generation ready
```
