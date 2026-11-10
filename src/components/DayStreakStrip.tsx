import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

type Props = {
  days: boolean[];
  streak: number;
};

const LABELS = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];

/** seven day dots - filled for a completed day, hollow for a missed one */
export function DayStreakStrip({ days, streak }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.dots}>
        {days.map((done, i) => (
          <View key={'d' + i} style={styles.daySlot}>
            <View style={[styles.dot, done ? styles.dotOn : styles.dotOff]} />
            <Text style={styles.dayLabel}>{LABELS[i]}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.caption} numberOfLines={1}>
        {streak > 0 ? 'STREAK ' + streak + ' DAYS' : 'NO STREAK YET'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 8 },
  dots: { flexDirection: 'row', justifyContent: 'space-between' },
  daySlot: { alignItems: 'center', gap: 4, width: 36 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  dotOn: { backgroundColor: colors.success, borderColor: colors.success },
  dotOff: { backgroundColor: 'transparent', borderColor: colors.textMuted },
  dayLabel: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.textMuted,
  },
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: colors.textSecondary,
  },
});

export default DayStreakStrip;
