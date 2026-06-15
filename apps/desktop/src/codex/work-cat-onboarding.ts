export type CodexWorkCatMode = "jsonl" | "hooks" | "already_open";

export type CodexWorkCatOnboarding = {
  recommendedMode: CodexWorkCatMode;
  jsonlCommand: string;
  tuiHookCommand: string;
  alreadyOpenSupported: false;
  diagnostics: {
    jsonlStatus: "recommended";
    hookStatus: "trust_required";
    alreadyOpenStatus: "unsupported";
    redactionStatus: "safe_summary_only";
  };
  guidance: {
    jsonl: string;
    hooks: string;
    alreadyOpen: string;
  };
  forbiddenClaims: string[];
};

export function createCodexWorkCatOnboarding(name = "Codex Work Cat"): CodexWorkCatOnboarding {
  const safeName = sanitizeWorkCatName(name);
  return {
    recommendedMode: "jsonl",
    jsonlCommand: `node packages/petctl/dist/cli.js codex session start --mode exec --monitor jsonl --name "${safeName}" -- codex exec --json "<task>"`,
    tuiHookCommand: `node packages/petctl/dist/cli.js codex session start --mode tui --monitor hooks --name "${safeName}" -- codex`,
    alreadyOpenSupported: false,
    diagnostics: {
      jsonlStatus: "recommended",
      hookStatus: "trust_required",
      alreadyOpenStatus: "unsupported",
      redactionStatus: "safe_summary_only"
    },
    guidance: {
      jsonl: "Recommended reliable path for wrapper-launched codex exec --json sessions. It maps structured JSONL events and does not parse terminal text.",
      hooks: "Managed TUI hooks require running /hooks in Codex and trusting the project hooks before lifecycle evidence can be accepted.",
      alreadyOpen: "Already-open Codex windows are not auto-monitored. Relaunch through the wrapper-managed JSONL or managed TUI hook path."
    },
    forbiddenClaims: [
      "all Codex workflows verified",
      "OS-level Codex window binding ready",
      "already-open Codex auto-monitoring ready",
      "interactive Codex TUI monitoring ready"
    ]
  };
}

export function sanitizeWorkCatName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Codex Work Cat";
  }
  const safe = trimmed
    .replace(/[\u0000-\u001F\u007F"\\]/g, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/file:\/\/\S+/gi, "")
    .replace(/\/Users\/\S+/g, "")
    .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, "")
    .trim()
    .slice(0, 40);
  return safe || "Codex Work Cat";
}

export function codexWorkCatSummary(onboarding: CodexWorkCatOnboarding) {
  return {
    recommendedMode: onboarding.recommendedMode,
    alreadyOpenSupported: onboarding.alreadyOpenSupported,
    jsonlStatus: onboarding.diagnostics.jsonlStatus,
    hookStatus: onboarding.diagnostics.hookStatus,
    alreadyOpenStatus: onboarding.diagnostics.alreadyOpenStatus,
    redactionStatus: onboarding.diagnostics.redactionStatus
  };
}

