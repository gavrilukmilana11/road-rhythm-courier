import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Home, Trash2 } from 'lucide-react-native';
import {
  TIMING_OFFSET_MAX,
  TIMING_OFFSET_MIN,
  TIMING_OFFSET_STEP,
} from '../constants/config';
import { colors, overlays } from '../constants/theme';
import AppBackground from '../components/AppBackground';
import ConfirmPanel from '../components/ConfirmPanel';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import { SettingRow, SettingStepper } from '../components/SettingRow';
import type { Profile, Settings } from '../game/storage';

const ON_OFF = [
  { key: 'on', label: 'ON' },
  { key: 'off', label: 'OFF' },
];

const PACE = [
  { key: 'steady', label: 'STEADY' },
  { key: 'rush', label: 'RUSH' },
];

type Props = {
  profile: Profile;
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onReset: () => void;
  onMenu: () => void;
};

/** Jira "Settings" - every option has a real, persisted effect on the run */
export function SettingsScreen({ profile, onChange, onReset, onMenu }: Props) {
  const [confirm, setConfirm] = useState(false);
  const s = profile.settings;

  const step = (delta: number) => {
    const next = Math.max(
      TIMING_OFFSET_MIN,
      Math.min(TIMING_OFFSET_MAX, s.timingOffset + delta * TIMING_OFFSET_STEP),
    );
    onChange('timingOffset', next);
  };

  return (
    <AppBackground
      overlay={overlays.panel}
      decor="blobs"
      reduceMotion={s.reduceMotion}>
      <ScreenHeader
        title="SETTINGS"
        subtitle="EVERY OPTION CHANGES THE RUN"
        leftSlot={<SecondaryButton label="MENU" Icon={Home} onPress={onMenu} />}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}>
        <SettingRow
          label="BEAT GUIDE"
          hint="SHOWS THE FALLING BEAT RING AND THE LANE DOWNBEAT FLASH"
          options={ON_OFF}
          value={s.beatGuide ? 'on' : 'off'}
          onChange={k => onChange('beatGuide', k === 'on')}
        />
        <SettingRow
          label="ROUTE PACE"
          hint="RUSH RAISES EVERY ROUTE BPM BY 26 PERCENT"
          options={PACE}
          value={s.pace}
          onChange={k => onChange('pace', k === 'rush' ? 'rush' : 'steady')}
        />
        <SettingRow
          label="HIGH CONTRAST"
          hint="WHITE LANE DASHES, OUTLINED TRAFFIC, BACKED VERDICT TEXT"
          options={ON_OFF}
          value={s.highContrast ? 'on' : 'off'}
          onChange={k => onChange('highContrast', k === 'on')}
        />
        <SettingRow
          label="REDUCE MOTION"
          hint="DROPS DRIFTING DASHES, GLOSS SWEEPS AND THE IDLE BOB"
          options={ON_OFF}
          value={s.reduceMotion ? 'on' : 'off'}
          onChange={k => onChange('reduceMotion', k === 'on')}
        />
        <SettingStepper
          label="TIMING OFFSET"
          hint="SHIFTS THE JUDGED BEAT CENTRE FOR SLOWER DEVICES"
          value={s.timingOffset}
          suffix=" MS"
          onStep={step}
        />

        <View style={styles.dangerBlock}>
          <Text style={styles.dangerHint} numberOfLines={2}>
            THIS WIPES DELIVERIES, FEATHERS, BADGES AND THE STREAK
          </Text>
          <SecondaryButton
            label="RESET PROGRESS"
            Icon={Trash2}
            accent={colors.danger}
            onPress={() => setConfirm(true)}
          />
        </View>

        <Text style={styles.footer} numberOfLines={2}>
          OFFLINE  /  NO ADS  /  NOTHING TO BUY  /  FICTIONAL FEATHERS ONLY
        </Text>
      </ScrollView>

      {confirm ? (
        <ConfirmPanel
          title="RESET PROGRESS?"
          body="Deliveries, feathers, badges, bests and the daily streak go back to zero. This cannot be undone."
          confirmLabel="RESET"
          onConfirm={() => {
            setConfirm(false);
            onReset();
          }}
          onCancel={() => setConfirm(false)}
        />
      ) : null}
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  body: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 26, gap: 10 },
  dangerBlock: {
    marginTop: 8,
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,59,92,0.4)',
    backgroundColor: 'rgba(255,59,92,0.08)',
  },
  dangerHint: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    textAlign: 'center',
    color: colors.textMuted,
  },
});

export default SettingsScreen;
