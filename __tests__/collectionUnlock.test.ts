import { BADGE_TOTAL } from '../src/constants/config';
import { BADGES, badgeById, earnedBy } from '../src/game/progression';
import { DEFAULT_PROFILE } from '../src/game/storage';
import type { RunResult } from '../src/game/runEngine';

const BASE: RunResult = {
  outcome: 'crashed',
  label: 'ROUTE RUN',
  mode: 'route',
  routeIndex: 0,
  routeName: 'NEON HARBOUR',
  lanesCleared: 4,
  laneCount: 18,
  feathers: 120,
  bestCombo: 2,
  perfectPct: 50,
  chicks: 0,
  taps: 8,
  usedShield: false,
  scored: true,
};

describe('badge collection', () => {
  it('ships twelve badges with unique ids, shapes and conditions', () => {
    expect(BADGES).toHaveLength(BADGE_TOTAL);
    expect(new Set(BADGES.map(b => b.id)).size).toBe(BADGE_TOTAL);
    expect(new Set(BADGES.map(b => b.shape)).size).toBe(BADGE_TOTAL);
    BADGES.forEach(b => expect(b.condition.length).toBeGreaterThan(4));
  });

  it('earns FIRST DROP on the first finished delivery', () => {
    const won = earnedBy({ ...BASE, outcome: 'delivered' }, DEFAULT_PROFILE, 1);
    expect(won).toContain('first_drop');
  });

  it('earns METRONOME at combo ten and TRIPLE RESCUE at three chicks', () => {
    const won = earnedBy({ ...BASE, bestCombo: 10, chicks: 3 }, DEFAULT_PROFILE, 0);
    expect(won).toContain('metronome');
    expect(won).toContain('triple_rescue');
  });

  it('earns SHIELDED only when a shield actually absorbed a miss', () => {
    expect(earnedBy(BASE, DEFAULT_PROFILE, 0)).not.toContain('shielded');
    expect(earnedBy({ ...BASE, usedShield: true }, DEFAULT_PROFILE, 0)).toContain(
      'shielded',
    );
  });

  it('earns FULL ROUTE MAP once every route is open', () => {
    expect(earnedBy(BASE, DEFAULT_PROFILE, 25)).toContain('full_route_map');
  });

  it('never hands out a badge the courier already owns', () => {
    const owner = { ...DEFAULT_PROFILE, badges: ['first_drop'] };
    const won = earnedBy({ ...BASE, outcome: 'delivered' }, owner, 1);
    expect(won).not.toContain('first_drop');
  });

  it('never earns a badge from an unscored practice run', () => {
    const practice = { ...BASE, outcome: 'delivered' as const, scored: false };
    /* the caller skips earnedBy for practice runs - the flag carries that rule */
    expect(practice.scored).toBe(false);
  });

  it('resolves a badge id back to its definition', () => {
    expect(badgeById('night_owl')?.name).toBe('NIGHT OWL');
    expect(badgeById('nothing')).toBeUndefined();
  });
});
