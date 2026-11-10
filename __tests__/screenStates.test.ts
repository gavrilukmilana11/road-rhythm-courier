import fs from 'fs';
import path from 'path';
import { OUTCOME_HEADLINE, createRunState } from '../src/game/runEngine';
import { makeRoute, makeSession, perfects, play } from './testRun';

const ROOT = path.join(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('loading, empty, playing and finished states', () => {
  it('shows a loading marker and a progress bar on the loader', () => {
    const loader = read('src/screens/LoaderScreen.tsx');
    expect(loader).toContain('LOADING ROUTE');
    expect(loader).toContain('barTrack');
    expect(loader).toContain('barFill');
  });

  it('gives every list that can be empty a themed message', () => {
    expect(read('src/screens/ChallengeScreen.tsx')).toContain('NO SESSIONS LOGGED');
    expect(read('src/screens/ProgressScreen.tsx')).toContain('NO DELIVERIES LOGGED YET');
    expect(read('src/screens/ProgressScreen.tsx')).toContain('NO RUNS IN THE LOG');
    expect(read('src/screens/CollectionScreen.tsx')).toContain('NO BADGES YET');
  });

  it('shows a hint instead of a zero on an empty hub tile', () => {
    const menu = read('src/screens/MenuScreen.tsx');
    expect(menu).toContain('PLAY TO UNLOCK');
    const tile = read('src/components/BentoTile.tsx');
    expect(tile).toContain('{value ? (');
    expect(tile).toContain('{!value && hint ? (');
  });

  it('marks a recovered save so the UI can say so', () => {
    const storage = read('src/game/storage.ts');
    expect(storage).toContain('recovered: true');
  });

  it('walks idle to playing to finished', () => {
    const session = makeSession({ laneCount: 6 });
    const route = makeRoute(6);
    expect(createRunState(session).status).toBe('idle');
    expect(play(perfects(2), session, route).state.status).toBe('playing');
    expect(play(perfects(6), session, route).state.status).toBe('delivered');
    expect(play(['miss'], session, route).state.status).toBe('crashed');
  });

  it('names every finish in the game own words', () => {
    expect(OUTCOME_HEADLINE.delivered).toBe('PARCEL DELIVERED');
    expect(OUTCOME_HEADLINE.crashed).toBe('OFF THE BEAT');
    expect(OUTCOME_HEADLINE['shift-over']).toBe('SHIFT OVER');
    Object.values(OUTCOME_HEADLINE).forEach(h => {
      expect(h.toLowerCase()).not.toContain('game over');
      expect(h.toLowerCase()).not.toContain('you win');
    });
  });

  it('keeps no template placeholder text in the shipped screens', () => {
    const files = fs.readdirSync(path.join(ROOT, 'src/screens'));
    files.forEach(f => {
      const src = read('src/screens/' + f).toLowerCase();
      ['lorem ipsum', 'template stub', 'hello android', 'placeholder text'].forEach(
        bad => expect(src).not.toContain(bad),
      );
    });
  });
});
