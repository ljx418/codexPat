#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const REPO_ROOT = process.cwd();
const env = readDotEnv();
const photoPath = resolve(REPO_ROOT, "docs/猫.jpg");

if (!env.MINIMAX_API_KEY || !existsSync(photoPath)) {
  console.log(JSON.stringify({
    ok: false,
    reasonCode: env.MINIMAX_API_KEY ? "sample_missing" : "provider_credential_missing"
  }, null, 2));
  process.exit(2);
}

const bytes = readFileSync(photoPath);
const prompt = [
  "Use the reference image as the visual identity source.",
  "Output exactly one single image containing an 8x9 animation sprite sheet.",
  "Rows in order: idle, thinking, running, success, warning, error, need_input, sleeping.",
  "Each row has 9 frames, same cat identity, transparent or plain clean background, no text, no labels, no watermark.",
  "Use stronger visible poses: jump, run, alert, ask, sleep, stretch. Keep the cat centered and do not crop it."
].join(" ");

const response = await fetch("https://api.minimaxi.com/v1/image_generation", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${env.MINIMAX_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "image-01",
    prompt,
    aspect_ratio: "1:1",
    response_format: "base64",
    n: 1,
    prompt_optimizer: true,
    subject_reference: [
      {
        type: "character",
        image_file: `data:image/jpeg;base64,${bytes.toString("base64")}`
      }
    ]
  })
});
const body = await response.json().catch(() => ({}));
const data = body && typeof body === "object" ? body.data : null;
const baseResp = body && typeof body === "object" ? body.base_resp : null;
const safe = {
  ok: response.ok,
  httpStatus: response.status,
  topLevelKeys: safeKeys(body),
  dataKeys: safeKeys(data),
  imageBase64Count: countMaybeArray(data?.image_base64 ?? body?.image_base64),
  imageUrlsCount: countMaybeArray(data?.image_urls ?? body?.image_urls),
  imagesCount: countMaybeArray(data?.images ?? body?.images),
  imageCount: countMaybeArray(data?.image ?? body?.image),
  urlCount: countMaybeArray(data?.url ?? body?.url),
  urlsCount: countMaybeArray(data?.urls ?? body?.urls),
  baseStatusCode: typeof baseResp?.status_code === "number" ? baseResp.status_code : null,
  baseStatusMessage: sanitizeStatus(baseResp?.status_msg),
  promptHash: createHash("sha256").update(prompt).digest("hex").slice(0, 16),
  promptLength: prompt.length,
  reference_image_attached: true,
  provider_capability: "reference_image_supported",
  text_to_image_only: false
};
console.log(JSON.stringify(safe, null, 2));

function readDotEnv() {
  const result = {};
  const envPath = resolve(REPO_ROOT, ".env");
  if (!existsSync(envPath)) {
    return result;
  }
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const index = trimmed.indexOf("=");
    if (index <= 0) {
      continue;
    }
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      result[key] = value;
    }
  }
  return result;
}

function safeKeys(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }
  return Object.keys(value).filter((key) => /^[A-Za-z0-9_]+$/.test(key)).sort();
}

function countMaybeArray(value) {
  if (Array.isArray(value)) {
    return value.length;
  }
  if (typeof value === "string" && value.length > 0) {
    return 1;
  }
  return 0;
}

function sanitizeStatus(value) {
  if (typeof value !== "string") {
    return null;
  }
  return value
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, "[redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]{8,}/g, "[redacted]")
    .replace(/\/Users\/[^\s]+/g, "[path-redacted]")
    .replace(/data:image\/[A-Za-z0-9+/.;=,_-]+/g, "[image-redacted]")
    .slice(0, 180);
}
