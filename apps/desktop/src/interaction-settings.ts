import type { CatState } from "./pet-states";
import type { RuntimeMicroInteractionSnapshot, RuntimeMicroInteractionType } from "./runtime-micro-interactions";

export type InteractionFrequency = "low" | "normal" | "lively";
export type MotionIntensity = "subtle" | "normal" | "expressive";

export type InteractionSettings = {
  autonomousWalk: boolean;
  pointerReactions: boolean;
  clickReactions: boolean;
  dragPhysics: boolean;
  quietMode: boolean;
  interactionFrequency: InteractionFrequency;
  motionIntensity: MotionIntensity;
};

export type InteractionPreviewKind =
  | "drag"
  | "pointer_near"
  | "pointer_hover"
  | "click"
  | "double_click"
  | "autonomous_walk"
  | "quiet_mode";

export type WindowPositionLike = {
  x: number;
  y: number;
};

export type SafeDesktopBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type AutonomousWalkDecision = {
  active: boolean;
  position: WindowPositionLike;
  visual: Extract<RuntimeMicroInteractionType, "walk_left" | "walk_right" | "turn" | "edge_avoid"> | "none";
  direction: -1 | 1;
  reasonCode:
    | "walk_waiting"
    | "walk_disabled"
    | "walk_quiet_mode"
    | "walk_priority_blocked"
    | "walk_step"
    | "walk_turn"
    | "walk_edge_avoid";
  emitsPetEvent: false;
  writesCatStateMachine: false;
};

export type InteractionPreviewSnapshot = {
  kind: InteractionPreviewKind;
  microInteraction: RuntimeMicroInteractionType | "none";
  active: boolean;
  reasonCode: string;
  settings: InteractionSettings;
  mutatesLivePetInstance: false;
  emitsPetEvent: false;
  writesCatStateMachine: false;
};

export const INTERACTION_SETTINGS_STORAGE_KEY = "agentDesktopPet.interactionSettings.v15";

export const DEFAULT_INTERACTION_SETTINGS: InteractionSettings = {
  autonomousWalk: true,
  pointerReactions: true,
  clickReactions: true,
  dragPhysics: true,
  quietMode: false,
  interactionFrequency: "normal",
  motionIntensity: "normal"
};

const FREQUENCY_INTERVAL_MS: Record<InteractionFrequency, number> = {
  low: 9_000,
  normal: 5_500,
  lively: 3_200
};

const INTENSITY_STEP_PX: Record<MotionIntensity, number> = {
  subtle: 10,
  normal: 18,
  expressive: 28
};

export function sanitizeInteractionSettings(value: unknown): InteractionSettings {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_INTERACTION_SETTINGS };
  }
  const input = value as Partial<InteractionSettings>;
  return {
    autonomousWalk: sanitizeBoolean(input.autonomousWalk, DEFAULT_INTERACTION_SETTINGS.autonomousWalk),
    pointerReactions: sanitizeBoolean(input.pointerReactions, DEFAULT_INTERACTION_SETTINGS.pointerReactions),
    clickReactions: sanitizeBoolean(input.clickReactions, DEFAULT_INTERACTION_SETTINGS.clickReactions),
    dragPhysics: sanitizeBoolean(input.dragPhysics, DEFAULT_INTERACTION_SETTINGS.dragPhysics),
    quietMode: sanitizeBoolean(input.quietMode, DEFAULT_INTERACTION_SETTINGS.quietMode),
    interactionFrequency: isInteractionFrequency(input.interactionFrequency) ? input.interactionFrequency : DEFAULT_INTERACTION_SETTINGS.interactionFrequency,
    motionIntensity: isMotionIntensity(input.motionIntensity) ? input.motionIntensity : DEFAULT_INTERACTION_SETTINGS.motionIntensity
  };
}

export function readInteractionSettings(storage: Pick<Storage, "getItem"> = window.localStorage): InteractionSettings {
  try {
    const raw = storage.getItem(INTERACTION_SETTINGS_STORAGE_KEY);
    return sanitizeInteractionSettings(raw ? JSON.parse(raw) : undefined);
  } catch {
    return { ...DEFAULT_INTERACTION_SETTINGS };
  }
}

export function writeInteractionSettings(
  settings: InteractionSettings,
  storage: Pick<Storage, "setItem"> = window.localStorage
): InteractionSettings {
  const safe = sanitizeInteractionSettings(settings);
  storage.setItem(INTERACTION_SETTINGS_STORAGE_KEY, JSON.stringify(safe));
  return safe;
}

export function clampPositionToBounds(position: WindowPositionLike, bounds: SafeDesktopBounds): WindowPositionLike {
  return {
    x: Math.round(clamp(position.x, bounds.minX, bounds.maxX)),
    y: Math.round(clamp(position.y, bounds.minY, bounds.maxY))
  };
}

