# V15.7 Final QA Evidence Plan

日期：2026-06-09  
状态：passed scoped；V15.1-V15.6 evidence and V15.7 final report exist。  

## Goal

Close V15 with a screenshot-backed final interaction QA gate that a human can inspect quickly without rebuilding or manually clicking through every flow.

## Required Evidence Files

- `docs/V15.x/v15_7-final-acceptance-report.md`
- `docs/V15.x/evidence/v15_7-final-interaction-html-YYYY-MM-DD.html`
- drag capture screenshot or recording.
- pointer feedback screenshot or recording.
- click/double-click screenshot or recording.
- autonomous walk screenshot or recording.
- settings screenshot.
- priority blocking matrix evidence.

## Final HTML Requirements

The final HTML must:

- embed images/captures directly, not only links.
- show before/after for drag.
- show pointer/click/double-click examples.
- show autonomous walk within bounds.
- show settings controls.
- summarize priority blocking.
- summarize regression/security/claim scans.
- state allowed and forbidden claims.

## Regression Baseline

Required commands:

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl check
pnpm --filter @agent-desktop-pet/petctl test
node scripts/v14_6_final_acceptance_gate_smoke.mjs
node scripts/v13_7_beta_readiness_gate_smoke.mjs
node scripts/v12_7_final_desktop_visibility_gate_smoke.mjs
node scripts/v11_7_interaction_qa_gate_smoke.mjs
```

## Security Scan

Final evidence must not contain:

- token.
- Authorization.
- raw payload.
- raw pointer path.
- screen text contents.
- clipboard contents.
- prompt text.
- tool command text.
- workspace path.
- config path.
- full local path.
- provider raw response.

## Claim Scan

Allowed final claim only if all gates pass:

```text
V15 living desktop pet interaction upgrade passed for tested local macOS scenarios with drag, pointer-aware feedback, autonomous walk, configurable interaction settings, and priority-safe state composition.
```

Still forbidden:

```text
Petdex parity achieved
Petdex ecosystem parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
remote asset loading ready
asset marketplace ready
production signed release ready
notarized release ready
auto update ready
cross-platform ready
Windows ready
OS-level Codex window binding ready
all Codex workflows verified
```

## Blocking Rule

If any prerequisite phase is blocked or failed in a future rerun, V15.7 must be treated as blocked. The current scoped V15.7 report is passed with matching evidence.
