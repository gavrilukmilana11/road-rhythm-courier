import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { VERDICT_MS } from '../constants/config';
import { colors } from '../constants/theme';
import type { Verdict } from '../game/beatClock';

type Props = {
  verdict: Verdict | null;
  /** bumped on every tap so repeats of the same verdict still replay */
  nonce: number;
  /** HIGH CONTRAST gives the word a solid backing plate */
  highContrast: boolean;
};

const WORD: Record<Verdict, string> = {
  perfect: 'PERFECT',
  good: 'GOOD',
  miss: 'MISS',
};

const TINT: Record<Verdict, string> = {
  perfect: colors.success,
  good: colors.warning,
  miss: colors.danger,
};

/** the 520 ms pop above the courier that names the last tap */
export function VerdictFlash({ verdict, nonce, highContrast }: Props) {
  const life = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!verdict) {
      return;
    }
    life.setValue(0);
    Animated.timing(life, {
      toValue: 1,
      duration: VERDICT_MS,
      useNativeDriver: true,
    }).start();
  }, [life, nonce, verdict]);

  if (!verdict) {
    return null;
  }

  const fade = life.interpolate({
    inputRange: [0, 0.2, 0.7, 1],
    outputRange: [0, 1, 1, 0],
  });
  const pop = life.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0.7, 1.15, 1],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.root,
        highContrast ? styles.plate : null,
        { opacity: fade, transform: [{ scale: pop }] },
      ]}>
      <Text style={[styles.word, { color: TINT[verdict] }]}>{WORD[verdict]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  plate: {
    backgroundColor: 'rgba(10,10,15,0.82)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  word: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: 2.4,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});

export default VerdictFlash;
