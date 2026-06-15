# V8.x Target Architecture

status: active
date: 2026-06-03

## Scope

V8 adds provider-backed photo-to-3D productization on top of the accepted V7
personalized asset workflow. It must preserve the existing local asset security
boundary and runtime renderer contract. V8.9-V8.11 add a separate animated 2D
sprite extension for local frame-sequence assembly and visual QA.

## Target Data Flow

```text
Local Photo / User Traits
  -> PhotoPrivacyBoundary
  -> TraitApprovalSession
  -> ProviderConsentBoundary
  -> ProviderJobAdapter
  -> ProviderOutputStaging
  -> LicenseRetentionReview
  -> GLTFDeepScanner
  -> AssetNormalizer
  -> ActionClipMapper
  -> AssetImportService
  -> PerPetInstanceActivation
  -> CatActionResolver
  -> RendererRegistry
  -> RuntimeVisualQA
  -> EvidenceCollector
```

## Animated Sprite Extension Data Flow

```text
Local Frame Folder
  -> AnimatedSpriteAssembler
  -> ManifestGenerator
  -> AssetImportService
  -> PerPetInstanceActivation
  -> CatActionResolver
  -> SpriteRenderer
  -> RuntimeVisualQA
  -> EvidenceCollector
```

## Component Responsibilities

| Component | Responsibility | Must Not Do |
| --- | --- | --- |
| PhotoPrivacyBoundary | obtain explicit local photo/trait consent | upload or persist raw photo by default |
| TraitApprovalSession | stores user-approved safe traits | store full local paths, EXIF/GPS, raw prompt history |
| ProviderConsentBoundary | shows provider, cost, privacy, retention, license, upload scope | hide upload/cost/retention terms |
| ProviderJobAdapter | submits approved request to named provider and receives output | log credentials, raw payload, raw photo, or raw response |
| ProviderOutputStaging | stores provider output in temporary quarantined staging | activate output directly or load remote URLs at runtime |
| LicenseRetentionReview | records safe license/attribution/retention decision | infer distribution rights without evidence |
| GLTFDeepScanner | scans GLB/GLTF internal resources and complexity limits | log raw JSON chunks or local paths |
| AssetNormalizer | converts accepted output into local asset pack structure | invent missing action clips silently |
| ActionClipMapper | maps core actions to clips or explicit fallbacks | claim full action coverage when using fallback |
| AssetImportService | imports only validated normalized packs | import partial/corrupt packs |
| PerPetInstanceActivation | activates one target PetInstance only | fallback to default or mutate unrelated pets |
| RendererRegistry | renders safe pack/action/profile IDs | receive raw provider/photo/prompt payload |
| RuntimeVisualQA | captures visible, bounded, nonblank evidence | treat provider job success as runtime visual success |
| EvidenceCollector | writes sanitized reports and screenshots | write token, Authorization, prompt, full path, raw payload |

## Animated Sprite Component Responsibilities

| Component | Responsibility | Must Not Do |
| --- | --- | --- |
| AnimatedSpriteAssembler | scan and validate local PNG frame groups | persist source folder path or accept remote URLs |
| ManifestGenerator | create safe `schemaVersion: "5.8"` sprite manifest with `frameFiles` and `fps` | generate scripts, absolute paths, provider payloads, or raw photo metadata |
| AssetImportService | import generated manifest through app-managed validation | bypass existing import validation |
| PerPetInstanceActivation | optionally activate one target PetInstance | mutate default/unrelated pets or fallback silently |
| SpriteRenderer | play safe imported frames by action ID | receive source paths, prompt text, provider payloads, or raw events |
| RuntimeVisualQA | prove visibility, frame changes, scale, fallback, and isolation | treat manifest generation as runtime animation evidence |

## Runtime Renderer Contract

Renderer adapter may receive only:

- safe action ID.
- renderer kind.
- safe profile/pack IDs.
- playback intent.
- scale.
- visibility.

Renderer adapter must not receive:

- raw photo or photo metadata.
- provider request or response.
- provider credential.
- prompt text.
- local source path.
- remote URL.
- raw manifest or GLTF chunks.
- raw Agent/Codex/terminal/MCP/HTTP payload.
- token or Authorization.

## GLTF / GLB Deep Scan

V8.3 must scan before normalization or activation:

- reject `http://`, `https://`, `file://`, `javascript:`, and `data:` URI.
- reject external `.bin` or external image references in local single-file mode.
- reject absolute paths and path traversal.
- reject unknown `extensionsRequired` unless allowlisted.
- enforce max file size, mesh count, material count, texture count, animation
  count, animation duration, and node count.
- require accepted clip names or explicit action fallback mapping.
- record only safe field names and decisions in evidence.

## Action Coverage Model

Required actions:

```text
idle
thinking
running
success
warning
error
need_input
sleeping
```

Coverage states:

- `clip_present`: named clip exists and maps to action.
- `fallback_clip`: action maps to a safe fallback clip.
- `static_fallback`: action uses visible static GLB state.
- `css_fallback`: runtime falls back to safe CSS cat.
- `blocked`: action cannot be accepted.

V8.7 cannot claim action-ready 3D if any required action is `blocked`.

## Evidence Boundary

Evidence may include:

- provider name and scenario.
- consent timestamp.
- redacted credential state.
- provider job status and stable reason code.
- GLTF scan decision.
- action coverage table.
- screenshot/recording file names.
- performance baseline.

Evidence must not include raw provider response, raw photo, prompt text, full
local paths, provider credentials, Authorization headers, tokens, remote URLs,
or raw GLTF JSON chunks.

Animated sprite evidence may include safe frame counts, fps, safe action IDs,
safe pack IDs, renderer kind, target PetInstance ID, screenshot/recording file
names, and redacted diagnostics. It must not include source folder path, full
local paths, prompt text, provider payloads, raw photo data, credentials, tokens,
Authorization headers, or raw manifest paths.
