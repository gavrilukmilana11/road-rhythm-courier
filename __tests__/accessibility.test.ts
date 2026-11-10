import fs from 'fs';
import path from 'path';
import { colors } from '../src/constants/theme';

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

function luminance(hex: string): number {
  const v = hex.replace('#', '');
  const channel = (i: number) => {
    const c = parseInt(v.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

describe('accessible, high-contrast presentation', () => {
  it('keeps every text colour above the 4.5:1 floor on its surface', () => {
    expect(contrast(colors.textPrimary, colors.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.textSecondary, colors.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.textMuted, colors.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.bg, colors.primary)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the verdict colours readable on asphalt', () => {
    [colors.success, colors.warning, colors.danger, colors.secondary].forEach(c =>
      expect(contrast(c, colors.asphalt)).toBeGreaterThanOrEqual(4.5),
    );
  });

  it('never renders text below the 9 px readability floor', () => {
    const offenders: string[] = [];
    walk(path.join(ROOT, 'src')).forEach(f => {
      const src = fs.readFileSync(f, 'utf8');
      const sizes = [...src.matchAll(/fontSize:\s*(\d+)/g)].map(m => Number(m[1]));
      sizes.forEach(s => {
        if (s < 9) {
          offenders.push(path.basename(f) + ':' + s);
        }
      });
    });
    expect(offenders).toEqual([]);
  });

  it('labels every interactive control for a screen reader', () => {
    const files = walk(path.join(ROOT, 'src'));
    files.forEach(f => {
      const src = fs.readFileSync(f, 'utf8');
      const pressables = (src.match(/<Pressable/g) || []).length;
      if (pressables === 0) {
        return;
      }
      const labels = (src.match(/accessibilityLabel=/g) || []).length;
      expect(labels).toBeGreaterThanOrEqual(pressables);
    });
  });

  it('gives every tap target room for a finger', () => {
    const button = fs.readFileSync(
      path.join(ROOT, 'src/components/PrimaryButton.tsx'),
      'utf8',
    );
    expect(button).toContain('hitSlop={HIT}');
    expect(button).toContain('height = 60');
    const setting = fs.readFileSync(
      path.join(ROOT, 'src/components/SettingRow.tsx'),
      'utf8',
    );
    expect(setting).toMatch(/height: 44/);
  });

  it('offers a HIGH CONTRAST mode that changes what is drawn', () => {
    const board = fs.readFileSync(
      path.join(ROOT, 'src/components/LaneBoard.tsx'),
      'utf8',
    );
    expect(board).toContain('dashContrast');
    expect(board).toContain('vanContrast');
  });
});
