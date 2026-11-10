import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  DimensionValue,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { assets } from '../assets';
import {
  ANCHOR_Y,
  END_DELAY_MS,
  FIELD_H,
  HINT_MS,
} from '../constants/config';
import { colors, overlays } from '../constants/theme';
import AppBackground from '../components/AppBackground';
import BannerToast from '../components/BannerToast';
import FloatingControls from '../components/FloatingControls';
import LaneBoard from '../components/LaneBoard';
import PausePanel from '../components/PausePanel';
import ScreenHeader from '../components/ScreenHeader';
import VerdictFlash from '../components/VerdictFlash';
import type { BannerTone } from '../components/BannerToast';
import { judgeTap } from '../game/beatClock';
import type { Verdict } from '../game/beatClock';
import { generateRoute } from '../game/routeGenerator';
import { buildResult, totalFeathers } from '../game/runEngine';
import type { RunEvent, RunResult, SessionConfig } from '../game/runEngine';
import type { Profile } from '../game/storage';
import useBeatClock from '../hooks/useBeatClock';
import useRunEngine from '../hooks/useRunEngine';
import { groupNumber, padLane } from '../utils/format';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

type Props = {
  session: SessionConfig;
  profile: Profile;
  onGameOver: (result: RunResult) => void;
  onMenu: () => void;
};

/**
 * G2 floating controls. Standing still is always safe - nothing on this screen
 * can end a run the player did not tap for - but two mistimed taps with no
 * shield end it inside a couple of seconds.
 */
