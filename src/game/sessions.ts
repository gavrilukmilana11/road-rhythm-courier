import { planForDay } from './dailyMode';
import { CHALLENGES, routeAt } from './progression';
import type { ChallengeId } from './progression';
import type { SessionConfig } from './runEngine';
import type { Settings } from './storage';
import { PACE_RUSH_FACTOR } from '../constants/config';

/** ROUTE PACE is a real effect: RUSH raises every route BPM by 26 % */
export function pacedBpm(bpm: number, settings: Settings): number {
  return Math.round(bpm * (settings.pace === 'rush' ? PACE_RUSH_FACTOR : 1));
}

/** the plain route run started by START ROUTE on the hub */
export function routeSession(
  activeRoute: number,
  settings: Settings,
): SessionConfig {
  const route = routeAt(activeRoute);
  return {
    mode: 'route',
    label: 'ROUTE RUN',
    routeIndex: route.index,
    routeName: route.name,
    laneCount: route.lanes,
    bpm: pacedBpm(route.bpm, settings),
    perfectOnly: false,
    noShields: false,
    scored: true,
  };
}

/** SPRINT / ENDURANCE / PRECISION - same loop, different rule set */
export function challengeSession(
  id: ChallengeId,
  activeRoute: number,
  settings: Settings,
): SessionConfig {
  const mode = CHALLENGES.find(c => c.id === id) ?? CHALLENGES[0];
  return {
    mode: id,
    label: mode.name + ' SESSION',
    routeIndex: activeRoute,
    routeName: mode.name,
    laneCount: mode.lanes,
    bpm: pacedBpm(mode.bpm, settings),
    perfectOnly: id === 'precision',
    noShields: false,
    scored: true,
  };
}

/** the one run a day that moves the streak, plus unscored practice repeats */
export function dailySession(
  date: Date,
  settings: Settings,
  scored: boolean,
): SessionConfig {
  const plan = planForDay(date);
  return {
    mode: 'daily',
    label: 'DAILY ' + plan.modifier.name,
    routeIndex: plan.routeIndex,
    routeName: plan.routeName,
    laneCount: plan.laneCount,
    bpm: pacedBpm(plan.bpm, settings),
    perfectOnly: false,
    noShields: plan.modifier.id === 'no_shields',
    scored,
    seed: plan.seed,
    chickRush: plan.modifier.id === 'chick_rush',
    doubleBeatChance: plan.modifier.id === 'double_beats' ? 0.45 : undefined,
  };
}
