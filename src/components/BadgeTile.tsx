import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';
import { colors } from '../constants/theme';
import type { BadgeDef, BadgeShape } from '../game/progression';

const GLYPH = 34;

type Props = {
  badge: BadgeDef;
  earned: boolean;
  size: number;
};

/**
 * Every badge mark is drawn with react-native-svg - never an emoji, never an
 * invented asset name. Twelve shapes, twelve different drawings.
 */
function BadgeGlyph({ shape, colour }: { shape: BadgeShape; colour: string }) {
  const s = GLYPH;
  const half = s / 2;
  return (
    <Svg width={s} height={s} viewBox={'0 0 ' + s + ' ' + s}>
      {shape === 'parcel' ? (
        <>
          <Rect x="5" y="9" width="24" height="18" rx="3" stroke={colour} strokeWidth="2" fill="none" />
          <Path d="M17 9 L17 27" stroke={colour} strokeWidth="2" />
        </>
      ) : null}
      {shape === 'metronome' ? (
        <>
          <Polygon points="17,4 28,30 6,30" stroke={colour} strokeWidth="2" fill="none" />
          <Path d="M17 28 L23 10" stroke={colour} strokeWidth="2" />
        </>
      ) : null}
      {shape === 'trio' ? (
        <>
          <Circle cx="10" cy="22" r="5" stroke={colour} strokeWidth="2" fill="none" />
          <Circle cx="17" cy="11" r="5" stroke={colour} strokeWidth="2" fill="none" />
          <Circle cx="24" cy="22" r="5" stroke={colour} strokeWidth="2" fill="none" />
        </>
      ) : null}
      {shape === 'shield' ? (
        <Path
          d="M17 4 L28 9 L28 18 C28 25 17 31 17 31 C17 31 6 25 6 18 L6 9 Z"
          stroke={colour}
          strokeWidth="2"
          fill="none"
        />
      ) : null}
      {shape === 'tempo' ? (
        <Path
          d="M3 22 L9 10 L15 24 L21 8 L27 20 L31 14"
          stroke={colour}
          strokeWidth="2"
          fill="none"
        />
      ) : null}
      {shape === 'moon' ? (
        <Path
          d="M23 5 A13 13 0 1 0 29 20 A10 10 0 1 1 23 5 Z"
          stroke={colour}
          strokeWidth="2"
          fill="none"
        />
      ) : null}
      {shape === 'star' ? (
        <Polygon
          points="17,3 21,13 31,13 23,19 26,30 17,23 8,30 11,19 3,13 13,13"
          stroke={colour}
          strokeWidth="2"
          fill="none"
        />
      ) : null}
      {shape === 'streak' ? (
        <>
          <Circle cx="7" cy={half} r="3" fill={colour} />
          <Circle cx="17" cy={half} r="3" fill={colour} />
          <Circle cx="27" cy={half} r="3" fill={colour} />
          <Path d="M7 17 L27 17" stroke={colour} strokeWidth="2" />
        </>
      ) : null}
      {shape === 'bolt' ? (
        <Polygon points="19,3 8,19 15,19 13,31 26,14 18,14" stroke={colour} strokeWidth="2" fill="none" />
      ) : null}
      {shape === 'lap' ? (
        <>
          <Circle cx={half} cy={half} r="12" stroke={colour} strokeWidth="2" fill="none" />
          <Circle cx={half} cy={half} r="4" fill={colour} />
        </>
      ) : null}
      {shape === 'blade' ? (
        <>
          <Path d="M6 28 L28 6" stroke={colour} strokeWidth="2" />
          <Circle cx="9" cy="25" r="4" stroke={colour} strokeWidth="2" fill="none" />
        </>
      ) : null}
      {shape === 'map' ? (
        <>
          <Path d="M4 8 L13 5 L22 9 L30 6 L30 26 L22 29 L13 25 L4 28 Z" stroke={colour} strokeWidth="2" fill="none" />
          <Path d="M13 5 L13 25" stroke={colour} strokeWidth="2" />
          <Path d="M22 9 L22 29" stroke={colour} strokeWidth="2" />
        </>
      ) : null}
    </Svg>
  );
}

export function BadgeTile({ badge, earned, size }: Props) {
  const colour = earned ? badge.accent : colors.textMuted;
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size },
        earned ? { borderColor: badge.accent } : styles.locked,
      ]}>
      <View style={earned ? null : styles.dim}>
        <BadgeGlyph shape={badge.shape} colour={colour} />
      </View>
      <Text style={[styles.name, { color: earned ? colors.textPrimary : colors.textMuted }]} numberOfLines={2}>
        {badge.name}
      </Text>
      <Text style={styles.condition} numberOfLines={2}>
        {earned ? 'EARNED' : badge.condition}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  locked: { backgroundColor: colors.surface },
  dim: { opacity: 0.35 },
  name: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  condition: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
    color: colors.textMuted,
  },
});

export default BadgeTile;
