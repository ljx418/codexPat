import type { CoreActionId } from "../asset-manifest";

export const SPRITE_V3_ANIMATED_PACK_ID = "sprite-v3-animated";

export type AnimatedSpriteFrame = {
  actionId: CoreActionId;
  label: string;
  bodyY: number;
  headY: number;
  tail: string;
  earTilt: number;
  pawLift: number;
  eyeMode: "open" | "blink" | "sleep" | "wide" | "sad";
  stateMarkPhase: number;
  palette: {
    body: string;
    accent: string;
    shadow: string;
    eye: string;
    cheek: string;
  };
};

export type AnimatedSpriteAction = {
  fps: number;
  frames: AnimatedSpriteFrame[];
};

const ORANGE_PALETTE = {
  body: "#f28a35",
  accent: "#b75a1d",
  shadow: "#71360f",
  eye: "#18312b",
  cheek: "#ffd1a8"
};

const LOOP_ACTION_IDS = new Set<CoreActionId>(["idle", "thinking", "running", "sleeping"]);

export const SPRITE_V3_ANIMATED_ACTIONS: Record<CoreActionId, AnimatedSpriteAction> = {
  idle: action("idle", 8, [
    frame("idle", "Idle", 60, 30, tail(0), 0, 0, "open", 0),
    frame("idle", "Idle", 58, 29, tail(5), 1, 0, "open", 1),
    frame("idle", "Idle", 57, 28, tail(8), 0, 1, "blink", 2),
    frame("idle", "Idle", 58, 29, tail(3), -1, 0, "open", 3),
    frame("idle", "Idle", 60, 30, tail(-4), 0, 0, "open", 4),
    frame("idle", "Idle", 61, 31, tail(-7), 1, 0, "open", 5)
  ]),
  thinking: action("thinking", 8, [
    frame("thinking", "Thinking", 60, 31, tail(2), -3, 0, "open", 0),
    frame("thinking", "Thinking", 59, 30, tail(5), -5, 0, "open", 1),
    frame("thinking", "Thinking", 58, 29, tail(7), -7, 0, "blink", 2),
    frame("thinking", "Thinking", 59, 30, tail(4), -5, 0, "open", 3),
    frame("thinking", "Thinking", 60, 31, tail(0), -3, 0, "open", 4),
    frame("thinking", "Thinking", 61, 32, tail(-3), -1, 0, "open", 5)
  ]),
  running: action("running", 12, [
    frame("running", "Running", 58, 27, runTail(0), 0, 6, "wide", 0),
    frame("running", "Running", 55, 25, runTail(1), 1, 0, "wide", 1),
    frame("running", "Running", 57, 26, runTail(2), -1, -5, "open", 2),
    frame("running", "Running", 61, 30, runTail(3), 0, 4, "wide", 3),
    frame("running", "Running", 58, 28, runTail(4), 1, 0, "wide", 4),
    frame("running", "Running", 56, 26, runTail(5), -1, -4, "open", 5)
  ]),
  success: action("success", 9, [
    frame("success", "Success", 55, 24, tail(8), 5, 5, "wide", 0),
    frame("success", "Success", 47, 17, tail(12), 8, 10, "wide", 1),
    frame("success", "Success", 55, 24, tail(6), 4, 3, "open", 2)
  ]),
  warning: action("warning", 8, [
    frame("warning", "Warning", 62, 31, tail(10), 10, 0, "wide", 0),
    frame("warning", "Warning", 63, 30, tail(14), 13, 0, "wide", 1),
    frame("warning", "Warning", 61, 31, tail(9), 9, 0, "open", 2)
  ]),
  error: action("error", 8, [
    frame("error", "Error", 70, 42, tail(-10), -8, 0, "sad", 0),
    frame("error", "Error", 72, 43, tail(-14), -12, 0, "sad", 1),
    frame("error", "Error", 70, 42, tail(-8), -7, 0, "sad", 2)
  ]),
  need_input: action("need_input", 8, [
    frame("need_input", "Need Input", 60, 29, tail(4), 4, 0, "wide", 0),
    frame("need_input", "Need Input", 58, 27, tail(9), 7, 2, "wide", 1),
    frame("need_input", "Need Input", 60, 29, tail(5), 3, 0, "open", 2)
  ]),
  sleeping: action("sleeping", 6, [
    frame("sleeping", "Sleeping", 72, 48, sleepTail(0), 0, 0, "sleep", 0),
    frame("sleeping", "Sleeping", 73, 49, sleepTail(1), 0, 0, "sleep", 1),
    frame("sleeping", "Sleeping", 74, 50, sleepTail(2), 0, 0, "sleep", 2),
    frame("sleeping", "Sleeping", 73, 49, sleepTail(3), 0, 0, "sleep", 3),
    frame("sleeping", "Sleeping", 72, 48, sleepTail(4), 0, 0, "sleep", 4),
    frame("sleeping", "Sleeping", 71, 47, sleepTail(5), 0, 0, "sleep", 5)
  ])
};

