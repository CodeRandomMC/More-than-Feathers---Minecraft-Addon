import { system } from "@minecraft/server";

/**
 * Generates a random spawn tick within the configured range.
 * @param min - Minimum ticks before next spawn
 * @param max - Maximum ticks before next spawn
 * @returns The calculated next spawn tick
 * @throws Error if the range is invalid
 */
export function getNextRandomSpawnTick(min: number, max: number): number {
  if (min < 0 || max < min) {
    throw new Error(`Invalid spawn tick range: min=${min}, max=${max}`);
  }
  return system.currentTick + Math.floor(Math.random() * (max - min + 1)) + min;
}
