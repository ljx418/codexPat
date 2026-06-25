# V31.8 Repeatable Asset Production

status: partial
date: 2026-06-24

## Pre-execution Development And Acceptance Plan

- Execute only the scoped V31 continuation phase named in this evidence.
- Use existing PRD and target architecture as the source of truth.
- Stop or mark blocked instead of passing if real visual, runtime, or photo-derived evidence is missing.

## Evidence

- Development plan: evaluate multiple local asset candidates through the same V31 art quality gate and V30 semantic boundary before claiming repeatability.
- Acceptance standard: at least two legal high-quality candidates must pass the same gate; one passing candidate remains partial scoped.
- PRD/spec review: V31 requires production-quality 2D action assets, not a single accidental success or placeholder motion.
- Result: {
    "status": "partial",
    "reasonCodes": [
      "candidate_failed_quality_gate",
      "only_single_high_quality_asset_passed"
    ],
    "candidateCount": 4,
    "passingCandidateCount": 1,
    "blockedCandidateCount": 0,
    "failedCandidateCount": 3,
    "passingCandidateIds": [
      "v31_flagship_local_asset"
    ],
    "candidateSummaries": [
      {
        "candidateId": "v31_flagship_local_asset",
        "sourceLabel": "real_local_asset",
        "artStatus": "passed",
        "semanticStatus": "passed",
        "reasonCodes": [
          "semantic_animation_passed",
          "v31_art_quality_passed"
        ]
      },
      {
        "candidateId": "v8_11_animated_orange_tabby",
        "sourceLabel": "real_local_asset",
        "artStatus": "failed",
        "semanticStatus": "not-run",
        "reasonCodes": [
          "action_pose_too_weak",
          "expression_clarity_too_low",
          "visual_polish_too_low"
        ]
      },
      {
        "candidateId": "imported_static_orange_tabby_v1",
        "sourceLabel": "fixture_negative",
        "artStatus": "failed",
        "semanticStatus": "not-run",
        "reasonCodes": [
          "action_pose_too_weak",
          "core_action_missing",
          "loop_or_timing_failed",
          "visual_polish_too_low"
        ]
      },
      {
        "candidateId": "placeholder_line_art",
        "sourceLabel": "fixture_negative",
        "artStatus": "failed",
        "semanticStatus": "not-run",
        "reasonCodes": [
          "action_pose_too_weak",
          "expression_clarity_too_low",
          "placeholder_line_art_rejected",
          "silhouette_clarity_too_low",
          "small_scale_readability_failed",
          "visual_polish_too_low"
        ]
      }
    ]
  }.
- Flagship art: {
    "status": "passed",
    "candidateId": "v31_polished_candidate",
    "safePackId": "v31-polished-local-pack",
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
- V8.11 candidate art: {
    "status": "failed",
    "candidateId": "v8_11_animated_orange_tabby",
    "safePackId": "v8-11-animated-orange-tabby",
    "routeKind": "professional_frame_pack",
    "reasonCodes": [
      "action_pose_too_weak",
      "expression_clarity_too_low",
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
      "visualPolish": "medium",
      "actionPose": "low",
      "identity": "high"
    },
    "evidenceMode": "visual"
  }.
- Static negative art: {
    "status": "failed",
    "candidateId": "imported_static_orange_tabby_v1",
    "safePackId": "imported-static-orange-tabby-v1",
    "routeKind": "professional_frame_pack",
    "reasonCodes": [
      "action_pose_too_weak",
      "core_action_missing",
      "loop_or_timing_failed",
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
      "visualPolish": "medium",
      "actionPose": "low",
      "identity": "high"
    },
    "evidenceMode": "visual"
  }.
- Audit opinion: V31.8 is partial because only one candidate is accepted as high-quality; repeatable production is not yet fully proven.
- Claim/security scan: passed/passed; doc audit: passed.

## Required Boundary

This evidence does not claim Petdex parity, arbitrary-cat automatic animation ready, automatic photo-to-2D ready for arbitrary cats, provider integration verified, 3D ready, production signed release ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration verified, OS-level Codex window binding ready, or all Codex workflows verified.
