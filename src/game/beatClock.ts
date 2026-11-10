import {
  CARRY_WINDOW_PENALTY,
  GOOD_MS,
  PERFECT_MS,
} from '../constants/config';

export type Verdict = 'perfect' | 'good' | 'miss';

/** one beat in milliseconds */
export function beatMs(bpm: number): number {
  const safe = Math.max(30, Math.min(400, bpm || 92));
  return 60000 / safe;
}

/**
 * Phase inside the current beat, 0..1. The beat CENTRE sits at 0.5 so the
 * floating beat bar can sweep left to right with the judged moment in the
 * middle of the track instead of at its edges.
 */
export function beatPhase(elapsedMs: number, bpm: number): number {
  const period = beatMs(bpm);
  const m = elapsedMs % period;
  return (m < 0 ? m + period : m) / period;
}

export function beatIndex(elapsedMs: number, bpm: number): number {
  return Math.floor(elapsedMs / beatMs(bpm));
}

/** distance in ms from the nearest beat centre; 0 is dead on the beat */
export function beatDelta(elapsedMs: number, bpm: number): number {
  const period = beatMs(bpm);
  return Math.abs(beatPhase(elapsedMs, bpm) - 0.5) * period;
}

/** carrying chicks tightens the PERFECT window; GOOD never changes */
export function perfectWindow(carried: number): number {
  const w = PERFECT_MS - CARRY_WINDOW_PENALTY * Math.max(0, carried);
  return Math.max(30, w);
}

export function judge(deltaMs: number, carried: number): Verdict {
  if (deltaMs <= perfectWindow(carried)) {
    return 'perfect';
  }
  if (deltaMs <= GOOD_MS) {
    return 'good';
  }
  return 'miss';
}

/** the whole judgement in one call - what GameScreen uses on every tap */
export function judgeTap(
  elapsedMs: number,
  bpm: number,
  carried: number,
  timingOffsetMs: number,
): { verdict: Verdict; delta: number } {
  const delta = beatDelta(elapsedMs - timingOffsetMs, bpm);
  return { verdict: judge(delta, carried), delta };
}
