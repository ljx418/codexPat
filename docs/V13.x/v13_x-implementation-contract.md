# V13 Implementation Contract

日期：2026-06-08  
状态：passed scoped contract；V13.1-V13.7 evidence 已按本 contract 收口。  

## Purpose

This contract turns the V13 PRD, architecture, and acceptance plan into concrete implementation and evidence requirements. It exists to prevent each V13 subphase from being marked passed with only prose, mockups, or stale evidence.

## Phase Evidence Map

| Phase | Required Evidence File | Required Screenshot / Artifact |
| --- | --- | --- |
| V13.1 | `docs/V13.x/evidence/v13_1-scope-freeze-YYYY-MM-DD.md` | drawio sync PNGs |
| V13.2 | `docs/V13.x/evidence/v13_2-packaging-smoke-YYYY-MM-DD.md` | packaged app launch screenshot if GUI launch succeeds |
| V13.3 | `docs/V13.x/evidence/v13_3-first-run-user-journey-YYYY-MM-DD.md` | first-run desktop screenshot, settings/onboarding screenshot |
| V13.4 | `docs/V13.x/evidence/v13_4-diagnostics-export-redaction-YYYY-MM-DD.md` | sanitized diagnostics archive or file manifest |
| V13.5 | `docs/V13.x/evidence/v13_5-stability-performance-baseline-YYYY-MM-DD.md` | long-run desktop screenshot and performance summary |
| V13.6 | `docs/V13.x/evidence/v13_6-artifact-license-claim-hygiene-YYYY-MM-DD.md` | scan tables |
| V13.7 | `docs/V13.x/v13_7-final-acceptance-report.md` and `docs/V13.x/evidence/v13_7-beta-readiness-html-YYYY-MM-DD.html` | embedded screenshots and result tables |

## Stable Reason Codes

V13 evidence should use stable reasonCode values:

- `scope_claim_boundary_complete`
- `scope_claim_boundary_failed`
- `packaging_build_failed`
- `packaging_artifact_missing`
- `app_launch_failed`
- `app_launch_passed`
- `desktop_health_failed`
- `first_run_screenshot_missing`
- `first_run_guide_missing`
- `codex_work_cat_guide_missing`
- `already_open_codex_boundary_missing`
- `diagnostics_export_missing`
- `diagnostics_redaction_failed`
- `diagnostics_redaction_passed`
- `stability_timeout`
- `stability_crash_detected`
- `performance_baseline_recorded`
- `artifact_dirty`
- `artifact_scan_passed`
- `license_missing`
- `license_scan_passed`
- `forbidden_claim_ready_context`
- `claim_scan_passed`
- `html_report_missing_screenshot`
- `html_report_passed`

## V13.1 Scope Freeze Contract

Required outputs:

- Active PRD points to V13.
- V13 development, acceptance, architecture, milestone, exit, claim, and implementation contract docs exist.
- Drawio has Chinese pages covering current state, architecture difference, plan, milestones, and exit gates.
- V12 remains scoped accepted baseline and is not reused as V13 runtime evidence.

Pass criteria:

- No unresolved High planning risk.
- Forbidden claims appear only in forbidden/not-ready/not-implied contexts.
- `docs/active/current-vs-target-gap.drawio` validates as XML.

## V13.2 Packaging Foundation Contract

Implementation may use existing scripts:

```text
pnpm --filter desktop build
pnpm --filter desktop tauri build -b app
```

Required evidence:

- build command summary.
- package artifact summary with sanitized filename/type only.
- launch attempt result.
- desktop health result if app starts.
- signing/notarization/auto-update checklist status as `planned`, `not-run`, or `not-required-for-v13`.

Evidence must not include:

- full local package path.
- signing identity.
- signing secret.
- Apple account data.
- token or Authorization.
- raw build logs with full `/Users` paths.

Pass criteria:

- local packaging smoke succeeds and app launches in tested local environment.
- if packaging or launch fails, V13.2 status is blocked/failed and V13.7 cannot pass.

## V13.3 First-run User Journey Contract

Required user-visible checkpoints:

1. A visible desktop pet appears.
2. User can open settings or first-run guide.
3. User can identify main capabilities:
   - living desktop pet.
   - built-in animated cats.
   - Codex work-cat.
   - local asset import/manager if exposed.
