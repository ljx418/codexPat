# V14.2 Animation Stability Linter Smoke Evidence

status: passed
date: 2026-06-09

## Scope

This evidence validates the local metadata/safety linter path for animated
sprite assets. It blocks unsafe and explicitly marked unstable fixtures before
activation. Pixel-level screenshot/canvas QA remains part of V14.6 and is not
claimed here.

## Fixture Results

| fixture | result | reasonCode |
| --- | --- | --- |
| valid | passed | accepted |
| loopOpen | rejected | loop_open |
| transparent | rejected | transparent_frame |
| offCanvas | rejected | off_canvas_frame |
| sizeMismatch | rejected | size_mismatch |
| forbidden | rejected | asset_manifest_forbidden_content |

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| valid animated sprite lint | passed | valid local sprite manifest accepted |
| loop-open fixture rejected | passed | loop-open fixture returns loop_open |
| transparent fixture rejected | passed | transparent frame fixture returns transparent_frame |
| off-canvas fixture rejected | passed | off-canvas fixture returns off_canvas_frame |
| size mismatch fixture rejected | passed | frame size mismatch fixture returns size_mismatch |
| forbidden fixture rejected | passed | forbidden content fixture fails import manifest validation |
| previous active preservation | passed | invalid candidate preserves previous active pack in existing adapter test baseline |
| safe output field list | passed | lint output is sanitized and field-scoped |
| redaction scan | passed | lint output contains no token, Authorization, raw payload, full local path, workspace path, or config path |
| claim scan | passed | V14.2 claims local linter/stability metadata only; pixel-level visual QA remains V14.6 |

## Allowed Claim

V14.2 stable multi-frame animation asset linting and playback safeguard metadata checks passed for tested local sprite scenarios.

## Final Decision

V14.2 passed. V14.3/V14.4 may proceed after phase-specific review.
