# V8.6 Acceptance Plan

status: in-progress
date: 2026-06-02

## Acceptance Principle

V8.6 acceptance is evidence-based. V8.6 passes only when diagnostics
export, deletion flow, license export, and security scan all pass
with no forbidden content.

## Required Evidence

### Evidence 1: Diagnostics Export Redaction

Create diagnostics export with V8.2 provider data → scan for forbidden content.

Forbidden patterns: sk-, Bearer, /Users/, /private/, /tmp/, api-token.json,
raw payload, raw response, Authorization, credential, workspace path.

Expected: scan returns empty (no forbidden content found).

### Evidence 2: Deletion Flow Safety

Delete V8.2 normalized pack → verify deletion event has no raw paths.

Expected: deletion event only contains pack_id, timestamp, safe fields.

### Evidence 3: License/Attribution Export

Export license from normalized manifest → verify sanitized.

Expected: attribution text no longer than 160 chars, no forbidden content.

### Evidence 4: Security Scan Harness Detection

Run scan on V8.2 evidence files → verify forbidden content is detected.

Expected: scan correctly identifies any planted forbidden patterns.

### Evidence 5: Retention Documentation

Document Tripo3D retention policy from provider consent disclosures.

Expected: retention explanation matches V5 consent text.

### Evidence 6: V7 Regression Baseline

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl test
```

## Phase Gate

V8.6 passes when:
1. Evidence 1-5 pass.
2. Evidence 6 regression baseline remains passing.
3. V8.6 final acceptance report is written.

V8.6 is blocked if:
- Any forbidden content found in diagnostics export.
- Deletion event contains raw paths.
- Security scan harness misses planted forbidden patterns.
- V7 regression fails.