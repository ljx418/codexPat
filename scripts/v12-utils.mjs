import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { inflateSync } from "node:zlib";

export const DATE = process.env.EVIDENCE_DATE || new Date().toISOString().slice(0, 10);
export const DEFAULT_URL = "http://127.0.0.1:17321";
export const repoRoot = resolve(new URL("..", import.meta.url).pathname);
export const petctlBin = process.env.PETCTL_BIN
  ? resolve(process.env.PETCTL_BIN)
  : join(repoRoot, "packages/petctl/dist/cli.js");

const SENSITIVE_PATTERNS = [
  /sk-[A-Za-z0-9_-]{12,}/,
  /Bearer [A-Za-z0-9._-]{12,}/,
  /Authorization\s*:/i,
  /api-token\.json/,
  /rawPayload\s*[:=]/i,
  /raw_payload\s*[:=]/i,
  /promptText\s*[:=]/i,
  /prompt_text\s*[:=]/i,
  /toolCommand\s*[:=]/i,
  /tool_command\s*[:=]/i,
  /workspacePath\s*[:=]/i,
  /workspace_path\s*[:=]/i,
  /configPath\s*[:=]/i,
  /config_path\s*[:=]/i,
  /\/Users\/[^/\s]+/
];

export async function waitForHealth(timeoutMs = 8000) {
  const url = trimUrl(process.env.AGENT_DESKTOP_PET_URL || DEFAULT_URL);
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${url}/api/health`);
      const json = await response.json();
      if (response.ok && json?.ok === true) {
        return { ok: true, url, json };
      }
    } catch {
      // retry
    }
    await sleep(500);
  }
  return { ok: false, url, reasonCode: "desktop_not_running" };
}

export function requirePetctlDist(records) {
  const ok = existsSync(petctlBin);
  records.push({
    name: "petctl dist exists",
    result: ok ? "passed" : "blocked",
    details: ok ? "packages/petctl/dist/cli.js" : "run pnpm --filter @agent-desktop-pet/petctl build"
  });
  return ok;
}

export function runPetctl(args, extraEnv = {}) {
  const result = spawnSync(process.execPath, [petctlBin, ...args], {
    cwd: repoRoot,
    env: { ...process.env, ...extraEnv },
    encoding: "utf8"
  });
  const text = `${result.stdout || ""}${result.stderr || ""}`.trim();
  let json = {};
  try {
    json = JSON.parse(text);
  } catch {
    json = {};
  }
  return {
    ok: result.status === 0 && json?.ok !== false,
    status: result.status ?? 1,
    text,
    json,
    reasonCode: json?.reasonCode
  };
}

export function visibilityDiagnostics(instanceId = "default") {
  return runPetctl(["visibility", "diagnostics", "--instance", instanceId, "--json"]);
}

export function resurfaceVisibility(instanceId = "default", resetPosition = true) {
  return runPetctl([
    "visibility",
    "resurface",
    "--instance",
    instanceId,
    ...(resetPosition ? ["--reset-position"] : []),
    "--json"
  ]);
}

export function captureDesktop(path) {
  mkdirSync(dirname(path), { recursive: true });
  const result = spawnSync("screencapture", ["-x", path], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  return {
    ok: result.status === 0 && existsSync(path) && statSync(path).size > 0,
    status: result.status ?? 1,
    stderr: result.stderr || "",
    path
  };
}

export function captureRegion(path, visibility, padding = 28) {
  // macOS screencapture -R expects display point coordinates, not Retina pixel
  // coordinates. Tauri's outer_position is already in the coordinate space that
  // intersects display bounds, so multiplying by monitorScaleFactor can move the
  // capture rectangle offscreen on Retina displays.
  const x = Math.max(0, Math.floor(Number(visibility?.position?.x || 0)) - padding);
  const y = Math.max(0, Math.floor(Number(visibility?.position?.y || 0)) - padding);
  const width = Math.max(64, Math.ceil(Number(visibility?.size?.width || 220)) + padding * 2);
  const height = Math.max(64, Math.ceil(Number(visibility?.size?.height || 220)) + padding * 2);
  mkdirSync(dirname(path), { recursive: true });
  const result = spawnSync("screencapture", ["-x", "-R", `${x},${y},${width},${height}`, path], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  return {
    ok: result.status === 0 && existsSync(path) && statSync(path).size > 0,
    status: result.status ?? 1,
    stderr: result.stderr || "",
    region: { x, y, width, height },
    path
  };
}

export async function captureVisibleRegion(path, visibility, options = {}) {
  const attempts = Number(options.attempts || 8);
  const delayMs = Number(options.delayMs || 500);
  let lastCapture = { ok: false, path, region: null };
  let lastCheck = { ok: false, reasonCode: "pet_region_capture_missing" };
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    lastCapture = captureRegion(path, visibility, options.padding ?? 28);
    lastCheck = lastCapture.ok
      ? pngVisibilityCheck(path)
      : { ok: false, reasonCode: "pet_region_capture_missing" };
    if (lastCapture.ok && lastCheck.ok) {
      return { ok: true, capture: lastCapture, check: lastCheck, attempts: attempt + 1 };
    }
    await sleep(delayMs);
  }
  return {
    ok: false,
    capture: lastCapture,
    check: lastCheck,
    attempts
  };
}

export function pngVisibilityCheck(path) {
  if (!existsSync(path) || statSync(path).size === 0) {
    return { ok: false, reasonCode: "screenshot_missing", details: "file missing or empty" };
  }
  try {
    const pixels = readPngPixels(path);
    const total = pixels.width * pixels.height;
    let nonblank = 0;
    const colors = new Set();
    for (let index = 0; index < pixels.rgba.length; index += 4) {
      const r = pixels.rgba[index];
      const g = pixels.rgba[index + 1];
      const b = pixels.rgba[index + 2];
      const a = pixels.rgba[index + 3];
      if (a > 8 && !(r > 248 && g > 248 && b > 248)) {
        nonblank += 1;
      }
      if (colors.size < 256) {
        colors.add(`${r},${g},${b},${a}`);
      }
    }
    const nonblankRatio = total > 0 ? nonblank / total : 0;
    const ok = pixels.width > 0 && pixels.height > 0 && nonblankRatio > 0.01 && colors.size > 1;
    return {
      ok,
      width: pixels.width,
      height: pixels.height,
      nonblankRatio: Number(nonblankRatio.toFixed(4)),
      uniqueColorSample: colors.size,
      reasonCode: ok ? "desktop_visible" : "pixel_detection_inconclusive"
    };
  } catch (error) {
    return {
      ok: false,
      reasonCode: "pixel_detection_inconclusive",
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

function readPngPixels(path) {
  const buffer = readFileSync(path);
  if (buffer.toString("ascii", 1, 4) !== "PNG") {
    throw new Error("not_png");
  }
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += length + 12;
  }
  if (bitDepth !== 8) {
    throw new Error("unsupported_bit_depth");
  }
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : colorType === 0 ? 1 : 0;
  if (!channels) {
    throw new Error("unsupported_color_type");
  }
  const inflated = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const raw = Buffer.alloc(height * stride);
  let inputOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = inflated[inputOffset++];
    const row = inflated.subarray(inputOffset, inputOffset + stride);
    inputOffset += stride;
    const outOffset = y * stride;
    for (let x = 0; x < stride; x += 1) {
      const left = x >= channels ? raw[outOffset + x - channels] : 0;
      const up = y > 0 ? raw[outOffset + x - stride] : 0;
      const upLeft = y > 0 && x >= channels ? raw[outOffset + x - stride - channels] : 0;
      const value = row[x];
      raw[outOffset + x] = (value + pngPredictor(filter, left, up, upLeft)) & 0xff;
    }
  }
  const rgba = Buffer.alloc(width * height * 4);
  for (let index = 0, out = 0; index < raw.length; index += channels, out += 4) {
    if (colorType === 6) {
      rgba[out] = raw[index];
      rgba[out + 1] = raw[index + 1];
      rgba[out + 2] = raw[index + 2];
      rgba[out + 3] = raw[index + 3];
    } else if (colorType === 2) {
      rgba[out] = raw[index];
      rgba[out + 1] = raw[index + 1];
      rgba[out + 2] = raw[index + 2];
      rgba[out + 3] = 255;
    } else if (colorType === 4) {
      rgba[out] = raw[index];
      rgba[out + 1] = raw[index];
      rgba[out + 2] = raw[index];
      rgba[out + 3] = raw[index + 1];
    } else {
      rgba[out] = raw[index];
      rgba[out + 1] = raw[index];
      rgba[out + 2] = raw[index];
      rgba[out + 3] = 255;
    }
  }
  return { width, height, rgba };
}

function pngPredictor(filter, left, up, upLeft) {
  if (filter === 0) return 0;
  if (filter === 1) return left;
  if (filter === 2) return up;
  if (filter === 3) return Math.floor((left + up) / 2);
  if (filter === 4) {
    const p = left + up - upLeft;
    const pa = Math.abs(p - left);
    const pb = Math.abs(p - up);
    const pc = Math.abs(p - upLeft);
    if (pa <= pb && pa <= pc) return left;
    if (pb <= pc) return up;
    return upLeft;
  }
  throw new Error("unsupported_png_filter");
}

export function writeEvidence(path, title, status, records, extra = "") {
  mkdirSync(dirname(path), { recursive: true });
  const rows = records.map((item) => `| ${item.name} | ${item.result} | ${String(item.details ?? "").replace(/\|/g, "\\|")} |`).join("\n");
  writeFileSync(path, `# ${title}

status: ${status}
date: ${DATE}

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${rows}

${extra}

## Security / Claim Boundary

This evidence must not contain token, Authorization, raw payload, prompt text,
tool command text, workspace path, config path, or full local path. It does not
claim production signed release readiness, cross-platform readiness, Windows
readiness, Petdex parity, 3D readiness, provider integration, OS-level Codex
window binding, or all Codex workflows verification.
`, "utf8");
}

export function finish(records) {
  return records.some((item) => item.result === "failed")
    ? "failed"
    : records.some((item) => item.result === "blocked")
      ? "blocked"
      : "passed";
}

export function record(records, name, ok, details, failAs = "failed") {
  records.push({ name, result: ok ? "passed" : failAs, details });
}

export function securityScanText(value) {
  return !SENSITIVE_PATTERNS.some((pattern) => pattern.test(value));
}

export function securityScanFiles(paths) {
  const text = paths.map((path) => existsSync(path) ? readFileSync(path, "utf8") : "").join("\n");
  return securityScanText(text);
}

export function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2), "utf8");
}

export function listEvidenceFiles(prefix) {
  const root = join(repoRoot, "docs/V12.x/evidence");
  if (!existsSync(root)) return [];
  return readdirSync(root).filter((name) => name.startsWith(prefix));
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function trimUrl(value) {
  return value.replace(/\/+$/, "");
}
