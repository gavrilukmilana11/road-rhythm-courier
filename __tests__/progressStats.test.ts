import { RUN_LOG_LIMIT } from '../src/constants/config';
import { isRouteUnlocked } from '../src/game/progression';
import { buildResult } from '../src/game/runEngine';
import { DEFAULT_PROFILE, sanitizeProfile } from '../src/game/storage';
import { visibleStats } from '../src/components/StatRow';
import { makeRoute, makeSession, perfects, play } from './testRun';

describe('progress stats', () => {
  it('reports lanes, feathers, combo and perfect share of a run', () => {
    const session = makeSession({ laneCount: 10 });
    const run = play(perfects(6), session, makeRoute(10));
    const result = buildResult(run.state, session, false);
    expect(result.lanesCleared).toBe(6);
    expect(result.bestCombo).toBe(6);
    expect(result.perfectPct).toBe(100);
    expect(result.feathers).toBeGreaterThan(0);
  });

  it('counts a mixed run honestly', () => {
    const session = makeSession();
    const run = play(['perfect', 'good', 'perfect', 'good'], session, makeRoute());
    const result = buildResult(run.state, session, false);
    expect(result.taps).toBe(4);
    expect(result.perfectPct).toBe(50);
  });

  it('keeps only the last five runs in the log', () => {
    const many = Array.from({ length: 9 }, (_, i) => ({
      routeName: 'NEON HARBOUR',
      lanesCleared: i,
      laneCount: 18,
      feathers: i * 10,
      perfectPct: 50,
    }));
    const saved = sanitizeProfile({ ...DEFAULT_PROFILE, runs: many });
    expect(saved.runs).toHaveLength(RUN_LOG_LIMIT);
  });

  it('shows the route ladder lock state from the delivery count', () => {
    expect(isRouteUnlocked(1, 0)).toBe(false);
    expect(isRouteUnlocked(1, 3)).toBe(true);
  });

  it('drops a stat pill with nothing to show instead of drawing an empty box', () => {
    const items = [
      { key: 'a', value: '0', label: 'DELIVERIES', accent: '#FFF', empty: true },
      { key: 'b', value: '120', label: 'FEATHERS', accent: '#FFF' },
      { key: 'c', value: 'x4', label: 'COMBO', accent: '#FFF' },
    ];
    expect(visibleStats(items)).toHaveLength(2);
  });
});
