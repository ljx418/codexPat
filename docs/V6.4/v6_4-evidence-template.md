# V6.4 Evidence Template

status: template

date: 2026-05-30

## Runtime Evidence

- date:
- commit:
- desktop app status:
- imported sprite pack:
- imported GLTF pack:
- target PetInstance:
- default/unrelated PetInstance:

## Functional Result

- pack list status:
- preview non-activation:
- sprite preview:
- GLTF preview:
- activation:
- rollback:
- rename:
- delete unused:
- delete active with fallback:
- unrelated pets unchanged:

## Regression

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
node scripts/v5_12_runtime_imported_pack_smoke.mjs
```

## Security Scan

Confirm evidence and UI output do not contain:

```text
token
Authorization
raw payload
raw manifest path
raw provider payload
prompt text
photo metadata
workspace path
config path
full local path
api-token.json
```

## Claim Scan

Allowed claim:

```text
V6.4 asset manager product UX passed for tested local import and preview scenarios.
```

Forbidden claims:

```text
photo customization ready
automatic photo-to-3D ready
provider integration verified
remote generation ready
asset marketplace ready
3D ready
production signed release ready
```
