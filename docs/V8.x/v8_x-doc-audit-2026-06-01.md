# V8.x Document Audit

status: audited-planning
date: 2026-06-01

## Audit Scope

Reviewed the new V8 planning set against the active V7 PRD gap:

- V7 scoped accepted.
- automatic photo-to-3D remains not-ready.
- provider integration remains not verified.
- broad 3D readiness remains not-ready.

## Findings

### Finding 1: V8 scope matches the real V7 gap

Severity: none.

The V8 plan is correctly focused on real provider 3D output, GLTF validation,
action mapping, visual QA, and product UX. It does not reopen V3/V4/V5/V6/V7
accepted scopes.

### Finding 2: Provider dependency remains High risk

Severity: High, expected external dependency.

V8.2 cannot pass without a named provider producing real 3D output under explicit
consent. The plan handles this by making V8.2 blocked rather than replacing it
with fixture evidence.

### Finding 3: Claim boundary is explicit

Severity: none.

The claim matrix forbids broad automatic photo-to-3D, provider integration
verified, broad 3D ready, and production release readiness. The only allowed
future photo-to-3D claim must name the tested provider/scenario.

### Finding 4: Runtime renderer safety remains compatible with V5/V7

Severity: none.

The V8 architecture preserves the renderer boundary: safe action ID, renderer
kind, safe pack/profile IDs, playback intent, scale, and visibility only.

### Finding 5: Active docs require sync

Severity: Medium before implementation; addressed by this planning update.

Active gap/development/acceptance docs must show V8 as planned and V7 as closed
scoped. They must not imply V8 has passed.

## Audit Decision

V8.0 planning is acceptable for external review.

V8.1 implementation is conditional Go only after operator/ChatGPT review of:

- `docs/active/agent_desktop_pet_prd_v8.md`
- `docs/V8.x/v8_x-current-gap-analysis.md`
- `docs/V8.x/v8_x-target-architecture.md`
- `docs/V8.x/v8_x-development-plan.md`
- `docs/V8.x/v8_x-acceptance-plan.md`
- `docs/V8.x/v8_x-claim-matrix.md`
- `docs/V8.x/v8_x-remote-milestones.md`

No unresolved planning flaw justifies creating a V7.16. The next work should be
V8.0 review, then V8.1 provider consent/credential harness.
