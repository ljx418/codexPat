# V31.5 Photo-to-character Route Spec

文档状态：planned execution spec；V31.5 entry document。
当前日期：2026-06-24。

## Purpose

V31.5 defines a realistic route from arbitrary cat photo input to reviewable
2D action candidates. This phase must remain candidate-only until named real
samples pass the full V31 pipeline.

## User Flow

```text
select cat photo
  -> consent and privacy check
  -> suitability check
  -> safe trait summary
  -> character design candidate
  -> key-pose / rig / frame candidate
  -> normalized 8-action pack
  -> semantic QA + visual QA + identity QA
  -> preview
  -> approved-only apply
  -> rollback
```

## Sample Set

Future evidence must use named real sample classes:

- clear front or three-quarter cat photo;
- side or partial-body cat photo;
- long-hair or complex-pattern cat;
- low-quality or blocked photo;
- non-cat or unsafe input.

The evidence may use redacted thumbnails or generated screenshots, but must not
publish raw private photo bytes, EXIF/GPS, full local paths, or private names.

## Route Options

| Route | Role | Acceptance Boundary |
| --- | --- | --- |
| local trait extraction | creates safe description and blocks unsuitable input | cannot imply final art quality |
| manual character design | creates stable art direction from traits | can feed flagship route if licensed |
| layered rig adaptation | maps character design into reusable motion | must pass V31.4 route contract |
| provider key-pose candidate | may propose art/key poses | cannot bypass local QA or claim provider integration |

## Development Tasks

1. Define photo consent and redaction requirements.
2. Define suitability and blocked-input reasonCodes.
3. Define safe trait schema.
4. Define character design output schema.
5. Define identity comparison evidence.
6. Define candidate-to-pack handoff to V31.2/V31.4/V31.6.

## Output Evidence

Create:

```text
docs/V31.x/evidence/v31_5-photo-to-character-route-YYYY-MM-DD.md
```

Required sections:

- PRD/spec review.
- Sample set definition.
- Consent/privacy checks.
- Route decision and reasonCodes.
- Candidate output examples or stable blocked reason.
- Claim/security scan.

## Pass / Block / Fail

- Pass: the workflow is implementation-ready and honest about candidate-only
  status.
- Blocked: real sample handling or required tooling is unavailable.
- Failed: the workflow treats one curated photo as arbitrary-cat readiness,
  exposes private data, or lets provider output bypass local QA.

## Claim Boundary

V31.5 may only claim a photo-to-character candidate workflow is specified. It
does not prove automatic high-quality animation for arbitrary cats.
