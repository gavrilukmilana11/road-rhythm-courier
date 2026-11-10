import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { Home, RotateCcw, Sparkles } from 'lucide-react-native';
import { COURIER, PARCEL } from '../assets';
import { SPRING_POP } from '../constants/config';
import { colors, overlays } from '../constants/theme';
import AppBackground from '../components/AppBackground';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import StatRow from '../components/StatRow';
import type { StatEntry } from '../components/StatCard';
import { badgeById } from '../game/progression';
import { OUTCOME_HEADLINE, OUTCOME_HINT } from '../game/runEngine';
import type { RunResult } from '../game/runEngine';
import { groupNumber } from '../utils/format';

const CONFETTI = 14;

type Props = {
  result: RunResult;
  /** name of a route that this delivery opened, if any */
  unlockedRoute: string | null;
  earnedBadges: string[];
  onRunAgain: () => void;
  onMenu: () => void;
  onCollection: () => void;
  reduceMotion: boolean;
};

/** cyan and magenta paper falling over a finished delivery */
function Confetti({ active }: { active: boolean }) {
  const fall = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      return;
    }
    fall.setValue(0);
    Animated.timing(fall, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [active, fall]);

  if (!active) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.confettiLayer}>
      {Array.from({ length: CONFETTI }, (_, i) => {
        const drop = fall.interpolate({
          inputRange: [0, 1],
          outputRange: [-30, 260 + (i % 5) * 26],
        });
        const spin = fall.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', i % 2 === 0 ? '220deg' : '-200deg'],
        });
        const dim = fall.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [1, 1, 0],
        });
        return (
          <Animated.View
            key={'cf' + i}
            pointerEvents="none"
            style={[
              styles.confetti,
              {
                left: 14 + ((i * 37) % 82) * 3,
                backgroundColor: i % 2 === 0 ? colors.secondary : colors.primary,
                opacity: dim,
                transform: [{ translateY: drop }, { rotate: spin }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

/**
 * The delivery report. Mandatory screen - a run always lands here, and the
 * headline is always in the game's own words.
 */
export function ResultScreen({
  result,
  unlockedRoute,
  earnedBadges,
  onRunAgain,
  onMenu,
  onCollection,
  reduceMotion,
}: Props) {
  const pop = useRef(new Animated.Value(0)).current;
  const delivered = result.outcome === 'delivered';

  useEffect(() => {
    pop.setValue(0);
    Animated.spring(pop, {
      toValue: 1,
      useNativeDriver: true,
      tension: SPRING_POP.tension,
      friction: SPRING_POP.friction,
    }).start();
  }, [pop]);

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  const stats: StatEntry[] = [
    {
      key: 'feathers',
      value: groupNumber(result.feathers),
      label: 'FEATHERS',
      accent: colors.primary,
      empty: result.feathers <= 0,
    },
    {
      key: 'combo',
      value: 'x' + result.bestCombo,
      label: 'BEST COMBO',
      accent: colors.secondary,
      empty: result.bestCombo <= 0,
    },
    {
      key: 'perfect',
      value: result.perfectPct + '%',
      label: 'PERFECT',
      accent: colors.success,
      empty: result.taps <= 0,
    },
  ];

  const badgeNames = earnedBadges
    .map(id => badgeById(id)?.name)
    .filter((n): n is string => Boolean(n));

  return (
    <AppBackground overlay={overlays.result} decor="blobs" reduceMotion={reduceMotion}>
      <ScreenHeader
        title={delivered ? 'DELIVERY REPORT' : 'RUN REPORT'}
        subtitle={result.label + '  /  ' + result.routeName}
      />

      <View style={styles.body}>
        <View style={styles.heroBlock}>
          <Animated.View
            pointerEvents="none"
            style={[styles.heroWrap, { transform: [{ scale }] }]}>
            <Image
              source={delivered ? PARCEL : COURIER}
              resizeMode="contain"
              style={[styles.hero, delivered ? null : styles.heroDown]}
            />
          </Animated.View>
          <Confetti active={delivered && !reduceMotion} />
        </View>

        <Text
          style={[
            styles.headline,
            { color: delivered ? colors.success : colors.danger },
          ]}
          numberOfLines={1}>
          {OUTCOME_HEADLINE[result.outcome]}
        </Text>
        <Text style={styles.hint} numberOfLines={2}>
          {OUTCOME_HINT[result.outcome]}
        </Text>

        <Text style={styles.lanes} numberOfLines={1}>
          {'LANES CLEARED  ' + result.lanesCleared + ' / ' + result.laneCount}
        </Text>

        <StatRow items={stats} columns={3} />

        {result.chicks > 0 ? (
          <View style={styles.rescue}>
            <Sparkles size={16} color={colors.warning} />
            <Text style={styles.rescueText} numberOfLines={1}>
              {result.chicks + ' CHICKS HOME  /  +' + result.chicks * 25 + '% PAYOUT'}
            </Text>
          </View>
        ) : null}

        {unlockedRoute ? (
          <View style={styles.unlock}>
            <Text style={styles.unlockText} numberOfLines={1}>
              {unlockedRoute + ' UNLOCKED'}
            </Text>
          </View>
        ) : null}

        {badgeNames.length > 0 ? (
          <View style={[styles.unlock, styles.unlockBadge]}>
            <Text style={[styles.unlockText, styles.unlockBadgeText]} numberOfLines={1}>
              {'BADGE EARNED - ' + badgeNames[0]}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="RUN AGAIN" Icon={RotateCcw} height={60} onPress={onRunAgain} />
        <View style={styles.actionRow}>
          <View style={styles.actionSlot}>
            <SecondaryButton label="MENU" Icon={Home} onPress={onMenu} />
          </View>
          {badgeNames.length > 0 ? (
            <View style={styles.actionSlot}>
              <SecondaryButton
                label="COLLECTION"
                Icon={Sparkles}
                accent={colors.warning}
                onPress={onCollection}
              />
            </View>
          ) : null}
        </View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 16, gap: 10, alignItems: 'stretch' },
  heroBlock: { height: 110, alignItems: 'center', justifyContent: 'center' },
  heroWrap: { alignItems: 'center', justifyContent: 'center' },
  hero: { width: 96, height: 96 },
  heroDown: { transform: [{ rotate: '12deg' }] },
  confettiLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: -120,
  },
  confetti: {
    position: 'absolute',
    top: 0,
    width: 6,
    height: 14,
    borderRadius: 2,
  },
  headline: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '900',
    letterSpacing: 2.2,
    textAlign: 'center',
  },
  hint: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    color: colors.textMuted,
  },
  lanes: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 1.4,
    textAlign: 'center',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  rescue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,197,61,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,197,61,0.4)',
  },
  rescueText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.warning,
  },
  unlock: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: 'rgba(0,245,255,0.10)',
  },
  unlockBadge: {
    borderColor: colors.warning,
    backgroundColor: 'rgba(255,197,61,0.10)',
  },
  unlockText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '900',
    letterSpacing: 1.6,
    color: colors.secondary,
  },
  unlockBadgeText: { color: colors.warning },
  actions: { paddingHorizontal: 16, paddingBottom: 22, gap: 10 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionSlot: { flex: 1 },
});

export default ResultScreen;
