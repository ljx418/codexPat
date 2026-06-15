import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const DEFAULT_MINIMAX_IMAGE_ENDPOINT = "https://api.minimaxi.com/v1/image_generation";
const SECRET_PATTERN = /(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|Authorization\s*[:=]|api[_-]?key\s*[:=]\s*[^\s"']+|cookie\s*[:=]\s*[^\s"']+)/i;
const PATH_PATTERN = /(\/Users\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/]|workspace path|config path|api-token\.json)/i;
const RAW_PATTERN = /(raw provider response|raw payload|raw prompt|raw photo|EXIF|GPS)/i;

export type MinimaxProviderPreflight =
  | {
      ok: true;
      providerName: "MiniMax";
      model: "image-01";
      endpointHost: string;
      consent: true;
      credentialSource: "MINIMAX_API_KEY";
      promptHash: string;
      promptLength: number;
      actionIntent: string;
    }
  | {
      ok: false;
      providerName: "MiniMax";
      reasonCode:
        | "provider_credential_missing"
        | "upload_consent_required"
        | "provider_disclosure_required"
        | "unsafe_prompt_rejected";
      endpointHost: string;
      credentialSource: "MINIMAX_API_KEY";
      consent: boolean;
      actionIntent: string;
    };

export type MinimaxGenerationSummary = {
  ok: boolean;
  providerName: "MiniMax";
  model: "image-01";
  endpointHost: string;
  actionIntent: string;
  promptHash: string;
  promptLength: number;
  imageCount: number;
  outputFiles: Array<{
    fileName: string;
    byteLength: number;
    sha256: string;
  }>;
  baseStatusCode: number | null;
  baseStatusMessage: string | null;
  reasonCode?: "provider_unavailable" | "provider_output_rejected";
};

export type MinimaxImageToImageCapabilitySummary = {
  ok: boolean;
  providerName: "MiniMax";
  model: "image-01";
  endpointHost: string;
  capability:
    | "image_to_image_supported"
    | "text_to_image_only"
    | "credential_missing"
    | "consent_required"
    | "provider_disclosure_required"
    | "reference_image_rejected"
    | "unsafe_prompt_rejected";
  documentedFields: Array<"subject_reference" | "type" | "image_file" | "data_url" | "response_format">;
  referenceImage: {
    mediaType: "image/jpeg" | "image/png";
    sizeBucket: "small" | "medium" | "large";
    byteLength: number;
    sha256: string;
  } | null;
  promptHash: string;
  promptLength: number;
  consent: boolean;
  credentialSource: "MINIMAX_API_KEY";
  reasonCode?: MinimaxImageToImageReasonCode;
};

export type MinimaxImageToImageGenerationSummary = MinimaxImageToImageCapabilitySummary & {
  imageCount: number;
  outputFiles: Array<{
    fileName: string;
    byteLength: number;
    sha256: string;
  }>;
  baseStatusCode: number | null;
  baseStatusMessage: string | null;
};

export type MinimaxImageToImageReasonCode =
  | "provider_credential_missing"
  | "consent_required"
  | "provider_disclosure_required"
  | "reference_image_invalid"
  | "reference_image_too_large"
  | "unsafe_prompt_rejected"
  | "provider_unavailable"
  | "provider_reference_not_supported"
  | "provider_output_missing"
  | "provider_output_rejected"
  | "provider_capability_confirmed";

export type MinimaxGenerationOptions = {
  apiKey?: string;
  uploadConsent?: boolean;
  costDisclosureAccepted?: boolean;
  privacyRetentionAccepted?: boolean;
  licenseAttributionAccepted?: boolean;
  prompt: string;
  actionIntent: string;
  outputFileBase?: string;
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
};

export type MinimaxImageToImageOptions = {
  apiKey?: string;
  uploadConsent?: boolean;
  costDisclosureAccepted?: boolean;
  privacyRetentionAccepted?: boolean;
  licenseAttributionAccepted?: boolean;
  prompt: string;
  actionIntent: string;
  referenceImageBytes: Buffer;
  referenceImageMediaType: "image/jpeg" | "image/png";
  outputFileBase?: string;
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
};

export function createMinimaxCatActionPrompt(options?: {
  catTraits?: string;
  actionIntent?: string;
}) {
  const catTraits = sanitizePromptPart(options?.catTraits ?? "orange tabby cat with bright eyes, soft fur, rounded face");
  const actionIntent = sanitizePromptPart(options?.actionIntent ?? "playing with a feather wand");
  return [
    "Create one square, full-body, cute desktop pet cat image.",
    `Cat traits: ${catTraits}.`,
    `Action: ${actionIntent}.`,
    "Style: clean isolated character asset, transparent-looking simple background, no text, no watermark, no UI, no human hands.",
    "The cat must be clearly visible and suitable for a desktop pet sprite action."
  ].join(" ");
}

export function preflightMinimaxGeneration(options: MinimaxGenerationOptions): MinimaxProviderPreflight {
  const actionIntent = sanitizeActionIntent(options.actionIntent);
  if (!options.apiKey?.trim()) {
    return blocked("provider_credential_missing", options, actionIntent);
  }
  if (!options.uploadConsent) {
    return blocked("upload_consent_required", options, actionIntent);
  }
  if (!options.costDisclosureAccepted || !options.privacyRetentionAccepted || !options.licenseAttributionAccepted) {
    return blocked("provider_disclosure_required", options, actionIntent);
  }
  if (containsForbiddenValue(options.prompt) || containsForbiddenValue(actionIntent)) {
    return blocked("unsafe_prompt_rejected", options, actionIntent);
  }
  return {
    ok: true,
    providerName: "MiniMax",
    model: "image-01",
    endpointHost: getEndpointHost(options.apiBaseUrl),
    consent: true,
    credentialSource: "MINIMAX_API_KEY",
    promptHash: hashText(options.prompt),
    promptLength: options.prompt.length,
    actionIntent
  };
}

export function preflightMinimaxImageToImageGeneration(options: MinimaxImageToImageOptions): MinimaxImageToImageCapabilitySummary {
  const base = createMinimaxImageToImageBaseSummary(options);
  if (!options.apiKey?.trim()) {
    return { ...base, ok: false, capability: "credential_missing", reasonCode: "provider_credential_missing" };
  }
  if (!options.uploadConsent) {
    return { ...base, ok: false, capability: "consent_required", reasonCode: "consent_required" };
  }
  if (!options.costDisclosureAccepted || !options.privacyRetentionAccepted || !options.licenseAttributionAccepted) {
    return { ...base, ok: false, capability: "provider_disclosure_required", reasonCode: "provider_disclosure_required" };
  }
  if (!base.referenceImage) {
    return { ...base, ok: false, capability: "reference_image_rejected", reasonCode: "reference_image_invalid" };
  }
  if (options.referenceImageBytes.byteLength > 10 * 1024 * 1024) {
    return { ...base, ok: false, capability: "reference_image_rejected", reasonCode: "reference_image_too_large" };
  }
  if (containsForbiddenValue(options.prompt) || containsForbiddenValue(options.actionIntent)) {
    return { ...base, ok: false, capability: "unsafe_prompt_rejected", reasonCode: "unsafe_prompt_rejected" };
  }
  return { ...base, ok: true, capability: "image_to_image_supported", reasonCode: "provider_capability_confirmed" };
}

export async function generateMinimaxCatActionImage(options: MinimaxGenerationOptions): Promise<MinimaxGenerationSummary> {
  const preflight = preflightMinimaxGeneration(options);
  if (!preflight.ok) {
    return {
      ok: false,
      providerName: "MiniMax",
      model: "image-01",
      endpointHost: getEndpointHost(options.apiBaseUrl),
      actionIntent: preflight.actionIntent,
      promptHash: hashText(options.prompt),
      promptLength: options.prompt.length,
      imageCount: 0,
      outputFiles: [],
      baseStatusCode: null,
      baseStatusMessage: null,
      reasonCode: preflight.reasonCode === "provider_credential_missing" || preflight.reasonCode === "upload_consent_required" || preflight.reasonCode === "provider_disclosure_required"
        ? "provider_unavailable"
        : "provider_output_rejected"
    };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchImpl(resolveMinimaxImageEndpoint(options.apiBaseUrl), {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${options.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "image-01",
        prompt: options.prompt,
        aspect_ratio: "1:1",
        response_format: "base64",
        n: 1,
        prompt_optimizer: true
      })
    });
  } catch {
    return failureSummary(preflight, "provider_unavailable", null, "network unavailable");
  }

  if (!response.ok) {
    return failureSummary(preflight, "provider_unavailable", response.status, response.statusText);
  }

  const body = await response.json() as {
    data?: {
      image_base64?: string[];
      image_urls?: string[];
    };
    base_resp?: {
      status_code?: number;
      status_msg?: string;
    };
  };

  const outputFiles = await writeProviderImages({
    imageBase64: normalizeStringArray(body.data?.image_base64),
    imageUrls: normalizeStringArray(body.data?.image_urls),
    outputBase: options.outputFileBase ?? "docs/V7.9/evidence/minimax-generated-cat-action",
    fetchImpl,
    fallbackFileName: "minimax-generated-cat-action",
    baseStatusCode: body.base_resp?.status_code ?? null,
    baseStatusMessage: body.base_resp?.status_msg ?? null,
    failure: (reasonCode, baseStatusCode, baseStatusMessage) => failureSummary(preflight, reasonCode === "provider_output_missing" ? "provider_output_rejected" : reasonCode, baseStatusCode, baseStatusMessage)
  });
  if (!Array.isArray(outputFiles)) {
    return outputFiles;
  }
  if (!outputFiles.length) {
    return failureSummary(preflight, "provider_output_rejected", body.base_resp?.status_code ?? null, body.base_resp?.status_msg ?? null);
  }

  return {
    ok: true,
    providerName: "MiniMax",
    model: "image-01",
    endpointHost: preflight.endpointHost,
    actionIntent: preflight.actionIntent,
    promptHash: preflight.promptHash,
    promptLength: preflight.promptLength,
    imageCount: outputFiles.length,
    outputFiles,
    baseStatusCode: body.base_resp?.status_code ?? null,
    baseStatusMessage: sanitizeStatusMessage(body.base_resp?.status_msg ?? null)
  };
}

