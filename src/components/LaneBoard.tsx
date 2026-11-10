import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { CHICK, COURIER, VAN } from '../assets';
import {
  ANCHOR_Y,
  BOARD_FRAME,
  BOARD_INNER_W,
  BOARD_H,
  BOARD_MAX_W,
  CHICK_SIZE,
  COURIER_SIZE,
  CYCLE_BEATS,
  LANES_AHEAD,
  LANES_BEHIND,
  LANE_H,
  SPRING_HOP,
  VEHICLE_H,
  VEHICLE_W,
} from '../constants/config';
import { colors } from '../constants/theme';
import { beatMs } from '../game/beatClock';
import type { Lane, Route } from '../game/routeGenerator';
import BeatRing from './BeatRing';

const DASH_EVERY = 26;
const DASH_COUNT = Math.max(2, Math.floor(BOARD_INNER_W / DASH_EVERY));

type StripProps = {
  lane: Lane;
  /** ms of one traffic cycle - recomputed on every tempo shift */
  cycleMs: number;
  highContrast: boolean;
  still: boolean;
  /** the lane the courier is about to step onto flashes its kerb */
  target: boolean;
  phase: Animated.Value;
  showChick: boolean;
};

/** one horizontal avenue lane: asphalt, dashes, traffic, kerb, maybe a chick */
const LaneStrip = memo(function LaneStrip({
  lane,
  cycleMs,
  highContrast,
  still,
  target,
  phase,
  showChick,
}: StripProps) {
  const drive = useRef(new Animated.Value(0)).current;
  const count = Math.max(1, lane.vehicles);
  const spacing = BOARD_INNER_W / count;

  useEffect(() => {
    drive.setValue(0);
    const loop = Animated.loop(
      Animated.timing(drive, {
        toValue: 1,
        duration: Math.max(1200, cycleMs),
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [cycleMs, drive]);

  const travel = drive.interpolate({
    inputRange: [0, 1],
    outputRange: lane.dir === 1 ? [-BOARD_INNER_W, 0] : [0, -BOARD_INNER_W],
  });

  const kerbGlow = phase.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.25, 0.9, 0.25],
  });

  const vans = useMemo(() => {
    const out: number[] = [];
    for (let k = 0; k < count * 2; k++) {
      out.push(Math.round(k * spacing + lane.phase * spacing * 0.6));
    }
    return out;
  }, [count, lane.phase, spacing]);

  return (
    <View
      style={[
        styles.lane,
        lane.median ? styles.median : styles.asphalt,
        target ? styles.laneTarget : null,
      ]}>
      <View style={styles.dashRow} pointerEvents="none">
        {Array.from({ length: DASH_COUNT }, (_, i) => (
          <View
            key={'d' + i}
            style={[
              styles.dash,
              highContrast ? styles.dashContrast : null,
              { left: i * DASH_EVERY },
            ]}
          />
        ))}
      </View>

      <Animated.View
        pointerEvents="none"
        style={[styles.trafficRow, { transform: [{ translateX: travel }] }]}>
        {vans.map((x, i) => (
          <Image
            key={'v' + i}
            source={VAN}
            resizeMode="contain"
            style={[
              styles.van,
              highContrast ? styles.vanContrast : null,
              { left: x },
              lane.dir === -1 ? styles.vanFlip : null,
            ]}
          />
        ))}
      </Animated.View>

      {lane.median ? <View style={styles.kerb} pointerEvents="none" /> : null}

      {target && !still ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.kerbFlash, { opacity: kerbGlow }]}
        />
      ) : null}

      {lane.doubleBeat ? (
        <View style={styles.doubleMark} pointerEvents="none">
          <View style={styles.doubleBar} />
          <View style={styles.doubleBar} />
        </View>
      ) : null}

      {showChick ? (
        <Image source={CHICK} style={styles.laneChick} resizeMode="contain" />
      ) : null}
    </View>
  );
});

type Props = {
  route: Route;
  laneIndex: number;
  carried: number;
  bpm: number;
  phase: Animated.Value;
  tone: 'cyan' | 'green' | 'red';
  beatGuide: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  crashed: boolean;
};

/**
 * The avenue board. Only a window of lanes around the courier is mounted, so
 * a 36 lane route never builds 36 animated strips. The courier is pinned to
 * the anchor line and the lanes slide under it - that is the hop.
 */
