# V39 Acceptance Plan

Date: 2026-06-27

## Acceptance Gates

- Documentation gate: V39 PRD, target architecture, development plan, acceptance plan, milestones, claim matrix, scan checklist, doc audit, and drawio are synchronized.
- Sample gate: at least two different tested cat samples pass the full V39 chain for final scoped pass; at least one blocked or negative sample is recorded safely.
- Character gate: a passing sample must produce a cleaned, character-like 2D cat asset, not a photo inside a card or frame.
- Identity gate: coat color, face pattern, ear/tail traits, and notable markings must remain tied to the source sample.
- Part rig gate: visible head, body, ears, paws, tail, and eyes/expression must have explicit rig responsibility or a visibility-based blocked reason.
- Motion gate: each of eight actions must include local part movement and action-specific pose changes; whole-image transform-only and overlay-only motion fail.
- Product gate: preview, target-only apply, rollback, failed-candidate block, and blocked reason must be user-visible.
- Human preference gate: unattractive but technically renderable assets can fail.
- Evidence gate: Chinese HTML report and screenshots must show source photo, cleaned character, part map, action frames, animated preview, product path, and failures.
- Claim/security gate: final report must avoid all forbidden ready claims and must not expose sensitive values.

## User-Visible Outcome

After a V39 scoped pass, a reviewer can see at least one tested sample produce a character-like 2D desktop pet candidate with readable actions and product preview/apply/rollback evidence. The user should no longer perceive the result as the same V38 photo-card overlay.

For final scoped pass, this outcome must be demonstrated by at least two different tested cat samples. One passing sample is partial scoped evidence only.

## Failure Handling

- If the candidate still uses borders, labels, dots, or cards as the main visual structure, fail the character gate.
- If actions are only whole-image transforms or overlay decoration, fail the motion gate.
- If the app can preview but cannot target-only apply and rollback, fail the product gate.
- If visual evidence is missing or screenshot capture is environment-blocked, record blocked status unless an approved stable block reason exists.
- If Route B has no real source-bound assets, record Route B as blocked without blocking Route A2++ scoped acceptance.
