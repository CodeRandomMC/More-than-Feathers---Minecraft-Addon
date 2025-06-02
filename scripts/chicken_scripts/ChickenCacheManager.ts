import { world, Entity } from "@minecraft/server";
import { ResourceChickens } from "./ResourceChickens";
import { Logger } from "../utils/CRSLogger";

const CONFIG = {
  CHICKEN_TYPE_ID: "crs_mf:resource_chicken",
  INITIAL_TICKS_UNTIL_LAY: -1,
} as const;

export class ChickenCacheManager {
  private readonly chickenTypeId = CONFIG.CHICKEN_TYPE_ID;

  constructor() {
    this.setupCacheEvents();
  }

  private setupCacheEvents(): void {
    const handleEntityAdd = (entity: Entity) => {
      if (entity.typeId !== this.chickenTypeId) return;

      const currentNextLayAttempt = entity.getDynamicProperty("nextLayAttempt");
      if (typeof currentNextLayAttempt !== "number") {
        entity.setDynamicProperty("nextLayAttempt", CONFIG.INITIAL_TICKS_UNTIL_LAY);
        Logger.debug(`Initialized nextLayAttempt to ${CONFIG.INITIAL_TICKS_UNTIL_LAY} for chicken ${entity.id}`);
      }

      if (!ResourceChickens.chickenCache.has(entity.id)) {
        ResourceChickens.chickenCache.set(entity.id, { entity });
        Logger.debug(`Added chicken ${entity.id} to cache`);
      }
    };

    [world.afterEvents.entityLoad, world.afterEvents.entitySpawn].forEach((event) =>
      event.subscribe(({ entity }) => handleEntityAdd(entity))
    );

    world.beforeEvents.entityRemove.subscribe(({ removedEntity: entity }) => {
      if (entity.typeId !== this.chickenTypeId) return;
      ResourceChickens.chickenCache.delete(entity.id);
      Logger.debug(`Removed chicken ${entity.id} from cache`);
    });
  }
}
