import React from 'react';
import {
  DimensionValue,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Lock } from 'lucide-react-native';
import { SIGNAL } from '../assets';
import { colors } from '../constants/theme';
import type { RouteDef } from '../game/progression';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

type Props = {
  route: RouteDef;
  unlocked: boolean;
  active: boolean;
  /** 0..1 - how far the player is towards the unlock requirement */
  progress: number;
  onSelect: (index: number) => void;
};

/**
 * One rung of the route ladder on Progress. An unlocked row is a real control:
 * tapping it changes the active route, which the Menu header then shows.
 */
export function RouteRow({ route, unlocked, active, progress, onSelect }: Props) {
  const fill = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={route.name}
      accessibilityState={{ disabled: !unlocked, selected: active }}
      hitSlop={HIT}
      disabled={!unlocked}
      onPress={() => onSelect(route.index)}
      style={[
        styles.row,
        active ? styles.rowActive : null,
        unlocked ? null : styles.rowLocked,
      ]}>
      <Image source={SIGNAL} style={styles.mark} resizeMode="contain" />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {route.name}
          </Text>
          {active ? <Text style={styles.activeTag}>ACTIVE</Text> : null}
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {route.lanes + ' LANES  /  ' + route.bpm + ' BPM'}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: (fill + '%') as DimensionValue }]} />
        </View>
      </View>
      {unlocked ? null : (
        <View style={styles.lockBox}>
          <Lock size={16} color={colors.textMuted} />
          <Text style={styles.lockText} numberOfLines={1}>
            {route.unlockAt + ' DEL'}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowActive: { borderColor: colors.primary, backgroundColor: 'rgba(255,0,110,0.12)' },
  rowLocked: { opacity: 0.45 },
  mark: { width: 28, height: 28 },
  body: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: {
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.textPrimary,
  },
  activeTag: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.primary,
  },
  meta: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.secondary },
  lockBox: { alignItems: 'center', gap: 2, width: 52 },
  lockText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.textMuted,
  },
});

export default RouteRow;
