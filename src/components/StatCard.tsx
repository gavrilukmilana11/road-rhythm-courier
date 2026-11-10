import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Zap } from 'lucide-react-native';
import { colors } from '../constants/theme';

export type StatEntry = {
  key: string;
  /** already formatted - "1,240", "84%", "x3" */
  value: string;
  label: string;
  accent: string;
  /** a zero stat renders nothing at all instead of an empty rounded box */
  empty?: boolean;
};

/**
 * ONE stat pill, used unchanged on Result, Progress and Challenge.
 * Every pill in a row carries the SAME icon and differs only by colour, value
 * and label, so the row reads as one set instead of three mismatched sprites.
 * The card is width:'100%' inside a flex:1 slot - never flex:1 itself, which
 * would collapse it to the icon alone.
 */
export function StatCard({ value, label, accent }: Omit<StatEntry, 'key'>) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: accent + '22' }]}>
        <Zap size={28} color={accent} />
      </View>
      <Text style={[styles.value, { color: accent }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.textSecondary,
  },
});

export default StatCard;
