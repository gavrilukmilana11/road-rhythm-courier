import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
export { SCREEN_W, SCREEN_H };

/**
 * The loader holds for exactly 8000 ms. It is both the product maximum and
 * the value the QA capture window is tuned to - never lower it.
 */
export const LOADER_DURATION_MS = 8000;
export const LOADER_BAR_MS = 7700;
export const LOADER_FADE_MS = 300;
export const SCREEN_FADE_MS = 260;

/* ------------------------------------------------------------- geometry */
export const BOARD_PAD = 6;
export const BOARD_BORDER = 2;
export const BOARD_FRAME = BOARD_PAD + BOARD_BORDER; // 8
export const BOARD_MAX_W = Math.min(SCREEN_W - 32, 380);
export const BOARD_INNER_W = BOARD_MAX_W - 2 * BOARD_FRAME;

export const HEADER_H = 116;
export const CONTROLS_H = 140;
export const CONTROLS_BOTTOM = 24;
export const FIELD_H = Math.max(
  268,
  SCREEN_H - HEADER_H - CONTROLS_H - CONTROLS_BOTTOM - 28,
);

export const BOARD_H = FIELD_H - 12;
export const LANE_H = 64;
export const VISIBLE_LANES = 7;
export const LANES_BEHIND = 2;
export const LANES_AHEAD = 6;
/** the courier sits this far down the field and never moves on screen */
export const ANCHOR_Y = Math.max(LANE_H, BOARD_H - LANE_H * 2.6);

export const COURIER_SIZE = 46;
export const CHICK_SIZE = 22;
export const VEHICLE_W = 54;
export const VEHICLE_H = 34;
export const BEAT_RING_R = 30;
export const BEAT_RING_OUTER_R = 46;

export const BAR_W = SCREEN_W - 32 - 28;

/* -------------------------------------------------------------- timing */
/** judged window around a beat centre, in ms; shrinks by 10 per carried chick */
export const PERFECT_MS = 90;
export const GOOD_MS = 180;
export const CARRY_WINDOW_PENALTY = 10;
export const TIMING_OFFSET_MIN = -60;
export const TIMING_OFFSET_MAX = 60;
export const TIMING_OFFSET_STEP = 10;

export const HOP_MS = 180;
export const VERDICT_MS = 520;
export const BANNER_MS = 900;
export const HINT_MS = 6000;
export const END_DELAY_MS = 900;
export const CRASH_SHAKE_MS = 260;
export const REDUCED_FADE_MS = 120;

export const SPRING_ENTER = { tension: 50, friction: 9 } as const;
export const SPRING_PRESS = { tension: 160, friction: 12 } as const;
export const SPRING_HOP = { tension: 120, friction: 10 } as const;
export const SPRING_POP = { tension: 46, friction: 8 } as const;

/* --------------------------------------------------------------- rules */
export const COMBO_SHIELD_STEP = 5;
export const MAX_SHIELDS = 2;
export const MAX_CARRIED = 3;
export const MAX_MULT = 4;
export const CHECKPOINT_EVERY = 8;
export const TEMPO_SHIFT_EVERY = 6;
export const TEMPO_STEP_BPM = 12;
export const TEMPO_MAX_DELTA = 36;
export const DOUBLE_BEAT_CHANCE = 0.2;
export const CHICK_CHANCE = 0.55;
export const MEDIAN_EVERY = 4;
export const CYCLE_BEATS = 8;
export const SOLVE_ATTEMPTS = 20;

/* ------------------------------------------------------------- economy */
export const FEATHERS_PERFECT = 12;
export const FEATHERS_GOOD = 5;
export const FEATHERS_CHECKPOINT = 40;
export const FEATHERS_ROUTE_BONUS = 150;
export const CARRY_PAYOUT_BONUS = 0.25;

export const PACE_RUSH_FACTOR = 1.26;
export const RUN_LOG_LIMIT = 5;
export const BADGE_TOTAL = 12;

export const STORAGE_KEY = '@road_rhythm_courier_v1';
