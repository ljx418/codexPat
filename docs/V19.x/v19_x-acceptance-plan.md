# V19 Acceptance Plan

日期：2026-06-12  
状态：planned acceptance。

## Acceptance Table

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V19.0 | scope freeze and Petdex boundary | `docs/V19.x/evidence/v19_0-scope-freeze-YYYY-MM-DD.md` | planned |
| V19.1 | motion sheet format and validator | `docs/V19.x/evidence/v19_1-motion-sheet-format-smoke-YYYY-MM-DD.md` | planned |
| V19.2 | provider same-cat single-sheet generation | `docs/V19.x/evidence/v19_2-provider-motion-sheet-smoke-YYYY-MM-DD.md` | planned |
| V19.3 | crop / normalize / pack | `docs/V19.x/evidence/v19_3-sheet-crop-pack-smoke-YYYY-MM-DD.md` | planned |
| V19.4 | motion amplitude and same-cat QA | `docs/V19.x/evidence/v19_4-motion-amplitude-qa-smoke-YYYY-MM-DD.md` | planned |
| V19.5 | preview / target apply / rollback | `docs/V19.x/evidence/v19_5-preview-apply-rollback-smoke-YYYY-MM-DD.md` | planned |
| V19.6 | final screenshot-backed gate | `docs/V19.x/v19_6-final-acceptance-report.md` | No-Go until V19.0-V19.5 evidence |

## User-visible Exit Criteria

V19 can pass only if a tester can see:

1. A high-motion 2D motion sheet or generated sheet.
2. Eight action previews that are visibly different.
3. No flicker, blank frame, transparent frame, or off-canvas frame.
4. Target-only apply to one pet.
5. Rollback to previous active pack.
6. Clear blocked/error messages when provider or sheet validation fails.

## Safety Acceptance

Evidence and logs must not contain:

- token
- Authorization
- raw provider response
- raw photo bytes
- EXIF/GPS
- full local path
- workspace path
- config path
- prompt private text
- shell command
- script source
- Petdex user asset redistribution claim

## Final Gate Rule

V19.6 is blocked unless V19.0-V19.5 have explicit passed/blocked/failed evidence. A local import-only path may pass scoped, but it cannot prove provider motion-sheet generation.