export async function generateMinimaxCatReferenceActionImage(
  options: MinimaxImageToImageOptions
): Promise<MinimaxImageToImageGenerationSummary> {
  const preflight = preflightMinimaxImageToImageGeneration(options);
  if (!preflight.ok) {
    return {
      ...preflight,
      imageCount: 0,
      outputFiles: [],
      baseStatusCode: null,
      baseStatusMessage: null
    };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchImpl(resolveMinimaxImageEndpoint(options.apiBaseUrl), {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${options.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "image-01",
        prompt: options.prompt,
        aspect_ratio: "1:1",
        response_format: "base64",
        n: 1,
        prompt_optimizer: true,
        subject_reference: [
          {
            type: "character",
            image_file: toReferenceImageDataUrl(options.referenceImageMediaType, options.referenceImageBytes)
          }
        ]
      })
    });
  } catch {
    return i2iFailureSummary(preflight, "provider_unavailable", null, "network unavailable");
  }

  if (!response.ok) {
    return i2iFailureSummary(preflight, response.status === 400 ? "provider_reference_not_supported" : "provider_unavailable", response.status, response.statusText);
  }

  const body = await response.json() as {
    data?: {
      image_base64?: string[];
      image_urls?: string[];
    };
    base_resp?: {
      status_code?: number;
      status_msg?: string;
    };
  };

  const outputFiles = await writeProviderImages({
    imageBase64: normalizeStringArray(body.data?.image_base64),
    imageUrls: normalizeStringArray(body.data?.image_urls),
    outputBase: options.outputFileBase ?? "docs/V18.x/evidence/assets/minimax-i2i-cat-action",
    fetchImpl,
    fallbackFileName: "minimax-i2i-cat-action",
    baseStatusCode: body.base_resp?.status_code ?? null,
    baseStatusMessage: body.base_resp?.status_msg ?? null,
    failure: (reasonCode, baseStatusCode, baseStatusMessage) => i2iFailureSummary(preflight, reasonCode === "provider_output_rejected" ? "provider_output_rejected" : "provider_output_missing", baseStatusCode, baseStatusMessage)
  });
  if (!Array.isArray(outputFiles)) {
    return outputFiles;
  }
  if (!outputFiles.length) {
    return i2iFailureSummary(preflight, "provider_output_missing", body.base_resp?.status_code ?? null, body.base_resp?.status_msg ?? null);
  }

  return {
    ...preflight,
    imageCount: outputFiles.length,
    outputFiles,
    baseStatusCode: body.base_resp?.status_code ?? null,
    baseStatusMessage: sanitizeStatusMessage(body.base_resp?.status_msg ?? null)
  };
}

