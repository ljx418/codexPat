# V19 Pre-implementation Readiness Review

日期：2026-06-12  
状态：ready for phase-by-phase implementation；V19.6 final gate remains No-Go。

## 1. Review Conclusion

当前 V19 文档已经可以完整支撑本阶段的分阶段开发、验收和证据闭环。

文档支持：

- V19.0 scope freeze and resource boundary。
- V19.1 motion sheet validator。
- V19.2 provider single motion sheet / blocked decision。
- V19.3 crop / normalize / pack。
- V19.4 motion amplitude and same-cat QA。
- V19.5 Manager preview / target apply / rollback。
- V19.6 final gate after V19.0-V19.5 evidence exists。

文档不支持：

- 直接启动 V19.6。
- 直接声明 Petdex parity achieved。
- 复用或内置 Petdex 社区资产。
- 把 local import evidence 当成 provider generation passed。
- 把 V18 transform-derived assets 当成 V19 high-amplitude motion-sheet evidence。

## 2. PRD Coverage

V19 PRD 的核心体验是：

```text
用户输入猫图或导入动作表
  -> consent/license boundary
  -> provider single motion sheet or local sheet import
  -> crop/normalize/pack
  -> motion amplitude + same-cat QA
  -> preview
  -> target apply
  -> rollback
```

覆盖状态：

| PRD Requirement | Supporting Docs | Status |
| --- | --- | --- |
| 用户可输入猫图或导入 motion sheet | PRD, target architecture, implementation contract | covered |
| provider 单 sheet 避免 per-action 漂移 | PRD, target architecture, detailed plan | covered |
| Petdex-style 动作表裁切 | format/QA spec, implementation contract | covered |
| 高动作幅度 QA | format/QA spec, acceptance plan | covered |
| 同猫一致性 QA | target architecture, format/QA spec | covered |
| Manager 预览 | target architecture, acceptance plan | covered |
| target-only apply / rollback | target architecture, implementation contract | covered |
| license-safe Petdex boundary | Petdex resource boundary, claim matrix | covered |

## 3. Target Architecture Coverage

Target architecture is sufficient for the V19 scope:

```text
Photo / Motion Sheet Input
  -> ConsentLicenseGate
  -> MotionSheetProviderAdapter or LocalMotionSheetImport
  -> MotionSheetValidator
  -> SheetCropNormalizer
  -> SafeAnimationPackAssembler
  -> MotionAmplitudeQA
  -> SameCatContinuityQA
  -> IsolatedManagerPreview
  -> TargetApplyRollbackController
  -> Runtime Renderer
```

No architecture gap remains for V19. The remaining risks are implementation risks:

- provider output quality may be insufficient.
- motion amplitude threshold may need calibration.
- Petdex assets remain unusable unless license evidence is obtained.

## 4. Remaining Development Outline

### V19.0 Scope Freeze

Goal:

- Produce phase evidence that V19 docs, claim boundaries, Petdex boundary, and drawio are synchronized.

Acceptance:

- V19 docs exist.
- active docs point to V19 planned.
- drawio XML parses.
- forbidden claims appear only in forbidden/not-ready/not-implied contexts.

### V19.1 Motion Sheet Format

Goal:

- Implement motion sheet schema, validator, safe local import, stable reasonCodes.

Acceptance:

- valid local sheet accepted.
- valid project 8-core-action sheet accepted.
- rejected fixture matrix returns stable reasonCodes.
- previous active pack preserved after invalid activation.
- existing V5/V18 pack import tests remain green.

### V19.2 Provider Single-sheet Generation

Goal:

- Attempt a single same-cat motion sheet provider path.

Acceptance:

- real provider sheet accepted, or branch explicitly blocked.
- no independent per-action provider images used as final evidence.
- no raw provider payload, token, Authorization, full path, raw photo bytes in evidence.

### V19.3 Crop / Normalize / Pack

Goal:

- Crop sheet into safe 8-action frame sequences and package into app-managed pack.

Acceptance:

- all 8 core actions have frames.
- malformed grid, missing row, transparent row, corrupt image rejected.
- invalid activation preserves previous active pack.

### V19.4 Motion Amplitude and Same-cat QA

Goal:

- Ensure generated/imported sheet is visibly more animated than V18 transform baseline.

Acceptance:

- at least 6/8 actions pass amplitude.
- running, success, error, need_input pass amplitude.
- same-cat visual review passes.
- no blank/transparent/off-canvas frames.
- QA failed pack cannot apply.

### V19.5 Manager Preview / Apply / Rollback

Goal:

- Make the result usable from the Desktop Manager.

Acceptance:

- per-action animation preview works.
- preview sends zero PetEvent and does not write CatStateMachine.
- apply affects only target PetInstance.
- rollback restores previous active pack.
- default/unrelated pets unchanged.

### V19.6 Final Gate

Goal:

- Produce screenshot-backed final report with the narrowest evidence-matched claim.

Acceptance:

- V19.0-V19.5 evidence exists.
- final HTML embeds contact sheet and runtime/preview screenshots.
- regression/security/license/claim scans pass.

## 5. Go / No-Go

| Phase | Decision |
| --- | --- |
| V19.0 | Go |
| V19.1 | Go after V19.0 evidence |
| V19.2 | Conditional Go; provider branch may be blocked |
| V19.3 | Go after accepted sheet or blocked provider with local import path |
| V19.4 | Go after pack assembly |
| V19.5 | Go after QA-passed pack exists |
| V19.6 | No-Go until V19.0-V19.5 evidence exists |

## 6. Audit Opinion

V19 documentation is now implementation-ready. It is sufficiently specific on:

- product goal.
- target architecture.
- action sheet format.
- reasonCodes.
- QA metrics.
- preview/apply safety.
- claim boundaries.
- evidence requirements.

No additional documentation blocker remains before V19.0 implementation.
