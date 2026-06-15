import { resolveToken, resolveUrl } from "./config.js";
import { EXIT_CODES, type CliResult } from "./output.js";

export type VisibilityDiagnosticsOptions = {
  token?: string;
  url?: string;
  instance: string;
  fetchImpl?: typeof fetch;
};

export type VisibilityResurfaceOptions = VisibilityDiagnosticsOptions & {
  resetPosition: boolean;
};

export async function getVisibilityDiagnostics(options: VisibilityDiagnosticsOptions): Promise<CliResult> {
  if (!isValidInstanceId(options.instance)) {
    return localValidation("instance_id_invalid", "instance id is invalid");
  }
  return requestVisibility({
    token: options.token,
    url: options.url,
    instance: options.instance,
    method: "GET",
    fetchImpl: options.fetchImpl
  });
}

export async function resurfaceVisibility(options: VisibilityResurfaceOptions): Promise<CliResult> {
  if (!isValidInstanceId(options.instance)) {
    return localValidation("instance_id_invalid", "instance id is invalid");
  }
  return requestVisibility({
    token: options.token,
    url: options.url,
    instance: options.instance,
    method: "POST",
    body: { resetPosition: options.resetPosition },
    fetchImpl: options.fetchImpl
  });
}

async function requestVisibility(options: {
  token?: string;
  url?: string;
  instance: string;
  method: "GET" | "POST";
  body?: unknown;
  fetchImpl?: typeof fetch;
}): Promise<CliResult> {
  const token = resolveToken(options.token);
  if (!token.value) {
    return {
      ok: false,
      exitCode: EXIT_CODES.tokenMissing,
      reasonCode: "token_missing",
      reason: "token not found; use --token or AGENT_DESKTOP_PET_TOKEN"
    };
  }

  const url = resolveUrl(options.url).value!;
  const fetchImpl = options.fetchImpl ?? fetch;
  const endpoint = `${url}/api/instances/${encodeURIComponent(options.instance)}/visibility${options.method === "POST" ? "/resurface" : ""}`;
  let response: Response;
  try {
    response = await fetchImpl(endpoint, {
      method: options.method,
      headers: {
        "Authorization": `Bearer ${token.value}`,
        ...(options.method === "POST" ? { "Content-Type": "application/json" } : {})
      },
      body: options.method === "POST" ? JSON.stringify(options.body ?? {}) : undefined
    });
  } catch (error) {
    return {
      ok: false,
      exitCode: EXIT_CODES.desktopNotRunning,
      reasonCode: "desktop_not_running",
      reason: error instanceof Error ? error.message : "desktop app is not reachable"
    };
  }

  const body = await readJson(response);
  if (response.ok && body?.ok === true && typeof body.visibility === "object") {
    return {
      ok: true,
      exitCode: EXIT_CODES.success,
      visibility: body.visibility,
      resurfaced: body.resurfaced === true,
      raw: body
    };
  }

  const reasonCode = typeof body?.reasonCode === "string" ? body.reasonCode : statusReasonCode(response.status);
  const reason = typeof body?.reason === "string" ? body.reason : response.statusText || "request failed";
  return {
    ok: false,
    exitCode: exitCodeFor(response.status, reasonCode),
    reasonCode,
    reason
  };
}

async function readJson(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function localValidation(reasonCode: string, reason: string): CliResult {
  return {
    ok: false,
    exitCode: EXIT_CODES.localValidation,
    reasonCode,
    reason
  };
}

function statusReasonCode(status: number) {
  if (status === 401) return "unauthorized";
  if (status === 404) return "instance_not_found";
  if (status === 400) return "schema_invalid";
  if (status === 503) return "bridge_unavailable";
  return "unknown_error";
}

function exitCodeFor(status: number, reasonCode: string) {
  if (status === 401) return EXIT_CODES.unauthorized;
  if (status === 503 || reasonCode === "bridge_unavailable") return EXIT_CODES.bridgeUnavailable;
  if (status === 400 || status === 404) return EXIT_CODES.rejectedByBridge400;
  return EXIT_CODES.genericError;
}

function isValidInstanceId(value: string) {
  return /^[A-Za-z0-9._-]{1,64}$/.test(value) && !value.includes("..");
}
