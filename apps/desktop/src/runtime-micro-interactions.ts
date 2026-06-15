import type { CatState } from "./pet-states";
import type { PlaybackIntent, RendererKind, SafeActionId } from "./assets/asset-manifest";

export type RuntimeMicroInteractionType =
  | "idle_blink"
  | "idle_look_left"
  | "idle_look_right"
  | "idle_tail_sway"
  | "idle_stretch"
  | "idle_settle"
  | "idle_nap"
  | "idle_wake"
  | "pointer_near"
  | "pointer_leave"
  | "pointer_look"
  | "pointer_hover"
  | "pointer_ear_twitch"
  | "pointer_tail_focus"
  | "click"
  | "click_paw"
  | "click_blink"
  | "double_click"
  | "double_click_jump"
  | "double_click_roll"
  | "double_click_play"
  | "drag"
  | "drag_start"
  | "drag_grabbed"
  | "dragging"
  | "drop"
  | "drag_release"
  | "drag_land"
  | "walk_left"
  | "walk_right"
  | "turn"
  | "edge_avoid";

export type RuntimeMicroInteractionSnapshot = {
  baseState: CatState;
  displayState: CatState;
  microInteraction: RuntimeMicroInteractionType | "none";
  active: boolean;
  reasonCode:
    | "base_state"
    | "idle_random_active"
    | "idle_repetition_guard"
    | "idle_priority_blocked"
    | "idle_nap_active"
    | "idle_wake_active"
    | "pointer_near_active"
    | "pointer_hover_active"
    | "pointer_leave_returned"
    | "click_active"
    | "double_click_active"
    | "drag_active"
    | "drag_start_active"
    | "dragging_active"
    | "drop_active"
    | "drag_release_active"
    | "drag_land_active"
    | "autonomous_walk_active"
    | "autonomous_walk_turn"
    | "autonomous_walk_blocked"
    | "priority_state_blocks_micro"
    | "priority_state_blocks_pointer"
    | "success_transient"
    | "interaction_active"
    | "interaction_cancelled_by_drag"
    | "interaction_expired"
    | "micro_expired";
  emitsPetEvent: false;
  writesCatStateMachine: false;
};

export type RuntimeSafeRendererInput = {
  actionId: SafeActionId;
  rendererKind: RendererKind | "runtime-selected";
  packId: string;
  playbackIntent: PlaybackIntent;
  scale: number | "runtime-scale";
  visibility: boolean | "runtime-visibility";
};

export type RuntimeMicroInteractionControllerOptions = {
  now?: () => number;
  idleIntervalMs?: number;
  clickDurationMs?: number;
  doubleClickDurationMs?: number;
  pointerNearDurationMs?: number;
  pointerHoverDurationMs?: number;
  pointerLeaveDurationMs?: number;
  dragStartDurationMs?: number;
  dropDurationMs?: number;
  walkDurationMs?: number;
  idleActionDurationMs?: number;
  napThresholdMs?: number;
};

export const V15_INTERACTION_PRIORITY_ORDER = [
  "error",
  "need_input",
  "drag",
  "double_click",
  "click",
  "success transient",
  "running",
  "thinking",
  "pointer_near",
  "idle random"
] as const;

export const V15_REQUIRED_SAFE_ACTION_IDS = [
  "idle_blink",
  "idle_look_left",
  "idle_look_right",
  "idle_tail_sway",
  "idle_stretch",
  "idle_settle",
  "idle_nap",
  "idle_wake",
  "pointer_look",
  "click_paw",
  "double_click_jump",
  "drag_grabbed",
  "dragging",
  "drag_release",
  "drag_land",
  "walk_left",
  "walk_right",
  "turn",
  "edge_avoid"
] as const satisfies readonly SafeActionId[];

const PRIORITY_BLOCKING_STATES = new Set<CatState>(["error", "need_input"]);
const IDLE_MICRO_SEQUENCE: RuntimeMicroInteractionType[] = [
  "idle_blink",
  "idle_look_left",
  "idle_tail_sway",
  "idle_look_right",
  "idle_stretch",
  "idle_settle"
];

