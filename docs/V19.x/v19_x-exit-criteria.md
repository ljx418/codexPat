# V19 Exit Criteria

日期：2026-06-12  
状态：planned gate。

## Required To Pass V19.6

- V19.0-V19.5 have evidence with status passed/blocked/failed.
- At least one accepted high-amplitude 8-action motion sheet is shown in evidence.
- All 8 core actions are visible and previewable.
- Motion amplitude is visibly stronger than V18 transform baseline.
- Same-cat continuity review passes.
- No blank, fully transparent, or off-canvas frame.
- Loop/base actions close first/final frame or document transient behavior.
- Manager preview sends zero PetEvent and does not mutate live state.
- Apply affects only target PetInstance.
- Rollback restores previous active pack.
- Security scan passes.
- Claim scan passes.
- License boundary scan passes.
- Final HTML embeds contact sheet and runtime/preview screenshots.

## Required To Block V19.6

V19.6 must be blocked if:

- Provider sheet generation is required but no provider output exists.
- Motion sheet import/crop cannot produce 8 actions.
- QA detects transparent/off-canvas/blank output and fallback is not visible.
- Same-cat continuity is visibly failed.
- Evidence leaks token, Authorization, raw provider payload, full local path, raw photo bytes, or private prompt text.
- Claim scan finds forbidden claim used as ready.

## Non-goals

Passing V19 does not imply Petdex parity, Petdex asset license clearance, 3D readiness, provider integration readiness, production release readiness, Windows readiness, or cross-platform readiness.
