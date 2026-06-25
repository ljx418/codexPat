# V31.1 Art Quality Rubric Spec

文档状态：planned execution spec；V31.1 entry document。
当前日期：2026-06-24。

## Purpose

V31.1 defines the visual quality gate that separates a product-quality desktop
pet asset from an engineering placeholder. This phase does not create final
assets. It creates the acceptance rubric and records why the current simplified
SVG cat cannot represent the V31 target user experience.

## Inputs

- V31 PRD: `docs/active/agent_desktop_pet_prd_v31.md`
- V31 target architecture: `docs/V31.x/v31-target-architecture.md`
- Current V30 semantic evidence and visual review evidence.
- Current local asset candidate: `flagship-work-cat-v2` or successor candidate
  if the codebase has renamed it.

## Development Tasks

1. Define a scored art rubric with hard-fail rules.
2. Map each rubric item to the target user experience.
3. Run the rubric against the current simplified SVG cat.
4. Produce visible failure evidence, not text-only judgment.
5. Define the minimum metadata needed for future high-quality asset packs.

## Rubric Contract

Each candidate must be judged on:

| Category | Required Result | Hard Fail |
| --- | --- | --- |
| Character polish | clear silhouette, volume, expression, color, readable face | simple line-art placeholder |
| Action specificity | each action has action-specific pose and expression | mostly reused frames |
| Motion construction | limb/body/tail/ear/eye motion supports action meaning | whole-image transform as primary motion |
| Identity stability | same cat across all actions | style, proportions, or markings drift heavily |
| Playback quality | loop/transient reads at 1x and 0.75x | snap, flicker, off-canvas, unreadable small scale |
| Evidence quality | screenshots/contact sheets/playback included | text-only acceptance |
| Rights boundary | source/license/attribution recorded | missing or unsafe license |

## Output Evidence

Create:

```text
docs/V31.x/evidence/v31_1-art-quality-rubric-YYYY-MM-DD.md
```

Required sections:

- PRD/spec review.
- Rubric table and scoring thresholds.
- Current placeholder asset review.
- Screenshot/contact-sheet evidence or stable blocked reason.
- Decision: `passed scoped`, `blocked`, or `failed`.
- Claim scan.
- Security scan.

## Pass / Block / Fail

- Pass: rubric exists, maps to V31 PRD, rejects placeholder/simple SVG
  correctly, and produces reviewable evidence.
- Blocked: current asset cannot be rendered or inspected in the environment.
- Failed: rubric is ambiguous, accepts placeholder art, lacks visual evidence,
  or expands claims beyond V31.

## Claim Boundary

Passing V31.1 allows only:

```text
V31 art quality rubric is defined and the current placeholder asset is not
accepted as target visual quality.
```

It does not prove high-quality asset delivery or arbitrary-cat automation.