export class RuntimeMicroInteractionController {
  private readonly now: () => number;
  private readonly idleIntervalMs: number;
  private readonly clickDurationMs: number;
  private readonly doubleClickDurationMs: number;
  private readonly pointerNearDurationMs: number;
  private readonly pointerHoverDurationMs: number;
  private readonly pointerLeaveDurationMs: number;
  private readonly dragStartDurationMs: number;
  private readonly dropDurationMs: number;
  private readonly walkDurationMs: number;
  private readonly idleActionDurationMs: number;
  private readonly napThresholdMs: number;
  private readonly dragReleaseDurationMs: number;
  private readonly dragLandDurationMs: number;
  private baseState: CatState = "idle";
  private activeMicro: RuntimeMicroInteractionType | undefined;
  private activeUntil = 0;
  private nextIdleAt: number;
  private idleStartedAt: number;
  private idleIndex = 0;
  private repeatedIdleAction: RuntimeMicroInteractionType | undefined;
  private repeatedIdleCount = 0;
  private napActive = false;

  constructor(options: RuntimeMicroInteractionControllerOptions = {}) {
    this.now = options.now ?? (() => Date.now());
    this.idleIntervalMs = clampMs(options.idleIntervalMs, 1_000, 30_000, 8_000);
    this.clickDurationMs = clampMs(options.clickDurationMs, 300, 1_200, 650);
    this.doubleClickDurationMs = clampMs(options.doubleClickDurationMs, 300, 1_800, 900);
    this.pointerNearDurationMs = clampMs(options.pointerNearDurationMs, 300, 2_000, 800);
    this.pointerHoverDurationMs = clampMs(options.pointerHoverDurationMs, 400, 2_400, 1_100);
    this.pointerLeaveDurationMs = clampMs(options.pointerLeaveDurationMs, 150, 1_200, 350);
    this.dragStartDurationMs = clampMs(options.dragStartDurationMs, 150, 1_000, 300);
    this.dropDurationMs = clampMs(options.dropDurationMs, 250, 1_400, 650);
    this.dragReleaseDurationMs = Math.max(150, Math.round(this.dropDurationMs * 0.45));
    this.dragLandDurationMs = Math.max(200, this.dropDurationMs - this.dragReleaseDurationMs);
    this.walkDurationMs = clampMs(options.walkDurationMs, 400, 2_400, 950);
    this.idleActionDurationMs = clampMs(options.idleActionDurationMs, 400, 2_000, 900);
    this.napThresholdMs = clampMs(options.napThresholdMs, 45_000, 300_000, 90_000);
    const now = this.now();
    this.nextIdleAt = now + this.idleIntervalMs;
    this.idleStartedAt = now;
  }

  setBaseState(state: CatState) {
    const previousState = this.baseState;
    this.baseState = state;
    if (previousState !== state && (state === "idle" || state === "sleeping")) {
      this.idleStartedAt = this.now();
      this.nextIdleAt = this.now() + this.idleIntervalMs;
      this.napActive = state === "sleeping";
    }
    if (state !== "idle" && state !== "sleeping" && this.isIdleMicro(this.activeMicro)) {
      this.clearMicro();
    }
    if (PRIORITY_BLOCKING_STATES.has(state)) {
      this.clearMicro();
      this.napActive = false;
    }
  }

  maybeStartIdleRandom() {
    const now = this.now();
    if (!this.canRunIdle(now)) {
      return this.snapshot();
    }
    if (this.shouldEnterNap(now)) {
      this.napActive = true;
      this.activeMicro = "idle_nap";
      this.activeUntil = Number.POSITIVE_INFINITY;
      this.nextIdleAt = now + this.idleIntervalMs;
      return this.snapshot();
    }
    if (this.napActive) {
      return this.snapshotFor("idle_nap", "sleeping", "idle_nap_active");
    }
    this.activeMicro = IDLE_MICRO_SEQUENCE[this.idleIndex % IDLE_MICRO_SEQUENCE.length];
    if (this.repeatedIdleAction === this.activeMicro && this.repeatedIdleCount >= 2) {
      this.idleIndex += 1;
      this.activeMicro = IDLE_MICRO_SEQUENCE[this.idleIndex % IDLE_MICRO_SEQUENCE.length];
    }
    this.recordIdleAction(this.activeMicro);
    this.idleIndex += 1;
    this.activeUntil = now + this.idleActionDurationMs;
    this.nextIdleAt = now + this.idleIntervalMs;
    return this.snapshot();
  }

