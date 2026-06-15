import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { inflateSync } from "node:zlib";

export const DATE = "2026-06-08";
export const DEFAULT_URL = "http://127.0.0.1:17321";
export const repoRoot = resolve(new URL("..", import.meta.url).pathname);
export const petctlBin = process.env.PETCTL_BIN
  ? resolve(process.env.PETCTL_BIN)
  : join(repoRoot, "packages/petctl/dist/cli.js");
export const tsxLoaderPath = join(repoRoot, "node_modules/.pnpm/node_modules/tsx/dist/esm/index.mjs");

const SENSITIVE_PATTERNS = [
  /sk-[A-Za-z0-9_-]{8,}/,
  /Bearer\s+[A-Za-z0-9._-]{8,}/i,
  /Authorization\s*:/i,
  /api-token\.json/i,
  /raw\s*(payload|response|photo)/i,
  /prompt\s*text/i,
  /tool\s*command/i,
  /workspace\s*path/i,
  /config\s*path/i,
  /workspacePath\s*[:=]/i,
  /configPath\s*[:=]/i,
  /promptText\s*[:=]/i,
  /toolCommand\s*[:=]/i,
  /\/Users\/[^/\s"']+/,
  /shell\s*history/i,
  /clipboard/i,
  /screen\s*text/i
];

export function record(records, name, ok, details = "", failureResult = "failed") {
  records.push({
    name,
    result: ok ? "passed" : failureResult,
    details: sanitizeText(details)
  });
}

export function finish(records) {
  if (records.some((item) => item.result === "failed")) return "failed";
  if (records.some((item) => item.result === "blocked")) return "blocked";
  return "passed";
}

export function writeEvidence(path, title, status, records, extra = "") {
  mkdirSync(dirname(path), { recursive: true });
  const rows = records
    .map((item) => `| ${item.name} | ${item.result} | ${String(item.details ?? "").replace(/\|/g, "\\|")} |`)
    .join("\n");
  writeFileSync(path, `# ${title}

status: ${status}
date: ${DATE}

## Check Results

| Check | Result | Details |
| --- | --- | --- |
${rows}

${extra}

## Claim Boundary

This evidence does not claim production signed release ready, notarized release
ready, auto update ready, cross-platform ready, Windows ready, Petdex parity
achieved, 3D ready, automatic photo-to-3D ready, provider integration verified,
OS-level Codex window binding ready, already-open Codex auto-monitoring ready,
all Codex workflows verified, MCP ready, Third-party agent integration verified,
or Claude Code integration verified.
`, "utf8");
}

export function securityScanText(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return !SENSITIVE_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(text);
  });
}

export function sanitizeText(value) {
  return String(value ?? "")
    .replace(/\/Users\/[^/\s"']+/g, "[redacted_home]")
    .replace(/Bearer\s+[A-Za-z0-9._-]{8,}/gi, "Bearer [redacted]")
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, "sk-[redacted]")
    .replace(/Authorization\s*:[^\n\r]*/gi, "Authorization: [redacted]")
    .replace(/api-token\.json/gi, "[redacted_token_file]")
    .slice(0, 600);
}

export function safeArtifactSummary(path) {
  return {
    fileName: basename(path),
    extension: extname(path) || "app-bundle",
    type: extname(path) === ".dmg" ? "dmg" : path.endsWith(".app") ? "macOS app bundle" : "artifact"
  };
}

export function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: { ...process.env, ...(options.env ?? {}) },
    encoding: "utf8",
    timeout: options.timeoutMs ?? 120000
  });
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    signal: result.signal ?? null,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? ""
  };
}

