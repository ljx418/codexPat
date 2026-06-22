# V28 Final Acceptance Report

status: passed
date: 2026-06-16
commit: 9f94bc4

## Scope

V28 closes the V23-V28 Photo-to-Animated-2D Productization Track for tested
local workflow scenarios only:

- photo suitability and safe trait extraction；
- multi-route generation orchestration；
- same-cat and motion QA rejection；
- approved-candidate pack assembly；
- isolated 8-action preview；
- target-only apply；
- rollback；
- retry/cost/failure guidance。

## Evidence Gate

| Phase | Evidence | Result |
| --- | --- | --- |
| V23 | `docs/V23-V28.x/evidence/v23-photo-suitability-trait-smoke-2026-06-16.md` | passed |
| V24 | `docs/V23-V28.x/evidence/v24-multi-route-generation-smoke-2026-06-16.md` | passed |
| V25 | `docs/V23-V28.x/evidence/v25-same-cat-motion-qa-smoke-2026-06-16.md` | passed |
| V26 | `docs/V23-V28.x/evidence/v26-pack-preview-apply-smoke-2026-06-16.md` | passed |
| V27 | `docs/V23-V28.x/evidence/v27-retry-cost-guidance-smoke-2026-06-16.md` | passed |

## Dashboard

`docs/V23-V28.x/evidence/v28-productized-photo-to-2d-dashboard-2026-06-16.html`

The dashboard embeds an inline 8-action contact sheet generated from the tested
V26 preview model. It is not a link-only report.

## Regression

| Check | Result |
| --- | --- |
| pnpm --filter desktop check | passed |
| pnpm --filter desktop test | passed |
| pnpm --filter @agent-desktop-pet/petctl test | passed |

## Security Scan

passed：evidence summaries contain no token,
auth header, raw provider response, raw HTTP payload, raw photo bytes,
EXIF/GPS, private filename, full local path, workspace path, config path, or
prompt private text.

## Claim Scan

passed：forbidden claims appear only as forbidden /
not-ready / not-implied statements.

## PRD / Spec Review

The tested local path now matches the V23-V28 PRD closure target at scoped
evidence level: upload/photo intake evidence, route orchestration, QA rejection,
preview, target apply, rollback, and retry guidance. The provider route remains
evidence-scoped and must not be generalized to arbitrary cats or provider
integration readiness.

## Allowed Claim

V23-V28 photo-to-animated-2D workflow passed for tested local photo intake, multi-route candidate generation, QA rejection, preview, target apply, and rollback scenarios.

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for arbitrary cats；
- arbitrary cats automatic photo-to-animation ready；
- provider integration verified；
- low-retry provider reliability for arbitrary cats；
- Petdex parity achieved；
- Petdex asset reuse authorization；
- 3D ready；
- automatic photo-to-3D ready；
- remote asset loading ready；
- asset marketplace ready；
- production signed release ready；
- notarized release ready；
- auto update ready；
- Windows ready；
- cross-platform ready；
- OS-level Codex window binding ready；
- all Codex workflows verified；
- MCP ready；
- Third-party agent integration verified；
- Claude Code integration verified。

## Final Decision

passed: V28 final acceptance passed for scoped tested local Photo-to-Animated-2D Productization workflow evidence.
