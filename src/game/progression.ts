import { BADGE_TOTAL } from '../constants/config';
import type { RunResult } from './runEngine';
import type { Profile } from './storage';

export type RouteDef = {
  index: number;
  name: string;
  lanes: number;
  bpm: number;
  /** deliveries needed before the route opens */
  unlockAt: number;
};

/** the five city districts of the night route ladder */
export const ROUTES: RouteDef[] = [
  { index: 0, name: 'NEON HARBOUR', lanes: 18, bpm: 92, unlockAt: 0 },
  { index: 1, name: 'MARKET MILE', lanes: 24, bpm: 100, unlockAt: 3 },
  { index: 2, name: 'TRANSIT LOOP', lanes: 28, bpm: 108, unlockAt: 8 },
  { index: 3, name: 'SKYLINE BYPASS', lanes: 32, bpm: 116, unlockAt: 15 },
  { index: 4, name: 'MIDNIGHT MILE', lanes: 36, bpm: 124, unlockAt: 25 },
];

export function routeAt(index: number): RouteDef {
  return ROUTES[Math.max(0, Math.min(ROUTES.length - 1, index))];
}

export function isRouteUnlocked(index: number, deliveries: number): boolean {
  return deliveries >= routeAt(index).unlockAt;
}

export function unlockedCount(deliveries: number): number {
  return ROUTES.filter(r => deliveries >= r.unlockAt).length;
}

/** the route that just opened because of this delivery, if any */
export function newlyUnlocked(before: number, after: number): RouteDef | null {
  const opened = ROUTES.find(r => before < r.unlockAt && after >= r.unlockAt);
  return opened ?? null;
}

/* ----------------------------------------------------------------- badges */

export type BadgeShape =
  | 'parcel'
  | 'metronome'
  | 'trio'
  | 'shield'
  | 'tempo'
  | 'moon'
  | 'star'
  | 'streak'
  | 'bolt'
  | 'lap'
  | 'blade'
  | 'map';

export type BadgeDef = {
  id: string;
  name: string;
  condition: string;
  shape: BadgeShape;
  accent: string;
};

/** twelve courier badges, all earned by play - there is no shop, nothing to buy */
export const BADGES: BadgeDef[] = [
  { id: 'first_drop', name: 'FIRST DROP', condition: 'FINISH 1 DELIVERY', shape: 'parcel', accent: '#FF006E' },
  { id: 'metronome', name: 'METRONOME', condition: 'REACH COMBO 10', shape: 'metronome', accent: '#00F5FF' },
  { id: 'triple_rescue', name: 'TRIPLE RESCUE', condition: 'CARRY 3 CHICKS IN ONE RUN', shape: 'trio', accent: '#FFC53D' },
  { id: 'shielded', name: 'SHIELDED', condition: 'SURVIVE A MISS WITH A SHIELD', shape: 'shield', accent: '#00F5FF' },
  { id: 'tempo_rider', name: 'TEMPO RIDER', condition: 'CLEAR A TEMPO SHIFT AT COMBO 5', shape: 'tempo', accent: '#8B00FF' },
  { id: 'night_owl', name: 'NIGHT OWL', condition: 'FINISH MIDNIGHT MILE', shape: 'moon', accent: '#B8B8CC' },
  { id: 'perfectionist', name: 'PERFECTIONIST', condition: '100% PERFECT ON A ROUTE', shape: 'star', accent: '#39FF88' },
  { id: 'streak_7', name: 'STREAK 7', condition: 'KEEP A 7 DAY DAILY STREAK', shape: 'streak', accent: '#39FF88' },
  { id: 'sprinter', name: 'SPRINTER', condition: 'CLEAR SPRINT IN UNDER 20 TAPS', shape: 'bolt', accent: '#FF006E' },
  { id: 'marathon', name: 'MARATHON', condition: 'REACH LANE 40 IN ENDURANCE', shape: 'lap', accent: '#FFC53D' },
  { id: 'surgeon', name: 'SURGEON', condition: 'CLEAR A PRECISION SESSION', shape: 'blade', accent: '#FF3B5C' },
  { id: 'full_route_map', name: 'FULL ROUTE MAP', condition: 'UNLOCK ALL 5 ROUTES', shape: 'map', accent: '#00F5FF' },
];

export function badgeById(id: string): BadgeDef | undefined {
  return BADGES.find(b => b.id === id);
}

/**
 * Which badges this run earned. Pure: profile in, id list out, so the result
 * screen and the unit test see exactly the same answer.
 */
export function earnedBy(
  result: RunResult,
  profile: Profile,
  deliveriesAfter: number,
): string[] {
  const won: string[] = [];
  const add = (id: string) => {
    if (!profile.badges.includes(id) && !won.includes(id)) {
      won.push(id);
    }
  };

  if (result.outcome === 'delivered') {
    add('first_drop');
  }
  if (result.bestCombo >= 10) {
    add('metronome');
  }
  if (result.chicks >= 3) {
    add('triple_rescue');
  }
  if (result.usedShield) {
    add('shielded');
  }
  if (result.bestCombo >= 5 && result.lanesCleared >= 6) {
    add('tempo_rider');
  }
  if (result.outcome === 'delivered' && result.routeIndex === 4) {
    add('night_owl');
  }
  if (result.outcome === 'delivered' && result.perfectPct >= 100) {
    add('perfectionist');
  }
  if (profile.streak >= 7) {
    add('streak_7');
  }
  if (result.mode === 'sprint' && result.outcome === 'delivered' && result.taps < 20) {
    add('sprinter');
  }
  if (result.mode === 'endurance' && result.lanesCleared >= 40) {
    add('marathon');
  }
  if (result.mode === 'precision' && result.outcome === 'delivered') {
    add('surgeon');
  }
  if (unlockedCount(deliveriesAfter) >= ROUTES.length) {
    add('full_route_map');
  }
  return won;
}

export function badgeProgress(profile: Profile): string {
  return profile.badges.length + ' / ' + BADGE_TOTAL;
}

/* ---------------------------------------------------------- challenge modes */

export type ChallengeId = 'sprint' | 'endurance' | 'precision';

export type ChallengeDef = {
  id: ChallengeId;
  name: string;
  rule: string;
  lanes: number;
  bpm: number;
  accent: string;
};

export const CHALLENGES: ChallengeDef[] = [
  {
    id: 'sprint',
    name: 'SPRINT',
    rule: '12 LANES AT A FIXED 124 BPM - SCORE IS FEATHERS',
    lanes: 12,
    bpm: 124,
    accent: '#FF006E',
  },
  {
    id: 'endurance',
    name: 'ENDURANCE',
    rule: 'LANES KEEP COMING, +6 BPM EVERY 8 - RUN UNTIL A CRASH',
    lanes: 120,
    bpm: 96,
    accent: '#00F5FF',
  },
  {
    id: 'precision',
    name: 'PRECISION',
    rule: 'ONLY A PERFECT STEP MOVES YOU - ONE MISS ENDS THE RUN',
    lanes: 24,
    bpm: 104,
    accent: '#39FF88',
  },
];

export function challengeBestLabel(id: ChallengeId, profile: Profile): string {
  const best = profile.bests[id] ?? 0;
  if (best <= 0) {
    return '';
  }
  if (id === 'endurance') {
    return 'LANE ' + best;
  }
  if (id === 'precision') {
    return best + '/24';
  }
  return String(best);
}