export function renderAnimatedSpriteFrame(frame: AnimatedSpriteFrame) {
  const headTransform = `rotate(${frame.earTilt} 80 ${frame.headY + 30})`;
  return `<svg viewBox="0 0 160 150" role="img" aria-label="${escapeAttr(frame.label)}">
  <ellipse cx="80" cy="132" rx="48" ry="8" fill="rgba(15,23,42,0.16)"/>
  <path d="${frame.tail}" fill="none" stroke="${frame.palette.accent}" stroke-width="15" stroke-linecap="round"/>
  <ellipse cx="80" cy="${frame.bodyY}" rx="43" ry="36" fill="${frame.palette.body}"/>
  <ellipse cx="80" cy="${frame.bodyY + 10}" rx="25" ry="22" fill="${frame.palette.cheek}" opacity="0.64"/>
  <g transform="${headTransform}">
    <path d="M47 ${frame.headY + 15} L56 ${frame.headY - 10} L70 ${frame.headY + 14} Z" fill="${frame.palette.accent}"/>
    <path d="M90 ${frame.headY + 14} L104 ${frame.headY - 10} L113 ${frame.headY + 15} Z" fill="${frame.palette.accent}"/>
    <rect x="48" y="${frame.headY}" width="64" height="56" rx="25" fill="${frame.palette.body}"/>
    <path d="M55 ${frame.headY + 11} q7 -7 14 0" stroke="${frame.palette.shadow}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.4"/>
    <path d="M91 ${frame.headY + 11} q7 -7 14 0" stroke="${frame.palette.shadow}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.4"/>
    ${eyes(frame)}
    <ellipse cx="80" cy="${frame.headY + 38}" rx="4" ry="3" fill="#d65454"/>
    <path d="M75 ${frame.headY + 44} q5 4 10 0" stroke="${frame.palette.eye}" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>
  <ellipse cx="${55 - frame.pawLift}" cy="${frame.bodyY + 35}" rx="11" ry="7" fill="${frame.palette.cheek}"/>
  <ellipse cx="${105 + frame.pawLift}" cy="${frame.bodyY + 35}" rx="11" ry="7" fill="${frame.palette.cheek}"/>
  ${stateMark(frame)}
</svg>`;
}

function action(actionId: CoreActionId, fps: number, frames: AnimatedSpriteFrame[]): AnimatedSpriteAction {
  const normalizedFrames = frames.map((item) => ({ ...item, actionId }));
  if (LOOP_ACTION_IDS.has(actionId) && normalizedFrames.length > 1) {
    normalizedFrames.push({ ...normalizedFrames[0] });
  }
  return { fps, frames: normalizedFrames };
}

