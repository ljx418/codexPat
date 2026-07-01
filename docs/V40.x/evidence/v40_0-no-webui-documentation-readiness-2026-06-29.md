# V40.0 No-WebUI Documentation Readiness Evidence

Date: 2026-06-29

## Scope

This evidence records a documentation-only readiness review for the existing V40
plan after the active route was revised in place from WebUI/ComfyUI-dependent
tooling to a no-WebUI Direct Local Runner route.

This evidence does not claim Direct Local Runner integration, high-quality asset
generation, product preview/apply/rollback, arbitrary-cat automation, provider
integration, Route B verification, Petdex parity, 3D readiness, production
readiness, Windows readiness, or cross-platform readiness.

## Controlling Documents

- `docs/active/agent_desktop_pet_prd_v40.md`
- `docs/V40.x/v40-target-architecture.md`
- `docs/V40.x/v40-development-and-acceptance-plan.md`
- `docs/V40.x/v40-phase-specs.md`
- `docs/V40.x/v40-implementation-contract.md`
- `docs/V40.x/v40-acceptance-plan.md`
- `docs/V40.x/v40-risk-and-claim-matrix.md`
- `docs/V40.x/v40-milestones.md`
- `docs/V40.x/v40-current-gap-analysis.md`
- `docs/V40.x/v40-doc-audit.md`
- `docs/V40.x/v40-evidence-and-scan-checklist.md`
- `docs/active/development-plan.md`
- `docs/active/acceptance-plan.md`
- `docs/active/current-vs-target-gap.md`
- `docs/active/current-vs-target-gap.drawio`

## Review Result

The document set is sufficient to guide the remaining V40 phase-by-phase
development and acceptance work under the no-WebUI constraint.

The active target route is:

```text
tested cat sample / safe user photo
  -> safe intake and source boundary
  -> V39 baseline snapshot
  -> LocalImageCandidateOrchestrator
  -> DirectLocalModelRunner
  -> DirectLocalImageModelAdapter
  -> OllamaPromptReviewAdapter
  -> local candidate output directory
  -> HybridAssetNormalizationGate
  -> HybridVisualPreferenceGate
  -> HybridPreviewApplyRollbackGate
  -> same-sample V39 vs V40 comparison
  -> Chinese HTML visual report
  -> scoped final gate
```

## Development And Acceptance Gate Summary

- V40.1A Direct Local Runner smoke must prove or block the runner dependency,
  model/checkpoint, GPU, safe output directory, and Ollama advisory boundary.
- V40.2 must implement no-WebUI run/candidate/product-gate contracts and reject
  unsafe payloads.
- V40.3 must use real tested samples and either Direct Local Runner outputs or
  explicitly accepted import/manual assets.
- V40.4 must normalize accepted candidates into safe action asset manifests and
  compare them against same-sample V39.
- V40.5 must prove preview, target-only apply, and rollback for accepted
  candidates.
- V40.6 must produce a Chinese visual report with screenshots or rendered visual
  artifacts.
- V40.7 must run baseline checks, PRD/spec review, claim scan, security scan,
  and final scoped/block/fail decision.

## Audit Findings

- Fatal issues: none open.
- Major spec deviation: none open.
- Remaining implementation risk: Direct Local Runner dependencies and local
  model quality are not proven.
- Remaining quality risk: generated/imported candidates may still fail human
  preference or not beat V39.
- Required next evidence: `v40_1a-direct-runner-smoke-YYYY-MM-DD.md`.

## Validation Commands

```text
drawio XML parse: passed, 8 pages
stale route scan: passed, no active legacy-route or new-stage naming found
security scan: passed for active V40 docs
git diff whitespace check: passed
```

## Claim Scan

Forbidden ready claims are present only as forbidden/not-ready boundaries in the
active document set.

## Security Scan

No token, Authorization value, raw prompt, raw runner payload, raw generated
image bytes, raw photo bytes, EXIF/GPS value, full local path, workspace path,
config path, or credential path is recorded in this evidence.

## Decision

passed scoped for documentation readiness only.

V40 may proceed to V40.1A Direct Local Runner smoke. V40 final acceptance remains
No-Go until V40.1A-V40.7 produce real passed, blocked, or failed evidence.
