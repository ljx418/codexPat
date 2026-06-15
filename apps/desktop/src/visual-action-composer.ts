import type { CoreActionId } from "./assets/asset-manifest";
import type { CatState } from "./pet-states";
import type { RuntimeMicroInteractionSnapshot, RuntimeMicroInteractionType } from "./runtime-micro-interactions";

export type EmotionProfileId =
  | "calm"
  | "focused"
  | "busy"
  | "happy_transient"
  | "alert"
  | "distressed_blocked"
  | "asking_attentive"
  | "low_energy";

export type VisualActionPhase = "enter" | "loop" | "exit" | "transient";
export type VisualInterruptPolicy = "block_lower" | "allow_same" | "replace_lower" | "hold_until_state_change";

export type EmotionStateResolution = {
  state: CatState;
  emotionProfile: EmotionProfileId;
  visualCues: readonly string[];
  defaultActionId: CoreActionId;
  reasonCode: "emotion_profile_resolved";
  emitsPetEvent: false;
  writesCatStateMachine: false;
};

export type VisualActionPlan = {
  actionId: CoreActionId;
  visualActionId: CatState | RuntimeMicroInteractionType;
  phase: VisualActionPhase;
  priority: number;
  interruptPolicy: VisualInterruptPolicy;
  durationMs: number | "loop";
  fallbackActionId: CoreActionId;
  reasonCode:
    | "action_enter_selected"
    | "action_loop_selected"
    | "action_exit_selected"
    | "action_transient_selected"
    | "priority_interrupt_applied"
    | "priority_hold_active"
    | "lower_priority_blocked"
    | "success_transient_return_idle"
    | "rapid_event_final_state_stable"
    | "fallback_action_selected";
  emitsPetEvent: false;
  writesCatStateMachine: false;
};

export type ComposedRuntimeVisual = {
  emotion: EmotionStateResolution;
  plan: VisualActionPlan;
  rendererInput: {
    actionId: CoreActionId;
    rendererKind: "safe-runtime-selected";
    packId: "safe-runtime-active-pack";
    playbackIntent: {
      loop: boolean;
      priority: "base" | "transient" | "urgent";
      durationMs?: number;
    };
    scale: "runtime-scale";
    visibility: "runtime-visibility";
  };
};

const EMOTION_PROFILES: Record<CatState, Omit<EmotionStateResolution, "state" | "reasonCode" | "emitsPetEvent" | "writesCatStateMachine">> = {
  idle: {
    emotionProfile: "calm",
    visualCues: ["relaxed eyes", "low movement", "tail motion"],
    defaultActionId: "idle"
  },
  thinking: {
    emotionProfile: "focused",
    visualCues: ["focused eyes", "head tilt", "small movement"],
    defaultActionId: "thinking"
  },
  running: {
    emotionProfile: "busy",
    visualCues: ["faster body motion", "alert eyes", "working rhythm"],
    defaultActionId: "running"
  },
  success: {
    emotionProfile: "happy_transient",
    visualCues: ["jump", "smile", "bright eyes"],
    defaultActionId: "success"
  },
  warning: {
    emotionProfile: "alert",
    visualCues: ["wide eyes", "raised ears", "caution pose"],
    defaultActionId: "warning"
  },
  error: {
    emotionProfile: "distressed_blocked",
    visualCues: ["droop", "sad eyes", "blocked pose"],
    defaultActionId: "error"
  },
  need_input: {
    emotionProfile: "asking_attentive",
    visualCues: ["looks at user", "raised paw", "attentive pose"],
    defaultActionId: "need_input"
  },
  sleeping: {
    emotionProfile: "low_energy",
    visualCues: ["closed eyes", "low body", "sleep breath"],
    defaultActionId: "sleeping"
  }
};

