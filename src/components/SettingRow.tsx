import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { colors } from '../constants/theme';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

export type ChipOption = { key: string; label: string };

type ChipProps = {
  label: string;
  hint: string;
  options: ChipOption[];
  value: string;
  onChange: (key: string) => void;
};

/** a labelled chip row - the active chip gets the accent border and fill */
export function SettingRow({ label, hint, options, value, onChange }: ChipProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.hint} numberOfLines={2}>
          {hint}
        </Text>
      </View>
      <View style={styles.chips}>
        {options.map(o => {
          const active = o.key === value;
          return (
            <Pressable
              key={o.key}
              accessibilityRole="button"
              accessibilityLabel={label + ' ' + o.label}
              accessibilityState={{ selected: active }}
              hitSlop={HIT}
              onPress={() => onChange(o.key)}
              style={[styles.chip, active ? styles.chipOn : null]}>
              <Text
                style={[styles.chipText, active ? styles.chipTextOn : null]}
                numberOfLines={1}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type StepperProps = {
  label: string;
  hint: string;
  value: number;
  suffix: string;
  onStep: (delta: number) => void;
};

/** the TIMING OFFSET stepper, -60..+60 ms in 10 ms steps */
export function SettingStepper({
  label,
  hint,
  value,
  suffix,
  onStep,
}: StepperProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.hint} numberOfLines={2}>
          {hint}
        </Text>
      </View>
      <View style={styles.stepper}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label + ' down'}
          hitSlop={HIT}
          onPress={() => onStep(-1)}
          style={styles.stepBtn}>
          <Minus size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.stepValue} numberOfLines={1}>
          {(value > 0 ? '+' : '') + value + suffix}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label + ' up'}
          hitSlop={HIT}
          onPress={() => onStep(1)}
          style={styles.stepBtn}>
          <Plus size={18} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textCol: { flex: 1, gap: 3 },
  label: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.textPrimary,
  },
  hint: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    width: 62,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipOn: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,0,110,0.18)',
  },
  chipText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: colors.textSecondary,
  },
  chipTextOn: { color: colors.textPrimary },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  stepValue: {
    width: 62,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    color: colors.secondary,
    fontVariant: ['tabular-nums'],
  },
});

export default SettingRow;
