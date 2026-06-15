# V21 Route Comparison Matrix

文档状态：planned route matrix。  
当前日期：2026-06-14。

| Route | Why It Exists | Expected Strength | Main Weakness | Product Risk | Acceptance Target |
| --- | --- | --- | --- | --- | --- |
| A Provider key-pose -> local pack | V20 provider output contains useful poses but not strict sheet | reuses real provider cat variations | key poses may not cover all actions | medium | one provider-derived pack passes QA |
| B Alternate provider preflight | MiniMax may not be best sheet provider | may find better reference-image/video/sprite capability | credentials/cost/availability | high | capability decisions; optional scoped live smoke |
| C Unified character + local rig | local control can fix consistency and background | same-cat and loop closure are controllable | may look less organic | medium | one rig-generated pack passes QA |
| D Image-to-video -> frames | video models can produce stronger motion | natural high-amplitude movement | background/drift/cropping | high | extracted frames pass or route blocked/excluded |

## Selection Rule

The best route is not the most ambitious route. It is the route that passes:

```text
8 actions + same cat + visible motion + no background + no flicker + preview + target apply + rollback
```

## Expected Outcome

V21 may end with:

- one winning route；
- multiple comparable routes；
- no route passed, with V19 fallback preserved。

All outcomes are valid if evidence is honest.
