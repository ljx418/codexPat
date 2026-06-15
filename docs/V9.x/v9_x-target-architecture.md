# V9.x Target Architecture

status: active
date: 2026-06-03

## Data Flow

```text
User photo/traits
-> ProviderConsentBoundary
-> ProviderJobAdapter
-> ProviderOutputStaging
-> OutputSanitizer
-> AssetManifestGenerator / GLTFNormalizer
-> LocalImportValidator
-> AssetPackStore
-> Preview / Runtime QA
-> PetInstance activation
```

## Provider Paths

| Path | Provider | Output | Local pipeline |
| --- | --- | --- | --- |
| static 2D | MiniMax | JPEG/PNG action images | convert to PNG, manifest, import |
| dynamic 2D | MiniMax | multiple JPEG/PNG frames | convert to PNG, V8.9 assembler, import |
| 3D | Tripo3D | GLB/GLTF | GLTF scan, normalize, import |

## Safe Runtime Boundary

Renderer input remains limited to:

- safe action ID
- renderer kind
- safe profile / pack IDs
- playback intent
- scale
- visibility

Renderer must not receive raw provider responses, raw prompts, source photos,
tokens, auth headers, full local paths, workspace paths, config paths,
or remote URLs.