const VISUAL_PRIORITIES: Record<CatState | RuntimeMicroInteractionType | "idle_random", number> = {
  error: 1000,
  need_input: 900,
  drag: 820,
  drag_start: 820,
  dragging: 820,
  drop: 820,
  double_click: 760,
  click: 720,
  success: 650,
  warning: 600,
  running: 520,
  thinking: 480,
  pointer_near: 360,
  pointer_leave: 340,
  pointer_look: 360,
  pointer_hover: 360,
  pointer_ear_twitch: 340,
  pointer_tail_focus: 340,
  idle_wake: 330,
  click_paw: 720,
  click_blink: 720,
  double_click_jump: 760,
  double_click_roll: 760,
  double_click_play: 760,
  drag_grabbed: 820,
  drag_release: 820,
  drag_land: 820,
  walk_left: 180,
  walk_right: 180,
  turn: 180,
  edge_avoid: 180,
  idle_random: 120,
  idle_blink: 120,
  idle_look_left: 120,
  idle_look_right: 120,
  idle_tail_sway: 120,
  idle_stretch: 120,
  idle_settle: 120,
  idle_nap: 120,
  idle: 100,
  sleeping: 80
};

const MICRO_ACTION_FALLBACK: Record<RuntimeMicroInteractionType, CoreActionId> = {
  idle_blink: "idle",
  idle_look_left: "idle",
  idle_look_right: "idle",
  idle_tail_sway: "idle",
  idle_stretch: "idle",
  idle_settle: "idle",
  idle_nap: "sleeping",
  idle_wake: "idle",
  pointer_near: "idle",
  pointer_leave: "idle",
  pointer_look: "idle",
  pointer_hover: "idle",
  pointer_ear_twitch: "idle",
  pointer_tail_focus: "idle",
  click: "success",
  click_paw: "success",
  click_blink: "success",
  double_click: "success",
  double_click_jump: "success",
  double_click_roll: "success",
  double_click_play: "success",
  drag: "running",
  drag_start: "running",
  drag_grabbed: "running",
  dragging: "running",
  drop: "idle",
  drag_release: "idle",
  drag_land: "idle",
  walk_left: "running",
  walk_right: "running",
  turn: "idle",
  edge_avoid: "idle"
};

export function resolveEmotionState(state: CatState): EmotionStateResolution {
  return {
    state,
    ...EMOTION_PROFILES[state],
    reasonCode: "emotion_profile_resolved",
    emitsPetEvent: false,
    writesCatStateMachine: false
  };
}

export function composeVisualAction(
  snapshot: RuntimeMicroInteractionSnapshot,
  options: { previousPlan?: VisualActionPlan } = {}
): VisualActionPlan {
  const baseEmotion = resolveEmotionState(snapshot.displayState);
  const micro = snapshot.microInteraction === "none" ? undefined : snapshot.microInteraction;
  const basePriority = priorityOf(snapshot.displayState);
  const microPriority = micro ? priorityOf(micro) : 0;
  const microCanOverrideBase = micro ? microPriority >= basePriority : false;
  const visualActionId = micro && microCanOverrideBase ? micro : snapshot.displayState;
  const priority = Math.max(basePriority, microPriority);
  const previous = options.previousPlan;

  if (previous && isHeldPriority(previous) && priority < previous.priority) {
    return {
      ...previous,
      reasonCode: "lower_priority_blocked",
      emitsPetEvent: false,
      writesCatStateMachine: false
    };
  }

  const phase = phaseFor(snapshot, micro);
  const actionId = micro && microCanOverrideBase ? MICRO_ACTION_FALLBACK[micro] : baseEmotion.defaultActionId;
  const interruptPolicy = interruptPolicyFor(snapshot, priority);
  const durationMs = durationFor(snapshot, phase);
  const reasonCode = reasonFor(snapshot, phase, previous, priority);

  return {
    actionId,
    visualActionId,
    phase,
    priority,
    interruptPolicy,
    durationMs,
    fallbackActionId: actionId,
    reasonCode,
    emitsPetEvent: false,
    writesCatStateMachine: false
  };
}

