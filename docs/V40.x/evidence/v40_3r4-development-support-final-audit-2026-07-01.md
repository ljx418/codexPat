# V40.3R4 Development Support Final Audit - 2026-07-01

## Scope

This is a documentation-only audit. It does not implement code, run generation,
approve assets, unlock V40.4, or claim V40 image-to-action quality.

## Audit Question

Can the current V40 documentation fully guide the remaining work for the
selected high-quality image-to-action route without creating a false pass?

## Reviewed Documents

- `docs/active/agent_desktop_pet_prd_v40.md`
- `docs/V40.x/v40-target-architecture.md`
- `docs/V40.x/v40-development-and-acceptance-plan.md`
- `docs/V40.x/v40-acceptance-plan.md`
- `docs/V40.x/v40-milestones.md`
- `docs/V40.x/v40-current-gap-analysis.md`
- `docs/V40.x/v40-phase-specs.md`
- `docs/V40.x/v40-evidence-and-scan-checklist.md`
- `docs/V40.x/v40_3r4-detailed-development-and-acceptance-plan.md`
- `docs/V40.x/v40_3r4-route-decision-and-predev-audit.md`
- `docs/active/development-plan.md`
- `docs/active/acceptance-plan.md`
- `docs/active/current-vs-target-gap.md`
- `docs/active/current-vs-target-gap.drawio`

## Audit Rounds

### Round 1 - PRD To Architecture Coverage

Result: passed scoped after revision.

The PRD defines the target user experience: same-cat identity, readable
eight-action previews, better-than-V39 visual preference, preview/apply/rollback,
and honest failed/blocked evidence. The target architecture maps this to
source/license records, subject mask/crop planning, identity anchors, action
pose controls, direct runner invocation, candidate frame sequences, quality
review, and V39 comparison.

### Round 2 - Architecture To Development Plan Coverage

Result: passed scoped after revision.

The initial documentation had a gap between V40.3R4 route selection and V40.4
normalization. That gap is now closed by adding:

- V40.3R5 Direct Runner Predev Audit;
- V40.3R6 Controlled Candidate Frame Generation.

V40.4 is now explicitly No-Go unless V40.3R5 passes and V40.3R6 produces at
least two same-sample candidates with explicit visual-review passes.

### Round 3 - Acceptance And Evidence Coverage

Result: passed scoped.

Acceptance plans and evidence checklist now require:

- source/license records;
- sample matrix with at least two tested samples and one blocked/negative sample;
- model/control inventory without WebUI/ComfyUI;
- mask/crop plans;
- identity anchors;
- action pose controls for at least eight actions;
- action-name mapping between V40 asset actions and product runtime state
  actions;
- safe runner invocation;
- candidate frame sequence refs;
- explicit visual review;
- same-sample V39 comparison;
- claim scan and security scan.

### Round 4 - Drawio Coverage

Result: passed scoped.

The drawio remains 8 pages and shows the updated route as:

```text
V40.3R4 route freeze
  -> V40.3R5 predev audit
  -> V40.3R6 candidate frame generation and visual review
  -> V40.4 packaging only after two visual passes
```

The diagram states that the route is not whole-image transform and not template
GIF reuse.

### Round 5 - External Review Follow-Up

Result: passed scoped after revision.

The 2026-07-01 external review identified one P1 risk: V40 asset action names
could drift from product runtime state action names. The documents now require
V40.3R5 to record an action-name mapping decision before generation.

V40 generated assets use:

```text
idle / walk / jump / sleep / eat / play / alert / celebrate
```

Product runtime states map onto those asset actions and do not rename the asset
pack:

```text
idle -> idle
thinking -> alert
running -> walk
success -> celebrate
warning -> alert
error -> alert
need_input -> alert
sleeping -> sleep
```

This closes the action-naming drift risk before V40.3R5 can pass.

## Residual Risks

- The selected local direct-runner route can still fail empirically if local
  model/control components cannot produce appealing same-cat action frames.
- Documentation cannot guarantee human visual preference.
- V40.3R5 or V40.3R6 may still produce blocked/failed evidence.

These risks are acceptable for documentation readiness because the documents now
force blocked/failed outcomes instead of false pass claims.

## Final Documentation Support Decision

Status: passed scoped for development support.

The current documentation is now sufficient to guide the remaining V40 work
phase-by-phase through V40.3R5, V40.3R6, V40.4, V40.5, V40.6, and V40.7.

It does not prove that V40 will achieve high-quality image-to-action assets. It
does prove that the next automation can be audited without silently passing weak
template, transform-only, or failed candidate outputs.

## Allowed Next Work

Only V40.3R5 Direct Runner Predev Audit may start after this documentation
audit. V40.4-V40.7 remain No-Go until the documented prerequisites are met.

## Claim Boundary

Allowed scoped claim:

`V40.3R4 documentation can support the next V40.3R5 predev audit and later gated development.`

Forbidden claims remain false:

- arbitrary-cat automatic generation ready;
- Petdex parity achieved;
- provider integration verified;
- WebUI/ComfyUI route verified;
- Route B verified;
- V40 production release ready;
- Windows ready;
- cross-platform ready.
