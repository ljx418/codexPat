# V6.2 Evidence Template

status: template

date: 2026-05-30

## Evidence File

Expected final evidence:

```text
docs/V6.2/evidence/v6_2-codex-work-cat-onboarding-smoke-YYYY-MM-DD.md
docs/V6.2/v6_2-final-acceptance-report.md
```

## Required Sections

- status: passed / blocked / failed.
- date.
- commit.
- scope.
- Desktop Manager onboarding result.
- target PetInstance summary.
- JSONL wrapper command copy result, redacted.
- JSONL monitor state result.
- TUI hooks `/hooks` trust instruction result.
- already-open window unsupported statement result.
- diagnostics result.
- instance isolation result.
- redaction scan result.
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
raw JSONL payload
raw hook payload
prompt text
tool command text
terminal text
transcript_path
full /Users path
workspace path
config path
api-token.json
```

