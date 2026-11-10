import {
  CHICK_CHANCE,
  CYCLE_BEATS,
  DOUBLE_BEAT_CHANCE,
  MEDIAN_EVERY,
  SOLVE_ATTEMPTS,
} from '../constants/config';
import { makeSeed, mulberry32, rangeInt } from './rng';

export type Lane = {
  index: number;
  /** a median carries a kerb and may hold a stranded chick */
  median: boolean;
  /** 1 = traffic travels right, -1 = traffic travels left */
  dir: 1 | -1;
  /** how many vehicles share the lane cycle (2..4) */
  vehicles: number;
  /** where the vehicle train starts inside the cycle, 0..1 */
  phase: number;
  /** needs two consecutive on-beat taps */
  doubleBeat: boolean;
  /** a stranded chick waits here */
  chick: boolean;
};

export type Route = {
  seed: number;
  lanes: Lane[];
  laneCount: number;
  bpm: number;
  name: string;
  /** true when the lanes came from the hardcoded guarantee, not the generator */
  fallback: boolean;
};

export type RouteSpec = {
  name: string;
  laneCount: number;
  bpm: number;
  routeIndex: number;
  attempt: number;
  /** daily mode overrides the seed with YYYYMMDD */
  seedOverride?: number;
  /** daily modifier hooks */
  doubleBeatChance?: number;
  chickRush?: boolean;
};

/** a lane is crossable when its cycle keeps at least one whole beat free */
export function laneGapBeats(lane: Lane): number {
  return CYCLE_BEATS - lane.vehicles;
}

export function isLaneCrossable(lane: Lane): boolean {
  return laneGapBeats(lane) >= 1;
}

/**
 * Solvability check: every lane exposes a gap containing a whole beat, no two
 * adjacent lanes are double-beat, and lane 0 is always a plain crossing.
 */
export function isRouteSolvable(lanes: Lane[]): boolean {
  if (lanes.length === 0) {
    return false;
  }
  if (lanes[0].doubleBeat) {
    return false;
  }
  for (let i = 0; i < lanes.length; i++) {
    if (!isLaneCrossable(lanes[i])) {
      return false;
    }
    if (i > 0 && lanes[i].doubleBeat && lanes[i - 1].doubleBeat) {
      return false;
    }
  }
  return true;
}

function buildLanes(seed: number, spec: RouteSpec): Lane[] {
  const rng = mulberry32(seed);
  const lanes: Lane[] = [];
  for (let i = 0; i < spec.laneCount; i++) {
    const median = i > 0 && i % MEDIAN_EVERY === 0;
    const doubleChance =
      spec.doubleBeatChance === undefined ? DOUBLE_BEAT_CHANCE : spec.doubleBeatChance;
    const chickChance = spec.chickRush ? 0.85 : CHICK_CHANCE;
    lanes.push({
      index: i,
      median,
      dir: rng() < 0.5 ? 1 : -1,
      vehicles: median ? rangeInt(rng, 1, 2) : rangeInt(rng, 2, 4),
      phase: rng(),
      doubleBeat: i > 0 && !median && rng() < doubleChance,
      chick: median && rng() < chickChance,
    });
  }
  /* repair adjacency so a solvable layout is almost always the first try */
  for (let i = 1; i < lanes.length; i++) {
    if (lanes[i].doubleBeat && lanes[i - 1].doubleBeat) {
      lanes[i].doubleBeat = false;
    }
  }
  return lanes;
}

/** the guarantee, not the game: used only if 20 generated layouts all fail */
export function fallbackLanes(laneCount: number): Lane[] {
  const lanes: Lane[] = [];
  for (let i = 0; i < laneCount; i++) {
    const median = i > 0 && i % MEDIAN_EVERY === 0;
    lanes.push({
      index: i,
      median,
      dir: i % 2 === 0 ? 1 : -1,
      vehicles: median ? 1 : 2,
      phase: (i % 4) / 4,
      doubleBeat: false,
      chick: median && i % 8 === 0,
    });
  }
  return lanes;
}

export const FALLBACK_ROUTE: Route = {
  seed: 1,
  lanes: fallbackLanes(18),
  laneCount: 18,
  bpm: 92,
  name: 'NEON HARBOUR',
  fallback: true,
};

export function generateRoute(spec: RouteSpec): Route {
  for (let attempt = 0; attempt < SOLVE_ATTEMPTS; attempt++) {
    const seed =
      spec.seedOverride !== undefined
        ? (spec.seedOverride + attempt * 7919) >>> 0
        : makeSeed(spec.routeIndex, spec.attempt + attempt);
    const lanes = buildLanes(seed, spec);
    if (isRouteSolvable(lanes)) {
      return {
        seed,
        lanes,
        laneCount: lanes.length,
        bpm: spec.bpm,
        name: spec.name,
        fallback: false,
      };
    }
  }
  return {
    ...FALLBACK_ROUTE,
    lanes: fallbackLanes(spec.laneCount),
    laneCount: spec.laneCount,
    bpm: spec.bpm,
    name: spec.name,
  };
}
