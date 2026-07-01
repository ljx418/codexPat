# V40 Phase Specs

Date: 2026-06-29

## Global Rules

- Phases must execute in order.
- Every phase must create real evidence or a stable blocked/failed reason.
- A later phase may not silently pass by citing earlier documentation.
- Tool readiness does not equal asset quality.
- Ollama output is advisory and cannot approve a candidate.
- Direct Local Runner output is a candidate and must pass project normalization
  and visual gates.
- ComfyUI is not part of the active V40 route after V40.1 blocked evidence.
- WebUI is not part of the active V40 route after V40.1A blocked evidence.

## V40.0 Documentation Readiness

Entry criteria:

- V39 final scoped evidence exists.
- V40 PRD, architecture, plan, acceptance, milestones, risk matrix, evidence
  checklist, implementation contract, phase specs, active docs, and drawio exist.

Required checks:

- drawio XML parses and has no more than 8 pages;
- active PRD points to V40 no-WebUI route;
- claim scan has no positive ready claims;
- security scan has no sensitive values.

Pass:

- all checks pass and evidence records documentation-only scope.

Block:

- required docs cannot be created or active doc ownership is ambiguous.

Fail:

- docs contain conflicting active target, over-claim, or sensitive values.

## V40.1 Local Blocked Baseline

Entry criteria:

- V40.0 passed scoped for the original pre-no-WebUI documentation baseline.

Required actions:

- preserve V40.1 evidence that GPU and Ollama are available but ComfyUI is
  installed and not scriptable from the repo/WSL environment;
- do not use V40.1 blocked evidence as generation readiness.

Pass:

- not applicable for the no-WebUI route.

Block:

- V40.1 remains blocked for ComfyUI.

Fail:

- evidence leaks sensitive values or claims generation quality.

## V40.1A Direct Local Runner Smoke

Entry criteria:

- no-WebUI documentation update is accepted;
- local machine can be probed without storing raw paths or credentials.

Required actions:

- verify GPU availability with a safe summary;
- verify Ollama command boundary and safe model summary;
- verify project-owned direct runner dependency boundary from the repo
  environment;
- verify at least one local checkpoint/model with safe model-name summary;
- verify a safe output directory contract;
- do not run high-cost generation unless the smoke spec explicitly allows it.

Pass:

- GPU summary is available;
- Ollama boundary is available or explicitly not required for current run;
- Direct Local Runner is available and has a safe model/checkpoint summary;
- evidence contains no raw prompt, raw runner payload, full local path, token, or
  raw photo.

Block:

- direct runner dependencies are unavailable or incompatible;
- model/checkpoint is missing;
- local runner cannot be launched in the current environment;
- GPU unavailable or VRAM inaccessible.

Fail:

- scripts leak sensitive values;
- tool smoke claims generation quality without generated candidate evidence.

## V40.2 No-WebUI Workflow Contract

Entry criteria:

- V40.1A passed or has an accepted blocked narrowing to import-ready/manual
  assets.

Required actions:

- implement contract types from `v40-implementation-contract.md`;
- add unit tests for safe IDs, safe relative refs, reason codes, and forbidden
  fields;
- add smoke evidence for accepted/rejected contract fixtures.

Pass:

- unsafe paths, raw prompts, remote URLs, raw payloads, missing actions, and
  malformed candidates are rejected.

Block:

- route is narrowed before code implementation because local tools are blocked.

Fail:

- unsafe candidate data can enter later phases.

## V40.3 Candidate Generation Or Import

Entry criteria:

- V40.1A scriptable local tool route passed, or V40.2 explicitly narrowed to
  import-ready/manual assets;
- V40.2 contract tests passed.

Required actions:

- use at least two tested cat samples and one negative/blocked sample;
- generate direct local runner candidates or import explicitly supplied high-quality
  candidates;
- preserve V39 same-sample baseline references;
- create sanitized thumbnails or previews.

Pass:

- at least two candidates are generated/imported and safe to review;
- negative/blocked sample has stable reason code;
- no candidate is accepted yet without V40.4 and V40.5.

Block:

- Direct Local Runner route cannot produce usable outputs despite valid tool smoke;
- no acceptable import/manual assets are supplied after a blocked tool route.

Fail:

- outputs leak unsafe data, drift identity beyond review, or bypass sample
  binding.

## V40.3R Recovery: Direct Img2Img Or Accepted Import

Entry criteria:

- V40.3 failed with real visual review evidence;
- V40.1A Direct Local Runner smoke passed scoped;
- V40.2 no-WebUI workflow contract passed scoped;
- WebUI and ComfyUI remain non-active runtime dependencies.

Required actions:

- create a separate pre-development audit and acceptance plan before code;
- use real V38 sanitized public cat samples as img2img init images;
- if img2img fails target-experience review, test an identity-conditioned direct
  local route before narrowing to accepted manual/import same-sample assets;
- generate safe relative candidate refs only;
- require explicit visual review JSON before a pass decision;
- compare candidate identity/action consistency against V39 same-sample baseline.

Pass:

- at least two tested same-sample candidates have visible source-bound identity
  preservation, readable eight-action coverage, no multi-subject/humanoid/text
  artifacts, and are safe to normalize in V40.4.

Block:

- direct img2img dependencies or local model files are unavailable;
- identity-conditioned direct runner dependencies are available but incompatible
  with the current project-owned runner stack;
