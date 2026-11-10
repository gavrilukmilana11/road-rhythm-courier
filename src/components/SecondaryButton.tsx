import React, { useRef } from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { assets } from '../assets';
import { SPRING_PRESS } from '../constants/config';
import { colors } from '../constants/theme';
import { BTN_ICON } from './PrimaryButton';
import type { IconComp } from './PrimaryButton';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

type Props = {
  label: string;
  onPress: () => void;
  Icon?: IconComp;
  /** tints the border and the label, e.g. the cyan COLLECTION button */
  accent?: string;
  height?: number;
  disabled?: boolean;
  style?: ViewStyle;
};

/**
 * The quiet button: the button_rect art plate under a translucent fill and a
 * thin chrome border. Same icon box and same label line height as
 * PrimaryButton so the two never look mismatched side by side.
 */
export function SecondaryButton({
  label,
  onPress,
  Icon,
  accent = colors.textPrimary,
  height = 48,
  disabled = false,
  style,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

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
      style={[styles.press, { height }, disabled ? styles.flat : null, style]}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.fill, { transform: [{ scale }] }]}>
        <ImageBackground
          source={assets.buttonRect}
          resizeMode="stretch"
          style={styles.plate}
          imageStyle={styles.plateImg}>
          <View style={[styles.tint, { borderColor: accent + '44' }]} pointerEvents="none" />
          <View style={styles.row}>
            {Icon ? <Icon size={BTN_ICON} color={accent} /> : null}
            <Text style={[styles.label, { color: accent }]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%', borderRadius: 16 },
  flat: { opacity: 0.45 },
  fill: { width: '100%', height: '100%' },
  plate: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateImg: { borderRadius: 16, resizeMode: 'stretch' },
  tint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2,
    lineHeight: BTN_ICON,
  },
});

export default SecondaryButton;
