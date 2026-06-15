# V19 Current Gap Analysis

日期：2026-06-12  
状态：planned；V18 passed scoped 是输入基线。

## Current Baseline

V18 已证明：

```text
local cat photo
  -> provider reference-image job
  -> canonical identity image
  -> identity-locked local 8-action derived pack
  -> QA
  -> preview/apply/rollback
```

这条链路解决了“同猫一致性”和“用户图进入生成链路”的问题，但仍没有解决“动作像真正动画”的产品体验问题。

## Gap Against Desired Experience

| Area | Current | Target | V19 Ownership |
| --- | --- | --- | --- |
| Motion source | One canonical image transformed locally | Single motion sheet with true per-frame poses | V19.2/V19.3 |
| Motion amplitude | Mean frame delta is low; many actions feel like subtle movement | Petdex-inspired high-amplitude visible actions | V19.4 |
| Same-cat consistency | Same canonical source hash prevents drift, but poses are artificial | One sheet / one job produces same cat across actions | V19.2/V19.4 |
| Import format | Existing pack import supports project formats | Petdex-compatible 8-row sheet import and validation | V19.1 |
| Preview | V18 preview model exists | Preview sheet, cropped frames, animation playback, QA reasons | V19.5 |
| License boundary | No Petdex asset bundling | Petdex as reference only unless license evidence exists | V19.0 |

## Petdex-inspired Reference Metrics

Petdex public assets show a motion-sheet style product pattern: rows of actions, multiple frames per row, and visibly different poses. V19 uses that as a benchmark pattern, not as a content source.

Reference observations from public Petdex samples:

- Manifest contains thousands of pets and links to `pet.json`, spritesheet, and zip resources.
- README describes standard 8 rows x 9 columns with 192x208 frames.
- Sample frame deltas are materially higher than V18 transform-derived frame deltas.
- License metadata was not sufficient to bundle user-submitted assets in this project.

## V19 Target

V19 must close the gap with a license-safe, auditable motion-sheet workflow:

```text
photo / generated sheet / user-provided sheet
  -> safe motion sheet validator
  -> crop to 8 core actions
  -> high-amplitude QA
  -> same-cat continuity QA
  -> Manager preview
  -> target apply / rollback
```

## Current Go / No-Go

- V19.0 planning and evidence: Go.
- V19.1 safe format implementation: Go after V19.0.
- V19.2 provider sheet generation: Conditional Go; blocked if provider cannot return a usable same-cat motion sheet.
- V19.6 final gate: No-Go until V19.0-V19.5 evidence exists.