export function minimaxSummaryHasForbiddenLeak(value: unknown) {
  const serialized = JSON.stringify(value);
  return SECRET_PATTERN.test(serialized) || PATH_PATTERN.test(serialized) || RAW_PATTERN.test(serialized);
}

async function writeProviderImages<TFailure>(options: {
  imageBase64: string[];
  imageUrls: string[];
  outputBase: string;
  fetchImpl: typeof fetch;
  fallbackFileName: string;
  baseStatusCode: number | null;
  baseStatusMessage: string | null;
  failure: (
    reasonCode: "provider_output_missing" | "provider_output_rejected",
    baseStatusCode: number | null,
    baseStatusMessage: string | null
  ) => TFailure;
}): Promise<MinimaxGenerationSummary["outputFiles"] | TFailure> {
  const outputFiles: MinimaxGenerationSummary["outputFiles"] = [];
  const base64Images = options.imageBase64.length ? options.imageBase64 : [];
  for (const [index, imageBase64] of base64Images.entries()) {
    const bytes = decodeProviderImageBase64(imageBase64);
    if (bytes.byteLength < 1024) {
      return options.failure("provider_output_rejected", options.baseStatusCode, options.baseStatusMessage);
    }
    outputFiles.push(await writeProviderImageBytes(options.outputBase, index, bytes, options.fallbackFileName));
  }

  if (outputFiles.length) {
    return outputFiles;
  }

  if (!options.imageUrls.length) {
    return options.failure("provider_output_missing", options.baseStatusCode, options.baseStatusMessage);
  }

  for (const [index, imageUrl] of options.imageUrls.entries()) {
    if (!isSafeProviderImageUrl(imageUrl)) {
      return options.failure("provider_output_rejected", options.baseStatusCode, options.baseStatusMessage);
    }
    let response: Response;
    try {
      response = await options.fetchImpl(imageUrl);
    } catch {
      return options.failure("provider_output_missing", options.baseStatusCode, "provider image url unavailable");
    }
    if (!response.ok) {
      return options.failure("provider_output_missing", response.status, response.statusText);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength < 1024 || !looksLikeProviderImage(bytes)) {
      return options.failure("provider_output_rejected", response.status, response.statusText);
    }
    outputFiles.push(await writeProviderImageBytes(options.outputBase, index, bytes, options.fallbackFileName));
  }
  return outputFiles;
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }
  if (typeof value === "string" && value.trim()) {
    return [value];
  }
  return [];
}

