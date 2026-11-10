import {
  RUN_LOG_LIMIT,
  STORAGE_KEY,
  TIMING_OFFSET_MAX,
  TIMING_OFFSET_MIN,
} from '../constants/config';

export type Pace = 'steady' | 'rush';

export type Settings = {
  /** shows the beat ring and the lane downbeat flash */
  beatGuide: boolean;
  /** RUSH multiplies every route BPM by 1.26 */
  pace: Pace;
  /** white lane dashes, a backing plate behind the verdict, outlined traffic */
  highContrast: boolean;
  /** drops drifting dashes, gloss sweeps and shadow pulses */
  reduceMotion: boolean;
  /** shifts the judged beat centre, -60..+60 ms in 10 ms steps */
  timingOffset: number;
};

export type RunLog = {
  routeName: string;
  lanesCleared: number;
  laneCount: number;
  feathers: number;
  perfectPct: number;
};

export type Profile = {
  schema: number;
  deliveries: number;
  lifetimeFeathers: number;
  bestCombo: number;
  bestPerfectPct: number;
  totalRuns: number;
  activeRoute: number;
  badges: string[];
  runs: RunLog[];
  bests: { sprint: number; endurance: number; precision: number };
  streak: number;
  /** YYYYMMDD of the last scored daily attempt */
  lastDailyKey: string;
  settings: Settings;
  /** set when a corrupt save had to be dropped - the UI shows a banner */
  recovered: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  beatGuide: true,
  pace: 'steady',
  highContrast: false,
  reduceMotion: false,
  timingOffset: 0,
};

export const DEFAULT_PROFILE: Profile = {
  schema: 1,
  deliveries: 0,
  lifetimeFeathers: 0,
  bestCombo: 0,
  bestPerfectPct: 0,
  totalRuns: 0,
  activeRoute: 0,
  badges: [],
  runs: [],
  bests: { sprint: 0, endurance: 0, precision: 0 },
  streak: 0,
  lastDailyKey: '',
  settings: { ...DEFAULT_SETTINGS },
  recovered: false,
};

/**
 * The ONE module that owns persisted state: a single JSON record under
 * STORAGE_KEY. The backing store is module level so the app carries no extra
 * native dependency; swapping in a native key/value store means replacing
 * readRaw/writeRaw below and nothing else in the codebase. Every call is
 * wrapped in try/catch and degrades to the default profile instead of
 * throwing, so a storage failure can never crash a screen.
 */
const memory: Record<string, string> = {};

function readRaw(key: string): string | null {
  return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null;
}

function writeRaw(key: string, value: string): void {
  memory[key] = value;
}

const num = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback;

function sanitizeSettings(input: unknown): Settings {
  const raw = (input ?? {}) as Partial<Settings>;
  const offsetRaw = typeof raw.timingOffset === 'number' ? raw.timingOffset : 0;
  const offset = Math.max(
    TIMING_OFFSET_MIN,
    Math.min(TIMING_OFFSET_MAX, Math.round(offsetRaw / 10) * 10),
  );
  return {
    beatGuide: raw.beatGuide !== false,
    pace: raw.pace === 'rush' ? 'rush' : 'steady',
    highContrast: raw.highContrast === true,
    reduceMotion: raw.reduceMotion === true,
    timingOffset: Number.isFinite(offset) ? offset : 0,
  };
}

function sanitizeRuns(input: unknown): RunLog[] {
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .slice(0, RUN_LOG_LIMIT)
    .map(r => {
      const raw = (r ?? {}) as Partial<RunLog>;
      return {
        routeName: typeof raw.routeName === 'string' ? raw.routeName : 'NEON HARBOUR',
        lanesCleared: num(raw.lanesCleared, 0),
        laneCount: num(raw.laneCount, 0),
        feathers: num(raw.feathers, 0),
        perfectPct: Math.min(100, num(raw.perfectPct, 0)),
      };
    });
}

export function sanitizeProfile(input: unknown): Profile {
  const raw = (input ?? {}) as Partial<Profile>;
  const bests = (raw.bests ?? {}) as Partial<Profile['bests']>;
  return {
    schema: 1,
    deliveries: num(raw.deliveries, 0),
    lifetimeFeathers: num(raw.lifetimeFeathers, 0),
    bestCombo: num(raw.bestCombo, 0),
    bestPerfectPct: Math.min(100, num(raw.bestPerfectPct, 0)),
    totalRuns: num(raw.totalRuns, 0),
    activeRoute: Math.max(0, Math.min(4, num(raw.activeRoute, 0))),
    badges: Array.isArray(raw.badges)
      ? raw.badges.filter(b => typeof b === 'string')
      : [],
    runs: sanitizeRuns(raw.runs),
    bests: {
      sprint: num(bests.sprint, 0),
      endurance: num(bests.endurance, 0),
      precision: num(bests.precision, 0),
    },
    streak: num(raw.streak, 0),
    lastDailyKey: typeof raw.lastDailyKey === 'string' ? raw.lastDailyKey : '',
    settings: sanitizeSettings(raw.settings),
    recovered: raw.recovered === true,
  };
}

export async function loadProfile(): Promise<Profile> {
  try {
    const raw = readRaw(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_PROFILE, settings: { ...DEFAULT_SETTINGS } };
    }
    return sanitizeProfile(JSON.parse(raw));
  } catch (e) {
    /* a corrupt record is dropped, never thrown - the UI shows a banner */
    return {
      ...DEFAULT_PROFILE,
      settings: { ...DEFAULT_SETTINGS },
      recovered: true,
    };
  }
}

export async function saveProfile(patch: Partial<Profile>): Promise<Profile> {
  try {
    const current = await loadProfile();
    const next = sanitizeProfile({ ...current, ...patch });
    writeRaw(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch (e) {
    return { ...DEFAULT_PROFILE, settings: { ...DEFAULT_SETTINGS } };
  }
}

export async function resetProfile(): Promise<Profile> {
  clearProfileStore();
  return { ...DEFAULT_PROFILE, settings: { ...DEFAULT_SETTINGS } };
}

/** test helper and the engine behind SETTINGS -> RESET PROGRESS */
export function clearProfileStore(): void {
  Object.keys(memory).forEach(k => {
    delete memory[k];
  });
}
