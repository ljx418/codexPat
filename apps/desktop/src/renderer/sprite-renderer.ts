import { SPRITE_V2_FRAMES, renderSpriteFrame } from "../assets/bundled-packs/sprite-v2";
import {
  SPRITE_V3_ANIMATED_ACTIONS,
  SPRITE_V3_ANIMATED_PACK_ID,
  renderAnimatedSpriteFrame
} from "../assets/bundled-packs/sprite-v3-animated";
import {
  WORK_CAT_V1_ACTIONS,
  WORK_CAT_V1_PACK_ID,
  renderWorkCatFrame
} from "../assets/bundled-packs/work-cat-v1";
import {
  getPremiumCatPack,
  isPremiumCatPackId,
  renderPremiumCatFrame,
  type PremiumCatPackId
} from "../assets/bundled-packs/premium-cats-v1";
import {
  LIVING_WORK_CAT_V1_ACTIONS,
  LIVING_WORK_CAT_V1_PACK_ID,
  renderLivingWorkCatFrame,
  type LivingWorkCatActionId
} from "../assets/bundled-packs/living-work-cat-v1";
import {
  FLAGSHIP_WORK_CAT_V2_ACTIONS,
  FLAGSHIP_WORK_CAT_V2_PACK_ID,
  renderFlagshipWorkCatV2Frame,
  type FlagshipWorkCatV2ActionId
} from "../assets/bundled-packs/flagship-work-cat-v2";
import type { RendererKind, SafeActionId, PlaybackIntent } from "../assets/asset-manifest";
import type { PetRenderer, SafeRendererProfile } from "./renderer-contract";
import { invoke } from "@tauri-apps/api/core";

const SPRITE_V2_PACK_ID = "sprite-v2";

type RuntimeAssetData = {
  mimeType: string;
  base64: string;
  frames?: Array<{
    mimeType: string;
    base64: string;
  }>;
  fps?: number;
};

export class SpriteRenderer implements PetRenderer {
  readonly kind: RendererKind = "sprite";
  private container: HTMLElement | undefined;
  private importedPackId: string | undefined;
  private bundledPackId: BundledSpritePackId | undefined;
  private requestVersion = 0;
  private animationFrameId: number | undefined;
  private importedAssetCache = new Map<SafeActionId, RuntimeAssetData>();
  private hasRenderedImportedAsset = false;

  mount(container: HTMLElement, profile: SafeRendererProfile) {
    this.container = container;
    this.bundledPackId = isBundledSpritePack(profile.packId) ? profile.packId : undefined;
    this.importedPackId = this.bundledPackId ? undefined : profile.packId;
    container.dataset.rendererKind = "sprite";
    container.dataset.assetPackId = profile.packId;
    container.dataset.spriteSource = this.importedPackId ? "imported" : "bundled";
    this.setScale(profile.scale);
  }

  setAction(actionId: SafeActionId, playback: PlaybackIntent) {
    if (!this.container) {
      return;
    }
    if (this.importedPackId) {
      const cachedAsset = this.importedAssetCache.get(actionId);
      if (cachedAsset) {
        this.requestVersion += 1;
        this.container.dataset.safeActionId = actionId;
        this.container.dataset.playbackPriority = playback.priority;
        this.renderImportedAsset(this.container, cachedAsset, this.requestVersion);
        delete this.container.dataset.rendererReasonCode;
        return;
      }
      void this.setImportedAction(this.importedPackId, actionId, playback, ++this.requestVersion);
      return;
    }
    this.renderBundledAction(actionId, playback);
  }

  setScale(scale: number) {
    if (!this.container) {
      return;
    }
    this.container.style.setProperty("--pet-renderer-scale", String(clampScale(scale)));
  }

  setVisible(visible: boolean) {
    if (!this.container) {
      return;
    }
    this.container.hidden = !visible;
  }

  dispose() {
    if (this.container) {
      delete this.container.dataset.rendererKind;
      delete this.container.dataset.assetPackId;
      delete this.container.dataset.spriteSource;
      delete this.container.dataset.safeActionId;
      delete this.container.dataset.playbackPriority;
      delete this.container.dataset.rendererReasonCode;
      this.container.innerHTML = "";
      this.container.style.removeProperty("--pet-renderer-scale");
    }
    this.stopFrameAnimation();
    this.container = undefined;
    this.importedPackId = undefined;
    this.bundledPackId = undefined;
    this.importedAssetCache.clear();
    this.hasRenderedImportedAsset = false;
    this.requestVersion += 1;
  }

