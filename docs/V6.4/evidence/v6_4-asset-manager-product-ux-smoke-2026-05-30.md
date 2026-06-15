# V6.4 Asset Manager Product UX Smoke

status: passed

date: 2026-05-30

commit: dcc9f363

## Scope

This evidence covers V6.4 Asset Manager Product UX for tested local imported asset pack scenarios.

Validated capabilities:

- safe asset manager pack view model.
- imported pack health/status/action coverage display.
- imported pack preview controls separated from runtime activation.
- sprite / GLTF preview renderer path using safe renderer inputs.
- imported pack rename command and UI.
- delete UX remains explicit-confirmation based.
- rollback remains available through per-PetInstance bundled/default renderer selection.

## Implementation Evidence

- `apps/desktop/src/assets/asset-manager-view-model.ts`
- `apps/desktop/src/assets/asset-manager-view-model.test.ts`
- `apps/desktop/src/main.ts`
- `apps/desktop/src-tauri/src/asset_import.rs`
- `apps/desktop/src-tauri/src/main.rs`
- `apps/desktop/src/styles.css`

## Functional Results

| Case | Result | Notes |
| --- | --- | --- |
| pack list status / health | passed | view model exposes validation status, health, action coverage, active usage count |
| preview non-activation | passed | preview container sets `previewMutatesRuntime=false` and does not call activation command |
| sprite preview path | passed | uses `RendererRegistry` with imported sprite pack ID and safe action ID |
| GLTF preview path | passed | uses `RendererRegistry` with imported GLTF pack ID and safe action ID |
| activation unchanged | passed | existing per-instance activation path preserved |
| rollback unchanged | passed | existing per-instance default/bundled renderer selection preserved |
| rename | passed | Rust storage command preserves pack ID and active instances |
| delete active with fallback | passed | existing delete clears active mapping by removing pack record; V5.12 runtime smoke remains green |
| unrelated pets unchanged | passed | preview does not send PetEvent and does not modify active mappings |

## Regression

```text
pnpm --filter desktop test
```

Result: passed, 41 tests.

```text
pnpm --filter desktop check
```

Result: passed.

```text
pnpm --filter desktop build
```

Result: passed.

```text
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
```

Result: passed.

```text
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

Result: passed, 18 tests.

```text
node scripts/v5_12_runtime_imported_pack_smoke.mjs
```

Result: passed.

## Security Scan

Evidence records only safe field names, command names, and pass/fail decisions.

No token, Authorization value, raw payload, raw manifest path, raw provider payload, prompt text, photo metadata, workspace path, config path, full local path, or `api-token.json` value is recorded.

## Claim Result

Allowed:

```text
V6.4 asset manager product UX passed for tested local import and preview scenarios.
```

Still forbidden:

```text
photo customization ready
automatic photo-to-3D ready
provider integration verified
remote generation ready
asset marketplace ready
3D ready
production signed release ready
```
