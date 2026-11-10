import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text } from 'react-native';
import { SIGNAL } from '../assets';
import { BANNER_MS } from '../constants/config';
import { colors } from '../constants/theme';

export type BannerTone = 'tempo' | 'checkpoint' | 'unlock';

type Props = {
  text: string;
  tone: BannerTone;
  /** bumped every time a new banner should play */
  nonce: number;
};

const TINT: Record<BannerTone, string> = {
  tempo: colors.primary,
  checkpoint: colors.warning,
  unlock: colors.secondary,
};

/** the 900 ms slide-in used for tempo shifts, checkpoints and unlocks */
export function BannerToast({ text, tone, nonce }: Props) {
  const life = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!text) {
      return;
    }
    life.setValue(0);
    Animated.timing(life, {
      toValue: 1,
      duration: BANNER_MS,
      useNativeDriver: true,
    }).start();
  }, [life, nonce, text]);

  if (!text) {
    return null;
  }

  const fade = life.interpolate({
    inputRange: [0, 0.15, 0.75, 1],
    outputRange: [0, 1, 1, 0],
  });
  const slide = life.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [120, 0, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.root,
        { borderColor: TINT[tone], opacity: fade, transform: [{ translateX: slide }] },
      ]}>
      <Image source={SIGNAL} style={styles.mark} resizeMode="contain" />
      <Text style={[styles.text, { color: TINT[tone] }]} numberOfLines={1}>
        {text}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(10,10,15,0.86)',
  },
  mark: { width: 24, height: 24 },
  text: { fontSize: 13, lineHeight: 16, fontWeight: '900', letterSpacing: 1.4 },
});

export default BannerToast;
