/**
 * RETRO_NEON preset, trimmed to the tokens this app actually paints with.
 * Night asphalt base, neon magenta CTA, cyan "beat language", acid accents.
 */
export const name = 'RETRO_NEON';

export const colors = {
  bg: '#0A0A0F',
  surface: '#12121F',
  surfaceAlt: '#1A1A2E',
  surfaceDeep: '#16213E',

  primary: '#FF006E',
  primaryLight: '#FF4D94',
  secondary: '#00F5FF',
  purple: '#8B00FF',

  success: '#39FF88',
  warning: '#FFC53D',
  danger: '#FF3B5C',

  textPrimary: '#FFFFFF',
  textSecondary: '#B8B8CC',
  textMuted: '#8A8AA6',

  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.18)',
  chrome: 'rgba(255,255,255,0.12)',
  gloss: 'rgba(255,255,255,0.16)',
  plate: 'rgba(0,0,0,0.42)',
  asphalt: '#12121F',
  median: '#1A1A2E',
} as const;

export const gradients: Record<string, string[]> = {
  /* CTA plate - never flat */
  cta: ['#FF006E', '#FF4D94'],
  ctaDim: ['#3A3A4A', '#2A2A38'],
  cyan: ['#00F5FF', '#0094C4'],
  bar: ['#FF006E', '#00F5FF'],
  tile: ['rgba(26,26,46,0.92)', 'rgba(18,18,31,0.92)'],
  success: ['#39FF88', '#0FB55C'],
  danger: ['#FF3B5C', '#A3102B'],
};

/**
 * Every screen shows the SAME bg_game photo; the overlay is what tells the
 * screens apart. Loader is deliberately the darkest (rule 2.3 / pHash gate).
 */
export const overlays: Record<string, string[]> = {
  loader: ['rgba(10,10,15,0.96)', 'rgba(22,33,62,0.92)', 'rgba(10,10,15,0.98)'],
  menu: ['rgba(10,10,15,0.72)', 'rgba(26,26,46,0.80)', 'rgba(10,10,15,0.90)'],
  game: ['rgba(10,10,15,0.55)', 'rgba(13,27,42,0.78)', 'rgba(10,10,15,0.86)'],
  result: ['rgba(10,10,15,0.90)', 'rgba(26,26,46,0.94)', 'rgba(10,10,15,0.96)'],
  panel: ['rgba(10,10,15,0.86)', 'rgba(22,22,40,0.90)', 'rgba(10,10,15,0.94)'],
};

export const shadows = {
  cta: {
    shadowColor: '#FF006E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 14,
  },
  card: {
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
} as const;

export const typography = {
  hero: { fontSize: 34, fontWeight: '900' as const, letterSpacing: 3.5 },
  title: { fontSize: 24, fontWeight: '800' as const, letterSpacing: 1.8 },
  body: { fontSize: 15, fontWeight: '600' as const, letterSpacing: 0.2 },
  caption: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 2,
  },
  score: {
    fontSize: 22,
    fontWeight: '800' as const,
    fontVariant: ['tabular-nums'] as const,
  },
} as const;

export const radius = { bar: 3, pill: 10, card: 18, tile: 20, hero: 22 } as const;

export default { name, colors, gradients, overlays, shadows, typography, radius };
