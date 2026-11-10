import { CHALLENGES, challengeBestLabel } from '../src/game/progression';
import { challengeSession } from '../src/game/sessions';
import { DEFAULT_PROFILE, DEFAULT_SETTINGS } from '../src/game/storage';
import { makeRoute, makeSession, play } from './testRun';

describe('challenge sessions', () => {
  it('offers three distinct rule sets', () => {
    expect(CHALLENGES.map(c => c.id)).toEqual(['sprint', 'endurance', 'precision']);
    expect(new Set(CHALLENGES.map(c => c.lanes)).size).toBe(3);
  });

  it('applies the SPRINT configuration', () => {
    const s = challengeSession('sprint', 0, DEFAULT_SETTINGS);
    expect(s.laneCount).toBe(12);
    expect(s.bpm).toBe(124);
    expect(s.perfectOnly).toBe(false);
  });

  it('keeps ENDURANCE running far past a normal route', () => {
    const s = challengeSession('endurance', 0, DEFAULT_SETTINGS);
    expect(s.laneCount).toBeGreaterThan(100);
  });

  it('makes PRECISION advance on PERFECT only', () => {
    const s = challengeSession('precision', 0, DEFAULT_SETTINGS);
    expect(s.perfectOnly).toBe(true);

    const route = makeRoute(24);
    const session = makeSession({ laneCount: 24, perfectOnly: true, mode: 'precision' });
    const good = play(['good'], session, route);
    expect(good.state.laneIndex).toBe(0);
    expect(good.events.some(e => e.type === 'blocked')).toBe(true);

    const perfect = play(['perfect'], session, route);
    expect(perfect.state.laneIndex).toBe(1);
  });

  it('shows no best label before the first session is logged', () => {
    expect(challengeBestLabel('sprint', DEFAULT_PROFILE)).toBe('');
    const played = {
      ...DEFAULT_PROFILE,
      bests: { sprint: 840, endurance: 41, precision: 18 },
    };
    expect(challengeBestLabel('sprint', played)).toBe('840');
    expect(challengeBestLabel('endurance', played)).toBe('LANE 41');
    expect(challengeBestLabel('precision', played)).toBe('18/24');
  });
});
