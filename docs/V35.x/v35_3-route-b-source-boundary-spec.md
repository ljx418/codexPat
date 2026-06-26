# V35.3 Route B Source Boundary Execution Spec

文档状态：active execution spec；planned。
当前日期：2026-06-25。

## Objective

V35.3 defines the professional-assisted Route B import boundary. Route B may improve target visual quality, but it must remain explicitly professional-assisted and evidence-bound. This phase does not execute Route B by itself.

## Inputs

- V35.1 target-experience rubric evidence.
- V34 sample, part map, and character asset contract evidence.
- V35 implementation contract.

## Required Source Boundary Fields

`V35RouteBSourceBoundary` must include:

- `sourceBoundaryId`
- `sampleId`
- `characterAssetId`
- `assetProvenance`
- `assistedSteps`
- `licenseOrPermissionSummary`
- `partMapBinding`
- `frameSequenceEvidence`
- `qaEvidenceRequired`
- `productPathEvidenceRequired`
- `notAutomaticStatement`

## Allowed Route B Inputs

Allowed professional-assisted inputs:

- manually or professionally authored mask;
- manually or professionally authored part map correction;
- professionally authored 8-action frameSequence;
- professionally authored rig-ready parts;
- contact sheet or playback evidence derived from the same `sampleId`.

## Forbidden Route B Inputs

Forbidden as pass evidence:

- unbound artwork with no `sampleId`;
- provider raw output without local QA and source boundary;
- asset with unclear permission;
- route result described as automatic;
- route result missing product preview/apply/rollback evidence.

## Acceptance Actions

- Define source and permission summary requirements.
- Define sample and character asset binding requirements.
- Define visual evidence and QA requirements.
- Define how Route B output enters existing V34 QA and V33 product path.
- Run claim/security scan on Route B wording.

## Evidence

Future evidence path:

`docs/V35.x/evidence/v35_3-route-b-source-boundary-YYYY-MM-DD.md`

Evidence must include PRD/spec review, source boundary table, forbidden cases, required evidence refs, claim scan, security scan, and scoped decision.

## Exit Decision

V35.3 passes only if Route B can be implemented or evaluated without ambiguity about source, permissions, sample binding, QA, and product path. If Route B still depends on unspecified external or provider behavior, it is blocked.
