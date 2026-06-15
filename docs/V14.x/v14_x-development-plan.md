# V14 Development Plan: Premium Pet Gallery & Stable Animated Asset Experience

日期：2026-06-09  
状态：passed scoped with runtime evidence。  

## Scope

V14 owns the user-facing pet product experience gap after V13:

```text
beta-ready local app
  -> premium default animated cat
  -> stable multi-frame animation assets
  -> local pet gallery
  -> browse / filter / favorite / preview
  -> one-click switching
  -> AI asset guide boundary
```

V14 does not reopen Codex monitoring, MCP, third-party integration, OS-level binding, production signing, notarization, auto-update, Windows, cross-platform, remote marketplace, or broad provider/photo-to-3D readiness.

## Phase Plan

| Phase | Development Goal | Required Output |
| --- | --- | --- |
| V14.0 Scope Freeze | Freeze PRD, target architecture, claims, evidence names, and drawio. | `v14_0-scope-freeze` evidence |
| V14.1 Flagship Cat Refresh | Build `flagship-work-cat-v2` with core and living actions. | visual QA evidence |
| V14.2 Animation Stability | Implement linter and playback stability safeguards. | linter smoke evidence |
| V14.3 Gallery / Favorites | Implement local gallery, filters, and favorite persistence. | gallery smoke evidence |
| V14.4 Preview / Switching | Implement isolated preview and one-click target activation. | switching smoke evidence |
| V14.5 AI Asset Boundary | Implement ordinary-user AI asset guide and consent/validation boundaries. | AI boundary smoke evidence |
| V14.6 Final Gate | Produce screenshot-backed final HTML and scans. | final report + HTML |

## Development Rules

1. Each subphase must have a PRD/spec review before implementation.
2. Each subphase must produce passed / blocked / failed evidence.
3. V14.6 cannot start until V14.1-V14.5 have explicit evidence status.
4. If visual QA finds blank, transparent, off-canvas, flicker, or loop-open issues, fix the current phase before advancing.
5. Preview must never mutate live PetInstance state.
6. One-click activation must affect only the selected target instance.
7. AI guidance must not imply automatic photo-to-3D or provider readiness.

## Regression Baseline

Minimum regression before V14.6:

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl check
pnpm --filter @agent-desktop-pet/petctl test
node scripts/v13_7_beta_readiness_gate_smoke.mjs
node scripts/v12_7_final_desktop_visibility_gate_smoke.mjs
node scripts/v11_7_interaction_qa_gate_smoke.mjs
node scripts/v10_16_benchmark_surpass_gate_smoke.mjs
```

## Final Decision Rule

V14 passes only if the premium default cat, animation stability linter, gallery/favorite UX, preview/one-click switching, AI asset guide boundary, visual QA, security scan, claim scan, license scan, and final HTML evidence all pass.
