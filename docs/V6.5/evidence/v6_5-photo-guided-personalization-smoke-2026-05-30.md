# V6.5 Photo-Guided Personalization Smoke

status: passed

date: 2026-05-30

commit: dcc9f363

## Scope

This evidence covers local guided prompt and import-instruction generation with optional photo reference acknowledgement.

No provider upload, provider API call, local photo-to-3D generation, raw photo persistence, EXIF/GPS extraction, or remote asset loading is included.

## Functional Results

| Case | Result | Notes |
| --- | --- | --- |
| cat name input | passed | sanitized before prompt generation |
| visual notes input | passed | rejects/redacts unsafe path/URL/token-like input |
| optional photo reference | passed | records `local_reference_only` or `not_provided`; does not store raw photo |
| sprite target | passed | generates 8 core action prompts and manifest template |
| GLTF target | passed | generates local GLB/GLTF-oriented prompts and manifest template |
| import checklist | passed | requires local manifest import validation before runtime use |
| provider upload | not run | intentionally out of scope |

## Automatic Checks

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

## Privacy / Security Scan

Evidence records only safe field names and decisions.

No raw photo bytes, EXIF/GPS, local full path, token, Authorization value, raw payload, provider credential, raw provider response, workspace path, config path, or `api-token.json` value is recorded.

## Claim Result

Allowed:

```text
V6.5 photo-guided personalized asset workflow passed for local prompt and import-instruction generation.
```

Still forbidden:

```text
photo customization ready
automatic photo-to-3D ready
provider integration verified
remote generation ready
asset marketplace ready
production signed release ready
3D ready
```