  startPointerNear() {
    if (this.isDragMicro(this.activeMicro)) {
      return this.snapshot();
    }
    if (PRIORITY_BLOCKING_STATES.has(this.baseState)) {
      return this.snapshotFor("none", this.baseState, "priority_state_blocks_pointer");
    }
    if (this.napActive || this.baseState === "sleeping") {
      this.napActive = false;
      this.activeMicro = "idle_wake";
      this.activeUntil = this.now() + this.pointerNearDurationMs;
      this.idleStartedAt = this.now();
      this.nextIdleAt = this.now() + this.idleIntervalMs;
      return this.snapshot();
    }
    if (this.activeMicro) {
      return this.snapshot();
    }
    this.activeMicro = "pointer_near";
    this.activeUntil = this.now() + this.pointerNearDurationMs;
    return this.snapshot();
  }

  startPointerLeave() {
    if (this.isDragMicro(this.activeMicro)) {
      return this.snapshot();
    }
    if (PRIORITY_BLOCKING_STATES.has(this.baseState)) {
      return this.snapshotFor("none", this.baseState, "priority_state_blocks_pointer");
    }
    if (this.activeMicro === "pointer_near") {
      this.clearMicro();
    }
    this.activeMicro = "pointer_leave";
    this.activeUntil = this.now() + this.pointerLeaveDurationMs;
    return this.snapshot();
  }

  startPointerHover() {
    if (this.isDragMicro(this.activeMicro)) {
      return this.snapshot();
    }
    if (PRIORITY_BLOCKING_STATES.has(this.baseState)) {
      return this.snapshotFor("none", this.baseState, "priority_state_blocks_pointer");
    }
    if (this.activeMicro && this.activeMicro !== "pointer_near" && this.activeMicro !== "pointer_leave") {
      return this.snapshot();
    }
    this.napActive = false;
    this.activeMicro = "pointer_hover";
    this.activeUntil = this.now() + this.pointerHoverDurationMs;
    return this.snapshot();
  }

  startClick() {
    if (this.isDragMicro(this.activeMicro)) {
      return this.snapshot();
    }
    if (PRIORITY_BLOCKING_STATES.has(this.baseState)) {
      return this.snapshotFor("none", this.baseState, "priority_state_blocks_pointer");
    }
    this.napActive = false;
    this.activeMicro = "click";
    this.activeUntil = this.now() + this.clickDurationMs;
    return this.snapshot();
  }

  startDoubleClick() {
    if (this.isDragMicro(this.activeMicro)) {
      return this.snapshot();
    }
    if (PRIORITY_BLOCKING_STATES.has(this.baseState)) {
      return this.snapshotFor("none", this.baseState, "priority_state_blocks_pointer");
    }
    this.napActive = false;
    this.activeMicro = "double_click";
    this.activeUntil = this.now() + this.doubleClickDurationMs;
    return this.snapshot();
  }

  startDragStart() {
    if (PRIORITY_BLOCKING_STATES.has(this.baseState)) {
      return this.snapshotFor("none", this.baseState, "priority_state_blocks_pointer");
    }
    this.napActive = false;
    this.activeMicro = "drag_start";
    this.activeUntil = this.now() + this.dragStartDurationMs;
    return this.snapshot();
  }

  startDragging() {
    if (PRIORITY_BLOCKING_STATES.has(this.baseState)) {
      return this.snapshotFor("none", this.baseState, "priority_state_blocks_pointer");
    }
    this.napActive = false;
    this.activeMicro = "dragging";
    this.activeUntil = Number.POSITIVE_INFINITY;
    return this.snapshot();
  }

  startDrag() {
    if (PRIORITY_BLOCKING_STATES.has(this.baseState)) {
      return this.snapshotFor("none", this.baseState, "priority_state_blocks_pointer");
    }
    this.napActive = false;
    this.activeMicro = "drag";
    this.activeUntil = Number.POSITIVE_INFINITY;
    return this.snapshot();
  }

  stopDrag() {
    if (this.isDragMicro(this.activeMicro)) {
      this.activeMicro = "drag_release";
      this.activeUntil = this.now() + this.dragReleaseDurationMs;
    }
    return this.snapshot();
  }

  startAutonomousWalk(direction: "walk_left" | "walk_right" | "turn" | "edge_avoid") {
    if (PRIORITY_BLOCKING_STATES.has(this.baseState)) {
      return this.snapshotFor("none", this.baseState, "autonomous_walk_blocked");
    }
    if (this.activeMicro && (this.isDragMicro(this.activeMicro) || this.activeMicro === "click" || this.activeMicro === "double_click")) {
      const snapshot = this.snapshot();
      return this.snapshotFor(snapshot.microInteraction, snapshot.displayState, "autonomous_walk_blocked");
    }
    this.napActive = false;
    this.activeMicro = direction;
    this.activeUntil = this.now() + this.walkDurationMs;
    return this.snapshot();
  }

