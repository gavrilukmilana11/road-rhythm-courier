import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Home, Sparkles } from 'lucide-react-native';
import {
  BADGE_TOTAL,
  BOARD_FRAME,
  BOARD_MAX_W,
} from '../constants/config';
import { colors, overlays } from '../constants/theme';
import AppBackground from '../components/AppBackground';
import BadgeTile from '../components/BadgeTile';
import EmptyState from '../components/EmptyState';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import { BADGES } from '../game/progression';
import type { Profile } from '../game/storage';

const GAP = 12;
const TILE = Math.floor((BOARD_MAX_W - 2 * BOARD_FRAME - 2 * GAP) / 3);

type Props = {
  profile: Profile;
  onMenu: () => void;
};

/** Jira "Collection" - twelve courier badges, all earned by play */
export function CollectionScreen({ profile, onMenu }: Props) {
  const earned = profile.badges;

  return (
    <AppBackground
      overlay={overlays.panel}
      decor="blobs"
      reduceMotion={profile.settings.reduceMotion}>
      <ScreenHeader
        title="COLLECTION"
        subtitle={earned.length + ' / ' + BADGE_TOTAL + ' BADGES'}
        leftSlot={<SecondaryButton label="MENU" Icon={Home} onPress={onMenu} />}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}>
        {earned.length === 0 ? (
          <EmptyState
            title="NO BADGES YET"
            hint="FINISH A ROUTE TO EARN YOUR FIRST"
            Icon={Sparkles}
            accent={colors.warning}
          />
        ) : null}

        <View style={styles.grid}>
          {BADGES.map(badge => (
            <BadgeTile
              key={badge.id}
              badge={badge}
              earned={earned.includes(badge.id)}
              size={TILE}
            />
          ))}
        </View>

        <Text style={styles.footer} numberOfLines={2}>
          EVERY BADGE IS EARNED BY PLAYING - THERE IS NOTHING TO BUY HERE
        </Text>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  body: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 26,
    gap: 12,
    alignItems: 'center',
  },
  grid: {
    width: BOARD_MAX_W - 2 * BOARD_FRAME,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  footer: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    color: colors.textMuted,
  },
});

export default CollectionScreen;
