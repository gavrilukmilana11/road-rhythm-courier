import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { HEADER_H } from '../constants/config';
import { colors } from '../constants/theme';

type Props = {
  /** uppercase screen caption; omitted on screens whose title lives in the body */
  title?: string;
  subtitle?: string;
  /** replaces title/subtitle when a screen needs live numbers in the middle */
  centerSlot?: React.ReactNode;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  /** `plate` paints the dark header surface used over the game board */
  tone?: 'clear' | 'plate';
  style?: ViewStyle;
};

/**
 * THE header of this app. Menu, Game, Result, Challenge, Progress, Collection,
 * Daily and Settings all render this one component with different slots, so
 * padding, height and type can never drift between screens.
 */
export function ScreenHeader({
  title,
  subtitle,
  centerSlot,
  leftSlot,
  rightSlot,
  tone = 'clear',
  style,
}: Props) {
  return (
    <View style={[styles.root, tone === 'plate' ? styles.plate : null, style]}>
      <View style={styles.side}>{leftSlot ?? null}</View>
      <View style={styles.center}>
        {centerSlot ?? null}
        {title ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.side, styles.sideRight]}>{rightSlot ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: 44,
    height: HEADER_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  plate: {
    backgroundColor: 'rgba(0,0,0,0.34)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  side: {
    width: 104,
    height: 56,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  sideRight: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    letterSpacing: 1.8,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.textMuted,
  },
});

export default ScreenHeader;
