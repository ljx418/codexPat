# V8.x Evidence Index

status: complete
date: 2026-06-03

## Phase Evidence Map

| Phase | Evidence |
| --- | --- |
| V8.0 | `docs/V8.x/evidence/v8_0-scope-freeze-YYYY-MM-DD.md` (not written - merged into final report) |
| V8.1 | `docs/V8.x/evidence/v8_1-provider-consent-credential-smoke-2026-06-02.md` ✅ |
| V8.2 | `docs/V8.x/evidence/v8_2-named-provider-3d-output-smoke-2026-06-02.md` ✅ |
| V8.2 | `docs/V8.x/evidence/v8_2-provider-consent-dryrun-2026-06-02.md` ✅ |
| V8.3 | `docs/V8.x/evidence/v8_3-gltf-normalization-smoke-2026-06-02.md` ✅ (updated with real GLB rerun) |
| V8.4 | `docs/V8.x/evidence/v8_4-runtime-3d-visual-qa-2026-06-02.md` ✅ (updated with capture infra) |
| V8.5 | `docs/V8.x/evidence/v8_5-guided-ux-smoke-2026-06-02.md` ✅ |
| V8.6 | `docs/V8.x/evidence/v8_6-operational-hardening-smoke-2026-06-02.md` ✅ |
| V8.8 | `docs/V8.x/evidence/v8_8-3d-rendering-quality-smoke-2026-06-03.md` ✅ |
| V8.9 | `docs/V8.x/evidence/v8_9-animated-sprite-assembler-smoke-2026-06-03.md` ✅ |
| V8.10 | `docs/V8.x/evidence/v8_10-ai-animated-sprite-prompt-smoke-2026-06-03.md` ✅ |
| V8.11 | `docs/V8.x/evidence/v8_11-animated-sprite-visual-qa-2026-06-03.md` ✅ |

## Final Reports

- `docs/V8.x/v8_0-final-acceptance-report.md` ✅ accepted
- `docs/V8.x/v8_1-final-acceptance-report.md` ✅ accepted
- `docs/V8.x/v8_2-final-acceptance-report.md` ✅ accepted
- `docs/V8.x/v8_3-final-acceptance-report.md` ✅ accepted (was partial-accepted)
- `docs/V8.x/v8_4-final-acceptance-report.md` ✅ accepted (was partial-accepted)
- `docs/V8.x/v8_5-final-acceptance-report.md` ✅ accepted
- `docs/V8.x/v8_6-final-acceptance-report.md` ✅ accepted
- `docs/V8.x/v8_7-final-acceptance-report.md` ✅ accepted
- `docs/V8.x/v8_8-final-acceptance-report.md` ✅ accepted (2026-06-03)
- `docs/V8.x/v8_9-final-acceptance-report.md` ✅ accepted
- `docs/V8.x/v8_10-final-acceptance-report.md` ✅ accepted
- `docs/V8.x/v8_11-final-acceptance-report.md` ✅ accepted

## Blocked Reports

- `docs/V8.x/v8_2-blocked-2026-06-02.md` — superseded by v8_2-final-acceptance-report.md (network issue resolved via proxy)
- `docs/V8.x/v8_4-blocked-2026-06-02.md` — superseded by v8_4-final-acceptance-report.md (canvas capture infrastructure implemented)

## Baseline Evidence

- `docs/V7.15/v7_15-final-acceptance-report.md`
- `docs/V7.14/v7_14-final-acceptance-report.md`
- `docs/V7.13/v7_13-final-acceptance-report.md`
- `docs/V7.x/v7_x-evidence-index.md`

## Evidence Rule

V8 evidence must state whether the provider 3D branch is passed, blocked, or
excluded. Missing provider 3D output must not be replaced by fixture GLB evidence.

V8.9-V8.11 animated sprite evidence must state whether the path is local
assembly, prompt-only, or explicit-consent provider-backed. Local assembly and
prompt-only evidence must not be used for AI generation/provider claims.

## Final V8.x Claim

```
V8 provider-backed photo-to-3D productization passed for tested named
Tripo3D/local explicit-consent scenario.
```

See `v8_7-final-acceptance-report.md` for full claim scope and exclusions.
