# V21 Implementation Contract

文档状态：planned implementation contract。  
当前日期：2026-06-14。

## Route Adapter Contract

Every route adapter returns only safe summaries:

```ts
type V21RouteStatus = "passed" | "blocked" | "failed" | "excluded";

interface V21RouteResult {
  routeId: "route_a_keypose" | "route_b_provider" | "route_c_local_rig" | "route_d_video";
  status: V21RouteStatus;
  reasonCode: string;
  safeInputSummary: Record<string, string | number | boolean>;
  safeOutputSummary: Record<string, string | number | boolean>;
  candidatePackId?: string;
  qaSummary?: V21QaSummary;
}
```

Forbidden fields:

- raw provider response；
- raw photo bytes；
- raw HTTP request/response；
- token；
- Authorization；
- full local path；
- private filename；
- EXIF/GPS；
- prompt private text；
- shell command；
- config path；
- workspace path。

## Common QA Contract

```ts
interface V21QaSummary {
  allCoreActionsPresent: boolean;
  nonblankPassed: boolean;
  offCanvasPassed: boolean;
  sameCatPassed: boolean;
  backgroundPassed: boolean;
  loopClosurePassed: boolean;
  adjacentDeltaPassed: boolean;
  motionAmplitudePassed: boolean;
  scaleReadabilityPassed: boolean;
  reasonCodes: string[];
}
```

## Preview Contract

Preview must be isolated:

- does not call notify；
- does not send PetEvent；
- does not write CatStateMachine；
- does not mutate live PetInstance；
- does not activate/delete/rollback pack。

## Apply Contract

Apply must:

- require QA passed pack；
- target one PetInstance；
- preserve previous active pack；
- support rollback；
- never fallback to default instance silently。

## Stable ReasonCodes

Minimum required reasonCodes:

- route_input_missing
- provider_capability_missing
- provider_consent_required
- credential_missing
- output_not_motion_sheet
- action_mapping_incomplete
- background_not_safe
- same_cat_failed
- motion_amplitude_too_low
- loop_closure_failed
- adjacent_delta_failed
- pack_assembly_failed
- preview_failed
- apply_failed
- rollback_failed
- route_blocked
- route_excluded
