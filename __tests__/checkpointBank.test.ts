import { CHECKPOINT_EVERY, FEATHERS_CHECKPOINT } from '../src/constants/config';
import { settleFeathers, totalFeathers } from '../src/game/runEngine';
import { makeRoute, makeSession, perfects, play } from './testRun';

const route = makeRoute(40);
const session = makeSession({ laneCount: 40 });

describe('checkpoint banking', () => {
  it('banks nothing before the first checkpoint', () => {
    const run = play(perfects(CHECKPOINT_EVERY - 1), session, route).state;
    expect(run.banked).toBe(0);
    expect(run.unbanked).toBeGreaterThan(0);
  });

  it('moves the whole pot into the bank every eighth lane', () => {
    const before = play(perfects(CHECKPOINT_EVERY - 1), session, route).state;
    const run = play(perfects(CHECKPOINT_EVERY), session, route);
    expect(run.state.unbanked).toBe(0);
    expect(run.state.banked).toBeGreaterThanOrEqual(
      before.unbanked + FEATHERS_CHECKPOINT,
    );
    expect(run.events.some(e => e.type === 'checkpoint')).toBe(true);
  });

  it('banks again at the next checkpoint', () => {
    const first = play(perfects(8), session, route).state;
    const second = play(perfects(16), session, route).state;
    expect(second.banked).toBeGreaterThan(first.banked);
  });

  it('keeps banked feathers through a crash and loses the rest', () => {
    const banked = play(perfects(8), session, route).state;
    const risky = play(perfects(3), session, route, banked).state;
    expect(risky.unbanked).toBeGreaterThan(0);
    /* two banked shields absorb the first two misses, the third ends the run */
    const crashed = play(['miss', 'miss', 'miss'], session, route, risky).state;
    expect(crashed.status).toBe('crashed');
    expect(settleFeathers(crashed)).toBe(banked.banked);
    expect(settleFeathers(crashed)).toBeLessThan(totalFeathers(risky));
  });

  it('pays the whole pot out on a finished delivery', () => {
    const run = play(perfects(40), session, route).state;
    expect(run.status).toBe('delivered');
    expect(run.unbanked).toBe(0);
    expect(settleFeathers(run)).toBe(run.banked);
    expect(settleFeathers(run)).toBeGreaterThan(0);
  });
});
