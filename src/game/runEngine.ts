import {
  CARRY_PAYOUT_BONUS,
  CHECKPOINT_EVERY,
  COMBO_SHIELD_STEP,
  FEATHERS_CHECKPOINT,
  FEATHERS_GOOD,
  FEATHERS_PERFECT,
  FEATHERS_ROUTE_BONUS,
  MAX_CARRIED,
  MAX_MULT,
  MAX_SHIELDS,
  TEMPO_MAX_DELTA,
  TEMPO_SHIFT_EVERY,
  TEMPO_STEP_BPM,
} from '../constants/config';
import type { Verdict } from './beatClock';
import type { Route } from './routeGenerator';

export type RunMode = 'route' | 'sprint' | 'endurance' | 'precision' | 'daily';

export type SessionConfig = {
  mode: RunMode;
  /** name of the run, repeated on the result screen */
  label: string;
  routeIndex: number;
  routeName: string;
  laneCount: number;
  bpm: number;
  /** PRECISION: only a PERFECT step advances the courier */
  perfectOnly: boolean;
  /** DAILY "NO SHIELDS" modifier: nothing is ever banked as a shield */
  noShields: boolean;
  /** scored runs touch the profile; practice runs do not */
  scored: boolean;
  /** DAILY: the YYYYMMDD seed, so the same date builds the same run */
  seed?: number;
  /** DAILY "CHICK RUSH": almost every median holds a chick */
  chickRush?: boolean;
  /** DAILY "DOUBLE BEATS": raises the share of two-tap lanes */
  doubleBeatChance?: number;
};

export type RunStatus = 'idle' | 'playing' | 'delivered' | 'crashed';

export type RunState = {
  laneIndex: number;
  combo: number;
  bestCombo: number;
  shields: number;
  carried: number;
  chicksRescued: number;
  banked: number;
  unbanked: number;
  bpm: number;
  baseBpm: number;
  /** a double-beat lane armed by the first on-beat tap */
  armed: boolean;
  taps: number;
  perfects: number;
  status: RunStatus;
};

export type RunEventType =
  | 'advance'
  | 'arm'
  | 'shield'
  | 'chick'
  | 'checkpoint'
  | 'tempo'
  | 'delivered'
  | 'crash'
  | 'blocked';

export type RunEvent = { type: RunEventType; value?: number };

export type RunOutcome = 'delivered' | 'crashed' | 'shift-over';

export type RunResult = {
  outcome: RunOutcome;
  label: string;
  mode: RunMode;
  routeIndex: number;
  routeName: string;
  lanesCleared: number;
  laneCount: number;
  feathers: number;
  bestCombo: number;
  perfectPct: number;
  chicks: number;
  taps: number;
  usedShield: boolean;
  scored: boolean;
};

export function multiplier(combo: number): number {
  return Math.min(MAX_MULT, 1 + Math.floor(combo / 3) * 0.5);
}

export function carryBonus(carried: number): number {
  return 1 + CARRY_PAYOUT_BONUS * Math.max(0, carried);
}

export function createRunState(session: SessionConfig): RunState {
  return {
    laneIndex: 0,
    combo: 0,
    bestCombo: 0,
    shields: 0,
    carried: 0,
    chicksRescued: 0,
    banked: 0,
    unbanked: 0,
    bpm: session.bpm,
    baseBpm: session.bpm,
    armed: false,
    taps: 0,
    perfects: 0,
    status: 'idle',
  };
}

function advance(
  state: RunState,
  route: Route,
  session: SessionConfig,
  events: RunEvent[],
): RunState {
  const nextIndex = state.laneIndex + 1;
  let next: RunState = { ...state, laneIndex: nextIndex, armed: false };
  events.push({ type: 'advance', value: nextIndex });

  /* scoop the stranded chick off the median we just stepped onto */
  const lane = route.lanes[Math.min(nextIndex, route.lanes.length - 1)];
  if (lane && lane.chick && next.carried < MAX_CARRIED) {
    next = {
      ...next,
      carried: next.carried + 1,
      chicksRescued: next.chicksRescued + 1,
    };
    events.push({ type: 'chick', value: next.carried });
  }

  /* checkpoint banking - a crash can no longer take these feathers */
  if (nextIndex % CHECKPOINT_EVERY === 0) {
    const moved = next.unbanked + FEATHERS_CHECKPOINT;
    next = { ...next, banked: next.banked + moved, unbanked: 0 };
    events.push({ type: 'checkpoint', value: next.banked });
  }

  /* tempo shift - traffic speeds up and the beat bar sweeps faster */
  if (nextIndex % TEMPO_SHIFT_EVERY === 0) {
    const capped = Math.min(
      next.baseBpm + TEMPO_MAX_DELTA,
      next.bpm + TEMPO_STEP_BPM,
    );
    if (capped !== next.bpm) {
      next = { ...next, bpm: capped };
      events.push({ type: 'tempo', value: capped });
    }
  }

  /* route end */
  if (nextIndex >= session.laneCount) {
    const bonus =
      FEATHERS_ROUTE_BONUS +
      Math.round(next.unbanked * CARRY_PAYOUT_BONUS * next.carried);
    next = {
      ...next,
      banked: next.banked + next.unbanked + bonus,
      unbanked: 0,
      status: 'delivered',
    };
    events.push({ type: 'delivered', value: next.banked });
  }
  return next;
}