export function LaneBoard({
  route,
  laneIndex,
  carried,
  bpm,
  phase,
  tone,
  beatGuide,
  highContrast,
  reduceMotion,
  crashed,
}: Props) {
  const slide = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const cycleMs = Math.round(beatMs(bpm) * CYCLE_BEATS);

  /* the lanes fall by one row; animating that fall IS the hop */
  useEffect(() => {
    slide.setValue(-LANE_H);
    Animated.spring(slide, {
      toValue: 0,
      useNativeDriver: true,
      tension: SPRING_HOP.tension,
      friction: SPRING_HOP.friction,
    }).start();
  }, [laneIndex, slide]);

  useEffect(() => {
    if (reduceMotion) {
      bob.setValue(0);
      return;
    }
    bob.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 325,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 325,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [bob, reduceMotion]);

  const laneWindow = useMemo(() => {
    const first = Math.max(0, laneIndex - LANES_BEHIND);
    const last = Math.min(route.lanes.length - 1, laneIndex + LANES_AHEAD);
    const out: Lane[] = [];
    for (let i = first; i <= last; i++) {
      out.push(route.lanes[i]);
    }
    return out;
  }, [laneIndex, route.lanes]);

  const hover = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });
  const chicks = Math.max(0, Math.min(3, carried));

  return (
    <View style={styles.board}>
      <Animated.View
        pointerEvents="none"
        style={[styles.inner, { transform: [{ translateY: slide }] }]}>
        {laneWindow.map(lane => (
          <View
            key={'lane' + lane.index}
            style={[
              styles.lanePos,
              { top: ANCHOR_Y - (lane.index - laneIndex) * LANE_H },
            ]}>
            <LaneStrip
              lane={lane}
              cycleMs={cycleMs}
              highContrast={highContrast}
              still={reduceMotion}
              target={lane.index === laneIndex + 1}
              phase={phase}
              showChick={lane.chick && lane.index > laneIndex}
            />
          </View>
        ))}
      </Animated.View>

      <View style={styles.courierLayer} pointerEvents="none">
        <View style={[styles.ringSlot, { top: ANCHOR_Y - 10 }]}>
          <BeatRing phase={phase} tone={tone} visible={beatGuide} />
        </View>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.courierSlot,
            { top: ANCHOR_Y + 8, transform: [{ translateY: hover }] },
          ]}>
          {chicks > 0 ? (
            <View style={styles.carryStack} pointerEvents="none">
              {Array.from({ length: chicks }, (_, i) => (
                <Image
                  key={'cc' + i}
                  source={CHICK}
                  resizeMode="contain"
                  style={[styles.carryChick, { marginLeft: i === 0 ? 0 : -8 }]}
                />
              ))}
            </View>
          ) : null}
          <Image
            source={COURIER}
            resizeMode="contain"
            style={[styles.courier, crashed ? styles.courierDown : null]}
          />
        </Animated.View>
      </View>

      <View style={styles.laneTag} pointerEvents="none">
        <Text style={styles.laneTagText} numberOfLines={1}>
          {route.name}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: BOARD_MAX_W,
    height: BOARD_H,
    alignSelf: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  inner: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  lanePos: { position: 'absolute', left: BOARD_FRAME, width: BOARD_INNER_W },
  lane: {
    width: BOARD_INNER_W,
    height: LANE_H,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  asphalt: { backgroundColor: colors.asphalt },
  median: { backgroundColor: colors.median },
  laneTarget: { borderWidth: 1, borderColor: 'rgba(0,245,255,0.35)' },
  dashRow: { position: 'absolute', left: 0, right: 0, bottom: 2, height: 14 },
  dash: {
    position: 'absolute',
    width: 2,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  dashContrast: { backgroundColor: '#FFFFFF' },
  trafficRow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: BOARD_INNER_W * 2,
  },
  van: {
    position: 'absolute',
    top: (LANE_H - VEHICLE_H) / 2,
    width: VEHICLE_W,
    height: VEHICLE_H,
  },
  vanFlip: { transform: [{ scaleX: -1 }] },
  vanContrast: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 6,
  },
  kerb: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 2,
    backgroundColor: 'rgba(0,245,255,0.55)',
  },
  kerbFlash: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: colors.secondary,
  },
  doubleMark: {
    position: 'absolute',
    right: 8,
    top: 8,
    flexDirection: 'row',
    gap: 3,
  },
  doubleBar: {
    width: 4,
    height: 14,
    borderRadius: 2,
    backgroundColor: colors.secondary,
  },
  laneChick: {
    position: 'absolute',
    left: 10,
    top: (LANE_H - CHICK_SIZE) / 2,
    width: CHICK_SIZE,
    height: CHICK_SIZE,
  },
  courierLayer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  ringSlot: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  courierSlot: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  carryStack: { flexDirection: 'row', marginBottom: 2 },
  carryChick: { width: CHICK_SIZE, height: CHICK_SIZE },
  courier: { width: COURIER_SIZE, height: COURIER_SIZE },
  courierDown: { transform: [{ rotate: '12deg' }] },
  laneTag: {
    position: 'absolute',
    left: 10,
    top: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(10,10,15,0.6)',
  },
  laneTagText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: colors.textSecondary,
  },
});

export default LaneBoard;
