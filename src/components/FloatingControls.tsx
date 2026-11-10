import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import {
  BAR_W,
  CONTROLS_BOTTOM,
  SPRING_ENTER,
} from '../constants/config';
import { colors, shadows } from '../constants/theme';
import BeatBar from './BeatBar';
import ComboPills from './ComboPills';
import PrimaryButton from './PrimaryButton';

type Props = {
  phase: Animated.Value;
  bpm: number;
  combo: number;
  shields: number;
  carried: number;
  tempoShift: boolean;
  /** the double-beat pre-step is armed and waiting for the second tap */
  armed: boolean;
  onStep: () => void;
  disabled: boolean;
};

/**
 * G2 floating controls: the beat bar, the live run pills and the GO button,
 * docked over the lower road margin so they never cover an active lane.
 */
export function FloatingControls({
  phase,
  bpm,
  combo,
  shields,
  carried,
  tempoShift,
  armed,
  onStep,
  disabled,
}: Props) {
  const enter = useRef(new Animated.Value(0)).current;
  const pillCount =
    (combo > 0 ? 1 : 0) + (shields > 0 ? 1 : 0) + (carried > 0 ? 1 : 0);
  const showPills = pillCount >= 2;

  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1,
      useNativeDriver: true,
      tension: SPRING_ENTER.tension,
      friction: SPRING_ENTER.friction,
    }).start();
  }, [enter]);

  const rise = enter.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.root,
        shadows.cta,
        { opacity: enter, transform: [{ translateY: rise }] },
      ]}>
      <View style={styles.barRow}>
        <BeatBar
          phase={phase}
          bpm={bpm}
          carried={carried}
          track={BAR_W}
          tempoShift={tempoShift}
        />
      </View>

      <View style={styles.actionRow}>
        {showPills ? (
          <View style={styles.pillSlot}>
            <ComboPills combo={combo} shields={shields} carried={carried} />
          </View>
        ) : null}
        <View style={showPills ? styles.goSlotNarrow : styles.goSlotWide}>
          <PrimaryButton
            label="GO"
            height={64}
            fontSize={24}
            disabled={disabled}
            onPress={onStep}
          />
        </View>
      </View>

      <Text style={styles.footHint} numberOfLines={1}>
        {armed ? 'DOUBLE BEAT ARMED - TAP THE NEXT BEAT' : 'TAP ON THE BEAT'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: CONTROLS_BOTTOM,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: 'rgba(18,18,31,0.94)',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  barRow: { height: 28, justifyContent: 'center' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pillSlot: { flex: 1 },
  goSlotNarrow: { width: 136 },
  goSlotWide: { flex: 1 },
  footHint: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default FloatingControls;
