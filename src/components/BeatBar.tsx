import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { GOOD_MS } from '../constants/config';
import { beatMs } from '../game/beatClock';
import { perfectWindow } from '../game/beatClock';
import { colors } from '../constants/theme';

type Props = {
  /** 0..1 ramp of the current beat */
  phase: Animated.Value;
  bpm: number;
  carried: number;
  /** the whole track width, measured once by the parent */
  track: number;
  tempoShift: boolean;
};

/**
 * The travelling beat bar: a cyan playhead sweeps the track once per beat and
 * the judged windows are painted where it has to be. PERFECT is the green
 * band in the middle, GOOD the amber one around it - the player can read the
 * timing without any audio at all.
 */
export function BeatBar({ phase, bpm, carried, track, tempoShift }: Props) {
  const period = beatMs(bpm);
  const perfect = Math.max(
    10,
    Math.round((perfectWindow(carried) / period) * track * 2),
  );
  const good = Math.max(
    perfect + 8,
    Math.round((GOOD_MS / period) * track * 2),
  );
  const sweep = phase.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(1, track - 4)],
  });

  return (
    <View style={[styles.track, { width: track }]} pointerEvents="none">
      <View
        style={[
          styles.zone,
          styles.good,
          { width: good, marginLeft: -good / 2 },
        ]}
      />
      <View
        style={[
          styles.zone,
          styles.perfect,
          { width: perfect, marginLeft: -perfect / 2 },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.head,
          tempoShift ? styles.headShift : null,
          { transform: [{ translateX: sweep }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  zone: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
  },
  good: { backgroundColor: 'rgba(255,197,61,0.18)' },
  perfect: { backgroundColor: 'rgba(57,255,136,0.28)' },
  head: {
    position: 'absolute',
    left: 0,
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: colors.secondary,
  },
  headShift: { backgroundColor: colors.primary },
});

export default BeatBar;
