import { resolveToken, resolveUrl } from "./config.js";
import { EXIT_CODES, type CliResult } from "./output.js";

export type OpenSettingsOptions = {
  token?: string;
  url?: string;
  fetchImpl?: typeof fetch;
};

export async function openSettings(options: OpenSettingsOptions): Promise<CliResult> {
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
  const endpoint = `${url}/api/settings/open`;
  const fetchImpl = options.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token.value}`,
        "Content-Type": "application/json"
      },
      body: "{}"
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
  if (response.ok && body?.ok === true) {
    return {
      ok: true,
      exitCode: EXIT_CODES.success,
      settings: {
        windowLabel: typeof body.windowLabel === "string" ? body.windowLabel : "settings",
        reasonCode: typeof body.reasonCode === "string" ? body.reasonCode : "settings_opened"
      },
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

function statusReasonCode(status: number) {
  if (status === 401) return "unauthorized";
  if (status === 503) return "bridge_unavailable";
  return "unknown_error";
}

function exitCodeFor(status: number, reasonCode: string) {
  if (status === 401) return EXIT_CODES.unauthorized;
  if (status === 503 || reasonCode === "bridge_unavailable") return EXIT_CODES.bridgeUnavailable;
  return EXIT_CODES.genericError;
}
