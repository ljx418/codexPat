# V30 Current Gap Analysis

文档状态：planned gap analysis。
当前日期：2026-06-17。

## Current Active Gap

The current project can generate and play multi-frame 2D assets, but recent visual review found that the frames often behave like transformed stickers instead of semantic character animation.

## Gap Table

| Area | Current | V30 Target |
| --- | --- | --- |
| Action concept | whole-image scale / translate / rotate can pass technical checks | action semantics with storyboard and key poses |
| Running | image slides or bounces | clear locomotion / forward energy |
| Success | image jumps / scales | anticipation, celebration, recovery |
| Error | shake / twist | collapse, imbalance, confusion, or dizzy motion |
| Need input | symbol overlay | cat looks at user / raises paw / waits |
| Sleeping | sitting pose sinks | lying or curled sleep with calm breathing |
| QA | nonblank, frame delta, loop closure | semantic readability, key-pose diversity, transform-only rejection |
| Evidence | contact sheet can show frames | contact sheet + animated playback + old-vs-new comparison + manual rubric |

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
V30.0: Go after document review.
V30.1-V30.5: Conditional Go after previous evidence.
V30.6: No-Go until V30.0-V30.5 evidence exists.
```
