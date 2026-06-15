# V8.6 Operational Hardening Smoke Evidence

status: passed
date: 2026-06-02

## Evidence Summary

V8.6 operational hardening smoke passed on 2026-06-02. Diagnostics export,
deletion flow, license export, and security scan harness all verified.
13 tests passing. All regression tests passing.

## Test Results

### Type Check
```
pnpm --filter desktop check
# No errors
```

### Diagnostics Export Tests (13 tests, all passing)
```
node --test --import tsx src/assets/diagnostics-export.test.ts
ℹ tests 13
ℹ pass 13
ℹ fail 0
```

### V7 Regression Baseline (61 desktop + 58 petctl, all passing)
```
pnpm --filter desktop test
ℹ tests 61
ℹ pass 61
ℹ fail 0

pnpm --filter @agent-desktop-pet/petctl test
ℹ tests 58
ℹ pass 58
ℹ fail 0
```

## Diagnostics Export Verification

- Clean bundle: no forbidden patterns detected
- Path redaction: /Users/, /tmp/, /private/ → [REDACTED_*]
- Token redaction: sk-1234567890abcdef → sk-...xxxx
- errorMessage paths sanitized

## Deletion Event Verification

- Type: "pack_deleted"
- packId sanitized (invalid chars → underscores)
- No raw paths, no credentials
- appManagedStorage flag present

## Security Scan Harness Verification

Patterns detected correctly:
- sk-... API keys
- Bearer tokens
- /Users/ paths
- /private/ paths
- Token file references (api_token.json)

## Acceptance Criteria Status

| Criterion | Status |
|-----------|--------|
| A1: Diagnostics export has no forbidden content | PASS — 13 tests passing, no patterns found |
| A2: Deletion removes pack, records safe event | PASS — createDeletionEvent produces safe event |
| A3: Remote retention documented | PASS — consent disclosures include retention text |
| A4: License/attribution export sanitized | PASS — truncation + sanitization verified |
| A5: Security scan detects forbidden content | PASS — all planted patterns detected |

## V8.6 Claim Basis

V8.6 operational hardening passed for tested diagnostics export, deletion
flow, license export, and security scan scenarios. All evidence files
sanitized. No forbidden content in diagnostics bundle.