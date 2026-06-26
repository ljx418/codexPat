# Agent Desktop Pet PRD V31

文档状态：input PRD；V31 partial scoped execution recorded；V31 continuation execution blocked scoped；V37 is the current active planned documentation line；V30/Post-V30 scoped baselines are inputs.
阶段主题：High-quality 2D Action Assets and Arbitrary-cat Photo-to-Action Pipeline.
当前日期：2026-06-24。

## Current Status

V30 semantic action quality gate passed scoped for tested local action packs:
the project can reject transform-only weak actions and accept semantic local
action candidates. A later visual review narrowed the current visual asset
status: the accepted `flagship-work-cat-v2` candidate is still an engineering
placeholder. It is a simplified SVG line-art cat and does not satisfy the
target user experience for high-quality 2D action assets.

Post-V30 architecture/runtime remediation passed scoped and is the current
engineering baseline for further development. It does not prove provider
integration, arbitrary-cat automation, 3D readiness, production release
readiness, Windows readiness, or cross-platform readiness.

V31 execution on 2026-06-24 produced partial scoped evidence: one named local
flagship 8-action asset candidate passed V31 visual/art QA, V30 semantic QA,
preview, target apply, rollback, claim scan, and security scan. The
photo-to-character route remains candidate-only and does not prove arbitrary-cat
automatic high-quality action generation.

The V31 continuation stage extends, but does not overwrite, that partial scoped
result. Its goal is to turn the single flagship proof into a repeatable
high-quality 2D asset production path, and to prove the photo route only for a
named real sample set before any broader claim is allowed.

## Product Goal

V31 turns the V30 semantic gate into a product-quality asset production goal:

```text
V30 semantic gate
  -> V31 product-quality flagship 2D action asset
  -> reusable high-quality 2D asset production pipeline
  -> arbitrary-cat photo-to-action candidate workflow
  -> local QA / visual review / preview / apply / rollback
```

V31 has two staged product goals:

1. Generate or deliver high-quality 2D cat action assets that can represent the
   target user experience.
2. Establish a real, evidence-driven path toward arbitrary-cat photo input
   producing high-quality action assets.

The second goal must not be claimed ready until real photo samples pass the
full pipeline. If it does not pass, V31 must report blocked or failed evidence.

V31 continuation adds three development goals:

1. Make high-quality 2D asset production repeatable beyond one named local
   asset pack.
2. Convert the layered rig / professional animation route from a route contract
   into runtime evidence, or record a stable blocked reason.
3. Validate photo-to-action only against a named real sample set with
   candidate generation, visual QA, semantic QA, preview, apply, rollback, and
   scans.

## Target User Experience

The target user can open the app or evidence report and see:

- a flagship cat that looks like a polished desktop pet, not a placeholder;
- 8 readable core actions: idle, thinking, running, success, warning, error,
  need_input, sleeping;
- action animation with appealing pose changes, expression, volume, and timing;
- contact sheets and playback at 1x and 0.75x;
- failed placeholder / transform-only assets rejected with visible reasons;
- safe preview before apply;
- approved-only target apply and rollback;
- for personalized cats, a photo-driven workflow that either produces a
  reviewable candidate or gives an honest blocked / failed reason.

## Target Quality Bar

A V31 flagship 2D action asset must pass a human-visible art quality gate:

- it does not look like simple line-art placeholder or engineering demo art;
- the character has clear silhouette, volume, expression, and polish;
- each active action is recognizable without labels;
- running, success, error, and need_input have strong pose changes;
- idle and sleeping are subtle but alive;
- animation loops avoid visible snap or flicker;
- the cat remains the same character across actions;
- the asset reads clearly at 1x and 0.75x;
- the final evidence embeds screenshots or playback, not text-only claims.

## Approved Technical Routes

| Priority | Route | Purpose | Acceptance Boundary |
| --- | --- | --- | --- |
| P0 | Human / professional-tool high-quality sprite sheet or frame pack | Fastest route to a real flagship target experience. | Can pass flagship asset gate if license, 8 actions, visual quality, preview, apply, and rollback pass. |
| P1 | Layered 2D part rig / Spine-like / Live2D-like route | Reusable motion system with local control over pose, expression, and timing. | Must export normalized frames or supported runtime payload and pass the same QA and visual review. |
| P2 | Photo -> traits -> character design -> key pose candidates | Practical path toward arbitrary-cat personalization. | Candidate-only until identity, quality, motion, preview, apply, rollback, claim, and security gates pass. |
| P3 | Provider key-pose / reference candidate | Can improve art quality or pose diversity. | Provider output never bypasses local QA; no provider integration verified claim. |
| Reject-only | Whole-image transform / simplified SVG placeholder | Regression comparison and negative evidence. | Cannot be accepted as target user experience. |

## Stage Split

| Stage | Product Purpose | Status |
| --- | --- | --- |
| V31.0 | Scope, docs, drawio, claim boundary. | passed scoped |
| V31.1 | Define high-quality art rubric and reject placeholder assets. | passed scoped |
| V31.2 | Define and validate flagship 2D action asset production route. | passed scoped for one named local asset |
| V31.3 | Build visual review and action asset acceptance report requirements. | passed scoped |
| V31.4 | Define reusable layered rig / professional animation route. | passed scoped as route contract |
| V31.5 | Define arbitrary-cat photo-to-character-to-action workflow. | candidate-only scoped |
| V31.6 | Define true end-to-end evidence requirements with real samples. | partial scoped |
| V31.7 | Final V31 gate: passed, partial, blocked, or failed with evidence. | partial scoped |
| V31.8 | Repeatable high-quality asset production plan and acceptance contract. | planned continuation |
| V31.9 | Layered rig / professional animation runtime evidence route. | planned continuation |
| V31.10 | Named real photo sample set design and intake acceptance. | planned continuation |
| V31.11 | Photo-to-action candidate preview/apply/rollback closure. | planned continuation |
| V31.12 | Real-data E2E acceptance for continuation scope. | planned continuation |
| V31.13 | V31 continuation final gate. | No-Go until V31.8-V31.12 evidence exists |

## Acceptance Boundary

V31 may only claim a capability after real evidence exists.

Allowed future claims if evidence passes:

```text
V31 high-quality flagship 2D action asset passed for the tested local asset pack.
```

```text
V31 arbitrary-cat photo-to-action workflow passed only for the named tested
sample set and route, with QA, visual review, preview, apply, rollback, and
claim/security scans.
```

Forbidden until separately proven:

- Petdex parity achieved；
- automatic photo-to-animation ready for arbitrary cats；
- provider integration verified；
- low-retry provider reliability；
- 3D ready；
- production signed release ready；
- Windows ready；
- cross-platform ready；
- MCP ready；
- Claude Code integration verified；
- OS-level Codex window binding ready；
- all Codex workflows verified。

## Non-goals

- Do not reuse or bundle Petdex assets without explicit license evidence.
- Do not accept simplified SVG placeholder cats as target visual quality.
- Do not accept whole-image transform as final animation.
- Do not call arbitrary-cat automation ready from one or two curated examples.
- Do not make provider output a trusted result without local QA.
- Do not treat documentation completion as runtime or asset-generation proof.
