# V21.4 Route D Image-to-video Frame Extraction Spec

文档状态：planned route spec。  
当前日期：2026-06-14。

## Goal

Route D 验证 image-to-video 或动作视频是否能提供比静态多帧更自然的动作，再由本地系统抽帧、稳定、去背景、裁切和打包。

## Accepted Sources

- explicit-consent image-to-video provider output；
- local app-managed video fixture with license/attribution evidence；
- generated test video created by project-owned tooling。

Forbidden sources:

- unlicensed third-party video；
- screen recording containing private terminal/screen text；
- raw provider response；
- remote URL playback；
- full local path in evidence。

## Processing Pipeline

```text
video source
  -> safe metadata scan
  -> frame extraction
  -> subject stabilization
  -> background/alpha gate
  -> action segment selection
  -> loop closure / frame delta QA
  -> frameSequence pack
  -> common V21 QA
```

## Stable ReasonCodes

- video_source_missing
- video_provider_not_available
- video_license_missing
- frame_extraction_failed
- stabilization_failed
- background_not_safe
- action_segment_missing
- loop_closure_failed
- motion_amplitude_too_low
- qa_failed
- route_d_excluded
- route_d_passed

## Acceptance

Route D passes only if:

- all 8 actions are represented or explicitly mapped from accepted video segments；
- extracted frames are stable, background-safe, and not off-canvas；
- motion amplitude is visibly useful；
- loop/transient behavior passes QA；
- preview/apply/rollback path remains safe。

If no safe video provider or fixture exists, Route D must be marked blocked or excluded, not silently skipped.

## Evidence

Evidence file:

`docs/V21.x/evidence/v21_4-route-d-video-frame-smoke-YYYY-MM-DD.md`

Must include:

- safe video source summary；
- extraction settings；
- segment/action mapping；
- QA table；
- contact sheet or preview capture；
- security scan；
- claim scan。
