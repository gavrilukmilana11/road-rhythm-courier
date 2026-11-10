import { MAX_MULT } from '../src/constants/config';
import { multiplier } from '../src/game/runEngine';
import { makeRoute, makeSession, perfects, play } from './testRun';

describe('perfect timing builds a rescue combo', () => {
  const route = makeRoute(40);
  const session = makeSession({ laneCount: 40 });

  it('counts one combo step per PERFECT tap', () => {
    const run = play(perfects(4), session, route);
    expect(run.state.combo).toBe(4);
    expect(run.state.bestCombo).toBe(4);
  });

  it('raises the multiplier every third combo step', () => {
    expect(multiplier(0)).toBe(1);
    expect(multiplier(2)).toBe(1);
    expect(multiplier(3)).toBe(1.5);
    expect(multiplier(6)).toBe(2);
    expect(multiplier(99)).toBe(MAX_MULT);
  });

  it('drops the combo on a GOOD step but still crosses the lane', () => {
    const start = play(perfects(4), session, route).state;
    const after = play(['good'], session, route, start).state;
    expect(after.combo).toBe(0);
    expect(after.laneIndex).toBe(start.laneIndex + 1);
    expect(after.bestCombo).toBe(4);
  });

  it('pays more per PERFECT as the combo grows', () => {
    const one = play(perfects(1), session, route).state;
    const seven = play(perfects(7), session, route).state;
    const lastGain = seven.unbanked - play(perfects(6), session, route).state.unbanked;
    expect(lastGain).toBeGreaterThan(one.unbanked);
  });
});
