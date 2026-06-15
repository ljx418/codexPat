# V16 Claim Matrix

状态：passed scoped；claims require matching evidence。  
日期：2026-06-11。

## Allowed Claims

| Phase | Allowed Claim |
| --- | --- |
| V16.0 | V16 provider-backed photo-to-2D multi-action generation scope frozen with claim boundaries. |
| V16.1 | V16 provider credential, consent, disclosure, and redaction boundary passed for tested local scenarios. |
| V16.2 | V16 named-provider 2D multi-action generation smoke passed for the tested local cat-photo scenario. |
| V16.3 | V16 same-cat consistency review passed for tested provider-generated 2D action frames. |
| V16.4 | V16 provider-generated 2D frames packaged into a safe local animation pack for tested scenarios. |
| V16.5 | V16 generated 2D action pack preview, target-pet apply, and rollback UX passed for tested local scenarios. |
| V16.6 | V16 provider-backed photo-to-2D multi-action generation passed for the tested named provider and local cat-photo scenario. |

## Blocked Claim Wording

If provider output is missing:

```text
V16 provider-backed photo-to-2D generation remains blocked on accepted named-provider multi-action output.
```

If same-cat consistency fails:

```text
V16 provider-generated frames were rejected by same-cat consistency review; previous visible pack was preserved.
```

## Forbidden Claims

These must appear only in forbidden/not-ready/not-implied contexts:

```text
automatic photo-to-2D ready for arbitrary cats
automatic photo-to-animation ready
provider integration verified
Petdex parity achieved
3D ready
automatic photo-to-3D ready
remote asset loading ready
asset marketplace ready
production signed release ready
notarized release ready
auto update ready
cross-platform ready
Windows ready
```

## Claim Basis Table Required in V16.6

| Capability | Evidence Required | Claim Outcome |
| --- | --- | --- |
| named provider request | consent + credential + redacted request summary | provider smoke scoped |
| 8-action output | safe frame count table and digests | generation scoped |
| same-cat consistency | contact sheet + automated/manual review | consistency scoped |
| local pack activation | V15.12 continuity + target-only apply | preview/apply scoped |
| arbitrary cat readiness | multiple distinct accepted cats and failure handling | not in V16 unless separately evidenced |

## V16.6 Claim Basis

| Capability | Evidence | Outcome |
| --- | --- | --- |
| named provider request | host image tool source sheet + V16.1 consent/disclosure evidence | scoped passed |
| 8-action output | `v16_2-provider-multi-action-generation-2026-06-11.md` | scoped passed |
| same-cat consistency | `v16_3-same-cat-consistency-2026-06-11.md` + contact sheet | scoped passed |
| local pack activation | `v16_4` continuity + `v16_5` target-only apply model | scoped passed |
| arbitrary cat readiness | no multi-cat evidence | not ready / forbidden |
