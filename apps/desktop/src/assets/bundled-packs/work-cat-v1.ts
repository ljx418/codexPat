import type { CoreActionId } from "../asset-manifest";
import { stabilizeWorkCatAction } from "./work-cat-animation-continuity";

export const WORK_CAT_V1_PACK_ID = "work-cat-v1";

export type WorkCatEyeMode = "open" | "blink" | "focus" | "wide" | "sad" | "sleep";
export type WorkCatMouthMode = "smile" | "small" | "open" | "sad" | "sleep";

export type WorkCatFrame = {
  actionId: CoreActionId;
  label: string;
  bodyY: number;
  bodyScaleX: number;
  bodyScaleY: number;
  headX: number;
  headY: number;
  headTilt: number;
  tailPhase: number;
  frontPawLift: number;
  backPawLift: number;
  earTilt: number;
  eyeMode: WorkCatEyeMode;
  mouthMode: WorkCatMouthMode;
  statePhase: number;
  palette: WorkCatPalette;
};

export type WorkCatAction = {
  fps: number;
  loop: boolean;
  frames: WorkCatFrame[];
};

export type WorkCatPalette = {
  body: string;
  bodyDark: string;
  cream: string;
  line: string;
  eye: string;
  nose: string;
  blush: string;
  shadow: string;
};

const ORANGE_TABBY: WorkCatPalette = {
  body: "#E88A3A",
  bodyDark: "#9A4E20",
  cream: "#F8D7A0",
  line: "#5B3019",
  eye: "#1F2933",
  nose: "#E86C72",
  blush: "#F7A08C",
  shadow: "rgba(31, 41, 51, 0.16)"
};

