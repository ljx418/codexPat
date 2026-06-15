# V21 Development Plan

文档状态：scoped accepted development plan。  
当前日期：2026-06-14。

## Scope

V21 是多路线动画资产恢复阶段。目标不是继续要求 MiniMax 直接输出完美 8x9 sheet，而是并行验证四条路线，并从真实效果中选择最可产品化路径。

V21.0-V21.7 已在 2026-06-14 完成 scoped acceptance。Route A 是最终选择的测试路线；Route C 作为本地 rig fallback/comparison 路线通过；Route B 只代表 capability review；Route D excluded。

## Phases

### V21.0 Scope Freeze & Route Matrix

Deliverables:

- freeze V20 blocked baseline；
- freeze four routes and allowed/forbidden claims；
- confirm three local cat photos are available as samples；
- sync active docs and drawio。

Evidence:

- `docs/V21.x/evidence/v21_0-scope-freeze-YYYY-MM-DD.md`
- accepted evidence: `docs/V21.x/evidence/v21_0-scope-freeze-2026-06-14.md`

V21.0 must follow:

- `docs/V21.x/v21_0-scope-freeze-spec.md`

### V21.1 Route A: Provider Key-pose to Local Animation Pack

Build:

- key-pose extraction from V20 provider outputs or new consented outputs；
- crop/alignment/stabilization；
- action mapping to 8 core actions；
- local frame interpolation or pose reuse；
- app-managed pack assembly。

Stop if:

- fewer than 8 actions can be mapped；
- same-cat or background QA fails；
- frame continuity cannot pass without hiding defects。

Evidence:

- `docs/V21.x/evidence/v21_1-route-a-keypose-pack-smoke-YYYY-MM-DD.md`
- accepted evidence: `docs/V21.x/evidence/v21_1-route-a-keypose-pack-smoke-2026-06-14.md`

### V21.2 Route B: Alternate Provider Capability Preflight

Build:

- provider capability matrix for reference-image, image editing, sprite sheet, video, alpha/background control；
- optional live smoke only with explicit consent, credentials, cost/privacy/retention/license boundary。

Stop if:

- provider lacks reference image or usable output mode；
- credentials or consent missing；
- output cannot be safely stored and validated。

Evidence:

- `docs/V21.x/evidence/v21_2-route-b-provider-preflight-YYYY-MM-DD.md`
- accepted evidence: `docs/V21.x/evidence/v21_2-route-b-provider-preflight-2026-06-14.md`

### V21.3 Route C: Unified Character + Local 2D Rig

Build:

- canonical cat identity selection/generation；
- local segmentation/layer plan；
- anchor points and action templates；
- frame renderer for 8 core actions；
- continuity and same-cat QA。

Stop if:

- output is too static；
- visible deformation is unacceptable；
- transparent/off-canvas/loop checks fail。

Evidence:

- `docs/V21.x/evidence/v21_3-route-c-local-rig-smoke-YYYY-MM-DD.md`
- accepted evidence: `docs/V21.x/evidence/v21_3-route-c-local-rig-smoke-2026-06-14.md`

### V21.4 Route D: Image-to-video to Frames

Build:

- video provider/preflight or local accepted video fixture path；
- frame extraction；
- stabilization；
- background handling；
- loop selection and action mapping。

Stop if:

- no video source is available；
- background removal or stabilization fails；
- extracted frames cannot pass action QA。

Evidence:

- `docs/V21.x/evidence/v21_4-route-d-video-frame-smoke-YYYY-MM-DD.md`
- accepted evidence: `docs/V21.x/evidence/v21_4-route-d-video-frame-smoke-2026-06-14.md`

### V21.5 Fusion Comparator

Build:

- common QA comparator；
- side-by-side contact sheets；
- route status dashboard；
- human-readable recommendation；
- HTML report with embedded images。

Evidence:

- `docs/V21.x/evidence/v21_5-route-comparator-report-YYYY-MM-DD.html`
- accepted evidence: `docs/V21.x/evidence/v21_5-route-comparator-report-2026-06-14.html`

### V21.6 Best Route Productization Spike

Build:

- select best passed route；
- integrate into Manager preview；
- target-only apply；
- rollback；
- safe diagnostics。

Evidence:

- `docs/V21.x/evidence/v21_6-best-route-preview-apply-rollback-YYYY-MM-DD.md`
- accepted evidence: `docs/V21.x/evidence/v21_6-best-route-preview-apply-rollback-2026-06-14.md`

### V21.7 Final Gate

Final gate was executed after V21.0-V21.6 had explicit passed / excluded evidence.

Evidence:

- `docs/V21.x/v21_7-final-acceptance-report.md`
- accepted dashboard: `docs/V21.x/evidence/v21_7-final-acceptance-dashboard-2026-06-14.html`

## Minimum Regression

- `pnpm --filter desktop check`
- `pnpm --filter @agent-desktop-pet/petctl test`
- V19 local motion-sheet smoke remains fallback regression if script exists
- V20 provider benchmark evidence remains input, not V21 pass evidence

## No-go

Do not broaden V21 passed beyond the tested Route A / Route C evidence.

Historical gate rule now satisfied: V21.5 started after Route A/C outputs existed; V21.6 started after Route A passed QA; V21.7 started after V21.0-V21.6 all had evidence.

## Supporting Detailed Specs

- `docs/V21.x/v21_1-route-a-keypose-pack-spec.md`
- `docs/V21.x/v21_2-route-b-provider-preflight-spec.md`
- `docs/V21.x/v21_3-route-c-local-rig-spec.md`
- `docs/V21.x/v21_4-route-d-video-frame-spec.md`
- `docs/V21.x/v21_5-route-comparator-and-manager-ux-spec.md`
- `docs/V21.x/v21_x-detailed-development-and-acceptance-plan.md`