function frame(
  actionId: CoreActionId,
  label: string,
  bodyY: number,
  headY: number,
  tailPath: string,
  earTilt: number,
  pawLift: number,
  eyeMode: AnimatedSpriteFrame["eyeMode"],
  stateMarkPhase: number
): AnimatedSpriteFrame {
  return {
    actionId,
    label,
    bodyY,
    headY,
    tail: tailPath,
    earTilt,
    pawLift,
    eyeMode,
    stateMarkPhase,
    palette: ORANGE_PALETTE
  };
}

function tail(offset: number) {
  return `M114 94 C143 ${77 - offset} 148 ${110 + offset} 123 109`;
}

function runTail(phase: number) {
  const y = [78, 70, 82, 92, 84, 74][phase] ?? 78;
  return `M113 91 C147 ${y} 153 ${116 - phase} 123 ${110 + phase}`;
}

function sleepTail(phase: number) {
  return `M113 96 C139 ${93 + phase} 137 ${115 - phase} 119 112`;
}

function eyes(frame: AnimatedSpriteFrame) {
  const y = frame.headY + 31;
  if (frame.eyeMode === "sleep") {
    return `<path d="M62 ${y} h13 M88 ${y} h13" stroke="${frame.palette.eye}" stroke-width="5" stroke-linecap="round"/>`;
  }
  if (frame.eyeMode === "blink") {
    return `<path d="M63 ${y} h11 M89 ${y} h11" stroke="${frame.palette.eye}" stroke-width="4" stroke-linecap="round"/>`;
  }
  if (frame.eyeMode === "sad") {
    return `<path d="M62 ${y - 1} q6 5 12 0 M88 ${y - 1} q6 5 12 0" stroke="${frame.palette.eye}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }
  const radius = frame.eyeMode === "wide" ? 6 : 5;
  return `<circle cx="68" cy="${y}" r="${radius}" fill="${frame.palette.eye}"/><circle cx="94" cy="${y}" r="${radius}" fill="${frame.palette.eye}"/><circle cx="70" cy="${y - 2}" r="1.5" fill="white"/><circle cx="96" cy="${y - 2}" r="1.5" fill="white"/>`;
}

function stateMark(frame: AnimatedSpriteFrame) {
  const phase = frame.stateMarkPhase;
  const accent = frame.palette.accent;
  if (frame.actionId === "thinking") {
    return `<circle cx="${124 + phase}" cy="${34 - phase}" r="5" fill="${accent}"/><circle cx="${138 + phase}" cy="${23 - phase}" r="3" fill="${accent}"/>`;
  }
  if (frame.actionId === "running") {
    return `<path d="M${18 - phase} 101 h29 M${14 - phase} 116 h34" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`;
  }
  if (frame.actionId === "success") {
    return `<path d="M123 ${42 - phase} l8 8 18 -20" stroke="${accent}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  if (frame.actionId === "warning") {
    return `<path d="M136 ${23 + phase} l18 34 h-36 z" fill="${accent}"/><path d="M136 ${35 + phase} v9" stroke="white" stroke-width="4" stroke-linecap="round"/><circle cx="136" cy="${50 + phase}" r="2" fill="white"/>`;
  }
  if (frame.actionId === "error") {
    return `<path d="M124 ${31 + phase} l25 25 M149 ${31 + phase} l-25 25" stroke="${accent}" stroke-width="7" stroke-linecap="round"/>`;
  }
  if (frame.actionId === "need_input") {
    return `<path d="M132 ${58 - phase} q0 -17 12 -17 q11 0 11 10 q0 8 -9 12 q-5 3 -5 9" stroke="${accent}" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="141" cy="${83 - phase}" r="4" fill="${accent}"/>`;
  }
  if (frame.actionId === "sleeping") {
    return `<text x="${123 + phase}" y="${40 - phase}" font-family="Arial" font-size="${20 + phase}" font-weight="700" fill="${accent}">Z</text>`;
  }
  return "";
}

function escapeAttr(value: string) {
  return value.replace(/[&"]/g, (char) => char === "&" ? "&amp;" : "&quot;");
}
