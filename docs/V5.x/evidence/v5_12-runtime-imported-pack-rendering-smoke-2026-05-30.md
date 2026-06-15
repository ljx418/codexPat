# V5.12 Runtime Imported Pack Rendering Smoke Evidence

status: passed

date: 2026-05-30

## Scope

This evidence covers V5.12 automated and local runtime-state checks only.

It supports V5.12 final acceptance together with operator-confirmed clean manual visual evidence.

## Automated Checks

Command:

```bash
node scripts/v5_12_runtime_imported_pack_smoke.mjs
```

Result:

```text
passed
```

Observed cases:

- V5.12 sprite fixture exists.
- V5.12 GLTF fixture exists.
- Tauri asset import/runtime tests passed.
- Desktop unit tests passed.
- Desktop typecheck passed.
- Security redaction scan passed.

Additional regression checks:

```bash
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
node scripts/v5_8_personalized_asset_pipeline_smoke.mjs
node scripts/v4_4_managed_session_smoke.mjs
```

Result:

```text
passed
```

## Runtime State Route Observation

Desktop health endpoint returned ok.

The local orange tabby imported sprite pack was activated to the existing target Codex pet instance through `petctl asset activate`.

A scoped `petctl notify --instance ... --level running` event was accepted by the desktop bridge and the target instance state changed to `running`.

The default pet remained `idle`.

## Security Notes

Evidence records only safe result summaries, action/state names, renderer kind, and sanitized pack/instance identifiers.

No token, Authorization header, raw payload, prompt text, provider payload, raw GLTF JSON chunk, workspace path, config path, or full local path is retained in this evidence.

## Manual Visual Gate

Safe screenshot evidence was not retained because the active desktop contained unrelated sensitive application content. The operator later confirmed the clean manual visual scenario passed.

Required manual visual proof:

- imported sprite pack visibly renders on only the target pet.
- imported GLTF pack visibly renders on only the target pet.
- default and unrelated pets remain unchanged.
- app restart restores the target active imported pack mapping.
- invalid/corrupt/stale imported pack falls back to visible CSS, not transparency.
