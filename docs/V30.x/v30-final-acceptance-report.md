# V30 Final Acceptance Report

status: passed
date: 2026-06-17

## Scope

V30 covers semantic 2D animation quality for tested local action packs. It prevents transform-only generated frames from being accepted as real character action. It does not claim provider reliability, arbitrary-cat automation, Petdex parity, 3D readiness, or production release readiness.

## Evidence Gate

| Phase | Status | Evidence |
| --- | --- | --- |
| V30.0 scope freeze | passed | docs/V30.x/evidence/v30_0-scope-freeze-2026-06-17.md |
| V30.1 action storyboard | passed | docs/V30.x/evidence/v30_1-action-storyboard-2026-06-17.md |
| V30.2 semantic candidate generation | passed | docs/V30.x/evidence/v30_2-semantic-candidate-generation-2026-06-17.md |
| V30.3 motion readability QA | passed | docs/V30.x/evidence/v30_3-motion-readability-qa-2026-06-17.md |
| V30.4 old-vs-new preview | passed | docs/V30.x/evidence/v30_4-preview-ux-2026-06-17.html |
| V30.5 target apply / rollback | passed | docs/V30.x/evidence/v30_5-target-apply-rollback-2026-06-17.md |

## Runtime / Test Result

- V30 smoke script: passed
- Weak baseline rejected: yes
- Semantic candidate accepted: yes
- Apply / rollback accepted: passed
- Security scan: passed
- Claim scan: passed

## Allowed Claim

V30 semantic 2D pet animation quality passed for tested local action packs with storyboard, motion-readability QA, preview, target apply, and rollback evidence.

## Forbidden Claims

- Petdex parity achieved
- arbitrary cats automatic photo-to-animation ready
- automatic photo-to-2D ready for arbitrary cats
- provider integration verified
- 3D ready
- production signed release ready
- cross-platform ready
- Windows ready

## Final Decision

V30 is scoped passed for semantic 2D animation quality using tested local action packs. Provider/photo generation quality remains a separate not-ready track.