export class AutonomousWalkController {
  private nextWalkAt: number;
  private direction: -1 | 1 = 1;

  constructor(private readonly now: () => number = () => Date.now()) {
    this.nextWalkAt = this.now() + FREQUENCY_INTERVAL_MS.normal;
  }

  tick(options: {
    baseState: CatState;
    interaction: RuntimeMicroInteractionSnapshot;
    settings: InteractionSettings;
    position: WindowPositionLike;
    bounds: SafeDesktopBounds;
  }): AutonomousWalkDecision {
    const settings = sanitizeInteractionSettings(options.settings);
    const position = clampPositionToBounds(options.position, options.bounds);

    if (!settings.autonomousWalk) {
      this.schedule(settings);
      return this.decision(false, position, "none", "walk_disabled");
    }
    if (settings.quietMode) {
      this.schedule(settings);
      return this.decision(false, position, "none", "walk_quiet_mode");
    }
    if (!canAutonomousWalkRun(options.baseState, options.interaction)) {
      this.schedule(settings);
      return this.decision(false, position, "none", "walk_priority_blocked");
    }
    if (this.now() < this.nextWalkAt) {
      return this.decision(false, position, "none", "walk_waiting");
    }

    const step = INTENSITY_STEP_PX[settings.motionIntensity];
    const candidate = clampPositionToBounds({ x: position.x + this.direction * step, y: position.y }, options.bounds);
    const hitEdge = candidate.x === position.x;
    if (hitEdge) {
      this.direction = this.direction === 1 ? -1 : 1;
      this.schedule(settings);
      return this.decision(true, position, "edge_avoid", "walk_edge_avoid");
    }

    const visual = this.direction === 1 ? "walk_right" : "walk_left";
    this.schedule(settings);
    return this.decision(true, candidate, visual, "walk_step");
  }

  private schedule(settings: InteractionSettings) {
    this.nextWalkAt = this.now() + FREQUENCY_INTERVAL_MS[settings.interactionFrequency];
  }

  private decision(
    active: boolean,
    position: WindowPositionLike,
    visual: AutonomousWalkDecision["visual"],
    reasonCode: AutonomousWalkDecision["reasonCode"]
  ): AutonomousWalkDecision {
    return {
      active,
      position,
      visual,
      direction: this.direction,
      reasonCode,
      emitsPetEvent: false,
      writesCatStateMachine: false
    };
  }
}

export function buildInteractionPreviewSnapshot(kind: InteractionPreviewKind, settings: InteractionSettings): InteractionPreviewSnapshot {
  const safeSettings = sanitizeInteractionSettings(settings);
  const microInteraction = previewMicroInteraction(kind, safeSettings);
  return {
    kind,
    microInteraction,
    active: microInteraction !== "none",
    reasonCode: kind === "quiet_mode" || safeSettings.quietMode ? "preview_quiet_mode_safe" : "preview_interaction_safe",
    settings: safeSettings,
    mutatesLivePetInstance: false,
    emitsPetEvent: false,
    writesCatStateMachine: false
  };
}

function canAutonomousWalkRun(baseState: CatState, interaction: RuntimeMicroInteractionSnapshot) {
  if (baseState === "error" || baseState === "need_input" || baseState === "running" || baseState === "thinking") {
    return false;
  }
  return !(
    interaction.microInteraction === "drag"
    || interaction.microInteraction === "drag_start"
    || interaction.microInteraction === "dragging"
    || interaction.microInteraction === "drag_release"
    || interaction.microInteraction === "drag_land"
    || interaction.microInteraction === "click"
    || interaction.microInteraction === "double_click"
  );
}

function previewMicroInteraction(kind: InteractionPreviewKind, settings: InteractionSettings): RuntimeMicroInteractionType | "none" {
  if (kind === "quiet_mode" || settings.quietMode) {
    return "idle_settle";
  }
  if (kind === "drag") return settings.dragPhysics ? "drag_grabbed" : "none";
  if (kind === "pointer_near") return settings.pointerReactions ? "pointer_look" : "none";
  if (kind === "pointer_hover") return settings.pointerReactions ? "pointer_ear_twitch" : "none";
  if (kind === "click") return settings.clickReactions ? "click_paw" : "none";
  if (kind === "double_click") return settings.clickReactions ? "double_click_jump" : "none";
  if (kind === "autonomous_walk") return settings.autonomousWalk ? "walk_right" : "none";
  return "none";
}

function sanitizeBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function isInteractionFrequency(value: unknown): value is InteractionFrequency {
  return value === "low" || value === "normal" || value === "lively";
}

function isMotionIntensity(value: unknown): value is MotionIntensity {
  return value === "subtle" || value === "normal" || value === "expressive";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
