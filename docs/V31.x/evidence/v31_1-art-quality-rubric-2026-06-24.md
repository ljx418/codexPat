# V31.1 Art Quality Rubric

status: passed scoped
date: 2026-06-24

## Summary

- Development plan: implement V31 art rubric and run it against the old line-art baseline plus the local high-quality candidate.
- Acceptance standard: placeholder/simple SVG must fail; high-quality candidate must require visual evidence and safe license boundary.
- Old baseline result: {
    "status": "failed",
    "candidateId": "v31_placeholder_line_art",
    "safePackId": "flagship-work-cat-v2",
    "routeKind": "placeholder_reject_baseline",
    "reasonCodes": [
      "action_pose_too_weak",
      "expression_clarity_too_low",
      "placeholder_line_art_rejected",
      "silhouette_clarity_too_low",
      "small_scale_readability_failed",
      "visual_polish_too_low"
    ],
    "actionCoverage": {
      "idle": true,
      "thinking": true,
      "running": true,
      "success": true,
      "warning": true,
      "error": true,
      "need_input": true,
      "sleeping": true
    },
    "scoreBuckets": {
      "visualPolish": "low",
      "actionPose": "low",
      "identity": "high"
    },
    "evidenceMode": "visual"
  }.
- Candidate result: {
    "status": "passed",
    "candidateId": "v31_flagship_imported_animated_qa_cat_v1_sanitized",
    "safePackId": "v31-flagship-local-candidate",
    "routeKind": "professional_frame_pack",
    "reasonCodes": [
      "v31_art_quality_passed"
    ],
    "actionCoverage": {
      "idle": true,
      "thinking": true,
      "running": true,
      "success": true,
      "warning": true,
      "error": true,
      "need_input": true,
      "sleeping": true
    },
    "scoreBuckets": {
      "visualPolish": "high",
      "actionPose": "medium",
      "identity": "high"
    },
    "evidenceMode": "visual"
  }.
- Audit opinion: rubric rejects placeholder art and does not treat text-only evidence as visual acceptance.

## Required Boundary

This evidence does not claim Petdex parity, arbitrary-cat automatic animation ready, provider integration verified, 3D ready, production release ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration verified, OS-level Codex window binding ready, or all Codex workflows verified.
