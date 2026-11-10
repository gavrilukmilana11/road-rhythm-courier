import {
  beatDelta,
  beatMs,
  beatPhase,
  judge,
  judgeTap,
  perfectWindow,
} from '../src/game/beatClock';
import { GOOD_MS, PERFECT_MS } from '../src/constants/config';

describe('beat timing', () => {
  it('turns a tempo into a beat length', () => {
    expect(beatMs(120)).toBe(500);
    expect(Math.round(beatMs(92))).toBe(652);
  });

  it('puts the judged beat centre in the middle of the sweep', () => {
    expect(beatPhase(250, 120)).toBeCloseTo(0.5, 5);
    expect(beatDelta(250, 120)).toBeCloseTo(0, 5);
    expect(beatDelta(0, 120)).toBeCloseTo(250, 5);
  });

  it('judges PERFECT, GOOD and MISS by distance from the beat', () => {
    expect(judge(0, 0)).toBe('perfect');
    expect(judge(PERFECT_MS, 0)).toBe('perfect');
    expect(judge(PERFECT_MS + 1, 0)).toBe('good');
    expect(judge(GOOD_MS, 0)).toBe('good');
    expect(judge(GOOD_MS + 1, 0)).toBe('miss');
  });

  it('judges a live tap against its own timestamp', () => {
    expect(judgeTap(250, 120, 0, 0).verdict).toBe('perfect');
    expect(judgeTap(0, 120, 0, 0).verdict).toBe('miss');
  });

  it('honours the TIMING OFFSET setting', () => {
    /* a device judged 60 ms late is corrected by a +60 ms offset */
    expect(judgeTap(310, 120, 0, 60).verdict).toBe('perfect');
  });

  it('tightens the PERFECT window for every carried chick', () => {
    expect(perfectWindow(0)).toBe(PERFECT_MS);
    expect(perfectWindow(1)).toBe(PERFECT_MS - 10);
    expect(perfectWindow(3)).toBe(PERFECT_MS - 30);
    /* GOOD never moves */
    expect(judge(GOOD_MS, 3)).toBe('good');
  });
});
