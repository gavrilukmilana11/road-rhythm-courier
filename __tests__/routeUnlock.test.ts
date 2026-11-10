import {
  ROUTES,
  isRouteUnlocked,
  newlyUnlocked,
  routeAt,
  unlockedCount,
} from '../src/game/progression';

describe('deliveries unlock city routes', () => {
  it('ships five routes with a rising lane count and tempo', () => {
    expect(ROUTES).toHaveLength(5);
    for (let i = 1; i < ROUTES.length; i++) {
      expect(ROUTES[i].lanes).toBeGreaterThan(ROUTES[i - 1].lanes);
      expect(ROUTES[i].bpm).toBeGreaterThan(ROUTES[i - 1].bpm);
      expect(ROUTES[i].unlockAt).toBeGreaterThan(ROUTES[i - 1].unlockAt);
    }
  });

  it('opens the first route to a brand new courier', () => {
    expect(isRouteUnlocked(0, 0)).toBe(true);
    expect(unlockedCount(0)).toBe(1);
  });

  it('opens routes 2 to 5 at 3, 8, 15 and 25 deliveries', () => {
    expect(isRouteUnlocked(1, 2)).toBe(false);
    expect(isRouteUnlocked(1, 3)).toBe(true);
    expect(isRouteUnlocked(2, 8)).toBe(true);
    expect(isRouteUnlocked(3, 15)).toBe(true);
    expect(isRouteUnlocked(4, 24)).toBe(false);
    expect(isRouteUnlocked(4, 25)).toBe(true);
    expect(unlockedCount(25)).toBe(5);
  });

  it('names the route a single delivery just opened', () => {
    const opened = newlyUnlocked(2, 3);
    expect(opened && opened.name).toBe('MARKET MILE');
    expect(newlyUnlocked(3, 4)).toBeNull();
  });

  it('clamps a bad route index instead of returning undefined', () => {
    expect(routeAt(-4).name).toBe(ROUTES[0].name);
    expect(routeAt(99).name).toBe(ROUTES[4].name);
  });
});
