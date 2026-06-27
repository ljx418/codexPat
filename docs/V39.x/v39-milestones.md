# V39 Milestones

Date: 2026-06-27

## Milestone Summary

| Milestone | Target | Exit Signal |
| --- | --- | --- |
| M0 Documentation readiness | V39 scope, docs, drawio, and scans are aligned | `docs/V39.x/evidence/v39_0-documentation-readiness-2026-06-27.md`; passed scoped for documentation readiness only |
| M1 Visual target freeze | Human-readable quality rubric rejects V38-style overlays | `docs/V39.x/evidence/v39_1-target-experience-rubric-2026-06-27.md`; passed scoped |
| M2 Character contract | Source sample maps to cleaned character asset | `docs/V39.x/evidence/v39_2-characterized-asset-contract-2026-06-27.md`; passed scoped |
| M3 Part rig contract | Visible parts have explicit responsibilities | `docs/V39.x/evidence/v39_3-layered-part-rig-2026-06-27.md`; passed scoped |
| M4 Action composer | Eight actions use part motion and pose changes | `docs/V39.x/evidence/v39_4-action-frame-composer-2026-06-27.md`; passed scoped |
| M5 Product path | Preview, target-only apply, rollback, blocked path | `docs/V39.x/evidence/v39_5-product-preview-apply-rollback-2026-06-27.md`; passed scoped |
| M6 Visual report | Chinese HTML visual report | `docs/V39.x/evidence/v39_6-visual-report-2026-06-27.html`; passed scoped |
| M7 Route comparison | Route B recorded honestly | `docs/V39.x/evidence/v39_7-route-b-comparison-2026-06-27.md`; passed scoped with Route B blocked |
| M8 Final gate | Scoped decision with scans and residual risks | `docs/V39.x/v39-final-acceptance-report.md`; passed scoped |

Final scoped pass covers tested public-photo samples only. It does not prove arbitrary user-photo automation, provider integration, Route B execution, production readiness, Windows readiness, cross-platform readiness, 3D, or Petdex parity.

## Risk Burn-down

- R1: output still looks like a test card. Closed only by character gate and human preference gate.
- R2: source identity drifts. Closed only by source-bound identity traits and cross-sample reuse checks.
- R3: motion remains stiff. Closed only by part-local motion and per-action pose requirements.
- R4: Route B is unavailable. Closed only by recording Route B as blocked; no false pass.
- R5: product path is cosmetic only. Closed only by target-only apply and rollback evidence.
- R6: evidence overclaims. Closed only by claim/security scan and narrow final decision.
