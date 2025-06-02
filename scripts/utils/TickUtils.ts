import { system } from "@minecraft/server";

/**
 * Returns the next tick for a random spawn within [min, max] ticks from now.
 */
export function getNextRandomSpawnTick(min: number, max: number): number {
  if (min < 0 || max < min) throw new Error(`Invalid spawn tick range: min=${min}, max=${max}`);
  return system.currentTick + min + Math.floor(Math.random() * (max - min + 1));
}
