# V6.4 Claim Matrix

status: planning-ready

date: 2026-05-30

## Allowed Claim After Acceptance

```text
V6.4 asset manager product UX passed for tested local import and preview scenarios.
```

## Conditional Subclaims

Allowed only when evidence exists:

```text
V6.4 imported pack preview did not mutate active PetInstance renderer mapping in tested local scenarios.
V6.4 imported pack rename/delete/rollback UX passed with sanitized diagnostics in tested local scenarios.
```

## Forbidden Claims

```text
photo customization ready
automatic photo-to-3D ready
provider integration verified
remote generation ready
asset marketplace ready
3D ready
production signed release ready
custom asset marketplace ready
```

## Claim Rules

- Preview does not mean runtime activation unless activation evidence is run separately.
- Local imported pack UX does not mean provider generation is ready.
- GLTF preview does not mean 3D ready.
- Delete/rollback UX does not mean production data migration readiness.
