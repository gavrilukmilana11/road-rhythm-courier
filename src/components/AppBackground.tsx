import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import { SCREEN_H, SCREEN_W } from '../constants/config';
import { colors } from '../constants/theme';

export type DecorKind = 'dashes' | 'blobs' | 'none';

type Props = {
  /** gradient stops painted over bg_game - this is what tells screens apart */
  overlay: string[];
  decor?: DecorKind;
  reduceMotion?: boolean;
  children?: React.ReactNode;
};

const DASH_COUNT = 14;

/** drifting lane dashes - the one piece of motion the background carries */
function Dashes({ still }: { still: boolean }) {
  const drift = useRef(new Animated.Value(0)).current;
  const marks = useMemo(
    () =>
      Array.from({ length: DASH_COUNT }, (_, i) => ({
        id: i,
        x: Math.round(((i * 97) % 100) / 100 * (SCREEN_W - 12)) + 6,
        y: Math.round(((i * 61) % 100) / 100 * SCREEN_H),
        tint: i % 3 === 0 ? colors.secondary : 'rgba(255,255,255,0.22)',
      })),
    [],
  );

  useEffect(() => {
    if (still) {
      return;
    }
    drift.setValue(0);
    const loop = Animated.loop(
      Animated.timing(drift, {
        toValue: 1,
        duration: 5200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [drift, still]);

  const shift = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -94],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {marks.map(m => (
        <Animated.View
          key={m.id}
          style={[
            styles.dash,
            {
              left: m.x,
              top: m.y,
              backgroundColor: m.tint,
              transform: [{ translateY: shift }],
            },
          ]}
        />
      ))}
    </View>
  );
}

/** three soft street-lamp glows, pure decoration, never animated */
function Blobs() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.blob, styles.blobPink]} />
      <View style={[styles.blob, styles.blobCyan]} />
      <View style={[styles.blob, styles.blobPurple]} />
    </View>
  );
}

/**
 * bg_game is the ONLY background image in the app. Every screen stacks its own
 * gradient and decor on top of it, which is what keeps Loader, Menu, Game and
 * Result visually distinct while the art contract stays at one file.
 */
export function AppBackground({
  overlay,
  decor = 'none',
  reduceMotion = false,
  children,
}: Props) {
  return (
    <ImageBackground
      source={assets.bgGame}
      resizeMode="cover"
      style={styles.root}
      imageStyle={styles.image}>
      <LinearGradient
        colors={overlay}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {decor === 'blobs' ? <Blobs /> : null}
      {decor === 'dashes' ? <Dashes still={reduceMotion} /> : null}
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  image: { resizeMode: 'cover' },
  content: { flex: 1 },
  dash: { position: 'absolute', width: 2, height: 10, borderRadius: 1, opacity: 0.5 },
  blob: { position: 'absolute', borderRadius: 160 },
  blobPink: {
    width: 180,
    height: 180,
    left: -40,
    top: 40,
    backgroundColor: colors.primary,
    opacity: 0.1,
  },
  blobCyan: {
    width: 220,
    height: 220,
    right: -70,
    top: SCREEN_H * 0.34,
    backgroundColor: colors.secondary,
    opacity: 0.08,
  },
  blobPurple: {
    width: 140,
    height: 140,
    left: -30,
    bottom: 60,
    backgroundColor: colors.purple,
    opacity: 0.06,
  },
});

export default AppBackground;
