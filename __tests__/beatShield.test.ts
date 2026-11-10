import { COMBO_SHIELD_STEP, MAX_SHIELDS } from '../src/constants/config';
import { makeRoute, makeSession, perfects, play } from './testRun';

const route = makeRoute(40);
const session = makeSession({ laneCount: 40 });

describe('beat shield banked by the combo', () => {
  it('banks a shield every fifth combo step', () => {
    expect(play(perfects(4), session, route).state.shields).toBe(0);
    expect(play(perfects(COMBO_SHIELD_STEP), session, route).state.shields).toBe(1);
    expect(play(perfects(10), session, route).state.shields).toBe(2);
  });

  it('never banks more than two', () => {
    expect(play(perfects(30), session, route).state.shields).toBeLessThanOrEqual(
      MAX_SHIELDS,
    );
  });

  it('spends a shield on a miss instead of ending the run', () => {
    const armed = play(perfects(COMBO_SHIELD_STEP), session, route).state;
    const hit = play(['miss'], session, route, armed);
    expect(hit.state.status).toBe('playing');
    expect(hit.state.shields).toBe(0);
    expect(hit.state.combo).toBe(0);
    expect(hit.state.laneIndex).toBe(armed.laneIndex);
    expect(hit.events.some(e => e.type === 'shield')).toBe(true);
  });

  it('drops one carried chick when the shield absorbs the hit', () => {
    const carrying = play(perfects(10), session, route).state;
    expect(carrying.carried).toBe(1);
    const hit = play(['miss'], session, route, carrying).state;
    expect(hit.carried).toBe(0);
  });

  it('ends the run on a miss with no shield left', () => {
    const run = play(['miss'], session, route);
    expect(run.state.status).toBe('crashed');
    expect(run.events.some(e => e.type === 'crash')).toBe(true);
  });

  it('ignores further taps once the run has ended', () => {
    const dead = play(['miss'], session, route).state;
    const after = play(['perfect', 'perfect'], session, route, dead).state;
    expect(after).toEqual(dead);
  });

  it('banks no shield at all under the NO SHIELDS daily modifier', () => {
    const strict = makeSession({ laneCount: 40, noShields: true });
    expect(play(perfects(10), strict, route).state.shields).toBe(0);
  });
});
