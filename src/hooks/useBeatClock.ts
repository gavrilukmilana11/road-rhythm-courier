import { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { beatMs } from '../game/beatClock';

/**
 * One monotonic beat clock per run. `elapsed()` is what the judge reads, and
 * `phase` is the same beat expressed as an Animated 0..1 ramp for the beat
 * bar and the beat ring. Both share one epoch, so what the player sees and
 * what the game judges never drift apart.
 *
 * The clock is restarted whenever the tempo changes, which is also the moment
 * the tempo banner appears - the visible beat and the judged beat stay locked.
 */
export function useBeatClock(bpm: number, running: boolean) {
  const epoch = useRef(Date.now());
  const pausedAt = useRef(0);
  const phase = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    phase.stopAnimation();
    phase.setValue(0);
    if (!running) {
      return;
    }
    epoch.current = Date.now();
    const loop = Animated.loop(
      Animated.timing(phase, {
        toValue: 1,
        duration: beatMs(bpm),
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [bpm, running, phase]);

  /** ms since the clock epoch - the only input the judge needs */
  const elapsed = useCallback(() => Date.now() - epoch.current, []);

  /** freeze the clock without losing the beat grid (pause panel) */
  const hold = useCallback(() => {
    pausedAt.current = Date.now();
  }, []);

  const resume = useCallback(() => {
    if (pausedAt.current > 0) {
      epoch.current += Date.now() - pausedAt.current;
      pausedAt.current = 0;
    }
  }, []);

  return { phase, elapsed, hold, resume };
}

export default useBeatClock;
