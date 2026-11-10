import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BarChart3,
  CalendarDays,
  Hand,
  Settings as SettingsIcon,
  Sparkles,
  Target,
  Timer,
  Truck,
  X,
  Zap,
} from 'lucide-react-native';
import { assets } from '../assets';
import { BADGE_TOTAL } from '../constants/config';
import { colors, overlays } from '../constants/theme';
import AppBackground from '../components/AppBackground';
import BentoTile from '../components/BentoTile';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import { routeAt } from '../game/progression';
import type { Profile } from '../game/storage';
import { groupNumber } from '../utils/format';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

export type MenuTarget =
  | 'challenge'
  | 'progress'
  | 'collection'
  | 'daily'
  | 'settings';

type Props = {
  profile: Profile;
  onPlay: () => void;
  onOpen: (target: MenuTarget) => void;
};

const RULES = [
  'THE TRAFFIC KEEPS THE BEAT - CROSS ON IT, NOT BETWEEN IT.',
  'TAP GO (OR THE BOARD) WHEN THE FALLING RING MEETS THE COURIER.',
  'PERFECT STEPS CHAIN A COMBO; EVERY 5TH BANKS A BEAT SHIELD.',
  'A MISS SPENDS A SHIELD - WITH NO SHIELD THE RUN ENDS.',
  'SCOOP CHICKS OFF THE MEDIAN: MORE PAYOUT, TIGHTER TIMING.',
  'EVERY 8 LANES BANKS YOUR FEATHERS AGAINST A CRASH.',
];

/** M3 bento hub - every sibling screen is one tap away with its own caption */
export function MenuScreen({ profile, onPlay, onOpen }: Props) {
  const [rules, setRules] = useState(false);
  const route = routeAt(profile.activeRoute);
  const badgeValue =
    profile.badges.length > 0
      ? profile.badges.length + '/' + BADGE_TOTAL
      : undefined;
  const sprintBest = profile.bests.sprint > 0 ? groupNumber(profile.bests.sprint) : undefined;

  return (
    <AppBackground overlay={overlays.menu} decor="blobs" reduceMotion={profile.settings.reduceMotion}>
      <ScreenHeader
        leftSlot={
          <View style={styles.routeMark}>
            <Image source={assets.iconHome} style={styles.homeIcon} resizeMode="contain" />
            <Text style={styles.routeName} numberOfLines={1}>
              {route.name}
            </Text>
          </View>
        }
        rightSlot={
          /* nothing earned yet means no chip at all, never a "0" pill */
          profile.lifetimeFeathers > 0 ? (
            <View style={styles.badge}>
              <Zap size={16} color={colors.primary} />
              <View>
                <Text style={styles.badgeValue} numberOfLines={1}>
                  {groupNumber(profile.lifetimeFeathers)}
                </Text>
                <Text style={styles.badgeLabel} numberOfLines={1}>
                  FEATHERS
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.badgeHint} numberOfLines={2}>
              {'NIGHT' + '\n' + 'SHIFT'}
            </Text>
          )
        }
      />

      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.heroLine1} numberOfLines={1}>
            ROAD RHYTHM
          </Text>
          <Text style={styles.heroLine2} numberOfLines={1}>
            COURIER
          </Text>
        </View>
        <Image source={assets.sprite1} style={styles.heroSprite} resizeMode="contain" />
      </View>
      <View style={styles.horizon} pointerEvents="none" />

      <View style={styles.grid}>
        <View style={styles.row}>
          <View style={styles.bigSlot}>
            <BentoTile
              label="START ROUTE"
              caption={route.name + '  /  ' + route.lanes + ' LANES'}
              Icon={Truck}
              accent={colors.bg}
              height={164}
              featured
              sprite={assets.sprite3}
              delay={0}
              onPress={onPlay}
            />
          </View>
          <View style={styles.smallCol}>
            <BentoTile
              label="PROGRESS"
              Icon={BarChart3}
              accent={colors.secondary}
              height={76}
              value={profile.deliveries > 0 ? String(profile.deliveries) : undefined}
              hint="PLAY TO UNLOCK"
              delay={60}
              onPress={() => onOpen('progress')}
            />
            <BentoTile
              label="COLLECTION"
              Icon={Sparkles}
              accent={colors.warning}
              height={76}
              value={badgeValue}
              hint="PLAY TO UNLOCK"
              delay={120}
              onPress={() => onOpen('collection')}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfSlot}>
            <BentoTile
              label="DAILY MODE"
              Icon={CalendarDays}
              accent={colors.success}
              height={92}
              value={profile.streak > 0 ? profile.streak + ' DAYS' : undefined}
              hint="ONE RUN A DAY"
              delay={180}
              onPress={() => onOpen('daily')}
            />
          </View>
          <View style={styles.halfSlot}>
            <BentoTile
              label="CHALLENGE"
              Icon={Target}
              accent={colors.primary}
              height={92}
              value={sprintBest}
              hint="3 SESSION MODES"
              delay={240}
              onPress={() => onOpen('challenge')}
            />
          </View>
        </View>

        <BentoTile
          label="SETTINGS"
          Icon={SettingsIcon}
          accent={colors.textSecondary}
          height={64}
          caption="BEAT GUIDE  /  PACE  /  TIMING"
          delay={300}
          onPress={() => onOpen('settings')}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="HOW TO PLAY"
          hitSlop={HIT}
          onPress={() => setRules(true)}
          style={styles.link}>
          <Hand size={18} color={colors.secondary} />
          <Text style={styles.linkText} numberOfLines={1}>
            HOW TO PLAY
          </Text>
        </Pressable>
      </View>

      {rules ? (
        <View style={styles.sheetScrim}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Timer size={20} color={colors.secondary} />
              <Text style={styles.sheetTitle} numberOfLines={1}>
                HOW TO PLAY
              </Text>
            </View>
            {RULES.map((line, i) => (
              <View key={'r' + i} style={styles.ruleRow}>
                <Text style={styles.ruleNum}>{i + 1}</Text>
                <Text style={styles.ruleText}>{line}</Text>
              </View>
            ))}
            <SecondaryButton
              label="CLOSE"
              Icon={X}
              accent={colors.textPrimary}
              onPress={() => setRules(false)}
            />
          </View>
        </View>
      ) : null}
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  routeMark: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  homeIcon: { width: 30, height: 30 },
  routeName: {
    flex: 1,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: colors.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,0,110,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,0,110,0.42)',
  },
  badgeValue: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  badgeLabel: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
  },
  badgeHint: {
    textAlign: 'right',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: colors.textMuted,
  },
  hero: {
    height: 92,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroText: { flex: 1 },
  heroLine1: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  heroLine2: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: 2,
    color: colors.primary,
  },
  heroSprite: { width: 76, height: 76 },
  horizon: {
    height: 1,
    marginHorizontal: 16,
    backgroundColor: 'rgba(0,245,255,0.35)',
  },
  grid: { flex: 1, paddingHorizontal: 16, paddingTop: 14, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  bigSlot: { flex: 1.55 },
  smallCol: { flex: 1, gap: 12 },
  halfSlot: { flex: 1 },
  link: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  linkText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.secondary,
  },
  sheetScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(10,10,15,0.88)',
  },
  sheet: {
    width: '100%',
    gap: 10,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sheetTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  ruleRow: { flexDirection: 'row', gap: 10 },
  ruleNum: {
    width: 18,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  ruleText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: colors.textSecondary,
  },
});

export default MenuScreen;
