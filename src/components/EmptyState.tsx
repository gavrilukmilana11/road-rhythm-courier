import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import type { IconComp } from './PrimaryButton';

type Props = {
  title: string;
  hint: string;
  Icon: IconComp;
  accent?: string;
};

/**
 * The themed centred message every list in this app shows when it is empty.
 * A blank area would read as a broken screen; this names what to do next.
 */
export function EmptyState({ title, hint, Icon, accent = colors.secondary }: Props) {
  return (
    <View style={styles.root}>
      <View style={[styles.ring, { borderColor: accent + '55' }]}>
        <Icon size={28} color={accent} />
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.hint} numberOfLines={2}>
        {hint}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 26,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(18,18,31,0.72)',
  },
  ring: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    letterSpacing: 1.2,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  hint: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    color: colors.textMuted,
  },
});

export default EmptyState;
