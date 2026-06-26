import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { CAT_STATE_CONFIG, CAT_STATE_ORDER, labelForState, type CatState } from "./pet-states";
import { RendererRegistry, type RendererRegistrySelection } from "./renderer/renderer-registry";
import { manifestForRuntimeRenderer, resolveRuntimeRendererKind } from "./renderer/renderer-selection";
import { resolveCatAction } from "./state/cat-action-resolver";
import { CatStateMachine, catStateStorageKey, readStoredCatStateSnapshot, type CatStateSnapshot } from "./state-machine";
import { RuntimeMicroInteractionController } from "./runtime-micro-interactions";
import {
  AutonomousWalkController,
  DEFAULT_INTERACTION_SETTINGS,
  buildInteractionPreviewSnapshot,
  readInteractionSettings,
  writeInteractionSettings,
  type InteractionPreviewKind,
  type InteractionSettings
} from "./interaction-settings";
import { composeRuntimeVisual, type VisualActionPlan } from "./visual-action-composer";
import { CORE_ACTION_IDS, isOptionalActionId, type AssetManifest, type CoreActionId, type RendererKind, type SafeActionId } from "./assets/asset-manifest";
import { resolveAnimationCoverage, type AnimationCoverage } from "./assets/animation-coverage";
import { applyGalleryCardFilters } from "./assets/gallery-controls";
import {
  createManagerRuntimePackView,
  createPetGalleryPackViews,
  sanitizeFavoritePackIds,
  type PetGalleryFilters,
  type PetGalleryMotionLevel,
  type PetGalleryPackSummary,
  type PetGalleryPackView
} from "./assets/asset-manager-view-model";
import { assetPackList, assetPreviewPanel } from "./assets/asset-manager-panel";
import { generateAnimatedSpritePromptWorkflow, type AnimatedSpritePromptWorkflow } from "./assets/animated-sprite-prompt-workflow";
import { generateExternalGenerationInstructionWorkflowFromPromptPack } from "./assets/external-generation-instruction-workflow";
import { generateGuidedAssetPromptPack, type GuidedAssetRendererTarget } from "./assets/guided-prompt-workflow";
import { generateLocalTraitPromptPack, type LocalTraitPromptPack } from "./assets/local-trait-prompt-pack";
import { buildPhotoIntakeEvidenceSnapshot, createPhotoIntakePrivacySession, type PhotoIntakeSession } from "./assets/photo-intake-privacy-boundary";
import {
  bindPhoto2DProviderDisclosureControls,
  readPhoto2DProviderDisclosureControls,
  resetPhoto2DProviderDisclosureControls
} from "./assets/photo-2d-wizard-controls";
import {
  createPhoto2DWizardIntakeSnapshot,
  createPhoto2DWizardGenerationSnapshot,
  createPhoto2DWizardModel,
  createPhoto2DWizardProviderDisclosureSnapshot,
  type Photo2DWizardModel,
  type Photo2DWizardSafeActionSheetInput,
  type Photo2DWizardSafePhotoInput
} from "./assets/photo-to-2d-wizard";
import {
  buildV37PhotoToActionEvidenceSnapshot,
  createV37PhotoToActionProductPath,
  decideV37FinalPhotoToAction
} from "./assets/v37-photo-to-action-product-path";
import {
  buildV38PublicPhotoActionEvidenceSnapshot,
  createV38BundledPublicPhotoActionPipeline,
  createV38PublicPhotoActionPipeline
} from "./assets/v38-public-photo-action-pipeline";
import { providerFeasibilityStatus } from "./assets/provider-consent-boundary";
import { PREMIUM_CAT_PACKS, getPremiumCatPack, isPremiumCatPackId } from "./assets/bundled-packs/premium-cats-v1";
import {
  LIVING_WORK_CAT_V1_PACK,
  LIVING_WORK_CAT_V1_PACK_ID,
  LIVING_WORK_CAT_OPTIONAL_ACTION_IDS,
  getLivingWorkCatPack,
  isLivingWorkCatPackId
} from "./assets/bundled-packs/living-work-cat-v1";
import {
  FLAGSHIP_WORK_CAT_V2_PACK,
  FLAGSHIP_WORK_CAT_V2_PACK_ID,
  getFlagshipWorkCatV2Pack,
  isFlagshipWorkCatV2PackId
} from "./assets/bundled-packs/flagship-work-cat-v2";
import { createCodexWorkCatOnboarding } from "./codex/work-cat-onboarding";
import { createSanitizedDiagnosticsExport, diagnosticsExportHasForbiddenContent, releaseFoundationStatus } from "./release/release-foundation";
import {
  defaultPetInstance,
  derivePetInstanceLimits,
  type PetInstanceLimits,
  type PetInstanceListResult
} from "./runtime-state";
import {
  activatePersonalizedAssetPack,
  assembleAnimatedSpritePack,
  createPetInstance,
  deactivatePersonalizedAssetPack,
  deletePersonalizedAssetPack,
  detachPetInstance,
  getApiDebugState,
  getCurrentPetInstance,
  getPetPosition,
  getSettings,
  importPersonalizedAssetPack,
  isTauriRuntime,
  listCatProfiles,
  listPersonalizedAssetPacks,
  listPetInstances,
  renamePersonalizedAssetPack,
  renamePetInstance,
  resetPetInstancePosition,
  runtimePersonalizedAssetData,
  runtimePersonalizedAssetPack,
  sendTestPetReaction,
  setCurrentPetPosition,
  setMuted,
  setPetInstanceProfile,
  setPetInstanceVisible,
  type AnimatedSpriteAssemblyResult,
  type ApiEventSummary,
  type AppSettings,
  type BridgeDiagnostics,
  type CatProfile,
  type DiagnosticsViewState,
  type PetInstance,
  type RuntimeAssetData,
  type RuntimeImportedAssetPack,
  type PersonalizedAssetPack,
  type PersonalizedAssetUpdateEvent,
  type TokenStatus,
  type WindowPosition
} from "./tauri-commands";
import "./styles.css";

type AcceptedPetEvent = {
  source: {
    id: string;
    kind: string;
    name?: string;
  };
  via: "http";
  level: CatState;
  title?: string;
  message?: string;
  action?: string;
  sound?: string;
  durationMs?: number;
  hardware?: unknown;
  metadata?: unknown;
  receivedAt: string;
  targetInstanceId?: string | null;
  targetWindowLabel?: string | null;
};

const STATE_CLASS_NAMES = Object.values(CAT_STATE_CONFIG).map((config) => config.cssClass);
const DEFAULT_CAT_PROFILE_ID = "default-cat";
const INSTANCE_FEEDBACK_TIMEOUT_MS = 2400;
const RUNTIME_RENDERER_SCALE_STORAGE_KEY = "agentDesktopPet.runtimeRendererScale";
const BUNDLED_PACK_BY_INSTANCE_STORAGE_KEY = "agentDesktopPet.bundledPackByInstance.v11";
const BUNDLED_PACK_FAVORITES_STORAGE_KEY = "agentDesktopPet.bundledPackFavorites.v14";
const FIRST_RUN_COMPLETED_STORAGE_KEY = "agentDesktopPet.firstRunCompleted.v11";
const BUNDLED_LOCAL_CAT_PACKS = [FLAGSHIP_WORK_CAT_V2_PACK, LIVING_WORK_CAT_V1_PACK, ...PREMIUM_CAT_PACKS] as const;
const assetManagerPanelFormatters = {
  escapeHtml,
  formatTimestamp,
  shortStateLabel
};
let petNativeDragGuardInstalled = false;
const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app root element");
}

const appRoot = app;
const currentWindow = isTauriRuntime()
  ? getCurrentWindow()
  : { label: new URLSearchParams(window.location.search).get("window") === "settings" ? "settings" : "main" };
const windowLabel = currentWindow.label;
let photo2DWizardSelectedPhoto: Photo2DWizardSafePhotoInput | null = null;
let photo2DWizardPreviewUrl: string | null = null;
let photo2DWizardSelectedActionSheet: Photo2DWizardSafeActionSheetInput | null = null;
let photo2DWizardActionSheetPreviewUrl: string | null = null;

function isSettingsWindow() {
  return windowLabel === "settings";
}

async function getPetInstanceListResult(): Promise<PetInstanceListResult> {
  const instances = await listPetInstances();
  return {
    instances,
    limits: derivePetInstanceLimits(instances)
  };
}

async function renderPet(settings: AppSettings) {
  let instance = await getCurrentPetInstance().catch(() => defaultPetInstance());
  const profiles = await listCatProfiles().catch(() => defaultCatProfiles());
  const profileClass = catProfileClass(instance.catProfileId, profiles);
  document.documentElement.classList.remove("settings-root");
  document.body.classList.add("pet-body");
  document.body.classList.remove("settings-body");
  appRoot.innerHTML = `
    <main class="pet-shell cat-state-idle ${escapeHtml(profileClass)}" aria-label="Agent Desktop Pet">
      <button class="pet-stage" type="button" aria-label="Drag Agent Desktop Pet">
        ${cssCatMarkup()}
      </button>
      <p class="pet-status" aria-live="polite">
        <span class="pet-name-label">${escapeHtml(instance.displayName)}</span>
        <span id="pet-state-label">Idle</span>
        <span id="pet-queue-label" class="pet-queue-label"></span>
        <span class="pet-muted-label">${settings.muted ? " · Muted" : ""}</span>
      </p>
      <nav class="debug-strip" aria-label="Local state debugger">
        ${CAT_STATE_ORDER.map((state) => `
          <button class="debug-state-button" type="button" data-state="${state}" title="Trigger ${labelForState(state)}">
            ${shortStateLabel(state)}
          </button>
        `).join("")}
      </nav>
    </main>
  `;

  installPetNativeDragGuard();

  const initialState = isCatState(instance.currentState) ? instance.currentState : undefined;
  const stateMachine = new CatStateMachine(catStateStorageKey(instance.instanceId), initialState);
  const shell = appRoot.querySelector<HTMLElement>(".pet-shell");
  const rendererContainer = appRoot.querySelector<HTMLElement>(".pet-stage");
  const stateLabel = appRoot.querySelector<HTMLElement>("#pet-state-label");
  const queueLabel = appRoot.querySelector<HTMLElement>("#pet-queue-label");
  const nameLabel = appRoot.querySelector<HTMLElement>(".pet-name-label");
  let activeManifest: AssetManifest = manifestForRuntimeRenderer("css");
  let rendererSelection: RendererRegistrySelection | null = null;
  let runtimeRendererScale = readRuntimeRendererScale();
  const microInteractions = new RuntimeMicroInteractionController();
  const autonomousWalk = new AutonomousWalkController();
  let interactionSettings = readInteractionSettings();
  let previousVisualPlan: VisualActionPlan | undefined;
  let latestSnapshot = readStoredCatStateSnapshot(catStateStorageKey(instance.instanceId));
  let latestPosition: WindowPosition = await getPetPosition().catch(() => ({ x: instance.position.x, y: instance.position.y }));
  let hoverTimer: number | undefined;
  let pendingClickTimer: number | undefined;
  let walkInFlight = false;

  function renderRuntimeAction(snapshot: CatStateSnapshot) {
    if (!shell) {
      return;
    }
    microInteractions.setBaseState(snapshot.current);
    const microSnapshot = microInteractions.snapshot();
    const composed = composeRuntimeVisual(microSnapshot, { previousPlan: previousVisualPlan });
    previousVisualPlan = composed.plan;
    const optionalActionId = typeof composed.plan.visualActionId === "string" && isOptionalActionId(composed.plan.visualActionId)
      ? composed.plan.visualActionId
      : undefined;
    const resolvedAction = resolveCatAction(composed.plan.actionId, activeManifest, {
      currentState: snapshot.current,
      optionalActionId
    });
    rendererSelection?.renderer.setAction(resolvedAction.actionId, resolvedAction.playback);
    shell.dataset.emotionProfile = composed.emotion.emotionProfile;
    shell.dataset.visualActionId = composed.plan.visualActionId;
    shell.dataset.visualActionPhase = composed.plan.phase;
    shell.dataset.visualActionPriority = String(composed.plan.priority);
    shell.dataset.visualReasonCode = composed.plan.reasonCode;
    shell.dataset.microInteraction = microSnapshot.microInteraction;
    shell.dataset.microReasonCode = microSnapshot.reasonCode;
    shell.dataset.microActive = String(microSnapshot.active);
  }

  async function remountRenderer(reason = "initial") {
    if (!shell || !rendererContainer) {
      return;
    }
    rendererSelection?.renderer.dispose();
    const runtime = await resolveRendererForPetInstance(instance.instanceId);
    activeManifest = runtime.manifest;
    rendererSelection = new RendererRegistry().create(runtime.rendererKind);
    rendererContainer.innerHTML = rendererSelection.selectedKind === "css" ? cssCatMarkup() : "";
    rendererSelection.renderer.mount(rendererContainer, {
      profileId: instance.catProfileId,
      rendererKind: rendererSelection.selectedKind,
      packId: runtime.manifest.packId,
      scale: runtimeRendererScale
    });
    shell.dataset.requestedRendererKind = runtime.requestedKind;
    shell.dataset.rendererFallbackUsed = String(runtime.fallbackUsed || rendererSelection.fallbackUsed);
    shell.dataset.rendererSource = runtime.source;
    shell.dataset.rendererRemountReason = reason;
    shell.dataset.rendererKind = rendererSelection.selectedKind;
    shell.dataset.assetPackId = runtime.manifest.packId;
    shell.dataset.rendererScale = String(runtimeRendererScale);
    if (runtime.reasonCode) {
      shell.dataset.rendererReasonCode = runtime.reasonCode;
    } else {
      delete shell.dataset.rendererReasonCode;
    }
    latestSnapshot = readStoredCatStateSnapshot(catStateStorageKey(instance.instanceId));
    renderRuntimeAction(latestSnapshot);
  }

  await remountRenderer();

  stateMachine.subscribe((snapshot) => {
    latestSnapshot = snapshot;
    updatePetStateUi(shell, stateLabel, queueLabel, snapshot);
    renderRuntimeAction(snapshot);
  });

  window.setInterval(() => {
    interactionSettings = readInteractionSettings();
    microInteractions.maybeStartIdleRandom();
    renderRuntimeAction(latestSnapshot);
  }, 1_000);

  window.setInterval(() => {
    if (walkInFlight) {
      return;
    }
    interactionSettings = readInteractionSettings();
    const decision = autonomousWalk.tick({
      baseState: latestSnapshot.current,
      interaction: microInteractions.snapshot(),
      settings: interactionSettings,
      position: latestPosition,
      bounds: currentSafeDesktopBounds()
    });
    if (!decision.active || decision.visual === "none") {
      return;
    }
    microInteractions.startAutonomousWalk(decision.visual);
    renderRuntimeAction(latestSnapshot);
    walkInFlight = true;
    setCurrentPetPosition(decision.position)
      .then((position) => {
        latestPosition = position;
      })
      .catch(() => {
        microInteractions.startAutonomousWalk("turn");
      })
      .finally(() => {
        walkInFlight = false;
        renderRuntimeAction(latestSnapshot);
      });
  }, 600);

  listen<AcceptedPetEvent>("pet-event:accepted", (event) => {
    if (shouldAcceptPetEvent(instance, event.payload) && isCatState(event.payload.level)) {
      stateMachine.enqueue(event.payload.level, "pet_event");
    }
  }).catch((error) => console.error("failed to listen for pet events", error));

  listen<PetInstance>("pet-instance:updated", (event) => {
    if (event.payload.instanceId !== instance.instanceId) {
      return;
    }
    const previousProfileId = instance.catProfileId;
    instance = event.payload;
    applyCatProfileClass(shell, instance.catProfileId, profiles);
    if (nameLabel) {
      nameLabel.textContent = instance.displayName;
    }
    if (previousProfileId !== instance.catProfileId) {
      void remountRenderer("profile-updated");
    }
  }).catch((error) => console.error("failed to listen for pet instance updates", error));

  listen<PersonalizedAssetUpdateEvent>("personalized-asset:updated", (event) => {
    if (event.payload.instanceId === instance.instanceId) {
      void remountRenderer("asset-updated");
    }
  }).catch((error) => console.error("failed to listen for personalized asset updates", error));

  appRoot.querySelectorAll<HTMLButtonElement>("[data-state]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      stateMachine.enqueue(button.dataset.state as CatState);
    });
  });

  window.addEventListener("keydown", (event) => {
    if (!event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) {
      return;
    }
    if (event.key !== "7" && event.key !== "0") {
      return;
    }
    event.preventDefault();
    runtimeRendererScale = event.key === "7" ? 0.75 : 1;
    try {
      window.localStorage.setItem(RUNTIME_RENDERER_SCALE_STORAGE_KEY, String(runtimeRendererScale));
    } catch {
      // Local storage can be unavailable in restricted webviews; keep in-memory scale.
    }
    rendererSelection?.renderer.setScale(runtimeRendererScale);
    if (shell) {
      shell.dataset.rendererScale = String(runtimeRendererScale);
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key === BUNDLED_PACK_BY_INSTANCE_STORAGE_KEY) {
      void remountRenderer("bundled-pack-preference-updated");
    }
  });

  const dragTarget = appRoot.querySelector<HTMLElement>(".pet-shell");
  const interactiveStage = dragTarget?.querySelector<HTMLElement>(".pet-stage");
  let pendingDrag: { pointerId: number; x: number; y: number } | null = null;
  let dragInProgress = false;
  let lastDragEndedAt = 0;
  const dragStartThresholdPx = 6;

  interactiveStage?.addEventListener("pointerenter", () => {
    interactionSettings = readInteractionSettings();
    if (!interactionSettings.pointerReactions || interactionSettings.quietMode) {
      return;
    }
    microInteractions.startPointerNear();
    renderRuntimeAction(latestSnapshot);
    window.clearTimeout(hoverTimer);
    hoverTimer = window.setTimeout(() => {
      interactionSettings = readInteractionSettings();
      if (!interactionSettings.pointerReactions || interactionSettings.quietMode) {
        return;
      }
      microInteractions.startPointerHover();
      renderRuntimeAction(latestSnapshot);
    }, 650);
  });

  interactiveStage?.addEventListener("pointerleave", () => {
    window.clearTimeout(hoverTimer);
    interactionSettings = readInteractionSettings();
    if (!interactionSettings.pointerReactions || interactionSettings.quietMode) {
      return;
    }
    microInteractions.startPointerLeave();
    renderRuntimeAction(latestSnapshot);
  });

  interactiveStage?.addEventListener("click", (event) => {
    if (Date.now() - lastDragEndedAt < 400) {
      return;
    }
    interactionSettings = readInteractionSettings();
    if (!interactionSettings.clickReactions || interactionSettings.quietMode) {
      return;
    }
    event.stopPropagation();
    window.clearTimeout(pendingClickTimer);
    pendingClickTimer = window.setTimeout(() => {
      microInteractions.startClick();
      renderRuntimeAction(latestSnapshot);
      pendingClickTimer = undefined;
    }, 240);
  });

  interactiveStage?.addEventListener("dblclick", (event) => {
    if (Date.now() - lastDragEndedAt < 400) {
      return;
    }
    interactionSettings = readInteractionSettings();
    if (!interactionSettings.clickReactions || interactionSettings.quietMode) {
      return;
    }
    event.stopPropagation();
    window.clearTimeout(pendingClickTimer);
    pendingClickTimer = undefined;
    microInteractions.startDoubleClick();
    renderRuntimeAction(latestSnapshot);
  });

  dragTarget?.addEventListener("pointerdown", async (event) => {
    if (event.button !== 0) {
      return;
    }
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target || target.closest(".debug-strip")) {
      return;
    }
    if (!target.closest(".pet-stage") && !target.closest(".pet-status")) {
      return;
    }
    interactionSettings = readInteractionSettings();
    pendingDrag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    dragTarget.setPointerCapture?.(event.pointerId);
  }, { capture: true });

  dragTarget?.addEventListener("pointermove", async (event) => {
    if (!pendingDrag || dragInProgress || pendingDrag.pointerId !== event.pointerId) {
      return;
    }
    const distance = Math.hypot(event.clientX - pendingDrag.x, event.clientY - pendingDrag.y);
    if (distance < dragStartThresholdPx) {
      return;
    }
    event.preventDefault();
    dragInProgress = true;
    shell?.classList.add("pet-dragging");
    if (interactionSettings.dragPhysics && !interactionSettings.quietMode) {
      microInteractions.startDragStart();
      renderRuntimeAction(latestSnapshot);
    }
    try {
      if (interactionSettings.dragPhysics && !interactionSettings.quietMode) {
        microInteractions.startDragging();
        renderRuntimeAction(latestSnapshot);
      }
      if (isTauriRuntime() && "startDragging" in currentWindow) {
        await currentWindow.startDragging();
      }
    } finally {
      window.setTimeout(() => {
        shell?.classList.remove("pet-dragging");
        if (interactionSettings.dragPhysics && !interactionSettings.quietMode) {
          microInteractions.stopDrag();
        }
        renderRuntimeAction(latestSnapshot);
        void getPetPosition().then((position) => {
          latestPosition = position;
        }).catch(() => undefined);
        lastDragEndedAt = Date.now();
        dragInProgress = false;
        pendingDrag = null;
      }, 200);
    }
  }, { capture: true });

  dragTarget?.addEventListener("pointerup", (event) => {
    if (pendingDrag?.pointerId === event.pointerId && !dragInProgress) {
      pendingDrag = null;
    }
  }, { capture: true });

  dragTarget?.addEventListener("pointercancel", (event) => {
    if (pendingDrag?.pointerId === event.pointerId) {
      pendingDrag = null;
    }
    if (dragInProgress) {
      shell?.classList.remove("pet-dragging");
      if (interactionSettings.dragPhysics && !interactionSettings.quietMode) {
        microInteractions.stopDrag();
      }
      renderRuntimeAction(latestSnapshot);
      lastDragEndedAt = Date.now();
      dragInProgress = false;
    }
  }, { capture: true });
}

function installPetNativeDragGuard() {
  if (petNativeDragGuardInstalled) {
    return;
  }
  petNativeDragGuardInstalled = true;
  const preventNativePetDrag = (event: Event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest(".pet-shell")) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };
  window.addEventListener("dragstart", preventNativePetDrag, { capture: true });
  window.addEventListener("selectstart", preventNativePetDrag, { capture: true });
}

function currentSafeDesktopBounds() {
  const safeMargin = 24;
  const petWindowSize = 220;
  const availableWidth = Number.isFinite(window.screen?.availWidth) ? window.screen.availWidth : 1440;
  const availableHeight = Number.isFinite(window.screen?.availHeight) ? window.screen.availHeight : 900;
  return {
    minX: safeMargin,
    minY: safeMargin,
    maxX: Math.max(safeMargin, availableWidth - petWindowSize - safeMargin),
    maxY: Math.max(safeMargin, availableHeight - petWindowSize - safeMargin)
  };
}

