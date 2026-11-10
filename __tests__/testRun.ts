/* not a spec file - shared fixtures for the engine tests (see jest.config.js) */
import { fallbackLanes } from '../src/game/routeGenerator';
import type { Lane, Route } from '../src/game/routeGenerator';
import { createRunState, resolveTap } from '../src/game/runEngine';
import type { RunEvent, RunState, SessionConfig } from '../src/game/runEngine';
import type { Verdict } from '../src/game/beatClock';

export function makeRoute(laneCount = 20, lanes?: Lane[]): Route {
  return {
    seed: 1,
    lanes: lanes ?? fallbackLanes(laneCount),
    laneCount,
    bpm: 92,
    name: 'TEST ROUTE',
    fallback: true,
  };
}

export function makeSession(patch: Partial<SessionConfig> = {}): SessionConfig {
  return {
    mode: 'route',
    label: 'ROUTE RUN',
    routeIndex: 0,
    routeName: 'TEST ROUTE',
    laneCount: 20,
    bpm: 92,
    perfectOnly: false,
    noShields: false,
    scored: true,
    ...patch,
  };
}

/** replays a list of verdicts through the pure engine */
export function play(
  verdicts: Verdict[],
  session: SessionConfig,
  route: Route,
  from?: RunState,
): { state: RunState; events: RunEvent[] } {
  let state = from ?? createRunState(session);
  const events: RunEvent[] = [];
  verdicts.forEach(v => {
    const step = resolveTap(state, route, session, v);
    state = step.state;
    events.push(...step.events);
  });
  return { state, events };
}

export function perfects(count: number): Verdict[] {
  return Array.from({ length: count }, () => 'perfect' as Verdict);
}
