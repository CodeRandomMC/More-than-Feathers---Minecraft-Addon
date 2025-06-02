import { world, system, Entity } from "@minecraft/server";
import { ResourceChickens } from "./ResourceChickens";
import { Logger } from "../utils/CRSLogger";

// Configuration constants
const CONFIG = {
  CHICKEN_TYPE_ID: "crs_mf:resource_chicken",
  INITIAL_TICKS_UNTIL_LAY: -1,
} as const;

/**
 * Manages the cache of resource chickens, handling entity events to maintain
 * ResourceChickens.chickenCache and initializing dynamic properties.
 */
export class ChickenCacheManager {
  private readonly chickenTypeId: string = CONFIG.CHICKEN_TYPE_ID;

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
      if (entity.typeId !== this.chickenTypeId) {
        return;
      }

      // Initialize nextLayAttempt if not set (fresh spawn)
      const currentNextLayAttempt = entity.getDynamicProperty("nextLayAttempt") as number | undefined;
      if (currentNextLayAttempt === undefined) {
        entity.setDynamicProperty("nextLayAttempt", CONFIG.INITIAL_TICKS_UNTIL_LAY);
        Logger.debug(`Initialized nextLayAttempt to ${CONFIG.INITIAL_TICKS_UNTIL_LAY} for chicken ${entity.id}`);
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