async function renderSettings(settings: AppSettings) {
  document.documentElement.classList.add("settings-root");
  document.body.classList.add("settings-body");
  document.body.classList.remove("pet-body");
  const position = await getPetPosition().catch(() => ({ x: 0, y: 0 }));
  const stateSnapshot = readStoredCatStateSnapshot();
  const diagnosticsState = await readDiagnosticsViewState(settings);
  const instanceResult = await getPetInstanceListResult().catch(() => {
    const instances = [defaultPetInstance()];
    return {
      instances,
      limits: derivePetInstanceLimits(instances)
    };
  });
  const { instances, limits } = instanceResult;
  const profiles = await listCatProfiles().catch(() => defaultCatProfiles());
  const assetPacks = await listPersonalizedAssetPacks().catch(() => [] as PersonalizedAssetPack[]);
  const releaseDiagnosticsExport = createReleaseDiagnosticsExport(diagnosticsState, instances, assetPacks);
  const visibleInstanceCount = instances.filter((instance) => instance.visible).length;
  const activeAssetCount = assetPacks.filter((pack) => pack.activeInstances.length > 0).length;
  const interactionSettings = readInteractionSettings();
  const photo2DWizard = createPhoto2DWizardModel();
  const v37ProductPath = createV37PhotoToActionProductPath();
  const v38PublicPhotoPipeline = createV38BundledPublicPhotoActionPipeline();

  appRoot.innerHTML = `
    <main class="settings-panel">
      <header class="settings-header">
        <div>
          <span class="settings-eyebrow">Agent Desktop Pet</span>
          <h1>设置与工作猫管理</h1>
          <p>管理桌宠实例、Codex 工作猫、个性化资产和本地诊断。</p>
        </div>
        <button class="primary-action" id="mute-toggle" type="button">
          ${settings.muted ? "取消静音" : "静音"}
        </button>
      </header>

      <section class="settings-overview" aria-label="设置概览">
        <article class="settings-stat-card">
          <span>桌宠实例</span>
          <strong>${instances.length}/${limits.hardLimit}</strong>
          <small>${visibleInstanceCount} 只可见 · ${limits.overSoftLimit ? "建议清理" : "容量正常"}</small>
        </article>
        <article class="settings-stat-card">
          <span>资产包</span>
          <strong>${assetPacks.length}</strong>
          <small>${activeAssetCount} 个已激活到实例</small>
        </article>
        <article class="settings-stat-card">
          <span>当前状态</span>
          <strong>${escapeHtml(instanceStateLabel(stateSnapshot.current))}</strong>
          <small>队列 ${stateSnapshot.queueLength} · ${settings.muted ? "已静音" : "声音开启"}</small>
        </article>
        <article class="settings-stat-card">
          <span>事件桥</span>
          <strong>${diagnosticsState.diagnostics.enabled && !diagnosticsState.error ? "在线" : "不可达"}</strong>
          <small>${escapeHtml(apiDebugSummary(diagnosticsState))}</small>
        </article>
      </section>

      ${firstRunWizard(instances, limits)}

      <div class="settings-workspace">
        <aside class="settings-rail" aria-label="设置工作台导航">
          <div class="settings-rail-card">
            <h2>常用入口</h2>
            <nav class="settings-nav" aria-label="设置分区导航">
              <a href="#section-pets">多猫实例</a>
              <a href="#section-codex">Codex 工作猫</a>
              <a href="#section-interactions">互动</a>
              <a href="#section-assets">本地资产</a>
              <a href="#section-personalization">个性化生成</a>
              <a href="#section-diagnostics">诊断</a>
            </nav>
          </div>
          <div class="settings-rail-card">
            <h2>当前摘要</h2>
            <dl class="settings-rail-summary">
              <div><dt>可见猫</dt><dd>${visibleInstanceCount}</dd></div>
              <div><dt>资产激活</dt><dd>${activeAssetCount}</dd></div>
              <div><dt>事件桥</dt><dd>${diagnosticsState.diagnostics.enabled && !diagnosticsState.error ? "在线" : "不可达"}</dd></div>
              <div><dt>互动</dt><dd>${interactionSettings.quietMode ? "安静" : interactionSettings.interactionFrequency}</dd></div>
              <div><dt>静音</dt><dd>${settings.muted ? "是" : "否"}</dd></div>
            </dl>
          </div>
          <p class="settings-rail-note">Already-open Codex window 仍不支持自动监听；推荐 wrapper JSONL 或 managed TUI hooks。</p>
        </aside>

        <div class="settings-content">

      <section class="settings-section settings-compact-section" id="section-basics">
        <div>
          <h2>基础状态</h2>
          <p>位置 x=${Math.round(position.x)}，y=${Math.round(position.y)}；<span id="settings-state-summary">${settingsStateSummary(stateSnapshot)}</span></p>
        </div>
        <button class="secondary-action" id="state-refresh" type="button">刷新</button>
      </section>

      <section class="settings-section api-debug-section" id="section-release">
        <div>
          <h2>首次启动与发布基础</h2>
          <p>V6.1 只覆盖本地 macOS packaging foundation、首次启动指引、权限说明和脱敏诊断导出；不代表 production signed release。</p>
        </div>
      </section>

      <section class="release-foundation-panel" id="release-foundation-panel">
        ${releaseFoundationPanel(releaseDiagnosticsExport)}
      </section>

      <h2 class="settings-group-title" id="section-pets">多猫实例</h2>
      <section class="settings-section api-debug-section">
        <div>
          <h2>多猫管理</h2>
          <p>${instanceLimitSummary(limits)}</p>
          ${limits.overSoftLimit ? `<p class="instance-limit-warning">${limits.atHardLimit ? "已达到 12 只猫上限，请先移除不用的实例猫。" : "当前猫较多，建议移除不用的实例猫。"}</p>` : ""}
        </div>
        <button class="secondary-action" id="instance-create" type="button" ${limits.atHardLimit ? "disabled" : ""}>创建 Codex 猫</button>
      </section>

      <section class="instance-list" id="instance-list">
        ${instanceList(instances, profiles, assetPacks)}
      </section>

      <h2 class="settings-group-title" id="section-codex">Codex 工作猫</h2>
      <section class="settings-section api-debug-section">
        <div>
          <h2>Codex 工作猫</h2>
          <p>V6.2 推荐 wrapper-launched exec JSONL。Managed TUI hooks 需要 /hooks trust；already-open Codex window 目前不支持自动监听。</p>
        </div>
        <button class="secondary-action" id="work-cat-create" type="button" ${limits.atHardLimit ? "disabled" : ""}>创建工作猫</button>
      </section>

      <section class="codex-work-cat-panel" id="codex-work-cat-panel">
        ${codexWorkCatPanel(instances, diagnosticsState)}
      </section>

      <h2 class="settings-group-title" id="section-interactions">桌面互动</h2>
      ${interactionSettingsPanel(interactionSettings)}

      <h2 class="settings-group-title" id="section-assets">本地资产</h2>
      ${builtInGalleryPanel(instances, assetPacks)}
      <section class="settings-section api-debug-section">
        <div>
          <h2>个性化资产包</h2>
          <p>导入本地 manifest，文件会复制到应用托管存储。V5.12 可在上方实例卡片中把资产包激活到指定猫。</p>
        </div>
      </section>

      <section class="asset-import-panel" id="asset-import-panel">
        <article class="asset-import-subpanel">
          <header class="guided-output-header">
            <div>
              <h3>多帧 Sprite 装配</h3>
              <p>选择本地帧目录，文件名需为 idle-000.png / thinking-000.png 等核心动作序列。装配器只复制 PNG 帧到应用托管存储。</p>
            </div>
            <span class="instance-badge">V8.9</span>
          </header>
          <div class="asset-import-controls asset-import-controls-wide">
            <label>
              <span>帧目录路径</span>
              <input id="animated-sprite-source-folder" type="text" autocomplete="off" spellcheck="false" placeholder="输入本地帧目录绝对路径" />
            </label>
            <label>
              <span>资产名称</span>
              <input id="animated-sprite-display-name" type="text" maxlength="80" autocomplete="off" placeholder="例如 Animated Orange Cat" />
            </label>
            <label>
              <span>FPS</span>
              <input id="animated-sprite-fps" type="number" min="1" max="24" value="12" inputmode="numeric" />
            </label>
            <label>
              <span>装配后激活到</span>
              <select id="animated-sprite-target-instance" aria-label="装配后激活到指定猫">
                <option value="">只导入，不激活</option>
                ${instances.map((instance) => `
                  <option value="${escapeHtml(instance.instanceId)}">${escapeHtml(instance.displayName)} · ${escapeHtml(instance.instanceId)}</option>
                `).join("")}
              </select>
            </label>
            <button class="primary-action" id="animated-sprite-assemble-submit" type="button">装配并导入</button>
          </div>
          <p class="asset-import-feedback" id="animated-sprite-feedback" aria-live="polite"></p>
        </article>
        <article class="asset-import-subpanel">
          <header class="guided-output-header">
            <div>
              <h3>Manifest 导入</h3>
              <p>已有标准 manifest.json 时使用。运行态激活仍在上方实例卡片中完成。</p>
            </div>
            <span class="instance-badge">V5.11</span>
          </header>
        <div class="asset-import-controls">
          <label>
            <span>Manifest 路径</span>
            <input id="asset-manifest-path" type="text" autocomplete="off" spellcheck="false" placeholder="输入本地 manifest.json 路径" />
          </label>
          <label>
            <span>显示名称</span>
            <input id="asset-display-name" type="text" maxlength="80" autocomplete="off" placeholder="可选" />
          </label>
          <button class="primary-action" id="asset-import-submit" type="button">导入</button>
        </div>
        <p class="asset-import-feedback" id="asset-import-feedback" aria-live="polite"></p>
        </article>
        <div id="asset-pack-list">
          ${assetPackList(assetPacks, assetManagerPanelFormatters)}
        </div>
        ${assetPreviewPanel(assetPacks)}
      </section>

      <h2 class="settings-group-title" id="section-personalization">个性化生成</h2>
      ${v37PhotoToActionPanel(v37ProductPath)}
      ${v38PublicPhotoActionPanel(v38PublicPhotoPipeline)}
      ${photo2DWizardPanel(photo2DWizard)}
      ${photo2DWizardModal(photo2DWizard)}
      <section class="settings-section api-debug-section">
        <div>
          <h2>个性化资产生成指南</h2>
          <p>V7.2 从用户确认 traits 本地生成标准提示词、manifest 模板和导入清单；不会上传照片，也不会在本阶段本地生成 3D。</p>
        </div>
      </section>

      <section class="photo-intake-panel" id="photo-intake-panel">
        <header>
          <div>
            <h3>V7.1 照片隐私边界</h3>
            <p>选择本地照片只生成脱敏审查摘要；不会读取原图内容、不会上传、不会保存文件名、EXIF/GPS 或完整路径。</p>
          </div>
          <span class="instance-badge">Local review</span>
        </header>
        <div class="guided-asset-controls">
          <label>
            <span>猫名</span>
            <input id="photo-intake-cat-name" type="text" maxlength="80" autocomplete="off" placeholder="例如 Orange Tabby" />
          </label>
          <label class="guided-notes-control">
            <span>用户确认的 traits</span>
            <textarea id="photo-intake-traits" maxlength="360" rows="3" placeholder="只写用户确认的毛色、眼睛、花纹、尾巴。不要粘贴路径、URL、token、EXIF/GPS 或 provider 内容。"></textarea>
          </label>
          <label>
            <span>本地照片（可选）</span>
            <input id="photo-intake-file" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>
          <label class="consent-row">
            <input id="photo-intake-consent" type="checkbox" />
            <span>我确认照片只作为本地参考，不上传、不保存原图。</span>
          </label>
          <div class="guided-asset-actions">
            <button class="primary-action" id="photo-intake-review-submit" type="button">生成隐私摘要</button>
            <button class="secondary-action" id="photo-intake-clear-submit" type="button">清空摘要</button>
          </div>
        </div>
        <p class="asset-import-feedback" id="photo-intake-feedback" aria-live="polite"></p>
        <div id="photo-intake-output" class="guided-asset-output" aria-live="polite">
          ${photoIntakeEmptyState()}
        </div>
      </section>

      <section class="guided-asset-panel" id="guided-asset-panel">
        <div class="guided-asset-controls">
          <label>
            <span>猫名</span>
            <input id="guided-cat-name" type="text" maxlength="80" autocomplete="off" placeholder="例如 Mochi" />
          </label>
          <label>
            <span>目标格式</span>
            <select id="guided-renderer-target" aria-label="目标资产格式">
              <option value="sprite">Sprite PNG</option>
              <option value="gltf">GLTF / GLB</option>
            </select>
          </label>
          <label class="guided-notes-control">
            <span>用户确认的外观描述</span>
            <textarea id="guided-visual-notes" maxlength="360" rows="4" placeholder="只写用户确认的毛色、眼睛、花纹、尾巴和动作风格。不要粘贴路径、URL、token 或 provider 内容。"></textarea>
          </label>
          <label>
            <span>照片参考（可选）</span>
            <input id="guided-photo-reference" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>
          <p class="guided-privacy-note">照片只作为本地人工参考；当前不会读取、上传、保存原图、EXIF/GPS 或完整路径。</p>
          <div class="guided-asset-actions">
            <button class="primary-action" id="guided-generate-submit" type="button">生成指南</button>
            <button class="secondary-action" id="guided-clear-submit" type="button">清空</button>
          </div>
        </div>
        <p class="asset-import-feedback" id="guided-asset-feedback" aria-live="polite"></p>
        <div id="guided-asset-output" class="guided-asset-output" aria-live="polite">
          ${guidedAssetEmptyState()}
        </div>
      </section>

      <section class="guided-asset-panel" id="animated-sprite-prompt-panel">
        <header>
          <div>
            <h3>V8.10 多帧动作提示词</h3>
            <p>本地生成 8 个核心动作的多帧 sprite 提示词、命名规则、manifest 模板和 V8.9 装配清单。默认不调用 provider。</p>
          </div>
          <span class="instance-badge">Prompt only</span>
        </header>
        <div class="guided-asset-controls">
          <label>
            <span>猫名</span>
            <input id="animated-prompt-cat-name" type="text" maxlength="80" autocomplete="off" placeholder="例如 Orange Tabby" />
          </label>
          <label>
            <span>每动作帧数</span>
            <input id="animated-prompt-frame-count" type="number" min="2" max="24" value="8" inputmode="numeric" />
          </label>
          <label>
            <span>FPS</span>
            <input id="animated-prompt-fps" type="number" min="1" max="24" value="12" inputmode="numeric" />
          </label>
          <label class="guided-notes-control">
            <span>用户确认的外观描述</span>
            <textarea id="animated-prompt-traits" maxlength="360" rows="4" placeholder="只写用户确认的毛色、眼睛、花纹、尾巴和动作风格。不要粘贴路径、URL、token、provider 内容或照片元数据。"></textarea>
          </label>
          <div class="guided-asset-actions">
            <button class="primary-action" id="animated-prompt-generate-submit" type="button">生成多帧提示词</button>
            <button class="secondary-action" id="animated-prompt-clear-submit" type="button">清空</button>
          </div>
        </div>
        <p class="asset-import-feedback" id="animated-prompt-feedback" aria-live="polite"></p>
        <div id="animated-prompt-output" class="guided-asset-output" aria-live="polite">
          ${animatedSpritePromptEmptyState()}
        </div>
      </section>

      <section class="settings-section api-debug-section">
        <div>
          <h2>外部生成 Provider</h2>
          <p>V5.14 只展示可行性和同意边界；当前不会上传、不会接受凭据、不会调用 provider。</p>
        </div>
      </section>

      <section class="provider-boundary-panel" id="provider-boundary-panel">
        ${providerBoundaryPanel()}
      </section>

      <h2 class="settings-group-title" id="section-diagnostics">诊断与保留项</h2>
      <section class="settings-section api-debug-section">
        <div>
          <h2>诊断</h2>
          <p id="settings-api-summary">${apiDebugSummary(diagnosticsState)}</p>
        </div>
        <button class="secondary-action" id="api-refresh" type="button">刷新</button>
      </section>

      <section class="diagnostics-panel" id="diagnostics-panel">
        ${diagnosticsPanel(diagnosticsState)}
      </section>

      <section class="settings-section muted-section" aria-disabled="true">
        <div>
          <h2>猫咪大小</h2>
          <p>大小控制保留给后续阶段。</p>
        </div>
        <input type="range" min="80" max="140" value="100" disabled aria-label="猫咪大小占位控件" />
      </section>

      <section class="event-empty">
        <h2>事件日志</h2>
        <p>当前只保留最近接收和拒绝的 HTTP 事件摘要，暂不提供完整事件日志界面。</p>
      </section>
        </div>
      </div>
    </main>
  `;

  appRoot.querySelector<HTMLButtonElement>("#mute-toggle")?.addEventListener("click", async () => {
    const updated = await setMuted(!settings.muted);
    await renderSettings(updated);
  });

  appRoot.querySelector<HTMLButtonElement>("#state-refresh")?.addEventListener("click", () => {
    const summary = appRoot.querySelector<HTMLElement>("#settings-state-summary");
    if (summary) {
      summary.textContent = settingsStateSummary(readStoredCatStateSnapshot());
    }
  });

  attachInteractionSettingsControls(interactionSettings);

  appRoot.querySelector<HTMLButtonElement>("#first-run-default")?.addEventListener("click", async () => {
    const button = appRoot.querySelector<HTMLButtonElement>("#first-run-default");
    const packId = selectedFirstRunPackId();
    const feedback = appRoot.querySelector<HTMLElement>("#first-run-feedback");
    button?.setAttribute("disabled", "true");
    try {
      writeBundledPackPreference("default", packId);
      await setPetInstanceVisible("default", true);
      markFirstRunCompleted("default_pet");
      if (feedback) feedback.textContent = "已显示默认活猫。";
      await renderSettings(await getSettings());
    } catch (error) {
      button?.removeAttribute("disabled");
      if (feedback) feedback.textContent = firstRunErrorMessage(error);
    }
  });

  appRoot.querySelector<HTMLButtonElement>("#first-run-work-cat")?.addEventListener("click", async () => {
    const button = appRoot.querySelector<HTMLButtonElement>("#first-run-work-cat");
    const packId = selectedFirstRunPackId();
    const feedback = appRoot.querySelector<HTMLElement>("#first-run-feedback");
    button?.setAttribute("disabled", "true");
    try {
      const instance = await createPetInstance("Codex Work Cat");
      writeBundledPackPreference(instance.instanceId, packId);
      await setPetInstanceVisible(instance.instanceId, true);
      markFirstRunCompleted("codex_work_cat");
      if (feedback) feedback.textContent = "已创建 Codex 工作猫。";
      await renderSettings(await getSettings());
    } catch (error) {
      button?.removeAttribute("disabled");
      if (feedback) feedback.textContent = firstRunErrorMessage(error);
    }
  });

  appRoot.querySelector<HTMLButtonElement>("#first-run-reset")?.addEventListener("click", async () => {
    window.localStorage.removeItem(FIRST_RUN_COMPLETED_STORAGE_KEY);
    await renderSettings(await getSettings());
  });

  const firstRunElement = appRoot.querySelector<HTMLElement>("#section-first-run");
  if (firstRunElement) {
    attachCopyButtons(firstRunElement);
  }

  let firstRunDemoPreview: RendererRegistrySelection | null = null;
  function mountFirstRunDemo(actionId: CoreActionId, reasonCode: "demo_started" | "demo_state_preview" | "demo_completed" | "demo_cancelled" = "demo_state_preview") {
    const packId = selectedFirstRunPackId();
    const pack = getBundledLocalCatPack(packId) ?? LIVING_WORK_CAT_V1_PACK;
    const container = appRoot.querySelector<HTMLElement>("#first-run-demo-stage");
    const feedback = appRoot.querySelector<HTMLElement>("#first-run-feedback");
    if (!container) {
      return;
    }
    firstRunDemoPreview?.renderer.dispose();
    container.innerHTML = "";
    firstRunDemoPreview = new RendererRegistry().create("sprite");
    firstRunDemoPreview.renderer.mount(container, {
      profileId: "first-run-demo",
      rendererKind: "sprite",
      packId: pack.packId,
      scale: 0.75
    });
    const resolved = resolveCatAction(actionId, pack.manifest);
    firstRunDemoPreview.renderer.setAction(resolved.actionId, resolved.playback);
    container.dataset.demoMode = "local";
    container.dataset.demoReasonCode = reasonCode;
    container.dataset.demoState = actionId;
    container.dataset.demoMutatesAgentState = "false";
    container.dataset.demoAcceptedPetEvents = "0";
    container.dataset.demoNoStateMutation = "true";
    container.dataset.demoNoStateMutationReasonCode = "demo_no_state_mutation";
    if (feedback) feedback.textContent = `本地演示：${instanceStateLabel(actionId)}。`;
  }

  appRoot.querySelector<HTMLButtonElement>("#first-run-demo")?.addEventListener("click", () => {
    mountFirstRunDemo("thinking", "demo_started");
  });

  appRoot.querySelectorAll<HTMLButtonElement>("[data-first-run-demo-state]").forEach((button) => {
    button.addEventListener("click", () => {
      const actionId = button.dataset.firstRunDemoState;
      if (actionId && isCatState(actionId)) {
        mountFirstRunDemo(actionId, "demo_state_preview");
      }
    });
  });

  appRoot.querySelector<HTMLButtonElement>("#instance-create")?.addEventListener("click", async () => {
    const nextName = `Codex Cat ${Math.max(1, instances.length)}`;
    try {
      await createPetInstance(nextName);
      await renderSettings(await getSettings());
    } catch (error) {
      window.alert(userFacingCreateInstanceError(error));
    }
  });

  appRoot.querySelectorAll<HTMLButtonElement>("[data-instance-detach]").forEach((button) => {
    button.addEventListener("click", async () => {
      const instanceId = button.dataset.instanceDetach;
      if (!instanceId) {
        return;
      }
      if (button.dataset.confirmDetach !== "true") {
        button.dataset.confirmDetach = "true";
        button.textContent = "确认移除";
        button.classList.add("is-danger-confirm");
        window.setTimeout(() => {
          if (button.isConnected && button.dataset.confirmDetach === "true") {
            button.dataset.confirmDetach = "false";
            button.textContent = "移除";
            button.classList.remove("is-danger-confirm");
          }
        }, 3000);
        return;
      }
      button.setAttribute("disabled", "true");
      try {
        await detachPetInstance(instanceId);
        await renderSettings(await getSettings());
      } catch {
        button.removeAttribute("disabled");
        button.dataset.confirmDetach = "false";
        button.textContent = "移除";
        button.classList.remove("is-danger-confirm");
        setInstanceFeedback(instanceId, "移除失败。", "error");
      }
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>("[data-instance-visible]").forEach((button) => {
    button.addEventListener("click", async () => {
      const instanceId = button.dataset.instanceVisible;
      const visible = button.dataset.visibleNext === "true";
      if (!instanceId) {
        return;
      }
      button.setAttribute("disabled", "true");
      try {
        await setPetInstanceVisible(instanceId, visible);
        await renderSettings(await getSettings());
        setInstanceFeedback(instanceId, visible ? "已显示" : "已隐藏");
      } catch {
        button.removeAttribute("disabled");
        setInstanceFeedback(instanceId, visible ? "显示失败。" : "隐藏失败。", "error");
      }
    });
  });

  appRoot.querySelectorAll<HTMLSelectElement>("[data-instance-profile]").forEach((select) => {
    select.addEventListener("change", async () => {
      const instanceId = select.dataset.instanceProfile;
      const profileId = select.value;
      if (!instanceId) {
        return;
      }
      select.setAttribute("disabled", "true");
      try {
        await setPetInstanceProfile(instanceId, profileId);
        await renderSettings(await getSettings());
        setInstanceFeedback(instanceId, "外观已更新");
      } catch {
        select.removeAttribute("disabled");
        setInstanceFeedback(instanceId, "外观更新失败。", "error");
      }
    });
  });

  appRoot.querySelectorAll<HTMLSelectElement>("[data-instance-asset-pack]").forEach((select) => {
    select.addEventListener("change", async () => {
      const instanceId = select.dataset.instanceAssetPack;
      const packId = select.value;
      if (!instanceId) {
        return;
      }
      select.setAttribute("disabled", "true");
      try {
        if (packId.startsWith("bundled:")) {
          const bundledPackId = packId.slice("bundled:".length);
          if (!isBundledLocalCatPackId(bundledPackId)) {
            throw new Error("bundled_pack_invalid");
          }
          await deactivatePersonalizedAssetPack(instanceId);
          writeBundledPackPreference(instanceId, bundledPackId);
          setInstanceFeedback(instanceId, "内置猫资产包已激活");
        } else if (packId) {
          writeBundledPackPreference(instanceId, null);
          await activatePersonalizedAssetPack(packId, instanceId);
          setInstanceFeedback(instanceId, "运行资产包已激活");
        } else {
          writeBundledPackPreference(instanceId, null);
          await deactivatePersonalizedAssetPack(instanceId);
          setInstanceFeedback(instanceId, "已切回默认渲染");
        }
        await renderSettings(await getSettings());
      } catch (error) {
        select.removeAttribute("disabled");
        setInstanceFeedback(instanceId, assetActivationErrorMessage(error), "error");
      }
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>("[data-instance-restore-default]").forEach((button) => {
    button.addEventListener("click", async () => {
      const instanceId = button.dataset.instanceRestoreDefault;
      if (!instanceId) {
        return;
      }
      button.setAttribute("disabled", "true");
      try {
        writeBundledPackPreference(instanceId, null);
        await deactivatePersonalizedAssetPack(instanceId);
        setInstanceFeedback(instanceId, "已恢复默认 flagship-work-cat-v2");
        await renderSettings(await getSettings());
      } catch (error) {
        button.removeAttribute("disabled");
        setInstanceFeedback(instanceId, assetActivationErrorMessage(error), "error");
      }
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>("[data-instance-reset]").forEach((button) => {
    button.addEventListener("click", async () => {
      const instanceId = button.dataset.instanceReset;
      if (!instanceId) {
        return;
      }
      button.setAttribute("disabled", "true");
      try {
        await resetPetInstancePosition(instanceId);
        await renderSettings(await getSettings());
        setInstanceFeedback(instanceId, "已重置位置");
      } catch {
        button.removeAttribute("disabled");
        setInstanceFeedback(instanceId, "重置位置失败。", "error");
      }
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>("[data-instance-rename]").forEach((button) => {
    button.addEventListener("click", async () => {
      const instanceId = button.dataset.instanceRename;
      if (!instanceId) {
        return;
      }
      const input = appRoot.querySelector<HTMLInputElement>(`[data-instance-name-input="${cssEscape(instanceId)}"]`);
      const name = input?.value.trim() ?? "";
      if (!input) {
        setInstanceFeedback(instanceId, "重命名失败。", "error");
        return;
      }
      const validationError = displayNameValidationError(name);
      if (validationError) {
        setInstanceFeedback(instanceId, validationError, "error");
        input.focus();
        return;
      }
      button.setAttribute("disabled", "true");
      try {
        const updated = await renamePetInstance(instanceId, name);
        updateInstanceNameInSettings(updated);
        setInstanceFeedback(instanceId, "已重命名");
      } catch {
        setInstanceFeedback(instanceId, "重命名失败。", "error");
      } finally {
        button.removeAttribute("disabled");
      }
    });
  });

  const instanceListElement = appRoot.querySelector<HTMLElement>("#instance-list");
  if (instanceListElement) {
    attachCopyButtons(instanceListElement);
  }

  appRoot.querySelector<HTMLButtonElement>("#work-cat-create")?.addEventListener("click", async () => {
    const button = appRoot.querySelector<HTMLButtonElement>("#work-cat-create");
    button?.setAttribute("disabled", "true");
    try {
      await createPetInstance("Codex Work Cat");
      await renderSettings(await getSettings());
    } catch (error) {
      button?.removeAttribute("disabled");
      window.alert(userFacingCreateInstanceError(error));
    }
  });

  const workCatPanelElement = appRoot.querySelector<HTMLElement>("#codex-work-cat-panel");
  if (workCatPanelElement) {
    attachCopyButtons(workCatPanelElement);
  }

  const photo2DWizardElement = appRoot.querySelector<HTMLElement>("#photo-2d-wizard-panel");
  if (photo2DWizardElement) {
    attachPhoto2DWizardControls(photo2DWizardElement);
    attachCopyButtons(photo2DWizardElement);
  }
  const photo2DWizardModalElement = appRoot.querySelector<HTMLElement>("#photo-2d-wizard-modal");
  if (photo2DWizardModalElement) {
    attachPhoto2DWizardControls(photo2DWizardModalElement);
    attachCopyButtons(photo2DWizardModalElement);
  }

  let galleryPreviewSelection: RendererRegistrySelection | null = null;
  let galleryCurrentPreviewSelection: RendererRegistrySelection | null = null;

  async function mountGalleryCurrentPreview(actionId: SafeActionId) {
    const targetSelect = appRoot.querySelector<HTMLSelectElement>("#gallery-target-instance");
    const container = appRoot.querySelector<HTMLElement>("#gallery-current-stage");
    const summary = appRoot.querySelector<HTMLElement>("#gallery-current-summary");
    const instanceId = targetSelect?.value;
    if (!instanceId || !container || !summary) {
      return;
    }
    galleryCurrentPreviewSelection?.renderer.dispose();
    container.innerHTML = "";
    const runtime = await resolveRendererForPetInstance(instanceId).catch(() => ({
      manifest: LIVING_WORK_CAT_V1_PACK.manifest,
      rendererKind: "sprite" as const,
      requestedKind: "sprite" as const,
      fallbackUsed: true,
      source: "bundled" as const,
      reasonCode: "preview_current_fallback"
    }));
    galleryCurrentPreviewSelection = new RendererRegistry().create(runtime.rendererKind);
    galleryCurrentPreviewSelection.renderer.mount(container, {
      profileId: "gallery-current-preview",
      rendererKind: runtime.rendererKind,
      packId: runtime.manifest.packId,
      scale: 0.75
    });
    const resolved = resolvePreviewCatAction(actionId, runtime.manifest);
    galleryCurrentPreviewSelection.renderer.setAction(resolved.actionId, resolved.playback);
    container.dataset.previewPackId = runtime.manifest.packId;
    container.dataset.previewActionId = resolved.actionId;
    container.dataset.previewMutatesRuntime = "false";
    container.dataset.previewAcceptedPetEvents = "0";
    container.dataset.previewNoCatStateMachineWrite = "true";
    if (isCatState(actionId)) {
      applyPreviewCoverageDataset(container, resolveAnimationCoverage(runtime.manifest, actionId));
    }
    summary.textContent = `${runtime.manifest.packId} · ${actionId} · ${runtime.source}`;
  }

  function mountGalleryPreview(packId: string, actionId: SafeActionId) {
    const pack = getBundledLocalCatPack(packId);
    const container = appRoot.querySelector<HTMLElement>("#gallery-preview-stage");
    const summary = appRoot.querySelector<HTMLElement>("#gallery-preview-summary");
    if (!pack || !container || !summary) {
      return;
    }
    galleryPreviewSelection?.renderer.dispose();
    container.innerHTML = "";
    galleryPreviewSelection = new RendererRegistry().create("sprite");
    galleryPreviewSelection.renderer.mount(container, {
      profileId: "gallery-preview",
      rendererKind: "sprite",
      packId: pack.packId,
      scale: 0.75
    });
    const action = resolvePreviewCatAction(actionId, pack.manifest);
    galleryPreviewSelection.renderer.setAction(action.actionId, action.playback);
    container.dataset.previewPackId = pack.packId;
    container.dataset.previewActionId = action.actionId;
    container.dataset.previewMutatesRuntime = "false";
    container.dataset.previewAcceptedPetEvents = "0";
    container.dataset.previewNoCatStateMachineWrite = "true";
    if (isCatState(actionId)) {
      const coverage = resolveAnimationCoverage(pack.manifest, actionId);
      applyPreviewCoverageDataset(container, coverage);
      summary.textContent = `${pack.displayName} · ${actionId} · ${coverage.coverageState} · frames ${coverage.frameCount ?? 0}`;
    } else {
      container.dataset.previewCoverageState = "living";
      container.dataset.previewReasonCode = "living_action_present";
      summary.textContent = `${pack.displayName} · ${actionId} · living action`;
    }
  }

  async function mountGalleryImportedPreview(packId: string, actionId: CoreActionId) {
    const pack = assetPacks.find((item) => item.packId === packId);
    const container = appRoot.querySelector<HTMLElement>("#gallery-preview-stage");
    const summary = appRoot.querySelector<HTMLElement>("#gallery-preview-summary");
    if (!pack || !container || !summary) {
      return;
    }
    galleryPreviewSelection?.renderer.dispose();
    container.innerHTML = "";
    const manifest = previewImportedManifest(pack);
    const initialCoverage = resolveAnimationCoverage(manifest, actionId);
    galleryPreviewSelection = new RendererRegistry().create(pack.rendererKind);
    galleryPreviewSelection.renderer.mount(container, {
      profileId: "gallery-imported-preview",
      rendererKind: pack.rendererKind,
      packId: pack.packId,
      scale: 0.75
    });
    const action = resolveCatAction(actionId, manifest);
    galleryPreviewSelection.renderer.setAction(action.actionId, action.playback);
    container.dataset.previewPackId = pack.packId;
    container.dataset.previewActionId = action.actionId;
    container.dataset.previewMutatesRuntime = "false";
    container.dataset.previewAcceptedPetEvents = "0";
    container.dataset.previewNoCatStateMachineWrite = "true";
    applyPreviewCoverageDataset(container, initialCoverage);
    summary.textContent = previewCoverageSummary(pack.displayName, initialCoverage);
    void refreshPreviewRuntimeCoverage(pack, actionId, container, summary);
  }

  appRoot.querySelectorAll<HTMLButtonElement>("[data-gallery-preview]").forEach((button) => {
    button.addEventListener("click", () => {
      const packId = button.dataset.galleryPreview;
      const source = button.dataset.gallerySource;
      const actionId = button.dataset.galleryAction as SafeActionId | undefined;
      if (!packId || !actionId) {
        return;
      }
      void mountGalleryCurrentPreview(actionId);
      if (source === "imported") {
        if (isCatState(actionId)) {
          void mountGalleryImportedPreview(packId, actionId);
        }
        return;
      }
      if (isBundledLocalCatPackId(packId)) {
        mountGalleryPreview(packId, actionId);
      }
    });
  });

  function applyGalleryFilter() {
    applyGalleryCardFilters(appRoot);
  }

  appRoot.querySelector<HTMLInputElement>("#gallery-search")?.addEventListener("input", applyGalleryFilter);
  appRoot.querySelector<HTMLSelectElement>("#gallery-filter")?.addEventListener("change", applyGalleryFilter);
  appRoot.querySelector<HTMLSelectElement>("#gallery-style-filter")?.addEventListener("change", applyGalleryFilter);
  appRoot.querySelector<HTMLSelectElement>("#gallery-color-filter")?.addEventListener("change", applyGalleryFilter);
  appRoot.querySelector<HTMLSelectElement>("#gallery-motion-filter")?.addEventListener("change", applyGalleryFilter);
  appRoot.querySelector<HTMLSelectElement>("#gallery-source-filter")?.addEventListener("change", applyGalleryFilter);
  appRoot.querySelector<HTMLSelectElement>("#gallery-renderer-filter")?.addEventListener("change", applyGalleryFilter);
  applyGalleryFilter();

  appRoot.querySelectorAll<HTMLButtonElement>("[data-gallery-favorite-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const packId = button.dataset.galleryFavoriteToggle;
      const feedback = appRoot.querySelector<HTMLElement>("#gallery-feedback");
      const allowedPackIds = Array.from(appRoot.querySelectorAll<HTMLElement>("[data-gallery-pack]"))
        .map((card) => card.dataset.galleryPack)
        .filter((value): value is string => typeof value === "string" && value.length > 0);
      if (!packId || !allowedPackIds.includes(packId)) {
        return;
      }
      const favorites = toggleBundledPackFavorite(packId, allowedPackIds);
      const favorite = favorites.has(packId);
      button.textContent = favorite ? "取消收藏" : "收藏";
      button.setAttribute("aria-pressed", favorite ? "true" : "false");
      const card = button.closest<HTMLElement>("[data-gallery-pack]");
      if (card) {
        card.dataset.galleryFavorite = favorite ? "true" : "false";
      }
      if (feedback) {
        feedback.textContent = favorite ? "已收藏。收藏只保存 safe packId。" : "已取消收藏。";
      }
      applyGalleryFilter();
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>("[data-gallery-activate]").forEach((button) => {
    button.addEventListener("click", async () => {
      const packId = button.dataset.galleryActivate;
      const source = button.dataset.gallerySource;
      const targetSelect = appRoot.querySelector<HTMLSelectElement>("#gallery-target-instance");
      const feedback = appRoot.querySelector<HTMLElement>("#gallery-feedback");
      const instanceId = targetSelect?.value;
      if (!packId || !instanceId) {
        return;
      }
      button.setAttribute("disabled", "true");
      try {
        if (source === "imported") {
          writeBundledPackPreference(instanceId, null);
          await activatePersonalizedAssetPack(packId, instanceId);
          if (feedback) feedback.textContent = "已激活导入资产包到目标猫。";
        } else if (isBundledLocalCatPackId(packId)) {
          await deactivatePersonalizedAssetPack(instanceId);
          writeBundledPackPreference(instanceId, packId);
          if (feedback) feedback.textContent = "已激活内置猫资产包。";
        }
        await renderSettings(await getSettings());
      } catch (error) {
        button.removeAttribute("disabled");
        if (feedback) feedback.textContent = assetActivationErrorMessage(error);
      }
    });
  });

  appRoot.querySelector<HTMLButtonElement>("#gallery-restore-default")?.addEventListener("click", async () => {
    const targetSelect = appRoot.querySelector<HTMLSelectElement>("#gallery-target-instance");
    const feedback = appRoot.querySelector<HTMLElement>("#gallery-feedback");
    const instanceId = targetSelect?.value;
    if (!instanceId) {
      return;
    }
    try {
      writeBundledPackPreference(instanceId, null);
      await deactivatePersonalizedAssetPack(instanceId);
      if (feedback) feedback.textContent = "目标猫已恢复默认 work-cat-v1。";
      await renderSettings(await getSettings());
    } catch (error) {
      if (feedback) feedback.textContent = assetActivationErrorMessage(error);
    }
  });

  let assetPreviewSelection: RendererRegistrySelection | null = null;
  async function mountAssetPreview(packId: string, actionId: CoreActionId) {
    const pack = assetPacks.find((item) => item.packId === packId);
    const container = appRoot.querySelector<HTMLElement>("#asset-preview-stage");
    const summary = appRoot.querySelector<HTMLElement>("#asset-preview-summary");
    if (!pack || !container || !summary) {
      return;
    }
    assetPreviewSelection?.renderer.dispose();
    container.innerHTML = "";
    const manifest = previewImportedManifest(pack);
    const initialCoverage = resolveAnimationCoverage(manifest, actionId);
    assetPreviewSelection = new RendererRegistry().create(pack.rendererKind);
    assetPreviewSelection.renderer.mount(container, {
      profileId: "asset-preview",
      rendererKind: pack.rendererKind,
      packId: pack.packId,
      scale: 0.75
    });
    const action = resolveCatAction(actionId, manifest);
    assetPreviewSelection.renderer.setAction(action.actionId, action.playback);
    container.dataset.previewPackId = pack.packId;
    container.dataset.previewActionId = action.actionId;
    container.dataset.previewMutatesRuntime = "false";
    container.dataset.previewAcceptedPetEvents = "0";
    applyPreviewCoverageDataset(container, initialCoverage);
    summary.textContent = previewCoverageSummary(pack.displayName, initialCoverage);
    void refreshPreviewRuntimeCoverage(pack, actionId, container, summary);
  }

  appRoot.querySelectorAll<HTMLButtonElement>("[data-asset-pack-preview]").forEach((button) => {
    button.addEventListener("click", () => {
      const packId = button.dataset.assetPackPreview;
      const actionId = button.dataset.previewAction as CoreActionId | undefined;
      if (packId && actionId) {
        void mountAssetPreview(packId, actionId);
      }
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>("[data-asset-pack-rename]").forEach((button) => {
    button.addEventListener("click", async () => {
      const packId = button.dataset.assetPackRename;
      const input = packId ? appRoot.querySelector<HTMLInputElement>(`[data-asset-pack-name-input="${cssEscape(packId)}"]`) : null;
      const nextName = input?.value.trim() ?? "";
      if (!packId || !input || !nextName) {
        setAssetImportFeedback("请输入资产包显示名称。", "error");
        input?.focus();
        return;
      }
      button.setAttribute("disabled", "true");
      try {
        await renamePersonalizedAssetPack(packId, nextName);
        setAssetImportFeedback("资产包已重命名。");
        await renderSettings(await getSettings());
      } catch {
        button.removeAttribute("disabled");
        setAssetImportFeedback("资产包重命名失败。", "error");
      }
    });
  });

  appRoot.querySelectorAll<HTMLButtonElement>("[data-asset-pack-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      const packId = button.dataset.assetPackDelete;
      const list = appRoot.querySelector<HTMLElement>("#asset-pack-list");
      if (!packId) {
        return;
      }
      if (button.dataset.confirmDelete !== "true") {
        button.dataset.confirmDelete = "true";
        button.textContent = "确认删除";
        button.classList.add("is-danger-confirm");
        window.setTimeout(() => {
          if (button.isConnected && button.dataset.confirmDelete === "true") {
            button.dataset.confirmDelete = "false";
            button.textContent = "删除";
            button.classList.remove("is-danger-confirm");
          }
        }, 3000);
        return;
      }
      button.setAttribute("disabled", "true");
      try {
        const packs = await deletePersonalizedAssetPack(packId);
        if (list) {
          list.innerHTML = assetPackList(packs, assetManagerPanelFormatters);
        }
        setAssetImportFeedback("资产包已删除。");
        await renderSettings(await getSettings());
      } catch (error) {
        button.removeAttribute("disabled");
        setAssetImportFeedback(assetDeleteErrorMessage(error), "error");
      }
    });
  });

  appRoot.querySelector<HTMLButtonElement>("#asset-import-submit")?.addEventListener("click", async () => {
    const manifestInput = appRoot.querySelector<HTMLInputElement>("#asset-manifest-path");
    const displayNameInput = appRoot.querySelector<HTMLInputElement>("#asset-display-name");
    const feedback = appRoot.querySelector<HTMLElement>("#asset-import-feedback");
    const list = appRoot.querySelector<HTMLElement>("#asset-pack-list");
    const button = appRoot.querySelector<HTMLButtonElement>("#asset-import-submit");
    const manifestPath = manifestInput?.value.trim() ?? "";
    const displayName = displayNameInput?.value.trim() ?? "";
    if (!manifestPath) {
      setAssetImportFeedback("请输入 manifest.json 路径。", "error");
      manifestInput?.focus();
      return;
    }
    button?.setAttribute("disabled", "true");
    if (feedback) {
      feedback.textContent = "正在导入...";
      feedback.classList.remove("is-error");
    }
    try {
      const imported = await importPersonalizedAssetPack(manifestPath, displayName);
      const packs = await listPersonalizedAssetPacks();
      if (list) {
        list.innerHTML = assetPackList(packs, assetManagerPanelFormatters);
      }
      if (manifestInput) {
        manifestInput.value = "";
      }
      setAssetImportFeedback(`已导入 ${imported.displayName}。`);
    } catch (error) {
      setAssetImportFeedback(assetImportErrorMessage(error), "error");
    } finally {
      if (manifestInput) {
        manifestInput.value = "";
      }
      button?.removeAttribute("disabled");
    }
  });

  appRoot.querySelector<HTMLButtonElement>("#animated-sprite-assemble-submit")?.addEventListener("click", async () => {
    const sourceInput = appRoot.querySelector<HTMLInputElement>("#animated-sprite-source-folder");
    const displayNameInput = appRoot.querySelector<HTMLInputElement>("#animated-sprite-display-name");
    const fpsInput = appRoot.querySelector<HTMLInputElement>("#animated-sprite-fps");
    const targetSelect = appRoot.querySelector<HTMLSelectElement>("#animated-sprite-target-instance");
    const feedback = appRoot.querySelector<HTMLElement>("#animated-sprite-feedback");
    const button = appRoot.querySelector<HTMLButtonElement>("#animated-sprite-assemble-submit");
    const sourceFolder = sourceInput?.value.trim() ?? "";
    const displayName = displayNameInput?.value.trim() || "Animated Sprite Cat";
    const fps = Number.parseInt(fpsInput?.value ?? "12", 10);
    const targetInstanceId = targetSelect?.value.trim() || undefined;

    if (!sourceFolder) {
      setAnimatedSpriteFeedback("请输入本地帧目录路径。", "error");
      sourceInput?.focus();
      return;
    }
    if (!Number.isInteger(fps) || fps < 1 || fps > 24) {
      setAnimatedSpriteFeedback("FPS 必须在 1 到 24 之间。", "error");
      fpsInput?.focus();
      return;
    }

    button?.setAttribute("disabled", "true");
    if (feedback) {
      feedback.textContent = "正在装配并导入...";
      feedback.classList.remove("is-error");
    }
    try {
      const result = await assembleAnimatedSpritePack(sourceFolder, displayName, fps, targetInstanceId);
      await renderSettings(await getSettings());
      setAnimatedSpriteFeedback(
        `${result.displayName} 已装配：${animatedSpriteAssemblySummary(result)}${result.activatedInstanceId ? "，已激活到目标猫。" : "。"}`
      );
    } catch (error) {
      setAnimatedSpriteFeedback(assetImportErrorMessage(error), "error");
    } finally {
      button?.removeAttribute("disabled");
    }
  });

  appRoot.querySelector<HTMLButtonElement>("#photo-intake-review-submit")?.addEventListener("click", () => {
    const nameInput = appRoot.querySelector<HTMLInputElement>("#photo-intake-cat-name");
    const traitsInput = appRoot.querySelector<HTMLTextAreaElement>("#photo-intake-traits");
    const photoInput = appRoot.querySelector<HTMLInputElement>("#photo-intake-file");
    const consentInput = appRoot.querySelector<HTMLInputElement>("#photo-intake-consent");
    const output = appRoot.querySelector<HTMLElement>("#photo-intake-output");
    const feedback = appRoot.querySelector<HTMLElement>("#photo-intake-feedback");
    const file = photoInput?.files?.item(0) ?? null;
    const session = createPhotoIntakePrivacySession({
      catName: nameInput?.value ?? "",
      approvedTraits: traitsInput?.value ?? "",
      photo: file ? {
        fileName: file.name,
        mediaType: file.type,
        sizeBytes: file.size
      } : null,
      localReferenceConsent: Boolean(consentInput?.checked)
    });
    if (output) {
      output.innerHTML = photoIntakeOutput(session);
    }
    if (feedback) {
      feedback.textContent = session.status === "accepted"
        ? "隐私摘要已生成；未读取原图内容、未上传、未保存源文件名或完整路径。"
        : `隐私审查未通过：${session.reasonCode}`;
      feedback.classList.toggle("is-error", session.status === "rejected");
      feedback.classList.toggle("is-success", session.status === "accepted");
    }
  });

  appRoot.querySelector<HTMLButtonElement>("#photo-intake-clear-submit")?.addEventListener("click", () => {
    const nameInput = appRoot.querySelector<HTMLInputElement>("#photo-intake-cat-name");
    const traitsInput = appRoot.querySelector<HTMLTextAreaElement>("#photo-intake-traits");
    const photoInput = appRoot.querySelector<HTMLInputElement>("#photo-intake-file");
    const consentInput = appRoot.querySelector<HTMLInputElement>("#photo-intake-consent");
    const output = appRoot.querySelector<HTMLElement>("#photo-intake-output");
    const feedback = appRoot.querySelector<HTMLElement>("#photo-intake-feedback");
    if (nameInput) {
      nameInput.value = "";
    }
    if (traitsInput) {
      traitsInput.value = "";
    }
    if (photoInput) {
      photoInput.value = "";
    }
    if (consentInput) {
      consentInput.checked = false;
    }
    if (output) {
      output.innerHTML = photoIntakeEmptyState();
    }
    if (feedback) {
      feedback.textContent = "已清空照片隐私摘要。";
      feedback.classList.remove("is-error");
      feedback.classList.add("is-success");
    }
  });

  appRoot.querySelector<HTMLButtonElement>("#guided-generate-submit")?.addEventListener("click", () => {
    const nameInput = appRoot.querySelector<HTMLInputElement>("#guided-cat-name");
    const notesInput = appRoot.querySelector<HTMLTextAreaElement>("#guided-visual-notes");
    const targetSelect = appRoot.querySelector<HTMLSelectElement>("#guided-renderer-target");
    const photoInput = appRoot.querySelector<HTMLInputElement>("#guided-photo-reference");
    const output = appRoot.querySelector<HTMLElement>("#guided-asset-output");
    const feedback = appRoot.querySelector<HTMLElement>("#guided-asset-feedback");
    const rendererTarget = targetSelect?.value === "gltf" ? "gltf" : "sprite";
    const traitPromptPack = generateLocalTraitPromptPack({
      catName: nameInput?.value ?? "",
      coat: notesInput?.value ?? "",
      markings: notesInput?.value ?? "",
      eyes: notesInput?.value ?? "",
      tail: notesInput?.value ?? "",
      personality: "desktop companion actions",
      rendererTarget: rendererTarget as GuidedAssetRendererTarget,
      photoReferenceMode: photoInput?.files?.length ? "local_reference_only" : "not_provided"
    });
    if (output) {
      output.innerHTML = localTraitPromptOutput(traitPromptPack);
    }
    if (feedback) {
      feedback.textContent = traitPromptPack.status === "accepted"
        ? "已生成 V7.2 本地 trait prompt pack；未上传照片或调用 provider。"
        : `本地 trait 审查未通过：${traitPromptPack.reasonCode}`;
      feedback.classList.toggle("is-error", traitPromptPack.status === "rejected");
      feedback.classList.toggle("is-success", traitPromptPack.status === "accepted");
    }
  });

  appRoot.querySelector<HTMLButtonElement>("#guided-clear-submit")?.addEventListener("click", () => {
    const nameInput = appRoot.querySelector<HTMLInputElement>("#guided-cat-name");
    const notesInput = appRoot.querySelector<HTMLTextAreaElement>("#guided-visual-notes");
    const output = appRoot.querySelector<HTMLElement>("#guided-asset-output");
    const feedback = appRoot.querySelector<HTMLElement>("#guided-asset-feedback");
    if (nameInput) {
      nameInput.value = "";
    }
    if (notesInput) {
      notesInput.value = "";
    }
    if (output) {
      output.innerHTML = guidedAssetEmptyState();
    }
    if (feedback) {
      feedback.textContent = "已清空本地生成内容。";
      feedback.classList.remove("is-error");
      feedback.classList.add("is-success");
    }
  });

  appRoot.querySelector<HTMLButtonElement>("#animated-prompt-generate-submit")?.addEventListener("click", () => {
    const nameInput = appRoot.querySelector<HTMLInputElement>("#animated-prompt-cat-name");
    const traitsInput = appRoot.querySelector<HTMLTextAreaElement>("#animated-prompt-traits");
    const frameCountInput = appRoot.querySelector<HTMLInputElement>("#animated-prompt-frame-count");
    const fpsInput = appRoot.querySelector<HTMLInputElement>("#animated-prompt-fps");
    const output = appRoot.querySelector<HTMLElement>("#animated-prompt-output");
    const feedback = appRoot.querySelector<HTMLElement>("#animated-prompt-feedback");
    const workflow = generateAnimatedSpritePromptWorkflow({
      catName: nameInput?.value ?? "",
      approvedTraits: traitsInput?.value ?? "",
      frameCount: Number.parseInt(frameCountInput?.value ?? "8", 10),
      fps: Number.parseInt(fpsInput?.value ?? "12", 10)
    });
    if (output) {
      output.innerHTML = animatedSpritePromptOutput(workflow);
    }
    if (feedback) {
      feedback.textContent = workflow.status === "accepted"
        ? "已生成 V8.10 多帧 sprite 提示词；未调用 provider。"
        : `多帧提示词生成失败：${workflow.reasonCode}`;
      feedback.classList.toggle("is-error", workflow.status === "rejected");
      feedback.classList.toggle("is-success", workflow.status === "accepted");
    }
  });

  appRoot.querySelector<HTMLButtonElement>("#animated-prompt-clear-submit")?.addEventListener("click", () => {
    const nameInput = appRoot.querySelector<HTMLInputElement>("#animated-prompt-cat-name");
    const traitsInput = appRoot.querySelector<HTMLTextAreaElement>("#animated-prompt-traits");
    const frameCountInput = appRoot.querySelector<HTMLInputElement>("#animated-prompt-frame-count");
    const fpsInput = appRoot.querySelector<HTMLInputElement>("#animated-prompt-fps");
    const output = appRoot.querySelector<HTMLElement>("#animated-prompt-output");
    const feedback = appRoot.querySelector<HTMLElement>("#animated-prompt-feedback");
    if (nameInput) nameInput.value = "";
    if (traitsInput) traitsInput.value = "";
    if (frameCountInput) frameCountInput.value = "8";
    if (fpsInput) fpsInput.value = "12";
    if (output) {
      output.innerHTML = animatedSpritePromptEmptyState();
    }
    if (feedback) {
      feedback.textContent = "已清空 V8.10 多帧提示词。";
      feedback.classList.remove("is-error");
      feedback.classList.add("is-success");
    }
  });

  appRoot.querySelector<HTMLButtonElement>("#api-refresh")?.addEventListener("click", async () => {
    const summary = appRoot.querySelector<HTMLElement>("#settings-api-summary");
    const panel = appRoot.querySelector<HTMLElement>("#diagnostics-panel");
    const refreshButton = appRoot.querySelector<HTMLButtonElement>("#api-refresh");
    refreshButton?.setAttribute("disabled", "true");
    const diagnostics = await readDiagnosticsViewState(settings);
    if (summary) {
      summary.textContent = apiDebugSummary(diagnostics);
    }
    if (panel) {
      panel.innerHTML = diagnosticsPanel(diagnostics);
      attachCopyButtons(panel);
    }
    refreshButton?.removeAttribute("disabled");
  });

  const diagnosticsPanelElement = appRoot.querySelector<HTMLElement>("#diagnostics-panel");
  if (diagnosticsPanelElement) {
    attachCopyButtons(diagnosticsPanelElement);
  }
  const releasePanelElement = appRoot.querySelector<HTMLElement>("#release-foundation-panel");
  if (releasePanelElement) {
    attachCopyButtons(releasePanelElement);
  }
}

async function boot() {
  document.documentElement.classList.toggle("browser-preview-root", !isTauriRuntime());
  const settings = await getSettings();
  if (isSettingsWindow()) {
    await renderSettings(settings);
  } else {
    await renderPet(settings);
  }
}

function cssCatMarkup() {
  return `
    <span class="cat" aria-hidden="true">
      <span class="cat-shadow"></span>
      <span class="cat-tail"></span>
      <span class="cat-body"></span>
      <span class="cat-head">
        <span class="cat-ear cat-ear-left"></span>
        <span class="cat-ear cat-ear-right"></span>
        <span class="cat-eye cat-eye-left"></span>
        <span class="cat-eye cat-eye-right"></span>
        <span class="cat-muzzle"></span>
      </span>
    </span>
  `;
}

function isBundledLocalCatPackId(packId: string) {
  return isFlagshipWorkCatV2PackId(packId) || isLivingWorkCatPackId(packId) || isPremiumCatPackId(packId);
}

function getBundledLocalCatPack(packId: string): (typeof BUNDLED_LOCAL_CAT_PACKS)[number] | undefined {
  return getFlagshipWorkCatV2Pack(packId) ?? getLivingWorkCatPack(packId) ?? getPremiumCatPack(packId);
}

type PetRuntimeRendererResolution = {
  manifest: AssetManifest;
  rendererKind: RendererKind;
  requestedKind: string;
  fallbackUsed: boolean;
  source: "bundled" | "imported";
  reasonCode?: string;
};

async function resolveRendererForPetInstance(instanceId: string): Promise<PetRuntimeRendererResolution> {
  try {
    const imported = await runtimePersonalizedAssetPack(instanceId);
    if (imported) {
      return {
        manifest: runtimeImportedManifest(imported),
        rendererKind: imported.rendererKind,
        requestedKind: imported.rendererKind,
        fallbackUsed: false,
        source: "imported"
      };
    }
  } catch {
    return {
      manifest: manifestForRuntimeRenderer("css"),
      rendererKind: "css",
      requestedKind: "imported",
      fallbackUsed: true,
      source: "bundled",
      reasonCode: "imported_pack_unavailable"
    };
  }

  const bundledPackId = readBundledPackPreference(instanceId);
  if (bundledPackId && isBundledLocalCatPackId(bundledPackId)) {
    const bundledPack = getBundledLocalCatPack(bundledPackId);
    if (bundledPack) {
      return {
        manifest: bundledPack.manifest,
        rendererKind: "sprite",
        requestedKind: "sprite",
        fallbackUsed: false,
        source: "bundled",
        reasonCode: isLivingWorkCatPackId(bundledPackId) ? "living_bundled_pack_active" : "premium_bundled_pack_active"
      };
    }
  }

  const runtimeRenderer = resolveRuntimeRendererKind();
  return {
    manifest: manifestForRuntimeRenderer(runtimeRenderer.selectedKind),
    rendererKind: runtimeRenderer.selectedKind,
    requestedKind: runtimeRenderer.requestedKind ?? "css",
    fallbackUsed: runtimeRenderer.fallbackUsed,
    source: "bundled",
    reasonCode: runtimeRenderer.reasonCode
  };
}

function runtimeImportedManifest(pack: RuntimeImportedAssetPack): AssetManifest {
  return {
    schemaVersion: "5.0",
    packId: pack.packId,
    version: pack.version,
    rendererKind: pack.rendererKind,
    license: pack.license,
    assets: pack.assets,
    actions: pack.actions
  };
}

function readBundledPackPreference(instanceId: string): string | null {
  try {
    const parsed = parseBundledPackPreferenceMap();
    const value = parsed[instanceId];
    return typeof value === "string" && isBundledLocalCatPackId(value) ? value : null;
  } catch {
    return null;
  }
}

function writeBundledPackPreference(instanceId: string, packId: string | null) {
  const next = parseBundledPackPreferenceMap();
  if (packId && isBundledLocalCatPackId(packId)) {
    next[instanceId] = packId;
  } else {
    delete next[instanceId];
  }
  window.localStorage.setItem(BUNDLED_PACK_BY_INSTANCE_STORAGE_KEY, JSON.stringify(next));
}

function readBundledPackFavorites(allowedPackIds: readonly string[] = BUNDLED_LOCAL_CAT_PACKS.map((pack) => pack.packId)): Set<string> {
  try {
    const raw = window.localStorage.getItem(BUNDLED_PACK_FAVORITES_STORAGE_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(sanitizeFavoritePackIds(
      parsed.filter((packId): packId is string => typeof packId === "string"),
      allowedPackIds
    ));
  } catch {
    return new Set();
  }
}

function writeBundledPackFavorites(favorites: Set<string>, allowedPackIds: readonly string[] = BUNDLED_LOCAL_CAT_PACKS.map((pack) => pack.packId)) {
  const safeFavorites = sanitizeFavoritePackIds(Array.from(favorites), allowedPackIds).sort();
  window.localStorage.setItem(BUNDLED_PACK_FAVORITES_STORAGE_KEY, JSON.stringify(safeFavorites));
}

function isBundledPackFavorite(packId: string, allowedPackIds?: readonly string[]) {
  return readBundledPackFavorites(allowedPackIds).has(packId);
}

function toggleBundledPackFavorite(packId: string, allowedPackIds: readonly string[] = BUNDLED_LOCAL_CAT_PACKS.map((pack) => pack.packId)) {
  const favorites = readBundledPackFavorites(allowedPackIds);
  if (!allowedPackIds.includes(packId)) {
    return favorites;
  }
  if (favorites.has(packId)) {
    favorites.delete(packId);
  } else {
    favorites.add(packId);
  }
  writeBundledPackFavorites(favorites, allowedPackIds);
  return favorites;
}

function parseBundledPackPreferenceMap(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(BUNDLED_PACK_BY_INSTANCE_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecordLike(parsed)) {
      return {};
    }
    const safeEntries: Array<[string, string]> = [];
    for (const [instanceId, packId] of Object.entries(parsed)) {
      if (typeof instanceId === "string" && typeof packId === "string" && isBundledLocalCatPackId(packId)) {
        safeEntries.push([instanceId, packId]);
      }
    }
    return Object.fromEntries(safeEntries);
  } catch {
    return {};
  }
}

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function instanceLimitSummary(limits: PetInstanceLimits) {
  const base = `管理本机桌面猫实例。当前 ${limits.totalCount}/${limits.hardLimit} 只；建议上限 ${limits.softLimit} 只。复制按钮只复制文本，本面板不会执行命令。`;
  if (limits.atHardLimit) {
    return `${base} 已达到 12 只猫上限，请先移除不用的实例猫。`;
  }
  return base;
}

function interactionSettingsPanel(settings: InteractionSettings) {
  const preview = buildInteractionPreviewSnapshot("pointer_near", settings);
  return `
    <section class="interaction-settings-panel" id="interaction-settings-panel" data-preview-mutates-live-pet="${preview.mutatesLivePetInstance}">
      <div class="interaction-settings-grid">
        ${interactionToggleControl("autonomousWalk", "自由走动", settings.autonomousWalk)}
        ${interactionToggleControl("pointerReactions", "鼠标反馈", settings.pointerReactions)}
        ${interactionToggleControl("clickReactions", "点击反馈", settings.clickReactions)}
        ${interactionToggleControl("dragPhysics", "拖拽物理", settings.dragPhysics)}
        ${interactionToggleControl("quietMode", "安静模式", settings.quietMode)}
        <label class="interaction-control">
          <span>动作频率</span>
          <select id="interaction-frequency" aria-label="动作频率">
            ${interactionOption("low", "低", settings.interactionFrequency)}
            ${interactionOption("normal", "正常", settings.interactionFrequency)}
            ${interactionOption("lively", "活跃", settings.interactionFrequency)}
          </select>
        </label>
        <label class="interaction-control">
          <span>动作强度</span>
          <select id="motion-intensity" aria-label="动作强度">
            ${interactionOption("subtle", "轻微", settings.motionIntensity)}
            ${interactionOption("normal", "正常", settings.motionIntensity)}
            ${interactionOption("expressive", "明显", settings.motionIntensity)}
          </select>
        </label>
      </div>
      <div class="interaction-preview" id="interaction-preview" data-preview-kind="${preview.kind}" data-preview-micro="${preview.microInteraction}">
        <div>
          <h3>互动预览</h3>
          <p id="interaction-preview-summary">${interactionPreviewSummary(preview)}</p>
        </div>
        <div class="interaction-preview-actions" aria-label="互动预览">
          ${interactionPreviewButton("pointer_near", "靠近")}
          ${interactionPreviewButton("pointer_hover", "悬停")}
          ${interactionPreviewButton("click", "单击")}
          ${interactionPreviewButton("double_click", "双击")}
          ${interactionPreviewButton("drag", "拖拽")}
          ${interactionPreviewButton("autonomous_walk", "走动")}
          ${interactionPreviewButton("quiet_mode", "安静")}
        </div>
      </div>
    </section>
  `;
}

function interactionToggleControl(key: keyof Pick<InteractionSettings, "autonomousWalk" | "pointerReactions" | "clickReactions" | "dragPhysics" | "quietMode">, label: string, checked: boolean) {
  return `
    <label class="interaction-control interaction-toggle">
      <span>${escapeHtml(label)}</span>
      <input type="checkbox" data-interaction-setting="${key}" ${checked ? "checked" : ""} />
    </label>
  `;
}

function interactionOption(value: string, label: string, selected: string) {
  return `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

function interactionPreviewButton(kind: InteractionPreviewKind, label: string) {
  return `<button class="secondary-action interaction-preview-button" type="button" data-preview-kind="${kind}">${escapeHtml(label)}</button>`;
}

function interactionPreviewSummary(preview: ReturnType<typeof buildInteractionPreviewSnapshot>) {
  const active = preview.active ? preview.microInteraction : "none";
  return `预览 ${active}；不发送事件，不修改工作状态，不改 live PetInstance。`;
}

function attachInteractionSettingsControls(initialSettings: InteractionSettings) {
  let current = initialSettings;
  const persist = () => {
    current = writeInteractionSettings(current);
    updateInteractionPreview("pointer_near", current);
  };

  appRoot.querySelectorAll<HTMLInputElement>("[data-interaction-setting]").forEach((input) => {
    input.addEventListener("change", () => {
      const key = input.dataset.interactionSetting as keyof Pick<InteractionSettings, "autonomousWalk" | "pointerReactions" | "clickReactions" | "dragPhysics" | "quietMode">;
      current = { ...current, [key]: input.checked };
      persist();
    });
  });

  appRoot.querySelector<HTMLSelectElement>("#interaction-frequency")?.addEventListener("change", (event) => {
    const value = (event.currentTarget as HTMLSelectElement).value;
    current = {
      ...current,
      interactionFrequency: value === "low" || value === "lively" ? value : "normal"
    };
    persist();
  });

  appRoot.querySelector<HTMLSelectElement>("#motion-intensity")?.addEventListener("change", (event) => {
    const value = (event.currentTarget as HTMLSelectElement).value;
    current = {
      ...current,
      motionIntensity: value === "subtle" || value === "expressive" ? value : "normal"
    };
    persist();
  });

  appRoot.querySelectorAll<HTMLButtonElement>("[data-preview-kind]").forEach((button) => {
    button.addEventListener("click", () => {
      const kind = button.dataset.previewKind as InteractionPreviewKind;
      updateInteractionPreview(kind, current);
    });
  });
}

function updateInteractionPreview(kind: InteractionPreviewKind, settings: InteractionSettings) {
  const preview = buildInteractionPreviewSnapshot(kind, settings);
  const panel = appRoot.querySelector<HTMLElement>("#interaction-preview");
  const summary = appRoot.querySelector<HTMLElement>("#interaction-preview-summary");
  if (panel) {
    panel.dataset.previewKind = preview.kind;
    panel.dataset.previewMicro = preview.microInteraction;
    panel.dataset.previewMutatesLivePet = String(preview.mutatesLivePetInstance);
    panel.dataset.previewEmitsPetEvent = String(preview.emitsPetEvent);
    panel.dataset.previewWritesCatStateMachine = String(preview.writesCatStateMachine);
  }
  if (summary) {
    summary.textContent = interactionPreviewSummary(preview);
  }
}

function firstRunWizard(instances: PetInstance[], limits: PetInstanceLimits) {
  const completed = readFirstRunCompleted();
  const target = instances.find((instance) => !instance.isDefault) ?? instances[0] ?? defaultPetInstance();
  const onboarding = createCodexWorkCatOnboarding(target.isDefault ? "Codex Work Cat" : target.displayName);
  return `
    <section class="settings-section first-run-wizard" id="section-first-run" data-first-run-completed="${completed ? "true" : "false"}">
      <div class="settings-section-heading">
        <div>
          <span class="instance-badge">${completed ? "已完成" : "首次上手"}</span>
          <h2>快速创建工作猫</h2>
          <p>不读 README 也能先看到一只猫。普通桌宠路径不超过 3 步；Codex 工作猫路径不超过 5 步。</p>
        </div>
      </div>
      <div class="first-run-grid">
        <article class="first-run-card">
          <h3>1. 先看到一只活猫</h3>
          <label class="appearance-control">
            <span>视觉资产</span>
            <select id="first-run-pack" aria-label="首次上手内置猫选择">
              ${BUNDLED_LOCAL_CAT_PACKS.map((pack, index) => `
                <option value="${escapeHtml(pack.packId)}" ${index === 0 ? "selected" : ""}>
                  ${escapeHtml(pack.displayName)} · ${escapeHtml(pack.paletteName)}
                </option>
              `).join("")}
            </select>
          </label>
          <p>默认使用 flagship-work-cat-v2；只保存 safe packId，不保存路径、prompt、token 或 provider payload。</p>
        </article>
        <article class="first-run-card">
          <h3>2. 试一试</h3>
          <div class="first-run-actions">
            <button class="primary-action" id="first-run-default" type="button">显示活猫</button>
            <button class="secondary-action" id="first-run-demo" type="button">本地状态演示</button>
            <button class="primary-action" id="first-run-work-cat" type="button" ${limits.atHardLimit ? "disabled" : ""}>创建 Codex 工作猫</button>
            <button class="secondary-action" id="first-run-reset" type="button">重新显示向导</button>
          </div>
          <p id="first-run-feedback" class="asset-import-feedback" aria-live="polite"></p>
        </article>
        <article class="first-run-card">
          <h3>3. 本地 demo</h3>
          <div id="first-run-demo-stage" class="asset-preview-stage first-run-demo-stage" data-demo-mode="local" data-demo-reason-code="demo_completed" data-demo-mutates-agent-state="false" data-demo-accepted-pet-events="0"></div>
          <div class="asset-preview-action-row">
            ${(["thinking", "running", "success", "need_input", "error"] as CoreActionId[]).map((action) => `
              <button class="icon-action" type="button" title="演示 ${escapeHtml(action)}" data-first-run-demo-state="${escapeHtml(action)}">${escapeHtml(shortStateLabel(action))}</button>
            `).join("")}
          </div>
          <p>Local demo only，不写入 Agent 状态。</p>
        </article>
        <article class="first-run-card">
          <h3>4. Codex 推荐路径</h3>
          ${quickCommand("JSONL wrapper", onboarding.jsonlCommand, "复制推荐命令")}
          <p>Managed TUI hooks 需要在 Codex 内执行 /hooks 并 trust；already-open Codex window 当前不支持自动监听。</p>
        </article>
      </div>
    </section>
  `;
}

function builtInGalleryPanel(instances: PetInstance[], assetPacks: PersonalizedAssetPack[]) {
  const targetOptions = instances.map((instance) => `
    <option value="${escapeHtml(instance.instanceId)}">${escapeHtml(instance.displayName)} · ${escapeHtml(instance.instanceId)}</option>
  `).join("");
  const summaries = createPetGallerySummaries(instances, assetPacks);
  const allowedPackIds = summaries.map((pack) => pack.packId);
  const favoritePackIds = readBundledPackFavorites(allowedPackIds);
  const galleryViews = createPetGalleryPackViews(summaries, Array.from(favoritePackIds));
  const bundledViews = galleryViews.filter((pack) => pack.source === "bundled");
  const importedViews = galleryViews.filter((pack) => pack.source === "imported");
  return `
    <section class="settings-section built-in-gallery" id="built-in-gallery">
      <div class="settings-section-heading">
        <div>
          <span class="instance-badge">V29.1 Gallery UX</span>
          <h2>宠物图库</h2>
          <p>浏览、筛选、收藏并预览本地动画猫；预览不会发送 PetEvent，也不会修改 live 猫状态。确认后才会把 safe packId 应用到目标猫。</p>
        </div>
        <span class="instance-badge">${galleryViews.length} packs · ${bundledViews.length} bundled · ${importedViews.length} imported</span>
      </div>
      <div class="gallery-toolbar">
        <label class="appearance-control">
          <span>目标猫</span>
          <select id="gallery-target-instance" aria-label="图库激活目标猫">
            ${targetOptions}
          </select>
        </label>
        <label class="appearance-control">
          <span>搜索</span>
          <input id="gallery-search" type="search" placeholder="名称 / packId / 颜色" autocomplete="off" aria-label="图库搜索">
        </label>
        <label class="appearance-control">
          <span>筛选</span>
          <select id="gallery-filter" aria-label="图库筛选">
            <option value="all">全部本地猫</option>
            <option value="favorite">只看收藏</option>
            <option value="active">当前已激活</option>
          </select>
        </label>
        <label class="appearance-control">
          <span>风格</span>
          <select id="gallery-style-filter" aria-label="按风格筛选">
            ${galleryFilterOptions(galleryViews.map((pack) => pack.style))}
          </select>
        </label>
        <label class="appearance-control">
          <span>颜色</span>
          <select id="gallery-color-filter" aria-label="按颜色筛选">
            ${galleryFilterOptions(galleryViews.map((pack) => pack.color))}
          </select>
        </label>
        <label class="appearance-control">
          <span>动效</span>
          <select id="gallery-motion-filter" aria-label="按动画强度筛选">
            ${galleryFilterOptions(galleryViews.map((pack) => pack.motionLevel))}
          </select>
        </label>
        <label class="appearance-control">
          <span>来源</span>
          <select id="gallery-source-filter" aria-label="按来源筛选">
            ${galleryFilterOptions(galleryViews.map((pack) => pack.source))}
          </select>
        </label>
        <label class="appearance-control">
          <span>渲染器</span>
          <select id="gallery-renderer-filter" aria-label="按 renderer kind 筛选">
            ${galleryFilterOptions(galleryViews.map((pack) => pack.rendererKind))}
          </select>
        </label>
        <button class="secondary-action" id="gallery-restore-default" type="button">目标猫恢复默认</button>
      </div>
      <section class="gallery-section" aria-label="Bundled pet packs">
        <div class="gallery-section-heading">
          <h3>精选本地猫</h3>
          <span class="instance-badge">${bundledViews.length} local</span>
        </div>
      <div class="gallery-grid">
        ${bundledViews.map(galleryPackCard).join("")}
      </div>
      </section>
      <section class="gallery-section" aria-label="Imported pet packs">
        <div class="gallery-section-heading">
          <h3>已导入资产</h3>
          <span class="instance-badge">${importedViews.length} user local</span>
        </div>
        ${importedViews.length ? `<div class="gallery-grid">${importedViews.map(galleryPackCard).join("")}</div>` : `<p class="diagnostics-empty">尚未导入个性化资产包；导入后会出现在这里并支持收藏、预览、激活和删除。</p>`}
      </section>
      <article class="asset-preview-panel">
        <header class="guided-output-header">
          <div>
            <h3>动作预览</h3>
            <p id="gallery-preview-summary">选择宠物和动作进行隔离预览；这里不会激活到任何猫。</p>
          </div>
          <span class="instance-badge">Preview only</span>
        </header>
        <div class="gallery-preview-compare">
          <div>
            <strong>当前目标猫</strong>
            <p id="gallery-current-summary">选择动作后显示当前目标猫。</p>
            <div id="gallery-current-stage" class="asset-preview-stage" data-preview-mutates-runtime="false" data-preview-accepted-pet-events="0" data-preview-role="current"></div>
          </div>
          <div>
            <strong>待切换宠物</strong>
            <div id="gallery-preview-stage" class="asset-preview-stage" data-preview-mutates-runtime="false" data-preview-accepted-pet-events="0" data-preview-role="candidate"></div>
          </div>
        </div>
      </article>
      <p id="gallery-feedback" class="asset-import-feedback" aria-live="polite"></p>
    </section>
  `;
}

function createPetGallerySummaries(instances: PetInstance[], assetPacks: PersonalizedAssetPack[]): PetGalleryPackSummary[] {
  const importedActiveInstances = new Set(assetPacks.flatMap((pack) => pack.activeInstances));
  const activeBundledByPack = new Map<string, string[]>();
  for (const instance of instances) {
    if (importedActiveInstances.has(instance.instanceId)) {
      continue;
    }
    const packId = readBundledPackPreference(instance.instanceId) ?? FLAGSHIP_WORK_CAT_V2_PACK_ID;
    if (!isBundledLocalCatPackId(packId)) {
      continue;
    }
    const activeInstances = activeBundledByPack.get(packId) ?? [];
    activeInstances.push(instance.instanceId);
    activeBundledByPack.set(packId, activeInstances);
  }

  return [
    ...BUNDLED_LOCAL_CAT_PACKS.map((pack): PetGalleryPackSummary => {
      const flagship = isFlagshipWorkCatV2PackId(pack.packId);
      const living = flagship || isLivingWorkCatPackId(pack.packId);
      return {
        packId: pack.packId,
        displayName: pack.displayName,
        description: pack.description,
        rendererKind: "sprite",
        source: "bundled",
        style: flagship ? "flagship work cat" : living ? "living work cat" : "premium work cat",
        color: pack.paletteName,
        motionLevel: galleryMotionLevelForPalette(pack.paletteName, living),
        qualityBadge: flagship ? "V14 flagship" : living ? "flagship living" : "curated premium",
        coverageCount: CORE_ACTION_IDS.length,
        actionCount: CORE_ACTION_IDS.length,
        activeInstances: activeBundledByPack.get(pack.packId) ?? [],
        licenseSummary: pack.attribution,
        validationStatus: "valid",
        hasLivingActions: living,
        canDelete: false
      };
    }),
    ...assetPacks.map((pack): PetGalleryPackSummary => {
      const copiedCount = pack.copiedAssetIds.filter((assetId) => typeof assetId === "string" && assetId.length > 0).length;
      return {
        packId: pack.packId,
        displayName: pack.displayName,
        description: "用户导入的本地资产包。",
        rendererKind: pack.rendererKind,
        source: "imported",
        style: "imported",
        color: "custom",
        motionLevel: pack.rendererKind === "sprite" && copiedCount >= CORE_ACTION_IDS.length ? "balanced" : "calm",
        qualityBadge: pack.validationStatus === "valid" ? "validated import" : "invalid import",
        coverageCount: Math.min(copiedCount, CORE_ACTION_IDS.length),
        actionCount: CORE_ACTION_IDS.length,
        activeInstances: pack.activeInstances,
        licenseSummary: "user imported local pack",
        validationStatus: pack.validationStatus === "valid" ? "valid" : "invalid",
        hasLivingActions: false,
        canDelete: true
      };
    })
  ];
}

function galleryMotionLevelForPalette(paletteName: string, living: boolean): PetGalleryMotionLevel {
  if (living || /orange|ginger|golden|calico/i.test(paletteName)) {
    return "lively";
  }
  if (/silver|cream|white|lilac/i.test(paletteName)) {
    return "calm";
  }
  return "balanced";
}

function galleryFilterOptions(values: readonly string[]) {
  const safeValues = Array.from(new Set(values.filter((value) => typeof value === "string" && value.length > 0))).sort();
  return [
    `<option value="all">全部</option>`,
    ...safeValues.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
  ].join("");
}

function galleryPackCard(view: PetGalleryPackView) {
  const searchText = [
    view.displayName,
    view.packId,
    view.description,
    view.style,
    view.color,
    view.motionLevel,
    view.rendererKind,
    view.source,
    view.qualityBadge,
    view.licenseSummary
  ].join(" ").toLowerCase();
  const actions = view.hasLivingActions
    ? [...CORE_ACTION_IDS, ...LIVING_WORK_CAT_OPTIONAL_ACTION_IDS]
    : CORE_ACTION_IDS;
  return `
    <article class="gallery-pack-card"
      data-gallery-pack="${escapeHtml(view.packId)}"
      data-gallery-source="${escapeHtml(view.source)}"
      data-gallery-style="${escapeHtml(view.style)}"
      data-gallery-color="${escapeHtml(view.color)}"
      data-gallery-motion="${escapeHtml(view.motionLevel)}"
      data-gallery-renderer="${escapeHtml(view.rendererKind)}"
      data-gallery-favorite="${view.isFavorite ? "true" : "false"}"
      data-gallery-active="${view.isActive ? "true" : "false"}"
      data-gallery-search="${escapeHtml(searchText)}">
      <header>
        <h3>${escapeHtml(view.displayName)}</h3>
        <span class="instance-badge">${escapeHtml(view.qualityBadge)} · ${escapeHtml(view.coverageSummary)}${view.isActive ? " · active" : ""}</span>
      </header>
      <p>${escapeHtml(view.description)}</p>
      <dl class="asset-pack-meta-grid">
        <div><dt>状态</dt><dd>${escapeHtml(view.coverageState)} · ${escapeHtml(view.reasonCode)}</dd></div>
        <div><dt>Style</dt><dd>${escapeHtml(view.style)}</dd></div>
        <div><dt>Color</dt><dd>${escapeHtml(view.color)}</dd></div>
        <div><dt>Motion</dt><dd>${escapeHtml(view.motionLevel)}</dd></div>
        <div><dt>Source</dt><dd>${escapeHtml(view.source)}</dd></div>
        <div><dt>Active</dt><dd>${escapeHtml(view.activeInstanceSummary)}</dd></div>
        <div><dt>License</dt><dd>${escapeHtml(view.licenseSummary)}</dd></div>
      </dl>
      <div class="asset-preview-action-row">
        ${actions.map((action) => `
          <button class="icon-action" type="button" title="预览 ${escapeHtml(action)}" data-gallery-preview="${escapeHtml(view.packId)}" data-gallery-source="${escapeHtml(view.source)}" data-gallery-action="${escapeHtml(action)}">${escapeHtml(galleryActionLabel(action))}</button>
        `).join("")}
      </div>
      <div class="gallery-card-actions">
        <button class="secondary-action" type="button" data-gallery-favorite-toggle="${escapeHtml(view.packId)}" aria-pressed="${view.isFavorite ? "true" : "false"}">${view.isFavorite ? "取消收藏" : "收藏"}</button>
        <button class="primary-action" type="button" data-gallery-activate="${escapeHtml(view.packId)}" data-gallery-source="${escapeHtml(view.source)}">激活到目标猫</button>
        ${view.canDelete ? `<button class="secondary-action" type="button" data-asset-pack-delete="${escapeHtml(view.packId)}">删除导入</button>` : `<button class="secondary-action" type="button" disabled title="Bundled packs cannot be deleted">内置不可删</button>`}
      </div>
    </article>
  `;
}

function galleryActionLabel(actionId: string) {
  if (isCatState(actionId)) {
    return shortStateLabel(actionId);
  }
  return actionId
    .replace(/^idle_/, "")
    .replace(/_/g, " ")
    .slice(0, 7);
}

function resolvePreviewCatAction(actionId: SafeActionId, manifest: AssetManifest) {
  if (isCatState(actionId)) {
    return resolveCatAction(actionId, manifest);
  }
  return resolveCatAction("idle", manifest, {
    optionalActionId: isOptionalActionId(actionId) ? actionId : undefined
  });
}

function selectedFirstRunPackId() {
  const select = appRoot.querySelector<HTMLSelectElement>("#first-run-pack");
  const packId = select?.value ?? BUNDLED_LOCAL_CAT_PACKS[0]?.packId ?? "";
  return isBundledLocalCatPackId(packId) ? packId : BUNDLED_LOCAL_CAT_PACKS[0]?.packId ?? FLAGSHIP_WORK_CAT_V2_PACK_ID;
}

function readFirstRunCompleted() {
  try {
    return window.localStorage.getItem(FIRST_RUN_COMPLETED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function markFirstRunCompleted(path: "default_pet" | "codex_work_cat") {
  try {
    window.localStorage.setItem(FIRST_RUN_COMPLETED_STORAGE_KEY, "true");
    window.localStorage.setItem(`${FIRST_RUN_COMPLETED_STORAGE_KEY}.path`, path);
  } catch {
    // Restricted webviews may block storage; visible pet reaction remains acceptance evidence.
  }
}

function readRuntimeRendererScale() {
  try {
    const value = Number(window.localStorage.getItem(RUNTIME_RENDERER_SCALE_STORAGE_KEY) ?? "1");
    if (value === 0.75 || value === 1) {
      return value;
    }
  } catch {
    return 1;
  }
  return 1;
}

function userFacingCreateInstanceError(error: unknown) {
  const value = userFacingError(error);
  if (value.includes("instance_limit_reached")) {
    return "已达到桌宠数量上限。请先移除不使用的猫，再创建新的猫。";
  }
  return value;
}

boot().catch((error) => {
  console.error(error);
  appRoot.innerHTML = `<pre class="boot-error">${String(error)}</pre>`;
});

function updatePetStateUi(
  shell: HTMLElement | null,
  stateLabel: HTMLElement | null,
  queueLabel: HTMLElement | null,
  snapshot: CatStateSnapshot
) {
  shell?.classList.remove(...STATE_CLASS_NAMES);
  shell?.classList.add(CAT_STATE_CONFIG[snapshot.current].cssClass);

  if (stateLabel) {
    stateLabel.textContent = labelForState(snapshot.current);
  }
  if (queueLabel) {
    queueLabel.textContent = snapshot.queueLength > 0 ? ` · Queue ${snapshot.queueLength}` : "";
  }
}

function settingsStateSummary(snapshot: CatStateSnapshot) {
  const locked = snapshot.locked ? "，锁定中" : "";
  const dragging = snapshot.dragging ? "，拖拽中" : "";
  return `当前桌宠状态：${labelForState(snapshot.current)}；行为队列：${snapshot.queueLength}${locked}${dragging}。`;
}

function instanceList(instances: PetInstance[], profiles: CatProfile[], assetPacks: PersonalizedAssetPack[] = []) {
  if (instances.length === 0) {
    return `<p class="diagnostics-empty">暂无桌宠实例。</p>`;
  }

  return `
    <div class="instance-list-grid">
      ${instances.map((instance) => {
        const runtimePackView = createManagerRuntimePackView(instance.instanceId, assetPacks);
        const bundledPreference = readBundledPackPreference(instance.instanceId);
        const bundledPack = bundledPreference ? getBundledLocalCatPack(bundledPreference) : undefined;
        const activePackLabel = runtimePackView.activeSource === "imported"
          ? runtimePackView.activePackDisplayName
          : bundledPack?.displayName ?? runtimePackView.activePackDisplayName;
        const activePackKind = runtimePackView.activeSource === "imported" ? runtimePackView.activeRendererKind : "sprite";
        const canRestoreDefaultPack = runtimePackView.restoreDefaultAvailable || Boolean(bundledPack);
        return `
        <article class="instance-card" data-instance-card="${escapeHtml(instance.instanceId)}">
          <div class="instance-card-main">
            <div class="instance-card-heading">
              <h3 data-instance-title="${escapeHtml(instance.instanceId)}">${escapeHtml(instance.displayName)}</h3>
              <span class="instance-badge">${instance.isDefault ? "默认猫 / 旧路由" : "Codex 实例猫 / 实例路由"}</span>
              <span class="instance-badge ${instance.visible ? "is-visible" : "is-hidden"}">${instance.visible ? "可见" : "已隐藏"}</span>
            </div>
            <dl class="instance-meta-grid">
              <div><dt>实例 ID</dt><dd>${escapeHtml(instance.instanceId)}</dd></div>
              <div><dt>窗口标签</dt><dd>${escapeHtml(instance.windowLabel)}</dd></div>
              <div><dt>当前状态</dt><dd>${escapeHtml(instanceStateLabel(instance.currentState))}</dd></div>
              <div><dt>外观</dt><dd>${escapeHtml(catProfileName(instance.catProfileId, profiles))}</dd></div>
              <div><dt>Active pack</dt><dd>${escapeHtml(activePackLabel)} · ${escapeHtml(activePackKind)}</dd></div>
              <div><dt>Fallback pack</dt><dd>${escapeHtml(runtimePackView.fallbackPackDisplayName)} · ${escapeHtml(runtimePackView.fallbackReasonCode)}</dd></div>
              <div><dt>路由</dt><dd>${instance.isDefault ? "旧路由" : "实例路由"}</dd></div>
              <div><dt>最近事件</dt><dd>${escapeHtml(instance.lastEventAt ? formatTimestamp(instance.lastEventAt) : "暂无")}</dd></div>
            </dl>
            <label class="appearance-control">
              <span>外观</span>
              <select data-instance-profile="${escapeHtml(instance.instanceId)}" aria-label="${escapeHtml(instance.displayName)} 的外观">
                ${profiles.map((profile) => `
                  <option value="${escapeHtml(profile.id)}" ${normalizeCatProfileId(instance.catProfileId, profiles) === profile.id ? "selected" : ""}>
                    ${escapeHtml(profile.name)}
                  </option>
                `).join("")}
              </select>
            </label>
            <label class="appearance-control">
              <span>运行资产包</span>
              <select data-instance-asset-pack="${escapeHtml(instance.instanceId)}" aria-label="${escapeHtml(instance.displayName)} 的运行资产包">
                <option value="">默认 / bundled renderer</option>
                ${BUNDLED_LOCAL_CAT_PACKS.map((pack) => `
                  <option value="bundled:${escapeHtml(pack.packId)}" ${bundledPreference === pack.packId && runtimePackView.activeSource !== "imported" ? "selected" : ""}>
                    ${escapeHtml(pack.displayName)} · bundled sprite
                  </option>
                `).join("")}
                ${assetPacks.map((pack) => `
                  <option value="${escapeHtml(pack.packId)}" ${pack.activeInstances.includes(instance.instanceId) ? "selected" : ""}>
                    ${escapeHtml(pack.displayName)} · ${escapeHtml(pack.rendererKind)}
                  </option>
                `).join("")}
              </select>
            </label>
            ${instance.isDefault ? "" : `
              <label class="instance-name-control">
                <span>名称</span>
                <input
                  type="text"
                  value="${escapeHtml(instance.displayName)}"
                  maxlength="40"
                  data-instance-name-input="${escapeHtml(instance.instanceId)}"
                  aria-label="${escapeHtml(instance.displayName)} 的名称"
                />
              </label>
            `}
            <div class="instance-command-list">
              ${quickCommand("环境变量", `export AGENT_DESKTOP_PET_INSTANCE_ID=${instance.instanceId}`, "复制环境变量")}
              ${quickCommand("通知命令", `node packages/petctl/dist/cli.js notify --instance ${instance.instanceId} --level success --title "Codex success"`, "复制通知命令")}
            </div>
            <p class="instance-feedback" data-instance-feedback="${escapeHtml(instance.instanceId)}" aria-live="polite"></p>
          </div>
            <div class="instance-card-actions">
              <button class="secondary-action" type="button" data-instance-visible="${escapeHtml(instance.instanceId)}" data-visible-next="${instance.visible ? "false" : "true"}">${instance.visible ? "隐藏" : "显示"}</button>
              <button class="secondary-action" type="button" data-instance-restore-default="${escapeHtml(instance.instanceId)}" ${canRestoreDefaultPack ? "" : "disabled"}>恢复默认 work-cat</button>
              <button class="secondary-action" type="button" data-instance-reset="${escapeHtml(instance.instanceId)}">重置位置</button>
            ${instance.isDefault ? `
              <button class="secondary-action" type="button" disabled title="默认猫不可移除">默认猫不可移除</button>
            ` : `
              <button class="secondary-action" type="button" data-instance-rename="${escapeHtml(instance.instanceId)}">重命名</button>
              <button class="secondary-action" type="button" data-instance-detach="${escapeHtml(instance.instanceId)}">移除</button>
            `}
          </div>
        </article>
      `; }).join("")}
    </div>
  `;
}

function previewImportedManifest(pack: PersonalizedAssetPack): AssetManifest {
  const actions = Object.fromEntries(CORE_ACTION_IDS.map((action) => [action, {
    assetId: action,
    loop: action !== "success",
    priority: action === "error" || action === "need_input" ? "urgent" : action === "success" ? "transient" : "base"
  }]));
  const assets = Object.fromEntries(CORE_ACTION_IDS.map((action) => [action, {
    assetId: action,
    kind: pack.rendererKind
  }]));
  return {
    schemaVersion: "5.0",
    packId: pack.packId,
    version: "preview",
    rendererKind: pack.rendererKind,
    license: {
      type: "preview",
      attribution: "imported asset pack"
    },
    assets,
    actions
  };
}

async function refreshPreviewRuntimeCoverage(
  pack: PersonalizedAssetPack,
  actionId: CoreActionId,
  container: HTMLElement,
  summary: HTMLElement
) {
  if (pack.rendererKind !== "sprite") {
    return;
  }
  try {
    const asset = await runtimePersonalizedAssetData(pack.packId, actionId);
    if (container.dataset.previewPackId !== pack.packId || container.dataset.previewActionId !== actionId) {
      return;
    }
    const frameCount = Array.isArray(asset.frames) && asset.frames.length > 1 ? asset.frames.length : 1;
    const coverage: AnimationCoverage = {
      actionId,
      requestedActionId: actionId,
      coverageState: frameCount > 1 ? "animated" : "static",
      reasonCode: frameCount > 1 ? "action_frames_present" : "action_static_sprite",
      rendererKind: "sprite",
      frameCount
    };
    applyPreviewCoverageDataset(container, coverage);
    summary.textContent = previewCoverageSummary(pack.displayName, coverage);
  } catch {
    if (container.dataset.previewPackId !== pack.packId || container.dataset.previewActionId !== actionId) {
      return;
    }
    const coverage: AnimationCoverage = {
      actionId: "idle",
      requestedActionId: actionId,
      coverageState: "fallback",
      reasonCode: "action_missing_fallback_idle",
      rendererKind: pack.rendererKind,
      frameCount: 1,
      fallbackActionId: "idle"
    };
    applyPreviewCoverageDataset(container, coverage);
    summary.textContent = previewCoverageSummary(pack.displayName, coverage);
  }
}

function applyPreviewCoverageDataset(container: HTMLElement, coverage: AnimationCoverage) {
  container.dataset.previewCoverageState = coverage.coverageState;
  container.dataset.previewReasonCode = coverage.reasonCode;
  container.dataset.previewRendererKind = coverage.rendererKind;
  container.dataset.previewFrameCount = String(coverage.frameCount ?? 0);
  container.dataset.previewFps = String(coverage.fps ?? "");
  container.dataset.previewPlaybackKind = coverage.playbackKind ?? "";
  container.dataset.previewDurationMs = String(coverage.durationMs ?? "");
  container.dataset.previewClipPresent = String(coverage.clipPresent ?? false);
  container.dataset.previewFallbackActionId = coverage.fallbackActionId ?? "";
}

function previewCoverageSummary(displayName: string, coverage: AnimationCoverage) {
  const frameOrClip = coverage.rendererKind === "gltf"
    ? `clipPresent=${String(coverage.clipPresent ?? false)}`
    : `frameCount=${coverage.frameCount ?? 0}`;
  const fps = typeof coverage.fps === "number" ? ` · fps=${coverage.fps}` : "";
  const playback = coverage.playbackKind ? ` · playback=${coverage.playbackKind}` : "";
  const fallback = coverage.fallbackActionId ? ` · fallback=${coverage.fallbackActionId}` : "";
  return [
    `预览 ${displayName} · ${coverage.requestedActionId} -> ${coverage.actionId}`,
    `coverage=${coverage.coverageState}`,
    `reason=${coverage.reasonCode}`,
    `renderer=${coverage.rendererKind}`,
    `${frameOrClip}${fps}${playback}`,
    `${fallback}。不会激活到任何猫。`
  ].join(" · ");
}

function guidedAssetEmptyState() {
  return `
    <p class="diagnostics-empty">填写猫名和用户确认的外观描述后生成本地指南。V6.5 不保存原始照片，不上传 provider，不跳过本地导入验证。</p>
  `;
}

function animatedSpritePromptEmptyState() {
  return `
    <p class="diagnostics-empty">填写猫名和用户确认的外观描述后生成 V8.10 多帧动作提示词。此流程只生成本地说明，不调用 provider。</p>
  `;
}

function animatedSpritePromptOutput(workflow: AnimatedSpritePromptWorkflow) {
  if (workflow.status === "rejected") {
    return `
      <article class="guided-output-card">
        <header class="guided-output-header">
          <div>
            <h3>${escapeHtml(workflow.catName)} · rejected</h3>
            <p>Reason：${escapeHtml(workflow.reasonCode)}</p>
          </div>
          <span class="instance-badge">Rejected</span>
        </header>
        <p>请把每动作帧数控制在 2 到 24，FPS 控制在 1 到 24。</p>
      </article>
    `;
  }

  return `
    <article class="guided-output-card">
      <header class="guided-output-header">
        <div>
          <h3>${escapeHtml(workflow.catName)} · animated sprite</h3>
          <p>Reason：${escapeHtml(workflow.reasonCode)} · Actions：${workflow.evidenceSummary.actionCount}/8 · ${workflow.frameCount} frames/action · ${workflow.fps} fps</p>
        </div>
        <span class="instance-badge">Prompt only</span>
      </header>
      <div class="guided-output-grid">
        <section>
          <h4>动作 Storyboard 提示词</h4>
          ${CORE_ACTION_IDS.map((action) => {
            const storyboard = workflow.actionStoryboards[action];
            return `
              <details>
                <summary>${escapeHtml(action)} · ${escapeHtml(storyboard.frameFilePattern)}</summary>
                <pre>${escapeHtml(storyboard.prompt)}</pre>
              </details>
            `;
          }).join("")}
        </section>
        <section>
          <h4>Manifest 模板</h4>
          <pre>${escapeHtml(workflow.manifestTemplate)}</pre>
        </section>
        <section>
          <h4>V8.9 装配清单</h4>
          <ol>
            ${workflow.importChecklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ol>
        </section>
        <section>
          <h4>安全边界</h4>
          <dl class="diagnostics-grid">
            <div><dt>Prompt only</dt><dd>${workflow.evidenceSummary.promptOnly ? "yes" : "no"}</dd></div>
            <div><dt>Provider execution</dt><dd>${workflow.evidenceSummary.providerExecution ? "yes" : "no"}</dd></div>
            <div><dt>Upload by default</dt><dd>${workflow.evidenceSummary.uploadsByDefault ? "yes" : "no"}</dd></div>
            <div><dt>Targets V8.9</dt><dd>${workflow.evidenceSummary.targetsV89Assembler ? "yes" : "no"}</dd></div>
          </dl>
          <ul>
            ${workflow.safetyNotes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </section>
      </div>
    </article>
  `;
}

function v38PublicPhotoActionPanel(pipeline: ReturnType<typeof createV38PublicPhotoActionPipeline>) {
  const snapshot = buildV38PublicPhotoActionEvidenceSnapshot(pipeline);
  const passingSources = snapshot.sourceManifest.sources.filter((source) => source.sampleClass === "passing_cat");
  const nonPassingSources = snapshot.sourceManifest.sources.filter((source) => source.sampleClass !== "passing_cat");
  const firstPack = snapshot.renderablePacks[0];
  const firstAsset = firstPack ? snapshot.sanitizedAssets.find((asset) => asset.sampleId === firstPack.sampleId) : undefined;
  return `
    <section class="v38-public-photo-panel" id="v38-public-photo-action-entry" data-v38-status="${escapeHtml(snapshot.status)}">
      <header>
        <div>
          <h3>V38 公开猫图到动作帧资产</h3>
          <p>目标是用已授权公开照片样本生成可检查的像素资产、动作帧包和产品证据；当前声明范围仅限 tested public photo samples。</p>
        </div>
        <span class="instance-badge">${escapeHtml(snapshot.status)}</span>
      </header>
      <div class="v38-public-photo-grid">
        <article id="v38-public-source-status" class="v38-public-photo-card" aria-label="V38 公开来源状态">
          <h4>公开来源</h4>
          <dl>
            <div><dt>样本范围</dt><dd>${escapeHtml(snapshot.sourceManifest.sampleScope)}</dd></div>
            <div><dt>通过猫图</dt><dd>${snapshot.sourceManifest.passingCatCount}</dd></div>
            <div><dt>负例</dt><dd>${snapshot.sourceManifest.negativeCount}</dd></div>
            <div><dt>blocked</dt><dd>${snapshot.sourceManifest.blockedCount}</dd></div>
          </dl>
          <ul>
            ${passingSources.map((source) => `
              <li data-v38-source-id="${escapeHtml(source.sampleId)}">
                <strong>${escapeHtml(source.displayName)}</strong>
                <span>${escapeHtml(source.sampleClass)} · ${escapeHtml(source.expectedLicenseFamily)}</span>
              </li>
            `).join("")}
          </ul>
        </article>
        <article id="v38-pixel-asset-status" class="v38-public-photo-card" aria-label="V38 像素资产状态">
          <h4>去元数据像素资产</h4>
          <dl>
            <div><dt>已生成</dt><dd>${snapshot.sanitizedAssets.filter((asset) => asset.status === "passed").length}</dd></div>
            <div><dt>目标</dt><dd>3</dd></div>
            <div><dt>EXIF 清理</dt><dd>${snapshot.sanitizedAssets.every((asset) => asset.exifStripped) && snapshot.sanitizedAssets.length > 0 ? "passed" : "pending"}</dd></div>
            <div><dt>像素尺寸</dt><dd>${snapshot.sanitizedAssets[0] ? `${snapshot.sanitizedAssets[0].width}x${snapshot.sanitizedAssets[0].height}` : "pending"}</dd></div>
          </dl>
          <ul>
            ${snapshot.sanitizedAssets.map((asset) => `
              <li data-v38-asset-id="${escapeHtml(asset.sampleId)}">
                <strong>${escapeHtml(asset.sampleId)}</strong>
                <span>${escapeHtml(asset.averageColor)} · ${escapeHtml(asset.status)}</span>
              </li>
            `).join("") || "<li><strong>待生成</strong><span>需要运行 V38.2 像素清理脚本</span></li>"}
          </ul>
        </article>
        <article id="v38-renderable-pack-preview" class="v38-public-photo-card v38-preview-stage" aria-label="V38 动作帧预览">
          <h4>动作帧包</h4>
          ${firstPack ? `
            <div class="v38-preview-identity">
              <strong>${escapeHtml(firstPack.sampleId)}</strong>
              <span>${escapeHtml(firstPack.localMotionModel)}</span>
            </div>
            <div class="v38-preview-strip" aria-label="V38 公开猫图动作帧证据缩略图">
              ${firstAsset ? `<img src="${escapeHtml(firstAsset.sanitizedImageRef)}" alt="V38 去元数据猫图" loading="lazy" />` : ""}
              <img src="${escapeHtml(firstPack.contactSheetRef)}" alt="V38 动作帧 contact sheet" loading="lazy" />
              <img src="${escapeHtml(firstPack.animatedPreviewRef)}" alt="V38 动作帧 GIF 预览" loading="lazy" />
            </div>
            <div class="v38-action-chip-row">
              ${firstPack.actionCoverage.map((actionId) => `<span class="v38-action-chip">${escapeHtml(actionId)}</span>`).join("")}
            </div>
          ` : `
            <p>待生成 contact sheet 和 animated preview；不能用 transform-only 弱动作冒充通过。</p>
          `}
        </article>
        <article id="v38-product-apply-rollback" class="v38-public-photo-card" aria-label="V38 产品应用和回滚">
          <h4>产品出门门槛</h4>
          <dl>
            <div><dt>UI anchors</dt><dd>${snapshot.productUiAnchors.length}</dd></div>
            <div><dt>可渲染包</dt><dd>${snapshot.renderablePacks.filter((pack) => pack.status === "renderable").length}</dd></div>
            <div><dt>负例策略</dt><dd>${nonPassingSources.length}</dd></div>
            <div><dt>最终状态</dt><dd>${escapeHtml(snapshot.status)}</dd></div>
          </dl>
          <div class="v38-action-controls">
            <button class="primary-action" type="button" disabled>应用 V38 候选</button>
            <button class="secondary-action" type="button" disabled>回滚 V38 候选</button>
          </div>
          <p id="v38-blocked-reason" class="asset-import-feedback">
            ${escapeHtml(snapshot.reasonCodes.join(" / "))}
          </p>
        </article>
      </div>
    </section>
  `;
}

function v37PhotoToActionPanel(path: ReturnType<typeof createV37PhotoToActionProductPath>) {
  const snapshot = buildV37PhotoToActionEvidenceSnapshot(path);
  const final = decideV37FinalPhotoToAction(path);
  const routeA2Candidates = snapshot.actionCandidates.filter((candidate) => candidate.routeId === "route_a2_local_deterministic");
  const blockedCandidates = snapshot.actionCandidates.filter((candidate) => candidate.semanticStatus !== "passed");
  const firstCandidate = routeA2Candidates[0];
  return `
    <section class="v37-photo-action-panel" id="v37-photo-action-entry" data-v37-status="${escapeHtml(path.status)}" data-v37-final-decision="${escapeHtml(final.decision)}">
      <header>
        <div>
          <h3>V37 照片到动作资产路径</h3>
          <p>本地 scoped evidence：tested named samples 进入样本、身份、动作候选、人审和产品路径门禁；不代表任意猫自动生成 ready。</p>
        </div>
        <span class="instance-badge">${escapeHtml(final.decision)}</span>
      </header>
      <div class="v37-photo-action-grid">
        <article id="v37-sample-status" class="v37-photo-action-card" aria-label="V37 样本状态">
          <h4>样本状态</h4>
          <dl>
            <div><dt>样本范围</dt><dd>${escapeHtml(snapshot.sampleSet.sampleScope)}</dd></div>
            <div><dt>通过样本</dt><dd>${snapshot.sampleSet.passedCount}</dd></div>
            <div><dt>负例拒绝</dt><dd>${snapshot.sampleSet.negativeRejectedCount}</dd></div>
            <div><dt>blocked</dt><dd>${snapshot.sampleSet.blockedCount}</dd></div>
          </dl>
          <ul>
            ${snapshot.sampleSet.records.map((record) => `
              <li data-v37-sample-id="${escapeHtml(record.sampleId)}">
                <strong>${escapeHtml(record.displayName)}</strong>
                <span>${escapeHtml(record.intakeStatus)} / ${escapeHtml(record.difficultyClass)}</span>
              </li>
            `).join("")}
          </ul>
        </article>
        <article id="v37-action-candidate-list" class="v37-photo-action-card" aria-label="V37 动作候选">
          <h4>动作候选</h4>
          <ul>
            ${snapshot.actionCandidates.map((candidate) => `
              <li data-v37-candidate-id="${escapeHtml(candidate.candidateId)}" data-v37-route-id="${escapeHtml(candidate.routeId)}" data-v37-candidate-status="${escapeHtml(candidate.semanticStatus)}">
                <strong>${escapeHtml(candidate.sampleId)}</strong>
                <span>${escapeHtml(candidate.routeId)} / ${escapeHtml(candidate.visualStatus)} / ${candidate.actionCoverage.length} actions</span>
              </li>
            `).join("")}
          </ul>
        </article>
        <article id="v37-action-preview-stage" class="v37-photo-action-card v37-preview-stage" aria-label="V37 动作预览">
          <h4>候选预览</h4>
          ${firstCandidate ? `
            <div class="v37-preview-identity">
              <strong>${escapeHtml(firstCandidate.sampleId)}</strong>
              <span>${escapeHtml(firstCandidate.characterAssetId)}</span>
            </div>
            <div class="v37-action-chip-row">
              ${firstCandidate.actionCoverage.map((actionId) => `<span class="v37-action-chip">${escapeHtml(actionId)}</span>`).join("")}
            </div>
          ` : "<p>没有可预览候选。</p>"}
        </article>
        <article class="v37-photo-action-card" aria-label="V37 应用和回滚">
          <h4>应用 / 回滚</h4>
          <dl>
            <div><dt>preview</dt><dd>${String(snapshot.productGate.previewReady)}</dd></div>
            <div><dt>target-only apply</dt><dd>${String(snapshot.productGate.targetOnlyApplyPassed)}</dd></div>
            <div><dt>rollback</dt><dd>${String(snapshot.productGate.rollbackPassed)}</dd></div>
          </dl>
          <div class="v37-action-controls">
            <button class="primary-action" type="button" data-v37-apply-candidate="${escapeHtml(firstCandidate?.candidateId ?? "")}" ${firstCandidate ? "" : "disabled"}>应用候选</button>
            <button class="secondary-action" id="v37-rollback-candidate" type="button">回滚候选</button>
          </div>
          <p id="v37-blocked-candidate-reason" class="asset-import-feedback">
            ${blockedCandidates.length > 0 ? escapeHtml(blockedCandidates.map((candidate) => `${candidate.candidateId}: ${candidate.reasonCodes.join(", ")}`).join(" / ")) : "无 blocked candidate。"}
          </p>
        </article>
      </div>
    </section>
  `;
}

function photo2DWizardPanel(model: Photo2DWizardModel) {
  if (model.status !== "ready") {
    return `
      <section class="photo-2d-wizard-panel" id="photo-2d-wizard-panel">
        <div class="photo-2d-wizard-hero">
          <div>
            <span class="instance-badge">Photo to 2D</span>
            <h2>照片生成动作资产向导</h2>
            <p>向导安全审查未通过：${escapeHtml(model.reasonCode)}。不会执行 provider、不会修改 live pet。</p>
          </div>
        </div>
      </section>
    `;
  }
  return `
    <section class="photo-2d-wizard-panel" id="photo-2d-wizard-panel" data-wizard-status="${escapeHtml(model.status)}" data-source-photo-ref="${escapeHtml(model.sourcePhotoRef)}">
      <div class="photo-2d-wizard-hero">
        <div>
            <span class="instance-badge">V18.1 reference photo consent</span>
            <h2>照片生成动作资产向导</h2>
          <p>从设置页选择本地猫照片、预览、勾选上传/生成同意、确认 provider 披露、填写 traits 和目标包名。V18.1 只证明输入与 consent 边界，不声明 provider generation 已通过。</p>
        </div>
        <div class="photo-2d-wizard-actions">
          <button class="primary-action" id="photo-2d-wizard-open" type="button" data-photo-2d-wizard-open>打开向导</button>
          <button class="secondary-action" type="button" data-photo-2d-jump-intake>填写照片摘要</button>
        </div>
      </div>
      <div class="photo-2d-wizard-steps">
        ${model.steps.map((step, index) => `
          <article class="photo-2d-wizard-step" data-step-id="${escapeHtml(step.id)}" data-step-status="${escapeHtml(step.status)}">
            <span class="photo-2d-step-index">${index + 1}</span>
            <div>
              <h3>${escapeHtml(step.title)}</h3>
              <p>${escapeHtml(step.summary)}</p>
            </div>
            <span class="instance-badge">${escapeHtml(step.status)}</span>
          </article>
        `).join("")}
      </div>
      <p class="photo-2d-wizard-note">向导默认只处理本地预览和安全元数据；未完成 consent、披露和 credential 检查前不会调用 provider，不发送 PetEvent，不改变当前猫状态。</p>
    </section>
  `;
}

function photo2DWizardModal(model: Photo2DWizardModel) {
  if (model.status !== "ready") {
    return "";
  }
  return `
    <div class="photo-2d-modal" id="photo-2d-wizard-modal" hidden role="dialog" aria-modal="true" aria-labelledby="photo-2d-wizard-title">
      <div class="photo-2d-modal-backdrop" data-photo-2d-wizard-close></div>
      <section class="photo-2d-modal-card">
        <header class="photo-2d-modal-header">
          <div>
            <span class="instance-badge">V18.1 · consent boundary · zero PetEvent</span>
            <h2 id="photo-2d-wizard-title">照片生成动作资产</h2>
            <p>先完成本地照片 intake、上传/生成同意、provider 披露和 traits 确认。真实 provider 生成必须等 V18.2 capability preflight。</p>
          </div>
          <button class="icon-action" type="button" title="关闭" data-photo-2d-wizard-close>×</button>
        </header>

        <div class="photo-2d-intake-shell"
          data-wizard-state="idle"
          data-reason-code="photo_required"
          data-accepted-pet-events="0"
          data-calls-notify="false"
          data-writes-cat-state-machine="false"
          data-mutates-live-pet="false">
          <section class="photo-2d-modal-section photo-2d-modal-wide photo-2d-intake-section">
            <div class="photo-2d-section-heading">
              <div>
                <h3>1. 本地照片 intake</h3>
                <p>只使用浏览器本地 object URL 预览；界面不显示源文件名、完整路径、EXIF/GPS 或 raw photo bytes。</p>
              </div>
              <span class="instance-badge" id="photo-2d-state-badge">idle · photo_required</span>
            </div>
            <div class="photo-2d-intake-grid">
              <label class="photo-2d-file-picker" id="photo-2d-drop-zone" for="photo-2d-photo-input" tabindex="0">
                <span>选择或拖入猫照片</span>
                <small>支持 PNG / JPEG / WEBP，本阶段只做本地预览和脱敏元数据。</small>
                <input id="photo-2d-photo-input" type="file" accept="image/png,image/jpeg,image/webp" />
              </label>
              <div class="photo-2d-preview-card">
                <img id="photo-2d-photo-preview" alt="本地照片预览" hidden />
                <p id="photo-2d-preview-empty">尚未选择照片。</p>
              </div>
              <div class="photo-2d-form-card">
                <label class="consent-row">
                  <input id="photo-2d-consent" type="checkbox" />
                <span>我明确同意在后续 V18.2 provider 能力确认后，才可把这张照片作为 reference image 用于生成。</span>
                </label>
                <label>
                  <span>用户确认 traits</span>
                  <textarea id="photo-2d-traits" maxlength="220" rows="3" placeholder="例如：橘猫、琥珀色眼睛、圆脸、白色胸毛。不要粘贴路径、URL、token 或 provider 内容。"></textarea>
                </label>
                <label>
                  <span>目标资产包名</span>
                  <input id="photo-2d-pack-name" type="text" maxlength="80" value="My generated cat" autocomplete="off" />
                </label>
              </div>
            </div>
            <div class="photo-2d-state-grid">
              <div>
                <strong>当前状态</strong>
                <span id="photo-2d-current-state">idle</span>
              </div>
              <div>
                <strong>Reason code</strong>
                <span id="photo-2d-current-reason">photo_required</span>
              </div>
              <div>
                <strong>后续生成</strong>
                <span id="photo-2d-generation-availability">等待照片、同意和 traits</span>
              </div>
            </div>
            <dl class="diagnostics-grid" id="photo-2d-safe-metadata">
              <div><dt>Selected</dt><dd>false</dd></div>
              <div><dt>Media type</dt><dd>none</dd></div>
              <div><dt>Size bucket</dt><dd>none</dd></div>
              <div><dt>Dimensions</dt><dd>unknown</dd></div>
            </dl>
          </section>

          <section class="photo-2d-modal-section photo-2d-modal-wide photo-2d-generation-section">
            <div class="photo-2d-section-heading">
              <div>
                <h3>2. 生成方式与状态</h3>
                <p>选择 host/manual/provider/import 路径。Provider API 必须先通过 V18.2 reference image 能力预检；V17 动作表路径只能作为 fallback。</p>
              </div>
              <span class="instance-badge" id="photo-2d-generation-badge">pending_user_action · generation_mode_required</span>
            </div>
            <div class="photo-2d-generation-grid">
              <label class="photo-2d-mode-card">
                <input type="radio" name="photo-2d-generation-mode" value="host_image_tool_assisted" />
                <span>Host image tool assisted</span>
                <small>复制提示词，在外部图像工具生成 4x2 动作表，再上传结果。</small>
              </label>
              <label class="photo-2d-mode-card">
                <input type="radio" name="photo-2d-generation-mode" value="local_action_sheet_import" />
                <span>Local action sheet import</span>
                <small>已有 4x2 动作表时直接选择文件；本阶段只标记 output_ready。</small>
              </label>
              <label class="photo-2d-mode-card">
                <input type="radio" name="photo-2d-generation-mode" value="provider_api" />
                <span>Provider API</span>
                <small>需要凭据、上传同意、费用/隐私/留存/license 披露；V18.2 前默认 blocked。</small>
              </label>
            </div>
            <div class="photo-2d-provider-boundary">
              <div class="photo-2d-section-heading">
                <div>
                  <h4>Provider 上传与生成边界</h4>
                  <p>这些选项只记录布尔状态和 reasonCode，不记录 credential、raw provider response、原始照片 bytes 或完整路径。</p>
                </div>
                <span class="instance-badge" id="photo-2d-provider-boundary-badge">blocked · consent_required</span>
              </div>
              <div class="photo-2d-provider-checks">
                <label class="consent-row"><input id="photo-2d-provider-upload-consent" type="checkbox" /> <span>我同意后续 provider reference-image 上传/生成。</span></label>
                <label class="consent-row"><input id="photo-2d-provider-terms" type="checkbox" /> <span>我已查看 provider terms。</span></label>
                <label class="consent-row"><input id="photo-2d-provider-cost" type="checkbox" /> <span>我已了解可能产生费用。</span></label>
                <label class="consent-row"><input id="photo-2d-provider-privacy" type="checkbox" /> <span>我已了解 provider 隐私处理。</span></label>
                <label class="consent-row"><input id="photo-2d-provider-retention" type="checkbox" /> <span>我已了解 provider 留存策略。</span></label>
                <label class="consent-row"><input id="photo-2d-provider-license" type="checkbox" /> <span>我已了解生成资产 license / attribution。</span></label>
              </div>
              <dl class="diagnostics-grid" id="photo-2d-provider-boundary-metadata">
                <div><dt>Provider</dt><dd>minimax</dd></div>
                <div><dt>Status</dt><dd>blocked</dd></div>
                <div><dt>Reason</dt><dd>consent_required</dd></div>
                <div><dt>Credential</dt><dd>not recorded</dd></div>
              </dl>
            </div>
            <div class="photo-2d-state-grid">
              <div>
                <strong>Job state</strong>
                <span id="photo-2d-job-state">pending_user_action</span>
              </div>
              <div>
                <strong>Generation reason</strong>
                <span id="photo-2d-generation-reason">generation_mode_required</span>
              </div>
              <div>
                <strong>Next action</strong>
                <span id="photo-2d-next-action">选择生成方式。</span>
              </div>
            </div>
            <div class="photo-2d-generation-actions">
              <button class="copy-command" type="button" id="photo-2d-copy-prompt" data-copy="${escapeHtml(model.prompt)}" data-copy-label="复制提示词" disabled>复制安全提示词</button>
              <label class="photo-2d-action-sheet-picker" for="photo-2d-action-sheet-input">
                <span>选择 4x2 动作表</span>
                <input id="photo-2d-action-sheet-input" type="file" accept="image/png,image/jpeg,image/webp" disabled />
              </label>
              <button class="secondary-action" id="photo-2d-provider-status" type="button" disabled>Provider not-ready</button>
            </div>
            <dl class="diagnostics-grid" id="photo-2d-action-sheet-metadata">
              <div><dt>Selected</dt><dd>false</dd></div>
              <div><dt>Media type</dt><dd>none</dd></div>
              <div><dt>Size bucket</dt><dd>none</dd></div>
              <div><dt>Dimensions</dt><dd>unknown</dd></div>
            </dl>
          </section>

          <section class="photo-2d-modal-section photo-2d-modal-wide photo-2d-qa-section"
            data-qa-state="waiting_for_output"
            data-qa-reason-code="action_sheet_required"
            data-accepted-pet-events="0"
            data-writes-cat-state-machine="false"
            data-mutates-live-pet="false">
            <div class="photo-2d-section-heading">
              <div>
                <h3>3. 8 动作预览 QA</h3>
                <p>选择动作表或接收 provider output 后，向导只在本地浏览器内按固定 4x2 裁出预览；预览不应用资产、不触发 live 状态。</p>
              </div>
              <span class="instance-badge" id="photo-2d-qa-badge">waiting_for_output · action_sheet_required</span>
            </div>
            <div class="photo-2d-qa-grid" id="photo-2d-qa-grid">
              ${CORE_ACTION_IDS.map((actionId) => `
                <article class="photo-2d-qa-card" data-qa-action="${escapeHtml(actionId)}" data-coverage-state="fallback" data-reason-code="action_sheet_required">
                  <strong>${escapeHtml(actionId)}</strong>
                  <img alt="${escapeHtml(actionId)} 动作预览" hidden />
                  <span class="photo-2d-qa-fallback">等待动作表</span>
                  <small>frameCount: <b data-qa-frame-count>0</b> · firstFinalClosed: <b data-qa-closed>false</b></small>
                </article>
              `).join("")}
            </div>
            <label class="consent-row photo-2d-same-cat-row">
              <input id="photo-2d-same-cat-pass" type="checkbox" disabled />
              <span>我确认 8 个动作仍然是同一只猫。QA 未通过时不能进入应用。</span>
            </label>
            <div class="photo-2d-generation-actions">
              <button class="primary-action" id="photo-2d-apply-next" type="button" disabled>进入应用步骤（V17.5）</button>
              <span class="photo-2d-wizard-note" id="photo-2d-qa-summary">需要先选择本地动作表。</span>
            </div>
          </section>

          <div class="photo-2d-modal-grid">
          <section class="photo-2d-modal-section">
            <h3>后续 4 步流程</h3>
            <ol class="photo-2d-checklist">
              ${model.steps.map((step) => `
                <li>
                  <strong>${escapeHtml(step.title)}</strong>
                  <span>${escapeHtml(step.summary)}</span>
                  <small>${escapeHtml(step.status)} · ${step.acceptance.length} checks</small>
                </li>
              `).join("")}
            </ol>
          </section>

          <section class="photo-2d-modal-section">
            <h3>最小验收清单</h3>
            <ol class="photo-2d-checklist">
              ${model.minimumVerification.map((item) => `<li><span>${escapeHtml(item)}</span></li>`).join("")}
            </ol>
          </section>

          <section class="photo-2d-modal-section photo-2d-modal-wide">
            <div class="photo-2d-section-heading">
              <h3>可复制生成提示词</h3>
              <button class="copy-command" type="button" data-copy="${escapeHtml(model.prompt)}" data-copy-label="复制提示词">复制提示词</button>
            </div>
            <pre>${escapeHtml(model.prompt)}</pre>
          </section>

          <section class="photo-2d-modal-section">
            <h3>输出文件名约定</h3>
            <dl class="diagnostics-grid">
              <div><dt>Pack ID</dt><dd>${escapeHtml(model.outputNames.packId)}</dd></div>
              <div><dt>动作表</dt><dd>${escapeHtml(model.outputNames.actionSheetFile)}</dd></div>
              <div><dt>联系表</dt><dd>${escapeHtml(model.outputNames.contactSheetFile)}</dd></div>
              <div><dt>Manifest</dt><dd>${escapeHtml(model.outputNames.manifestFile)}</dd></div>
            </dl>
          </section>

          <section class="photo-2d-modal-section">
            <h3>安全边界</h3>
            <dl class="diagnostics-grid">
              <div><dt>默认上传</dt><dd>${model.safety.uploadsByDefault ? "yes" : "no"}</dd></div>
              <div><dt>保存原图</dt><dd>${model.safety.storesRawPhoto ? "yes" : "no"}</dd></div>
              <div><dt>预览改 live pet</dt><dd>${model.safety.mutatesLivePetDuringPreview ? "yes" : "no"}</dd></div>
              <div><dt>预览发事件</dt><dd>${model.safety.emitsPetEventDuringPreview ? "yes" : "no"}</dd></div>
            </dl>
          </section>

          <section class="photo-2d-modal-section photo-2d-modal-wide">
            <h3>禁止扩大声明</h3>
            <div class="photo-2d-claim-list">
              ${model.forbiddenClaims.map((claim) => `<span>${escapeHtml(claim)}</span>`).join("")}
            </div>
          </section>
          </div>
        </div>
      </section>
    </div>
  `;
}

function attachPhoto2DWizardControls(root: ParentNode) {
  root.querySelectorAll<HTMLButtonElement>("[data-photo-2d-wizard-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const modal = appRoot.querySelector<HTMLElement>("#photo-2d-wizard-modal");
      if (!modal) {
        return;
      }
      modal.hidden = false;
      document.body.classList.add("modal-open");
      updatePhoto2DWizardState();
      modal.querySelector<HTMLButtonElement>("[data-photo-2d-wizard-close]")?.focus();
    });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-photo-2d-wizard-close]").forEach((button) => {
    button.addEventListener("click", () => closePhoto2DWizardModal());
  });

  root.querySelectorAll<HTMLButtonElement>("[data-photo-2d-jump-intake]").forEach((button) => {
    button.addEventListener("click", () => {
      closePhoto2DWizardModal();
      appRoot.querySelector<HTMLElement>("#photo-intake-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      appRoot.querySelector<HTMLInputElement>("#photo-intake-cat-name")?.focus();
    });
  });

  const photoInput = root.querySelector<HTMLInputElement>("#photo-2d-photo-input");
  photoInput?.addEventListener("change", () => {
    const file = photoInput.files?.[0] ?? null;
    handlePhoto2DWizardFile(file);
  });

  const dropZone = root.querySelector<HTMLElement>("#photo-2d-drop-zone");
  dropZone?.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("is-drag-over");
  });
  dropZone?.addEventListener("dragleave", () => {
    dropZone.classList.remove("is-drag-over");
  });
  dropZone?.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("is-drag-over");
    const file = event.dataTransfer?.files?.[0] ?? null;
    handlePhoto2DWizardFile(file);
  });

  root.querySelector<HTMLInputElement>("#photo-2d-consent")?.addEventListener("change", () => updatePhoto2DWizardState());
  root.querySelector<HTMLTextAreaElement>("#photo-2d-traits")?.addEventListener("input", () => updatePhoto2DWizardState());
  root.querySelector<HTMLInputElement>("#photo-2d-pack-name")?.addEventListener("input", () => updatePhoto2DWizardState());
  bindPhoto2DProviderDisclosureControls(root, () => updatePhoto2DWizardState());
  root.querySelectorAll<HTMLInputElement>("[name='photo-2d-generation-mode']").forEach((input) => {
    input.addEventListener("change", () => updatePhoto2DWizardState());
  });
  root.querySelector<HTMLInputElement>("#photo-2d-same-cat-pass")?.addEventListener("change", () => updatePhoto2DWizardState());
  const actionSheetInput = root.querySelector<HTMLInputElement>("#photo-2d-action-sheet-input");
  actionSheetInput?.addEventListener("change", () => {
    const file = actionSheetInput.files?.[0] ?? null;
    handlePhoto2DWizardActionSheet(file);
  });

  root.addEventListener("keydown", (event) => {
    if (event instanceof KeyboardEvent && event.key === "Escape") {
      closePhoto2DWizardModal();
    }
  });
}

function closePhoto2DWizardModal() {
  const modal = appRoot.querySelector<HTMLElement>("#photo-2d-wizard-modal");
  if (!modal) {
    return;
  }
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  photo2DWizardSelectedPhoto = null;
  photo2DWizardSelectedActionSheet = null;
  revokePhoto2DWizardPreviewUrl();
  revokePhoto2DWizardActionSheetPreviewUrl();
  updatePhoto2DWizardPreview(null);
  resetPhoto2DActionSheetPreview();
  const input = appRoot.querySelector<HTMLInputElement>("#photo-2d-photo-input");
  if (input) {
    input.value = "";
  }
  const sheetInput = appRoot.querySelector<HTMLInputElement>("#photo-2d-action-sheet-input");
  if (sheetInput) {
    sheetInput.value = "";
  }
  appRoot.querySelectorAll<HTMLInputElement>("[name='photo-2d-generation-mode']").forEach((radio) => {
    radio.checked = false;
  });
  const sameCat = appRoot.querySelector<HTMLInputElement>("#photo-2d-same-cat-pass");
  if (sameCat) {
    sameCat.checked = false;
    sameCat.disabled = true;
  }
  resetPhoto2DProviderDisclosureControls(appRoot);
  updatePhoto2DWizardState();
}

function handlePhoto2DWizardFile(file: File | null) {
  if (!file) {
    photo2DWizardSelectedPhoto = null;
    revokePhoto2DWizardPreviewUrl();
    updatePhoto2DWizardPreview(null);
    updatePhoto2DWizardState();
    return;
  }

  revokePhoto2DWizardPreviewUrl();
  photo2DWizardPreviewUrl = URL.createObjectURL(file);
  photo2DWizardSelectedPhoto = {
    selected: true,
    mediaType: file.type,
    sizeBytes: file.size,
    safeSourceRef: "selected-local-photo"
  };
  updatePhoto2DWizardPreview(photo2DWizardPreviewUrl);
  updatePhoto2DWizardState();

  const image = new Image();
  image.onload = () => {
    photo2DWizardSelectedPhoto = {
      selected: true,
      mediaType: file.type,
      sizeBytes: file.size,
      width: image.naturalWidth,
      height: image.naturalHeight,
      safeSourceRef: "selected-local-photo"
    };
    updatePhoto2DWizardState();
  };
  image.onerror = () => updatePhoto2DWizardState();
  image.src = photo2DWizardPreviewUrl;
}

function handlePhoto2DWizardActionSheet(file: File | null) {
  if (!file) {
    photo2DWizardSelectedActionSheet = null;
    revokePhoto2DWizardActionSheetPreviewUrl();
    resetPhoto2DActionSheetPreview();
    updatePhoto2DWizardState();
    return;
  }
  revokePhoto2DWizardActionSheetPreviewUrl();
  photo2DWizardSelectedActionSheet = {
    selected: true,
    mediaType: file.type,
    sizeBytes: file.size,
    safeSourceRef: "selected-local-photo"
  };
  updatePhoto2DWizardState();

  const previewUrl = URL.createObjectURL(file);
  photo2DWizardActionSheetPreviewUrl = previewUrl;
  const image = new Image();
  image.onload = () => {
    photo2DWizardSelectedActionSheet = {
      selected: true,
      mediaType: file.type,
      sizeBytes: file.size,
      width: image.naturalWidth,
      height: image.naturalHeight,
      safeSourceRef: "selected-local-photo"
    };
    renderPhoto2DActionSheetPreview(image);
    updatePhoto2DWizardState();
  };
  image.onerror = () => {
    resetPhoto2DActionSheetPreview();
    updatePhoto2DWizardState();
  };
  image.src = previewUrl;
}

function revokePhoto2DWizardPreviewUrl() {
  if (photo2DWizardPreviewUrl) {
    URL.revokeObjectURL(photo2DWizardPreviewUrl);
    photo2DWizardPreviewUrl = null;
  }
}

function revokePhoto2DWizardActionSheetPreviewUrl() {
  if (photo2DWizardActionSheetPreviewUrl) {
    URL.revokeObjectURL(photo2DWizardActionSheetPreviewUrl);
    photo2DWizardActionSheetPreviewUrl = null;
  }
}

function updatePhoto2DWizardPreview(previewUrl: string | null) {
  const preview = appRoot.querySelector<HTMLImageElement>("#photo-2d-photo-preview");
  const empty = appRoot.querySelector<HTMLElement>("#photo-2d-preview-empty");
  if (!preview || !empty) {
    return;
  }
  if (previewUrl) {
    preview.src = previewUrl;
    preview.hidden = false;
    empty.hidden = true;
  } else {
    preview.removeAttribute("src");
    preview.hidden = true;
    empty.hidden = false;
  }
}

function updatePhoto2DWizardState() {
  const shell = appRoot.querySelector<HTMLElement>(".photo-2d-intake-shell");
  if (!shell) {
    return;
  }
  const consent = appRoot.querySelector<HTMLInputElement>("#photo-2d-consent")?.checked ?? false;
  const approvedTraits = appRoot.querySelector<HTMLTextAreaElement>("#photo-2d-traits")?.value ?? "";
  const targetPackName = appRoot.querySelector<HTMLInputElement>("#photo-2d-pack-name")?.value ?? "";
  const providerDisclosureControls = readPhoto2DProviderDisclosureControls(appRoot);
  const snapshot = createPhoto2DWizardIntakeSnapshot({
    photo: photo2DWizardSelectedPhoto,
    consent,
    approvedTraits,
    targetPackName
  });
  const providerBoundary = createPhoto2DWizardProviderDisclosureSnapshot({
    providerName: "minimax",
    uploadConsent: providerDisclosureControls.uploadConsent,
    termsReviewed: providerDisclosureControls.termsReviewed,
    costDisclosureAccepted: providerDisclosureControls.costDisclosureAccepted,
    privacyDisclosureAccepted: providerDisclosureControls.privacyDisclosureAccepted,
    retentionDisclosureAccepted: providerDisclosureControls.retentionDisclosureAccepted,
    licenseDisclosureAccepted: providerDisclosureControls.licenseDisclosureAccepted,
    attributionDisclosureAccepted: providerDisclosureControls.licenseDisclosureAccepted,
    credentialConfigured: false
  });
  const generation = createPhoto2DWizardGenerationSnapshot({
    intake: snapshot,
    mode: selectedPhoto2DGenerationMode(),
    actionSheet: photo2DWizardSelectedActionSheet,
    providerConfigured: true,
    providerCredentialAvailable: providerBoundary.credentialConfigured,
    providerConsent: providerBoundary.uploadConsent,
    providerTermsReviewed: providerBoundary.termsReviewed,
    providerCostDisclosureAccepted: providerBoundary.costDisclosureAccepted,
    providerPrivacyDisclosureAccepted: providerBoundary.privacyDisclosureAccepted,
    providerRetentionDisclosureAccepted: providerBoundary.retentionDisclosureAccepted,
    providerLicenseDisclosureAccepted: providerBoundary.licenseDisclosureAccepted && providerBoundary.attributionDisclosureAccepted,
    providerOutputAccepted: false
  });

  shell.dataset.wizardState = snapshot.state;
  shell.dataset.reasonCode = snapshot.reasonCode;
  shell.dataset.acceptedPetEvents = String(snapshot.safety.acceptedPetEvents);
  shell.dataset.callsNotify = String(snapshot.safety.callsNotify);
  shell.dataset.writesCatStateMachine = String(snapshot.safety.writesCatStateMachine);
  shell.dataset.mutatesLivePet = String(snapshot.safety.mutatesLivePetInstance);
  shell.dataset.generationMode = generation.mode;
  shell.dataset.jobState = generation.jobState;
  shell.dataset.generationReasonCode = generation.reasonCode;
  shell.dataset.providerBoundaryStatus = providerBoundary.status;
  shell.dataset.providerBoundaryReasonCode = providerBoundary.reasonCode;

  const badge = appRoot.querySelector<HTMLElement>("#photo-2d-state-badge");
  const state = appRoot.querySelector<HTMLElement>("#photo-2d-current-state");
  const reason = appRoot.querySelector<HTMLElement>("#photo-2d-current-reason");
  const availability = appRoot.querySelector<HTMLElement>("#photo-2d-generation-availability");
  const metadata = appRoot.querySelector<HTMLElement>("#photo-2d-safe-metadata");
  const generationBadge = appRoot.querySelector<HTMLElement>("#photo-2d-generation-badge");
  const jobState = appRoot.querySelector<HTMLElement>("#photo-2d-job-state");
  const generationReason = appRoot.querySelector<HTMLElement>("#photo-2d-generation-reason");
  const nextAction = appRoot.querySelector<HTMLElement>("#photo-2d-next-action");
  const promptButton = appRoot.querySelector<HTMLButtonElement>("#photo-2d-copy-prompt");
  const actionSheetInput = appRoot.querySelector<HTMLInputElement>("#photo-2d-action-sheet-input");
  const providerButton = appRoot.querySelector<HTMLButtonElement>("#photo-2d-provider-status");
  const actionSheetMetadata = appRoot.querySelector<HTMLElement>("#photo-2d-action-sheet-metadata");
  const providerBoundaryBadge = appRoot.querySelector<HTMLElement>("#photo-2d-provider-boundary-badge");
  const providerBoundaryMetadata = appRoot.querySelector<HTMLElement>("#photo-2d-provider-boundary-metadata");

  if (badge) badge.textContent = `${snapshot.state} · ${snapshot.reasonCode}`;
  if (state) state.textContent = snapshot.state;
  if (reason) reason.textContent = snapshot.reasonCode;
  if (availability) {
    availability.textContent = snapshot.state === "generation_ready"
      ? "V17.2 可接入生成路径；当前 V17.1 不调用 provider"
      : "等待照片、同意和 traits";
  }
  if (metadata) {
    metadata.innerHTML = `
      <div><dt>Selected</dt><dd>${snapshot.safeMetadata.selected ? "true" : "false"}</dd></div>
      <div><dt>Media type</dt><dd>${escapeHtml(snapshot.safeMetadata.mediaType)}</dd></div>
      <div><dt>Size bucket</dt><dd>${escapeHtml(snapshot.safeMetadata.sizeBucket)}</dd></div>
      <div><dt>Dimensions</dt><dd>${escapeHtml(snapshot.safeMetadata.dimensions)}</dd></div>
      <div><dt>Source ref</dt><dd>${escapeHtml(snapshot.safeMetadata.safeSourceRef)}</dd></div>
      <div><dt>Target pack</dt><dd>${escapeHtml(snapshot.targetPackId)}</dd></div>
    `;
  }

  const sameCat = appRoot.querySelector<HTMLInputElement>("#photo-2d-same-cat-pass");
  const qaSection = appRoot.querySelector<HTMLElement>(".photo-2d-qa-section");
  const qaBadge = appRoot.querySelector<HTMLElement>("#photo-2d-qa-badge");
  const qaSummary = appRoot.querySelector<HTMLElement>("#photo-2d-qa-summary");
  const applyNext = appRoot.querySelector<HTMLButtonElement>("#photo-2d-apply-next");
  const qaReady = generation.jobState === "output_ready" && generation.reasonCode === "action_sheet_output_ready";
  const sameCatPassed = Boolean(sameCat?.checked && qaReady);
  const qaState = !qaReady ? "waiting_for_output" : sameCatPassed ? "modal_preview_ready" : "same_cat_review_required";
  const qaReason = !qaReady ? "action_sheet_required" : sameCatPassed ? "modal_preview_ready" : "same_cat_review_required";
  if (sameCat) {
    sameCat.disabled = !qaReady;
  }
  if (qaSection) {
    qaSection.dataset.qaState = qaState;
    qaSection.dataset.qaReasonCode = qaReason;
    qaSection.dataset.acceptedPetEvents = "0";
    qaSection.dataset.writesCatStateMachine = "false";
    qaSection.dataset.mutatesLivePet = "false";
  }
  if (qaBadge) qaBadge.textContent = `${qaState} · ${qaReason}`;
  if (qaSummary) {
    qaSummary.textContent = !qaReady
      ? "需要先选择本地动作表。"
      : sameCatPassed
        ? "8 动作预览已人工确认；V17.5 才会应用到目标猫。"
        : "请人工确认 8 个动作是否仍为同一只猫。";
  }
  if (applyNext) {
    applyNext.disabled = !sameCatPassed;
  }

  if (generationBadge) generationBadge.textContent = `${generation.jobState} · ${generation.reasonCode}`;
  if (jobState) jobState.textContent = generation.jobState;
  if (generationReason) generationReason.textContent = generation.reasonCode;
  if (nextAction) nextAction.textContent = generation.nextAction;
  if (promptButton) {
    promptButton.disabled = !generation.canCopyPrompt;
  }
  if (actionSheetInput) {
    actionSheetInput.disabled = !generation.canSelectActionSheet;
  }
  if (providerButton) {
    providerButton.textContent = generation.mode === "provider_api"
      ? `Provider ${providerBoundary.reasonCode}`
      : "Provider optional";
    providerButton.disabled = true;
  }
  if (providerBoundaryBadge) {
    providerBoundaryBadge.textContent = `${providerBoundary.status} · ${providerBoundary.reasonCode}`;
  }
  if (providerBoundaryMetadata) {
    providerBoundaryMetadata.innerHTML = `
      <div><dt>Provider</dt><dd>${escapeHtml(providerBoundary.providerName)}</dd></div>
      <div><dt>Status</dt><dd>${escapeHtml(providerBoundary.status)}</dd></div>
      <div><dt>Reason</dt><dd>${escapeHtml(providerBoundary.reasonCode)}</dd></div>
      <div><dt>Credential</dt><dd>${providerBoundary.credentialConfigured ? "configured" : "missing"}</dd></div>
      <div><dt>Upload consent</dt><dd>${providerBoundary.uploadConsent ? "true" : "false"}</dd></div>
      <div><dt>Disclosures</dt><dd>${providerBoundary.termsReviewed && providerBoundary.costDisclosureAccepted && providerBoundary.privacyDisclosureAccepted && providerBoundary.retentionDisclosureAccepted && providerBoundary.licenseDisclosureAccepted ? "accepted" : "incomplete"}</dd></div>
    `;
  }
  if (actionSheetMetadata) {
    actionSheetMetadata.innerHTML = `
      <div><dt>Selected</dt><dd>${generation.actionSheetMetadata.selected ? "true" : "false"}</dd></div>
      <div><dt>Media type</dt><dd>${escapeHtml(generation.actionSheetMetadata.mediaType)}</dd></div>
      <div><dt>Size bucket</dt><dd>${escapeHtml(generation.actionSheetMetadata.sizeBucket)}</dd></div>
      <div><dt>Dimensions</dt><dd>${escapeHtml(generation.actionSheetMetadata.dimensions)}</dd></div>
      <div><dt>Source ref</dt><dd>${escapeHtml(generation.actionSheetMetadata.safeSourceRef)}</dd></div>
    `;
  }
}

function renderPhoto2DActionSheetPreview(image: HTMLImageElement) {
  const cellWidth = Math.floor(image.naturalWidth / 4);
  const cellHeight = Math.floor(image.naturalHeight / 2);
  if (cellWidth <= 0 || cellHeight <= 0) {
    resetPhoto2DActionSheetPreview();
    return;
  }

  CORE_ACTION_IDS.forEach((actionId, index) => {
    const card = appRoot.querySelector<HTMLElement>(`[data-qa-action="${cssEscape(actionId)}"]`);
    const preview = card?.querySelector<HTMLImageElement>("img");
    const fallback = card?.querySelector<HTMLElement>(".photo-2d-qa-fallback");
    const frameCount = card?.querySelector<HTMLElement>("[data-qa-frame-count]");
    const closed = card?.querySelector<HTMLElement>("[data-qa-closed]");
    if (!card || !preview || !fallback || !frameCount || !closed) {
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      image,
      (index % 4) * cellWidth,
      Math.floor(index / 4) * cellHeight,
      cellWidth,
      cellHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );
    preview.src = canvas.toDataURL("image/png");
    preview.hidden = false;
    fallback.hidden = true;
    card.dataset.coverageState = "animated";
    card.dataset.reasonCode = "generated_action_preview_ready";
    frameCount.textContent = actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping" ? "6" : "3";
    closed.textContent = "true";
  });
}

function resetPhoto2DActionSheetPreview() {
  CORE_ACTION_IDS.forEach((actionId) => {
    const card = appRoot.querySelector<HTMLElement>(`[data-qa-action="${cssEscape(actionId)}"]`);
    const preview = card?.querySelector<HTMLImageElement>("img");
    const fallback = card?.querySelector<HTMLElement>(".photo-2d-qa-fallback");
    const frameCount = card?.querySelector<HTMLElement>("[data-qa-frame-count]");
    const closed = card?.querySelector<HTMLElement>("[data-qa-closed]");
    if (!card || !preview || !fallback || !frameCount || !closed) {
      return;
    }
    preview.removeAttribute("src");
    preview.hidden = true;
    fallback.hidden = false;
    card.dataset.coverageState = "fallback";
    card.dataset.reasonCode = "action_sheet_required";
    frameCount.textContent = "0";
    closed.textContent = "false";
  });
}

function selectedPhoto2DGenerationMode() {
  const selected = appRoot.querySelector<HTMLInputElement>("[name='photo-2d-generation-mode']:checked")?.value;
  if (selected === "host_image_tool_assisted" || selected === "provider_api" || selected === "local_action_sheet_import") {
    return selected;
  }
  return "none";
}

function photoIntakeEmptyState() {
  return `
    <p class="diagnostics-empty">选择本地照片或只填写 traits 后生成脱敏摘要。V7.1 不保存原图、源文件名、EXIF/GPS、完整路径，也不会上传。</p>
  `;
}

function photoIntakeOutput(session: PhotoIntakeSession) {
  const evidence = buildPhotoIntakeEvidenceSnapshot(session);
  return `
    <article class="guided-output-card">
      <header class="guided-output-header">
        <div>
          <h3>${escapeHtml(session.catName)} · ${escapeHtml(session.status)}</h3>
          <p>Reason：${escapeHtml(session.reasonCode)} · Photo：${escapeHtml(session.photoReferenceMode)}</p>
        </div>
        <span class="instance-badge">${session.status === "accepted" ? "Accepted" : "Rejected"}</span>
      </header>
      <div class="guided-output-grid">
        <section>
          <h4>用户确认 traits</h4>
          <p>${escapeHtml(session.approvedTraits)}</p>
        </section>
        <section>
          <h4>照片摘要</h4>
          <dl class="diagnostics-grid">
            <div><dt>Provided</dt><dd>${session.photoSummary.provided ? "yes" : "no"}</dd></div>
            <div><dt>Media</dt><dd>${escapeHtml(session.photoSummary.mediaType ?? "none")}</dd></div>
            <div><dt>Extension</dt><dd>${escapeHtml(session.photoSummary.extension ?? "none")}</dd></div>
            <div><dt>Size</dt><dd>${escapeHtml(session.photoSummary.sizeBucket ?? "none")}</dd></div>
          </dl>
        </section>
        <section>
          <h4>隐私边界</h4>
          <dl class="diagnostics-grid">
            ${Object.entries(session.privacyBoundary).map(([key, value]) => `
              <div><dt>${escapeHtml(key)}</dt><dd>${value ? "yes" : "no"}</dd></div>
            `).join("")}
          </dl>
        </section>
        <section>
          <h4>证据快照</h4>
          <pre>${escapeHtml(JSON.stringify(evidence, null, 2))}</pre>
        </section>
      </div>
    </article>
  `;
}

function localTraitPromptOutput(result: LocalTraitPromptPack) {
  if (result.status === "rejected" || !result.promptPack) {
    return `
      <article class="guided-output-card">
        <header class="guided-output-header">
          <div>
            <h3>${escapeHtml(result.traitMetadata.catName)} · rejected</h3>
            <p>Reason：${escapeHtml(result.reasonCode)}</p>
          </div>
          <span class="instance-badge">Rejected</span>
        </header>
        <p>请移除路径、URL、token、EXIF/GPS、provider credential 或其他非用户确认 traits。</p>
      </article>
    `;
  }
  const externalWorkflow = generateExternalGenerationInstructionWorkflowFromPromptPack(result);
  return `
    ${guidedAssetPromptOutput(result.promptPack)}
    <article class="guided-output-card local-trait-summary-card">
      <header class="guided-output-header">
        <div>
          <h3>V7.2 Trait Prompt Pack</h3>
          <p>Reason：${escapeHtml(result.reasonCode)} · Source：${escapeHtml(result.traitMetadata.source)}</p>
        </div>
        <span class="instance-badge">Accepted</span>
      </header>
      <div class="guided-output-grid">
        <section>
          <h4>用户确认 metadata</h4>
          <dl class="diagnostics-grid">
            <div><dt>Coat</dt><dd>${escapeHtml(result.traitMetadata.coat)}</dd></div>
            <div><dt>Markings</dt><dd>${escapeHtml(result.traitMetadata.markings)}</dd></div>
            <div><dt>Eyes</dt><dd>${escapeHtml(result.traitMetadata.eyes)}</dd></div>
            <div><dt>Tail</dt><dd>${escapeHtml(result.traitMetadata.tail)}</dd></div>
          </dl>
        </section>
        <section>
          <h4>Multi-view guidance</h4>
          <ol>
            ${result.multiViewGuidance.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ol>
        </section>
        <section>
          <h4>安全摘要</h4>
          <dl class="diagnostics-grid">
            ${Object.entries(result.safetySummary).map(([key, value]) => `
              <div><dt>${escapeHtml(key)}</dt><dd>${value ? "yes" : "no"}</dd></div>
            `).join("")}
          </dl>
        </section>
        <section>
          <h4>V7.3 外部生成说明</h4>
          <ol>
            ${externalWorkflow.instructionSteps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ol>
          <pre>${escapeHtml(externalWorkflow.copyText)}</pre>
        </section>
      </div>
    </article>
  `;
}

function guidedAssetPromptOutput(pack: ReturnType<typeof generateGuidedAssetPromptPack>) {
  return `
    <article class="guided-output-card">
      <header class="guided-output-header">
        <div>
          <h3>${escapeHtml(pack.catName)} · ${escapeHtml(pack.rendererTarget)}</h3>
	          <p>Pack ID：${escapeHtml(pack.packId)} · Actions：${pack.evidenceSummary.actionCount}/8 · Photo：${escapeHtml(pack.photoReferenceMode)}</p>
        </div>
        <span class="instance-badge">Local only</span>
      </header>
      <div class="guided-output-grid">
        <section>
          <h4>动作提示词</h4>
          ${Object.entries(pack.actionPrompts).map(([action, prompt]) => `
            <details>
              <summary>${escapeHtml(action)}</summary>
              <pre>${escapeHtml(prompt)}</pre>
            </details>
          `).join("")}
        </section>
        <section>
          <h4>Manifest 模板</h4>
          <pre>${escapeHtml(pack.manifestTemplate)}</pre>
        </section>
        <section>
          <h4>导入清单</h4>
          <ol>
            ${pack.importChecklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ol>
        </section>
	        <section>
	          <h4>安全边界</h4>
	          <dl class="diagnostics-grid">
	            <div><dt>Raw photo</dt><dd>${pack.evidenceSummary.storesRawPhoto ? "stored" : "not stored"}</dd></div>
	            <div><dt>Upload</dt><dd>${pack.evidenceSummary.uploadsByDefault ? "enabled" : "disabled"}</dd></div>
	            <div><dt>Provider</dt><dd>${pack.evidenceSummary.includesProviderCall ? "called" : "not called"}</dd></div>
	            <div><dt>Photo mode</dt><dd>${escapeHtml(pack.evidenceSummary.photoReferenceMode)}</dd></div>
	          </dl>
	          <ul>
	            ${pack.safetyNotes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
	          </ul>
        </section>
      </div>
    </article>
  `;
}

function providerBoundaryPanel() {
  const status = providerFeasibilityStatus();
  return `
    <article class="provider-boundary-card">
      <header class="guided-output-header">
        <div>
          <h3>Provider feasibility only</h3>
          <p>Upload：${status.uploadEnabled ? "enabled" : "disabled"} · Execution：${status.providerExecutionEnabled ? "enabled" : "disabled"} · Credential：${status.credentialAccepted ? "accepted" : "not accepted"}</p>
        </div>
        <span class="instance-badge">No upload</span>
      </header>
      <div class="guided-output-grid">
        <section>
          <h4>进入真实 provider smoke 前必须完成</h4>
          <ul>
            ${status.requiredGates.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </section>
        <section>
          <h4>同意与披露边界</h4>
          <ul>
            ${status.disclosures.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </section>
        <section>
          <h4>凭据与响应脱敏</h4>
          <ul>
            ${status.redactionRules.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </section>
        <section>
          <h4>当前禁止声明</h4>
          <ul>
            ${status.forbiddenClaims.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </section>
      </div>
    </article>
  `;
}

function codexWorkCatPanel(instances: PetInstance[], diagnosticsState: DiagnosticsViewState) {
  const target = instances.find((instance) => !instance.isDefault) ?? instances[0] ?? defaultPetInstance();
  const onboarding = createCodexWorkCatOnboarding(target.isDefault ? "Codex Work Cat" : target.displayName);
  const lastAccepted = diagnosticsState.diagnostics.lastAccepted;
  return `
    <article class="codex-work-cat-card">
      <header class="guided-output-header">
        <div>
          <h3>推荐路径：wrapper-launched exec JSONL</h3>
          <p>目标猫：${escapeHtml(target.displayName)} · ${escapeHtml(target.isDefault ? "未创建实例猫时会由 wrapper 创建" : "实例路由已可用")}</p>
        </div>
        <span class="instance-badge">Wrapper managed</span>
      </header>
      <div class="guided-output-grid">
        <section>
          <h4>可靠 JSONL 路径</h4>
          <p>${escapeHtml(onboarding.guidance.jsonl)}</p>
          ${quickCommand("复制 JSONL 启动命令", onboarding.jsonlCommand, "复制命令")}
        </section>
        <section>
          <h4>Managed TUI Hooks</h4>
          <p>${escapeHtml(onboarding.guidance.hooks)}</p>
          ${quickCommand("复制 TUI hooks 命令", onboarding.tuiHookCommand, "复制命令")}
        </section>
        <section>
          <h4>Already-open Codex window</h4>
          <p>${escapeHtml(onboarding.guidance.alreadyOpen)}</p>
          <dl class="diagnostics-grid">
            <div><dt>自动监听</dt><dd>unsupported</dd></div>
            <div><dt>推荐 fallback</dt><dd>wrapper JSONL / managed TUI hooks</dd></div>
          </dl>
        </section>
        <section>
          <h4>状态诊断</h4>
          <dl class="diagnostics-grid">
            <div><dt>Desktop health</dt><dd>${diagnosticsState.diagnostics.enabled ? "ok" : "unavailable"}</dd></div>
            <div><dt>Route</dt><dd>${escapeHtml(target.isDefault ? "wrapper-created" : "instance-aware")}</dd></div>
            <div><dt>JSONL</dt><dd>${escapeHtml(onboarding.diagnostics.jsonlStatus)}</dd></div>
            <div><dt>Hooks</dt><dd>${escapeHtml(onboarding.diagnostics.hookStatus)}</dd></div>
            <div><dt>Already-open</dt><dd>${escapeHtml(onboarding.diagnostics.alreadyOpenStatus)}</dd></div>
            <div><dt>Redaction</dt><dd>${escapeHtml(onboarding.diagnostics.redactionStatus)}</dd></div>
            <div class="diagnostics-wide"><dt>Last accepted event</dt><dd>${escapeHtml(lastAccepted?.level ?? "none")}</dd></div>
          </dl>
        </section>
      </div>
      <p class="diagnostics-empty">禁止声明：${onboarding.forbiddenClaims.map(escapeHtml).join("；")}。</p>
    </article>
  `;
}

function createReleaseDiagnosticsExport(
  diagnosticsState: DiagnosticsViewState,
  instances: PetInstance[],
  assetPacks: PersonalizedAssetPack[]
) {
  const diagnostics = diagnosticsState.diagnostics;
  return createSanitizedDiagnosticsExport({
    appEnabled: diagnostics.enabled,
    listenAddress: diagnostics.listenAddress,
    queueLength: diagnostics.queueLength,
    queueCapacity: diagnostics.queueCapacity,
    muted: diagnostics.sound.muted,
    instanceCount: instances.length,
    importedPackCount: assetPacks.length,
    lastAcceptedLevel: diagnostics.lastAccepted?.level ?? null,
    lastAcceptedSourceKind: diagnostics.lastAccepted?.sourceId ? "event-source" : null,
    lastRejectedReasonCode: diagnostics.lastRejected?.reasonCode ?? null
  });
}

function releaseFoundationPanel(diagnosticsExport: string) {
  const status = releaseFoundationStatus();
  const exportIsClean = !diagnosticsExportHasForbiddenContent(diagnosticsExport);
  return `
    <article class="release-foundation-card">
      <header class="guided-output-header">
        <div>
          <h3>${escapeHtml(status.productName)} · ${escapeHtml(status.version)}</h3>
          <p>${escapeHtml(status.bundleIdentifier)} · ${escapeHtml(status.buildFlavor)} · ${escapeHtml(status.artifactType)}</p>
        </div>
        <span class="instance-badge">${exportIsClean ? "Export clean" : "Export blocked"}</span>
      </header>
      <div class="guided-output-grid">
        <section>
          <h4>首次启动</h4>
          <ul>
            ${status.firstRunGuide.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </section>
        <section>
          <h4>权限说明</h4>
          <ul>
            ${status.permissionNotes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </section>
        <section>
          <h4>签名 / Notarization / 更新</h4>
          <ul>
            ${status.releaseChecklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </section>
        <section>
          <h4>诊断导出预览</h4>
          <p>这里只包含脱敏摘要；不会包含密钥、原始 payload、prompt、命令或本地完整路径。</p>
          <pre>${escapeHtml(diagnosticsExport)}</pre>
          ${quickCommand("复制诊断摘要", diagnosticsExport, "复制导出")}
        </section>
      </div>
      <p class="diagnostics-empty">禁止声明：${status.forbiddenClaims.map(escapeHtml).join("；")}。</p>
    </article>
  `;
}

function updateInstanceNameInSettings(instance: PetInstance) {
  const selector = cssEscape(instance.instanceId);
  const title = appRoot.querySelector<HTMLElement>(`[data-instance-title="${selector}"]`);
  const input = appRoot.querySelector<HTMLInputElement>(`[data-instance-name-input="${selector}"]`);
  const profileSelect = appRoot.querySelector<HTMLSelectElement>(`[data-instance-profile="${selector}"]`);
  if (title) {
    title.textContent = instance.displayName;
  }
  if (input) {
    input.value = instance.displayName;
    input.setAttribute("aria-label", `${instance.displayName} 的名称`);
  }
  if (profileSelect) {
    profileSelect.setAttribute("aria-label", `${instance.displayName} 的外观`);
  }
}

function setInstanceFeedback(instanceId: string, message: string, tone: "success" | "error" = "success") {
  const selector = cssEscape(instanceId);
  const feedback = appRoot.querySelector<HTMLElement>(`[data-instance-feedback="${selector}"]`);
  if (!feedback) {
    return;
  }
  feedback.textContent = message;
  feedback.classList.remove("is-success", "is-error");
  feedback.classList.add(tone === "error" ? "is-error" : "is-success");
  window.setTimeout(() => {
    if (feedback.isConnected && feedback.textContent === message) {
      feedback.textContent = "";
      feedback.classList.remove("is-success", "is-error");
    }
  }, INSTANCE_FEEDBACK_TIMEOUT_MS);
}

function cssEscape(value: string) {
  if ("CSS" in window && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/["\\]/g, "\\$&");
}

function defaultCatProfiles(): CatProfile[] {
  return [
    {
      id: DEFAULT_CAT_PROFILE_ID,
      name: "默认猫",
      description: "沉稳的灰蓝开发者猫。",
      cssClass: "cat-profile-default-cat",
      previewColor: "#8d99a8",
      builtIn: true
    }
  ];
}

function normalizeCatProfileId(catProfileId: string, profiles: CatProfile[]) {
  return profiles.some((profile) => profile.id === catProfileId)
    ? catProfileId
    : DEFAULT_CAT_PROFILE_ID;
}

function catProfileName(catProfileId: string, profiles: CatProfile[]) {
  const normalized = normalizeCatProfileId(catProfileId, profiles);
  return profiles.find((profile) => profile.id === normalized)?.name ?? "默认猫";
}

function catProfileClass(catProfileId: string, profiles: CatProfile[]) {
  const normalized = normalizeCatProfileId(catProfileId, profiles);
  return profiles.find((profile) => profile.id === normalized)?.cssClass ?? "cat-profile-default-cat";
}

function applyCatProfileClass(shell: HTMLElement | null, catProfileId: string, profiles: CatProfile[]) {
  if (!shell) {
    return;
  }
  shell.classList.remove(...profiles.map((profile) => profile.cssClass));
  shell.classList.add(catProfileClass(catProfileId, profiles));
}

function isValidDisplayName(value: string) {
  const trimmed = value.trim();
  return trimmed.length >= 1
    && trimmed.length <= 40
    && !/[\u0000-\u001F\u007F/\\:]/.test(trimmed)
    && !/(https?:\/\/|file:\/\/)/i.test(trimmed);
}

function displayNameValidationError(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 1) {
    return "名称不能为空。";
  }
  if (trimmed.length > 40) {
    return "名称不能超过 40 个字符。";
  }
  if (!isValidDisplayName(trimmed)) {
    return "名称包含不支持的字符。";
  }
  return null;
}

function instanceStateLabel(state: string) {
  const labels: Record<CatState, string> = {
    idle: "空闲",
    thinking: "思考中",
    running: "执行中",
    success: "完成",
    warning: "注意",
    error: "失败",
    need_input: "需要确认",
    sleeping: "休息中"
  };
  return isCatState(state) ? labels[state] : state;
}

function shouldAcceptPetEvent(instance: PetInstance, event: AcceptedPetEvent) {
  if (instance.isDefault) {
    return !event.targetInstanceId || event.targetInstanceId === "default";
  }
  return event.targetInstanceId === instance.instanceId;
}

function shortStateLabel(state: CatState) {
  const labels: Record<CatState, string> = {
    idle: "Idle",
    thinking: "Think",
    running: "Run",
    success: "OK",
    warning: "Warn",
    error: "Err",
    need_input: "Input",
    sleeping: "Sleep"
  };
  return labels[state];
}

function isCatState(value: SafeActionId | string): value is CatState {
  return value in CAT_STATE_CONFIG;
}

async function readDiagnosticsViewState(settings: AppSettings): Promise<DiagnosticsViewState> {
  try {
    const diagnostics = await getApiDebugState();
    return {
      diagnostics,
      tokenStatus: deriveTokenStatus(diagnostics),
      refreshedAt: new Date()
    };
  } catch (error) {
    return {
      diagnostics: fallbackDiagnostics(settings, userFacingError(error)),
      tokenStatus: "unreadable",
      refreshedAt: new Date(),
      error: userFacingError(error)
    };
  }
}

function deriveTokenStatus(diagnostics: BridgeDiagnostics): TokenStatus {
  const startupError = diagnostics.startupError?.toLowerCase() ?? "";
  if (
    startupError.includes("missing") ||
    startupError.includes("not found") ||
    startupError.includes("no such file")
  ) {
    return "missing";
  }
  if (startupError.includes("token") || startupError.includes("permission")) {
    return "unreadable";
  }
  return "configured";
}

function fallbackDiagnostics(settings: AppSettings, error: string): BridgeDiagnostics {
  return {
    enabled: false,
    listenAddress: "127.0.0.1:17321",
    queueLength: 0,
    queueCapacity: 32,
    acceptedEvents: [],
    rejectedEvents: [],
    lastAccepted: null,
    lastRejected: null,
    sound: {
      playbackAvailable: false,
      muted: settings.muted,
      cooldownMs: 1200,
      acceptedIds: ["none", "success_chime", "warning_chime", "error_chime", "need_input_chime"],
      lastDecision: null
    },
    hardwareLight: false,
    startupError: error
  };
}

function userFacingError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "string" && error) {
    return error;
  }
  return "无法加载诊断信息。";
}

function apiDebugSummary(state: DiagnosticsViewState) {
  if (state.error) {
    return `诊断刷新失败：${state.error}`;
  }
  const diagnostics = state.diagnostics;
  return `API ${diagnostics.enabled ? "已启用" : "已停用"}；${diagnostics.listenAddress}；队列 ${diagnostics.queueLength}/${diagnostics.queueCapacity}；token ${tokenStatusLabel(state.tokenStatus)}。`;
}

function diagnosticsPanel(viewState: DiagnosticsViewState) {
  const state = viewState.diagnostics;
  return `
    ${viewState.error ? `<p class="diagnostics-error">${escapeHtml(viewState.error)}</p>` : ""}
    <section class="diagnostics-block">
      <div class="diagnostics-block-heading">
        <h3>运行健康</h3>
        <p>上次刷新：${escapeHtml(formatDate(viewState.refreshedAt))}</p>
      </div>
      <dl class="diagnostics-grid">
        <div><dt>API 启用</dt><dd>${state.enabled ? "是" : "否"}</dd></div>
        <div><dt>监听地址</dt><dd>${escapeHtml(state.listenAddress)}</dd></div>
        <div><dt>队列</dt><dd>${state.queueLength}/${state.queueCapacity}</dd></div>
        <div><dt>硬件灯</dt><dd>${state.hardwareLight ? "已启用" : "未启用"}</dd></div>
        <div><dt>Token 状态</dt><dd>${tokenStatusLabel(viewState.tokenStatus)}</dd></div>
        <div><dt>启动状态</dt><dd>${state.startupError ? escapeHtml(state.startupError) : "正常"}</dd></div>
      </dl>
    </section>

    <section class="diagnostics-block">
      <div class="diagnostics-block-heading">
        <h3>声音</h3>
        <p>不会显示声音文件路径或 bundle 路径。</p>
      </div>
      <dl class="diagnostics-grid">
        <div><dt>可播放</dt><dd>${state.sound.playbackAvailable ? "是" : "否"}</dd></div>
        <div><dt>静音</dt><dd>${state.sound.muted ? "是" : "否"}</dd></div>
        <div><dt>冷却时间</dt><dd>${state.sound.cooldownMs}ms</dd></div>
        <div class="diagnostics-wide"><dt>允许的 ID</dt><dd>${state.sound.acceptedIds.map(escapeHtml).join(", ")}</dd></div>
      </dl>
      ${soundDecisionBlock(state.sound.lastDecision)}
    </section>

    <section class="diagnostics-block">
      <div class="diagnostics-block-heading">
        <h3>最近接收事件</h3>
        <p>这里只显示摘要，不保存原始 payload 和完整 metadata。</p>
      </div>
      ${eventTable(state.acceptedEvents, "accepted")}
    </section>

    <section class="diagnostics-block">
      <div class="diagnostics-block-heading">
        <h3>最近拒绝事件</h3>
        <p>不会显示非法 payload 原文。</p>
      </div>
      ${eventTable(state.rejectedEvents, "rejected")}
    </section>

    <section class="diagnostics-block">
      <div class="diagnostics-block-heading">
        <h3>快捷命令</h3>
        <p>仅提供复制示例，设置窗口不会执行命令。</p>
      </div>
      <div class="quick-command-list">
        ${quickCommand("健康检查", "curl http://127.0.0.1:17321/api/health")}
        ${quickCommand("能力列表", "curl http://127.0.0.1:17321/api/capabilities")}
        ${quickCommand("petctl success", "petctl notify --level success --title \"测试通过\" --sound success_chime")}
        ${quickCommand("Shell 示例", "examples/shell/task-with-pet.sh -- pnpm test")}
        ${quickCommand("Node 示例", "node examples/node/notify-pet.mjs success")}
      </div>
    </section>
  `;
}

function soundDecisionBlock(decision: BridgeDiagnostics["sound"]["lastDecision"]) {
  if (!decision) {
    return `<p class="diagnostics-empty">暂无声音决策</p>`;
  }
  return `
    <dl class="diagnostics-grid sound-decision-grid">
      <div><dt>最近声音</dt><dd>${escapeHtml(decision.sound)}</dd></div>
      <div><dt>已播放</dt><dd>${decision.played ? "是" : "否"}</dd></div>
      <div><dt>原因</dt><dd>${escapeHtml(decision.reason)}</dd></div>
      <div><dt>决策时间</dt><dd>${escapeHtml(formatTimestamp(decision.decidedAt))}</dd></div>
    </dl>
  `;
}

function eventTable(events: ApiEventSummary[], kind: "accepted" | "rejected") {
  if (events.length === 0) {
    return `<p class="diagnostics-empty">暂无${kind === "accepted" ? "接收" : "拒绝"}事件。</p>`;
  }
  const rows = events.slice(0, 10).map((event) => {
    if (kind === "accepted") {
      return `
        <tr>
          <td>${escapeHtml(formatTimestamp(event.receivedAt))}</td>
          <td>${escapeHtml(event.sourceId ?? "未知")}</td>
          <td>${escapeHtml(event.level ?? "")}</td>
          <td>${escapeHtml(event.titlePreview ?? "")}</td>
          <td>${escapeHtml(event.messagePreview ?? "")}</td>
          <td>${event.status}</td>
        </tr>
      `;
    }
    return `
      <tr>
        <td>${escapeHtml(formatTimestamp(event.receivedAt))}</td>
        <td>${escapeHtml(event.sourceId ?? "未知")}</td>
        <td>${escapeHtml(event.level ?? "")}</td>
        <td>${event.status}</td>
        <td>${escapeHtml(event.reasonCode ?? "")}</td>
        <td>${escapeHtml(event.reasonField ?? "")}</td>
        <td>${escapeHtml(event.reason ?? "")}</td>
      </tr>
    `;
  }).join("");

  return `
    <div class="diagnostics-table-wrap">
      <table class="diagnostics-table">
        <thead>
          ${kind === "accepted" ? `
            <tr><th>接收时间</th><th>来源</th><th>级别</th><th>标题摘要</th><th>消息摘要</th><th>状态码</th></tr>
          ` : `
            <tr><th>接收时间</th><th>来源</th><th>级别</th><th>状态码</th><th>原因码</th><th>字段</th><th>原因</th></tr>
          `}
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function quickCommand(label: string, command: string, copyLabel = "复制") {
  return `
    <div class="quick-command">
      <span>${escapeHtml(label)}</span>
      <code>${escapeHtml(command)}</code>
      <button class="copy-command" type="button" data-copy="${escapeHtml(command)}" data-copy-label="${escapeHtml(copyLabel)}">${escapeHtml(copyLabel)}</button>
    </div>
  `;
}

function setAssetImportFeedback(message: string, tone: "success" | "error" = "success") {
  const feedback = appRoot.querySelector<HTMLElement>("#asset-import-feedback");
  if (!feedback) {
    return;
  }
  feedback.textContent = message;
  feedback.classList.toggle("is-error", tone === "error");
}

function setAnimatedSpriteFeedback(message: string, tone: "success" | "error" = "success") {
  const feedback = appRoot.querySelector<HTMLElement>("#animated-sprite-feedback");
  if (!feedback) {
    return;
  }
  feedback.textContent = message;
  feedback.classList.toggle("is-error", tone === "error");
}

function animatedSpriteAssemblySummary(result: AnimatedSpriteAssemblyResult) {
  const actionCount = Object.keys(result.actionFrameCounts).length;
  const minFrames = Math.min(...Object.values(result.actionFrameCounts));
  const maxFrames = Math.max(...Object.values(result.actionFrameCounts));
  return `${actionCount} 个动作，${minFrames}-${maxFrames} 帧/动作，${result.fps} fps`;
}

function assetImportErrorMessage(error: unknown) {
  const reason = userFacingError(error);
  const messages: Record<string, string> = {
    import_cancelled: "已取消导入。",
    asset_manifest_not_found: "找不到 manifest 文件。",
    asset_manifest_invalid_json: "manifest 不是有效 JSON。",
    asset_manifest_schema_invalid: "manifest schemaVersion 不正确。",
    asset_pack_invalid: "资产包 ID 不合法。",
    asset_display_name_invalid: "资产包显示名称不合法。",
    asset_renderer_invalid: "rendererKind 必须是 sprite 或 gltf。",
    asset_license_missing: "manifest 缺少 license 信息。",
    core_action_missing: "manifest 缺少必要核心动作。",
    asset_missing: "动作引用的资产不存在。",
    asset_file_invalid: "资产文件名不安全或扩展名不匹配。",
    asset_file_not_found: "manifest 引用的资产文件不存在。",
    asset_manifest_forbidden_content: "manifest 包含不允许的路径、URL、脚本或敏感字段。",
    asset_pack_too_large: "资产包超过本地导入限制。",
    asset_symlink_rejected: "资产文件不能是符号链接。",
    asset_frame_corrupt: "Sprite 帧不是有效 PNG。",
    gltf_external_resource_rejected: "GLTF/GLB 包含外部资源或不安全 URI。",
    gltf_required_extension_rejected: "GLTF/GLB 包含未允许的 required extension。",
    asset_import_copy_failed: "导入复制失败，当前资产状态未改变。",
    animated_sprite_source_missing: "找不到多帧 sprite 源目录。",
    animated_sprite_core_action_missing: "源目录缺少必要核心动作帧。",
    animated_sprite_frame_count_invalid: "每个核心动作需要 2 到 48 帧。",
    animated_sprite_frame_name_invalid: "帧文件名不符合 action-000.png 格式。",
    animated_sprite_fps_invalid: "FPS 必须在 1 到 24 之间。",
    animated_sprite_activation_failed: "资产已导入，但激活到目标猫失败。请确认目标实例仍存在。"
  };
  return messages[reason] ?? reason;
}

function assetActivationErrorMessage(error: unknown) {
  const reason = userFacingError(error);
  const messages: Record<string, string> = {
    instance_id_invalid: "实例 ID 不合法。",
    instance_not_found: "找不到目标猫实例。",
    asset_pack_invalid: "资产包 ID 不合法。",
    asset_pack_not_found: "找不到资产包。",
    asset_renderer_mismatch: "资产包 renderer 记录不一致。",
    asset_file_not_found: "资产包文件缺失，已保留当前渲染。",
    asset_frame_corrupt: "Sprite 帧损坏，已保留当前渲染。",
    gltf_external_resource_rejected: "GLTF/GLB 未通过运行前安全扫描。",
    gltf_required_extension_rejected: "GLTF/GLB 包含未允许的 required extension。",
    asset_pack_too_large: "资产包超过运行限制。"
  };
  return messages[reason] ?? reason;
}

function firstRunErrorMessage(error: unknown) {
  const reason = userFacingError(error);
  const messages: Record<string, string> = {
    instance_limit_reached: "已达到桌宠数量上限，请先移除不用的猫。",
    instance_id_invalid: "目标猫实例不合法。",
    instance_not_found: "找不到目标猫实例。",
    target_not_visible: "目标猫当前不可见，请先显示后再测试。",
    target_window_not_found: "目标猫窗口未打开，请重新显示该猫。",
    emit_failed: "测试反应发送失败，请稍后重试。",
    level_invalid: "测试状态不合法。",
    bundled_pack_invalid: "内置猫资产包不合法。"
  };
  return messages[reason] ?? "首次上手流程失败，请重试。";
}

function assetDeleteErrorMessage(error: unknown) {
  const reason = userFacingError(error);
  const messages: Record<string, string> = {
    asset_pack_invalid: "资产包 ID 不合法。",
    asset_pack_not_found: "资产包不存在或已删除。",
    asset_delete_failed: "资产包删除失败。"
  };
  return messages[reason] ?? reason;
}

function attachCopyButtons(root: ParentNode) {
  root.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copy ?? "";
      const originalLabel = button.dataset.copyLabel ?? button.textContent ?? "复制";
      try {
        await navigator.clipboard.writeText(value);
        button.textContent = "已复制";
        window.setTimeout(() => {
          button.textContent = originalLabel;
        }, 1000);
      } catch {
        button.textContent = "复制失败";
        window.setTimeout(() => {
          button.textContent = originalLabel;
        }, 1400);
      }
    });
  });
}

function tokenStatusLabel(status: TokenStatus) {
  const labels: Record<TokenStatus, string> = {
    configured: "已配置",
    missing: "缺失",
    unreadable: "不可读取"
  };
  return labels[status];
}

function formatDate(date: Date) {
  return date.toLocaleString(undefined, {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function formatTimestamp(value: string) {
  const millis = Number(value);
  if (!Number.isFinite(millis) || millis <= 0) {
    return value;
  }
  return new Date(millis).toLocaleTimeString(undefined, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    };
    return entities[char] ?? char;
  });
}
