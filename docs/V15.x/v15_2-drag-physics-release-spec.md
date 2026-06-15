# V15.2 Drag Physics and Release Spec

日期：2026-06-09  
状态：planned。  

## Goal

Make dragging feel like moving a living pet, not dragging an image.

## Interaction States

```text
pointer_down_on_pet
  -> drag_grabbed
  -> dragging
  -> drag_release
  -> drag_land
  -> drag_settle
  -> previous allowed base state
```

## Requirements

- disable native image drag and selection inside the pet surface.
- drag uses safe pointer deltas only.
- position updates are clamped to safe monitor bounds.
- final position persists.
- release animation plays before returning to base state.
- dragging one PetInstance does not affect default or unrelated pets.

## Hard Failures

- dragged-out image or bitmap appears.
- browser/native ghost image appears.
- cat disappears or becomes transparent.
- final position is not persisted.
- evidence records raw pointer trace or screen text.

## Evidence

- before/dragging/release/after desktop screenshots or capture.
- position persistence check.
- no ghost image visual check.
- target isolation check.
