import { DOUBLE_BEAT_CHANCE } from '../src/constants/config';
import { fallbackLanes, generateRoute, isRouteSolvable } from '../src/game/routeGenerator';
import type { Lane } from '../src/game/routeGenerator';
import { makeRoute, makeSession, play } from './testRun';

const lanes: Lane[] = fallbackLanes(12).map(l =>
  l.index === 1 ? { ...l, doubleBeat: true } : l,
);
const route = makeRoute(12, lanes);
const session = makeSession({ laneCount: 12 });

describe('double-beat lanes', () => {
  it('arms a pre-step on the first on-beat tap without crossing', () => {
    const first = play(['perfect'], session, route);
    expect(first.state.armed).toBe(true);
    expect(first.state.laneIndex).toBe(0);
    expect(first.events.some(e => e.type === 'arm')).toBe(true);
  });

  it('completes the crossing on the second on-beat tap', () => {
    const armed = play(['perfect'], session, route).state;
    const crossed = play(['perfect'], session, route, armed).state;
    expect(crossed.laneIndex).toBe(1);
    expect(crossed.armed).toBe(false);
  });

  it('still pays and still builds combo on the arming tap', () => {
    const armed = play(['perfect'], session, route).state;
    expect(armed.combo).toBe(1);
    expect(armed.unbanked).toBeGreaterThan(0);
  });

  it('treats a missed second beat as a normal MISS', () => {
    const armed = play(['perfect'], session, route).state;
    const missed = play(['miss'], session, route, armed).state;
    expect(missed.status).toBe('crashed');
    expect(missed.armed).toBe(false);
  });

  it('crosses a plain lane in a single tap', () => {
    const plain = makeRoute(12);
    expect(play(['perfect'], session, plain).state.laneIndex).toBe(1);
  });

  it('never generates two double-beat lanes back to back', () => {
    for (let attempt = 0; attempt < 12; attempt++) {
      const generated = generateRoute({
        name: 'NEON HARBOUR',
        laneCount: 24,
        bpm: 92,
        routeIndex: 0,
        attempt,
      });
      expect(isRouteSolvable(generated.lanes)).toBe(true);
      for (let i = 1; i < generated.lanes.length; i++) {
        expect(generated.lanes[i].doubleBeat && generated.lanes[i - 1].doubleBeat).toBe(
          false,
        );
      }
      expect(generated.lanes[0].doubleBeat).toBe(false);
    }
  });

  it('keeps the two-tap lanes a minority of the route', () => {
    const generated = generateRoute({
      name: 'NEON HARBOUR',
      laneCount: 36,
      bpm: 92,
      routeIndex: 0,
      attempt: 1,
    });
    const share =
      generated.lanes.filter(l => l.doubleBeat).length / generated.lanes.length;
    expect(share).toBeLessThan(DOUBLE_BEAT_CHANCE * 2);
  });
});