function decodeProviderImageBase64(value: string) {
  const cleaned = value.replace(/^data:image\/[a-z0-9.+-]+;base64,/i, "");
  return Buffer.from(cleaned, "base64");
}

function isSafeProviderImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !SECRET_PATTERN.test(value) &&
      !RAW_PATTERN.test(value);
  } catch {
    return false;
  }
}

function looksLikeProviderImage(bytes: Buffer) {
  return bytes.length > 8 && (
    (bytes[0] === 0xff && bytes[1] === 0xd8) ||
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
    bytes.subarray(0, 4).equals(Buffer.from("RIFF"))
  );
}

async function writeProviderImageBytes(outputBase: string, index: number, bytes: Buffer, fallbackFileName: string) {
  const extension = inferImageExtension(bytes);
  const fileName = `${outputBase}-${index + 1}.${extension}`;
  await mkdir(dirname(fileName), { recursive: true });
  await writeFile(fileName, bytes);
  return {
    fileName: fileName.split("/").pop() ?? `${fallbackFileName}-${index + 1}.${extension}`,
    byteLength: bytes.byteLength,
    sha256: hashBuffer(bytes)
  };
}

function inferImageExtension(bytes: Buffer) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return "jpeg";
  }
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "png";
  }
  if (bytes.subarray(0, 4).equals(Buffer.from("RIFF"))) {
    return "webp";
  }
  return "img";
}

export function createMinimaxReferenceImagePrompt(options?: {
  catTraits?: string;
  actionIntent?: string;
}) {
  const catTraits = sanitizePromptPart(options?.catTraits ?? "match the reference cat's fur color, face shape, markings, and eyes");
  const actionIntent = sanitizePromptPart(options?.actionIntent ?? "sitting calmly as a desktop pet sprite");
  return [
    "Use the reference image as the visual identity source.",
    `Preserve the same cat identity: ${catTraits}.`,
    `Create one square full-body desktop pet cat image for this action: ${actionIntent}.`,
    "Clean 2D animated sprite style, no text, no labels, no watermark, no human, no UI.",
    "Cat must be fully visible with safe margins and a simple clean background."
  ].join(" ");
}

