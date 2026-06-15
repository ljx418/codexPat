# V22 Detailed Development and Acceptance Plan

文档状态：scoped accepted detailed implementation package。  
阶段主题：Asset Quality Review & Rejection Gate。  
当前日期：2026-06-15。

## Purpose

This document turns the V22 PRD and architecture into implementation-sized work
packages. It is more concrete than the high-level development plan and should be
used before writing code for each phase.

## V22.0 Scope Freeze

### Development Work

- Create `docs/V22.x/evidence/` if missing.
- Confirm active PRD points to V22.
- Confirm V21 premium pixel visual failure is recorded as rejected baseline.
- Confirm V22 drawio XML parses.
- Confirm forbidden claims appear only in forbidden / not-ready / not-implied contexts.

### Acceptance

Evidence file:

```text
docs/V22.x/evidence/v22_0-scope-freeze-YYYY-MM-DD.md
```

Must include:

- docs existence table；
- active docs pointer table；
- drawio parse result；
- V21 failed visual candidate reference；
- forbidden claim scan；
- Go / No-Go for V22.1。

## V22.1 Candidate Quality Schema

### Development Work

- Implement or document the candidate quality schema.
- Define status enum:

```text
generated
normalized
technical_failed
motion_failed
visual_review_required
visual_rejected
approved
applied
rollback_available
```

- Define reasonCode enum from `v22_x-quality-review-gate-spec.md`.
- Add fixtures for approved, technical-failed, motion-failed, visual-rejected, and unreviewed candidates.

### Acceptance

Evidence file:

```text
docs/V22.x/evidence/v22_1-quality-schema-smoke-YYYY-MM-DD.md
```

Must prove:

- valid candidate accepted；
- unknown status rejected；
- unknown reasonCode rejected or normalized to `unknown_safe_reason` if implemented；
- visual_rejected candidate cannot be treated as approved；
- candidate summary contains no unsafe fields。

## V22.2 Technical QA Gate

### Development Work

- Add technical QA checker for action coverage, frame count, blank/transparent frames, off-canvas, background/watermark, and unsafe fields.
- Create rejected fixtures:

```text
missing_core_action
blank_frame_detected
transparent_frame_detected
off_canvas_frame_detected
background_not_removed
watermark_detected
unsafe_field_detected
```

### Acceptance

Evidence file:

```text
docs/V22.x/evidence/v22_2-technical-qa-smoke-YYYY-MM-DD.md
```

Must prove:

- each rejected fixture fails with stable reasonCode；
- valid technical fixture passes into `visual_review_required` or next gate；
- previous active pack preserved after rejected fixture；
- evidence does not include raw payloads or full local paths。

## V22.3 Motion QA Gate

### Development Work

- Add motion QA checker for amplitude, adjacent delta, loop closure, anchor drift, and representative action readability.
- Create rejected fixtures:

```text
motion_amplitude_too_low
frame_delta_too_large
loop_closure_failed
identity_drift_detected
```

- Mark the V21 premium pixel output as visual-rejected baseline, not product approved.

### Acceptance

Evidence file:

```text
docs/V22.x/evidence/v22_3-motion-qa-smoke-YYYY-MM-DD.md
```

Must prove:

- weak-motion pack fails；
- flicker/jump pack fails；
- loop-broken pack fails；
- identity-drift pack fails；
- valid motion fixture can move to visual review。

## V22.4 Visual Review UX Contract

### Development Work

- Add review state contract:

```text
approve
reject
request_retry
switch_route
ask_better_photo
```

- Provide UI or documented contract for reviewer decision, reasonCode, comment summary, and safe display.
- Use the V21 premium pixel report as a known rejected visual fixture.

### Acceptance

Evidence file:

```text
docs/V22.x/evidence/v22_4-visual-review-ux-smoke-YYYY-MM-DD.md
```

Must prove:

- ugly candidate can be rejected；
- rejected candidate gets `visual_rejected`；
- reviewer sees safe contact sheet or screenshot；
- reviewer does not see raw provider response, raw photo bytes, token, Authorization, or full local path；
- review decision is persisted in safe metadata only。

## V22.5 Retry and Route Guidance

### Development Work

- Implement retry budget:

```text
route attempt limit: 2
total attempt limit: 6
same reason twice: require repair or route switch
budget exhausted: show better-photo or alternate-route guidance
```

- Map reasonCodes to guidance:

| ReasonCode | Guidance |
| --- | --- |
| `motion_amplitude_too_low` | retry with stronger action prompt or switch to motion sheet/local rig |
| `identity_drift_detected` | reduce action complexity or use canonical identity route |
| `background_not_removed` | use cleaner photo or background removal route |
| `cat_not_cute_enough` | switch style template or request better visual source |
| `provider_output_unusable` | switch provider route or local rig fallback |
| `better_photo_required` | upload single clear front-facing cat photo |

### Acceptance

Evidence file:

```text
docs/V22.x/evidence/v22_5-retry-route-guidance-smoke-YYYY-MM-DD.md
```

Must prove:

- repeated same failure triggers repair or route switch；
- budget exhaustion blocks further blind retry；
- guidance is user-readable；
- guidance does not reveal unsafe data。

## V22.6 Approved-only Apply Enforcement

### Development Work

- Block apply for:

```text
generated
normalized
technical_failed
motion_failed
visual_review_required
visual_rejected
```

- Permit apply only for `approved`.
- Ensure target-only apply and rollback.

### Acceptance

Evidence file:

```text
docs/V22.x/evidence/v22_6-apply-enforcement-smoke-YYYY-MM-DD.md
```

Must prove:

- unreviewed candidate cannot apply；
- rejected candidate cannot apply；
- approved candidate can preview/apply；
- default and unrelated pets unchanged；
- rollback restores previous visible pack；
- failed apply preserves previous active pack。

## V22.7 Final Gate

### Development Work

- Produce final report and HTML dashboard.
- Embed both accepted and rejected visual examples.
- Run security and claim scans.

### Acceptance

Files:

```text
docs/V22.x/v22_7-final-acceptance-report.md
docs/V22.x/evidence/v22_7-quality-review-dashboard-YYYY-MM-DD.html
```

Final report must include:

- status: passed / blocked / failed；
- date；
- commit；
- scope；
- accepted examples；
- rejected examples；
- technical QA result；
- motion QA result；
- visual review result；
- retry guidance result；
- approved-only apply result；
- rollback result；
- security scan；
- claim scan；
- allowed claim；
- forbidden claims；
- final decision。

## Minimum Regression

Run or explicitly document why non-blocking:

```text
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
node scripts/v3_1_runtime_smoke.mjs
node scripts/v4_4_managed_session_smoke.mjs
```

If runtime/apply behavior is touched, also run the latest relevant V21 route
preview/apply smoke or its V22 replacement.
