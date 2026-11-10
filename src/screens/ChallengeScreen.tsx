import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Home, Target, Timer } from 'lucide-react-native';
import { colors, overlays } from '../constants/theme';
import AppBackground from '../components/AppBackground';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import { CHALLENGES, challengeBestLabel } from '../game/progression';
import type { ChallengeDef, ChallengeId } from '../game/progression';
import type { Profile } from '../game/storage';

type Props = {
  profile: Profile;
  onStartMode: (id: ChallengeId) => void;
  onMenu: () => void;
};

/** Jira "Challenge / Session" - three rule sets over the same core loop */
export function ChallengeScreen({ profile, onStartMode, onMenu }: Props) {
  const [selected, setSelected] = useState<ChallengeId>('sprint');
  const anyBest =
    profile.bests.sprint > 0 ||
    profile.bests.endurance > 0 ||
    profile.bests.precision > 0;

  const renderCard = (mode: ChallengeDef) => {
    const active = mode.id === selected;
    const best = challengeBestLabel(mode.id, profile);
    return (
      <View
        key={mode.id}
        style={[
          styles.card,
          active ? { borderColor: mode.accent } : null,
          active ? null : styles.cardDim,
        ]}>
        {active ? <View style={styles.gloss} pointerEvents="none" /> : null}
        <View style={styles.cardText}>
          <View style={styles.cardHead}>
            <Timer size={18} color={mode.accent} />
            <Text style={[styles.cardName, { color: mode.accent }]} numberOfLines={1}>
              {mode.name}
            </Text>
          </View>
          <Text style={styles.cardRule} numberOfLines={2}>
            {mode.rule}
          </Text>
          {best ? (
            <Text style={styles.cardBest} numberOfLines={1}>
              {'BEST  ' + best}
            </Text>
          ) : (
            <Text style={styles.cardNoBest} numberOfLines={1}>
              NO SESSION LOGGED YET
            </Text>
          )}
        </View>
        <View style={styles.cardAction}>
          <PrimaryButton
            label="START"
            height={48}
            fontSize={15}
            tone={mode.id === 'precision' ? 'cyan' : 'magenta'}
            onPress={() => {
              setSelected(mode.id);
              onStartMode(mode.id);
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <AppBackground
      overlay={overlays.panel}
      decor="blobs"
      reduceMotion={profile.settings.reduceMotion}>
      <ScreenHeader
        title="CHALLENGE"
        subtitle="PICK A SESSION RULE SET"
        leftSlot={<SecondaryButton label="MENU" Icon={Home} onPress={onMenu} />}
      />
      <View style={styles.body}>
        {CHALLENGES.map(renderCard)}
        {anyBest ? null : (
          <EmptyState
            title="NO SESSIONS LOGGED"
            hint="START ONE ABOVE TO SET YOUR FIRST BEST"
            Icon={Target}
            accent={colors.primary}
          />
        )}
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 6, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 112,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  cardDim: { opacity: 0.7 },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardText: { flex: 1, gap: 6 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardName: { fontSize: 17, lineHeight: 21, fontWeight: '900', letterSpacing: 1.8 },
  cardRule: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: colors.textSecondary,
  },
  cardBest: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  cardNoBest: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
  },
  cardAction: { width: 104 },
});

export default ChallengeScreen;
