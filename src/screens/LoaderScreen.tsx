import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { assets } from '../assets';
import {
  LOADER_BAR_MS,
  LOADER_DURATION_MS,
  SPRING_POP,
} from '../constants/config';
import { colors, overlays } from '../constants/theme';
import AppBackground from '../components/AppBackground';

const RING = 176;
const LOGO = 148;
const BAR_W = 220;
const BAR_H = 6;
const PIPS = 4;

type Props = {
  /** fired by the 8000 ms timer and by nothing else */
  onDone: () => void;
};

/**
 * The brand card. Rule 2.3: no call-to-action button, no stat chips, no touch
 * handler of any kind - the only way out is the timer below. Its gradient is
 * deliberately the darkest in the app so the first QA frame can never be
 * mistaken for the hub screen.
 */
export function LoaderScreen({ onDone }: Props) {
  const enter = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(0)).current;
  const pips = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(onDone, LOADER_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(enter, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.spring(enter, {
        toValue: 1,
        useNativeDriver: true,
        tension: SPRING_POP.tension,
        friction: SPRING_POP.friction,
      }),
    ]).start();

    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    spinLoop.start();

    const pipLoop = Animated.loop(
      Animated.timing(pips, {
        toValue: 1,
        duration: 650 * PIPS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    pipLoop.start();

    Animated.timing(bar, {
      toValue: 1,
      duration: LOADER_BAR_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();

    return () => {
      spinLoop.stop();
      pipLoop.stop();
      bar.stopAnimation();
      enter.stopAnimation();
    };
  }, [bar, enter, pips, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const pop = enter.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const reveal = bar.interpolate({
    inputRange: [0, 1],
    outputRange: [-BAR_W, 0],
  });

  return (
    <AppBackground overlay={overlays.loader} decor="dashes">
      <View style={styles.root}>
        <View style={styles.brand}>
          <Animated.View
            pointerEvents="none"
            style={[styles.ringWrap, { transform: [{ rotate }] }]}>
            <Svg width={RING} height={RING} viewBox={'0 0 ' + RING + ' ' + RING}>
              <Defs>
                <LinearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={colors.primary} />
                  <Stop offset="1" stopColor={colors.secondary} />
                </LinearGradient>
              </Defs>
              <Circle
                cx={RING / 2}
                cy={RING / 2}
                r={RING / 2 - 6}
                stroke="url(#chrome)"
                strokeWidth={3}
                strokeDasharray="34 18"
                fill="none"
              />
            </Svg>
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[styles.logoWrap, { opacity: enter, transform: [{ scale: pop }] }]}>
            <Image source={assets.logo} style={styles.logo} resizeMode="contain" />
          </Animated.View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.titleGhost} numberOfLines={1}>
            ROAD RHYTHM COURIER
          </Text>
          <Text style={styles.title} numberOfLines={1}>
            ROAD RHYTHM COURIER
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            CROSS ON THE BEAT
          </Text>
        </View>

        <View style={styles.pipRow}>
          {Array.from({ length: PIPS }, (_, i) => {
            const lo = i / PIPS;
            const hi = (i + 1) / PIPS;
            const glow = pips.interpolate({
              inputRange: [0, Math.max(0.001, lo), (lo + hi) / 2, hi, 1],
              outputRange: [0.18, 0.18, 1, 0.18, 0.18],
            });
            return (
              <Animated.View
                key={'p' + i}
                pointerEvents="none"
                style={[styles.pip, { opacity: glow }]}
              />
            );
          })}
        </View>

        <View style={styles.barTrack}>
          <Animated.View
            pointerEvents="none"
            style={[styles.barFill, { transform: [{ translateX: reveal }] }]}
          />
        </View>

        <Text style={styles.loading} numberOfLines={1}>
          LOADING ROUTE...
        </Text>

        <Image source={assets.sprite5} style={styles.signal} resizeMode="contain" />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 44,
    paddingHorizontal: 24,
    gap: 18,
  },
  brand: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: { position: 'absolute', width: RING, height: RING },
  logoWrap: { alignItems: 'center', justifyContent: 'center' },
  logo: { width: LOGO, height: LOGO },
  titleBlock: { alignItems: 'center' },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
    color: colors.textPrimary,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  titleGhost: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: 0,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
    color: colors.secondary,
    opacity: 0.5,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 2.6,
    color: colors.textSecondary,
  },
  pipRow: { flexDirection: 'row', gap: 10 },
  pip: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  barTrack: {
    width: BAR_W,
    height: BAR_H,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  barFill: {
    width: BAR_W,
    height: BAR_H,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  loading: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.textMuted,
  },
  signal: { width: 56, height: 56, opacity: 0.85 },
});

export default LoaderScreen;
