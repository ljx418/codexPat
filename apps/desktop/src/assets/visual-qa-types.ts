import { CORE_ACTION_IDS, type SafeActionId } from "./asset-manifest";

export type VisualQACheckResult = {
  actionId: SafeActionId;
  nonblank: boolean;
  hasBoundingBox: boolean;
  scaleCorrect: boolean;
  visible: boolean;
  reasonCode: string;
  screenshotPath: string | null;
};

export type VisualQAPackResult = {
  packId: string;
  provider: string;
  timestamp: string;
  checks: VisualQACheckResult[];
  anyFailed: boolean;
  failedActions: SafeActionId[];
  evidenceFile: string | null;
  errors: string[];
};

// Reason codes for QA checks
export const QA_REASON_CODES = {
  QA_PASS: "qa_pass",
  QA_FAIL_NONBLANK: "qa_fail_nonblank",
  QA_FAIL_BOUNDS: "qa_fail_bounds",
  QA_FAIL_SCALE: "qa_fail_scale",
  QA_FAIL_VISIBLE: "qa_fail_visible",
  QA_SKIP_NO_PACK: "qa_skip_no_pack",
  QA_SKIP_NO_ASSET: "qa_skip_no_asset",
  QA_ERROR: "qa_error"
} as const;

export type QAReasonCode = typeof QA_REASON_CODES[keyof typeof QA_REASON_CODES];

export function createVisualQACheck(
  actionId: SafeActionId,
  result: Partial<VisualQACheckResult> & { reasonCode: QAReasonCode }
): VisualQACheckResult {
  return {
    actionId,
    nonblank: result.nonblank ?? false,
    hasBoundingBox: result.hasBoundingBox ?? false,
    scaleCorrect: result.scaleCorrect ?? false,
    visible: result.visible ?? false,
    screenshotPath: result.screenshotPath ?? null,
    reasonCode: result.reasonCode
  };
}

export function createVisualQAPackResult(
  packId: string,
  provider: string,
  checks: VisualQACheckResult[]
): VisualQAPackResult {
  const failedActions = checks
    .filter(c => c.reasonCode !== QA_REASON_CODES.QA_PASS && !c.reasonCode.startsWith("qa_skip"))
    .map(c => c.actionId);

  return {
    packId,
    provider,
    timestamp: new Date().toISOString(),
    checks,
    anyFailed: failedActions.length > 0,
    failedActions,
    evidenceFile: null,
    errors: []
  };
}

export function validateVisualQAResult(result: VisualQAPackResult): {
  ok: boolean;
  blockedActions: SafeActionId[];
} {
  const blockedActions = result.checks
    .filter(c => {
      // A check fails if it has a non-pass reason that's not a skip
      const isFail = c.reasonCode !== QA_REASON_CODES.QA_PASS &&
                     !c.reasonCode.startsWith("qa_skip");
      // Also fail if nonblank/hasBoundingBox/scaleCorrect/visible are false
      const hasFailures = !c.nonblank || !c.hasBoundingBox || !c.scaleCorrect || !c.visible;
      return isFail || hasFailures;
    })
    .map(c => c.actionId);

  return { ok: blockedActions.length === 0, blockedActions };
}

// Sanitize evidence - remove any paths that could contain secrets
export function sanitizeEvidenceForExport(result: VisualQAPackResult): VisualQAPackResult {
  return {
    ...result,
    packId: result.packId.replace(/[^A-Za-z0-9._-]/g, "_"),
    evidenceFile: result.evidenceFile
      ? result.evidenceFile.replace(/\/Users\/[^\/]+/, "[REDACTED_PATH]")
               .replace(/\/tmp\/[^\/]+/, "[REDACTED_TMP]")
               .replace(/sk-[A-Za-z0-9_-]{4,}/g, "sk-...xxxx")
      : null,
    checks: result.checks.map(c => ({
      ...c,
      screenshotPath: c.screenshotPath
        ? c.screenshotPath.replace(/\/Users\/[^\/]+/, "[REDACTED_PATH]")
                         .replace(/\/tmp\/[^\/]+/, "[REDACTED_TMP]")
        : null
    }))
  };
}

// Check that all 8 core actions are covered
export function validateActionCoverage(checks: VisualQACheckResult[]): {
  ok: boolean;
  missingActions: SafeActionId[];
} {
  const checkedActions = new Set(checks.map(c => c.actionId));
  const missingActions = CORE_ACTION_IDS.filter(id => !checkedActions.has(id));
  return { ok: missingActions.length === 0, missingActions };
}