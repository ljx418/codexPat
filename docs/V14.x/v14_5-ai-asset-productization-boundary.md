# V14.5 AI Asset Productization Boundary

日期：2026-06-09  
状态：planned。  

## Objective

Give ordinary users a clear AI-assisted asset workflow without claiming automatic photo-to-3D or provider readiness.

## Supported Paths

1. Prompt-only 2D action pack guide.
2. Provider-assisted 2D generation with explicit consent.
3. External 3D provider import guide.

## Photo Boundary

- no default upload.
- no raw photo persistence by default.
- no EXIF/GPS persistence.
- no full source path persistence.
- only user-approved trait metadata may be stored.

## Provider Boundary

Before any provider-assisted path, the UI must show:

- provider choice.
- upload consent.
- cost note.
- privacy note.
- retention note.
- license / attribution note.
- credential redaction note.

Provider credential must never enter:

- asset manifest.
- evidence.
- renderer payload.
- generated prompt output.
- diagnostic export.

Raw provider response must not be logged into evidence.

## Output Boundary

Generated output must pass:

- V14.2 AnimationPackLinter.
- existing local import validation.
- license / attribution scan.
- security scan.

## Forbidden Claims

V14.5 must not claim:

```text
automatic photo-to-3D ready
provider integration verified
3D ready
remote generation ready
asset marketplace ready
```