  private async setImportedAction(
    packId: string,
    actionId: SafeActionId,
    playback: PlaybackIntent,
    requestVersion: number
  ) {
    const container = this.container;
    if (!container) {
      return;
    }
    container.dataset.safeActionId = actionId;
    container.dataset.playbackPriority = playback.priority;
    container.dataset.rendererReasonCode = this.hasRenderedImportedAsset
      ? "asset_runtime_loading_previous_frame"
      : "asset_runtime_loading";
    try {
      const asset = await invoke<RuntimeAssetData>("runtime_personalized_asset_data", {
        packId,
        actionId
      });
      if (this.requestVersion !== requestVersion || this.container !== container) {
        return;
      }
      this.importedAssetCache.set(actionId, asset);
      this.renderImportedAsset(container, asset, requestVersion);
      this.hasRenderedImportedAsset = true;
      delete container.dataset.rendererReasonCode;
    } catch {
      if (this.container === container) {
        container.dataset.rendererReasonCode = "asset_runtime_read_failed";
        if (!this.hasRenderedImportedAsset) {
          this.renderBundledAction(actionId, playback);
        }
      }
    }
  }

  private renderBundledAction(actionId: SafeActionId, playback: PlaybackIntent) {
    if (!this.container) {
      return;
    }
    const coreActionId = coreSpriteAction(actionId);
    this.container.dataset.safeActionId = coreActionId;
    this.container.dataset.playbackPriority = playback.priority;
    if (this.bundledPackId === FLAGSHIP_WORK_CAT_V2_PACK_ID) {
      const flagshipActionId = actionId in FLAGSHIP_WORK_CAT_V2_ACTIONS ? actionId as FlagshipWorkCatV2ActionId : coreActionId;
      const flagshipAction = FLAGSHIP_WORK_CAT_V2_ACTIONS[flagshipActionId];
      this.container.dataset.safeActionId = flagshipActionId;
      this.renderBundledAnimatedAsset(this.container, flagshipAction.frames.map(renderFlagshipWorkCatV2Frame), flagshipAction.fps);
      return;
    }
    if (this.bundledPackId === LIVING_WORK_CAT_V1_PACK_ID || !this.bundledPackId) {
      const livingActionId = actionId in LIVING_WORK_CAT_V1_ACTIONS ? actionId as LivingWorkCatActionId : coreActionId;
      const livingAction = LIVING_WORK_CAT_V1_ACTIONS[livingActionId];
      this.container.dataset.safeActionId = livingActionId;
      this.renderBundledAnimatedAsset(this.container, livingAction.frames.map(renderLivingWorkCatFrame), livingAction.fps);
      return;
    }
    if (this.bundledPackId && isPremiumCatPackId(this.bundledPackId)) {
      const premiumPack = getPremiumCatPack(this.bundledPackId);
      const premiumAction = premiumPack?.actions[coreActionId];
      if (premiumAction) {
        this.renderBundledAnimatedAsset(this.container, premiumAction.frames.map(renderPremiumCatFrame), premiumAction.fps);
        return;
      }
    }
    if (this.bundledPackId === WORK_CAT_V1_PACK_ID || !this.bundledPackId) {
      const workCatAction = WORK_CAT_V1_ACTIONS[coreActionId];
      this.renderBundledAnimatedAsset(this.container, workCatAction.frames.map(renderWorkCatFrame), workCatAction.fps);
      return;
    }
    if (this.bundledPackId === SPRITE_V3_ANIMATED_PACK_ID) {
      const baselineAction = SPRITE_V3_ANIMATED_ACTIONS[coreActionId];
      this.renderBundledAnimatedAsset(this.container, baselineAction.frames.map(renderAnimatedSpriteFrame), baselineAction.fps);
      return;
    }
    this.stopFrameAnimation();
    this.container.innerHTML = renderSpriteFrame(SPRITE_V2_FRAMES[coreActionId]);
  }

