import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createSanitizedDiagnosticsExport,
  diagnosticsExportHasForbiddenContent,
  releaseFoundationStatus
} from "./release-foundation";

describe("V6.1 release foundation", () => {
  it("keeps release readiness claims scoped to local macOS packaging foundation", () => {
    const status = releaseFoundationStatus();

    assert.equal(status.productName, "Agent Desktop Pet");
    assert.equal(status.platform, "macos");
    assert.equal(status.buildFlavor, "local_unsigned");
    assert.ok(status.firstRunGuide.some((item) => item.includes("Codex Work-Cat")));
    assert.ok(status.permissionNotes.some((item) => item.includes("terminal text")));
    assert.ok(status.releaseChecklist.some((item) => item.includes("Notarization")));
    assert.ok(status.forbiddenClaims.includes("production signed release ready"));
    assert.ok(status.forbiddenClaims.includes("auto update ready"));
  });

  it("creates a diagnostics export without local paths, credentials, or raw prompt/tool content", () => {
    const exported = createSanitizedDiagnosticsExport({
      appEnabled: true,
      listenAddress: "127.0.0.1:17321 /Users/example/secret",
      queueLength: 2,
      queueCapacity: 32,
      muted: false,
      instanceCount: 3,
      importedPackCount: 1,
      lastAcceptedLevel: "success raw payload sk-test-123456789",
      lastAcceptedSourceKind: "codex",
      lastRejectedReasonCode: "config path /Users/example/.config/api-token.json"
    });

    assert.doesNotMatch(exported, /\/Users\//);
    assert.doesNotMatch(exported, /api-token\.json/);
    assert.doesNotMatch(exported, /sk-test/);
    assert.doesNotMatch(exported, /raw payload/i);
    assert.doesNotMatch(exported, /config path/i);
    assert.equal(diagnosticsExportHasForbiddenContent(exported), false);
    assert.match(exported, /"schemaVersion": "6\.1"/);
  });
});

