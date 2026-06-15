# V6.1 Release / Distribution Foundation Acceptance Plan

status: planning-ready

date: 2026-05-30

## Acceptance Gates

| Gate | Required Result |
| --- | --- |
| Packaging smoke | Local macOS packaging command completes or produces an auditable blocker with no false-green. |
| Artifact metadata | Evidence records safe artifact metadata only: app name, version, build flavor, artifact type. |
| First-run guide review | Guide explains local API, token boundary, Codex work-cat path, hooks trust, already-open limitation, asset import safety, diagnostics. |
| Permission text review | Text explains Accessibility / Automation only where needed and safe degradation if denied. |
| Diagnostics export boundary | Export content is previewable and sanitized. |
| Redaction scan | Evidence/export contains no forbidden sensitive fields. |
| Signing/notarization/update boundary | Remains checklist/plan unless separately implemented and accepted. |
| Claim scan | Forbidden release claims appear only in forbidden/not-ready contexts. |

## Required Redaction Scan

V6.1 evidence and diagnostics export must not contain:

```text
token
Authorization
raw payload
raw hook payload
raw JSONL payload
prompt text
tool command text
terminal text
shell history
screen contents
clipboard contents
transcript_path
full /Users path
workspace path
config path
api-token.json
provider credential
raw provider response
```

## Required Checks

Minimum checks for V6.1 acceptance:

```bash
pnpm --filter desktop check
pnpm --filter desktop build
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
git diff --check --
git status --short
```

If packaging smoke uses Tauri bundling, it must record whether the result is development/local unsigned/signed/notarized. A local unsigned artifact is acceptable for V6.1; it is not a production release.

## Pass / Block / Fail Rules

- `passed`: packaging smoke and documentation/redaction/claim scans pass.
- `blocked`: local packaging cannot run due missing environment, but blocker evidence is exact and no ready claim is made.
- `failed`: packaging or diagnostics evidence leaks sensitive fields, or release claims overstate readiness.

## Allowed Claim

```text
V6.1 release and distribution foundation passed for tested local macOS packaging scenarios.
```

