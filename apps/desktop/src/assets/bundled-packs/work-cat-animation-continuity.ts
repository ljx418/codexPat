import type { WorkCatAction, WorkCatFrame, WorkCatEyeMode, WorkCatMouthMode } from "./work-cat-v1";

export type WorkCatContinuityReasonCode =
  | "passed"
  | "adjacent_delta_too_large"
  | "loop_open"
  | "sudden_vertical_jump"
  | "blank_frame";

export type WorkCatContinuityIssue = {
  reasonCode: Exclude<WorkCatContinuityReasonCode, "passed">;
  frameIndex: number;
  nextFrameIndex?: number;
  value: number;
  limit: number;
};

export type WorkCatContinuityResult = {
  ok: boolean;
  maxAdjacentDelta: number;
  issues: WorkCatContinuityIssue[];
};

const NUMERIC_FRAME_KEYS = [
  "bodyY",
  "bodyScaleX",
  "bodyScaleY",
  "headX",
  "headY",
  "headTilt",
  "tailPhase",
  "frontPawLift",
  "backPawLift",
  "earTilt",
  "statePhase"
] as const;

const DELTA_WEIGHTS: Record<(typeof NUMERIC_FRAME_KEYS)[number], number> = {
  bodyY: 1.2,
  bodyScaleX: 36,
  bodyScaleY: 36,
  headX: 1,
  headY: 1.15,
  headTilt: 1,
  tailPhase: 0.55,
  frontPawLift: 0.9,
  backPawLift: 0.9,
  earTilt: 0.85,
  statePhase: 0.45
};

const MAX_ADJACENT_DELTA = 20;
const MAX_VERTICAL_JUMP = 8;
const INSERTION_SAFETY_FACTOR = 0.82;

export function stabilizeWorkCatAction(action: WorkCatAction): WorkCatAction {
  const closedFrames = closeFrameSequence(action.frames);
  const frames = insertContinuityFrames(closedFrames);
  return {
    ...action,
    frames
  };
}

export function validateWorkCatContinuity(action: WorkCatAction): WorkCatContinuityResult {
  const issues: WorkCatContinuityIssue[] = [];
  let maxAdjacentDelta = 0;

  if (action.frames.length === 0) {
    issues.push({ reasonCode: "blank_frame", frameIndex: 0, value: 0, limit: 1 });
  }

  if (action.frames.length > 1 && !framesEquivalent(action.frames[0], action.frames[action.frames.length - 1])) {
    issues.push({ reasonCode: "loop_open", frameIndex: action.frames.length - 1, value: 1, limit: 0 });
  }

  for (let index = 1; index < action.frames.length; index += 1) {
    const previousFrame = action.frames[index - 1];
    const frame = action.frames[index];
    const delta = adjacentDelta(previousFrame, frame);
    maxAdjacentDelta = Math.max(maxAdjacentDelta, delta);

    if (delta > MAX_ADJACENT_DELTA) {
      issues.push({
        reasonCode: "adjacent_delta_too_large",
        frameIndex: index - 1,
        nextFrameIndex: index,
        value: round(delta),
        limit: MAX_ADJACENT_DELTA
      });
    }

    const verticalJump = Math.max(
      Math.abs(frame.bodyY - previousFrame.bodyY),
      Math.abs(frame.headY - previousFrame.headY)
    );
    if (verticalJump > MAX_VERTICAL_JUMP) {
      issues.push({
        reasonCode: "sudden_vertical_jump",
        frameIndex: index - 1,
        nextFrameIndex: index,
        value: round(verticalJump),
        limit: MAX_VERTICAL_JUMP
      });
    }
  }

  return {
    ok: issues.length === 0,
    maxAdjacentDelta: round(maxAdjacentDelta),
    issues
  };
}

function closeFrameSequence(frames: WorkCatFrame[]) {
  if (frames.length <= 1) {
    return frames.map((frame) => ({ ...frame }));
  }
  const copiedFrames = frames.map((frame) => ({ ...frame }));
  if (framesEquivalent(copiedFrames[0], copiedFrames[copiedFrames.length - 1])) {
    return copiedFrames;
  }
  return [...copiedFrames, { ...copiedFrames[0] }];
}

function insertContinuityFrames(frames: WorkCatFrame[]) {
  if (frames.length <= 1) {
    return frames;
  }

  const result: WorkCatFrame[] = [];
  for (let index = 0; index < frames.length - 1; index += 1) {
    const currentFrame = frames[index];
    const nextFrame = frames[index + 1];
    result.push(currentFrame);

    const requiredSegments = Math.max(
      1,
      Math.ceil(adjacentDelta(currentFrame, nextFrame) / (MAX_ADJACENT_DELTA * INSERTION_SAFETY_FACTOR)),
      Math.ceil(Math.abs(nextFrame.bodyY - currentFrame.bodyY) / (MAX_VERTICAL_JUMP * INSERTION_SAFETY_FACTOR)),
      Math.ceil(Math.abs(nextFrame.headY - currentFrame.headY) / (MAX_VERTICAL_JUMP * INSERTION_SAFETY_FACTOR))
    );

    for (let step = 1; step < requiredSegments; step += 1) {
      result.push(interpolateFrame(currentFrame, nextFrame, step / requiredSegments));
    }
  }
  result.push(frames[frames.length - 1]);
  return result;
}

function interpolateFrame(start: WorkCatFrame, end: WorkCatFrame, t: number): WorkCatFrame {
  return {
    ...start,
    bodyY: interpolateInteger(start.bodyY, end.bodyY, t),
    bodyScaleX: interpolateNumber(start.bodyScaleX, end.bodyScaleX, t),
    bodyScaleY: interpolateNumber(start.bodyScaleY, end.bodyScaleY, t),
    headX: interpolateInteger(start.headX, end.headX, t),
    headY: interpolateInteger(start.headY, end.headY, t),
    headTilt: interpolateInteger(start.headTilt, end.headTilt, t),
    tailPhase: interpolateInteger(start.tailPhase, end.tailPhase, t),
    frontPawLift: interpolateInteger(start.frontPawLift, end.frontPawLift, t),
    backPawLift: interpolateInteger(start.backPawLift, end.backPawLift, t),
    earTilt: interpolateInteger(start.earTilt, end.earTilt, t),
    statePhase: interpolateInteger(start.statePhase, end.statePhase, t),
    eyeMode: pickMode(start.eyeMode, end.eyeMode, t),
    mouthMode: pickMode(start.mouthMode, end.mouthMode, t)
  };
}

function adjacentDelta(start: WorkCatFrame, end: WorkCatFrame) {
  return NUMERIC_FRAME_KEYS.reduce((sum, key) => sum + Math.abs(end[key] - start[key]) * DELTA_WEIGHTS[key], 0);
}

function framesEquivalent(start: WorkCatFrame, end: WorkCatFrame) {
  return JSON.stringify(start) === JSON.stringify(end);
}

function interpolateNumber(start: number, end: number, t: number) {
  return round(start + (end - start) * t, 3);
}

function interpolateInteger(start: number, end: number, t: number) {
  return Math.round(start + (end - start) * t);
}

function pickMode<T extends WorkCatEyeMode | WorkCatMouthMode>(start: T, end: T, t: number) {
  return t < 0.5 ? start : end;
}

function round(value: number, precision = 2) {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}
