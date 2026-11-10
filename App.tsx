/**
 * RoadRhythmCourier - an offline, one-tap rhythm crossing arcade.
 * App.tsx is the whole navigation layer: one Screen union, one conditional
 * render, no navigation library anywhere in the project.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, StatusBar, StyleSheet, View } from 'react-native';
import { RUN_LOG_LIMIT, SCREEN_FADE_MS } from './src/constants/config';
import { colors } from './src/constants/theme';
import ChallengeScreen from './src/screens/ChallengeScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import DailyScreen from './src/screens/DailyScreen';
import GameScreen from './src/screens/GameScreen';
import LoaderScreen from './src/screens/LoaderScreen';
import MenuScreen from './src/screens/MenuScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ResultScreen from './src/screens/ResultScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import type { MenuTarget } from './src/screens/MenuScreen';
import { dayKey, nextStreak } from './src/game/dailyMode';
import { earnedBy, newlyUnlocked } from './src/game/progression';
import type { ChallengeId } from './src/game/progression';
import {
  challengeSession,
  dailySession,
  routeSession,
} from './src/game/sessions';
import type { RunResult, SessionConfig } from './src/game/runEngine';
import useProfile from './src/hooks/useProfile';
import useSettings from './src/hooks/useSettings';

type Screen =
  | 'loader'
  | 'menu'
  | 'game'
  | 'result'
  | 'challenge'
  | 'progress'
  | 'collection'
  | 'daily'
  | 'settings';

const EMPTY_RESULT: RunResult = {
  outcome: 'crashed',
  label: 'ROUTE RUN',
  mode: 'route',
  routeIndex: 0,
  routeName: 'NEON HARBOUR',
  lanesCleared: 0,
  laneCount: 18,
  feathers: 0,
  bestCombo: 0,
  perfectPct: 0,
  chicks: 0,
  taps: 0,
  usedShield: false,
  scored: true,
};

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('loader');
  const [session, setSession] = useState<SessionConfig | null>(null);
  const [result, setResult] = useState<RunResult>(EMPTY_RESULT);
  const [unlockedRoute, setUnlockedRoute] = useState<string | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const { profile, update, reset } = useProfile();
  const { setOption } = useSettings(profile, update);
  const fade = useRef(new Animated.Value(1)).current;

  /* every screen change cross-fades and lifts in; never an instant swap */
  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: SCREEN_FADE_MS,
      useNativeDriver: true,
    }).start();
  }, [fade, screen]);

  /* system Back walks one step up; Back on Menu closes the app */
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'menu' || screen === 'loader') {
        return false;
      }
      setScreen('menu');
      return true;
    });
    return () => sub.remove();
  }, [screen]);

  const startRoute = useCallback(() => {
    setSession(routeSession(profile.activeRoute, profile.settings));
    setScreen('game');
  }, [profile.activeRoute, profile.settings]);

  const startChallenge = useCallback(
    (id: ChallengeId) => {
      setSession(challengeSession(id, profile.activeRoute, profile.settings));
      setScreen('game');
    },
    [profile.activeRoute, profile.settings],
  );

  const startDaily = useCallback(
    (scored: boolean) => {
      setSession(dailySession(new Date(), profile.settings, scored));
      setScreen('game');
    },
    [profile.settings],
  );

  const handleGameOver = useCallback(
    (run: RunResult) => {
      const delivered = run.outcome === 'delivered' && run.scored;
      const deliveriesAfter = profile.deliveries + (delivered ? 1 : 0);
      const opened = delivered ? newlyUnlocked(profile.deliveries, deliveriesAfter) : null;
      const won = run.scored ? earnedBy(run, profile, deliveriesAfter) : [];

      setResult(run);
      setUnlockedRoute(opened ? opened.name : null);
      setNewBadges(won);

      if (run.scored) {
        const today = new Date();
        const isDaily = run.mode === 'daily';
        update({
          deliveries: deliveriesAfter,
          totalRuns: profile.totalRuns + 1,
          lifetimeFeathers: profile.lifetimeFeathers + run.feathers,
          bestCombo: Math.max(profile.bestCombo, run.bestCombo),
          bestPerfectPct: Math.max(profile.bestPerfectPct, run.perfectPct),
          badges: profile.badges.concat(won),
          runs: [
            {
              routeName: run.routeName,
              lanesCleared: run.lanesCleared,
              laneCount: run.laneCount,
              feathers: run.feathers,
              perfectPct: run.perfectPct,
            },
          ]
            .concat(profile.runs)
            .slice(0, RUN_LOG_LIMIT),
          bests: {
            sprint:
              run.mode === 'sprint'
                ? Math.max(profile.bests.sprint, run.feathers)
                : profile.bests.sprint,
            endurance:
              run.mode === 'endurance'
                ? Math.max(profile.bests.endurance, run.lanesCleared)
                : profile.bests.endurance,
            precision:
              run.mode === 'precision'
                ? Math.max(profile.bests.precision, run.lanesCleared)
                : profile.bests.precision,
          },
          streak: isDaily ? nextStreak(profile, today) : profile.streak,
          lastDailyKey: isDaily ? dayKey(today) : profile.lastDailyKey,
        });
      }

      setScreen('result');
    },
    [profile, update],
  );

  const runAgain = useCallback(() => {
    if (session) {
      setScreen('game');
    } else {
      startRoute();
    }
  }, [session, startRoute]);

  const openFromMenu = useCallback((target: MenuTarget) => {
    setScreen(target);
  }, []);

  const selectRoute = useCallback(
    (index: number) => {
      update({ activeRoute: index });
    },
    [update],
  );

  const goMenu = useCallback(() => setScreen('menu'), []);

  let content: React.ReactNode = null;
  if (screen === 'loader') {
    content = <LoaderScreen onDone={goMenu} />;
  } else if (screen === 'menu') {
    content = (
      <MenuScreen profile={profile} onPlay={startRoute} onOpen={openFromMenu} />
    );
  } else if (screen === 'game' && session) {
    content = (
      <GameScreen
        session={session}
        profile={profile}
        onGameOver={handleGameOver}
        onMenu={goMenu}
      />
    );
  } else if (screen === 'result') {
    content = (
      <ResultScreen
        result={result}
        unlockedRoute={unlockedRoute}
        earnedBadges={newBadges}
        reduceMotion={profile.settings.reduceMotion}
        onRunAgain={runAgain}
        onMenu={goMenu}
        onCollection={() => setScreen('collection')}
      />
    );
  } else if (screen === 'challenge') {
    content = (
      <ChallengeScreen
        profile={profile}
        onStartMode={startChallenge}
        onMenu={goMenu}
      />
    );
  } else if (screen === 'progress') {
    content = (
      <ProgressScreen
        profile={profile}
        onSelectRoute={selectRoute}
        onMenu={goMenu}
      />
    );
  } else if (screen === 'collection') {
    content = <CollectionScreen profile={profile} onMenu={goMenu} />;
  } else if (screen === 'daily') {
    content = (
      <DailyScreen profile={profile} onStartDaily={startDaily} onMenu={goMenu} />
    );
  } else if (screen === 'settings') {
    content = (
      <SettingsScreen
        profile={profile}
        onChange={setOption}
        onReset={reset}
        onMenu={goMenu}
      />
    );
  } else {
    content = (
      <MenuScreen profile={profile} onPlay={startRoute} onOpen={openFromMenu} />
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Animated.View pointerEvents="box-none" style={[styles.fill, { opacity: fade }]}>
        {content}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
});

export default App;