- model execution is possible but no acceptable manual/import fallback exists.

Fail:

- candidates still drift identity, miss action semantics, include unsafe artifacts,
  or are not clearly better than V39 for target user experience.

## V40.3R2 Recovery Planning And Route Repair Gate

Entry criteria:

- V40.3 prompt-only candidates failed visual review;
- V40.3R direct img2img candidates failed visual review;
- V40.3R identity-conditioned runner is blocked by stack compatibility;
- V40.4 remains No-Go.

Required actions:

- revise PRD, target architecture, development plan, acceptance plan,
  milestones, gap analysis, drawio, implementation contract, risk matrix, and
  evidence checklist so they agree on the same current state;
- use identity-conditioned direct-runner compatibility repair as the default
  next route without changing V40 scope;
- allow accepted same-sample manual/import assets only when source, license,
  sample binding, and visual acceptance evidence are already available;
- keep V39 as fallback and record V40.3R2 blocked/failed if neither route can
  produce two accepted candidates;
- define pass/block/fail rules before code resumes;
- run claim and security scans against the updated documents.

Pass:

- documentation clearly states V40.4 cannot start until at least two
  same-sample candidates pass explicit visual review;
- no document claims arbitrary-cat automation, Petdex parity, provider
  integration, production/platform readiness, WebUI readiness, or ComfyUI
  readiness;
- drawio remains Chinese, no more than eight pages, and shows current-to-target
  relationships through concrete code entities.

Block:

- identity-conditioned runner repair needs unavailable dependencies or scope
  change, and no accepted same-sample import assets exist.

Fail:

- docs conflict with existing V40.3/V40.3R evidence or imply a false V40.4
  unlock.

## V40.3R3 Candidate Source Decision

Entry criteria:

- V40.3R2 generated real candidates and a bounded stylized retry;
- explicit visual review failed both V40.3R2 sets;
- V40.4 remains No-Go.

Required actions:

- audit V40.3, V40.3R, and V40.3R2 failure evidence before choosing a route;
- choose exactly one route decision:
  `accepted_manual_import_first`, `new_direct_runner_route_allowed`, or
  `remain_failed_or_blocked`;
- for accepted manual/import, require source, license, sample binding, visual
  acceptance, safe refs, and no raw photo/path/prompt evidence before code;
- for a new direct-runner route, prove the route has materially different
  identity controls, full-body action controls, and visual acceptance strategy
  from the failed routes;
- keep V39 fallback if neither route is credible.

Pass:

- one decision is recorded with exact phase entry criteria for the next work;
- claim/security scans pass;
- docs do not imply V40.4 can start without two visually accepted candidates.

Block:

- no accepted manual/import assets exist and no materially different direct
  runner route is available.

Fail:

- the decision repeats V40.3R2 failed outputs as accepted inputs;
- the decision hides visual failure or presents tool readiness as asset quality.

## V40.4 Normalization And Action Packaging

Entry criteria:

- V40.3R3 has selected a credible candidate source;
- at least two same-sample candidates from that source passed explicit visual
  review.

Required actions:

- normalize each accepted candidate into safe asset manifest shape;
- require eight actions;
- reject transform-only motion;
- compare V40 output to same-sample V39 baseline.

Pass:

- at least two same-sample V40 candidates are normalized and score
  `better_than_v39` or explicitly pass human visual preference.

Block:

- generated/imported outputs are visually interesting but cannot be normalized
  into runtime-safe assets.

Fail:

- normalized outputs are not better than V39, miss actions, or fail safety gates.

## V40.5 Product Preview / Apply / Rollback

Entry criteria:

- V40.4 accepted candidates exist.

Required actions:

- expose accepted candidates in settings/product path;
- support preview;
- support target-only apply;
- support rollback;
- preserve previous active pack on failure.

Pass:

- accepted candidate can be previewed, applied to target, and rolled back with
  screenshot or smoke evidence.

Block:

- UI cannot run in current environment, with stable environment reason.

Fail:

- failed candidate can be applied, rollback fails, or active pack is corrupted.

## V40.6 Visual Report

Entry criteria:

- V40.5 passed or has stable blocked reason with enough visual evidence.

Required actions:

- produce Chinese HTML report;
- include source/sanitized sample refs, V39 baseline, V40 candidate, action
  contact sheet, UI path, failures, and risks;
- capture screenshots using headless browser when possible.

Pass:

- report is readable, nonblank, evidence-backed, and honest about residual
  quality gap.

Block:

- browser screenshot tooling unavailable, with static visual artifacts still
  attached.

Fail:

- report hides failures, shows broken evidence as pass, or over-claims quality.

## V40.7 Final Gate

Entry criteria:

- V40.1-V40.6 have passed, blocked, or failed evidence.

Required actions:

- run baseline commands;
- run V40 smoke scripts;
- run PRD/spec review;
- run claim scan;
- run security scan;
- write final report.

Pass:

- at least two tested samples pass the full no-WebUI direct-runner or accepted import
  route;
- same-sample V40 visual evidence is reasonably better than V39;
- product preview/apply/rollback passes;
- scans pass;
- final claim is scoped.

Block:

- local tools or import/manual assets remain unavailable after stable attempts.

Fail:

- tools/assets are available but quality, safety, or product path does not meet
  V40 acceptance.