function blocked(
  reasonCode: Exclude<MinimaxProviderPreflight, { ok: true }>["reasonCode"],
  options: MinimaxGenerationOptions,
  actionIntent: string
): MinimaxProviderPreflight {
  return {
    ok: false,
    providerName: "MiniMax",
    reasonCode,
    endpointHost: getEndpointHost(options.apiBaseUrl),
    credentialSource: "MINIMAX_API_KEY",
    consent: Boolean(options.uploadConsent),
    actionIntent
  };
}

function failureSummary(
  preflight: Extract<MinimaxProviderPreflight, { ok: true }>,
  reasonCode: MinimaxGenerationSummary["reasonCode"],
  baseStatusCode: number | null,
  baseStatusMessage: string | null
): MinimaxGenerationSummary {
  return {
    ok: false,
    providerName: "MiniMax",
    model: "image-01",
    endpointHost: preflight.endpointHost,
    actionIntent: preflight.actionIntent,
    promptHash: preflight.promptHash,
    promptLength: preflight.promptLength,
    imageCount: 0,
    outputFiles: [],
    baseStatusCode,
    baseStatusMessage: sanitizeStatusMessage(baseStatusMessage),
    reasonCode
  };
}

function i2iFailureSummary(
  preflight: MinimaxImageToImageCapabilitySummary,
  reasonCode: MinimaxImageToImageReasonCode,
  baseStatusCode: number | null,
  baseStatusMessage: string | null
): MinimaxImageToImageGenerationSummary {
  return {
    ...preflight,
    ok: false,
    capability: reasonCode === "provider_reference_not_supported" ? "text_to_image_only" : "reference_image_rejected",
    reasonCode,
    imageCount: 0,
    outputFiles: [],
    baseStatusCode,
    baseStatusMessage: sanitizeStatusMessage(baseStatusMessage)
  };
}

function sanitizePromptPart(value: string) {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

function sanitizeActionIntent(value: string) {
  const sanitized = sanitizePromptPart(value);
  return sanitized || "cat action";
}

function containsForbiddenValue(value: string) {
  return SECRET_PATTERN.test(value) || PATH_PATTERN.test(value) || RAW_PATTERN.test(value);
}

function createMinimaxImageToImageBaseSummary(options: MinimaxImageToImageOptions): MinimaxImageToImageCapabilitySummary {
  return {
    ok: false,
    providerName: "MiniMax",
    model: "image-01",
    endpointHost: getEndpointHost(options.apiBaseUrl),
    capability: "reference_image_rejected",
    documentedFields: ["subject_reference", "type", "image_file", "data_url", "response_format"],
    referenceImage: summarizeReferenceImage(options.referenceImageMediaType, options.referenceImageBytes),
    promptHash: hashText(options.prompt),
    promptLength: options.prompt.length,
    consent: Boolean(options.uploadConsent),
    credentialSource: "MINIMAX_API_KEY"
  };
}

function summarizeReferenceImage(mediaType: MinimaxImageToImageOptions["referenceImageMediaType"], bytes: Buffer) {
  const signatureValid = mediaType === "image/jpeg"
    ? bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8
    : bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (!signatureValid) {
    return null;
  }
  return {
    mediaType,
    sizeBucket: bytes.byteLength < 1024 * 1024 ? "small" as const : bytes.byteLength < 5 * 1024 * 1024 ? "medium" as const : "large" as const,
    byteLength: bytes.byteLength,
    sha256: hashBuffer(bytes)
  };
}

function toReferenceImageDataUrl(mediaType: MinimaxImageToImageOptions["referenceImageMediaType"], bytes: Buffer) {
  return `data:${mediaType};base64,${bytes.toString("base64")}`;
}

function resolveMinimaxImageEndpoint(apiBaseUrl?: string) {
  const baseUrl = apiBaseUrl?.trim() || DEFAULT_MINIMAX_IMAGE_ENDPOINT;
  if (/\/v1\/image_generation\/?$/.test(baseUrl)) {
    return baseUrl.replace(/\/$/, "");
  }
  return `${baseUrl.replace(/\/+$/, "")}/v1/image_generation`;
}

function getEndpointHost(apiBaseUrl?: string) {
  try {
    return new URL(resolveMinimaxImageEndpoint(apiBaseUrl)).host;
  } catch {
    return "api.minimaxi.com";
  }
}

function sanitizeStatusMessage(value: string | null) {
  if (!value) {
    return null;
  }
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(SECRET_PATTERN, "[redacted]")
    .replace(PATH_PATTERN, "[path-redacted]")
    .slice(0, 160);
}

function hashText(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function hashBuffer(value: Buffer) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}
