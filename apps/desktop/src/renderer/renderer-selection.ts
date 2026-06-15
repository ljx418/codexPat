import type { AssetManifest, RendererKind } from "../assets/asset-manifest";
import { isRendererKind } from "../assets/asset-manifest";
import { CSS_DEFAULT_ASSET_MANIFEST } from "../assets/bundled-packs/css-default.manifest";
import { GLTF_PROTOTYPE_ASSET_MANIFEST } from "../assets/bundled-packs/gltf-prototype.manifest";
import { LIVING_WORK_CAT_V1_ASSET_MANIFEST } from "../assets/bundled-packs/living-work-cat-v1";

export const RUNTIME_RENDERER_STORAGE_KEY = "agentDesktopPet.rendererKind";
export const RUNTIME_RENDERER_KINDS = ["css", "sprite", "gltf"] as const;
export type RuntimeRendererKind = (typeof RUNTIME_RENDERER_KINDS)[number];

export type RuntimeRendererSelection = {
  requestedKind: string | null;
  selectedKind: RuntimeRendererKind;
  fallbackUsed: boolean;
  reasonCode?: "renderer_not_selected" | "renderer_kind_invalid" | "renderer_kind_unavailable" | "legacy_css_renderer_migrated";
};

export function resolveRuntimeRendererKind(
  readStoredKind: () => string | null = readBrowserStoredKind
): RuntimeRendererSelection {
  const requestedKind = readStoredKind();
  if (!requestedKind) {
    return { requestedKind, selectedKind: "sprite", fallbackUsed: false, reasonCode: "renderer_not_selected" };
  }
  if (requestedKind === "css") {
    return { requestedKind, selectedKind: "sprite", fallbackUsed: false, reasonCode: "legacy_css_renderer_migrated" };
  }
  if (!isRendererKind(requestedKind)) {
    return { requestedKind, selectedKind: "css", fallbackUsed: true, reasonCode: "renderer_kind_invalid" };
  }
  if (!isRuntimeRendererKind(requestedKind)) {
    return { requestedKind, selectedKind: "css", fallbackUsed: true, reasonCode: "renderer_kind_unavailable" };
  }
  return { requestedKind, selectedKind: requestedKind, fallbackUsed: false };
}

export function manifestForRuntimeRenderer(kind: RuntimeRendererKind): AssetManifest {
  if (kind === "sprite") return LIVING_WORK_CAT_V1_ASSET_MANIFEST;
  if (kind === "gltf") return GLTF_PROTOTYPE_ASSET_MANIFEST;
  return CSS_DEFAULT_ASSET_MANIFEST;
}

function readBrowserStoredKind() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(RUNTIME_RENDERER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function isRuntimeRendererKind(value: RendererKind): value is RuntimeRendererKind {
  return (RUNTIME_RENDERER_KINDS as readonly string[]).includes(value);
}
