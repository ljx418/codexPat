# V31 Target Architecture

文档状态：target architecture；V31 partial scoped execution recorded；V31 continuation planning active。
当前日期：2026-06-24。

## Architecture Goal

V31 adds a product-quality asset production layer above the existing V30
semantic gate and Post-V30 runtime baseline.

```text
Current baseline
  V30 semantic QA gate
  Post-V30 runtime / bridge / preview / apply / rollback baseline

V31 target
  high-quality asset source
  art quality rubric
  reusable 2D action production pipeline
  arbitrary-cat photo-to-character candidate workflow
  local QA and visual review
  approved-only runtime activation
```

The architecture must let a human reviewer answer:

- Is this a polished pet asset or still placeholder art?
- Which route produced the asset?
- Does the asset pass both semantic motion and visual art quality?
- Can photo input create a candidate without overclaiming arbitrary-cat ready?
- Can the app preview, apply, and rollback only approved assets?

Execution update: V31 evidence on 2026-06-24 shows this architecture working
for one named local flagship asset path. The photo-to-character path remains
candidate-only, and the layered rig route is a specified route contract rather
than a proven runtime rig implementation.

Continuation update: V31.8-V31.13 keep the same architecture and raise the
proof level. The target is no longer only one named flagship asset; it is a
repeatable production path plus named-sample-set photo-to-action evidence. The
continuation must still preserve the partial scoped boundary until real
evidence exists.

## Current Architecture Gap

| Current Item | Current Role | V31 Gap |
| --- | --- | --- |
| `flagship-work-cat-v2` SVG frames | Semantic local candidate and regression baseline. | Visual art quality failed; too simple for target experience. |
| V30 semantic QA | Rejects transform-only and checks action readability. | Does not guarantee polished art quality or appealing motion. |
| Asset import / normalizer | Can ingest safe local packs. | Needs product-quality source spec, license checks, and visual QA. |
| Photo-to-2D wizard | Has consent, traits, provider/import branches, preview/apply history. | Does not prove arbitrary-cat high-quality automatic animation. |
| Preview/apply/rollback | Provides safe target activation. | Must be fed only by visually accepted V31 assets. |
| Provider branches | Historical scoped feasibility and blocked paths. | Must remain candidate-only until real evidence passes. |
| V31 named local flagship asset | First visual target reference. | Does not prove repeatable production or photo-to-action automation. |
| V31 photo-route candidate evidence | Shows sample suitability and candidate-only workflow. | Needs named sample set, action candidates, preview/apply/rollback, and honest blocked cases. |

## Target Architecture

```text
V31 Asset Source Layer
  -> professional sprite / frame pack route
  -> layered part-rig route
  -> photo traits and character design route
  -> provider key-pose candidate route
  -> placeholder / transform baseline reject route

V31 Production Layer
  -> license / attribution / consent boundary
  -> character design contract
  -> action storyboard and art direction
  -> frame or rig export
  -> normalized pack adapter

V31 Quality Layer
  -> V30 semantic motion gate
  -> V31 visual art quality gate
  -> same-cat identity gate
  -> action appeal / pose strength gate
  -> loop / timing / 1x and 0.75x readability gate
  -> security and claim scan

V31 Experience Layer
  -> embedded visual report
  -> isolated preview
  -> approved-only target apply
  -> rollback
  -> final evidence dashboard

V31 Continuation Proof Layer
  -> repeatable asset production evidence
  -> layered rig runtime evidence or stable blocked reason
  -> named real sample set
  -> photo-to-action candidate closure
  -> continuation final gate
```

## Component Responsibilities

| Component | Responsibility | Output |
| --- | --- | --- |
| High-quality asset source registry | Records route: professional frame pack, layered rig, photo-derived candidate, provider candidate, or reject baseline. | Route metadata and evidence boundary. |
| Art quality rubric | Defines visible polish requirements and rejects placeholder art. | Human-readable pass/fail criteria. |
| Professional frame pack adapter | Imports manually produced high-quality 8-action frames. | Normalized pack and license metadata. |
| Layered rig adapter | Produces controlled head/body/legs/tail/ears/eyes motion from part layers or external animation tool exports. | Normalized frames or supported runtime payload. |
| Photo character designer | Converts user photo and confirmed traits into a stable character design candidate. | Character sheet / canonical design candidate. |
| Key-pose candidate builder | Produces action key poses from local or provider-assisted route. | Candidate frames, never final acceptance. |
| V31 QA aggregator | Combines V30 semantic QA, art quality, identity, action appeal, timing, and readability checks. | Safe scores and reasonCodes. |
| Visual evidence renderer | Builds HTML with screenshots/playback/contact sheets and old-vs-new comparison. | Human-review report. |
| Approved apply controller | Reuses target-only apply and rollback constraints. | Safe runtime activation. |
| Repeatable production tracker | Compares multiple asset candidates against the same route contract and QA. | Evidence that production is repeatable or a scoped blocked reason. |
| Named sample-set controller | Defines accepted, blocked, and negative photo samples without exposing private data. | Sample-set status, reasonCodes, and scoped claim boundary. |

## Data Flow

```text
asset source or cat photo
  -> route metadata
  -> character / action design contract
  -> frame or rig candidate
  -> normalized pack
  -> semantic QA
  -> visual art QA
  -> identity and action appeal QA
  -> human visual review
  -> isolated preview
  -> approved-only target apply
  -> rollback-capable runtime state
```

Continuation data flow:

```text
named sample set or repeatable asset route
  -> source / consent / license boundary
  -> candidate production
  -> normalized frames or supported runtime payload
  -> V30 semantic QA + V31 art QA
  -> visual report with screenshots/contact sheet/playback
  -> preview
  -> approved-only target apply
  -> rollback
  -> scoped final claim or blocked/failed evidence
```

## Route Priority

| Priority | Route | Why |
| --- | --- | --- |
| P0 | Professional high-quality sprite / frame pack | Most likely to satisfy visual target quickly. |
| P1 | Layered 2D rig / Spine-like / Live2D-like export | Scales production and reduces stiffness. |
| P2 | Photo -> character design -> key poses | Realistic path for arbitrary-cat personalization. |
| P3 | Provider key-pose candidate | Useful only as candidate input with local QA. |
| Reject-only | Existing simplified SVG / transform-only assets | Negative evidence, not product target. |

## Safe Data Boundary

Evidence and renderer payloads may include safe pack IDs, action IDs, route
names, visual scores, redacted metadata, and embedded generated screenshots.

Evidence must not include token values, Authorization headers, raw provider
responses, raw HTTP payloads, raw photo bytes, EXIF/GPS, full local paths,
private filenames, raw prompts, workspace paths, config paths, or Petdex copied
assets.
