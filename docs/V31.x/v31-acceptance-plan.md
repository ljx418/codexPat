# V31 Acceptance Plan

文档状态：acceptance plan；V31 partial scoped execution recorded；V31 continuation execution blocked scoped。
当前日期：2026-06-24。

## Acceptance Principle

V31 accepts product-quality 2D action assets, not merely semantic placeholder
motion. It also defines how arbitrary-cat photo-to-action can be proven later
without overclaiming it now.

Execution update: V31 evidence on 2026-06-24 passed the named local flagship
asset route and closed final acceptance as partial scoped because the
arbitrary-cat photo route remains candidate-only.

Continuation update: V31.8-V31.13 keep the same gates and add proof for
repeatable production, layered rig runtime output, and named-sample-set
photo-to-action closure.

Execution update: V31.8-V31.13 ran on 2026-06-24. The continuation final gate
is blocked scoped: repeatable production and named photo sample set are partial,
while layered rig runtime, photo-action closure, and continuation E2E are
blocked. Claim and security scans passed.

## User-visible Acceptance Gates

| Gate | User-visible Experience | Pass Condition |
| --- | --- | --- |
| Art quality gate | 猫看起来像可发布桌宠，不是工程占位线条猫。 | Human visual rubric passes; placeholder/simple SVG rejected. |
| 8-action flagship gate | 用户看到一套完整高质量动作猫。 | All 8 core actions have polished frames/playback and action-specific poses. |
| Motion quality gate | 动作有姿态、节奏、表情和吸引力。 | V30 semantic QA plus V31 art/timing/appeal QA pass. |
| Evidence gate | 审核者能快速看懂质量。 | HTML embeds screenshots, contact sheets, playback, 1x/0.75x, QA table. |
| Apply gate | 用户只能应用合格资产。 | Failed assets cannot apply; approved asset applies target-only. |
| Rollback gate | 用户可以撤回。 | Rollback restores previous visible pack; unrelated pets unchanged. |
| Photo route gate | 用户照片生成有真实结论。 | Named real sample set either passes or records blocked/failed reasons. |
| Claim gate | 用户不被误导。 | Forbidden claims only appear in not-ready / forbidden contexts. |
| Repeatability gate | 用户看到不止一次偶然成功。 | Multiple candidates use the same production and QA contract, or evidence records stable blockers. |
| Layered rig runtime gate | 用户看到不依赖整图变形的可复用动作路线。 | Normalized frames or supported runtime payload passes the same QA and preview/apply/rollback boundaries. |

## High-quality Art Rubric

Hard fail if:

- the asset looks like a simple line-art placeholder;
- the same frame is reused with tiny pose changes for most actions;
- running / success / error / need_input cannot be recognized without labels;
- pose changes are mostly whole-image transform;
- character identity changes across actions;
- loop flickers or snaps;
- 1x or 0.75x readability fails;
- license / attribution is missing;
- evidence is text-only.

Pass requires:

- visible character polish, volume, expression, and silhouette;
- complete 8 core actions;
- action-specific key poses;
- enough frames for smooth playback;
- safe transparent or clean background;
- embedded visual evidence;
- target-only apply and rollback proof.

## Arbitrary-cat Photo-to-action Acceptance

The arbitrary-cat path can pass only for a named tested sample set. Minimum
sample classes:

- clear front/three-quarter cat photo;
- side or partial-body cat photo;
- long-hair or complex pattern cat;
- low-quality or blocked photo sample;
- non-cat or unsafe input sample.

Pass requires:

- consent and privacy boundary;
- traits / character design extraction without raw private data in evidence;
- same-cat identity scores;
- 8 action candidates;
- visual art QA;
- semantic action QA;
- preview/apply/rollback;
- blocked reason for failed samples;
- claim/security scan.

## Required Commands For Future Gates

Minimum regression commands:

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

V31.7 already has scoped execution evidence. Future continuation scripts or
equivalent evidence must be added before V31.13 final gate.

Continuation scripts or equivalent evidence must be added before V31.13 for:

- repeatable asset production;
- layered rig runtime output or stable blocked reason;
- named real sample-set intake;
- photo-to-action candidate closure;
- continuation real-data E2E.

## Execution Specs

- `docs/V31.x/v31-detailed-development-and-acceptance-plan.md`
- `docs/V31.x/v31_1-art-quality-rubric-spec.md`
- `docs/V31.x/v31_2-flagship-asset-route-spec.md`
- `docs/V31.x/v31_3-visual-review-report-spec.md`
- `docs/V31.x/v31_4-layered-rig-route-spec.md`
- `docs/V31.x/v31_5-photo-to-character-route-spec.md`
- `docs/V31.x/v31_6-e2e-real-data-acceptance-spec.md`
- `docs/V31.x/evidence/v31_8-repeatable-asset-production-2026-06-24.md`
- `docs/V31.x/evidence/v31_9-layered-rig-runtime-route-2026-06-24.md`
- `docs/V31.x/evidence/v31_10-photo-sample-set-2026-06-24.md`
- `docs/V31.x/evidence/v31_11-photo-action-preview-apply-rollback-2026-06-24.md`
- `docs/V31.x/evidence/v31_12-real-data-e2e-2026-06-24.md`
- `docs/V31.x/evidence/v31_13-continuation-final-gate-2026-06-24.md`

## Exit Conditions

V31 final can pass only if:

- at least one high-quality flagship 8-action asset passes visual and semantic gates;
- the final report embeds real visual evidence;
- failed placeholder and transform-only candidates are blocked;
- target-only apply and rollback pass;
- arbitrary-cat route is either passed for named real samples or honestly
  marked partial/blocked/failed;
- claim scan and security scan pass.

If flagship asset quality fails, V31 final must fail or remain blocked. In the
2026-06-24 V31 run, flagship quality passed for one named local asset, but the
overall stage remains partial scoped because arbitrary-cat automatic generation
was not proven.

V31 continuation has real evidence for V31.8-V31.13, but it is blocked scoped.
It can pass in a future run only after repeatable high-quality production,
layered/professional runtime output, and real photo-derived action frames pass
the same QA and runtime controls. If the photo route passes only for named
samples, the claim must stay scoped to that sample set.
