import { world, system, Entity } from "@minecraft/server";
import { ResourceChickens } from "./ResourceChickens";
import { Logger } from "../utils/CRSLogger";

/**
 * Generates a random spawn tick within the given range.
 * @param min Minimum ticks before next spawn.
 * @param max Maximum ticks before next spawn.
 * @returns The next spawn tick based on current tick.
 */
function getNextRandomSpawnTick(min: number, max: number): number {
  if (min < 0 || max < min) {
    throw new Error("Invalid range for random spawn tick");
  }
  return system.currentTick + Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * ChickenCacheManager manages the chicken cache, handling entity events
 * to populate and update ResourceChickens.chickenCache.
 */
export class ChickenCacheManager {
  constructor() {
    this.setupCacheEvents();
  }

  /**
   * Sets up event listeners for entity load and removal to manage the cache.
   */
  private setupCacheEvents() {
    world.afterEvents.entityLoad.subscribe((event) => {
      const entity = event.entity;
      if (entity.typeId !== "crs_mf:resource_chicken") return;
      if (entity.hasComponent("minecraft:is_baby")) return;

      const nextSpawnTick = getNextRandomSpawnTick(300, 600);
      ResourceChickens.chickenCache.set(entity.id, { entity, nextSpawnTick });
      Logger.debug(`Added chicken ${entity.id} to cache with nextSpawnTick ${nextSpawnTick}`);
    });

    world.beforeEvents.entityRemove.subscribe((event) => {
      const entity = event.removedEntity;
      if (entity.typeId !== "crs_mf:resource_chicken") return;

      ResourceChickens.chickenCache.delete(entity.id);
      Logger.debug(`Removed chicken ${entity.id} from cache`);
    });
  }
}