4. User can copy recommended wrapper-launched JSONL command.
5. User can see managed TUI `/hooks review/trust` note.
6. User can see already-open Codex window auto-monitoring is unsupported.

Required screenshots:

- desktop screenshot with visible pet.
- settings/first-run screenshot.
- Codex work-cat guide screenshot.

Pass criteria:

- reviewer can understand the beta workflow from screenshots and text without rebuilding or clicking through manually.
- default and unrelated pets do not change during guide/preview.

## V13.4 Diagnostics Export Contract

Diagnostics export may be implemented as UI or CLI, but the beta-facing target should be a user-shareable support bundle.

Allowed diagnostic fields:

- app version.
- desktop package/build mode.
- platform name and architecture.
- sanitized Codex integration mode summaries.
- desktop health status.
- pet instance count and sanitized instance IDs.
- active renderer kind.
- active safe pack IDs.
- recent safe reasonCodes.
- window visibility summaries without raw screen contents.
- relevant check results.

Forbidden diagnostic fields:

```text
token
Authorization
raw payload
prompt text
tool command text
workspace path
config path
full /Users path
api-token.json
shell history
clipboard contents
screen text contents
raw provider response
raw Codex JSONL payload
hook payload
MCP payload
HTTP payload body
```

Required redaction scan:

- scan the exported file/archive content.
- fail on forbidden field names in ready contexts.
- fail on absolute local path patterns.
- fail on bearer/API-key-like values.

Pass criteria:

- diagnostics export exists.
- redaction scan passes.
- evidence records only safe field names and sanitized values.

## V13.5 Stability / Performance Contract

Minimum test shape:

- 10-minute local run or documented shorter smoke if environment limits are stated.
- at least 3 visible pets, including one default/living pet and one Codex work-cat candidate or simulated work-cat instance.
- settings open/close once during test.
- app focus change once during test.
- screenshot at start and end.
- CPU and memory baseline recorded.

Hard fail:

- app crash.
- pet disappears without diagnostic reason.
- blank/transparent/off-canvas visual regression.
- memory grows monotonically beyond 25% during the measured window without explanation.
- user-facing state becomes unrecoverable.

Pass criteria:

- app remains responsive.
- visible pet remains visible or recovery/diagnostic explains status.
- performance baseline is recorded with environment notes.

## V13.6 Artifact / License / Claim Hygiene Contract

Required checks:

```text
git status --short
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
```

Artifact scan must confirm these are not staged for commit:

- `dist/`
- `target/`
- `node_modules/`
- provider raw output directories.
- temporary screenshot/capture folders outside documented evidence paths.
- local diagnostics archives containing private data.

License scan must confirm:

- bundled/generated cat assets have attribution/license notes.
- imported test fixtures have local test attribution or are generated fixtures.
- evidence does not claim third-party asset rights beyond what is documented.

Claim scan must confirm forbidden claims only appear in forbidden/not-ready/not-implied contexts.

## V13.7 Beta Readiness HTML Contract

Final HTML must include:

- status: passed / blocked / failed.
- date.
- commit.
- scope.
- allowed claim.
- forbidden claims.
- packaging smoke result.
- first-run screenshot section.
- Codex work-cat onboarding section.
- diagnostics export/redaction section.
- stability/performance section.
- artifact/license/claim scan section.
- regression summary.
- PRD/spec review.
- final decision.

The HTML must embed or directly display screenshots. It must not be only a link list.

If any prerequisite phase is blocked, V13.7 status must be blocked and the final claim must not be used.

## Required Active Documentation Sync

Before each phase begins:

- update the phase status in `docs/active/current-vs-target-gap.md` if the previous phase passed/blocked/failed.
- keep `docs/active/acceptance-plan.md` aligned with the latest accepted evidence.
- keep `docs/active/development-plan.md` aligned with current active phase.
- update drawio if phase status changes materially.

## Go / No-go

Current conclusion:

- V13.1-V13.6 evidence passed.
- V13.7 final gate passed.
- No new V13 feature scope remains.
- Post-V13 work should move to a new track unless it is evidence/document hygiene.
