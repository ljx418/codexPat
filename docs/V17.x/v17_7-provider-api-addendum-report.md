# V17.7 Provider API Addendum Report

Date: 2026-06-11
Status: passed scoped

## Scope

V17.7补齐 V17 阶段的 direct provider API 缺口，但只覆盖一个很窄的可验收路径：

```text
MiniMax text-to-image API
  -> one 4x2 action-sheet image
  -> V17 fixed-grid crop/package
  -> safe local frameSequence pack
```

这不是“上传本地猫照片给 provider 并自动生成任意猫动作资产”的完整能力。

## Evidence

- Provider API smoke: `docs/V17.x/evidence/v17_7-minimax-provider-api-action-sheet-2026-06-11.md`
- Provider output packaging: `docs/V17.x/evidence/v17_7-provider-output-packaging-2026-06-11.md`
- Generated provider output directory: `docs/V17.x/evidence/assets/v17_7-minimax-provider-api-action-sheet-2026-06-11`

## Result

| Check | Result |
| --- | --- |
| MiniMax credential present through `.env` without printing value | passed |
| explicit consent / terms env gates present | passed |
| real MiniMax provider API call returned image | passed |
| provider output dimensions recorded safely | passed |
| provider output entered V17 crop/package path | passed |
| 8 core action frameSequence pack generated | passed |
| security redaction scan | passed |
| raw provider response omitted from evidence | passed |

## Claim Boundary

Allowed:

```text
V17.7 MiniMax provider API action-sheet generation passed for the tested explicit-consent local scenario.
```

Still forbidden / not-ready:

- automatic photo-to-2D ready for arbitrary cats
- local cat photo upload to provider ready
- automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- production signed release ready
- cross-platform ready
- Windows ready

## Final V17 Statement

V17 now supports two scoped productized paths:

1. Local photo + local/host-generated 4x2 action-sheet import.
2. Tested MiniMax text-to-image provider API generation of one 4x2 action sheet, followed by the same local crop/package path.

The V17 provider addendum does not prove broad provider integration or arbitrary-cat photo upload.
