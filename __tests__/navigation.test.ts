import fs from 'fs';
import path from 'path';

const ROOT = path.join(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const app = read('App.tsx');

const SCREENS = [
  'LoaderScreen',
  'MenuScreen',
  'GameScreen',
  'ResultScreen',
  'ChallengeScreen',
  'ProgressScreen',
  'CollectionScreen',
  'DailyScreen',
  'SettingsScreen',
];

describe('screen state machine', () => {
  it('declares every screen of the flow, result included', () => {
    ["'loader'", "'menu'", "'game'", "'result'"].forEach(s =>
      expect(app).toContain(s),
    );
    expect(app).toContain('<ResultScreen');
    expect(app).toContain("setScreen('result')");
  });

  it('uses no navigation library', () => {
    expect(app).not.toContain('@react-navigation');
    expect(app).not.toContain('createStackNavigator');
  });

  it('ships one file per screen', () => {
    SCREENS.forEach(s =>
      expect(fs.existsSync(path.join(ROOT, 'src/screens', s + '.tsx'))).toBe(true),
    );
  });

  it('handles the Android system Back button', () => {
    expect(app).toContain('BackHandler');
    expect(app).toContain('hardwareBackPress');
  });

  it('holds the loader for the full capture window and leaves by timer only', () => {
    expect(read('src/constants/config.ts')).toContain('LOADER_DURATION_MS = 8000');
    const loader = read('src/screens/LoaderScreen.tsx');
    expect(loader).toContain('setTimeout(onDone, LOADER_DURATION_MS)');
    expect(loader).not.toContain('onPress');
    expect(loader).not.toContain('Pressable');
  });

  it('routes every sibling screen from the hub with its own caption', () => {
    const menu = read('src/screens/MenuScreen.tsx');
    ['START ROUTE', 'PROGRESS', 'COLLECTION', 'DAILY MODE', 'CHALLENGE', 'SETTINGS', 'HOW TO PLAY'].forEach(
      word => expect(menu).toContain(word),
    );
  });

  it('gives every added screen a way back to the hub', () => {
    ['ChallengeScreen', 'ProgressScreen', 'CollectionScreen', 'DailyScreen', 'SettingsScreen'].forEach(
      s => expect(read('src/screens/' + s + '.tsx')).toContain('label="MENU"'),
    );
  });

  it('uses the harness wording on the result screen', () => {
    const result = read('src/screens/ResultScreen.tsx');
    expect(result).toContain('RUN AGAIN');
    expect(result).toContain('label="MENU"');
  });
});
