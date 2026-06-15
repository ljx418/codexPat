# V17 Acceptance Plan

状态：V17.0-V17.7 scoped passed acceptance map；MiniMax text-to-image action-sheet API passed scoped。  
日期：2026-06-11。

## Acceptance Principle

V17 不接受“说明文字 passed”。必须用真实 UI、真实本地照片或真实动作表、真实预览/应用行为来验收。

每个 phase 必须写明：

- `status: passed / blocked / failed`
- date
- scope
- evidence assets
- security scan result
- PRD/spec review
- claim scan

## Phase Gates

| Phase | Required Evidence | Pass Criteria |
| --- | --- | --- |
| V17.0 | `docs/V17.x/evidence/v17_0-scope-freeze-2026-06-11.md` | passed scoped |
| V17.1 | `docs/V17.x/evidence/v17_1-wizard-shell-photo-intake-2026-06-11.md` | passed scoped |
| V17.2 | `docs/V17.x/evidence/v17_2-generation-mode-loading-2026-06-11.md` | passed scoped |
| V17.3 | `docs/V17.x/evidence/v17_3-action-sheet-packaging-2026-06-11.md` | passed scoped |
| V17.4 | `docs/V17.x/evidence/v17_4-modal-preview-qa-2026-06-11.md` | passed scoped |
| V17.5 | `docs/V17.x/evidence/v17_5-apply-rollback-2026-06-11.md` | passed scoped |
| V17.6 | `docs/V17.x/v17_6-final-acceptance-report.md` and `docs/V17.x/evidence/v17_6-productized-wizard-html-2026-06-11.html` | passed scoped |
| V17.7 | `docs/V17.x/v17_7-provider-api-addendum-report.md` and `docs/V17.x/evidence/v17_7-minimax-provider-api-action-sheet-2026-06-11.md` | passed scoped |

## Required Checks

Minimum automated checks:

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop build
node scripts/v15_12_photo_2d_continuity_assembly_smoke.mjs
node scripts/v15_13_photo_2d_preview_apply_smoke.mjs
node scripts/v16_6_final_provider_photo2d_gate_smoke.mjs
```

If a V17 smoke script is added, V17.6 must include it.

## Visual Evidence

V17.6 final HTML must embed or directly display:

- wizard shell screenshot.
- photo preview screenshot with no full local path.
- generation mode/loading screenshot.
- action-sheet upload / output-ready screenshot.
- 8-action preview screenshot.
- target apply and rollback result screenshot.

## Security Scan

Evidence, UI output, logs, and diagnostics must not contain:

- token
- Authorization
- raw photo bytes
- raw prompt
- raw provider request/response
- full local path
- workspace path
- config path
- EXIF/GPS
- shell history
- clipboard content
- remote runtime URL
- api-token.json

## Claim Boundary

Allowed after V17.6 only:

```text
V17 photo-to-2D action asset wizard passed for tested local photo, action-sheet import, preview, target apply, and rollback scenarios.
```

If direct provider API path remains unavailable:

```text
V17 photo-to-2D wizard passed for tested local photo and action-sheet import scenarios; direct provider API generation remains not-ready.
```

After V17.7:

```text
V17 photo-to-2D wizard passed for tested local photo/action-sheet import and tested MiniMax text-to-image action-sheet API scenarios; local cat photo upload to provider and arbitrary-cat automatic generation remain not-ready.
```

Forbidden:

```text
automatic photo-to-2D ready for arbitrary cats
automatic photo-to-animation ready
provider integration verified
Petdex parity achieved
3D ready
automatic photo-to-3D ready
remote asset loading ready
asset marketplace ready
production signed release ready
cross-platform ready
Windows ready
```
