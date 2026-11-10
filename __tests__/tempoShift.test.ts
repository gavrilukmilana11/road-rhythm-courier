import { TEMPO_MAX_DELTA, TEMPO_SHIFT_EVERY, TEMPO_STEP_BPM } from '../src/constants/config';
import { makeRoute, makeSession, perfects, play } from './testRun';

describe('changing traffic beats', () => {
  const route = makeRoute(40);
  const session = makeSession({ laneCount: 40 });

  it('raises the tempo every sixth lane', () => {
    const run = play(perfects(TEMPO_SHIFT_EVERY), session, route);
    expect(run.state.laneIndex).toBe(TEMPO_SHIFT_EVERY);
    expect(run.state.bpm).toBe(session.bpm + TEMPO_STEP_BPM);
    expect(run.events.filter(e => e.type === 'tempo')).toHaveLength(1);
  });

  it('names the new tempo in the event so the banner can show it', () => {
    const run = play(perfects(TEMPO_SHIFT_EVERY), session, route);
    const tempo = run.events.find(e => e.type === 'tempo');
    expect(tempo && tempo.value).toBe(session.bpm + TEMPO_STEP_BPM);
  });

  it('caps the climb at +36 BPM over the route base', () => {
    const run = play(perfects(30), session, route);
    expect(run.state.bpm).toBe(session.bpm + TEMPO_MAX_DELTA);
    /* once capped, no further tempo events are emitted */
    const shifts = run.events.filter(e => e.type === 'tempo');
    expect(shifts).toHaveLength(TEMPO_MAX_DELTA / TEMPO_STEP_BPM);
  });

  it('keeps the base tempo of the run for the cap calculation', () => {
    const run = play(perfects(30), session, route);
    expect(run.state.baseBpm).toBe(session.bpm);
  });
});