export const WORK_CAT_V1_ACTIONS: Record<CoreActionId, WorkCatAction> = {
  idle: action("idle", 9, true, [
    pose("idle", "Idle", 145, 1.0, 1.0, 126, 82, 0, 0, 0, 0, 0, "open", "smile", 0),
    pose("idle", "Idle", 143, 1.01, 1.0, 126, 80, 1, 1, 0, 1, 1, "open", "smile", 1),
    pose("idle", "Idle", 141, 1.02, 0.99, 126, 79, 0, 2, 1, 0, 0, "blink", "small", 2),
    pose("idle", "Idle", 143, 1.01, 1.0, 126, 80, -1, 3, 0, -1, -1, "open", "smile", 3),
    pose("idle", "Idle", 145, 1.0, 1.01, 126, 82, 0, 4, 0, 0, 0, "open", "smile", 4),
    pose("idle", "Idle", 146, 0.99, 1.01, 126, 83, 1, 5, 0, 1, 1, "open", "smile", 5),
    pose("idle", "Idle", 144, 1.0, 1.0, 126, 81, 0, 6, 1, 0, 0, "open", "small", 6),
    pose("idle", "Idle", 143, 1.01, 1.0, 126, 80, -1, 7, 0, -1, -1, "open", "smile", 7)
  ]),
  thinking: action("thinking", 9, true, [
    pose("thinking", "Thinking", 146, 1.0, 1.0, 124, 82, -6, 0, 0, 0, -4, "focus", "small", 0),
    pose("thinking", "Thinking", 145, 1.0, 1.0, 122, 80, -9, 1, 0, 0, -7, "focus", "small", 1),
    pose("thinking", "Thinking", 144, 1.01, 0.99, 121, 79, -11, 2, 2, 0, -8, "blink", "small", 2),
    pose("thinking", "Thinking", 145, 1.0, 1.0, 122, 80, -8, 3, 0, 0, -6, "focus", "small", 3),
    pose("thinking", "Thinking", 146, 1.0, 1.0, 124, 82, -5, 4, 0, 1, -3, "focus", "small", 4),
    pose("thinking", "Thinking", 147, 0.99, 1.01, 125, 83, -3, 5, 0, 0, -2, "open", "small", 5),
    pose("thinking", "Thinking", 146, 1.0, 1.0, 124, 82, -6, 6, 1, 0, -5, "focus", "small", 6),
    pose("thinking", "Thinking", 145, 1.0, 1.0, 123, 81, -8, 7, 0, 0, -6, "focus", "small", 7)
  ]),
  running: action("running", 12, true, [
    pose("running", "Running", 145, 1.05, 0.96, 130, 80, 2, 0, 8, -6, 1, "wide", "open", 0),
    pose("running", "Running", 139, 1.03, 0.98, 134, 75, 4, 1, 1, 7, 2, "wide", "smile", 1),
    pose("running", "Running", 142, 1.06, 0.95, 132, 78, 1, 2, -7, 7, 0, "open", "smile", 2),
    pose("running", "Running", 148, 1.02, 1.0, 128, 84, -1, 3, 7, -5, -1, "wide", "open", 3),
    pose("running", "Running", 142, 1.05, 0.96, 132, 78, 3, 4, 0, -8, 1, "wide", "smile", 4),
    pose("running", "Running", 139, 1.04, 0.98, 135, 75, 5, 5, -7, 6, 2, "open", "smile", 5),
    pose("running", "Running", 143, 1.06, 0.95, 132, 79, 2, 6, 8, 5, 0, "wide", "open", 6),
    pose("running", "Running", 148, 1.03, 1.0, 128, 84, 0, 7, 1, -7, -1, "open", "smile", 7)
  ]),
  success: action("success", 10, false, [
    pose("success", "Success", 144, 1.0, 1.0, 126, 80, 2, 0, 3, 0, 4, "wide", "smile", 0),
    pose("success", "Success", 129, 1.0, 1.02, 126, 64, 6, 1, 10, 8, 7, "wide", "open", 1),
    pose("success", "Success", 134, 1.02, 0.98, 126, 69, -4, 2, 8, -4, 4, "wide", "smile", 2),
    pose("success", "Success", 144, 1.0, 1.0, 126, 80, 2, 3, 2, 0, 2, "open", "smile", 3)
  ]),
  warning: action("warning", 9, false, [
    pose("warning", "Warning", 146, 1.0, 1.0, 126, 82, 0, 0, 0, 0, 9, "wide", "small", 0),
    pose("warning", "Warning", 145, 1.03, 0.98, 123, 78, -5, 1, 1, 0, 12, "wide", "open", 1),
    pose("warning", "Warning", 146, 1.02, 0.99, 130, 79, 5, 2, 0, 1, 11, "wide", "small", 2),
    pose("warning", "Warning", 146, 1.0, 1.0, 126, 82, 0, 3, 0, 0, 9, "focus", "small", 3)
  ]),
  error: action("error", 8, false, [
    pose("error", "Error", 149, 0.98, 1.02, 126, 86, -4, 0, 0, 0, -8, "sad", "sad", 0),
    pose("error", "Error", 154, 0.96, 1.03, 119, 94, -12, 1, -2, 0, -12, "wide", "open", 1),
    pose("error", "Error", 151, 0.98, 1.02, 123, 90, -8, 2, 0, 1, -9, "sad", "sad", 2),
    pose("error", "Error", 148, 1.0, 1.0, 126, 85, -3, 3, 0, 0, -6, "sad", "small", 3)
  ]),
  need_input: action("need_input", 8, false, [
    pose("need_input", "Need Input", 145, 1.0, 1.0, 126, 81, 2, 0, 1, 0, 3, "open", "small", 0),
    pose("need_input", "Need Input", 141, 1.0, 1.0, 126, 77, 4, 1, 14, 0, 5, "wide", "small", 1),
    pose("need_input", "Need Input", 142, 1.01, 0.99, 126, 78, 2, 2, 16, 0, 4, "wide", "smile", 2),
    pose("need_input", "Need Input", 145, 1.0, 1.0, 126, 81, 2, 3, 9, 0, 3, "open", "small", 3)
  ]),
  sleeping: action("sleeping", 7, true, [
    pose("sleeping", "Sleeping", 156, 1.15, 0.78, 101, 131, -7, 0, 0, 0, 0, "sleep", "sleep", 0),
    pose("sleeping", "Sleeping", 157, 1.16, 0.77, 101, 132, -7, 1, 0, 0, 0, "sleep", "sleep", 1),
    pose("sleeping", "Sleeping", 158, 1.17, 0.76, 102, 133, -8, 2, 0, 0, 0, "sleep", "sleep", 2),
    pose("sleeping", "Sleeping", 157, 1.16, 0.77, 101, 132, -7, 3, 0, 0, 0, "sleep", "sleep", 3),
    pose("sleeping", "Sleeping", 156, 1.15, 0.78, 101, 131, -7, 4, 0, 0, 0, "sleep", "sleep", 4),
    pose("sleeping", "Sleeping", 155, 1.14, 0.79, 100, 130, -6, 5, 0, 0, 0, "sleep", "sleep", 5),
    pose("sleeping", "Sleeping", 156, 1.15, 0.78, 101, 131, -7, 6, 0, 0, 0, "sleep", "sleep", 6),
    pose("sleeping", "Sleeping", 157, 1.16, 0.77, 101, 132, -7, 7, 0, 0, 0, "sleep", "sleep", 7)
  ])
};

