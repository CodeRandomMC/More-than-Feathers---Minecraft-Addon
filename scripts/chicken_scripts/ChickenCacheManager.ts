import { world, system, Entity } from "@minecraft/server";
import { ResourceChickens } from "./ResourceChickens";
import { Logger } from "../utils/CRSLogger";

// Configuration constants
const CONFIG = {
  CHICKEN_TYPE_ID: "crs_mf:resource_chicken",
  SPAWN_TICK_RANGE: {
    MIN: 300,
    MAX: 600,
  },
  INITIAL_TICKS_UNTIL_LAY: -1,
} as const;

// Interfaces for type safety
interface ChickenCacheEntry {
  entity: Entity;
}

/**
 * Generates a random spawn tick within the configured range.
 * @param min - Minimum ticks before next spawn
 * @param max - Maximum ticks before next spawn
 * @returns The calculated next spawn tick
 * @throws Error if the range is invalid
 */
function getNextRandomSpawnTick(min: number, max: number): number {
  if (min < 0 || max < min) {
    throw new Error(`Invalid spawn tick range: min=${min}, max=${max}`);
  }
  return system.currentTick + Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Manages the cache of resource chickens, handling entity events to maintain
 * ResourceChickens.chickenCache and initializing dynamic properties.
 */
export class ChickenCacheManager {
  private readonly chickenTypeId: string = CONFIG.CHICKEN_TYPE_ID;
  private readonly spawnTickRange = CONFIG.SPAWN_TICK_RANGE;

  constructor() {
    this.setupCacheEvents();
  }

  /**
   * Initializes event listeners for entity lifecycle events to manage the cache.
   * @private
   */
  private setupCacheEvents(): void {
    // Handle entity load and spawn with a unified handler
    const handleEntityAdd = (entity: Entity): void => {
      if (entity.typeId !== this.chickenTypeId || entity.hasComponent("minecraft:is_baby")) {
        return;
      }

      // Initialize ticksUntilNextLay if not set (fresh spawn)
      const currentTicksUntilNextLay = entity.getDynamicProperty("ticksUntilNextLay") as number | undefined;
      if (currentTicksUntilNextLay === undefined) {
        entity.setDynamicProperty("ticksUntilNextLay", CONFIG.INITIAL_TICKS_UNTIL_LAY);
        Logger.debug(`Initialized ticksUntilNextLay to ${CONFIG.INITIAL_TICKS_UNTIL_LAY} for chicken ${entity.id}`);
      }

      ResourceChickens.chickenCache.set(entity.id, { entity });
      Logger.debug(`Added chicken ${entity.id} to cache`);
    };

    world.afterEvents.entityLoad.subscribe(({ entity }) => handleEntityAdd(entity));
    world.afterEvents.entitySpawn.subscribe(({ entity }) => handleEntityAdd(entity));

    world.beforeEvents.entityRemove.subscribe(({ removedEntity: entity }) => {
      if (entity.typeId !== this.chickenTypeId) return;

      ResourceChickens.chickenCache.delete(entity.id);
      Logger.debug(`Removed chicken ${entity.id} from cache`);
    });
  }
}