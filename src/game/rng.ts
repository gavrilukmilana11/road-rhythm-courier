/**
 * One seed per attempt, deterministic and reproducible. Gameplay never calls
 * Math.random - a bug can always be replayed from its seed.
 */
export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** seed = routeIndex * 7919 ^ attempt * 104729 */
export function makeSeed(routeIndex: number, attempt: number): number {
  const a = (Math.max(0, routeIndex) * 7919) >>> 0;
  const b = (Math.max(0, attempt) * 104729) >>> 0;
  return (a ^ b) >>> 0 || 1;
}

export function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length) % list.length];
}

export function rangeInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}
