import fs from 'fs';
import path from 'path';
import { makeRoute, makeSession, play } from './testRun';

const ROOT = path.join(__dirname, '..');

function walk(dir: string, out: string[] = []): string[] {
  fs.readdirSync(dir).forEach(name => {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walk(full, out);
    } else if (/\.tsx$/.test(name)) {
      out.push(full);
    }
  });
  return out;
}

const TSX = walk(path.join(ROOT, 'src')).concat([path.join(ROOT, 'App.tsx')]);

describe('responsive touch controls', () => {
  it('judges a tap against its own timestamp, not a frame counter', () => {
    const game = fs.readFileSync(path.join(ROOT, 'src/screens/GameScreen.tsx'), 'utf8');
    expect(game).toContain('judgeTap(');
    expect(game).toContain('elapsed()');
    expect(game).not.toContain('requestAnimationFrame');
  });

  it('accepts a tap on the GO button and anywhere on the board', () => {
    const game = fs.readFileSync(path.join(ROOT, 'src/screens/GameScreen.tsx'), 'utf8');
    expect(game).toContain('onPress={handleTap}');
    expect(game).toContain('onStep={handleTap}');
  });

  it('changes visible state on the very first tap', () => {
    const session = makeSession();
    const route = makeRoute();
    const idle = play([], session, route).state;
    const tapped = play(['perfect'], session, route).state;
    expect(tapped.laneIndex).toBe(idle.laneIndex + 1);
    expect(tapped.status).toBe('playing');
    expect(tapped.unbanked).toBeGreaterThan(idle.unbanked);
  });

  it('never lets an Animated wrapper swallow a press', () => {
    TSX.forEach(file => {
      const src = fs.readFileSync(file, 'utf8');
      const blocks = src.split('<Animated.View').slice(1);
      blocks.forEach(block => {
        const head = block.split('</Animated.View>')[0];
        const wrapsTouchable = /<(Pressable|TouchableOpacity|PrimaryButton|SecondaryButton)/.test(
          head,
        );
        if (wrapsTouchable) {
          expect(block.slice(0, 400)).toContain('pointerEvents="box-none"');
        }
      });
    });
  });

  it('keeps the native driver off every layout property', () => {
    TSX.forEach(file => {
      const src = fs.readFileSync(file, 'utf8');
      if (!src.includes('useNativeDriver: true')) {
        return;
      }
      expect(src).not.toMatch(
        /(toValue|outputRange|interpolate)[^,;]*['"]?(width|height|margin|padding|top|bottom|left|right)/,
      );
    });
  });

  it('uses Pressable rather than the legacy Touchable components', () => {
    TSX.forEach(file => {
      const src = fs.readFileSync(file, 'utf8');
      expect(src).not.toContain('<TouchableOpacity');
      expect(src).not.toContain('<TouchableHighlight');
    });
  });
});
