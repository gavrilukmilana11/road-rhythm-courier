import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Home, Route } from 'lucide-react-native';
import { colors, overlays } from '../constants/theme';
import AppBackground from '../components/AppBackground';
import EmptyState from '../components/EmptyState';
import RouteRow from '../components/RouteRow';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import StatRow from '../components/StatRow';
import type { StatEntry } from '../components/StatCard';
import { ROUTES, isRouteUnlocked } from '../game/progression';
import type { Profile } from '../game/storage';
import { groupNumber } from '../utils/format';

type Props = {
  profile: Profile;
  onSelectRoute: (index: number) => void;
  onMenu: () => void;
};

/** Jira "Progress" - lifetime stats, the route ladder and the last five runs */
export function ProgressScreen({ profile, onSelectRoute, onMenu }: Props) {
  const stats: StatEntry[] = [
    {
      key: 'deliveries',
      value: String(profile.deliveries),
      label: 'DELIVERIES',
      accent: colors.primary,
      empty: profile.deliveries <= 0,
    },
    {
      key: 'feathers',
      value: groupNumber(profile.lifetimeFeathers),
      label: 'TOTAL FEATHERS',
      accent: colors.warning,
      empty: profile.lifetimeFeathers <= 0,
    },
    {
      key: 'combo',
      value: 'x' + profile.bestCombo,
      label: 'BEST COMBO',
      accent: colors.secondary,
      empty: profile.bestCombo <= 0,
    },
    {
      key: 'perfect',
      value: profile.bestPerfectPct + '%',
      label: 'BEST PERFECT',
      accent: colors.success,
      empty: profile.bestPerfectPct <= 0,
    },
  ];

  const hasStats = stats.filter(s => !s.empty).length >= 2;

  return (
    <AppBackground
      overlay={overlays.panel}
      decor="blobs"
      reduceMotion={profile.settings.reduceMotion}>
      <ScreenHeader
        title="PROGRESS"
        subtitle="NIGHT SHIFT RECORD"
        leftSlot={<SecondaryButton label="MENU" Icon={Home} onPress={onMenu} />}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}>
        {hasStats ? (
          <StatRow items={stats} columns={2} />
        ) : (
          <EmptyState
            title="NO DELIVERIES LOGGED YET"
            hint="START ROUTE FROM THE HUB TO BEGIN"
            Icon={Route}
            accent={colors.primary}
          />
        )}

        <Text style={styles.section}>ROUTE LADDER</Text>
        <View style={styles.ladder}>
          {ROUTES.map(route => {
            const unlocked = isRouteUnlocked(route.index, profile.deliveries);
            const progress =
              route.unlockAt <= 0 ? 1 : profile.deliveries / route.unlockAt;
            return (
              <RouteRow
                key={route.name}
                route={route}
                unlocked={unlocked}
                active={profile.activeRoute === route.index}
                progress={progress}
                onSelect={onSelectRoute}
              />
            );
          })}
        </View>

        <Text style={styles.section}>LAST RUNS</Text>
        {profile.runs.length > 0 ? (
          <View style={styles.runs}>
            {profile.runs.map((run, i) => (
              <View key={'run' + i} style={styles.runRow}>
                <Text style={styles.runName} numberOfLines={1}>
                  {run.routeName}
                </Text>
                <Text style={styles.runMeta} numberOfLines={1}>
                  {run.lanesCleared + '/' + run.laneCount + ' LANES'}
                </Text>
                <Text style={styles.runFeathers} numberOfLines={1}>
                  {groupNumber(run.feathers)}
                </Text>
                <Text style={styles.runPct} numberOfLines={1}>
                  {run.perfectPct + '%'}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            title="NO RUNS IN THE LOG"
            hint="EVERY FINISHED ROUTE LANDS HERE"
            Icon={Route}
            accent={colors.secondary}
          />
        )}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  body: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 26, gap: 10 },
  section: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.textMuted,
  },
  ladder: { gap: 8 },
  runs: { gap: 6 },
  runRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  runName: {
    flex: 1,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.textPrimary,
  },
  runMeta: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: colors.textMuted,
  },
  runFeathers: {
    width: 56,
    textAlign: 'right',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  runPct: {
    width: 42,
    textAlign: 'right',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: colors.success,
    fontVariant: ['tabular-nums'],
  },
});

export default ProgressScreen;