export function renderWorkCatFrame(frame: WorkCatFrame) {
  const bodyTransform = `translate(128 ${frame.bodyY}) scale(${frame.bodyScaleX} ${frame.bodyScaleY})`;
  const headTransform = `translate(${frame.headX} ${frame.headY}) rotate(${frame.headTilt})`;
  const sleeping = frame.actionId === "sleeping";
  return `<svg viewBox="0 0 256 256" role="img" aria-label="${escapeAttr(frame.label)}">
  <ellipse cx="128" cy="222" rx="58" ry="11" fill="${frame.palette.shadow}"/>
  ${tail(frame)}
  <g transform="${bodyTransform}">
    <ellipse cx="0" cy="0" rx="55" ry="46" fill="${frame.palette.body}" stroke="${frame.palette.line}" stroke-width="3"/>
    <ellipse cx="-5" cy="12" rx="30" ry="25" fill="${frame.palette.cream}" opacity="0.92"/>
    <path d="M-36 -16 q14 8 28 0 M-14 -30 q14 9 28 0 M14 -17 q14 8 29 0" stroke="${frame.palette.bodyDark}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.72"/>
  </g>
  ${paws(frame)}
  <g transform="${headTransform}">
    ${ears(frame)}
    <path d="M-45 -15 q0 -34 45 -36 q45 2 45 36 v18 q0 36 -45 39 q-45 -3 -45 -39 z" fill="${frame.palette.body}" stroke="${frame.palette.line}" stroke-width="3"/>
    <path d="M-25 -35 q11 6 22 0 M3 -39 q11 7 23 0" stroke="${frame.palette.bodyDark}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.75"/>
    <ellipse cx="-15" cy="12" rx="18" ry="13" fill="${frame.palette.cream}"/>
    <ellipse cx="15" cy="12" rx="18" ry="13" fill="${frame.palette.cream}"/>
    ${eyes(frame)}
    <path d="M-3 12 q3 -4 6 0 q-3 5 -6 0" fill="${frame.palette.nose}" stroke="${frame.palette.line}" stroke-width="1.5"/>
    ${mouth(frame)}
    <circle cx="-33" cy="17" r="5" fill="${frame.palette.blush}" opacity="0.45"/>
    <circle cx="33" cy="17" r="5" fill="${frame.palette.blush}" opacity="0.45"/>
    ${whiskers(frame)}
  </g>
  ${stateMark(frame)}
  ${sleeping ? sleepBubble(frame) : ""}
</svg>`;
}

function action(actionId: CoreActionId, fps: number, loop: boolean, frames: WorkCatFrame[]): WorkCatAction {
  const normalizedFrames = frames.map((item) => ({ ...item, actionId }));
  return stabilizeWorkCatAction({ fps, loop, frames: normalizedFrames });
}

function pose(
  actionId: CoreActionId,
  label: string,
  bodyY: number,
  bodyScaleX: number,
  bodyScaleY: number,
  headX: number,
  headY: number,
  headTilt: number,
  tailPhase: number,
  frontPawLift: number,
  backPawLift: number,
  earTilt: number,
  eyeMode: WorkCatEyeMode,
  mouthMode: WorkCatMouthMode,
  statePhase: number
): WorkCatFrame {
  return {
    actionId,
    label,
    bodyY,
    bodyScaleX,
    bodyScaleY,
    headX,
    headY,
    headTilt,
    tailPhase,
    frontPawLift,
    backPawLift,
    earTilt,
    eyeMode,
    mouthMode,
    statePhase,
    palette: ORANGE_TABBY
  };
}

