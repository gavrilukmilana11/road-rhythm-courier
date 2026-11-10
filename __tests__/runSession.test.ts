import { DEFAULT_SETTINGS } from '../src/game/storage';
import { routeSession } from '../src/game/sessions';
import { generateRoute, isRouteSolvable } from '../src/game/routeGenerator';
import { OUTCOME_HEADLINE, buildResult, createRunState } from '../src/game/runEngine';
import { makeRoute, makeSession, perfects, play } from './testRun';

describe('route run session', () => {
  it('starts a run on the active route with its own lane count and tempo', () => {
    const session = routeSession(2, DEFAULT_SETTINGS);
    expect(session.routeName).toBe('TRANSIT LOOP');
    expect(session.laneCount).toBe(28);
    expect(session.bpm).toBe(108);
    expect(session.scored).toBe(true);
  });

  it('builds a solvable, seeded board for that session', () => {
    const session = routeSession(0, DEFAULT_SETTINGS);
    const route = generateRoute({
      name: session.routeName,
      laneCount: session.laneCount,
      bpm: session.bpm,
      routeIndex: session.routeIndex,
      attempt: 3,
    });
    expect(route.lanes).toHaveLength(session.laneCount);
    expect(isRouteSolvable(route.lanes)).toBe(true);
    expect(route.seed).toBeGreaterThan(0);
  });

  it('opens idle - nothing has happened until the first tap', () => {
    const state = createRunState(makeSession());
    expect(state.status).toBe('idle');
    expect(state.laneIndex).toBe(0);
    expect(state.taps).toBe(0);
  });

  it('reaches the delivered state at the last lane of the route', () => {
    const session = makeSession({ laneCount: 10 });
    const route = makeRoute(10);
    const run = play(perfects(10), session, route);
    expect(run.state.status).toBe('delivered');
    expect(run.state.unbanked).toBe(0);
    const result = buildResult(run.state, session, false);
    expect(result.outcome).toBe('delivered');
    expect(OUTCOME_HEADLINE[result.outcome]).toBe('PARCEL DELIVERED');
    expect(result.feathers).toBeGreaterThan(0);
  });

  it('ends a bad run within two taps and in the game own words', () => {
    const session = makeSession();
    const route = makeRoute();
    const run = play(['miss'], session, route);
    expect(run.state.status).toBe('crashed');
    const result = buildResult(run.state, session, false);
    expect(OUTCOME_HEADLINE[result.outcome]).toBe('OFF THE BEAT');
  });

  it('never ends a run the player did not tap for', () => {
    const state = createRunState(makeSession());
    expect(state.status).not.toBe('crashed');
    expect(state.status).not.toBe('delivered');
  });
});
