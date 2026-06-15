# V15.10 Trait Prompt Pack Smoke Evidence

status: passed
date: 2026-06-10

## Scope

V15.10 validates user-approved safe cat traits and digest-only 8-action prompt
pack generation for the photo-guided 2D action asset workflow. It does not call
a provider, does not upload photos, does not export full prompt text, and does
not claim automatic photo-to-2D readiness.

## Approved Trait Table

| Field | Value |
| --- | --- |
| traitId | orange-tabby-approved |
| safeTraitFields | approved,approvedAt,bodyBuild,coatColor,distinctiveNotes,eyeColor,faceShape,pattern,tailNotes,traitId |
| coatColor | warm orange |
| pattern | classic tabby stripes with white chest |
| eyeColor | amber |
| faceShape | round kitten-like |
| bodyBuild | small sitting companion |
| tailNotes | curled fluffy tail |
| distinctiveNotes | soft cheeks and symmetrical forehead stripes |
| approved | true |
| hasApprovedAt | true |

## 8 Action Prompt Coverage

| Action | Prompt Digest | Frame Intent | Expected Frames | Safe Summary |
| --- | --- | --- | ---: | --- |
| idle | prompt_47580e61 | loop | 6 | idle; same cat with warm orange coat; classic tabby stripes with white chest pattern; amber eyes; round kitten-like face; small sitting companion body; curled fluffy tail tail; safe notes: soft cheeks and symmetrical forehead stripes; 6 frame loop sprite intent |
| thinking | prompt_2aa98b5f | loop | 6 | thinking; same cat with warm orange coat; classic tabby stripes with white chest pattern; amber eyes; round kitten-like face; small sitting companion body; curled fluffy tail tail; safe notes: soft cheeks and symmetrical forehead stripes; 6 frame loop sprite intent |
| running | prompt_ff133dbc | loop | 6 | running; same cat with warm orange coat; classic tabby stripes with white chest pattern; amber eyes; round kitten-like face; small sitting companion body; curled fluffy tail tail; safe notes: soft cheeks and symmetrical forehead stripes; 6 frame loop sprite intent |
| success | prompt_19ae41ff | transient | 3 | success; same cat with warm orange coat; classic tabby stripes with white chest pattern; amber eyes; round kitten-like face; small sitting companion body; curled fluffy tail tail; safe notes: soft cheeks and symmetrical forehead stripes; 3 frame transient sprite intent |
| warning | prompt_8be6f956 | transient | 3 | warning; same cat with warm orange coat; classic tabby stripes with white chest pattern; amber eyes; round kitten-like face; small sitting companion body; curled fluffy tail tail; safe notes: soft cheeks and symmetrical forehead stripes; 3 frame transient sprite intent |
| error | prompt_bfaf4dd8 | priority | 3 | error; same cat with warm orange coat; classic tabby stripes with white chest pattern; amber eyes; round kitten-like face; small sitting companion body; curled fluffy tail tail; safe notes: soft cheeks and symmetrical forehead stripes; 3 frame priority sprite intent |
| need_input | prompt_efa86d91 | priority | 3 | need_input; same cat with warm orange coat; classic tabby stripes with white chest pattern; amber eyes; round kitten-like face; small sitting companion body; curled fluffy tail tail; safe notes: soft cheeks and symmetrical forehead stripes; 3 frame priority sprite intent |
| sleeping | prompt_a4c95aba | loop | 6 | sleeping; same cat with warm orange coat; classic tabby stripes with white chest pattern; amber eyes; round kitten-like face; small sitting companion body; curled fluffy tail tail; safe notes: soft cheeks and symmetrical forehead stripes; 6 frame loop sprite intent |

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| desktop test | passed | exit=0 |
| desktop check | passed | exit=0 |
| approved trait table accepted | passed | status=accepted; reasonCode=prompt_pack_ready; traitId=orange-tabby-approved |
| 8 action prompt coverage | passed | actionCount=8; actions=idle,thinking,running,success,warning,error,need_input,sleeping |
| prompt digest list only | passed | digestCount=8; fullPromptPrinted=false |
| frame intent and expected count model | passed | loop=4x6; priority=2x3; transient=2x3 |
| traits approval required | passed | status=rejected; reasonCode=traits_approval_required |
| absolute path trait | passed | status=rejected; reasonCode=trait_schema_invalid |
| remote URL trait | passed | status=rejected; reasonCode=trait_schema_invalid |
| token-like trait | passed | status=rejected; reasonCode=trait_schema_invalid |
| security redaction scan | passed | no raw photo, source filename, full path, EXIF/GPS payload, token, Authorization, raw prompt text, prompt text, or raw provider response |
| claim scan | passed | V15.10 claim remains scoped and forbidden claims stay forbidden/not-ready |
| PRD/spec review | passed | active PRD, V15 plan, detailed spec, and acceptance plan align with V15.10 |

## Security Boundary

Evidence records only approved safe traits, action IDs, prompt digests, frame
intent, expected frame counts, and safe summaries. It excludes raw photo bytes,
source filename, full local path, EXIF/GPS payload, token, Authorization, full
prompt text, raw prompt text, raw provider request, and raw provider response.

## Allowed Claim

V15.10 cat trait review and 8-action prompt pack generation passed for tested local scenarios.

## Forbidden Claims

This evidence does not claim automatic photo-to-2D ready, automatic
photo-to-animation ready, provider integration verified, photo customization
ready for arbitrary cats, Petdex parity, 3D ready, automatic photo-to-3D ready,
production signed release ready, cross-platform ready, or Windows ready.
