# V30 Current Gap Analysis

文档状态：scoped passed gap analysis；retained as V30 baseline-to-target record and drawio source。
当前日期：2026-06-24。

配套 drawio gap 文档：`docs/V30.x/v30-target-state.drawio`。

## Current Active Gap

The current project can generate and play multi-frame 2D assets, but recent visual review found that the frames often behave like transformed stickers instead of semantic character animation.

V30 closed this gap for tested local action packs by rejecting transform-only
weak assets and accepting semantic candidates. Provider-backed arbitrary-cat
automation remains outside this pass.

## Gap Table

| Area | Current | V30 Target |
| --- | --- | --- |
| Action concept | whole-image scale / translate / rotate can pass technical checks | action semantics with storyboard and key poses |
| Technical route | whole-image transform can be mistaken as an animation route | manual high-quality import for short-term proof, local 2D part rig as medium-term route, provider key-pose candidate as long-term input, whole-image transform as reject-only baseline |
| Running | image slides or bounces | clear locomotion / forward energy |
| Success | image jumps / scales | anticipation, celebration, recovery |
| Error | shake / twist | collapse, imbalance, confusion, or dizzy motion |
| Need input | symbol overlay | cat looks at user / raises paw / waits |
| Sleeping | sitting pose sinks | lying or curled sleep with calm breathing |
| QA | nonblank, frame delta, loop closure | semantic readability, key-pose diversity, transform-only rejection |
| Evidence | contact sheet can show frames | contact sheet + animated playback + old-vs-new comparison + manual rubric |

## Architecture Relationship Detail

| Current Architecture | Problem | Target Architecture | Completion Signal |
| --- | --- | --- | --- |
| Source image or action sheet enters pipeline directly. | 动作含义不明确，容易把动效当动作。 | Action semantics spec and storyboard run before acceptance. | 8 actions have semantic intent and key poses. |
| Whole-image transform creates motion. | scale/translate/rotate 可以骗过基础检查。 | Motion readability QA detects transform-only weakness. | weak baseline rejected with reason codes. |
| Whole-image transform treated as production route. | 动作容易僵硬，用户看到贴纸感。 | Route priority: manual frame import, local 2D part rig, provider candidate, weak baseline reject-only. | accepted candidates come from real frames, part motion, or candidate key poses that pass QA. |
| Frame delta and loop checks are treated as quality proof. | 有变化不等于动作可读。 | Semantic checklist, pose diversity, center-of-mass, silhouette, same-cat checks. | semantic candidate accepted only with readable actions. |
| Preview is mostly visual output. | 审核者难以知道为什么通过/失败。 | Preview embeds storyboard, contact sheet, animated playback, old-vs-new, QA table. | one HTML report explains the decision. |
| Apply path can be mistaken as asset approval. | QA 失败资产可能被误用。 | Approved-only target apply and rollback. | failed pack blocked; target-only apply and rollback pass. |

## Drawio Coverage Requirements

The V30 drawio must stay under eight pages and show, in Chinese:

- target user experience and scoped claim boundary；
- current architecture to target architecture relationship；
- detailed target architecture components and responsibilities；
- development and acceptance plan with user-visible outcomes；
- acceptance gates mapped to user-visible functions and target experience；
- milestones and exit conditions。

## Key Risk

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Provider produces pretty stills but weak animation | High | reject by motion readability QA |
| Local rig looks mechanical | High | manual visual rubric and Petdex-style benchmark |
| Frame delta passes but action is unreadable | High | semantic checklist per action |
| User expects Petdex parity | Medium | scoped claim; Petdex is reference only |
| Existing V16/V29 weak packs are mistaken as passed | High | mark as baseline comparison only |

## Go / No-Go

```text
V30.0: passed scoped.
V30.1-V30.5: passed scoped after previous evidence.
V30.6: passed scoped for tested local action packs.
```
