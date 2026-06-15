# V6.0 Acceptance Plan

status: ready

date: 2026-05-30

## Acceptance Gates

| Gate | Required Result |
| --- | --- |
| PRD alignment | V6 PRD says V5.12-V5.15 are accepted scoped baseline evidence. |
| Active line | `docs/active/*` identifies V6 productization planning as the current line. |
| Claim boundary | Allowed and forbidden claims are explicit. |
| No false-green | V6.0 does not claim production readiness or feature implementation. |
| Evidence structure | V6.x evidence index and productization gate plan exist. |
| Regression references | V3/V4/V5 regression baseline remains listed. |

## Required Checks

```bash
rg -n "V5\\.12-V5\\.15.*remaining|V5\\.12-V5\\.15.*planned|No-Go for V6 Productization Gate now" docs/active docs/V6.0 docs/V6.x
rg -n "production signed release ready|provider integration verified|automatic photo-to-3D ready|MCP ready|3D ready" docs/active docs/V6.0 docs/V6.x
git diff --check --
```

Forbidden claims may appear only in forbidden / not-ready contexts.

## Allowed Claim

```text
V6 productization scope frozen with release, Codex UX, asset manager, personalization, renderer, integration, and governance tracks.
```

