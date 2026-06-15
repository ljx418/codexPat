# V6.1 Evidence Template

status: template

date: 2026-05-30

## Evidence File

Expected final evidence:

```text
docs/V6.1/evidence/v6_1-release-distribution-foundation-smoke-YYYY-MM-DD.md
docs/V6.1/v6_1-final-acceptance-report.md
```

## Required Sections

- status: passed / blocked / failed.
- date.
- commit.
- scope.
- packaging smoke result.
- app artifact metadata:
  - app name.
  - version.
  - build flavor.
  - artifact type.
- first-run guide review.
- permission text review.
- diagnostics export boundary result.
- redaction scan result.
- signing / notarization / auto-update checklist status.
- regression result.
- claim scan result.
- allowed claim.
- forbidden claims.
- final decision.

## Forbidden Evidence Content

```text
token
Authorization
raw payload
full /Users path
workspace path
config path
api-token.json
prompt text
tool command text
provider credential
raw provider response
```

