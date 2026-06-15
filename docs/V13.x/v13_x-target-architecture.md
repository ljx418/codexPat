# V13 Target Architecture

日期：2026-06-08  
状态：planning。  

## Current Architecture Baseline

```text
Desktop App
  -> PetWindowLifecycleController
  -> CatStateMachine
  -> CatActionResolver
  -> RendererRegistry
  -> EvidenceCaptureHarness
```

V12 proved that the desktop pet can be visible on the real macOS desktop and that screenshot-backed HTML reports can support acceptance.

## V13 Target Architecture

```text
V12 Desktop App + Evidence Harness
  -> Beta Packaging Smoke
  -> First-run User Journey Harness
  -> Safe Diagnostics Exporter
  -> Stability / Performance Baseline
  -> Artifact / License / Claim Scanner
  -> Beta Acceptance HTML Reporter
```

## Component Responsibilities

| Component | Responsibility | Sensitive Data Boundary |
| --- | --- | --- |
| Beta Packaging Smoke | Verify local macOS build/package can launch. | No tokens, raw paths, or signing secrets in evidence. |
| First-run User Journey Harness | Capture visible pet, onboarding, settings, Codex work-cat guide. | No prompt/tool command text. |
| Safe Diagnostics Exporter | Produce user-shareable support bundle. | Redact token, Authorization, full local paths, workspace/config paths, raw payloads. |
| Stability / Performance Baseline | Record long-run, multi-cat, animation, CPU/memory behavior. | No raw provider/Codex payloads. |
| Artifact / License / Claim Scanner | Verify commit cleanliness, licenses, generated artifacts, forbidden claims. | Scan evidence without embedding secrets. |
| Beta Acceptance HTML Reporter | Summarize evidence with screenshots and pass/fail decisions. | Embed sanitized screenshots/tables only. |

## Implementation Contracts

The architecture is implemented through phase contracts rather than a single
large feature switch:

| Contract Area | Required Detail |
| --- | --- |
| Packaging | build/package command summary, artifact summary, launch smoke, signing/notarization checklist status |
| First-run | visible pet, settings/onboarding, Codex work-cat guide, already-open unsupported notice |
| Diagnostics | allowed field list, forbidden field list, redaction scan, sanitized archive/file manifest |
| Stability | test duration, pet count, screenshot checkpoints, CPU/memory baseline, hard-fail rules |
| Hygiene | git artifact scan, license scan, claim scan, evidence leakage scan |
| Final HTML | embedded screenshots, result tables, scope, commit, allowed claim, forbidden claim list |

Full details are in `docs/V13.x/v13_x-implementation-contract.md`.

## Non-goals

V13 does not change:

- PetEvent schema.
- Codex JSONL/hook semantics.
- OS-level Codex window binding readiness.
- renderer action/security payload boundaries.
- provider generation workflow.
- asset marketplace workflow.
- production signing/notarization/auto-update.

## Data Flow

```text
Local Beta Build
  -> First Launch
  -> Visible Desktop Pet
  -> User Onboarding / Settings
  -> Safe Diagnostics Export
  -> Stability & Regression Evidence
  -> HTML Beta Report
```

The report can reference local evidence files, but should not require the reviewer to rebuild or manually click through the app to understand the V13 result.
