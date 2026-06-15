# V7.9 Acceptance Plan

status: planned
date: 2026-05-31

## Required Checks

- No credential path returns `provider_credential_missing` and does not create evidence marked passed.
- No consent path returns `upload_consent_required`.
- Real MiniMax smoke, when credentials and consent are supplied, produces at least one safe image output for a user-approved cat/action scenario.
- Provider output is staged and then passed into local validation; it is not directly activated in runtime.
- Evidence records only provider name, safe scenario label, action intent, safe output summary, validation decision, and redaction result.

## Security Scan

Evidence and logs must not include token, Authorization, raw prompt, raw provider request, raw provider response, original photo, EXIF/GPS, full local path, workspace path, config path, or `api-token.json`.

## Blocked Rules

If MiniMax credentials, network access, consent, or provider terms evidence are unavailable, V7.9 status is blocked. Do not substitute mocks for real provider smoke.
