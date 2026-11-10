import React, { useRef } from 'react';
import {
  Animated,
  ColorValue,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SPRING_PRESS } from '../constants/config';
import { colors, gradients, shadows } from '../constants/theme';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
/** every icon in every button of this app is exactly this box */
export const BTN_ICON = 24;

export type IconProps = { size?: number | string; color?: ColorValue };
export type IconComp = React.ComponentType<IconProps>;

type Props = {
  label: string;
  onPress: () => void;
  Icon?: IconComp;
  height?: number;
  fontSize?: number;
  disabled?: boolean;
  tone?: 'magenta' | 'cyan';
  style?: ViewStyle;
};

/**
 * Pressable is the PARENT and Animated.View the CHILD - the press-feedback
 * arrangement that keeps onPress alive in Android release builds.
 */
export function PrimaryButton({
  label,
  onPress,
  Icon,
  height = 60,
  fontSize = 20,
  disabled = false,
  tone = 'magenta',
  style,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const grad = disabled
    ? gradients.ctaDim
    : tone === 'cyan'
    ? gradients.cyan
    : gradients.cta;

  const press = (to: number) => {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      tension: SPRING_PRESS.tension,
      friction: SPRING_PRESS.friction,
    }).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={HIT}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => press(0.96)}
      onPressOut={() => press(1)}
      style={[
        styles.press,
        { height },
        disabled ? styles.flat : shadows.cta,
        style,
      ]}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.fill, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.plate}>
          <View style={styles.gloss} pointerEvents="none" />
          <View style={styles.row}>
            {Icon ? <Icon size={BTN_ICON} color={colors.bg} /> : null}
            <Text
              style={[styles.label, { fontSize }, disabled ? styles.labelDim : null]}
              numberOfLines={1}>
              {label}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%', borderRadius: 18 },
  flat: { opacity: 0.45 },
  fill: { width: '100%', height: '100%' },
  plate: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontWeight: '900',
    letterSpacing: 2.4,
    lineHeight: BTN_ICON,
    color: colors.bg,
  },
  labelDim: { color: colors.textSecondary },
});

export default PrimaryButton;
