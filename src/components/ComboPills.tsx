import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { CHICK } from '../assets';
import { MAX_CARRIED, MAX_SHIELDS } from '../constants/config';
import { colors } from '../constants/theme';
import { multLabel } from '../utils/format';
import { multiplier } from '../game/runEngine';

type Props = {
  combo: number;
  shields: number;
  carried: number;
};

/**
 * The live run pills. A row carrying fewer than two pills is not rendered at
 * all - a lonely rounded box reads as a broken placeholder.
 */
export function ComboPills({ combo, shields, carried }: Props) {
  const pills: React.ReactNode[] = [];

  if (combo > 0) {
    pills.push(
      <View key="combo" style={[styles.pill, styles.comboPill]}>
        <Text style={styles.comboText} numberOfLines={1}>
          {'x' + combo}
        </Text>
        <Text style={styles.comboMult} numberOfLines={1}>
          {multLabel(multiplier(combo))}
        </Text>
      </View>,
    );
  }

  if (shields > 0) {
    pills.push(
      <View key="shield" style={[styles.pill, styles.shieldPill]}>
        {Array.from({ length: Math.min(MAX_SHIELDS, shields) }, (_, i) => (
          <ShieldCheck key={'s' + i} size={18} color={colors.secondary} />
        ))}
        <Text style={styles.shieldText} numberOfLines={1}>
          SHIELD
        </Text>
      </View>,
    );
  }

  if (carried > 0) {
    pills.push(
      <View key="chicks" style={[styles.pill, styles.chickPill]}>
        {Array.from({ length: Math.min(MAX_CARRIED, carried) }, (_, i) => (
          <Image
            key={'c' + i}
            source={CHICK}
            style={styles.chick}
            resizeMode="contain"
          />
        ))}
        <Text style={styles.chickText} numberOfLines={1}>
          {'+' + carried * 25 + '%'}
        </Text>
      </View>,
    );
  }

  if (pills.length < 2) {
    return null;
  }

  return <View style={styles.row}>{pills}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  comboPill: {
    backgroundColor: 'rgba(255,0,110,0.16)',
    borderColor: 'rgba(255,0,110,0.55)',
  },
  shieldPill: {
    backgroundColor: 'rgba(0,245,255,0.14)',
    borderColor: 'rgba(0,245,255,0.5)',
  },
  chickPill: {
    backgroundColor: 'rgba(255,197,61,0.14)',
    borderColor: 'rgba(255,197,61,0.5)',
  },
  comboText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '900',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  comboMult: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.textSecondary,
  },
  shieldText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.secondary,
  },
  chick: { width: 18, height: 18 },
  chickText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.warning,
  },
});

export default ComboPills;
