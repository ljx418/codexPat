# V18 Exit Criteria

日期：2026-06-12  
状态：planned。

## Product Exit Criteria

V18 can pass only when all are true:

- User selects a real local cat image in the Desktop Manager wizard.
- User explicitly consents before provider upload/generation.
- A real image-to-image/reference-image provider job returns output.
- Output is normalized into 8 core actions.
- Generated pack passes same-cat and continuity QA.
- User previews all 8 actions in-app.
- User applies the pack to a selected target pet.
- Default and unrelated pets remain unchanged.
- User can rollback to the previous active pack.
- Final HTML embeds screenshots/evidence, not only links.

## Security Exit Criteria

- No token.
- No Authorization.
- No raw provider response.
- No raw photo bytes.
- No EXIF/GPS.
- No full local path.
- No workspace/config path.
- No API token file contents.
- No raw HTTP payload.
- No prompt text containing private data.

## Hard Fail Conditions

- Provider output is missing but V18 final is marked passed.
- V17 text-to-image action sheet is used as V18 provider-photo evidence.
- QA failed pack can be applied.
- Apply changes default or unrelated pets.
- Invalid pack removes or hides previous visible pet.
- Evidence leaks token, Authorization, full local path, raw provider payload, or raw photo bytes.
- Forbidden claim is used as ready.

## V18 Final No-go

V18.6 is No-Go until V18.1-V18.5 each has passed/blocked/failed evidence.