  snapshot(): RuntimeMicroInteractionSnapshot {
    const now = this.now();
    if (this.activeMicro === "drag_release" && now >= this.activeUntil) {
      this.activeMicro = "drag_land";
      this.activeUntil = now + this.dragLandDurationMs;
      return this.snapshotFor("drag_land", this.baseState, "drag_land_active");
    }
    if (this.activeMicro && this.activeMicro !== "drag" && this.activeMicro !== "dragging" && now >= this.activeUntil) {
      const expiredSnapshot = this.snapshotFor("none", this.baseState, this.activeMicro === "drop" || this.activeMicro === "drag_land" ? "interaction_expired" : "micro_expired");
      this.clearMicro();
      return expiredSnapshot;
    }

    if (PRIORITY_BLOCKING_STATES.has(this.baseState)) {
      return this.snapshotFor("none", this.baseState, "priority_state_blocks_micro");
    }

    if (this.napActive && !this.activeMicro && (this.baseState === "idle" || this.baseState === "sleeping")) {
      return this.snapshotFor("idle_nap", "sleeping", "idle_nap_active");
    }
    if (this.activeMicro === "drag") {
      return this.snapshotFor("drag", "running", "drag_active");
    }
    if (this.activeMicro === "drag_start") {
      return this.snapshotFor("drag_start", "running", "drag_start_active");
    }
    if (this.activeMicro === "dragging") {
      return this.snapshotFor("dragging", "running", "dragging_active");
    }
    if (this.activeMicro === "drop") {
      return this.snapshotFor("drop", this.baseState, "drop_active");
    }
    if (this.activeMicro === "drag_release") {
      return this.snapshotFor("drag_release", this.baseState, "drag_release_active");
    }
    if (this.activeMicro === "drag_land") {
      return this.snapshotFor("drag_land", this.baseState, "drag_land_active");
    }
    if (this.activeMicro === "double_click") {
      return this.snapshotFor("double_click", "success", "double_click_active");
    }
    if (this.activeMicro === "click") {
      return this.snapshotFor("click", "success", "click_active");
    }
    if (this.activeMicro === "pointer_near") {
      return this.snapshotFor("pointer_near", this.baseState === "sleeping" ? "idle" : this.baseState, "pointer_near_active");
    }
    if (this.activeMicro === "pointer_hover") {
      return this.snapshotFor("pointer_hover", this.baseState === "sleeping" ? "idle" : this.baseState, "pointer_hover_active");
    }
    if (this.activeMicro === "pointer_leave") {
      return this.snapshotFor("pointer_leave", this.baseState, "pointer_leave_returned");
    }
    if (this.activeMicro === "walk_left" || this.activeMicro === "walk_right") {
      return this.snapshotFor(this.activeMicro, "running", "autonomous_walk_active");
    }
    if (this.activeMicro === "turn" || this.activeMicro === "edge_avoid") {
      return this.snapshotFor(this.activeMicro, "idle", "autonomous_walk_turn");
    }
    if (this.activeMicro === "idle_wake") {
      return this.snapshotFor("idle_wake", "idle", "idle_wake_active");
    }
    if (this.isIdleMicro(this.activeMicro)) {
      if (this.activeMicro === "idle_nap") {
        return this.snapshotFor("idle_nap", "sleeping", "idle_nap_active");
      }
      return this.snapshotFor(this.activeMicro, "idle", "idle_random_active");
    }
    if (this.baseState === "success") {
      return this.snapshotFor("none", "success", "success_transient");
    }
    return this.snapshotFor("none", this.baseState, "base_state");
  }

  private clearMicro() {
    this.activeMicro = undefined;
    this.activeUntil = 0;
  }

  private canRunIdle(now: number) {
    if ((this.baseState !== "idle" && this.baseState !== "sleeping") || now < this.nextIdleAt) {
      return false;
    }
    if (this.activeMicro) {
      return false;
    }
    if (PRIORITY_BLOCKING_STATES.has(this.baseState)) {
      return false;
    }
    return true;
  }

  private shouldEnterNap(now: number) {
    return this.baseState === "idle" && !this.napActive && now - this.idleStartedAt >= this.napThresholdMs;
  }

