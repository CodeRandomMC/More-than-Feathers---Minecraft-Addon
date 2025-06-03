/**
 * Utility functions for working with Minecraft server ticks.
 * @module utils/TickUtils
 */
import { system } from "@minecraft/server";

/**
 * Returns the next tick for a random spawn within [min, max] ticks from now.
 * @param min Minimum number of ticks from now.
 * @param max Maximum number of ticks from now.
 * @returns The tick number for the next spawn.
 */
export function getNextRandomSpawnTick(min: number, max: number): number {
  if (min < 0 || max < min) throw new Error(`Invalid spawn tick range: min=${min}, max=${max}`);
  return system.currentTick + min + Math.floor(Math.random() * (max - min + 1));
}
