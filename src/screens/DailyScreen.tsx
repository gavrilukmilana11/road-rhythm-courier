import React, { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { CalendarDays, Home, Play } from 'lucide-react-native';
import { SIGNAL } from '../assets';
import { colors, overlays } from '../constants/theme';
import AppBackground from '../components/AppBackground';
import DayStreakStrip from '../components/DayStreakStrip';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import {
  isDailyDone,
  planForDay,
  secondsToNextDaily,
  streakDots,
} from '../game/dailyMode';
import type { Profile } from '../game/storage';
import { clock, groupNumber } from '../utils/format';

type Props = {
  profile: Profile;
  /** scored = the one attempt that moves the streak; practice never does */
  onStartDaily: (scored: boolean) => void;
  onMenu: () => void;
};

/** Jira "Daily Mode" - the same calendar date builds the same run everywhere */
export function DailyScreen({ profile, onStartDaily, onMenu }: Props) {
  const today = useMemo(() => new Date(), []);
  const plan = useMemo(() => planForDay(today), [today]);
  const done = isDailyDone(profile, today);
  const [left, setLeft] = useState(() => secondsToNextDaily(new Date()));

  useEffect(() => {
    if (!done) {
      return;
    }
    const id = setInterval(() => setLeft(secondsToNextDaily(new Date())), 1000);
    return () => clearInterval(id);
  }, [done]);

  return (
    <AppBackground
      overlay={overlays.panel}
      decor="blobs"
      reduceMotion={profile.settings.reduceMotion}>
      <ScreenHeader
        title="DAILY MODE"
        subtitle={'SEED #' + plan.key}
        leftSlot={<SecondaryButton label="MENU" Icon={Home} onPress={onMenu} />}
      />

      <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.gloss} pointerEvents="none" />
          <View style={styles.cardHead}>
            <Image source={SIGNAL} style={styles.mark} resizeMode="contain" />
            <View style={styles.cardTitleCol}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {done ? 'TODAY DELIVERED' : plan.routeName}
              </Text>
              <Text style={styles.cardMeta} numberOfLines={1}>
                {plan.laneCount + ' LANES  /  ' + plan.bpm + ' BPM'}
              </Text>
            </View>
          </View>

          <View style={styles.modRow}>
            <Text style={styles.modName} numberOfLines={1}>
              {plan.modifier.name}
            </Text>
            <Text style={styles.modEffect} numberOfLines={2}>
              {plan.modifier.effect}
            </Text>
          </View>

          {done ? (
            <Text style={styles.countdown} numberOfLines={1}>
              {'NEXT DAILY IN ' + clock(left)}
            </Text>
          ) : (
            <Text style={styles.ready} numberOfLines={1}>
              ONE SCORED ATTEMPT - MAKE IT COUNT
            </Text>
          )}
        </View>

        <View style={styles.streakCard}>
          <DayStreakStrip days={streakDots(profile.streak)} streak={profile.streak} />
        </View>

        {profile.lifetimeFeathers > 0 ? (
          <Text style={styles.bankLine} numberOfLines={1}>
            {'LIFETIME ' + groupNumber(profile.lifetimeFeathers) + ' FEATHERS'}
          </Text>
        ) : null}

        <Text style={styles.ctaHint} numberOfLines={2}>
          {done
            ? 'PRACTICE RUNS ARE NOT SCORED AND DO NOT TOUCH THE STREAK'
            : 'THE SAME DATE BUILDS THE SAME RUN ON EVERY DEVICE'}
        </Text>

        <PrimaryButton
          label={done ? 'PLAY AGAIN (PRACTICE)' : 'START DAILY'}
          Icon={done ? Play : CalendarDays}
          height={60}
          fontSize={done ? 15 : 19}
          onPress={() => onStartDaily(!done)}
        />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 22, gap: 12 },
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mark: { width: 48, height: 48 },
  cardTitleCol: { flex: 1, gap: 3 },
  cardTitle: {
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '900',
    letterSpacing: 1.6,
    color: colors.textPrimary,
  },
  cardMeta: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.textSecondary,
  },
  modRow: {
    gap: 4,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,245,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0,245,255,0.35)',
  },
  modName: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
    letterSpacing: 1.6,
    color: colors.secondary,
  },
  modEffect: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: colors.textSecondary,
  },
  countdown: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: colors.warning,
    fontVariant: ['tabular-nums'],
  },
  ready: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.success,
  },
  streakCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  bankLine: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.4,
    textAlign: 'center',
    color: colors.textMuted,
  },
  ctaHint: {
    marginTop: 'auto',
    marginBottom: 10,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    color: colors.textMuted,
  },
});

export default DailyScreen;