  private renderBundledAnimatedAsset(container: HTMLElement, svgFrames: string[], fps: number) {
    this.stopFrameAnimation();
    const closedFrames = closeFrameLoop(svgFrames);
    container.innerHTML = `
      <span class="imported-sprite-motion bundled-sprite-motion" aria-hidden="true">
        <span class="imported-sprite-frame bundled-sprite-frame">${closedFrames[0] ?? ""}</span>
      </span>
    `;
    if (closedFrames.length <= 1) {
      return;
    }
    const frameElement = container.querySelector<HTMLElement>(".bundled-sprite-frame");
    if (!frameElement) {
      return;
    }
    const frameMs = 1000 / clampFps(fps);
    let previousTime = performance.now();
    let frameIndex = 0;
    const tick = (time: number) => {
      if (this.container !== container) {
        return;
      }
      if (time - previousTime >= frameMs) {
        previousTime = time;
        frameIndex = (frameIndex + 1) % closedFrames.length;
        frameElement.innerHTML = closedFrames[frameIndex] ?? "";
      }
      this.animationFrameId = window.requestAnimationFrame(tick);
    };
    this.animationFrameId = window.requestAnimationFrame(tick);
  }

  private renderImportedAsset(container: HTMLElement, asset: RuntimeAssetData, requestVersion: number) {
    this.stopFrameAnimation();
    const frames = Array.isArray(asset.frames) && asset.frames.length > 1
      ? asset.frames
      : [{ mimeType: asset.mimeType, base64: asset.base64 }];
    const imageSources = closeFrameLoop(frames.map((frame) => `data:${escapeAttribute(frame.mimeType)};base64,${escapeAttribute(frame.base64)}`));
    container.innerHTML = `
      <span class="imported-sprite-motion imported-sprite-frame-stack" aria-hidden="true">
        ${imageSources.map((source, index) => `<img class="imported-sprite-frame${index === 0 ? " is-active" : ""}" alt="" src="${source}" draggable="false" decoding="async" />`).join("")}
      </span>
    `;
    if (imageSources.length <= 1) {
      return;
    }
    void this.startImportedFrameStackAnimation(container, asset.fps, requestVersion);
  }

  private async startImportedFrameStackAnimation(container: HTMLElement, fps: number | undefined, requestVersion: number) {
    const images = Array.from(container.querySelectorAll<HTMLImageElement>(".imported-sprite-frame"));
    if (images.length <= 1) {
      return;
    }
    await Promise.all(images.map(async (image) => {
      try {
        if (typeof image.decode === "function") {
          await image.decode();
        }
      } catch {
        // Keep the current visible frame; decode failures are handled by the browser image fallback.
      }
    }));
    if (this.container !== container || this.requestVersion !== requestVersion) {
      return;
    }
    const frameMs = 1000 / clampFps(fps);
    let previousTime = performance.now();
    let frameIndex = 0;
    const tick = (time: number) => {
      if (this.container !== container || this.requestVersion !== requestVersion) {
        return;
      }
      if (time - previousTime >= frameMs) {
        previousTime = time;
        const previousIndex = frameIndex;
        frameIndex = (frameIndex + 1) % images.length;
        images[previousIndex]?.classList.remove("is-active");
        images[frameIndex]?.classList.add("is-active");
      }
      this.animationFrameId = window.requestAnimationFrame(tick);
    };
    this.animationFrameId = window.requestAnimationFrame(tick);
  }

  private stopFrameAnimation() {
    if (this.animationFrameId !== undefined) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }
}

type BundledSpritePackId = typeof FLAGSHIP_WORK_CAT_V2_PACK_ID | typeof LIVING_WORK_CAT_V1_PACK_ID | typeof WORK_CAT_V1_PACK_ID | typeof SPRITE_V3_ANIMATED_PACK_ID | typeof SPRITE_V2_PACK_ID | PremiumCatPackId;

function isBundledSpritePack(packId: string): packId is BundledSpritePackId {
  return packId === FLAGSHIP_WORK_CAT_V2_PACK_ID || packId === LIVING_WORK_CAT_V1_PACK_ID || packId === WORK_CAT_V1_PACK_ID || packId === SPRITE_V3_ANIMATED_PACK_ID || packId === SPRITE_V2_PACK_ID || isPremiumCatPackId(packId);
}

function coreSpriteAction(actionId: SafeActionId) {
  return actionId in SPRITE_V2_FRAMES ? actionId as keyof typeof SPRITE_V2_FRAMES : "idle";
}

function clampScale(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(2, Math.max(0.5, value));
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function clampFps(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 12;
  }
  return Math.min(24, Math.max(1, Math.round(value as number)));
}

function closeFrameLoop<T>(frames: T[]): T[] {
  if (frames.length <= 1) {
    return frames;
  }
  return frames[0] === frames[frames.length - 1] ? frames : [...frames, frames[0]];
}
