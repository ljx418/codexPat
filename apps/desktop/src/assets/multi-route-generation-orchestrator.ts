import { CORE_ACTION_IDS, type CoreActionId, type RendererKind } from "./asset-manifest";
import type { PhotoSuitabilityResult } from "./photo-suitability-traits";

const SAFE_ID_PATTERN = /^[A-Za-z0-9._-]{1,96}$/;
const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export const V24_ROUTE_IDS = [
  "route_a_provider_key_pose",
  "route_b_provider_action_sheet",
  "route_c_local_rig",
  "route_d_image_to_video",
  "route_e_local_fallback_style_pack"
] as const;

export type V24RouteId = (typeof V24_ROUTE_IDS)[number];

export type V24RouteState =
  | "unavailable"
  | "queued"
  | "running"
  | "output_received"
  | "candidate_created"
  | "blocked"
  | "failed";

export type V24ReasonCode =
  | "v23_prerequisite_missing"
  | "better_photo_required"
  | "route_registered"
  | "route_unavailable"
  | "provider_credential_missing"
  | "provider_consent_required"
  | "route_budget_exhausted"
  | "route_output_missing"
  | "route_output_rejected"
  | "candidate_created"
  | "action_coverage_incomplete"
  | "safe_candidate_metadata_ready"
  | "previous_pack_preserved"
  | "live_pet_unchanged"
  | "unsafe_field_detected";

export type V24RouteInput = {
  supported?: boolean;
  credentialRequired?: boolean;
  credentialPresent?: boolean;
  consentRequired?: boolean;
  consentAccepted?: boolean;
  attemptsRequested?: number;
  outputKind?: "none" | "provider_output" | "local_output";
  candidateId?: string;
  safePackId?: string;
  rendererKind?: Extract<RendererKind, "sprite">;
  actionCoverage?: CoreActionId[];
  failureReason?: Extract<V24ReasonCode, "route_output_missing" | "route_output_rejected" | "action_coverage_incomplete">;
};

export type V24RouteResult = {
  routeId: V24RouteId;
  state: V24RouteState;
  attemptBudget: {
    requested: number;
    allowed: number;
  };
  reasonCodes: V24ReasonCode[];
  candidate?: {
    candidateId: string;
    safePackId: string;
    rendererKind: Extract<RendererKind, "sprite">;
    actionCoverage: Record<CoreActionId, boolean>;
  };
};

export type V24OrchestrationResult = {
  status: "passed" | "blocked" | "failed";
  reasonCodes: V24ReasonCode[];
  routes: V24RouteResult[];
  totalAttemptBudget: {
    requested: number;
    allowed: number;
  };
  previousPackPreserved: boolean;
  livePetMutationAttempted: false;
  providerExecutionStarted: boolean;
  safeCandidateCount: number;
};

export function createV24MultiRouteOrchestration(options: {
  photoSuitability: Pick<PhotoSuitabilityResult, "status" | "primaryReasonCode"> | null;
  routes?: Partial<Record<V24RouteId, V24RouteInput>>;
  perRouteAttemptLimit?: number;
  totalAttemptLimit?: number;
  previousPackId?: string;
}): V24OrchestrationResult {
  const perRouteLimit = Math.max(1, Math.floor(options.perRouteAttemptLimit ?? 2));
  const totalLimit = Math.max(perRouteLimit, Math.floor(options.totalAttemptLimit ?? 6));
  const baseBlocked = !options.photoSuitability || options.photoSuitability.status === "unsuitable";
  const routes = V24_ROUTE_IDS.map((routeId) =>
    evaluateRoute(routeId, options.routes?.[routeId], {
      baseBlocked,
      perRouteLimit
    })
  );
  const requested = routes.reduce((total, route) => total + route.attemptBudget.requested, 0);
  const safeCandidateCount = routes.filter((route) => route.state === "candidate_created" && route.candidate).length;
  const reasonCodes = new Set<V24ReasonCode>();

  if (baseBlocked) {
    reasonCodes.add(options.photoSuitability ? "better_photo_required" : "v23_prerequisite_missing");
  }
  if (requested > totalLimit) {
    reasonCodes.add("route_budget_exhausted");
  }
  for (const route of routes) {
    route.reasonCodes.forEach((code) => reasonCodes.add(code));
  }
  reasonCodes.add("previous_pack_preserved");
  reasonCodes.add("live_pet_unchanged");

  const unsafe = multiRouteOrchestrationHasForbiddenContent({ routes, previousPackId: options.previousPackId });
  if (unsafe) {
    reasonCodes.add("unsafe_field_detected");
  }

  const failed = unsafe || requested > totalLimit;
  const blocked = baseBlocked || safeCandidateCount === 0;

  return {
    status: failed ? "failed" : blocked ? "blocked" : "passed",
    reasonCodes: Array.from(reasonCodes).sort(),
    routes,
    totalAttemptBudget: {
      requested,
      allowed: totalLimit
    },
    previousPackPreserved: true,
    livePetMutationAttempted: false,
    providerExecutionStarted: false,
    safeCandidateCount
  };
}

