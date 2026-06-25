# Post-V30 Frontend Architecture Slice Specs

文档状态：active slice spec；planning only before code movement。
当前日期：2026-06-23。

## Purpose

This document makes Post-V30.3 executable. It defines frontend code-debt slices
for `apps/desktop/src/main.ts` before any extraction or refactor begins.

It does not approve code movement by itself and does not claim runtime desktop,
provider integration, Petdex parity, arbitrary-cat automatic animation, 3D,
Windows, cross-platform, or production release readiness.

## Current Hotspot

`apps/desktop/src/main.ts` is a large frontend module that combines:

- Tauri command wrappers and bridge-facing view state；
- settings and diagnostics UI；
- asset pack management；
- photo-to-2D wizard state；
- gallery, preview, favorites, target apply / rollback flows；
- runtime renderer and pet interaction state。

The immediate risk is not a known product defect. The risk is that future
feature work can accidentally couple UI state, asset workflow state, and
runtime bridge behavior in one review surface.

## Slice Order

| Slice | Scope | First Allowed Outcome | Required Tests |
| --- | --- | --- | --- |
| FE-1 command boundary | extract typed Tauri command wrappers and response types | no UI behavior change | `pnpm --filter desktop check`; targeted existing tests touching command wrapper consumers |
| FE-2 runtime state boundary | isolate pet instance, renderer, visibility, diagnostics view state | no bridge route or payload change | `pnpm --filter desktop test`; runtime smoke rerun if behavior changes |
| FE-3 asset manager boundary | isolate bundled/personalized pack list, favorite, rename, delete, activate/deactivate view models | no asset format or claim change | desktop tests plus V30 semantic gate if action-pack logic is touched |
| FE-4 photo wizard boundary | isolate photo intake, provider disclosure, prompt pack, and safe snapshot presentation | no provider-ready claim | privacy/security scan plus existing photo workflow tests |
| FE-5 preview/gallery boundary | isolate gallery filters, isolated preview, apply/rollback controls | no Petdex parity claim | desktop tests plus relevant preview/gate smoke where available |

## Slice Entry Requirements

Before implementing any slice:

- Create an evidence file from
  `docs/V30.x/evidence/post-v30_3-architecture-slice-TEMPLATE.md`.
- Name the slice id, target files, public interface changes, and out-of-scope
  files.
- Record before-tests and expected after-tests.
- Confirm that the slice does not expand `docs/active/agent_desktop_pet_prd_v30.md`.

## Slice Exit Requirements

Each frontend slice may pass only when:

- the implemented diff matches the slice evidence；
- `pnpm --filter desktop check` passes；
- `pnpm --filter desktop test` passes or has a stable blocked reason；
- V30 semantic animation gate is rerun if action pack, renderer action, or
  preview quality logic changed；
- PRD/spec review, claim scan, and security scan are recorded。

## Out Of Scope

- moving Rust bridge behavior；
- changing local HTTP route contracts；
- adding provider integrations；
- changing asset-generation claims；
- shipping production installers；
- claiming Windows or cross-platform readiness。
