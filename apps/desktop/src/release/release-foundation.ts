export type ReleaseBuildFlavor = "development" | "local_unsigned" | "signed_planned" | "notarized_planned";

export type ReleaseFoundationStatus = {
  productName: string;
  version: string;
  bundleIdentifier: string;
  buildFlavor: ReleaseBuildFlavor;
  artifactType: string;
  platform: "macos";
  firstRunGuide: string[];
  permissionNotes: string[];
  releaseChecklist: string[];
  forbiddenClaims: string[];
};

export type DiagnosticsExportInput = {
  appEnabled: boolean;
  listenAddress: string;
  queueLength: number;
  queueCapacity: number;
  muted: boolean;
  instanceCount: number;
  importedPackCount: number;
  lastAcceptedLevel?: string | null;
  lastAcceptedSourceKind?: string | null;
  lastRejectedReasonCode?: string | null;
  buildFlavor?: ReleaseBuildFlavor;
};

const FORBIDDEN_EXPORT_PATTERNS = [
  /authorization/gi,
  /bearer\s+[a-z0-9._-]+/gi,
  /sk-[a-z0-9_-]{8,}/gi,
  /api-token\.json/gi,
  /\/Users\/[^\s"',]+/g,
  /workspace path/gi,
  /config path/gi,
  /raw payload/gi,
  /prompt text/gi,
  /tool command/gi
];

export function releaseFoundationStatus(): ReleaseFoundationStatus {
  return {
    productName: "Agent Desktop Pet",
    version: "0.1.0",
    bundleIdentifier: "com.agentdesktoppet.desktop",
    buildFlavor: "local_unsigned",
    artifactType: "macOS app bundle",
    platform: "macos",
    firstRunGuide: [
      "Open the desktop pet and confirm the local Event Bridge health before connecting agents.",
      "Use Codex Work-Cat onboarding for wrapper-launched JSONL sessions; already-open Codex windows are not auto-monitored.",
      "Review /hooks trust instructions before using managed TUI hooks.",
      "Import local asset packs only after manifest validation and app-managed storage copy.",
      "Use diagnostics export preview before sharing support information."
    ],
    permissionNotes: [
      "Basic pet display, local Event Bridge, and asset import do not require terminal text access.",
      "Accessibility or Automation permissions are only relevant to OS-level probe/binding experiments and are not required for wrapper-launched JSONL monitoring.",
      "If optional macOS permissions are denied, unsupported probe features must fail safely with a stable reason code.",
      "Diagnostics must not collect terminal text, prompt text, tool command text, workspace paths, tokens, Authorization headers, clipboard contents, or screen contents."
    ],
    releaseChecklist: [
      "Signing identity selected and documented before signed release acceptance.",
      "Notarization workflow documented and executed before notarized release acceptance.",
      "Gatekeeper first-open note reviewed before external distribution.",
      "DMG or installer strategy chosen before installer readiness claim.",
      "Auto-update requires signature, channel, rollback, and failure-handling evidence before readiness claim."
    ],
    forbiddenClaims: [
      "production signed release ready",
      "notarized release ready",
      "auto update ready",
      "cross-platform ready",
      "Windows ready"
    ]
  };
}

export function createSanitizedDiagnosticsExport(input: DiagnosticsExportInput): string {
  const payload = {
    schemaVersion: "6.1",
    productName: "Agent Desktop Pet",
    version: "0.1.0",
    platform: "macos",
    buildFlavor: input.buildFlavor ?? "local_unsigned",
    localBridge: {
      enabled: input.appEnabled,
      listenAddress: sanitizeScalar(input.listenAddress),
      queueLength: clampNonNegative(input.queueLength),
      queueCapacity: clampNonNegative(input.queueCapacity)
    },
    runtime: {
      muted: input.muted,
      instanceCount: clampNonNegative(input.instanceCount),
      importedPackCount: clampNonNegative(input.importedPackCount)
    },
    lastEventSummary: {
      acceptedLevel: sanitizeScalar(input.lastAcceptedLevel ?? "none"),
      acceptedSourceKind: sanitizeScalar(input.lastAcceptedSourceKind ?? "none"),
      rejectedReasonCode: sanitizeScalar(input.lastRejectedReasonCode ?? "none")
    },
    safetyBoundary: {
      eventBodies: "excluded",
      localFiles: "excluded",
      userInputs: "excluded",
      credentials: "excluded"
    }
  };

  return redactForbidden(JSON.stringify(payload, null, 2));
}

export function diagnosticsExportHasForbiddenContent(value: string): boolean {
  return FORBIDDEN_EXPORT_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(value);
  });
}

function sanitizeScalar(value: string): string {
  return redactForbidden(value)
    .replace(/[^\w .:/@-]/g, "_")
    .slice(0, 120);
}

function redactForbidden(value: string): string {
  return FORBIDDEN_EXPORT_PATTERNS.reduce((current, pattern) => {
    pattern.lastIndex = 0;
    return current.replace(pattern, "[redacted]");
  }, value);
}

function clampNonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}
