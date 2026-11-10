import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Home, Play } from 'lucide-react-native';
import { PARCEL } from '../assets';
import { colors } from '../constants/theme';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

type Props = {
  lane: number;
  laneCount: number;
  feathers: number;
  onResume: () => void;
  onMenu: () => void;
};

/**
 * In-screen pause. The beat clock is held while this is open and resumes
 * without drift, so pausing can never cost the player a beat.
 */
export function PausePanel({ lane, laneCount, feathers, onResume, onMenu }: Props) {
  return (
    <View style={styles.scrim}>
      <View style={styles.card}>
        <Image source={PARCEL} style={styles.mark} resizeMode="contain" />
        <Text style={styles.title}>ROUTE ON HOLD</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {'LANE ' + lane + ' OF ' + laneCount + '  /  ' + feathers + ' FEATHERS'}
        </Text>
        <Text style={styles.hint} numberOfLines={2}>
          THE TRAFFIC KEEPS ITS BEAT WHEN YOU COME BACK
        </Text>
        <View style={styles.actions}>
          <PrimaryButton label="RESUME" Icon={Play} height={56} fontSize={18} onPress={onResume} />
          <SecondaryButton label="MENU" Icon={Home} onPress={onMenu} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(10,10,15,0.84)',
  },
  card: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  mark: { width: 64, height: 64 },
  title: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.secondary,
  },
  hint: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    color: colors.textMuted,
  },
  actions: { width: '100%', gap: 10, marginTop: 6 },
});

export default PausePanel;
