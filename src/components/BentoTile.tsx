import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SPRING_ENTER, SPRING_PRESS } from '../constants/config';
import { colors, gradients, shadows } from '../constants/theme';
import type { IconComp } from './PrimaryButton';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

type Props = {
  label: string;
  onPress: () => void;
  Icon: IconComp;
  accent: string;
  height: number;
  /** omit entirely when there is nothing to show - never render "0" */
  value?: string;
  /** themed one-liner shown in place of a missing value */
  hint?: string;
  caption?: string;
  featured?: boolean;
  sprite?: ImageSourcePropType;
  delay?: number;
  style?: ViewStyle;
};

/**
 * One cell of the Menu bento hub. The big featured tile is the primary CTA;
 * the small ones route to the sibling screens. A tile with no value renders a
 * themed hint line instead of an empty slot.
 */
export function BentoTile({
  label,
  onPress,
  Icon,
  accent,
  height,
  value,
  hint,
  caption,
  featured = false,
  sprite,
  delay = 0,
  style,
}: Props) {
  const enter = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1,
      delay,
      useNativeDriver: true,
      tension: SPRING_ENTER.tension,
      friction: SPRING_ENTER.friction,
    }).start();
  }, [delay, enter]);

  const press = (to: number) => {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      tension: SPRING_PRESS.tension,
      friction: SPRING_PRESS.friction,
    }).start();
  };

  const rise = enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.outer,
        style,
        { opacity: enter, transform: [{ translateY: rise }] },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        hitSlop={HIT}
        onPress={onPress}
        onPressIn={() => press(0.97)}
        onPressOut={() => press(1)}
        style={[styles.press, { height }, featured ? shadows.cta : shadows.soft]}>
        <Animated.View
          pointerEvents="box-none"
          style={[styles.fill, { transform: [{ scale }] }]}>
          <LinearGradient
            colors={featured ? gradients.cta : gradients.tile}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.plate,
              featured ? null : { borderWidth: 1, borderColor: colors.border },
            ]}>
            <View style={styles.gloss} pointerEvents="none" />
            <View style={styles.chrome} pointerEvents="none" />

            <View style={styles.headRow}>
              <Icon size={featured ? 28 : 22} color={featured ? colors.bg : accent} />
              {sprite ? (
                <Image source={sprite} style={styles.sprite} resizeMode="contain" />
              ) : null}
            </View>

            <View style={styles.textBlock}>
              <Text
                style={[
                  styles.label,
                  featured ? styles.labelBig : null,
                  { color: featured ? colors.bg : colors.textPrimary },
                ]}
                numberOfLines={1}>
                {label}
              </Text>
              {value ? (
                <Text
                  style={[styles.value, { color: featured ? colors.bg : accent }]}
                  numberOfLines={1}>
                  {value}
                </Text>
              ) : null}
              {!value && hint ? (
                <Text style={styles.hint} numberOfLines={1}>
                  {hint}
                </Text>
              ) : null}
              {caption ? (
                <Text
                  style={[
                    styles.caption,
                    { color: featured ? 'rgba(10,10,15,0.72)' : colors.textMuted },
                  ]}
                  numberOfLines={1}>
                  {caption}
                </Text>
              ) : null}
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: { width: '100%' },
  press: { width: '100%', borderRadius: 20 },
  fill: { width: '100%', height: '100%' },
  plate: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 14,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
    backgroundColor: colors.gloss,
  },
  chrome: {
    position: 'absolute',
    top: 1,
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: colors.chrome,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sprite: { width: 40, height: 40 },
  textBlock: { gap: 2 },
  label: { fontSize: 13, fontWeight: '800', letterSpacing: 1.2 },
  labelBig: { fontSize: 22, letterSpacing: 1.5, fontWeight: '900' },
  value: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  hint: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: colors.textMuted,
  },
  caption: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1 },
});

export default BentoTile;
