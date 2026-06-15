# V10.15 Gallery Data Model and UX Spec

status: planned
date: 2026-06-05

## Goal

Define the built-in local pet gallery and safe pack management UX for V10.15.

## Data Model

```ts
type PetGallerySourceKind = "bundled" | "imported";
type PetGalleryQualityStatus = "premium" | "standard" | "fallback" | "invalid";

interface PetGalleryPack {
  packId: string;
  displayName: string;
  styleTags: string[];
  rendererKind: "sprite" | "css" | "gltf";
  sourceKind: PetGallerySourceKind;
  license: string;
  attribution: string;
  coreActionCoverage: Record<string, "animated" | "static" | "fallback" | "missing">;
  previewActionId: string;
  frameCount: number;
  fps: number | null;
  qualityStatus: PetGalleryQualityStatus;
  fallbackStatus: "available" | "missing" | "not_needed";
  canDelete: boolean;
}
```

Allowed `canDelete`:

- `true` only for user-imported packs in app-managed storage.
- `false` for bundled packs and fallback packs.

## Data Sources

Gallery combines:

- bundled premium packs from V10.13.
- existing bundled fallback packs.
- user-imported packs already accepted by local import validation.

Gallery must not expose:

- raw source path.
- full local path.
- raw provider payload.
- prompt text.
- token.
- Authorization.
- workspace path.
- config path.
- shell command.

## UX Requirements

Required gallery views:

- pack grid with visual thumbnail.
- style tag filter.
- active pack marker.
- fallback/default marker.
- action preview panel for all 8 core actions.
- metadata panel: rendererKind, coverage, frame count, fps, license,
  attribution, quality status, fallback status.

Required commands:

- preview action.
- activate for selected PetInstance.
- restore default work-cat.
- delete user-imported pack.

## State Flow

Preview flow:

```text
select pack -> choose action -> isolated preview renderer -> no live state mutation
```

Activation flow:

```text
select pack -> validate pack availability -> activate for selected PetInstance
-> target updates -> default/unrelated pets unchanged
```

Delete flow:

```text
select imported pack -> confirm delete -> if active, restore visible fallback first
-> remove imported pack -> show sanitized result
```

## Stable Reason Codes

- `gallery_pack_not_found`
- `gallery_pack_invalid`
- `gallery_pack_not_deletable`
- `gallery_activation_failed`
- `gallery_preview_failed`
- `gallery_restore_failed`
- `gallery_delete_failed`
- `gallery_fallback_applied`

## Acceptance

- preview all 8 actions for bundled and imported safe packs.
- preview does not call `notify`.
- preview does not write `CatStateMachine`.
- activation affects only target PetInstance.
- restore default activates bundled default work-cat.
- deleting an active imported pack leaves a visible fallback.
- bundled packs cannot be deleted.

## Evidence Requirements

- gallery screenshot.
- preview screenshot.
- activation screenshot.
- restore default screenshot.
- delete user-imported pack screenshot.
- safe renderer input snapshot.
- security and claim scan.

