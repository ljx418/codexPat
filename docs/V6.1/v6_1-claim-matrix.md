# V6.1 Release / Distribution Foundation Claim Matrix

status: planning-ready

date: 2026-05-30

## Allowed Claim

```text
V6.1 release and distribution foundation passed for tested local macOS packaging scenarios.
```

## Claim Conditions

- Local macOS packaging smoke has passed or has an explicit blocked result.
- First-run guide has been reviewed.
- Permission explanation has been reviewed.
- Diagnostics export boundary has passed redaction scan.
- Signing / notarization / auto-update remain checklist-only unless separately accepted.

## Forbidden Expansions

```text
production signed release ready
notarized release ready
signed release ready
auto update ready
installer ready
cross-platform ready
Windows ready
```

## Boundary Notes

- A successful local macOS artifact is not a production signed release.
- A signing plan is not signing acceptance.
- A notarization checklist is not notarization acceptance.
- An updater design is not auto-update readiness.

