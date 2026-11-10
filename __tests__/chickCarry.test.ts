import { CARRY_PAYOUT_BONUS, MAX_CARRIED } from '../src/constants/config';
import { perfectWindow } from '../src/game/beatClock';
import { carryBonus } from '../src/game/runEngine';
import { makeRoute, makeSession, perfects, play } from './testRun';

/* the guaranteed fallback board puts a stranded chick on lanes 8, 16, 24 */
const route = makeRoute(40);
const session = makeSession({ laneCount: 40 });

describe('chick rescue carry', () => {
  it('picks a chick off the median the courier steps onto', () => {
    const before = play(perfects(7), session, route).state;
    expect(before.carried).toBe(0);
    const after = play(perfects(8), session, route);
    expect(after.state.carried).toBe(1);
    expect(after.events.some(e => e.type === 'chick')).toBe(true);
  });

  it('counts every rescued chick for the delivery report', () => {
    const run = play(perfects(16), session, route).state;
    expect(run.chicksRescued).toBe(2);
  });

  it('never carries more than three', () => {
    const run = play(perfects(40), session, route).state;
    expect(run.carried).toBeLessThanOrEqual(MAX_CARRIED);
  });

  it('pays 25 percent more per carried chick', () => {
    expect(carryBonus(0)).toBe(1);
    expect(carryBonus(1)).toBeCloseTo(1 + CARRY_PAYOUT_BONUS, 5);
    expect(carryBonus(3)).toBeCloseTo(1.75, 5);
  });

  it('tightens the PERFECT window for every chick on board', () => {
    expect(perfectWindow(0)).toBeGreaterThan(perfectWindow(1));
    expect(perfectWindow(1)).toBeGreaterThan(perfectWindow(3));
    expect(perfectWindow(3)).toBe(60);
  });

  it('earns more per step while carrying than while empty handed', () => {
    const empty = play(perfects(3), session, route).state.unbanked;
    const carryingStart = play(perfects(8), session, route).state;
    const carryingNext = play(perfects(3), session, route, carryingStart).state;
    const carriedGain = carryingNext.unbanked - carryingStart.unbanked;
    expect(carryingStart.carried).toBe(1);
    expect(carriedGain).toBeGreaterThan(empty);
  });
});