function tail(frame: WorkCatFrame) {
  const palette = frame.palette;
  const phase = frame.tailPhase;
  if (frame.actionId === "sleeping") {
    return `<path d="M165 173 C206 ${170 + phase} 205 ${214 - phase} 162 210" fill="none" stroke="${palette.bodyDark}" stroke-width="18" stroke-linecap="round"/><path d="M166 173 C198 ${178 + phase} 196 ${204 - phase} 164 207" fill="none" stroke="${palette.body}" stroke-width="10" stroke-linecap="round"/>`;
  }
  if (frame.actionId === "running") {
    const y = [124, 112, 129, 144, 130, 113, 124, 140][phase] ?? 124;
    return `<path d="M172 151 C220 ${y} 223 ${186 - phase} 179 190" fill="none" stroke="${palette.bodyDark}" stroke-width="18" stroke-linecap="round"/><path d="M174 151 C209 ${y + 8} 211 ${176 - phase} 180 186" fill="none" stroke="${palette.body}" stroke-width="10" stroke-linecap="round"/>`;
  }
  const sway = [-12, -5, 4, 12, 8, 0, -7, -14][phase] ?? 0;
  return `<path d="M172 153 C216 ${124 - sway} 222 ${184 + sway} 181 193" fill="none" stroke="${palette.bodyDark}" stroke-width="18" stroke-linecap="round"/><path d="M173 153 C205 ${132 - sway} 210 ${178 + sway} 182 188" fill="none" stroke="${palette.body}" stroke-width="10" stroke-linecap="round"/>`;
}

function paws(frame: WorkCatFrame) {
  const p = frame.palette;
  if (frame.actionId === "sleeping") {
    return `<ellipse cx="104" cy="199" rx="22" ry="12" fill="${p.cream}" stroke="${p.line}" stroke-width="2"/><ellipse cx="145" cy="200" rx="25" ry="12" fill="${p.cream}" stroke="${p.line}" stroke-width="2"/>`;
  }
  return `<ellipse cx="${91 - frame.frontPawLift * 0.7}" cy="${194 - frame.frontPawLift}" rx="16" ry="12" fill="${p.cream}" stroke="${p.line}" stroke-width="2"/>
  <ellipse cx="${161 + frame.backPawLift * 0.5}" cy="${194 - frame.backPawLift}" rx="16" ry="12" fill="${p.cream}" stroke="${p.line}" stroke-width="2"/>
  <ellipse cx="${112 + frame.backPawLift * 0.35}" cy="${202 - Math.max(0, frame.backPawLift * 0.35)}" rx="15" ry="10" fill="${p.body}" stroke="${p.line}" stroke-width="2"/>
  <ellipse cx="${145 - frame.frontPawLift * 0.35}" cy="${202 - Math.max(0, frame.frontPawLift * 0.35)}" rx="15" ry="10" fill="${p.body}" stroke="${p.line}" stroke-width="2"/>`;
}

function ears(frame: WorkCatFrame) {
  const p = frame.palette;
  const tilt = frame.earTilt;
  return `<path d="M-39 -24 L-31 -63 L-9 -32 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3" transform="rotate(${-tilt} -30 -38)"/>
  <path d="M39 -24 L31 -63 L9 -32 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3" transform="rotate(${tilt} 30 -38)"/>
  <path d="M-32 -32 L-28 -51 L-18 -35 Z" fill="${p.blush}" opacity="0.75"/>
  <path d="M32 -32 L28 -51 L18 -35 Z" fill="${p.blush}" opacity="0.75"/>`;
}

