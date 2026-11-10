import {
  DEFAULT_PROFILE,
  clearProfileStore,
  loadProfile,
  resetProfile,
  sanitizeProfile,
  saveProfile,
} from '../src/game/storage';

describe('local persistence', () => {
  beforeEach(() => clearProfileStore());

  it('hands back the default profile to a brand new courier', async () => {
    const p = await loadProfile();
    expect(p.deliveries).toBe(0);
    expect(p.badges).toEqual([]);
    expect(p.runs).toEqual([]);
    expect(p.activeRoute).toBe(0);
  });

  it('keeps everything a finished run writes', async () => {
    await saveProfile({
      deliveries: 4,
      lifetimeFeathers: 2480,
      bestCombo: 17,
      bestPerfectPct: 82,
      activeRoute: 2,
      badges: ['first_drop', 'metronome'],
      streak: 3,
      lastDailyKey: '20261110',
    });
    const back = await loadProfile();
    expect(back.deliveries).toBe(4);
    expect(back.lifetimeFeathers).toBe(2480);
    expect(back.bestCombo).toBe(17);
    expect(back.bestPerfectPct).toBe(82);
    expect(back.activeRoute).toBe(2);
    expect(back.badges).toEqual(['first_drop', 'metronome']);
    expect(back.streak).toBe(3);
    expect(back.lastDailyKey).toBe('20261110');
  });

  it('merges a patch instead of overwriting the record', async () => {
    await saveProfile({ deliveries: 2, lifetimeFeathers: 500 });
    await saveProfile({ bestCombo: 9 });
    const back = await loadProfile();
    expect(back.deliveries).toBe(2);
    expect(back.lifetimeFeathers).toBe(500);
    expect(back.bestCombo).toBe(9);
  });

  it('repairs a corrupt record instead of throwing', () => {
    const fixed = sanitizeProfile({
      deliveries: -12,
      lifetimeFeathers: 'lots',
      activeRoute: 99,
      badges: 'none',
      bests: null,
      settings: { pace: 'teleport' },
    });
    expect(fixed.deliveries).toBe(0);
    expect(fixed.lifetimeFeathers).toBe(0);
    expect(fixed.activeRoute).toBe(4);
    expect(fixed.badges).toEqual([]);
    expect(fixed.bests.sprint).toBe(0);
    expect(fixed.settings.pace).toBe('steady');
  });

  it('wipes the save on RESET PROGRESS', async () => {
    await saveProfile({ deliveries: 9, badges: ['first_drop'] });
    const fresh = await resetProfile();
    expect(fresh.deliveries).toBe(0);
    expect(fresh.badges).toEqual([]);
    expect(await loadProfile()).toEqual(
      expect.objectContaining({ deliveries: DEFAULT_PROFILE.deliveries }),
    );
  });
});