/**
 * The whole step resolution in one pure function: a judged tap goes in, the
 * new state and the list of things the screen has to show come out.
 * No timers, no refs, no React - which is what makes it testable.
 */
export function resolveTap(
  state: RunState,
  route: Route,
  session: SessionConfig,
  verdict: Verdict,
): { state: RunState; events: RunEvent[] } {
  const events: RunEvent[] = [];
  if (state.status !== 'idle' && state.status !== 'playing') {
    return { state, events };
  }

  let next: RunState = { ...state, status: 'playing', taps: state.taps + 1 };

  if (verdict === 'miss') {
    if (next.shields > 0) {
      next = {
        ...next,
        shields: next.shields - 1,
        combo: 0,
        armed: false,
        carried: Math.max(0, next.carried - 1),
      };
      events.push({ type: 'shield', value: next.shields });
      return { state: next, events };
    }
    next = { ...next, combo: 0, armed: false, status: 'crashed' };
    events.push({ type: 'crash', value: next.laneIndex });
    return { state: next, events };
  }

  if (verdict === 'perfect') {
    const combo = next.combo + 1;
    const gain = Math.round(
      FEATHERS_PERFECT * multiplier(combo) * carryBonus(next.carried),
    );
    next = {
      ...next,
      combo,
      bestCombo: Math.max(next.bestCombo, combo),
      perfects: next.perfects + 1,
      unbanked: next.unbanked + gain,
    };
    if (
      !session.noShields &&
      combo % COMBO_SHIELD_STEP === 0 &&
      next.shields < MAX_SHIELDS
    ) {
      next = { ...next, shields: next.shields + 1 };
      events.push({ type: 'shield', value: next.shields });
    }
  } else {
    /* GOOD: you still cross, but the rescue combo is gone */
    next = { ...next, combo: 0, unbanked: next.unbanked + FEATHERS_GOOD };
    if (session.perfectOnly) {
      events.push({ type: 'blocked' });
      return { state: next, events };
    }
  }

  /* a double-beat lane needs two on-beat taps: the first one only arms it */
  const target = route.lanes[Math.min(next.laneIndex + 1, route.lanes.length - 1)];
  if (target && target.doubleBeat && !next.armed) {
    next = { ...next, armed: true };
    events.push({ type: 'arm', value: next.laneIndex + 1 });
    return { state: next, events };
  }

  return { state: advance(next, route, session, events), events };
}

export function totalFeathers(state: RunState): number {
  return state.banked + state.unbanked;
}

/** a crash keeps the banked feathers and loses everything still in hand */
export function settleFeathers(state: RunState): number {
  return state.status === 'crashed' ? state.banked : totalFeathers(state);
}

export function buildResult(
  state: RunState,
  session: SessionConfig,
  usedShield: boolean,
): RunResult {
  let outcome: RunOutcome = 'crashed';
  if (state.status === 'delivered') {
    outcome = 'delivered';
  } else if (session.mode === 'endurance') {
    outcome = 'shift-over';
  }
  return {
    outcome,
    label: session.label,
    mode: session.mode,
    routeIndex: session.routeIndex,
    routeName: session.routeName,
    lanesCleared: state.laneIndex,
    laneCount: session.laneCount,
    feathers: settleFeathers(state),
    bestCombo: state.bestCombo,
    perfectPct:
      state.taps > 0 ? Math.round((state.perfects / state.taps) * 100) : 0,
    chicks: state.chicksRescued,
    taps: state.taps,
    usedShield,
    scored: session.scored,
  };
}

/** the game's own words - never "You win" / "Game over" */
export const OUTCOME_HEADLINE: Record<RunOutcome, string> = {
  delivered: 'PARCEL DELIVERED',
  crashed: 'OFF THE BEAT',
  'shift-over': 'SHIFT OVER',
};

export const OUTCOME_HINT: Record<RunOutcome, string> = {
  delivered: 'THE PARCEL MADE IT ACROSS NEON HARBOUR',
  crashed: 'THE TRAFFIC KEPT THE BEAT - YOU DID NOT',
  'shift-over': 'THE NIGHT SHIFT ENDS WHERE THE TEMPO WINS',
};
