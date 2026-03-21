// Mulberry32 — fast, seedable, good quality
export function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seedFromString(s: string): number {
  let h = 0xdeadbeef
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 2654435761)
  return (h ^ (h >>> 16)) >>> 0
}

// Helper: pick random element from array
export function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

// Helper: random int in [min, max]
export function randInt(min: number, max: number, rng: () => number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

// Helper: random float in [min, max] rounded to decimals
export function randFloat(min: number, max: number, rng: () => number, decimals = 2): number {
  return parseFloat((min + rng() * (max - min)).toFixed(decimals))
}

// Helper: gaussian via Box-Muller (clamp to [0,1] after)
export function randGaussian(mean: number, std: number, rng: () => number): number {
  const u1 = rng()
  const u2 = rng()
  const z = Math.sqrt(-2 * Math.log(u1 + 0.0001)) * Math.cos(2 * Math.PI * u2)
  return Math.max(0, Math.min(1, mean + z * std))
}
