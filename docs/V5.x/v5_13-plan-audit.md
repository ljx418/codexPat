# V5.13 Photo-To-Asset Guided Workflow Plan Audit

status: passed-for-implementation / productization-gate-no-go

date: 2026-05-30

## Scope

V5.13 may start after V5.12 scoped acceptance.

It must add only a local guided prompt and import-instruction workflow for personalized cat assets.

It must not upload photos, call providers, generate 3D locally, activate imported packs automatically, or change V3/V4 Codex monitoring semantics.

## PRD Alignment

Aligned:

- V5.12 runtime imported pack rendering is accepted scoped.
- V5.13 is local guided prompt and import-instruction generation.
- Raw photos are not persisted by default.
- Generated assets still return to V5.11 import UI and V5.12 runtime validation.
- Productization Gate remains No-Go.

## Required Implementation

- Add a Desktop Manager guided asset prompt section.
- Accept user-entered cat name, user-approved visual notes, and renderer target.
- Generate standardized prompts for all core actions.
- Generate a manifest template and import checklist.
- Display safety notes explaining that the app does not upload photos or generate 3D locally in V5.13.
- Keep generated content in the current UI session only; no default persistence.
- Provide a clear/reset control that removes generated prompt text from the UI.

## Privacy Boundary

Allowed fields:

- cat display name.
- user-approved visual notes.
- renderer target.
- generated action prompt text in the active UI session.
- manifest template.
- import checklist.

Forbidden fields:

- raw photo bytes.
- EXIF/GPS.
- source file name or full local path.
- thumbnail persistence.
- provider payload.
- token.
- Authorization.
- workspace path.
- config path.
- remote URL.

## Risk Assessment

| Risk | Level | Decision |
| --- | --- | --- |
| User assumes local photo-to-3D generation. | Medium | UI copy must state guided prompt generation only. |
| Raw photo or path persistence. | High if implemented | V5.13 implementation must not include photo upload/read/persist controls. |
| Provider call accidentally introduced. | High | No network/provider code in V5.13. |
| Generated assets bypass import/runtime validation. | High | UI must direct users back to local import; no direct renderer activation from generated prompts. |
| Evidence leaks prompt text or sensitive notes. | Medium | Evidence records action coverage and redaction result only. |

## Go / No-Go

```text
V5.13 implementation: Go
V5.13 acceptance: No-Go until real local UI workflow evidence passes
V5.x Productization Gate: No-Go
```