export function composeRuntimeVisual(
  snapshot: RuntimeMicroInteractionSnapshot,
  options: { previousPlan?: VisualActionPlan } = {}
): ComposedRuntimeVisual {
  const plan = composeVisualAction(snapshot, options);
  const emotion = resolveEmotionState(snapshot.displayState);
  return {
    emotion,
    plan,
    rendererInput: {
      actionId: plan.actionId,
      rendererKind: "safe-runtime-selected",
      packId: "safe-runtime-active-pack",
      playbackIntent: {
        loop: plan.durationMs === "loop",
        priority: plan.priority >= 900 ? "urgent" : plan.phase === "transient" ? "transient" : "base",
        durationMs: typeof plan.durationMs === "number" ? plan.durationMs : undefined
      },
      scale: "runtime-scale",
      visibility: "runtime-visibility"
    }
  };
}

function phaseFor(snapshot: RuntimeMicroInteractionSnapshot, micro: RuntimeMicroInteractionType | undefined): VisualActionPhase {
  if (snapshot.reasonCode === "micro_expired" || snapshot.reasonCode === "interaction_expired" || snapshot.reasonCode === "pointer_leave_returned") {
    return "exit";
  }
  if (snapshot.displayState === "success" || micro === "click" || micro === "double_click" || micro === "drop" || micro === "idle_wake") {
    return "transient";
  }
  if (snapshot.displayState === "error" || snapshot.displayState === "need_input" || snapshot.displayState === "running" || snapshot.displayState === "thinking" || snapshot.displayState === "sleeping") {
    return "loop";
  }
  if (micro) {
    return "transient";
  }
  return "loop";
}

function interruptPolicyFor(snapshot: RuntimeMicroInteractionSnapshot, priority: number): VisualInterruptPolicy {
  if (snapshot.displayState === "error" || snapshot.displayState === "need_input") {
    return "hold_until_state_change";
  }
  if (priority >= VISUAL_PRIORITIES.drag_start) {
    return "replace_lower";
  }
  if (snapshot.displayState === "success") {
    return "replace_lower";
  }
  return "block_lower";
}

function durationFor(snapshot: RuntimeMicroInteractionSnapshot, phase: VisualActionPhase): number | "loop" {
  if (snapshot.displayState === "error" || snapshot.displayState === "need_input" || snapshot.displayState === "running" || snapshot.displayState === "thinking" || snapshot.displayState === "sleeping") {
    return "loop";
  }
  if (phase === "transient") {
    return 900;
  }
  if (phase === "exit") {
    return 300;
  }
  return "loop";
}

function reasonFor(
  snapshot: RuntimeMicroInteractionSnapshot,
  phase: VisualActionPhase,
  previous: VisualActionPlan | undefined,
  priority: number
): VisualActionPlan["reasonCode"] {
  if (previous && priority > previous.priority) {
    return "priority_interrupt_applied";
  }
  if (snapshot.displayState === "error" || snapshot.displayState === "need_input") {
    return "priority_hold_active";
  }
  if (snapshot.displayState === "success" && phase === "transient") {
    return "success_transient_return_idle";
  }
  if (snapshot.reasonCode === "micro_expired" || snapshot.reasonCode === "interaction_expired") {
    return "rapid_event_final_state_stable";
  }
  if (phase === "enter") {
    return "action_enter_selected";
  }
  if (phase === "exit") {
    return "action_exit_selected";
  }
  if (phase === "transient") {
    return "action_transient_selected";
  }
  return "action_loop_selected";
}

function priorityOf(action: CatState | RuntimeMicroInteractionType) {
  return VISUAL_PRIORITIES[action] ?? 0;
}

function isHeldPriority(plan: VisualActionPlan) {
  return plan.interruptPolicy === "hold_until_state_change" && (plan.visualActionId === "error" || plan.visualActionId === "need_input");
}
