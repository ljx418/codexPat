# V21 Exit Criteria

文档状态：planned exit criteria。  
当前日期：2026-06-14。

## V21 Passed

All of the following must be true:

- V21.0-V21.6 have explicit evidence status；
- at least one route produced a real safe animation pack；
- pack covers 8 core actions；
- common QA passed；
- route comparator HTML shows actual visual result；
- Manager preview shows all actions；
- target-only apply works；
- rollback works；
- security scan passed；
- claim scan passed；
- final claim is route-scoped and evidence-matched。

## V21 Blocked

Use blocked if:

- no route yields a usable pack；
- provider credentials/capabilities are unavailable；
- video route cannot run safely；
- local rig route cannot meet motion/readability threshold；
- V19 fallback remains the only accepted product path。

## V21 Failed

Use failed if:

- a QA failed pack can be applied；
- preview mutates live PetInstance；
- evidence leaks sensitive data；
- final report claims broader readiness than evidence supports；
- route output hides blank/transparent/off-canvas frames by fallback without disclosing it。

## Required Final Report Sections

- status；
- date；
- commit；
- route summary table；
- visual comparison link/embedded screenshots；
- best route decision；
- QA result；
- apply/rollback result；
- security scan；
- claim scan；
- allowed claim；
- forbidden claims；
- final decision。
