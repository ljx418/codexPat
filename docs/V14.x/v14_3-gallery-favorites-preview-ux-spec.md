# V14.3 / V14.4 Gallery, Favorites, Preview, and Switching UX Spec

日期：2026-06-09  
状态：planned。  

## Gallery Requirements

Desktop Manager must provide a Pet Gallery view with:

- at least 12 local curated packs.
- at least 8 animated 2D packs.
- bundled and imported pack sections.
- active pack indicator.
- favorite indicator.
- quality badge.
- renderer kind.
- coverage state.
- license / attribution summary.

## Filters

Supported filters:

- style
- color
- motion level
- renderer kind
- bundled / imported
- favorite only
- active only

## Favorites

- favorite/unfavorite stores only safe pack IDs.
- favorites persist after restart.
- favorite changes do not affect live PetInstance state.

## Preview

Preview must:

- use isolated preview renderer.
- preview all 8 core actions.
- preview V11 living actions where available.
- show current pack vs preview pack side-by-side.
- show sanitized reasonCode for fallback/missing/static actions.
- send zero PetEvent.
- not call notify.
- not write CatStateMachine.
- not activate, delete, or rollback packs.

## Switching

One-click switching must:

- apply selected pack to target PetInstance only.
- support default pet and selected Codex work-cat.
- preserve previous active pack on activation failure.
- support restore default work-cat.
- restore active pack mapping after restart.

## Delete

- bundled packs cannot be deleted.
- user-imported packs can be deleted after confirmation.
- deleting active imported pack must apply visible fallback first.
- deletion must not leak full local path.