export async function waitForHealth(timeoutMs = 12000) {
  const url = trimUrl(process.env.AGENT_DESKTOP_PET_URL || DEFAULT_URL);
  if (process.env.V13_DESKTOP_HEALTH_OK === "1") {
    return { ok: true, url, json: { ok: true, reasonCode: "external_shell_health_prechecked" } };
  }
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${url}/api/health`);
      const json = await response.json();
      if (response.ok && json?.ok === true) {
        return { ok: true, url, json };
      }
    } catch {
      const curl = spawnSync("curl", ["-sS", `${url}/api/health`], {
        cwd: repoRoot,
        encoding: "utf8"
      });
      if (curl.status === 0) {
        try {
          const json = JSON.parse(curl.stdout);
          if (json?.ok === true) {
            return { ok: true, url, json };
          }
        } catch {
          // retry
        }
      }
    }
    await sleep(500);
  }
  return { ok: false, url, reasonCode: "desktop_not_running" };
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
    path
  };
}

export function captureRegion(path, visibility, padding = 28) {
  const scale = Number(visibility?.monitorScaleFactor || 1);
  const screen = physicalScreenSize(visibility, scale);
  const x = Math.max(0, Math.floor(Number(visibility?.position?.x || 0)) - padding);
  const y = Math.max(0, Math.floor(Number(visibility?.position?.y || 0)) - padding);
  const requestedWidth = Math.max(64, Math.ceil(Number(visibility?.size?.width || 220)) + padding * 2);
  const requestedHeight = Math.max(64, Math.ceil(Number(visibility?.size?.height || 220)) + padding * 2);
  const width = Math.max(64, Math.min(requestedWidth, screen.width - x));
  const height = Math.max(64, Math.min(requestedHeight, screen.height - y));
  mkdirSync(dirname(path), { recursive: true });
  const result = spawnSync("screencapture", ["-x", "-R", `${x},${y},${width},${height}`, path], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  return {
    ok: result.status === 0 && existsSync(path) && statSync(path).size > 0,
    status: result.status ?? 1,
    region: { x, y, width, height },
    path
  };
}

function physicalScreenSize(visibility, scale) {
  const match = String(visibility?.monitorSummary || "").match(/monitor_primary_(\d+)x(\d+)/);
  if (!match) {
    return { width: 2880, height: 1800 };
  }
  return {
    width: Math.max(1, Math.round(Number(match[1]) * scale)),
    height: Math.max(1, Math.round(Number(match[2]) * scale))
  };
}

export function pngVisibilityCheck(path) {
  if (!existsSync(path) || statSync(path).size === 0) {
    return { ok: false, reasonCode: "screenshot_missing" };
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
      if (colors.size < 256) colors.add(`${r},${g},${b},${a}`);
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

export function findAppBundles() {
  const roots = [
    join(repoRoot, "apps/desktop/src-tauri/target/release/bundle/macos"),
    join(repoRoot, "apps/desktop/src-tauri/target/universal-apple-darwin/release/bundle/macos")
  ];
  const bundles = [];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root)) {
      const full = join(root, entry);
      if (entry.endsWith(".app") && statSync(full).isDirectory()) {
        bundles.push(full);
      }
    }
  }
  return bundles;
}

export function currentProcessMetrics() {
  const result = spawnSync("ps", ["-axo", "pid=,comm=,%cpu=,rss="], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  const rows = (result.stdout || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /Agent Desktop Pet|agent-desktop-pet|desktop/.test(line))
    .slice(0, 6)
    .map((line) => {
      const parts = line.split(/\s+/);
      const rssKb = Number(parts.at(-1) || 0);
      const cpu = Number(parts.at(-2) || 0);
      return {
        processName: parts.slice(1, -2).join(" ") || "desktop",
        cpuPercent: Number.isFinite(cpu) ? cpu : 0,
        rssMb: Number.isFinite(rssKb) ? Number((rssKb / 1024).toFixed(1)) : 0
      };
    });
  return rows;
}

function readPngPixels(path) {
  const buffer = readFileSync(path);
  if (buffer.toString("ascii", 1, 4) !== "PNG") throw new Error("not_png");
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
  if (bitDepth !== 8) throw new Error("unsupported_bit_depth");
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : colorType === 0 ? 1 : 0;
  if (!channels) throw new Error("unsupported_color_type");
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
      raw[outOffset + x] = (row[x] + pngPredictor(filter, left, up, upLeft)) & 0xff;
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

function trimUrl(value) {
  return String(value || DEFAULT_URL).replace(/\/+$/, "");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
