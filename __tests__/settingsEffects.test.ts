import fs from 'fs';
import path from 'path';
import {
  TIMING_OFFSET_MAX,
  TIMING_OFFSET_MIN,
} from '../src/constants/config';
import { judgeTap, perfectWindow } from '../src/game/beatClock';
import { pacedBpm, routeSession } from '../src/game/sessions';
import {
  DEFAULT_SETTINGS,
  clearProfileStore,
  loadProfile,
  saveProfile,
  sanitizeProfile,
} from '../src/game/storage';

const ROOT = path.join(__dirname, '..');

describe('settings have real effects', () => {
  beforeEach(() => clearProfileStore());

  it('ROUTE PACE RUSH raises every route tempo by 26 percent', () => {
    expect(pacedBpm(100, DEFAULT_SETTINGS)).toBe(100);
    expect(pacedBpm(100, { ...DEFAULT_SETTINGS, pace: 'rush' })).toBe(126);
    const rush = routeSession(0, { ...DEFAULT_SETTINGS, pace: 'rush' });
    expect(rush.bpm).toBeGreaterThan(routeSession(0, DEFAULT_SETTINGS).bpm);
  });

  it('TIMING OFFSET shifts the judged beat centre', () => {
    expect(judgeTap(250, 120, 0, 0).verdict).toBe('perfect');
    expect(judgeTap(120, 120, 0, 0).verdict).toBe('good');
    /* a device that answers 60 ms late is corrected by a +60 ms offset */
    expect(judgeTap(310, 120, 0, 60).verdict).toBe('perfect');
    expect(judgeTap(190, 120, 0, -60).verdict).toBe('perfect');
  });

  it('clamps the offset to the stepper range and to whole steps', () => {
    const low = sanitizeProfile({ settings: { timingOffset: -999 } });
    const high = sanitizeProfile({ settings: { timingOffset: 999 } });
    expect(low.settings.timingOffset).toBe(TIMING_OFFSET_MIN);
    expect(high.settings.timingOffset).toBe(TIMING_OFFSET_MAX);
    expect(sanitizeProfile({ settings: { timingOffset: 23 } }).settings.timingOffset).toBe(20);
  });

  it('persists every option', async () => {
    await saveProfile({
      settings: {
        ...DEFAULT_SETTINGS,
        beatGuide: false,
        pace: 'rush',
        highContrast: true,
        reduceMotion: true,
        timingOffset: -30,
      },
    });
    const back = await loadProfile();
    expect(back.settings.beatGuide).toBe(false);
    expect(back.settings.pace).toBe('rush');
    expect(back.settings.highContrast).toBe(true);
    expect(back.settings.reduceMotion).toBe(true);
    expect(back.settings.timingOffset).toBe(-30);
  });

  it('wires BEAT GUIDE, HIGH CONTRAST and REDUCE MOTION into the game screen', () => {
    const game = fs.readFileSync(path.join(ROOT, 'src/screens/GameScreen.tsx'), 'utf8');
    expect(game).toContain('beatGuide={settings.beatGuide}');
    expect(game).toContain('highContrast={settings.highContrast}');
    expect(game).toContain('reduceMotion={settings.reduceMotion}');
  });

  it('offers no sound or music control anywhere - there is no audio to control', () => {
    const settingsScreen = fs.readFileSync(
      path.join(ROOT, 'src/screens/SettingsScreen.tsx'),
      'utf8',
    );
    ['VOLUME', 'MUSIC', 'SOUND', 'MUTE'].forEach(word =>
      expect(settingsScreen).not.toContain(word),
    );
  });

  it('keeps the carried-chick penalty independent of the settings', () => {
    expect(perfectWindow(2)).toBe(70);
  });
});