export function GameScreen({ session, profile, onGameOver, onMenu }: Props) {
  const settings = profile.settings;

  /* the attempt number is frozen for the whole run - a profile write that
     lands while the result is being handed over must not rebuild the route */
  const attempt = useRef(profile.totalRuns);

  const route = useMemo(
    () =>
      generateRoute({
        name: session.routeName,
        laneCount: session.laneCount,
        bpm: session.bpm,
        routeIndex: session.routeIndex,
        attempt: attempt.current,
        seedOverride: session.seed,
        chickRush: session.chickRush === true,
        doubleBeatChance: session.doubleBeatChance,
      }),
    [session],
  );

  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [verdictNonce, setVerdictNonce] = useState(0);
  const [banner, setBanner] = useState('');
  const [bannerTone, setBannerTone] = useState<BannerTone>('tempo');
  const [bannerNonce, setBannerNonce] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [tempoShift, setTempoShift] = useState(false);

  const pausedRef = useRef(false);
  const usedShield = useRef(false);
  const shake = useRef(new Animated.Value(0)).current;

  const onEvents = useCallback((events: RunEvent[]) => {
    events.forEach(e => {
      if (e.type === 'tempo') {
        setBanner('TEMPO UP - ' + (e.value ?? 0) + ' BPM');
        setBannerTone('tempo');
        setBannerNonce(n => n + 1);
        setTempoShift(true);
        setTimeout(() => setTempoShift(false), 900);
      } else if (e.type === 'checkpoint') {
        setBanner('CHECKPOINT - ' + groupNumber(e.value ?? 0) + ' BANKED');
        setBannerTone('checkpoint');
        setBannerNonce(n => n + 1);
      } else if (e.type === 'chick') {
        setBanner('CHICK ON BOARD - ' + (e.value ?? 0) + ' CARRIED');
        setBannerTone('unlock');
        setBannerNonce(n => n + 1);
      } else if (e.type === 'shield') {
        usedShield.current = true;
      }
    });
  }, []);

  const engine = useRunEngine(session, route, onEvents);
  const { state, stateRef, tap } = engine;

  const running = !paused && (state.status === 'idle' || state.status === 'playing');
  const { phase, elapsed, hold, resume } = useBeatClock(state.bpm, running);

  /* the controls hint stays up for the first seconds and whenever the combo is lost */
  useEffect(() => {
    setShowHint(true);
    const t = setTimeout(() => setShowHint(false), HINT_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
    if (paused) {
      hold();
    } else {
      resume();
    }
  }, [hold, paused, resume]);

  /* the round is over: shake if it ended badly, then hand the result over */
  useEffect(() => {
    if (state.status !== 'crashed' && state.status !== 'delivered') {
      return;
    }
    if (state.status === 'crashed' && !settings.reduceMotion) {
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 65, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 65, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1, duration: 65, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 65, useNativeDriver: true }),
      ]).start();
    }
    const t = setTimeout(() => {
      onGameOver(buildResult(stateRef.current, session, usedShield.current));
    }, END_DELAY_MS);
    return () => clearTimeout(t);
  }, [onGameOver, session, settings.reduceMotion, shake, state.status, stateRef]);

  const handleTap = useCallback(() => {
    if (pausedRef.current) {
      return;
    }
    const current = stateRef.current;
    if (current.status === 'crashed' || current.status === 'delivered') {
      return;
    }
    const judged = judgeTap(
      elapsed(),
      current.bpm,
      current.carried,
      settings.timingOffset,
    );
    setVerdict(judged.verdict);
    setVerdictNonce(n => n + 1);
    tap(judged.verdict);
  }, [elapsed, settings.timingOffset, stateRef, tap]);

  const tone: 'cyan' | 'green' | 'red' =
    verdict === 'miss' ? 'red' : state.armed || verdict === 'perfect' ? 'green' : 'cyan';

  const progress = Math.round(
    (Math.min(state.laneIndex, session.laneCount) / Math.max(1, session.laneCount)) * 100,
  );
  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] });
  const hintVisible = showHint || state.combo === 0;

  return (
    <AppBackground overlay={overlays.game} reduceMotion={settings.reduceMotion}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.shell, { transform: [{ translateX: shakeX }] }]}>
        <ScreenHeader
          tone="plate"
          leftSlot={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="PAUSE"
              hitSlop={HIT}
              onPress={() => setPaused(true)}
              style={styles.pauseBtn}>
              <ImageBackground
                source={assets.buttonRound}
                resizeMode="contain"
                style={styles.pausePlate}>
                <Image
                  source={assets.iconPause}
                  style={styles.pauseIcon}
                  resizeMode="contain"
                />
              </ImageBackground>
            </Pressable>
          }
          centerSlot={
            <View style={styles.counter}>
              <Text style={styles.counterText} numberOfLines={1}>
                {'LANE ' + padLane(state.laneIndex) + ' / ' + session.laneCount}
              </Text>
              <View style={styles.counterTrack}>
                <View
                  style={[
                    styles.counterFill,
                    { width: (progress + '%') as DimensionValue },
                  ]}
                />
              </View>
              <Text style={styles.counterMode} numberOfLines={1}>
                {session.label}
              </Text>
            </View>
          }
          rightSlot={
            <View style={styles.feathers}>
              <Text style={styles.feathersValue} numberOfLines={1}>
                {groupNumber(totalFeathers(state))}
              </Text>
              <Text style={styles.feathersLabel} numberOfLines={1}>
                {'BANKED ' + groupNumber(state.banked)}
              </Text>
            </View>
          }
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="TAP TO CROSS"
          onPress={handleTap}
          style={styles.field}>
          <LaneBoard
            route={route}
            laneIndex={state.laneIndex}
            carried={state.carried}
            bpm={state.bpm}
            phase={phase}
            tone={tone}
            beatGuide={settings.beatGuide}
            highContrast={settings.highContrast}
            reduceMotion={settings.reduceMotion}
            crashed={state.status === 'crashed'}
          />

          <View style={styles.flashSlot} pointerEvents="none">
            <VerdictFlash
              verdict={verdict}
              nonce={verdictNonce}
              highContrast={settings.highContrast}
            />
          </View>

          <View style={styles.bannerSlot} pointerEvents="none">
            <BannerToast text={banner} tone={bannerTone} nonce={bannerNonce} />
          </View>

          {hintVisible ? (
            <View style={styles.hintPill} pointerEvents="none">
              <Text style={styles.hintText} numberOfLines={1}>
                TAP GO ON THE BEAT TO CROSS A LANE
              </Text>
            </View>
          ) : null}
        </Pressable>

        <FloatingControls
          phase={phase}
          bpm={state.bpm}
          combo={state.combo}
          shields={state.shields}
          carried={state.carried}
          tempoShift={tempoShift}
          armed={state.armed}
          disabled={state.status === 'crashed' || state.status === 'delivered'}
          onStep={handleTap}
        />
      </Animated.View>

      {paused ? (
        <PausePanel
          lane={state.laneIndex}
          laneCount={session.laneCount}
          feathers={totalFeathers(state)}
          onResume={() => setPaused(false)}
          onMenu={onMenu}
        />
      ) : null}
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  pauseBtn: { width: 48, height: 48 },
  pausePlate: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseIcon: { width: 24, height: 24 },
  counter: { alignItems: 'center', gap: 4 },
  counterText: {
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  counterTrack: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  counterFill: { height: 4, backgroundColor: colors.secondary },
  counterMode: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: colors.textMuted,
  },
  feathers: { alignItems: 'flex-end' },
  feathersValue: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '800',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  feathersLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.textMuted,
  },
  field: {
    width: '100%',
    height: FIELD_H,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
  },
  flashSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: Math.max(10, ANCHOR_Y - 96),
    alignItems: 'center',
  },
  bannerSlot: { position: 'absolute', right: 10, top: 16, left: 60 },
  hintPill: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  hintText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: colors.textSecondary,
  },
});

export default GameScreen;
