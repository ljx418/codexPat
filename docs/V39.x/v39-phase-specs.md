# V39 Phase Specs

Date: 2026-06-27

## Purpose

This document turns the V39 plan into implementation-ready phase specs. A later implementation agent should not decide the phase order, evidence shape, pass criteria, or failure handling.

## Global Sample Rules

- Passing scoped V39 requires at least two different tested cat samples to pass V39.1 through V39.8.
- The sample set must include at least one blocked or negative sample with a safe reason code.
- Raw original photos must not be committed as evidence.
- Passing samples must produce character assets that are visually distinct from each other.
- A single reused cat, a photo-card overlay, or whole-image transform-only motion cannot pass.

## V39.0 Documentation Readiness

Entry:
- V38 final scoped evidence exists.
- V39 PRD, target architecture, acceptance, milestones, claim matrix, scan checklist, implementation contract, and drawio exist.

Development:
- Review all V39 docs for the same active PRD, target route, phase list, allowed claims, and no-go claims.
- Validate drawio page count and page names.

Acceptance:
- Pass only if active docs point to V39 and V38 is described as input baseline.
- Block if drawio cannot be parsed or has more than eight pages.
- Fail if docs imply V39 implementation has already passed.

## V39.1 Target Experience Rubric

Entry:
- V39.0 passed.

Development:
- Implement a rubric that scores character appeal, silhouette clarity, identity preservation, part-local motion, action readability, small-size readability, and product suitability.
- Add explicit rejection checks for card frame, visible label, decorative dots, border-led motion, watermark, and whole-image transform-only motion.

Acceptance:
- Pass if the rubric rejects V38-style photo-card overlay examples and accepts only character-like candidates with local part motion.
- Block if no visual evidence can be generated for candidate comparison.
- Fail if a card/label/dot/border-driven candidate can pass.

## V39.2 Characterized Asset Contract

Entry:
- V39.1 passed.
- At least two eligible cat samples and one blocked/negative sample are available.

Development:
- Create a contract for sanitized source, cleaned silhouette, style profile, identity traits, character asset ID, and no-card/no-label proof.
- Preserve source-bound identity traits: coat color, face pattern, ear shape, tail style, eye color if visible, and notable markings.

Acceptance:
- Pass if at least two samples produce distinct characterized assets.
- Block if a source lacks enough visible cat body to derive a character asset.
- Fail if the same character asset is reused across samples or if the cleaned asset is still a photo inside a decorative card.

## V39.3 Layered Part Rig Contract

Entry:
- V39.2 passed for at least two samples.

Development:
- Define visible parts: head, body, front paws, back paws, ears, tail, eyes/expression, and optional shadow.
- For each part, store visibility, pivot, motion range, parent part, and action responsibility.

Acceptance:
- Pass if each passing sample has explicit part responsibilities or visibility-based blocked reasons.
- Block if tail, paws, or eyes are genuinely not visible and the evidence records that limitation.
- Fail if all motion responsibility is assigned to the whole image.

## V39.4 Route A2++ Action Frame Composer

Entry:
- V39.3 passed.

Development:
- Generate idle, walk, jump, sleep, eat, play, alert, and celebrate sequences.
- Each action must use at least one body/pose change and at least one local part motion where visible.
- Each action should produce at least eight frames; loop-style actions should prefer twelve frames when feasible.

Acceptance:
- Pass if all eight actions pass action readability and local motion checks for at least two samples.
- Block if a source's visibility prevents a specific part motion and the action still has an acceptable alternate local motion.
- Fail if action evidence is driven mainly by border motion, decorative dots, labels, or whole-image transforms.

## V39.5 Product Preview, Apply, Rollback

Entry:
- V39.4 passed for at least one candidate.

Development:
- Add V39 UI anchors for candidate list, preview, approval status, apply, rollback, and blocked reason.
- Preserve existing V37/V38 panels and evidence.

Acceptance:
- Pass if only approved V39 candidates can apply to the target pet and rollback restores the prior asset.
- Block if runtime/browser screenshot capture is environment-blocked but DOM anchors and product state evidence are present.
- Fail if a failed or human-rejected candidate can apply.

## V39.6 Visual Report

Entry:
- V39.5 passed or has stable environment block with DOM evidence.

Development:
- Generate a Chinese HTML report with source/sanitized image, cleaned character, part map, contact sheets, animated previews, product path screenshots, failures, claim scan, and security scan.

Acceptance:
- Pass if the report lets a human compare V38-style output against V39 characterized output.
- Block if screenshot capture is unavailable and the stable reason is documented.
- Fail if the report lacks visual evidence for character asset, part rig, or action frames.

## V39.7 Route B Comparison Record

Entry:
- V39.6 completed.

Development:
- Record Route B status per sample: not supplied, supplied but blocked, comparable, or better candidate.
- Route B assets must be source-bound to the same sample and have permission evidence.

Acceptance:
- Pass if Route B is honestly recorded.
- Block Route B if no real same-sample assets exist.
- Fail if Route B is marked verified without real source-bound assets.

## V39.8 Final Gate

Entry:
- V39.0 through V39.7 have passed, blocked, or failed evidence.

Development:
- Write final report with phase summary, command results, product experience status, architecture status, route decision, residual risk, claim scan, and security scan.

Acceptance:
- Pass scoped only if at least two tested samples produce characterized action assets that pass human preference, product path, and scans.
- Partial scoped if some contracts pass but sample count, product path, or human preference is incomplete.
- Block if environment prerequisites prevent evidence collection.
- Fail if false claims, sensitive data, or V38-style overlay output is accepted as V39 target quality.