function eyes(frame: WorkCatFrame) {
  const p = frame.palette;
  if (frame.eyeMode === "sleep") {
    return `<path d="M-25 -4 q8 6 16 0 M9 -4 q8 6 16 0" stroke="${p.eye}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  }
  if (frame.eyeMode === "blink") {
    return `<path d="M-26 -7 h17 M9 -7 h17" stroke="${p.eye}" stroke-width="5" stroke-linecap="round"/>`;
  }
  if (frame.eyeMode === "sad") {
    return `<path d="M-27 -8 q9 7 18 0 M9 -8 q9 7 18 0" stroke="${p.eye}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  }
  const radius = frame.eyeMode === "wide" ? 8 : frame.eyeMode === "focus" ? 6 : 7;
  const focusOffset = frame.eyeMode === "focus" ? -2 : 0;
  return `<ellipse cx="${-19 + focusOffset}" cy="-8" rx="${radius}" ry="${radius + 1}" fill="${p.eye}"/>
  <ellipse cx="${19 + focusOffset}" cy="-8" rx="${radius}" ry="${radius + 1}" fill="${p.eye}"/>
  <circle cx="${-16 + focusOffset}" cy="-11" r="2" fill="white"/>
  <circle cx="${22 + focusOffset}" cy="-11" r="2" fill="white"/>`;
}

function mouth(frame: WorkCatFrame) {
  const p = frame.palette;
  if (frame.mouthMode === "open") {
    return `<ellipse cx="0" cy="23" rx="7" ry="8" fill="${p.line}" opacity="0.9"/><path d="M-10 19 q10 9 20 0" stroke="${p.line}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  if (frame.mouthMode === "sad") {
    return `<path d="M-9 25 q9 -8 18 0" stroke="${p.line}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }
  if (frame.mouthMode === "sleep") {
    return `<path d="M-8 22 q8 4 16 0" stroke="${p.line}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>`;
  }
  if (frame.mouthMode === "small") {
    return `<path d="M-6 22 q6 3 12 0" stroke="${p.line}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  return `<path d="M-13 20 q13 11 26 0" stroke="${p.line}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
}

function whiskers(frame: WorkCatFrame) {
  const p = frame.palette;
  return `<path d="M-19 14 h-31 M-19 20 l-30 8 M19 14 h31 M19 20 l30 8" stroke="${p.line}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.72"/>`;
}

function stateMark(frame: WorkCatFrame) {
  const p = frame.palette;
  const phase = frame.statePhase;
  if (frame.actionId === "thinking") {
    return `<circle cx="${178 + phase}" cy="${63 - phase}" r="7" fill="${p.cream}" stroke="${p.line}" stroke-width="2"/><circle cx="${196 + phase}" cy="${45 - phase}" r="4" fill="${p.cream}" stroke="${p.line}" stroke-width="2"/>`;
  }
  if (frame.actionId === "running") {
    return `<path d="M${31 - phase * 2} 158 h36 M${24 - phase * 2} 181 h42" stroke="${p.bodyDark}" stroke-width="7" stroke-linecap="round" opacity="0.75"/>`;
  }
  if (frame.actionId === "success") {
    return `<path d="M177 ${69 - phase * 2} l12 13 28 -34" stroke="#2F9E44" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${78 - phase}" cy="${75 - phase}" r="5" fill="#F8D7A0"/>`;
  }
  if (frame.actionId === "warning") {
    return `<path d="M198 ${50 + phase} l25 47 h-50 z" fill="#F59F00" stroke="${p.line}" stroke-width="3"/><path d="M198 ${66 + phase} v16" stroke="white" stroke-width="6" stroke-linecap="round"/><circle cx="198" cy="${90 + phase}" r="4" fill="white"/>`;
  }
  if (frame.actionId === "error") {
    return `<path d="M184 ${58 + phase} l30 30 M214 ${58 + phase} l-30 30" stroke="#E03131" stroke-width="9" stroke-linecap="round"/>`;
  }
  if (frame.actionId === "need_input") {
    return `<path d="M190 ${82 - phase} q0 -27 19 -27 q17 0 17 15 q0 13 -14 19 q-8 4 -8 17" stroke="${p.bodyDark}" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="204" cy="${121 - phase}" r="6" fill="${p.bodyDark}"/>`;
  }
  return "";
}

function sleepBubble(frame: WorkCatFrame) {
  const p = frame.palette;
  const phase = frame.statePhase;
  return `<path d="M178 ${77 - phase} h20 l-15 23 h25" stroke="${p.bodyDark}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
  <circle cx="${203 + phase}" cy="${54 - phase}" r="${5 + (phase % 2)}" fill="${p.cream}" stroke="${p.line}" stroke-width="2"/>`;
}

function escapeAttr(value: string) {
  return value.replace(/[&"]/g, (char) => char === "&" ? "&amp;" : "&quot;");
}