  private recordIdleAction(action: RuntimeMicroInteractionType) {
    if (this.repeatedIdleAction === action) {
      this.repeatedIdleCount += 1;
      return;
    }
    this.repeatedIdleAction = action;
    this.repeatedIdleCount = 1;
  }

  private isIdleMicro(value: RuntimeMicroInteractionType | undefined): value is
    | "idle_blink"
    | "idle_look_left"
    | "idle_look_right"
    | "idle_tail_sway"
    | "idle_stretch"
    | "idle_settle"
    | "idle_nap"
    | "idle_wake" {
    return value === "idle_blink"
      || value === "idle_look_left"
      || value === "idle_look_right"
      || value === "idle_tail_sway"
      || value === "idle_stretch"
      || value === "idle_settle"
      || value === "idle_nap"
      || value === "idle_wake";
  }

  private isDragMicro(value: RuntimeMicroInteractionType | undefined): value is "drag" | "drag_start" | "dragging" | "drop" | "drag_release" | "drag_land" {
    return value === "drag"
      || value === "drag_start"
      || value === "dragging"
      || value === "drop"
      || value === "drag_release"
      || value === "drag_land";
  }

  private snapshotFor(
    microInteraction: RuntimeMicroInteractionSnapshot["microInteraction"],
    displayState: CatState,
    reasonCode: RuntimeMicroInteractionSnapshot["reasonCode"]
  ): RuntimeMicroInteractionSnapshot {
    return {
      baseState: this.baseState,
      displayState,
      microInteraction,
      active: microInteraction !== "none",
      reasonCode,
      emitsPetEvent: false,
      writesCatStateMachine: false
    };
  }
}

export function snapshotToSafeRendererInput(
  snapshot: RuntimeMicroInteractionSnapshot,
  options: {
    rendererKind?: RendererKind | "runtime-selected";
    packId?: string;
    scale?: number | "runtime-scale";
    visibility?: boolean | "runtime-visibility";
  } = {}
): RuntimeSafeRendererInput {
  const actionId = safeActionForSnapshot(snapshot);
  return {
    actionId,
    rendererKind: options.rendererKind ?? "runtime-selected",
    packId: options.packId ?? "runtime-active-pack",
    playbackIntent: playbackIntentForSnapshot(snapshot),
    scale: options.scale ?? "runtime-scale",
    visibility: options.visibility ?? "runtime-visibility"
  };
}

function safeActionForSnapshot(snapshot: RuntimeMicroInteractionSnapshot): SafeActionId {
  if (snapshot.microInteraction !== "none") {
    return MICRO_TO_SAFE_ACTION[snapshot.microInteraction] ?? snapshot.microInteraction;
  }
  return snapshot.displayState;
}

const MICRO_TO_SAFE_ACTION: Partial<Record<RuntimeMicroInteractionType, SafeActionId>> = {
  pointer_near: "pointer_look",
  pointer_leave: "idle",
  pointer_hover: "pointer_ear_twitch",
  click: "click_paw",
  click_blink: "click_blink",
  click_paw: "click_paw",
  double_click: "double_click_jump",
  double_click_jump: "double_click_jump",
  double_click_roll: "double_click_jump",
  double_click_play: "double_click_jump",
  drag: "drag_grabbed",
  drag_start: "drag_grabbed",
  drag_grabbed: "drag_grabbed",
  dragging: "dragging",
  drop: "drag_land",
  drag_release: "drag_release",
  drag_land: "drag_land",
  walk_left: "walk_left",
  walk_right: "walk_right",
  turn: "turn",
  edge_avoid: "edge_avoid"
};

function playbackIntentForSnapshot(snapshot: RuntimeMicroInteractionSnapshot): PlaybackIntent {
  if (snapshot.displayState === "error" || snapshot.displayState === "need_input") {
    return { loop: true, priority: "urgent" };
  }
  if (
    snapshot.displayState === "success"
    || snapshot.microInteraction === "click"
    || snapshot.microInteraction === "click_paw"
    || snapshot.microInteraction === "double_click"
    || snapshot.microInteraction === "double_click_jump"
    || snapshot.microInteraction === "drop"
    || snapshot.microInteraction === "drag_release"
    || snapshot.microInteraction === "drag_land"
    || snapshot.microInteraction === "idle_wake"
  ) {
    return { loop: false, priority: "transient", durationMs: 900 };
  }
  return { loop: true, priority: "base" };
}

function clampMs(value: number | undefined, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(value as number)));
}
