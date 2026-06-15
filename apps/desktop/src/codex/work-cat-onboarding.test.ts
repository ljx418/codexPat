import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { codexWorkCatSummary, createCodexWorkCatOnboarding, sanitizeWorkCatName } from "./work-cat-onboarding";

describe("V6.2 Codex work-cat onboarding", () => {
  it("generates scoped wrapper-managed commands and guidance", () => {
    const onboarding = createCodexWorkCatOnboarding("Review Cat");

    assert.equal(onboarding.recommendedMode, "jsonl");
    assert.match(onboarding.jsonlCommand, /codex session start --mode exec --monitor jsonl/);
    assert.match(onboarding.jsonlCommand, /codex exec --json "<task>"/);
    assert.match(onboarding.tuiHookCommand, /codex session start --mode tui --monitor hooks/);
    assert.equal(onboarding.alreadyOpenSupported, false);
    assert.equal(onboarding.diagnostics.hookStatus, "trust_required");
    assert.ok(onboarding.guidance.hooks.includes("/hooks"));
    assert.ok(onboarding.guidance.alreadyOpen.includes("not auto-monitored"));
    assert.ok(onboarding.forbiddenClaims.includes("already-open Codex auto-monitoring ready"));
  });

  it("redacts unsafe names from generated commands", () => {
    const name = sanitizeWorkCatName('Bad "Name" /Users/example sk-test-123456789 https://example.test');
    const onboarding = createCodexWorkCatOnboarding(name);
    const serialized = JSON.stringify(onboarding);

    assert.equal(name, "Bad Name");
    assert.doesNotMatch(serialized, /\/Users\//);
    assert.doesNotMatch(serialized, /sk-test/);
    assert.doesNotMatch(serialized, /https:\/\//);
  });

  it("returns sanitized diagnostics summary only", () => {
    const summary = codexWorkCatSummary(createCodexWorkCatOnboarding("TUI Cat"));

    assert.deepEqual(summary, {
      recommendedMode: "jsonl",
      alreadyOpenSupported: false,
      jsonlStatus: "recommended",
      hookStatus: "trust_required",
      alreadyOpenStatus: "unsupported",
      redactionStatus: "safe_summary_only"
    });
  });
});

