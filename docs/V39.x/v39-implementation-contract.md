# V39 Implementation Contract

Date: 2026-06-27

## Contract Purpose

This document names the implementation entities that a later code phase must create. It prevents the V39 goal from being interpreted as another photo-card overlay or report-only stage.

## Required Contracts For Later Code

- `V39CharacterizedAssetContract`: source sample ID, sanitized image reference, cleaned silhouette reference, character style profile, identity traits, and no-card/no-label checks.
- `V39LayeredPartRig`: part records for head, body, ears, front paws, back paws, tail, eyes/expression, visibility status, pivot point, and action responsibility.
- `V39ActionFrameComposer`: eight action frame sequences, per-action part-motion plan, pose-change summary, and whole-image-transform rejection.
- `V39HumanPreferenceGate`: reviewer-facing criteria for lovable/usable desktop pet quality, not only technical renderability.
- `V39ProductPreviewApplyRollback`: preview state, target-only apply state, rollback state, failed-candidate block, and reason codes.

## Non-negotiable Rejections

- photo inside a decorative card as the final asset;
- visible test labels, decorative dots, or border motion as the main action evidence;
- cross-sample reuse of one cat asset;
- whole-image transform-only motion;
- passing without human visual evidence;
- passing Route B without real source-bound same-sample assets.
