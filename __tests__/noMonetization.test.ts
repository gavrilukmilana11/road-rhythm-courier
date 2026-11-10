import fs from 'fs';
import path from 'path';
import { BADGES } from '../src/game/progression';
import { makeRoute, makeSession, perfects, play } from './testRun';

const ROOT = path.join(__dirname, '..');

function walk(dir: string, out: string[] = []): string[] {
  fs.readdirSync(dir).forEach(name => {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(full);
    }
  });
  return out;
}

const SOURCES = walk(path.join(ROOT, 'src')).concat([path.join(ROOT, 'App.tsx')]);
const TEXT = SOURCES.map(f => fs.readFileSync(f, 'utf8')).join('\n');
const LOWER = TEXT.toLowerCase();

describe('offline, no monetization, no real money', () => {
  it('has no network code at all', () => {
    expect(TEXT).not.toMatch(/\bfetch\s*\(/);
    expect(TEXT).not.toMatch(/XMLHttpRequest|WebSocket/);
    expect(TEXT).not.toMatch(/https?:\/\/[a-z]/i);
  });

  it('asks for no INTERNET permission', () => {
    const manifest = fs.readFileSync(
      path.join(ROOT, 'android/app/src/main/AndroidManifest.xml'),
      'utf8',
    );
    expect(manifest).not.toContain('android.permission.INTERNET');
  });

  it('ships no ad, billing or paid wording', () => {
    [
      'admob',
      'applovin',
      'billing',
      'paywall',
      'subscription',
      'in-app-purchase',
      'realmoney',
      'withdraw',
      'rtp',
    ].forEach(word => expect(LOWER).not.toContain(word));
  });

  it('never prints a currency symbol next to a value', () => {
    expect(TEXT).not.toMatch(/[$EUR]\s*\{/);
    expect(TEXT).not.toMatch(/\$\s*\+/);
  });

  it('earns feathers only by playing', () => {
    const session = makeSession({ laneCount: 10 });
    const before = play([], session, makeRoute(10)).state;
    const after = play(perfects(3), session, makeRoute(10)).state;
    expect(before.unbanked).toBe(0);
    expect(after.unbanked).toBeGreaterThan(0);
  });

  it('gates every badge behind a play condition, never behind a price', () => {
    BADGES.forEach(b => {
      expect(b.condition.toLowerCase()).not.toContain('buy');
      expect(b.condition.toLowerCase()).not.toContain('coin');
    });
  });

  it('uses no gesture-handler or navigation dependency', () => {
    const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8');
    expect(pkg).not.toContain('react-native-gesture-handler');
    expect(pkg).not.toContain('@react-navigation');
    expect(TEXT).not.toContain('GestureDetector');
    expect(TEXT).not.toContain('GestureHandlerRootView');
  });
});
