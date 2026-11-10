import { ROUTES } from './progression';
import { mulberry32 } from './rng';
import type { Profile } from './storage';

export type DailyModifierId =
  | 'double_beats'
  | 'no_shields'
  | 'chick_rush'
  | 'tempo_storm';

export type DailyModifier = {
  id: DailyModifierId;
  name: string;
  effect: string;
};

export const DAILY_MODIFIERS: DailyModifier[] = [
  {
    id: 'double_beats',
    name: 'DOUBLE BEATS',
    effect: 'EVERY SECOND LANE ASKS FOR TWO ON-BEAT TAPS',
  },
  {
    id: 'no_shields',
    name: 'NO SHIELDS',
    effect: 'THE COMBO BANKS NO BEAT SHIELD TODAY',
  },
  {
    id: 'chick_rush',
    name: 'CHICK RUSH',
    effect: 'ALMOST EVERY MEDIAN HOLDS A STRANDED CHICK',
  },
  {
    id: 'tempo_storm',
    name: 'TEMPO STORM',
    effect: 'THE ROUTE OPENS 12 BPM ABOVE ITS USUAL PACE',
  },
];

/** YYYYMMDD for the given date, in local time - the key of today's run */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const two = (n: number) => (n < 10 ? '0' + n : String(n));
  return String(y) + two(m) + two(d);
}

/** the same calendar date builds the same run on every device */
export function dailySeed(date: Date): number {
  return parseInt(dayKey(date), 10) >>> 0 || 1;
}

export type DailyPlan = {
  key: string;
  seed: number;
  routeIndex: number;
  routeName: string;
  laneCount: number;
  bpm: number;
  modifier: DailyModifier;
};

export function planForDay(date: Date): DailyPlan {
  const key = dayKey(date);
  const seed = dailySeed(date);
  const rng = mulberry32(seed);
  const routeIndex = Math.floor(rng() * ROUTES.length) % ROUTES.length;
  const route = ROUTES[routeIndex];
  const modifier =
    DAILY_MODIFIERS[Math.floor(rng() * DAILY_MODIFIERS.length) % DAILY_MODIFIERS.length];
  const bpm = modifier.id === 'tempo_storm' ? route.bpm + 12 : route.bpm;
  return {
    key,
    seed,
    routeIndex,
    routeName: route.name,
    laneCount: Math.min(route.lanes, 20),
    bpm,
    modifier,
  };
}

export function isDailyDone(profile: Profile, date: Date): boolean {
  return profile.lastDailyKey === dayKey(date);
}

/** seconds until the next local midnight - the NEXT DAILY IN countdown */
export function secondsToNextDaily(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
}

/** a run on the day after the last one extends the streak, a gap resets it */
export function nextStreak(profile: Profile, date: Date): number {
  const key = dayKey(date);
  if (profile.lastDailyKey === key) {
    return profile.streak;
  }
  const yesterday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  if (profile.lastDailyKey === dayKey(yesterday)) {
    return profile.streak + 1;
  }
  return 1;
}

/** seven dots, oldest first, the last one being today */
export function streakDots(streak: number): boolean[] {
  const filled = Math.max(0, Math.min(7, streak));
  const dots: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    dots.push(i < filled);
  }
  return dots;
}
