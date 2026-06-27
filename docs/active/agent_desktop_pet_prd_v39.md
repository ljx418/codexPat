# Agent Desktop Pet PRD V39 - Characterized 2D Action Asset Quality

Date: 2026-06-27

## Scope

V39 targets the visible quality gap after V38: public cat photos can produce sanitized derived images and renderable frame packs, but the output still reads as a photo-card or overlay prototype rather than a lovable desktop pet action asset.

V39 is a documentation-first stage. It defines the next implementation target: Route A2++ local characterized, part-based, layered 2D action assets for tested public or safe named cat samples. It records Route B as a possible higher-quality comparison route, but Route B cannot pass without real source-bound assets.

V39 must not claim arbitrary-cat automatic generation, provider integration verified, Petdex parity, 3D readiness, production release readiness, Windows readiness, cross-platform readiness, MCP readiness, Claude Code integration, OS-level Codex window binding, or all workflow verification.

## Target User Experience

The user should see a cat character that looks intentionally designed from the input photo, not a photo trapped inside a test card. A passing V39 candidate must show:

- a cleaned cat silhouette without visible test labels, frame borders, or decorative dots as the main action evidence;
- stable identity traits from the source photo, such as coat color, face pattern, ear shape, tail style, and notable markings;
- part-based local motion for head, ears, body, paws, tail, and facial expression where visible;
- eight readable action previews: idle, walk, jump, sleep, eat, play, alert, and celebrate;
- product preview, target-only apply, rollback, and blocked reason paths;
- Chinese HTML evidence that lets a human reviewer judge whether the result is attractive enough to use as a desktop pet.

## Product Requirements

- Use V38 public-photo evidence as the input baseline, not as final product-quality proof.
- Define a `characterized asset` contract that separates source photo, cleaned silhouette, stylized character, part map, rig layers, action frames, and product state.
- Define minimum part responsibilities: head, body, front paws, back paws, ears, tail, eyes/expression, and optional accessory/background-free shadow.
- Reject card-like photo embedding, visible test labels, border/dot overlays, whole-image transform-only motion, and cross-sample asset reuse.
- Require real visual evidence for each passing sample: original/sanitized photo, cleaned character, part map, contact sheet, GIF or frame sequence preview, and product UI proof.
- Require at least two different tested cat samples to pass the full V39 chain for a scoped pass, plus at least one blocked or negative sample with a safe reason code.
- Keep Route A2++ as the default implementation route because it is local, controllable, auditable, and does not require provider readiness.
- Record Route B only as a comparison path for future professional/provider-assisted assets with source-bound permission and same-sample pairing.
- Use `docs/V39.x/v39-phase-specs.md` and `docs/V39.x/v39-quality-rubric-and-risk-closure.md` as the controlling development and quality gates for later implementation.

## Exit Criteria

- V39 docs define a complete phase-by-phase development and acceptance plan before code starts.
- `current-vs-target-gap.drawio` is synchronized, Chinese, no more than eight pages, and shows concrete code entities and interactions.
- Active PRD, development plan, acceptance plan, gap analysis, milestones, claim matrix, and scan checklist agree on the same V39 target and boundaries.
- Human visual acceptance is a hard gate: a result that is still a photo-card overlay cannot pass V39 final gate.
- Route A2++ failure is allowed only as partial scoped, blocked, or failed evidence; it cannot be rewritten into a target-quality pass.
- The final allowed claim remains scoped to tested samples and cannot imply arbitrary-photo automation or Petdex parity.
