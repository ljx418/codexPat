# V39 Target Architecture

Date: 2026-06-27

## Architecture Goal

V39 changes the target from "photo-derived renderable frame pack" to "characterized 2D desktop pet action asset." The system must transform a tested cat sample into a clean character asset with explicit part responsibilities and action frames that a human can plausibly enjoy using.

## Target Chain

```text
V38 public-photo source and sanitized derived image
  -> V39 source eligibility and visual suitability review
  -> cleaned cat silhouette and background removal contract
  -> characterized 2D design contract
  -> part map: head / body / ears / paws / tail / eyes-expression
  -> layered rig contract
  -> Route A2++ local action frame composer
  -> eight action contact sheets and animated previews
  -> V31 art quality gate
  -> V32 measured motion gate
  -> V34 generation-chain gate
  -> V35 target-experience rubric
  -> V36/V37/V38 product and evidence boundaries
  -> human preference gate
  -> product preview / target-only apply / rollback
  -> Chinese HTML visual acceptance report
  -> scoped final gate
```

## Concrete Existing Entities

- `apps/desktop/src/assets/v31-art-quality.ts`: rejects placeholder line art, weak pose, overlay text, and whole-image transform-only results.
- `apps/desktop/src/assets/v32-quality-rescue.ts`: measures frame count, motion delta, local part motion, visual detail, duplicate frames, loop closure, and small-scale readability.
- `apps/desktop/src/assets/v34-rig-frame-synthesis.ts`: provides the current local rig/frame synthesis baseline.
- `apps/desktop/src/assets/v35-target-experience-quality.ts`: provides target-experience rubric and Route A2/Route B framing.
- `apps/desktop/src/assets/v37-photo-to-action-product-path.ts`: provides product preview/apply/rollback and sample-bound candidate contract.
- `apps/desktop/src/assets/v38-public-photo-action-pipeline.ts`: provides public-source manifest, sanitized asset contract, renderable pack contract, and V38 claim/security helpers.
- `apps/desktop/src/main.ts`: contains settings UI anchors and the current V37/V38 personalization panels.

## Planned V39 Entities

- `apps/desktop/src/assets/v39-characterized-asset-contract.ts`: source-to-character contract with cleaned silhouette, style profile, identity traits, and no-card/no-label rules.
- `apps/desktop/src/assets/v39-layered-part-rig.ts`: part responsibility contract for head, body, ears, paws, tail, and eyes/expression.
- `apps/desktop/src/assets/v39-action-frame-composer.ts`: Route A2++ action frame sequence contract with local part motion and action-specific pose changes.
- `apps/desktop/src/assets/v39-human-preference-gate.ts`: human visual gate that can fail outputs that are technically renderable but unattractive.
- `apps/desktop/src/assets/v39-product-preview-contract.ts`: product UI contract for V39 candidate preview, apply, rollback, and blocked reason.
- `scripts/v39_0` through `scripts/v39_8`: phase evidence generation, report, claim scan, and final gate.

## Controlling Specs

- `docs/V39.x/v39-phase-specs.md`: phase entry criteria, evidence shape, pass/block/fail rules, and final gate requirements.
- `docs/V39.x/v39-quality-rubric-and-risk-closure.md`: minimum visual rubric, quantitative floor, A2++ risk closure, and fallback route comparison.

## Current To Target Difference

| Area | V38 Current | V39 Target |
| --- | --- | --- |
| Visual form | photo in a card-like frame with overlays | clean character asset derived from the photo |
| Motion | local overlays and frame evidence | part-based motion with pose and expression changes |
| Human appeal | evidence object, not lovable pet | human visual preference is an exit gate |
| Product route | settings anchors and report evidence | preview/apply/rollback for a V39 candidate |
| Claim | tested public-photo frame pack scoped pass | tested sample characterized action asset scoped pass |

## Scoped Pass Floor

V39 scoped pass requires at least two different tested cat samples to pass the characterized asset, part rig, action composer, human preference, product path, evidence, claim, and security gates. A single good sample can support partial scoped evidence, not final scoped pass.

## Route Decision

Route A2++ is the default because it is local, inspectable, reversible, and can reuse existing gates without claiming provider readiness. Route B remains a recorded future comparison route. It can only participate in acceptance when real source-bound professional or provider-assisted assets exist for the same sample IDs.