export function buildV24OrchestrationEvidenceSnapshot(result: V24OrchestrationResult) {
  return {
    status: result.status,
    reasonCodes: result.reasonCodes,
    routeCount: result.routes.length,
    routeStates: result.routes.map((route) => ({
      routeId: route.routeId,
      state: route.state,
      reasonCodes: route.reasonCodes,
      hasCandidate: Boolean(route.candidate),
      candidateFields: route.candidate ? Object.keys(route.candidate).sort() : []
    })),
    safeCandidateCount: result.safeCandidateCount,
    totalAttemptBudget: result.totalAttemptBudget,
    previousPackPreserved: result.previousPackPreserved,
    livePetMutationAttempted: result.livePetMutationAttempted,
    providerExecutionStarted: result.providerExecutionStarted
  };
}

export function multiRouteOrchestrationHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function evaluateRoute(
  routeId: V24RouteId,
  input: V24RouteInput | undefined,
  context: { baseBlocked: boolean; perRouteLimit: number }
): V24RouteResult {
  const route = input ?? {};
  const requested = Math.max(0, Math.floor(route.attemptsRequested ?? 1));
  const reasonCodes = new Set<V24ReasonCode>(["route_registered"]);

  if (context.baseBlocked) {
    reasonCodes.add("better_photo_required");
    return routeResult(routeId, "blocked", requested, context.perRouteLimit, reasonCodes);
  }

  if (requested > context.perRouteLimit) {
    reasonCodes.add("route_budget_exhausted");
    return routeResult(routeId, "failed", requested, context.perRouteLimit, reasonCodes);
  }

  if (route.supported === false) {
    reasonCodes.add("route_unavailable");
    return routeResult(routeId, "unavailable", requested, context.perRouteLimit, reasonCodes);
  }

  if (route.credentialRequired && !route.credentialPresent) {
    reasonCodes.add("provider_credential_missing");
    return routeResult(routeId, "blocked", requested, context.perRouteLimit, reasonCodes);
  }

  if (route.consentRequired && !route.consentAccepted) {
    reasonCodes.add("provider_consent_required");
    return routeResult(routeId, "blocked", requested, context.perRouteLimit, reasonCodes);
  }

  if (route.failureReason) {
    reasonCodes.add(route.failureReason);
    return routeResult(routeId, route.failureReason === "route_output_missing" ? "blocked" : "failed", requested, context.perRouteLimit, reasonCodes);
  }

  if (route.outputKind === "none") {
    reasonCodes.add("route_output_missing");
    return routeResult(routeId, "blocked", requested, context.perRouteLimit, reasonCodes);
  }

  const coverage = normalizeCoverage(route.actionCoverage);
  const allActionsCovered = CORE_ACTION_IDS.every((actionId) => coverage[actionId]);
  if (!allActionsCovered) {
    reasonCodes.add("action_coverage_incomplete");
    return routeResult(routeId, "blocked", requested, context.perRouteLimit, reasonCodes);
  }

  const candidateId = safeId(route.candidateId, `${routeId}_candidate`);
  const safePackId = safeId(route.safePackId, `${routeId}_pack`);
  const candidate = {
    candidateId,
    safePackId,
    rendererKind: route.rendererKind ?? "sprite",
    actionCoverage: coverage
  };

  if (multiRouteOrchestrationHasForbiddenContent(candidate)) {
    reasonCodes.add("unsafe_field_detected");
    return routeResult(routeId, "failed", requested, context.perRouteLimit, reasonCodes);
  }

  reasonCodes.add("candidate_created");
  reasonCodes.add("safe_candidate_metadata_ready");
  return routeResult(routeId, "candidate_created", requested, context.perRouteLimit, reasonCodes, candidate);
}

function routeResult(
  routeId: V24RouteId,
  state: V24RouteState,
  requested: number,
  allowed: number,
  reasonCodes: Set<V24ReasonCode>,
  candidate?: V24RouteResult["candidate"]
): V24RouteResult {
  return {
    routeId,
    state,
    attemptBudget: {
      requested,
      allowed
    },
    reasonCodes: Array.from(reasonCodes).sort(),
    candidate
  };
}

function normalizeCoverage(actionCoverage: CoreActionId[] | undefined): Record<CoreActionId, boolean> {
  const set = new Set(actionCoverage ?? []);
  return Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [actionId, set.has(actionId)])) as Record<CoreActionId, boolean>;
}

function safeId(value: string | undefined, fallback: string) {
  const raw = value ?? fallback;
  return SAFE_ID_PATTERN.test(raw) ? raw : fallback;
}
