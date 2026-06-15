# V20 MiniMax Live Smoke Request Spec

文档状态：planned provider request spec；V20 Mainland Provider Motion Sheet。  
当前日期：2026-06-14。

## Purpose

This file freezes the V20.2 MiniMax live smoke request contract. It exists to
prevent provider smoke from becoming an ambiguous "generate something" test.
V20.2 must either produce a real MiniMax reference-image motion sheet candidate
or record a blocked/failed reason.

## Provider Boundary

Provider:

- MiniMax / 海螺
- Model family: existing project MiniMax image provider path
- Required capability: reference image / image-to-image using the user-approved
  cat photo
- Required output goal: one 8-row x 9-column motion sheet image

Credential handling:

- Credential is loaded through existing environment/dotenv boundary.
- Credential value must never be printed.
- Authorization header must never be printed.
- Evidence can record only `credentialState=configured|missing`.

## Input Contract

Allowed provider input:

- user-approved local cat image bytes during execution only.
- safe media metadata: media type, size bucket, dimensions.
- prompt template text generated from this spec.
- action row order.
- output format request.

Forbidden in evidence/logs:

- raw photo bytes.
- full local source path.
- original private filename.
- EXIF/GPS.
- raw provider request body.
- token / Authorization.

## Prompt Contract

The provider prompt must request:

```text
Create one transparent-background 2D animated desktop pet motion sheet from the
reference cat image. Preserve the same cat identity, face, fur color, markings,
and cute proportions across all frames. Output exactly 8 rows and 9 columns.
Each cell is one frame. No text labels. No borders. No background scene. No
props except subtle action props where necessary. Keep the cat centered on a
transparent background and keep the body scale consistent.

Row order:
1 idle: calm breathing, tiny tail movement
2 thinking: looking up / pondering, visible head and ear motion
3 running: clear running cycle with larger leg motion
4 success: happy hop / celebratory pose
5 warning: alert ears / surprised posture
6 error: dizzy or frustrated pose, visibly different
7 need_input: paw raised / asking attention
8 sleeping: curled or sleepy breathing loop

The first and final frame of loop actions should close smoothly. Avoid camera
movement, background movement, identity drift, and large scale drift.
```

The implementation may translate or shorten the prompt for provider limits, but
must preserve:

- one sheet output.
- 8 rows.
- 9 columns.
- row order.
- transparent/no background.
- same-cat identity.
- high-amplitude action requirement.
- no labels/borders.

## Output Contract

Accepted output may proceed to V20.3 only if:

- one generated image is returned.
- image is readable by local decoder.
- image is plausibly a grid/sheet, not separate unrelated illustrations.
- safe output file is stored in documented evidence asset path.

Blocked/failed reasons:

- `provider_credential_missing`
- `provider_consent_required`
- `provider_terms_required`
- `provider_unavailable`
- `provider_reference_not_supported`
- `provider_output_missing`
- `provider_output_not_single_sheet`
- `provider_output_rejected`

## Evidence Contract

V20.2 evidence must include:

- providerName.
- endpointHost.
- model.
- capability.
- `reference_image_attached: true` when any reference-image claim is made.
- `provider_capability: reference_image_supported` when the request path is accepted.
- `text_to_image_only: false` when any reference-image claim is made.
- reasonCode.
- promptHash.
- promptLength.
- imageCount.
- outputKind.
- safe generated file names.
- decision: passed / blocked / failed.

If these fields cannot be truthfully recorded, V20.2 must be blocked or failed:

- `reference_image_attached`
- `provider_capability`
- `text_to_image_only`

It must not include:

- raw prompt text if it contains user private traits.
- raw provider response.
- raw request body.
- base64 image content.
- token.
- Authorization.
- full local path.
