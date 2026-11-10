import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import {
  BEAT_RING_OUTER_R,
  BEAT_RING_R,
} from '../constants/config';
import { colors } from '../constants/theme';

const BOX = BEAT_RING_OUTER_R * 2;
const GROW = BEAT_RING_OUTER_R / BEAT_RING_R;

type Props = {
  /** 0..1 ramp of the current beat; the centre of the beat sits at 0.5 */
  phase: Animated.Value;
  tone: 'cyan' | 'green' | 'red';
  visible: boolean;
};

const TONES = {
  cyan: colors.secondary,
  green: colors.success,
  red: colors.danger,
};

/**
 * The metronome you can see. A fixed chrome ring sits around the courier and a
 * second ring falls onto it once per beat - the player taps when the two meet.
 * Hidden when SETTINGS -> BEAT GUIDE is OFF.
 */
export function BeatRing({ phase, tone, visible }: Props) {
  if (!visible) {
    return null;
  }
  const colour = TONES[tone];
  const scale = phase.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [GROW, 1, GROW],
  });
  const glow = phase.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.35, 0.95, 0.35],
  });

  return (
    <View pointerEvents="none" style={styles.root}>
      <Svg width={BOX} height={BOX} viewBox={'0 0 ' + BOX + ' ' + BOX}>
        <Defs>
          <LinearGradient id="ringStroke" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="0.9" />
            <Stop offset="1" stopColor={colour} stopOpacity="0.9" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={BEAT_RING_OUTER_R}
          cy={BEAT_RING_OUTER_R}
          r={BEAT_RING_R}
          stroke="url(#ringStroke)"
          strokeWidth={3}
          fill="none"
        />
      </Svg>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pulse,
          { borderColor: colour, opacity: glow, transform: [{ scale }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: BOX,
    height: BOX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: BEAT_RING_R * 2,
    height: BEAT_RING_R * 2,
    borderRadius: BEAT_RING_R,
    borderWidth: 2,
  },
});

export default BeatRing;
