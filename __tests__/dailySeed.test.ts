import {
  DAILY_MODIFIERS,
  dailySeed,
  dayKey,
  isDailyDone,
  nextStreak,
  planForDay,
  secondsToNextDaily,
  streakDots,
} from '../src/game/dailyMode';
import { dailySession } from '../src/game/sessions';
import { DEFAULT_PROFILE, DEFAULT_SETTINGS } from '../src/game/storage';

const DAY = new Date(2026, 10, 10, 12, 0, 0);

describe('daily mode', () => {
  it('turns a calendar date into a stable YYYYMMDD key and seed', () => {
    expect(dayKey(DAY)).toBe('20261110');
    expect(dailySeed(DAY)).toBe(20261110);
  });

  it('builds the exact same run for the same date', () => {
    const a = planForDay(DAY);
    const b = planForDay(new Date(2026, 10, 10, 23, 59, 0));
    expect(a).toEqual(b);
  });

  it('builds a different run on a different date', () => {
    const a = planForDay(DAY);
    const b = planForDay(new Date(2026, 10, 11, 12, 0, 0));
    expect(a.key).not.toBe(b.key);
    expect(a.seed).not.toBe(b.seed);
  });

  it('always picks one of the four named modifiers', () => {
    const plan = planForDay(DAY);
    expect(DAILY_MODIFIERS.map(m => m.id)).toContain(plan.modifier.id);
    expect(plan.modifier.effect.length).toBeGreaterThan(10);
  });

  it('turns the plan into a session that carries the seed', () => {
    const plan = planForDay(DAY);
    const session = dailySession(DAY, DEFAULT_SETTINGS, true);
    expect(session.seed).toBe(plan.seed);
    expect(session.mode).toBe('daily');
    expect(session.scored).toBe(true);
    expect(dailySession(DAY, DEFAULT_SETTINGS, false).scored).toBe(false);
  });

  it('starts a streak, extends it the next day and resets after a gap', () => {
    expect(nextStreak(DEFAULT_PROFILE, DAY)).toBe(1);
    const yesterday = { ...DEFAULT_PROFILE, streak: 3, lastDailyKey: '20261109' };
    expect(nextStreak(yesterday, DAY)).toBe(4);
    const stale = { ...DEFAULT_PROFILE, streak: 3, lastDailyKey: '20261101' };
    expect(nextStreak(stale, DAY)).toBe(1);
  });

  it('does not double count a second attempt on the same day', () => {
    const today = { ...DEFAULT_PROFILE, streak: 5, lastDailyKey: '20261110' };
    expect(isDailyDone(today, DAY)).toBe(true);
    expect(nextStreak(today, DAY)).toBe(5);
  });

  it('draws seven streak dots and counts down to the next day', () => {
    expect(streakDots(3)).toEqual([true, true, true, false, false, false, false]);
    expect(streakDots(99)).toHaveLength(7);
    expect(secondsToNextDaily(DAY)).toBe(12 * 3600);
  });
});
